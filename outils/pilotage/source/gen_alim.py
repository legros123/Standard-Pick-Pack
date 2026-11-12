#!/usr/bin/env python3
"""Génère l'alimentation du tableau de bord à partir d'une seule source de vérité :
   - outils/pilotage/requetes_pilotage.sql   (les requêtes, commentées)
   - outils/pilotage/modPilotageLive.bas     (module VBA, Windows-1252, CRLF)

Usage :  python3 outils/pilotage/source/gen_alim.py [--dico dico.json]
Avec --dico (dictionnaire LOGYS exporté du catalogue : liste de [schéma, objet, type, lignes, "COL1,COL2,…"]),
chaque colonne « alias.COLONNE » des requêtes est contrôlée. Le dictionnaire n'est pas versionné."""
import json, re, sys, pathlib

ICI = pathlib.Path(__file__).resolve().parent
SORTIE = ICI.parent
DICO = None
if "--dico" in sys.argv:
    DICO = {(d[0], d[1]): set(d[4].split(",")) for d in json.load(open(sys.argv[sys.argv.index("--dico") + 1], encoding="utf-8"))}

JOUR = "l.DAT_MAJ >= TRUNC(SYSDATE) AND l.DAT_MAJ < TRUNC(SYSDATE) + 1"
PICK = "l.REEL > 0 AND l.STYP_TOUR IN ('DETA','CART')"

