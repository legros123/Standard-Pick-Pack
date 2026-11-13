"""NazClic - plans d'ingenieur PDF (A3) generes depuis le modele CadQuery (projections HLR + coupes)."""
import math, os, json
import numpy as np
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from matplotlib.collections import LineCollection, PolyCollection
import cadquery as cq
from OCP.HLRBRep import HLRBRep_Algo, HLRBRep_HLRToShape
from OCP.HLRAlgo import HLRAlgo_Projector
from OCP.gp import gp_Ax2, gp_Pnt, gp_Dir
from OCP.BRepLib import BRepLib
from params import *
import cad
C = calc(); DATE = '13/11/2026'; IND = 'A'
OUT = os.path.join(os.path.dirname(__file__), '..', 'livrables')
VIEWS = dict(face=((0, -1, 0), (1, 0, 0)), dessus=((0, 0, 1), (1, 0, 0)), bout=((1, 0, 0), (0, 1, 0)),
             iso=((0.55, -0.65, 0.52), (0.7634, 0.6459, 0)))
COL = dict(corps='#9db8d6', nez='#f2b56b', chariot='#c9c9c9', baton='#bfe3c0', cire='#e8c84a')

def hlr(shape, view):
    d, x = VIEWS[view] if isinstance(view, str) else view
    n = np.array(d)/np.linalg.norm(d); x = np.array(x, float); x -= n*np.dot(x, n); x /= np.linalg.norm(x)
    a = HLRBRep_Algo(); a.Add(shape.wrapped)
    a.Projector(HLRAlgo_Projector(gp_Ax2(gp_Pnt(0, 0, 0), gp_Dir(*n), gp_Dir(*x)))); a.Update(); a.Hide()
    hs = HLRBRep_HLRToShape(a); out = []
    for grp in ([hs.VCompound(), hs.OutLineVCompound(), hs.Rg1LineVCompound()], [hs.HCompound(), hs.OutLineHCompound()]):
        segs = []
        for c in grp:
            if c is None or c.IsNull(): continue
            BRepLib.BuildCurves3d_s(c)
            for e in cq.Shape.cast(c).Edges():
                try:
                    n_ = 2 if e.geomType() == 'LINE' else 24
                    segs.append(np.array([[p.x, p.y] for p in e.positions(np.linspace(0, 1, n_))]))
                except Exception: pass
        out.append(segs)
    return out

def coupe(shape, axe='y', pos=0.0):
    """Faces de coupe (triangles 2D) + demi-solide restant. axe y: plan XZ vu depuis -y ; axe x: plan YZ vu depuis +x."""
    e = 0.004
    if axe == 'y':
        slab = cad.box(-300, 300, pos, pos+e, -300, 300); half = cad.box(-300, 300, pos, 300, -300, 300); ij = (0, 2)
    else:
        slab = cad.box(pos-e, pos, -300, 300, -300, 300); half = cad.box(-300, pos, -300, 300, -300, 300); ij = (1, 2)
    tris = []
    try:
        V, T = cad.mesh(shape.intersect(slab), 0.02, 0.2)
        P = V[:, ij]; tris = [P[t] for t in T]
    except Exception: pass
    return tris, shape.intersect(half)

class Vue:
    def __init__(s, ax, ox, oy, sc, u0=0, v0=0): s.ax, s.ox, s.oy, s.sc, s.u0, s.v0 = ax, ox, oy, sc, u0, v0
    def P(s, u, v): return (s.ox+s.sc*(u-s.u0), s.oy+s.sc*(v-s.v0))
    def lines(s, segs, **kw):
        s.ax.add_collection(LineCollection([np.c_[s.ox+s.sc*(g[:, 0]-s.u0), s.oy+s.sc*(g[:, 1]-s.v0)] for g in segs], **kw))
    def proj(s, shape, view, hidden=True, lw=0.5, color='k'):
        v, h = hlr(shape, view)
        if hidden: s.lines(h, colors='#777', linewidths=0.25, linestyles=(0, (4, 2)))
        s.lines(v, colors=color, linewidths=lw)
    def sec(s, shape, col, axe='y', pos=0.0, lw=0.5):
        tris, half = coupe(shape, axe, pos)
        if tris: s.ax.add_collection(PolyCollection([np.c_[s.ox+s.sc*(t[:, 0]-s.u0), s.oy+s.sc*(t[:, 1]-s.v0)] for t in tris], facecolors=col, edgecolors=col, linewidths=0.1))
        s.proj(half, 'face' if axe == 'y' else 'bout', hidden=False, lw=lw)
    def axe(s, u1, u2, v=0):
        s.ax.plot(*zip(s.P(u1, v), s.P(u2, v)), color='#c00', lw=0.3, ls=(0, (12, 3, 2, 3)))
    def titre(s, t, u, v, dy=0): s.ax.text(*s.P(u, v), t, fontsize=7, fontweight='bold', ha='center', va='bottom')
    def dh(s, u1, u2, vfrom, vat, txt=None, fs=5.5, pre=''):
        (x1, y0), (x2, _) = s.P(u1, vfrom), s.P(u2, vfrom); y = s.P(0, vat)[1]
        for x in (x1, x2): s.ax.plot([x, x], [y0, y+(1 if y > y0 else -1)], color='#06c', lw=0.25)
        s.ax.annotate('', (x1, y), (x2, y), arrowprops=dict(arrowstyle='<|-|>', color='#06c', lw=0.3, mutation_scale=4, shrinkA=0, shrinkB=0))
        s.ax.text((x1+x2)/2, y+0.6, txt or f'{pre}{abs(u2-u1):.4g}'.replace('.', ','), fontsize=fs, color='#06c', ha='center', va='bottom')
    def dv(s, v1, v2, ufrom, uat, txt=None, fs=5.5, pre=''):
        (x0, y1), (_, y2) = s.P(ufrom, v1), s.P(ufrom, v2); x = s.P(uat, 0)[0]
        for y in (y1, y2): s.ax.plot([x0, x+(1 if x > x0 else -1)], [y, y], color='#06c', lw=0.25)
        s.ax.annotate('', (x, y1), (x, y2), arrowprops=dict(arrowstyle='<|-|>', color='#06c', lw=0.3, mutation_scale=4, shrinkA=0, shrinkB=0))
        s.ax.text(x-0.6, (y1+y2)/2, txt or f'{pre}{abs(v2-v1):.4g}'.replace('.', ','), fontsize=fs, color='#06c', ha='right', va='center', rotation=90)
    def note(s, u, v, txt, du=8, dv_=8, fs=5.5, color='#06c'):
        x, y = s.P(u, v)
        s.ax.annotate(txt, (x, y), (x+du, y+dv_), fontsize=fs, color=color, arrowprops=dict(arrowstyle='-|>', color=color, lw=0.3, mutation_scale=4), ha='left' if du >= 0 else 'right', va='center')

