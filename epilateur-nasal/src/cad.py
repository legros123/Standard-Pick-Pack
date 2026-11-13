"""NazClic - modele 3D parametrique CadQuery. Exporte STEP/STL, assemblage, plateau, maillages viewer,
et controle d'interference (dont zone de garde cire) sur toute la course."""
import math, json, os, struct, sys
import numpy as np
import cadquery as cq
from params import *
OUT = os.path.join(os.path.dirname(__file__), '..', 'cad')
T = math.tan

def rev(pts):
    return cq.Workplane("XY").polyline(pts).close().revolve(360, (0, 0, 0), (1, 0, 0)).val()
def box(x0, x1, y0, y1, z0, z1):
    return cq.Workplane("XY").box(x1-x0, y1-y0, z1-z0, centered=False).translate((x0, y0, z0)).val()
def cyl(r, x0, x1):
    return cq.Solid.makeCylinder(r, x1-x0, cq.Vector(x0, 0, 0), cq.Vector(1, 0, 0))
def prism(pts, y):   # polygone (x,z) extrude en y +-y
    return cq.Workplane("XZ").polyline(pts).close().extrude(y, both=True).val()

def nez():
    pe = (ENT_D-GORGE_D)/2/T(math.radians(ENT_ANG)); R = D_EXT/2
    p = [(0, ENT_D/2), (0, R-1), (-1, R), (X_EPAUL, R), (X_EPAUL, EMB_D/2), (X_SIEGE, EMB_D/2), (X_SIEGE, SIEGE_D/2),
         (X_CH_AR, SIEGE_D/2), (X_CH_AR, CH_D/2), (X_CH_AV, CH_D/2), (X_CH_AV, LEVRE_RB), (X_LEVRE, LEVRE_RE),
         (X_LEVRE, GORGE_D/2), (-pe, GORGE_D/2)]
    s = rev(p)
    for sg in (1, -1):   # ergots baionnette sur +-y
        y0, y1 = (EMB_D/2-0.3, ERGOT_R) if sg > 0 else (-ERGOT_R, -EMB_D/2+0.3)
        s = s.fuse(box(X_ERGOT-ERGOT_H, X_ERGOT, y0, y1, -ERGOT_L/2, ERGOT_L/2))
    return s.clean()

def corps():
    R = D_EXT/2
    s = cyl(R, X_CORPS_AR, X_CORPS_AV)
    s = s.cut(cyl(ALES_D/2, X_ALES, X_CORPS_AV+1))
    s = s.cut(box(X_FOND, X_ALES+0.01, -CAN_Y/2, CAN_Y/2, -CAN_Z/2, CAN_Z/2))
    s = s.cut(box(X_CORPS_AR-1, X_FOND+0.01, -FENTE_Y/2, FENTE_Y/2, -FENTE_Z/2, FENTE_Z/2))
    s = s.cut(box(X_PLAT[0], X_PLAT[1], -R, R, Z_PLAT, R+1))
    zc = CAN_Z/2; dx = (Z_PLAT-zc)*T(math.radians(ANG_DEP))
    s = s.cut(prism([(F1_X[0], zc-0.01), (F1_X[0]+dx, Z_PLAT+0.01), (F1_X[0]+dx, R+1), (F1_X[1], R+1), (F1_X[1], zc-0.01)], F1_Y/2))
    s = s.cut(box(F2_X[0], F2_X[1], -F2_Y/2, F2_Y/2, zc-0.01, R+1))
    # baionnette : entree axiale + course circonferentielle + cran
    w = ERGOT_L+0.4; xb = X_ERGOT-ERGOT_H-0.3
    ent = box(xb, X_CORPS_AV+1, ALES_D/2-0.5, R+1, -w/2, w/2)
    rr = cq.Workplane("YZ").workplane(offset=xb).moveTo(ALES_D/2-0.5, 0).lineTo(R+1, 0).threePointArc(
        ((R+1)*math.cos(math.radians(BAIO_ANG/2+6)), (R+1)*math.sin(math.radians(BAIO_ANG/2+6))),
        ((R+1)*math.cos(math.radians(BAIO_ANG+12)), (R+1)*math.sin(math.radians(BAIO_ANG+12)))).lineTo(
        (ALES_D/2-0.5)*math.cos(math.radians(BAIO_ANG+12)), (ALES_D/2-0.5)*math.sin(math.radians(BAIO_ANG+12))).threePointArc(
        ((ALES_D/2-0.5)*math.cos(math.radians(BAIO_ANG/2+6)), (ALES_D/2-0.5)*math.sin(math.radians(BAIO_ANG/2+6))),
        (ALES_D/2-0.5, 0)).close().extrude(ERGOT_H+0.3-BAIO_CRAN).val()
    rr = rr.rotate((0, 0, 0), (1, 0, 0), -6)
    cran = box(xb, X_ERGOT+0.05, ALES_D/2-0.5, R+1, -w/2, w/2)
    for a in (0, 180):
        s = s.cut(ent.rotate((0, 0, 0), (1, 0, 0), a - BAIO_ANG)).cut(rr.rotate((0, 0, 0), (1, 0, 0), a - BAIO_ANG)).cut(cran.rotate((0, 0, 0), (1, 0, 0), a))
    return s.clean()