# nom, fonction VBA, fréquence, alias -> table, description, SQL
REQ = [
 ("OPERATEURS", "SqlOperateurs", "chaque cycle", {"l": "LIG_TOUR", "u": "USER_LOGYS"},
  """Production du jour par préparateur : lignes, chariots, colis, première et dernière validation.
Taille des chariots (petit : moins de 40 lignes, moyen : 40 à 79, grand : 80 et plus) pour le coefficient du quota,
calculé comme dans le Suivi Op. Une ligne de LIG_TOUR = un article prélevé (REEL > 0).""",
  f"""SELECT x.OPE,
       NVL(MAX(u.LIB_USER), x.OPE) AS NOM,
       SUM(x.N) AS LIGNES,
       COUNT(*) AS TOURNEES,
       SUM(x.C) AS CONTENANTS,
       TO_CHAR(MIN(x.D1), 'HH24:MI') AS PREMIERE,
       TO_CHAR(MAX(x.D2), 'HH24:MI') AS DERNIERE,
       SUM(CASE WHEN x.N < 40 THEN 1 ELSE 0 END) AS PETITS,
       SUM(CASE WHEN x.N >= 40 AND x.N < 80 THEN 1 ELSE 0 END) AS MOYENS,
       SUM(CASE WHEN x.N >= 80 THEN 1 ELSE 0 END) AS GRANDS
FROM (SELECT l.OPE_MAJ AS OPE, l.NUM_TOUR,
             COUNT(*) AS N,
             COUNT(DISTINCT l.NUM_CONT_DEPOSE) AS C,
             MIN(l.DAT_MAJ) AS D1, MAX(l.DAT_MAJ) AS D2
      FROM REXEL.LIG_TOUR l
      WHERE {JOUR}
        AND {PICK}
      GROUP BY l.OPE_MAJ, l.NUM_TOUR) x
LEFT JOIN REXEL.USER_LOGYS u ON u.COD_USER = x.OPE
GROUP BY x.OPE
ORDER BY 2"""),

 ("FAIT_PAR_TYPE", "SqlFaitParType", "chaque cycle", {"l": "LIG_TOUR"},
  "Lignes préparées aujourd'hui et colis remplis, par type (DETA = détail, CART = carton).",
  f"""SELECT l.STYP_TOUR,
       COUNT(*) AS LIGNES,
       COUNT(DISTINCT l.NUM_CONT_DEPOSE) AS CONTENANTS
FROM REXEL.LIG_TOUR l
WHERE {JOUR}
  AND {PICK}
GROUP BY l.STYP_TOUR"""),

 ("RESTANT_PAR_TYPE", "SqlRestantParType", "chaque cycle", {"t": "F_GESTOURPREP_TOUR"},
  """Reste à faire : lignes non terminées des tournées ouvertes (écran Gestion des tournées de préparation).
LIBRES = tournées pas encore prises par un préparateur (OPE_MAJ = 'AQ').
{JOURS} = nombre de jours de report pris en compte (réglage JOURS_REPORT), pour écarter les vieilles tournées jamais soldées.""",
  """SELECT t.L_STYP_TOUR,
       COUNT(*) AS TOURNEES,
       SUM(CASE WHEN t.OPE_MAJ = 'AQ' THEN 1 ELSE 0 END) AS LIBRES,
       SUM(GREATEST(NVL(t.NB_LIG_PREV, 0) - NVL(t.NB_LIG_TERM, 0) - NVL(t.NB_LIG_ANNU, 0), 0)) AS LIGNES
FROM REXEL.F_GESTOURPREP_TOUR t
WHERE t.L_TYP_TOUR = 'PREPAR'
  AND t.L_STYP_TOUR IN ('DETAIL','CARTON')
  AND t.L_ETAT_TOUR IN ('LANCEE','ENCOURS','PRELEVE')
  AND t.DAT_MAJ >= TRUNC(SYSDATE) - {JOURS}
GROUP BY t.L_STYP_TOUR"""),

 ("TOURNEES_FINIES", "SqlTourneesFinies", "chaque cycle", {"t": "F_GESTOURPREP_TOUR"},
  "Chariots (tournées) terminés aujourd'hui en détail et carton.",
  """SELECT COUNT(*) AS TOURNEES
FROM REXEL.F_GESTOURPREP_TOUR t
WHERE t.L_TYP_TOUR = 'PREPAR'
  AND t.L_STYP_TOUR IN ('DETAIL','CARTON')
  AND t.L_ETAT_TOUR = 'TERMINEE'
  AND t.DAT_MAJ >= TRUNC(SYSDATE)"""),

 ("HEURES", "SqlHeures", "chaque cycle", {"l": "LIG_TOUR"},
  "Lignes préparées et préparateurs actifs, heure par heure (13 = de 13:00 à 13:59).",
  f"""SELECT TO_NUMBER(TO_CHAR(l.DAT_MAJ, 'HH24')) AS HEURE,
       COUNT(*) AS LIGNES,
       COUNT(DISTINCT l.OPE_MAJ) AS OPERATEURS
FROM REXEL.LIG_TOUR l
WHERE {JOUR}
  AND {PICK}
GROUP BY TO_CHAR(l.DAT_MAJ, 'HH24')
ORDER BY 1"""),

 ("QUARTS", "SqlQuarts", "chaque cycle", {"l": "LIG_TOUR"},
  "Lignes préparées par quart d'heure sur les 2 h 30 écoulées : c'est le rythme récent, qui sert à estimer l'heure de fin.",
  f"""SELECT TO_CHAR(TRUNC(l.DAT_MAJ, 'HH24') + FLOOR(TO_NUMBER(TO_CHAR(l.DAT_MAJ, 'MI')) / 15) * 15 / 1440, 'HH24:MI') AS QUART,
       COUNT(*) AS LIGNES
FROM REXEL.LIG_TOUR l
WHERE l.DAT_MAJ >= SYSDATE - 150 / 1440
  AND l.DAT_MAJ >= TRUNC(SYSDATE)
  AND {PICK}
GROUP BY TO_CHAR(TRUNC(l.DAT_MAJ, 'HH24') + FLOOR(TO_NUMBER(TO_CHAR(l.DAT_MAJ, 'MI')) / 15) * 15 / 1440, 'HH24:MI')
ORDER BY 1"""),

 ("REJETS_HEURE", "SqlRejetsHeure", "chaque cycle", {"c": "CR_STOCK"},
  "Colis rejetés par la balance du convoyeur (écart de poids), heure par heure. Même filtre que la requête R4 du classeur de requêtes.",
  """SELECT TO_NUMBER(TO_CHAR(c.DAT_CREA, 'HH24')) AS HEURE,
       COUNT(DISTINCT c.NUM_CONT) AS REJETS
FROM REXEL.CR_STOCK c
WHERE c.COD_TABLE = 'CONTENANT'
  AND c.TYP_CR_STOCK = 'REJE'
  AND c.COD_MOTIF = 'PDS'
  AND c.DAT_CREA >= TRUNC(SYSDATE)
GROUP BY TO_CHAR(c.DAT_CREA, 'HH24')
ORDER BY 1"""),

 ("COLIS_PESES", "SqlColisPeses", "chaque cycle", {"c": "CONTENANT"},
  "Colis passés sur la balance aujourd'hui (poids réel renseigné) : le dénominateur du taux de rejet.",
  """SELECT COUNT(*) AS COLIS
FROM REXEL.CONTENANT c
WHERE c.DAT_CREA >= TRUNC(SYSDATE)
  AND c.PDS_CTL_REEL IS NOT NULL"""),

 ("VAGUES", "SqlVagues", "chaque cycle (réglage R_VAGUES)", {"v": "F_GESVAG_VAG"},
  "Vagues lancées aujourd'hui : lignes prévues, préparées, en rupture ; colis prévus et sortis.",
  """SELECT v.NUM_ORDRE,
       TO_CHAR(v.DAT_CREA, 'HH24:MI') AS HEURE,
       v.L_ETAT_ORDRE,
       v.LIG_CDE_NB_PREV, v.LIG_CDE_NB_PREP, v.LIG_CDE_NB_RUPT,
       v.CONT_NB_PREV, v.CONT_NB_SORTIE
FROM REXEL.F_GESVAG_VAG v
WHERE v.DAT_CREA >= TRUNC(SYSDATE)
ORDER BY v.DAT_CREA"""),

 ("DEPARTS", "SqlDeparts", "chaque cycle (réglage R_DEPARTS)", {"o": "F_GESOTE_OTE"},
  "Ordres de transport du jour : heure prévue, transporteur, destination, colis chargés et capacité.",
  """SELECT TO_CHAR(o.DAT_EXP_PREV, 'HH24:MI') AS HEURE,
       o.NOM_TRANSP, o.NOM_DEST,
       o.NB_CONT_REEL, o.NB_CONT_MAX, o.L_ETAT_OTE
FROM REXEL.F_GESOTE_OTE o
WHERE o.DAT_EXP_PREV >= TRUNC(SYSDATE)
  AND o.DAT_EXP_PREV < TRUNC(SYSDATE) + 1
ORDER BY o.DAT_EXP_PREV"""),

 ("PORTEFEUILLE", "SqlPortefeuille", "chaque cycle (réglage R_PORTEFEUILLE, NON par défaut)", {"e": "F_GESVAG_ENCO"},
  """En-cours de l'écran Gestion des vagues : lignes de détail reçues mais pas encore lancées.
À vérifier une fois sur l'écran LOGYS avant d'activer : si ce compteur inclut des commandes des jours suivants, laisser sur NON.""",
  """SELECT e.NB_DETAIL, e.NB_LIG_ENCO, e.NB_CDE
FROM REXEL.F_GESVAG_ENCO e"""),

 ("DECELEES_LOGYS", "SqlDeceleesLogys", "chaque cycle, seulement si le classeur Contrôle des rejets n'est pas branché", {"r": "F_GESREJET_REJET_CONT"},
  "Estimation des erreurs décelées : colis contrôlés au poste de rejet avec une quantité trouvée différente de la quantité prévue.",
  """SELECT COUNT(DISTINCT r.NUM_CONT) AS ERREURS
FROM REXEL.F_GESREJET_REJET_CONT r
WHERE r.DAT_CREA >= TRUNC(SYSDATE)
  AND NVL(r.REEL, 0) <> NVL(r.PREV, 0)"""),

 ("TOP_REJETS", "SqlTopRejets", "toutes les 15 minutes", {"j": "F_LST_REJET"},
  "Les 5 articles les plus rejetés (extraction TOP40 Rejet) : le plan de remesure.",
  """SELECT * FROM (
  SELECT j.ARTICLE, j.DESIGNATION, j.NB_REJET
  FROM REXEL.F_LST_REJET j
  ORDER BY j.NB_REJET DESC
) WHERE ROWNUM <= 5"""),

 ("SERVICES", "SqlServices", "toutes les 15 minutes", {"t": "F_GESTOURPREP_TOUR"},
  "Les autres préparations du site (câble, hors gabarit, vrac, longueur, volume) : lignes terminées et restantes des tournées du jour.",
  """SELECT t.L_STYP_TOUR,
       SUM(NVL(t.NB_LIG_TERM, 0)) AS FAIT,
       SUM(GREATEST(NVL(t.NB_LIG_PREV, 0) - NVL(t.NB_LIG_TERM, 0) - NVL(t.NB_LIG_ANNU, 0), 0)) AS RESTANT
FROM REXEL.F_GESTOURPREP_TOUR t
WHERE t.L_TYP_TOUR = 'PREPAR'
  AND t.L_STYP_TOUR NOT IN ('DETAIL','CARTON')
  AND t.L_ETAT_TOUR IN ('LANCEE','ENCOURS','PRELEVE','TERMINEE')
  AND t.DAT_MAJ >= TRUNC(SYSDATE)
GROUP BY t.L_STYP_TOUR
ORDER BY 2 DESC"""),

 ("REAPPRO", "SqlReappro", "toutes les 15 minutes (réglage R_STOCK)", {"s": "F_LISSTKE_EMP"},
  "Emplacements picking passés sous leur seuil d'alerte, dont ceux au niveau critique. {ZONE} = zone de picking (réglage ZONE_PICK).",
  """SELECT COUNT(*) AS SOUS_ALERTE,
       SUM(CASE WHEN s.REEL <= s.CRITIQUE THEN 1 ELSE 0 END) AS CRITIQUES
FROM REXEL.F_LISSTKE_EMP s
WHERE s.ZONE_MVT = '{ZONE}'
  AND s.NUM_ART_AFF IS NOT NULL
  AND s.REEL <= s.ALERTE"""),

 ("REAPPRO_LISTE", "SqlReapproListe", "toutes les 15 minutes (réglage R_STOCK)", {"s": "F_LISSTKE_EMP"},
  "Les 4 emplacements picking les plus urgents à réapprovisionner (stock au niveau critique).",
  """SELECT * FROM (
  SELECT s.EMP, s.NUM_ART_AFF, s.REEL
  FROM REXEL.F_LISSTKE_EMP s
  WHERE s.ZONE_MVT = '{ZONE}'
    AND s.NUM_ART_AFF IS NOT NULL
    AND s.REEL <= s.CRITIQUE
  ORDER BY s.REEL, s.EMP
) WHERE ROWNUM <= 4"""),

 ("RUPTURES", "SqlRuptures", "toutes les 15 minutes (réglage R_STOCK)", {"l": "LIG_TOUR"},
  "Lignes du jour avec une quantité en rupture au picking.",
  f"""SELECT COUNT(*) AS LIGNES
FROM REXEL.LIG_TOUR l
WHERE {JOUR}
  AND l.STYP_TOUR IN ('DETA','CART')
  AND l.RUPT > 0"""),

 ("RETARD", "SqlRetard", "toutes les 15 minutes (réglage R_RETARD)", {"o": "F_VISCDEC_CDEC"},
  "Commandes dont la date d'expédition prévue est dépassée (30 derniers jours) et dont les colis ne sont pas tous sortis.",
  """SELECT COUNT(*) AS COMMANDES,
       SUM(NVL(o.NB_PREV_LIG, 0) - NVL(o.NB_PREP_LIG, 0)) AS LIGNES
FROM REXEL.F_VISCDEC_CDEC o
WHERE o.DAT_EXP_PREV >= TRUNC(SYSDATE) - 30
  AND o.DAT_EXP_PREV < TRUNC(SYSDATE)
  AND NVL(o.NB_SORTIE_CONT, 0) < NVL(o.NB_PREV_CONT, 0) - NVL(o.NB_ANNU_CONT, 0)"""),

 ("CARNET", "SqlCarnet", "toutes les 15 minutes (réglage R_CARNET)", {"o": "F_VISCDEC_CDEC"},
  "Carnet de commandes des 7 prochains jours, par date d'expédition prévue : la charge à mettre en face des effectifs.",
  """SELECT TO_CHAR(TRUNC(o.DAT_EXP_PREV), 'YYYY-MM-DD') AS JOUR,
       COUNT(*) AS COMMANDES,
       SUM(NVL(o.NB_PREV_LIG, 0)) AS LIGNES,
       SUM(NVL(o.NB_PREV_LIG, 0) - NVL(o.NB_PREP_LIG, 0)) AS A_PREPARER
FROM REXEL.F_VISCDEC_CDEC o
WHERE o.DAT_EXP_PREV >= TRUNC(SYSDATE) + 1
  AND o.DAT_EXP_PREV < TRUNC(SYSDATE) + 8
GROUP BY TRUNC(o.DAT_EXP_PREV)
ORDER BY 1"""),

 ("REJETS_JOURS", "SqlRejetsJours", "toutes les heures", {"c": "CR_STOCK"},
  "Rejets par jour sur 60 jours, pour l'historique et la moyenne du mois (requête R5 du classeur de requêtes, bornée).",
  """SELECT TO_CHAR(TRUNC(c.DAT_CREA), 'YYYY-MM-DD') AS JOUR,
       COUNT(DISTINCT c.NUM_CONT) AS REJETS
FROM REXEL.CR_STOCK c
WHERE c.COD_TABLE = 'CONTENANT'
  AND c.TYP_CR_STOCK = 'REJE'
  AND c.COD_MOTIF = 'PDS'
  AND c.DAT_CREA >= TRUNC(SYSDATE) - 60
  AND c.DAT_CREA < TRUNC(SYSDATE)
GROUP BY TRUNC(c.DAT_CREA)
ORDER BY 1"""),
]


