"""Refonte visuelle de PP_LIVE.xlsx — aucune cellule déplacée, tous les noms définis conservés."""
import sys, openpyxl
from openpyxl.styles import Font, PatternFill, Border, Side, Alignment
from openpyxl.formatting.rule import FormulaRule, CellIsRule, DataBarRule
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.comments import Comment
from openpyxl.styles.differential import DifferentialStyle

src, dst = sys.argv[1], sys.argv[2]
wb = openpyxl.load_workbook(src)

# ---------- charte ----------
NAVY, BLUE, SKY, INK, GREY, LINE = '0B2A5B', '1F5FBF', 'DCE7F7', '1F2937', '6B7280', 'D5DCE6'
INPUT_BG, INPUT_LINE, CALC_BG, WHITE = 'FFF4CC', 'E3C55A', 'F3F6FA', 'FFFFFF'
OK, WARN, BAD = '1E9E5A', 'D9822B', 'D93848'
OK_BG, WARN_BG, BAD_BG = 'DDF5E8', 'FDEBD3', 'FBDDE0'
F = 'Segoe UI'
fill = lambda c: PatternFill('solid', fgColor=c)
thin = lambda c: Side(style='thin', color=c)
B_IN = Border(left=thin(INPUT_LINE), right=thin(INPUT_LINE), top=thin(INPUT_LINE), bottom=thin(INPUT_LINE))
B_CALC = Border(bottom=thin(LINE))
B_SEC = Border(bottom=Side(style='medium', color=BLUE))
B_HEAD = Border(bottom=Side(style='medium', color=NAVY))
NONE = Border()

ROLES = {  # (fond, couleur police, gras, italique, taille) d'origine -> rôle
    ('FF0D1117', 'FFC9D1D9'): 'label', ('FF1F2A37', 'FF58D5FF'): 'input', ('FF161B22', 'FFC9D1D9'): 'calc',
    ('FF21262D', 'FFF0F6FC'): 'head', ('FF0D1117', 'FF8B949E'): 'note', ('FF21262D', 'FFC9D1D9'): 'sec',
    ('FF1F2A37', 'FF8B949E'): 'input_ex', ('FF21262D', 'FFA371F7'): 'sec', ('FF161B22', 'FFF0F6FC'): 'calc_b',
    ('FF161B22', 'FF58D5FF'): 'calc_b', ('FF21262D', 'FF58A6FF'): 'sec', ('FF0D1117', 'FFF0F6FC'): 'label_b',
    ('FF161B22', 'FF8B949E'): 'kpi_lab', ('FF161B22', 'FFF0883E'): 'total', ('FF0D1117', 'FFF0883E'): 'label_o',
    ('FF161B22', 'FF3FB950'): 'kpi', ('FF21262D', 'FF3FB950'): 'sec',
}

def style(c, role, size):
    h = c.alignment.horizontal; wrap = c.alignment.wrap_text
    if role == 'label':
        c.fill = fill(WHITE); c.font = Font(name=F, size=10, color=INK, bold=c.font.b); c.border = NONE
    elif role == 'label_b':
        c.fill = fill(WHITE); c.font = Font(name=F, size=10, color=NAVY, bold=True); c.border = NONE
    elif role == 'label_o':
        c.fill = fill(WHITE); c.font = Font(name=F, size=size, color=WARN, bold=True); c.border = NONE
    elif role == 'note':
        c.fill = fill(WHITE); c.font = Font(name=F, size=9, color=GREY, italic=True); c.border = NONE
    elif role in ('input', 'input_ex'):
        c.fill = fill(INPUT_BG); c.border = B_IN
        c.font = Font(name=F, size=10, color=NAVY, bold=True, italic=(role == 'input_ex'))
        c.protection = c.protection.copy(locked=False)
    elif role == 'calc':
        c.fill = fill(CALC_BG); c.font = Font(name=F, size=10, color=INK); c.border = B_CALC
    elif role == 'calc_b':
        c.fill = fill(CALC_BG); c.font = Font(name=F, size=10, color=NAVY, bold=True); c.border = B_CALC
    elif role == 'head':
        c.fill = fill(NAVY); c.font = Font(name=F, size=9, color=WHITE, bold=True); c.border = NONE
        c.alignment = Alignment(horizontal=h or 'left', vertical='center', wrap_text=True); return
    elif role == 'sec':
        c.fill = fill(SKY); c.font = Font(name=F, size=10, color=NAVY, bold=True); c.border = B_SEC
    elif role == 'kpi_lab':
        c.fill = fill(WHITE); c.font = Font(name=F, size=8, color=GREY, bold=True); c.border = NONE
    elif role == 'kpi':
        c.fill = fill(WHITE); c.font = Font(name=F, size=20, color=NAVY, bold=True); c.border = NONE
    elif role == 'total':
        c.fill = fill(NAVY); c.font = Font(name=F, size=11, color=WHITE, bold=True); c.border = NONE
    c.alignment = Alignment(horizontal=h, vertical='center', wrap_text=wrap, indent=c.alignment.indent)

