-- =====================================================================
--  DASHBOARD PRÉPARATION CLR — REQUÊTES LOGYS (Oracle, LECTURE SEULE)
--  Pick · Câble · Hors gabarit : lignes lancées / en cours / préparées
-- ---------------------------------------------------------------------
--  Exécution : SQL Developer, F5 (« Exécuter le script »), avec le même
--  compte de lecture que le fichier « Suivi activité préparation ».
--
--  Source : la vue des tournées de préparation déjà utilisée par
--  « Suivi activité préparation V4.69 » :
--    REXEL.F_GESTOURPREP_TOUR
--      L_ETAT_TOUR     LANCEE / ENCOURS / PRELEVE / ...
--      L_STYP_TOUR     DETAIL, CARTON           -> PICK
--                      HORS GAB, VRAC, LONGUEUR, PALETTE -> HORS GABARIT
--                      CABLE                    -> CÂBLE
--      ZONE_MVT_PRISE  zone de prise (COURONNES, LONGUEUR2M, ARETRACT, RETRACT...)
--      NB_LIG_PREV / NB_LIG_TERM / NB_LIG_ANNU  lignes prévues / terminées / annulées
--      OPE_MAJ, DAT_MAJ                         dernier opérateur, dernière mise à jour
--
--  Une ligne lancée = NB_LIG_PREV - NB_LIG_TERM - NB_LIG_ANNU d'une
--  tournée LANCEE. Une ligne en cours = le reste d'une tournée ENCOURS
--  (les lignes déjà terminées ne sont plus comptées, contrairement à
--  l'ancien fichier qui comptait NB_LIG_PREV en entier).
--  Rétract câble = zone RETRACT, rétract HG = zone ARETRACT.
--
--  Q1 Pick           lignes lancées, en cours, préparées du jour
--  Q2 Hors gabarit   par zone (sol, longueur 2 m, longueur 3 m, rétract, rétract longueur)
--  Q3 Hors gabarit   détail par ZONE_MVT_PRISE (contrôle du découpage)
--  Q4 Câble          coupes et rétract : lancées, en cours, préparées
--  Q5 Câble          nombre de lignes rétract
--  Q6 Modèle Excel   tout en une requête (utilisée par le classeur)
--  Q7 Analyse        répartition réelle Pick / Câble / HG sur N jours (LIG_TOUR)
--  Q8 Préparateurs   qui est en cours, sur quel service et quelle zone
-- =====================================================================
SET DEFINE ON
SET VERIFY OFF

-- Vue des tournées (même nom dans l'onglet PARAMETRES du classeur, bloc 7)
DEFINE VUE_TOURNEES   = "REXEL.F_GESTOURPREP_TOUR"
-- Filtre facultatif (dépôt, type...). 1 = 1 : aucun filtre
DEFINE COND_PERIMETRE = "1 = 1"
-- Nombre de jours d'historique pour Q7
DEFINE JOURS_ANALYSE  = "20"

-- Sous-types de tournée par service (repris de l'ancien fichier)
DEFINE STYP_PICK  = "'DETAIL','CARTON'"
DEFINE STYP_HG    = "'HORS GAB','VRAC','LONGUEUR','PALETTE'"
DEFINE STYP_CABLE = "'CABLE'"

-- Zones hors gabarit (identiques à l'onglet ZONES du classeur)
DEFINE ZONES_HG_SOL1         = "'COURONNES','COURONNES2','COURONNESVU','COURONNE','AEROSOLS','BARDAGE','PICK01A14','CHAUFFAGE','PREPARATEUR','PANNEAUX','HGAEMBALLER'"
DEFINE ZONES_HG_SOL2         = "'GAINES','PLAFONNIERS','ECLAIRAGE','ECLAIRAGE2','ECL3EMBALLAGE','ECL4DEPISEDIR','GAINESVENTIL','TOUPRECOND','COFFRETS','ZPROMOS','LONGUEUR1M','CHAUFFEEAU','VOLUMES'"
DEFINE ZONES_HG_LG2          = "'LONGUEUR2M','LG2DEPOSEDIR','LG2EMBALLAGE'"
DEFINE ZONES_HG_LG3          = "'LONGUEUR3M','LG3ALLEE32','IRL','MRL'"
DEFINE ZONES_HG_RETRACT      = "'ARETRACT','RETRACT'"
DEFINE ZONES_HG_RETRACT_LONG = "'RETRACT3435','EXTERIEUR','TUBECUIVRE','TUBE CUIVRE'"


-- =====================================================================
--  Q1 · PICK — lignes lancées, en cours, préparées aujourd'hui
-- =====================================================================
SELECT
    NVL(SUM(CASE WHEN t.L_ETAT_TOUR = 'LANCEE'
                 THEN GREATEST(0, NVL(t.NB_LIG_PREV, 0) - NVL(t.NB_LIG_TERM, 0) - NVL(t.NB_LIG_ANNU, 0)) END), 0)
                                                                       AS "Lignes lancées",
    NVL(SUM(CASE WHEN t.L_ETAT_TOUR = 'ENCOURS'
                 THEN GREATEST(0, NVL(t.NB_LIG_PREV, 0) - NVL(t.NB_LIG_TERM, 0) - NVL(t.NB_LIG_ANNU, 0)) END), 0)
                                                                       AS "Lignes en cours",
    COUNT(CASE WHEN t.L_ETAT_TOUR = 'LANCEE'  THEN 1 END)              AS "Tournées lancées",
    COUNT(CASE WHEN t.L_ETAT_TOUR = 'ENCOURS' THEN 1 END)              AS "Tournées en cours",
    NVL(SUM(CASE WHEN t.DAT_MAJ >= TRUNC(SYSDATE) THEN t.NB_LIG_TERM END), 0)
                                                                       AS "Lignes préparées jour",
    COUNT(DISTINCT CASE WHEN t.L_ETAT_TOUR = 'ENCOURS' THEN t.OPE_MAJ END)
                                                                       AS "Préparateurs en cours"
FROM &&VUE_TOURNEES t
WHERE (&&COND_PERIMETRE)
  AND UPPER(TRIM(t.L_STYP_TOUR)) IN (&&STYP_PICK)
  AND (   t.L_ETAT_TOUR IN ('LANCEE', 'ENCOURS', 'PRELEVE')
       OR t.DAT_MAJ >= TRUNC(SYSDATE));


-- =====================================================================
--  Q2 · HORS GABARIT — lignes lancées / en cours par zone
-- =====================================================================
WITH hg AS (
    SELECT
        CASE
            WHEN UPPER(TRIM(t.ZONE_MVT_PRISE)) IN (&&ZONES_HG_SOL1, &&ZONES_HG_SOL2) THEN '1 SOL'
            WHEN UPPER(TRIM(t.ZONE_MVT_PRISE)) IN (&&ZONES_HG_LG2)                   THEN '2 LONGUEUR 2M'
            WHEN UPPER(TRIM(t.ZONE_MVT_PRISE)) IN (&&ZONES_HG_LG3)                   THEN '3 LONGUEUR 3M'
            WHEN UPPER(TRIM(t.ZONE_MVT_PRISE)) IN (&&ZONES_HG_RETRACT)               THEN '4 RETRACT'
            WHEN UPPER(TRIM(t.ZONE_MVT_PRISE)) IN (&&ZONES_HG_RETRACT_LONG)          THEN '5 RETRACT LONGUEUR'
            ELSE '1 SOL (zone non répertoriée)'
        END AS zone_hg,
        t.L_ETAT_TOUR AS etat,
        GREATEST(0, NVL(t.NB_LIG_PREV, 0) - NVL(t.NB_LIG_TERM, 0) - NVL(t.NB_LIG_ANNU, 0)) AS reste,
        CASE WHEN t.DAT_MAJ >= TRUNC(SYSDATE) THEN NVL(t.NB_LIG_TERM, 0) ELSE 0 END AS term_jour,
        t.OPE_MAJ AS ope
    FROM &&VUE_TOURNEES t
    WHERE (&&COND_PERIMETRE)
      AND UPPER(TRIM(t.L_STYP_TOUR)) IN (&&STYP_HG)
      AND (   t.L_ETAT_TOUR IN ('LANCEE', 'ENCOURS', 'PRELEVE')
           OR t.DAT_MAJ >= TRUNC(SYSDATE))
)
SELECT
    zone_hg                                                     AS "Zone HG",
    NVL(SUM(CASE WHEN etat = 'LANCEE'  THEN reste END), 0)      AS "Lignes lancées",
    NVL(SUM(CASE WHEN etat = 'ENCOURS' THEN reste END), 0)      AS "Lignes en cours",
    SUM(term_jour)                                              AS "Lignes préparées jour",
    COUNT(DISTINCT CASE WHEN etat = 'ENCOURS' THEN ope END)     AS "Préparateurs en cours"
FROM hg
GROUP BY zone_hg
ORDER BY zone_hg;


-- =====================================================================
--  Q3 · HORS GABARIT — détail par ZONE_MVT_PRISE (contrôle du découpage)
-- =====================================================================
SELECT
    UPPER(TRIM(t.L_STYP_TOUR))                                  AS "Sous-type",
    NVL(UPPER(TRIM(t.ZONE_MVT_PRISE)), '(VIDE)')                AS "Zone",
    NVL(SUM(CASE WHEN t.L_ETAT_TOUR = 'LANCEE'
                 THEN GREATEST(0, NVL(t.NB_LIG_PREV, 0) - NVL(t.NB_LIG_TERM, 0) - NVL(t.NB_LIG_ANNU, 0)) END), 0)
                                                                AS "Lignes lancées",
    NVL(SUM(CASE WHEN t.L_ETAT_TOUR = 'ENCOURS'
                 THEN GREATEST(0, NVL(t.NB_LIG_PREV, 0) - NVL(t.NB_LIG_TERM, 0) - NVL(t.NB_LIG_ANNU, 0)) END), 0)
                                                                AS "Lignes en cours",
    NVL(SUM(CASE WHEN t.DAT_MAJ >= TRUNC(SYSDATE) THEN t.NB_LIG_TERM END), 0)
                                                                AS "Lignes préparées jour"
FROM &&VUE_TOURNEES t
WHERE (&&COND_PERIMETRE)
  AND UPPER(TRIM(t.L_STYP_TOUR)) IN (&&STYP_HG)
  AND (   t.L_ETAT_TOUR IN ('LANCEE', 'ENCOURS', 'PRELEVE')
       OR t.DAT_MAJ >= TRUNC(SYSDATE))
GROUP BY UPPER(TRIM(t.L_STYP_TOUR)), NVL(UPPER(TRIM(t.ZONE_MVT_PRISE)), '(VIDE)')
ORDER BY 2, 1;


-- =====================================================================
--  Q4 · CÂBLE — coupes et rétract : lancées / en cours / préparées
-- =====================================================================
SELECT
    CASE WHEN UPPER(TRIM(t.ZONE_MVT_PRISE)) = 'RETRACT' THEN 'RETRACT CABLE'
         ELSE 'COUPES' END                                      AS "Câble",
    NVL(SUM(CASE WHEN t.L_ETAT_TOUR = 'LANCEE'
                 THEN GREATEST(0, NVL(t.NB_LIG_PREV, 0) - NVL(t.NB_LIG_TERM, 0) - NVL(t.NB_LIG_ANNU, 0)) END), 0)
                                                                AS "Lignes lancées",
    NVL(SUM(CASE WHEN t.L_ETAT_TOUR = 'ENCOURS'
                 THEN GREATEST(0, NVL(t.NB_LIG_PREV, 0) - NVL(t.NB_LIG_TERM, 0) - NVL(t.NB_LIG_ANNU, 0)) END), 0)
                                                                AS "Lignes en cours",
    COUNT(CASE WHEN t.L_ETAT_TOUR = 'LANCEE' THEN 1 END)        AS "Tournées lancées",
    NVL(SUM(CASE WHEN t.DAT_MAJ >= TRUNC(SYSDATE) THEN t.NB_LIG_TERM END), 0)
                                                                AS "Lignes préparées jour",
    COUNT(DISTINCT CASE WHEN t.L_ETAT_TOUR = 'ENCOURS' THEN t.OPE_MAJ END)
                                                                AS "Préparateurs en cours"
FROM &&VUE_TOURNEES t
WHERE (&&COND_PERIMETRE)
  AND UPPER(TRIM(t.L_STYP_TOUR)) IN (&&STYP_CABLE)
  AND (   t.L_ETAT_TOUR IN ('LANCEE', 'ENCOURS', 'PRELEVE')
       OR t.DAT_MAJ >= TRUNC(SYSDATE))
GROUP BY CASE WHEN UPPER(TRIM(t.ZONE_MVT_PRISE)) = 'RETRACT' THEN 'RETRACT CABLE' ELSE 'COUPES' END
ORDER BY 1;


-- =====================================================================
--  Q5 · CÂBLE — nombre de lignes rétract (zone RETRACT, tous sous-types)
--  Comme l'ancien fichier (ligne « Câble / Retract »).
-- =====================================================================
SELECT
    NVL(SUM(CASE WHEN t.L_ETAT_TOUR = 'LANCEE'
                 THEN GREATEST(0, NVL(t.NB_LIG_PREV, 0) - NVL(t.NB_LIG_TERM, 0) - NVL(t.NB_LIG_ANNU, 0)) END), 0)
                                                                AS "Rétract lancées",
    NVL(SUM(CASE WHEN t.L_ETAT_TOUR = 'ENCOURS'
                 THEN GREATEST(0, NVL(t.NB_LIG_PREV, 0) - NVL(t.NB_LIG_TERM, 0) - NVL(t.NB_LIG_ANNU, 0)) END), 0)
                                                                AS "Rétract en cours",
    COUNT(CASE WHEN t.L_ETAT_TOUR IN ('LANCEE', 'ENCOURS') THEN 1 END)
                                                                AS "Tournées rétract"
FROM &&VUE_TOURNEES t
WHERE (&&COND_PERIMETRE)
  AND UPPER(TRIM(t.ZONE_MVT_PRISE)) = 'RETRACT'
  AND t.L_ETAT_TOUR IN ('LANCEE', 'ENCOURS');


-- =====================================================================
--  Q6 · MODÈLE EXCEL — tout en une requête, regroupé par sous-type /
--  zone / état. C'est ce texte que contient l'onglet REQUETES du
--  classeur, et le classeur fait la ventilation Pick / Câble / HG
--  avec les onglets ZONES (zones) et ZONES colonnes G:I (sous-types).
--  Colonnes : STYP, ZONE, ETAT, NB_TOURS, LIG_PREV, LIG_TERM, LIG_ANNU,
--             NB_PREPA (préparateurs sur tournées en cours),
--             LIG_TERM_JOUR (lignes terminées sur tournées mises à jour aujourd'hui)
-- =====================================================================
-- >>> MODELE EXCEL (début)
SELECT
    UPPER(TRIM(t.L_STYP_TOUR)) AS "STYP",
    NVL(UPPER(TRIM(t.ZONE_MVT_PRISE)), '(VIDE)') AS "ZONE",
    UPPER(TRIM(t.L_ETAT_TOUR)) AS "ETAT",
    COUNT(*) AS "NB_TOURS",
    SUM(NVL(t.NB_LIG_PREV, 0)) AS "LIG_PREV",
    SUM(NVL(t.NB_LIG_TERM, 0)) AS "LIG_TERM",
    SUM(NVL(t.NB_LIG_ANNU, 0)) AS "LIG_ANNU",
    COUNT(DISTINCT CASE WHEN t.L_ETAT_TOUR = 'ENCOURS' THEN t.OPE_MAJ END) AS "NB_PREPA",
    SUM(CASE WHEN t.DAT_MAJ >= TRUNC(SYSDATE) THEN NVL(t.NB_LIG_TERM, 0) ELSE 0 END) AS "LIG_TERM_JOUR"
FROM &&VUE_TOURNEES t
WHERE (&&COND_PERIMETRE)
  AND (   t.L_ETAT_TOUR IN ('LANCEE', 'ENCOURS', 'PRELEVE')
       OR t.DAT_MAJ >= TRUNC(SYSDATE))
GROUP BY UPPER(TRIM(t.L_STYP_TOUR)), NVL(UPPER(TRIM(t.ZONE_MVT_PRISE)), '(VIDE)'), UPPER(TRIM(t.L_ETAT_TOUR))
ORDER BY 1, 2, 3;
-- <<< MODELE EXCEL (fin)


-- =====================================================================
--  Q7 · ANALYSE DU DÉCOUPAGE — lignes de tournée de préparation par
--  sous-type sur les N derniers jours (jour en cours exclu), comme la
--  requête « repartition » de l'ancien fichier mais sur plusieurs jours.
--  DETA = détail (pick), CABL = câble, les autres codes = HG ou carton.
--  Sert à remplacer 73 % / 4 % / 23 % (onglet PARAMETRES, bloc 1).
-- =====================================================================
SELECT
    lt.styp_tour                                                AS "Sous-type",
    COUNT(lt.num_lig_tour)                                      AS "Lignes",
    COUNT(DISTINCT TRUNC(lt.dat_maj))                           AS "Jours",
    ROUND(COUNT(lt.num_lig_tour) / NULLIF(COUNT(DISTINCT TRUNC(lt.dat_maj)), 0))
                                                                AS "Lignes par jour",
    ROUND(100 * RATIO_TO_REPORT(COUNT(lt.num_lig_tour)) OVER (), 1)
                                                                AS "% du total"
FROM lig_tour lt
WHERE lt.typ_tour = 'PREP'
  AND lt.dat_maj >= TRUNC(SYSDATE) - &&JOURS_ANALYSE
  AND lt.dat_maj <  TRUNC(SYSDATE)
GROUP BY lt.styp_tour
ORDER BY 2 DESC;


-- =====================================================================
--  Q8 · PRÉPARATEURS EN COURS — qui est sur quelle tournée, par
--  sous-type et zone (même tables que « suivivalidationtotale » de
--  l'ancien fichier, étendu à tous les sous-types). Aide à saisir les
--  opérateurs par zone dans PILOTAGE.
-- =====================================================================
SELECT
    t.STYP_TOUR                                                 AS "Sous-type",
    t.ZONE_MVT                                                  AS "Zone",
    p.NOM || ' ' || p.PRENOM                                    AS "Préparateur",
    t.NUM_TOUR                                                  AS "Tournée",
    t.NB_LIG_PREV                                               AS "Lignes prévues",
    t.NB_LIG_TERM                                               AS "Lignes terminées",
    TO_CHAR(tr.DAT_MAJ, 'HH24:MI')                              AS "Pris à"
FROM rexel.tournee t
JOIN rexel.trace_real tr
  ON tr.COD_TABLE = 'TOURNEE'
 AND tr.NUM_CLE   = t.NUM_TOUR
JOIN rexel.personne p
  ON p.COD_PERS   = tr.OPE_MAJ
WHERE t.TYP_TOUR  = 'PREP'
  AND t.ETAT_TOUR = 'ENCO'
  AND tr.ETAT     = 'ENCO'
  AND t.DAT_MAJ  >= TRUNC(SYSDATE)
ORDER BY 1, 2, 3;