def page(pdf, titre, rep, mat, ech, notes=()):
    fig = plt.figure(figsize=(420/25.4, 297/25.4)); ax = fig.add_axes([0, 0, 1, 1]); ax.set_xlim(0, 420); ax.set_ylim(0, 297); ax.axis('off'); ax.set_aspect('equal')
    ax.plot([10, 410, 410, 10, 10], [10, 10, 287, 287, 10], 'k', lw=0.8)
    x0, y0, w, h = 230, 10, 180, 42
    for (a, b, c, d) in [(x0, y0, x0+w, y0), (x0, y0+h, x0+w, y0+h), (x0, y0, x0, y0+h), (x0, y0+14, x0+w, y0+14), (x0, y0+28, x0+w, y0+28),
                         (x0+70, y0, x0+70, y0+28), (x0+125, y0, x0+125, y0+28), (x0+152, y0, x0+152, y0+14)]:
        ax.plot([a, c], [b, d], 'k', lw=0.5)
    T = lambda x, y, s, fs=7, **k: ax.text(x, y, s, fontsize=fs, va='center', **k)
    T(x0+3, y0+35, f'NazClic - épilateur nasal à cire', 9, fontweight='bold'); T(x0+3, y0+30.5, titre, 8)
    T(x0+3, y0+21, f'Repère : {rep}'); T(x0+73, y0+24, 'Matière :', 5.5); T(x0+73, y0+18.5, mat, 6.5)
    T(x0+128, y0+24, 'Échelle :', 5.5); T(x0+128, y0+18.5, ech, 9, fontweight='bold')
    T(x0+3, y0+9.5, 'Tol. générales : ±0,2 mm (FDM, buse 0,4 / couche 0,16)', 5.5); T(x0+3, y0+4.5, 'Jeux fonctionnels : 0,2 à 0,3 mm - cotes en mm', 5.5)
    T(x0+73, y0+9.5, f'Date : {DATE}', 6); T(x0+73, y0+4.5, 'Dessiné : BE (Claude)', 6)
    T(x0+128, y0+7, f'Indice {IND}', 8, fontweight='bold'); T(x0+155, y0+7, 'Format A3', 6)
    for i, n in enumerate(notes): T(14, 46-5*i, n, 6)
    return fig, ax

