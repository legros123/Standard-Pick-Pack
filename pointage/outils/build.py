"""Construit Point_Du_Jour_CHP_v9.xlsm a partir du v8.1.

usage : python build.py ORIG.xlsx SORTIE_SANS_VBA.xlsm [--sans-cnx]
"""
import sys, re, copy, datetime
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.formatting.rule import FormulaRule
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter as L, column_index_from_string as CI

SRC, OUT = sys.argv[1], sys.argv[2]
SANS_CNX = "--sans-cnx" in sys.argv
EXEMPLE = "--exemple" in sys.argv          # valeurs de démonstration (aperçu uniquement)

wb = openpyxl.load_workbook(SRC, keep_vba=True)
PDJ = "Point Du Jour"
Q = "'Point Du Jour'!"

# ------------------------------------------------------------------ palette
NAVY, NAVY2 = "0B1F3A", "13294B"
BLUE = "2F6FED"
PAGE, CARD, LINE = "EEF2F7", "FFFFFF", "DCE3EC"
TXT, MUTED, SOFT = "0F172A", "64748B", "94A3B8"
INPUT, INPUT_LINE = "FFF6D5", "E9C46A"
OK_C, OK_BG = "15803D", "DCFCE7"
WARN_C, WARN_BG = "B45309", "FEF3C7"
BAD_C, BAD_BG = "B91C1C", "FEE2E2"
SERV = {"PP": ("PICK & PACK", "2F6FED"), "HG": ("HORS GABARIT", "7C3AED"), "CA": ("CÂBLE", "0D9488")}
FONT = "Segoe UI"


def font(size=10, bold=False, color=TXT, italic=False):
    return Font(name=FONT, size=size, bold=bold, color=color, italic=italic)


def fill(c):
    return PatternFill("solid", fgColor=c)


def side(c=LINE, style="thin"):
    return Side(style=style, color=c)


AL_C = Alignment(horizontal="center", vertical="center", wrap_text=True)
AL_L = Alignment(horizontal="left", vertical="center", wrap_text=True, indent=1)
AL_R = Alignment(horizontal="right", vertical="center", indent=1)


# ------------------------------------------------------------------ noms
def set_name(name, ref):
    if name in wb.defined_names:
        del wb.defined_names[name]
    wb.defined_names[name] = DefinedName(name, attr_text=ref)


def del_name(name):
    if name in wb.defined_names:
        del wb.defined_names[name]


# ================================================================== 1. relevé de l'ancienne page
old = wb[PDJ]
keep = {
    "PAR_DEST": old["W25"].value,
    "OUV_DEBUT": old["B28"].value, "OUV_LANCEUR_NOM": old["G28"].value, "OUV_LANCEUR_H": old["I28"].value,
    "OUV_RPP_NOM": old["L28"].value, "OUV_RPP_H": old["N28"].value, "OUV_RHG_NOM": old["Q28"].value,
    "OUV_RHG_H": old["S28"].value, "OUV_RCA_NOM": old["B31"].value, "OUV_RCA_H": old["D31"].value,
}
idx = wb.sheetnames.index(PDJ)
code_name = old.sheet_properties.codeName
wb.remove(old)
for n in list(wb.defined_names.keys()):
    ref = wb.defined_names[n].attr_text or ""
    if "Point Du Jour" in ref or n in ("MAP",) or n.startswith("CHK_"):
        del wb.defined_names[n]
for n in ("PDJ_BTN1", "PDJ_BTN2", "PDJ_BTN3", "PDJ_BTN4", "PDJ_BTN5", "PDJ_G_PP", "PDJ_G_HG", "PDJ_G_CA", "PDJ_G_GL",
          "PDJ_PILOTE", "PDJ_INF_NOMS", "PDJ_INF_ROWS"):
    del_name(n)

ws = wb.create_sheet(PDJ, idx)
ws.sheet_properties.codeName = code_name
ws.sheet_properties.tabColor = NAVY
wb.active = idx
for s in wb.worksheets:
    s.sheet_view.tabSelected = (s.title == PDJ)
ws.sheet_view.showGridLines = False
ws.sheet_view.showRowColHeaders = False
ws.sheet_view.zoomScale = 100

# ------------------------------------------------------------------ grille
widths = {"A": 2.5, "N": 2.5, "S": 2.5}
for c in range(CI("B"), CI("M") + 1):
    widths[L(c)] = 11.3
for c in "OPQR":
    widths[c] = 12.5
for k, v in widths.items():
    ws.column_dimensions[k].width = v
heights = {1: 8, 2: 34, 3: 22, 4: 8, 5: 16, 6: 30, 7: 8, 8: 16, 9: 32, 10: 12, 11: 26, 12: 6, 13: 18, 14: 42, 15: 18,
           16: 8, 17: 18, 18: 42, 19: 18, 20: 12, 21: 26, 22: 6, 23: 24, 24: 40, 25: 18, 26: 19, 27: 19, 28: 19,
           29: 19, 30: 22, 31: 22, 32: 18, 33: 12, 34: 26, 35: 6, 36: 18, 37: 42, 38: 18, 39: 26, 40: 8, 41: 16,
           42: 24, 43: 12, 44: 26, 45: 6, 46: 26, 47: 18, 48: 22, 49: 22, 50: 22, 51: 22, 52: 16, 53: 10, 54: 34,
           55: 10}
for r, h in heights.items():
    ws.row_dimensions[r].height = h
LAST_ROW = 55
for r in range(1, LAST_ROW + 1):
    for c in range(1, CI("S") + 1):
        ws.cell(r, c).fill = fill(PAGE)
        ws.cell(r, c).font = font()


def box(rng, bg=CARD, border=LINE, top=None, left=None):
    """Fond + cadre fin autour d'une zone."""
    (c1, r1), (c2, r2) = _split(rng)
    for r in range(r1, r2 + 1):
        for c in range(c1, c2 + 1):
            cell = ws.cell(r, c)
            cell.fill = fill(bg)
            b = Border(
                left=side(left[0], left[1]) if (left and c == c1) else (side(border) if c == c1 and border else None),
                right=side(border) if c == c2 and border else None,
                top=side(top[0], top[1]) if (top and r == r1) else (side(border) if r == r1 and border else None),
                bottom=side(border) if r == r2 and border else None)
            cell.border = b


def _split(rng):
    a, b = rng.split(":") if ":" in rng else (rng, rng)
    ca, ra = re.match(r"([A-Z]+)(\d+)", a).groups()
    cb, rb = re.match(r"([A-Z]+)(\d+)", b).groups()
    return (CI(ca), int(ra)), (CI(cb), int(rb))


def put(rng, value, f=None, al=None, fmt=None, bg=None, merge=True):
    (c1, r1), (c2, r2) = _split(rng)
    if merge and (c1, r1) != (c2, r2):
        ws.merge_cells(rng)
    cell = ws.cell(r1, c1)
    cell.value = value
    if f:
        cell.font = f
    if al:
        cell.alignment = al
    if fmt:
        cell.number_format = fmt
    if bg:
        for r in range(r1, r2 + 1):
            for c in range(c1, c2 + 1):
                ws.cell(r, c).fill = fill(bg)
    return cell


INPUTS = []      # zones de saisie du jour (vidées par NOUVEAU_JOUR)


