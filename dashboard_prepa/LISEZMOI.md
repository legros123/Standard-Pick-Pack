# Dashboard préparation CLR : Pick · Câble · Hors gabarit

Un écran, le même dans tous les services, avec **les 3 services côte à côte**. Pour chacun : **l'état** (FACILE / TENDU / COMPLIQUÉ), **l'heure de fin estimée**, **la prod** (lignes / heure / opérateur face à l'objectif), et en gros **les lignes en cours, lancées et restantes**. En plus : la tendance, le renfort nécessaire, les lignes préparées et le détail par zone.

```
Logys (Oracle)  ──ODBC──▶  Dashboard_Prepa_CLR.xlsm  ──toutes les 5 min──▶  donnees_dashboard.js  ──▶  index.html
 vue des tournées          prévi du jour, opérateurs        (dossier partagé)                         plein écran
 de préparation            par zone, calculs                                                          dans chaque service
```

Un seul poste interroge Logys (celui du superviseur). Les écrans lisent seulement un fichier du dossier partagé : ils n'ont besoin ni d'Excel, ni d'un accès à Logys.

L'écran est une scène fixe 1920×1080 mise à l'échelle de l'écran qui l'affiche : TV, PC, tablette ou téléphone, les 3 services tiennent toujours ensemble, sans défilement.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `Dashboard_Prepa_CLR.xlsx` | Classeur moteur (à enregistrer en `.xlsm` après import du module VBA). Régénérable : `python3 outils/creer_classeur_dashboard_prepa.py` |
| `vba/modDashboardPrepa.bas` | Module VBA : requête Logys, actualisation auto, historique, export vers l'écran |
| `vba/ThisWorkbook_a_coller.txt` | 2 procédures à coller dans `ThisWorkbook` (arrêt propre à la fermeture, démarrage auto facultatif) |
| `sql/requetes_prepa.sql` | Toutes les requêtes Logys (Pick, HG par zone, Câble coupes / rétract, modèle Excel, répartition sur 20 jours, préparateurs en cours) |
| `sql/00_decouverte_schema.sql` | Contrôles à lancer une fois (valeurs présentes, colonnes, emplacement pour l'allée câble) |
| `index.html` | L'écran. Sans fichier de données à côté : mode démo (`index.html?demo` le force) |

## Source Logys

Les requêtes reprennent les tables de « Suivi activité préparation V4.69 » :

| Objet | Utilisé pour |
|---|---|
| `REXEL.F_GESTOURPREP_TOUR` | temps réel : état de la tournée (`L_ETAT_TOUR` LANCEE / ENCOURS / PRELEVE), sous-type (`L_STYP_TOUR`), zone de prise (`ZONE_MVT_PRISE`), lignes prévues / terminées / annulées, `OPE_MAJ`, `DAT_MAJ` |
| `LIG_TOUR` | répartition des lignes du jour par sous-type (Q7) |
| `REXEL.TOURNEE`, `REXEL.TRACE_REAL`, `REXEL.PERSONNE` | préparateurs en cours (Q8) |

- **Service** = sous-type de tournée : DETAIL, CARTON → Pick · HORS GAB, VRAC, LONGUEUR, PALETTE → Hors gabarit · CABLE → Câble.
- **Zone** = zone de prise : voir l'onglet ZONES. Rétract câble = zone `RETRACT`, rétract HG = zone `ARETRACT`.
- **Lignes lancées** = prévues − terminées − annulées des tournées LANCEE. **En cours** = le reste des tournées ENCOURS : les lignes déjà terminées ne sont plus comptées, contrairement à l'ancien fichier qui comptait la tournée en entier.
- **Préparées du jour** = lignes terminées des tournées mises à jour aujourd'hui.

## Mise en route

1. **Classeur** : ouvrir `Dashboard_Prepa_CLR.xlsx` → `Alt+F11` → Fichier → Importer → `vba/modDashboardPrepa.bas`. Double-clic sur `ThisWorkbook`, coller `ThisWorkbook_a_coller.txt`. Débogage → Compiler VBAProject. Enregistrer sous `.xlsm`.
2. **Connexion** : PARAMETRES bloc 7 → le DSN ODBC et l'utilisateur de « Suivi activité préparation » (dans ce fichier : Données → Requêtes et connexions → Propriétés → Définition), et le dossier partagé d'export. Aucun mot de passe n'est écrit dans le classeur : la fenêtre ODBC le demande au premier lancement, ou le DSN le garde.
3. **Tester** : `Alt+F8` → `TesterConnexionLogys`, puis `InstallerBoutons` (4 boutons en haut de PILOTAGE).
4. **Écrans** : copier `index.html` dans le dossier d'export (celui où arrive `donnees_dashboard.js`). Sur chaque PC d'écran, l'ouvrir dans Edge ou Chrome puis `F11`. En mode borne, au démarrage du PC :
   `msedge.exe --kiosk "file://serveur/partage/Dashboard/index.html" --edge-kiosk-type=fullscreen`
5. **Chaque jour** : PILOTAGE → prévisionnel en lignes commande et opérateurs par zone (cellules jaunes), puis **Auto ON**. La première actualisation se fait tout de suite, puis toutes les 5 min sans aucune fenêtre.

## Les requêtes (`sql/requetes_prepa.sql`)

| | Requête | Renvoie |
|---|---|---|
| Q1 | Pick | lignes lancées, en cours, tournées, préparées du jour, préparateurs en cours |
| Q2 | Hors gabarit par zone | lancées, en cours, préparées : sol, longueur 2 m, longueur 3 m, rétract, rétract longueur |
| Q3 | Hors gabarit par zone de prise | le détail pour contrôler le découpage |
| Q4 | Câble | coupes et rétract câble : lancées, en cours, préparées |
| Q5 | Câble rétract | nombre de lignes rétract (zone RETRACT) |
| Q6 | Modèle Excel | tout en une requête, regroupé par sous-type / zone / état (c'est elle que le classeur exécute) |
| Q7 | Répartition | lignes de tournée par sous-type sur 20 jours, en % : remplace 73 / 4 / 23 |
| Q8 | Préparateurs en cours | qui est sur quelle tournée, par sous-type et zone |

Toutes les requêtes sont en lecture seule.

## Comment c'est calculé (onglet PILOTAGE)

- **À venir** = prévisionnel (lignes commande × foisonnement) × part du service (× part de la zone pour le HG) − ce que Logys a déjà vu (préparées + en cours + lancées), jamais négatif.
- **Reste à faire** = lancées + en cours + à venir.
- **Fin estimée d'une zone** = heure des données + reste ÷ cadence ÷ opérateurs de la zone, + les pauses du service qui tombent avant. **Fin du service** = la zone qui finit en dernier. **Fin si rééquilibrage** = charge totale ÷ opérateurs totaux.
- **Prod** = lignes préparées ÷ (opérateurs × heures écoulées depuis le début d'activité, pauses passées déduites), comparée à l'objectif du service.
- **Renfort** = opérateurs manquants pour finir à l'heure visée, rééquilibrage compris.
- **État** : marge ≥ 30 min → FACILE ; 0 à 30 min → TENDU ; retard, ou zone avec du travail et 0 opérateur → COMPLIQUÉ.
- **Tendance (écran)** : heure de fin comparée à celle d'il y a 25 min ou plus. Écart de moins de 5 min : stable.
- Opérateurs : décimales acceptées (0,5 = un opérateur partagé sur deux zones).

## Valeurs de départ et leur source

| Réglage | Valeur | Source |
|---|---|---|
| Découpage du prévi | Pick 73 % · Câble 4 % · HG 23 % | consigne superviseur, à recaler avec Q7 |
| Foisonnement | 1,42 | ancien fichier, « taux de foisonnement » (mesuré 1,51 le 14/10) |
| Prod objectif | Pick 75 · Câble 8 · HG 51 l/h/op | ancien fichier, « Nombre ligne h » |
| Cadence Pick / Coupes / Rétract câble | 75 / 8 / 8 l/h/op | ancien fichier (rétract câble : à ajuster) |
| Cadence Sol | 80 l/h/op | ancien fichier : couronnes 148,6 et reste HG 64, pondérés par le mix réel (36 % de couronnes) |
| Cadence Longueur 2 m / 3 m | 36,5 l/h/op | ancien fichier : LG 270 lignes / 7,4 h |
| Cadence Rétract / Rétract longueur | 17,6 l/h/op | ancien fichier : rétract 130 lignes / 7,4 h |
| Part HG par zone | Sol 60,5 % · Long. 2 m 7,8 % · Long. 3 m 16 % · Rétract 11 % · Rétract long. 4,7 % | suivi op HG janv.–juin 2026 (221 634 lignes) |
| Horaires | début 12:06, fin visée 20:00 | ancien fichier, « horaire prep 12h06/20h » |
| Pauses | 30 min : pick 18:05, HG et câble 17:25 | ancien fichier |

La référence HG_Cable V17 (1 000 points / 7,4 h ÷ pondération) est rappelée à côté de chaque cadence dans PARAMETRES.

## Points à confirmer

- **Heure de fin** : le Point du jour dit 20:00, le calcul de l'ancien fichier utilisait 21:00 (20:30 le vendredi). Mis à 20:00.
- **Prod du jour** : la vue `F_GESTOURPREP_TOUR` garde-t-elle les tournées terminées ? Requête C4 du fichier de contrôle. Sinon, la prod ne compte que les tournées encore actives.
- **Zone MRL** : dans les longueurs de l'ancien fichier, classée en 3 m, à vérifier.
- **Câble par allée** : la vue des tournées n'a pas l'emplacement. Le câble est découpé en coupes / rétract câble ; pour aller jusqu'à l'allée, il faut la colonne emplacement de `LIG_TOUR` (requête C5).

## Dépannage

| Symptôme | Cause et solution |
|---|---|
| « DSN ODBC Logys à renseigner » | PARAMETRES bloc 7 |
| L'écran affiche MODE DÉMO | `donnees_dashboard.js` absent du dossier de `index.html` : vérifier le dossier d'export |
| Bandeau jaune « données non actualisées » | plus d'export depuis 15 min : Excel fermé, Auto OFF, ou erreur (DONNEES, cellule B4) |
| « Lignes non ventilées » > 0 | un sous-type de tournée inconnu : onglet ZONES, colonnes G:I, choisir le service |
| « À vérifier (zones) » > 0 | nouvelle zone de prise ajoutée dans ZONES : choisir sa zone dashboard |
| L'actualisation auto échoue après une coupure réseau | la connexion est rouverte au tour suivant ; si le DSN ne garde pas le mot de passe, cliquer une fois « Actualiser Logys » |
| Classeur dans OneDrive / SharePoint | renseigner un dossier d'export réseau (PARAMETRES, bloc 7) |
| Pas de Logys | remplir les colonnes « ✎ manuel » de PILOTAGE, cliquer « Exporter (manuel) » |
