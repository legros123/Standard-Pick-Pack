#!/usr/bin/env python3
"""
Construit le classeur PP_LIVE.xlsx qui alimente l'écran Flip (live/pp_live.html).

    python3 outils/pp_live_classeur.py PP_LIVE.xlsx            # classeur vierge, à livrer
    python3 outils/pp_live_classeur.py test.xlsx --exemple     # rempli de données fictives (contrôle)

Principe : data.js est entièrement écrit par des FORMULES (onglet EXPORT, une ligne de
JavaScript par cellule). La macro PPLive.bas ne fait que lire LOGYS, le suivi op et le
fichier des décelées, puis recopie l'onglet EXPORT dans data.js chaque minute.
Les nombres décimaux sont écrits « 740/100 » : aucune virgule française dans le fichier.
"""
import datetime as dt
import random
import sys

import xlsxwriter

# ───────────────────────── dimensions ─────────────────────────
EQ_L1, EQ_N = 12, 45            # lignes d'équipe : 12 → 56
TOURS_N = 800                   # tournées lues au maximum
DEC_N = 80                      # matricules décelés au maximum
HIST_N = 30                     # jours d'historique
DECM_N = 31                     # jours du mois
CAD_N = 400                     # opérateurs du registre
JR_N = 1000                     # jours de journal
LOG_N = 15                      # messages gardés

J = "'AUJOURD''HUI'"            # nom d'onglet cité dans les formules
MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août",
        "Septembre", "Octobre", "Novembre", "Décembre"]

# ───────────────────────── requêtes LOGYS (lecture seule) ─────────────────────────
SQL_TOURS = """SELECT t.NUM_TOUR,
       t.L_ETAT_TOUR,
       t.ETAT_TOUR,
       t.L_STYP_TOUR,
       t.ZONE_MVT_PRISE,
       t.NUM_ORDRE_PREP,
       t.NB_LIG_PREV,
       t.NB_LIG_TERM,
       t.NB_LIG_ANNU,
       t.NB_CONT_PREV,
       t.NB_CONT_TERM,
       t.DAT_MAJ,
       t.OPE_MAJ
FROM   <<TABLE_TOURNEES>> t
WHERE  t.L_STYP_TOUR IN ('DETAIL', 'CARTON', 'MONO LIGNE')
AND  ( t.L_ETAT_TOUR IN ('LANCEE', 'ENCOURS')
    OR ( t.L_ETAT_TOUR IN ('PRELEVE', 'TERMINEE')
         AND t.DAT_MAJ >= TRUNC(SYSDATE) + 12/24 ) )"""

SQL_REJETS = """SELECT COUNT(*) AS NB_REJETS
FROM   <<TABLE_REJETS>> r
WHERE  r.<<COLONNE_DATE>> >= TRUNC(SYSDATE)
AND    r.<<COLONNE_DATE>> <  TRUNC(SYSDATE) + 1"""

SQL_RECHERCHE = """SELECT c.OWNER       AS SCHEMA_LOGYS,
       c.TABLE_NAME  AS TABLE_OU_VUE,
       COUNT(*)      AS COLONNES_TROUVEES
FROM   ALL_TAB_COLUMNS c
WHERE  c.COLUMN_NAME IN ('NUM_TOUR', 'L_ETAT_TOUR', 'L_STYP_TOUR', 'NB_LIG_PREV',
                         'NB_LIG_TERM', 'NB_LIG_ANNU', 'DAT_MAJ', 'OPE_MAJ')
GROUP  BY c.OWNER, c.TABLE_NAME
HAVING COUNT(*) >= 6
ORDER  BY COUNT(*) DESC, c.OWNER, c.TABLE_NAME"""

TOURS_COLS = ["NUM_TOUR", "L_ETAT_TOUR", "ETAT_TOUR", "L_STYP_TOUR", "ZONE_MVT_PRISE", "NUM_ORDRE_PREP",
              "NB_LIG_PREV", "NB_LIG_TERM", "NB_LIG_ANNU", "NB_CONT_PREV", "NB_CONT_TERM", "DAT_MAJ", "OPE_MAJ"]


# ───────────────────────── fabrique de formules JavaScript ─────────────────────────
def L(s):
    """Littéral texte Excel."""
    return '"' + s.replace('"', '""') + '"'


def cat(*p):
    return "&".join(p)


def p2(e):
    return f'RIGHT("0"&{e},2)'


def hhmm(e):
    return cat(p2(f"HOUR({e})"), L(":"), p2(f"MINUTE({e})"))


def hh_h_mm(e):
    return cat(f"HOUR({e})", L("h"), p2(f"MINUTE({e})"))


def isod(e):
    return cat(f"YEAR({e})", L("-"), p2(f"MONTH({e})"), L("-"), p2(f"DAY({e})"))


def isodt(e):
    return cat(isod(e), L("T"), hhmm(e), L(":"), p2(f"SECOND({e})"))


def jsq(e):
    """Valeur texte JavaScript entre guillemets."""
    return cat(L('"'), e, L('"'))


def propre(e):
    """Retire les caractères qui casseraient une chaîne JavaScript."""
    return f'SUBSTITUTE(SUBSTITUTE({e},"\\",""),"""","")'


def ent(e):
    return f"ROUND(N({e}),0)"


def frac(e, k):
    """Décimal sans séparateur local : 7,4 → 740/100."""
    return f'ROUND(({e})*{k},0)&"/{k}"'


