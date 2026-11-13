import os, subprocess
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Polygon, Circle, FancyArrowPatch
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_ORIENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from contenu import *
here = os.path.dirname(__file__); LIV = f'{here}/../livrables'; TMP = '/tmp/claude-0/-home-user-Standard-Pick-Pack/71330834-d432-5fec-be1d-f94199d6e607/scratchpad'
subprocess.run(['pdftoppm', '-r', '110', '-f', '5', '-l', '7', '-png', f'{LIV}/NazClic_plans.pdf', f'{TMP}/dp'], check=True)

def croquis():
    fig, axs = plt.subplots(3, 1, figsize=(8, 7.2))
    for ax in axs: ax.set_xlim(-115, 50); ax.set_ylim(-28, 22); ax.set_aspect('equal'); ax.axis('off')
    def baton(ax, x=0, plat=False):
        ax.add_patch(Rectangle((x-18, -2.5), 43, 5, fc='#bfe3c0', ec='k')); ax.add_patch(Rectangle((x+25, -7), 1.5, 14, fc='#bfe3c0', ec='k'))
        ax.add_patch(Rectangle((x+29, -4.7), 13, 9.4, fc='#e8c84a', ec='k')); ax.text(x+35, 8, 'cire', fontsize=7, ha='center')
        ax.text(x+26, -11, 'disque de garde', fontsize=7, ha='center')
    a = axs[0]; a.set_title('A - Stylo à percussion inversée (RETENU)', fontsize=10, loc='left')
    a.add_patch(Rectangle((-92, -10), 83, 20, fc='#9db8d6', ec='k')); a.add_patch(Polygon([(-9, -10), (0, -10), (0, -8), (-9, -3), (-9, 3), (0, 8), (0, 10), (-9, 10)], fc='#f2b56b', ec='k'))
    a.add_patch(Rectangle((-110, -4.5), 37, 9, fc='#c9c9c9', ec='k')); a.add_patch(Rectangle((-73, -6), 34, 9, fc='#c9c9c9', ec='k')); a.add_patch(Rectangle((-66, 5), 4, 4, fc='#e63946', ec='k'))
    for i in range(9): a.plot([-38+i*1.8, -37.1+i*1.8], [-6, 6], color='#555', lw=1.2)
    baton(a); a.text(-64, 13, 'gâchette (dent du verrou)', fontsize=7, ha='center'); a.text(-100, 8, 'poussoir\nd\'armement', fontsize=7, ha='center'); a.text(-30, -15, 'ressort', fontsize=7, ha='center'); a.text(-4, 13, 'entonnoir', fontsize=7, ha='center')
    a.add_patch(FancyArrowPatch((8, -18), (-8, -18), arrowstyle='-|>', mutation_scale=10)); a.text(0, -24, 'retrait 15 mm', fontsize=7, ha='center')
    b = axs[1]; b.set_title('B - Pistolet à levier manuel (éliminé : F1, F3)', fontsize=10, loc='left')
    b.add_patch(Rectangle((-70, -6), 60, 12, fc='#9db8d6', ec='k')); b.add_patch(Polygon([(-62, -6), (-48, -6), (-56, -27), (-70, -27)], fc='#9db8d6', ec='k'))
    b.add_patch(Polygon([(-40, -6), (-36, -6), (-30, -20), (-34, -21)], fc='#e63946', ec='k')); b.add_patch(Rectangle((-12, -4), 6, 8, fc='#c9c9c9', ec='k'))
    baton(b, 8); b.text(-27, -24, 'gâchette = levier,\neffort = arrachage', fontsize=7); b.text(-9, 8, 'fourche latérale', fontsize=7, ha='center')
    c = axs[2]; c.set_title('C - Bâtonnet plat et coulisse à tirette (éliminé : F3)', fontsize=10, loc='left')
    c.add_patch(Rectangle((-85, -8), 80, 16, fc='#9db8d6', ec='k')); c.add_patch(Rectangle((-75, 8), 12, 4, fc='#e63946', ec='k')); c.add_patch(Rectangle((-5, -2), 2, 4, fc='w', ec='k'))
    for i in range(9): c.plot([-50+i*1.8, -49.1+i*1.8], [-5, 5], color='#555', lw=1.2)
    baton(c, 8, True); c.text(-69, 15, 'bouton pouce', fontsize=7, ha='center'); c.text(-4, -14, 'fente : queue plate,\norientation imposée', fontsize=7, ha='center')
    fig.tight_layout(); fig.savefig(f'{TMP}/concepts.png', dpi=140); plt.close(fig)