def title(ws, ref, sub=None, width_cols=None):
    c = ws[ref]
    c.font = Font(name=F, size=18, color=WHITE, bold=True); c.fill = fill(NAVY)
    c.alignment = Alignment(vertical='center', indent=1)
    ws.row_dimensions[c.row].height = 36
    for col in range(1, (width_cols or ws.max_column) + 1):
        ws.cell(c.row, col).fill = fill(NAVY)
    if sub:
        s = ws[sub]; s.font = Font(name=F, size=9, color=GREY, italic=True); s.fill = fill(WHITE)
        s.alignment = Alignment(vertical='center', indent=1)
        ws.row_dimensions[s.row].height = 20

for ws in wb:
    for row in ws.iter_rows():
        for c in row:
            if not c.fill.fill_type: continue
            k = (c.fill.fgColor.rgb, c.font.color.rgb if c.font.color else None)
            role = ROLES.get(k)
            if role: style(c, role, c.font.sz)
    ws.sheet_view.showGridLines = False
    ws.sheet_view.zoomScale = 110 if ws.title in ('PARAMETRES', 'EQUIPE', 'SAISIE', 'CONTROLE') else 100
    # impression : paysage, une page en largeur, titres répétés
    ws.page_setup.orientation = 'landscape'; ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.fitToWidth = 1; ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.print_options.horizontalCentered = True
    ws.page_margins.left = ws.page_margins.right = 0.4; ws.page_margins.top = ws.page_margins.bottom = 0.5
    ws.oddFooter.left.text = 'PP LIVE — &A'; ws.oddFooter.right.text = 'Page &P / &N'; ws.oddFooter.center.text = 'Imprimé le &D à &T'

# couleurs d'onglets : saisie quotidienne en orange, paramétrage en bleu, données brutes en gris
TABS = {'PARAMETRES': NAVY, 'EQUIPE': OK, 'SAISIE': 'F28C28', 'CONTROLE': BLUE,
        'CADENCES': '9AA5B1', 'TOURS': '9AA5B1', 'REJETS': '9AA5B1', 'DIAG': '9AA5B1'}
for n, col in TABS.items(): wb[n].sheet_properties.tabColor = col

# ================= PARAMETRES =================
ws = wb['PARAMETRES']
title(ws, 'A1', 'A2', 4)
ws['A2'] = 'Cellules jaunes = modifiables. Tout le reste du classeur et les macros lisent ces valeurs par leur nom (colonne C) : ne pas déplacer de lignes.'
ws.column_dimensions['A'].width = 52; ws.column_dimensions['B'].width = 46
ws.column_dimensions['C'].width = 24; ws.column_dimensions['D'].width = 62
for r in range(5, 71):
    c = ws.cell(r, 3)
    if isinstance(c.value, str) and c.value.startswith(('P_', 'T_')):
        c.font = Font(name='Consolas', size=8, color='94A3B8')
    if r in (5, 15, 22, 32, 41, 51, 58):
        ws.row_dimensions[r].height = 22
        for col in range(1, 5): ws.cell(r, col).fill = fill(SKY); ws.cell(r, col).border = B_SEC
for r in (16, 18):  # chemins à renseigner : alerte visuelle
    ws.conditional_formatting.add(f'B{r}', FormulaRule(formula=[f'$B${r}="À RENSEIGNER"'],
        fill=fill(BAD_BG), font=Font(color=BAD, bold=True)))
# heures : format et contrôle
for r in [12] + list(range(23, 31)):
    ws.cell(r, 2).number_format = 'hh:mm'