# ───────────────────────── construction ─────────────────────────
def construire(chemin, exemple=False):
    wb = xlsxwriter.Workbook(chemin)
    wb.set_properties({"title": "PP LIVE — alimentation de l'écran Flip", "author": "Pick & Pack CLR",
                       "comments": "Généré par outils/pp_live_classeur.py"})
    wb.set_calc_mode("auto")

    # couleurs
    NAVY, INK, GREY, LINE = "#12304F", "#1F2933", "#6B7280", "#D0D5DD"
    JAUNE, BLEU_SAISIE, GRIS_CALC = "#FFF2A8", "#0000FF", "#F2F4F7"

    def F(**k):
        base = {"font_name": "Arial", "font_size": 10, "valign": "vcenter", "font_color": INK}
        base.update(k)
        return wb.add_format(base)

    f_titre = F(bold=True, font_size=20, font_color=NAVY)
    f_sous = F(font_color=GREY, font_size=10, text_wrap=True)
    f_sect = F(bold=True, font_color="#FFFFFF", bg_color=NAVY, font_size=11, indent=1)
    f_lab = F(font_color=INK)
    f_lab_b = F(bold=True)
    f_note = F(font_color=GREY, font_size=9, text_wrap=True)
    f_nom = F(font_color="#98A2B3", font_size=8)
    f_in = F(bg_color=JAUNE, font_color=BLEU_SAISIE, border=1, border_color=LINE)
    f_in_txt = F(bg_color=JAUNE, font_color=BLEU_SAISIE, border=1, border_color=LINE, num_format="@")
    f_in_h = F(bg_color=JAUNE, font_color=BLEU_SAISIE, border=1, border_color=LINE, num_format="hh:mm", align="center")
    f_in_n = F(bg_color=JAUNE, font_color=BLEU_SAISIE, border=1, border_color=LINE)
    f_calc = F(bg_color=GRIS_CALC, border=1, border_color=LINE)
    f_calc_c = F(bg_color=GRIS_CALC, border=1, border_color=LINE, align="center")
    f_calc_n = F(bg_color=GRIS_CALC, border=1, border_color=LINE, num_format="#,##0", align="center")
    f_calc_n1 = F(bg_color=GRIS_CALC, border=1, border_color=LINE, num_format="0.0", align="center")
    f_dt = F(num_format="dd/mm/yyyy hh:mm:ss", align="left")
    f_d = F(num_format="dd/mm/yyyy", align="left")
    f_h = F(num_format="hh:mm", align="left")
    f_th = F(bold=True, font_color="#FFFFFF", bg_color=NAVY, align="center", text_wrap=True, border=1, border_color=NAVY)
    f_sql = F(font_name="Consolas", font_size=10, bg_color=JAUNE, font_color=BLEU_SAISIE, text_wrap=True,
              valign="top", border=1, border_color=LINE, num_format="@")
    f_kpi_l = F(bold=True, font_size=8, font_color=GREY, align="center", bg_color="#EEF2F7", top=1, left=1, right=1,
                border_color=LINE)
    f_kpi_v = F(bold=True, font_size=20, font_color=NAVY, align="center", num_format="#,##0", bg_color="#EEF2F7",
                bottom=1, left=1, right=1, border_color=LINE)
    f_big_in = F(bold=True, font_size=22, bg_color=JAUNE, font_color=BLEU_SAISIE, align="center", num_format="#,##0",
                 border=2, border_color="#E0B100")
    f_mode = F(bold=True, font_size=10, font_color="#7A4E00", bg_color="#FFF8E1", text_wrap=True, indent=1)
    f_etat = F(bold=True, font_size=11, font_color="#00783C", bg_color="#ECFDF3", text_wrap=True, indent=1,
               border=1, border_color="#ABEFC6")
    f_etat2 = F(font_size=9, font_color=GREY, bg_color="#F9FAFB", indent=1)
    f_chk = F(align="center", bg_color=JAUNE, border=1, border_color=LINE)
    f_txt = F()
    f_code = F(font_name="Consolas", font_size=9)

    ws_j = wb.add_worksheet("AUJOURD'HUI")
    ws_i = wb.add_worksheet("INSTALLATION")
    ws_p = wb.add_worksheet("PARAMÈTRES")
    ws_q = wb.add_worksheet("REQUÊTES")
    ws_c = wb.add_worksheet("CONTRÔLE")
    ws_t = wb.add_worksheet("TOURS")
    ws_cad = wb.add_worksheet("CADENCES")
    ws_h = wb.add_worksheet("HISTO")
    ws_jr = wb.add_worksheet("JOURNAL")
    ws_d = wb.add_worksheet("DECELEES")
    ws_x = wb.add_worksheet("EXPORT")
    for w in (ws_t, ws_cad, ws_h, ws_jr, ws_d, ws_x):
        w.hide()
        w.set_tab_color("#98A2B3")
    ws_j.set_tab_color("#12B76A")
    ws_i.set_tab_color("#F79009")
    for w in (ws_p, ws_q, ws_c):
        w.set_tab_color("#12304F")
    ws_j.activate()

    def nom(n, ref):
        wb.define_name(n, "=" + ref)

    # ═════════════════════════ PARAMÈTRES ═════════════════════════
    p = ws_p
    p.set_column("A:A", 50)
    p.set_column("B:B", 38)
    p.set_column("C:C", 22)
    p.set_column("D:D", 70)
    p.write("A1", "PARAMÈTRES — PP LIVE", f_titre)
    p.write("A2", "À régler une fois. Cellules jaunes = modifiables. Le classeur et la macro lisent ces valeurs "
                  "par leur nom (colonne C) : ne pas déplacer les lignes.", f_sous)
    p.set_row(1, 28)
    p.freeze_panes(3, 0)

    def sect(ws, ligne, texte, larg=4):
        ws.merge_range(ligne, 0, ligne, larg - 1, texte, f_sect)
        ws.set_row(ligne, 20)

    def param(ligne, lib, val, n, note="", fmt=None):
        p.write(ligne, 0, lib, f_lab)
        if isinstance(val, dt.time):
            p.write_datetime(ligne, 1, dt.datetime.combine(dt.date(1899, 12, 31), val), fmt or f_in_h)
        elif isinstance(val, (int, float)):
            p.write_number(ligne, 1, val, fmt or f_in_n)
        else:
            p.write_string(ligne, 1, val, fmt or f_in_txt)
        p.write(ligne, 2, n, f_nom)
        p.write(ligne, 3, note, f_note)
        nom(n, f"'PARAMÈTRES'!$B${ligne + 1}")

    T = dt.time
    sect(p, 3, "CONNEXION LOGYS (Oracle, lecture seule)")
    param(4, "DSN ODBC", "LOGP.DR-NORD.REXEL.FR", "P_DSN", "Le même que dans tes requêtes actuelles")
    param(5, "Utilisateur (optionnel)", "", "P_UID", "Vide si le DSN se connecte seul")
    param(6, "Mot de passe (optionnel)", "", "P_PWD", "Conseillé : rien ici, le DSN garde le mot de passe")
    param(7, "Libellé LOGYS d'une tournée lancée", "LANCEE", "P_ETAT_LANCEE", "Colonne L_ETAT_TOUR")
    param(8, "Libellé LOGYS d'une tournée en cours", "ENCOURS", "P_ETAT_ENCOURS",
          "Tous les autres états renvoyés par la requête comptent comme faits")

    sect(p, 10, "FICHIERS")
    param(11, "Dossier de l'écran (data.js)", "C:\\DASHBOARD\\", "P_DOSSIER_EXPORT",
          "Le dossier où se trouve pp_live.html sur le PC du Flip")
    param(12, "Suivi op (chemin complet)", "À RENSEIGNER", "P_SUIVI_OP",
          "Suivi_Op_PP_OFFICIEL.xlsx : registre, cadences et historique (lu chaque matin)")
    param(13, "Dossier des décelées", "À RENSEIGNER", "P_DOSSIER_DECELEES", "Ex. Z:\\Maitrise\\...\\DECELEES\\")
    param(14, "Nom du fichier des décelées", "{mois}{aaaa}.xlsx", "P_MODELE_DECELEES",
          "Donne novembre2026.xlsx — onglet du jour nommé jjmmaa ou jjmmaaaa")
    param(15, "Colonne du matricule dans ce fichier", "À RENSEIGNER", "P_DEC_COL_MAT", "Une lettre, ex. C")
    param(16, "1re ligne de données dans ce fichier", 2, "P_DEC_LIGNE1")

    sect(p, 18, "HORAIRES (lundi → vendredi)")
    param(19, "Début lundi → jeudi", T(13, 6), "P_DEBUT_LJ")
    param(20, "Fin lundi → jeudi", T(21, 0), "P_FIN_LJ")
    param(21, "Début vendredi", T(12, 36), "P_DEBUT_VEN")
    param(22, "Fin vendredi", T(20, 30), "P_FIN_VEN")
    param(23, "Pause 1 — début", T(15, 0), "P_PAUSE1_DEB")
    param(24, "Pause 1 — fin", T(15, 15), "P_PAUSE1_FIN")
    param(25, "Pause 2 — début", T(17, 45), "P_PAUSE2_DEB")
    param(26, "Pause 2 — fin", T(18, 15), "P_PAUSE2_FIN")
    param(27, "Bascule PRÉVISION → RÉEL", T(18, 15), "P_FIN_PREVISION",
          "Avant : l'écran ajoute ce qui reste à lancer pour atteindre la prévision. Après : seul le réel LOGYS compte.")

    sect(p, 29, "RYTHME")
    param(30, "Actualisation de l'écran (secondes)", 60, "P_REFRESH_SEC", "Lecture LOGYS + écriture de data.js")
    param(31, "Lecture des décelées toutes les (minutes)", 5, "P_DEC_MINUTES", "Fichier réseau : inutile chaque minute")

    sect(p, 33, "OBJECTIFS & SEUILS")
    param(34, "Lignes / jour / opérateur", 620, "P_OBJ_LIGNES_OP", "Standard CLR")
    param(35, "PPM avérées — plafond", 220, "P_OBJ_PPM_AVEREE")
    param(36, "Rejets du jour — ORANGE à partir de", 120, "P_REJ_ORANGE")
    param(37, "Rejets du jour — ROUGE au-dessus de", 140, "P_REJ_ROUGE")
    param(38, "Décelées équipe du jour — ORANGE à partir de", 15, "P_DEC_EQ_ORANGE")
    param(39, "Décelées équipe du jour — ROUGE à partir de", 20, "P_DEC_EQ_ROUGE")
    param(40, "Vigilance opérateur — ORANGE à partir de (décelées)", 3, "P_VIG_ORANGE")
    param(41, "Vigilance opérateur — ROUGE à partir de (décelées)", 5, "P_VIG_ROUGE")
    param(42, "STABLE si fin estimée avant fin de poste moins (min)", 10, "P_AVANCE_STABLE")
    param(43, "CRITIQUE si fin estimée après fin de poste plus (min)", 0, "P_RETARD_CRITIQUE")

    sect(p, 45, "CAPACITÉ")
    param(46, "Cadence de démarrage (lignes/h)", 50, "P_CADENCE_DEFAUT", "Pour un opérateur qui débute")
    param(47, "Jours de prod à la cadence de démarrage", 5, "P_JOURS_MINI", "En dessous : 50 l/h, au-delà : sa cadence réelle")
    param(48, "Fenêtre de cadence (derniers jours de prod)", 30, "P_FENETRE_CADENCE",
          "Σ lignes / Σ heures de picking réelles sur ces jours")
    param(49, "Heures pointées / jour", 7.4, "P_HEURES_POINTEES", "620 l / 7,4 h = 83,8 l/h standard")

    sect(p, 51, "RÔLES DU JOUR — coefficient de capacité")
    roles = [("Picking", 1), ("Carton", 1), ("Pilote", 0.5), ("Rejet", 0), ("Formation", 0)]
    for i, (r, c) in enumerate(roles):
        p.write_string(52 + i, 0, r, f_in_txt)
        p.write_number(52 + i, 1, c, f_in_n)
    p.write(52, 3, "Pilote 50 % (règle CLR) · Rejet et Formation : pas de capacité", f_note)
    nom("T_ROLES_NOM", "'PARAMÈTRES'!$A$53:$A$57")
    nom("T_ROLES_COEF", "'PARAMÈTRES'!$B$53:$B$57")

    sect(p, 58, "SERVICES D'ACCUEIL (prêts de main-d'œuvre)")
    for i, s in enumerate(["HG", "Câble", "Expédition", "Réception", "Convoyeur", "Autre"]):
        p.write_string(59 + i, 0, s, f_in_txt)
    nom("T_SERVICES", "'PARAMÈTRES'!$A$60:$A$65")
    p.insert_button("D13", {"macro": "RECHARGER_SUIVI_OP", "caption": "Relire le suivi op maintenant",
                            "width": 230, "height": 26, "x_offset": 300})

    # ═════════════════════════ REQUÊTES ═════════════════════════
    q = ws_q
    q.set_column("A:A", 30)
    q.set_column("B:B", 92)
    q.set_column("C:C", 58)
    q.write("A1", "REQUÊTES LOGYS — lecture seule", f_titre)
    q.write("A2", "Uniquement des SELECT. Ne change pas les noms de colonnes renvoyés : la macro range chaque "
                  "colonne sous l'en-tête du même nom. Pas de point-virgule à la fin.", f_sous)
    q.set_row(1, 28)
    q.write("A4", "Tournées\n(lue chaque minute)", F(bold=True, text_wrap=True, valign="top"))
    q.write_string("B4", SQL_TOURS, f_sql)
    q.write("C4", "À compléter une fois : remplace <<TABLE_TOURNEES>> par la table (ou la vue) de tes requêtes "
                  "actuelles, avec son schéma (ex. LOGYS.XXXX).\n\nTu ne la connais pas ? Bouton « Chercher la table » "
                  "ci-dessous : la macro la trouve dans le dictionnaire Oracle et la met ici.\n\n"
                  "Faites = PRELEVE et TERMINEE depuis 12h00 ; à faire = toutes les LANCEE et ENCOURS.",
            F(font_color=GREY, text_wrap=True, valign="top"))
    q.set_row(3, 300)
    q.write("A6", "Rejets du jour\n(lue chaque minute)", F(bold=True, text_wrap=True, valign="top"))
    q.write_string("B6", SQL_REJETS, f_sql)
    q.write("C6", "Colle ici ta requête actuelle des rejets PDS (tout le convoyeur). Seule la 1re valeur est lue.\n"
                  "Tant que des <<…>> restent, les rejets sont simplement ignorés.",
            F(font_color=GREY, text_wrap=True, valign="top"))
    q.set_row(5, 80)
    q.write("A8", "Recherche de la table\ndes tournées", F(bold=True, text_wrap=True, valign="top"))
    q.write_string("B8", SQL_RECHERCHE, f_sql)
    q.write("C8", "Lit seulement ALL_TAB_COLUMNS (liste des colonnes) : rien n'est modifié dans LOGYS.",
            F(font_color=GREY, text_wrap=True, valign="top"))
    q.set_row(7, 150)
    q.insert_button("C8", {"macro": "CHERCHER_TABLE", "caption": "Chercher la table des tournées",
                           "width": 240, "height": 30, "y_offset": 60, "x_offset": 6})
    nom("Q_TOURS", "'REQUÊTES'!$B$4")
    nom("Q_REJETS", "'REQUÊTES'!$B$6")
    nom("Q_RECHERCHE", "'REQUÊTES'!$B$8")
    sect(q, 9, "RÉSULTAT DE LA RECHERCHE (le plus probable en premier)", 3)
    for i, h in enumerate(["Schéma", "Table ou vue", "Colonnes trouvées (sur 8)"]):
        q.write(10, i, h, f_th)
    for r in range(11, 26):
        for c in range(3):
            q.write_blank(r, c, None, f_calc)
    nom("Q_RESULTAT", "'REQUÊTES'!$A$12:$C$26")

    # ═════════════════════════ TOURS (brut LOGYS) ═════════════════════════
    t = ws_t
    for i, h in enumerate(TOURS_COLS):
        t.write(0, i, h, f_th)
    t.set_column("A:K", 14)
    t.set_column("L:L", 19, f_dt)
    t.set_column("M:M", 12)
    t.freeze_panes(1, 0)
    nom("T_TOURS_ENTETE", "TOURS!$A$1:$M$1")
    nom("T_TOURS", f"TOURS!$A$2:$M${TOURS_N + 1}")

    # ═════════════════════════ CADENCES (suivi op) ═════════════════════════
    cad_cols = ["MATRICULE", "NOM PRENOM", "ROLE", "POSTE", "CONTRAT", "ACTIF", "SOUMIS QUOTA",
                "JOURS DE PROD", "LIGNES (fenêtre)", "HEURES PICK (fenêtre)", "CADENCE (l/h)", "DERNIER JOUR"]
    for i, h in enumerate(cad_cols):
        ws_cad.write(0, i, h, f_th)
    ws_cad.set_column("A:A", 11, F(num_format="@"))
    ws_cad.set_column("B:B", 26)
    ws_cad.set_column("C:K", 13)
    ws_cad.set_column("L:L", 12, f_d)
    ws_cad.freeze_panes(1, 0)
    last = CAD_N + 1
    nom("CAD_TABLE", f"CADENCES!$A$2:$L${last}")
    nom("CAD_MAT", f"CADENCES!$A$2:$A${last}")
    nom("CAD_NOM", f"CADENCES!$B$2:$B${last}")
    nom("CAD_CONTRAT", f"CADENCES!$E$2:$E${last}")
    nom("CAD_QUOTA", f"CADENCES!$G$2:$G${last}")
    nom("CAD_JOURS", f"CADENCES!$H$2:$H${last}")
    nom("CAD_CADENCE", f"CADENCES!$K$2:$K${last}")

    # ═════════════════════════ HISTO (suivi op) ═════════════════════════
    h = ws_h
    for i, x in enumerate(["DATE", "PROD (l/j/op)", "PPM AVÉRÉES"]):
        h.write(0, i, x, f_th)
    for i, x in enumerate(["DATE", "DÉCELÉES"]):
        h.write(0, 4 + i, x, f_th)
    h.write(0, 7, "MOIS — PROD", f_th)
    h.write(0, 8, "MOIS — PPM", f_th)
    h.set_column("A:A", 12, f_d)
    h.set_column("E:E", 12, f_d)
    h.set_column("B:I", 13)
    h.write("K1", "Rempli par la macro depuis le suivi op (PROD, ERREURS). PROD = Σ lignes / Σ heures de picking × "
                  "heures pointées. PPM = Σ erreurs avérées / Σ lignes × 1 000 000.", f_note)
    nom("H_HIST", f"HISTO!$A$2:$C${HIST_N + 1}")
    nom("H_DEC", f"HISTO!$E$2:$F${DECM_N + 1}")
    nom("H_MOIS_PROD", "HISTO!$H$2")
    nom("H_MOIS_PPM", "HISTO!$I$2")

    # ═════════════════════════ JOURNAL (une ligne par jour) ═════════════════════════
    for i, x in enumerate(["DATE", "REJETS", "LIGNES FAITES", "DÉCELÉES", "PRÉVISION", "PRÉSENTS"]):
        ws_jr.write(0, i, x, f_th)
    ws_jr.set_column("A:A", 12, f_d)
    ws_jr.set_column("B:F", 13)
    nom("JR_TABLE", f"JOURNAL!$A$2:$F${JR_N + 1}")
    nom("JR_DATES", f"JOURNAL!$A$2:$A${JR_N + 1}")
    nom("JR_REJ", f"JOURNAL!$B$2:$B${JR_N + 1}")

    # ═════════════════════════ DECELEES (fichier réseau, du jour) ═════════════════════════
    ws_d.write(0, 0, "MATRICULE", f_th)
    ws_d.write(0, 1, "DÉCELÉES", f_th)
    ws_d.set_column("A:A", 12, F(num_format="@"))
    ws_d.set_column("B:B", 11)
    nom("D_TABLE", f"DECELEES!$A$2:$B${DEC_N + 1}")

    # ═════════════════════════ CONTRÔLE ═════════════════════════
    c = ws_c
    c.set_column("A:A", 46)
    c.set_column("B:B", 24)
    c.set_column("C:E", 16)
    c.write("A1", "CONTRÔLE — ce que lit le classeur", f_titre)
    c.write("A2", "À regarder en cas de doute : la macro remplit la partie ÉTAT, le reste se calcule.", f_sous)
    sect(c, 3, "ÉTAT (rempli par la macro)", 5)
    etat = [("Dernière lecture LOGYS réussie", "C_MAJ", f_dt), ("Tournées lues", "C_NB_TOURS", f_txt),
            ("Durée de la dernière actualisation (s)", "C_DUREE", f_txt), ("Dernier data.js écrit", "C_EXPORT", f_dt),
            ("Prochaine actualisation", "C_PROCHAIN", f_dt), ("Décelées lues à", "C_DEC", f_dt),
            ("Suivi op lu à", "C_SUIVI", f_dt), ("Journée du", "C_JOUR", f_d), ("Dernier message", "C_MSG", f_txt),
            ("Rejets du jour (requête LOGYS)", "R_REJETS", f_txt)]
    for i, (lib, n, fm) in enumerate(etat):
        c.write(4 + i, 0, lib, f_lab)
        c.write_blank(4 + i, 1, None, fm)
        nom(n, f"'CONTRÔLE'!$B${5 + i}")

    sect(c, 15, "HORAIRES DU JOUR", 5)
    c.write("A17", "Début du poste", f_lab)
    c.write_formula("B17", "=IF(WEEKDAY(TODAY(),2)=5,P_DEBUT_VEN,P_DEBUT_LJ)", f_h)
    c.write("A18", "Fin du poste", f_lab)
    c.write_formula("B18", "=IF(WEEKDAY(TODAY(),2)=5,P_FIN_VEN,P_FIN_LJ)", f_h)
    c.write("A19", "Bascule prévision → réel", f_lab)
    c.write_formula("B19", "=P_FIN_PREVISION", f_h)
    nom("J_DEBUT", "'CONTRÔLE'!$B$17")
    nom("J_FIN", "'CONTRÔLE'!$B$18")

    sect(c, 20, "TOURNÉES PAR ÉTAT (onglet TOURS)", 5)
    for i, x in enumerate(["État", "Tournées", "Lignes prévues", "Lignes terminées", "Lignes annulées"]):
        c.write(21, i, x, f_th)
    rT = f"TOURS!$A$2:$A${TOURS_N + 1}"
    rB = f"TOURS!$B$2:$B${TOURS_N + 1}"
    rG, rH, rI = (f"TOURS!${x}$2:${x}${TOURS_N + 1}" for x in "GHI")
    c.write_formula("A23", '="Lancées ("&P_ETAT_LANCEE&")"', f_lab)
    c.write_formula("A24", '="En cours ("&P_ETAT_ENCOURS&")"', f_lab)
    c.write("A25", "Faites (tous les autres états)", f_lab)
    c.write("A26", "Total", f_lab_b)
    for row, crit in ((23, "P_ETAT_LANCEE"), (24, "P_ETAT_ENCOURS")):
        c.write_formula(f"B{row}", f"=COUNTIFS({rB},{crit})", f_calc_n)
        for col, rng in (("C", rG), ("D", rH), ("E", rI)):
            c.write_formula(f"{col}{row}", f"=SUMIFS({rng},{rB},{crit})", f_calc_n)
    c.write_formula("B25", f"=COUNTA({rT})-B23-B24", f_calc_n)
    for col, rng in (("C", rG), ("D", rH), ("E", rI)):
        c.write_formula(f"{col}25", f"=SUM({rng})-{col}23-{col}24", f_calc_n)
    for col in "BCDE":
        c.write_formula(f"{col}26", f"=SUM({col}23:{col}25)", F(bold=True, bg_color=GRIS_CALC, border=1,
                                                                 border_color=LINE, num_format="#,##0", align="center"))

    sect(c, 27, "CHARGE DU JOUR (ce qui part à l'écran)", 5)
    isF = f"({rT}<>\"\")*({rB}<>P_ETAT_LANCEE)*({rB}<>P_ETAT_ENCOURS)"
    charge = [
        ("Lancées, pas encore prises (lignes)", "=MAX(0,C23-D23-E23)", "C_LANCEES"),
        ("En cours de préparation (lignes restantes)", "=MAX(0,C24-D24-E24)", "C_ENCOURS"),
        ("Faites aujourd'hui (lignes)", f"=SUMPRODUCT({isF}*({rH}+({rH}=0)*({rG}-{rI})))", "C_FAITES"),
        ("Lancé dans LOGYS (total visible)", "=B29+B30+B31", "C_VISIBLE"),
        ("Prévision du jour (onglet AUJOURD'HUI)", "=N(J_PREVU)", None),
        ("Mode", '=IF(MOD(NOW(),1)>=P_FIN_PREVISION,"RÉEL","PRÉVISION")', "C_MODE"),
        ("Reste à lancer (ajouté par l'écran)", '=IF(B34="RÉEL",0,MAX(0,B33-B32))', "C_RESTE"),
        ("Décelées du jour (fichier réseau)", f"=SUM(DECELEES!$B$2:$B${DEC_N + 1})", "C_DEC_TOTAL"),
    ]
    for i, (lib, fo, n) in enumerate(charge):
        c.write(28 + i, 0, lib, f_lab)
        c.write_formula(28 + i, 1, fo, f_calc_n if "Mode" not in lib else f_calc_c)
        if n:
            nom(n, f"'CONTRÔLE'!$B${29 + i}")

    sect(c, 37, "POINTS DE CONTRÔLE", 5)
    rL = f"TOURS!$L$2:$L${TOURS_N + 1}"
    pts = [
        ("Tournées lancées avant aujourd'hui (orphelines ?)", f'=COUNTIFS({rB},P_ETAT_LANCEE,{rL},"<"&TODAY())'),
        ("Tournées en cours sans heure de prise", f'=COUNTIFS({rB},P_ETAT_ENCOURS,{rL},"")'),
        ("Présents / capacité équipe", '=J_PRESENTS&" présents · "&ROUND(J_CAPA,0)&" l/h"'),
        ("Requête des tournées complétée ?", '=IF(ISNUMBER(SEARCH("<<",Q_TOURS)),"NON : onglet REQUÊTES","oui")'),
    ]
    for i, (lib, fo) in enumerate(pts):
        c.write(38 + i, 0, lib, f_lab)
        c.write_formula(38 + i, 1, fo, f_calc_c)

    sect(c, 43, f"JOURNAL (les {LOG_N} derniers messages, le plus récent en haut)", 5)
    for r in range(44, 44 + LOG_N):
        c.write_blank(r, 0, None, f_dt)
    nom("C_LOG", f"'CONTRÔLE'!$A$45:$B${44 + LOG_N}")

    # ═════════════════════════ AUJOURD'HUI ═════════════════════════
    j = ws_j
    widths = {"A": 9, "B": 11, "C": 28, "D": 13, "E": 9, "F": 10, "G": 13, "H": 10, "I": 12, "J": 12, "K": 2, "L": 34}
    for col, w in widths.items():
        j.set_column(f"{col}:{col}", w)
    j.set_column("Y:Z", 6, None, {"hidden": True})
    j.hide_gridlines(2)
    j.merge_range("A1:F1", "PICK & PACK LIVE — AUJOURD'HUI", f_titre)
    j.merge_range("G1:J1", "=TODAY()", F(bold=True, font_size=12, font_color=NAVY, align="right",
                                          num_format="dddd d mmmm yyyy"))
    j.set_row(0, 34)
    j.merge_range("A2:J2", "Chaque jour, 2 gestes : ① décoche les absents  ② tape la prévision de lignes. "
                           "C'est tout : l'écran se met à jour seul chaque minute.", F(font_size=10, font_color=GREY))
    j.set_row(2, 6)
    j.merge_range("A4:E4", "② PRÉVISION DU JOUR", f_sect)
    j.merge_range("G4:J4", "ÉCRAN FLIP", f_sect)
    j.set_row(3, 22)
    j.merge_range("A5:C5", "Lignes prévues aujourd'hui", F(bold=True, font_size=11, indent=1))
    j.merge_range("D5:E5", 8500, f_big_in)
    j.write_comment("D5", "Une seule saisie : le total de lignes prévu pour la journée.\n"
                          "Exemple : 8 500. Tu peux la corriger à tout moment.\n"
                          "Effacée automatiquement chaque matin.", {"x_scale": 1.6, "y_scale": 1.2})
    j.set_row(4, 40)
    mode = ('=IF(MOD(NOW(),1)<P_FIN_PREVISION,"Mode PRÉVISION jusqu\'à "&' + hh_h_mm("P_FIN_PREVISION") +
            '&" : l\'écran ajoute ce qui reste à lancer pour atteindre la prévision.",'
            '"Mode RÉEL depuis "&' + hh_h_mm("P_FIN_PREVISION") +
            '&" : la prévision n\'est plus utilisée, seul ce qui est lancé dans LOGYS compte.")')
    j.merge_range("A6:E6", mode, f_mode)
    j.set_row(5, 30)
    j.merge_range("G5:J5", "Pas encore démarré : bouton « Démarrer l'écran » →", f_etat)
    j.merge_range("G6:J6", '="LOGYS lu à "&IF(N(C_MAJ)=0,"—",' + hhmm("C_MAJ") + ')&"   ·   data.js écrit à "&'
                           'IF(N(C_EXPORT)=0,"—",' + hhmm("C_EXPORT") + ')', f_etat2)
    j.set_row(6, 8)
    kpis = [("A", "B", "PRÉSENTS", f"=SUM(Y{EQ_L1}:Y{EQ_L1 + EQ_N - 1})"),
            ("C", "D", "CAPACITÉ (l/h)", f"=SUM(J{EQ_L1}:J{EQ_L1 + EQ_N - 1})"),
            ("E", "F", "LANCÉ DANS LOGYS", "=C_VISIBLE"),
            ("G", "H", "RESTE À LANCER", "=C_RESTE"),
            ("I", "J", "REJETS DU JOUR", '=IF(R_REJETS="","—",R_REJETS)')]
    for a, b, lab, fo in kpis:
        j.merge_range(f"{a}8:{b}8", lab, f_kpi_l)
        j.merge_range(f"{a}9:{b}9", fo, f_kpi_v)
    j.set_row(7, 16)
    j.set_row(8, 34)
    j.set_row(9, 8)
    nom("J_PREVU", f"{J}!$D$5")
    nom("J_ETAT", f"{J}!$G$5")
    nom("J_PRESENTS", f"{J}!$A$9")
    nom("J_CAPA", f"{J}!$C$9")

    heads = ["① Présent", "Matricule", "Nom", "Rôle du jour", "Part à", "Revient à", "Vers",
             "Contrat", "Cadence (l/h)", "Capacité (l/h)"]
    for i, x in enumerate(heads):
        j.write(10, i, x, f_th)
    j.set_row(10, 30)
    j.write_comment("A11", "Coché = présent, compte dans la capacité.\n"
                           "Il part plus tard : laisse coché, mets l'heure dans « Part à ».\n"
                           "Il revient plus tard : décoche, mets l'heure dans « Revient à ».",
                    {"x_scale": 2.2, "y_scale": 1.3})
    a, z = EQ_L1, EQ_L1 + EQ_N - 1
    ex_team = []
    if exemple:
        ex_team = EXEMPLE_EQUIPE
    else:
        ex_team = [("149", "Picking", True, None, None), ("739", "Picking", False, None, dt.time(19, 30)),
                   ("017", "Pilote", True, None, None)]
    for i in range(EQ_N):
        r = a + i
        row0 = r - 1
        ex = ex_team[i] if i < len(ex_team) else None
        j.insert_checkbox(row0, 0, bool(ex and ex[2]), f_chk)
        if ex:
            j.write_string(row0, 1, ex[0], f_in_txt)
            j.write_string(row0, 3, ex[1], f_in)
        else:
            j.write_blank(row0, 1, None, f_in_txt)
            j.write_blank(row0, 3, None, f_in)
        for col, idx in ((4, 3), (5, 4)):
            if ex and ex[idx] is not None:
                j.write_datetime(row0, col, dt.datetime.combine(dt.date(1899, 12, 31), ex[idx]), f_in_h)
            else:
                j.write_blank(row0, col, None, f_in_h)
        j.write_blank(row0, 6, None, f_in)
        m = f'MATCH($B{r}&"",CAD_MAT,0)'
        j.write_formula(row0, 2, f'=IF($B{r}="","",IFERROR(INDEX(CAD_NOM,{m})&"","(hors registre)"))', f_calc)
        j.write_formula(row0, 7, f'=IF($B{r}="","",IFERROR(IF(LEFT(INDEX(CAD_CONTRAT,{m})&"",3)="Int","Intérim",'
                                 f'INDEX(CAD_CONTRAT,{m})&""),IF(OR(LEFT($B{r},1)="6",LEFT($B{r},1)="7"),"Intérim","—")))',
                        f_calc_c)
        j.write_formula(row0, 8, f'=IF($B{r}="","",IF(OR($D{r}="Pilote",IFERROR(INDEX(CAD_QUOTA,{m})&"","OUI")="NON"),'
                                 f'ROUND(P_OBJ_LIGNES_OP/P_HEURES_POINTEES,1),IF(OR(N(IFERROR(INDEX(CAD_CADENCE,{m}),0))=0,'
                                 f'N(IFERROR(INDEX(CAD_JOURS,{m}),0))<P_JOURS_MINI),P_CADENCE_DEFAUT,INDEX(CAD_CADENCE,{m}))))',
                        f_calc_n1)
        j.write_formula(row0, 9, f'=IF($B{r}="","",IF($Y{r}=1,$Z{r}*$I{r},0))', f_calc_n)
        j.write_formula(row0, 24, f'=IF($B{r}="",0,IF(OR($A{r}=TRUE,$A{r}=1,UPPER($A{r}&"")="OUI",'
                                  f'UPPER($A{r}&"")="X"),1,0))')
        j.write_formula(row0, 25, f'=IF($B{r}="",0,IF($D{r}="",1,IFERROR(INDEX(T_ROLES_COEF,MATCH($D{r},T_ROLES_NOM,0)),0)))')
    j.merge_range(z, 0, z, 9, "Il part plus tard : laisse coché + « Part à ».  Il revient plus tard : décoche + "
                              "« Revient à ».  Un renfort : tape son matricule sur une ligne vide et coche.",
                  F(font_size=9, font_color=GREY, italic=True))
    nom("J_CHK", f"{J}!$A${a}:$A${z}")
    nom("J_MAT", f"{J}!$B${a}:$B${z}")
    nom("J_ROLE", f"{J}!$D${a}:$D${z}")
    nom("J_PART", f"{J}!$E${a}:$E${z}")
    nom("J_REVIENT", f"{J}!$F${a}:$F${z}")
    nom("J_VERS", f"{J}!$G${a}:$G${z}")
    rng = f"A{a}:J{z}"
    j.conditional_format(rng, {"type": "formula", "criteria": f"=AND($B{a}<>\"\",$Y{a}=0)",
                               "format": wb.add_format({"font_color": "#98A2B3", "bg_color": "#F2F4F7"})})
    j.conditional_format(f"E{a}:E{z}", {"type": "formula", "criteria": f"=AND($Y{a}=1,ISNUMBER($E{a}))",
                                        "format": wb.add_format({"bg_color": "#FEF0C7", "bold": True})})
    j.conditional_format(f"F{a}:F{z}", {"type": "formula", "criteria": f"=AND($Y{a}=0,ISNUMBER($F{a}))",
                                        "format": wb.add_format({"bg_color": "#D1FADF", "bold": True})})
    j.conditional_format(f"I{a}:I{z}", {"type": "formula",
                                        "criteria": f"=AND($B{a}<>\"\",$I{a}=P_CADENCE_DEFAUT,$D{a}<>\"Pilote\")",
                                        "format": wb.add_format({"font_color": "#B54708", "bold": True})})
    j.conditional_format(f"C{a}:C{z}", {"type": "formula", "criteria": f"=$C{a}=\"(hors registre)\"",
                                        "format": wb.add_format({"italic": True, "font_color": "#98A2B3"})})
    j.data_validation(f"D{a}:D{z}", {"validate": "list", "source": "=T_ROLES_NOM",
                                     "input_title": "Rôle du jour", "input_message": "Pilote = 50 % de capacité"})
    j.data_validation(f"G{a}:G{z}", {"validate": "list", "source": "=T_SERVICES"})
    for col in ("E", "F"):
        j.data_validation(f"{col}{a}:{col}{z}", {"validate": "time", "criteria": "between",
                                                 "minimum": dt.time(0, 0), "maximum": dt.time(23, 59),
                                                 "error_title": "Heure", "error_message": "Tape une heure, ex. 17:30"})
    j.data_validation("D5", {"validate": "integer", "criteria": "between", "minimum": 0, "maximum": 100000,
                             "error_message": "Un nombre de lignes, ex. 8500"})
    j.freeze_panes(11, 0)
    btn = [("DEMARRER", "▶  Démarrer l'écran"), ("ARRETER", "■  Arrêter l'écran"),
           ("ACTUALISER", "⟳  Actualiser maintenant"), ("NOUVELLE_JOURNEE", "☀  Nouvelle journée")]
    for i, (mac, cap) in enumerate(btn):
        j.insert_button("L4", {"macro": mac, "caption": cap, "width": 230, "height": 30,
                               "x_offset": 6, "y_offset": i * 38})
    j.write("L12", "Les autres onglets se règlent une fois (INSTALLATION). "
                   "En cas de doute : onglet CONTRÔLE.", f_note)

    # ═════════════════════════ INSTALLATION ═════════════════════════
    i_ = ws_i
    i_.set_column("A:A", 5)
    i_.set_column("B:B", 120)
    i_.hide_gridlines(2)
    i_.write("B1", "INSTALLATION — une seule fois", f_titre)
    etapes = [
        ("1", "Enregistre ce fichier sur le PC qui reste allumé (accès à LOGYS et au dossier de l'écran Flip)."),
        ("2", "Alt + F11 → Fichier → Importer un fichier → PPLive.bas → menu Débogage → Compiler VBAProject → ferme la fenêtre."),
        ("3", "Fichier → Enregistrer sous → type « Classeur Excel (prenant en charge les macros) (*.xlsm) »."),
        ("4", "Onglet PARAMÈTRES : DSN, dossier de l'écran (là où est pp_live.html), chemin du suivi op ; décelées si tu veux la vigilance."),
        ("5", "Onglet REQUÊTES : nom de la table des tournées (bouton « Chercher la table » si tu ne le connais pas) et requête des rejets."),
        ("6", "Ferme et rouvre le fichier .xlsm, active les macros : l'écran démarre seul. Vérifie l'onglet CONTRÔLE."),
    ]
    for k, (n_, txt) in enumerate(etapes):
        i_.write(2 + k, 0, n_, F(bold=True, font_size=14, font_color="#F79009", align="center"))
        i_.write(2 + k, 1, txt, F(font_size=11, text_wrap=True))
        i_.set_row(2 + k, 30)
    i_.write("B10", "CHAQUE JOUR", F(bold=True, font_size=14, font_color=NAVY))
    jour = ["À l'ouverture le matin, le fichier prépare la journée seul : équipe rechargée depuis le suivi op, tout le monde coché, prévision effacée.",
            "① Onglet AUJOURD'HUI : décoche les absents (un clic sur la case).",
            "② Tape la prévision de lignes du jour dans la grande case jaune. Jusqu'à 18h15 l'écran ajoute ce qui reste à lancer ; après 18h15 seul le réel LOGYS compte.",
            "Quelqu'un part aider ailleurs : laisse-le coché et mets l'heure dans « Part à » (ou décoche-le s'il part tout de suite). Il revient : « Revient à ».",
            "Le fichier lit LOGYS et réécrit data.js toutes les minutes. Laisse-le ouvert ; s'il est fermé, l'écran affiche « Données de … · vérifier le PC Excel »."]
    for k, txt in enumerate(jour):
        i_.write(10 + k, 1, txt, F(font_size=11, text_wrap=True))
        i_.set_row(10 + k, 30)
    i_.write("B17", "CE QUE LE FICHIER NE FAIT JAMAIS", F(bold=True, font_size=14, font_color=NAVY))
    i_.write("B18", "Il n'écrit rien dans LOGYS (requêtes SELECT uniquement), ne modifie pas le suivi op ni le fichier des "
                    "décelées (ouverts en lecture seule), n'envoie aucun mail.", F(font_size=11, text_wrap=True))
    i_.set_row(17, 30)

    # ═════════════════════════ EXPORT (data.js) ═════════════════════════
    x = ws_x
    x.set_column("A:A", 140, f_code)
    x.set_column("B:B", 50, f_note)
    lignes = []      # (contenu, est_formule, note)

    def txt_(s, note=""):
        lignes.append((s, False, note))

    def fo_(s, note=""):
        lignes.append(("=" + s, True, note))

    txt_("// PP LIVE · data.js écrit par Excel (onglet EXPORT de PP_LIVE) — ne pas modifier à la main", "commentaire")
    txt_("window.PP_DATA = {")
    fo_(cat(L("genere: "), f'IF(N(C_MAJ)>0,{jsq(isodt("C_MAJ"))},{L(chr(34) + "2000-01-01T00:00:00" + chr(34))})',
            L(",")), "heure de la dernière lecture LOGYS réussie")
    fo_(cat(L('jour: {date:"'), isod("TODAY()"), L('", debut:"'), hhmm("J_DEBUT"), L('", fin:"'), hhmm("J_FIN"),
            L('", pauses:[["'), hhmm("P_PAUSE1_DEB"), L('","'), hhmm("P_PAUSE1_FIN"), L('"],["'),
            hhmm("P_PAUSE2_DEB"), L('","'), hhmm("P_PAUSE2_FIN"), L('"]]},')), "horaires du jour (vendredi géré)")
    fo_(cat(L("params: {heures_pointees: "), frac("P_HEURES_POINTEES", 100), L(", cadence_defaut: "),
            frac("P_CADENCE_DEFAUT", 10), L(', fin_prevision: "'), hhmm("P_FIN_PREVISION"), L('"},')),
        "bascule prévision → réel")
    s_parts = [("avance_stable", "P_AVANCE_STABLE"), ("retard_critique", "P_RETARD_CRITIQUE"),
               ("rej_orange", "P_REJ_ORANGE"), ("rej_rouge", "P_REJ_ROUGE"), ("dec_orange", "P_DEC_EQ_ORANGE"),
               ("dec_rouge", "P_DEC_EQ_ROUGE"), ("vig_orange", "P_VIG_ORANGE"), ("vig_rouge", "P_VIG_ROUGE"),
               ("obj_lignes_op", "P_OBJ_LIGNES_OP"), ("obj_ppm_averee", "P_OBJ_PPM_AVEREE")]
    seuils = [L("seuils: {")]
    for k, (cle, n) in enumerate(s_parts):
        seuils += [L((", " if k else "") + cle + ": "), ent(n)]
    seuils.append(L("},"))
    fo_(cat(*seuils))
    fo_(cat(L("saisie: {prevu: "), ent("J_PREVU"), L("},")), "la prévision du jour (une seule saisie)")
    txt_("equipe: [")
    for i in range(EQ_N):
        r = EQ_L1 + i
        c_ = lambda col: f"{J}!${col}${r}"
        fo_(f'IF({c_("B")}="","",' + cat(
            L("{mat:"), jsq(propre(c_("B") + '&""')), L(", role:"), jsq(propre(c_("D") + '&""')),
            L(", present:"), f'IF({c_("Y")}=1,"true","false")',
            L(", sorti:"), f'IF(ISNUMBER({c_("E")}),{jsq(hhmm(c_("E")))},"null")',
            L(", revenu:"), f'IF(ISNUMBER({c_("F")}),{jsq(hhmm(c_("F")))},"null")',
            L(", coef:"), frac(f'N({c_("Z")})', 100), L(", cadence:"), frac(f'N({c_("I")})', 10), L("},")) + ")",
            f"équipe ligne {r}" if i == 0 else "")
    txt_("],")
    txt_("tours: [")
    for i in range(TOURS_N):
        r = 2 + i
        tc = lambda col: f"TOURS!${col}${r}"
        k = f'IF(TRIM({tc("B")})=P_ETAT_LANCEE,"L",IF(TRIM({tc("B")})=P_ETAT_ENCOURS,"C","F"))'
        fo_(f'IF({tc("A")}="","",' + cat(
            L("{n:"), jsq(propre(tc("A") + '&""')), L(", k:"), jsq(k), L(", st:"), jsq(propre(tc("D") + '&""')),
            L(", l:"), ent(tc("G")), L(", t:"), ent(tc("H")), L(", a:"), ent(tc("I")),
            L(", op:"), jsq(propre(tc("M") + '&""')),
            L(", deb:"), f'IF(ISNUMBER({tc("L")}),{jsq(isodt(tc("L")))},"null")', L("},")) + ")",
            "une tournée LOGYS par ligne" if i == 0 else "")
    txt_("],")
    fo_(cat(L("rejets: "), ent("R_REJETS"), L(",")))
    txt_("decelees: [")
    for i in range(DEC_N):
        r = 2 + i
        fo_(f'IF(DECELEES!$A${r}="","",' + cat(L("{mat:"), jsq(propre(f'DECELEES!$A${r}&""')), L(", n:"),
                                                 ent(f"DECELEES!$B${r}"), L("},")) + ")")
    txt_("],")
    txt_("hist: [")
    for i in range(HIST_N):
        r = 2 + i
        m = f"MATCH(HISTO!$A${r},JR_DATES,0)"
        rej = f'IF(ISNUMBER({m}),IF(INDEX(JR_REJ,{m})&""="","null",ROUND(N(INDEX(JR_REJ,{m})),0)),"null")'
        fo_(f'IF(N(HISTO!$A${r})=0,"",' + cat(L("{d:"), jsq(isod(f"HISTO!$A${r}")), L(", prod:"),
                                                ent(f"HISTO!$B${r}"), L(", ppm:"), ent(f"HISTO!$C${r}"),
                                                L(", rej:"), rej, L("},")) + ")")
    txt_("],")
    mois = "CHOOSE(MONTH(TODAY())," + ",".join(L(m_) for m_ in MOIS) + ")"
    fo_(cat(L("mois: {nom:"), jsq(mois), L(", prod:"), 'IF(N(H_MOIS_PROD)>0,ROUND(H_MOIS_PROD,0),"null")',
            L(", ppm:"), 'IF(ISNUMBER(H_MOIS_PPM),ROUND(H_MOIS_PPM,0),"null")', L("},")))
    txt_("dec_mois: [")
    for i in range(DECM_N):
        r = 2 + i
        fo_(f'IF(N(HISTO!$E${r})=0,"",' + cat(L("{d:"), jsq(isod(f"HISTO!$E${r}")), L(", n:"),
                                                ent(f"HISTO!$F${r}"), L("},")) + ")")
    txt_("],")
    txt_("};")
    for k, (s, est_f, note) in enumerate(lignes):
        if est_f:
            x.write_formula(k, 0, s, f_code, "")
        else:
            x.write_string(k, 0, s, f_code)
        if note:
            x.write(k, 1, note, f_note)
    nom("X_LIGNES", f"EXPORT!$A$1:$A${len(lignes)}")

    if exemple:
        remplir_exemple(wb, ws_t, ws_cad, ws_h, ws_jr, ws_d, ws_c, F)
    wb.close()
    return len(lignes)


