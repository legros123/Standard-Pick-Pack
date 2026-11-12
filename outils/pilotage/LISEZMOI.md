# Pilotage Pick & Pack — le tableau de bord de l'atelier

`pilotage.html` (à la racine du dépôt) est un fichier unique, autonome : aucune installation, aucune connexion Internet, aucune bibliothèque. Il s'ouvre dans Edge ou Chrome, sur un écran d'atelier comme sur un poste de bureau.

En haut, cinq chiffres toujours visibles : **charge du jour, reste à faire, heure de fin estimée, rejets, erreurs décelées**. En dessous, douze écrans tournent toutes les 20 secondes. Chaque écran pose une question et y répond en une phrase.

| N° | Écran | La question | Pour qui surtout |
|---|---|---|---|
| 1 | La journée | Où en est-on ? | tout le monde |
| 2 | L'heure de fin | À quelle heure finit-on ? | superviseur, pilotes |
| 3 | La cadence | Va-t-on assez vite ? | équipe, superviseur |
| 4 | Les vagues | Où en sont les vagues ? | pilotes, expédition |
| 5 | La qualité | Travaille-t-on juste ? | équipe, qualité |
| 6 | Les allées | Où faut-il redoubler d'attention ? | équipe, qualité, méthodes |
| 7 | Les départs | Les camions partent-ils à l'heure ? | expédition |
| 8 | L'équipe | Comment va l'équipe ? | équipe, RH, sécurité |
| 9 | Les prochains jours | Que nous réserve la suite ? | superviseur, RH, direction |
| 10 | Le mois | Tient-on nos objectifs ? | direction, qualité |
| 11 | À faire | Que faut-il faire maintenant ? | superviseur, pilotes |
| 12 | Le standard du jour | Rappel d'un des 18 standards | équipe |

Un écran dont la donnée n'est pas branchée est sauté tout seul.

## Voir la démonstration

Ouvrir `pilotage.html`. Sans fichier de données, la page joue une journée simulée, signalée « Démo · données simulées » en haut à droite. Les prénoms et les chiffres y sont fictifs.

Options dans l'adresse : `?duree=15` (secondes par écran), `?fixe=1` (pas de rotation), `?ecran=5`, `?t=09:30&vitesse=60` (rejouer la journée en accéléré), `?noms=1`.

## Brancher les vraies données (une fois, 15 minutes)

La page lit le fichier `pilotage_data.js` posé **dans le même dossier qu'elle**, et le relit toutes les 30 secondes. Ce fichier est écrit par Excel.