def p_corps(pdf):
    S = cad.corps(); sc = 2.0; R = D_EXT/2
    fig, ax = page(pdf, 'CORPS', '1', 'PETG (PA12 possible)', '2:1', [
        'Impression : axe vertical, fond sur le plateau, sans support. 4 périmètres, remplissage 40 %.',
        f'Face avant de la barre de verrou : dépouille {ANG_DEP:g}° (sommet vers l\'avant) = réglage de l\'effort de gâchette.',
        'Origine des X = face avant du nez monté (x = 0). Le corps s\'étend de x = %.1f à x = %.1f.' % (X_CORPS_AV, X_CORPS_AR)])
    u0 = X_CORPS_AR
    v = Vue(ax, 30, 248, sc, u0); v.proj(S, 'face'); v.axe(u0-3, X_CORPS_AV+3); v.titre('VUE DE FACE', (u0+X_CORPS_AV)/2, R+8)
    v.dh(X_CORPS_AR, X_CORPS_AV, R, R+5, '%.1f' % (X_CORPS_AV-X_CORPS_AR)); v.dv(-R, R, X_CORPS_AR, X_CORPS_AR-4, 'Ø%g' % D_EXT)
    v.dh(X_PLAT[0], X_PLAT[1], Z_PLAT, R+1.5, 'méplat %g' % (X_PLAT[1]-X_PLAT[0])); v.dv(0, Z_PLAT, X_CORPS_AV, X_CORPS_AV+4, '%g' % Z_PLAT)
    v = Vue(ax, 30, 178, sc, u0); v.sec(S, COL['corps']); v.axe(u0-3, X_CORPS_AV+3); v.titre('COUPE A-A (plan de symétrie y = 0)', (u0+X_CORPS_AV)/2+18, R+7)
    v.dh(X_ALES, X_CORPS_AV, -R, -R-3, 'alésage Ø%g prof. %g' % (ALES_D, X_CORPS_AV-X_ALES)); v.dh(X_CORPS_AR, X_FOND, -R, -R-3, 'fond %g' % EP_FOND)
    v.dh(X_FOND, X_ALES, -R, -R-6.5, 'canal %g × %g  long. %g' % (CAN_Y, CAN_Z, X_ALES-X_FOND))
    v.dh(F1_X[0], F1_X[1], Z_PLAT, R+1.5, 'F1 %g' % (F1_X[1]-F1_X[0])); v.dh(F2_X[0], F2_X[1], Z_PLAT, R+1.5, 'F2 %g' % (F2_X[1]-F2_X[0]))
    v.dh(F2_X[1], F1_X[0], Z_PLAT, R+4.5, 'barre %g ±0,1' % (F1_X[0]-F2_X[1]))
    v.dv(-CAN_Z/2, CAN_Z/2, X_FOND+12, X_FOND+12, '%g +0,1/0' % CAN_Z); v.dv(CAN_Z/2, Z_PLAT, X_BARRE-4, X_BARRE-4, '%.1f' % (Z_PLAT-CAN_Z/2))
    v.note(X_BARRE, CAN_Z/2+0.5, f'dépouille {ANG_DEP:g}°', 10, -22)
    v = Vue(ax, 30, 100, sc, u0); v.proj(S, 'dessus'); v.axe(u0-3, X_CORPS_AV+3); v.titre('VUE DE DESSUS (côté gâchette)', (u0+X_CORPS_AV)/2, R+7)
    v.dv(-F1_Y/2, F1_Y/2, F1_X[1], F1_X[1]+6, 'F1 larg. %g' % F1_Y); v.dv(-F2_Y/2, F2_Y/2, F2_X[0], F2_X[0]-3, '%g' % F2_Y)
    v.dh(F1_X[1], X_CORPS_AV, -R, -R-3, '%g (F1 / face avant corps)' % (X_CORPS_AV-F1_X[1]))
    v.note(F1_X[0]+4, 0, 'F1 : fenêtre gâchette (ARMÉ)', 6, -26); v.note(F2_X[0]+4, 0, 'F2 : fenêtre repos / témoin', -4, -26)
    v = Vue(ax, 250, 248, sc); v.proj(S, 'bout'); v.titre('VUE AVANT (suivant X)', 0, R+7); v.dv(-ALES_D/2, ALES_D/2, R, R+5, 'Ø%g +0,2/0' % ALES_D)
    v.note(R*0.7, R*0.7, 'rainures baïonnette ×2\nrotation %g°, cran %g' % (BAIO_ANG, BAIO_CRAN), 8, 6)
    v = Vue(ax, 250, 178, sc); v.sec(S, COL['corps'], 'x', X_FOND-EP_FOND/2); v.titre('COUPE B-B (dans le fond)', 0, R+7)
    v.dh(-FENTE_Y/2, FENTE_Y/2, -FENTE_Z/2, -R-3, 'fente %g × %g' % (FENTE_Y, FENTE_Z))
    v = Vue(ax, 330, 105, 1.0, -50); v.proj(S, 'iso', hidden=False, lw=0.4)
    pdf.savefig(fig); plt.close(fig)

