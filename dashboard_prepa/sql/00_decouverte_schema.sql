-- =====================================================================
--  DASHBOARD PRÉPARATION CLR — 00 · DÉCOUVERTE DU SCHÉMA LOGYS
--  Oracle, LECTURE SEULE. À lancer une fois dans SQL Developer (F5).
-- ---------------------------------------------------------------------
--  But : trouver la table (ou vue) des lignes de préparation et ses
--  colonnes pour remplir les DEFINE de requetes_prepa.sql et le bloc 7
--  de l'onglet PARAMETRES du classeur.
--
--  Seule colonne confirmée : ZONE_MVT (colonne D de l'extraction
--  journalière HG « JJ-MM-AAAA.xlsx », avec NOM en H et Nb de lignes
--  en M). La requête qui produit cette extraction donne directement la
--  table et les jointures : la récupérer si possible.
--
--  Ce qu'il faut repérer :
--    1. la table des lignes de préparation (une ligne = une ligne à préparer)
--    2. la colonne STATUT (et ses codes : lancée / en cours / validée)
--    3. la colonne EMPLACEMENT (pour l'allée câble)
--    4. la colonne PRÉPARATEUR (le NOM de l'extraction)
--    5. la colonne DATE DE VALIDATION (date + heure)
-- =====================================================================
SET DEFINE ON
SET VERIFY OFF


-- D1. Version Oracle (peut être refusé selon les droits : sans gravité)
SELECT banner
FROM v$version;


-- D2. Tables et vues qui portent la colonne ZONE_MVT
SELECT
    owner,
    table_name,
    column_id,
    data_type
FROM all_tab_columns
WHERE column_name LIKE '%ZONE%MVT%'
ORDER BY owner, table_name;


-- D3. Toutes les colonnes de ces tables, avec leurs commentaires
--     (repérer statut, emplacement, préparateur, dates, nb de lignes)
SELECT
    c.owner,
    c.table_name,
    c.column_id,
    c.column_name,
    c.data_type,
    cc.comments
FROM all_tab_columns c
LEFT JOIN all_col_comments cc
       ON cc.owner       = c.owner
      AND cc.table_name  = c.table_name
      AND cc.column_name = c.column_name
WHERE (c.owner, c.table_name) IN (
        SELECT owner, table_name
        FROM all_tab_columns
        WHERE column_name LIKE '%ZONE%MVT%'
      )
ORDER BY c.owner, c.table_name, c.column_id;


-- D4. Commentaires des tables trouvées (TABLE ou VIEW)
SELECT
    t.owner,
    t.table_name,
    t.table_type,
    t.comments
FROM all_tab_comments t
WHERE (t.owner, t.table_name) IN (
        SELECT owner, table_name
        FROM all_tab_columns
        WHERE column_name LIKE '%ZONE%MVT%'
      )
ORDER BY t.owner, t.table_name;


-- =====================================================================
--  Étape 2 : renseigner la table candidate trouvée ci-dessus, puis
--  relancer le script (F5). Les requêtes D5 à D8 sont des GROUP BY :
--  sur une très grosse table, les lancer hors pointe.
-- =====================================================================
DEFINE TABLE_CANDIDATE      = "A_RENSEIGNER"
DEFINE COL_STATUT_CANDIDATE = "A_RENSEIGNER"
DEFINE COL_EMPL_CANDIDATE   = "A_RENSEIGNER"
DEFINE COL_DATE_CANDIDATE   = "A_RENSEIGNER"


-- D5. Codes de statut et volumes des 7 derniers jours
--     (identifier : lancée = pas encore prise, en cours = prise par un
--      préparateur, validée = préparée)
SELECT
    &&COL_STATUT_CANDIDATE AS statut,
    COUNT(*)               AS nb_lignes,
    MIN(&&COL_DATE_CANDIDATE) AS premiere_date,
    MAX(&&COL_DATE_CANDIDATE) AS derniere_date
FROM &&TABLE_CANDIDATE
WHERE &&COL_DATE_CANDIDATE >= TRUNC(SYSDATE) - 7
GROUP BY &&COL_STATUT_CANDIDATE
ORDER BY nb_lignes DESC;


-- D6. Zones présentes sur 7 jours (pour compléter l'onglet ZONES)
SELECT
    ZONE_MVT,
    COUNT(*) AS nb_lignes
FROM &&TABLE_CANDIDATE
WHERE &&COL_DATE_CANDIDATE >= TRUNC(SYSDATE) - 7
GROUP BY ZONE_MVT
ORDER BY nb_lignes DESC;


-- D7. Emplacements de la zone CABLE : où se trouve l'allée dans le code ?
--     (ex. « 41-03-B » -> allée = SUBSTR(emplacement, 1, 2))
SELECT *
FROM (
    SELECT
        &&COL_EMPL_CANDIDATE AS emplacement,
        COUNT(*)             AS nb_lignes
    FROM &&TABLE_CANDIDATE
    WHERE ZONE_MVT = 'CABLE'
      AND &&COL_DATE_CANDIDATE >= TRUNC(SYSDATE) - 30
    GROUP BY &&COL_EMPL_CANDIDATE
    ORDER BY nb_lignes DESC
)
WHERE ROWNUM <= 60;


-- D8. Index de la table : statut et date doivent être indexés pour une
--     actualisation rapide toutes les 5 minutes
SELECT
    index_name,
    column_name,
    column_position
FROM all_ind_columns
WHERE table_owner || '.' || table_name = UPPER('&&TABLE_CANDIDATE')
   OR table_name = UPPER('&&TABLE_CANDIDATE')
ORDER BY index_name, column_position;
