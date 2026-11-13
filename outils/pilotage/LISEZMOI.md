# Alimentation de `pilotage.html`

Un seul classeur Excel, `PP_LIVE.xlsm` (non versionné : il contient des données du site), écrit les deux fichiers lus par la page.

| Module | Rôle | Fichier écrit |
|---|---|---|
| `M01_LOGYS`, `M02_SUIVIOP`, `M03_EXPORT` (déjà dans PP_LIVE) | tournées, équipe et cadences, historique 30 jours | `data.js` |
| `modPilotageLive.bas` | charge, colis, vagues, services, Contrôle des rejets | `pilotage_data.js` |
| `modToutLive.bas` | `TOUT_REGLER_DOSSIER`, `TOUT_TESTER`, `TOUT_DEMARRER`, `TOUT_ARRETER` | – |

Mise en route : copier l'onglet `PILOTAGE` de l'ancien classeur Pilotage dans `PP_LIVE.xlsm`, importer les deux `.bas`, compiler, lancer `TOUT_REGLER_DOSSIER` puis `TOUT_TESTER`.

`modPilotageLive` ajoute au bloc `decelees` de `pilotage_data.js` :
- `parMat` : décelées du jour par matricule (Contrôle des rejets, colonne Matricule de SAISIE et HISTORIQUE) → dossards et vigilance qualité ;
- `parJour` : décelées par jour du mois en cours → page « Les indicateurs ».

Côté page, un opérateur qui a une tournée en cours est compté présent même s'il n'est pas coché dans l'onglet EQUIPE.
