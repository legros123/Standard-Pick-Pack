"""Post-traitement : macros v9 dans vbaProject.bin + boutons dessinés (formes avec macro).

usage : python finalize.py STAGE.xlsm SORTIE.xlsm
"""
import sys, re, zipfile, io, os, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import openpyxl
from openpyxl.utils import column_index_from_string as CI
import vbabin, make_vba
from buttons import BUTTONS

STAGE, OUT = sys.argv[1], sys.argv[2]
EMU_PX, EMU_PT = 9525, 12700
MARGIN = 3 * EMU_PX

wbx = openpyxl.load_workbook(STAGE)        # lecture des largeurs / hauteurs


def col_px(ws, c):
    from openpyxl.utils import get_column_letter
    d = ws.column_dimensions.get(get_column_letter(c))
    w = d.width if d is not None and d.width else (ws.sheet_format.defaultColWidth or 8.43)
    return int(w * 7 + 5)


def row_pt(ws, r):
    d = ws.row_dimensions.get(r)
    return d.height if d is not None and d.height else (ws.sheet_format.defaultRowHeight or 15)


def cellref(a):
    c, r = re.match(r"([A-Z]+)(\d+)", a).groups()
    return CI(c), int(r)


def anchor(ws, rng):
    a, b = (rng.split(":") + [rng])[:2] if ":" in rng else (rng, rng)
    (c1, r1), (c2, r2) = cellref(a), cellref(b)
    x = sum(col_px(ws, c) for c in range(1, c1)) * EMU_PX
    y = sum(row_pt(ws, r) for r in range(1, r1)) * EMU_PT
    w = sum(col_px(ws, c) for c in range(c1, c2 + 1)) * EMU_PX
    h = sum(row_pt(ws, r) for r in range(r1, r2 + 1)) * EMU_PT
    to_off_c = col_px(ws, c2) * EMU_PX - MARGIN
    to_off_r = int(row_pt(ws, r2) * EMU_PT) - MARGIN
    return dict(c1=c1 - 1, r1=r1 - 1, c2=c2 - 1, r2=r2 - 1, oc2=to_off_c, or2=to_off_r,
                x=int(x) + MARGIN, y=int(y) + MARGIN, w=int(w) - 2 * MARGIN, h=int(h) - 2 * MARGIN)


def drawing_xml(ws, btns):
    parts = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
             '<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" '
             'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">']
    for i, b in enumerate(btns, start=2):
        a = anchor(ws, b["range"])
        size = 900 if len(b["text"]) > 14 else 1000
        parts.append(
            '<xdr:twoCellAnchor editAs="oneCell">'
            '<xdr:from><xdr:col>%(c1)d</xdr:col><xdr:colOff>%(m)d</xdr:colOff><xdr:row>%(r1)d</xdr:row><xdr:rowOff>%(m)d</xdr:rowOff></xdr:from>'
            '<xdr:to><xdr:col>%(c2)d</xdr:col><xdr:colOff>%(oc2)d</xdr:colOff><xdr:row>%(r2)d</xdr:row><xdr:rowOff>%(or2)d</xdr:rowOff></xdr:to>'
            % dict(a, m=MARGIN) +
            '<xdr:sp macro="[0]!%s" textlink="">' % b["macro"] +
            '<xdr:nvSpPr><xdr:cNvPr id="%d" name="%s" descr="%s"/><xdr:cNvSpPr/></xdr:nvSpPr>' % (i, b["name"], html.escape(b["text"])) +
            '<xdr:spPr><a:xfrm><a:off x="%(x)d" y="%(y)d"/><a:ext cx="%(w)d" cy="%(h)d"/></a:xfrm>' % a +
            '<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 22000"/></a:avLst></a:prstGeom>'
            '<a:solidFill><a:srgbClr val="%s"/></a:solidFill><a:ln><a:noFill/></a:ln></xdr:spPr>' % b["color"] +
            '<xdr:txBody><a:bodyPr vertOverflow="clip" horzOverflow="clip" wrap="square" lIns="18000" tIns="0" rIns="18000" bIns="0" rtlCol="0" anchor="ctr"/>'
            '<a:lstStyle/><a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="fr-FR" sz="%d" b="1">' % size +
            '<a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:latin typeface="Segoe UI"/><a:cs typeface="Segoe UI"/></a:rPr>'
            '<a:t>%s</a:t></a:r></a:p></xdr:txBody></xdr:sp><xdr:clientData/></xdr:twoCellAnchor>' % html.escape(b["text"]))
    parts.append('</xdr:wsDr>')
    return "".join(parts)


