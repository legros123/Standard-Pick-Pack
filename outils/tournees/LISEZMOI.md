# Optimiseur de tournées Pick & Pack (Logys)

L'outil refait les tournées de la zone pick (PICK01A14) à partir des lignes de tournée Logys. Il décide quelles commandes partent sur le même chariot et dans quel ordre on passe aux emplacements. Il compare ensuite le résultat, ligne pour ligne, avec les tournées que Logys a réellement créées.

## Résultat sur les données réelles du 21 au 23/10/2026

23 857 lignes de la zone pick, 6 785 commandes, 50 vagues. Mêmes lignes, même plan et mêmes temps standards dans les deux colonnes : l'écart vient uniquement du regroupement des commandes.

| | Logys réel | Optimisé | Écart |
|---|---|---|---|
| Tournées | 420 | 353 | −67 |
| Lignes par tournée | 57 | 68 | +19 % |
| Distance | 191,6 km | 152,2 km | **−20,6 %** |
| Temps de préparation estimé | 343,2 h | 325,9 h | **−17,3 h** (≈ 6 h / jour) |
| Tournées sous le minimum | 168 | 47 (inévitables) | −72 % |
| Commandes réparties sur plusieurs chariots (P05) | 313 | 1 (trop grosse pour un chariot) | |
| Chariots au-dessus de 45 éq. C16 | 9 | 0 | |
| Contrôles | | 11/11 conformes | |

Les 47 tournées restantes sous le minimum sont inévitables :
- 12 sont des chariots déjà pleins à 45 équivalents C16, à cause de gros contenants ;
- les autres viennent de vagues trop petites (de 1 à 40 lignes au total).

## Réaffectation dans Logys

En exploitation, on extrait la vague du jour avec `sql/02`, puis on lance :

```bash
python3 outils/tournees/optimiseur_tournees.py vague.xlsx --figer-entamees --sortie vague_opt.xlsx
```

On obtient deux fichiers :
- `vague_opt_reaffectation.csv` : une ligne par contenant, avec sa tournée Logys actuelle et sa tournée cible. Il sert à votre informatique ou à l'éditeur pour réaffecter les tournées dans Logys.
- l'onglet REAFFECTATION : le même contenu dans le classeur. Une tournée identique à une tournée Logys garde son numéro (en vert).

L'outil n'écrit jamais dans Logys. Le cahier des charges est dans [`REAFFECTATION_LOGYS.md`](REAFFECTATION_LOGYS.md), et les contrôles avant/après dans `sql/04_reaffectation_controles.sql`.

## Utilisation

```bash
# 1. Extraire les lignes du jour : sql/02_extraction_lignes.sql (Excel/ODBC) -> lignes.xlsx
# 2. Calculer
python3 outils/tournees/optimiseur_tournees.py lignes.xlsx --sortie tournees.xlsx
```

L'outil lit directement le classeur « Dictionnaire tournée » : il prend la première feuille qui a une colonne EMPLACEMENT.

Options : `--lignes-min 50 --lignes-max 180 --mono-min 36 --mono-max 72 --chariot-c16 45 --temps-calcul 90`.

| Onglet | Contenu |
|---|---|
| SYNTHESE | Comparaison optimisé / Logys réel, prévisionnel ETP, contrôles. |
| TOURNEES | Ordre de lancement, vague, type, contenants à monter, éq. C16, **allées dans l'ordre** et **allées traversées à vide** (changement de bout), durée estimée. |
| PRELEVEMENT | Ordre de passage (allées croissantes, positions croissantes = sens de marche), contenant, tournée Logys d'origine. |
| PREVISIONNEL | Par vague : tournées optimisées et Logys, distance, gain, heures, ETP. |
| CONTROLES / ANOMALIES / PARAMETRES | Règles revérifiées, commandes découpées, réglages utilisés. |

## Le modèle (mesuré sur les données Logys)

