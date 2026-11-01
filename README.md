# Standards Pick & Pack — CLR Champigneulles

Application web (un seul fichier `index.html`) qui regroupe les 18 standards du service Pick & Pack :
fiches, supports de formation, tests et suivi d'habilitation.

## Contenu
| Élément | Rôle |
|---|---|
| `index.html` | L'application |
| `standards/*.pptx` | Supports PowerPoint d'origine (téléchargeables depuis chaque fiche) |
| `slides/*.webp` | Supports exportés en images, lus dans l'appli |
| `manifest.webmanifest`, `sw.js`, `icons/` | Installation sur l'écran d'accueil + fonctionnement hors ligne |

## Traçabilité formation (écran « Moi »)
- **Mon dossier de formation** : nom, prénom, matricule, équipe (stockés sur l'appareil).
- **Habilité** = checklist d'autocontrôle validée **et** test du standard réussi à 80 % minimum.
- **Attestation de formation** : A4 imprimable / PDF avec les 18 standards, dates et cadres de signature
  (opérateur, formateur/pilote, superviseur).
- **Export Excel** : fichier `.csv` (séparateur `;`, s'ouvre directement dans Excel), une ligne par standard.
- **Espace superviseur** : importer les `.csv` de l'équipe → matrice de polyvalence, filtre par équipe,
  alerte sur les standards critiques couverts par moins de 2 habilités, export Excel et impression A4 paysage.

Chaque fiche standard peut aussi être **imprimée en A4** pour affichage au poste.

## Mise à jour d'un support
1. Réexporter les images dans `slides/` (`P04-1.webp`, `P04-2.webp`…).
2. Ajuster `SLIDES` et changer `SLIDE_V` dans `index.html`.
3. Changer `VERSION` (et la liste `SLIDES` si le nombre d'images change) dans `sw.js`.

Aucune donnée n'est envoyée sur un serveur : tout reste sur l'appareil, les exports se font à la demande.
