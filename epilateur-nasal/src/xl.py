import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.formatting.rule import FormulaRule
from openpyxl.utils import get_column_letter as L
from contenu import *
wb = Workbook(); HD = PatternFill('solid', fgColor='1F3A5F'); KO = PatternFill('solid', fgColor='F8CBAD'); OK = PatternFill('solid', fgColor='C6E0B4'); IN = PatternFill('solid', fgColor='FFF2CC')
th = Side(style='thin', color='999999'); B = Border(left=th, right=th, top=th, bottom=th)
def sheet(name, heads, widths, first=False):
    ws = wb.active if first else wb.create_sheet(); ws.title = name
    for i, (h, w) in enumerate(zip(heads, widths), 1):
        c = ws.cell(1, i, h); c.font = Font(bold=True, color='FFFFFF'); c.fill = HD; c.alignment = Alignment(wrap_text=True, vertical='center'); c.border = B
        ws.column_dimensions[L(i)].width = w
    ws.freeze_panes = 'A2'; ws.row_dimensions[1].height = 32; return ws
def rows(ws, data, r0=2):
    for r, row in enumerate(data, r0):
        for c, v in enumerate(row, 1):
            x = ws.cell(r, c, v); x.alignment = Alignment(wrap_text=True, vertical='top'); x.border = B
ws = sheet('CdCF', ['Fonction', 'Intitulé', 'Critère', 'Niveau', 'Flexibilité (F0 = éliminatoire)', 'Vérification'], [9, 34, 52, 36, 14, 12], True); rows(ws, CDC)
for r in range(2, len(CDC)+2):
    if ws.cell(r, 5).value == 'F0':
        for c in range(1, 7): ws.cell(r, c).fill = IN
ws = sheet('Matrice de décision', ['Critère', 'Poids'] + [c['nom'] for c in CONCEPTS] + ['Pondéré A', 'Pondéré B', 'Pondéré C'], [34, 8, 22, 22, 22, 12, 12, 12])
n = len(CRIT)
for i, (cr, p) in enumerate(CRIT):
    r = i+2; rows(ws, [[cr, p] + [c['notes'][i] for c in CONCEPTS]], r)
    for k in range(3): ws.cell(r, 6+k, f'=$B{r}*{L(3+k)}{r}').border = B
r = n+2; ws.cell(r, 1, 'TOTAL (poids = 100, note de 0 à 5)').font = Font(bold=True); ws.cell(r, 2, f'=SUM(B2:B{r-1})')
for k in range(3): ws.cell(r, 6+k, f'=SUM({L(6+k)}2:{L(6+k)}{r-1})').font = Font(bold=True)
ws.cell(r+1, 1, 'Note sur 5'); ws.cell(r+2, 1, 'Critère éliminatoire non tenu'); ws.cell(r+3, 1, 'Verdict').font = Font(bold=True)
for k, c in enumerate(CONCEPTS):
    ws.cell(r+1, 6+k, f'={L(6+k)}{r}/$B${r}'); ws.cell(r+2, 6+k, c['elim'] or 'aucun'); ws.cell(r+2, 6+k).alignment = Alignment(wrap_text=True)
    ws.cell(r+3, 6+k, f'=IF({L(6+k)}{r+2}<>"aucun","ÉLIMINÉ",IF({L(6+k)}{r}=MAX(IF($F${r+2}="aucun",$F${r},0),IF($G${r+2}="aucun",$G${r},0),IF($H${r+2}="aucun",$H${r},0)),"RETENU","non retenu"))').font = Font(bold=True)
