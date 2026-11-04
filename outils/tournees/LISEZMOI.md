# Optimiseur de tournées Pick & Pack

Il construit les tournées du jour à partir des lignes à préparer du WMS (Oracle). Pour chaque tournée, il dit quelles commandes partent ensemble, dans quel ordre on les lance, quels contenants monter sur le chariot et dans quel ordre l'opérateur passe aux emplacements. Il vérifie toutes les règles, puis compare le résultat aux tournées actuelles.

## En 3 étapes

```bash
# 1. Extraire les lignes à préparer du WMS (requête sql/02, résultat en CSV « ; » ou XLSX)
# 2. Calculer
python3 outils/tournees/optimiseur_tournees.py lignes.csv --sortie tournees.xlsx
# 3. Ouvrir tournees.xlsx
```

Options utiles : `--lignes-min 20 --lignes-max 45`, `--mono-min 15 --mono-max 40`, `--places 12`, `--niveau-retract 4`, `--strategie S|RETOUR|MIXTE`, `--temps-calcul 60`.

## Le classeur produit

| Onglet | Contenu |
|---|---|
| SYNTHESE | Distance, temps, lignes/h : comparaison entre l'optimisé, l'ordre d'arrivée (FIFO) et les tournées WMS actuelles. Inclut le prévisionnel ETP. |
| TOURNEES | Une ligne par tournée, dans l'ordre de lancement. Colonnes : vague, type, flux, lignes, **contenants à prendre** (ex. `2×C11 + 4×C9`), places, poids, distance, durée estimée, points d'attention. |
| PRELEVEMENT | Ordre de passage emplacement par emplacement (serpentin) avec colis, contenant et consigne : P13 monoligne, P16 composé, P12 aérosol/batterie. |
| PREVISIONNEL | Par vague : tournées, lignes, heures de préparation, ETP, heures de présence à planifier. |
| CONTROLES | Les 11 règles revérifiées sur le résultat (OK / ÉCART). |
| ANOMALIES | Emplacements illisibles, poids absents, contenant WMS différent du contenant proposé (P07), commandes découpées. |
| PARAMETRES | Réglages utilisés pour le calcul (traçabilité). |

## Règles appliquées

- **Tournée** : lignes entre MIN et MAX. Le chariot ne doit dépasser ni ses places ni son poids. Une tournée ne contient qu'une seule vague (départ transport) et un seul flux.
- **P03** : bacs agences et cartons clients ne sont jamais mélangés sur un même chariot.
- **P13** : les monolignes ont leurs propres tournées, avec 1 article = 1 C16. Le nombre d'étiquettes est égal au nombre de C16. Les monolignes en C16 de tous les flux sont regroupées.
- **P02 / P07** : le contenant est le plus petit qui convient (volume rempli à 85 % maximum, poids maximum). Si le WMS fournit déjà les colis, ils sont gardés et les écarts sont signalés.
- **P06** : les niveaux hauts (`--niveau-retract`) partent en tournées rétract séparées.
- Une commande n'est jamais coupée, sauf si elle dépasse un chariot à elle seule. Dans ce cas, elle est découpée par colis entiers.

## Méthode (amélioration continue)

1. **Construction** : on part d'une commande graine, puis on ajoute à chaque fois la commande qui ajoute le moins de mètres par ligne.
2. **Descente** : on déplace une commande, on échange deux commandes ou on supprime une petite tournée. Chaque changement qui fait baisser le coût est gardé. Le coût compte les mètres, un coût fixe par tournée et une pénalité sous le minimum.
3. **Recherche itérée** : tant qu'il reste du temps, on défait 2 ou 3 tournées voisines, on les reconstruit autrement et on garde le meilleur résultat obtenu.
4. **Contrôle** : toutes les règles sont revérifiées. Le code retour vaut 1 s'il y a un écart.

Sur le jeu d'essai (400 commandes, 1 862 lignes), la distance baisse de **22,6 %** par rapport au FIFO et de **21,2 %** par rapport aux tournées simulées, et les 11 contrôles sont conformes.

## Recaler les temps sur le réel

```bash
# requête sql/03 : 4 semaines de tournées réalisées avec leur durée
python3 outils/tournees/optimiseur_tournees.py historique.csv --calibrer
```

Cette commande ajuste les temps fixe, ligne, unité et colis ainsi que la vitesse par moindres carrés, puis les écrit dans `calibration.json`. Ce fichier est relu automatiquement à chaque calcul. Refaire la calibration chaque mois.

## Oracle

Les requêtes sont en lecture seule et compatibles avec Excel/ODBC (pas de `;` final).
- `sql/01_decouverte_schema.sql` : trouver les tables et colonnes du WMS (commandes, lignes, emplacements, colis, tournées).
- `sql/02_extraction_lignes.sql` : extraction du jour. Remplacer les repères `<<…>>` par les vrais noms : ils ne sont pas devinés.
- `sql/03_historique_tournees.sql` : historique pour la calibration.

## Tester

```bash
python3 outils/tournees/generer_jeu_test.py --sortie jeu_test.csv   # données fictives
python3 outils/tournees/test_optimiseur.py                         # 11 tests
```

## À confirmer sur le terrain

Les valeurs marquées `À CONFIRMER` en tête de `optimiseur_tournees.py` :
- lignes min et max, monolignes min et max ;
- places et poids du chariot ;
- volumes et poids maximum de chaque contenant ;
- plan de l'entrepôt (écart entre allées, longueur d'entre-poteau, sens de circulation) ;
- niveau rétract.
