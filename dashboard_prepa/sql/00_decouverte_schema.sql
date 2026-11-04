-- =====================================================================
--  DASHBOARD PRÉPARATION CLR — 00 · CONTRÔLES LOGYS (lecture seule)
--  À lancer une fois dans SQL Developer (F5), avec le compte de lecture
--  du fichier « Suivi activité préparation ».
-- ---------------------------------------------------------------------
--  Les tables viennent de l'ancien fichier (V4.69) :
--    REXEL.F_GESTOURPREP_TOUR  tournées de préparation (temps réel)
--    LIG_TOUR                  lignes de tournée (répartition du jour)
--    REXEL.TOURNEE, REXEL.TRACE_REAL, REXEL.PERSONNE  préparateurs en cours
--  Ces contrôles vérifient les valeurs utilisées par le classeur et
--  cherchent la colonne emplacement (allée câble).
-- =====================================================================
SET DEFINE OFF


-- C1. Colonnes des tables utilisées (et recherche d'un emplacement / allée)
SELECT
    owner,
    table_name,
    column_id,
    column_name,
    data_type
FROM all_tab_columns
WHERE table_name IN ('F_GESTOURPREP_TOUR', 'LIG_TOUR', 'TOURNEE')
ORDER BY owner, table_name, column_id;


-- C2. Sous-types et états présents sur 7 jours (vérifier DETAIL, CARTON,
--     HORS GAB, VRAC, LONGUEUR, PALETTE, CABLE et LANCEE, ENCOURS, PRELEVE)
SELECT
    UPPER(TRIM(t.L_STYP_TOUR))  AS styp,
    t.L_ETAT_TOUR               AS etat,
    COUNT(*)                    AS tournees,
    SUM(t.NB_LIG_PREV)          AS lig_prev,
    SUM(t.NB_LIG_TERM)          AS lig_term
FROM REXEL.F_GESTOURPREP_TOUR t
WHERE t.DAT_MAJ >= TRUNC(SYSDATE) - 7
GROUP BY UPPER(TRIM(t.L_STYP_TOUR)), t.L_ETAT_TOUR
ORDER BY 1, 2;


-- C3. Zones de prise par sous-type sur 7 jours (compléter l'onglet ZONES)
SELECT
    UPPER(TRIM(t.L_STYP_TOUR))                   AS styp,
    NVL(UPPER(TRIM(t.ZONE_MVT_PRISE)), '(VIDE)') AS zone,
    COUNT(*)                                     AS tournees,
    SUM(t.NB_LIG_PREV)                           AS lig_prev
FROM REXEL.F_GESTOURPREP_TOUR t
WHERE t.DAT_MAJ >= TRUNC(SYSDATE) - 7
GROUP BY UPPER(TRIM(t.L_STYP_TOUR)), NVL(UPPER(TRIM(t.ZONE_MVT_PRISE)), '(VIDE)')
ORDER BY 1, 4 DESC;


-- C4. La vue garde-t-elle les tournées terminées ? (sinon la « prod » du
--     jour ne compterait que les tournées encore actives)
SELECT
    t.L_ETAT_TOUR       AS etat,
    COUNT(*)            AS tournees,
    SUM(t.NB_LIG_TERM)  AS lig_term
FROM REXEL.F_GESTOURPREP_TOUR t
WHERE t.DAT_MAJ >= TRUNC(SYSDATE)
GROUP BY t.L_ETAT_TOUR
ORDER BY 2 DESC;


-- C5. Colonnes de LIG_TOUR qui ressemblent à un emplacement (allée câble)
SELECT
    owner,
    column_name,
    data_type
FROM all_tab_columns
WHERE table_name = 'LIG_TOUR'
  AND (   column_name LIKE '%EMP%'
       OR column_name LIKE '%ALL%'
       OR column_name LIKE '%ADR%'
       OR column_name LIKE '%LOC%')
ORDER BY owner, column_name;
