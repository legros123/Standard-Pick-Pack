# Dashboard préparation CLR : Pick · Câble · Hors gabarit

Un écran par service, le même partout : pour chacun des 3 services, **le statut (FACILE / TENDU / COMPLIQUÉ)**, **l'heure de fin estimée**, **la tendance** (s'améliore / se dégrade) et **le renfort nécessaire**.

```
Logys (Oracle)  ──ODBC──▶  Dashboard_Prepa_CLR.xlsm  ──toutes les 5 min──▶  donnees_dashboard.js  ──▶  index.html
 lignes lancées,           prévi du jour, opérateurs        (dossier partagé)                         ouvert en plein écran
 en cours, préparées       par zone, calculs                                                          dans chaque service
```

Un seul poste interroge Logys (celui du superviseur). Les écrans lisent seulement un fichier du dossier partagé : ils n'ont besoin ni d'Excel, ni d'un accès à Logys.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `Dashboard_Prepa_CLR.xlsx` | Classeur moteur (à enregistrer en `.xlsm` après import du module VBA). Régénérable : `python3 outils/creer_classeur_dashboard_prepa.py` |
| `vba/modDashboardPrepa.bas` | Module VBA : requête Logys, actualisation auto, historique, export vers l'écran |
| `vba/ThisWorkbook_a_coller.txt` | 2 procédures à coller dans `ThisWorkbook` (arrêt propre à la fermeture, démarrage auto facultatif) |
| `sql/00_decouverte_schema.sql` | À lancer une fois : trouver la table Logys, les statuts, l'emplacement |
| `sql/requetes_prepa.sql` | Toutes les requêtes (Pick, HG par zone, Câble par allée, rétract, analyse du découpage, calibrage des cadences) |
| `index.html` | L'écran TV. Sans fichier de données à côté : mode démo (`index.html?demo` le force) |

## Mise en route