croquis()
def af():
    fig, axs = plt.subplots(1, 2, figsize=(10, 4.2))
    a = axs[0]; a.axis('off'); a.set_xlim(0, 10); a.set_ylim(0, 8); a.set_title('Bête à cornes', fontsize=10)
    for (x, y, t) in ((2, 6.5, 'À qui rend-il service ?\nL\'utilisateur seul\nchez lui'), (8, 6.5, 'Sur quoi agit-il ?\nLes poils de narine pris\ndans la cire du bâtonnet'), (5, 3.6, 'NazClic\nappareil + bâtonnets')):
        a.add_patch(plt.Circle((x, y), 1.5 if y > 4 else 1.4, fc='#eaf1f8', ec='k')); a.text(x, y, t, ha='center', va='center', fontsize=7)
    a.plot([2, 5, 8], [5, 4.9, 5], 'k', lw=0.8)
    a.text(5, 1.2, 'Dans quel but ? Arracher les poils d\'un geste court, rapide et sans hésitation,\nd\'une seule main, sans miroir, sans que la cire touche l\'appareil.', ha='center', fontsize=7.5, bbox=dict(fc='#fff2cc', ec='k'))
    a.annotate('', (5, 1.9), (5, 2.2), arrowprops=dict(arrowstyle='-|>'))
    p = axs[1]; p.axis('off'); p.set_xlim(-10, 10); p.set_ylim(-8, 8); p.set_title('Diagramme pieuvre', fontsize=10)
    p.add_patch(plt.Circle((0, 0), 2.2, fc='#fff2cc', ec='k')); p.text(0, 0, 'NazClic', ha='center', va='center', fontsize=9, fontweight='bold')
    import math
    el = ['Main de\nl\'utilisateur', 'Narine et poils', 'Cire', 'Bâtonnet', 'Imprimante P2S\n(PETG, PA12)', 'Environnement\n(salle de bain, sac)', 'Nettoyage']
    fn = ['FP1 / F1, F2', 'FP1 / F5', 'FC1 / F4', 'FC2 / F3', 'FC3', 'FC4 / F2', 'FC5']
    for i, (e, n) in enumerate(zip(el, fn)):
        an = math.radians(90+i*360/7); x, y = 7*math.cos(an), 6*math.sin(an)
        p.add_patch(plt.Circle((x, y), 1.9, fc='#eaf1f8', ec='k')); p.text(x, y, e, ha='center', va='center', fontsize=6.5); p.plot([x*0.72, x*0.32], [y*0.72, y*0.36], 'k', lw=0.7); p.text(x*0.52, y*0.55, n, fontsize=6, color='#06c', ha='center')
    fig.tight_layout(); fig.savefig(f'{TMP}/af.png', dpi=140); plt.close(fig)
af()

d = Document(); st = d.styles['Normal']; st.font.name = 'Calibri'; st.font.size = Pt(10.5)
for s in d.sections: s.left_margin = s.right_margin = Cm(2); s.top_margin = s.bottom_margin = Cm(1.8)
def H(t, l=1): d.add_heading(t, l)
def Pg(t, b=False, it=False):
    p = d.add_paragraph(); r = p.add_run(t); r.bold = b; r.italic = it; return p
def Li(items):
    for t in items: d.add_paragraph(t, style='List Bullet')
