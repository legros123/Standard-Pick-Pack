"""Remet en ordre PP_LIVE.xlsm (le fichier de l'utilisateur, gardé tel quel par ailleurs) :
- 4 macros visibles seulement (module PP_LIVE) ; celles des moteurs M01, M02, M03 et modPilotageLive
  sont masquées (paramètre facultatif) ; modToutLive retiré ;
- onglet ACCUEIL en tête : 4 boutons, état en direct, la marche à suivre ;
- le Contrôle des rejets n'est plus rouvert à chaque passage s'il n'a pas changé.
Le projet VBA est réécrit en code source seul (même méthode que le 13/11) : Excel le recompile à l'ouverture.

Usage : python3 fabriquer.py PP_LIVE_origine.xlsm dossier_vba SORTIE.xlsm dossier_secours
"""
import sys, os, re, struct, io, zipfile, html
import olefile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ovba

src_xlsm, dvba, dst, dsec = sys.argv[1:5]
zin = zipfile.ZipFile(src_xlsm)
parts = {n: zin.read(n) for n in zin.namelist()}
ordre_zip = zin.namelist()

# ═════════════════════════════ 1. le code ═════════════════════════════
ole = olefile.OleFileIO(io.BytesIO(parts["xl/vbaProject.bin"]))
recs = ovba.lire_dir(ovba.decompress(ole.openstream("VBA/dir").read()))
noms = [r[1].decode("cp1252") for r in recs if r[0] == 0x19]
offs = [struct.unpack("<I", r[1])[0] for r in recs if r[0] == 0x31]
code = {n: ovba.decompress(ole.openstream("VBA/" + n).read()[o:]).decode("cp1252").replace("\r\n", "\n") for n, o in zip(noms, offs)}
assert {"M01_LOGYS", "M02_SUIVIOP", "M03_EXPORT", "modPilotageLive", "modToutLive", "ThisWorkbook", "Feuil12"} <= set(code), noms
assert "Feuil13" not in code and "PP_LIVE" not in code


def remplacer(nom, a, b, n=1):
    assert code[nom].count(a) == n, (nom, code[nom].count(a), a[:100])
    code[nom] = code[nom].replace(a, b)


def masquer(nom, subs):
    for s in subs:
        remplacer(nom, "Public Sub %s()" % s, "Public Sub %s(Optional ByVal masque As Variant)" % s)


BANNIERE = ("'  >>> Module moteur : ne pas lancer ses procedures a la main. Les commandes sont dans le module\n"
            "'  >>> PP_LIVE (boutons de l'onglet ACCUEIL). Ses procedures publiques ont un parametre facultatif\n"
            "'  >>> \"masque\" : elles n'apparaissent pas dans Alt+F8 mais restent utilisables par la minuterie.\n")


def banniere(nom):
    l = code[nom].split("\n", 1)
    assert l[0].startswith("Attribute VB_Name")
    code[nom] = l[0] + "\n" + BANNIERE + l[1]


# ── M01_LOGYS : tournées et rejets du jour ──
masquer("M01_LOGYS", ["ACTUALISER", "TEST_ACTUALISER", "TEST_CONNEXION", "DEMARRER_AUTO", "ARRETER_AUTO", "TICK"])
banniere("M01_LOGYS")

# ── M02_SUIVIOP : équipe ; la nouvelle journée passe par PP_LIVE ──
masquer("M02_SUIVIOP", ["CHARGER_EQUIPE", "CHARGER_CADENCES"])
remplacer("M02_SUIVIOP", '''Public Sub NOUVELLE_JOURNEE()
    Dim msg As String
    msg = ChargerEquipe(True)
    If Left$(msg, 6) = "ERREUR" Then
        MsgBox msg, vbExclamation, "PP LIVE - nouvelle journee"
        Exit Sub
    End If
    ViderSaisie
    MsgBox "Nouvelle journee prete." & vbCrLf & vbCrLf & msg & vbCrLf & vbCrLf & _
           "Tout le monde est present : passe les absents a NON et saisis la 1re vague.", _
           vbInformation, "PP LIVE - nouvelle journee"
End Sub''', '''' Nouvelle journee (commande NOUVELLE_JOURNEE du module PP_LIVE) : equipe rechargee depuis le suivi op,
' tout le monde present, saisie du jour videe. Renvoie le compte rendu (commence par ERREUR en cas d'echec).
Public Function Equipe_PreparerJournee() As String
    Dim msg As String
    msg = ChargerEquipe(True)
    If Left$(msg, 6) <> "ERREUR" Then ViderSaisie
    Equipe_PreparerJournee = msg
End Function''')
banniere("M02_SUIVIOP")

