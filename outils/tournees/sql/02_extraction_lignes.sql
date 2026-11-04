-- ============================================================================
-- 02 — EXTRACTION DES LIGNES À PRÉPARER -> entrée de optimiseur_tournees.py
-- ----------------------------------------------------------------------------
-- LECTURE SEULE. Les noms entre <<…>> sont des REPÈRES à remplacer par les vrais
-- noms trouvés avec 01_decouverte_schema.sql : ils ne sont PAS inventés ici car
-- le dictionnaire du WMS n'a pas été fourni.
--
-- Les alias de colonnes ("commande", "emplacement"…) sont ceux que lit
-- l'optimiseur : ne pas les changer. Les colonnes facultatives peuvent rester
-- à NULL (l'optimiseur sait faire sans, avec une précision moindre).
--
-- Excel / Power Query / ODBC : pas de point-virgule final (ORA-00911),
-- paramètres en ? si besoin. Enregistrer le résultat en CSV (séparateur ;)
-- ou en XLSX, puis :  python3 outils/tournees/optimiseur_tournees.py lignes.csv
--
-- Filtre de date en bornes semi-ouvertes (index utilisable, pas de TRUNC sur la colonne).
-- ============================================================================
SELECT
    l.<<NUM_COMMANDE>>                         AS "commande",          -- n° de BL / commande (obligatoire)
    c.<<CODE_CLIENT>>                          AS "client",            -- client ou agence
    CASE
        WHEN c.<<TYPE_COMMANDE>> IN (<<CODES_AGENCE>>)   THEN 'AGENCE'    -- MAD agences, bacs bleus
        WHEN c.<<TYPE_COMMANDE>> IN (<<CODES_REASSORT>>) THEN 'REASSORT'  -- bacs jaunes
        ELSE 'CLIENT'                                                     -- cartons d'expédition
    END                                        AS "flux",
    TO_CHAR(c.<<HEURE_DEPART>>, 'HH24"H"MI')   AS "vague",             -- départ transport / cut-off
    e.<<CODE_EMPLACEMENT>>                     AS "emplacement",       -- allée-EP-niveau (ex. 11-05-B)
    e.<<ALLEE>>                                AS "allee",             -- facultatif si l'emplacement est lisible
    e.<<ENTRE_POTEAU>>                         AS "ep",                -- facultatif
    e.<<NIVEAU>>                               AS "niveau",            -- facultatif
    l.<<CODE_ARTICLE>>                         AS "reference",
    a.<<LIBELLE_ARTICLE>>                      AS "designation",
    l.<<QTE_A_PREPARER>>                       AS "quantite",
    a.<<POIDS_UNITAIRE_KG>>                    AS "poids_unitaire_kg",
    a.<<VOLUME_UNITAIRE_L>>                    AS "volume_unitaire_l", -- facultatif (dm3 = litres ; si m3 : × 1000)
    l.<<NUM_COLIS>>                            AS "num_colis",         -- facultatif : colis déjà calculé par le WMS
    l.<<TYPE_EMBALLAGE>>                       AS "type_contenant",    -- facultatif : C9…C16, D11, B13, B16, A11…
    l.<<NUM_TOURNEE_PREP>>                     AS "tournee_wms",       -- facultatif : tournée actuelle (comparaison)
    CASE WHEN a.<<CLASSE_ADR>> IS NOT NULL AND a.<<CLASSE_ADR>> LIKE '2%' THEN 'O' END AS "aerosol",   -- à adapter
    CASE WHEN a.<<FAMILLE>> IN (<<FAMILLES_BATTERIE>>)                    THEN 'O' END AS "batterie"   -- à adapter
FROM        <<SCHEMA>>.<<TABLE_LIGNES_PREPA>>   l
JOIN        <<SCHEMA>>.<<TABLE_COMMANDES>>      c  ON c.<<NUM_COMMANDE>>    = l.<<NUM_COMMANDE>>
JOIN        <<SCHEMA>>.<<TABLE_ARTICLES>>       a  ON a.<<CODE_ARTICLE>>    = l.<<CODE_ARTICLE>>
LEFT JOIN   <<SCHEMA>>.<<TABLE_EMPLACEMENTS>>   e  ON e.<<CODE_EMPLACEMENT>> = l.<<CODE_EMPLACEMENT>>
WHERE       l.<<STATUT_LIGNE>> IN (<<STATUTS_A_PREPARER>>)     -- lignes lancées, pas encore prélevées
  AND       c.<<DATE_PREPA>> >= TRUNC(SYSDATE)                   -- aujourd'hui…
  AND       c.<<DATE_PREPA>> <  TRUNC(SYSDATE) + 1               -- …jusqu'à minuit (bornes semi-ouvertes)
  AND       (e.<<ZONE>> IN (<<ZONES_PICK_AND_PACK>>)             -- uniquement la zone Pick & Pack…
             OR e.<<CODE_EMPLACEMENT>> IS NULL)                  -- …sans perdre les lignes sans emplacement
                                                                 --   (signalées en ANOMALIES par l'optimiseur)
ORDER BY    c.<<HEURE_DEPART>>, l.<<NUM_COMMANDE>>