dv_h = DataValidation(type='time', operator='between', formula1='0.25', formula2='0.99',
                      showErrorMessage=True, errorTitle='Heure invalide', error='Saisir une heure entre 06:00 et 23:45 (ex. 13:06).')
dv_h.add('B12'); dv_h.add('B23:B30'); ws.add_data_validation(dv_h)
dv_n = DataValidation(type='decimal', operator='greaterThanOrEqual', formula1='0',
                      showErrorMessage=True, errorTitle='Valeur invalide', error='Nombre positif attendu.')
dv_n.add('B13'); dv_n.add('B33:B49'); ws.add_data_validation(dv_n)
dv_c = DataValidation(type='decimal', operator='between', formula1='0', formula2='1', showErrorMessage=True,
                      errorTitle='Coefficient', error='Coefficient entre 0 et 1 (0,5 = 50 %).')
dv_c.add('B52:B56'); ws.add_data_validation(dv_c)
for r in range(52, 57): ws.cell(r, 2).number_format = '0%'
for r in (33, 34, 35, 36, 37): ws.cell(r, 2).number_format = '# ##0'
# contrôle de cohérence des seuils (orange < rouge, pauses dans l'ordre)
ws.conditional_formatting.add('B36:B37', FormulaRule(formula=['$B$36>=$B$37'], fill=fill(BAD_BG), font=Font(color=BAD, bold=True)))
ws.conditional_formatting.add('B38:B39', FormulaRule(formula=['$B$38>=$B$39'], fill=fill(BAD_BG), font=Font(color=BAD, bold=True)))
ws.conditional_formatting.add('B46:B47', FormulaRule(formula=['$B$46>=$B$47'], fill=fill(BAD_BG), font=Font(color=BAD, bold=True)))
ws.conditional_formatting.add('B27:B30', FormulaRule(formula=['OR($B$27>=$B$28,$B$28>$B$29,$B$29>=$B$30)'], fill=fill(BAD_BG), font=Font(color=BAD, bold=True)))
ws['D36'].value = ws['D36'].value  # notes conservées
ws['B8'].comment = Comment('Laisser vide si possible : le mot de passe est stocké en clair dans le classeur.', 'PP LIVE')
ws.freeze_panes = 'A4'

# ================= EQUIPE =================
ws = wb['EQUIPE']
title(ws, 'A1', 'A2', 14)
ws.row_dimensions[2].height = 30; ws['A2'].alignment = Alignment(wrap_text=True, vertical='center', indent=1)
ws.merge_cells('A2:N2')
# cartes KPI ligne 3-4
cards = [('A', 'C', OK), ('D', 'G', BLUE), ('H', 'J', 'F28C28'), ('K', 'N', NAVY)]
from openpyxl.utils import column_index_from_string as ci
for a, b, col in cards:
    ws.merge_cells(f'{a}3:{b}3'); ws.merge_cells(f'{a}4:{b}4')
    for r in (3, 4):
        for k in range(ci(a), ci(b) + 1):
            c = ws.cell(r, k); c.fill = fill('F7F9FC')
            c.border = Border(left=Side(style='thick', color=col) if k == ci(a) else None,
                              top=thin(LINE) if r == 3 else None, bottom=thin(LINE) if r == 4 else None,
                              right=thin(LINE) if k == ci(b) else None)
    ws[f'{a}3'].font = Font(name=F, size=8, color=GREY, bold=True); ws[f'{a}3'].alignment = Alignment(horizontal='left', indent=1, vertical='bottom')
    ws[f'{a}4'].font = Font(name=F, size=22, color=col, bold=True); ws[f'{a}4'].alignment = Alignment(horizontal='left', indent=1, vertical='center')
ws.row_dimensions[3].height = 18; ws.row_dimensions[4].height = 34
ws['D4'].number_format = '# ##0" l/h"'
ws['I5'].font = Font(name=F, size=8, color=GREY, italic=True); ws['I5'].fill = fill(WHITE)
ws.row_dimensions[6].height = 34
for k in range(1, 15):
    c = ws.cell(6, k); c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    if k >= 9: c.fill = fill('3B4A63')  # colonnes calculées : en-tête plus clair