def _machoire(sg):
    xr = (BEC_ZO-CROCH_Z)/T(math.radians(RAMPE_ANG))
    p = [(X_BEC, BEC_ZO), (X_BEC, BEC_ZE), (X_TETE, BEC_ZE), (X_TETE, BRAS_ZE), (X_COL-0.01, BRAS_ZE), (X_COL-0.01, BRAS_ZI),
         (X_POCHE, BRAS_ZI), (X_POCHE, POCHE_Z), (X_CROCH, POCHE_Z), (X_CROCH, CROCH_Z), (X_BEC-xr, CROCH_Z)]
    return prism([(x, sg*z) for x, z in p], CH_EP/2)
def verrou():
    xa = X_COL-COL_EP
    s = box(X_LAME_FIN, xa+0.01, -CH_EP/2, CH_EP/2, LAME_Z[0], LAME_Z[1])
    h = DENT_Z-LAME_Z[1]; dx = h*T(math.radians(ANG_DEP))
    return s.fuse(prism([(DENT_X[1], LAME_Z[1]-0.01), (DENT_X[0]+dx+DENT_PLAT, DENT_Z), (DENT_X[0]+dx, DENT_Z), (DENT_X[0], LAME_Z[1]-0.01)], CH_EP/2))
def chariot(avec_verrou=True):
    y = CH_EP/2
    s = _machoire(1).fuse(_machoire(-1))
    s = s.fuse(box(X_COL-COL_EP, X_COL, -y, y, -COL_Z, COL_Z))
    s = s.fuse(box(X_BLOC, X_COL-COL_EP+0.01, -y, y, BARRE_Z[0], BARRE_Z[1]))
    s = s.fuse(box(X_BUTEE, X_BLOC+0.01, -y, y, -COL_Z, COL_Z))
    s = s.fuse(prism([(X_BUTEE+0.01, POUS_Z), (X_POUS+2, POUS_Z), (X_POUS, POUS_Z-2), (X_POUS, -POUS_Z+2), (X_POUS+2, -POUS_Z), (X_BUTEE+0.01, -POUS_Z)], y))
    if avec_verrou: s = s.fuse(verrou())
    return s.clean()

def _profil_baton():
    xd = X_DISQ; xt0 = xd+DISQ_EP+COU_L; xt1 = xt0+TETE_L; r = TETE_D/2
    p = [(X_QFIN, 0), (X_QFIN, Q_D/2-0.4), (X_QFIN+0.4, Q_D/2), (X_GORGE[0], Q_D/2), (X_GORGE[0], G_D/2), (X_GORGE[1], G_D/2),
         (X_GORGE[2], Q_D/2), (X_FUT[0], Q_D/2), (X_FUT[1], FUT_D/2), (xd, DISQ_D/2), (xd+DISQ_EP+LIP_H, DISQ_D/2),
         (xd+DISQ_EP+LIP_H, DISQ_D/2-LIP_E), (xd+DISQ_EP, DISQ_D/2-LIP_E), (xd+DISQ_EP, COU_D/2), (xt0, COU_D/2), (xt0+r-COU_D/2, r)]
    dr = (TETE_D-RAIN_D)/2
    for g in (xt0+2.6, xt0+5.1, xt0+7.6):
        p += [(g-RAIN_L/2-dr, r), (g-RAIN_L/2, r-dr), (g+RAIN_L/2, r-dr), (g+RAIN_L/2+dr, r)]
    for i in range(0, 9):
        a = math.radians(i*90/8); p.append((xt1-r+r*math.sin(a), r*math.cos(a)))
    return p
