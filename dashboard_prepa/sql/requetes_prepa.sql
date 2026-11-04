-- =====================================================================
--  DASHBOARD PRÉPARATION CLR — REQUÊTES LOGYS (Oracle, LECTURE SEULE)
--  Pick · Câble · Hors gabarit : lignes lancées / en cours / préparées
-- ---------------------------------------------------------------------
--  Exécution : SQL Developer, F5 (« Exécuter le script »).
--
--  LE SEUL ENDROIT À ADAPTER, ce sont les DEFINE ci-dessous. Recopier
--  les mêmes valeurs dans l'onglet PARAMETRES du classeur (bloc 7) :
--  le classeur génère alors tout seul la requête Q6 pour Excel.
--
--  Les noms de table, de colonnes et les codes statut de Logys ne sont
--  pas connus ici : seule la colonne ZONE_MVT est confirmée (extraction
--  journalière HG). Lancer d'abord 00_decouverte_schema.sql.
--
--  Une ligne n'est comptée qu'une fois : en cours avant lancée, avant
--  préparée (une ligne en cours n'est jamais aussi comptée lancée).
--
--  Q1 Pick           lancées / en cours / préparées du jour
--  Q2 Hors gabarit   par zone (sol, longueur 2 m, longueur 3 m, rétract, rétract longueur)
--  Q3 Hors gabarit   détail par ZONE_MVT (pour établir le découpage)
--  Q4 Câble          par allée (lancées / en cours / préparées / dont rétract)
--  Q5 Câble          nombre de rétract
--  Q6 Modèle Excel   tout en une requête (utilisée par le classeur)
--  Q7 Analyse        découpage réel Pick / Câble / HG sur N jours
--  Q8 Calibrage      cadence moyenne par préparateur et par zone (indicatif)
-- =====================================================================
SET DEFINE ON
SET VERIFY OFF

-- ---------------------------------------------------------------------
--  1 · SOURCE LOGYS (à renseigner après 00_decouverte_schema.sql)
-- ---------------------------------------------------------------------
-- Table, vue ou jointure des lignes de préparation, avec un alias.
-- Forme attendue (exemple de forme, pas un vrai nom) : PROPRIETAIRE.TABLE l
DEFINE SOURCE         = "A_RENSEIGNER"

-- Colonne zone (confirmée). Préfixer de l'alias en cas de jointure : l.ZONE_MVT
DEFINE COL_ZONE       = "ZONE_MVT"

-- Allée câble tirée de l'emplacement. Forme : SUBSTR(l.EMPLACEMENT, 1, 2)
-- Laisser 'TOUTES' tant que l'allée n'est pas connue (une seule ligne câble).
DEFINE COL_ALLEE      = "'TOUTES'"

-- Préparateur affecté à la ligne (le NOM de l'extraction journalière).
DEFINE COL_PREPA      = "CAST(NULL AS VARCHAR2(1))"

-- Date + heure de validation de la ligne (type DATE ou TIMESTAMP).
DEFINE COL_DATE_VALID = "A_RENSEIGNER"

-- 1 si un enregistrement = une ligne, sinon la colonne « nb de lignes ».
DEFINE EXPR_NB_LIGNES = "1"

-- ---------------------------------------------------------------------
--  2 · STATUTS (conditions SQL complètes)
-- ---------------------------------------------------------------------
-- Ligne lancée, pas encore prise par un préparateur. Forme : l.STATUT = 'xx'
DEFINE COND_LANCE     = "A_RENSEIGNER"

-- Ligne prise par un préparateur, pas encore validée.
DEFINE COND_EN_COURS  = "A_RENSEIGNER"

-- Ligne validée (préparée), SANS filtre de date : la date est ajoutée par
-- les requêtes (aujourd'hui pour le suivi, N jours pour l'analyse).
DEFINE COND_VALIDEE   = "A_RENSEIGNER"

-- Ligne câble servie au rétract (ex. niveau d'emplacement en hauteur).
-- Laisser 1 = 0 tant que la règle n'est pas définie.
DEFINE COND_RETRACT   = "1 = 0"

-- Périmètre : site / dépôt / type de préparation. 1 = 1 = pas de filtre.
DEFINE COND_PERIMETRE = "1 = 1"

-- ---------------------------------------------------------------------
--  3 · DÉCOUPAGE DES ZONES (identique à l'onglet ZONES du classeur)
--      Source : macro d'import HG_Cable V17 (Module1) + suivi op HG.
--      Toute zone absente de ces listes est comptée en PICK.
-- ---------------------------------------------------------------------
DEFINE ZONES_CABLE           = "'CABLE'"
DEFINE ZONES_HG_SOL1         = "'COURONNES','COURONNE','AEROSOLS','BARDAGE','PICK01A14','CHAUFFAGE','PREPARATEUR','PANNEAUX','HGAEMBALLER','GAINES','PLAFONNIERS'"
DEFINE ZONES_HG_SOL2         = "'ECLAIRAGE','ECLAIRAGE2','ECL3EMBALLAGE','ECL4DEPISEDIR','GAINESVENTIL','TOUPRECOND','COFFRETS','ZPROMOS','LONGUEUR1M','CHAUFFEEAU','VOLUMES'"
DEFINE ZONES_HG_LG2          = "'LONGUEUR2M','LG2DEPOSEDIR','LG2EMBALLAGE'"
DEFINE ZONES_HG_LG3          = "'LONGUEUR3M','LG3ALLEE32','IRL'"
DEFINE ZONES_HG_RETRACT      = "'ARETRACT','RETRACT'"
DEFINE ZONES_HG_RETRACT_LONG = "'RETRACT3435','EXTERIEUR','TUBECUIVRE','TUBE CUIVRE'"
-- Zones HG à ajouter plus tard (découpage à venir) : remplacer '#AUCUNE#'
DEFINE ZONES_HG_AUTRE        = "'#AUCUNE#'"

-- Analyse Q7 et Q8 : nombre de jours d'historique
DEFINE JOURS_ANALYSE         = "28"


-- =====================================================================
--  Q1 · PICK — lignes lancées, en cours, préparées aujourd'hui
-- =====================================================================
WITH base AS (
    SELECT
        NVL(UPPER(TRIM(&&COL_ZONE)), '(VIDE)') AS zone_mvt,
        CASE
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_CABLE)
            THEN NVL(TO_CHAR(&&COL_ALLEE), '(VIDE)')
        END AS allee,
        CASE
            WHEN (&&COND_EN_COURS) THEN 'EN_COURS'
            WHEN (&&COND_LANCE) THEN 'LANCE'
            WHEN (&&COND_VALIDEE) AND &&COL_DATE_VALID >= TRUNC(SYSDATE) THEN 'PREPAREE'
        END AS statut,
        CASE
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_CABLE) AND (&&COND_RETRACT)
            THEN 1 ELSE 0
        END AS retract,
        &&COL_PREPA AS prepa,
        &&EXPR_NB_LIGNES AS nb
    FROM &&SOURCE
    WHERE (&&COND_PERIMETRE)
      AND (   (&&COND_EN_COURS)
           OR (&&COND_LANCE)
           OR ((&&COND_VALIDEE) AND &&COL_DATE_VALID >= TRUNC(SYSDATE)))
)
SELECT
    NVL(SUM(CASE WHEN statut = 'LANCE'    THEN nb END), 0)        AS "Lignes lancées",
    NVL(SUM(CASE WHEN statut = 'EN_COURS' THEN nb END), 0)        AS "Lignes en cours",
    NVL(SUM(CASE WHEN statut = 'PREPAREE' THEN nb END), 0)        AS "Lignes préparées jour",
    COUNT(DISTINCT CASE WHEN statut = 'EN_COURS' THEN prepa END)  AS "Préparateurs en cours"
FROM base
WHERE statut IS NOT NULL
  AND zone_mvt NOT IN (&&ZONES_CABLE, &&ZONES_HG_SOL1, &&ZONES_HG_SOL2, &&ZONES_HG_LG2,
                       &&ZONES_HG_LG3, &&ZONES_HG_RETRACT, &&ZONES_HG_RETRACT_LONG, &&ZONES_HG_AUTRE);


-- =====================================================================
--  Q2 · HORS GABARIT — lignes lancées / en cours par zone
-- =====================================================================
WITH base AS (
    SELECT
        NVL(UPPER(TRIM(&&COL_ZONE)), '(VIDE)') AS zone_mvt,
        CASE
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_CABLE)
            THEN NVL(TO_CHAR(&&COL_ALLEE), '(VIDE)')
        END AS allee,
        CASE
            WHEN (&&COND_EN_COURS) THEN 'EN_COURS'
            WHEN (&&COND_LANCE) THEN 'LANCE'
            WHEN (&&COND_VALIDEE) AND &&COL_DATE_VALID >= TRUNC(SYSDATE) THEN 'PREPAREE'
        END AS statut,
        CASE
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_CABLE) AND (&&COND_RETRACT)
            THEN 1 ELSE 0
        END AS retract,
        &&COL_PREPA AS prepa,
        &&EXPR_NB_LIGNES AS nb
    FROM &&SOURCE
    WHERE (&&COND_PERIMETRE)
      AND (   (&&COND_EN_COURS)
           OR (&&COND_LANCE)
           OR ((&&COND_VALIDEE) AND &&COL_DATE_VALID >= TRUNC(SYSDATE)))
),
hg AS (
    SELECT
        CASE
            WHEN zone_mvt IN (&&ZONES_HG_SOL1, &&ZONES_HG_SOL2) THEN '1 SOL'
            WHEN zone_mvt IN (&&ZONES_HG_LG2)                   THEN '2 LONGUEUR 2M'
            WHEN zone_mvt IN (&&ZONES_HG_LG3)                   THEN '3 LONGUEUR 3M'
            WHEN zone_mvt IN (&&ZONES_HG_RETRACT)               THEN '4 RETRACT'
            WHEN zone_mvt IN (&&ZONES_HG_RETRACT_LONG)          THEN '5 RETRACT LONGUEUR'
            WHEN zone_mvt IN (&&ZONES_HG_AUTRE)                 THEN '6 AUTRE HG'
        END AS zone_hg,
        statut,
        prepa,
        nb
    FROM base
    WHERE statut IS NOT NULL
)
SELECT
    zone_hg                                                       AS "Zone HG",
    NVL(SUM(CASE WHEN statut = 'LANCE'    THEN nb END), 0)        AS "Lignes lancées",
    NVL(SUM(CASE WHEN statut = 'EN_COURS' THEN nb END), 0)        AS "Lignes en cours",
    NVL(SUM(CASE WHEN statut = 'PREPAREE' THEN nb END), 0)        AS "Lignes préparées jour",
    COUNT(DISTINCT CASE WHEN statut = 'EN_COURS' THEN prepa END)  AS "Préparateurs en cours"
