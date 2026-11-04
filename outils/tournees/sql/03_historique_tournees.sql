-- ============================================================================
-- 03 — HISTORIQUE DES TOURNÉES RÉALISÉES -> calibration des temps standards
-- ----------------------------------------------------------------------------
-- LECTURE SEULE. Même repères <<…>> que 02_extraction_lignes.sql.
-- Une ligne par ligne prélevée, avec la tournée réelle et sa durée (début
-- d'affectation -> dernière validation), sur les 4 dernières semaines.
--
--   python3 outils/tournees/optimiseur_tournees.py historique.csv --calibrer
--
-- Durée : écart entre le premier et le dernier horodatage de la tournée, en
-- minutes (DATE - DATE = jours, × 1440). Les tournées de plus de 3 h ou de moins
-- de 2 min (oubli de clôture, test) sont écartées.
-- ============================================================================
WITH t AS (
    SELECT  l.<<NUM_TOURNEE_PREP>>                                       AS tournee,
            (MAX(l.<<DATE_VALIDATION>>) - MIN(t0.<<DATE_AFFECTATION>>)) * 1440 AS duree_min
    FROM    <<SCHEMA>>.<<TABLE_LIGNES_PREPA>>  l
    JOIN    <<SCHEMA>>.<<TABLE_TOURNEES>>      t0 ON t0.<<NUM_TOURNEE_PREP>> = l.<<NUM_TOURNEE_PREP>>
    WHERE   t0.<<DATE_AFFECTATION>> >= TRUNC(SYSDATE) - 28
      AND   t0.<<DATE_AFFECTATION>> <  TRUNC(SYSDATE)
      AND   l.<<STATUT_LIGNE>> IN (<<STATUTS_PRELEVE>>)
    GROUP BY l.<<NUM_TOURNEE_PREP>>
)
SELECT
    l.<<NUM_COMMANDE>>          AS "commande",
    e.<<CODE_EMPLACEMENT>>      AS "emplacement",
    l.<<CODE_ARTICLE>>          AS "reference",
    l.<<QTE_PRELEVEE>>          AS "quantite",
    a.<<POIDS_UNITAIRE_KG>>     AS "poids_unitaire_kg",
    l.<<NUM_COLIS>>             AS "num_colis",
    l.<<TYPE_EMBALLAGE>>        AS "type_contenant",
    l.<<NUM_TOURNEE_PREP>>      AS "tournee_wms",
    ROUND(t.duree_min, 1)       AS "duree_tournee_min"
FROM        <<SCHEMA>>.<<TABLE_LIGNES_PREPA>>  l
JOIN        t                                   ON t.tournee = l.<<NUM_TOURNEE_PREP>>
JOIN        <<SCHEMA>>.<<TABLE_ARTICLES>>      a ON a.<<CODE_ARTICLE>> = l.<<CODE_ARTICLE>>
LEFT JOIN   <<SCHEMA>>.<<TABLE_EMPLACEMENTS>>  e ON e.<<CODE_EMPLACEMENT>> = l.<<CODE_EMPLACEMENT>>
WHERE       t.duree_min BETWEEN 2 AND 180
  AND       l.<<STATUT_LIGNE>> IN (<<STATUTS_PRELEVE>>)    -- mêmes lignes que celles qui ont fait la durée
ORDER BY    l.<<NUM_TOURNEE_PREP>>
