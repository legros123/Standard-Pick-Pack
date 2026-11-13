#!/usr/bin/env python3
"""Crée le classeur unique « PickPackLive_Donnees.xlsx » (feuilles + tableaux + lignes d'exemple)
et, avec --test DOSSIER, écrit le data.js que le module VBA produirait pour ces exemples.
Usage : python3 creer_classeur.py SORTIE.xlsx [--test DOSSIER]"""
import sys, json, datetime as dt
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.utils import get_column_letter

AUJ = dt.date.today()
def jo(k):                       # k-ième jour ouvré avant aujourd'hui
    d = AUJ
    while k:
        d -= dt.timedelta(days=1)
        if d.weekday() < 5: k -= 1
    return d
rnd_s = [7]
def rnd():
    rnd_s[0] = (rnd_s[0] * 9301 + 49297) % 233280
    return rnd_s[0] / 233280
entre = lambda a, b: round(a + rnd() * (b - a))

PARAM = [
 ("dossier_sortie", "", "Dossier où écrire data.js = dossier de pilotage.html. Vide = dossier de ce classeur."),
 ("intervalle_s", 60, "Secondes entre deux exports (15 au minimum)."),
 ("rafraichir_requetes", "NON", "OUI = actualise toutes les requêtes du classeur avant chaque export."),
 ("site", "CLR Champigneulles", "Nom affiché en haut à gauche."),
 ("debut", "13:06", "Prise de poste."),
 ("fin", "21:00", "Fin de poste."),
 ("pause1_debut", "15:00", ""), ("pause1_fin", "15:15", ""),
 ("pause2_debut", "17:45", ""), ("pause2_fin", "18:15", ""),
 ("pause3_debut", "", ""), ("pause3_fin", "", ""),
 ("heures_pointees", 7.4, "Heures pointées du poste (base des cadences du Suivi Op)."),
 ("cadence_defaut", 50, "Lignes / heure pour un opérateur sans cadence connue."),
 ("prevu", 9800, "PRÉVISION DU JOUR en lignes : à saisir chaque jour."),
 ("fin_prevision", "18:20", "Après cette heure, seule la charge réellement lancée compte."),
 ("rejets_jour", 71, "Nombre de rejets du jour (colis écartés par la balance)."),
 ("avance_stable", 10, "Minutes d'avance pour être STABLE (vert)."),
 ("retard_critique", 0, "Minutes de retard tolérées avant CRITIQUE (rouge)."),
 ("rej_orange", 120, "Rejets : seuil orange."), ("rej_rouge", 140, "Rejets : seuil rouge."),
 ("dec_orange", 15, "Décelées : seuil orange."), ("dec_rouge", 20, "Décelées : seuil rouge."),
 ("vig_orange", 3, "Dossard à partir de … décelées."), ("vig_rouge", 5, "Dossard rouge à partir de …"),
 ("obj_lignes_op", 620, "Objectif lignes / jour / opérateur."),
 ("obj_ppm_averee", 220, "Plafond PPM avérée."),
 ("mois_prod", "", "Productivité du mois (vide = moyenne de la feuille HISTORIQUE)."),
 ("mois_ppm", "", "PPM avérée du mois (vide = moyenne de la feuille HISTORIQUE)."),
 ("dernier_accident", "=TODAY()-187", "Date du dernier accident avec arrêt."),
 ("message_securite", "Je regarde derrière moi avant de reculer avec mon chariot.", "Message sécurité du jour."),
]
EQUIPE = [("017", "Pilote", "OUI", "", "", 0.5, 83.8), ("142", "Rejet", "OUI", "", "", 0, 83.8), ("015", "Carton", "OUI", "", "", 1, 77.1)] + \
         [(m, "Picking", "OUI" if i < 14 else "NON", "17:00" if m == "739" else "", "18:15" if i >= 14 else "", 1, c) for i, (m, c) in enumerate(
          [("112", 82.7), ("129", 86.2), ("132", 92.6), ("149", 77.3), ("154", 84.0), ("159", 66.3), ("172", 93.7), ("194", 75.6), ("617", 92.1),
           ("628", 75.6), ("670", 84.3), ("708", 80.0), ("717", 75.9), ("739", 108.6), ("789", 59.6), ("036", 94.9)])]