FROM hg
WHERE zone_hg IS NOT NULL
GROUP BY zone_hg
ORDER BY zone_hg;


-- =====================================================================
--  Q3 · HORS GABARIT — détail par ZONE_MVT (contrôle du découpage)
-- =====================================================================
WITH base AS (
    SELECT
        NVL(UPPER(TRIM(&&COL_ZONE)), '(VIDE)') AS zone_mvt,
        CASE
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_CABLE)
            THEN NVL(TO_CHAR(&&COL_ALLEE), '(VIDE)')
        END AS allee,
        CASE
            WHEN (&&COND_EN_COURS) THEN 'EN_COURS'
            WHEN (&&COND_LANCE) THEN 'LANCE'
            WHEN (&&COND_VALIDEE) AND &&COL_DATE_VALID >= TRUNC(SYSDATE) THEN 'PREPAREE'
        END AS statut,
        CASE
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_CABLE) AND (&&COND_RETRACT)
            THEN 1 ELSE 0
        END AS retract,
        &&COL_PREPA AS prepa,
        &&EXPR_NB_LIGNES AS nb
    FROM &&SOURCE
    WHERE (&&COND_PERIMETRE)
      AND (   (&&COND_EN_COURS)
           OR (&&COND_LANCE)
           OR ((&&COND_VALIDEE) AND &&COL_DATE_VALID >= TRUNC(SYSDATE)))
)
SELECT
    CASE
        WHEN zone_mvt IN (&&ZONES_HG_SOL1, &&ZONES_HG_SOL2) THEN '1 SOL'
        WHEN zone_mvt IN (&&ZONES_HG_LG2)                   THEN '2 LONGUEUR 2M'
        WHEN zone_mvt IN (&&ZONES_HG_LG3)                   THEN '3 LONGUEUR 3M'
        WHEN zone_mvt IN (&&ZONES_HG_RETRACT)               THEN '4 RETRACT'
        WHEN zone_mvt IN (&&ZONES_HG_RETRACT_LONG)          THEN '5 RETRACT LONGUEUR'
        WHEN zone_mvt IN (&&ZONES_HG_AUTRE)                 THEN '6 AUTRE HG'
        WHEN zone_mvt IN (&&ZONES_CABLE)                    THEN 'CABLE'
        ELSE 'PICK (non répertoriée)'
    END                                                           AS "Zone dashboard",
    zone_mvt                                                      AS "ZONE_MVT",
    NVL(SUM(CASE WHEN statut = 'LANCE'    THEN nb END), 0)        AS "Lignes lancées",
    NVL(SUM(CASE WHEN statut = 'EN_COURS' THEN nb END), 0)        AS "Lignes en cours",
    NVL(SUM(CASE WHEN statut = 'PREPAREE' THEN nb END), 0)        AS "Lignes préparées jour"