def p_nez(pdf):
    S = cad.nez(); sc = 4.0; R = D_EXT/2; pe = C['prof_ent']
    fig, ax = page(pdf, 'NEZ - ENTONNOIR', '2', 'PETG', '4:1', [
        'Impression : face avant (x = 0) sur le plateau, sans support. Pièce d\'essai rapide (12 min) pour régler le guidage.',
        'Lèvre intérieure : écarte les mâchoires en sur-course (+%g mm) -> éjection du bâtonnet sans le toucher.' % SURCOURSE,
        'Montage : pousser dans le corps et tourner de %g° (baïonnette). Sans outil.' % BAIO_ANG])
    v = Vue(ax, 60, 200, sc, X_SIEGE); v.sec(S, COL['nez']); v.axe(X_SIEGE-2, 3); v.titre('COUPE A-A', X_SIEGE/2, R+4)
    v.dv(-ENT_D/2, ENT_D/2, 0, 4, 'Ø%g entrée (F3)' % ENT_D); v.dv(-R, R, 0, 8, 'Ø%g' % D_EXT)
    v.dh(-pe, 0, -R, -R-3, 'cône %.2f' % pe); v.dh(X_EPAUL, 0, R, R+1.5, '%g' % -X_EPAUL); v.dh(X_SIEGE, 0, -R, -R-6.5, '%g ±0,1 (appui ressort)' % -X_SIEGE)
    v.dh(X_LEVRE, 0, -R, -R-10, 'lèvre %g ±0,1' % -X_LEVRE)
    v.dv(-EMB_D/2, EMB_D/2, X_SIEGE, X_SIEGE-3, 'Ø%g 0/-0,1' % EMB_D); v.dv(-SIEGE_D/2, SIEGE_D/2, X_SIEGE, X_SIEGE-7, 'Ø%g' % SIEGE_D)
    v.note((X_CH_AV+X_CH_AR)/2, CH_D/2, 'chambre mâchoires Ø%g' % CH_D, 4, 30); v.note(X_LEVRE, GORGE_D/2, 'col Ø%g +0,1/0' % GORGE_D, 30, 34)
    v.note(-pe/2, (ENT_D+GORGE_D)/4, 'demi-angle %g° (60° inclus)' % ENT_ANG, 14, 34)
    v = Vue(ax, 200, 200, sc, X_SIEGE); v.proj(S, 'face'); v.axe(X_SIEGE-2, 3); v.titre('VUE DE FACE', X_SIEGE/2, R+4)
    v = Vue(ax, 200, 95, sc, X_SIEGE); v.proj(S, 'dessus'); v.axe(X_SIEGE-2, 3); v.titre('VUE DE DESSUS', X_SIEGE/2, R+4)
    v.dv(-ERGOT_R, ERGOT_R, X_ERGOT, X_SIEGE-3, 'sur ergots %g' % (2*ERGOT_R)); v.dh(X_ERGOT-ERGOT_H, X_ERGOT, -ERGOT_R, -R-3, 'ergot %g × %g' % (ERGOT_H, ERGOT_L))
    v = Vue(ax, 355, 200, sc); v.proj(S, 'bout'); v.titre('VUE AVANT', 0, R+4)
    v = Vue(ax, 360, 105, 3.0, X_SIEGE/2); v.proj(S, 'iso', hidden=False, lw=0.4)
    pdf.savefig(fig); plt.close(fig)

def p_chariot(pdf):
    S = cad.chariot(); sc = 2.2
    fig, ax = page(pdf, 'CHARIOT (mâchoires + collerette + verrou + poussoir)', '3', 'PA12 (PETG pour proto 1)', '2,2:1', [
        'Pièce 2,5D : impression À PLAT (plan XZ sur le plateau, épaisseur %g). Lames fléchissant dans le plan des couches.' % CH_EP,
        'Faces d\'accrochage des crochets perpendiculaires à X (retenue positive). Rampe d\'entrée %g°.' % RAMPE_ANG,
        'Cotes X données en position ARMÉE dans le repère appareil (x = 0 : face avant du nez).'])
    u0 = X_POUS
    v = Vue(ax, 25, 238, sc, u0); v.proj(S, 'face'); v.axe(u0-2, X_BEC+2); v.titre('VUE DE FACE (profil extrudé)', (u0+X_BEC)/2-25, 14)
    v.dh(X_POUS, X_BEC, -COL_Z, -COL_Z-12, 'longueur %g' % (X_BEC-X_POUS)); v.dh(X_COL, X_BEC, -COL_Z, -COL_Z-4, 'mâchoires %g' % (X_BEC-X_COL))
    v.dh(X_COL-COL_EP, X_COL, -COL_Z, -COL_Z-8, 'coll. %g' % COL_EP); v.dh(X_POUS, X_BUTEE, -COL_Z, -COL_Z-4, 'poussoir %g' % (X_BUTEE-X_POUS))
    v.dh(X_BUTEE, X_COL, -COL_Z, -COL_Z-8, 'butée / appui ressort %g ±0,15' % (X_COL-X_BUTEE))
    v.dh(DENT_X[0], X_COL-COL_EP, LAME_Z[1], COL_Z+7, 'lame verrou %.2f' % (X_COL-COL_EP-DENT_X[0])); v.dh(DENT_X[0], DENT_X[1], DENT_Z, COL_Z+3.5, 'dent %.2f' % (DENT_X[1]-DENT_X[0]))
    v.dv(-COL_Z, COL_Z, X_COL, X_COL+3, '%g 0/-0,1' % (2*COL_Z)); v.dv(-POUS_Z, POUS_Z, X_POUS, X_POUS-3, '%g' % (2*POUS_Z))
    v.dv(LAME_Z[1], DENT_Z, DENT_X[0], DENT_X[0]-5, 'dent h %.1f' % (DENT_Z-LAME_Z[1])); v.dv(LAME_Z[0], LAME_Z[1], X_COL-COL_EP-8, X_COL-COL_EP-8, 'ép. %.1f' % (LAME_Z[1]-LAME_Z[0]))
    v.dv(-BEC_ZE, BEC_ZE, X_BEC, X_BEC+3, '%g' % (2*BEC_ZE))
    v = Vue(ax, 25, 178, sc, u0); v.proj(S, 'dessus'); v.axe(u0-2, X_BEC+2); v.titre('VUE DE DESSUS', (u0+X_BEC)/2, 6)
    v.dv(-CH_EP/2, CH_EP/2, X_POUS, X_POUS-3, 'ép. %g 0/-0,1' % CH_EP)
    v = Vue(ax, 250, 178, sc); v.proj(S, 'bout'); v.titre('VUE AVANT', 0, 9)
    v = Vue(ax, 305, 178, sc); v.sec(S, COL['chariot'], 'x', sum(DENT_X)/2); v.titre('COUPE C-C (dent de verrou)', 0, 9)
    d = Vue(ax, 60, 108, 7.0, X_TETE-2); d.proj(S.intersect(cad.box(X_TETE-3, X_BEC+1, -10, 10, -10, 10)), 'face', hidden=False); d.axe(X_TETE-3, X_BEC+2)
    d.titre('DÉTAIL MÂCHOIRES 7:1', (X_TETE+X_BEC)/2, BEC_ZE+3.3)
    d.dv(-CROCH_Z, CROCH_Z, X_CROCH+0.3, X_BEC+2.5, 'crochets %g ±0,1' % (2*CROCH_Z)); d.dv(-POCHE_Z, POCHE_Z, X_POCHE, X_TETE-2.3, 'poche %g' % (2*POCHE_Z))
    d.dv(-BEC_ZO, BEC_ZO, X_BEC, X_BEC+4.8, 'entrée %g' % (2*BEC_ZO)); d.dh(X_CROCH, X_BEC, -BEC_ZE, -BEC_ZE-1.2, 'face d\'accrochage %g ±0,1' % (X_BEC-X_CROCH))
    d.dh(X_POCHE, X_CROCH, -BEC_ZE, -BEC_ZE-2.6, 'poche %g' % (X_CROCH-X_POCHE)); d.dv(BRAS_ZI, BRAS_ZE, X_TETE-1.5, X_TETE-1.5, 'bras %.1f' % (BRAS_ZE-BRAS_ZI))
    v = Vue(ax, 330, 110, 1.2, -55); v.proj(S, 'iso', hidden=False, lw=0.4)
    pdf.savefig(fig); plt.close(fig)