def tournees():
    out, n = [], 4870000
    H = dt.datetime.now()
    def hm(m): return (H - dt.timedelta(minutes=m)).strftime("%H:%M")
    for e in [x for x in EQUIPE if x[1] == "Picking" and x[2] == "OUI"][:12]:
        out.append((f"TO0{n}", "C", "DETAIL", entre(45, 105), 0, 0, e[0], hm(entre(3, 50)), "", "")); n += 1
    s = 0
    while s < 1900:
        l = entre(25, 95); out.append((f"TO0{n}", "L", "DETAIL", l, 0, 0, "", "", "", "")); n += 1; s += l
    s = 0
    while s < 4800:
        l = entre(30, 110); out.append((f"TO0{n}", "F", "DETAIL", l, l, 0, EQUIPE[3 + entre(0, 12)][0], hm(entre(200, 260)), hm(entre(5, 190)), round(l / 2.5))); n += 1; s += l
    return out
TYPES = ["Manquante", "Quantité +", "Quantité -", "Orientation", "Référence", "Casse"]
def decelees():
    out = []
    for m, n in [("149", 3), ("628", 5), ("194", 1), ("717", 2), ("670", 4), ("739", 1)]:
        for _ in range(n): out.append((0, m, TYPES[entre(1, 4)], entre(1, 14)))
    for j in range(1, 7):
        for _ in range(entre(14, 22)): out.append((j, EQUIPE[3 + entre(0, 15)][0], TYPES[entre(0, 5)], [1, 2, 3, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 11, 12, 13, 14, 21][entre(0, 17)]))
    return out                                  # (jours avant aujourd'hui, matricule, type, allée)
VAGUES = [("13:10", "481200", 2600, 2600, 9), ("14:40", "481237", 1900, 1640, 6), ("16:10", "481274", 1600, 560, 4), ("17:20", "481311", 1100, 0, 0)]
SERVICES = [("Hors gabarit", 1960, 542), ("Câble", 299, 81)]
def historique():
    out = []
    for k in range(30, 0, -1):
        r = rnd(); lig = entre(6700, 8000); ops = entre(13, 17)
        out.append((k, entre(545, 660), 0 if r < .35 else entre(90, 220) if r < .75 else entre(230, 480), entre(92, 150), entre(9, 23), lig, ops))
    return out                                  # (jours ouvrés avant aujourd'hui, prod, ppm, rejets, décelées, lignes, ops)