FROM base
WHERE statut IS NOT NULL
GROUP BY zone_mvt
ORDER BY 1, 2;


-- =====================================================================
--  Q4 · CÂBLE — lignes lancées / en cours par allée (+ dont rétract)
-- =====================================================================
WITH base AS (
    SELECT
        NVL(UPPER(TRIM(&&COL_ZONE)), '(VIDE)') AS zone_mvt,
        CASE
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_CABLE)
            THEN NVL(TO_CHAR(&&COL_ALLEE), '(VIDE)')
        END AS allee,
        CASE
            WHEN (&&COND_EN_COURS) THEN 'EN_COURS'
            WHEN (&&COND_LANCE) THEN 'LANCE'
            WHEN (&&COND_VALIDEE) AND &&COL_DATE_VALID >= TRUNC(SYSDATE) THEN 'PREPAREE'
        END AS statut,
        CASE
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_CABLE) AND (&&COND_RETRACT)
            THEN 1 ELSE 0
        END AS retract,
        &&COL_PREPA AS prepa,
        &&EXPR_NB_LIGNES AS nb
    FROM &&SOURCE
    WHERE (&&COND_PERIMETRE)
      AND (   (&&COND_EN_COURS)
           OR (&&COND_LANCE)
           OR ((&&COND_VALIDEE) AND &&COL_DATE_VALID >= TRUNC(SYSDATE)))
)
SELECT
    allee                                                         AS "Allée",
    NVL(SUM(CASE WHEN statut = 'LANCE'    THEN nb END), 0)        AS "Lignes lancées",
    NVL(SUM(CASE WHEN statut = 'EN_COURS' THEN nb END), 0)        AS "Lignes en cours",
    NVL(SUM(CASE WHEN statut = 'PREPAREE' THEN nb END), 0)        AS "Lignes préparées jour",
    NVL(SUM(CASE WHEN statut IN ('LANCE', 'EN_COURS')
                  AND retract = 1 THEN nb END), 0)                AS "dont rétract à faire",
    COUNT(DISTINCT CASE WHEN statut = 'EN_COURS' THEN prepa END)  AS "Préparateurs en cours"
