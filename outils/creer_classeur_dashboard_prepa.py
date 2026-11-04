#!/usr/bin/env python3
"""
Génère le classeur moteur du dashboard préparation CLR :
    dashboard_prepa/Dashboard_Prepa_CLR.xlsx

    python3 outils/creer_classeur_dashboard_prepa.py

Le classeur est ensuite ouvert dans Excel, le module VBA
dashboard_prepa/vba/modDashboardPrepa.bas importé (Alt+F11 > Fichier >
Importer), puis enregistré en .xlsm.

Onglets : PILOTAGE (saisie du jour + résultats), PARAMETRES (réglages
fixes), ZONES (zones de prise et sous-types de tournée -> service / zone),
DONNEES (résultat Logys), HISTO (une ligne par actualisation),
REQUETES (modèle SQL), AIDE.

Source Logys : REXEL.F_GESTOURPREP_TOUR (vue des tournées de préparation
déjà utilisée par « Suivi activité préparation V4.69 »). La requête Excel
est lue dans dashboard_prepa/sql/requetes_prepa.sql entre les marqueurs
« >>> MODELE EXCEL » et « <<< MODELE EXCEL » : un seul texte de référence
pour SQL Developer et pour le classeur.
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
# Cadences par zone (lignes / heure / opérateur). Valeurs de terrain de
# « Suivi activité préparation V4.69 » (ligne « Nombre ligne h ») ; la
# référence HG_Cable V17 (1 000 pts / 7,4 h ÷ pondération) est rappelée.
PTS_H = 1000 / 7.4
CADENCES = [
    # clé, cadence, référence V17, source
    ("PICK", 75, round(620 / 7.4, 1), "Ancien fichier : PP 75 l/h (quota P&P 620 l / 7,4 h = 83,8)"),
    ("COUPES", 8, round(PTS_H / 15.38, 1), "Ancien fichier : câble 8 l/h"),
    ("RÉTRACT CÂBLE", 8, round(PTS_H / 15.38, 1), "Comme les coupes faute de mieux : à ajuster"),
    ("SOL", 80, round(PTS_H / 1.972, 1),
     "Ancien fichier : couronnes 148,6 l/h et reste HG 64 l/h, pondérés par le mix réel "
     "(36 % de couronnes, suivi op HG janv.–juin 2026)"),
    ("LONGUEUR 2M", 36.5, round(PTS_H / 4, 1), "Ancien fichier : LG 270 l / 7,4 h"),
    ("LONGUEUR 3M", 36.5, round(PTS_H / 3.25, 1), "Ancien fichier : LG 270 l / 7,4 h"),
    ("RÉTRACT", 17.6, round(PTS_H / 9.6, 1), "Ancien fichier : rétract 130 l / 7,4 h"),
    ("RÉTRACT LONGUEUR", 17.6, round(PTS_H / 9.6, 1), "Comme le rétract : à ajuster"),
]
# Prod objectif par service (lignes / heure / opérateur), ancien fichier
PROD_OBJ = [("Pick", "PROD_OBJ_PICK", 75, "PP 75 l/h"),
            ("Câble", "PROD_OBJ_CABLE", 8, "Câble 8 l/h"),
            ("Hors gabarit", "PROD_OBJ_HG", 51, "HG total 51 l/h")]
# Part de chaque zone dans le prévisionnel HG : suivi op HG janv.–juin 2026
ZONES_HG = [
    ("Sol", "SOL", 0.605),
    ("Longueur 2 m", "LONGUEUR 2M", 0.078),
    ("Longueur 3 m", "LONGUEUR 3M", 0.160),
    ("Rétract", "RÉTRACT", 0.110),
    ("Rétract longueur", "RÉTRACT LONGUEUR", 0.047),
]
ZONES_CABLE = [("Coupes", "COUPES"), ("Rétract câble", "RÉTRACT CÂBLE")]
# Sous-type de tournée (L_STYP_TOUR) -> service : ancien fichier V4.69
TYPES = [("DETAIL", "PICK"), ("CARTON", "PICK"), ("HORS GAB", "HG"), ("VRAC", "HG"),
         ("LONGUEUR", "HG"), ("PALETTE", "HG"), ("CABLE", "CABLE")]
# Zone de prise (ZONE_MVT_PRISE) -> zone du dashboard, par service
ZONES_MVT = (
    [("HG", z, "SOL") for z in (
        "COURONNES", "COURONNES2", "COURONNESVU", "COURONNE", "AEROSOLS", "BARDAGE",
        "PICK01A14", "CHAUFFAGE", "PREPARATEUR", "PANNEAUX", "HGAEMBALLER", "GAINES",
        "PLAFONNIERS", "ECLAIRAGE", "ECLAIRAGE2", "ECL3EMBALLAGE", "ECL4DEPISEDIR",
        "GAINESVENTIL", "TOUPRECOND", "COFFRETS", "ZPROMOS", "LONGUEUR1M", "CHAUFFEEAU",
        "VOLUMES")]
    + [("HG", z, "LONGUEUR 2M") for z in ("LONGUEUR2M", "LG2DEPOSEDIR", "LG2EMBALLAGE")]
    + [("HG", z, "LONGUEUR 3M") for z in ("LONGUEUR3M", "LG3ALLEE32", "IRL", "MRL")]
    + [("HG", z, "RÉTRACT") for z in ("ARETRACT", "RETRACT")]
    + [("HG", z, "RÉTRACT LONGUEUR") for z in ("RETRACT3435", "EXTERIEUR", "TUBECUIVRE",
                                              "TUBE CUIVRE")]
    + [("CABLE", "CABLE", "COUPES"), ("CABLE", "RETRACT", "RÉTRACT CÂBLE")]
)
REMARQUES_ZONES = {
    ("HG", "MRL"): "Dans la liste « longueurs » de l'ancien fichier : 2 m ou 3 m ? à vérifier",
    ("HG", "ECL4DEPISEDIR"): "Orthographe reprise de la macro HG_Cable V17",
    ("CABLE", "RETRACT"): "Ancien fichier : ligne Câble / Retract = zone RETRACT",
    ("HG", "ARETRACT"): "Ancien fichier : ligne HG / Retract = zone ARETRACT",
}
# Pauses par service : ancien fichier (pause de 30 min à 18:05 pour le
# pick, 17:25 pour le HG et le câble)
PAUSES = [("PICK", 18 * 60 + 5, 30, "Pause pick (ancien fichier)"),
          ("HG", 17 * 60 + 25, 30, "Pause HG (ancien fichier)"),
          ("CABLE", 17 * 60 + 25, 30, "Pause câble (ancien fichier)")]

# Jetons de la requête : nom, valeur par défaut, rôle, forme attendue
JETONS = [
    ("VUE_TOURNEES", "REXEL.F_GESTOURPREP_TOUR",
     "Vue des tournées de préparation (ancien fichier « Suivi activité préparation »)",
     "REXEL.F_GESTOURPREP_TOUR"),
    ("COND_PERIMETRE", "1 = 1", "Filtre facultatif sur la vue (1 = 1 : aucun)", "t.L_TYP_TOUR = 'xx'"),
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
#  Plan des onglets
# ═══════════════════════════════════════════════════════════════════════
SYN = {"PICK": 11, "CABLE": 12, "HG": 13}            # lignes de synthèse (B:Y)
PICK_L = 17                                            # ligne unique pick
CAB_1, CAB_N, CAB_TOT = 21, 26, 27                     # câble : 6 cases
HG_1, HG_N, HG_TOT = 31, 38, 39                        # HG : 8 cases
DON_1, DON_N = 7, 506                                  # DONNEES : 500 lignes
ZON_1, ZON_N = 5, 300                                  # ZONES
TYP_1, TYP_N = 5, 40                                   # sous-types (ZONES!G:I)
PAU_1, PAU_N = 50, 55                                  # pauses (PARAMETRES)
CLE_DEFAUT = {"PICK": "PICK", "CABLE": "COUPES", "HG": "SOL"}


def filtre_pause(svc):
    """Vrai pour les pauses du service ou de tous les services."""
    return f'(((P_SVC="{svc}")+(P_SVC="TOUS"))>0)'


def pauses_entre(svc, debut, fin):
    """Durée (en jours) des pauses du service qui commencent dans [debut ; fin[."""
    return f"SUMPRODUCT({filtre_pause(svc)}*(P_DEB>={debut})*(P_DEB<{fin})*P_DUR)"


def formules_zone(ws, r, svc, avenir):
    """Formules d'une ligne de zone (colonnes D à P) ; la clé est en colonne C."""
    s = SYN[svc]
    cle = f"$C{r}"
    vide = f'$C{r}=""'
    t0 = "MOD(H_CALC,1)"

    def somme(statut, man):
        return (f'=IF({vide},"",IF(${man}{r}<>"",${man}{r},'
                f'SUMIFS(D_RESTE,D_SERV,"{svc}",D_DASH,{cle},D_STATUT,"{statut}")))')

    f = {
        "D": somme("LANCE", "R"),
        "E": somme("EN_COURS", "S"),
        "F": f'=IF({vide},"",IF($T{r}<>"",$T{r},SUMIFS(D_TERMJ,D_SERV,"{svc}",D_DASH,{cle})))',
        "G": avenir,
        "H": f'=IF({vide},"",SUM(D{r},E{r},G{r}))',
        "J": (f'=IF({vide},"",IFERROR(ROUND(IFERROR(INDEX(CAD_VAL,MATCH({cle},CAD_KEY,0)),'
              f'INDEX(CAD_VAL,MATCH("{CLE_DEFAUT[svc]}",CAD_KEY,0)))*RENDEMENT,1),""))'),
        "K": f'=IF({vide},"",IF(N(J{r})>0,H{r}/J{r},""))',
        "L": (f'=IF({vide},"",IF(H{r}=0,"Terminé",IF(N(I{r})<=0,"Non couverte",'
              f'IF(NOT(ISNUMBER(K{r})),"Cadence ?",H_CALC+K{r}/I{r}/24'
              f'+{pauses_entre(svc, t0, f"{t0}+K{r}/I{r}/24")}))))'),
        "M": (f'=IF({vide},"",IF(H{r}=0,"TERMINÉ",IF(N(I{r})<=0,"NON COUVERTE",'
              f'IF(NOT(ISNUMBER(L{r})),"?",IF(L{r}>$T${s},"RETARD",'
              f'IF(L{r}>$T${s}-SEUIL_TENDU/1440,"TENDU","OK"))))))'),
        "N": (f'=IF({vide},"",IF(H{r}=0,0,IF($U${s}<=0,"Dépassée",'
              f'IF(NOT(ISNUMBER(K{r})),"",ROUNDUP(K{r}/$U${s}*2,0)/2))))'),
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
    for col, w in {"A": 2, "B": 32, "C": 16, "D": 16, "E": 78}.items():
        ws.column_dimensions[col].width = w
    cellule(ws, "B2", "PARAMÈTRES — réglages fixes du dashboard", F_TITRE)
    cellule(ws, "B3", "Cellules jaunes = à ajuster. Valeurs de départ reprises de « Suivi activité "
            "préparation V4.69 » et de HG_Cable V17 (source à droite).", F_SOUS)

    bande(ws, 4, "1 · PRÉVISIONNEL : RÉPARTITION ENTRE SERVICES ET FOISONNEMENT", "B", "E")
    entetes(ws, 5, [("B", "Service"), ("C", "Part du prévi"), ("D", ""), ("E", "Source")])
    for i, (lib, n, v) in enumerate([("Pick", "PART_PICK", 0.73), ("Câble", "PART_CABLE", 0.04),
                                     ("Hors gabarit", "PART_HG", 0.23)]):
        r = 6 + i
        cellule(ws, f"B{r}", lib, F_GRAS, border=BORD)
        cellule(ws, f"C{r}", v, F_SAISIE, R_SAISIE, FMT_PCT1, AL_D, BORD)
        cellule(ws, f"E{r}", "Découpage donné par le superviseur ; à recaler avec la requête Q7 "
                "(répartition sur 20 jours)", F_AIDE, al=AL_G)
        nom(wb, n, f"PARAMETRES!$C${r}")
    cellule(ws, "B9", "Total (doit faire 100 %)", F_GRAS, R_TOTAL, border=BORD)
    cellule(ws, "C9", "=SUM(C6:C8)", F_GRAS, R_TOTAL, FMT_PCT1, AL_D, BORD)
    cellule(ws, "D9", '=IF(ROUND(C9,3)=1,"✓","≠ 100 %")', F_GRAS, R_TOTAL, al=AL_C, border=BORD)
    cellule(ws, "B10", "Foisonnement (lignes tournée ÷ lignes commande)", F_GRAS, border=BORD)
    cellule(ws, "C10", 1.42, F_SAISIE, R_SAISIE, "0.00", AL_D, BORD)
    cellule(ws, "E10", "Le prévi se saisit en lignes commande ; Logys compte des lignes de tournée. "
            "Ancien fichier : taux de foisonnement 1,42 (mesuré 1,51 le 14/10 : 11 338 / 7 500). "
            "Requête Q9.", F_AIDE, al=AL_G)
    nom(wb, "FOISONNEMENT", "PARAMETRES!$C$10")

    bande(ws, 12, "2 · CADENCES MOYENNES PAR OPÉRATEUR ET PAR ZONE (fin estimée)", "B", "E")
    entetes(ws, 13, [("B", "Zone (clé)"), ("C", "Lignes / h / opérateur"),
                     ("D", "Réf. V17 à 100 %"), ("E", "Source")], 32)
    for i in range(10):
        r = 14 + i
        k, v, ref, src = CADENCES[i] if i < len(CADENCES) else (
            None, None, None, "Zone à ajouter : même clé que PILOTAGE colonne C")
        cellule(ws, f"B{r}", k, F_GRAS, R_SAISIE if k is None else None, border=BORD)
        cellule(ws, f"C{r}", v, F_SAISIE, R_SAISIE, FMT_DEC, AL_D, BORD)
        cellule(ws, f"D{r}", ref, F_BASE, fmt=FMT_DEC, al=AL_D, border=BORD)
        cellule(ws, f"E{r}", src, F_AIDE, al=AL_G)
    nom(wb, "CAD_KEY", "PARAMETRES!$B$14:$B$23")
    nom(wb, "CAD_VAL", "PARAMETRES!$C$14:$C$23")
    cellule(ws, "B24", "Rendement équipe du jour", F_GRAS, border=BORD)
    cellule(ws, "C24", 1, F_SAISIE, R_SAISIE, "0%", AL_D, BORD)
    cellule(ws, "E24", "Multiplie toutes les cadences (baisser un jour à forte part "
            "d'intérimaires).", F_AIDE, al=AL_G)
    nom(wb, "RENDEMENT", "PARAMETRES!$C$24")

    bande(ws, 26, "3 · PROD OBJECTIF PAR SERVICE (affichée à l'écran)", "B", "E")
    entetes(ws, 27, [("B", "Service"), ("C", "Lignes / h / opérateur"), ("D", ""),
                     ("E", "Source")])
    for i, (lib, n, v, src) in enumerate(PROD_OBJ):
        r = 28 + i
        cellule(ws, f"B{r}", lib, F_GRAS, border=BORD)
        cellule(ws, f"C{r}", v, F_SAISIE, R_SAISIE, FMT_DEC, AL_D, BORD)
        cellule(ws, f"E{r}", f"Ancien fichier « Nombre ligne h » : {src}", F_AIDE, al=AL_G)
        nom(wb, n, f"PARAMETRES!$C${r}")

    bande(ws, 32, "4 · DÉCOUPAGE DU PRÉVISIONNEL HORS GABARIT PAR ZONE", "B", "E")
    entetes(ws, 33, [("B", "Zone HG (clé)"), ("C", "Part du prévi HG"), ("D", ""), ("E", "Source")])
    for i in range(8):
        r = 34 + i
        k, v = (ZONES_HG[i][1], ZONES_HG[i][2]) if i < len(ZONES_HG) else (None, None)
        cellule(ws, f"B{r}", k, F_GRAS, R_SAISIE if k is None else None, border=BORD)
        cellule(ws, f"C{r}", v, F_SAISIE, R_SAISIE, FMT_PCT1, AL_D, BORD)
        if i == 0:
            cellule(ws, f"E{r}", "Suivi op HG (HG_Cable V17), janv.–juin 2026 : 221 634 lignes HG "
                    "hors câble sur 103 jours", F_AIDE, al=AL_G)
    nom(wb, "HG_PART_KEY", "PARAMETRES!$B$34:$B$41")
    nom(wb, "HG_PART_VAL", "PARAMETRES!$C$34:$C$41")
    cellule(ws, "B42", "Total (doit faire 100 %)", F_GRAS, R_TOTAL, border=BORD)
    cellule(ws, "C42", "=SUM(C34:C41)", F_GRAS, R_TOTAL, FMT_PCT1, AL_D, BORD)
    cellule(ws, "D42", '=IF(ROUND(C42,3)=1,"✓","≠ 100 %")', F_GRAS, R_TOTAL, al=AL_C, border=BORD)

    bande(ws, 44, "5 · HORAIRES ET PAUSES", "B", "E")
    entetes(ws, 45, [("B", "Service"), ("C", "Début d'activité"), ("D", "Heure de fin visée"),
                     ("E", "Note")])
    for i, (lib, svc) in enumerate([("Pick", "PICK"), ("Câble", "CABLE"), ("Hors gabarit", "HG")]):
        r = 46 + i
        cellule(ws, f"B{r}", lib, F_GRAS, border=BORD)
        cellule(ws, f"C{r}", (12 * 60 + 6) / 1440, F_SAISIE, R_SAISIE, FMT_H, AL_D, BORD)
        cellule(ws, f"D{r}", 20 / 24, F_SAISIE, R_SAISIE, FMT_H, AL_D, BORD)
        cellule(ws, f"E{r}", "Ancien fichier : « horaire prep 12h06/20h » (le calcul utilisait "
                "21:00, 20:30 le vendredi) : à ajuster", F_AIDE, al=AL_G)
        nom(wb, f"DEBUT_{svc}", f"PARAMETRES!$C${r}")
        nom(wb, f"CIBLE_{svc}", f"PARAMETRES!$D${r}")
    entetes(ws, PAU_1 - 1, [("B", "Pause : service (PICK, CABLE, HG, TOUS)"), ("C", "Début"),
                            ("D", "Durée"), ("E", "Note")])
    for i in range(PAU_N - PAU_1 + 1):
        r = PAU_1 + i
        svc, deb, dur, note = PAUSES[i] if i < len(PAUSES) else (None, None, None, None)
        cellule(ws, f"B{r}", svc, F_SAISIE, R_SAISIE, al=AL_C, border=BORD)
        cellule(ws, f"C{r}", deb / 1440 if deb else None, F_SAISIE, R_SAISIE, FMT_H, AL_D, BORD)
        cellule(ws, f"D{r}", dur / 1440 if dur else None, F_SAISIE, R_SAISIE, "[h]:mm", AL_D, BORD)
        cellule(ws, f"E{r}", note, F_AIDE, al=AL_G)
    dvp = DataValidation(type="list", formula1='"PICK,CABLE,HG,TOUS"', allow_blank=True)
    ws.add_data_validation(dvp)
    dvp.add(f"B{PAU_1}:B{PAU_N}")
    nom(wb, "P_SVC", f"PARAMETRES!$B${PAU_1}:$B${PAU_N}")
    nom(wb, "P_DEB", f"PARAMETRES!$C${PAU_1}:$C${PAU_N}")
    nom(wb, "P_DUR", f"PARAMETRES!$D${PAU_1}:$D${PAU_N}")

    bande(ws, 57, "6 · SEUILS", "B", "E")
    seuils = [("Marge mini pour « FACILE » (min)", "SEUIL_TENDU", 30,
               "Marge ≥ seuil : FACILE · entre 0 et le seuil : TENDU · négative : COMPLIQUÉ"),
              ("Écran TV : données périmées après (min)", "PERIME_MIN", 15,
               "Au-delà, l'écran affiche un bandeau « données non actualisées »")]
    for i, (lib, n, v, note) in enumerate(seuils):
        r = 58 + i
        cellule(ws, f"B{r}", lib, F_GRAS, border=BORD)
        cellule(ws, f"C{r}", v, F_SAISIE, R_SAISIE, "0", AL_D, BORD)
        cellule(ws, f"E{r}", note, F_AIDE, al=AL_G)
        nom(wb, n, f"PARAMETRES!$C${r}")

    bande(ws, 61, "7 · CONNEXION LOGYS ET EXPORT VERS L'ÉCRAN TV", "B", "E")
    cnx = [("DSN ODBC Logys", "CFG_DSN", "A_RENSEIGNER",
            "Même source ODBC que « Suivi activité préparation » (Données > Connexions > Propriétés)"),
           ("Utilisateur", "CFG_UID", None,
            "Le compte de lecture de l'ancien fichier. Le mot de passe est demandé par la fenêtre "
            "ODBC (ou gardé dans le DSN), jamais écrit dans le classeur"),
           ("Actualisation auto (minutes)", "CFG_INTERVALLE", 5, "Entre 2 et 15 conseillé"),
           ("Dossier d'export", "CFG_DOSSIER", None,
            "Dossier partagé où se trouve index.html (ex. \\\\serveur\\partage\\Dashboard). "
            "Vide = dossier du classeur"),
           ("Fichier de données", "CFG_FICHIER", "donnees_dashboard.js", "Nom attendu par index.html"),
           ("Nom du site", "CFG_SITE", "CLR Champigneulles", "Affiché en haut de l'écran")]
    for i, (lib, n, v, note) in enumerate(cnx):
        r = 62 + i
        cellule(ws, f"B{r}", lib, F_GRAS, border=BORD)
        cellule(ws, f"C{r}", v, F_SAISIE, R_SAISIE, al=AL_G, border=BORD)
        ws.merge_cells(f"C{r}:D{r}")
        cellule(ws, f"E{r}", note, F_AIDE, al=AL_G)
        nom(wb, n, f"PARAMETRES!$C${r}")

    bande(ws, 69, "8 · REQUÊTE LOGYS (jetons &&… du modèle SQL, onglet REQUETES)", "B", "E")
    entetes(ws, 70, [("B", "Jeton"), ("C", "Valeur (SQL Oracle)"), ("D", "Forme"), ("E", "Rôle")])
    for i, (jet, val, role, forme) in enumerate(JETONS):
        r = 71 + i
        cellule(ws, f"B{r}", jet, Font(name="Consolas", size=10, bold=True), border=BORD)
        cellule(ws, f"C{r}", val, Font(name="Consolas", size=10, bold=True, color="0000FF"),
                R_SAISIE, al=AL_G, border=BORD)
        cellule(ws, f"D{r}", forme, Font(name="Consolas", size=8, color="7A808A"), al=AL_G,
                border=BORD)
        cellule(ws, f"E{r}", role, F_AIDE, al=AL_G)
    nom(wb, "CFG_SQL", f"PARAMETRES!$B$71:$C${70 + len(JETONS)}")
    ws.freeze_panes = "A4"

    # ───────────────────────────── ZONES ───────────────────────────────
    ws = zon
    for col, w in {"A": 20, "B": 11, "C": 22, "D": 64, "E": 4, "F": 3, "G": 16, "H": 11,
                   "I": 44}.items():
        ws.column_dimensions[col].width = w
    ws.column_dimensions["E"].hidden = True
    cellule(ws, "A1", "ZONES — zones de prise et sous-types de tournée", F_TITRE)
    cellule(ws, "A2", "Le service vient du sous-type de tournée (colonnes G:H), la zone du "
            "dashboard de la zone de prise (colonnes A:C). Une valeur Logys inconnue est ajoutée "
            "automatiquement avec « À VÉRIFIER ».", F_SOUS)
    entetes(ws, 4, [("A", "ZONE_MVT_PRISE"), ("B", "SERVICE"), ("C", "ZONE DASHBOARD"),
                    ("D", "REMARQUE"), ("G", "L_STYP_TOUR"), ("H", "SERVICE"), ("I", "REMARQUE")], 22)
    for i in range(ZON_N - ZON_1 + 1):
        r = ZON_1 + i
        svc, z, d = ZONES_MVT[i] if i < len(ZONES_MVT) else (None, None, None)
        cellule(ws, f"A{r}", z, Font(name="Consolas", size=10, bold=True), fmt="@", border=BORD)
        cellule(ws, f"B{r}", svc, F_SAISIE, border=BORD, al=AL_C)
        cellule(ws, f"C{r}", d, F_SAISIE, border=BORD)
        cellule(ws, f"D{r}", REMARQUES_ZONES.get((svc, z)), F_AIDE, border=BORD)
        ws[f"E{r}"] = f'=IF($A{r}="","",$B{r}&"|"&$A{r})'
    for i in range(TYP_N - TYP_1 + 1):
        r = TYP_1 + i
        st, svc = TYPES[i] if i < len(TYPES) else (None, None)
        cellule(ws, f"G{r}", st, Font(name="Consolas", size=10, bold=True), fmt="@", border=BORD)
        cellule(ws, f"H{r}", svc, F_SAISIE, border=BORD, al=AL_C)
        cellule(ws, f"I{r}", "Ancien fichier V4.69" if st else None, F_AIDE, border=BORD)
    dv = DataValidation(type="list", formula1='"PICK,CABLE,HG"', allow_blank=True)
    ws.add_data_validation(dv)
    dv.add(f"B{ZON_1}:B{ZON_N}")
    dv.add(f"H{TYP_1}:H{TYP_N}")
    for plage, col in ((f"A{ZON_1}:D{ZON_N}", "D"), (f"G{TYP_1}:I{TYP_N}", "I")):
        ws.conditional_formatting.add(plage, FormulaRule(
            formula=[f'LEFT(${col}{ZON_1 if col == "D" else TYP_1},10)="À VÉRIFIER"'],
            fill=PatternFill("solid", fgColor="FFE6CC")))
    ws.freeze_panes = "A5"
    nom(wb, "Z_MVT", f"ZONES!$A${ZON_1}:$A${ZON_N}")
    nom(wb, "Z_SERV", f"ZONES!$B${ZON_1}:$B${ZON_N}")
    nom(wb, "Z_DASH", f"ZONES!$C${ZON_1}:$C${ZON_N}")
    nom(wb, "Z_CLE", f"ZONES!$E${ZON_1}:$E${ZON_N}")
    nom(wb, "T_STYP", f"ZONES!$G${TYP_1}:$G${TYP_N}")
    nom(wb, "T_SERV", f"ZONES!$H${TYP_1}:$H${TYP_N}")

    # ──────────────────────────── DONNEES ──────────────────────────────
    ws = don
    cols = ["STYP", "ZONE", "ETAT", "NB_TOURS", "LIG_PREV", "LIG_TERM", "LIG_ANNU", "NB_PREPA",
            "LIG_TERM_JOUR", "SERVICE", "ZONE DASH.", "STATUT", "RESTE", "TYPE CONNU",
            "ZONE CONNUE"]
    for col, w in zip("ABCDEFGHIJKLMNO", (13, 18, 11, 10, 10, 10, 10, 10, 13, 10, 18, 11, 10,
                                          11, 11)):
        ws.column_dimensions[col].width = w
    cellule(ws, "A1", "DONNÉES — résultat de la requête Logys (A:I écrit par la macro)", F_TITRE)
    cellule(ws, "A2", "Horodatage", F_GRAS)
    cellule(ws, "B2", None, F_GRAS, fmt="dd/mm/yyyy hh:mm:ss", al=AL_G)
    cellule(ws, "A3", "Source", F_GRAS)
    cellule(ws, "B3", None, F_GRAS, al=AL_G)
    cellule(ws, "A4", "Dernier message", F_GRAS)
    cellule(ws, "B4", None, F_BASE, al=AL_G)
    nom(wb, "MAJ_DONNEES", "DONNEES!$B$2")
    nom(wb, "SOURCE_DONNEES", "DONNEES!$B$3")
    nom(wb, "STATUT_MAJ", "DONNEES!$B$4")
    entetes(ws, 6, list(zip("ABCDEFGHIJKLMNO", cols)), 22)
    for r in range(DON_1, DON_N + 1):
        ws[f"A{r}"].number_format = "@"
        ws[f"B{r}"].number_format = "@"
        ws[f"C{r}"].number_format = "@"
        ws[f"J{r}"] = (f'=IF($A{r}="","",IFERROR(IF(INDEX(T_SERV,MATCH($A{r},T_STYP,0))&""="",'
                       f'"?",INDEX(T_SERV,MATCH($A{r},T_STYP,0))&""),"?"))')
        ws[f"K{r}"] = (f'=IF($A{r}="","",IF($J{r}="PICK","PICK",IFERROR(IF(INDEX(Z_DASH,'
                       f'MATCH($J{r}&"|"&$B{r},Z_CLE,0))&""="","?",INDEX(Z_DASH,MATCH($J{r}&"|"'
                       f'&$B{r},Z_CLE,0))&""),IF($J{r}="HG","SOL",IF($J{r}="CABLE","COUPES","?")))))')
        ws[f"L{r}"] = (f'=IF($A{r}="","",IF($C{r}="LANCEE","LANCE",IF($C{r}="ENCOURS",'
                       f'"EN_COURS",$C{r})))')
        ws[f"M{r}"] = f'=IF($A{r}="","",MAX(0,N($E{r})-N($F{r})-N($G{r})))'
        ws[f"N{r}"] = f'=IF($A{r}="","",IF(ISNUMBER(MATCH($A{r},T_STYP,0)),"OUI","NON"))'
        ws[f"O{r}"] = (f'=IF(OR($A{r}="",$J{r}="PICK",$J{r}="?"),"",IF(ISNUMBER(MATCH($J{r}&"|"'
                       f'&$B{r},Z_CLE,0)),"OUI","NON"))')
        for col in "ABCDEFGHIJKLMNO":
            ws[f"{col}{r}"].font = F_BASE
    ws.freeze_panes = "A7"
    for n, col in {"D_STYP": "A", "D_ZONE": "B", "D_ETAT": "C", "D_TOURS": "D", "D_PREV": "E",
                   "D_TERM": "F", "D_ANNU": "G", "D_PREPA": "H", "D_TERMJ": "I", "D_SERV": "J",
                   "D_DASH": "K", "D_STATUT": "L", "D_RESTE": "M", "D_STYPOK": "N",
                   "D_ZONEOK": "O"}.items():
        nom(wb, n, f"DONNEES!${col}${DON_1}:${col}${DON_N}")

    # ───────────────────────────── HISTO ───────────────────────────────
    ws = his
    cellule(ws, "A1", "HISTORIQUE — une ligne par actualisation (tendance « s'améliore / se dégrade » de l'écran TV)",
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
    cellule(ws, "B3", "Les jetons &&NOM sont remplacés par PARAMETRES (bloc 8). Texte identique à "
            "Q6 de sql/requetes_prepa.sql. Pas de point-virgule final (ODBC).", F_SOUS)
    cellule(ws, "B4", "Modèle", F_GRAS)
    cellule(ws, "B5", modele_sql(), F_MONO, R_AIDE, al=AL_GW)
    ws.row_dimensions[5].height = 260
    cellule(ws, "B7", "Dernière requête envoyée à Logys (écrite par la macro, pour contrôle)",
            F_GRAS)
    cellule(ws, "B8", None, F_MONO, R_AIDE, al=AL_GW)
    ws.row_dimensions[8].height = 260
    nom(wb, "SQL_MODELE", "REQUETES!$B$5")
    nom(wb, "SQL_GENERE", "REQUETES!$B$8")

    # ──────────────────────────── PILOTAGE ─────────────────────────────
    ws = pil
    largeurs = {"A": 2, "B": 24, "C": 15, "D": 11, "E": 11, "F": 11, "G": 11, "H": 11, "I": 11,
                "J": 11, "K": 11, "L": 12, "M": 15, "N": 11, "O": 11, "P": 11, "Q": 11, "R": 30,
                "S": 2, "T": 12, "U": 11, "V": 16, "W": 11, "X": 11, "Y": 11}
    for col, w in largeurs.items():
        ws.column_dimensions[col].width = w
    cellule(ws, "B2", "PILOTAGE PRÉPARATION — PICK · CÂBLE · HORS GABARIT", F_TITRE)
    cellule(ws, "B3", "Jaune = à saisir (prévisionnel, opérateurs par zone). Le reste se calcule. "
            "La synthèse est ce qu'affiche l'écran TV. Valeurs d'exemple à remplacer.", F_SOUS)
    ws.row_dimensions[4].height = 30
    cellule(ws, "B4", "Boutons : lancer une fois la macro InstallerBoutons (Alt+F8).", F_AIDE)

    kpis = [
        ("B", "PRÉVI LIGNES COMMANDE", 7500, F_SAISIE, R_SAISIE, FMT_LIG),
        ("D", "PRÉVI LIGNES TOURNÉE", "=PREVI*FOISONNEMENT", F_KPI, R_KPI, FMT_LIG),
        ("F", "HEURE DE CALCUL", "=IF(N(MAJ_DONNEES)=0,NOW(),MAJ_DONNEES)", F_KPI, R_KPI, FMT_DT),
        ("H", "DONNÉES", '=IF(N(MAJ_DONNEES)=0,"aucune — saisie",SOURCE_DONNEES&" "'
                         '&TEXT(MAJ_DONNEES,"hh:mm"))', F_KPI, R_KPI, None),
        ("J", "RENDEMENT ÉQUIPE", "=RENDEMENT", Font(name=POLICE, size=14, bold=True,
                                                    color="008000"), R_KPI, "0%"),
        ("L", "À VÉRIFIER (ZONES)", f'=COUNTIF(ZONES!$D${ZON_1}:$D${ZON_N},"À VÉRIFIER*")'
         f'+COUNTIF(ZONES!$I${TYP_1}:$I${TYP_N},"À VÉRIFIER*")', F_KPI, R_KPI, "0"),
        ("N", "LIGNES NON VENTILÉES",
         '=MAX(0,SUMIFS(D_RESTE,D_STATUT,"LANCE")+SUMIFS(D_RESTE,D_STATUT,"EN_COURS")'
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
    nom(wb, "PREVI_TOUR", "PILOTAGE!$D$7")
    nom(wb, "H_CALC", "PILOTAGE!$F$7")
    nom(wb, "NB_ZONES_VERIF", "PILOTAGE!$L$7")
    nom(wb, "NON_VENTILEES", "PILOTAGE!$N$7")
    ws["N6"].comment = Comment("Lignes lancées + en cours renvoyées par Logys qui ne tombent dans "
                               "aucune ligne des tableaux (sous-type ou zone inconnus, case "
                               "manquante). Doit rester à 0.", "Dashboard")
    ws["B6"].comment = Comment("Prévisionnel du jour en lignes commande, comme dans l'ancien "
                               "fichier. Il est converti en lignes de tournée avec le "
                               "foisonnement (PARAMETRES, bloc 1).", "Dashboard")

    # Synthèse
    bande(ws, 9, "SYNTHÈSE — ce qu'affiche l'écran TV", "B", "Y")
    entetes(ws, 10, [("B", "Service"), ("C", "Reste à faire"), ("D", "Lancées"),
                     ("E", "En cours"), ("F", "À venir (prévi)"), ("G", "Préparées (jour)"),
                     ("H", "Opérateurs"), ("I", "Fin estimée"), ("J", "Fin si rééquilibrage"),
                     ("K", "Heure visée"), ("L", "Marge (min)"), ("M", "État"),
                     ("N", "Renfort (+ op.)"), ("O", "Avancement"), ("P", "Prod (l/h/op)"),
                     ("Q", "Prod objectif"), ("R", "Message"), ("T", "Visée (date)"),
                     ("U", "Temps dispo (h)"), ("V", "Zone non couverte"), ("W", "Charge (h·op)"),
                     ("X", "Prépa. vus Logys"), ("Y", "Heures écoulées")], 32)
    services = [("PICK", "Pick", PICK_L, PICK_L, PICK_L),
                ("CABLE", "Câble", CAB_1, CAB_N, CAB_TOT),
                ("HG", "Hors gabarit", HG_1, HG_N, HG_TOT)]
    for svc, lib, a, b, t in services:
        s = SYN[svc]
        t0 = "MOD(H_CALC,1)"
        f = {
            "B": lib,
            "C": f"=N(H{t})", "D": f"=N(D{t})", "E": f"=N(E{t})", "F": f"=N(G{t})",
            "G": f"=N(F{t})", "H": f"=N(I{t})",
            "I": (f'=IF(C{s}=0,"Terminé",IF(V{s}<>"","Non couverte",'
                  f'IF(COUNT(L{a}:L{b})=0,"?",MAX(L{a}:L{b}))))'),
            "J": (f'=IF(C{s}=0,"Terminé",IF(H{s}<=0,"Aucun opérateur",IF(W{s}<=0,"?",'
                  f'H_CALC+W{s}/H{s}/24+{pauses_entre(svc, t0, f"{t0}+W{s}/H{s}/24")})))'),
            "K": f"=CIBLE_{svc}",
            "L": f'=IF(ISNUMBER(I{s}),ROUND((T{s}-I{s})*1440,0),"")',
            "M": (f'=IF(C{s}=0,"TERMINÉ",IF(NOT(ISNUMBER(I{s})),"COMPLIQUÉ",'
                  f'IF(L{s}<0,"COMPLIQUÉ",IF(L{s}<SEUIL_TENDU,"TENDU","FACILE"))))'),
            "N": f'=IF(C{s}=0,0,IF(U{s}<=0,"Visée dépassée",MAX(0,ROUNDUP(W{s}/U{s}-H{s},0))))',
            "O": f'=IF(G{s}+C{s}=0,"",G{s}/(G{s}+C{s}))',
            "P": f'=IF(AND(H{s}>0,Y{s}>=0.25),G{s}/(H{s}*Y{s}),"")',
            "Q": f"=PROD_OBJ_{svc}",
            "R": (f'=IF(M{s}="TERMINÉ","Service terminé",IF(ISNUMBER(N{s}),'
                  f'IF(N{s}>0,"Renfort +"&N{s}&" opérateur(s) pour finir à "&TEXT(K{s},"hh:mm"),'
                  f'IF(V{s}<>"","Zone sans opérateur : "&V{s},'
                  f'IF(M{s}="FACILE","Marge "&INT(L{s}/60)&" h "&TEXT(MOD(L{s},60),"00"),'
                  f'"Rééquilibrer les opérateurs entre zones"))),"Heure visée dépassée"))'),
            "T": f"=INT(H_CALC)+K{s}",
            "U": f"=MAX(0,(T{s}-H_CALC)*24-{pauses_entre(svc, t0, f'K{s}')}*24)",
            "V": f'=IFERROR(INDEX(B{a}:B{b},MATCH("NON COUVERTE",M{a}:M{b},0)),"")',
            "W": f"=N(K{t})",
            "X": f"=N(P{t})",
            "Y": (f"=MAX(0,(H_CALC-(INT(H_CALC)+DEBUT_{svc}))*24-SUMPRODUCT({filtre_pause(svc)}"
                  f"*(P_DEB>=DEBUT_{svc})*(P_DEB+P_DUR<={t0})*P_DUR)*24)"),
        }
        fmts = {"C": FMT_LIG, "D": FMT_LIG, "E": FMT_LIG, "F": FMT_LIG, "G": FMT_LIG,
                "H": "0.0", "I": FMT_H, "J": FMT_H, "K": FMT_H, "L": "+0;-0;0", "N": "0",
                "O": FMT_PCT, "P": FMT_DEC, "Q": FMT_DEC, "T": FMT_DT, "U": FMT_DEC,
                "W": FMT_DEC, "X": "0", "Y": FMT_DEC}
        for col, v in f.items():
            font = F_GRAS if col in "BCIMNP" else F_BASE
            if col in "TUVWXY":
                font = F_AIDE
            if col in "KQ":
                font = F_LIEN
            cellule(ws, f"{col}{s}", v, font, fmt=fmts.get(col), border=BORD,
                    al=AL_G if col in "BR" else (AL_C if col in "IJKLMN" else AL_D))
        ws.row_dimensions[s].height = 24
        nom(wb, f"SYN_{svc}", f"PILOTAGE!$B${s}:$Y${s}")
    regles_statut(ws, "M11:M13")
    ws.conditional_formatting.add("O11:O13", DataBarRule(start_type="num", start_value=0,
                                                         end_type="num", end_value=1,
                                                         color="FFD400"))
    ws.conditional_formatting.add("N11:N13", CellIsRule(
        operator="greaterThan", formula=["0"], fill=PatternFill("solid", fgColor="FADBD8"),
        font=Font(name=POLICE, bold=True, color="B3261E")))
    ws.conditional_formatting.add("P11:P13", FormulaRule(
        formula=["AND(ISNUMBER(P11),P11<Q11*0.9)"], font=Font(name=POLICE, bold=True,
                                                               color="B3261E")))

    entete_zones = [("B", "Zone"), ("C", "Clé (onglet ZONES)"), ("D", "Lancées"),
                    ("E", "En cours (reste)"), ("F", "Préparées (jour)"), ("G", "À venir (prévi)"),
                    ("H", "Reste à faire"), ("I", "Opérateurs ✎"), ("J", "Cadence (l/h/op)"),
                    ("K", "Charge (h·op)"), ("L", "Fin estimée"), ("M", "Statut"),
                    ("N", "Op. pour l'heure visée"), ("O", "Renfort zone"),
                    ("P", "Prépa. vus en cours (Logys)"), ("R", "Lancées ✎ manuel"),
                    ("S", "En cours ✎ manuel"), ("T", "Préparées ✎ manuel")]

    # PICK
    bande(ws, 15, "PICK — détail + carton : lignes et opérateurs", "B", "T")
    entetes(ws, 16, entete_zones, 34)
    cellule(ws, f"B{PICK_L}", "Détail + carton", F_GRAS)
    cellule(ws, f"C{PICK_L}", "PICK", F_GRAS, al=AL_C)
    formules_zone(ws, PICK_L, "PICK",
                  f'=IF($C{PICK_L}="","",MAX(0,PREVI_TOUR*PART_PICK-SUM(D{PICK_L}:F{PICK_L})))')
    ws[f"I{PICK_L}"] = 11
    nom(wb, "ZT_PICK", f"PILOTAGE!$B${PICK_L}:$T${PICK_L}")

    # CÂBLE
    bande(ws, 19, "CÂBLE — coupes et rétract (0,5 = un opérateur partagé)", "B", "T")
    entetes(ws, 20, entete_zones, 34)
    ops_cab = [4, 1]
    for i, r in enumerate(range(CAB_1, CAB_N + 1)):
        lib, cle = ZONES_CABLE[i] if i < len(ZONES_CABLE) else (None, None)
        cellule(ws, f"B{r}", lib, F_SAISIE, R_SAISIE, border=BORD)
        cellule(ws, f"C{r}", cle, F_SAISIE, R_SAISIE, "@", AL_C, BORD)
        avenir = (f'=IF($C{r}="","",CABLE_AVENIR*IF(SUM($D${CAB_1}:$E${CAB_N})=0,'
                  f'1/COUNTA($C${CAB_1}:$C${CAB_N}),SUM(D{r}:E{r})/SUM($D${CAB_1}:$E${CAB_N})))')
        formules_zone(ws, r, "CABLE", avenir)
        if i < len(ops_cab):
            ws[f"I{r}"] = ops_cab[i]
    nom(wb, "ZT_CABLE", f"PILOTAGE!$B${CAB_1}:$T${CAB_N}")
    cellule(ws, f"U{CAB_TOT - 1}", "À venir câble", F_AIDE, al=AL_C)
    cellule(ws, f"U{CAB_TOT}", f"=MAX(0,PREVI_TOUR*PART_CABLE-SUM($D${CAB_1}:$F${CAB_N}))", F_AIDE,
            fmt=FMT_LIG, al=AL_D, border=BORD)
    nom(wb, "CABLE_AVENIR", f"PILOTAGE!$U${CAB_TOT}")

    # HG
    bande(ws, 29, "HORS GABARIT — par zone (sol, longueurs 2 m / 3 m, rétract, rétract longueur)",
          "B", "T")
    entetes(ws, 30, entete_zones, 34)
    ops_hg = [3, 1, 1, 0.5, 0.5]
    for i, r in enumerate(range(HG_1, HG_N + 1)):
        cellule(ws, f"B{r}", ZONES_HG[i][0] if i < len(ZONES_HG) else None, F_SAISIE, R_SAISIE,
                border=BORD)
        cellule(ws, f"C{r}", ZONES_HG[i][1] if i < len(ZONES_HG) else None, F_SAISIE, R_SAISIE,
                al=AL_C, border=BORD)
        avenir = (f'=IF($C{r}="","",MAX(0,PREVI_TOUR*PART_HG*IFERROR(INDEX(HG_PART_VAL,'
                  f'MATCH($C{r},HG_PART_KEY,0)),0)-SUM(D{r}:F{r})))')
        formules_zone(ws, r, "HG", avenir)
        if i < len(ops_hg):
            ws[f"I{r}"] = ops_hg[i]
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
        "Lancées / en cours = lignes restantes des tournées LANCEE / ENCOURS (prévues − terminées − "
        "annulées). Préparées = lignes terminées sur les tournées mises à jour aujourd'hui.",
        "À venir = prévi (lignes commande × foisonnement) × part du service (× part de la zone pour "
        "le HG) − ce que Logys a déjà vu (préparées + en cours + lancées), jamais négatif.",
        "Fin estimée d'une zone = heure des données + reste ÷ cadence ÷ opérateurs, + les pauses "
        "du service qui tombent avant. Fin du service = la zone qui finit en dernier.",
        "Prod = lignes préparées ÷ (opérateurs × heures écoulées depuis le début d'activité, "
        "pauses passées déduites). Renfort = opérateurs manquants pour finir à l'heure visée.",
        "État : marge ≥ seuil → FACILE ; 0 à seuil → TENDU ; retard ou zone avec du travail et 0 "
        "opérateur → COMPLIQUÉ. Colonnes « ✎ manuel » : remplacent Logys quand elles sont remplies.",
    ]
    for i, n in enumerate(notes):
        cellule(ws, f"B{41 + i}", n, F_GRAS if i == 0 else F_AIDE)
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
    cellule(ws, "B2", "AIDE — mise en route en 5 étapes", F_TITRE)
    etapes = [
        "1 · Alt+F11 > Fichier > Importer un fichier > vba\\modDashboardPrepa.bas. Coller "
        "vba\\ThisWorkbook_a_coller.txt dans ThisWorkbook. Débogage > Compiler. Enregistrer en .xlsm.",
        "2 · PARAMETRES bloc 7 : le DSN ODBC et l'utilisateur de « Suivi activité préparation » "
        "(Données > Requêtes et connexions > Propriétés > Définition), le dossier partagé d'export.",
        "3 · Alt+F8 > TesterConnexionLogys, puis InstallerBoutons (4 boutons en haut de PILOTAGE).",
        "4 · Chaque jour : PILOTAGE > prévi en lignes commande et opérateurs par zone (cellules "
        "jaunes), puis « Auto ON » : Logys est interrogé toutes les 5 min et l'écran se met à jour.",
        "5 · Écran TV : copier index.html dans le dossier d'export et l'ouvrir en plein écran "
        "(F11) dans Edge ou Chrome. Les 3 services tiennent toujours sur un seul écran.",
        "",
        "Valeur Logys inconnue (sous-type ou zone) : ajoutée dans ZONES avec « À VÉRIFIER » ; "
        "choisir le bon service / la bonne zone. Sans Logys : colonnes « ✎ manuel » + bouton "
        "« Exporter (manuel) ».",
        "Le détail (calculs, requêtes, déploiement des écrans) est dans dashboard_prepa\\LISEZMOI.md.",
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
