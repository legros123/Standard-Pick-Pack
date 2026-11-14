import os
from docx import Document
from docx.shared import Pt, Cm
d = Document(); d.styles['Normal'].font.name = 'Calibri'; d.styles['Normal'].font.size = Pt(10.5)
for s in d.sections: s.left_margin = s.right_margin = Cm(1.8); s.top_margin = s.bottom_margin = Cm(1.6)
H = lambda t, l=1: d.add_heading(t, l)
def P(t, b=False):
    r = d.add_paragraph().add_run(t); r.bold = b
def L(items):
    for t in items: d.add_paragraph(t, style='List Bullet')
def T(head, rows):
    t = d.add_table(rows=1, cols=len(head)); t.style = 'Light Grid Accent 1'
    for i, h in enumerate(head):
        c = t.rows[0].cells[i]; c.text = ''; r = c.paragraphs[0].add_run(h); r.bold = True; r.font.size = Pt(9)
    for row in rows:
        cs = t.add_row().cells
        for i, v in enumerate(row): cs[i].text = ''; cs[i].paragraphs[0].add_run(str(v)).font.size = Pt(9)
    d.add_paragraph()

d.add_heading('NazClic - Analyse de marché', 0)
P('Épilateur nasal à cire à ressort, bâtonnets dédiés - France puis UE - prix testé : 39,90 € TTC - 14/11/2026')
H('Verdict en une page')
P('PIVOT. Pas de lancement à 39,90 € en publicité Meta/TikTok dans la configuration actuelle.', True)
L(['Prix : 39,90 € représente 2,3 fois le leader de la cire nasale (Kenashii, 16,99 €) et 3 fois la tondeuse la plus vendue (Philips NT3650, 13,19 €). Aucun concurrent direct relevé ne dépasse 19,95 €, chauffe-cire inclus [S1, S2].',
   'Rentabilité : marge sur coûts variables d\'environ 20 € par commande (ESTIMATION) pour un coût d\'acquisition médian de 17 € sur TikTok et 34 € sur Meta en beauté [S8, S9]. Le rapport valeur client / coût d\'acquisition sort entre 0,6 et 1,3 alors qu\'il en faut 3.',
   'Récurrence : un utilisateur consomme environ 26 bâtonnets par an (ESTIMATION), soit au mieux un pack de recharge à 11 € HT. Le consommable ne finance pas l\'acquisition.',
   'Deux réserves s\'ajoutent : le produit n\'a pas encore été imprimé ni essayé, et je n\'ai pas pu lire les avis 1 à 3 étoiles des concurrents (accès bloqué). Le chapitre « voix client » repose donc sur des hypothèses.'])
H('1. Taille du marché')
T(['Marché', 'Valeur', 'Croissance', 'Source'], [
 ('Soin masculin, Europe', '22,5 Md$ en 2024 ; 23,6 Md$ en 2025', '≈ 5 % par an (2024 → 2025)', 'Fortune Business Insights, 2026 [S3]'),
 ('Soin masculin, monde (périmètre large)', '298,9 Md$ en 2025, Europe 25,3 %', 'France : 7,7 % par an 2026-2033', 'Grand View Research, 2026 [S4]'),
 ('Cire d\'épilation, monde', '12,3 à 15,9 Md$ selon l\'institut', '4,9 à 6 % par an', 'GM Insights 2026, Straits Research 2026, Fact.MR [S5]'),
 ('Tondeuses électriques, monde / Europe', '6,1 Md$ / 1,84 Md$ en 2024', '3,1 % par an 2025-2030', 'Grand View Research 2025, Cognitive Market Research [S6]')])
P('Les deux instituts divergent d\'un facteur 3 sur l\'Europe (périmètres différents) : ces chiffres donnent un ordre de grandeur du secteur, pas du segment. Aucune étude fiable n\'isole le nez et les oreilles ; le segment est donc estimé à partir des ventes observées.')
T(['Niveau', 'Périmètre', 'Valeur annuelle', 'Calcul (ESTIMATION)'], [
 ('Signal observé', 'Amazon.fr, première page', 'Cire nez ≥ 450 unités/mois ; tondeuses nez ≥ 3 800 unités/mois', 'Somme des mentions « plus de X achetés le mois dernier » relevées le 14/11/2026 [S1, S2]. Ce sont des planchers.'),
 ('TAM', 'UE, épilation nez/oreilles, toutes méthodes', '25 à 45 M€', 'France 4 à 7 M€ (tondeuses 3 800 × 16 € × 12 ≈ 0,73 M€ sur la première page, multiplié par 5 à 9 pour la longue traîne et les magasins, plus la cire), puis × 6,6 au prorata de la population UE/France.'),
 ('SAM', 'France, vente en ligne, cire nasale + utilisateurs de tondeuse convertibles', '≈ 1 M€', 'Cire nez France 0,3 à 0,8 M€ (450 à 1 000 unités/mois × 12 € × 12, × 2 à 3 hors première page et hors Amazon) + 10 % de la dépense tondeuses.'),
 ('SOM 12 mois', 'Votre marque', '45 à 110 k€ HT', '1 000 à 2 500 appareils à 33,25 € HT + recharges ; suppose 20 à 50 k€ de publicité à un coût d\'acquisition de 20 €.')])