def p_baton(pdf):
    S = cad.baton(); sc = 3.0; xt = X_DISQ+DISQ_EP+COU_L; xe = xt+TETE_L
    fig, ax = page(pdf, 'BÂTONNET À USAGE UNIQUE', '5', 'PETG (blanc/naturel)', '3:1', [
        'Pièce de révolution -> emboîtement sans orientation angulaire (F3). Impression debout, queue sur le plateau, sans support.',
        'Zone cirée : uniquement en avant du disque de garde (tête + cou). Le disque Ø%g arrête les coulures et sert de butée de narine.' % DISQ_D,
        'Détrompage par cotes propriétaires : queue Ø%g, gorge Ø%g à %.1f de l\'extrémité. Masse ≈ %.1f g.' % (Q_D, G_D, X_GORGE[0]-X_QFIN, S.Volume()*RHO_PETG)])
    for k, (oy, f) in enumerate(((225, 'face'), (150, 'coupe'))):
        v = Vue(ax, 30, oy, sc, X_QFIN); v.axe(X_QFIN-2, xe+2)
        if f == 'face': v.proj(S, 'face'); v.proj(cad.cire(), 'face', hidden=False, lw=0.3, color='#b8860b'); v.titre('VUE DE FACE (cire nominale en trait ocre)', 12, 10)
        else: v.sec(S, COL['baton']); v.titre('COUPE A-A', 12, 10)
        if f == 'face':
            v.dh(X_QFIN, xe, -DISQ_D/2, -DISQ_D/2-7, 'longueur %.1f' % (xe-X_QFIN)); v.dh(X_GORGE[0], X_DISQ, -DISQ_D/2, -DISQ_D/2-3.5, 'gorge / disque %.1f ±0,2 (= garde %g + course %g + prof. %.1f)' % (X_DISQ-X_GORGE[0], GARDE_FIN, COURSE, -X_GORGE[0]))
            v.dh(xt, xe, DISQ_D/2, DISQ_D/2+2, 'tête %g' % TETE_L); v.dh(X_DISQ, X_DISQ+DISQ_EP, DISQ_D/2, DISQ_D/2+2, '%g' % DISQ_EP)
            v.dv(-DISQ_D/2, DISQ_D/2, X_DISQ, X_DISQ-9, 'Ø%g' % DISQ_D); v.dv(-TETE_D/2, TETE_D/2, xe, xe+2, 'Ø%g' % TETE_D); v.dv(-Q_D/2, Q_D/2, X_QFIN, X_QFIN-2, 'Ø%g ±0,1' % Q_D)
        else:
            v.dh(X_QFIN, X_GORGE[0], -DISQ_D/2, -DISQ_D/2-3, '%.1f ±0,1' % (X_GORGE[0]-X_QFIN)); v.dh(X_FUT[0], X_FUT[1], -DISQ_D/2, -DISQ_D/2-3, 'fût conique Ø%g → Ø%g' % (Q_D, FUT_D))
            v.dv(-COU_D/2, COU_D/2, xt-1.5, xt-1.5, 'Ø%g' % COU_D)
    d = Vue(ax, 250, 150, 10.0, X_QFIN); d.sec(S.intersect(cad.box(X_QFIN-1, X_GORGE[2]+2.5, -9, 9, -9, 9)), COL['baton']); d.axe(X_QFIN-1, X_GORGE[2]+3)
    d.titre('DÉTAIL QUEUE 10:1', X_QFIN+3.5, 4.2)
    d.dv(-G_D/2, G_D/2, X_GORGE[0]+0.6, X_GORGE[2]+4.5, 'Ø%g ±0,1' % G_D); d.dv(-Q_D/2, Q_D/2, X_QFIN, X_QFIN-1.6, 'Ø%g ±0,1' % Q_D)
    d.dh(X_GORGE[0], X_GORGE[1], -Q_D/2, -Q_D/2-1.2, 'fond %.1f' % (X_GORGE[1]-X_GORGE[0])); d.dh(X_GORGE[0], X_GORGE[2], -Q_D/2, -Q_D/2-2.5, 'gorge %.1f (chanfrein 45°)' % (X_GORGE[2]-X_GORGE[0]))
    d.note(X_GORGE[0], 2.1, 'paroi d\'accrochage perp. à axe', -2, 26)
    v = Vue(ax, 250, 225, sc); v.proj(S, 'bout'); v.titre('VUE CÔTÉ TÊTE', 0, 9)
    v = Vue(ax, 345, 215, 2.2, 10); v.proj(S, 'iso', hidden=False, lw=0.4)
    pdf.savefig(fig); plt.close(fig)