def baton(): return rev(_profil_baton())
def cire():
    xd = X_DISQ; x0 = xd+DISQ_EP+COU_L-0.8; xt1 = xd+DISQ_EP+COU_L+TETE_L; r = TETE_D/2+CIRE_EP
    p = [(x0, 0), (x0, r)] + [(xt1+CIRE_EP-r+r*math.sin(math.radians(i*90/8)), r*math.cos(math.radians(i*90/8))) for i in range(9)]
    return rev(p).cut(baton())
def zone_garde(g=GARDE_MIN):   # volume a moins de g de la zone potentiellement ciree (x >= face arriere disque)
    return cyl(DISQ_D/2+g, X_DISQ-g, X_DISQ+DISQ_EP+COU_L+TETE_L+CIRE_EP)
def ressort(L=R_LA):
    try:
        h = cq.Wire.makeHelix(L/(R_N+2)*1.0, L-R_D, R_DM/2)
        s = cq.Workplane("XY").center(R_DM/2, 0).circle(R_D/2).sweep(cq.Workplane(obj=h), isFrenet=True).val()
        return s.rotate((0, 0, 0), (0, 1, 0), 90).translate((X_SIEGE-L+R_D/2, 0, 0))
    except Exception:
        return cyl(R_DM/2+R_D/2, X_SIEGE-L, X_SIEGE).cut(cyl(R_DM/2-R_D/2, X_SIEGE-L-1, X_SIEGE+1))

def vol(a, b):
    try: return a.intersect(b).Volume()
    except Exception: return 0.0
def mv(s, dx): return s.translate((dx, 0, 0))

def controle():
    """Interferences sur toute la course. s = recul du chariot (0 arme -> COURSE tire)."""
    B, N, C, C0, S, W, Z = corps(), nez(), chariot(), chariot(False), baton(), cire(), zone_garde()
    rows = []
    for s in [0, 1, 2.5, 5, 7.5, 10, 12.5, 15]:
        ch = C if s in (0, 15) else C0     # en transit la dent est escamotee sous la barre (lame flechie)
        m = lambda o: mv(o, -s)
        dev = [B, N, m(ch)]
        v = dict(s=s,
                 chariot_corps=vol(m(ch), B), nez_corps=vol(N, B), chariot_nez=vol(m(ch), N), baton_nez=vol(m(S), N), baton_chariot=vol(S, ch),
                 baton_corps=vol(m(S), B), cire_appareil=sum(vol(m(W), d) for d in dev),
                 zone_garde_appareil=sum(vol(m(Z), d) for d in dev),
                 garde=(X_DISQ - s) - 0.0)
        rows.append(v)
    return rows

def to_print(s, part):
    if part in ('corps', 'baton'): s = s.rotate((0, 0, 0), (0, 1, 0), -90)
    elif part == 'nez': s = s.rotate((0, 0, 0), (0, 1, 0), 90)
    elif part == 'chariot': s = s.rotate((0, 0, 0), (1, 0, 0), 90)
    bb = s.BoundingBox()
    return s.translate((-(bb.xmin+bb.xmax)/2, -(bb.ymin+bb.ymax)/2, -bb.zmin))

def mesh(s, tol=0.04, ang=0.25):
    v, t = s.tessellate(tol, ang)
    return np.array([[p.x, p.y, p.z] for p in v]), np.array(t)
def write_stl(path, V, Tr):
    with open(path, 'wb') as f:
        f.write(b'NazClic'.ljust(80, b' ')); f.write(struct.pack('<I', len(Tr)))
        a = V[Tr]; n = np.cross(a[:, 1]-a[:, 0], a[:, 2]-a[:, 0]); n /= (np.linalg.norm(n, axis=1, keepdims=True)+1e-12)
        rec = np.zeros(len(Tr), dtype=[('n', '<f4', 3), ('v', '<f4', (3, 3)), ('a', '<u2')])
        rec['n'] = n; rec['v'] = a; f.write(rec.tobytes())

