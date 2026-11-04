#!/usr/bin/env python3
"""
CONTRÔLE DES REJETS v4 — générateur du classeur Excel (.xlsm)
==============================================================

    python3 outils/controle_rejets/build_rejets.py ANCIEN.xlsm --sortie Controle_Rejets_V4.xlsm

Reprend de l'ancien fichier (v3) : l'historique des erreurs et la liste des
opérateurs. Aucune donnée personnelle n'est écrite dans ce script : tout vient
du fichier passé en argument (jamais versionné, cf. .gitignore).

Le classeur produit :
  SAISIE           scan du contenant -> date/heure auto ; « suivez le jaune »
  TABLEAU DE BORD  période + opérateur (cases jaunes), KPI, types, opérateurs,
                   allées, heures, tendance, top références, 12 mois
  HISTORIQUE       tableau T_REJETS (1 ligne = 1 erreur), recherche
  SYNTHESE         tableau T_SYNTHESE (1 ligne = 1 opérateur x 1 jour)
  OPERATEURS       tableau T_OPE (NOM PRÉNOM = clé commune avec le Suivi Op)
  REGLAGES         site, seuils, options, types, allées, actions, aide
  CALC (masqué)    calculs du tableau de bord
Les macros (vba/modRejets.bas) sont intégrées dans xl/vbaProject.bin.
"""
from __future__ import annotations

import argparse
import datetime as dt
import io
import sys
import zipfile
from collections import Counter, defaultdict
from pathlib import Path

import openpyxl
from openpyxl.cell.rich_text import CellRichText, TextBlock
from openpyxl.cell.text import InlineFont
from openpyxl.chart import BarChart, Reference
from openpyxl.chart.axis import ChartLines
from openpyxl.chart.label import DataLabelList
from openpyxl.chart.shapes import GraphicalProperties
from openpyxl.chart.text import RichText
from openpyxl.drawing.line import LineProperties
from openpyxl.drawing.text import CharacterProperties, Paragraph, ParagraphProperties, RichTextProperties
from openpyxl.formatting.rule import ColorScaleRule, FormulaRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Protection, Side
from openpyxl.styles.differential import DifferentialStyle
from openpyxl.styles.table import TableStyle, TableStyleElement
from openpyxl.utils import get_column_letter as L
from openpyxl.utils.indexed_list import IndexedList
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.worksheet.hyperlink import Hyperlink
from openpyxl.worksheet.table import Table, TableStyleInfo

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI))
sys.path.insert(0, str(ICI / "vba"))
from vbaproj import construire_projet, module_document, module_standard  # noqa: E402
from documents import DOCUMENTS  # noqa: E402

# ─────────────────────────── charte (même signalétique que les Standards) ───────────────────────────
BETON, SURF, PLATE, PLATE2, EDGE = "0B0C0E", "131519", "1B1E24", "23272E", "2A2F37"
LIGNE_A, LIGNE_B, TRAIT = "15181C", "191C21", "262A31"
CRAIE, ACIER, ACIER2 = "F4F5F6", "98A0AC", "5E6672"
JAUNE, JAUNE_FONCE = "FFD400", "3A3000"
ROUGE, ORANGE, VERT, BLEU = "E5332A", "FF8A1F", "3FBF6E", "4C9AFF"
POLICE, MONO = "Segoe UI", "Consolas"

# Types d'erreur : libellé, abrégé (tableaux), couleur, teinte de fond (sur sombre)
TYPES = [
    ("Manquante", "MANQ.", ROUGE, "3A1513"),
    ("Quantité +", "QTÉ +", ORANGE, "3A2410"),
    ("Quantité -", "QTÉ −", "22B8CF", "0F2E35"),
    ("Orientation", "ORIENT.", BLEU, "13233D"),
    ("Référence", "RÉF.", "A78BFA", "251E3D"),
    ("Casse", "CASSE", "EC4899", "3A1229"),
]
AUTRE_COUL = ACIER
ALLEES = [f"{i:02d}" for i in range(1, 23)]
PERIODES = ["Aujourd'hui", "Veille ouvrée", "7 derniers jours", "Semaine en cours", "Semaine précédente",
            "Mois en cours", "Mois précédent", "30 derniers jours", "Année en cours", "Tout l'historique",
            "Personnalisée"]
PERIODE_DEFAUT = "30 derniers jours"

# Reprise de l'ancien fichier : type v3 -> type v4
REPRISE_TYPES = {
    "Orientation (mauvais colis)": "Orientation",
    "Manquant (qté −)": "Quantité -",          # v3 ne distinguait pas ligne manquante / qté manquante
    "Surplus (qté +)": "Quantité +",
    "Erreur de référence": "Référence",
    "Article abîmé": "Casse",
    "Erreur de conditionnement": "Autre",
    "Autre": "Autre",
}

# SAISIE
S_L1, S_LN = 7, 306
# T_REJETS (même ordre que le VBA)
COL_H = ["Date", "Heure", "Contenant", "Contenant 2", "Colis", "Type", "Réf", "Allée", "Opérateur",
         "Matricule", "Commentaire", "Année", "Mois", "Semaine", "Jour", "Tranche", "Saisi par", "Source", "ID"]