def Tb(head, data, widths=None):
    t = d.add_table(rows=1, cols=len(head)); t.style = 'Light Grid Accent 1'
    for i, h in enumerate(head):
        c = t.rows[0].cells[i]; c.text = ''; r = c.paragraphs[0].add_run(h); r.bold = True; r.font.size = Pt(9)
    for row in data:
        cs = t.add_row().cells
        for i, v in enumerate(row):
            cs[i].text = ''; r = cs[i].paragraphs[0].add_run('' if v is None else str(v)); r.font.size = Pt(9)
    if widths:
        for row in t.rows:
            for i, w in enumerate(widths): row.cells[i].width = Cm(w)
    d.add_paragraph()
def Im(path, w=17): d.add_picture(path, width=Cm(w)); d.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER

d.add_heading('NazClic - Épilateur nasal à cire et bâtonnets dédiés', 0)
Pg('Dossier de conception - indice A - 13/11/2026', it=True)
H('1. Synthèse')
Pg(f'Concept retenu : appareil cylindrique en ligne (Ø {D_EXT:g} mm, {f(C["lg_arme"])} mm armé) de 3 pièces imprimées et 1 ressort du commerce, avec un bâtonnet de révolution de {f(C["lg_baton"])} mm et {f(CAD["baton"]["masse_g"])} g. '
   f'Le ressort ({f(C["F_arme"])} N armé, {f(C["F_repos"])} N en fin de course) recule le bâtonnet de {COURSE:g} mm quand on appuie sur la gâchette (≈ {f(C["F_gach"][1])} N calculés). '
   f'La cire reste à {GARDE_EMB:g} mm de l\'appareil à l\'emboîtement et à {GARDE_FIN:g} mm en fin de retrait, pour un critère de {GARDE_MIN:g} mm.')
Pg('Ce dossier est un travail de conception sur calculs et CAO. Rien n\'a été imprimé ni mesuré : toutes les performances annoncées sont des valeurs calculées, à confirmer par le plan d\'essais du chapitre 9.', b=True)
Li(['Assemblage sans outil : ressort et chariot par l\'avant, puis nez en baïonnette.',
    'Le bâtonnet usagé s\'éjecte sans le toucher : on pousse le poussoir à fond, ce qui réarme l\'appareil pour la seconde narine.',
    f'{CAD["plateau"]["nb"]} bâtonnets par plateau P2S (calcul de pavage), reliés par des pontets sécables.'])
H('2. Benchmark des produits existants')
Tb(['Produit', 'Principe', 'Défauts relevés', 'Source'], [
 ('Kits de cire nasale (Kenashii, Nad\'s, Wokaar…)', 'Cire chauffée, bâtonnet plastique à tête bulbeuse et butée, attente de 60 à 90 s (jusqu\'à 3 min), arrachage manuel d\'un coup sec.', 'Le geste d\'arrachage repose sur l\'utilisateur, qui appréhende la douleur. Des protège-moustache sont fournis, signe que la cire déborde.', 'S7, S8, S9, S11'),
 ('Recharges de bâtonnets génériques', 'Bâtonnets moulés vendus par 30 à 200, compatibles entre marques.', 'Aucun verrouillage propriétaire ; poignée courte tenue entre deux doigts.', 'S10'),
 ('Tondeuses de nez électriques', 'Coupe du poil, pas d\'arrachage.', 'Repousse rapide ; hors périmètre (pas de cire).', 'connaissance générale, non sourcée')], [3.5, 5, 6, 2.5])
Pg('Limite : je n\'ai pas pu extraire de corpus d\'avis clients vérifiés. Les plaintes sur la difficulté d\'usage seul et sur le contact de la cire avec l\'outil sont déduites des descriptifs et des titres de tests (hypothèse H15). Aucun produit trouvé n\'associe le bâtonnet à un extracteur à ressort.')
H('3. Brevets')
Pg('La recherche d\'antériorités n\'a pas abouti avec les outils disponibles : les requêtes sur Google Patents et sur la base plein texte de l\'USPTO n\'ont renvoyé aucun document pertinent, et Espacenet n\'a pas pu être interrogé. Aucun numéro de brevet n\'est donc cité ici, et la liberté d\'exploitation n\'est PAS établie.', b=True)
Li(['Classes à balayer avant toute vente : CPC A45D 26/00 (appareils d\'épilation) et A61B 17/50 (instruments d\'épilation) ; classe américaine 606, sous-classe « hair removal involving waxes or adhesives » (S12).',
    'Mots-clés : nose / nasal hair, wax applicator, spring-loaded, trigger, collet, detachable handle.',
    'Appréciation du risque, sans valeur juridique : les briques employées (mâchoires élastiques sur gorge, ressort et verrou à lame, entonnoir de centrage) sont des solutions mécaniques anciennes. Le risque porte sur la combinaison « applicateur de cire nasale + extracteur à ressort », à vérifier par un conseil en propriété industrielle.'])
