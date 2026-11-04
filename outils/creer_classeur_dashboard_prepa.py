#!/usr/bin/env python3
"""
Génère le classeur moteur du dashboard préparation CLR :
    dashboard_prepa/Dashboard_Prepa_CLR.xlsx

    python3 outils/creer_classeur_dashboard_prepa.py

Le classeur est ensuite ouvert dans Excel, le module VBA
dashboard_prepa/vba/modDashboardPrepa.bas importé (Alt+F11 > Fichier >
Importer), puis enregistré en .xlsm.

Onglets : PILOTAGE (saisie du jour + résultats), PARAMETRES (réglages
fixes), ZONES (ZONE_MVT -> service / zone), DONNEES (résultat Logys),
HISTO (une ligne par actualisation), REQUETES (modèle SQL), AIDE.

La requête Excel est lue dans dashboard_prepa/sql/requetes_prepa.sql
entre les marqueurs « >>> MODELE EXCEL » et « <<< MODELE EXCEL » : un
seul texte de référence pour SQL Developer et pour le classeur.
"""
from pathlib import Path
import re

from openpyxl import Workbook
from openpyxl.comments import Comment
from openpyxl.formatting.rule import CellIsRule, DataBarRule, FormulaRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.worksheet.properties import PageSetupProperties

RACINE = Path(__file__).resolve().parent.parent
SQL = RACINE / "dashboard_prepa" / "sql" / "requetes_prepa.sql"
SORTIE = RACINE / "dashboard_prepa" / "Dashboard_Prepa_CLR.xlsx"

# ── Réglages par défaut ────────────────────────────────────────────────
# Cadences à 100 % de quota (lignes / heure / opérateur)
#  · Pick : 620 lignes / 7,4 h (quota P&P, Suivi_Op_PP_OFFICIEL)
#  · HG / câble : 1 000 points / 7,4 h ÷ pondération de la ligne
#    (HG_Cable V17, onglet LISTES). L'équipe HG a fait 102 % du standard
#    sur janv.–juin 2026 (949 jours-opérateur, 6 798 h).
PTS_H = 1000 / 7.4
CADENCES = [
    # clé, cadence, pondération, source
    ("PICK", round(620 / 7.4, 1), None, "Quota P&P : 620 lignes / 7,4 h (Suivi_Op_PP_OFFICIEL)"),
    ("CÂBLE", round(PTS_H / 15.38, 1), 15.38, "1 000 pts / 7,4 h ÷ 15,38 pts par ligne (HG_Cable V17)"),
    ("SOL", round(PTS_H / 1.972, 1), 1.972,
     "Mix réel janv.–juin 2026 : couronne 1 · prépa/chauf./pann. 2,75 · gaine/plaf. 2 · éclair. 1,75 · volum./touret/1 m 3,5 · chauffe-eau 5,75 → 1,97 pt/ligne"),
    ("LONGUEUR 2M", round(PTS_H / 4, 1), 4, "1 000 pts / 7,4 h ÷ 4 pts par ligne"),
    ("LONGUEUR 3M", round(PTS_H / 3.25, 1), 3.25, "1 000 pts / 7,4 h ÷ 3,25 pts par ligne (long. 3 m + IRL)"),
    ("RÉTRACT", round(PTS_H / 9.6, 1), 9.6, "1 000 pts / 7,4 h ÷ 9,6 pts par ligne"),
    ("RÉTRACT LONGUEUR", round(PTS_H / 9.6, 1), 9.6, "1 000 pts / 7,4 h ÷ 9,6 pts par ligne (rétract long. + ext. + cuivre)"),
]
# Part de chaque zone dans le prévisionnel HG (hors câble) :
# suivi op HG janv.–juin 2026, 221 634 lignes HG, 103 jours.
ZONES_HG = [
    ("Sol", "SOL", 0.605),
    ("Longueur 2 m", "LONGUEUR 2M", 0.078),
    ("Longueur 3 m", "LONGUEUR 3M", 0.160),
    ("Rétract", "RÉTRACT", 0.110),
    ("Rétract longueur", "RÉTRACT LONGUEUR", 0.047),
]
# ZONE_MVT -> service / zone dashboard (macro d'import HG_Cable V17)
ZONES_MVT = (
    [(z, "HG", "SOL") for z in (
        "COURONNES", "COURONNE", "AEROSOLS", "BARDAGE", "PICK01A14", "CHAUFFAGE",
        "PREPARATEUR", "PANNEAUX", "HGAEMBALLER", "GAINES", "PLAFONNIERS",
        "ECLAIRAGE", "ECLAIRAGE2", "ECL3EMBALLAGE", "ECL4DEPISEDIR", "GAINESVENTIL",
        "TOUPRECOND", "COFFRETS", "ZPROMOS", "LONGUEUR1M", "CHAUFFEEAU", "VOLUMES")]
    + [(z, "HG", "LONGUEUR 2M") for z in ("LONGUEUR2M", "LG2DEPOSEDIR", "LG2EMBALLAGE")]
    + [(z, "HG", "LONGUEUR 3M") for z in ("LONGUEUR3M", "LG3ALLEE32", "IRL")]
    + [(z, "HG", "RÉTRACT") for z in ("ARETRACT", "RETRACT")]
    + [(z, "HG", "RÉTRACT LONGUEUR") for z in ("RETRACT3435", "EXTERIEUR", "TUBECUIVRE", "TUBE CUIVRE")]
    + [("CABLE", "CABLE", "CABLE")]
)
REMARQUES_ZONES = {
    "RETRACT": "À confirmer : la macro V17 (Module1) la classe en RÉTRACT HG, l'ancienne (Module3) en CÂBLE",
    "ECL4DEPISEDIR": "Orthographe reprise de la macro V17 (ECL4DEPOSEDIR ?)",
    "CABLE": "L'allée est lue dans l'emplacement (jeton COL_ALLEE)",
}

# Jetons de la requête : nom, valeur par défaut, rôle, forme attendue
JETONS = [
    ("SOURCE", "A_RENSEIGNER", "Table, vue ou jointure des lignes de préparation, avec un alias",
     "PROPRIETAIRE.TABLE l"),
    ("COL_ZONE", "ZONE_MVT", "Colonne zone (confirmée par l'extraction journalière HG)", "l.ZONE_MVT"),
    ("COL_ALLEE", None, "Allée câble tirée de l'emplacement. Vide = 'TOUTES' (une seule ligne "
     "câble). Une valeur qui commence par ' se tape avec deux '",
     "SUBSTR(l.EMPLACEMENT, 1, 2)"),
    ("COL_PREPA", "CAST(NULL AS VARCHAR2(1))", "Préparateur affecté (le NOM de l'extraction)", "l.NOM_PREPARATEUR"),
    ("COL_DATE_VALID", "A_RENSEIGNER", "Date + heure de validation de la ligne", "l.DATE_VALIDATION"),
    ("EXPR_NB_LIGNES", "1", "1 si un enregistrement = une ligne, sinon la colonne nb de lignes", "1"),
    ("COND_LANCE", "A_RENSEIGNER", "Condition : ligne lancée, pas encore prise", "l.STATUT = 'xx'"),
    ("COND_EN_COURS", "A_RENSEIGNER", "Condition : ligne prise par un préparateur, non validée", "l.STATUT = 'yy'"),
    ("COND_VALIDEE", "A_RENSEIGNER", "Condition : ligne validée, SANS filtre de date", "l.STATUT = 'zz'"),
    ("COND_RETRACT", "1 = 0", "Condition : ligne câble servie au rétract (1 = 0 : non suivi)",
     "l.NIVEAU_EMPLACEMENT > 0"),
    ("COND_PERIMETRE", "1 = 1", "Filtre site / dépôt / type (1 = 1 : aucun)", "l.CODE_DEPOT = 'xx'"),
]

