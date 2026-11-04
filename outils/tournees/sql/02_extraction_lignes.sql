-- ============================================================================
-- 02 — LIGNES DE TOURNÉE DU JOUR -> entrée de optimiseur_tournees.py
-- ----------------------------------------------------------------------------
-- LECTURE SEULE. Tables et colonnes vérifiées dans le dictionnaire Logys
-- (schéma REXEL, Oracle 19c) : LIG_TOUR, CONTENANT.
-- Les alias sont ceux que lit l'optimiseur (mêmes noms que la requête
-- « Requête2 » du classeur Dictionnaire tournée) : ne pas les changer.
--
-- Excel / Power Query / ODBC : pas de point-virgule final.
-- Période : lignes de tournée créées ou mises à jour aujourd'hui (bornes
-- semi-ouvertes sur la colonne brute, index utilisable). Pour un autre jour :
-- remplacer TRUNC(SYSDATE) par TO_DATE('2026-10-21', 'YYYY-MM-DD') aux deux endroits.
--
-- LEFT JOIN : une ligne dont le colis n'est pas encore créé est gardée (TYPE_CONTENANT
-- vide) et l'optimiseur calcule le contenant lui-même.
-- À VÉRIFIER une fois : TYPE_CONTENANT = CONTENANT.NUM_ART_EMB (C16, C11, B16…).
-- Si votre Requête3 prend le type ailleurs, reprendre la même colonne ici.
-- ============================================================================
SELECT
    TRUNC(lt.DAT_MAJ)          AS "JOUR",
    lt.NUM_ORDRE_PREP          AS "VAGUE",            -- VAGxxxxxxx
    lt.NUM_TOUR                AS "CHARIOT",          -- tournée Logys (comparaison)
    lt.STYP_TOUR               AS "STYP_TOUR",        -- DETA / CART
    lt.ZONE_MVT_PRISE          AS "ZONE",             -- PICK01A14 = zone optimisée
    lt.NUM_ORDRE               AS "COMMANDE",
    lt.NUM_CHEMIN_PRISE        AS "ORDRE_PASSAGE",
    lt.NUM_ART                 AS "ARTICLE",
    lt.PREV                    AS "QTE_PREVUE",
    lt.PDS                     AS "PDS_LIGNE",        -- grammes
    lt.VOL                     AS "VOL_LIGNE",        -- 1/100 cm³ (unité Logys)
    lt.EMP_PRISE               AS "EMPLACEMENT",      -- 54APP + allée + position + niveau
    lt.ALLEE_MVT_PRISE         AS "ALLEE",
    lt.NUM_CONT_DEPOSE         AS "CONTENANT",        -- n° du colis
    CASE WHEN lt.STYP_TOUR = 'CART' AND c.NUM_ART_EMB IS NULL THEN 'CARTON'
         ELSE c.NUM_ART_EMB END AS "TYPE_CONTENANT",    -- carton complet : le carton fournisseur
    lt.ETAT_LIG_TOUR           AS "ETAT_LIGNE"        -- les lignes ANNU sont écartées par l'optimiseur
FROM        REXEL.LIG_TOUR   lt
LEFT JOIN   REXEL.CONTENANT  c   ON c.NUM_CONT = lt.NUM_CONT_DEPOSE
WHERE       lt.TYP_TOUR = 'PREP'
  AND       lt.DAT_MAJ >= TRUNC(SYSDATE)
  AND       lt.DAT_MAJ <  TRUNC(SYSDATE) + 1
ORDER BY    lt.NUM_ORDRE_PREP, lt.NUM_TOUR, lt.NUM_CHEMIN_PRISE
