-- ============================================================================
-- 01 — DÉCOUVERTE DU SCHÉMA DU WMS (Oracle) — LECTURE SEULE
-- ----------------------------------------------------------------------------
-- But : trouver les vraies tables / colonnes du WMS qui portent les commandes,
--       lignes de préparation, emplacements, colis et tournées, pour remplir les
--       repères <<…>> de 02_extraction_lignes.sql.
-- À lancer une requête à la fois (SQL Developer, Toad, ou Excel > Données >
-- Autres sources > ODBC — dans ce cas retirer le « ; » final, sinon ORA-00911).
-- Aucune requête ne modifie la base.
-- Remplacer :SCHEMA par le propriétaire des tables du WMS (ex. le compte applicatif).
-- ============================================================================

-- 1. Qui suis-je, quelle base, quelle version (FETCH FIRST n'existe qu'en 12c+)
SELECT SYS_CONTEXT('USERENV', 'SESSION_USER') AS "Utilisateur",
       SYS_CONTEXT('USERENV', 'DB_NAME')      AS "Base"
FROM   DUAL;

SELECT banner AS "Version" FROM v$version WHERE banner LIKE 'Oracle%';
-- (peut être refusé selon les droits : sans gravité)

-- 2. Schémas qui contiennent le plus de tables (le WMS est en général le plus gros)
SELECT owner           AS "Schéma",
       COUNT(*)        AS "Nb tables"
FROM   all_tables
WHERE  owner NOT IN ('SYS','SYSTEM','XDB','MDSYS','CTXSYS','ORDSYS','ORDDATA','OUTLN','DBSNMP','WMSYS','APPQOSSYS')
GROUP  BY owner
ORDER  BY COUNT(*) DESC;

-- 3. Tables / vues candidates par mot-clé du métier
--    (TOURN = tournée, PREP = préparation, COLIS, EMPL / ADR = emplacement, BL, CDE = commande, ART = article)
SELECT owner, object_name AS "Table ou vue", object_type AS "Type"
FROM   all_objects
WHERE  owner = :SCHEMA
  AND  object_type IN ('TABLE', 'VIEW')
  AND  REGEXP_LIKE(object_name, 'TOURN|PREP|PICK|COLIS|EMPL|ADR|LOC|BL|CDE|CMD|COMM|ART|LIGN|VAGUE|DEPART|EMBAL|CONTEN', 'i')
ORDER  BY object_name;

-- 4. Colonnes candidates (le nom de colonne en dit souvent plus que le nom de table)
SELECT table_name  AS "Table",
       column_name AS "Colonne",
       data_type   AS "Type",
       num_nulls,
       num_distinct
FROM   all_tab_columns
WHERE  owner = :SCHEMA
  AND  REGEXP_LIKE(column_name, 'TOURN|EMPL|ADR|ALLEE|NIV|COLIS|EMBAL|CONTEN|POIDS|VOL|QTE|QTY|BL|VAGUE|DEPART|TRANSP|OPER|STATUT|ETAT', 'i')
ORDER  BY table_name, column_id;

-- 5. Détail d'une table repérée (colonnes, types, nullabilité)
SELECT column_id, column_name, data_type, data_length, nullable
FROM   all_tab_columns
WHERE  owner = :SCHEMA
  AND  table_name = :TABLE
ORDER  BY column_id;

-- 6. Clés étrangères d'une table : pour savoir comment joindre ligne -> commande -> tournée -> emplacement
SELECT cc.column_name   AS "Colonne",
       rc.table_name    AS "Table référencée",
       rcc.column_name  AS "Colonne référencée"
FROM   all_constraints c
JOIN   all_cons_columns cc  ON cc.owner = c.owner AND cc.constraint_name = c.constraint_name
JOIN   all_constraints rc   ON rc.owner = c.r_owner AND rc.constraint_name = c.r_constraint_name
JOIN   all_cons_columns rcc ON rcc.owner = rc.owner AND rcc.constraint_name = rc.constraint_name
                           AND rcc.position = cc.position
WHERE  c.owner = :SCHEMA
  AND  c.table_name = :TABLE
  AND  c.constraint_type = 'R'
ORDER  BY cc.column_name;

-- 7. Index d'une table : filtrer de préférence sur des colonnes indexées (date, statut)
SELECT i.index_name,
       LISTAGG(ic.column_name, ', ') WITHIN GROUP (ORDER BY ic.column_position) AS "Colonnes"
FROM   all_indexes i
JOIN   all_ind_columns ic ON ic.index_owner = i.owner AND ic.index_name = i.index_name
WHERE  i.owner = :SCHEMA
  AND  i.table_name = :TABLE
GROUP  BY i.index_name;

-- 8. Valeurs prises par une colonne de statut (pour trouver « à préparer » / « en cours » / « terminé »)
--    Remplacer <<TABLE>> et <<COLONNE_STATUT>> puis lancer :
-- SELECT <<COLONNE_STATUT>> AS "Statut", COUNT(*) AS "Nb"
-- FROM   :SCHEMA.<<TABLE>>
-- GROUP  BY <<COLONNE_STATUT>>
-- ORDER  BY COUNT(*) DESC
