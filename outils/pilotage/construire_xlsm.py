"""Fabrique PP_LIVE.xlsm : le classeur d'origine + modPilotageLive + modToutLive + onglet PILOTAGE + démarrage automatique.
Usage : construire_xlsm.py PP_LIVE_origine.xlsm Classeur_Pilotage.xlsm modPilotageLive.bas modToutLive.txt SORTIE.xlsm"""
import sys, struct, zipfile, re, io
from xml.sax.saxutils import escape
import olefile
from openpyxl import load_workbook
import ovba

src, src_pil, f_pil, f_tout, dst = sys.argv[1:6]
zin = zipfile.ZipFile(src)
parts = {n: zin.read(n) for n in zin.namelist()}

# ───────── 1. projet VBA ─────────
ole = olefile.OleFileIO(io.BytesIO(parts["xl/vbaProject.bin"]))
recs = ovba.lire_dir(ovba.decompress(ole.openstream("VBA/dir").read()))
noms = [r[1].decode("cp1252") for r in recs if r[0] == 0x19]
offs = [struct.unpack("<I", r[1])[0] for r in recs if r[0] == 0x31]
sources = {n: ovba.decompress(ole.openstream("VBA/" + n).read()[o:]) for n, o in zip(noms, offs)}

crlf = lambda t: t.replace("\r\n", "\n").replace("\n", "\r\n")
sources["modPilotageLive"] = crlf(open(f_pil, encoding="cp1252", newline="").read()).encode("cp1252")
sources["modToutLive"] = crlf(open(f_tout, encoding="cp1252", newline="").read()).encode("cp1252")
FEUILLE = "Feuil12"
assert FEUILLE not in noms
sources[FEUILLE] = sources["Feuil11"].replace(b'"Feuil11"', b'"' + FEUILLE.encode() + b'"')
entete_tw = sources["ThisWorkbook"].split(b"\r\n\r\n")[0]
assert entete_tw.count(b"Attribute VB_") == 8
sources["ThisWorkbook"] = entete_tw + crlf('''
Option Explicit

Private Sub Workbook_Open()
    Application.OnTime Now + TimeSerial(0, 0, 15), "TOUT_DEMARRER"
End Sub

Private Sub Workbook_BeforeClose(Cancel As Boolean)
    On Error Resume Next
    Application.Run "TOUT_ARRETER"
End Sub
''').encode("cp1252")

nouveaux = [(FEUILLE, True), ("modPilotageLive", False), ("modToutLive", False)]
fin = recs.pop(); assert fin[0] == 0x10 and fin[1] == b""
for r in recs:
    if r[0] == 0x31: r[1] = struct.pack("<I", 0)            # code source seul : il commence au début du flux
    if r[0] == 0x0F: r[1] = struct.pack("<H", len(noms) + len(nouveaux))
for n, doc in nouveaux: recs += ovba.module_recs(n, doc)
recs.append(fin)

projet = ole.openstream("PROJECT").read().decode("cp1252")
projet = projet.replace("Document=Feuil11/&H00000000\r\n", "Document=Feuil11/&H00000000\r\nDocument=%s/&H00000000\r\n" % FEUILLE, 1)
projet = projet.replace("Module=M03_EXPORT\r\n", "Module=M03_EXPORT\r\nModule=modPilotageLive\r\nModule=modToutLive\r\n", 1)
projet = projet.rstrip("\r\n") + "\r\n%s=0, 0, 0, 0, C\r\nmodPilotageLive=0, 0, 0, 0, C\r\nmodToutLive=0, 0, 0, 0, C\r\n" % FEUILLE
assert projet.count("Module=") == 5 and projet.count("Document=") == 13
wm = ole.openstream("PROJECTwm").read(); assert wm.endswith(b"\x00\x00")
wm = wm[:-2] + b"".join(n.encode("cp1252") + b"\x00" + n.encode("utf-16-le") + b"\x00\x00" for n, _ in nouveaux) + b"\x00\x00"