def inp(rng, value=None, fmt=None, size=11, bold=True, al=AL_C, daily=True, name=None):
    (c1, r1), (c2, r2) = _split(rng)
    for r in range(r1, r2 + 1):
        for c in range(c1, c2 + 1):
            ws.cell(r, c).fill = fill(INPUT)
            ws.cell(r, c).border = Border(left=side(INPUT_LINE), right=side(INPUT_LINE),
                                          top=side(INPUT_LINE), bottom=side(INPUT_LINE))
    cell = put(rng, value, font(size, bold, TXT), al, fmt)
    if name:
        set_name(name, Q + "$%s$%d" % (L(c1), r1))
    if daily:
        INPUTS.append("$%s$%d:$%s$%d" % (L(c1), r1, L(c2), r2) if (c1, r1) != (c2, r2) else "$%s$%d" % (L(c1), r1))
    return cell


def section(row, text):
    put("B%d:M%d" % (row, row), text, font(12, True, NAVY), Alignment(vertical="bottom", indent=0))
    for c in range(CI("B"), CI("M") + 1):
        ws.cell(row, c).border = Border(bottom=side(BLUE, "medium"))


def caption(rng, text, color=MUTED, al=None, size=8, bold=True):
    return put(rng, text, font(size, bold, color), al or Alignment(vertical="center", indent=0, wrap_text=True))


def tile(c1, c2, r_lab, label, r_val, value, r_sub, sub, fmt=None, val_color=TXT, input_val=False, name=None,
         val_size=22):
    rng_all = "%s%d:%s%d" % (c1, r_lab, c2, r_sub)
    box(rng_all)
    put("%s%d:%s%d" % (c1, r_lab, c2, r_lab), label, font(8, True, MUTED), Alignment(vertical="bottom", indent=1))
    if input_val:
        cell = inp("%s%d:%s%d" % (c1, r_val, c2, r_val), value, fmt, size=val_size, name=name)
    else:
        cell = put("%s%d:%s%d" % (c1, r_val, c2, r_val), value, font(val_size, True, val_color),
                   Alignment(horizontal="left", vertical="center", indent=1), fmt)
    if sub is not None:
        put("%s%d:%s%d" % (c1, r_sub, c2, r_sub), sub, font(8, False, MUTED),
            Alignment(vertical="top", indent=1, wrap_text=True))
    return cell


# ================================================================== 2. en-tête
for r in (2, 3):
    for c in range(CI("B"), CI("M") + 1):
        ws.cell(r, c).fill = fill(NAVY)
put("B2:H2", "POINT DU JOUR  ·  PRÉPARATION", font(17, True, "FFFFFF"), Alignment(vertical="center", indent=1))
put("B3:H3", '="CLR Champigneulles  ·  "&JOUR_LONG', font(10, False, "C7D2E3"), Alignment(vertical="center", indent=1))
put("I2:K2", "DATE DU POINT ▸", font(8, True, "8FB3FF"), Alignment(horizontal="right", vertical="center"))
inp("L2:M2", "=TODAY()", "dd/mm/yyyy", size=13, daily=False, name="PDJ_DATE_IN")
put("I3:M3", "=STATUT_TXT", font(9, True, "C7D2E3"), Alignment(horizontal="right", vertical="center", indent=1))

# ================================================================== 3. accès rapide (liens, sans macro)
caption("B5:G5", "ACCÈS RAPIDE  ·  pointage du jour (onglet du mois, colonne du jour)")
NAV = [("B6:C6", '=HYPERLINK(LIEN_PP,"▸  PICK & PACK")', SERV["PP"][1]),
       ("D6:E6", '=HYPERLINK(LIEN_HG,"▸  HORS GABARIT")', SERV["HG"][1]),
       ("F6:G6", '=HYPERLINK(LIEN_CA,"▸  CÂBLE")', SERV["CA"][1]),
       ("H6:I6", '=HYPERLINK(LIEN_MVT,"⇄  VENTILATION")', NAVY),
       ("J6:K6", '=HYPERLINK("#SYNTHESE!B1","∑  SYNTHÈSE")', NAVY),
       ("L6:M6", '=HYPERLINK("#PARAMETRES!B2","⚙  PARAMÈTRES")', MUTED)]
for rng, f_, col in NAV:
    (c1, r1), (c2, r2) = _split(rng)
    for c in range(c1, c2 + 1):
        ws.cell(r1, c).fill = fill(CARD)
        ws.cell(r1, c).border = Border(top=side(LINE), bottom=side(col, "thick"),
                                       left=side(LINE) if c == c1 else None, right=side(LINE) if c == c2 else None)
    put(rng, f_, font(10, True, col), AL_C)

caption("B8:M8", "ACTIONS  ·  remplir le pointage à 7,4 h (cases vides seulement, absences conservées)  →  actualiser LOGYS  →  préparer le mail")
put("B9:C9", "REMPLIR 7,4 h ▸", font(9, True, NAVY), Alignment(horizontal="right", vertical="center"))
# boutons dessinés (macros) posés par post-traitement : D9..M9

# ================================================================== 4. section 1 : synthèse
section(11, "1 · SYNTHÈSE DU JOUR")
tile("B", "D", 13, "ETP TOTAL  ·  tous services", 14, "=TOT_ETP", 15, '=FIXED(GL_HPREPA,1)&" h pointées · PP "&FIXED(PP_ETP,1)&" · HG "&FIXED(HG_ETP,1)&" · Câble "&FIXED(CA_ETP,1)', "0.0")
tile("E", "G", 13, "HEURES SUPP  ·  total", 14, "=TOT_HS", 15, '="PP "&FIXED(PP_HS,1)&" · HG "&FIXED(HG_HS,1)&" · Câble "&FIXED(CA_HS,1)', '0.0" h"')
tile("H", "J", 13, "LIGNES TOTALES", 14, '=IFERROR(GL_LIGNES,"—")', 15, '=IF(ISNUMBER(GL_CDE),"commande "&FIXED(GL_CDE,0)&" + cross dock "&FIXED(GL_XD,0),"LOGYS non actualisé")', "#,##0")
tile("K", "M", 13, "ÉTIQUETTES", 14, '=IFERROR(ETIQ,"—")', 15, None, "#,##0")
put("K15:L15", '=IF(ISNUMBER(ETIQ_IN),"saisie manuelle ▸","LOGYS · saisie si besoin ▸")', font(8, False, MUTED), Alignment(vertical="top", indent=1))
inp("M15", None, "#,##0", size=9, name="ETIQ_IN", al=Alignment(horizontal="center", vertical="top"))

tile("B", "D", 17, "LIGNES BLOQUÉES DU JOUR  ·  à saisir", 18, None, 19,
     '=IF(ISNUMBER(BLOQ_PCT),FIXED(BLOQ_PCT*100,1)&" % des lignes du jour","")', "#,##0", input_val=True, name="BLOQ_IN")
tile("E", "G", 17, "LIGNES SMC  ·  à saisir", 18, None, 19, "lignes SMC de la journée", "#,##0", input_val=True, name="SMC_IN")
tile("H", "J", 17, "SMC PASSÉES  ·  à saisir", 18, None, 19,
     '=IF(ISNUMBER(SMC_PASS_PCT),FIXED(SMC_PASS_PCT*100,1)&" % des lignes SMC","")', "#,##0", input_val=True, name="SMC_PASS_IN")
tile("K", "M", 17, "SMC BLOQUÉES  ·  à saisir", 18, None, 19,
     '=IF(ISNUMBER(SMC_BLOQ_PCT),FIXED(SMC_BLOQ_PCT*100,1)&" % des lignes SMC","")', "#,##0", input_val=True, name="SMC_BLOQ_IN")

