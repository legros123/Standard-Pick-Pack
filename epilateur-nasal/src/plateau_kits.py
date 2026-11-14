"""Plateau P2S optimise : kits complets (corps + nez + chariot) + estimation temps/cout."""
import math, json, numpy as np, cad
from params import *
B = 256.0; M = 3.0; COIN = 30.0; P = 22.5; PC = 15.8          # plateau, marge, coin exclu (H10), pas cercles, pas chariots
kits = 26; rows = kits // 2
ch = [(B-M-41.5-85*c, M+6.85+PC*r) for c in range(2) for r in range(rows)]      # chariots a droite, 2 colonnes
ytop = M+13.7+PC*(rows-1)+2
cer = []
for k in range(4):                                                              # bande de gauche, quinconce
    x = M+10+19.5*k; y = M+10+(P/2 if k % 2 else 0)
    while y <= B-M-10: cer.append((x, y)); y += P
xr0 = B-M-171
for j in range(int((B-M-ytop-20)//19.5)+1):                                     # au-dessus des chariots
    y = ytop+10+19.5*j; x = xr0+10+(P/2 if j % 2 else 0)
    while x <= B-M-10: cer.append((x, y)); x += P
ok = []
for p in cer:
    if p[0] < COIN+10 and p[1] < COIN+10: continue
    if all(math.dist(p, q) >= 21.9 for q in ok): ok.append(p)
assert len(ok) >= 2*kits, len(ok)
for (x, y) in ok:                                                               # pas de collision cercle / chariot
    for (cx, cy) in ch: assert not (abs(x-cx) < 41.5+10+1.5 and abs(y-cy) < 6.85+10+1.5), (x, y, cx, cy)
ok.sort(key=lambda p: (p[0] > M+10+19.5*3+1, p[1]))
corps, nez = ok[:kits], ok[kits:2*kits]
V = []; T = []; off = 0
for name, pos in (('corps', corps), ('nez', nez), ('chariot', ch)):
    v, t = cad.mesh(cad.to_print(getattr(cad, name)(), name), 0.08, 0.4)
    for (x, y) in pos: V.append(v+[x, y, 0]); T.append(t+off); off += len(v)
cad.write_stl('../cad/plateau_26_appareils_P2S.stl', np.vstack(V), np.vstack(T))
R = json.load(open('../cad/resultats_cad.json')); vk = sum(R[n]['volume_mm3'] for n in ('corps', 'nez', 'chariot'))
print('cercles places', len(ok), '-> kits', kits, '| volume kit mm3', round(vk), '| masse g', round(vk*RHO_PETG, 1))
for q in (4, 5.5, 7): print(f'debit moyen {q} mm3/s : kit {vk/q/60:.0f} min, plateau {kits*vk/q/3600:.1f} h')
print('chariots seuls /plateau: 2 col x', int((B-2*M-13.7)//PC)+1, '| corps+nez seuls: voir calcul')
n = 0; j = 0; y = M+10
while y <= B-M-10:
    x = M+10+(11.5 if j % 2 else 0)
    while x <= B-M-10: n += not (x < COIN+10 and y < COIN+10); x += 23
    y += 23*math.sqrt(3)/2; j += 1
print('cercles O20 sur plateau entier (pas 23):', n)
