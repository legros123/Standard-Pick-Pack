-- ============================================================================
-- 04 — RÉAFFECTATION DES TOURNÉES : CONTRÔLES AVANT / APRÈS — LECTURE SEULE
-- ----------------------------------------------------------------------------
-- Ces requêtes ne modifient rien. La réaffectation elle-même est faite par Logys
-- (informatique / éditeur) à partir du fichier *_reaffectation.csv : voir
-- outils/tournees/REAFFECTATION_LOGYS.md.
-- :VAGUE = n° de vague (VAGxxxxxxx). Sous Excel/ODBC : remplacer :VAGUE par ?
-- et retirer le « ; » final.
-- Tables et colonnes vérifiées dans le dictionnaire REXEL.
-- ============================================================================

-- A. AVANT — tournées de la vague et possibilité de les réaffecter
--    Réaffectable = aucune ligne terminée et tournée ni en cours ni terminée.
SELECT t.NUM_TOUR, t.STYP_TOUR, t.ZONE_MVT, t.ETAT_TOUR,
       t.NB_LIG_PREV, t.NB_LIG_TERM, t.NB_CONT_PREV, t.COD_MOYEN, t.DAT_MAJ,
       CASE WHEN NVL(t.NB_LIG_TERM, 0) = 0
             AND t.ETAT_TOUR NOT IN ('ENCO', 'TERM')
            THEN 'OUI' ELSE 'NON' END AS "REAFFECTABLE"
FROM   REXEL.TOURNEE t
WHERE  t.NUM_ORDRE_PREP = :VAGUE
  AND  t.TYP_TOUR = 'PREP'
ORDER  BY t.NUM_TOUR;

-- B. AVANT — périmètre : nombre de lignes qui portent ces n° de tournée, table par table
--    (tout ce que la réaffectation doit garder cohérent)
WITH tr AS (SELECT NUM_TOUR FROM REXEL.TOURNEE WHERE NUM_ORDRE_PREP = :VAGUE AND TYP_TOUR = 'PREP')
SELECT 'LIG_TOUR'         AS "TABLE", COUNT(*) AS "NB" FROM REXEL.LIG_TOUR         x WHERE x.NUM_TOUR IN (SELECT NUM_TOUR FROM tr)
UNION ALL SELECT 'CONTENANT',         COUNT(*) FROM REXEL.CONTENANT        x WHERE x.NUM_TOUR IN (SELECT NUM_TOUR FROM tr)
UNION ALL SELECT 'ALLEE_TOURNEE',     COUNT(*) FROM REXEL.ALLEE_TOURNEE    x WHERE x.NUM_TOUR IN (SELECT NUM_TOUR FROM tr)
UNION ALL SELECT 'ALLEE_PRISE_CONT',  COUNT(*) FROM REXEL.ALLEE_PRISE_CONT x WHERE x.NUM_TOUR IN (SELECT NUM_TOUR FROM tr)
UNION ALL SELECT 'CR_STOCK',          COUNT(*) FROM REXEL.CR_STOCK         x WHERE x.NUM_TOUR IN (SELECT NUM_TOUR FROM tr)
UNION ALL SELECT 'BIEN',              COUNT(*) FROM REXEL.BIEN             x WHERE x.NUM_TOUR_COUR IN (SELECT NUM_TOUR FROM tr)
UNION ALL SELECT 'PILOT_MOYEN',       COUNT(*) FROM REXEL.PILOT_MOYEN      x WHERE x.NUM_TOUR IN (SELECT NUM_TOUR FROM tr)
UNION ALL SELECT 'SUIVI_NUM_SERIE',   COUNT(*) FROM REXEL.SUIVI_NUM_SERIE  x WHERE x.NUM_TOUR IN (SELECT NUM_TOUR FROM tr);

-- C. APRÈS — cohérence : un contenant doit porter la même tournée que ses lignes
--    Résultat attendu : AUCUNE ligne.
SELECT lt.NUM_CONT_DEPOSE AS "NUM_CONT", lt.NUM_TOUR AS "TOURNEE_LIGNE", c.NUM_TOUR AS "TOURNEE_CONTENANT",
       COUNT(*) AS "NB_LIGNES"
FROM   REXEL.LIG_TOUR  lt
JOIN   REXEL.CONTENANT c ON c.NUM_CONT = lt.NUM_CONT_DEPOSE
WHERE  lt.NUM_ORDRE_PREP = :VAGUE
  AND  (c.NUM_TOUR IS NULL OR c.NUM_TOUR <> lt.NUM_TOUR)
GROUP  BY lt.NUM_CONT_DEPOSE, lt.NUM_TOUR, c.NUM_TOUR;

-- D. APRÈS — compteurs de TOURNEE = réalité des lignes. Résultat attendu : AUCUNE ligne.
SELECT t.NUM_TOUR, t.NB_LIG_PREV, COUNT(lt.NUM_LIG_TOUR) AS "LIGNES_REELLES",
       t.NB_CONT_PREV, COUNT(DISTINCT lt.NUM_CONT_DEPOSE) AS "CONTENANTS_REELS"
FROM   REXEL.TOURNEE  t
LEFT JOIN REXEL.LIG_TOUR lt ON lt.NUM_TOUR = t.NUM_TOUR
                           AND NVL(lt.ETAT_LIG_TOUR, '-') <> 'ANNU'
WHERE  t.NUM_ORDRE_PREP = :VAGUE
  AND  t.TYP_TOUR = 'PREP'
GROUP  BY t.NUM_TOUR, t.NB_LIG_PREV, t.NB_CONT_PREV
HAVING t.NB_LIG_PREV <> COUNT(lt.NUM_LIG_TOUR)
    OR t.NB_CONT_PREV <> COUNT(DISTINCT lt.NUM_CONT_DEPOSE);

-- E. APRÈS — ce que Logys contient maintenant, à comparer à l'onglet TOURNEES du calcul
SELECT lt.NUM_TOUR, COUNT(*) AS "LIGNES", COUNT(DISTINCT lt.NUM_CONT_DEPOSE) AS "CONTENANTS",
       COUNT(DISTINCT lt.NUM_ORDRE) AS "COMMANDES", MIN(lt.ALLEE_MVT_PRISE) AS "PREMIERE_ALLEE",
       MAX(lt.ALLEE_MVT_PRISE) AS "DERNIERE_ALLEE"
FROM   REXEL.LIG_TOUR lt
WHERE  lt.NUM_ORDRE_PREP = :VAGUE
  AND  NVL(lt.ETAT_LIG_TOUR, '-') <> 'ANNU'
GROUP  BY lt.NUM_TOUR
ORDER  BY lt.NUM_TOUR;