P('Lecture franche : la cire nasale est une micro-niche. Sur Amazon.fr elle pèse environ un huitième des tondeuses de nez en unités.')
H('2. Concurrence')
P('Relevé Amazon.fr du 14/11/2026 [S1, S2]. Les volumes d\'avis Amazon sont souvent mutualisés entre pays. Prix par séance = prix du kit / nombre de séances (2 applicateurs par séance).')
T(['#', 'Produit', 'Type', 'Prix', 'Consommable', 'Note', 'Avis', 'Achats / mois'], [
 (1, 'Kenashii Nose Wax Kit, 100 g, 24 applicateurs', 'direct', '16,99 €', '1,42 € / séance (rachat du kit)', '4,2', '23 800', 'non affiché'),
 (2, 'Kit sans marque, 50 g, 20 applicateurs', 'direct', '11,99 €', '1,20 € / séance', '4,2', '4 400', '200+'),
 (3, 'Kit sans marque, 100 g, 20 + 10 applicateurs', 'direct', '11,99 €', '0,80 € / séance', '4,2', '3 500', '50+'),
 (4, 'Kit avec mini chauffe-cire USB, 100 g', 'direct', '19,95 €', '≈ 2 € / séance', '4,2', '1 000', '100+'),
 (5, 'Bâtonnets pré-cirés « Épilation Nez Homme », 14 pièces', 'direct', '13,99 €', '2,00 € / séance', '4,0', '188', '100+'),
 (6, 'Bâtonnets pré-cirés, 16 pièces, 2 tailles', 'direct', '11,99 €', '1,50 € / séance', '3,6', '67', 'non affiché'),
 (7, 'Kit 50 g, 30 applicateurs', 'direct', '10,99 €', '0,73 € / séance', '3,4', '12', 'non affiché'),
 (8, 'Nad\'s Nose Wax', 'direct', '8,99 £ chez Boots (prix daté, ≈ 2021)', 'rachat du kit', 'non relevé', 'non relevé', 'non relevé'),
 (9, 'Philips NT3650/16', 'indirect', '13,19 €', 'pile', '4,0', '60 600', '1 000+'),
 (10, 'Philips NT5650/16', 'indirect', '16,99 €', 'pile', '4,1', '16 500', '300+'),
 (11, 'Panasonic à pile (modèle d\'entrée)', 'indirect', '16,50 €', 'pile', '4,2', '56 100', '200+'),
 (12, 'Panasonic ER-GN300', 'indirect', '33,49 €', 'pile', '4,3', '7 800', '200+'),
 (13, 'Brigin USB rechargeable', 'indirect', '19,99 €', 'aucun', '4,4', '10 700', '900+'),
 (14, 'Philips OneBlade, embout nez QI100/50', 'indirect', '9,99 €', 'embout', '4,3', '536', '1 000+')])
P('Gigi n\'apparaît pas dans le relevé Amazon.fr ; je n\'ai pas de données vérifiées sur cette marque. Canal : tous ces produits se vendent d\'abord sur Amazon, par la recherche ; aucun acteur de la cire nasale n\'a de marque forte en France hors Kenashii.')
H('3. Voix client')
P('Je n\'ai pas pu analyser les avis 1 à 3 étoiles : les pages d\'avis Amazon exigent une connexion et les autres tentatives ont été bloquées. La liste ci-dessous est une série d\'HYPOTHÈSES tirées des notes et des promesses des fiches (un kit qui promet « température stable » ou fournit des « pochoirs moustache » répond à une plainte connue). À confirmer en lisant 200 avis à la main.', True)
T(['#', 'Frustration probable', 'Indice', 'NazClic la règle ?'], [
 (1, 'Peur de tirer, hésitation au moment du geste', 'tests vidéo ; principe même du kit', 'OUI (gâchette, ressort)'),
 (2, 'Difficile à faire seul, geste à deux mains ou devant un miroir', 'principe du kit', 'OUI (une main, à l\'aveugle)'),
 (3, 'On touche le bâtonnet usagé', 'principe du kit', 'OUI (éjection)'),
 (4, 'Cire qui coule sur la moustache ou la lèvre', 'pochoirs moustache fournis partout', 'EN PARTIE (disque de garde)'),
 (5, 'Douleur', 'tous promettent « sans douleur »', 'NON (peut-être moins d\'appréhension)'),
 (6, 'Cire trop chaude ou mal fondue', 'chauffe-cire « température stable »', 'NON'),
 (7, 'Poils restants, la cire n\'accroche pas', 'notes de 3,4 à 3,6 sur les bâtonnets pré-cirés', 'NON (dépend de la cire)'),
 (8, 'Préparation longue : chauffe, attente de 60 à 90 s', 'modes d\'emploi', 'NON'),
 (9, 'Applicateur qui casse ou tête qui se détache', 'promesse « pointe sûre »', 'NON, risque aggravé avec un bâtonnet imprimé'),
 (10, 'Résidus de cire dans la narine', 'lingettes fournies par Kenashii', 'NON')])