FROM base
WHERE statut IS NOT NULL
  AND zone_mvt IN (&&ZONES_CABLE)
GROUP BY allee
ORDER BY allee;


-- =====================================================================
--  Q5 · CÂBLE — nombre de rétract
-- =====================================================================
WITH base AS (
    SELECT
        NVL(UPPER(TRIM(&&COL_ZONE)), '(VIDE)') AS zone_mvt,
        CASE
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_CABLE)
            THEN NVL(TO_CHAR(&&COL_ALLEE), '(VIDE)')
        END AS allee,
        CASE
            WHEN (&&COND_EN_COURS) THEN 'EN_COURS'
            WHEN (&&COND_LANCE) THEN 'LANCE'
            WHEN (&&COND_VALIDEE) AND &&COL_DATE_VALID >= TRUNC(SYSDATE) THEN 'PREPAREE'
        END AS statut,
        CASE
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_CABLE) AND (&&COND_RETRACT)
            THEN 1 ELSE 0
        END AS retract,
        &&COL_PREPA AS prepa,
        &&EXPR_NB_LIGNES AS nb
    FROM &&SOURCE
    WHERE (&&COND_PERIMETRE)
      AND (   (&&COND_EN_COURS)
           OR (&&COND_LANCE)
           OR ((&&COND_VALIDEE) AND &&COL_DATE_VALID >= TRUNC(SYSDATE)))
)
SELECT
    NVL(SUM(CASE WHEN statut = 'LANCE'    THEN nb END), 0)        AS "Rétract lancées",
    NVL(SUM(CASE WHEN statut = 'EN_COURS' THEN nb END), 0)        AS "Rétract en cours",
    NVL(SUM(CASE WHEN statut = 'PREPAREE' THEN nb END), 0)        AS "Rétract préparées jour"
