# Point du jour · Préparation · v9

Refonte du fichier `Point_Du_Jour_CHP_v8.1`. Le pointage, les onglets mois, MOUVEMENTS et LOGYS sont conservés, avec leurs données.

## Le compte rendu (mail)

Le mail est en **HTML pur**, sans image ni animation : il se lit sur téléphone, dans Outlook classique, dans le nouvel Outlook et dans le webmail. Aperçus : `Apercu_mail_telephone.png` et `Apercu_mail_exemple.html`.

1. **Synthèse du jour** : ETP total (tous services), heures supp totales, lignes totales (commande + cross dock), étiquettes (lignes de tournée LOGYS, ou saisie manuelle).
2. **Lignes bloquées du jour** (saisie), puis **SMC** : lignes SMC, passées (%), bloquées (%), toutes en saisie.
3. **Détail par service** (P&P, HG, Câble) : productivité et objectif, ETP, lignes, heures supp, fin de poste, fin du convoyeur pour le P&P, **dévidages** pour le Câble.
4. **Projection de demain** : ETP prévus (planning, case vide = 7,4 h), lignes prévues (saisie, avec le repère LOGYS affiché), ETP nécessaires, **écart en ETP** (+ marge / − renfort), et la ligne d'ouverture.
5. **Infirmerie** : OUI/NON et jusqu'à 4 soins (heure, service, nature, AT). Aucun nom n'apparaît, car ce sont des données de santé.

## L'accueil (onglet *Point Du Jour*)

- **Accès rapide** : liens vers P&P, HG et Câble (ils ouvrent l'onglet du mois sur la colonne du jour), Ventilation (première ligne libre de MOUVEMENTS), Synthèse et Paramètres. Ces liens fonctionnent sans macro.
- **REMPLIR 7,4 h** (PP · HG · CÂBLE · TOUT) : remplit uniquement les cases vides des opérateurs nommés. Les absences et les heures déjà saisies restent telles quelles, et une confirmation indique le jour et le nombre de cases. Le même bouton est disponible dans chaque bloc des onglets mois. Il s'applique alors à la colonne sélectionnée.
- **Pilote du soir** : 10 contrôles avant envoi, les destinataires, NOUVEAU JOUR (vide les cases jaunes de la veille), COPIER LE CADRE et DIAGNOSTIC.

## Corrections du pointage

- Les volets figés étaient décalés (OCT en E37, NOV en E16, MOUVEMENTS en A45). Ils sont remis en E7 et A6.
- Les mises en forme conditionnelles fragmentées ont été remises sur des plages propres.
- Contrôle de saisie (avertissement) : heures de 0 à 14 ou code absence.
- Un opérateur saisi avec son seul prénom (Matéo, Adam…) compte maintenant dans les heures prévues de demain.
- Dans SYNTHESE, les formules des « mouvements du jour » écrasées à la main sont restaurées, et la date suit celle du point.

## Installation

Ouvrir `Point_Du_Jour_CHP_v9.xlsm` et activer les macros. Les boutons sont déjà posés.
Au premier **ACTUALISER**, la connexion LOGYS est reprise de l'ancien fichier s'il est ouvert. Sinon, coller la chaîne ODBC dans PARAMETRES (C31). Elle a été retirée de la version publiée sur GitHub.

Si Excel signale un problème de macros à l'ouverture : Alt+F11, supprimer le module `PointDuJour`, puis Fichier > Importer `PointDuJour_v9.bas`, Ctrl+S, et enfin Alt+F8 > `INSTALLER`.

Le dossier `outils/` contient les scripts qui génèrent le classeur depuis la v8.1 (`build.py` puis `finalize.py`).