vba = {"dir": ovba.compress(ovba.ecrire_dir(recs)), "_VBA_PROJECT": b"\xCC\x61\xFF\xFF\x00\x00\x00"}   # version FFFF : Excel recompile tout
for n, s in sources.items(): vba[n] = ovba.compress(s)
clsid = parts["xl/vbaProject.bin"][512 * (1 + struct.unpack_from("<I", parts["xl/vbaProject.bin"], 48)[0]) + 80:][:16]
parts["xl/vbaProject.bin"] = ovba.ecrire_cfb({"VBA": vba, "PROJECT": projet.encode("cp1252"), "PROJECTwm": wm}, clsid)

# ───────── 2. onglet PILOTAGE recopié de l'ancien classeur Pilotage ─────────
ws = load_workbook(src_pil, data_only=True)["PILOTAGE"]
lignes = []
for row in ws.iter_rows(min_row=1, max_row=ws.max_row, max_col=3):
    vals = []
    for c in row:
        v = c.value
        if v is None: v = ""
        elif isinstance(v, float) and v == int(v): v = str(int(v))
        else: v = str(v)
        vals.append(v)
    if vals[0] in ("ETAT", "DERNIER_PASSAGE", "DERNIER_MESSAGE"): vals[1] = ""
    lignes.append((row[0].row, vals))
cells = lambda r, vals: "".join('<c r="%s%d" t="inlineStr"><is><t xml:space="preserve">%s</t></is></c>' % ("ABC"[i], r, escape(v)) for i, v in enumerate(vals) if v != "")
feuille = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
           'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetPr codeName="%s"/><dimension ref="A1:C%d"/>'
           '<sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15"/>'
           '<cols><col min="1" max="1" width="26" customWidth="1"/><col min="2" max="2" width="60" customWidth="1"/><col min="3" max="3" width="96" customWidth="1"/></cols>'
           '<sheetData>%s</sheetData><pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/></worksheet>') % (
    FEUILLE, lignes[-1][0], "".join('<row r="%d">%s</row>' % (r, cells(r, v)) for r, v in lignes if any(v)))
nsheet = 1 + max(int(m) for m in re.findall(r"xl/worksheets/sheet(\d+)\.xml", " ".join(parts)))
parts["xl/worksheets/sheet%d.xml" % nsheet] = feuille.encode("utf-8")
ct = parts["[Content_Types].xml"].decode("utf-8")
ct = ct.replace("</Types>", '<Override PartName="/xl/worksheets/sheet%d.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>' % nsheet)
parts["[Content_Types].xml"] = ct.encode("utf-8")
rels = parts["xl/_rels/workbook.xml.rels"].decode("utf-8")
rid = "rId%d" % (1 + max(int(m) for m in re.findall(r'Id="rId(\d+)"', rels)))
rels = rels.replace("</Relationships>", '<Relationship Id="%s" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet%d.xml"/></Relationships>' % (rid, nsheet))
parts["xl/_rels/workbook.xml.rels"] = rels.encode("utf-8")
wbx = parts["xl/workbook.xml"].decode("utf-8")
sid = 1 + max(int(m) for m in re.findall(r'sheetId="(\d+)"', wbx))
assert wbx.count("</sheets>") == 1 and 'name="PILOTAGE"' not in wbx
wbx = wbx.replace("</sheets>", '<sheet name="PILOTAGE" sheetId="%d" r:id="%s"/></sheets>' % (sid, rid))
wbx = re.sub(r"<mc:AlternateContent.*?</mc:AlternateContent>", "", wbx, count=1, flags=re.S)      # ancien chemin d'enregistrement
parts["xl/workbook.xml"] = wbx.encode("utf-8")
parts.pop("xl/calcChain.xml", None)                # Excel le reconstruit
if "xl/calcChain.xml" not in parts:
    parts["[Content_Types].xml"] = re.sub(rb'<Override PartName="/xl/calcChain.xml"[^>]*/>', b"", parts["[Content_Types].xml"])
    parts["xl/_rels/workbook.xml.rels"] = re.sub(rb'<Relationship [^>]*calcChain[^>]*/>', b"", parts["xl/_rels/workbook.xml.rels"])

zout = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED)
ordre = ["[Content_Types].xml"] + [n for n in parts if n != "[Content_Types].xml"]
for n in ordre: zout.writestr(n, parts[n])
zout.close()
print("ecrit", dst, "| modules :", ", ".join(sources))