H('4. Analyse fonctionnelle et cahier des charges')
Im(f'{TMP}/af.png', 16)
Li(['FP1 : arracher les poils de narine pris dans la cire, d\'une main (F1, F2, F5).', 'FC1 : ne jamais mettre la cire en contact avec l\'appareil (F4).', 'FC2 : recevoir le bâtonnet à l\'aveugle et n\'accepter que lui (F3).',
    'FC3 : être imprimable sur P2S en PETG ou PA12, bâtonnets en série.', 'FC4 : ne pas s\'armer ni se déclencher seul (F2).', 'FC5 : se démonter sans outil pour le nettoyage.'])
H('Données anthropométriques et ergonomiques', 2)
Tb(['Donnée', 'Valeur', 'Source'], [('Largeur du plancher de la narine (moyenne)', '11,0 mm', 'S1'), ('Longueur de main, femme 5e à homme 95e percentile', '165 à 211 mm', 'S5'), ('Largeur de main, femme 5e à homme 95e percentile', '70 à 100 mm', 'S6'),
   ('Bouton au doigt : effort / course / diamètre mini', '2,8 à 11 N / 2 à 6 mm / 10 mm', 'S3'), ('Bouton au pouce ou à la paume : effort', '2,8 à 23 N', 'S3'), ('Pince pouce-doigt, effort bref, homme 5e percentile', '60 N', 'S4'), ('Force d\'épilation d\'un cheveu', '0,48 à 0,94 N', 'S2')], [8.5, 5, 3.5])
Pg(f'Conséquences : tête du bâtonnet Ø {TETE_D:g} mm (≈ {TETE_D+2*CIRE_EP:g} mm cirée) et disque Ø {DISQ_D:g} mm, plus large que la narine, qui sert de butée. Deux écarts à la norme sont assumés et à valider : la course de gâchette ({f(C["g_course"])} mm pour 2 mm mini) et la fenêtre de gâchette ({F1_Y:g} × {F1_X[1]-F1_X[0]:g} mm pour Ø 10 mm mini).')
H('Cahier des charges fonctionnel', 2)
Tb(['Fn', 'Intitulé', 'Critère', 'Niveau', 'Flex.', 'Vérif.'], CDC, [1, 3.6, 5.2, 4.6, 1.1, 1.3])
Pg('F0 : éliminatoire ; F1 : peu négociable ; F2 : négociable.', it=True)
H('5. Trois concepts')
Im(f'{TMP}/concepts.png', 15)
for c in CONCEPTS:
    H(c['nom'], 2); Pg(c['principe'])
    Tb(['Pièces', 'Coût', 'Impression', 'Risques'], [(c['pieces'], c['cout'], c['impression'], c['risques'])], [3, 3.5, 4.5, 6])
    Li(c['f15']); Pg('Scénario d\'une main, sans miroir : ' + c['scenario'])
H('6. Matrice de décision et choix')
tot = [sum(p*c['notes'][i] for i, (_, p) in enumerate(CRIT)) for c in CONCEPTS]
Tb(['Critère', 'Poids', 'A', 'B', 'C'], [(cr, p, *[c['notes'][i] for c in CONCEPTS]) for i, (cr, p) in enumerate(CRIT)] + [('Total pondéré (sur 500)', 100, *tot), ('Critère éliminatoire non tenu', '', *[c['elim'] or 'aucun' for c in CONCEPTS])], [6, 1.5, 3, 3.2, 3.3])
Pg(f'Choix : concept A ({tot[0]} points). B est éliminé parce que sa gâchette transmet tout l\'effort d\'arrachage et qu\'il laisse la vitesse à l\'utilisateur ; C parce que sa queue plate impose une orientation qu\'on ne peut pas sentir à l\'aveugle. '
   'A est le seul à tenir F1 à F5. Son point faible est le coût du bâtonnet : l\'impression debout est plus lente que celle du concept C et plus fragile en flexion. C\'est le prix de la symétrie de révolution exigée par F3.')