ws['A37'].font = Font(name=F, size=9, color=NAVY, bold=True)
for k in range(1, 15): ws.cell(37, k).fill = fill(SKY); ws.cell(37, k).border = B_SEC
ws.row_dimensions[37].height = 22
widths = {'A': 11, 'B': 26, 'C': 10, 'D': 13, 'E': 9, 'F': 9, 'G': 9, 'H': 12, 'I': 7, 'J': 12, 'K': 9, 'L': 9, 'M': 12, 'N': 13}
for k, v in widths.items(): ws.column_dimensions[k].width = v
for rng in ('7:36', '38:47'):
    a, b = map(int, rng.split(':'))
    for r in range(a, b + 1):
        ws.row_dimensions[r].height = 18
        for k in 'CEFGIJKLMN': ws[f'{k}{r}'].alignment = Alignment(horizontal='center', vertical='center')
        ws[f'F{r}'].number_format = ws[f'G{r}'].number_format = 'hh:mm'
        for k in 'JMN': ws[f'{k}{r}'].number_format = '0.0'
        ws[f'N{r}'].number_format = '0'
# remplace les anciennes règles (pensées pour fond sombre)
ws.conditional_formatting = type(ws.conditional_formatting)()
for a, b in ((7, 36), (38, 47)):
    R = f'A{a}:N{b}'
    ws.conditional_formatting.add(R, FormulaRule(formula=[f'AND($A{a}<>"",NOT(OR($E{a}=TRUE,$E{a}="OUI")),$F{a}<>"")'],
        fill=fill(WARN_BG), font=Font(color='8A5A1A'), stopIfTrue=True))  # prêté à un autre service
    ws.conditional_formatting.add(R, FormulaRule(formula=[f'AND($A{a}<>"",NOT(OR($E{a}=TRUE,$E{a}="OUI")))'],
        fill=fill('ECEFF3'), font=Font(color='9AA3AF', strike=True), stopIfTrue=True))  # absent
    ws.conditional_formatting.add(f'M{a}:M{b}', FormulaRule(formula=[f'AND($A{a}<>"",$L{a}="OUI",$D{a}<>"Pilote",N($K{a})<P_JOURS_MINI)'],
        fill=fill(WARN_BG), font=Font(color=WARN, bold=True)))  # cadence de démarrage
    ws.conditional_formatting.add(f'C{a}:C{b}', CellIsRule(operator='equal', formula=['"Intérim"'], font=Font(color='7C3AED', bold=True)))
    ws.conditional_formatting.add(f'E{a}:E{b}', FormulaRule(formula=[f'OR($E{a}=TRUE,$E{a}="OUI")'], fill=fill(OK_BG), font=Font(color=OK, bold=True)))
    ws.conditional_formatting.add(f'N{a}:N{b}', DataBarRule(start_type='num', start_value=0, end_type='max', color='7FA8E6', showValue=True))
    ws.conditional_formatting.add(f'A{a}:N{b}', FormulaRule(formula=[f'AND($A{a}<>"",MOD(ROW(),2)=0)'], fill=fill('F8FAFD')))
dv_t = DataValidation(type='time', operator='between', formula1='0.25', formula2='0.99', allow_blank=True,
                      showErrorMessage=True, errorTitle='Heure invalide', error='Saisir une heure, ex. 17:00')
dv_t.add('F7:G36'); dv_t.add('F38:G47'); ws.add_data_validation(dv_t)
ws['E6'].comment = Comment('VRAI = présent, FAUX = absent ou prêté.\nUne ligne absente passe en gris barré, une ligne prêtée (« Sorti à » rempli) en orange.', 'PP LIVE')
ws['M6'].comment = Comment('Orange = cadence de démarrage (moins de P_JOURS_MINI jours de prod).', 'PP LIVE')
ws.print_title_rows = '6:6'

