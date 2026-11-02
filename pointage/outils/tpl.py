import re, html as _h
EXTRA = {
 "PP": '<tr><td colspan="2" style="padding:0 16px 10px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#F8FAFC" style="background-color:#F8FAFC;border-radius:8px;padding:8px 12px;font-size:13px;color:#475569;">Fin du convoyeur&nbsp;&nbsp;<b style="color:{{PP_CONV_COL}};">{{PP_CONV}}</b></td></tr></table></td></tr>\n',
 "HG": '',
 "CA": '<tr><td colspan="2" style="padding:0 16px 10px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#F8FAFC" style="background-color:#F8FAFC;border-radius:8px;padding:8px 12px;font-size:13px;color:#475569;">D&#233;vidages&nbsp;&nbsp;<b style="color:#0F172A;">{{CA_DEV}}</b></td></tr></table></td></tr>\n',
}
SERV = {"PP": ("PICK &amp; PACK", "#2F6FED"), "HG": ("HORS GABARIT", "#7C3AED"), "CA": ("C&#194;BLE", "#0D9488")}

def template():
    main = open('mail_tpl.html', encoding='utf-8').read()
    carte = open('mail_carte.html', encoding='utf-8').read()
    for k, (nom, col) in SERV.items():
        c = carte.replace('[[NOM]]', nom).replace('[[COUL]]', col).replace('[[EXTRA]]', EXTRA[k]).replace('X_', k + '_')
        main = main.replace('{{CARTE_%s}}' % k, c)
    # compacter : pas de commentaires HTML hors balises IF, pas d'indentation
    main = re.sub(r'<!-- [^>]*-->', '', main)
    main = '\n'.join(l.strip() for l in main.splitlines() if l.strip())
    assert all(ord(ch) < 128 for ch in main), [ch for ch in main if ord(ch) >= 128][:5]
    return main

def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def fill(tpl, mp):
    """mp: liste (cle, valeur, type) - meme logique que la macro VBA."""
    h = tpl
    for k, v, t in mp:
        if t == 'if':
            a, b = '<!--IF:%s-->' % k, '<!--END:%s-->' % k
            while a in h:
                p = h.index(a); q = h.index(b, p)
                h = h[:p] + (h[p+len(a):q] if v else '') + h[q+len(b):]
    for k, v, t in mp:
        if t != 'if':
            h = h.replace('{{%s}}' % k, esc('' if v is None else str(v)))
    return h
