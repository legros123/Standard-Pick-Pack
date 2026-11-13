# Classeur unique Pick & Pack Live

Un seul classeur Excel, un seul module, un seul fichier de sortie (`data.js`) lu par `pilotage.html`.

- `creer_classeur.py SORTIE.xlsx` : crée le classeur vierge avec ses feuilles, tableaux et lignes d'exemple (`pip install openpyxl`).
- `modPickPackLive.bas` : le module VBA à importer dans ce classeur.

## Mise en route
1. Ouvrir le classeur, Alt+F11 → Fichier → Importer un fichier → `modPickPackLive.bas`.
2. Débogage → Compiler VBAProject.
3. Enregistrer sous → `.xlsm`, dans le dossier de `pilotage.html` (ou remplir `dossier_sortie` dans PARAMETRES).
4. Alt+F8 → `DemarrerLive`.

## Feuilles et tableaux (noms à ne pas changer)
| Feuille | Tableau | Colonnes |
|---|---|---|
| PARAMETRES | tblParam | Cle, Valeur, Explication |
| EQUIPE | tblEquipe | Matricule, Role, Present, Sorti, Revenu, Coef, Cadence |
| TOURNEES | tblTournees | Numero, Etat (L/C/F), Type, Lignes, Traitees, Annulees, Operateur, Debut, Fin, Colis |
| DECELEES | tblDecelees | Date, Matricule, Type, Allee |
| VAGUES | tblVagues | Heure, Numero, Lignes_prevues, Lignes_preparees, Ruptures |
| SERVICES | tblServices | Service, Fait, Restant |
| HISTORIQUE | tblHisto | Date, Prod, PPM, Rejets, Decelees, Lignes, Ops |

## Logys
Avec `logys = OUI` (PARAMETRES), le module interroge Logys en lecture seule par ODBC (`dsn_logys`, `vue_tournees`) à chaque export :
- TOURNEES : tournées `PREPAR` de sous-type DETAIL / CARTON, états LANCEE, ENCOURS, PRELEVE, ou mises à jour aujourd'hui. LANCEE → L, ENCOURS → C, PRELEVE et TERMINEE → F. `OPE_MAJ = 'AQ'` = tournée non prise. `DAT_MAJ` sert de début (en cours) ou de fin (faite).
- SERVICES : les autres sous-types, CABLE d'un côté, hors gabarit de l'autre.
- Rejets du jour (`CR_STOCK`, `REJE` / `PDS`) et contenants terminés (colis pesés).
- EQUIPE, colonne `Present = AUTO` : présent si une tournée est en cours ou finie depuis moins de 60 min.

Restent manuels : DECELEES, HISTORIQUE, VAGUES, la prévision du jour. Si Logys ne répond pas, l'export continue avec le contenu des feuilles et l'état l'indique.