# ── Styles ─────────────────────────────────────────────────────────────
POLICE = "Arial"
NOIR, BLANC, JAUNE = "111111", "FFFFFF", "FFD400"
F_BASE = Font(name=POLICE, size=10, color=NOIR)
F_TITRE = Font(name=POLICE, size=18, bold=True, color=NOIR)
F_SOUS = Font(name=POLICE, size=10, italic=True, color="5E6672")
F_BANDE = Font(name=POLICE, size=12, bold=True, color=JAUNE)
F_ENTETE = Font(name=POLICE, size=9, bold=True, color=BLANC)
F_SAISIE = Font(name=POLICE, size=10, bold=True, color="0000FF")
F_LIEN = Font(name=POLICE, size=10, color="008000")
F_GRAS = Font(name=POLICE, size=10, bold=True, color=NOIR)
F_AIDE = Font(name=POLICE, size=8, italic=True, color="7A808A")
F_KPI_LIB = Font(name=POLICE, size=8, bold=True, color="5E6672")
F_KPI = Font(name=POLICE, size=14, bold=True, color=NOIR)
F_MONO = Font(name="Consolas", size=9, color=NOIR)

R_BANDE = PatternFill("solid", fgColor="1B1E24")
R_ENTETE = PatternFill("solid", fgColor="3A3F48")
R_SAISIE = PatternFill("solid", fgColor="FFF4C2")
R_TOTAL = PatternFill("solid", fgColor="EDEFF2")
R_AIDE = PatternFill("solid", fgColor="F6F7F9")
R_KPI = PatternFill("solid", fgColor="F6F7F9")

FIN = Side(style="thin", color="D5D9DF")
BORD = Border(left=FIN, right=FIN, top=FIN, bottom=FIN)
HAUT_EPAIS = Border(top=Side(style="medium", color="1B1E24"), bottom=FIN, left=FIN, right=FIN)

AL_C = Alignment(horizontal="center", vertical="center", wrap_text=True)
AL_G = Alignment(horizontal="left", vertical="center", wrap_text=False)
AL_GW = Alignment(horizontal="left", vertical="top", wrap_text=True)
AL_D = Alignment(horizontal="right", vertical="center")

FMT_LIG = "#,##0"
FMT_H = "hh:mm"
FMT_DT = "dd/mm hh:mm"
FMT_DEC = "0.0"
FMT_PCT = "0%"
FMT_PCT1 = "0.0%"

STATUTS = {  # texte -> (fond, police)
    "FACILE": ("D7F2E0", "1E7B45"), "OK": ("D7F2E0", "1E7B45"),
    "TENDU": ("FFE6CC", "B35900"), "RÉÉQUILIBRER": ("FFE6CC", "B35900"),
    "COMPLIQUÉ": ("FADBD8", "B3261E"), "RETARD": ("FADBD8", "B3261E"),
    "NON COUVERTE": ("FADBD8", "B3261E"), "PRÉVOIR CARISTE": ("FADBD8", "B3261E"),
    "TERMINÉ": ("DCEBFF", "1F5FBF"),
}


def nom(wb, n, ref):
    wb.defined_names[n] = DefinedName(n, attr_text=ref)


def cellule(ws, ref, val=None, font=F_BASE, fill=None, fmt=None, al=None, border=None):
    c = ws[ref]
    if val is not None:
        c.value = val
    c.font = font
    if fill:
        c.fill = fill
    if fmt:
        c.number_format = fmt
    if al:
        c.alignment = al
    if border:
        c.border = border
    return c


def bande(ws, ligne, texte, col1="B", col2="T"):
    ws.merge_cells(f"{col1}{ligne}:{col2}{ligne}")
    cellule(ws, f"{col1}{ligne}", texte, F_BANDE, R_BANDE, al=AL_G)
    ws.row_dimensions[ligne].height = 24


def entetes(ws, ligne, cols_textes, hauteur=30):
    for col, t in cols_textes:
        cellule(ws, f"{col}{ligne}", t, F_ENTETE, R_ENTETE, al=AL_C, border=BORD)
    ws.row_dimensions[ligne].height = hauteur


def regles_statut(ws, plage):
    for txt, (fond, police) in STATUTS.items():
        ws.conditional_formatting.add(plage, CellIsRule(
            operator="equal", formula=[f'"{txt}"'],
            fill=PatternFill("solid", fgColor=fond),
            font=Font(name=POLICE, bold=True, color=police)))


def modele_sql():
    txt = SQL.read_text(encoding="utf-8")
    m = re.search(r"-- >>> MODELE EXCEL[^\n]*\n(.*?)\n-- <<< MODELE EXCEL", txt, re.S)
    if not m:
        raise SystemExit("Marqueurs MODELE EXCEL introuvables dans requetes_prepa.sql")
    lignes = [l.rstrip() for l in m.group(1).splitlines() if not l.strip().startswith("--")]
    return "\n".join(lignes).rstrip().rstrip(";").rstrip()


# ═══════════════════════════════════════════════════════════════════════
#  Plan de l'onglet PILOTAGE
# ═══════════════════════════════════════════════════════════════════════
SYN = {"PICK": 11, "CABLE": 12, "HG": 13}            # lignes de synthèse
PICK_L = 17                                            # ligne unique pick
CAB_1, CAB_N, CAB_RETR, CAB_TOT = 21, 32, 33, 34       # câble : 12 allées
HG_1, HG_N, HG_TOT = 38, 45, 46                        # HG : 8 zones
DON_1, DON_N = 7, 506                                  # DONNEES : 500 lignes
ZON_1, ZON_N = 5, 300                                  # ZONES
P_DEB_L1, P_DEB_LN = 44, 47                            # pauses