- **Emplacement** : `54APP` + allée (2 chiffres) + position (3) + niveau (2) + case. Exemple : `54APP0302201A` = allée 3, position 22, niveau 1.
- **Sens de marche** : dans Logys, chaque allée est toujours parcourue dans le sens des positions croissantes.
- **Sens unique** : les allées impaires vont vers le fond, les paires vers la sortie, avec une traverse à chaque bout. On traverse toujours une allée en entière. Quand il faut changer de bout, on passe par l'allée vide la plus courte : c'est le cas des allées 1 à 3 (positions 5 à 32, contre 19 à 122 pour les allées 4 à 14). Le parcours le plus court est calculé exactement, par programmation dynamique.
- **Chariot = 45 équivalents C16** : chaque contenant compte pour sa surface posée sur sa plus grande face, rapportée à celle d'un C16. Un C11 compte pour 3,77, un D11 pour 4,08, un B16 pour 1,01. Les vraies tournées Logys plafonnent à 44-45 : ce modèle reproduit bien la limite physique du chariot.
- **Multi-lignes** : de 50 à 180 lignes.
- **Monolignes** (P13) : de 36 à 72 C16, pour les commandes d'une seule ligne en **C16 uniquement**. Les autres monolignes (C14, B16, A16…) vont en multi-lignes. Une vague qui a moins de 36 monolignes les verse en multi-lignes.
- **Carton complet** (CART) : limites Logys MODEL_REAL, soit 80 contenants, 800 kg et 2,8 m³.
- **Une tournée = une vague**. Bacs et cartons peuvent partager un même chariot, comme dans Logys : P03 interdit la confusion entre bacs et cartons, pas leur mélange. Une commande n'est jamais coupée, sauf si elle ne tient pas sur un chariot.
- **Hors zone pick** (ARETRACT, AEROSOLS, PREPARATEUR, hors gabarit…) : ces lignes ne sont pas modifiées et restent des tournées Logys. Les lignes annulées sont écartées.
- **Unités Logys** : PDS est en grammes. VOL est en centièmes de cm³ (un carton de 415 × 278 × 102 mm vaut 1 176 774).
- **Temps standards** : ils sont calés pour que les tournées Logys réelles donnent 69 lignes/h, soit la productivité détail 2026 (513 lignes par jour).

## Méthode

1. **Construction** : on part d'une commande graine, puis on ajoute la commande qui coûte le moins de mètres par ligne.
2. **Descente** : on déplace une commande, on échange deux commandes ou on supprime une petite tournée, tant que le coût baisse. Le coût compte les mètres, un coût fixe par tournée et une pénalité par ligne manquante sous le minimum. Cette pénalité vaut 500 m, ou 20 m si le chariot est déjà plein (meilleur compromis testé entre 0, 20, 50, 100 et 200).
3. **Recherche itérée** : tant qu'il reste du temps, on défait des tournées voisines, on les refait autrement et on garde le meilleur résultat.
4. **Contrôle** : les 11 règles sont revérifiées. Le code retour vaut 1 s'il y a un écart.

## Oracle (schéma REXEL, 19c) — lecture seule

- `sql/01_decouverte_schema.sql` : explorer le dictionnaire.
- `sql/02_extraction_lignes.sql` : lignes du jour (LIG_TOUR + CONTENANT), au même format que la Requête2 du classeur Dictionnaire tournée.
- `sql/03_parametres_logys.sql` : MODEL_REAL (limites des types de tournée), CHEMIN_EMP (sens de circulation) et dimensions des contenants.

## À confirmer

- **Distances** : 3 m entre deux allées et 0,5 m par numéro de position (`ALLEE_LARGEUR_MODULE`, `METRES_PAR_POSITION`). Ces valeurs changent les mètres et les heures affichés. Elles changent aussi l'équilibre entre la distance, le coût fixe par tournée et la pénalité sous le minimum, donc les tournées choisies peuvent un peu changer. Si vous les corrigez, il faut relancer la comparaison.

## Tests

```bash
python3 outils/tournees/test_optimiseur.py      # 21 tests (jeu fictif au format Logys + cas limites)
```
