# PP_LIVE remis en ordre

`fabriquer.py` part du `PP_LIVE.xlsm` de l'atelier (jamais versionné : il contient des noms et les accès Logys) et rend
le même classeur, avec seulement 4 macros visibles :

| Commande | Raccourci | Ce qu'elle fait |
|---|---|---|
| `NOUVELLE_JOURNEE` | Ctrl+Maj+N | équipe rechargée depuis le Suivi Op (M02), tout le monde présent, saisie vidée, tout relu |
| `DEMARRER_JOURNEE` | Ctrl+Maj+D | boucles data.js (M03 + M01) et pilotage_data.js (modPilotageLive) ; automatique 15 s après l'ouverture |
| `ACTUALISER_DONNEES` | Ctrl+Maj+A | un passage complet tout de suite |
| `TEST` | Ctrl+Maj+T | dossiers, fichiers du commun, Logys, écriture des deux fichiers, boucles, minuterie |

Ce que fait le fabricant :
- masque les procédures publiques de M01_LOGYS, M02_SUIVIOP, M03_EXPORT et modPilotageLive (paramètre facultatif
  `masque` : absentes d'Alt+F8, toujours appelables par la minuterie et par `Application.Run`) ;
- retire modToutLive, ajoute le module `PP_LIVE` (`vba/PP_LIVE.txt`) et réécrit ThisWorkbook (`vba/ThisWorkbook.txt`) ;
- ajoute l'onglet ACCUEIL en tête (4 boutons, état en direct, marche à suivre), au thème sombre du classeur ;
- modPilotageLive ne rouvre plus le Contrôle des rejets s'il n'a pas été enregistré depuis la dernière lecture ;
- erreurs décelées : une seule source, `Controle_Rejets.xlsm` (poste de rejet), lue par modPilotageLive pour
  `pilotage_data.js` et transmise à M03 (`Rejets_Lire`) pour `data.js` ; l'ancien fichier mensuel n'est plus lu.
  Matricule repris de la colonne Matricule, ou retrouvé depuis l'opérateur saisi (onglet OPERATEURS) si elle est vide.
  État du jour dans PILOTAGE (`DECELEES_DU_JOUR`) et sur l'ACCUEIL ;
- réécrit le projet VBA en code source seul, comme le 13/11 : Excel le recompile à l'ouverture.
Tout le reste du classeur est recopié à l'identique (vérifié partie par partie).

```bash
pip install olefile oletools openpyxl
PP_REJETS_DOSSIER='<chemin réseau du dossier CONVOYEUR>' \
  python3 outils/pp-live/fabriquer.py PP_LIVE_atelier.xlsm outils/pp-live/vba sortie/PP_LIVE.xlsm sortie/secours
python3 outils/pp-live/verifier.py sortie/PP_LIVE.xlsm
```

`PP_REJETS_DOSSIER` (facultatif) réécrit le chemin du Contrôle des rejets dans PILOTAGE et PARAMETRES ; il reste
hors du dépôt, qui est public.

`dossier/` : le lanceur (classeur puis écran en plein écran), le créateur de l'icône du Bureau, l'icône et le mode
d'emploi livrés dans `C:\PickPackLive` avec `PP_LIVE.xlsm`, `pilotage.html` et `slides/`.
