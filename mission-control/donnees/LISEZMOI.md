# Données — format normalisé v1 et branchement des sources

Le tableau de bord n'affiche **que** des instantanés au format normalisé ci-dessous.
Chaque source (démonstration, fichier JS, JSON, CSV, import manuel) est convertie dans ce
format par la couche d'import (`src/donnees/`), indépendante de l'affichage.

> **Sources réelles non fournies à ce jour.** Les exports LOGYS (Requete1 DETAIL / CARTON),
> OPE_MAJ, `equipe_jour.json` et `vision_board_data.js` n'étaient pas disponibles : aucune
> structure n'a été supposée. La correspondance se fait après inspection des vrais fichiers
> (application › Réglages › Données › *Inspecter un fichier*, qui liste colonnes, clés et exemples).

## 1. Choisir un mode de connexion

| Mode | Quand l'utiliser | Actualisation |
|---|---|---|
| **Fichier JS** (`donnees/pick_data.js`) | Recommandé sur le Flip : marche même en ouvrant `index.html` depuis un dossier partagé (sans serveur). | Relu toutes les 120 s |
| **URL JSON** | Un serveur interne expose le JSON (même site ou en-tête CORS). | 120 s |
| **URL CSV** | Un CSV journalier horaire est publié sur un serveur. | 120 s |
| **Import manuel** | Glisser-déposer ponctuel d'un fichier (contrôle, réunion). | Aucune |

Réglage : roue crantée › *Données*, ou dans l'adresse : `?source=script&fichier=donnees/pick_data.js`.

## 2. Format normalisé

```js
window.PICK_MC_DATA = {
  version: 1,
  meta: {
    source: "LOGYS + OPE_MAJ",          // libellé affiché dans les détails
    genereLe: "2026-11-09T10:42:00+01:00", // horodatage d'EXTRACTION (contrôle « données anciennes »)
    date: "2026-11-09", periode: "jour", equipe: "toutes",   // jour | semaine | mois ; toutes | matin | apres-midi
    heure: "10:42"                       // heure de la situation (sinon déduite de genereLe)
  },
  valeurs: {                             // null = indisponible (jamais 0 par défaut)
    lignesPreparees: 3298,               // lignes
    objectifLignes: null,                // lignes ; null → calcul : préparateurs × quota (620, PARAMETRES B5)
    colisProduits: 771,                  // colis dirigés vers l'expédition (production P&P)
    objectifColis: null,
    chargeRestante: 4890,                // lignes restant à préparer (carnet du service)
    colisControles: 792,                 // colis passés au contrôle convoyeur
    rejetsConvoyeur: 22,                 // colis rejetés
    colisEnAttenteRejet: 6,              // stock au poste de rejet
    erreursDecelees: 3,                  // erreurs confirmées au rejet → PPM décelée
    erreursAverees: null,                // litiges clients → PPM avérée (connue a posteriori)
    effectifPresent: 12, effectifPrevu: 13, preparateursPresents: 9
  },
  serie: [                               // une tranche par heure (vue Jour) ou par jour (Semaine / Mois)
    { t: "06:00", lignes: 412, colis: 98, rejets: 3, erreurs: 0, charge: 6120, objectif: null },
    { t: "10:00", lignes: 841, colis: 202, rejets: 6, erreurs: 1, partiel: true }   // tranche en cours
  ],
  equipes: [ /* facultatif : détail par équipe (capacité restante plus juste) */ ],
  priorites: [], securite: null          // facultatifs
};
```

Plusieurs instantanés peuvent coexister dans un fichier : `{ instantanes: [ … ] }` ; l'application
prend celui dont `meta.date / periode / equipe` correspondent aux filtres choisis.

## 3. Règles de calcul appliquées

| Indicateur | Calcul | Statut |
|---|---|---|
| Objectif lignes | préparateurs présents × 620 lignes (jour de 7,4 h) | **validé** (PARAMETRES B5, B6) |
| PPM décelée | erreurs décelées ÷ lignes × 1 000 000 ; vert < 1 000 | **validé** (bilan mensuel / PARAMETRES) |
| PPM avérée | litiges ÷ lignes × 1 000 000 | **validé** (définition du bilan mensuel) |
| Rythme attendu | objectif × temps productif écoulé ÷ temps productif du poste | seuils à valider |
| Capacité restante | préparateurs × (620 ÷ 7,4) × heures productives restantes — **estimation** | seuils à valider |
| Fin de préparation | charge ÷ cadence de la dernière heure — **estimation** | — |
| Taux de rejet | rejets ÷ colis contrôlés (fenêtre récente en vue Jour) | seuils à valider |

Tous les seuils, objectifs et actions proposées se règlent dans *Réglages › Seuils & actions*.

## 4. Produire `pick_data.js` depuis un CSV horaire

```bash
python3 outils/exporter_pick_data.py export.csv --col lignes=NB_LIGNES --col colis=NB_COLIS --objectif 12400
```

Le script additionne les flux par heure, garde la dernière valeur des stocks, horodate
l'extraction et écrit le fichier de façon atomique. À planifier toutes les 2 minutes
(Planificateur de tâches Windows) après l'extraction LOGYS.

## 5. Confidentialité

`donnees/pick_data.js`, les CSV et JSON de ce dossier sont **exclus du dépôt** (`.gitignore`) :
le site GitHub Pages est public. Ne versionner que les fichiers d'exemple fictifs.