# ================================================================== 5. section 2 : services
section(21, "2 · DÉTAIL PAR SERVICE")
CARDS = {"PP": ("B", "C", "D", "E"), "HG": ("F", "G", "H", "I"), "CA": ("J", "K", "L", "M")}
for k, (a, b, c, d) in CARDS.items():
    nom, col = SERV[k]
    box("%s23:%s32" % (a, d))
    for cc in (a, b, c, d):
        ws["%s23" % cc].fill = fill(col)
    put("%s23:%s23" % (a, d), "  " + nom, font(11, True, "FFFFFF"), Alignment(vertical="center", indent=1))
    put("%s24:%s24" % (a, d), '=IFERROR(%s_PROD,"—")' % k, font(24, True, TXT), AL_C, '0" lignes / ETP"')
    put("%s25:%s25" % (a, d),
        '="objectif "&FIXED(%s_OBJ,0)&IF(ISNUMBER(%s_ATT),"  ·  "&%s_DELTA_COURT&"  ·  "&FIXED(%s_ATT*100,0)&" %%","")' % (k, k, k, k),
        font(9, True, MUTED), AL_C)
    rows = [(26, "ETP", "=%s_ETP" % k, "0.0"),
            (27, "Lignes", '=IFERROR(%s_LIGNES,"—")' % k, "#,##0"),
            (28, "Heures pointées", "=%s_HEURES" % k, '0.0" h"'),
            (29, "Heures supp", "=%s_HS" % k, '0.0" h"')]
    for r, lab, f_, fmt in rows:
        put("%s%d:%s%d" % (a, r, b, r), lab, font(9, False, MUTED), Alignment(vertical="center", indent=1))
        put("%s%d:%s%d" % (c, r, d, r), f_, font(10, True, TXT), AL_R, fmt)
        for cc in (a, b, c, d):
            ws["%s%d" % (cc, r)].border = Border(
                bottom=side("EEF2F7"), left=side(LINE) if cc == a else None, right=side(LINE) if cc == d else None)
    put("%s30:%s30" % (a, b), "Fin de poste", font(9, True, TXT), Alignment(vertical="center", indent=1))
    inp("%s30:%s30" % (c, d), None, "hh:mm", size=11, name="%s_FIN_IN" % k)
    if k == "PP":
        put("%s31:%s31" % (a, b), "Fin du convoyeur", font(9, True, TXT), Alignment(vertical="center", indent=1))
        inp("%s31:%s31" % (c, d), None, "hh:mm", size=11, name="PP_CONV_IN")
    elif k == "CA":
        put("%s31:%s31" % (a, b), "Dévidages", font(9, True, TXT), Alignment(vertical="center", indent=1))
        inp("%s31:%s31" % (c, d), None, "0", size=11, name="CA_DEV_IN")
    put("%s32:%s32" % (a, d), "=%s_PIED_CARTE" % k, font(8, False, MUTED), Alignment(vertical="center", indent=1))

# ================================================================== 6. section 3 : projection
section(34, '="3 · PROJECTION  ·  "&UPPER(D2_TITRE)')
ws["B34"].value = '="3 · PROJECTION  ·  "&UPPER(D2_TITRE)'
tile("B", "D", 36, "ETP PRÉVUS  ·  planning", 37, "=GL_PE", 38, "=PREV_ETP_DET", "0.0")
tile("E", "G", 36, "LIGNES PRÉVUES  ·  à saisir", 37, None, 38,
     '=IF(ISNUMBER(GL_PL),"repère LOGYS : "&FIXED(GL_PL,0)&" (moy. 4 derniers "&D2_JOURS&")","")', "#,##0",
     input_val=True, name="PREV_LIG_IN")
tile("H", "J", 36, "ETP NÉCESSAIRES", 37, '=IFERROR(PREV_BESOIN,"—")', 38, '="à "&FIXED(GL_OBJ,0)&" lignes / ETP (objectif global)"', "0.0")
tile("K", "M", 36, "ÉCART  ·  ETP", 37, '=IFERROR(PREV_ECART,"—")', 38, '=IF(ISNUMBER(PREV_ECART),IF(PREV_ECART>=0,"positif : marge","négatif : renfort"),"")', '+0.0;−0.0;0.0')
put("B39:M39", "=PREV_VERDICT", font(11, True, MUTED), Alignment(horizontal="center", vertical="center"), bg="F1F5F9")

caption("B41", "Début")
caption("C41:D41", "Lanceur de vague")
caption("E41:F41", "Réception PP")
caption("G41:H41", "Réception HG")
caption("I41:J41", "Réception Câble")
caption("K41:M41", "OUVERTURE DE DEMAIN · facultatif, reprise dans le mail", SOFT, Alignment(horizontal="right", vertical="center"), 7, False)
inp("B42", keep["OUV_DEBUT"], "hh:mm", 10, daily=False, name="OUV_DEBUT")
for (cn, ch), key in zip((("C", "D"), ("E", "F"), ("G", "H"), ("I", "J")), ("LANCEUR", "RPP", "RHG", "RCA")):
    inp("%s42" % cn, keep["OUV_%s_NOM" % key], None, 10, daily=False, name="OUV_%s_NOM" % key)
    inp("%s42" % ch, keep["OUV_%s_H" % key], "hh:mm", 10, daily=False, name="OUV_%s_H" % key)

# ================================================================== 7. section 4 : infirmerie
section(44, "4 · INFIRMERIE")
put("B46:F46", "Y a-t-il eu des soins à l'infirmerie aujourd'hui ?", font(10, True, TXT), Alignment(vertical="center", indent=0))
inp("G46:H46", None, None, 11, name="INF_OUINON")
put("I46:M46", "=INF_TITRE", font(10, True, MUTED), Alignment(vertical="center", indent=1))
for rng, lab in (("B47", "Heure"), ("C47:D47", "Service"), ("E47:K47", "Nature du soin / circonstances"), ("L47:M47", "Accident du travail")):
    caption(rng, lab, al=Alignment(vertical="center", indent=1))
for r in range(48, 52):
    inp("B%d" % r, None, "hh:mm", 10, bold=False)
    inp("C%d:D%d" % (r, r), None, None, 10, bold=False)
    inp("E%d:K%d" % (r, r), None, None, 10, bold=False, al=Alignment(horizontal="left", vertical="center", indent=1))
    inp("L%d:M%d" % (r, r), None, None, 10, bold=False)
set_name("INF_HEURE", Q + "$B$48:$B$51")
set_name("INF_SERV", Q + "$C$48:$C$51")
set_name("INF_DESC", Q + "$E$48:$E$51")
set_name("INF_AT", Q + "$L$48:$L$51")
caption("B52:M52", "Pas de nom de salarié : données de santé (RGPD). Le détail nominatif reste au registre de l'infirmerie.", SOFT, size=7, bold=False)

put("B54:M54", "=PIED_TXT", font(7, False, SOFT), Alignment(vertical="top", wrap_text=True, indent=0))

# ================================================================== 8. panneau pilote (à droite)
for c in "OPQR":
    for r in (2, 3):
        ws["%s%d" % (c, r)].fill = fill(NAVY)
put("O2:R2", "PILOTE DU SOIR", font(12, True, "FFFFFF"), Alignment(vertical="center", indent=1))
put("O3:R3", '=IF(CHK_NB=0,"●  PRÊT À ENVOYER","●  "&CHK_NB&" POINT"&IF(CHK_NB>1,"S","")&" À VÉRIFIER")',
    font(10, True, "FFFFFF"), Alignment(vertical="center", indent=1))
