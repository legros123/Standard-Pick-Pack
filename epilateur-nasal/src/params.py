"""NazClic - parametres uniques (mm, N, MPa). Toute cote des plans/calculs vient d'ici.
Axe appareil = X ; x=0 = face avant du nez ; l'appareil s'etend vers x<0 ; le visage est en x>0.
Coordonnees chariot/batonnet donnees en position ARMEE (s=0). Tir : s=COURSE (recul -X)."""
import math
# ---------------- F4 / F5 : cotes directrices ----------------
COURSE      = 15.0   # F5 course de retrait
GARDE_MIN   = 8.0    # F4 garde mini exigee cire/appareil (critere)
GARDE_FIN   = 10.0   # F4 garde nominale en fin de retrait
GARDE_EMB   = GARDE_FIN + COURSE   # garde a l'emboitement (25)
SURCOURSE   = 2.5    # sur-course d'ejection du poussoir
JEU         = 0.2    # jeu d'impression radial/lateral standard
# ---------------- Ressort (commerce) ----------------
R_D, R_DM, R_N, R_L0 = 1.0, 11.0, 11.0, 46.5   # fil, diam moyen, spires utiles, longueur libre
R_G = 81500.0                                   # module cisaillement acier ressort EN 10270-1 SH
R_LA = 16.5                                     # longueur ressort arme
# ---------------- Nez (entonnoir) ----------------
D_EXT    = 20.0      # diametre exterieur appareil
ENT_D    = 16.0      # diametre d'entree de l'entonnoir (F3)
ENT_ANG  = 30.0      # demi-angle du cone (deg)
GORGE_D  = 5.8       # diametre du col (levre)
X_LEVRE  = -11.5     # extremite arriere de la levre d'ejection
LEVRE_RE = 3.3       # rayon ext. de la levre a son extremite
LEVRE_RB = 4.3       # rayon ext. de la levre a sa base
X_CH_AV  = -10.0     # paroi avant de la chambre des machoires
CH_D     = 11.2      # diametre chambre des machoires
X_CH_AR  = -21.0     # fin de chambre
SIEGE_D  = 10.0      # trou de la levre d'appui ressort
X_SIEGE  = -22.5     # face d'appui avant du ressort
X_EPAUL  = -9.0      # epaulement du nez
EMB_D    = 13.4      # diametre de l'emboitement (queue du nez)
ERGOT_R, ERGOT_L, ERGOT_H = 8.6, 3.0, 2.5      # ergots baionnette (rayon, largeur, hauteur axiale)
X_ERGOT  = -13.4     # face avant des ergots
# ---------------- Corps ----------------
X_CORPS_AV = -9.5
ALES_D   = 13.8      # alesage zone ressort
X_ALES   = -57.5     # fin d'alesage rond / debut du canal
CAN_Y, CAN_Z = 6.4, 12.4   # canal rectangulaire de guidage (largeur y, hauteur z)
X_FOND   = -88.0     # face interieure du fond (butee de fin de course)
EP_FOND  = 4.0
X_CORPS_AR = X_FOND - EP_FOND
FENTE_Y, FENTE_Z = 6.4, 9.4    # fente du poussoir dans le fond
Z_PLAT   = 7.4       # meplat de gachette (cote z)
X_PLAT   = (-86.0, -56.0)
X_BARRE  = -66.0     # face avant de la barre de verrou (pied)
ANG_DEP  = 12.0      # angle de depouille du verrou (reglage effort gachette)
F1_X     = (-66.0, -58.0)   # fenetre gachette (ARME)
F1_Y     = 9.0
F2_X     = (-84.5, -75.5)   # fenetre repos / temoin
F2_Y     = 6.6
BAIO_ANG = 45.0      # rotation de verrouillage du nez
BAIO_CRAN = 0.4      # cran anti-devissage
# ---------------- Chariot (profil 2.5D, epaisseur y) ----------------
CH_EP    = 6.0
X_BEC    = -12.5     # extremite avant des machoires (arme)
BEC_ZE   = 3.8       # demi-largeur ext. des tetes
BEC_ZO   = 3.4       # demi-ouverture a l'entree
POCHE_Z  = 2.7       # demi-largeur de la poche (queue D5 + jeu)
CROCH_Z  = 1.9       # demi-ecartement des crochets
RAMPE_ANG = 35.0     # rampe d'entree des crochets
X_CROCH  = -15.2     # face d'accrochage (perpendiculaire -> retenue positive)
X_POCHE  = -19.5     # fond de poche
X_TETE   = -20.5     # arriere des tetes
BRAS_ZI, BRAS_ZE = 0.6, 2.5    # bras flexibles des machoires (z int / ext)
X_COL    = X_SIEGE - R_LA      # face avant collerette = appui ressort (-39)
COL_EP, COL_Z = 3.0, 6.0
LAME_Z   = (4.6, 6.0)          # lame du verrou (z bas, z haut)
DENT_X   = (-65.95, -62.0)     # dent du verrou (pied arriere, pied avant)
DENT_Z   = 7.7                 # sommet de dent
DENT_PLAT = 1.0                # plat au sommet
X_LAME_FIN = -68.0
BARRE_Z  = (-6.0, 2.6)         # barre principale sous la lame
X_BLOC   = -69.5               # debut du bloc pleine hauteur
X_BUTEE  = X_FOND + COURSE     # epaulement de butee (arme) = -73
POUS_Z   = 4.5                 # demi-hauteur du poussoir
X_POUS   = -95.5               # extremite poussoir (arme)
# ---------------- Batonnet (revolution) ----------------
Q_D      = 5.0       # diametre de queue
G_D      = 3.4       # diametre fond de gorge
X_QFIN   = -18.2     # extremite de queue (arme, emboite)
X_GORGE  = (-15.2, -13.9, -13.1)   # paroi d'accrochage, fin de fond, fin de chanfrein 45
X_FUT    = (7.0, 21.0)             # debut/fin du fut conique
FUT_D    = 6.0
X_DISQ   = GARDE_EMB               # face arriere du disque de garde (+25)
DISQ_D, DISQ_EP = 14.0, 1.2
LIP_H, LIP_E = 0.8, 0.8            # rebord anti-coulure
COU_D, COU_L = 4.5, 3.3
TETE_D, TETE_L = 6.0, 12.0
RAIN_D, RAIN_L = 4.8, 1.2          # rainures d'accroche cire (x3)
CIRE_EP  = 1.75                    # epaisseur nominale de cire
# ---------------- Materiaux / hypotheses de calcul ----------------
E_PETG, E_PA12 = 2000.0, 1600.0    # MPa (H7)
SIG_Z    = 25.0      # MPa resistance inter-couches PETG (H8)
RHO_PETG = 1.27e-3   # g/mm3
MU = (0.15, 0.30, 0.45)            # frottement plastique/plastique mini/nominal/maxi (H9)
N_POILS, F_POIL, SIMULT = 40, 0.5, 0.5   # H1-H3
PRIX_KG = 20.0       # EUR/kg PETG (H12)

