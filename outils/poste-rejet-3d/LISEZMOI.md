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

## Refaire la page et greffer la scène dans le pilotage

```bash
node    outils/poste-rejet-3d/assembler.js
python3 outils/poste-rejet-3d/greffer.py pilotage_origine.html outils/poste-rejet-3d/sortie/greffe.html pilotage.html
```

Le pilotage lui-même n'est pas versionné ici : il vit dans le dossier du poste, à côté de `pilotage_data.js`.
La greffe ne modifie jamais le fichier d'origine ; elle s'arrête avec une erreur si un point d'ancrage a changé.

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