caption("O5:R5", "CONTRÔLES AVANT ENVOI")
box("O6:R19")
put("O6:R19", "=CHK_TXT", font(9, False, TXT), Alignment(vertical="top", wrap_text=True, indent=1))
caption("O21:R21", "DESTINATAIRES DU MAIL  (séparés par ;)")
inp("O22:R25", keep["PAR_DEST"], None, 8, bold=False, daily=False, name="PAR_DEST",
    al=Alignment(horizontal="left", vertical="top", wrap_text=True, indent=1))
caption("O27:R27", "CHAQUE SOIR")
box("O28:R38")
put("O28:R38", "1.  REMPLIR 7,4 h (PP · HG · CÂBLE · TOUT) : remplit le pointage du jour à 7,4 h, puis corriger les absences et horaires différents.\n"
                "2.  Ventilation : prêts et aides du jour (onglet MOUVEMENTS).\n"
                "3.  Saisir les cases jaunes : fins de poste, convoyeur, dévidages, lignes bloquées, SMC, lignes prévues, infirmerie.\n"
                "4.  1 · ACTUALISER LOGYS.\n"
                "5.  2 · PRÉPARER LE MAIL : vérifier puis Envoyer.\n\n"
                "Le lendemain : NOUVEAU JOUR vide les saisies de la veille.",
    font(8, False, TXT), Alignment(vertical="top", wrap_text=True, indent=1))
caption("O40:R40", "OUTILS")
# boutons outils posés par post-traitement : O41:R46
put("O48:R48", '=HYPERLINK("#LIGNES_LOGYS!A1","▸  Détail des lignes LOGYS")', font(9, True, BLUE), Alignment(vertical="center", indent=1))
put("O49:R49", '=HYPERLINK("#MOUVEMENTS!A1","▸  Registre des mouvements")', font(9, True, BLUE), Alignment(vertical="center", indent=1))

# ------------------------------------------------------------------ validations
dv_time = DataValidation(type="list", formula1="LISTE_HEURES_FIN", allow_blank=True, errorStyle="warning",
                         error="Heure attendue (ex. 20:30).", errorTitle="Heure de fin", showErrorMessage=True)
for a in ("D30", "H30", "L30", "D31"):
    dv_time.add(a)
ws.add_data_validation(dv_time)
dv_n = DataValidation(type="whole", operator="greaterThanOrEqual", formula1="0", allow_blank=True,
                      error="Nombre entier positif attendu.", errorTitle="Saisie", showErrorMessage=True)
for a in ("B18", "E18", "H18", "K18", "E37", "M15", "L31"):
    dv_n.add(a)
ws.add_data_validation(dv_n)
dv_on = DataValidation(type="list", formula1='"OUI,NON"', allow_blank=True)
dv_on.add("G46")
for r in range(48, 52):
    dv_on.add("L%d" % r)
ws.add_data_validation(dv_on)
dv_s = DataValidation(type="list", formula1="LISTE_SERV_INF", allow_blank=True)
for r in range(48, 52):
    dv_s.add("C%d" % r)
ws.add_data_validation(dv_s)
dv_d = DataValidation(type="date", operator="greaterThan", formula1="40000", allow_blank=True)
dv_d.add("L2")
ws.add_data_validation(dv_d)
dv_eq = DataValidation(type="list", formula1="LISTE_EQUIPE", allow_blank=True, errorStyle="information", showErrorMessage=False)
for a in ("C42", "E42", "G42", "I42"):
    dv_eq.add(a)
ws.add_data_validation(dv_eq)
dv_hr = DataValidation(type="list", formula1="LISTE_HEURES_RECEP", allow_blank=True, errorStyle="information", showErrorMessage=False)
for a in ("D42", "F42", "H42", "J42"):
    dv_hr.add(a)
ws.add_data_validation(dv_hr)
dv_hd = DataValidation(type="list", formula1="LISTE_HEURES_DEBUT", allow_blank=True, errorStyle="information", showErrorMessage=False)
dv_hd.add("B42")
ws.add_data_validation(dv_hd)


# ------------------------------------------------------------------ mise en forme conditionnelle
def cf(rng, formula, color=None, bg=None, bold=None):
    f_ = Font(color=color, bold=bold) if color else None
    ws.conditional_formatting.add(rng, FormulaRule(formula=[formula], font=f_, fill=fill(bg) if bg else None, stopIfTrue=True))


for k, (a, b, c, d) in CARDS.items():
    for rng in ("%s24:%s25" % (a, d),):
        cf(rng, "NOT(ISNUMBER(%s_ATT))" % k, SOFT)
        cf(rng, "%s_ATT>=1" % k, OK_C)
        cf(rng, "%s_ATT>=0.9" % k, WARN_C)
        cf(rng, "%s_ATT<0.9" % k, BAD_C)
    cf("%s30" % c, "%s_LATE" % k, BAD_C, BAD_BG, True)
    cf("%s29" % c, "%s_HS>0" % k, WARN_C)
cf("C31", "PP_CONV_LATE", BAD_C, BAD_BG, True)
cf("E14", "TOT_HS>0", WARN_C)
cf("B18", "AND(ISNUMBER(BLOQ_IN),BLOQ_IN>0)", BAD_C)
cf("K18", "AND(ISNUMBER(SMC_BLOQ_IN),SMC_BLOQ_IN>0)", BAD_C)
cf("H18", "ISNUMBER(SMC_PASS_IN)", OK_C)
for rng in ("K37", "B39"):
    cf(rng, 'PREV_ETAT="ok"', OK_C, OK_BG if rng == "B39" else None)
    cf(rng, 'PREV_ETAT="warn"', WARN_C, WARN_BG if rng == "B39" else None)
    cf(rng, 'PREV_ETAT="bad"', BAD_C, BAD_BG if rng == "B39" else None)
cf("O3", "CHK_NB=0", "FFFFFF", "15803D")
cf("O3", "CHK_NB>0", "1F2937", "FBBF24")
cf("I3", "NOT(LOGYS_OK)", "FCA5A5")
cf("I46", 'INF_ETAT="none"', OK_C)
cf("I46", 'INF_ETAT="some"', WARN_C)
cf("I46", 'INF_ETAT="manque"', BAD_C)

# ------------------------------------------------------------------ noms de la page
set_name("PDJ_CAPTURE", Q + "$A$1:$N$55")
set_name("PDJ_SAISIES", ",".join(Q + a for a in INPUTS))
ws.print_area = "A1:S55"
ws.page_setup.orientation = "landscape"
ws.page_setup.fitToWidth = 1
ws.page_setup.fitToHeight = 1
ws.sheet_properties.pageSetUpPr.fitToPage = True
ws.freeze_panes = None

# ================================================================== 9. CALC
calc = wb["CALC"]
for r in range(1, 160):
    for c in range(CI("D"), CI("J") + 1):
        calc.cell(r, c).value = None
calc["E1"] = "MAIL_MAP : valeurs du mail ({{CLÉ}}) · type if = bloc gardé si VRAI"
calc["H1"] = "CONTRÔLES DU SOIR"