def ressort2d(v, L, col='#555'):
    n = R_N+2; xs = np.linspace(X_SIEGE-R_D/2, X_SIEGE-L+R_D/2, int(n)+1)
    for i, x in enumerate(xs):
        for sg in (1, -1):
            xx = x - (0 if sg > 0 else (xs[0]-xs[1])/2)
            if xx < X_SIEGE-L+R_D/2-1e-6: continue
            v.ax.add_patch(plt.Circle(v.P(xx, sg*R_DM/2), R_D/2*v.sc, fc=col, ec='k', lw=0.2))

def ens(v, s, baton=True, garde=True, lw=0.35):
    """coupe d'ensemble a la position s (recul chariot). Baton solidaire du chariot."""
    v.sec(cad.corps(), COL['corps'], lw=lw); v.sec(cad.nez(), COL['nez'], lw=lw); v.sec(cad.mv(cad.chariot(), -s), COL['chariot'], lw=lw)
    ressort2d(v, R_LA+s)
    if baton:
        v.sec(cad.mv(cad.baton(), -s), COL['baton'], lw=lw); v.sec(cad.mv(cad.cire(), -s), COL['cire'], lw=lw)
        if garde:
            xd = X_DISQ-s; R = DISQ_D/2+GARDE_MIN
            v.ax.add_patch(plt.Rectangle(v.P(xd-GARDE_MIN, -R), (GARDE_MIN+DISQ_EP+COU_L+TETE_L+3)*v.sc, 2*R*v.sc, fc='#e33', alpha=0.10, ec='#e33', lw=0.4, ls='--'))
            v.dh(0, xd, R, R+2.5, 'GARDE %g' % xd, fs=7)

def p_ensemble(pdf):
    fig, ax = page(pdf, 'PLAN D\'ENSEMBLE - vue éclatée - nomenclature', 'ENS', '-', '2:1 / 1,3:1', [
        'Assemblage sans outil : (4) ressort puis (3) chariot dans (1) corps par l\'avant, puis (2) nez : pousser + tourner %g°.' % BAIO_ANG,
        'Coupe représentée ARMÉE, bâtonnet emboîté. 3 pièces imprimées + 1 ressort du commerce + bâtonnet consommable.'])
    v = Vue(ax, 30, 225, 2.0, X_POUS); ens(v, 0); v.axe(X_POUS-2, 44); v.titre('COUPE D\'ENSEMBLE A-A - ARMÉ, EMBOÎTÉ (2:1)', -25, 20)
    for n, (u, w) in {'1': (-50, -9), '2': (-4, 9.5), '3': (-80, -3), '4': (-30, 5.5), '5': (15, 1.5)}.items():
        x, y = v.P(u, w); yy = y+(26 if w > 0 else -26)
        ax.plot([x, x+6], [y, yy], 'k', lw=0.3); ax.add_patch(plt.Circle((x+6, yy), 3.2, fc='w', ec='k', lw=0.5)); ax.text(x+6, yy, n, ha='center', va='center', fontsize=8)
    v.dh(X_POUS, 0, -D_EXT/2, -D_EXT/2-5, 'armé : %g hors bâtonnet (repos : %g)' % (-X_POUS, C['lg_repos']), fs=6.5)
    ecl = [(cad.corps(), 0, 0), (ressort_tube(), 48, 0), (cad.chariot(), 85, 0), (cad.nez(), 118, 0), (cad.baton(), 132, 0)]
    v = Vue(ax, 60, 120, 1.3, -60)
    for s, dx, _ in ecl: v.proj(cad.mv(s, dx), 'iso', hidden=False, lw=0.4)
    v.titre('VUE ÉCLATÉE (1,3:1)', 20, 42)
    rows = [('Rep.', 'Qté', 'Désignation', 'Matière / référence', 'Masse'),
            ('1', '1', 'Corps', 'PETG imprimé', '%.1f g' % (cad.corps().Volume()*RHO_PETG)),
            ('2', '1', 'Nez - entonnoir', 'PETG imprimé', '%.1f g' % (cad.nez().Volume()*RHO_PETG)),
            ('3', '1', 'Chariot monobloc', 'PA12 imprimé (PETG proto)', '%.1f g' % (cad.chariot().Volume()*RHO_PETG)),
            ('4', '1', 'Ressort de compression', 'fil %g, De %g, L0 %g, R=%.2f N/mm - acier EN 10270-1 SH' % (R_D, R_DM+R_D, R_L0, C['k']), '≈2 g'),
            ('5', 'n', 'Bâtonnet (consommable)', 'PETG imprimé', '%.1f g' % (cad.baton().Volume()*RHO_PETG))]
    for i, r in enumerate(rows):
        y = 66+ (len(rows)-1-i)*6.5
        for x, t in zip((232, 244, 254, 300, 388), r): ax.text(x, y, t, fontsize=6.2 if i else 6.5, fontweight='bold' if i == 0 else 'normal', va='center')
        ax.plot([230, 410], [y-3.25, y-3.25], 'k', lw=0.3)
    ax.plot([230, 410], [66+5*6.5+3.25]*2, 'k', lw=0.5); ax.plot([230, 230], [52, 66+5*6.5+3.25], 'k', lw=0.5)
    pdf.savefig(fig); plt.close(fig)
