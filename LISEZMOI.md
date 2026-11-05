# Pilotage Pick & Pack — `pilotage.html`

L'**Accueil** et la **Fiche opérateur** du classeur `Suivi_Op_PP_OFFICIEL`, dans une présentation
de tableau de bord moderne (Accueil façon « CRM dashboard », Fiche façon « profil »).
La saisie ne change pas : tout continue de se faire dans Excel.

## Utilisation au quotidien

1. Saisir dans Excel comme d'habitude (PROD, ERREURS, AVEREES, SUIVI RH, ACTIVITES…), puis **enregistrer** (Ctrl + S).
2. Ouvrir `pilotage.html` dans Edge ou Chrome, cliquer **Choisir le classeur…** (ou glisser le fichier sur la page).
3. Les fois suivantes : **Rouvrir « Suivi_Op… »** puis **Actualiser** après chaque enregistrement Excel.
   La page se souvient du fichier (Edge / Chrome) ; avec un autre navigateur, il suffit de le choisir à nouveau.

- **Jour / Semaine / Mois** + flèches ◀ ▶ (ou Alt + ← →) ; un clic sur la date ouvre le calendrier.
- Un clic sur un nom (classement, colonnes, actions, rail noir de la fiche, recherche) ouvre sa **fiche**.
- **Exporter** / **Imprimer la fiche** : impression ou PDF (A4 paysage).
- Le prénom affiché dans « Bonjour, … » se règle en cliquant sur le badge en haut à droite.
- **Enregistrer avec les données** : télécharge une copie de la page qui contient le classeur
  (`Pilotage_PP_jj-mm.html`, ~2 Mo). Elle s'ouvre directement, même sans internet et sur téléphone,
  sans choisir de fichier. À refaire après chaque mise à jour du classeur. **Document interne : ne pas
  le publier ni le déposer dans ce dépôt** (il contient les données des opérateurs).

## Ce qui est calculé

Les chiffres sont recalculés dans le navigateur à partir des onglets de saisie, avec **les mêmes
règles que CALC_ACCUEIL, CALC_FICHE et CALC** (seuils lus dans PARAMETRES) : lignes, cadence et quota
(soumis au quota, ≥ 2 h de picking), PPM décelée / avérée, heures supp., ETP, classements (≥ 500 lignes
pour les erreurs), RH (fenêtre = période, ou 30 jours en vue jour), actions à réaliser, alertes
individuelles (avérées en hausse, baisse de cadence, quota 30 j, progression), score de fiabilité.
Contrôle fait sur le classeur d'octobre 2026 : S33 (accueil) et S42 (fiche) identiques aux valeurs
d'Excel, alertes et scores identiques pour les 45 opérateurs.

Compatible avec la version OPTI du classeur (04/11/2026) : journal SUIVI RH par catégorie + motif
(sens et famille déduits de la catégorie, même avant recalcul par Excel) et répartition des décelées
ERREUR REF, QTE +, QTE −, ORIENTATION, AUTRES.

Seule différence volontaire : le score, la tendance et les alertes sont calculés au **dernier jour
travaillé de la période lue** (Excel : la « journée analysée » de PARAMETRES).

## Confidentialité

Le classeur est lu **dans le navigateur** : rien n'est envoyé ni enregistré en ligne, et la page ne
contient aucune donnée. Ne jamais déposer le classeur dans ce dépôt (`*.xlsx` / `*.xlsm` sont ignorés).

## Fichiers

| Fichier | Rôle |
|---|---|
| `pilotage.html` | la page (moteur de calcul + affichage) |
| `vendor/xlsx.full.min.js` | lecture des fichiers Excel (SheetJS 0.18.5, Apache 2.0) — garder ce dossier à côté de la page ; sans lui, la page le charge depuis internet |

Bilan mensuel opérateurs (QR codes) : voir `outils/LISEZMOI.md`.