HELP = [
    ("LIEN_PP", '=IF(COL=0,"#\'Point Du Jour\'!A1","#\'"&MOIS&"\'!"&ADDRESS(8,COL))'),
    ("LIEN_HG", '=IF(COL=0,"#\'Point Du Jour\'!A1","#\'"&MOIS&"\'!"&ADDRESS(44,COL))'),
    ("LIEN_CA", '=IF(COL=0,"#\'Point Du Jour\'!A1","#\'"&MOIS&"\'!"&ADDRESS(70,COL))'),
    ("LIEN_MVT", '="#MOUVEMENTS!A"&(6+COUNTA(MOUVEMENTS!$A$6:$A$1005))'),
    ("TOT_ETP", "=PP_ETP+HG_ETP+CA_ETP"),
    ("TOT_HS", "=PP_HS+HG_HS+CA_HS"),
    ("TOT_TOURNEE", "=IF(LOGYS_OK,PP_LIGNES+HG_LIGNES+CA_LIGNES,NA())"),
    ("ETIQ", "=IF(ISNUMBER(ETIQ_IN),ETIQ_IN,TOT_TOURNEE)"),
    ("BLOQ", "=IF(ISNUMBER(BLOQ_IN),BLOQ_IN,NA())"),
    ("BLOQ_PCT", "=IF(AND(ISNUMBER(BLOQ_IN),LOGYS_OK),IF(GL_LIGNES>0,BLOQ_IN/GL_LIGNES,NA()),NA())"),
    ("SMC_PASS_PCT", "=IF(AND(ISNUMBER(SMC_PASS_IN),ISNUMBER(SMC_IN)),IF(SMC_IN>0,SMC_PASS_IN/SMC_IN,NA()),NA())"),
    ("SMC_BLOQ_PCT", "=IF(AND(ISNUMBER(SMC_BLOQ_IN),ISNUMBER(SMC_IN)),IF(SMC_IN>0,SMC_BLOQ_IN/SMC_IN,NA()),NA())"),
    ("PREV_BESOIN", "=IF(ISNUMBER(PREV_LIG_IN),PREV_LIG_IN/GL_OBJ,NA())"),
    ("PREV_ECART", "=IF(ISNUMBER(PREV_BESOIN),GL_PE-PREV_BESOIN,NA())"),
    ("PREV_ETAT", '=IF(OR(NOT(ISNUMBER(PREV_ECART)),GL_PE=0),"none",IF(PREV_ECART>=0,"ok",IF(PREV_ECART>=-1,"warn","bad")))'),
    ("PREV_VERDICT", '=IF(NOT(ISNUMBER(PREV_LIG_IN)),"Lignes prévues à saisir pour calculer l\'écart",IF(GL_PE=0,"Planning de demain vide",IF(PREV_ECART>=0,"Effectif suffisant  ·  marge de "&FIXED(PREV_ECART,1)&" ETP","Renfort nécessaire  ·  "&FIXED(-PREV_ECART,1)&" ETP  (≈ "&FIXED(-PREV_ECART*PAR_ETP_H,1)&" h)")))'),
    ("PREV_ETP_DET", '="PP "&FIXED(PP_PE,1)&" · HG "&FIXED(HG_PE,1)&" · Câble "&FIXED(CA_PE,1)&IF(GL_PH>PP_PH+HG_PH+CA_PH," · récep. "&FIXED((GL_PH-PP_PH-HG_PH-CA_PH)/PAR_ETP_H,1),"")'),
    ("PREV_DETAIL", '=IF(ISNUMBER(PREV_LIG_IN),FIXED(PREV_LIG_IN,0)&" lignes ÷ "&FIXED(GL_OBJ,0)&" lignes/ETP = "&FIXED(PREV_BESOIN,1)&" ETP nécessaires  ·  prévus "&FIXED(GL_PE,1)&" ("&PREV_ETP_DET&")","ETP prévus : "&PREV_ETP_DET)'),
    ("EXT_REC", '=SUMIFS(MOUVEMENTS!$D$6:$D$1005,MOUVEMENTS!$A$6:$A$1005,PDJ_DATE,MOUVEMENTS!$H$6:$H$1005,"Aide reçue")'),
    ("EXT_DON", '=SUMIFS(MOUVEMENTS!$D$6:$D$1005,MOUVEMENTS!$A$6:$A$1005,PDJ_DATE,MOUVEMENTS!$H$6:$H$1005,"Aide donnée")'),
    ("VENT_NB", '=COUNTIFS(MOUVEMENTS!$A$6:$A$1005,PDJ_DATE,MOUVEMENTS!$D$6:$D$1005,"<>")'),
    ("INF_NB", '=SUMPRODUCT(--((LEN(INF_HEURE&"")+LEN(INF_SERV&"")+LEN(INF_DESC&""))>0))'),
    ("INF_ETAT", '=IF(INF_NB>0,"some",IF(UPPER(TRIM(INF_OUINON&""))="NON","none",IF(UPPER(TRIM(INF_OUINON&""))="OUI","manque","na")))'),
    ("INF_TITRE", '=IF(INF_ETAT="some",INF_NB&IF(INF_NB>1," soins"," soin")&" à l\'infirmerie aujourd\'hui",IF(INF_ETAT="none","✓  Aucun soin à l\'infirmerie aujourd\'hui",IF(INF_ETAT="manque","⚠ Soins déclarés : détail à saisir dessous","Infirmerie : non renseigné")))'),
    ("OUV_TXT", '=MID(IF(ISNUMBER(OUV_DEBUT)," · début "&TEXT(HOUR(OUV_DEBUT),"00")&":"&TEXT(MINUTE(OUV_DEBUT),"00"),"")&IF(LEN(OUV_LANCEUR_NOM&"")>0," · lanceur "&OUV_LANCEUR_NOM&IF(ISNUMBER(OUV_LANCEUR_H)," "&TEXT(HOUR(OUV_LANCEUR_H),"00")&":"&TEXT(MINUTE(OUV_LANCEUR_H),"00"),""),"")&IF(LEN(OUV_RPP_NOM&"")>0," · récep. PP "&OUV_RPP_NOM&IF(ISNUMBER(OUV_RPP_H)," "&TEXT(HOUR(OUV_RPP_H),"00")&":"&TEXT(MINUTE(OUV_RPP_H),"00"),""),"")&IF(LEN(OUV_RHG_NOM&"")>0," · récep. HG "&OUV_RHG_NOM&IF(ISNUMBER(OUV_RHG_H)," "&TEXT(HOUR(OUV_RHG_H),"00")&":"&TEXT(MINUTE(OUV_RHG_H),"00"),""),"")&IF(LEN(OUV_RCA_NOM&"")>0," · récep. câble "&OUV_RCA_NOM&IF(ISNUMBER(OUV_RCA_H)," "&TEXT(HOUR(OUV_RCA_H),"00")&":"&TEXT(MINUTE(OUV_RCA_H),"00"),""),""),4,500)'),
]
calc["A158"] = "CALCULS v9 (compte rendu)"
calc["A158"].font = Font(bold=True)
row = 160
for name, f_ in HELP:
    calc.cell(row, 1, name)
    calc.cell(row, 2, f_)
    set_name(name, "CALC!$B$%d" % row)
    row += 1