P('Bilan : 3 frustrations réglées et 1 en partie sur 10. Les plus citées dans ce type de produit (douleur, cire, résultat) dépendent de la cire, pas de l\'appareil.')
H('4. Cibles')
P('Personas construits par hypothèse, sans étude quantitative.')
T(['Persona', 'Âge, sexe', 'Motivation', 'Déclencheur d\'achat', 'Prix acceptable (ESTIMATION)'], [
 ('Marc, le déçu de la tondeuse', '38-55 ans, homme', 'Poils visibles, repousse en quelques jours', 'Vidéo de démonstration, remarque d\'un proche', '20 à 30 €'),
 ('Yanis, le soigné', '22-32 ans, homme', 'Routine barbe et visage, culture du barbier', 'Vidéo « satisfaisante » sur TikTok', '15 à 25 €'),
 ('Sophie, l\'acheteuse cadeau', '30-50 ans, femme', 'Cadeau utile et drôle pour le conjoint ou le père', 'Noël, fête des pères, Saint-Valentin', '25 à 40 €')])
P('Seul le cadeau supporte 39,90 €.')
H('5. Prix et valeur client')
T(['Poste (par commande à 39,90 € TTC)', 'Montant', 'Base'], [
 ('Prix HT', '33,25 €', 'TVA 20 %'),
 ('Appareil', '≈ 2,5 €', 'étude de coût précédente + 2 min de montage'),
 ('20 bâtonnets, 50 à 100 g de cire, emballage, notice', '≈ 4 €', 'ESTIMATION ; cire non encore sourcée'),
 ('Livraison offerte', '≈ 5 €', 'ESTIMATION petit colis France'),
 ('Paiement, retours et service après-vente', '≈ 1,9 €', 'ESTIMATION : 1,5 % + 0,25 € et 3 % de retours'),
 ('Marge sur coûts variables avant publicité', '≈ 20 €', 'c\'est le coût d\'acquisition maximal à l\'équilibre')])
T(['Offre', 'Prix', 'Séances incluses', 'Prix par séance la 1re année'], [
 ('NazClic à 39,90 € (appareil + 20 bâtonnets + cire)', '39,90 €', '10', '3,99 €'),
 ('Kenashii', '16,99 €', '12', '1,42 €'),
 ('Kit sans marque le plus vendu', '11,99 €', '10', '1,20 €'),
 ('Philips NT3650', '13,19 €', 'illimité', '-')])
