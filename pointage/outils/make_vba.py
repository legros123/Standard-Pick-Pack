import sys, re
sys.path.insert(0, '.')
import tpl
from buttons import BUTTONS

def vba_str_lines(text, maxlen=600):
    out = []
    for line in text.split('\n'):
        while line:
            chunk, line = line[:maxlen], line[maxlen:]
            out.append(chunk)
    return out

def build_source():
    core = open('vba_core.bas', encoding='utf-8').read()
    old = open('v8_extrait.bas', encoding='utf-8').read()
    old = old.replace("    On Error Resume Next\n    ANIMER\n    On Error GoTo 0\n",
                      "    ThisWorkbook.Worksheets(WS_PDJ).Activate\n    Application.StatusBar = \"Point du jour : LOGYS actualisé (\" & Txt(Rg(\"LL_STATUT\").Value) & \")\"\n")
    assert 'ANIMER' not in old
    t = tpl.template()
    lines = vba_str_lines(t)
    funcs, names = [], []
    per = 45
    for i in range(0, len(lines), per):
        n = 'MailTpl%d' % (len(names) + 1)
        names.append(n)
        body = ['Private Function %s() As String' % n, '    Dim s As String']
        for ln in lines[i:i + per]:
            body.append('    s = s & "%s" & vbLf' % ln.replace('"', '""'))
        body += ['    %s = s' % n, 'End Function', '']
        funcs.append('\n'.join(body))
    tplf = ("'==============================================================================\n"
            "'  Modèle HTML du mail (généré, ne pas modifier à la main)\n"
            "'==============================================================================\n"
            "Private Function MailTemplate() As String\n    MailTemplate = " + ' & '.join(n + '()' for n in names) + "\nEnd Function\n\n"
            + '\n'.join(funcs))
    vr = tpl.VENT_ROW
    assert all(ord(ch) < 128 for ch in vr)
    vent = ["Private Function VentilModele() As String", '    Dim s As String']
    for ln in vba_str_lines(vr, 500):
        vent.append('    s = s & "%s"' % ln.replace('"', '""'))
    vent += ['    VentilModele = s', 'End Function', '']
    spec = ["Private Function SpecBoutons() As Variant",
            "    ' onglet|nom|texte|macro|zone|R|G|B"]
    items = []
    for b in BUTTONS:
        r, g, bl = int(b['color'][0:2], 16), int(b['color'][2:4], 16), int(b['color'][4:6], 16)
        items.append('"%s|%s|%s|%s|%s|%d|%d|%d"' % (b['sheet'], b['name'], b['text'], b['macro'], b['range'], r, g, bl))
    spec.append('    Dim a(0 To %d) As String' % (len(items) - 1))
    for i, it in enumerate(items):
        spec.append('    a(%d) = %s' % (i, it))
    spec += ['    SpecBoutons = a', 'End Function', '']
    src = core + '\n' + old + '\n' + '\n'.join(vent) + '\n' + '\n'.join(spec) + '\n' + tplf
    src = src.replace('\r\n', '\n')
    src.encode('cp1252')   # doit passer
    for ln in src.split('\n'):
        assert len(ln) < 1000, ln[:80]
    return src

if __name__ == '__main__':
    s = build_source()
    open(sys.argv[1], 'wb').write(s.replace('\n', '\r\n').encode('cp1252'))
    print('ok', len(s), 'car.')