# ───────────────────────── données fictives (contrôle uniquement) ─────────────────────────
EXEMPLE_EQUIPE = ([("017", "Pilote", True, None, None), ("018", "Pilote", True, None, None),
                   ("142", "Rejet", True, None, None), ("015", "Carton", True, None, None)] +
                  [(m, "Picking", k < 16, None, (dt.time(19, 30) if m == "748" else None))
                   for k, m in enumerate(["112", "129", "132", "149", "154", "159", "172", "194", "617", "628",
                                          "670", "708", "717", "739", "789", "036", "748", "115"])] +
                  [("905", "Picking", True, dt.time(19, 0), None)])


def remplir_exemple(wb, ws_t, ws_cad, ws_h, ws_jr, ws_d, ws_c, F):
    rnd = random.Random(7)
    now = dt.datetime.now().replace(microsecond=0)
    fdt = wb.add_format({"num_format": "dd/mm/yyyy hh:mm:ss"})
    fd = wb.add_format({"num_format": "dd/mm/yyyy"})
    # tournées : 13 en cours, ~2 000 lignes lancées, ~4 800 faites
    r = 1
    ops_en_tournee = [m for m, role, pres, *_ in EXEMPLE_EQUIPE if role == "Picking" and pres][:13]
    n = 4870000
    for op in ops_en_tournee:
        l_ = rnd.randint(45, 105)
        row = [f"TO0{n}", "ENCOURS", "2", "DETAIL", "PICK01A14", 1, l_, 0, 0, 3, 0,
               now - dt.timedelta(minutes=rnd.randint(2, 50)), op]
        n += 1
        for c, v in enumerate(row):
            (ws_t.write_datetime(r, c, v, fdt) if isinstance(v, dt.datetime) else ws_t.write(r, c, v))
        r += 1
    s = 0
    while s < 2050:
        l_ = rnd.randint(25, 95)
        for c, v in enumerate([f"TO0{n}", "LANCEE", "1", "CARTON", "PICK01A14", 2, l_, 0, 0, 2, 0,
                               now - dt.timedelta(hours=1), ""]):
            (ws_t.write_datetime(r, c, v, fdt) if isinstance(v, dt.datetime) else ws_t.write(r, c, v))
        n += 1; r += 1; s += l_
    s = 0
    while s < 4800:
        l_ = rnd.randint(30, 110)
        for c, v in enumerate([f"TO0{n}", rnd.choice(["PRELEVE", "TERMINEE"]), "5", "DETAIL", "PICK01A14", 3, l_, l_,
                               0, 3, 3, now - dt.timedelta(minutes=rnd.randint(10, 200)), "149"]):
            (ws_t.write_datetime(r, c, v, fdt) if isinstance(v, dt.datetime) else ws_t.write(r, c, v))
        n += 1; r += 1; s += l_
    # registre / cadences
    cad = [("017", "PILOTE A", "PILOTE"), ("018", "PILOTE B", "PILOTE"), ("142", "REJET C", "")]
    cad += [(m, f"OPERATEUR {m}", "") for m, *_ in EXEMPLE_EQUIPE[3:-1]]
    for i, (m, np_, role) in enumerate(cad):
        jours = 3 if m == "789" else 40
        cadence = round(rnd.uniform(60, 105), 1)
        vals = [m, np_, role, "", "Intérim" if m[0] in "67" else "CDI", "OUI", "OUI", jours,
                round(cadence * 200), 200, cadence, now.date() - dt.timedelta(days=1)]
        for c, v in enumerate(vals):
            if isinstance(v, dt.date):
                ws_cad.write_datetime(i + 1, c, dt.datetime.combine(v, dt.time()), fd)
            elif c == 0:
                ws_cad.write_string(i + 1, c, v)
            else:
                ws_cad.write(i + 1, c, v)
    # historique : 30 jours ouvrés avant aujourd'hui
    d = now.date() - dt.timedelta(days=1)
    jours = []
    while len(jours) < HIST_N:
        if d.weekday() < 5:
            jours.insert(0, d)
        d -= dt.timedelta(days=1)
    for i, dd in enumerate(jours):
        ws_h.write_datetime(i + 1, 0, dt.datetime.combine(dd, dt.time()), fd)
        ws_h.write(i + 1, 1, rnd.randint(540, 660))
        ws_h.write(i + 1, 2, rnd.choice([0, rnd.randint(90, 220), rnd.randint(230, 480)]))
        ws_jr.write_datetime(i + 1, 0, dt.datetime.combine(dd, dt.time()), fd)
        if i > 4:
            ws_jr.write(i + 1, 1, rnd.randint(92, 150))
    mois = [x for x in jours if x.month == now.month] or jours[-5:]
    for i, dd in enumerate(mois):
        ws_h.write_datetime(i + 1, 4, dt.datetime.combine(dd, dt.time()), fd)
        ws_h.write(i + 1, 5, rnd.randint(9, 23))
    ws_h.write("H2", 588)
    ws_h.write("I2", 196)
    for i, (m, k) in enumerate([("628", 5), ("149", 3), ("739", 3), ("717", 2), ("194", 1)]):
        ws_d.write_string(i + 1, 0, m)
        ws_d.write(i + 1, 1, k)
    ws_c.write_datetime("B5", now - dt.timedelta(seconds=20), fdt)
    ws_c.write("B14", 71)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    n = construire(sys.argv[1], exemple="--exemple" in sys.argv)
    print(f"{sys.argv[1]} : {n} lignes de data.js")