ws.row_dimensions[r+2].height = 45
ws.cell(r+5, 1, 'Règle : un concept qui ne tient pas l\'un des critères F1 à F5 est éliminé quelle que soit sa note. Les notes de la zone C2:E10 sont modifiables.')
ws = sheet('Calculs', ['Grandeur', 'Valeur', 'Unité', 'Repère / commentaire'], [58, 12, 10, 70])
K = [('RESSORT', '', '', ''), ('Fil / diamètre moyen / spires utiles / longueur libre', f'{R_D:g} / {R_DM:g} / {R_N:g} / {R_L0:g}', 'mm', 'Acier ressort EN 10270-1 SH, extrémités rapprochées meulées (H13)'),
     ('Raideur', round(C['k'], 3), 'N/mm', 'k = G·d⁴ / (8·D³·n)'), ('Effort armé', round(C['F_arme'], 1), 'N', f'longueur {R_LA:g} mm'), ('Effort au repos (fin de retrait)', round(C['F_repos'], 1), 'N', f'longueur {R_LA+COURSE:g} mm'),
     ('Effort en sur-course', round(C['F_sur'], 1), 'N', f'longueur {R_LA-SURCOURSE:g} mm ; spires jointives à {C["L_bloc"]:g} mm'), ('Contrainte de cisaillement maxi', round(C['tau_max']), 'MPa', 'admissible ≈ 1000 MPa'),
     ('Énergie restituée', round(C['E_ressort']*1000), 'mJ', ''), ('RETRAIT (F5)', '', '', ''), ('Course minimale calculée', C['course_min'], 'mm', '4 (H4) + 5 (H5) + 1 jeu + 1 étirement cire'),
     ('Course retenue', COURSE, 'mm', 'marge ×1,35'), ('Effort d\'arrachage estimé', C['F_poils'], 'N', 'H1 × H2 × H3'), ('Marge effort armé / arrachage', round(C['F_arme']/C['F_poils'], 2), '-', ''),
     ('Vitesse à vide en fin de course', round((2*C['E_ressort']/((CAD['chariot']['masse_g']+CAD['baton']['masse_g']+0.7)/1000))**.5, 1), 'm/s', 'chariot + bâtonnet + 1/3 ressort'),
     ('GÂCHETTE (F1) ET VERROU (F2)', '', '', ''), ('Effort de gâchette mini / nominal / maxi', ' / '.join(f(x) for x in C['F_gach']), 'N', f'frottement {MU[0]:g} / {MU[1]:g} / {MU[2]:g} ; dépouille {ANG_DEP:g}°'),
     ('Course de gâchette', C['g_course'], 'mm', 'dent 7,7 → 6,2'), ('Déformation de la lame de verrou', round(C['g_eps'], 2), '%', 'admissible ≈ 1,5 %'), ('Effort d\'armement', round(C['F_armement'], 1), 'N', 'ressort + came de la dent'),
     ('Effort d\'éjection (sur-course)', round(C['F_ejection'], 1), 'N', 'dépasse les 23 N au pouce : à faire en appui'), ('Pression sur le pouce à l\'armement', round(C['p_pouce'], 2), 'MPa', f'poussoir {CH_EP:g} × {2*POUS_Z:g} mm'),
     ('INTERFACE (F3)', '', '', ''), ('Tolérance radiale de capture', C['tol_radiale'], 'mm', '(Ø entrée − Ø queue) / 2'), ('Tolérance angulaire géométrique', round(C['tol_ang'], 1), '°', 'annoncée ±10°'),
     ('Effort d\'insertion nominal / maxi', f'{f(C["F_insert"])} / {f(C["F_insert_max"])}', 'N', 'ouverture 0,6 mm par mâchoire'), ('Déformation des bras de mâchoire', round(C['m_eps'], 2), '%', ''),
     ('Retenue : matage des crochets / traction de la gorge', f'{C["F_ret_matage"]:.0f} / {C["F_ret_gorge"]:.0f}', 'N', 'retenue positive, faces perpendiculaires'), ('Effort d\'extraction en sur-course', 0, 'N', 'mâchoires écartées par la lèvre'),
     ('BÂTONNET', '', '', ''), ('Longueur / masse', f'{f(C["lg_baton"])} / {f(CAD["baton"]["masse_g"], 2)}', 'mm / g', ''), ('Coût matière', round(CAD['baton']['masse_g']*PRIX_KG/1000, 3), '€', 'H12'),
     ('Effort latéral en tête à rupture', round(C['F_flex_lat'], 1), 'N', 'section Ø5 au col, H8'), ('Surface cirée / volume de cire', f'{CAD["cire"]["surface_mm2"]:.0f} / {CAD["cire"]["volume_mm3"]:.0f}', 'mm² / mm³', f'épaisseur {CIRE_EP:g} mm (H14)'),
     ('Bâtonnets par plateau P2S', CAD['plateau']['nb'], '-', f'pas {CAD["plateau"]["pas"]:g} mm, hauteur {CAD["plateau"]["hauteur"]:g} mm, {CAD["plateau"]["masse_g"]:.0f} g'),
     ('BUTÉE (tir à vide)', '', '', ''), ('Surface de butée / contrainte dynamique estimée', f'{C["A_butee"]:g} / {C["sig_butee"]:.0f}', 'mm² / MPa', 'supérieure à la limite du PETG (≈ 50 MPa) : risque de matage, essai E7.3')]