def classeur(chemin):
    wb = Workbook(); ws = wb.active; ws.title = "LIVE"
    gras, titre = Font(bold=True), Font(bold=True, size=16)
    ws["A1"] = "PICK & PACK LIVE — classeur unique"; ws["A1"].font = titre
    ws["A2"] = "Ce classeur écrit data.js, le seul fichier lu par pilotage.html."
    ws["A4"] = "État"; ws["A5"] = "Dernier export"; ws["A4"].font = ws["A5"].font = gras
    ws["B4"] = "Jamais lancé"; ws["B5"].number_format = "dd/mm/yyyy hh:mm:ss"
    lignes = ["", "MISE EN ROUTE (une seule fois)",
      "1. Alt+F11  >  Fichier  >  Importer un fichier  >  modPickPackLive.bas",
      "2. Débogage  >  Compiler VBAProject (aucun message = c'est bon)",
      "3. Fichier  >  Enregistrer sous  >  type « Classeur Excel prenant en charge les macros (.xlsm) »",
      "4. Mettre le .xlsm dans le dossier de pilotage.html (ou remplir dossier_sortie dans PARAMETRES)",
      "", "TOUS LES JOURS",
      "Alt+F8  >  DemarrerLive : export immédiat puis toutes les minutes.   ArreterLive : arrêt.   ExporterMaintenant : un seul export.",
      "Saisir la prévision du jour (prevu) et les rejets (rejets_jour) dans PARAMETRES.",
      "", "LES FEUILLES (les lignes d'exemple sont à remplacer par vos extractions Logys)",
      "PARAMETRES : horaires, pauses, seuils, prévision, rejets, sécurité.",
      "EQUIPE : un opérateur par ligne, présent OUI/NON, cadence en lignes par heure.",
      "TOURNEES : une tournée par ligne. Etat L = lancée, C = en cours, F = faite aujourd'hui.",
      "DECELEES : une erreur décelée par ligne (aujourd'hui + les 7 derniers jours pour le plan des allées).",
      "VAGUES, SERVICES : avancement des vagues et des autres préparations du site.",
      "HISTORIQUE : un jour travaillé par ligne, du plus ancien au plus récent (30 jours au moins).",
      "", "Garder les noms des feuilles, des tableaux et des colonnes : le module les cherche par leur nom."]
    for i, t in enumerate(lignes): ws.cell(row=6 + i, column=1, value=t).font = gras if t.isupper() or t.startswith(("MISE", "TOUS", "LES F")) else Font()
    ws.column_dimensions["A"].width = 16; ws.column_dimensions["B"].width = 90

    def feuille(nom, tbl, tetes, lignes, largeurs, texte=()):
        w = wb.create_sheet(nom)
        w.append(tetes)
        for l in lignes: w.append(list(l))
        if not lignes: w.append([None] * len(tetes))
        fin = max(2, len(lignes) + 1)
        t = Table(displayName=tbl, ref=f"A1:{get_column_letter(len(tetes))}{fin}")
        t.tableStyleInfo = TableStyleInfo(name="TableStyleMedium2", showRowStripes=True)
        w.add_table(t); w.freeze_panes = "A2"
        for i, L in enumerate(largeurs): w.column_dimensions[get_column_letter(i + 1)].width = L
        for c in texte:
            for r in range(2, fin + 1): w.cell(row=r, column=c).number_format = "@"
        return w
    w = feuille("PARAMETRES", "tblParam", ["Cle", "Valeur", "Explication"], PARAM, [22, 34, 90])
    for r in range(2, len(PARAM) + 2):
        c = w.cell(row=r, column=2); c.alignment = Alignment(horizontal="left")
        if w.cell(row=r, column=1).value == "dernier_accident": c.number_format = "dd/mm/yyyy"
        elif isinstance(c.value, str) and not c.value.startswith("="): c.number_format = "@"
        if w.cell(row=r, column=1).value in ("prevu", "rejets_jour"): c.fill = PatternFill("solid", fgColor="FFF2A8")
    feuille("EQUIPE", "tblEquipe", ["Matricule", "Role", "Present", "Sorti", "Revenu", "Coef", "Cadence"], EQUIPE, [12, 12, 10, 10, 10, 8, 10], texte=(1, 4, 5))
    feuille("TOURNEES", "tblTournees", ["Numero", "Etat", "Type", "Lignes", "Traitees", "Annulees", "Operateur", "Debut", "Fin", "Colis"], tournees(), [14, 7, 10, 9, 9, 9, 11, 10, 10, 8], texte=(1, 7, 8, 9))
    w = feuille("DECELEES", "tblDecelees", ["Date", "Matricule", "Type", "Allee"], [(f"=TODAY()-{j}" if j else "=TODAY()", m, t, a) for j, m, t, a in decelees()], [13, 12, 16, 8], texte=(2,))
    for r in range(2, w.max_row + 1): w.cell(row=r, column=1).number_format = "dd/mm/yyyy"
    feuille("VAGUES", "tblVagues", ["Heure", "Numero", "Lignes_prevues", "Lignes_preparees", "Ruptures"], VAGUES, [9, 12, 16, 18, 10], texte=(1, 2))
    feuille("SERVICES", "tblServices", ["Service", "Fait", "Restant"], SERVICES, [20, 10, 10])
    w = feuille("HISTORIQUE", "tblHisto", ["Date", "Prod", "PPM", "Rejets", "Decelees", "Lignes", "Ops"], [(f"=WORKDAY(TODAY(),-{k})",) + tuple(x) for k, *x in historique()], [13, 8, 8, 9, 10, 9, 7])
    for r in range(2, w.max_row + 1): w.cell(row=r, column=1).number_format = "dd/mm/yyyy"
    wb.save(chemin)