# ── M03_EXPORT : data.js ──
masquer("M03_EXPORT", ["DEMARRER_LIVE", "ARRETER_LIVE", "TICK_LIVE", "TEST_EXPORT", "RECHARGER_HISTO", "EXPORTER_DATA"])
remplacer("M03_EXPORT", '''Private Sub AppelerM01()''', '''' --- pour le module PP_LIVE -------------------------------------------------
Public Function Export_EnMarche() As Boolean
    Export_EnMarche = mLive
End Function

Public Function Export_Resume() As String
    Export_Resume = mResume
End Function

' Alertes du dernier passage, une par ligne (vide = aucune)
Public Function Export_Alertes() As String
    Dim i As Long, s As String
    If mNotes Is Nothing Then Exit Function
    For i = 1 To mNotes.Count
        If Len(s) > 0 Then s = s & vbCrLf
        s = s & mNotes(i)
    Next i
    Export_Alertes = s
End Function

' Un passage tout de suite (LOGYS puis data.js) ; la boucle, si elle tourne, repart de ce passage
Public Sub Export_Maintenant(Optional ByVal masque As Variant)
    If mLive Then
        DEMARRER_LIVE
    Else
        AppelerM01
        EXPORTER_DATA
    End If
End Sub

Private Sub AppelerM01()''')
banniere("M03_EXPORT")

# ── modPilotageLive : pilotage_data.js ──
P = "modPilotageLive"
remplacer(P, "Public Sub Pilotage_Installer()", "Private Sub Pilotage_Installer()")
remplacer(P, "Public Sub Pilotage_Tester()", "Private Sub Pilotage_Tester()")
masquer(P, ["Pilotage_Demarrer", "Pilotage_Arreter", "Pilotage_Actualiser", "Pilotage_OuvrirPage"])
remplacer(P, """Private mCacheSuiviA As Date
""", """Private mCacheSuiviA As Date
Private mCacheDec As String                    ' Controle des rejets : relu seulement s'il a ete enregistre depuis
Private mCacheDecFichier As Date
Private mCacheDecJour As Date
""")
remplacer(P, """'==============================================================================
'  BOUCLE
'==============================================================================""", """' --- pour le module PP_LIVE -------------------------------------------------
' Un passage tout de suite : tout est relu, et la boucle, si elle tourne, repart de ce passage.
Public Sub Pilotage_ActualiserMaintenant(Optional ByVal masque As Variant)
    Annuler
    mCacheLentA = 0
    mCacheSuiviA = 0
    mCacheDecJour = 0
    Pilotage_Actualiser
End Sub

' Nouvelle journee : reglages relus, caches vides, connexion refaite au prochain passage.
Public Sub Pilotage_Reinitialiser(Optional ByVal masque As Variant)
    mCacheLentA = 0
    mCacheSuiviA = 0
    mCacheDecJour = 0
    mCacheDec = ""
    Set mCfg = Nothing
    FermerConnexion
End Sub

Public Function Pilotage_EnMarche() As Boolean
    Pilotage_EnMarche = mActif
End Function

' Incidents du dernier passage (vide = aucun)
Public Function Pilotage_Journal() As String
    Pilotage_Journal = mJournal
End Function

Public Function Pilotage_NbRequetes() As Long
    Pilotage_NbRequetes = mNbReq
End Function

Public Function Pilotage_Fichier() As String
    Set mCfg = Nothing
    Pilotage_Fichier = CheminFichier()
End Function

Public Function Pilotage_Reglage(ByVal nom As String) As String
    Pilotage_Reglage = Cfg(nom, "")
End Function

'==============================================================================
'  BOUCLE
'==============================================================================""")
remplacer(P, """    chemin = Cfg("FICHIER_REJETS", "")
    If Len(chemin) > 0 Then
        SectionDecelees = DeceleesClasseur(chemin)""", """    chemin = Cfg("FICHIER_REJETS", "")
    If Len(chemin) > 0 Then
        SectionDecelees = DeceleesEnCache(chemin)""")