rows(ws, K)
for r in range(2, len(K)+2):
    if ws.cell(r, 2).value == '': ws.cell(r, 1).font = Font(bold=True); ws.cell(r, 1).fill = IN
ws = sheet('Garde F4', ['Position', 'Recul du chariot (mm)', 'Garde cire/appareil (mm)', 'Critère mini (mm)', 'Verdict', 'Interférence zone de garde ∩ appareil (mm³, CAO)'], [40, 14, 16, 12, 16, 30])
for i, (p, s, g) in enumerate(POS):
    r = i+2; rows(ws, [[p, s, g if g is not None else 'sans objet', GARDE_MIN, None, 0 if g is not None else 'sans objet']], r)
    ws.cell(r, 5, f'=IF(ISNUMBER(C{r}),IF(C{r}>=D{r},"CONFORME","NON CONFORME"),"sans objet")').border = B
ws = sheet('Plan d\'essais', ['N°', 'Essai', 'Grandeur mesurée', 'Unité', 'Mini', 'Maxi', 'Méthode et moyens'], [7, 28, 58, 8, 8, 8, 70]); rows(ws, [e for e in ESSAIS])
ws = sheet('Saisie mesures', ['N°', 'Grandeur mesurée', 'Unité', 'Mini', 'Maxi', 'Mesure 1', 'Mesure 2', 'Mesure 3', 'Mesure 4', 'Mesure 5', 'Moyenne', 'Mini mesuré', 'Maxi mesuré', 'Verdict'], [7, 58, 8, 8, 8, 10, 10, 10, 10, 10, 10, 10, 10, 18])
for i, e in enumerate(ESSAIS):
    r = i+2; rows(ws, [[e[0], e[2], e[3], e[4], e[5]] + [None]*9], r)
    for c in range(6, 11): ws.cell(r, c).fill = IN
    ws.cell(r, 11, f'=IF(COUNT(F{r}:J{r})=0,"",AVERAGE(F{r}:J{r}))'); ws.cell(r, 12, f'=IF(COUNT(F{r}:J{r})=0,"",MIN(F{r}:J{r}))'); ws.cell(r, 13, f'=IF(COUNT(F{r}:J{r})=0,"",MAX(F{r}:J{r}))')
    ws.cell(r, 14, f'=IF(COUNT(F{r}:J{r})=0,"à mesurer",IF(AND(OR(D{r}="",L{r}>=D{r}),OR(E{r}="",M{r}<=E{r})),"CONFORME","NON CONFORME"))')
rr = f'N2:N{len(ESSAIS)+1}'
ws.conditional_formatting.add(rr, FormulaRule(formula=['N2="CONFORME"'], fill=OK)); ws.conditional_formatting.add(rr, FormulaRule(formula=['N2="NON CONFORME"'], fill=KO))
r = len(ESSAIS)+3; ws.cell(r, 2, 'Synthèse').font = Font(bold=True)
ws.cell(r+1, 2, 'Lignes conformes'); ws.cell(r+1, 3, f'=COUNTIF({rr},"CONFORME")'); ws.cell(r+2, 2, 'Lignes non conformes'); ws.cell(r+2, 3, f'=COUNTIF({rr},"NON CONFORME")'); ws.cell(r+3, 2, 'Lignes à mesurer'); ws.cell(r+3, 3, f'=COUNTIF({rr},"à mesurer")')
ws.cell(r+5, 2, 'Saisir les mesures dans les cellules jaunes (1 à 5 valeurs). Toutes les mesures doivent être dans [Mini ; Maxi] pour un verdict CONFORME.')
ws = sheet('Hypothèses', ['N°', 'Hypothèse', 'Valeur', 'Unité', 'Justification / comment la lever'], [7, 52, 16, 10, 80]); rows(ws, HYP)
ws = sheet('Sources', ['N°', 'Source'], [7, 150]); rows(ws, list(SRC.items()))
out = os.path.join(os.path.dirname(__file__), '..', 'livrables', 'NazClic_CdCF_matrice_essais.xlsx'); wb.save(out); print(out)