zin = zipfile.ZipFile(STAGE)
files = {n: zin.read(n) for n in zin.namelist()}

# feuilles -> fichiers
wbxml = files["xl/workbook.xml"].decode("utf8")
rels = files["xl/_rels/workbook.xml.rels"].decode("utf8")
sheet_file = {}
for name, rid in re.findall(r'<sheet [^>]*name="([^"]+)"[^>]*r:id="([^"]+)"', wbxml):
    tgt = re.search(r'Id="%s"[^>]*Target="([^"]+)"' % rid, rels) or re.search(r'Target="([^"]+)"[^>]*Id="%s"' % rid, rels)
    t = tgt.group(1).lstrip("/")
    sheet_file[html.unescape(name)] = t if t.startswith("xl/") else "xl/" + t

ct = files["[Content_Types].xml"].decode("utf8")
by_sheet = {}
for b in BUTTONS:
    by_sheet.setdefault(b["sheet"], []).append(b)
ndraw = 0
for sname, btns in by_sheet.items():
    sf = sheet_file[sname]
    sx = files[sf].decode("utf8")
    assert "<drawing " not in sx, sname
    ndraw += 1
    dname = "xl/drawings/drawing_btn%d.xml" % ndraw
    files[dname] = drawing_xml(wbx[sname], btns).encode("utf8")
    relp = sf.replace("worksheets/", "worksheets/_rels/") + ".rels"
    rid = "rIdBtn%d" % ndraw
    rel = '<Relationship Id="%s" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing_btn%d.xml"/>' % (rid, ndraw)
    if relp in files:
        files[relp] = files[relp].decode("utf8").replace("</Relationships>", rel + "</Relationships>").encode("utf8")
    else:
        files[relp] = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
                       '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">%s</Relationships>' % rel).encode("utf8")
    if 'xmlns:r=' not in sx[:600]:
        sx = sx.replace("<worksheet ", '<worksheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ', 1)
    tag = '<drawing r:id="%s"/>' % rid
    for nxt in ("<legacyDrawing", "<legacyDrawingHF", "<picture", "<oleObjects", "<controls", "<webPublishItems", "<tableParts", "<extLst", "</worksheet>"):
        p = sx.find(nxt)
        if p >= 0:
            sx = sx[:p] + tag + sx[p:]
            break
    files[sf] = sx.encode("utf8")
    ct = ct.replace("</Types>", '<Override PartName="/%s" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>' % dname)
files["[Content_Types].xml"] = ct.encode("utf8")

# macros v9
src = make_vba.build_source()
open(os.path.join(os.path.dirname(OUT) or ".", "PointDuJour_v9.bas"), "wb").write(src.replace("\n", "\r\n").encode("cp1252"))
open("_vba_in.bin", "wb").write(files["xl/vbaProject.bin"])
vbabin.patch("_vba_in.bin", "_vba_out.bin", "PointDuJour", src)
files["xl/vbaProject.bin"] = open("_vba_out.bin", "rb").read()
os.remove("_vba_in.bin"); os.remove("_vba_out.bin")

zout = zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED)
order = ["[Content_Types].xml"] + [n for n in files if n != "[Content_Types].xml"]
for n in order:
    zout.writestr(n, files[n])
zout.close()
print("ok", OUT, "boutons:", len(BUTTONS), "dessins:", ndraw)