def calc():
    c = {}
    k = R_G * R_D**4 / (8 * R_DM**3 * R_N); c['k'] = k
    c['L_bloc'] = (R_N + 2) * R_D
    c['L_arme'], c['L_repos'], c['L_sur'] = R_LA, R_LA + COURSE, R_LA - SURCOURSE
    c['F_arme'] = k * (R_L0 - c['L_arme']); c['F_repos'] = k * (R_L0 - c['L_repos']); c['F_sur'] = k * (R_L0 - c['L_sur'])
    C = R_DM / R_D; K = (4*C-1)/(4*C-4) + 0.615/C
    c['tau_max'] = 8 * c['F_sur'] * R_DM * K / (math.pi * R_D**3)
    c['E_ressort'] = 0.5 * (c['F_arme'] + c['F_repos']) * COURSE / 1000  # J
    c['F_poils'] = N_POILS * F_POIL * SIMULT
    c['course_min'] = 4 + 5 + 1 + 1
    # machoires : bras L, bras de levier a jusqu'au crochet
    L = X_TETE - X_COL; a = (X_CROCH + 0.3) - X_TETE; h = BRAS_ZE - BRAS_ZI
    I = CH_EP * h**3 / 12; d = Q_D/2 - CROCH_Z
    P = d * E_PETG * I / (L**3/3 + a*L**2 + a*a*L)
    c.update(m_L=L, m_a=a, m_ouv=d, m_P=P, m_eps=P*(L+a)*(h/2)/I/E_PETG*100)
    t = math.tan(math.radians(RAMPE_ANG)); mu = MU[1]
    c['F_insert'] = 2*P*(t+mu)/(1-mu*t)
    c['F_insert_max'] = 2*P*(t+MU[2])/(1-MU[2]*t)
    # retenue positive : matage crochets / traction gorge / cisaillement
    corde = 2*math.sqrt((Q_D/2)**2 - CROCH_Z**2)
    c['F_ret_matage'] = 2 * (2/3*corde*d) * 40
    c['F_ret_gorge'] = math.pi/4*G_D**2 * SIG_Z
    c['F_flex_lat'] = SIG_Z * math.pi*Q_D**3/32 / (X_DISQ + COU_L + DISQ_EP + TETE_L/2 - (-8.83))
    # gachette
    Lg = -42.0 - sum(DENT_X)/2 if False else (X_COL-COL_EP) - sum(DENT_X)/2
    hg = LAME_Z[1]-LAME_Z[0]; Ig = CH_EP*hg**3/12
    kg = 3*E_PETG*Ig/Lg**3; cg = DENT_Z - CAN_Z/2
    e = (CAN_Z/2 + Z_PLAT)/2 - sum(LAME_Z)/2
    ta = math.tan(math.radians(ANG_DEP))
    c.update(g_L=Lg, g_k=kg, g_course=cg, g_eps=1.5*cg*hg/Lg**2*100, g_e=e)
    c['F_gach'] = [kg*cg + 1.5*c['F_arme']*e/Lg + c['F_arme']*(m-ta)/(1+m*ta) for m in MU]
    c['F_armement'] = c['F_arme'] + kg*cg*(math.tan(math.radians(33))+mu)/(1-mu*math.tan(math.radians(33)))
    c['F_ejection'] = c['F_sur'] + c['F_insert']
    # F3
    c['tol_radiale'] = (ENT_D - Q_D)/2
    c['prof_ent'] = (ENT_D - GORGE_D)/2/math.tan(math.radians(ENT_ANG))
    c['tol_ang'] = math.degrees(math.atan((GORGE_D-Q_D)/(c['prof_ent']+X_LEVRE)*-1)) if False else math.degrees(math.atan((GORGE_D-Q_D)/(-X_LEVRE-c['prof_ent'])))
    # butee tir a vide
    A_but = 2*(CAN_Z/2-0.2 - FENTE_Z/2)*CH_EP; c['A_butee'] = A_but
    kc = E_PETG*CH_EP*9/40; c['sig_butee'] = math.sqrt(2*c['E_ressort']*1000*kc)/A_but
    c['p_pouce'] = c['F_arme']/(CH_EP*2*POUS_Z)
    c['lg_baton'] = X_DISQ + DISQ_EP + COU_L + TETE_L - X_QFIN
    c['lg_repos'] = -(X_POUS - COURSE); c['lg_arme'] = -X_POUS
    return c
if __name__ == '__main__':
    for k_, v in calc().items(): print(k_, [round(x,2) for x in v] if isinstance(v, list) else round(v, 3))