remplacer(P, """Private Function DeceleesClasseur(ByVal chemin As String) As String""", """' Ouvrir ce classeur occupe Excel plusieurs secondes (et peut faire ramer l'ecran du Flip branche sur ce PC) :
' on ne le relit que s'il a ete enregistre depuis la derniere lecture, ou au changement de jour.
' S'il est deja ouvert dans cet Excel, il est lu directement, sans l'ouvrir.
Private Function DeceleesEnCache(ByVal chemin As String) As String
    Dim dt As Date, wb As Workbook, ouvert As Boolean
    On Error Resume Next
    dt = FileDateTime(chemin)
    On Error GoTo 0
    For Each wb In Application.Workbooks
        If StrComp(wb.FullName, chemin, vbTextCompare) = 0 Then
            ouvert = True
            Exit For
        End If
    Next wb
    If Not ouvert And Len(mCacheDec) > 0 And mCacheDecJour = Date And dt = mCacheDecFichier Then
        DeceleesEnCache = mCacheDec
        Exit Function
    End If
    DeceleesEnCache = DeceleesClasseur(chemin)
    If Len(DeceleesEnCache) > 0 Then
        mCacheDec = DeceleesEnCache
        mCacheDecFichier = dt
        mCacheDecJour = Date
    End If
End Function

Private Function DeceleesClasseur(ByVal chemin As String) As String""")
remplacer(P, '''"Remplis les cases jaunes (au minimum DSN et DOSSIER_SORTIE), puis lance Pilotage_Tester."''',
          '''"Remplis les cases jaunes (au minimum DSN et DOSSIER_SORTIE), puis clique TEST sur l'onglet ACCUEIL."''')
banniere(P)

# ── les 4 commandes, ThisWorkbook, l'onglet ACCUEIL ──
del code["modToutLive"]
code["PP_LIVE"] = open(os.path.join(dvba, "PP_LIVE.txt"), encoding="utf-8").read()
entete_tw = code["ThisWorkbook"].split("\nOption Explicit", 1)[0]
assert entete_tw.count("Attribute VB_") == 8
code["ThisWorkbook"] = entete_tw + "\n" + open(os.path.join(dvba, "ThisWorkbook.txt"), encoding="utf-8").read()
code["Feuil13"] = code["Feuil12"].replace('"Feuil12"', '"Feuil13"')
assert code["Feuil13"].count('"Feuil13"') == 1

# contrôle : seules les 4 commandes apparaissent dans Alt+F8 (Sub publique sans paramètre d'un module standard)
standards = ["M02_SUIVIOP", "M01_LOGYS", "M03_EXPORT", "modPilotageLive", "PP_LIVE"]
visibles = []
for n in standards:
    for m in re.finditer(r"^(?:Public\s+)?Sub\s+(\w+)\s*\(\s*\)", code[n], re.M):
        visibles.append(m.group(1))
assert sorted(visibles) == ["ACTUALISER_DONNEES", "DEMARRER_JOURNEE", "NOUVELLE_JOURNEE", "TEST"], visibles
for n in code:
    code[n].encode("cp1252")                     # tout doit passer en Windows-1252

# ── projet VBA : modToutLive retiré, Feuil13 et PP_LIVE ajoutés, code source seul ──
fin = recs.pop(); assert fin[0] == 0x10 and fin[1] == b""
i0 = next(i for i, r in enumerate(recs) if r[0] == 0x19 and r[1] == b"modToutLive")
i1 = next(i for i in range(i0, len(recs)) if recs[i][0] == 0x2B)
del recs[i0:i1 + 1]
recs += ovba.module_recs("Feuil13", True) + ovba.module_recs("PP_LIVE", False)
for r in recs:
    if r[0] == 0x31: r[1] = struct.pack("<I", 0)
    if r[0] == 0x0F: r[1] = struct.pack("<H", sum(1 for x in recs if x[0] == 0x19))
recs.append(fin)
modules = [r[1].decode("cp1252") for r in recs if r[0] == 0x19]
assert sorted(modules) == sorted(code), (modules, sorted(code))