def formules_zone(ws, r, svc, cle_cadence, avenir):
    """Écrit les formules d'une ligne de zone (colonnes D à P)."""
    s = SYN[svc]
    cle = f"$C{r}"
    vide = f'$C{r}=""'

    def somme(statut, man):
        return (f'=IF({vide},"",IF(${man}{r}<>"",${man}{r},'
                f'SUMIFS(D_NB,D_SERV,"{svc}",D_DASH,{cle},D_STATUT,"{statut}")))')

    pause = (f"SUMPRODUCT((P_DEB>=MOD(H_CALC,1))*(P_DEB<MOD(H_CALC,1)+K{r}/I{r}/24)*P_DUR)")
    f = {
        "D": somme("LANCE", "R"),
        "E": somme("EN_COURS", "S"),
        "F": somme("PREPAREE", "T"),
        "G": avenir,
        "H": f'=IF({vide},"",SUM(D{r},E{r},G{r}))',
        "J": (f'=IF({vide},"",IFERROR(ROUND(INDEX(CAD_VAL,MATCH({cle_cadence},CAD_KEY,0))'
              f'*RENDEMENT,1),""))'),
        "K": f'=IF({vide},"",IF(N(J{r})>0,H{r}/J{r},""))',
        "L": (f'=IF({vide},"",IF(H{r}=0,"Terminé",IF(N(I{r})<=0,"Non couverte",'
              f'IF(NOT(ISNUMBER(K{r})),"Cadence ?",H_CALC+K{r}/I{r}/24+{pause}))))'),
        "M": (f'=IF({vide},"",IF(H{r}=0,"TERMINÉ",IF(N(I{r})<=0,"NON COUVERTE",'
              f'IF(NOT(ISNUMBER(L{r})),"?",IF(L{r}>$R${s},"RETARD",'
              f'IF(L{r}>$R${s}-SEUIL_TENDU/1440,"TENDU","OK"))))))'),
        "N": (f'=IF({vide},"",IF(H{r}=0,0,IF($S${s}<=0,"Dépassée",'
              f'IF(NOT(ISNUMBER(K{r})),"",ROUNDUP(K{r}/$S${s}*2,0)/2))))'),
        "O": f'=IF(ISNUMBER(N{r}),MAX(0,N{r}-N(I{r})),"")',
        "P": f'=IF({vide},"",SUMIFS(D_PREPA,D_SERV,"{svc}",D_DASH,{cle},D_STATUT,"EN_COURS"))',
    }
    fmts = {"D": FMT_LIG, "E": FMT_LIG, "F": FMT_LIG, "G": FMT_LIG, "H": FMT_LIG, "J": FMT_DEC,
            "K": FMT_DEC, "L": FMT_H, "N": "0.0", "O": "0.0", "P": "0"}
    for col, formule in f.items():
        c = cellule(ws, f"{col}{r}", formule, F_BASE, fmt=fmts.get(col), border=BORD,
                    al=AL_C if col in "LM" else AL_D)
        if col == "H":
            c.font = F_GRAS
    for col in "IRST":
        cellule(ws, f"{col}{r}", None, F_SAISIE, R_SAISIE, fmt="0.0" if col == "I" else FMT_LIG,
                border=BORD, al=AL_D)
    ws[f"B{r}"].border = BORD
    ws[f"C{r}"].border = BORD
    ws[f"Q{r}"].value = None