1. **Classeur** : ouvrir `Dashboard_Prepa_CLR.xlsx` → `Alt+F11` → Fichier → Importer → `vba/modDashboardPrepa.bas`. Double-clic sur `ThisWorkbook`, coller `ThisWorkbook_a_coller.txt`. Débogage → Compiler VBAProject. Enregistrer sous `.xlsm`.
2. **Trouver la table Logys** : dans SQL Developer, `sql/00_decouverte_schema.sql`, F5. Repérer la table des lignes de préparation, la colonne statut et ses codes (lancée / en cours / validée), l'emplacement (allée câble), le préparateur, la date de validation. La requête qui produit déjà l'extraction journalière HG (`JJ-MM-AAAA.xlsx`, colonnes ZONE_MVT, NOM, Nb de lignes) donne directement la table.
3. **Renseigner** `PARAMETRES` bloc 7 (jetons ci-dessous) et bloc 6 (DSN ODBC, dossier d'export). Mêmes valeurs dans les `DEFINE` de `sql/requetes_prepa.sql`.
4. **Tester** : `Alt+F8` → `TesterConnexionLogys`, puis `InstallerBoutons` (4 boutons en haut de PILOTAGE).
5. **Écrans** : copier `index.html` dans le dossier d'export (celui où arrive `donnees_dashboard.js`). Sur chaque PC d'écran, l'ouvrir dans Edge ou Chrome puis `F11`. En mode borne, au démarrage du PC :
   `msedge.exe --kiosk "file://serveur/partage/Dashboard/index.html" --edge-kiosk-type=fullscreen`
6. **Chaque matin** : PILOTAGE → saisir le prévisionnel et les opérateurs par zone (cellules jaunes), cliquer **Auto ON**. La première actualisation se fait tout de suite (la fenêtre ODBC peut demander le mot de passe), puis toutes les 5 min sans aucune fenêtre.

### Jetons de la requête (PARAMETRES, bloc 7)

| Jeton | Ce qu'il faut mettre | Vide = |
|---|---|---|
| `SOURCE` | table / vue / jointure des lignes de préparation, avec alias | **obligatoire** |
| `COL_ZONE` | colonne zone (confirmée : `ZONE_MVT`) | `ZONE_MVT` |
| `COL_ALLEE` | allée câble tirée de l'emplacement, ex. `SUBSTR(l.EMPLACEMENT, 1, 2)` | `'TOUTES'` (une seule ligne câble) |
| `COL_PREPA` | préparateur affecté à la ligne | non suivi |
| `COL_DATE_VALID` | date + heure de validation | **obligatoire** |
| `EXPR_NB_LIGNES` | `1` si 1 enregistrement = 1 ligne, sinon la colonne nb lignes | `1` |
| `COND_LANCE` | condition « lancée, pas encore prise » | **obligatoire** |
| `COND_EN_COURS` | condition « prise par un préparateur, non validée » | **obligatoire** |
| `COND_VALIDEE` | condition « validée », **sans** date (la date est ajoutée par la requête) | **obligatoire** |
| `COND_RETRACT` | ligne câble servie au rétract | `1 = 0` (non suivi) |
| `COND_PERIMETRE` | site / dépôt / type de préparation | `1 = 1` |

`ZONES_CABLE` est calculé tout seul depuis l'onglet ZONES.

## Les requêtes (`sql/requetes_prepa.sql`)

| | Requête | Renvoie |
|---|---|---|
| Q1 | Pick | lignes lancées, en cours, préparées du jour, préparateurs en cours |
| Q2 | Hors gabarit par zone | idem par zone : sol, longueur 2 m, longueur 3 m, rétract, rétract longueur |
| Q3 | Hors gabarit par ZONE_MVT | le détail pour établir / contrôler le découpage |
| Q4 | Câble par allée | lancées, en cours, préparées, dont rétract, par allée |
| Q5 | Câble rétract | nombre de lignes rétract lancées / en cours / préparées |
| Q6 | Modèle Excel | tout en une requête, regroupé par zone / allée / statut (c'est elle que le classeur exécute) |
| Q7 | Analyse du découpage | lignes préparées sur N jours par service et par zone, en % : remplace 73 / 4 / 23 et la répartition HG |
| Q8 | Calibrage des cadences | lignes / heure / préparateur par zone sur N jours (indicatif) |

Une ligne n'est comptée qu'une fois : en cours avant lancée, avant préparée. Toutes les requêtes sont en lecture seule.

## Comment c'est calculé (onglet PILOTAGE)

- **Reste à faire** = lancées + en cours + à venir.
- **À venir** = prévisionnel × part du service (× part de la zone pour le HG) − ce que Logys a déjà vu (préparées + en cours + lancées), jamais négatif. Câble : réparti entre les allées au prorata du travail visible.
- **Charge** (heures-opérateur) = reste ÷ cadence de la zone × rendement équipe.
- **Fin estimée d'une zone** = heure des données + charge ÷ opérateurs de la zone + les pauses qui tombent avant. **Fin du service** = la zone qui finit en dernier.
- **Fin si rééquilibrage** = charge totale ÷ opérateurs totaux du service.
- **Renfort** = opérateurs manquants pour finir à l'heure visée, rééquilibrage compris.
- **Statut** : marge ≥ 30 min → FACILE ; 0 à 30 min → TENDU ; retard ou zone avec du travail et 0 opérateur → COMPLIQUÉ.
- **Tendance (écran)** : heure de fin comparée à celle d'il y a 25 min ou plus (historique HISTO). Écart de moins de 5 min : stable.
- Opérateurs : décimales acceptées (0,5 = un opérateur partagé sur deux allées).

## Valeurs de départ et leur source

| Réglage | Valeur | Source |
|---|---|---|
| Découpage du prévi | Pick 73 % · Câble 4 % · HG 23 % | consigne superviseur, à remplacer par Q7 |
| Cadence Pick | 83,8 l/h/op | quota P&P : 620 lignes / 7,4 h |
| Cadence Câble | 8,8 l/h/op | 1 000 pts / 7,4 h ÷ 15,38 pts par ligne (HG_Cable V17) |
| Cadence Sol | 68,5 l/h/op | mix réel janv.–juin 2026 : 1,97 pt par ligne |
| Cadence Longueur 2 m | 33,8 l/h/op | 4 pts par ligne |
| Cadence Longueur 3 m | 41,6 l/h/op | 3,25 pts par ligne (long. 3 m + IRL) |
| Cadence Rétract / Rétract longueur | 14,1 l/h/op | 9,6 pts par ligne |
| Part HG par zone | Sol 60,5 % · Long. 2 m 7,8 % · Long. 3 m 16,0 % · Rétract 11,0 % · Rétract long. 4,7 % | suivi op HG janv.–juin 2026 (221 634 lignes, 103 jours) |
| Rendement équipe | 100 % | l'équipe HG a fait 102 % du standard sur la même période (949 jours-opérateur) |
| Heures visées | 20:00 | **à ajuster** |

Découpage des zones Logys (onglet ZONES), repris de la macro d'import de HG_Cable V17 :
**Sol** = couronnes, aérosols, bardage, PICK01A14, chauffage, préparateur, panneaux, HG à emballer, gaines, plafonniers, éclairage (1, 2, ECL3, ECL4), gaines ventil., tourets précond., coffrets, promos, longueur 1 m, chauffe-eau, volumes ·
**Longueur 2 m** = LONGUEUR2M, LG2DEPOSEDIR, LG2EMBALLAGE ·
**Longueur 3 m** = LONGUEUR3M, LG3ALLEE32, IRL ·
**Rétract** = ARETRACT, RETRACT ·
**Rétract longueur** = RETRACT3435, EXTERIEUR, TUBECUIVRE ·
**Câble** = CABLE. Toute autre zone compte en Pick ; une zone Logys nouvelle est ajoutée toute seule dans ZONES avec « À VÉRIFIER ».

## Points à confirmer

- **Zone RETRACT** : la macro V17 (Module1) la compte en Rétract HG, l'ancienne (Module3) en Câble. Laissée en HG.
- **Rétract au câble** : quelle règle Logys distingue une ligne câble servie au rétract (niveau d'emplacement ? zone ?) → jeton `COND_RETRACT`.
- **Allée câble** : où est l'allée dans le code emplacement → requête D7 du fichier de découverte, puis jeton `COL_ALLEE`. Ensuite, vider la ligne « Câble (toutes allées) » de PILOTAGE : les allées s'ajoutent seules.
- **Heures visées et pauses** par service (PARAMETRES, bloc 4).

## Dépannage

| Symptôme | Cause et solution |
|---|---|
| « Paramètre Logys à renseigner » | un jeton vaut encore `A_RENSEIGNER` (PARAMETRES, bloc 7) |
| L'écran affiche MODE DÉMO | `donnees_dashboard.js` absent du dossier de `index.html` : vérifier le dossier d'export (PARAMETRES, bloc 6) |
| Bandeau jaune « données non actualisées » | plus d'export depuis 15 min : Excel fermé, Auto OFF, ou erreur (voir DONNEES, cellule B4) |
| « Lignes non ventilées » > 0 (PILOTAGE) | des lignes Logys ne tombent dans aucune ligne des tableaux : allée câble sans case libre, zone HG absente de PILOTAGE |
| L'actualisation auto échoue après une coupure réseau | la connexion est rouverte au tour suivant ; si le DSN ne garde pas le mot de passe, cliquer une fois « Actualiser Logys » |
| Classeur dans OneDrive / SharePoint | renseigner un dossier d'export réseau (PARAMETRES, bloc 6) |
| Pas de Logys (dépannage) | remplir les colonnes « ✎ manuel » de PILOTAGE, cliquer « Exporter (manuel) » |