crlf = lambda t: t.replace("\r\n", "\n").replace("\n", "\r\n")
projet = ole.openstream("PROJECT").read().decode("cp1252")
for a, b in [("Module=modToutLive\r\n", ""),
             ("Document=Feuil12/&H00000000\r\n", "Document=Feuil12/&H00000000\r\nDocument=Feuil13/&H00000000\r\n"),
             ("Module=modPilotageLive\r\n", "Module=modPilotageLive\r\nModule=PP_LIVE\r\n")]:
    assert projet.count(a) == 1, a
    projet = projet.replace(a, b)
projet = re.sub(r"modToutLive=[^\r\n]*\r\n", "", projet)
projet = projet.rstrip("\r\n") + "\r\nFeuil13=0, 0, 0, 0, C\r\nPP_LIVE=0, 0, 0, 0, C\r\n"
assert projet.count("Module=") == 5 and projet.count("Document=") == 14 and "modToutLive" not in projet
wm = b"".join(n.encode("cp1252") + b"\x00" + n.encode("utf-16-le") + b"\x00\x00" for n in modules) + b"\x00\x00"
vba = {"dir": ovba.compress(ovba.ecrire_dir(recs)), "_VBA_PROJECT": b"\xCC\x61\xFF\xFF\x00\x00\x00"}
for n in modules: vba[n] = ovba.compress(crlf(code[n]).encode("cp1252"))
binv = parts["xl/vbaProject.bin"]
clsid = binv[512 * (1 + struct.unpack_from("<I", binv, 48)[0]) + 80:][:16]
parts["xl/vbaProject.bin"] = ovba.ecrire_cfb({"VBA": vba, "PROJECT": projet.encode("cp1252"), "PROJECTwm": wm}, clsid)

# modules de secours (import à la main si besoin) : Windows-1252, fins de ligne CRLF
os.makedirs(dsec, exist_ok=True)
for n in standards:
    open(os.path.join(dsec, n + ".bas"), "w", encoding="cp1252", newline="\r\n").write(code[n].replace("\r\n", "\n"))
open(os.path.join(dsec, "ThisWorkbook - a coller.txt"), "w", encoding="cp1252", newline="\r\n").write(
    open(os.path.join(dvba, "ThisWorkbook.txt"), encoding="utf-8").read())

# ═════════════════════════════ 2. l'onglet ACCUEIL ═════════════════════════════
sty = parts["xl/styles.xml"].decode("utf-8")


def ajouter(tag, xml):
    global sty
    m = re.search(r'<%s count="(\d+)"' % tag, sty)
    n = int(m.group(1))
    sty = sty.replace(m.group(0), '<%s count="%d"' % (tag, n + 1), 1)
    p = sty.index("</%s>" % tag)
    sty = sty[:p] + xml + sty[p:]
    return n


def police(sz, col, b=False, i=False, u=False, nom="Arial"):
    return ajouter("fonts", "<font>%s%s%s<sz val=\"%s\"/><color rgb=\"FF%s\"/><name val=\"%s\"/><family val=\"2\"/></font>" % (
        "<b/>" if b else "", "<i/>" if i else "", '<u/>' if u else "", sz, col, nom))


def fond(col):
    return ajouter("fills", '<fill><patternFill patternType="solid"><fgColor rgb="FF%s"/><bgColor indexed="64"/></patternFill></fill>' % col)


def bordure(bas=None):
    return ajouter("borders", "<border><left/><right/><top/>%s<diagonal/></border>" % (
        '<bottom style="thin"><color rgb="FF%s"/></bottom>' % bas if bas else "<bottom/>"))


def xf(f, fi, bo=0, h=None, v="center", wrap=False, ind=0):
    al = '<alignment vertical="%s"%s%s%s/>' % (v, ' horizontal="%s"' % h if h else "", ' wrapText="1"' if wrap else "", ' indent="%d"' % ind if ind else "")
    return ajouter("cellXfs", '<xf numFmtId="0" fontId="%d" fillId="%d" borderId="%d" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">%s</xf>' % (f, fi, bo, al))