def ressort_tube(): return cad.cyl(R_DM/2+R_D/2, X_SIEGE-R_L0, X_SIEGE).cut(cad.cyl(R_DM/2-R_D/2, X_SIEGE-R_L0-1, X_SIEGE+1))

def p_interface(pdf):
    fig, ax = page(pdf, 'INTERFACE BÂTONNET / APPAREIL - cotes fonctionnelles et guidages', 'INT', '-', '7:1', [
        'F3 : capture radiale ±%.1f mm (Ø entrée %g − Ø queue %g), désalignement angulaire admissible ≈ ±10° (jeu au col %.1f sur %.1f de long).' % (C['tol_radiale'], ENT_D, Q_D, GORGE_D-Q_D, -X_LEVRE-C['prof_ent']),
        'Effort d\'insertion calculé %.1f N (maxi %.1f N) - clic à l\'accrochage. Retenue POSITIVE (faces perp. à) : capacité ≥ %.0f N.' % (C['F_insert'], C['F_insert_max'], min(C['F_ret_matage'], C['F_ret_gorge'])),
        'Éjection : sur-course du poussoir +%g mm -> la lèvre (col) écarte les mâchoires de %.1f mm -> le bâtonnet tombe (effort 0).' % (SURCOURSE, C['m_ouv']),
        'Bâtonnet de révolution : aucun détrompeur angulaire -> emboîtement à l\'aveugle quel que soit le roulis.'])
    sc = 7.0; clip = cad.box(-24.5, 6, -12, 12, -12, 12)
    v = Vue(ax, 40, 195, sc, -24.5)
    for s_, c_ in ((cad.corps(), 'corps'), (cad.nez(), 'nez'), (cad.chariot(), 'chariot'), (cad.baton(), 'baton')): v.sec(s_.intersect(clip), COL[c_])
    v.axe(-25, 7); v.titre('COUPE A-A - ARMÉ, BÂTONNET EMBOÎTÉ (7:1)', -9, 11.3)
    R = D_EXT/2
    v.dv(-ENT_D/2, ENT_D/2, 0, 3, 'Ø%g entrée' % ENT_D); v.dv(-Q_D/2, Q_D/2, 5, 5.5, 'Ø%g ±0,1' % Q_D, fs=5)
    v.dh(X_LEVRE, 0, -R, -R-1.2, 'lèvre %g' % -X_LEVRE); v.dh(X_BEC, 0, -R, -R-2.4, 'bec mâchoires %g ±0,2' % -X_BEC); v.dh(X_CROCH, 0, -R, -R-3.6, 'face d\'accrochage %g ±0,2' % -X_CROCH)
    v.dh(X_QFIN, 0, -R, -R-4.8, 'fond de queue %g' % -X_QFIN); v.dh(X_SIEGE, 0, R, R+0.8, 'appui ressort %g' % -X_SIEGE)
    v.dh(X_LEVRE, X_BEC, 0, 9.0, 'jeu %g' % (X_LEVRE-X_BEC), fs=5); v.dh(X_QFIN, X_POCHE, 0, -8.3, 'jeu %g' % (X_QFIN-X_POCHE), fs=5)
    v.note(X_CROCH+0.3, CROCH_Z+0.15, 'recouvrement crochet/queue %.1f mm\n(crochets %g / queue Ø%g / gorge Ø%g)' % (C['m_ouv'], 2*CROCH_Z, Q_D, G_D), -40, -52)
    v.note(-4, -5.4, 'cône 2×%g° : auto-centrage' % ENT_ANG, 30, -8); v.note(X_LEVRE+0.6, -GORGE_D/2, 'col Ø%g (jeu diam. %.1f)' % (GORGE_D, GORGE_D-Q_D), 75, -30)
    # approche desalignee
    v2 = Vue(ax, 262, 215, 2.6, -24.5); v2.sec(cad.nez().intersect(clip), COL['nez'])
    for off, ang, dx in ((5.0, 8, 20.5), (2.2, 5, 14)):
        b = cad.mv(cad.baton(), dx).rotate((X_QFIN+dx, 0, 0), (X_QFIN+dx, 1, 0), -ang).translate((0, 0, off))
        v2.sec(b.intersect(cad.box(-25, 27, -1, 1, -30, 30)), COL['baton'], lw=0.3)
    v2.axe(-25, 26); v2.titre('APPROCHE DÉSALIGNÉE : 5 mm / 8° -> guidée par le cône (3:1)', 0, 16)
    v3 = Vue(ax, 265, 110, 3.0, -24.5)
    for s_, c_ in ((cad.nez(), 'nez'), (cad.mv(cad.chariot(), SURCOURSE), 'chariot')): v3.sec(s_.intersect(clip), COL[c_])
    v3.axe(-25, 6); v3.titre('SUR-COURSE +%g : becs sur la lèvre (mâchoires dessinées non fléchies) (3:1)' % SURCOURSE, -6, 12)
    pdf.savefig(fig); plt.close(fig)

