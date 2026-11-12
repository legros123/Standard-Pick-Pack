# Bilan mensuel opérateurs — QR codes recto-verso

Chaque mois, en 2 commandes, depuis le classeur `Suivi_Op_PP_OFFICIEL` :

```bash
pip install openpyxl segno
python3 outils/bilan_mensuel.py Suivi_Op_PP_OFFICIEL.xlsx --mois 10 --annee 2026 --sortie bilan
node    outils/html_vers_pdf.js bilan
```

Sortie dans `bilan/` (jamais versionné, données personnelles) :

| Fichier | Usage |
|---|---|
| `cartes_OCT2026.pdf` | À imprimer **recto-verso, bord long**, puis couper en 4 (A6). Recto : QR perso → bilan du mois. Verso : QR → les 18 standards. |
| `synthese_OCT2026.pdf` | Classement complet, **confidentiel superviseur / RH**. |
| `donnees_OCT2026.json` | Contrôle des calculs. |

## Ce que voit l'opérateur (fiche.html)
Carte joueur style jeu de foot (niveau OVR, bronze / argent / or / icône, 6 attributs) et hexagone comparé à la moyenne de l'équipe, note /20, chiffres du mois face à la moyenne de l'équipe et au mois précédent,
note par critère, courbe jour par jour, record du mois, 10 badges, vie au poste (journal RH),
défi personnalisé avec lien direct vers le standard à revoir (`index.html#P9`).

## Confidentialité
Les chiffres sont **dans le QR** (après le `#` de l'URL, jamais transmis au serveur GitHub) :
rien de personnel n'est publié sur le site. La page efface le lien de la barre d'adresse
dès l'ouverture.

## Notation — identique pour tous
- Classés : actifs, hors pilotes, soumis au quota (case vide = oui), ≥ 74 h de picking dans le mois.
- Par critère : `note = 10 + 4 × (valeur − moyenne équipe) / écart-type`, bornée 0–20 → moyenne = 10/20.
- Poids : productivité (quota) 40 % · qualité décelée (PPM décelée) 20 % · qualité avérée (PPM avérée) 20 % · RH & savoir-être (positifs − écarts du journal SUIVI_RH, ramené à 20 jours) 20 %.
- Équipe confirmée : note finale × 1,10 (10 % moins sévère), plafonnée à 20.
- Nouveaux (liste `NOUVEAUX` dans le script : Kellerer, Dembele, Hamdani, Robin) : productivité, avérée et décelée notées sur leur objectif d'intégration — 500 lignes/jour, PPM avérée 300, PPM décelée 3 200 (objectif atteint = 12/20) — puis +2 points de bonus. Pas de classement entre eux ni avec les confirmés.
- Jamais pris en compte : absences, maladie, AT, délégation, congés, formation, contrat, ancienneté.

Réglages (seuils, poids, URL du site) en tête de `bilan_mensuel.py`.

**Aucun classement n'est affiché** (ni sur les pages, ni sur les cartes, ni dans la synthèse) : chacun se compare à la moyenne de l'équipe via sa carte joueur et son hexagone. OVR = 45 + 2,5 × note /20 (10/20 = 70) · bronze < 65 · argent 65-77 · or 78-84 · icône ≥ 85.

**Pages perso** : `NNN_nom.html` (une par opérateur, données intégrées) — le QR du recto pointe vers `https://legros123.github.io/Suivi-P-P-/<Mois>/NNN_nom.html`. Fonctionne sur tous les téléphones et lecteurs QR. Pour un nouveau mois : copier le dossier `bilan/<Mois>/` produit par le script à la racine de Suivi-P-P-. Seuil carte : 15 h de picking réel (heures − hors pick).

---

# Tableau de bord atelier — `pilotage.html`

Écran mural du service (un seul fichier, fonctionne hors ligne). L'accueil « Live » revient toutes les 2 pages.

| Écran | Contenu |
|---|---|
| **Live** (accueil) | Lignes lancées à préparer + tournées + restant estimé, heure théorique de fin, lignes en cours, rejets, décelées, vigilance qualité par matricule. Couleur de tout l'écran selon l'état : vert stable, orange tendu, rouge critique. |
| La journée | Camion du jour (% réalisé), colis et chariots terminés, chariots en attente, cadence à tenir / vitesse réelle. |
| Les vagues | Une palette par vague, toutes les préparations du site, reste et ruptures. |
| La qualité | Convoyeur, balance, poste de contrôle ; dossards jaune / orange / rouge dès 3 décelées. |
| Les allées | Plan 3D (allées 1, 2, 3, 14, 21 en 12 m, les autres en 4 m), couleur selon le rang d'erreurs, types d'erreur sur 7 jours. |
| Les indicateurs | Productivité 30 j, PPM avérée 30 j, rejets 20 j, décelées du mois. |
| Sécurité & équipe | Jours sans accident, message sécurité, fierté d'équipe, standard du jour. |
| Le standard | Toutes les pages du standard du jour (dossier `slides/`). |

## Données
Deux fichiers écrits par Excel **dans le même dossier que la page**, relus toutes les 30 s ; un seul suffit, sans aucun la page passe en démonstration :
- `data.js` — contrat de l'ancien écran PP Live (tournées, équipe, décelées par matricule, historique).
- `pilotage_data.js` — contrat de l'ancien Pilotage (charge, colis, vagues, services, allées, sécurité).

Réglages facultatifs dans `cfg` de `pilotage_data.js` : `allees: [1,2,…]` (liste des allées affichées) et `alleesHautes: [1,2,3,14,21]`.

## Raccourcis
`E` vue encadrement · `T` tableau des données · `R` réglages · `?` aide · `F` plein écran · flèches, espace.
Essai des couleurs : `pilotage.html?demo=1&statut=critique` (ou `tendu`, `stable`).