FROM base
WHERE statut IS NOT NULL
  AND zone_mvt IN (&&ZONES_CABLE)
  AND retract = 1;


-- =====================================================================
--  Q6 · MODÈLE EXCEL — tout en une requête, regroupé par zone / allée /
--  statut. C'est ce texte que l'onglet REQUETES du classeur contient, et
--  le classeur remplace lui-même les jetons et fait la ventilation
--  Pick / Câble / HG avec l'onglet ZONES.
--  Colonnes renvoyées : ZONE_MVT, ALLEE, STATUT, RETRACT, NB_LIGNES, NB_PREPA
-- =====================================================================
-- >>> MODELE EXCEL (début)
WITH base AS (
    SELECT
        NVL(UPPER(TRIM(&&COL_ZONE)), '(VIDE)') AS zone_mvt,
        CASE
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_CABLE)
            THEN NVL(TO_CHAR(&&COL_ALLEE), '(VIDE)')
        END AS allee,
        CASE
            WHEN (&&COND_EN_COURS) THEN 'EN_COURS'
            WHEN (&&COND_LANCE) THEN 'LANCE'
            WHEN (&&COND_VALIDEE) AND &&COL_DATE_VALID >= TRUNC(SYSDATE) THEN 'PREPAREE'
        END AS statut,
        CASE
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_CABLE) AND (&&COND_RETRACT)
            THEN 1 ELSE 0
        END AS retract,
        &&COL_PREPA AS prepa,
        &&EXPR_NB_LIGNES AS nb
    FROM &&SOURCE
    WHERE (&&COND_PERIMETRE)
      AND (   (&&COND_EN_COURS)
           OR (&&COND_LANCE)
           OR ((&&COND_VALIDEE) AND &&COL_DATE_VALID >= TRUNC(SYSDATE)))
)
SELECT
    zone_mvt              AS "ZONE_MVT",
    allee                 AS "ALLEE",
    statut                AS "STATUT",
    retract               AS "RETRACT",
    SUM(nb)               AS "NB_LIGNES",
    COUNT(DISTINCT prepa) AS "NB_PREPA"
FROM base
WHERE statut IS NOT NULL
GROUP BY zone_mvt, allee, statut, retract
ORDER BY zone_mvt, allee, statut, retract;
-- <<< MODELE EXCEL (fin)