# --- contrôles
CHK = [
    ("Pointage du jour saisi", "=GL_HPREPA>0", '"Pointage du jour saisi ("&FIXED(GL_HPREPA,1)&" h)"'),
    ("Heures de fin PP · HG · Câble", "=AND(ISNUMBER(PP_FIN_IN),ISNUMBER(HG_FIN_IN),ISNUMBER(CA_FIN_IN))", None),
    ("Fin du convoyeur", "=ISNUMBER(PP_CONV_IN)", None),
    ("Dévidages câble", "=ISNUMBER(CA_DEV_IN)", None),
    ("LOGYS actualisé", "=LOGYS_OK", None),
    ("Lignes bloquées et SMC saisies", "=AND(ISNUMBER(BLOQ_IN),ISNUMBER(SMC_IN),ISNUMBER(SMC_PASS_IN),ISNUMBER(SMC_BLOQ_IN))", None),
    ("Lignes prévues de demain", "=ISNUMBER(PREV_LIG_IN)", None),
    ("Infirmerie renseignée", '=OR(INF_ETAT="none",INF_ETAT="some")', None),
    ("Ventilation sans erreur", '=COUNTIF(MOUVEMENTS!$H$6:$H$1005,"⚠*")=0', None),
    ("Destinataires du mail", '=LEN(TRIM(PAR_DEST&""))>0', None),
]
parts = []
for i, (lab, f_, lab_f) in enumerate(CHK, start=1):
    r = 2 + i
    calc.cell(r, 8, lab)
    calc.cell(r, 9, "CHK_%d" % i)
    calc.cell(r, 10, f_)
    set_name("CHK_%d" % i, "CALC!$J$%d" % r)
    parts.append('IF(CHK_%d,"✓   ","✗   ")&%s' % (i, lab_f or '"%s"' % lab))
calc.cell(13, 9, "CHK_NB")
calc.cell(13, 10, "=COUNTIF(J3:J12,FALSE)")
set_name("CHK_NB", "CALC!$J$13")
calc.cell(14, 9, "CHK_TXT")
calc.cell(14, 10, "=" + '&CHAR(10)&CHAR(10)&'.join(parts))
set_name("CHK_TXT", "CALC!$J$14")
set_name("CHK_TABLE", "CALC!$H$3:$J$12")


# --- MAIL_MAP
def att_col(att, ok=OK_C, warn=WARN_C, bad=BAD_C, none="475569"):
    return '=IF(NOT(ISNUMBER(%s)),"#%s",IF(%s>=1,"#%s",IF(%s>=0.9,"#%s","#%s")))' % (att, none, att, ok, att, warn, bad)


def hhmm(x):
    return 'IF(ISNUMBER(%s),TEXT(HOUR(%s),"00")&":"&TEXT(MINUTE(%s),"00"),"—")' % (x, x, x)


MM = [
    ("PREHEADER", '="Global "&GL_PROD_TXT&" l/ETP (obj. "&FIXED(GL_OBJ,0)&") · ETP "&FIXED(TOT_ETP,1)&" · lignes "&IF(ISNUMBER(GL_LIGNES),FIXED(GL_LIGNES,0),"—")&" · demain : "&PREV_VERDICT', "txt"),
    ("SUBJECT", '="Point du jour prépa "&TEXT(DAY(PDJ_DATE),"00")&"/"&TEXT(MONTH(PDJ_DATE),"00")&" · Global "&GL_PROD_TXT&" l/ETP · "&FIXED(TOT_ETP,1)&" ETP · demain "&IF(ISNUMBER(PREV_ECART),IF(PREV_ECART>=0,"+","−")&FIXED(ABS(PREV_ECART),1)&" ETP","à saisir")', "txt"),
    ("JOUR", '=JOUR_TITRE&" "&YEAR(PDJ_DATE)', "txt"),
    ("RELEVE", '=IF(LOGYS_OK,"relevé LOGYS "&TEXT(HOUR(LL_MAJ),"00")&":"&TEXT(MINUTE(LL_MAJ),"00"),"LOGYS non actualisé")', "txt"),
    ("GL_PROD", "=GL_PROD_TXT", "txt"),
    ("GL_BADGE", '="obj. "&FIXED(GL_OBJ,0)&IF(ISNUMBER(GL_ATT)," · "&FIXED(GL_ATT*100,0)&" %","")', "txt"),
    ("GL_COL", att_col("GL_ATT", OK_C, WARN_C, BAD_C, "475569"), "txt"),
    ("GL_BG", att_col("GL_ATT", OK_BG, WARN_BG, BAD_BG, "E2E8F0"), "txt"),
    ("WARN", "=NOT(LOGYS_OK)", "if"),
    ("WARN_TXT", '="⚠ Lignes LOGYS non actualisées pour le "&TEXT(DAY(PDJ_DATE),"00")&"/"&TEXT(MONTH(PDJ_DATE),"00")&" : lignes et productivités incomplètes"', "txt"),
    ("TOT_ETP", "=FIXED(TOT_ETP,1)", "txt"),
    ("TOT_ETP_SUB", '=FIXED(GL_HPREPA,1)&" h pointées"', "txt"),
    ("TOT_HS", '=FIXED(TOT_HS,1)&" h"', "txt"),
    ("TOT_HS_SUB", '="PP "&FIXED(PP_HS,1)&" · HG "&FIXED(HG_HS,1)&" · Câble "&FIXED(CA_HS,1)', "txt"),
    ("TOT_HS_COL", '=IF(TOT_HS>0,"#B45309","#0F172A")', "txt"),
    ("TOT_LIG", '=IF(ISNUMBER(GL_LIGNES),FIXED(GL_LIGNES,0),"—")', "txt"),
    ("TOT_LIG_SUB", '=IF(ISNUMBER(GL_CDE),"commande "&FIXED(GL_CDE,0)&" + cross dock "&FIXED(GL_XD,0),"LOGYS non actualisé")', "txt"),
    ("ETIQ", '=IF(ISNUMBER(ETIQ),FIXED(ETIQ,0),"—")', "txt"),
    ("ETIQ_SUB", '=IF(ISNUMBER(ETIQ_IN),"saisie manuelle","lignes de tournée LOGYS")', "txt"),
    ("BLOQ", '=IF(ISNUMBER(BLOQ_IN),FIXED(BLOQ_IN,0),"non saisi")', "txt"),
    ("BLOQ_SUB", '=IF(ISNUMBER(BLOQ_PCT),FIXED(BLOQ_PCT*100,1)&" % des lignes du jour","saisie manuelle")', "txt"),
    ("BLOQ_COL", '=IF(ISNUMBER(BLOQ_IN),IF(BLOQ_IN>0,"#B91C1C","#15803D"),"#94A3B8")', "txt"),
    ("SMC", '=IF(ISNUMBER(SMC_IN),FIXED(SMC_IN,0),"—")', "txt"),
    ("SMC_PASS", '=IF(ISNUMBER(SMC_PASS_IN),FIXED(SMC_PASS_IN,0),"—")', "txt"),
    ("SMC_PASS_PCT", '=IF(ISNUMBER(SMC_PASS_PCT),FIXED(SMC_PASS_PCT*100,1)&" %"," ")', "txt"),
    ("SMC_BLOQ", '=IF(ISNUMBER(SMC_BLOQ_IN),FIXED(SMC_BLOQ_IN,0),"—")', "txt"),
    ("SMC_BLOQ_PCT", '=IF(ISNUMBER(SMC_BLOQ_PCT),FIXED(SMC_BLOQ_PCT*100,1)&" %"," ")', "txt"),
    ("SMC_BLOQ_COL", '=IF(ISNUMBER(SMC_BLOQ_IN),IF(SMC_BLOQ_IN>0,"#B91C1C","#15803D"),"#0F172A")', "txt"),
]
for k in ("PP", "HG", "CA"):
    MM += [
        ("%s_OBJ" % k, "=FIXED(%s_OBJ,0)" % k, "txt"),
        ("%s_PROD" % k, "=%s_PROD_TXT" % k, "txt"),
        ("%s_COL" % k, att_col("%s_ATT" % k), "txt"),
        ("%s_BG" % k, att_col("%s_ATT" % k, OK_BG, WARN_BG, BAD_BG, "E2E8F0"), "txt"),
        ("%s_BADGE" % k, '=IF(ISNUMBER(%s_ATT),%s_DELTA_COURT&" · "&FIXED(%s_ATT*100,0)&" %%","LOGYS non actualisé")' % (k, k, k), "txt"),
        ("%s_ETP" % k, "=FIXED(%s_ETP,1)" % k, "txt"),
        ("%s_LIG" % k, '=IF(ISNUMBER(%s_LIGNES),FIXED(%s_LIGNES,0),"—")' % (k, k), "txt"),
        ("%s_HS" % k, '=FIXED(%s_HS,1)&" h"' % k, "txt"),
        ("%s_HS_COL" % k, '=IF(%s_HS>0,"#B45309","#0F172A")' % k, "txt"),
        ("%s_FIN" % k, "=" + hhmm("%s_FIN_IN" % k), "txt"),
        ("%s_FIN_COL" % k, '=IF(%s_LATE,"#B91C1C","#0F172A")' % k, "txt"),
        ("%s_MVT_ON" % k, '=%s_PIED_CARTE<>""' % k, "if"),
        ("%s_MVT" % k, "=%s_PIED_CARTE" % k, "txt"),
    ]