1. Copier `pilotage.html` (et le dossier `slides/` pour l'écran « standard du jour ») dans un dossier du poste ou du partage.
2. Ouvrir un classeur Excel vierge, `Alt+F11`, **Fichier › Importer un fichier** : `modPilotageLive.bas`. Puis **Débogage › Compiler VBAProject** et enregistrer en `.xlsm`.
3. `Alt+F8` › `Pilotage_Installer` : la feuille **PILOTAGE** est créée.
4. Remplir les cases jaunes. Les deux indispensables :
   - `DSN` : le nom de la source ODBC LOGYS, la même que dans les classeurs de requêtes ;
   - `DOSSIER_SORTIE` : le dossier où se trouve `pilotage.html`.
5. `Alt+F8` › `Pilotage_Tester` : un seul passage, avec un compte rendu. La source ODBC demande le mot de passe une fois ; il n'est écrit nulle part.
6. `Alt+F8` › `Pilotage_Demarrer` : la boucle tourne (toutes les 2 minutes par défaut). `Pilotage_Arreter` pour l'arrêter.

Conseil : faire tourner ce classeur dans une fenêtre Excel à part, Excel reste occupé quelques secondes à chaque passage.

### Les réglages qui comptent

| Réglage | Rôle |
|---|---|
| `FIN_VISEE` | Heure à laquelle toute la charge doit être préparée. |
| `EFFECTIF_PREVU` | Préparateurs prévus par tranche, ex. `06:00=6;12:30=15;13:30=9;20:00=0`. **À renseigner dès que l'effectif change dans la journée** (deux équipes, renforts) : sans lui, l'heure de fin suppose que l'équipe du moment reste jusqu'au bout. |
| `PAUSES` | Ex. `09:00-09:20;16:30-16:50`. Déduites du calcul. |
| `FICHIER_REJETS` | Chemin du classeur *Contrôle des rejets* : erreurs décelées du jour (onglet SAISIE) et des 7 derniers jours par allée et par type (onglet HISTORIQUE). Vide : estimation LOGYS. |
| `FICHIER_SUIVI_OP` | Chemin du *Suivi Op* : historique 30 jours, quota moyen, PPM décelée et avérée du mois (onglet PROD). |
| `R_ALLEES`, `ZONES_ALLEES` | `NON` par défaut. À `OUI`, l'écran « Les vagues » montre le reste à préparer par zone d'allées (`1-3;4-10;11-14`), pour savoir où mettre du monde. La page ne l'affiche que si le total recoupe le reste à faire (écart de 15 % au plus). |
| `R_PORTEFEUILLE` | `NON` par défaut. À passer à `OUI` seulement après avoir vérifié sur l'écran *Gestion des vagues* que le compteur « détail » ne contient que la charge du jour. |
| `DATE_DERNIER_ACCIDENT`, `MESSAGE_SECURITE`, `REMONTEES_SECURITE` | Compteur de jours sans accident, message du jour et nombre de remontées « Œil sécurité » du mois, sur l'écran « L'équipe ». |

Les seuils (620 lignes par poste de 7,4 h, 120 rejets par jour, alerte à 15 et rouge à 20 erreurs décelées, PPM) reprennent PARAMETRES du Suivi Op et REGLAGES du Contrôle des rejets.

## Comment les chiffres sont calculés

- **Charge du jour** = lignes préparées aujourd'hui + lignes restantes des tournées ouvertes (détail et carton). Elle grandit quand une vague est lancée.
- **Heure de fin** = lignes restantes ÷ (cadence constatée par préparateur × effectif), pauses déduites. La cadence mélange la dernière heure (65 %) et la journée (35 %). La fourchette affichée donne les deux extrêmes.
- **Quota** = cadence × coefficient de taille des chariots ÷ standard, comme dans le Suivi Op (petit chariot : moins de 40 lignes, × 1,47 ; moyen : × 1,04 ; grand : 80 lignes et plus, × 0,92). Le quota officiel reste celui du Suivi Op.
- **Rejets** = colis écartés par la balance du convoyeur (compte rendu `REJE`, motif `PDS`). La projection en fin de journée suit l'avancement.
- **Erreurs décelées** = vraies erreurs trouvées au poste de contrôle, saisies dans le classeur *Contrôle des rejets*.
- **Prochains jours** = carnet de commandes par date d'expédition × 70 % (part du Pick & Pack), divisé par 620 pour obtenir le nombre de préparateurs.

Les 21 requêtes sont dans `requetes_pilotage.sql`, commentées une à une. Elles sont en **lecture seule** (uniquement des `SELECT`) et chaque colonne a été contrôlée contre le dictionnaire LOGYS du catalogue de requêtes.

## Confidentialité

- Sur l'écran de l'atelier : **aucun nom, aucun classement**. L'écran « L'équipe » montre un point par préparateur, sans nom.
- La **vue encadrement** (touche `E`) liste les préparateurs par ordre alphabétique. Elle est faite pour le poste du superviseur, pas pour l'écran de l'atelier.
- `pilotage_data.js` contient des noms : il reste sur le poste ou le partage et **n'est jamais versionné** (voir `.gitignore`).

## Au clavier

`→` `←` écran suivant, précédent · `Espace` pause · `1`…`9` aller à un écran · `F` plein écran · `E` vue encadrement · `T` tableau des données et point du jour à copier dans un message · `R` réglages · `?` aide.

## Si quelque chose ne va pas

| Ce que l'on voit | Quoi faire |
|---|---|
| « Démo · données simulées » alors qu'Excel tourne | `DOSSIER_SORTIE` ne pointe pas sur le dossier de `pilotage.html`. |
| « Données figées depuis 14:32 » | La boucle Excel est arrêtée ou LOGYS ne répond plus : regarder `DERNIER_MESSAGE` dans la feuille PILOTAGE. |
| Un écran n'apparaît pas | Sa requête a échoué ou est désactivée (`R_…` à `NON`). `Pilotage_Tester` liste les incidents. |
| Heure de fin trop optimiste le matin | Renseigner `EFFECTIF_PREVU`. |
| ORA-00942 sur une requête | Le compte LOGYS n'a pas le droit de lire cette vue : passer le réglage `R_…` correspondant à `NON`. |

## Ce qui n'a pas pu être vérifié ici

Le module VBA a été relu ligne à ligne et contrôlé par un vérificateur de structure, mais **il n'a pas pu être compilé ni exécuté** (pas d'Excel ni de LOGYS dans l'environnement de développement). Le premier `Pilotage_Tester` sert de recette : il affiche les requêtes en échec sans bloquer les autres.

## Modifier le tableau de bord

Le code est découpé dans `source/` (styles, structure, calculs, 3D, graphiques, écrans, application). Après une modification :

```bash
python3 outils/pilotage/construire.py                     # réassemble pilotage.html
python3 outils/pilotage/source/gen_alim.py                # régénère requetes_pilotage.sql et modPilotageLive.bas
```

Polices embarquées : Big Shoulders Display et Lexend (SIL Open Font License, voir `source/polices/LICENCE.txt`).