def p_cinematique(pdf):
    fig, ax = page(pdf, 'CINÉMATIQUE - 4 positions - distance de garde cotée', 'CIN', '-', '1,6:1', [
        'F4 : zone rouge = volume à moins de %g mm de la zone potentiellement cirée (tout ce qui est en avant de la face arrière du disque).' % GARDE_MIN,
        'Contrôle CadQuery : intersection (zone de garde ∩ appareil) = 0 mm³ sur 8 positions de la course. Garde mini = %g mm (critère ≥ %g).' % (GARDE_FIN, GARDE_MIN),
        'Course de retrait F5 = %g mm. Le corps ne bouge pas : seul le chariot recule, le bâtonnet rentre dans le nez.' % COURSE])
    sc = 1.6
    for i, (t, s, b) in enumerate((('1 - REPOS (désarmé) : dent dans F2, poussoir sorti de %g mm' % (-(X_POUS-COURSE)+X_CORPS_AR), COURSE, False),
                                   ('2 - ARMÉ : poussoir enfoncé, clic, dent dans F1 (ressort %.1f N)' % C['F_arme'], 0, False),
                                   ('3 - EMBOÎTÉ : bâtonnet guidé par le cône, clic des mâchoires - GARDE %g mm' % GARDE_EMB, 0, True),
                                   ('4 - FIN DE RETRAIT : course %g mm - GARDE %g mm' % (COURSE, GARDE_FIN), COURSE, True))):
        v = Vue(ax, 40, 252-i*56, sc, X_POUS-COURSE); ens(v, s, b, lw=0.3); v.axe(X_POUS-COURSE-2, 46)
        ax.text(40, 252-i*56+23, t, fontsize=7.5, fontweight='bold')
        if i == 3: v.dh(X_POUS-COURSE, X_POUS, -D_EXT/2, -D_EXT/2-2.5, 'recul %g' % COURSE, fs=6)
    tb = [('Position', 'Recul s', 'Garde', 'Ressort'), ('Repos', '%g' % COURSE, '-', '%.1f N' % C['F_repos']), ('Armé', '0', '-', '%.1f N' % C['F_arme']),
          ('Emboîté', '0', '%g mm' % GARDE_EMB, '%.1f N' % C['F_arme']), ('Mi-course', '%g' % (COURSE/2), '%g mm' % (GARDE_EMB-COURSE/2), '%.1f N' % ((C['F_arme']+C['F_repos'])/2)),
          ('Fin retrait', '%g' % COURSE, '%g mm' % GARDE_FIN, '%.1f N' % C['F_repos']), ('Sur-course', '-%g' % SURCOURSE, 'libéré', '%.1f N' % C['F_sur'])]
    for i, r in enumerate(tb):
        y = 250-i*7
        for x, t in zip((300, 338, 356, 388), r): ax.text(x, y, t, fontsize=6.5, fontweight='bold' if i == 0 else 'normal', va='center')
        ax.plot([298, 407], [y-3.5, y-3.5], 'k', lw=0.3)
    pdf.savefig(fig); plt.close(fig)

if __name__ == '__main__':
    import sys
    os.makedirs(OUT, exist_ok=True)
    pages = dict(corps=p_corps, nez=p_nez, chariot=p_chariot, baton=p_baton, ens=p_ensemble, interface=p_interface, cin=p_cinematique)
    sel = sys.argv[1:] or list(pages)
    name = f'{OUT}/NazClic_plans.pdf' if not sys.argv[1:] else f'/tmp/claude-0/-home-user-Standard-Pick-Pack/71330834-d432-5fec-be1d-f94199d6e607/scratchpad/test.pdf'
    with PdfPages(name) as pdf:
        for k in sel: pages[k](pdf); print('ok', k)