FOND, PANNEAU, TEXTE, CLAIR, GRIS, CYAN = "0D1117", "161B22", "C9D1D9", "F0F6FC", "8B949E", "58D5FF"
fd, fp = fond(FOND), fond(PANNEAU)
b0, bsec = bordure(), bordure("30363D")
S = {
    "fond": xf(police(10, TEXTE), fd, b0),
    "titre": xf(police(24, CLAIR, b=True), fd, b0, v="center"),
    "sous": xf(police(10, GRIS, i=True), fd, b0, v="top"),
    "legende": xf(police(9, GRIS, i=True), fd, b0, h="center", v="top"),
    "section": xf(police(10, CYAN, b=True), fd, bsec, v="bottom"),
    "etiq": xf(police(10, TEXTE), fd, b0, ind=1),
    "valeur": xf(police(10, CLAIR, b=True), fp, b0, wrap=True, ind=1),
    "num": xf(police(11, CYAN, b=True), fd, b0, h="right"),
    "texte": xf(police(10, TEXTE), fd, b0, wrap=True, ind=1),
    "lien": xf(police(10, CYAN, u=True), fd, b0, h="left"),
    "note": xf(police(9, GRIS), fd, b0, wrap=True, ind=1),
}
dx = re.search(r'<dxfs count="(\d+)"', sty)
DXF_ROUGE = ajouter("dxfs", '<dxf><font><b/><color rgb="FFFF7B72"/></font></dxf>') if dx else None
parts["xl/styles.xml"] = sty.encode("utf-8")

LARG = {1: 2.7, 10: 2.7}
for c in range(2, 10): LARG[c] = 17.5
HAUT = {1: 8, 2: 34, 3: 18, 4: 10, 5: 10, 6: 24, 7: 24, 8: 24, 9: 18, 10: 12, 11: 22, 12: 21, 13: 21, 14: 21, 15: 30, 16: 21,
        17: 12, 18: 22, 19: 21, 20: 21, 21: 21, 22: 21, 23: 21, 24: 12, 25: 30}
NCOL, NLIG = 11, 30
col = lambda c: "ABCDEFGHIJK"[c - 1]
cell = {}                                        # (ligne, colonne) -> (style, type, contenu)
for r in range(1, NLIG + 1):
    for c in range(1, NCOL + 1): cell[(r, c)] = (S["fond"], None, None)


def T(ref, txt, st):
    c, r = ord(ref[0]) - 64, int(ref[1:]); cell[(r, c)] = (S[st], "s", txt)


def F(ref, formule, st):
    c, r = ord(ref[0]) - 64, int(ref[1:]); cell[(r, c)] = (S[st], "f", formule)


def zone(r, c1, c2, st):
    for c in range(c1, c2 + 1): cell[(r, c)] = (S[st],) + cell[(r, c)][1:] if cell[(r, c)][1] else (S[st], None, None)


fusions = []
T("B2", "PICK & PACK LIVE", "titre"); fusions.append("B2:I2")
T("B3", "Le classeur qui alimente l'écran du Flip  ·  quatre commandes, rien d'autre", "sous"); fusions.append("B3:I3")
for c1, txt in [(2, "Ctrl+Maj+N  ·  le matin"), (4, "Ctrl+Maj+D  ·  se fait seul à l'ouverture"), (6, "Ctrl+Maj+A  ·  un chiffre tout de suite"), (8, "Ctrl+Maj+T  ·  en cas de doute")]:
    T(col(c1) + "9", txt, "legende"); fusions.append("%s9:%s9" % (col(c1), col(c1 + 1)))
T("B11", "ÉTAT EN DIRECT", "section"); zone(11, 2, 9, "section")
etat = [
    (12, "Écran du Flip (data.js)", 'IF(EXPORT!B3="","pas encore d\'export",TEXT(EXPORT!B3,"hh:mm:ss")&"   ·   "&EXPORT!B7)'),
    (13, "Logys (tournées, rejets)", 'IF(C_MSG="","pas encore lu",TEXT(C_MAJ,"hh:mm:ss")&"   ·   "&C_MSG)'),
    (14, "Pilotage (pilotage_data.js)", 'IFERROR(IF(INDEX(PILOTAGE!$B$1:$B$80,MATCH("DERNIER_PASSAGE",PILOTAGE!$A$1:$A$80,0))="","pas encore lancé",INDEX(PILOTAGE!$B$1:$B$80,MATCH("ETAT",PILOTAGE!$A$1:$A$80,0))&"   ·   dernier passage "&INDEX(PILOTAGE!$B$1:$B$80,MATCH("DERNIER_PASSAGE",PILOTAGE!$A$1:$A$80,0))),"")'),
    (15, "Compte rendu du pilotage", 'IFERROR(INDEX(PILOTAGE!$B$1:$B$80,MATCH("DERNIER_MESSAGE",PILOTAGE!$A$1:$A$80,0))&"","")'),
]
for r, lib, f in etat:
    T("B%d" % r, lib, "etiq"); fusions.append("B%d:C%d" % (r, r))
    F("D%d" % r, f, "valeur"); zone(r, 4, 9, "valeur"); fusions.append("D%d:I%d" % (r, r))