LARG_H = [11, 7, 15, 15, 6, 13, 13, 7, 26, 10, 44, 7, 6, 8, 6, 8, 12, 12, 9]
COL_SY = ["Date", "Opérateur", "Matricule", "Erreurs", "Colis"] + [t[0] for t in TYPES] + ["Autre", "Année", "Mois", "Semaine"]
COL_OPE = ["Matricule", "Nom", "Prénom", "NOM PRÉNOM", "Fonction", "Actif"]
OPE_LIGNES = 120
JOURS = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"]
MOIS_COURT = ["", "janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]

# ─────────────────────────── styles ───────────────────────────


def F(color=CRAIE, size=10, bold=False, name=POLICE, italic=False):
    return Font(name=name, size=size, bold=bold, color=color, italic=italic)


def fond(c):
    return PatternFill("solid", start_color=c, end_color=c)


def cote(c, style="thin"):
    return Side(style=style, color=c)


def bord(c=TRAIT, style="thin", haut=None, bas=None, gauche=None, droite=None):
    s = cote(c, style)
    return Border(left=gauche or s, right=droite or s, top=haut or s, bottom=bas or s)


AL_C = Alignment(horizontal="center", vertical="center")
AL_G = Alignment(horizontal="left", vertical="center", indent=1)
AL_D = Alignment(horizontal="right", vertical="center", indent=1)
AL_CW = Alignment(horizontal="center", vertical="center", wrap_text=True)
AL_GW = Alignment(horizontal="left", vertical="center", wrap_text=True, indent=1)
LIBRE = Protection(locked=False)


def put(ws, ref, valeur=None, font=None, fill=None, align=None, border=None, fmt=None, fusion=None, libre=False):
    if fusion:
        ws.merge_cells(fusion)
    c = ws[ref]
    if valeur is not None:
        c.value = valeur
    if font:
        c.font = font
    if fill:
        c.fill = fill
    if align:
        c.alignment = align
    if border:
        c.border = border
    if fmt:
        c.number_format = fmt
    if libre:
        c.protection = LIBRE
    if fusion and (fill or border):
        for ligne in ws[fusion]:
            for x in ligne:
                if fill:
                    x.fill = fill
                if border:
                    x.border = border
    return c


def zone(ws, ref, fill=None, font=None, border=None):
    for ligne in ws[ref]:
        for c in ligne:
            if fill:
                c.fill = fill
            if font:
                c.font = font
            if border:
                c.border = border


def fond_feuille(ws, couleur, derniere_col=60):
    """Fond sombre partout : style par défaut des colonnes (cellules vides)."""
    for col in range(1, derniere_col + 1):
        cd = ws.column_dimensions[L(col)]
        cd.fill = fond(couleur)
        cd.font = F()
    cd = ws.column_dimensions[L(derniere_col + 1)]
    cd.min, cd.max = derniere_col + 1, 16384
    cd.fill = fond(couleur)
    cd.width = 9


def largeurs(ws, d):
    for col, w in d.items():
        ws.column_dimensions[col].width = w


def bandeau(ws, titre, sous_titre, derniere, actif, formule_droite=None):
    """Lignes 1-3 : titre, sous-titre, barre de navigation (liens internes)."""
    fin = L(derniere)
    ws.row_dimensions[1].height = 36
    ws.row_dimensions[2].height = 18
    ws.row_dimensions[3].height = 24
    zone(ws, f"A1:{fin}2", fill=fond(BETON))
    put(ws, "A1", titre, F(CRAIE, 20, True), align=Alignment(vertical="center", indent=1))
    put(ws, "A2", sous_titre, F(ACIER, 9), align=Alignment(vertical="center", indent=1))
    if formule_droite:
        c = ws.cell(1, derniere, formule_droite)
        c.font = F(ACIER, 10)
        c.alignment = Alignment(horizontal="right", vertical="center", indent=1)
    return fin


NAV = [("✎  SAISIE", "SAISIE"), ("▦  TABLEAU DE BORD", "TABLEAU DE BORD"), ("☰  HISTORIQUE", "HISTORIQUE"),
       ("Σ  SYNTHÈSE", "SYNTHESE"), ("◉  OPÉRATEURS", "OPERATEURS"), ("⚙  RÉGLAGES", "REGLAGES")]


def navigation(ws, plages, actif, ligne=3, derniere=None):
    """plages : 6 plages de colonnes (ex. 'A:C') pour les 6 boutons."""
    if derniere:
        zone(ws, f"A{ligne}:{L(derniere)}{ligne}", fill=fond(BETON))
    for (txt, cible), pl in zip(NAV, plages):
        a, b = pl.split(":")
        ref = f"{a}{ligne}"
        if a != b:
            ws.merge_cells(f"{a}{ligne}:{b}{ligne}")
        est = (cible == actif)
        c = ws[ref]
        c.value = txt
        c.font = F(BETON if est else CRAIE, 9, True)
        c.alignment = AL_C
        c.hyperlink = Hyperlink(ref=ref, location=f"'{cible}'!A1", display=txt)
        for col in range(openpyxl.utils.column_index_from_string(a), openpyxl.utils.column_index_from_string(b) + 1):
            x = ws.cell(ligne, col)
            x.fill = fond(JAUNE if est else PLATE)
            x.border = Border(left=cote(BETON, "thick") if col == openpyxl.utils.column_index_from_string(a) else None,
                              right=cote(BETON, "thick") if col == openpyxl.utils.column_index_from_string(b) else None,
                              top=cote(BETON, "thin"), bottom=cote(BETON, "thin"))


def riche(titre, detail, couleur=CRAIE, taille=10):
    return CellRichText([
        TextBlock(InlineFont(rFont=POLICE, sz=taille, b=True, color=couleur), titre),
        TextBlock(InlineFont(rFont=POLICE, sz=8, color=ACIER), "\n" + detail),
    ])


def tableau_sombre(ws, ligne_tete, ncol, derniere_ligne):
    """En-tête et bandes explicites : lisible même si le style de tableau n'est pas appliqué."""
    for j in range(1, ncol + 1):
        cc = ws.cell(ligne_tete, j)
        cc.font = F(JAUNE, 10, True)
        cc.fill = fond(BETON)
        cc.border = Border(bottom=cote(JAUNE, "medium"))
        cc.alignment = Alignment(vertical="center", wrap_text=True)
    ws.row_dimensions[ligne_tete].height = 22
    zone_ = f"A{ligne_tete + 1}:{L(ncol)}{derniere_ligne}"
    ws.conditional_formatting.add(zone_, FormulaRule(formula=["MOD(ROW(),2)=0"], fill=fond(LIGNE_B),
                                  border=Border(bottom=cote(TRAIT))))
    ws.conditional_formatting.add(zone_, FormulaRule(formula=["MOD(ROW(),2)=1"], fill=fond(LIGNE_A),
                                  border=Border(bottom=cote(TRAIT))))


def nom(wb, n, ref):
    wb.defined_names[n] = DefinedName(n, attr_text=ref)


def regle(fill=None, font=None, border=None):
    return DifferentialStyle(fill=fill, font=font, border=border)


# ─────────────────────────── lecture de l'ancien fichier ───────────────────────────


def texte(v):
    if v is None:
        return ""
    if isinstance(v, float) and v.is_integer():
        v = int(v)
    return str(v).strip()


def lire_ancien(chemin: Path):
    wb = openpyxl.load_workbook(chemin, data_only=True, keep_vba=False)
    ops = []
    if "OPERATEURS" in wb.sheetnames:
        for r in wb["OPERATEURS"].iter_rows(min_row=2, values_only=True):
            mat, nom_, pre, fonc = texte(r[0]), texte(r[1]), texte(r[2]), texte(r[3])
            if nom_ and mat and mat.upper() != "LOGYS":
                ops.append(dict(mat=mat, nom=nom_.upper(), pre=pre.upper(), fonc=fonc or "Operateur"))
    histo = []
    if "HISTORIQUE" in wb.sheetnames:
        for r in wb["HISTORIQUE"].iter_rows(min_row=2, values_only=True):
            if isinstance(r[0], (dt.datetime, dt.date)):
                histo.append(r)
    site = {}
    if "REGLAGES" in wb.sheetnames:
        for r in wb["REGLAGES"].iter_rows(min_row=1, max_row=60, values_only=True):
            if r[0] in ("SITE_NOM", "SITE_CODE", "SITE_SERVICE", "SEUIL_O", "SEUIL_R"):
                site[r[0]] = r[2]
    return ops, histo, site


def np_operateur(ops_par_mat, mat, libelle):
    """« 123 - DUPONT Jean » -> « DUPONT JEAN » (clé du Suivi Op)."""
    m = texte(mat).lstrip("0")
    if m in ops_par_mat:
        o = ops_par_mat[m]
        return f"{o['nom']} {o['pre']}".strip()
    s = texte(libelle)
    if " - " in s:
        s = s.split(" - ", 1)[1]
    return s.upper()


def reprendre(histo, ops):
    ops_par_mat = {o["mat"].lstrip("0"): o for o in ops}
    lignes = []
    for r in sorted(histo, key=lambda x: (x[0], x[1] or dt.time(0))):
        d = r[0].date() if isinstance(r[0], dt.datetime) else r[0]
        h = r[1] if isinstance(r[1], dt.time) else None
        cont, cont2 = texte(r[2]), texte(r[12])
        typ = REPRISE_TYPES.get(texte(r[3]), texte(r[3]) or "Non précisé")
        emp, allee = texte(r[6]).upper(), texte(r[7])
        if allee.isdigit():
            allee = allee.zfill(2)
        if not allee and emp[:2].isdigit():
            allee = emp[:2]
        com = []
        if texte(r[13]):
            v = texte(r[13])
            com.append(f"Écart {v}" if v.isdigit() else v)
        if texte(r[11]):
            com.append(f"Réf trouvée {texte(r[11])}")
        if texte(r[10]):
            com.append(f"Écart {texte(r[10])}")
        if emp:
            com.append(f"Empl. {emp}")
        lignes.append(dict(
            date=d, heure=h, cont=cont, cont2=cont2, colis=2 if cont2 else 1, type=typ,
            ref=texte(r[4]).upper(), allee=allee, ope=np_operateur(ops_par_mat, r[9], r[8]),
            mat=texte(r[9]), com=" · ".join(com), user=texte(r[18]), src="Reprise v3"))
    for i, x in enumerate(lignes, 1):
        x["id"] = f"R{i:06d}"
    return lignes


def calendrier(x):
    d = x["date"]
    return [d.year, d.month, d.isocalendar()[1], JOURS[d.weekday()], x["heure"].hour if x["heure"] else None]


def synthese(lignes):
    noms = [t[0] for t in TYPES]
    agr = {}
    for x in lignes:
        k = (x["date"], x["ope"])
        a = agr.setdefault(k, dict(mat=x["mat"], n=0, colis=0, t=Counter()))
        a["n"] += 1
        a["colis"] += x["colis"]
        a["t"][x["type"] if x["type"] in noms else "Autre"] += 1
        if not a["mat"]:
            a["mat"] = x["mat"]
    out = []
    for (d, ope), a in sorted(agr.items(), key=lambda kv: (kv[0][0], kv[0][1].upper())):
        out.append([d, ope or None, a["mat"] or None, a["n"], a["colis"]] + [a["t"][t] for t in noms] +
                   [a["t"]["Autre"], d.year, d.month, d.isocalendar()[1]])
    return out


# ─────────────────────────── formules de comptage ───────────────────────────
H_COL = {"date": "T_REJETS[Date]", "type": "T_REJETS[Type]", "ope": "T_REJETS[Opérateur]",
         "allee": "T_REJETS[Allée]", "cont2": "T_REJETS[Contenant 2]", "tranche": "T_REJETS[Tranche]"}
S_COL = {"date": "S_DATE", "type": "S_TYPE", "ope": "S_OPE", "allee": "S_ALLEE", "cont2": "S_CONT2"}


def compte(crit=(), debut="P_DEBUT", fin="P_FIN", ope="OPCRIT"):
    """Erreurs de l'historique + du jour, sur [debut, fin], filtrées par opérateur et critères."""
    h = [f'{H_COL["date"]},">="&{debut}', f'{H_COL["date"]},"<="&{fin}']
    s = [f'{S_COL["date"]},">="&{debut}', f'{S_COL["date"]},"<="&{fin}']
    if ope:
        h.append(f'{H_COL["ope"]},{ope}')
        s.append(f'{S_COL["ope"]},{ope}')
    for champ, valeur in crit:
        h.append(f"{H_COL[champ]},{valeur}")
        s.append(f"{S_COL[champ]},{valeur}")
    return f"COUNTIFS({','.join(h)})+COUNTIFS({','.join(s)})"


# ─────────────────────────── graphiques ───────────────────────────


def _txt(couleur, taille=800):
    cp = CharacterProperties(sz=taille, solidFill=couleur)
    return RichText(bodyPr=RichTextProperties(), p=[Paragraph(pPr=ParagraphProperties(defRPr=cp), endParaRPr=cp)])


def habiller(ch, legende=True):
    ch.graphical_properties = GraphicalProperties(solidFill=PLATE, ln=LineProperties(noFill=True))
    ch.plot_area.graphicalProperties = GraphicalProperties(noFill=True, ln=LineProperties(noFill=True))
    for ax in (ch.x_axis, ch.y_axis):
        ax.delete = False
        ax.txPr = _txt(ACIER)
        ax.spPr = GraphicalProperties(ln=LineProperties(solidFill=EDGE))
        ax.majorTickMark = "none"
        ax.minorTickMark = "none"
    ch.y_axis.majorGridlines = ChartLines(spPr=GraphicalProperties(ln=LineProperties(solidFill=TRAIT)))
    ch.y_axis.number_format = "0"
    ch.x_axis.majorGridlines = None
    if legende:
        ch.legend.position = "b"
        ch.legend.txPr = _txt(ACIER)
    else:
        ch.legend = None
    ch.title = None


def serie_couleur(s, couleur):
    s.graphicalProperties.solidFill = couleur
    s.graphicalProperties.line.noFill = True


# ─────────────────────────── construction ───────────────────────────


def construire(ancien: Path, sortie: Path, aujourdhui: dt.date, dossier_bas: Path | None):
    ops, histo, site = lire_ancien(ancien)
    lignes = reprendre(histo, ops)
    synth = synthese(lignes)

    wb = openpyxl.Workbook()
    wb._fonts = IndexedList([Font(name=POLICE, size=10, family=2)])
    wb._named_styles["Normal"].font = Font(name=POLICE, size=10, family=2)
    wb.code_name = "ThisWorkbook"
    wb.calculation.fullCalcOnLoad = True

    # style de tableau « béton » (HISTORIQUE, SYNTHESE, OPERATEURS)
    dx_tout = DifferentialStyle(font=Font(color=CRAIE), fill=fond(LIGNE_A),
                                border=Border(horizontal=cote(TRAIT), bottom=cote(TRAIT)))
    dx_tete = DifferentialStyle(font=Font(color=JAUNE, bold=True), fill=fond(BETON),
                                border=Border(bottom=cote(JAUNE, "medium")))
    dx_bande = DifferentialStyle(fill=fond(LIGNE_B))
    ids = [wb._differential_styles.add(d) for d in (dx_tout, dx_tete, dx_bande)]
    wb._table_styles.tableStyle.append(TableStyle(name="RejetsBeton", pivot=False, count=3, tableStyleElement=[
        TableStyleElement(type="wholeTable", dxfId=ids[0]),
        TableStyleElement(type="headerRow", dxfId=ids[1]),
        TableStyleElement(type="firstRowStripe", dxfId=ids[2]),
    ]))
    style_table = TableStyleInfo(name="RejetsBeton", showRowStripes=True, showColumnStripes=False,
                                 showFirstColumn=False, showLastColumn=False)

    s = wb.active
    s.title = "SAISIE"
    t = wb.create_sheet("TABLEAU DE BORD")
    h = wb.create_sheet("HISTORIQUE")
    sy = wb.create_sheet("SYNTHESE")
    o = wb.create_sheet("OPERATEURS")
    r = wb.create_sheet("REGLAGES")
    c = wb.create_sheet("CALC")
    for ws, cn, coul in ((s, "shSaisie", JAUNE), (t, "shTdb", BLEU), (h, "shHisto", VERT), (sy, "shSynth", ACIER2),
                         (o, "shOpe", "A78BFA"), (r, "shReglages", ACIER2), (c, "shCalc", None)):
        ws.sheet_properties.codeName = cn
        if coul:
            ws.sheet_properties.tabColor = coul
        ws.sheet_view.showGridLines = False
    c.sheet_state = "hidden"

    seuil_o = site.get("SEUIL_O") or 15
    seuil_r = site.get("SEUIL_R") or 20

    # ══════════════════════════ REGLAGES ══════════════════════════
    fond_feuille(r, BETON, 8)
    largeurs(r, {"A": 4, "B": 36, "C": 26, "D": 62, "E": 3, "F": 12, "G": 3})
    r.column_dimensions["A"].hidden = True
    zone(r, "A1:G2", fill=fond(BETON))
    r.row_dimensions[1].height = 36
    r.row_dimensions[2].height = 18
    r.row_dimensions[3].height = 24
    put(r, "B1", "RÉGLAGES & AIDE", F(CRAIE, 20, True), align=Alignment(vertical="center"), fusion="B1:D1")
    put(r, "B2", "Seules les cases jaunes se modifient · le reste est rempli par le fichier", F(ACIER, 9),
        align=Alignment(vertical="center"), fusion="B2:D2")
    navigation(r, ["B:B", "C:C", "D:D", "F:F"], "REGLAGES", derniere=7)
    lig = 5

    def section(titre):
        nonlocal lig
        lig += 1
        put(r, f"B{lig}", titre, F(JAUNE, 11, True), fond(BETON), AL_G, Border(bottom=cote(JAUNE, "medium")))
        zone(r, f"C{lig}:D{lig}", fill=fond(BETON), border=Border(bottom=cote(JAUNE, "medium")))
        r.row_dimensions[lig].height = 22
        lig += 1

    def param(code, libelle, valeur, aide="", saisie=True, fmt=None, liste=None):
        nonlocal lig
        r.cell(lig, 1, code).font = F(BETON, 8)
        put(r, f"B{lig}", libelle, F(CRAIE, 10), fond(SURF), AL_G, Border(bottom=cote(TRAIT)))
        put(r, f"C{lig}", valeur, F(BETON if saisie else CRAIE, 10, saisie), fond(JAUNE if saisie else PLATE), AL_C,
            Border(bottom=cote(BETON), left=cote(BETON), right=cote(BETON)), fmt=fmt)
        put(r, f"D{lig}", aide, F(ACIER, 9), fond(SURF), AL_GW, Border(bottom=cote(TRAIT)))
        r.row_dimensions[lig].height = 20
        if liste:
            dv = DataValidation(type="list", formula1=f'"{liste}"', allow_blank=True)
            r.add_data_validation(dv)
            dv.add(f"C{lig}")
        ref = f"REGLAGES!$C${lig}"
        lig += 1
        return ref

    section("SITE")
    refs = {}
    refs["SITE_NOM"] = param("SITE_NOM", "Nom du site", texte(site.get("SITE_NOM")) or "CLR Champigneulles", "Affiché en tête de SAISIE et du tableau de bord.")
    refs["SITE_CODE"] = param("SITE_CODE", "Code site", texte(site.get("SITE_CODE")) or "5406")
    refs["SITE_SERVICE"] = param("SITE_SERVICE", "Service", texte(site.get("SITE_SERVICE")) or "Pick & Pack")
    section("SEUILS (erreurs par jour, équipe)")
    refs["SEUIL_O"] = param("SEUIL_O", "Seuil orange", seuil_o, "À partir de ce nombre d'erreurs, la journée passe en alerte (orange).")
    refs["SEUIL_R"] = param("SEUIL_R", "Seuil rouge", seuil_r, "À partir de ce nombre, la journée passe en rouge.")
    section("FONCTIONNEMENT")
    param("NAV_AUTO", "Le curseur va seul à la case suivante", "OUI", "Contenant → type → (2e colis) → réf → allée → opérateur → contenant suivant.", liste="OUI,NON")
    param("SAUVE_AUTO", "Enregistrer après chaque ligne complète", "OUI", "Rien ne se perd si le poste plante.", liste="OUI,NON")
    param("EXPORT_CSV", "Exporter l'historique en CSV à l'archivage", "OUI", "Fichier CSV posé à côté du classeur : lisible par Power Query même quand le classeur est ouvert.", liste="OUI,NON")
    param("CSV_NOM", "Nom du fichier CSV", "Rejets_historique.csv", "Séparateur « ; », UTF-8, dates AAAA-MM-JJ.")
    param("LONGUEUR_CONTENANT", "Un n° de contenant fait au moins", 10, "Chiffres. Un contenant scanné dans Type, Allée, Opérateur ou Commentaire part sur la ligne suivante.")
    section("SUIVI (rempli par le fichier)")
    refs["JOUR_SAISIE"] = param("JOUR_SAISIE", "Journée en cours dans SAISIE", aujourdhui, "Au changement de jour, la saisie part seule dans HISTORIQUE.", False, "dd/mm/yyyy")
    refs["MACROS"] = param("MACROS", "Macros actives le", None, "Vide ou ancien = macros désactivées (bandeau rouge dans SAISIE).", False, "dd/mm/yyyy")
    param("DERNIER_ARCHIVAGE", "Dernier archivage", None, "", False)
    param("DERNIER_ID", "Dernier n° de ligne (ID)", len(lignes), "Chaque erreur archivée reçoit un ID unique (R000001…).", False)
    param("VERSION", "Version", f"v4 · {aujourdhui:%d/%m/%Y}", "Sans base Oracle : saisie manuelle + listes.", False)

    section("ACTIONS (cliquer)")
    for code, txt, aide in [
        ("ACT_ARCHIVER", "▸  Archiver la journée maintenant", "Fait à la main ce que le fichier fait seul chaque début de journée."),
        ("ACT_RECALC", "▸  Recalculer l'historique et la synthèse", "Après une correction ou un ajout à la main dans HISTORIQUE."),
        ("ACT_CSV", "▸  Exporter l'historique en CSV", "Pour le Suivi Op / dashboard (Power Query)."),
        ("ACT_LISTES", "▸  Reconstruire les listes d'opérateurs", "Fait seul quand on modifie l'onglet OPERATEURS."),
        ("ACT_TOUT", "▸  Réafficher tout l'historique", "Efface la recherche en cours."),
    ]:
        r.cell(lig, 1, code).font = F(BETON, 8)
        put(r, f"B{lig}", txt, F(JAUNE, 10, True), fond(PLATE), AL_G, Border(bottom=cote(BETON, "medium")))
        r[f"B{lig}"].hyperlink = Hyperlink(ref=f"B{lig}", location=f"REGLAGES!B{lig}", display=txt)
        put(r, f"C{lig}", None, fill=fond(PLATE), border=Border(bottom=cote(BETON, "medium")), fusion=None)
        put(r, f"D{lig}", aide, F(ACIER, 9), fond(SURF), AL_GW, Border(bottom=cote(TRAIT)))
        r.row_dimensions[lig].height = 22
        lig += 1

    section("TYPES D'ERREUR (n° à taper dans SAISIE)")
    put(r, f"B{lig}", "N°", F(ACIER, 9, True), fond(SURF), AL_C)
    put(r, f"C{lig}", "Type d'erreur", F(ACIER, 9, True), fond(SURF), AL_C)
    put(r, f"D{lig}", "Abrégé (en-têtes des tableaux)", F(ACIER, 9, True), fond(SURF), AL_G)
    lig += 1
    t1 = lig
    for i in range(8):
        lab, court, coul, teinte = TYPES[i] if i < len(TYPES) else ("", "", ACIER, PLATE)
        put(r, f"B{lig}", i + 1, F(CRAIE, 10, True), fond(SURF), AL_C, Border(bottom=cote(TRAIT)))
        put(r, f"C{lig}", lab or None, F(coul if lab else BETON, 10, True), fond(teinte if lab else JAUNE), AL_C,
            Border(bottom=cote(BETON)), libre=True)
        put(r, f"D{lig}", court or None, F(CRAIE, 9), fond(SURF), AL_G, Border(bottom=cote(TRAIT)))
        if i < len(TYPES):
            nom(wb, f"TYPE{i + 1}", f"REGLAGES!$C${lig}")
            nom(wb, f"TCOURT{i + 1}", f"REGLAGES!$D${lig}")
        lig += 1
    nom(wb, "R_TYPES", f"REGLAGES!$B${t1}:$D${t1 + 7}")
    nom(wb, "TYPE_2COLIS", f"REGLAGES!$C${t1 + 3}")
    nom(wb, "L_TYPES", f"OFFSET(REGLAGES!$C${t1},0,0,MAX(1,COUNTA(REGLAGES!$C${t1}:$C${t1 + 7})),1)")
    put(r, f"C{lig}", "Le type n°4 ouvre la case « 2e colis » (2 colis, 1 seule erreur).", F(BLEU, 9, True), fond(BETON), AL_G,
        fusion=f"C{lig}:D{lig}")
    lig += 1
    put(r, f"C{lig}", "7 et 8 libres. Ne pas renommer un type en cours d'année : l'historique garde l'ancien libellé (compté en « Autre »).",
        F(ACIER2, 8, italic=True), fond(BETON), AL_G, fusion=f"C{lig}:D{lig}")
    r.conditional_formatting.add(f"C{t1}:C{t1 + 7}", FormulaRule(formula=[f'C{t1}=""'], fill=fond(JAUNE_FONCE)))
    lig += 2

    # allées (colonne F)
    put(r, "F5", "ALLÉES", F(JAUNE, 11, True), fond(BETON), AL_C, Border(bottom=cote(JAUNE, "medium")))
    put(r, "F6", "liste de SAISIE", F(ACIER, 8), fond(BETON), AL_C)
    for i in range(40):
        put(r, f"F{7 + i}", ALLEES[i] if i < len(ALLEES) else None, F(BETON, 10, True), fond(JAUNE), AL_C,
            Border(bottom=cote(BETON), left=cote(BETON), right=cote(BETON)), fmt="@", libre=True)
    r.conditional_formatting.add("F7:F46", FormulaRule(formula=['F7=""'], fill=fond(JAUNE_FONCE)))
    nom(wb, "L_ALLEES", "OFFSET(REGLAGES!$F$7,0,0,MAX(1,COUNTA(REGLAGES!$F$7:$F$46)),1)")
    nom(wb, "R_ALLEES", "REGLAGES!$F$7:$F$46")

    section("RÉCUPÉRER LES DONNÉES (Suivi Op, dashboard)")
    aide_pq = [
        ("1.", "Les données sont dans 3 tableaux nommés, prêts pour Power Query : T_REJETS (HISTORIQUE, 1 ligne = 1 erreur), "
               "T_SYNTHESE (SYNTHESE, 1 ligne = 1 opérateur × 1 jour), T_OPE (OPERATEURS)."),
        ("2.", "Dans le Suivi Op : Données › Obtenir des données › À partir d'un fichier › À partir d'un classeur Excel › ce fichier › "
               "cocher T_SYNTHESE (ou T_REJETS) › Charger. Actualiser : Données › Actualiser tout."),
        ("3.", "Clé commune : la colonne « Opérateur » = NOM PRÉNOM en majuscules, comme dans le Suivi Op "
               "(ex. DUPONT JEAN). Erreurs décelées du jour : SOMME.SI.ENS(T_SYNTHESE[Erreurs];T_SYNTHESE[Date];date;T_SYNTHESE[Opérateur];nom)."),
        ("4.", "Si le classeur est ouvert sur le poste rejet, préférer le CSV (option ci-dessus) : Données › À partir d'un fichier texte/CSV › "
               "Rejets_historique.csv (origine 65001 UTF-8, séparateur point-virgule)."),
        ("M", 'let Source = Excel.Workbook(File.Contents("\\\\serveur\\partage\\Controle_Rejets_V4.xlsm"), true, true), '
              'T = Source{[Item="T_SYNTHESE",Kind="Table"]}[Data], '
              'Typ = Table.TransformColumnTypes(T,{{"Date", type date}, {"Erreurs", Int64.Type}}) in Typ'),
    ]
    for num, txt in aide_pq:
        put(r, f"B{lig}", num, F(JAUNE, 10, True), fond(SURF), Alignment(horizontal="right", vertical="top", indent=1))
        put(r, f"C{lig}", txt, F(CRAIE if num != "M" else "9FE3B4", 9, name=POLICE if num != "M" else MONO), fond(SURF),
            Alignment(wrap_text=True, vertical="top", indent=1), fusion=f"C{lig}:D{lig}")
        r.row_dimensions[lig].height = 44 if num != "M" else 58
        lig += 1

    section("MODE D'EMPLOI (poste rejet)")
    for num, txt in [
        ("1", "Scanner le contenant dans la case jaune : la date et l'heure se mettent seules."),
        ("2", "Type d'erreur : liste ou taper 1 à 6 (1 Manquante · 2 Qté + · 3 Qté − · 4 Orientation · 5 Référence · 6 Casse)."),
        ("3", "Orientation : la case « 2e colis » s'allume en jaune → scanner l'autre colis. 2 colis, 1 seule erreur."),
        ("4", "Référence concernée, allée (liste ou n°), opérateur (liste ou matricule), commentaire si besoin."),
        ("5", "Suivez le jaune : la prochaine case à remplir est toujours jaune. Ligne complète = ✔ dans STATUT."),
        ("6", "Chaque début de journée, la veille part seule dans HISTORIQUE (rien à faire). Le fichier s'enregistre seul."),
    ]:
        put(r, f"B{lig}", num, F(JAUNE, 10, True), fond(SURF), AL_D)
        put(r, f"C{lig}", txt, F(CRAIE, 10), fond(SURF), AL_GW, fusion=f"C{lig}:D{lig}")
        r.row_dimensions[lig].height = 24
        lig += 1
    for k, v in refs.items():
        nom(wb, k, v)
    r.freeze_panes = "A4"

    # ══════════════════════════ OPERATEURS ══════════════════════════
    fond_feuille(o, BETON, 10)
    largeurs(o, {"A": 12, "B": 22, "C": 20, "D": 32, "E": 20, "F": 9, "G": 3, "H": 60})
    bandeau(o, "OPÉRATEURS", "NOM PRÉNOM = clé commune avec le Suivi Op · Actif = NON : retiré de la liste de SAISIE", 8, "OPERATEURS")
    o.merge_cells("A1:F1")
    navigation(o, ["A:A", "B:B", "C:C", "D:D", "E:F", "H:H"], "OPERATEURS", derniere=8)
    o.row_dimensions[4].height = 8
    for j, n in enumerate(COL_OPE, 1):
        o.cell(5, j, n)
    ops_tries = sorted(ops, key=lambda x: (x["nom"], x["pre"]))
    for i in range(OPE_LIGNES):
        rr = 6 + i
        x = ops_tries[i] if i < len(ops_tries) else None
        vals = [x["mat"], x["nom"], x["pre"]] if x else [None, None, None]
        for j, v in enumerate(vals, 1):
            cc = o.cell(rr, j, v)
            cc.font = F(CRAIE, 10, name=MONO if j == 1 else POLICE)
            cc.number_format = "@" if j == 1 else "General"
        cc = o.cell(rr, 4, f'=IF(B{rr}="","",UPPER(TRIM(B{rr}))&IF(C{rr}="",""," "&UPPER(TRIM(C{rr}))))')
        cc.font = F(JAUNE, 10, True)
        o.cell(rr, 5, x["fonc"] if x else None).font = F(ACIER, 10)
        cc = o.cell(rr, 6, "OUI" if x else None)
        cc.font = F(CRAIE, 10, True)
        cc.alignment = AL_C
    tab = Table(displayName="T_OPE", ref=f"A5:F{5 + OPE_LIGNES}", tableStyleInfo=style_table)
    o.add_table(tab)
    tableau_sombre(o, 5, 6, 5 + OPE_LIGNES)
    dv = DataValidation(type="list", formula1='"OUI,NON"', allow_blank=True)
    o.add_data_validation(dv)
    dv.add(f"F6:F{5 + OPE_LIGNES}")
    dv = DataValidation(type="list", formula1='"Operateur,Operateur expert,Interimaire,Pilote,Chef d\'equipe"', allow_blank=True,
                        showErrorMessage=False)
    o.add_data_validation(dv)
    dv.add(f"E6:E{5 + OPE_LIGNES}")
    o.conditional_formatting.add(f"F6:F{5 + OPE_LIGNES}", FormulaRule(formula=['$F6="NON"'], font=Font(color=ROUGE, bold=True)))
    o.conditional_formatting.add(f"A6:E{5 + OPE_LIGNES}", FormulaRule(formula=['$F6="NON"'], font=Font(color=ACIER2, strike=True)))
    put(o, "H5", "COMMENT FAIRE", F(JAUNE, 10, True), fond(BETON), AL_G, Border(bottom=cote(JAUNE, "medium")))
    for k, txt in enumerate([
        "Nouvel opérateur : remplir Matricule, Nom, Prénom sur la 1re ligne vide. NOM PRÉNOM se calcule seul.",
        "Départ : mettre Actif = NON (ne jamais supprimer : l'historique garde son nom).",
        "La liste déroulante de SAISIE (actifs, triés A→Z) se met à jour toute seule.",
        "Dans SAISIE on peut aussi taper le matricule (ex. 123) ou le début du nom (ex. dup).",
    ]):
        put(o, f"H{6 + k}", txt, F(ACIER, 9), fond(BETON), AL_G)
    o.freeze_panes = "A6"

    # ══════════════════════════ HISTORIQUE ══════════════════════════
    fond_feuille(h, BETON, 22)
    for j, w in enumerate(LARG_H, 1):
        h.column_dimensions[L(j)].width = w
    bandeau(h, "HISTORIQUE DES REJETS", "1 ligne = 1 erreur · une orientation = 2 colis mais 1 seule erreur · source du tableau de bord, de la synthèse et du Suivi Op", 19, "HISTORIQUE")
    h.merge_cells("A1:F1")
    h.merge_cells("A2:S2")
    put(h, "M1", '=COUNT(T_REJETS[Date])&" erreurs archivées"', F(JAUNE, 12, True), align=AL_D, fusion="M1:S1")
    navigation(h, ["A:B", "C:C", "D:D", "F:G", "I:I", "K:K"], "HISTORIQUE", derniere=19)
    h.row_dimensions[3].height = 24
    # recherche
    h.row_dimensions[4].height = 30
    put(h, "A4", "🔍  RECHERCHE", F(ACIER, 9, True), fond(BETON), AL_D, fusion="A4:B4")
    put(h, "C4", None, F(BETON, 12, True, name=MONO), fond(JAUNE), AL_G,
        Border(left=cote(BETON), right=cote(BETON), top=cote(BETON), bottom=cote(BETON)), fusion="C4:F4")
    put(h, "G4", "contenant, réf, opérateur, allée, type, date (14/10)… plusieurs mots possibles, puis Entrée",
        F(ACIER, 8), fond(BETON), AL_GW, fusion="G4:J4")
    put(h, "K4", f"{len(lignes)} ligne(s) · tout est affiché", F(JAUNE, 9, True), fond(BETON), AL_G, fusion="K4:S4")
    # table en ligne 6
    h.row_dimensions[5].height = 6
    for j, n in enumerate(COL_H, 1):
        h.cell(6, j, n)
    for i, x in enumerate(lignes):
        rr = 7 + i
        cal = calendrier(x)
        vals = [x["date"], x["heure"], x["cont"] or None, x["cont2"] or None, x["colis"], x["type"], x["ref"] or None,
                x["allee"] or None, x["ope"] or None, x["mat"] or None, x["com"] or None] + cal + \
               [x["user"] or None, x["src"], x["id"]]
        for j, v in enumerate(vals, 1):
            cc = h.cell(rr, j, v)
            cc.font = F(CRAIE if j not in (1, 2, 12, 13, 14, 15, 16, 17, 18, 19) else ACIER, 10,
                        name=MONO if j in (3, 4, 7, 10, 19) else POLICE, bold=(j == 6))
            if j in (3, 4, 7, 8, 10, 19):
                cc.number_format = "@"
            if j == 1:
                cc.number_format = "dd/mm/yyyy"
            if j == 2:
                cc.number_format = "hh:mm"
            if j == 16:
                cc.number_format = '0"h"'
            if j in (2, 5, 8, 12, 13, 14, 15, 16):
                cc.alignment = Alignment(horizontal="center")
    fin_h = 6 + max(1, len(lignes))
    h.add_table(Table(displayName="T_REJETS", ref=f"A6:S{fin_h}", tableStyleInfo=style_table))
    tableau_sombre(h, 6, 19, 60000)
    for k, (lab, _, coul, teinte) in enumerate(TYPES, 1):
        h.conditional_formatting.add("F7:F60000", FormulaRule(formula=[f"$F7=TYPE{k}"], font=Font(color=coul, bold=True)))
    h.conditional_formatting.add("D7:D60000", FormulaRule(formula=['$D7<>""'], font=Font(color=BLEU, bold=True)))
    h.conditional_formatting.add("E7:E60000", FormulaRule(formula=["$E7=2"], font=Font(color=BLEU, bold=True)))
    h.freeze_panes = "B7"

    # ══════════════════════════ SYNTHESE ══════════════════════════
    fond_feuille(sy, BETON, 18)
    largeurs(sy, {"A": 11, "B": 26, "C": 10, "D": 8, "E": 7, "F": 10, "G": 10, "H": 10, "I": 11, "J": 10, "K": 8,
                  "L": 7, "M": 7, "N": 6, "O": 8})
    bandeau(sy, "SYNTHÈSE PAR OPÉRATEUR ET PAR JOUR",
            "1 ligne = 1 opérateur × 1 jour (erreurs archivées) · reconstruite à chaque archivage · à brancher sur le Suivi Op (PROD · erreurs décelées)", 15, "SYNTHESE")
    sy.merge_cells("A1:H1")
    sy.merge_cells("A2:O2")
    navigation(sy, ["A:A", "B:B", "C:D", "E:G", "H:I", "J:K"], "SYNTHESE", derniere=15)
    sy.row_dimensions[4].height = 8
    for j, n in enumerate(COL_SY, 1):
        sy.cell(5, j, n)
    for i, row in enumerate(synth):
        for j, v in enumerate(row, 1):
            cc = sy.cell(6 + i, j, v)
            cc.font = F(CRAIE if j in (2, 4) else ACIER, 10, bold=(j == 4), name=MONO if j == 3 else POLICE)
            if j == 1:
                cc.number_format = "dd/mm/yyyy"
            if j == 3:
                cc.number_format = "@"
            if j >= 4:
                cc.alignment = Alignment(horizontal="center")
                if 6 <= j <= 12:
                    cc.number_format = '0;-0;"·"'
    sy.add_table(Table(displayName="T_SYNTHESE", ref=f"A5:O{5 + max(1, len(synth))}", tableStyleInfo=style_table))
    tableau_sombre(sy, 5, 15, 20000)
    for k, (_, _, coul, _) in enumerate(TYPES):
        col = L(6 + k)
        sy.conditional_formatting.add(f"{col}6:{col}20000", FormulaRule(formula=[f"{col}6>0"], font=Font(color=coul, bold=True)))
    sy.freeze_panes = "C6"

    # ══════════════════════════ SAISIE ══════════════════════════
    fond_feuille(s, BETON, 14)
    largeurs(s, {"A": 4.5, "B": 9, "C": 7.5, "D": 19, "E": 19, "F": 16, "G": 16, "H": 10, "I": 27, "J": 40, "K": 13,
                 "L": 9, "M": 12})
    s.column_dimensions["L"].hidden = True
    s.column_dimensions["M"].hidden = True
    s.row_dimensions[1].height = 34
    s.row_dimensions[2].height = 20
    zone(s, "A1:K2", fill=fond(BETON))
    put(s, "A1", "CONTRÔLE DES REJETS", F(CRAIE, 20, True), align=Alignment(vertical="center", indent=1), fusion="A1:E1")
    put(s, "A2", '=SITE_NOM&"  ·  "&SITE_CODE&"  ·  "&SITE_SERVICE&"  ·  poste rejet"', F(ACIER, 9),
        align=Alignment(vertical="center", indent=1), fusion="A2:E2")
    put(s, "F1", "=TODAY()", F(CRAIE, 13, True), align=AL_C, fmt="dddd d mmmm yyyy", fusion="F1:H1")
    put(s, "F2", "=MAX(S_HEURE)", F(ACIER, 9), align=AL_C, fmt='[=0]"aucune saisie aujourd\'hui";"dernière saisie à "hh:mm', fusion="F2:H2")
    put(s, "I1", "=COUNTA(S_CONT)", F(VERT, 26, True), align=AL_C, fmt='0', fusion="I1:I2")
    put(s, "J1", "ERREURS AUJOURD'HUI", F(CRAIE, 10, True), align=Alignment(vertical="bottom", indent=1))
    put(s, "J2", '="colis : "&(COUNTA(S_CONT)+COUNTA(S_CONT2))&"   ·   seuils "&SEUIL_O&" / "&SEUIL_R', F(ACIER, 9),
        align=Alignment(vertical="top", indent=1))
    put(s, "K1", '=COUNTIF(S_STAT,"à compléter")', F(ORANGE, 10, True), align=AL_CW,
        fmt='0" à compléter";-0;"✔ tout est complet"', fusion="K1:K2")
    s["K1"].alignment = AL_C
    s.conditional_formatting.add("I1", FormulaRule(formula=["$I$1>=SEUIL_R"], font=Font(color=ROUGE, bold=True)))
    s.conditional_formatting.add("I1", FormulaRule(formula=["$I$1>=SEUIL_O"], font=Font(color=ORANGE, bold=True)))
    s.conditional_formatting.add("K1", FormulaRule(formula=["$K$1=0"], font=Font(color=VERT, bold=True)))
    navigation(s, ["A:C", "D:D", "E:E", "F:F", "G:H", "I:I"], "SAISIE", derniere=11)
    # bandeau de messages (formule par défaut ; les macros y écrivent la consigne)
    s.row_dimensions[4].height = 30
    put(s, "A4", '=IF(MACROS<>TODAY(),"⚠  Macros désactivées : cliquer « Activer le contenu ». Sans macros, pas d\'heure '
                 'automatique ni d\'archivage.","→  Scanner un contenant (case jaune) : la date et l\'heure se mettent seules.")',
        F(JAUNE, 13, True), fond(SURF), Alignment(vertical="center", indent=1), fusion="A4:K4", libre=True,
        border=Border(top=cote(BETON, "medium"), bottom=cote(BETON, "medium")))
    s.conditional_formatting.add("A4", FormulaRule(formula=['LEFT($A$4,1)="⚠"'], font=Font(color=CRAIE, bold=True), fill=fond("7A1A15")))
    # ligne 5 : aujourd'hui par type
    s.row_dimensions[5].height = 24
    put(s, "A5", "AUJOURD'HUI", F(ACIER, 8, True), fond(BETON), AL_D, fusion="A5:C5")
    for k, col in enumerate(["D", "E", "F", "G", "H", "I"]):
        lab, court, coul, teinte = TYPES[k]
        put(s, f"{col}5", f'=TCOURT{k + 1}&"   "&COUNTIF(S_TYPE,TYPE{k + 1})', F(coul, 10, True), fond(teinte), AL_C,
            Border(left=cote(BETON, "thick"), right=cote(BETON, "thick"), top=cote(BETON, "thin"), bottom=cote(BETON, "thin")))
    put(s, "J5", '="AUTRE   "&(COUNTA(S_TYPE)-' + "-".join(f"COUNTIF(S_TYPE,TYPE{k})" for k in range(1, 7)) + ')',
        F(ACIER, 10, True), fond(PLATE), AL_C, Border(left=cote(BETON, "thick")), fusion="J5:K5")
    # en-têtes
    s.row_dimensions[6].height = 38
    entetes = [("#", ""), ("DATE", "auto"), ("HEURE", "auto"), ("CONTENANT", "▸ scanner ici"),
               ("2e COLIS", "▸ si orientation"), ("TYPE D'ERREUR", "liste ou 1 à 6"), ("RÉFÉRENCE", "concernée"),
               ("ALLÉE", "liste ou n°"), ("OPÉRATEUR", "liste ou matricule"), ("COMMENTAIRE", "facultatif"),
               ("STATUT", "auto"), ("Matricule", ""), ("Saisi par", "")]
    for j, (a, b) in enumerate(entetes, 1):
        cc = s.cell(6, j)
        cc.value = riche(a, b, JAUNE if j in (4, 5) else CRAIE) if b else a
        cc.font = F(CRAIE, 10, True)
        cc.fill = fond(BETON if j not in (4, 5) else "1E1A00")
        cc.alignment = AL_CW
        cc.border = Border(bottom=cote(JAUNE if j in (4, 5) else EDGE, "medium"),
                           left=cote(BETON) if j != 5 else cote("1E1A00"), right=cote(BETON) if j != 4 else cote("1E1A00"))
    # lignes de saisie
    for rr in range(S_L1, S_LN + 1):
        s.row_dimensions[rr].height = 21
        bg = fond(LIGNE_A if rr % 2 else LIGNE_B)
        b = Border(bottom=cote(TRAIT), right=cote("1F2329"))
        for j in range(1, 14):
            cc = s.cell(rr, j)
            cc.fill = bg
            cc.border = b
        s.cell(rr, 1, f'=IF($D{rr}="","",ROW()-{S_L1 - 1})').font = F(ACIER2, 8)
        s.cell(rr, 1).alignment = AL_C
        for j, (font, fmt, al) in {
            2: (F(ACIER, 9), "dd/mm", AL_C), 3: (F(ACIER, 9), "hh:mm", AL_C),
            4: (F(CRAIE, 11, True, MONO), "@", AL_G), 5: (F(BLEU, 11, True, MONO), "@", AL_G),
            6: (F(CRAIE, 10, True), "General", AL_G), 7: (F(CRAIE, 11, False, MONO), "@", AL_G),
            8: (F(CRAIE, 10, True), "@", AL_C), 9: (F(CRAIE, 10), "General", AL_G),
            10: (F(ACIER, 9), "General", AL_G), 12: (F(ACIER, 9), "@", AL_C), 13: (F(ACIER, 9), "@", AL_C),
        }.items():
            cc = s.cell(rr, j)
            cc.font, cc.number_format, cc.alignment, cc.protection = font, fmt, al, LIBRE
        cc = s.cell(rr, 11, f'=IF($D{rr}="","",IF(AND($F{rr}<>"",$G{rr}<>"",$H{rr}<>"",$I{rr}<>"",'
                            f'OR($F{rr}<>TYPE_2COLIS,$E{rr}<>"")),"✔ complet","à compléter"))')
        cc.font, cc.alignment = F(ACIER, 9, True), AL_C
    jaune = dict(fill=fond(JAUNE), font=Font(color=BETON, bold=True))
    suite = f'$D{S_L1}<>"",$F{S_L1}<>"",OR($F{S_L1}<>TYPE_2COLIS,$E{S_L1}<>"")'
    regles = [
        (f"D{S_L1}:D{S_LN}", f'AND($D{S_L1}="",$D{S_L1 - 1}<>"")', jaune),
        (f"F{S_L1}:F{S_LN}", f'AND($D{S_L1}<>"",$F{S_L1}="")', jaune),
        (f"E{S_L1}:E{S_LN}", f'AND($D{S_L1}<>"",$F{S_L1}=TYPE_2COLIS,$E{S_L1}="")', jaune),
        (f"G{S_L1}:G{S_LN}", f'AND({suite},$G{S_L1}="")', jaune),
        (f"H{S_L1}:H{S_LN}", f'AND({suite},$G{S_L1}<>"",$H{S_L1}="")', jaune),
        (f"I{S_L1}:I{S_LN}", f'AND({suite},$G{S_L1}<>"",$H{S_L1}<>"",$I{S_L1}="")', jaune),
        (f"E{S_L1}:E{S_LN}", f'AND($E{S_L1}<>"",$F{S_L1}=TYPE_2COLIS)', dict(fill=fond("13233D"), font=Font(color=BLEU, bold=True))),
        (f"E{S_L1}:E{S_LN}", f'AND($D{S_L1}<>"",$F{S_L1}<>TYPE_2COLIS)', dict(fill=fond("0E1013"), font=Font(color="0E1013"))),
    ]
    for ref, f, st in regles:
        s.conditional_formatting.add(ref, FormulaRule(formula=[f], stopIfTrue=True, **st))
    for k, (lab, _, coul, teinte) in enumerate(TYPES, 1):
        s.conditional_formatting.add(f"F{S_L1}:F{S_LN}", FormulaRule(formula=[f"$F{S_L1}=TYPE{k}"],
                                     fill=fond(teinte), font=Font(color=coul, bold=True)))
    s.conditional_formatting.add(f"K{S_L1}:K{S_LN}", FormulaRule(formula=[f'$K{S_L1}="à compléter"'], font=Font(color=ORANGE, bold=True)))
    s.conditional_formatting.add(f"K{S_L1}:K{S_LN}", FormulaRule(formula=[f'LEFT($K{S_L1},1)="✔"'], font=Font(color=VERT, bold=True)))
    for col, f, titre, msg in [
        ("F", "=L_TYPES", None, None), ("H", "=L_ALLEES", None, None), ("I", "=L_OPE", None, None),
    ]:
        dv = DataValidation(type="list", formula1=f, allow_blank=True, showErrorMessage=False)
        s.add_data_validation(dv)
        dv.add(f"{col}{S_L1}:{col}{S_LN}")
    dv = DataValidation(type="custom", formula1="TRUE", allow_blank=True, showErrorMessage=False, showInputMessage=True,
                        promptTitle="2e colis (orientation)", prompt="Scanner l'AUTRE colis concerné : 2 colis, 1 seule erreur.")
    s.add_data_validation(dv)
    dv.add(f"E{S_L1}:E{S_LN}")
    s.freeze_panes = f"A{S_L1}"
    s.protection.sheet = True
    s.protection.formatColumns = False
    s.protection.formatRows = False
    s.protection.selectLockedCells = False
    s.protection.selectUnlockedCells = False
    for n_, col in [("S_DATE", "B"), ("S_HEURE", "C"), ("S_CONT", "D"), ("S_CONT2", "E"), ("S_TYPE", "F"), ("S_REF", "G"),
                    ("S_ALLEE", "H"), ("S_OPE", "I"), ("S_STAT", "K")]:
        nom(wb, n_, f"SAISIE!${col}${S_L1}:${col}${S_LN}")
    s.sheet_view.selection[0].activeCell = f"D{S_L1}"
    s.sheet_view.selection[0].sqref = f"D{S_L1}"

    # ══════════════════════════ CALC (masqué) ══════════════════════════
    c["A1"] = "Calculs du tableau de bord (ne pas modifier)"
    calc_noms = [
        ("PER_IDX", "IFERROR(MATCH(F_PERIODE,L_PERIODES,0),8)"),
        ("LUNDI", "TODAY()-WEEKDAY(TODAY(),2)+1"),
        ("P_DEBUT", "CHOOSE(PER_IDX,TODAY(),WORKDAY(TODAY(),-1),TODAY()-6,LUNDI,LUNDI-7,DATE(YEAR(TODAY()),MONTH(TODAY()),1),"
                    "EOMONTH(TODAY(),-2)+1,TODAY()-29,DATE(YEAR(TODAY()),1,1),H_MIN,IF(ISNUMBER(F_DU),F_DU,TODAY()))"),
        ("P_FIN", "CHOOSE(PER_IDX,TODAY(),WORKDAY(TODAY(),-1),TODAY(),TODAY(),LUNDI-1,TODAY(),EOMONTH(TODAY(),-1),TODAY(),"
                  "TODAY(),TODAY(),IF(ISNUMBER(F_AU),MAX(F_AU,P_DEBUT),MAX(TODAY(),P_DEBUT)))"),
        ("PP_DEBUT", "CHOOSE(PER_IDX,WORKDAY(TODAY(),-1),WORKDAY(TODAY(),-2),TODAY()-13,LUNDI-7,LUNDI-14,EDATE(P_DEBUT,-1),"
                     "EOMONTH(TODAY(),-3)+1,TODAY()-59,DATE(YEAR(TODAY())-1,1,1),P_DEBUT-1,P_DEBUT-(P_FIN-P_DEBUT+1))"),
        ("PP_FIN", "CHOOSE(PER_IDX,WORKDAY(TODAY(),-1),WORKDAY(TODAY(),-2),TODAY()-7,TODAY()-7,LUNDI-8,EDATE(TODAY(),-1),"
                   "EOMONTH(TODAY(),-2),TODAY()-30,EDATE(TODAY(),-12),P_DEBUT-1,P_DEBUT-1)"),
        ("N_JOURS", "MAX(1,NETWORKDAYS(P_DEBUT,MIN(P_FIN,TODAY())))"),
        ("OPCRIT", 'IF(OR(F_OPE="",F_OPE="Tous"),"<>#AUCUN#",F_OPE)'),
        ("H_MIN", "IF(COUNT(T_REJETS[Date])=0,TODAY(),MIN(T_REJETS[Date]))"),
    ]
    for i, (n_, f) in enumerate(calc_noms, 2):
        c.cell(i, 1, n_)
        cc = c.cell(i, 2, "=" + f)
        if n_ not in ("PER_IDX", "N_JOURS", "OPCRIT"):
            cc.number_format = "dd/mm/yyyy"
        nom(wb, n_, f"CALC!$B${i}")
    c["D1"] = "Périodes"
    for i, p in enumerate(PERIODES, 2):
        c.cell(i, 4, p)
    nom(wb, "L_PERIODES", f"CALC!$D$2:$D${1 + len(PERIODES)}")
    # listes d'opérateurs (reconstruites par macro ; valeurs initiales ici)
    noms_ops = sorted({f"{x['nom']} {x['pre']}".strip() for x in ops})
    c["F1"], c["G1"] = "Opérateurs actifs (SAISIE)", "Filtre (tableau de bord)"
    for i, n_ in enumerate(noms_ops, 2):
        c.cell(i, 6, n_)
    c.cell(2, 7, "Tous")
    for i, n_ in enumerate(noms_ops, 3):
        c.cell(i, 7, n_)
    nom(wb, "L_OPE", "OFFSET(CALC!$F$2,0,0,MAX(1,COUNTA(CALC!$F$2:$F$201)),1)")
    nom(wb, "L_OPE_FILTRE", "OFFSET(CALC!$G$2,0,0,MAX(1,COUNTA(CALC!$G$2:$G$201)),1)")
    # classement des opérateurs (toute l'équipe, période choisie)
    c["I1"], c["J1"], c["K1"], c["M1"], c["N1"], c["O1"] = "Opérateur", "Nb", "Clé", "Rang", "Ligne", "Nom classé"
    for i in range(2, 2 + OPE_LIGNES):
        c.cell(i, 9, f'=IFERROR(INDEX(T_OPE[NOM PRÉNOM],{i - 1})&"","")')
        c.cell(i, 10, f'=IF(I{i}="",-1,{compte([], ope=f"I{i}")})')
        c.cell(i, 11, f"=J{i}+(1000-ROW())/100000")
    for k in range(1, 21):
        i = 1 + k
        c.cell(i, 13, k)
        c.cell(i, 14, f"=MATCH(LARGE($K$2:$K${1 + OPE_LIGNES},M{i}),$K$2:$K${1 + OPE_LIGNES},0)")
        c.cell(i, 15, f'=IF(INDEX($J$2:$J${1 + OPE_LIGNES},N{i})>0,INDEX($I$2:$I${1 + OPE_LIGNES},N{i}),"")')
    # 400 derniers jours (équipe) : jours en alerte
    c["Q1"], c["R1"] = "Jour", "Erreurs équipe"
    for i in range(2, 402):
        c.cell(i, 17, f"=TODAY()-{401 - i}").number_format = "dd/mm/yyyy"
        c.cell(i, 18, f"=COUNTIF(T_REJETS[Date],Q{i})+COUNTIF(S_DATE,Q{i})")
    # tendance : 25 derniers jours ouvrés
    for col, n_ in zip("TUVWXY", ["Jour", "Nb", "Normal", "Alerte", "Rouge", "Étiquette"]):
        c[f"{col}1"] = n_
    for i in range(2, 27):
        c.cell(i, 20, f"=WORKDAY(TODAY()+1,{i - 27})").number_format = "dd/mm/yyyy"
        c.cell(i, 21, f"=COUNTIFS(T_REJETS[Date],T{i},T_REJETS[Opérateur],OPCRIT)+COUNTIFS(S_DATE,T{i},S_OPE,OPCRIT)")
        c.cell(i, 22, f"=IF(U{i}<SEUIL_O,U{i},0)")
        c.cell(i, 23, f"=IF(AND(U{i}>=SEUIL_O,U{i}<SEUIL_R),U{i},0)")
        c.cell(i, 24, f"=IF(U{i}>=SEUIL_R,U{i},0)")
        c.cell(i, 25, f'=RIGHT("0"&DAY(T{i}),2)&"/"&RIGHT("0"&MONTH(T{i}),2)')
    # heures
    c["AA1"], c["AB1"], c["AC1"] = "Heure", "Nb", "Étiquette"
    for i in range(2, 20):
        hh = 3 + i
        c.cell(i, 27, hh)
        c.cell(i, 28, "=COUNTIFS(T_REJETS[Date],\">=\"&P_DEBUT,T_REJETS[Date],\"<=\"&P_FIN,T_REJETS[Tranche],AA{0},"
                      "T_REJETS[Opérateur],OPCRIT)+COUNTIFS(S_DATE,\">=\"&P_DEBUT,S_DATE,\"<=\"&P_FIN,"
                      "S_HEURE,\">=\"&AA{0}/24,S_HEURE,\"<\"&(AA{0}+1)/24,S_OPE,OPCRIT)".format(i))
        c.cell(i, 29, f'=AA{i}&"h"')

    # ══════════════════════════ TABLEAU DE BORD ══════════════════════════
    fond_feuille(t, BETON, 24)
    t.column_dimensions["A"].width = 2
    for col in range(2, 22):
        t.column_dimensions[L(col)].width = 7.3
    t.column_dimensions["V"].width = 2
    t.row_dimensions[1].height = 36
    t.row_dimensions[2].height = 18
    zone(t, "A1:V2", fill=fond(BETON))
    put(t, "B1", "TABLEAU DE BORD · REJETS", F(CRAIE, 20, True), align=Alignment(vertical="center"), fusion="B1:L1")
    put(t, "M1", '=SITE_NOM&"  ·  "&SITE_CODE&"  ·  "&SITE_SERVICE', F(ACIER, 10), align=AL_D, fusion="M1:U1")
    put(t, "B2", "Erreurs décelées au poste rejet · les cases jaunes pilotent tout le tableau", F(ACIER, 9),
        align=Alignment(vertical="center"), fusion="B2:U2")
    navigation(t, ["B:D", "E:G", "H:J", "K:M", "N:P", "Q:S"], "TABLEAU DE BORD", derniere=22)
    t.row_dimensions[4].height = 8
    # filtres
    t.row_dimensions[5].height = 28
    entree = dict(font=F(BETON, 11, True), fill=fond(JAUNE), border=bord(BETON))
    put(t, "B5", "PÉRIODE", F(ACIER, 9, True), fond(BETON), AL_D, fusion="B5:C5")
    put(t, "D5", PERIODE_DEFAUT, align=AL_C, fusion="D5:G5", libre=True, **entree)
    put(t, "H5", "du", F(ACIER, 9), fond(BETON), AL_C)
    put(t, "I5", None, F(JAUNE, 10, True), fond(JAUNE_FONCE), AL_C, bord(BETON), "dd/mm/yyyy", "I5:J5", libre=True)
    put(t, "K5", "au", F(ACIER, 9), fond(BETON), AL_C)
    put(t, "L5", None, F(JAUNE, 10, True), fond(JAUNE_FONCE), AL_C, bord(BETON), "dd/mm/yyyy", "L5:M5", libre=True)
    put(t, "N5", "OPÉRATEUR", F(ACIER, 9, True), fond(BETON), AL_D, fusion="N5:O5")
    put(t, "P5", "Tous", align=AL_C, fusion="P5:U5", libre=True, **entree)
    t.conditional_formatting.add("I5:M5", FormulaRule(formula=['$D$5="Personnalisée"'], fill=fond(JAUNE), font=Font(color=BETON, bold=True)))
    for n_, ref in [("F_PERIODE", "$D$5"), ("F_DU", "$I$5"), ("F_AU", "$L$5"), ("F_OPE", "$P$5")]:
        nom(wb, n_, f"'TABLEAU DE BORD'!{ref}")
    dv = DataValidation(type="list", formula1="=L_PERIODES", allow_blank=False)
    t.add_data_validation(dv)
    dv.add("D5")
    dv = DataValidation(type="list", formula1="=L_OPE_FILTRE", allow_blank=True)
    t.add_data_validation(dv)
    dv.add("P5")
    dv = DataValidation(type="date", operator="greaterThan", formula1="36526", allow_blank=True,
                        showInputMessage=True, promptTitle="Période personnalisée", prompt="Utilisé si PÉRIODE = Personnalisée.")
    t.add_data_validation(dv)
    dv.add("I5:M5")
    # période analysée
    t.row_dimensions[6].height = 20
    put(t, "B6", "ANALYSE DU", F(ACIER, 8, True), fond(BETON), AL_D, fusion="B6:C6")
    put(t, "D6", "=P_DEBUT", F(CRAIE, 10, True), fond(BETON), AL_C, fmt="ddd dd/mm/yyyy", fusion="D6:F6")
    put(t, "G6", "→", F(ACIER, 10), fond(BETON), AL_C)
    put(t, "H6", "=P_FIN", F(CRAIE, 10, True), fond(BETON), AL_C, fmt="ddd dd/mm/yyyy", fusion="H6:J6")
    put(t, "K6", '=N_JOURS&" jour(s) ouvré(s)"', F(ACIER, 9), fond(BETON), AL_G, fusion="K6:N6")
    put(t, "O6", '=IF(OPCRIT="<>#AUCUN#","toute l\'équipe","opérateur : "&F_OPE)', F(JAUNE, 9, True), fond(BETON), AL_D, fusion="O6:U6")
    t.row_dimensions[7].height = 10

    # KPI
    t.row_dimensions[8].height = 20
    t.row_dimensions[9].height = 30
    t.row_dimensions[10].height = 16
    t.row_dimensions[11].height = 20
    cartes = [("B", "E"), ("F", "I"), ("J", "M"), ("N", "Q"), ("R", "U")]
    for a, b in cartes:
        for rr in range(8, 12):
            for col in range(openpyxl.utils.column_index_from_string(a), openpyxl.utils.column_index_from_string(b) + 1):
                cc = t.cell(rr, col)
                cc.fill = fond(PLATE)
                cc.border = Border(left=cote(BETON, "thick") if L(col) == a else None,
                                   right=cote(BETON, "thick") if L(col) == b else None,
                                   top=cote(JAUNE, "medium") if rr == 8 else None)
        t.merge_cells(f"{a}8:{b}8")
        t.merge_cells(f"{a}9:{b}10")
        t.merge_cells(f"{a}11:{b}11")
    kpi = [
        ("ERREURS", f"={compte()}", "0", '=IF(PER_IDX=10,"tout l\'historique",IF(KPI_PREV=0,IF(B9=0,"= période précédente",'
                                         '"▲ période précédente : 0"),IF(B9>KPI_PREV,"▲ +"&ROUND((B9-KPI_PREV)/KPI_PREV*100,0)&" %",'
                                         'IF(B9<KPI_PREV,"▼ "&ROUND((B9-KPI_PREV)/KPI_PREV*100,0)&" %","= stable"))&"  vs préc. ("&KPI_PREV&")"))'),
        ("MOYENNE / JOUR OUVRÉ", "=ROUND(B9/N_JOURS,1)", "0.0", '="seuils : alerte "&SEUIL_O&" · rouge "&SEUIL_R'),
        ("COLIS CONCERNÉS", f'=B9+{compte([("cont2", chr(34) + "<>" + chr(34))])}', "0",
         '="dont "&(J9-B9)&" orientation(s) à 2 colis"'),
        ("JOURS EN ALERTE · ÉQUIPE", "=SUMPRODUCT((CALC!$Q$2:$Q$401>=P_DEBUT)*(CALC!$Q$2:$Q$401<=P_FIN)*(CALC!$R$2:$R$401>=SEUIL_O))",
         "0", '="dont "&SUMPRODUCT((CALC!$Q$2:$Q$401>=P_DEBUT)*(CALC!$Q$2:$Q$401<=P_FIN)*(CALC!$R$2:$R$401>=SEUIL_R))&" en rouge · sur "&N_JOURS&" j ouvrés"'),
        ("ERREUR N°1", '=IF(B9=0,"—",INDEX($B$16:$B$21,MATCH(MAX($E$16:$E$21),$E$16:$E$21,0)))', "@",
         '=IF(B9=0,"aucune erreur",ROUND(MAX($E$16:$E$21)/B9*100,0)&" % des erreurs de la période")'),
    ]
    for (a, b), (titre, val, fmt, sous) in zip(cartes, kpi):
        put(t, f"{a}8", titre, F(ACIER, 8, True), align=AL_G)
        put(t, f"{a}9", val, F(CRAIE, 26 if a != "R" else 18, True), align=AL_G, fmt=fmt)
        put(t, f"{a}11", sous, F(ACIER, 8), align=AL_G)
    put(t, "W9", f"={compte(debut='PP_DEBUT', fin='PP_FIN')}", F(BETON, 8))
    nom(wb, "KPI_PREV", "'TABLEAU DE BORD'!$W$9")
    nom(wb, "KPI_N", "'TABLEAU DE BORD'!$B$9")
    t.conditional_formatting.add("B11", FormulaRule(formula=['LEFT($B$11,1)="▲"'], font=Font(color=ROUGE, bold=True)))
    t.conditional_formatting.add("B11", FormulaRule(formula=['LEFT($B$11,1)="▼"'], font=Font(color=VERT, bold=True)))
    t.conditional_formatting.add("F9", FormulaRule(formula=["$F$9>=SEUIL_R"], font=Font(color=ROUGE, bold=True), stopIfTrue=True))
    t.conditional_formatting.add("F9", FormulaRule(formula=["$F$9>=SEUIL_O"], font=Font(color=ORANGE, bold=True), stopIfTrue=True))
    t.conditional_formatting.add("F9", FormulaRule(formula=["$F$9>0"], font=Font(color=VERT, bold=True)))
    t.conditional_formatting.add("N9", FormulaRule(formula=["$N$9>0"], font=Font(color=ORANGE, bold=True)))
    t["J9"].font = F(BLEU, 26, True)
    t["R9"].font = F(JAUNE, 18, True)
    t.row_dimensions[12].height = 10

    def titre_bloc(ref_fusion, txt, sous=None):
        a = ref_fusion.split(":")[0]
        put(t, a, riche(txt, sous, JAUNE) if sous else txt, F(JAUNE, 10, True), fond(PLATE2), AL_GW,
            Border(top=cote(JAUNE, "medium")), fusion=ref_fusion)
        zone(t, ref_fusion, fill=fond(PLATE2), border=Border(top=cote(JAUNE, "medium")))

    def corps(ref):
        zone(t, ref, fill=fond(PLATE))

    # ── par type (B13:K22) | tendance (L13:U22)
    t.row_dimensions[13].height = 22
    titre_bloc("B13:K13", "PAR TYPE D'ERREUR")
    titre_bloc("L13:U13", "TENDANCE · 25 DERNIERS JOURS OUVRÉS")
    corps("B14:K23")
    corps("L14:U23")
    for ref, txt in [("B14", "Type"), ("E14", "Nb"), ("F14", "%"), ("G14", "répartition"), ("J14", "vs préc.")]:
        put(t, ref, txt, F(ACIER, 8, True), align=AL_C if ref != "B14" else AL_G)
    t.merge_cells("B14:D14")
    t.merge_cells("G14:I14")
    t.merge_cells("J14:K14")
    tous_types = [(f"TYPE{k + 1}", TYPES[k][2], TYPES[k][3]) for k in range(6)]
    for i, (tn, coul, teinte) in enumerate(tous_types):
        rr = 16 + i
        put(t, f"B{rr}", f"={tn}", F(coul, 10, True), fond(PLATE), AL_G, fusion=f"B{rr}:D{rr}")
        put(t, f"E{rr}", f"={compte([('type', tn)])}", F(CRAIE, 11, True), align=AL_C)
        put(t, f"F{rr}", f"=IF($B$9=0,0,E{rr}/$B$9)", F(ACIER, 9), align=AL_C, fmt="0%")
        put(t, f"G{rr}", f'=REPT("█",ROUND(E{rr}/MAX(1,MAX($E$16:$E$22))*18,0))', F(coul, 8), align=AL_G,
            fusion=f"G{rr}:I{rr}")
        put(t, f"J{rr}", f"=E{rr}-({compte([('type', tn)], debut='PP_DEBUT', fin='PP_FIN')})", F(ACIER, 9, True),
            align=AL_C, fmt='"▲ +"0;"▼ −"0;"="', fusion=f"J{rr}:K{rr}")
    rr = 22
    put(t, f"B{rr}", "Autre / non précisé", F(ACIER, 10, True), align=AL_G, fusion=f"B{rr}:D{rr}")
    put(t, f"E{rr}", "=$B$9-SUM(E16:E21)", F(CRAIE, 11, True), align=AL_C)
    put(t, f"F{rr}", f"=IF($B$9=0,0,E{rr}/$B$9)", F(ACIER, 9), align=AL_C, fmt="0%")
    put(t, f"G{rr}", f'=REPT("█",ROUND(E{rr}/MAX(1,MAX($E$16:$E$22))*18,0))', F(ACIER, 8), align=AL_G, fusion=f"G{rr}:I{rr}")
    put(t, "B15", None)
    t.row_dimensions[15].height = 4
    t.conditional_formatting.add("J16:K21", FormulaRule(formula=["$J16>0"], font=Font(color=ROUGE, bold=True)))
    t.conditional_formatting.add("J16:K21", FormulaRule(formula=["$J16<0"], font=Font(color=VERT, bold=True)))
    put(t, "B23", "Une orientation compte 1 erreur (2 colis).  ▲ = plus d'erreurs que la période précédente.", F(ACIER2, 8, italic=True),
        align=AL_G, fusion="B23:K23")

    ch = BarChart()
    ch.type, ch.grouping, ch.overlap, ch.gapWidth = "col", "stacked", 100, 35
    data = Reference(c, min_col=22, max_col=24, min_row=1, max_row=26)
    ch.add_data(data, titles_from_data=True)
    ch.set_categories(Reference(c, min_col=25, min_row=2, max_row=26))
    for sr, coul in zip(ch.series, [ACIER, ORANGE, ROUGE]):
        serie_couleur(sr, coul)
    habiller(ch)
    ch.width, ch.height = 15.6, 5.2
    t.add_chart(ch, "L14")

    # ── par opérateur (B25:N48) | par allée (O25:U48)
    t.row_dimensions[24].height = 10
    t.row_dimensions[25].height = 22
    titre_bloc("B25:N25", "PAR OPÉRATEUR · TOP 20", "toute l'équipe sur la période · l'opérateur filtré est en jaune")
    t.row_dimensions[25].height = 30
    titre_bloc("O25:U25", "PAR ALLÉE", "période et opérateur filtrés")
    corps("B26:N49")
    corps("O26:U49")
    for ref, txt in [("B26", "Opérateur"), ("F26", "Total")] + [(L(7 + k), f"=TCOURT{k + 1}") for k in range(6)] + \
            [("M26", "Autre"), ("N26", "% éq.")]:
        ref = ref if ref[-1].isdigit() else f"{ref}26"
        put(t, ref, txt, F(ACIER, 8, True), align=AL_C if ref != "B26" else AL_G)
    t.merge_cells("B26:E26")
    for k in range(6):
        t[f"{L(7 + k)}26"].font = F(TYPES[k][2], 8, True)
    put(t, "W27", f"={compte(ope=None)}", F(BETON, 8))
    nom(wb, "N_EQUIPE", "'TABLEAU DE BORD'!$W$27")
    for k in range(20):
        rr = 27 + k
        put(t, f"B{rr}", f"=CALC!O{2 + k}", F(CRAIE, 10), align=AL_G, fusion=f"B{rr}:E{rr}")
        put(t, f"F{rr}", f'=IF($B{rr}="","",INDEX(CALC!$J$2:$J${1 + OPE_LIGNES},CALC!N{2 + k}))', F(CRAIE, 11, True), align=AL_C)
        for j in range(6):
            col = L(7 + j)
            put(t, f"{col}{rr}", f'=IF($B{rr}="","",{compte([("type", f"TYPE{j + 1}")], ope=f"$B{rr}")})', F(CRAIE, 10),
                align=AL_C, fmt='0;-0;"·"')
        put(t, f"M{rr}", f'=IF($B{rr}="","",F{rr}-SUM(G{rr}:L{rr}))', F(ACIER, 10), align=AL_C, fmt='0;-0;"·"')
        put(t, f"N{rr}", f'=IF($B{rr}="","",F{rr}/MAX(1,N_EQUIPE))', F(ACIER, 9), align=AL_C, fmt="0%")
        for col in range(2, 15):
            t.cell(rr, col).border = Border(bottom=cote(TRAIT))
    rr = 47
    put(t, f"B{rr}", "Autres / non renseigné", F(ACIER, 10, italic=True), align=AL_G, fusion=f"B{rr}:E{rr}")
    put(t, f"F{rr}", "=N_EQUIPE-SUM(F27:F46)", F(ACIER, 11, True), align=AL_C, fmt='0;-0;"·"')
    rr = 48
    put(t, f"B{rr}", "TOTAL ÉQUIPE", F(JAUNE, 10, True), align=AL_G, fusion=f"B{rr}:E{rr}")
    put(t, f"F{rr}", "=N_EQUIPE", F(JAUNE, 11, True), align=AL_C)
    for j in range(6):
        col = L(7 + j)
        put(t, f"{col}{rr}", f"={compte([('type', f'TYPE{j + 1}')], ope=None)}", F(TYPES[j][2], 10, True), align=AL_C, fmt='0;-0;"·"')
    put(t, f"M{rr}", "=F48-SUM(G48:L48)", F(ACIER, 10, True), align=AL_C, fmt='0;-0;"·"')
    for col in range(2, 15):
        t.cell(48, col).border = Border(top=cote(JAUNE))
    t.conditional_formatting.add("G27:M46", ColorScaleRule(start_type="num", start_value=0, start_color=PLATE,
                                                           end_type="max", end_color="8B2620"))
    t.conditional_formatting.add("B27:E46", FormulaRule(formula=['AND($B27<>"",$B27=F_OPE)'], font=Font(color=JAUNE, bold=True),
                                                        fill=fond(JAUNE_FONCE)))
    # allées
    put(t, "O26", "Allée", F(ACIER, 8, True), align=AL_C)
    put(t, "P26", "Nb", F(ACIER, 8, True), align=AL_C)
    for k in range(22):
        rr = 27 + k
        put(t, f"O{rr}", f'=IF({k + 1}>COUNTA(R_ALLEES),"",INDEX(R_ALLEES,{k + 1}))', F(CRAIE, 10, True), align=AL_C, fmt="@")
        put(t, f"P{rr}", f'=IF(O{rr}="","",{compte([("allee", f"O{rr}")])})', F(CRAIE, 10), align=AL_C, fmt='0;-0;"·"')
        put(t, f"Q{rr}", f'=IF(O{rr}="","",REPT("█",ROUND(N(P{rr})/MAX(1,MAX($P$27:$P$48))*30,0)))', F(JAUNE, 8),
            align=AL_G, fusion=f"Q{rr}:U{rr}")
    put(t, "O49", "sans", F(ACIER2, 9, italic=True), align=AL_C)
    put(t, "P49", "=$B$9-SUM(P27:P48)", F(ACIER2, 10), align=AL_C, fmt='0;-0;"·"')
    t.conditional_formatting.add("Q27:U48", FormulaRule(formula=['AND(ISNUMBER($P27),$P27=MAX($P$27:$P$48),$P27>0)'],
                                                        font=Font(color=ROUGE)))
    t.conditional_formatting.add("O27:P48", FormulaRule(formula=['AND(ISNUMBER($P27),$P27=MAX($P$27:$P$48),$P27>0)'],
                                                        font=Font(color=ROUGE, bold=True)))

    # ── tranches horaires (B51:K63) | top références (L51:U63)
    t.row_dimensions[50].height = 10
    t.row_dimensions[51].height = 22
    titre_bloc("B51:K51", "PAR TRANCHE HORAIRE", "heure de saisie au poste rejet")
    titre_bloc("L51:U51", "TOP 10 RÉFÉRENCES EN ERREUR", "période et opérateur filtrés")
    t.row_dimensions[51].height = 30
    corps("B52:K63")
    corps("L52:U63")
    for ref, txt in [("L52", "Référence"), ("O52", "Nb"), ("P52", "Dernière"), ("R52", "Opérateur · type")]:
        put(t, ref, txt, F(ACIER, 8, True), align=AL_C if ref != "L52" else AL_G)
    t.merge_cells("L52:N52")
    t.merge_cells("P52:Q52")
    t.merge_cells("R52:U52")
    top = top_refs(lignes, aujourdhui - dt.timedelta(days=29), aujourdhui)
    for k in range(10):
        rr = 53 + k
        ref_, nb_, der_, info_ = top[k] if k < len(top) else (("aucune référence sur la période" if k == 0 else None), None, None, None)
        put(t, f"L{rr}", ref_, F(CRAIE, 10, True, MONO), align=AL_G, fusion=f"L{rr}:N{rr}", libre=True)
        put(t, f"O{rr}", nb_, F(JAUNE, 11, True), align=AL_C, libre=True)
        put(t, f"P{rr}", der_, F(ACIER, 9), align=AL_C, fmt="dd/mm/yyyy", fusion=f"P{rr}:Q{rr}", libre=True)
        put(t, f"R{rr}", info_, F(ACIER, 9), align=AL_G, fusion=f"R{rr}:U{rr}", libre=True)
        for col in range(12, 22):
            t.cell(rr, col).border = Border(bottom=cote(TRAIT))
    put(t, "L63", "calculé par macro à l'ouverture de l'onglet et au changement de filtre", F(ACIER2, 8, italic=True),
        align=AL_G, fusion="L63:U63", libre=True)
    t.conditional_formatting.add("O53:O62", FormulaRule(formula=["$O53>=2"], font=Font(color=ROUGE, bold=True)))
    for n_, ref in [("TOP_REF", "$L$53:$L$62"), ("TOP_NB", "$O$53:$O$62"), ("TOP_DATE", "$P$53:$P$62"),
                    ("TOP_INFO", "$R$53:$R$62"), ("TOP_MAJ", "$L$63")]:
        nom(wb, n_, f"'TABLEAU DE BORD'!{ref}")
    ch = BarChart()
    ch.type, ch.gapWidth = "col", 40
    ch.add_data(Reference(c, min_col=28, min_row=1, max_row=19), titles_from_data=True)
    ch.set_categories(Reference(c, min_col=29, min_row=2, max_row=19))
    serie_couleur(ch.series[0], JAUNE)
    habiller(ch, legende=False)
    ch.dataLabels = DataLabelList(showVal=True, showSerName=False, showCatName=False, showLegendKey=False,
                                  showPercent=False, showLeaderLines=False, numFmt="0;;;")
    ch.dataLabels.txPr = _txt(CRAIE, 800)
    ch.dataLabels.dLblPos = "outEnd"
    ch.width, ch.height = 15.6, 6.4
    t.add_chart(ch, "B52")

    # ── évolution mensuelle (B65:K79) | graphique (L65:U79)
    t.row_dimensions[64].height = 10
    titre_bloc("B65:K65", "ÉVOLUTION MENSUELLE · 12 DERNIERS MOIS", "opérateur filtré")
    titre_bloc("L65:U65", "MÊME CHOSE EN GRAPHIQUE")
    t.row_dimensions[65].height = 30
    corps("B66:K79")
    corps("L66:U79")
    put(t, "B66", "Mois", F(ACIER, 8, True), align=AL_G, fusion="B66:C66")
    for k in range(6):
        put(t, f"{L(4 + k)}66", f"=TCOURT{k + 1}", F(TYPES[k][2], 8, True), align=AL_C)
    put(t, "J66", "Autre", F(ACIER, 8, True), align=AL_C)
    put(t, "K66", "Total", F(JAUNE, 8, True), align=AL_C)
    for m in range(12):
        rr = 67 + m
        debut = f"EDATE(DATE(YEAR(TODAY()),MONTH(TODAY()),1),{m - 11})"
        put(t, f"W{rr}", "=" + debut, F(BETON, 8), fmt="dd/mm/yyyy")
        put(t, f"B{rr}", f'=CHOOSE(MONTH(W{rr}),"janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc.")&" "&YEAR(W{rr})',
            F(CRAIE, 10, True), align=AL_G, fusion=f"B{rr}:C{rr}")
        for k in range(6):
            put(t, f"{L(4 + k)}{rr}", "=" + compte([("type", f"TYPE{k + 1}")], debut=f"W{rr}", fin=f"EOMONTH(W{rr},0)"),
                F(CRAIE, 10), align=AL_C, fmt='0;-0;"·"')
        put(t, f"K{rr}", "=" + compte([], debut=f"W{rr}", fin=f"EOMONTH(W{rr},0)"), F(JAUNE, 10, True), align=AL_C, fmt='0;-0;"·"')
        put(t, f"J{rr}", f"=K{rr}-SUM(D{rr}:I{rr})", F(ACIER, 10), align=AL_C, fmt='0;-0;"·"')
        for col in range(2, 12):
            t.cell(rr, col).border = Border(bottom=cote(TRAIT))
    put(t, "B79", "Sources : HISTORIQUE (T_REJETS) + saisie du jour · formules, sans macro.", F(ACIER2, 8, italic=True),
        align=AL_G, fusion="B79:K79")
    ch = BarChart()
    ch.type, ch.grouping, ch.overlap, ch.gapWidth = "col", "stacked", 100, 45
    ch.add_data(Reference(t, min_col=4, max_col=10, min_row=66, max_row=78), titles_from_data=True)
    ch.set_categories(Reference(t, min_col=2, min_row=67, max_row=78))
    for sr, coul in zip(ch.series, [x[2] for x in TYPES] + [AUTRE_COUL]):
        serie_couleur(sr, coul)
    habiller(ch)
    ch.width, ch.height = 15.6, 7.4
    t.add_chart(ch, "L66")
    t.column_dimensions["W"].hidden = True
    t.freeze_panes = "A7"
    t.protection.sheet = True
    t.protection.formatColumns = False
    t.protection.formatRows = False
    t.protection.selectLockedCells = False
    t.protection.selectUnlockedCells = False

    wb.active = 0
    for ws in wb.worksheets:
        ws.sheet_view.tabSelected = (ws is s)

    # ══════════════════════════ macros ══════════════════════════
    src_mod = (ICI / "vba" / "modRejets.bas").read_text(encoding="utf-8")
    modules = [(n_, "doc", module_document(n_, code, classeur)) for n_, code, classeur in DOCUMENTS]
    modules.append(("modRejets", "std", module_standard("modRejets", src_mod)))
    bin_ = construire_projet(modules)
    faux = io.BytesIO()
    with zipfile.ZipFile(faux, "w") as z:
        z.writestr("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                   '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
                   '<Default Extension="bin" ContentType="application/vnd.ms-office.vbaProject"/></Types>')
        z.writestr("_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                   '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>')
        z.writestr("xl/vbaProject.bin", bin_)
    wb.vba_archive = zipfile.ZipFile(io.BytesIO(faux.getvalue()))
    wb.save(sortie)

    if dossier_bas:
        dossier_bas.mkdir(parents=True, exist_ok=True)
        for n_, genre, src in modules:
            ext = ".bas" if genre == "std" else ".cls.txt"
            texte_ = src if genre == "std" else src.split("Attribute VB_Customizable = True\n", 1)[1]
            with open(dossier_bas / f"{n_}{ext}", "w", encoding="cp1252", newline="\r\n") as fh:
                fh.write(texte_)
    return dict(lignes=len(lignes), ops=len(ops), synthese=len(synth), top=top)


def top_refs(lignes, d1, d2):
    agr = defaultdict(lambda: dict(n=0, der=None, qui=Counter(), quoi=Counter()))
    for x in lignes:
        if d1 <= x["date"] <= d2 and x["ref"]:
            a = agr[x["ref"]]
            a["n"] += 1
            a["der"] = max(a["der"] or x["date"], x["date"])
            a["qui"][x["ope"] or "(non renseigné)"] += 1
            a["quoi"][x["type"] or "(type ?)"] += 1
    def maj(cn):
        (k, _), *reste = cn.most_common()
        return k + (f" (+{len(reste)})" if reste else "")
    tri = sorted(agr.items(), key=lambda kv: (-kv[1]["n"], -(kv[1]["der"].toordinal())))
    return [(ref, a["n"], a["der"], f"{maj(a['qui'])}  ·  {maj(a['quoi'])}") for ref, a in tri[:10]]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("ancien", type=Path, help="ancien Controle_Rejets.xlsm (v3)")
    ap.add_argument("--sortie", type=Path, default=Path("Controle_Rejets_V4.xlsm"))
    ap.add_argument("--bas", type=Path, default=None, help="dossier où écrire les modules VBA (secours, cp1252)")
    ap.add_argument("--date", type=dt.date.fromisoformat, default=dt.date.today())
    a = ap.parse_args()
    res = construire(a.ancien, a.sortie, a.date, a.bas)
    print(f"{a.sortie} : {res['lignes']} erreurs reprises, {res['ops']} opérateurs, {res['synthese']} lignes de synthèse")


if __name__ == "__main__":
    main()