P('Recharge : elle est plafonnée par le prix d\'un kit complet concurrent. Un pack de 24 bâtonnets et 50 g de cire ne peut guère dépasser 12,90 € TTC (10,75 € HT).')
P('Valeur client sur 12 mois (ESTIMATION) : une séance toutes les 4 semaines donne 13 séances, soit 26 bâtonnets ; le kit initial en fournit 20. Avec 30 % de clients qui rachètent un pack : chiffre d\'affaires 33,25 + 0,3 × 10,75 = 36,5 € HT ; marge 20 + 0,3 × 4,9 = 21,4 €. Rapportée au coût d\'acquisition : 21,4 / 34 = 0,63 sur Meta, 21,4 / 17 = 1,26 sur TikTok.')
P('Recommandation : kit de lancement à 24,90-29,90 €, ou conserver 39,90 € pour un coffret « un an » (appareil, 52 bâtonnets, 200 g de cire, chauffe-cire), qui ramène la séance à 1,50 € environ et se vend comme cadeau.')
H('6. Acquisition')
P('Aucun référentiel fiable n\'existe par pays de l\'UE pour TikTok [S9] ; les chiffres ci-dessous sont des médianes mondiales à dominante américaine. Conversion : 1 $ ≈ 0,90 € (ESTIMATION).')
T(['Indicateur', 'Meta', 'TikTok', 'Source'], [
 ('CPM e-commerce', '15,06 $', '4,08 $ (6,21 $ en juin 2025 selon Gupta Media)', 'Triple Whale via Coupler.io 2026 ; via Adbacklog 2026 [S7, S9]'),
 ('CPM beauté', '18,02 $', 'non publié', 'Triple Whale 2025 via Nurdd [S8]'),
 ('CPC beauté (campagnes trafic)', '0,50 à 0,74 $', 'non publié', 'Coupler.io 2026, Noble Growth [S7]'),
 ('Taux de clic / de conversion', '2,27 % / 1,94 % (beauté)', '0,61 % / 1,56 % (e-commerce)', '[S8, S9]'),
 ('Coût par achat', '37,92 $ ≈ 34 € (beauté)', '18,82 $ ≈ 17 € (beauté) ; 17,07 $ e-commerce', 'Triple Whale 2025 [S8, S9]')])
P('Contrôle par l\'entonnoir (ESTIMATION) : CPM 9 €, taux de clic 1,5 %, conversion 1,5 % donnent 40 € par achat ; il faut 2,5 % de conversion pour descendre à 24 €. À 39,90 € pour un produit inconnu, 1,5 % est plus probable que 2,5 %.')
L(['Angle 1 : « Tu n\'oses pas tirer ? Appuie. » La gâchette supprime l\'hésitation ; c\'est votre seul avantage exclusif.',
   'Angle 2 : démonstration en vue subjective, une main, sans miroir, en 5 secondes.',
   'Angle 3 : comparaison avec la tondeuse (repousse en jours contre semaines) ; l\'allégation doit être prouvée.',
   'Angle 4 : cadeau et humour de couple, en saison (Noël, fête des pères).',
   'Angle 5 : hygiène, on ne touche jamais le bâtonnet.',
   'Prudence : les plans rapprochés de poils arrachés et les avant/après peuvent être limités par les règles publicitaires des plateformes ; prévoir des variantes sobres.'])
H('7. Réglementaire')
P('Rédigé de mémoire à partir des textes, sans vérification en ligne aujourd\'hui ; à faire valider. Ce n\'est pas un avis juridique.')
T(['Sujet', 'Texte', 'Ce que cela impose'], [
 ('Cire (produit cosmétique)', 'Règlement (CE) 1223/2009', 'Personne responsable établie dans l\'UE, rapport de sécurité par un évaluateur qualifié, dossier d\'information produit conservé 10 ans, notification CPNP avant mise sur le marché, bonnes pratiques de fabrication (ISO 22716), étiquetage en français (liste INCI, lot, durée, précautions).'),
 ('Allégations', 'Règlement (UE) 655/2013', '« Indolore », « 4 semaines » : preuves exigées.'),
 ('Qui est responsable de la cire', 'Règlement 1223/2009, art. 4', 'Si la cire porte votre marque, vous devenez personne responsable. Si vous glissez dans le kit une cire sous la marque d\'un fabricant européen déjà notifié, vous restez distributeur : c\'est la voie la plus légère.'),
 ('Appareil et bâtonnets', 'Règlement (UE) 2023/988 (sécurité générale des produits), applicable depuis le 13/12/2024', 'Analyse de risques et documentation technique conservées 10 ans, identification par lot, nom et adresses postale et électronique sur le produit ou l\'emballage, notice et avertissements en français, mêmes informations sur la fiche de vente en ligne, signalement des accidents.'),
 ('Marquage CE', '-', 'Aucun : l\'appareil n\'est ni électrique, ni un jouet, ni un dispositif médical. Ne pas l\'apposer.'),
 ('Matériaux', 'REACH', 'Le bâtonnet entre dans la narine : filament et colorants documentés, lots tracés. Une pièce imprimée, poreuse, est un point faible à traiter dans l\'analyse de risques.'),
 ('Emballage (France)', 'Loi AGEC', 'Triman et info-tri, adhésion à un éco-organisme et identifiant unique ; équivalent LUCID en Allemagne avant d\'y vendre.'),
 ('Vente à distance', 'Code de la consommation', 'Rétractation de 14 jours, garantie légale de conformité de 2 ans.')])