def donnees_test():
    """Même calcul que le module VBA, sur les lignes d'exemple : sert à tester la page."""
    rnd_s[0] = 7
    P = {k: v for k, v, _ in PARAM}; now = dt.datetime.now(); iso = lambda d: d.strftime("%Y-%m-%dT%H:%M:%S")
    T = tournees(); D = decelees(); H = historique()
    dh = lambda s: dt.datetime.combine(AUJ, dt.datetime.strptime(s, "%H:%M").time()) if s else None
    fait = restant = cont = 0; nb = {"F": 0, "L": 0, "C": 0}; heures = {}; tours = []
    for n, k, st, l, t, a, op, deb, fin, colis in T:
        nb[k] += 1
        if k == "F":
            lf = t if t > 0 else max(0, l - a); fait += lf; cont += colis or 0
            if fin: heures[dh(fin).hour] = heures.get(dh(fin).hour, 0) + lf
        else: restant += max(0, l - a - t)
        tours.append({"n": n, "k": k, "st": st, "l": l, "t": t, "a": a, "op": op, "deb": iso(dh(deb)) if deb else None})
    cnt = lambda rows, i: {str(k): sum(1 for r in rows if r[i] == k) for k in dict.fromkeys(r[i] for r in rows)}
    Dj = [r for r in D if r[0] == 0]; Dh = [r for r in D if r[0] < 7]
    al = lambda rows: {f"{int(k):02d}": v for k, v in cnt(rows, 3).items()}
    pauses = [[P[f"pause{i}_debut"], P[f"pause{i}_fin"]] for i in (1, 2, 3) if P[f"pause{i}_debut"] and P[f"pause{i}_fin"]]
    seuils = {k: P[k] for k in ("avance_stable", "retard_critique", "rej_orange", "rej_rouge", "dec_orange", "dec_rouge", "vig_orange", "vig_rouge", "obj_lignes_op", "obj_ppm_averee")}
    hist = [{"d": jo(k).isoformat(), "prod": p, "ppm": ppm, "rej": rej} for k, p, ppm, rej, dec, lig, ops in H]
    mois = [(jo(k), p, ppm, dec) for k, p, ppm, rej, dec, lig, ops in H if (jo(k).year, jo(k).month) == (AUJ.year, AUJ.month)]
    nm = max(1, len(mois)); avant = now.strftime("%H:%M") < P["fin_prevision"]
    return {"genere": iso(now), "jour": {"date": AUJ.isoformat(), "debut": P["debut"], "fin": P["fin"], "pauses": pauses},
      "params": {"heures_pointees": P["heures_pointees"], "cadence_defaut": P["cadence_defaut"], "fin_prevision": P["fin_prevision"]}, "seuils": seuils, "saisie": {"prevu": P["prevu"]},
      "equipe": [{"mat": m, "role": r, "present": p == "OUI", "sorti": s or None, "revenu": rv or None, "coef": c, "cadence": cad} for m, r, p, s, rv, c, cad in EQUIPE],
      "tours": tours, "rejets": P["rejets_jour"], "decelees": [{"mat": k, "n": v} for k, v in cnt(Dj, 1).items()], "hist": hist,
      "mois": {"nom": ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"][AUJ.month - 1], "prod": round(sum(m[1] for m in mois) / nm), "ppm": round(sum(m[2] for m in mois) / nm)},
      "dec_mois": [{"d": m[0].isoformat(), "n": m[3]} for m in mois],
      "pilotage": {"v": 1, "source": "EXCEL", "maj": iso(now),
        "cfg": {"site": P["site"], "debut": P["debut"], "finVisee": P["fin"], "pauses": pauses, "inclureALancer": True, "rejetsMax": P["rej_orange"], "decOrange": P["dec_orange"], "decRouge": P["dec_rouge"]},
        "charge": {"fait": fait, "restant": restant, "aLancer": max(0, P["prevu"] - fait - restant) if avant else 0, "contFaits": cont or None, "tourneesFaites": nb["F"], "tourneesOuvertes": nb["L"] + nb["C"], "tourneesLibres": nb["L"]},
        "heures": [{"h": h, "lignes": l} for h, l in heures.items()],
        "vagues": [{"heure": h, "num": n, "ligPrev": a, "ligPrep": b, "ligRupt": c} for h, n, a, b, c in VAGUES],
        "services": [{"lib": s, "fait": f, "restant": r} for s, f, r in SERVICES], "rejets": {"total": P["rejets_jour"]},
        "decelees": {"total": len(Dj), "types": cnt(Dj, 2), "allees": al(Dj), "hist": {"jours": 7, "total": len(Dh), "allees": al(Dh), "types": cnt(Dh, 2)}},
        "historique": [{"d": jo(k).isoformat(), "lignes": lig, "ops": ops, "ed": dec, "ea": round(ppm * lig / 1e6), "rejets": rej} for k, p, ppm, rej, dec, lig, ops in H],
        "securite": {"joursSansAccident": 187, "message": P["message_securite"]}}}

if __name__ == "__main__":
    classeur(sys.argv[1])
    if "--test" in sys.argv:
        d = sys.argv[sys.argv.index("--test") + 1]
        open(d + "/data.js", "w", encoding="utf-8").write("window.PP_DATA = " + json.dumps(donnees_test(), ensure_ascii=False) + ";\n")
