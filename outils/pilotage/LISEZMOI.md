# Alimentation de `pilotage.html`

Un seul classeur Excel, `PP_LIVE.xlsm` (non versionné : il contient des données du site), écrit les deux fichiers lus par la page.

| Module | Rôle | Fichier écrit |
|---|---|---|
| `M01_LOGYS`, `M02_SUIVIOP`, `M03_EXPORT` (déjà dans PP_LIVE) | tournées, équipe et cadences, historique 30 jours | `data.js` |
| `modPilotageLive.bas` | charge, colis, vagues, services, Contrôle des rejets | `pilotage_data.js` |
| `modToutLive.bas` | `TOUT_TESTER`, `TOUT_DEMARRER`, `TOUT_ARRETER` ; écrit les deux fichiers dans le dossier du classeur | – |

Le classeur prêt à l'emploi est fabriqué par `construire_xlsm.py` (avec `ovba.py`) : il part du PP_LIVE d'origine, ajoute les deux modules et l'onglet `PILOTAGE` recopié de l'ancien classeur Pilotage, et installe le démarrage automatique (`Workbook_Open` → `TOUT_DEMARRER`). Le projet VBA est réécrit en code source seul : Excel le recompile à la première ouverture.

```bash
pip install olefile openpyxl
python3 outils/pilotage/construire_xlsm.py PP_LIVE_origine.xlsm Classeur_Pilotage.xlsm outils/pilotage/modPilotageLive.bas outils/pilotage/modToutLive.bas PP_LIVE.xlsm
```

À la main : copier l'onglet `PILOTAGE` dans `PP_LIVE.xlsm`, importer les deux `.bas`, compiler, lancer `TOUT_TESTER`.

`modPilotageLive` ajoute au bloc `decelees` de `pilotage_data.js` :
- `parMat` : décelées du jour par matricule (Contrôle des rejets, colonne Matricule de SAISIE et HISTORIQUE) → dossards et vigilance qualité ;
- `parJour` : décelées par jour du mois en cours → page « Les indicateurs ».

Côté page, un opérateur qui a une tournée en cours est compté présent même s'il n'est pas coché dans l'onglet EQUIPE.