H('7. Conception du concept retenu')
H('Architecture', 2)
Tb(['Rep.', 'Pièce', 'Matière', 'Masse', 'Rôle'], [
 ('1', 'Corps', 'PETG', f'{f(CAD["corps"]["masse_g"])} g', 'Poignée, alésage du ressort, canal de guidage, fenêtres F1 (gâchette) et F2 (repos), butée de fin de course.'),
 ('2', 'Nez', 'PETG', f'{f(CAD["nez"]["masse_g"])} g', 'Entonnoir de centrage, lèvre d\'éjection, appui avant du ressort, baïonnette.'),
 ('3', 'Chariot', 'PA12 (PETG au proto 1)', f'{f(CAD["chariot"]["masse_g"])} g', 'Monobloc : mâchoires, collerette, lame de verrou avec dent, poussoir.'),
 ('4', 'Ressort', 'acier EN 10270-1 SH', '≈ 2 g', f'fil {R_D:g}, De {R_DM+R_D:g}, L0 {R_L0:g}, {R_N:g} spires utiles, {f(C["k"], 2)} N/mm.'),
 ('5', 'Bâtonnet', 'PETG', f'{f(CAD["baton"]["masse_g"])} g', 'Consommable de révolution : queue à gorge, fût, disque de garde, tête rainurée.')], [1, 2.2, 3, 1.6, 9.2])
Pg('Pièces supprimées en cours d\'étude : la gâchette séparée (la dent du chariot est poussée directement à travers la fenêtre), le ressort de gâchette (la lame fait ressort), le bouton d\'armement (le chariot dépasse du fond), l\'éjecteur (la lèvre du nez écarte les mâchoires en sur-course) et le manchon de verrouillage des mâchoires (bras placés sous la ligne d\'effort, donc auto-serrants).')
Im(f'{TMP}/dp-5.png'); Im(f'{TMP}/dp-7.png')
H('Enclenchement (F2)', 2)
Li([f'Armement : on pousse le poussoir de {COURSE:g} mm ({f(C["F_armement"])} N en fin de course). La dent passe sous la barre et remonte dans la fenêtre F1 : clic.',
    f'Verrou auto-serrant : la lame travaille en compression et l\'effort du ressort tend à relever la dent, pas à la chasser. Même avec un frottement de {MU[0]:g}, il faut encore {f(C["F_gach"][0])} N pour déclencher.',
    f'Protection : la dent affleure un méplat situé {D_EXT/2-Z_PLAT:g} mm sous le diamètre extérieur ; une surface plane ne peut pas l\'atteindre.',
    'Au repos, la dent est détendue dans la fenêtre F2 : la lame n\'est fléchie que pendant les transits, ce qui limite le fluage. F2 sert aussi de témoin d\'état.',
    'Un tir à vide est sans danger (aucune pièce ne sort de l\'appareil).'])
H('Interface à l\'aveugle (F3)', 2)
Im(f'{TMP}/dp-6.png')
H('8. Calculs détaillés')
H('8.1 Course et effort de retrait (F5)', 2)
Pg(f'Course minimale : 4 mm d\'implantation (H4) + 5 mm d\'étirement des tissus (H5) + 1 mm de jeu des crochets + 1 mm d\'étirement de la cire = {C["course_min"]} mm. Course retenue : {COURSE:g} mm (marge 1,35). '
   f'Effort d\'arrachage estimé : {N_POILS} poils × {F_POIL:g} N × {SIMULT:g} = {f(C["F_poils"])} N (H1 à H3). C\'est le chiffre le moins sûr du dossier : la force par poil vient de mesures sur cheveux (S2), le nombre de poils est une estimation.')
