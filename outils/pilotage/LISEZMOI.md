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

Le module ne lit que le classeur : il n'interroge pas Logys lui-même. Les tableaux sont à alimenter par les extractions existantes (requêtes, copier-coller) ; avec `rafraichir_requetes = OUI`, il actualise les requêtes du classeur avant chaque export.
