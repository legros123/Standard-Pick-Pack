# Réaffectation des tournées dans Logys — cahier des charges

**Pour** : informatique CLR / éditeur Logys · **De** : supervision Pick & Pack, CLR Champigneulles

## Le besoin

Un outil d'optimisation (`outils/tournees/optimiseur_tournees.py`) regroupe autrement les contenants d'une vague en tournées. Nous demandons que Logys applique ce regroupement avant que les opérateurs ne prennent les tournées.

Gain mesuré sur les tournées réelles du 21 au 23/10/2026 (zone PICK01A14, 23 857 lignes). Les deux colonnes sont calculées avec les mêmes lignes, le même plan, le même sens de circulation et les mêmes temps standards.

| | Logys actuel | Après réaffectation |
|---|---|---|
| Tournées | 420 | 353 |
| Distance parcourue | 191,6 km | 152,2 km (−20,6 %) |
| Temps de préparation estimé | 343,2 h | 325,9 h (−17,3 h sur 3 jours) |
| Commandes réparties sur plusieurs chariots | 313 | 1 (trop grosse pour un chariot) |

## Ce que fournit l'outil

Un fichier `*_reaffectation.csv` (séparateur `;`, UTF-8), avec **une ligne par contenant** :

| Colonne | Contenu |
|---|---|
| VAGUE | NUM_ORDRE_PREP |
| NUM_CONT | n° du contenant (CONTENANT.NUM_CONT = LIG_TOUR.NUM_CONT_DEPOSE) |
| COMMANDE | NUM_ORDRE |
| TYPE_CONTENANT | C16, C11, B16, A11, CARTON… |
| NB_LIGNES | lignes de tournée du contenant |
| NUM_TOUR_LOGYS | tournée actuelle |
| NOUVELLE_TOURNEE | tournée cible : soit un n° Logys existant (tournée inchangée), soit un repère T001, T002… (tournée à créer) |
| ORDRE_LANCEMENT | ordre de lancement souhaité |
| TYPE_TOURNEE | MULTI (DETA), MONO (DETA, C16 uniquement), CART |
| ACTION | INCHANGÉE / À RÉAFFECTER |

**Règles déjà respectées par le fichier** :
- une seule vague par tournée ;
- un seul type de tournée (STYP DETA ou CART) ;
- une seule zone (PICK01A14) ;
- au plus 45 équivalents C16 par chariot ;
- 50 à 180 lignes par tournée multi-lignes, 36 à 72 C16 par tournée monolignes ;
- carton complet dans les limites de MODEL_REAL ;
- un contenant n'est jamais coupé ;
- une commande est sur un seul chariot, sauf si elle ne tient pas.

## Contraintes côté Logys

1. **Moment** : la réaffectation doit se faire après la création des contenants et des tournées de la vague, mais **avant l'impression des étiquettes** et avant toute affectation d'un opérateur (P03 : scan du code-barre de la tournée). Les tournées sont en préparation papier (TYP_REAL = PAPI).
2. **Tournées concernées** : uniquement celles dont aucune ligne n'est terminée et qui ne sont ni en cours ni terminées. Ce contrôle correspond à la requête A de `sql/04_reaffectation_controles.sql`. L'outil peut de son côté écarter les tournées déjà entamées (`--figer-entamees`).
3. **Données à garder cohérentes** : le n° de tournée est présent dans 12 tables du schéma REXEL :
   - TOURNEE (avec les compteurs NB_LIG_PREV, NB_CONT_PREV, PDS, VOL, ainsi que NUM_MIS et NUM_TOUR_DEC) ;
   - LIG_TOUR (avec l'ordre de passage NUM_CHEMIN_PRISE) ;
   - CONTENANT (avec NUM_TOUR, NUM_LIG_TOUR et NUM_CONT_TOUR) ;
   - LIG_CONT, ALLEE_TOURNEE, ALLEE_PRISE_CONT, CR_STOCK, BIEN, PILOT_MOYEN, PIECE, SUIVI_NUM_SERIE et CONT_REPRINT_TEMP.

   La requête B mesure ce périmètre pour une vague donnée.
4. **Méthode souhaitée** : passer par une fonction standard de Logys, c'est-à-dire un regroupement ou un éclatement de tournées (la colonne TOURNEE.NUM_TOUR_DEC laisse penser qu'il existe une décomposition), ou par l'API des packages de création de tournées (P$CR_TOUR, P$CR_MISS_PREP). **Ne pas faire de mise à jour SQL directe** des tables : leurs corps ne sont pas visibles et les règles de gestion internes (missions, chemins, compteurs, états) seraient contournées.
5. **Ordre de passage** : il peut être recalculé par Logys selon son chemin habituel (CHEMIN_EMP). C'est le même ordre que celui de l'outil : allées croissantes, positions croissantes.
6. **Après réaffectation** : réimprimer les étiquettes des tournées modifiées, puis lancer les contrôles C, D et E de `sql/04`. C et D doivent ne renvoyer aucune ligne. E doit correspondre à l'onglet TOURNEES du calcul.

## Mise en œuvre proposée

1. **Recette** : rejouer une vague passée sur un environnement de test. Lancer les contrôles C, D et E, puis faire valider la préparation et le pesage par le superviseur.
2. **Pilote** : une vague par jour pendant une semaine, avec suivi de la productivité, des rejets pondéraux et des erreurs.
3. **Généralisation** : à toutes les vagues de la zone pick.
4. **Retour arrière** : le fichier conserve la tournée d'origine de chaque contenant (NUM_TOUR_LOGYS).

## Questions pour l'informatique et l'éditeur

- Logys propose-t-il une fonction de regroupement ou d'éclatement de tournées, ou un import de tournées ? Sous quel format ?
- À quel moment de la vague les étiquettes sont-elles imprimées ? Peut-on placer une étape de réaffectation avant cette impression ?
- Le paramétrage de MODEL_REAL (LIG_MAX, CONT_MAX, NB_LIG_AUTO) peut-il être ajusté en attendant ? Un premier gain partiel serait possible avec LIG_MAX à 180 et une capacité de chariot paramétrée.
