# Poste de rejet 3D

Animation en vraie 3D de l'écran « La qualité » du pilotage Pick & Pack : la ligne de convoyeurs, la balance,
l'aiguillage des rejets, les deux cercleuses, le poste de rejet et ses grands écrans, et les opérateurs en dossard
qui viennent chercher les colis de leurs erreurs.

| Fichier | Rôle |
|---|---|
| `../../poste-rejet-3d.html` | Page autonome de démonstration (journée simulée). S'ouvre sans réseau. |
| `src/` | Le code de la scène (décor, personnages, flux, caméra) et la page de démonstration. |
| `three.min.js` | three.js r149 (licence MIT), embarqué tel quel. |
| `assembler.js` | Reconstruit la page autonome et le bloc à greffer (`sortie/`). |
| `greffer.py` | Greffe la scène dans un fichier de pilotage. |

## Le pilotage de référence : `pilotage.html` à la racine

C'est la version à jour, à copier dans le dossier du poste (à côté de `pilotage_data.js`). Elle réunit :

- l'accueil Live « entrepôt vivant » (17/11 matin, commit 42c8fa9) ;
- les indicateurs (titres en gros, barèmes Prod P&P 515/490, avérées 200/240, rejets 130, décelées 20),
  les dossards tous visibles et les allées en couloirs entre palettiers (16/11 soir, commits 6ef0936 et 22e3a7d) ;
- la scène 3D du poste de rejet.

Ces versions avaient été faites en parallèle sur des branches différentes ; elles ont été fusionnées à trois voies
depuis leur base commune, sans conflit. Une seule retouche : la couleur des lisses des allées s'appelle
`C_LISSE_ALLEE`, car `C_LISSE` était déjà pris par l'accueil.

**Pour toute nouvelle modification du pilotage, partir de ce fichier**, sinon les modifications précédentes se perdent.

## Fluidité sur le Flip

La page mesure ses propres images et descend d'un cran si l'écran peine (constaté : jusqu'à 2 fois plus d'images par seconde sur l'accueil en 4K).

| Cran | Définition des animations | Images/s | Reflet du sol (accueil) | Lueurs d'ambiance |
|---|---|---|---|---|
| 0 | jusqu'à 2,2 millions de points | 30 | à chaque image | oui |
| 1 | 1,5 million | 30 | une image sur deux | oui |
| 2 | 1 million | 20 | une sur trois, plus léger | oui |
| 3 | 0,7 million | 20 | aucun | coupées |

Le cran est retenu par l'écran ; chaque nouveau jour il remonte d'un cran pour réessayer. Pour l'imposer : `pilotage.html?fluide=0` à `?fluide=3`.
La scène 3D du poste de rejet démarre directement allégée d'autant de crans, et garde son propre réglage automatique.

Autres corrections des à-coups « par moment » :
- un rafraîchissement des données ne met à jour tout de suite que l'écran affiché, les autres un par un entre deux images, jamais pendant l'entrée d'un écran ;
- les animations cachées ne sont plus redessinées à chaque rafraîchissement ;
- la scène 3D réutilise ses personnages et ses étiquettes d'un passage à l'autre au lieu de les refabriquer.

Si l'écran rame encore : vérifier dans le navigateur que l'accélération graphique est activée (Edge : Paramètres › Système).

## Mettre à jour la scène 3D

```bash
node    outils/poste-rejet-3d/assembler.js
python3 outils/poste-rejet-3d/greffer.py pilotage.html outils/poste-rejet-3d/sortie/greffe.html pilotage.html
```

Sur un pilotage déjà greffé, l'outil remplace seulement le bloc 3D. Sur un pilotage sans 3D, il fait la greffe
complète ; il ne modifie jamais le fichier d'origine et s'arrête avec une erreur si un point d'ancrage a changé.

## Ce que fait la greffe

- ajoute three.js et la scène avant le script du pilotage ;
- ajoute la classe `SceneRejet`, qui pose la 3D par-dessus l'ancienne scène dessinée (`SceneControle`, conservée) ;
- branche `Scenes.ctrl` dessus et lui passe les compteurs (colis pesés, rejets, décelées, objectif).

L'ancienne scène reste le filet de sécurité : elle s'affiche tant que la 3D n'est pas prête, si le poste ne sait pas
afficher du WebGL, s'il n'a pas de carte graphique (rendu logiciel) ou s'il est trop lent malgré les allègements.

Dans l'adresse du pilotage : `?3d=non` pour se passer de la 3D, `?3d=oui` pour l'essayer même sans carte graphique,
`?3d=force` pour l'imposer en qualité maximale.

## Contrat de la scène

`new PosteRejet3D(canvas, options)` puis `donnees(taux, vigilance, {pese, rej, dec, max})`, `demarrer()`, `arreter()`,
`rafraichir()`. `vigilance` est la liste des dossards `{mat, n, d}` (`d` : `jaune`, `orange` ou `rouge`).