T("B16", "Dernière commande", "etiq"); fusions.append("B16:C16")
T("D16", "Classeur remis en ordre : clique « Démarrer la journée » ou attends le démarrage automatique", "valeur"); zone(16, 4, 9, "valeur"); fusions.append("D16:I16")
T("B18", "CHAQUE JOUR, C'EST TOUT", "section"); zone(18, 2, 9, "section")
etapes = [
    (19, "1", "Le matin : NOUVELLE JOURNÉE. L'équipe est rechargée depuis le Suivi Op, tout le monde passe présent, la saisie du jour est vidée."),
    (20, "2", "Passe les absents à NON dans EQUIPE, puis saisis la 1re vague et les attendus de 15h45 et 17h45 dans SAISIE."),
    (21, "3", "DÉMARRER LA JOURNÉE se fait tout seul 15 secondes après l'ouverture de ce classeur. Ensuite, l'écran se met à jour chaque minute."),
    (22, "", "Un chiffre tout de suite : ACTUALISER. Un doute, un écran figé, un voyant orange : TEST, il dit quoi corriger."),
    (23, "", "Laisse ce classeur ouvert toute la journée. En le fermant, les mises à jour s'arrêtent."),
]
for r, n, txt in etapes:
    if n: T("B%d" % r, n, "num")
    T("C%d" % r, txt, "texte"); fusions.append("C%d:%s%d" % (r, "G" if r == 20 else "I", r))
liens = [("H20", "→ onglet EQUIPE", "EQUIPE"), ("I20", "→ onglet SAISIE", "SAISIE")]
for ref, txt, feuille in liens: T(ref, txt, "lien")
T("C25", "Réglages, une seule fois : onglets PARAMETRES (Logys, chemins, horaires) et PILOTAGE (pilotage.html). "
         "Si quelque chose ne va pas : TEST, puis une photo du compte rendu.", "note"); fusions.append("C25:I25")

esc = lambda s: html.escape(s, quote=False)
lignes = []
for r in range(1, NLIG + 1):
    cs = []
    for c in range(1, NCOL + 1):
        st, t, v = cell[(r, c)]
        ref = "%s%d" % (col(c), r)
        if t == "s":
            cs.append('<c r="%s" s="%d" t="inlineStr"><is><t xml:space="preserve">%s</t></is></c>' % (ref, st, esc(v)))
        elif t == "f":
            cs.append('<c r="%s" s="%d" t="str"><f>%s</f></c>' % (ref, st, esc(v)))
        else:
            cs.append('<c r="%s" s="%d"/>' % (ref, st))
    ht = HAUT.get(r)
    lignes.append('<row r="%d"%s>%s</row>' % (r, ' ht="%s" customHeight="1"' % ht if ht else "", "".join(cs)))
cols = "".join('<col min="%d" max="%d" width="%s" customWidth="1" style="%d"/>' % (c, c, LARG[c], S["fond"]) for c in range(1, NCOL))
cols += '<col min="%d" max="16384" width="9" style="%d"/>' % (NCOL, S["fond"])
cf = ""
if DXF_ROUGE is not None:
    cf = ('<conditionalFormatting sqref="D13:I13"><cfRule type="expression" dxfId="%d" priority="1"><formula>LEFT(C_MSG,6)="ERREUR"</formula></cfRule></conditionalFormatting>'
          '<conditionalFormatting sqref="D15:I15"><cfRule type="expression" dxfId="%d" priority="2"><formula>AND($D$15&lt;&gt;"",$D$15&lt;&gt;"OK")</formula></cfRule></conditionalFormatting>') % (DXF_ROUGE, DXF_ROUGE)
