# NazClic - épilateur nasal à cire et bâtonnets dédiés

Étude de conception (indice A). Rien n'a été imprimé ni mesuré : valeurs calculées.

- `livrables/` : dossier de conception (.docx), plans (.pdf), classeur CdCF / matrice / essais (.xlsx), visualiseur 3D (.html), archive CAO (.zip)
- `cad/` : STEP et STL par pièce, assemblage, résultats du contrôle d'interférence
- `src/` : `params.py` (toutes les cotes), `cad.py` (CadQuery), `plans.py`, `viewer.py`, `xl.py`, `dossier.py`

Régénérer : `cd src && python3 cad.py && python3 plans.py && python3 viewer.py && python3 xl.py && python3 dossier.py`
(`viewer.py` attend three.js 0.147 décompressé dans le dossier indiqué en tête de fichier.)
