import sys, re, openpyxl
sys.path.insert(0, '.')
import tpl
wb = openpyxl.load_workbook(sys.argv[1], data_only=True)
c = wb['CALC']
def fr(v):
    if isinstance(v, str):
        v = re.sub(r'(\d),(\d{3})', r'\1 \2', v)
        v = re.sub(r'(\d)\.(\d)', r'\1,\2', v)
    return v
mp = []
r = 3
while c.cell(r, 5).value:
    mp.append((c.cell(r, 5).value, fr(c.cell(r, 6).value), c.cell(r, 7).value)); r += 1
body = tpl.fill(tpl.template(), mp)
left = re.findall(r'\{\{[A-Z0-9_]+\}\}|<!--(?:IF|END)', body)
assert not left, left[:5]
open(sys.argv[2], 'w', encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#EEF2F7">' + body + '</body></html>')
print('ok', len(body))