def controler():
    """Chaque alias.COLONNE doit exister dans le dictionnaire LOGYS."""
    ko = []
    for nom, _f, _freq, alias, _d, sql in REQ:
        assert not sql.rstrip().endswith(";"), nom
        assert re.match(r"\s*SELECT\b", sql) and not re.search(r"\b(INSERT|UPDATE|DELETE|MERGE|DROP|ALTER|CREATE|TRUNCATE|GRANT)\b", sql, re.I), nom
        for a, t in alias.items():
            assert DICO is None or ("REXEL", t) in DICO, (nom, t)
            assert re.search(r"REXEL\." + t + r"\s+" + a + r"\b", sql), (nom, t, a)
        for a, col in re.findall(r"\b([a-z])\.([A-Z][A-Z0-9_]*)\b", sql):
            if a in alias:
                if DICO is not None and col not in DICO[("REXEL", alias[a])]:
                    ko.append(f"{nom} : {alias[a]}.{col} absent du dictionnaire")
            elif a != "x":
                ko.append(f"{nom} : alias {a} inconnu")
    return ko


def fichier_sql():
    L = ["""-- ============================================================================
--  PILOTAGE PICK & PACK  ·  CLR Champigneulles (5406)
--  Requêtes LOGYS qui alimentent pilotage.html (via outils/pilotage/modPilotageLive.bas)
--
--  Lecture seule : uniquement des SELECT. Aucune écriture dans LOGYS.
--  Connexion : la source ODBC LOGYS du poste (la même que le classeur de requêtes).
--  Chaque colonne a été contrôlée contre le dictionnaire des 1 018 tables et vues
--  du catalogue « Requêtes LOGYS par service ».
--  Pas de point-virgule final : collées telles quelles dans une connexion ODBC Excel,
--  elles donnent le même résultat que le module VBA.
--  {JOURS} et {ZONE} sont remplacés par les réglages JOURS_REPORT et ZONE_PICK.
-- ============================================================================
"""]
    for nom, f, freq, alias, d, sql in REQ:
        L.append("-- " + "-" * 76)
        L.append(f"--  {nom}   ({freq})")
        for l in d.split("\n"):
            L.append("--  " + l)
        L.append("--  Tables : " + ", ".join("REXEL." + t for t in sorted(set(alias.values()))))
        L.append("-- " + "-" * 76)
        L.append(sql)
        L.append("")
    return "\n".join(L)


