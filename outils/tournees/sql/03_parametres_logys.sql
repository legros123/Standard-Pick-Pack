-- ============================================================================
-- 03 — PARAMÈTRES LOGYS UTILES AUX TOURNÉES — LECTURE SEULE
-- ----------------------------------------------------------------------------
-- À relancer si Logys change : les valeurs alimentent les RÉGLAGES en tête de
-- optimiseur_tournees.py. Lancer une requête à la fois (sans le « ; » sous Excel).
-- ============================================================================

-- 1. Limites par type de tournée (poids g, volume, contenants, lignes)
SELECT TYP_TOUR, STYP_TOUR, ZONE_MVT, PDS_MAX, VOL_MAX, CONT_MAX, LIG_MAX, TOUR_MAX, NB_LIG_AUTO, LANCE_AUTO
FROM   REXEL.MODEL_REAL
WHERE  TYP_TOUR = 'PREP'
  AND  STYP_TOUR IN ('DETA', 'CART')
ORDER  BY STYP_TOUR, ZONE_MVT;

-- 2. Chemin de préparation : ordre des allées et sens de circulation (zone pick)
SELECT STYP_TOUR, ZONE_MVT, ALLEE_MVT, INC_CHEMIN, SENS_CIRCU, SENS_PROF_RACK,
       COD_PROF_RACK_DEBUT, COD_PROF_RACK_FIN
FROM   REXEL.CHEMIN_EMP
WHERE  ZONE_MVT = 'PICK01A14'
ORDER  BY STYP_TOUR, INC_CHEMIN;

-- 3. Dimensions réelles des contenants utilisés sur 30 jours (mm)
SELECT NUM_ART_EMB AS "TYPE_CONTENANT", STYP_CONT AS "SERVICE", COUNT(*) AS "NB",
       MEDIAN(DIM_X) AS "DIM_X", MEDIAN(DIM_Y) AS "DIM_Y", MEDIAN(DIM_Z) AS "DIM_Z"
FROM   REXEL.CONTENANT
WHERE  DAT_CREA >= TRUNC(SYSDATE) - 30
  AND  DAT_CREA <  TRUNC(SYSDATE) + 1
GROUP  BY NUM_ART_EMB, STYP_CONT
ORDER  BY COUNT(*) DESC;