MM += [
    ("PP_CONV", "=" + hhmm("PP_CONV_IN"), "txt"),
    ("PP_CONV_COL", '=IF(PP_CONV_LATE,"#B91C1C","#0F172A")', "txt"),
    ("CA_DEV", '=IF(ISNUMBER(CA_DEV_IN),FIXED(CA_DEV_IN,0),"non saisi")', "txt"),
    ("D2_TITRE", "=UPPER(D2_TITRE)", "txt"),
    ("PREV_ETP", "=FIXED(GL_PE,1)", "txt"),
    ("PREV_LIG", '=IF(ISNUMBER(PREV_LIG_IN),FIXED(PREV_LIG_IN,0),"—")', "txt"),
    ("PREV_LIG_SUB", '=IF(ISNUMBER(PREV_LIG_IN),"saisie du soir","à saisir")', "txt"),
    ("PREV_ECART", '=IF(ISNUMBER(PREV_ECART),IF(PREV_ECART>=0,"+","−")&FIXED(ABS(PREV_ECART),1),"—")', "txt"),
    ("PREV_COL", '=IF(PREV_ETAT="ok","#15803D",IF(PREV_ETAT="warn","#B45309",IF(PREV_ETAT="bad","#B91C1C","#475569")))', "txt"),
    ("PREV_BG", '=IF(PREV_ETAT="ok","#DCFCE7",IF(PREV_ETAT="warn","#FEF3C7",IF(PREV_ETAT="bad","#FEE2E2","#F1F5F9")))', "txt"),
    ("PREV_VERDICT", "=PREV_VERDICT", "txt"),
    ("PREV_DETAIL", "=PREV_DETAIL", "txt"),
    ("OUV_ON", '=LEN(OUV_TXT)>0', "if"),
    ("OUV_TXT", "=OUV_TXT", "txt"),
    ("INF_COL", '=IF(INF_ETAT="none","#15803D",IF(INF_ETAT="some","#B45309",IF(INF_ETAT="manque","#B91C1C","#94A3B8")))', "txt"),
    ("INF_TITRE", "=INF_TITRE", "txt"),
]
for i in range(1, 5):
    r = 47 + i
    cond = '(LEN(%sB%d&"")+LEN(%sC%d&"")+LEN(%sE%d&""))>0' % (Q, r, Q, r, Q, r)
    MM += [
        ("INF%d" % i, "=" + cond, "if"),
        ("INF%d_TETE" % i, '=IF(ISNUMBER(%sB%d),TEXT(HOUR(%sB%d),"00")&":"&TEXT(MINUTE(%sB%d),"00")&" · ","")&IF(%sC%d="","service non précisé",%sC%d&"")&IF(UPPER(%sL%d&"")="OUI"," · accident du travail","")' % (Q, r, Q, r, Q, r, Q, r, Q, r, Q, r), "txt"),
        ("INF%d_DESC" % i, '=IF(TRIM(%sE%d&"")="","nature du soin non précisée",TRIM(%sE%d&""))' % (Q, r, Q, r), "txt"),
    ]
MM += [("PIED", "=PIED_TXT", "txt")]
for k, rec, pre in (("PP", "PP_ENT", "-PP_SOR"), ("HG", "HG_ENT", "-HG_SOR"), ("CA", "CA_ENT", "-CA_SOR"), ("EXT", "EXT_REC", "EXT_DON")):
    sol = "(%s)-(%s)" % (rec, pre)
    MM += [
        ("%s_REC" % k, '=IF(ABS(%s)<0.001,"—","+"&FIXED(%s,1)&" h")' % (rec, rec), "txt"),
        ("%s_PRE" % k, '=IF(ABS(%s)<0.001,"—","−"&FIXED(%s,1)&" h")' % (pre, pre), "txt"),
        ("%s_SOL" % k, '=IF(ABS(%s)<0.001,FIXED(0,1)&" h",IF(%s>0,"+","−")&FIXED(ABS(%s),1)&" h")' % (sol, sol, sol), "txt"),
        ("%s_SOL_COL" % k, '=IF(ABS(%s)<0.001,"#64748B",IF(%s>0,"#15803D","#B45309"))' % (sol, sol), "txt"),
    ]
MM += [
    ("VENT_ON", "=VENT_NB>0", "if"),
    ("VENT_NONE", "=VENT_NB=0", "if"),
    ("VENT_NB", '=VENT_NB&IF(VENT_NB>1," échanges"," échange")', "txt"),
]
for i, (k, f_, t) in enumerate(MM):
    r = 3 + i
    calc.cell(r, 5, k)
    calc.cell(r, 6, f_)
    calc.cell(r, 7, t)
assert 3 + len(MM) < 158
set_name("MAIL_MAP", "CALC!$E$3:$G$%d" % (2 + len(MM)))
calc["B123"] = ('="Lignes de service = lignes de tournée préparées LOGYS (PP = détail + carton · Câble = câble · HG = le reste). '
                'Lignes totales = lignes de commande + cross dock. Étiquettes = lignes de tournée (ou saisie). ETP = heures / "&FIXED(PAR_ETP_H,1)&" h. '
                'Écart de demain = ETP prévus au planning (case vide = "&FIXED(PAR_ETP_H,1)&" h, réception incluse) − lignes prévues ÷ objectif global."')