hl = "<hyperlinks>%s</hyperlinks>" % "".join('<hyperlink ref="%s" location="\'%s\'!A1" display="%s"/>' % (ref, f, esc(txt)) for ref, txt, f in liens)
feuille = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
           '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
           '<sheetPr codeName="Feuil13"><tabColor rgb="FF2EA043"/><pageSetUpPr fitToPage="1"/></sheetPr><dimension ref="A1:K%d"/>'
           '<sheetViews><sheetView showGridLines="0" showRowColHeaders="0" tabSelected="1" zoomScaleNormal="100" workbookViewId="0"><selection activeCell="A1" sqref="A1"/></sheetView></sheetViews>'
           '<sheetFormatPr defaultRowHeight="15"/><cols>%s</cols><sheetData>%s</sheetData>'
           '<mergeCells count="%d">%s</mergeCells>%s%s'
           '<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/><pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/><drawing r:id="rId1"/></worksheet>') % (
    NLIG, cols, "".join(lignes), len(fusions), "".join('<mergeCell ref="%s"/>' % f for f in fusions), cf, hl)

# boutons : formes arrondies, chacune lance sa macro
px = lambda w: int((256 * w + 18) / 256 * 7)
EMU_PX, EMU_PT, M = 9525, 12700, 5 * 9525
BOUTONS = [(2, "NOUVELLE JOURNÉE", "NOUVELLE_JOURNEE", "B7791E"), (4, "DÉMARRER LA JOURNÉE", "DEMARRER_JOURNEE", "238636"),
           (6, "ACTUALISER LES DONNÉES", "ACTUALISER_DONNEES", "1F6FEB"), (8, "TEST", "TEST", "6E7681")]
dessins = []
for k, (c1, txt, macro, coul) in enumerate(BOUTONS):
    x = sum(px(LARG[c]) for c in range(1, c1)) * EMU_PX + M
    y = sum(HAUT[r] for r in range(1, 6)) * EMU_PT + M
    w = (px(LARG[c1]) + px(LARG[c1 + 1])) * EMU_PX - 2 * M
    h = (HAUT[6] + HAUT[7] + HAUT[8]) * EMU_PT - 2 * M
    dessins.append(
        '<xdr:twoCellAnchor editAs="absolute">'
        '<xdr:from><xdr:col>%d</xdr:col><xdr:colOff>%d</xdr:colOff><xdr:row>5</xdr:row><xdr:rowOff>%d</xdr:rowOff></xdr:from>'
        '<xdr:to><xdr:col>%d</xdr:col><xdr:colOff>%d</xdr:colOff><xdr:row>7</xdr:row><xdr:rowOff>%d</xdr:rowOff></xdr:to>' % (
            c1 - 1, M, M, c1, px(LARG[c1 + 1]) * EMU_PX - M, HAUT[8] * EMU_PT - M) +
        '<xdr:sp macro="[0]!%s" textlink="">' % macro +
        '<xdr:nvSpPr><xdr:cNvPr id="%d" name="Bouton %s" descr="%s"/><xdr:cNvSpPr/></xdr:nvSpPr>' % (k + 2, macro, esc(txt)) +
        '<xdr:spPr><a:xfrm><a:off x="%d" y="%d"/><a:ext cx="%d" cy="%d"/></a:xfrm>' % (x, y, w, h) +
        '<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 18000"/></a:avLst></a:prstGeom>'
        '<a:solidFill><a:srgbClr val="%s"/></a:solidFill><a:ln w="12700"><a:solidFill><a:srgbClr val="F0F6FC"><a:alpha val="25000"/></a:srgbClr></a:solidFill></a:ln></xdr:spPr>' % coul +
        '<xdr:txBody><a:bodyPr vertOverflow="clip" horzOverflow="clip" wrap="square" lIns="36000" tIns="0" rIns="36000" bIns="0" rtlCol="0" anchor="ctr"/>'
        '<a:lstStyle/><a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="fr-FR" sz="1300" b="1"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>'
        '<a:latin typeface="Arial"/><a:cs typeface="Arial"/></a:rPr><a:t>%s</a:t></a:r></a:p></xdr:txBody></xdr:sp><xdr:clientData/></xdr:twoCellAnchor>' % esc(txt))
