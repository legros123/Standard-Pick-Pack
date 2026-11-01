# Brancher le suivi d'activité (10 minutes, une seule fois)

Le suivi enregistre dans un **Google Sheets du service** qui se connecte, quand, et ce que chacun réalise
(standards ouverts, supports lus, checklists validées, tests et scores). Le tableau de bord s'affiche dans
l'appli : **Moi › Espace superviseur › Suivi en direct**.

## 1. Créer le classeur
1. Sur [sheets.google.com](https://sheets.google.com) (compte du service, pas un compte perso si possible),
   créez un classeur vide nommé **Suivi Standards Pick & Pack**.
2. Menu **Extensions › Apps Script**.
3. Effacez le contenu de `Code.gs` et collez tout le fichier [`Code.gs`](Code.gs) de ce dossier.
4. Ligne `const CLE = "CHANGER-CE-CODE";` : remplacez par **votre code d'accès superviseur** (ex. `PP-Champi-2026!`).
   Ne le communiquez qu'à l'encadrement.
5. Enregistrez (icône disquette).

## 2. Publier le script
1. Bouton **Déployer › Nouveau déploiement**.
2. Roue dentée › type **Application Web**.
3. *Exécuter en tant que* : **Moi**. *Qui a accès* : **Tout le monde**
   (nécessaire pour que les téléphones des opérateurs puissent envoyer sans compte Google ;
   la lecture du tableau de bord reste protégée par le code d'accès).
4. **Déployer**, autorisez l'accès demandé, puis **copiez l'URL** (`https://script.google.com/macros/s/…/exec`).

## 3. Mettre l'URL dans l'appli
Dans `index.html`, en haut du script :
```js
const SUIVI_URL = "https://script.google.com/macros/s/…/exec";
```
Publiez la nouvelle version (GitHub Pages ou serveur habituel). Tous les téléphones l'utiliseront à l'ouverture suivante.

> Pour tester avant de publier : Espace superviseur › Suivi en direct › « Tester sur cet appareil uniquement ».

## 4. Ouvrir le tableau de bord
Moi › Espace superviseur › **Suivi en direct** › saisissez le code d'accès.

Vous y voyez :
- inscrits, actifs aujourd'hui, actifs 7 jours, connexions, habilitations, score moyen ;
- **l'affluence** jour par jour sur 30 jours ;
- **l'engouement par équipe** (actifs 7 j / inscrits) ;
- **la réalisation de chaque standard** (habilités / en cours / pas commencé) ;
- **la liste des opérateurs** : dernière connexion, nombre de connexions, habilitations, score moyen,
  inactifs depuis plus de 14 jours signalés en rouge ;
- export Excel et alimentation directe de la matrice de polyvalence.

## Dans le classeur
- Onglet **Journal** : une ligne par action (ne pas modifier).
- Menu **Suivi P&P › Mise à jour automatique toutes les heures** : crée les onglets
  **Utilisateurs**, **Par jour** et **Par standard**, rafraîchis chaque heure, prêts pour Excel
  (Fichier › Télécharger › Microsoft Excel) ou un tableau croisé dynamique.

## Points à savoir
- **Hors réseau** : les actions sont gardées sur le téléphone et envoyées au retour de la connexion.
- **Identification** : nom + prénom obligatoires au premier lancement, matricule recommandé
  (c'est lui qui évite les doublons si quelqu'un change de téléphone ou écrit son nom différemment).
- **Une connexion** = une ouverture de l'appli après 30 minutes sans activité.
- **Mise à jour du script** : après modification de `Code.gs`, *Déployer › Gérer les déploiements › Modifier ›
  Nouvelle version* (l'URL ne change pas).

## Cadre RH / RGPD (à faire valider avant le lancement)
Ce suivi est **nominatif**. Avant la mise en service :
- **informer et consulter le CSE** : tout dispositif permettant de suivre l'activité des salariés doit lui être présenté
  avant sa mise en œuvre (Code du travail, art. L2312-38) ;
- **informer les salariés** individuellement (l'écran de première connexion le fait, à compléter par une note de service) ;
- faire **inscrire le traitement au registre RGPD** de Rexel (référent RGPD / DPO), finalité : *suivi de la formation aux standards* ;
- définir une **durée de conservation** (ex. durée d'affectation au service + 1 an) et purger l'onglet Journal en conséquence ;
- ne pas utiliser ces données pour évaluer la productivité ou sanctionner : la finalité annoncée est la formation.