# ================================================================== 10. onglets mois
NAMES_ROWS = {"PP": (8, 37), "HG": (44, 63), "CA": (70, 83)}
LINK_FONT = font(9, True, BLUE)
for mname in ("OCT", "NOV", "DEC"):
    m = wb[mname]
    m.freeze_panes = "E7"
    # liens
    m["A4"] = '=HYPERLINK("#\'Point Du Jour\'!A1","↩  ACCUEIL")'
    m["A4"].font = LINK_FONT
    m["B4"] = '=HYPERLINK(LIEN_MVT,"⇄  VENTILATION")'
    m["B4"].font = LINK_FONT
    m.row_dimensions[4].height = 18
    for r in (7, 43, 69):
        m.row_dimensions[r].height = 22
    # heures prévues : une ligne avec seulement un prénom compte aussi (case vide = 7,4 h)
    for rr, (r1, r2) in zip((96, 97, 98), NAMES_ROWS.values()):
        for c in range(CI("E"), CI("AI") + 1):
            col = L(c)
            m["%s%d" % (col, rr)] = ('=SUM({c}{a}:{c}{b})+PAR_ETP_H*SUMPRODUCT(((($A${a}:$A${b}<>"")+($B${a}:$B${b}<>""))>0)*({c}{a}:{c}{b}=""))'
                                     .format(c=col, a=r1, b=r2))
    m["A96"] = "Heures prévues PP (case vide = 7,4 h, nom ou prénom renseigné)"
    m["A97"] = "Heures prévues HG (case vide = 7,4 h, nom ou prénom renseigné)"
    m["A98"] = "Heures prévues Câble (case vide = 7,4 h, nom ou prénom renseigné)"
    # mises en forme conditionnelles : on garde les règles, sur des plages propres
    rules = []
    seen = set()
    for cfr in m.conditional_formatting:
        for rule in cfr.rules:
            fml = rule.formula[0] if rule.formula else ""
            key = (fml, str(cfr.sqref).startswith("E5"))
            if fml.startswith("AND(ISNUMBER(AD$6)") or key in seen:
                continue
            seen.add(key)
            rules.append((str(cfr.sqref), rule))
    m.conditional_formatting = type(m.conditional_formatting)()
    for sq, rule in rules:
        fml = rule.formula[0]
        r2 = copy.copy(rule)
        if fml == 'CELL("row")=ROW()':
            sq = "A8:AJ37 A44:AJ63 A70:AJ83"
        elif sq.startswith("E5"):
            sq = "E5:AI6"
        elif "$A8" in fml:
            sq = "E8:AI37"
            r2.formula = ['AND(ISNUMBER(E$6),E$6=PDJ_D2,OR($A8<>"",$B8<>""),E8="")']
        elif "$A44" in fml:
            sq = "E44:AI63"
            r2.formula = ['AND(ISNUMBER(E$6),E$6=PDJ_D2,OR($A44<>"",$B44<>""),E44="")']
        elif "$A70" in fml:
            sq = "E70:AI83"
            r2.formula = ['AND(ISNUMBER(E$6),E$6=PDJ_D2,OR($A70<>"",$B70<>""),E70="")']
        else:
            sq = "E7:AI98"
        m.conditional_formatting.add(sq, r2)
    # contrôle de saisie (avertissement seulement)
    dv = DataValidation(type="custom", formula1='OR(E8="",AND(ISNUMBER(E8),E8>=0,E8<=14),ISNUMBER(MATCH(E8,LISTE_ABS,0)))',
                        allow_blank=True, errorStyle="warning", showErrorMessage=True, errorTitle="Pointage",
                        error="Heures en centièmes (0 à 14, ex. 7,4) ou code absence : CP CO RTT MAL AT ABS FOR DEL.")
    dv.add("E8:AI37")
    m.add_data_validation(dv)
    for (r1, r2) in ((44, 63), (70, 83)):
        dv2 = DataValidation(type="custom",
                             formula1='OR(E{r}="",AND(ISNUMBER(E{r}),E{r}>=0,E{r}<=14),ISNUMBER(MATCH(E{r},LISTE_ABS,0)))'.format(r=r1),
                             allow_blank=True, errorStyle="warning", showErrorMessage=True, errorTitle="Pointage",
                             error="Heures en centièmes (0 à 14, ex. 7,4) ou code absence : CP CO RTT MAL AT ABS FOR DEL.")
        dv2.add("E%d:AI%d" % (r1, r2))
        m.add_data_validation(dv2)

# ================================================================== 11. SYNTHESE / MOUVEMENTS / PARAMETRES / LOGYS
syn = wb["SYNTHESE"]
syn["C3"] = "=PDJ_DATE"
for r in range(15, 27):
    k = r - 14
    for col, src in (("B", "B"), ("C", "C"), ("F", "H"), ("H", "E"), ("K", "F")):
        syn["%s%d" % (col, r)] = ('=IFERROR(INDEX(MOUVEMENTS!${s}$6:${s}$1005,MATCH({k},MOUVEMENTS!$K$6:$K$1005,0))&"","")'
                                  .format(s=src, k=k))
    syn["E%d" % r] = '=IFERROR(INDEX(MOUVEMENTS!$D$6:$D$1005,MATCH({k},MOUVEMENTS!$K$6:$K$1005,0)),"")'.format(k=k)
syn["K1"] = '=HYPERLINK("#\'Point Du Jour\'!A1","↩  ACCUEIL")'
syn["K1"].font = LINK_FONT

mv = wb["MOUVEMENTS"]
mv.freeze_panes = "A6"
mv["J1"] = '=HYPERLINK("#\'Point Du Jour\'!A1","↩  ACCUEIL")'
mv["J1"].font = LINK_FONT

par = wb["PARAMETRES"]
par["B23"] = "COULEURS DU COMPTE RENDU (non modifiables)"
par["B24"] = "Productivité : rouge < 90 % de l'objectif · ambre 90 à 99 % · vert ≥ 100 %. Écart de demain : vert ≥ 0 · ambre jusqu'à −1 ETP · rouge au-delà."
par["F2"] = '=HYPERLINK("#\'Point Du Jour\'!A1","↩  ACCUEIL")'
par["F2"].font = LINK_FONT
if SANS_CNX:
    par["C31"] = None

ll = wb["LIGNES_LOGYS"]
ll["J1"] = '=HYPERLINK("#\'Point Du Jour\'!A1","↩  ACCUEIL")'
ll["J1"].font = LINK_FONT

for n in ("MAIL_TPL", "GAUGES"):
    s = wb[n]
    for row_ in s.iter_rows():
        for c in row_:
            c.value = None
    s["A1"] = "Onglet conservé pour compatibilité (v8). Inutilisé en v9."
    s.sheet_state = "veryHidden"
wb["CALC"].sheet_state = "hidden"

# ================================================================== 12. valeurs d'exemple (aperçu)
if EXEMPLE:
    vals = {"D30": datetime.time(20, 30), "H30": datetime.time(20, 40), "L30": datetime.time(20, 15),
            "D31": datetime.time(21, 0), "L31": 14, "B18": 37, "E18": 1647, "H18": 1588, "K18": 59,
            "E37": 9300, "G46": "OUI", "B48": datetime.time(14, 20), "C48": "PP",
            "E48": "Petite coupure à l'index en ouvrant un carton · pansement", "L48": "NON"}
    for a, v in vals.items():
        ws[a] = v
    ws["L2"] = datetime.date(2026, 10, 30)
    mvx = wb["MOUVEMENTS"]
    rr = 6
    while mvx.cell(rr, 1).value is not None:
        rr += 1
    for j, row_ in enumerate(((datetime.datetime(2026, 10, 30), "Réception", "PP", 3.5, "Jérôme R.", "Renfort fin de vague"),
                              (datetime.datetime(2026, 10, 30), "HG", "Expédition", 2, "Patrice", "Chargement camion"))):
        for k_, v_ in enumerate(row_, start=1):
            mvx.cell(rr + j, k_).value = v_

wb.calculation.fullCalcOnLoad = True
wb.save(OUT)
open(OUT + ".inputs.txt", "w").write(",".join(INPUTS))
print("ok", OUT, len(MM), "clés mail")