def fonctions_vba():
    out = []
    for nom, f, _freq, _alias, _d, sql in REQ:
        out.append(f"Private Function {f}() As String")
        out.append("    Dim s As String")
        for l in sql.split("\n"):
            assert '"' not in l and len(l) < 190, (nom, l)
            out.append(f'    s = s & "{l}" & vbLf')
        if "{JOURS}" in sql:
            out.append('    s = Replace(s, "{JOURS}", CStr(Entier(Cfg("JOURS_REPORT", "3"), 3)))')
        if "{ZONE}" in sql:
            out.append('    s = Replace(s, "{ZONE}", Propre(Cfg("ZONE_PICK", "PICK01A14")))')
        out.append(f"    {f} = s")
        out.append("End Function")
        out.append("")
    return "\n".join(out)


def main():
    ko = controler()
    if ko:
        print("\n".join(ko)); sys.exit(1)
    SORTIE.mkdir(parents=True, exist_ok=True)
    (SORTIE / "requetes_pilotage.sql").write_text(fichier_sql(), encoding="utf-8")
    gabarit = (ICI / "modPilotageLive.gabarit.bas").read_text(encoding="utf-8")
    assert "'@@SQL@@" in gabarit
    vba = gabarit.replace("'@@SQL@@", fonctions_vba())
    vba.encode("cp1252")                       # tout doit être représentable en Windows-1252
    with open(SORTIE / "modPilotageLive.bas", "w", encoding="cp1252", newline="\r\n") as fh:
        fh.write(vba)
    print(f"{len(REQ)} requêtes {'contrôlées contre le dictionnaire' if DICO else 'générées (sans contrôle du dictionnaire)'} · requetes_pilotage.sql et modPilotageLive.bas écrits ({len(vba.splitlines())} lignes VBA)")


if __name__ == "__main__":
    main()