def creer():
    wb = Workbook()
    wb.remove(wb.active)
    pil = wb.create_sheet("PILOTAGE")
    par = wb.create_sheet("PARAMETRES")
    zon = wb.create_sheet("ZONES")
    don = wb.create_sheet("DONNEES")
    his = wb.create_sheet("HISTO")
    req = wb.create_sheet("REQUETES")
    aid = wb.create_sheet("AIDE")
    for ws in wb.worksheets:
        ws.sheet_view.showGridLines = False
        ws.sheet_properties.tabColor = {"PILOTAGE": JAUNE, "PARAMETRES": "3A3F48",
                                        "AIDE": "4C9AFF"}.get(ws.title, "98A0AC")

    # ─────────────────────────── PARAMETRES ────────────────────────────
    ws = par
    for col, w in {"A": 2, "B": 30, "C": 22, "D": 18, "E": 70}.items():
        ws.column_dimensions[col].width = w
    cellule(ws, "B2", "PARAMÈTRES — réglages fixes du dashboard", F_TITRE)
    cellule(ws, "B3", "Cellules jaunes = à ajuster. Les valeurs de départ et leur source sont "
            "indiquées à droite.", F_SOUS)

    bande(ws, 4, "1 · RÉPARTITION DU PRÉVISIONNEL ENTRE SERVICES", "B", "E")
    entetes(ws, 5, [("B", "Service"), ("C", "Part du prévi"), ("D", ""), ("E", "Source")])
    for i, (lib, n, v) in enumerate([("Pick", "PART_PICK", 0.73), ("Câble", "PART_CABLE", 0.04),
                                     ("Hors gabarit", "PART_HG", 0.23)]):
        r = 6 + i
        cellule(ws, f"B{r}", lib, F_GRAS, border=BORD)
        cellule(ws, f"C{r}", v, F_SAISIE, R_SAISIE, FMT_PCT1, AL_D, BORD)
        cellule(ws, f"E{r}", "Découpage de départ donné par le superviseur ; à remplacer par la "
                "requête Q7 (analyse prépa)", F_AIDE, al=AL_G)
        nom(wb, n, f"PARAMETRES!$C${r}")
    cellule(ws, "B9", "Total (doit faire 100 %)", F_GRAS, R_TOTAL, border=BORD)
    cellule(ws, "C9", "=SUM(C6:C8)", F_GRAS, R_TOTAL, FMT_PCT1, AL_D, BORD)
    cellule(ws, "D9", '=IF(ROUND(C9,3)=1,"✓","≠ 100 %")', F_GRAS, R_TOTAL, al=AL_C, border=BORD)

    bande(ws, 11, "2 · CADENCES MOYENNES PAR OPÉRATEUR ET PAR ZONE", "B", "E")
    entetes(ws, 12, [("B", "Zone (clé)"), ("C", "Lignes / heure / opérateur"),
                     ("D", "Pondération HG (pts / ligne)"), ("E", "Calcul et source")], 32)
    for i in range(10):
        r = 13 + i
        if i < len(CADENCES):
            k, v, p, src = CADENCES[i]
        else:
            k, v, p, src = None, None, None, "Zone à ajouter : même nom que dans PILOTAGE (colonne C)"
        cellule(ws, f"B{r}", k, F_GRAS, R_SAISIE if k is None else None, border=BORD)
        cellule(ws, f"C{r}", v, F_SAISIE, R_SAISIE, FMT_DEC, AL_D, BORD)
        cellule(ws, f"D{r}", p, F_BASE, fmt="0.00", al=AL_D, border=BORD)
        cellule(ws, f"E{r}", src, F_AIDE, al=AL_G)
    nom(wb, "CAD_KEY", "PARAMETRES!$B$13:$B$22")
    nom(wb, "CAD_VAL", "PARAMETRES!$C$13:$C$22")
    cellule(ws, "B23", "Rendement équipe du jour", F_GRAS, border=BORD)
    cellule(ws, "C23", 1, F_SAISIE, R_SAISIE, "0%", AL_D, BORD)
    cellule(ws, "E23", "Multiplie toutes les cadences. 100 % = standard ; l'équipe HG a fait "
            "102 % sur janv.–juin 2026. Baisser un jour à forte part d'intérimaires.", F_AIDE, al=AL_G)
    nom(wb, "RENDEMENT", "PARAMETRES!$C$23")

    bande(ws, 25, "3 · DÉCOUPAGE DU PRÉVISIONNEL HORS GABARIT PAR ZONE", "B", "E")
    entetes(ws, 26, [("B", "Zone HG (clé)"), ("C", "Part du prévi HG"), ("D", ""), ("E", "Source")])
    for i in range(8):
        r = 27 + i
        k, v = (ZONES_HG[i][1], ZONES_HG[i][2]) if i < len(ZONES_HG) else (None, None)
        cellule(ws, f"B{r}", k, F_GRAS, R_SAISIE if k is None else None, border=BORD)
        cellule(ws, f"C{r}", v, F_SAISIE, R_SAISIE, FMT_PCT1, AL_D, BORD)
        if i == 0:
            cellule(ws, f"E{r}", "Suivi op HG (HG_Cable V17), janv.–juin 2026 : 221 634 lignes HG "
                    "hors câble sur 103 jours", F_AIDE, al=AL_G)
    nom(wb, "HG_PART_KEY", "PARAMETRES!$B$27:$B$34")
    nom(wb, "HG_PART_VAL", "PARAMETRES!$C$27:$C$34")
    cellule(ws, "B35", "Total (doit faire 100 %)", F_GRAS, R_TOTAL, border=BORD)
    cellule(ws, "C35", "=SUM(C27:C34)", F_GRAS, R_TOTAL, FMT_PCT1, AL_D, BORD)
    cellule(ws, "D35", '=IF(ROUND(C35,3)=1,"✓","≠ 100 %")', F_GRAS, R_TOTAL, al=AL_C, border=BORD)

    bande(ws, 37, "4 · HORAIRES", "B", "E")
    entetes(ws, 38, [("B", "Heure de fin visée"), ("C", "Heure"), ("D", ""), ("E", "Note")])
    for i, (lib, n) in enumerate([("Pick", "CIBLE_PICK"), ("Câble", "CIBLE_CABLE"),
                                  ("Hors gabarit", "CIBLE_HG")]):
        r = 39 + i
        cellule(ws, f"B{r}", lib, F_GRAS, border=BORD)
        cellule(ws, f"C{r}", 20 / 24, F_SAISIE, R_SAISIE, FMT_H, AL_D, BORD)
        cellule(ws, f"E{r}", "À ajuster : fin de poste ou dernier départ camion du service",
                F_AIDE, al=AL_G)
        nom(wb, n, f"PARAMETRES!$C${r}")
    entetes(ws, 43, [("B", "Pause (libellé)"), ("C", "Début"), ("D", "Durée"), ("E", "Note")])
    for r in range(P_DEB_L1, P_DEB_LN + 1):
        cellule(ws, f"B{r}", None, F_SAISIE, R_SAISIE, border=BORD)
        cellule(ws, f"C{r}", None, F_SAISIE, R_SAISIE, FMT_H, AL_D, BORD)
        cellule(ws, f"D{r}", None, F_SAISIE, R_SAISIE, "[h]:mm", AL_D, BORD)
    cellule(ws, f"E{P_DEB_L1}", "Ex. : Pause matin · 09:30 · 0:20. Une pause qui tombe avant "
            "l'heure de fin estimée la repousse d'autant.", F_AIDE, al=AL_G)
    nom(wb, "P_DEB", f"PARAMETRES!$C${P_DEB_L1}:$C${P_DEB_LN}")
    nom(wb, "P_DUR", f"PARAMETRES!$D${P_DEB_L1}:$D${P_DEB_LN}")

    bande(ws, 49, "5 · SEUILS", "B", "E")
    seuils = [("Marge mini pour « FACILE » (min)", "SEUIL_TENDU", 30, "0",
               "Marge ≥ seuil : FACILE · entre 0 et le seuil : TENDU · négative : COMPLIQUÉ"),
              ("Rétract câble : alerte à partir de (lignes)", "SEUIL_RETRACT", 10, "0",
               "Lignes rétract câble lancées + en cours → « PRÉVOIR CARISTE »"),
              ("Écran TV : données périmées après (min)", "PERIME_MIN", 15, "0",
               "Au-delà, l'écran affiche un bandeau « données non actualisées »")]
    for i, (lib, n, v, fmt, note) in enumerate(seuils):
        r = 50 + i
        cellule(ws, f"B{r}", lib, F_GRAS, border=BORD)
        cellule(ws, f"C{r}", v, F_SAISIE, R_SAISIE, fmt, AL_D, BORD)
        cellule(ws, f"E{r}", note, F_AIDE, al=AL_G)
        nom(wb, n, f"PARAMETRES!$C${r}")

    bande(ws, 54, "6 · CONNEXION LOGYS ET EXPORT VERS L'ÉCRAN TV", "B", "E")
    cnx = [("DSN ODBC Logys", "CFG_DSN", "A_RENSEIGNER",
            "Nom de la source ODBC Oracle déjà configurée sur le poste (Sources de données ODBC)"),
           ("Utilisateur (facultatif)", "CFG_UID", None,
            "Vide si le DSN le contient. Le mot de passe est demandé par la fenêtre ODBC, jamais écrit"),
           ("Actualisation auto (minutes)", "CFG_INTERVALLE", 5, "Entre 2 et 15 conseillé"),
           ("Dossier d'export", "CFG_DOSSIER", None,
            "Dossier partagé où se trouve index.html (ex. \\\\serveur\\partage\\Dashboard). "
            "Vide = dossier du classeur"),
           ("Fichier de données", "CFG_FICHIER", "donnees_dashboard.js", "Nom attendu par index.html"),
           ("Nom du site", "CFG_SITE", "CLR Champigneulles", "Affiché en haut de l'écran")]
    for i, (lib, n, v, note) in enumerate(cnx):
        r = 55 + i
        cellule(ws, f"B{r}", lib, F_GRAS, border=BORD)
        cellule(ws, f"C{r}", v, F_SAISIE, R_SAISIE, al=AL_G, border=BORD)
        ws.merge_cells(f"C{r}:D{r}")
        cellule(ws, f"E{r}", note, F_AIDE, al=AL_G)
        nom(wb, n, f"PARAMETRES!$C${r}")

    bande(ws, 62, "7 · PARAMÉTRAGE DE LA REQUÊTE LOGYS (jetons &&… du modèle SQL)", "B", "E")
    entetes(ws, 63, [("B", "Jeton"), ("C", "Valeur (SQL Oracle)"), ("D", "Forme attendue"),
                     ("E", "Rôle")])
    for i, (jet, val, role, forme) in enumerate(JETONS):
        r = 64 + i
        cellule(ws, f"B{r}", jet, Font(name="Consolas", size=10, bold=True), border=BORD)
        cellule(ws, f"C{r}", val, Font(name="Consolas", size=10, bold=True, color="0000FF"),
                R_SAISIE, al=AL_G, border=BORD)
        cellule(ws, f"D{r}", forme, Font(name="Consolas", size=8, color="7A808A"), al=AL_G,
                border=BORD)
        cellule(ws, f"E{r}", role, F_AIDE, al=AL_G)
    nom(wb, "CFG_SQL", f"PARAMETRES!$B$64:$C${63 + len(JETONS)}")
    r = 64 + len(JETONS) + 1
    cellule(ws, f"B{r}", "Valeurs à trouver avec sql/00_decouverte_schema.sql. Le jeton "
            "ZONES_CABLE est calculé tout seul depuis l'onglet ZONES. Mêmes valeurs que les "
            "DEFINE de sql/requetes_prepa.sql.", F_AIDE)
    ws.freeze_panes = "A4"

    # ───────────────────────────── ZONES ───────────────────────────────
    ws = zon
    for col, w in {"A": 20, "B": 12, "C": 22, "D": 80}.items():
        ws.column_dimensions[col].width = w
    cellule(ws, "A1", "ZONES — ZONE_MVT Logys → service et zone du dashboard", F_TITRE)
    cellule(ws, "A2", "Une zone Logys absente de la liste compte en PICK et est ajoutée ici "
            "automatiquement avec « À VÉRIFIER ». Services : PICK, CABLE, HG. Zone dashboard HG : "
            "même clé que PILOTAGE colonne C (SOL, LONGUEUR 2M…).", F_SOUS)
    entetes(ws, 4, [("A", "ZONE_MVT"), ("B", "SERVICE"), ("C", "ZONE DASHBOARD"),
                    ("D", "REMARQUE")], 22)
    for i in range(ZON_N - ZON_1 + 1):
        r = ZON_1 + i
        z = ZONES_MVT[i] if i < len(ZONES_MVT) else (None, None, None)
        cellule(ws, f"A{r}", z[0], Font(name="Consolas", size=10, bold=True), fmt="@", border=BORD)
        cellule(ws, f"B{r}", z[1], F_SAISIE, border=BORD, al=AL_C)
        cellule(ws, f"C{r}", z[2], F_SAISIE, border=BORD)
        cellule(ws, f"D{r}", REMARQUES_ZONES.get(z[0]) if z[0] else None, F_AIDE, border=BORD)
    dv = DataValidation(type="list", formula1='"PICK,CABLE,HG"', allow_blank=True)
    ws.add_data_validation(dv)
    dv.add(f"B{ZON_1}:B{ZON_N}")
    ws.conditional_formatting.add(f"A{ZON_1}:D{ZON_N}", FormulaRule(
        formula=[f'LEFT($D{ZON_1},10)="À VÉRIFIER"'], fill=PatternFill("solid", fgColor="FFE6CC")))
    ws.freeze_panes = "A5"
    nom(wb, "Z_MVT", f"ZONES!$A${ZON_1}:$A${ZON_N}")
    nom(wb, "Z_SERV", f"ZONES!$B${ZON_1}:$B${ZON_N}")
    nom(wb, "Z_DASH", f"ZONES!$C${ZON_1}:$C${ZON_N}")

    # ──────────────────────────── DONNEES ──────────────────────────────
    ws = don
    for col, w in {"A": 20, "B": 14, "C": 12, "D": 10, "E": 12, "F": 12, "G": 10, "H": 20,
                   "I": 10}.items():
        ws.column_dimensions[col].width = w
    cellule(ws, "A1", "DONNÉES — résultat de la requête Logys (écrit par la macro)", F_TITRE)
    cellule(ws, "A2", "Horodatage", F_GRAS)
    cellule(ws, "B2", None, F_GRAS, fmt="dd/mm/yyyy hh:mm:ss", al=AL_G)
    cellule(ws, "A3", "Source", F_GRAS)
    cellule(ws, "B3", None, F_GRAS, al=AL_G)
    cellule(ws, "A4", "Dernier message", F_GRAS)
    cellule(ws, "B4", None, F_BASE, al=AL_G)
    nom(wb, "MAJ_DONNEES", "DONNEES!$B$2")
    nom(wb, "SOURCE_DONNEES", "DONNEES!$B$3")
    nom(wb, "STATUT_MAJ", "DONNEES!$B$4")
    entetes(ws, 6, [("A", "ZONE_MVT"), ("B", "ALLEE"), ("C", "STATUT"), ("D", "RETRACT"),
                    ("E", "NB_LIGNES"), ("F", "NB_PREPA"), ("G", "SERVICE"),
                    ("H", "ZONE DASHBOARD"), ("I", "ZONE CONNUE")], 22)
    for r in range(DON_1, DON_N + 1):
        ws[f"A{r}"].number_format = "@"
        ws[f"B{r}"].number_format = "@"
        ws[f"G{r}"] = (f'=IF($A{r}="","",IFERROR(IF(INDEX(Z_SERV,MATCH($A{r},Z_MVT,0))&""="",'
                       f'"PICK",INDEX(Z_SERV,MATCH($A{r},Z_MVT,0))&""),"PICK"))')
        ws[f"H{r}"] = (f'=IF($A{r}="","",IF($G{r}="CABLE",$B{r},IF($G{r}="PICK","PICK",'
                       f'IFERROR(INDEX(Z_DASH,MATCH($A{r},Z_MVT,0))&"","?"))))')
        ws[f"I{r}"] = f'=IF($A{r}="","",IF(ISNUMBER(MATCH($A{r},Z_MVT,0)),"OUI","NON"))'
        for col in "ABCDEFGHI":
            ws[f"{col}{r}"].font = F_BASE
    ws.freeze_panes = "A7"
    for n, col in {"D_ZONE": "A", "D_ALLEE": "B", "D_STATUT": "C", "D_RETR": "D", "D_NB": "E",
                   "D_PREPA": "F", "D_SERV": "G", "D_DASH": "H", "D_CONNUE": "I"}.items():
        nom(wb, n, f"DONNEES!${col}${DON_1}:${col}${DON_N}")

    # ───────────────────────────── HISTO ───────────────────────────────
    ws = his
    cellule(ws, "A1", "HISTORIQUE — une ligne par actualisation (courbe et tendance de l'écran TV)",
            F_TITRE)
    cellule(ws, "A2", "Écrit par la macro. Les fins sont des dates-heures (ou un texte : "
            "Terminé, Non couverte).", F_SOUS)
    entetes(ws, 4, [("A", "Horodatage"), ("B", "Pick reste"), ("C", "Pick fin"),
                    ("D", "Pick statut"), ("E", "Câble reste"), ("F", "Câble fin"),
                    ("G", "Câble statut"), ("H", "HG reste"), ("I", "HG fin"), ("J", "HG statut"),
                    ("K", "Prévi")], 22)
    for col, w in zip("ABCDEFGHIJK", (17, 11, 11, 13, 11, 11, 13, 11, 11, 13, 10)):
        ws.column_dimensions[col].width = w
    ws.freeze_panes = "A5"

    # ──────────────────────────── REQUETES ─────────────────────────────
    ws = req
    ws.column_dimensions["A"].width = 2
    ws.column_dimensions["B"].width = 140
    cellule(ws, "B2", "REQUÊTES — modèle SQL Logys utilisé par la macro", F_TITRE)
    cellule(ws, "B3", "Les jetons &&NOM sont remplacés par les valeurs de PARAMETRES (bloc 7). "
            "Texte identique à Q6 de sql/requetes_prepa.sql. Pas de point-virgule final (ODBC).",
            F_SOUS)
    cellule(ws, "B4", "Modèle", F_GRAS)
    cellule(ws, "B5", modele_sql(), F_MONO, R_AIDE, al=AL_GW)
    ws.row_dimensions[5].height = 409
    cellule(ws, "B7", "Dernière requête envoyée à Logys (écrite par la macro, pour contrôle)",
            F_GRAS)
    cellule(ws, "B8", None, F_MONO, R_AIDE, al=AL_GW)
    ws.row_dimensions[8].height = 300
    nom(wb, "SQL_MODELE", "REQUETES!$B$5")
    nom(wb, "SQL_GENERE", "REQUETES!$B$8")

    # ──────────────────────────── PILOTAGE ─────────────────────────────
    ws = pil
    largeurs = {"A": 2, "B": 24, "C": 13, "D": 11, "E": 11, "F": 11, "G": 11, "H": 11, "I": 11,
                "J": 11, "K": 11, "L": 12, "M": 15, "N": 11, "O": 11, "P": 30, "Q": 2, "R": 11,
                "S": 11, "T": 11, "U": 11, "V": 11}
    for col, w in largeurs.items():
        ws.column_dimensions[col].width = w
    cellule(ws, "B2", "PILOTAGE PRÉPARATION — PICK · CÂBLE · HORS GABARIT", F_TITRE)
    cellule(ws, "B3", "Jaune = à saisir (prévisionnel, opérateurs par zone). Le reste se calcule. "
            "La synthèse est ce qu'affiche l'écran TV. Valeurs d'exemple à remplacer.", F_SOUS)
    ws.row_dimensions[4].height = 30
    cellule(ws, "B4", "Boutons : lancer une fois la macro InstallerBoutons (Alt+F8).", F_AIDE)

    kpis = [
        ("B", "PRÉVISIONNEL LIGNES DU JOUR", 9000, F_SAISIE, R_SAISIE, FMT_LIG),
        ("D", "HEURE DE CALCUL", "=IF(N(MAJ_DONNEES)=0,NOW(),MAJ_DONNEES)", F_KPI, R_KPI, FMT_DT),
        ("F", "DONNÉES", '=IF(N(MAJ_DONNEES)=0,"aucune — saisie",SOURCE_DONNEES&" "'
                         '&TEXT(MAJ_DONNEES,"hh:mm"))', F_KPI, R_KPI, None),
        ("I", "RENDEMENT ÉQUIPE", "=RENDEMENT", Font(name=POLICE, size=14, bold=True,
                                                    color="008000"), R_KPI, "0%"),
        ("K", "ZONES LOGYS À VÉRIFIER", f'=COUNTIF(ZONES!$D${ZON_1}:$D${ZON_N},"À VÉRIFIER*")',
         F_KPI, R_KPI, "0"),
        ("M", "LIGNES NON VENTILÉES",
         '=MAX(0,SUMIFS(D_NB,D_STATUT,"LANCE")+SUMIFS(D_NB,D_STATUT,"EN_COURS")'
         '-SUM($D$11:$E$13))', F_KPI, R_KPI, FMT_LIG),
    ]
    for col, lib, val, font, fill, fmt in kpis:
        col2 = chr(ord(col) + 1)
        ws.merge_cells(f"{col}6:{col2}6")
        ws.merge_cells(f"{col}7:{col2}7")
        cellule(ws, f"{col}6", lib, F_KPI_LIB, fill, al=AL_G)
        c = cellule(ws, f"{col}7", val, font, fill, fmt, AL_G)
        if col == "B":
            c.font = Font(name=POLICE, size=14, bold=True, color="0000FF")
    ws.row_dimensions[7].height = 26
    nom(wb, "PREVI", "PILOTAGE!$B$7")
    nom(wb, "H_CALC", "PILOTAGE!$D$7")
    nom(wb, "NB_ZONES_VERIF", "PILOTAGE!$K$7")
    nom(wb, "NON_VENTILEES", "PILOTAGE!$M$7")
    ws["M6"].comment = Comment("Lignes lancées + en cours renvoyées par Logys qui ne tombent dans "
                               "aucune ligne des tableaux (allée câble absente, zone HG sans "
                               "ligne…). Doit rester à 0.", "Dashboard")

    # Synthèse
    bande(ws, 9, "SYNTHÈSE — ce qu'affiche l'écran TV", "B", "V")
    entetes(ws, 10, [("B", "Service"), ("C", "Reste à faire"), ("D", "Lancées"),
                     ("E", "En cours"), ("F", "À venir (prévi)"), ("G", "Préparées"),
                     ("H", "Opérateurs"), ("I", "Fin estimée"), ("J", "Fin si rééquilibrage"),
                     ("K", "Heure visée"), ("L", "Marge (min)"), ("M", "Statut"),
                     ("N", "Renfort (+ op.)"), ("O", "Avancement"), ("P", "Message"),
                     ("R", "Visée (date)"), ("S", "Temps dispo (h)"), ("T", "Zone non couverte"),
                     ("U", "Charge (h·op)"), ("V", "Prépa. vus Logys")], 32)
    services = [("PICK", "Pick", "CIBLE_PICK", PICK_L, PICK_L, PICK_L),
                ("CABLE", "Câble", "CIBLE_CABLE", CAB_1, CAB_N, CAB_TOT),
                ("HG", "Hors gabarit", "CIBLE_HG", HG_1, HG_N, HG_TOT)]
    for svc, lib, cible, a, b, t in services:
        s = SYN[svc]
        pause = f"SUMPRODUCT((P_DEB>=MOD(H_CALC,1))*(P_DEB<MOD(H_CALC,1)+U{s}/H{s}/24)*P_DUR)"
        f = {
            "B": lib,
            "C": f"=N(H{t})", "D": f"=N(D{t})", "E": f"=N(E{t})", "F": f"=N(G{t})",
            "G": f"=N(F{t})", "H": f"=N(I{t})",
            "I": (f'=IF(C{s}=0,"Terminé",IF(T{s}<>"","Non couverte",'
                  f'IF(COUNT(L{a}:L{b})=0,"?",MAX(L{a}:L{b}))))'),
            "J": (f'=IF(C{s}=0,"Terminé",IF(H{s}<=0,"Aucun opérateur",IF(U{s}<=0,"?",'
                  f'H_CALC+U{s}/H{s}/24+{pause})))'),
            "K": f"={cible}",
            "L": f'=IF(ISNUMBER(I{s}),ROUND((R{s}-I{s})*1440,0),"")',
            "M": (f'=IF(C{s}=0,"TERMINÉ",IF(NOT(ISNUMBER(I{s})),"COMPLIQUÉ",'
                  f'IF(L{s}<0,"COMPLIQUÉ",IF(L{s}<SEUIL_TENDU,"TENDU","FACILE"))))'),
            "N": f'=IF(C{s}=0,0,IF(S{s}<=0,"Visée dépassée",MAX(0,ROUNDUP(U{s}/S{s}-H{s},0))))',
            "O": f'=IF(G{s}+C{s}=0,"",G{s}/(G{s}+C{s}))',
            "P": (f'=IF(M{s}="TERMINÉ","Service terminé",IF(ISNUMBER(N{s}),'
                  f'IF(N{s}>0,"Renfort +"&N{s}&" opérateur(s) pour finir à "&TEXT(K{s},"hh:mm"),'
                  f'IF(T{s}<>"","Zone sans opérateur : "&T{s},'
                  f'IF(M{s}="FACILE","Marge "&INT(L{s}/60)&" h "&TEXT(MOD(L{s},60),"00"),'
                  f'"Rééquilibrer les opérateurs entre zones"))),"Heure visée dépassée"))'),
            "R": f"=INT(H_CALC)+K{s}",
            "S": (f"=MAX(0,(R{s}-H_CALC)*24-SUMPRODUCT((P_DEB>=MOD(H_CALC,1))*(P_DEB<K{s})"
                  f"*P_DUR)*24)"),
            "T": f'=IFERROR(INDEX(B{a}:B{b},MATCH("NON COUVERTE",M{a}:M{b},0)),"")',
            "U": f"=N(K{t})",
            "V": f"=N(P{t})",
        }
        fmts = {"C": FMT_LIG, "D": FMT_LIG, "E": FMT_LIG, "F": FMT_LIG, "G": FMT_LIG,
                "H": "0.0", "I": FMT_H, "J": FMT_H, "K": FMT_H, "L": "+0;-0;0", "N": "0",
                "O": FMT_PCT, "R": FMT_DT, "S": FMT_DEC, "U": FMT_DEC, "V": "0"}
        for col, v in f.items():
            font = F_GRAS if col in "BCIMN" else F_BASE
            if col in "RSTUV":
                font = F_AIDE
            if col == "K":
                font = F_LIEN
            cellule(ws, f"{col}{s}", v, font, fmt=fmts.get(col), border=BORD,
                    al=AL_G if col in "BP" else (AL_C if col in "IJKLMN" else AL_D))
        ws.row_dimensions[s].height = 24
        nom(wb, f"SYN_{svc}", f"PILOTAGE!$B${s}:$V${s}")
    regles_statut(ws, "M11:M13")
    ws.conditional_formatting.add("O11:O13", DataBarRule(start_type="num", start_value=0,
                                                         end_type="num", end_value=1,
                                                         color="FFD400"))
    ws.conditional_formatting.add("N11:N13", CellIsRule(
        operator="greaterThan", formula=["0"], fill=PatternFill("solid", fgColor="FADBD8"),
        font=Font(name=POLICE, bold=True, color="B3261E")))

    entete_zones = [("B", "Zone"), ("C", "Clé / code Logys"), ("D", "Lancées"),
                    ("E", "En cours"), ("F", "Préparées (jour)"), ("G", "À venir (prévi)"),
                    ("H", "Reste à faire"), ("I", "Opérateurs ✎"), ("J", "Cadence (l/h/op)"),
                    ("K", "Charge (h·op)"), ("L", "Fin estimée"), ("M", "Statut"),
                    ("N", "Op. pour l'heure visée"), ("O", "Renfort zone"),
                    ("P", "Prépa. vus en cours (Logys)"), ("R", "Lancées ✎ manuel"),
                    ("S", "En cours ✎ manuel"), ("T", "Préparées ✎ manuel")]

    # PICK
    bande(ws, 15, "PICK — lignes et opérateurs", "B", "T")
    entetes(ws, 16, entete_zones, 34)
    cellule(ws, f"B{PICK_L}", "Pick (toutes zones)", F_GRAS)
    cellule(ws, f"C{PICK_L}", "PICK", F_GRAS, al=AL_C)
    formules_zone(ws, PICK_L, "PICK", '"PICK"',
                  f'=IF($C{PICK_L}="","",MAX(0,PREVI*PART_PICK-SUM(D{PICK_L}:F{PICK_L})))')
    ws[f"I{PICK_L}"] = 10
    nom(wb, "ZT_PICK", f"PILOTAGE!$B${PICK_L}:$T${PICK_L}")

    # CÂBLE
    bande(ws, 19, "CÂBLE — par allée (opérateurs par allée ; 0,5 = un opérateur partagé "
          "sur deux allées)", "B", "T")
    entetes(ws, 20, entete_zones, 34)
    for r in range(CAB_1, CAB_N + 1):
        cellule(ws, f"B{r}", None, F_SAISIE, R_SAISIE, border=BORD)
        cellule(ws, f"C{r}", None, F_SAISIE, R_SAISIE, "@", AL_C, BORD)
        avenir = (f'=IF($C{r}="","",CABLE_AVENIR*IF(SUM($D${CAB_1}:$E${CAB_N})=0,'
                  f'1/COUNTA($C${CAB_1}:$C${CAB_N}),SUM(D{r}:E{r})/SUM($D${CAB_1}:$E${CAB_N})))')
        formules_zone(ws, r, "CABLE", '"CÂBLE"', avenir)
    ws[f"B{CAB_1}"] = "Câble (toutes allées)"
    ws[f"C{CAB_1}"] = "TOUTES"
    ws[f"I{CAB_1}"] = 3
    cellule(ws, f"B{CAB_RETR}", "dont rétract (info)", F_AIDE, border=BORD)
    cellule(ws, f"D{CAB_RETR}", '=SUMIFS(D_NB,D_SERV,"CABLE",D_RETR,1,D_STATUT,"LANCE")', F_AIDE,
            fmt=FMT_LIG, al=AL_D, border=BORD)
    cellule(ws, f"E{CAB_RETR}", '=SUMIFS(D_NB,D_SERV,"CABLE",D_RETR,1,D_STATUT,"EN_COURS")',
            F_AIDE, fmt=FMT_LIG, al=AL_D, border=BORD)
    cellule(ws, f"F{CAB_RETR}", '=SUMIFS(D_NB,D_SERV,"CABLE",D_RETR,1,D_STATUT,"PREPAREE")',
            F_AIDE, fmt=FMT_LIG, al=AL_D, border=BORD)
    cellule(ws, f"H{CAB_RETR}", f"=D{CAB_RETR}+E{CAB_RETR}", F_GRAS, fmt=FMT_LIG, al=AL_D,
            border=BORD)
    cellule(ws, f"M{CAB_RETR}", f'=IF(H{CAB_RETR}>=SEUIL_RETRACT,"PRÉVOIR CARISTE",'
            f'IF(H{CAB_RETR}>0,"OK","—"))', F_GRAS, al=AL_C, border=BORD)
    nom(wb, "ZT_CABLE", f"PILOTAGE!$B${CAB_1}:$T${CAB_N}")
    nom(wb, "RETR_CABLE", f"PILOTAGE!$B${CAB_RETR}:$T${CAB_RETR}")
    cellule(ws, f"U{CAB_RETR}", "À venir câble", F_AIDE, al=AL_C)
    cellule(ws, f"U{CAB_TOT}", f"=MAX(0,PREVI*PART_CABLE-SUM($D${CAB_1}:$F${CAB_N}))", F_AIDE,
            fmt=FMT_LIG, al=AL_D, border=BORD)
    nom(wb, "CABLE_AVENIR", f"PILOTAGE!$U${CAB_TOT}")

    # HG
    bande(ws, 36, "HORS GABARIT — par zone (sol, longueurs 2 m / 3 m, rétract, rétract longueur)",
          "B", "T")
    entetes(ws, 37, entete_zones, 34)
    ops_ex = [3, 1, 1, 2, 1]
    for i, r in enumerate(range(HG_1, HG_N + 1)):
        cellule(ws, f"B{r}", ZONES_HG[i][0] if i < len(ZONES_HG) else None, F_SAISIE, R_SAISIE,
                border=BORD)
        cellule(ws, f"C{r}", ZONES_HG[i][1] if i < len(ZONES_HG) else None, F_SAISIE, R_SAISIE,
                al=AL_C, border=BORD)
        avenir = (f'=IF($C{r}="","",MAX(0,PREVI*PART_HG*IFERROR(INDEX(HG_PART_VAL,'
                  f'MATCH($C{r},HG_PART_KEY,0)),0)-SUM(D{r}:F{r})))')
        formules_zone(ws, r, "HG", f"$C{r}", avenir)
        if i < len(ops_ex):
            ws[f"I{r}"] = ops_ex[i]
    nom(wb, "ZT_HG", f"PILOTAGE!$B${HG_1}:$T${HG_N}")

    # lignes de total
    for t, a, b, svc in ((CAB_TOT, CAB_1, CAB_N, "CABLE"), (HG_TOT, HG_1, HG_N, "HG")):
        s = SYN[svc]
        cellule(ws, f"B{t}", "TOTAL", F_GRAS, R_TOTAL, border=HAUT_EPAIS)
        cellule(ws, f"C{t}", None, F_GRAS, R_TOTAL, border=HAUT_EPAIS)
        for col in "DEFGHIKNOP":
            cellule(ws, f"{col}{t}", f"=SUM({col}{a}:{col}{b})", F_GRAS, R_TOTAL,
                    "0.0" if col in "IKNO" else FMT_LIG, AL_D, HAUT_EPAIS)
        cellule(ws, f"J{t}", None, F_GRAS, R_TOTAL, border=HAUT_EPAIS)
        cellule(ws, f"L{t}", f"=I{s}", F_GRAS, R_TOTAL, FMT_H, AL_C, HAUT_EPAIS)
        cellule(ws, f"M{t}", f"=M{s}", F_GRAS, R_TOTAL, al=AL_C, border=HAUT_EPAIS)
        for col in "RST":
            cellule(ws, f"{col}{t}", None, F_GRAS, R_TOTAL, border=HAUT_EPAIS)
    regles_statut(ws, f"M{PICK_L}:M{HG_TOT}")
    ws.conditional_formatting.add(f"O{PICK_L}:O{HG_N}", CellIsRule(
        operator="greaterThan", formula=["0"], font=Font(name=POLICE, bold=True,
                                                          color="B3261E")))

    dv = DataValidation(type="decimal", operator="between", formula1="0", formula2="50",
                        allow_blank=True, error="Nombre d'opérateurs entre 0 et 50 (0,5 accepté)")
    ws.add_data_validation(dv)
    dv.add(f"I{PICK_L}")
    dv.add(f"I{CAB_1}:I{CAB_N}")
    dv.add(f"I{HG_1}:I{HG_N}")
    dv2 = DataValidation(type="whole", operator="between", formula1="0", formula2="200000",
                         allow_blank=True)
    ws.add_data_validation(dv2)
    dv2.add("B7")

    notes = [
        "COMMENT C'EST CALCULÉ",
        "Reste à faire = lancées + en cours + à venir. À venir = prévisionnel × part du service "
        "(× part de la zone pour le HG) − ce que Logys a déjà vu (préparées + en cours + lancées), "
        "jamais négatif. Câble : à venir réparti entre allées au prorata du travail visible.",
        "Charge (h·op) = reste ÷ cadence. Fin estimée d'une zone = heure de calcul + charge ÷ "
        "opérateurs, + les pauses qui tombent avant. Fin du service = la zone qui finit en dernier.",
        "Fin si rééquilibrage = charge totale ÷ opérateurs totaux (si on déplace les gens entre "
        "zones). Renfort = opérateurs manquants pour finir à l'heure visée, rééquilibrage compris.",
        "Statut : marge ≥ seuil → FACILE ; 0 à seuil → TENDU ; retard ou zone sans opérateur → "
        "COMPLIQUÉ. Les colonnes « ✎ manuel » remplacent Logys pour la ligne quand elles sont "
        "remplies (dépannage).",
    ]
    for i, n in enumerate(notes):
        cellule(ws, f"B{48 + i}", n, F_GRAS if i == 0 else F_AIDE)
    ws.freeze_panes = "C11"
    ws.sheet_view.zoomScale = 90
    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr = PageSetupProperties(fitToPage=True)

    # ───────────────────────────── AIDE ────────────────────────────────
    ws = aid
    ws.column_dimensions["A"].width = 2
    ws.column_dimensions["B"].width = 120
    cellule(ws, "B2", "AIDE — mise en route en 6 étapes", F_TITRE)
    etapes = [
        "1 · Alt+F11 > Fichier > Importer un fichier > vba\\modDashboardPrepa.bas. Débogage > "
        "Compiler VBAProject. Enregistrer sous « Classeur prenant en charge les macros (.xlsm) ».",
        "2 · Dans SQL Developer, lancer sql\\00_decouverte_schema.sql (F5) : repérer la table des "
        "lignes de préparation, la colonne statut et ses codes, l'emplacement, le préparateur, "
        "la date de validation.",
        "3 · Renseigner PARAMETRES bloc 7 (jetons) et bloc 6 (DSN ODBC, dossier d'export). "
        "Tester avec la macro TesterConnexionLogys (Alt+F8).",
        "4 · Lancer InstallerBoutons (Alt+F8) : 4 boutons apparaissent en haut de PILOTAGE.",
        "5 · Chaque matin : saisir le prévisionnel et les opérateurs par zone (cellules jaunes), "
        "cliquer « Auto ON ». Le classeur interroge Logys toutes les 5 min et met à jour l'écran TV.",
        "6 · Écran TV : copier index.html dans le dossier d'export et l'ouvrir en plein écran "
        "(F11) dans Edge ou Chrome sur chaque écran de service.",
        "",
        "Dépannage : sans Logys, remplir les colonnes « ✎ manuel » de PILOTAGE et cliquer "
        "« Exporter (manuel) ». Zones Logys inconnues : elles comptent en PICK et apparaissent "
        "dans ZONES avec « À VÉRIFIER » : choisir le bon service / zone.",
        "Le détail (calculs, jetons, déploiement des écrans) est dans dashboard_prepa\\LISEZMOI.md.",
    ]
    for i, t in enumerate(etapes):
        cellule(ws, f"B{4 + i}", t, F_BASE, al=AL_GW)
        ws.row_dimensions[4 + i].height = 30

    wb.active = 0
    SORTIE.parent.mkdir(parents=True, exist_ok=True)
    wb.save(SORTIE)
    print(f"Classeur écrit : {SORTIE}")


if __name__ == "__main__":
    creer()