-- =====================================================================
--  Q7 · ANALYSE DU DÉCOUPAGE — lignes préparées sur les N derniers jours
--  (jour en cours exclu). Sert à remplacer 73 % / 4 % / 23 % et la
--  répartition HG par zone (onglet PARAMETRES, blocs 1 et 3).
-- =====================================================================
WITH hist AS (
    SELECT
        CASE
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_CABLE) THEN 'CABLE'
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_HG_SOL1, &&ZONES_HG_SOL2, &&ZONES_HG_LG2,
                                             &&ZONES_HG_LG3, &&ZONES_HG_RETRACT,
                                             &&ZONES_HG_RETRACT_LONG, &&ZONES_HG_AUTRE) THEN 'HG'
            ELSE 'PICK'
        END AS service,
        CASE
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_HG_SOL1, &&ZONES_HG_SOL2) THEN 'SOL'
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_HG_LG2)                   THEN 'LONGUEUR 2M'
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_HG_LG3)                   THEN 'LONGUEUR 3M'
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_HG_RETRACT)               THEN 'RETRACT'
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_HG_RETRACT_LONG)          THEN 'RETRACT LONGUEUR'
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_HG_AUTRE)                 THEN 'AUTRE HG'
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_CABLE)                    THEN 'CABLE'
            ELSE 'PICK'
        END AS zone_dash,
        TRUNC(&&COL_DATE_VALID) AS jour,
        &&EXPR_NB_LIGNES AS nb
    FROM &&SOURCE
    WHERE (&&COND_PERIMETRE)
      AND (&&COND_VALIDEE)
      AND &&COL_DATE_VALID >= TRUNC(SYSDATE) - &&JOURS_ANALYSE
      AND &&COL_DATE_VALID <  TRUNC(SYSDATE)
)
SELECT
    service                                                         AS "Service",
    zone_dash                                                       AS "Zone",
    SUM(nb)                                                         AS "Lignes",
    COUNT(DISTINCT jour)                                            AS "Jours",
    ROUND(SUM(nb) / NULLIF(COUNT(DISTINCT jour), 0))                AS "Lignes par jour",
    ROUND(100 * RATIO_TO_REPORT(SUM(nb)) OVER (), 1)                AS "% du total",
    ROUND(100 * RATIO_TO_REPORT(SUM(nb)) OVER (PARTITION BY service), 1) AS "% du service"
FROM hist
GROUP BY service, zone_dash
ORDER BY service, zone_dash;


-- =====================================================================
--  Q8 · CALIBRAGE DES CADENCES (indicatif) — lignes / heure / préparateur
--  par zone, sur les N derniers jours. Ne garde que les heures où le
--  préparateur n'a validé que dans UNE zone (heures « pures »).
--  Nécessite COL_PREPA. Comparer avec PARAMETRES, bloc 2.
-- =====================================================================
WITH hist AS (
    SELECT
        CASE
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_HG_SOL1, &&ZONES_HG_SOL2) THEN 'SOL'
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_HG_LG2)                   THEN 'LONGUEUR 2M'
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_HG_LG3)                   THEN 'LONGUEUR 3M'
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_HG_RETRACT)               THEN 'RETRACT'
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_HG_RETRACT_LONG)          THEN 'RETRACT LONGUEUR'
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_HG_AUTRE)                 THEN 'AUTRE HG'
            WHEN UPPER(TRIM(&&COL_ZONE)) IN (&&ZONES_CABLE)                    THEN 'CABLE'
            ELSE 'PICK'
        END AS zone_dash,
        &&COL_PREPA AS prepa,
        TRUNC(&&COL_DATE_VALID, 'HH24') AS heure,
        &&EXPR_NB_LIGNES AS nb
    FROM &&SOURCE
    WHERE (&&COND_PERIMETRE)
      AND (&&COND_VALIDEE)
      AND &&COL_DATE_VALID >= TRUNC(SYSDATE) - &&JOURS_ANALYSE
      AND &&COL_DATE_VALID <  TRUNC(SYSDATE)
),
par_heure AS (
    SELECT
        zone_dash,
        prepa,
        heure,
        SUM(nb) AS lignes,
        COUNT(*) OVER (PARTITION BY prepa, heure) AS nb_zones_heure
    FROM hist
    WHERE prepa IS NOT NULL
    GROUP BY zone_dash, prepa, heure
)
SELECT
    zone_dash                         AS "Zone",
    COUNT(*)                          AS "Heures préparateur",
    SUM(lignes)                       AS "Lignes",
    ROUND(SUM(lignes) / COUNT(*), 1)  AS "Lignes par heure",
    ROUND(MEDIAN(lignes), 1)          AS "Médiane par heure"
FROM par_heure
WHERE nb_zones_heure = 1
GROUP BY zone_dash
ORDER BY zone_dash;