# ================= SAISIE =================
ws = wb['SAISIE']
title(ws, 'A1', 'A2', 4)
ws.column_dimensions['A'].width = 30; ws.column_dimensions['B'].width = 14
ws.column_dimensions['C'].width = 16; ws.column_dimensions['D'].width = 50
ws['B4'].number_format = '[$-fr-FR]dddd dd mmmm yyyy'; ws['B4'].alignment = Alignment(horizontal='left', vertical='center')
ws.merge_cells('B4:D4')
ws.row_dimensions[4].height = 24; ws['A4'].font = Font(name=F, size=10, color=GREY, bold=True)
ws['B4'].font = Font(name=F, size=12, color=NAVY, bold=True); ws['B4'].fill = fill(WHITE)
ws.row_dimensions[6].height = 24
for r in (7, 8, 9):
    ws.row_dimensions[r].height = 28
    ws[f'C{r}'].font = Font(name=F, size=14, color=NAVY, bold=True)
    ws[f'B{r}'].font = Font(name=F, size=12, color=NAVY, bold=True)
    ws[f'B{r}'].alignment = ws[f'C{r}'].alignment = Alignment(horizontal='center', vertical='center')
    ws[f'A{r}'].font = Font(name=F, size=11, color=INK, bold=True)
ws.row_dimensions[11].height = 34
for k in 'ABCD': ws[f'{k}11'].fill = fill(NAVY)
ws['A11'].font = Font(name=F, size=12, color=WHITE, bold=True); ws['A11'].alignment = Alignment(vertical='center', indent=1)
ws['C11'].font = Font(name=F, size=18, color='FFD166', bold=True); ws['C11'].alignment = Alignment(horizontal='center', vertical='center')
dv_l = DataValidation(type='whole', operator='between', formula1='0', formula2='30000', allow_blank=True,
                      showErrorMessage=True, errorTitle='Lignes', error='Nombre entier de lignes (0 à 30 000).',
                      showInputMessage=True, promptTitle='Lignes', prompt='Nombre de lignes de la vague')
dv_l.add('C7:C9'); ws.add_data_validation(dv_l)
dv_v = DataValidation(type='time', operator='between', formula1='0.45', formula2='0.6', allow_blank=True,
                      showErrorMessage=True, errorTitle='Heure 1re vague', error='Heure de 1re vague attendue : 12:06, 12:36 ou 13:06.')
dv_v.add('B7'); ws.add_data_validation(dv_v)
ws.conditional_formatting.add('C7', FormulaRule(formula=['$C$7=""'], fill=fill(BAD_BG)))
# repères en direct (lecture seule, depuis CONTROLE) — lignes libres sous le total
ws['A13'] = 'EN DIRECT (lecture seule)'
for k in 'ABCD': ws[f'{k}13'].fill = fill(SKY); ws[f'{k}13'].border = B_SEC
ws['A13'].font = Font(name=F, size=10, color=NAVY, bold=True); ws.row_dimensions[13].height = 22
live = [(14, 'Charge visible dans LOGYS', '=CONTROLE!B25', '# ##0'),
        (15, 'Reste à lancer (prévu − visible)', '=CONTROLE!B27', '# ##0'),
        (16, 'Avancement du lancé', '=IF(S_TOTAL_PREVU>0,MIN(1,CONTROLE!B25/S_TOTAL_PREVU),"")', '0%'),
        (17, 'Capacité équipe maintenant (l/h)', '=E_CAPA_H', '# ##0'),
        (18, 'Présents', '=E_PRESENTS', '0')]
for r, lab, f, nf in live:
    ws[f'A{r}'] = lab; ws[f'C{r}'] = f
    ws[f'A{r}'].font = Font(name=F, size=10, color=INK); ws[f'A{r}'].alignment = Alignment(vertical='center', indent=1)
    c = ws[f'C{r}']; c.number_format = nf; c.fill = fill(CALC_BG); c.border = B_CALC
    c.font = Font(name=F, size=11, color=NAVY, bold=True); c.alignment = Alignment(horizontal='center', vertical='center')
    ws.row_dimensions[r].height = 20
ws.conditional_formatting.add('D16', DataBarRule(start_type='num', start_value=0, end_type='num', end_value=1, color='4F8BE0', showValue=False))
ws['D16'] = '=C16'; ws['D16'].number_format = '0%'
ws.freeze_panes = None

# ================= CONTROLE =================
ws = wb['CONTROLE']
title(ws, 'A1', 'A2', 6)
ws['A2'].alignment = Alignment(wrap_text=True, vertical='center', indent=1); ws.row_dimensions[2].height = 30
ws.merge_cells('A2:F2')
for k, w in zip('ABCDEF', (50, 16, 16, 16, 16, 30)): ws.column_dimensions[k].width = w
for r in (3, 4, 5):
    ws[f'A{r}'].font = Font(name=F, size=10, color=GREY, bold=True)