dessin = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" '
          'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">%s</xdr:wsDr>') % "".join(dessins)

# ── assemblage dans le paquet ──
num_feuille = 1 + max(int(m) for m in re.findall(r"xl/worksheets/sheet(\d+)\.xml", " ".join(parts)))
num_dessin = 1 + max([0] + [int(m) for m in re.findall(r"xl/drawings/drawing(\d+)\.xml", " ".join(parts))])
fx = "xl/worksheets/sheet%d.xml" % num_feuille
parts[fx] = feuille.encode("utf-8")
parts["xl/drawings/drawing%d.xml" % num_dessin] = dessin.encode("utf-8")
parts["xl/worksheets/_rels/sheet%d.xml.rels" % num_feuille] = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing%d.xml"/></Relationships>' % num_dessin).encode("utf-8")
ct = parts["[Content_Types].xml"].decode("utf-8")
ct = ct.replace("</Types>", '<Override PartName="/%s" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
                '<Override PartName="/xl/drawings/drawing%d.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>' % (fx, num_dessin))
assert 'application/vnd.ms-office.vbaProject' in ct or 'Extension="bin"' in ct
if 'PartName="/xl/vbaProject.bin"' not in ct:
    ct = ct.replace("</Types>", '<Override PartName="/xl/vbaProject.bin" ContentType="application/vnd.ms-office.vbaProject"/></Types>')
parts["[Content_Types].xml"] = ct.encode("utf-8")
rels = parts["xl/_rels/workbook.xml.rels"].decode("utf-8")
rid = "rId%d" % (1 + max(int(m) for m in re.findall(r'Id="rId(\d+)"', rels)))
rels = rels.replace("</Relationships>", '<Relationship Id="%s" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet%d.xml"/></Relationships>' % (rid, num_feuille))
parts["xl/_rels/workbook.xml.rels"] = rels.encode("utf-8")

wbx = parts["xl/workbook.xml"].decode("utf-8")
sid = 1 + max(int(m) for m in re.findall(r'sheetId="(\d+)"', wbx))
assert 'name="ACCUEIL"' not in wbx
wbx = wbx.replace("<sheets>", '<sheets><sheet name="ACCUEIL" sheetId="%d" r:id="%s"/>' % (sid, rid), 1)
wbx = re.sub(r'localSheetId="(\d+)"', lambda m: 'localSheetId="%d"' % (int(m.group(1)) + 1), wbx)   # ACCUEIL passe en tête
wbx = re.sub(r'activeTab="\d+"', 'activeTab="0"', wbx)
wbx = re.sub(r' firstSheet="\d+"', "", wbx)
assert '<definedName name="J_INFO"' not in wbx
nom = '<definedName name="J_INFO">ACCUEIL!$D$16</definedName>'
noms_def = re.findall(r'<definedName name="([^"]+)"', wbx)
suivant = next((n for n in noms_def if not n.startswith("_") and n.upper() > "J_INFO"), None)
wbx = wbx.replace('<definedName name="%s"' % suivant, nom + '<definedName name="%s"' % suivant, 1) if suivant else wbx.replace("</definedNames>", nom + "</definedNames>")
wbx = re.sub(r"<calcPr([^>]*?)/>", lambda m: "<calcPr%s fullCalcOnLoad=\"1\"/>" % m.group(1).replace(' fullCalcOnLoad="1"', ""), wbx, count=1)
parts["xl/workbook.xml"] = wbx.encode("utf-8")
for n in list(parts):                            # un seul onglet sélectionné : ACCUEIL
    if re.match(r"xl/worksheets/sheet\d+\.xml$", n) and n != fx:
        s = parts[n].decode("utf-8")
        s2 = re.sub(r' tabSelected="1"', "", s)
        if s2 != s: parts[n] = s2.encode("utf-8")
parts.pop("xl/calcChain.xml", None)

zout = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED)
for n in ["[Content_Types].xml"] + [n for n in ordre_zip if n in parts and n != "[Content_Types].xml"] + [n for n in parts if n not in ordre_zip]:
    zout.writestr(n, parts[n])
zout.close()
print("écrit", dst, "·", os.path.getsize(dst), "octets · modules :", ", ".join(modules))
print("macros visibles (Alt+F8) :", ", ".join(sorted(visibles)))