def plateau(lx=256.0, ly=256.0, marge=3.0, coin=30.0, jeu=0.8):
    """Pavage hexagonal de batonnets debout (queue en bas), relies par pontets secables au niveau du disque."""
    p = DISQ_D+jeu; pos = []; j = 0; y = marge+DISQ_D/2
    while y <= ly-marge-DISQ_D/2+1e-6:
        x = marge+DISQ_D/2+(p/2 if j % 2 else 0)
        while x <= lx-marge-DISQ_D/2+1e-6:
            if not (x < coin and y < coin): pos.append((x, y))
            x += p
        y += p*math.sqrt(3)/2; j += 1
    return pos, p

def main():
    os.makedirs(OUT, exist_ok=True)
    parts = dict(corps=corps(), nez=nez(), chariot=chariot(), baton=baton())
    info = {}
    for n, s in parts.items():
        assert s.isValid(), n
        cq.exporters.export(cq.Workplane(obj=s), f'{OUT}/{n}.step')
        V, Tr = mesh(to_print(s, n)); write_stl(f'{OUT}/{n}_impression.stl', V, Tr)
        bb = to_print(s, n).BoundingBox()
        info[n] = dict(volume_mm3=round(s.Volume(), 1), masse_g=round(s.Volume()*RHO_PETG, 2),
                       encombrement_impression=[round(bb.xlen, 1), round(bb.ylen, 1), round(bb.zlen, 1)])
    w = cire(); info['cire'] = dict(volume_mm3=round(w.Volume(), 1))
    xd = X_DISQ+DISQ_EP+COU_L
    info['cire']['surface_mm2'] = round(sum(f.Area() for f in parts['baton'].faces() if f.Center().x > xd-0.2), 1)
    # assemblage (arme, batonnet emboite) + eclate
    asm = cq.Assembly(name='NazClic')
    cols = dict(corps=(.2, .45, .7), nez=(.9, .5, .1), chariot=(.85, .85, .85), baton=(1, 1, 1))
    for n, s in parts.items(): asm.add(s, name=n, color=cq.Color(*cols[n]))
    asm.add(ressort(), name='ressort', color=cq.Color(.5, .5, .55))
    asm.save(f'{OUT}/assemblage_arme_emboite.step')
    # plateau
    pos, pas = plateau(); V, Tr = mesh(to_print(parts['baton'], 'baton'), 0.2, 0.7)
    zd = X_DISQ - X_QFIN
    lv, lt = mesh(box(-pas/2+DISQ_D/2-0.6, pas/2-DISQ_D/2+0.6, -0.8, 0.8, zd+0.2, zd+0.8)); allV = []; allT = []; off = 0
    S = set(pos)
    for (x, y) in pos:
        allV.append(V+[x, y, 0]); allT.append(Tr+off); off += len(V)
        for ang in (0, 60, 120):
            nx, ny = x+pas*math.cos(math.radians(ang)), y+pas*math.sin(math.radians(ang))
            if any(abs(nx-a) < .01 and abs(ny-b) < .01 for a, b in S):
                c_, s_ = math.cos(math.radians(ang)), math.sin(math.radians(ang))
                R = np.array([[c_, -s_, 0], [s_, c_, 0], [0, 0, 1]])
                allV.append(lv@R.T+[(x+nx)/2, (y+ny)/2, 0]); allT.append(lt+off); off += len(lv)
    write_stl(f'{OUT}/plateau_batonnets_P2S.stl', np.vstack(allV), np.vstack(allT))
    info['plateau'] = dict(nb=len(pos), pas=round(pas, 2), masse_g=round(len(pos)*info['baton']['masse_g'], 0), hauteur=round(info['baton']['encombrement_impression'][2], 1))
    info['controle'] = controle()
    json.dump(info, open(f'{OUT}/resultats_cad.json', 'w'), indent=1)
    # maillages pour le visualiseur (repere appareil)
    vm = {}
    for n, s in dict(corps=parts['corps'], nez=parts['nez'], chariot=chariot(False), verrou=verrou(), baton=parts['baton'], cire=w).items():
        V, Tr = mesh(s, 0.06, 0.3); vm[n] = dict(v=np.round(V, 2).flatten().tolist(), t=Tr.flatten().tolist())
    json.dump(vm, open(f'{OUT}/maillages.json', 'w'), separators=(',', ':'))
    for k_, v in info.items():
        if k_ != 'controle': print(k_, v)
    for r in info['controle']: print({a: round(b, 3) for a, b in r.items()})
if __name__ == '__main__': main()