ws['B3'].number_format = 'dd/mm hh:mm:ss'
for r in (7, 15, 21, 29, 37):
    ws.row_dimensions[r].height = 24
    for k in 'ABCDEF':
        c = ws[f'{k}{r}']; c.fill = fill(NAVY); c.font = Font(name=F, size=9, color=WHITE, bold=True)
        c.alignment = Alignment(horizontal='left' if k == 'A' else 'center', vertical='center', wrap_text=True, indent=1 if k == 'A' else 0)
for r in (12, 25):
    for k in 'ABCDE':
        c = ws[f'{k}{r}']; c.border = Border(top=thin(NAVY)); c.font = Font(name=F, size=10, color=NAVY, bold=True)
for r in range(8, 41):
    for k in 'BCDE':
        c = ws[f'{k}{r}']
        if c.value is not None and r not in (15, 21, 29, 37): c.alignment = Alignment(horizontal='center', vertical='center')
ws.conditional_formatting.add('B13', CellIsRule(operator='greaterThan', formula=['0'], fill=fill(BAD_BG), font=Font(color=BAD, bold=True)))
ws.conditional_formatting.add('B31:B32', CellIsRule(operator='greaterThan', formula=['0'], fill=fill(WARN_BG), font=Font(color=WARN, bold=True)))
ws.conditional_formatting.add('B27', CellIsRule(operator='greaterThan', formula=['0'], font=Font(color=WARN, bold=True)))
ws.conditional_formatting.add('B5', FormulaRule(formula=['ISNUMBER(SEARCH("erreur",$B$5))'], fill=fill(BAD_BG), font=Font(color=BAD, bold=True)))
ws.conditional_formatting.add('B40', FormulaRule(formula=['ISNUMBER(SEARCH("erreur",$B$40))'], fill=fill(BAD_BG), font=Font(color=BAD, bold=True)))
# âge de la dernière actualisation : orange > 3 min, rouge > 10 min
ws.conditional_formatting.add('B3', FormulaRule(formula=['AND(ISNUMBER($B$3),NOW()-$B$3>10/1440)'], fill=fill(BAD_BG), font=Font(color=BAD, bold=True), stopIfTrue=True))
ws.conditional_formatting.add('B3', FormulaRule(formula=['AND(ISNUMBER($B$3),NOW()-$B$3>3/1440)'], fill=fill(WARN_BG), font=Font(color=WARN, bold=True)))
# la règle rejets d'origine (B33) est remplacée par une version claire
cf = ws.conditional_formatting; new = type(cf)()
for rng in cf:
    if str(rng.sqref) != 'B33':
        for rule in rng.rules: new.add(str(rng.sqref), rule)
ws.conditional_formatting = new
ws.conditional_formatting.add('B33', FormulaRule(formula=['AND(ISNUMBER($B$33),$B$33>P_REJ_ROUGE)'], fill=fill(BAD_BG), font=Font(color=BAD, bold=True), stopIfTrue=True))
ws.conditional_formatting.add('B33', FormulaRule(formula=['AND(ISNUMBER($B$33),$B$33>=P_REJ_ORANGE)'], fill=fill(WARN_BG), font=Font(color=WARN, bold=True), stopIfTrue=True))
ws.conditional_formatting.add('B33', FormulaRule(formula=['ISNUMBER($B$33)'], fill=fill(OK_BG), font=Font(color=OK, bold=True)))

# ================= données brutes =================
for n in ('CADENCES', 'TOURS', 'REJETS', 'DIAG'):
    ws = wb[n]
    ws.row_dimensions[1].height = 28
    for c in ws[1]:
        if c.value is None: continue
        c.fill = fill('3B4A63'); c.font = Font(name=F, size=9, color=WHITE, bold=True)
        c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True); c.border = B_HEAD
    ws.sheet_view.showGridLines = True
for col in 'LM': wb['TOURS'].column_dimensions[col].width = 17 if col == 'L' else 10
for col in 'HIJK': wb['TOURS'].column_dimensions[col].width = 11
for col in 'JKL': wb['CADENCES'].column_dimensions[col].width = 11
wb['DIAG'].column_dimensions['H'].width = 17

wb.active = wb.sheetnames.index('SAISIE')
for w in wb: w.sheet_view.tabSelected = (w.title == 'SAISIE')
wb.save(dst)
print('ok')