H('8.2 Ressort', 2)
Pg(f'k = G·d⁴ / (8·D³·n) = {R_G:g} × {R_D:g}⁴ / (8 × {R_DM:g}³ × {R_N:g}) = {f(C["k"], 3)} N/mm. Longueurs : libre {R_L0:g}, repos {f(C["L_repos"])}, armé {f(C["L_arme"])}, sur-course {f(C["L_sur"])}, spires jointives {f(C["L_bloc"])} mm. '
   f'Efforts : {f(C["F_repos"])} N au repos, {f(C["F_arme"])} N armé, {f(C["F_sur"])} N en sur-course. Contrainte maxi {C["tau_max"]:.0f} MPa (admissible ≈ 1000 MPa). Énergie restituée : {C["E_ressort"]*1000:.0f} mJ. '
   f'L\'effort armé vaut {f(C["F_arme"]/C["F_poils"], 2)} fois l\'arrachage estimé ; en fin de course la marge tombe à {f(C["F_repos"]/C["F_poils"], 2)}. Si l\'essai E5 montre un retrait incomplet, passer à un fil de 1,1 mm sans rien changer d\'autre.')
Pg('Référence type : ressort de compression de catalogue (Gutekunst série D, Vanel, Lee Spring) répondant à cette spécification. La référence exacte n\'a pas pu être vérifiée en ligne (H13) ; les cotes d\'encombrement sont des variables du modèle.')
H('8.3 Gâchette (F1)', 2)
Pg(f'Effort = flexion de la lame ({f(C["g_k"], 2)} N/mm × {f(C["g_course"])} mm) + effet auto-serrant (1,5 × F × e / L, avec e = {f(C["g_e"])} mm et L = {f(C["g_L"])} mm) + frottement corrigé de la dépouille de {ANG_DEP:g}° : F × (µ − tan α) / (1 + µ·tan α). '
   f'Résultat : {f(C["F_gach"][0])} N / {f(C["F_gach"][1])} N / {f(C["F_gach"][2])} N pour µ = {MU[0]:g} / {MU[1]:g} / {MU[2]:g}. La gâchette pousse directement la dent : rapport de levier 1, course {f(C["g_course"])} mm. '
   f'Le haut de la plage dépasse la cible de 8 N : l\'angle de dépouille est le paramètre de réglage (imprimer des corps à 8°, 12° et 16°). Déformation de la lame : {f(C["g_eps"], 2)} %.')
H('8.4 Armement et éjection', 2)
Pg(f'Armement : {f(C["F_armement"])} N, à la limite des 23 N admis au pouce (S3) ; pression sur le pouce {f(C["p_pouce"], 2)} MPa. Éjection en sur-course : {f(C["F_ejection"])} N, au-delà de la limite : elle se fait poussoir appuyé contre une surface ou dans la paume. C\'est une faiblesse ergonomique assumée.')
H('8.5 Emboîtement (F3) et efforts sur le bâtonnet', 2)
Pg(f'Capture radiale : (Ø {ENT_D:g} − Ø {Q_D:g}) / 2 = ± {f(C["tol_radiale"])} mm ; cône de demi-angle {ENT_ANG:g}°, profondeur {f(C["prof_ent"], 2)} mm. Désalignement angulaire géométrique {f(C["tol_ang"])}°, annoncé ± 10°. '
   f'Mâchoires : bras de {f(C["m_L"])} mm, ouverture {f(C["m_ouv"])} mm, effort {f(C["m_P"], 2)} N par bras, déformation {f(C["m_eps"], 2)} %. Insertion : {f(C["F_insert"])} N (maxi {f(C["F_insert_max"])} N), assez faible pour ne pas enfoncer le bâtonnet dans la narine. '
   f'Retenue positive : {C["F_ret_matage"]:.0f} N au matage des crochets, {C["F_ret_gorge"]:.0f} N en traction de la gorge. Extraction : nulle en sur-course, impossible autrement (voulu).')