P('Budget (ESTIMATION) : 1 500 à 4 000 € la première année si la cire est à votre marque (évaluation de sécurité, dossier, personne responsable) ; quelques centaines d\'euros si vous restez distributeur.')
H('8. Risques')
T(['Forces', 'Faiblesses'], [('Seul produit relevé qui automatise le geste d\'arrachage ; usage à une main ; coût de revient de 2 à 3 € ; fabrication interne sans stock.', 'Prix triple du marché ; produit non prototypé ; ne traite ni la douleur ni la cire ; bâtonnet imprimé fragile ; fabrication limitée à environ 44 appareils par jour.')])
T(['Opportunités', 'Menaces'], [('Soin masculin en croissance de 5 à 8 % par an ; aucune marque française installée ; format vidéo démonstratif ; saison des cadeaux.', 'Copie rapide ; Amazon dominé par des kits à 12 € notés 4,2 ; refus possible des publicités ; un accident (saignement, bâtonnet cassé) se paie en avis et en responsabilité.')])
L(['Barrières à l\'entrée : faibles. Pas de norme, pas d\'outillage lourd, quelques milliers d\'euros de conformité.',
   'Facilité de copie : élevée. Le mécanisme (ressort, verrou, pince) se reproduit en quelques semaines et se moule pour moins de 2 € ; un vendeur asiatique peut l\'afficher à 12-15 €. Le bâtonnet « propriétaire » se clone aussi.',
   'Protection possible : brevet ou modèle d\'utilité si la recherche d\'antériorité (non faite) le permet, dessin ou modèle communautaire, marque. Attention : toute publicité avant le dépôt détruit la nouveauté.'])
H('9. Verdict et plan à 90 jours')
P('PIVOT : valider le produit et le prix avant d\'investir en publicité, et viser Amazon plutôt que Meta comme premier canal, parce que la demande y existe déjà sous forme de recherche.', True)
T(['#', 'Action', 'Échéance', 'Critère de décision'], [
 (1, 'Imprimer 20 appareils, dérouler le plan d\'essais, faire tester par 10 personnes', 'J+30', 'Emboîtement réussi ≥ 90 %, retrait efficace, aucune casse ; sinon arrêt ou reconception'),
 (2, 'Recherche d\'antériorité puis dépôt (brevet ou modèle, dessin, marque) avant toute communication', 'J+30', 'Liberté d\'exploitation confirmée par un conseil'),
 (3, 'Test de prix en précommande : page Shopify, 3 prix (24,90 / 29,90 / 39,90 €), 1 000 à 1 500 € répartis entre Meta et TikTok', 'J+45', 'Poursuite si coût par précommande ≤ 20 € et conversion ≥ 2 % ; sinon baisse de prix ou coffret'),
 (4, 'Sourcer une cire européenne déjà conforme, monter le dossier de sécurité produit, l\'emballage et la notice', 'J+60', 'Documents du fournisseur obtenus ; coût de cire ≤ 2 € par kit'),
 (5, 'Lancer sur Amazon.fr et la boutique avec 20 vidéos de créateurs ; lire 200 avis négatifs concurrents', 'J+90', '150 ventes, 30 avis à 4,3 ou plus, taux de rachat mesuré')])
H('Sources')
for s in ['[S1] Amazon.fr, résultats « kit cire nez », relevé le 14/11/2026.', '[S2] Amazon.fr, résultats « tondeuse nez », relevé le 14/11/2026.',
          '[S3] Fortune Business Insights, Men\'s Grooming Products Market, édition 2026-2034 (page consultée en 2026 ; elle contient aussi une valeur contradictoire de 64,63 Md$).',
          '[S4] Grand View Research, Men\'s Grooming Products Market 2026-2033.', '[S5] GM Insights, Hair Removal Wax Market 2026-2035 ; Straits Research, 2026 ; Fact.MR.',
          '[S6] Grand View Research, Electric Hair Clipper & Trimmer Market 2025-2030 ; Cognitive Market Research, 2026.',
          '[S7] Coupler.io, Facebook Ads Statistics 2026 (données Triple Whale) ; WordStream, Facebook Ads Benchmarks 2025 ; Noble Growth, Meta Ads Benchmarks.',
          '[S8] Nurdd, Facebook Ads Benchmarks for Beauty D2C Brands 2026 (données Triple Whale 2025).',
          '[S9] Adbacklog, TikTok Ads Benchmarks 2026 (Triple Whale, Focus Digital) ; AdManage, TikTok Ads Cost 2026 (Triple Whale, Gupta Media).',
          '[S10] Nad\'s : prix Boots cité dans un test vidéo d\'environ 2021 ; non revérifié.']: d.add_paragraph(s)
out = os.path.join(os.path.dirname(__file__), '..', 'livrables', 'NazClic_analyse_marche.docx'); d.save(out); print(out)