H('8.6 Distance de garde (F4)', 2)
Pg(f'Garde mini exigée : {GARDE_MIN:g} mm = 5 mm de fils et coulures (H6) + 3 mm de marge. La zone potentiellement cirée est tout ce qui se trouve en avant de la face arrière du disque. Contrôle CAO : intersection (zone de garde ∩ appareil) = 0 mm³ sur 8 positions de la course ; intersections entre pièces = 0 mm³.')
Tb(['Position', 'Recul (mm)', 'Garde (mm)', 'Verdict'], [(p, f(s), f(g) if g is not None else 'sans objet', ('conforme' if g is None or g >= GARDE_MIN else 'NON')) for p, s, g in POS], [8, 2.5, 3, 3])
H('8.7 Bâtonnet : résistance, cire, impression', 2)
Pg(f'Traction : gorge Ø {G_D:g} → {C["F_ret_gorge"]:.0f} N avec {SIG_Z:g} MPa inter-couches (H8), soit plus de 10 fois l\'effort du ressort. Flexion : {f(C["F_flex_lat"])} N appliqués en tête suffisent à rompre la queue au col. C\'est le point faible du bâtonnet imprimé debout. '
   f'Cire : surface {CAD["cire"]["surface_mm2"]:.0f} mm², volume {CAD["cire"]["volume_mm3"]:.0f} mm³ pour {CIRE_EP:g} mm d\'épaisseur. Coût matière : {f(CAD["baton"]["masse_g"]*PRIX_KG/1000, 3)} € (H12). '
   f'Plateau : {CAD["plateau"]["nb"]} bâtonnets au pas de {CAD["plateau"]["pas"]:g} mm, {CAD["plateau"]["masse_g"]:.0f} g de PETG, hauteur {CAD["plateau"]["hauteur"]:g} mm. Durée d\'impression non calculée.')
H('8.8 Jeux, épaisseurs, butée', 2)
Pg(f'Jeux : {JEU:g} mm par face sur le chariot dans le canal ({CH_EP:g} dans {CAN_Y:g}, {2*COL_Z:g} dans {CAN_Z:g}), 0,2 mm au rayon sur l\'emboîtement du nez, 0,4 mm au rayon sur la queue dans le col. Paroi du corps {f((D_EXT-ALES_D)/2)} mm. '
   f'Butée de fin de course : {C["A_butee"]:g} mm². En tir à vide, la contrainte dynamique estimée atteint {C["sig_butee"]:.0f} MPa, au-dessus de la limite du PETG : matage probable à la longue. Suivi par l\'essai E7.3 ; parade prévue : chariot en PA12, puis fente amortisseuse dans le bloc de butée.')
H('9. Plan d\'essais')
Tb(['N°', 'Essai', 'Grandeur', 'Unité', 'Mini', 'Maxi'], [e[:6] for e in ESSAIS], [1.2, 3.6, 8, 1.3, 1.3, 1.3])
Pg('Les méthodes et la feuille de saisie avec verdict automatique sont dans le classeur Excel.')
H('10. Registre des hypothèses')
Tb(['N°', 'Hypothèse', 'Valeur', 'Unité', 'Justification / levée'], HYP, [1, 5, 2.3, 1.3, 7.4])
H('11. Critique du dossier')
Li(['Aucune pièce n\'a été imprimée : les jeux, l\'effort de gâchette et la tenue des lames sont des calculs.',
    'L\'effort d\'arrachage réel est inconnu ; le ressort est dimensionné sur une estimation avec une marge de 2 en début de course et de 1 en fin de course.',
    'La gâchette est une dent de 6 mm poussée au fond d\'une fenêtre de 9 × 8 mm : son accessibilité pour une grosse pulpe n\'est pas démontrée (H16).',
    'L\'éjection demande 25 N, trop pour un pouce seul.', 'Le bâtonnet imprimé debout casse en flexion vers 7 N.', 'La recherche de brevets n\'a pas abouti ; le benchmark ne s\'appuie pas sur des avis clients vérifiés.',
    'Le modèle ne comporte ni congés ni chanfreins de confort ; à ajouter après validation fonctionnelle.'])
H('12. Sources')
for k, v in SRC.items(): d.add_paragraph(f'{k} - {v}')
out = f'{LIV}/NazClic_dossier_conception.docx'; d.save(out); print(out)
