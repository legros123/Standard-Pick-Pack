-- ============================================================================
--  PILOTAGE PICK & PACK  ·  CLR Champigneulles (5406)
--  Requêtes LOGYS qui alimentent pilotage.html (via outils/pilotage/modPilotageLive.bas)
--
--  Lecture seule : uniquement des SELECT. Aucune écriture dans LOGYS.
--  Connexion : la source ODBC LOGYS du poste (la même que le classeur de requêtes).
--  Chaque colonne a été contrôlée contre le dictionnaire des 1 018 tables et vues
--  du catalogue « Requêtes LOGYS par service ».
--  Pas de point-virgule final : collées telles quelles dans une connexion ODBC Excel,
--  elles donnent le même résultat que le module VBA.
--  {JOURS} et {ZONE} sont remplacés par les réglages JOURS_REPORT et ZONE_PICK.
-- ============================================================================

-- ----------------------------------------------------------------------------
--  OPERATEURS   (chaque cycle)
--  Production du jour par préparateur : lignes, chariots, colis, première et dernière validation.
--  Taille des chariots (petit : moins de 40 lignes, moyen : 40 à 79, grand : 80 et plus) pour le coefficient du quota,
--  calculé comme dans le Suivi Op. Une ligne de LIG_TOUR = un article prélevé (REEL > 0).
--  Tables : REXEL.LIG_TOUR, REXEL.USER_LOGYS
-- ----------------------------------------------------------------------------
SELECT x.OPE,
       NVL(MAX(u.LIB_USER), x.OPE) AS NOM,
       SUM(x.N) AS LIGNES,
       COUNT(*) AS TOURNEES,
       SUM(x.C) AS CONTENANTS,
       TO_CHAR(MIN(x.D1), 'HH24:MI') AS PREMIERE,
       TO_CHAR(MAX(x.D2), 'HH24:MI') AS DERNIERE,
       SUM(CASE WHEN x.N < 40 THEN 1 ELSE 0 END) AS PETITS,
       SUM(CASE WHEN x.N >= 40 AND x.N < 80 THEN 1 ELSE 0 END) AS MOYENS,
       SUM(CASE WHEN x.N >= 80 THEN 1 ELSE 0 END) AS GRANDS
FROM (SELECT l.OPE_MAJ AS OPE, l.NUM_TOUR,
             COUNT(*) AS N,
             COUNT(DISTINCT l.NUM_CONT_DEPOSE) AS C,
             MIN(l.DAT_MAJ) AS D1, MAX(l.DAT_MAJ) AS D2
      FROM REXEL.LIG_TOUR l
      WHERE l.DAT_MAJ >= TRUNC(SYSDATE) AND l.DAT_MAJ < TRUNC(SYSDATE) + 1
        AND l.REEL > 0 AND l.STYP_TOUR IN ('DETA','CART')
      GROUP BY l.OPE_MAJ, l.NUM_TOUR) x
LEFT JOIN REXEL.USER_LOGYS u ON u.COD_USER = x.OPE
GROUP BY x.OPE
ORDER BY 2

-- ----------------------------------------------------------------------------
--  FAIT_PAR_TYPE   (chaque cycle)
--  Lignes préparées aujourd'hui et colis remplis, par type (DETA = détail, CART = carton).
--  Tables : REXEL.LIG_TOUR
-- ----------------------------------------------------------------------------
SELECT l.STYP_TOUR,
       COUNT(*) AS LIGNES,
       COUNT(DISTINCT l.NUM_CONT_DEPOSE) AS CONTENANTS
FROM REXEL.LIG_TOUR l
WHERE l.DAT_MAJ >= TRUNC(SYSDATE) AND l.DAT_MAJ < TRUNC(SYSDATE) + 1
  AND l.REEL > 0 AND l.STYP_TOUR IN ('DETA','CART')
GROUP BY l.STYP_TOUR

-- ----------------------------------------------------------------------------
--  RESTANT_PAR_TYPE   (chaque cycle)
--  Reste à faire : lignes non terminées des tournées ouvertes (écran Gestion des tournées de préparation).
--  LIBRES = tournées pas encore prises par un préparateur (OPE_MAJ = 'AQ').
--  {JOURS} = nombre de jours de report pris en compte (réglage JOURS_REPORT), pour écarter les vieilles tournées jamais soldées.
--  Tables : REXEL.F_GESTOURPREP_TOUR
-- ----------------------------------------------------------------------------
SELECT t.L_STYP_TOUR,
       COUNT(*) AS TOURNEES,
       SUM(CASE WHEN t.OPE_MAJ = 'AQ' THEN 1 ELSE 0 END) AS LIBRES,
       SUM(GREATEST(NVL(t.NB_LIG_PREV, 0) - NVL(t.NB_LIG_TERM, 0) - NVL(t.NB_LIG_ANNU, 0), 0)) AS LIGNES
FROM REXEL.F_GESTOURPREP_TOUR t
WHERE t.L_TYP_TOUR = 'PREPAR'
  AND t.L_STYP_TOUR IN ('DETAIL','CARTON')
  AND t.L_ETAT_TOUR IN ('LANCEE','ENCOURS','PRELEVE')
  AND t.DAT_MAJ >= TRUNC(SYSDATE) - {JOURS}
GROUP BY t.L_STYP_TOUR

-- ----------------------------------------------------------------------------
--  TOURNEES_FINIES   (chaque cycle)
--  Chariots (tournées) terminés aujourd'hui en détail et carton.
--  Tables : REXEL.F_GESTOURPREP_TOUR
-- ----------------------------------------------------------------------------
SELECT COUNT(*) AS TOURNEES
FROM REXEL.F_GESTOURPREP_TOUR t
WHERE t.L_TYP_TOUR = 'PREPAR'
  AND t.L_STYP_TOUR IN ('DETAIL','CARTON')
  AND t.L_ETAT_TOUR = 'TERMINEE'
  AND t.DAT_MAJ >= TRUNC(SYSDATE)

-- ----------------------------------------------------------------------------
--  HEURES   (chaque cycle)
--  Lignes préparées et préparateurs actifs, heure par heure (13 = de 13:00 à 13:59).
--  Tables : REXEL.LIG_TOUR
-- ----------------------------------------------------------------------------
SELECT TO_NUMBER(TO_CHAR(l.DAT_MAJ, 'HH24')) AS HEURE,
       COUNT(*) AS LIGNES,
       COUNT(DISTINCT l.OPE_MAJ) AS OPERATEURS
FROM REXEL.LIG_TOUR l
WHERE l.DAT_MAJ >= TRUNC(SYSDATE) AND l.DAT_MAJ < TRUNC(SYSDATE) + 1
  AND l.REEL > 0 AND l.STYP_TOUR IN ('DETA','CART')
GROUP BY TO_CHAR(l.DAT_MAJ, 'HH24')
ORDER BY 1

-- ----------------------------------------------------------------------------
--  QUARTS   (chaque cycle)
--  Lignes préparées par quart d'heure sur les 2 h 30 écoulées : c'est le rythme récent, qui sert à estimer l'heure de fin.
--  Tables : REXEL.LIG_TOUR
-- ----------------------------------------------------------------------------
SELECT TO_CHAR(TRUNC(l.DAT_MAJ, 'HH24') + FLOOR(TO_NUMBER(TO_CHAR(l.DAT_MAJ, 'MI')) / 15) * 15 / 1440, 'HH24:MI') AS QUART,
       COUNT(*) AS LIGNES
FROM REXEL.LIG_TOUR l
WHERE l.DAT_MAJ >= SYSDATE - 150 / 1440
  AND l.DAT_MAJ >= TRUNC(SYSDATE)
  AND l.REEL > 0 AND l.STYP_TOUR IN ('DETA','CART')
GROUP BY TO_CHAR(TRUNC(l.DAT_MAJ, 'HH24') + FLOOR(TO_NUMBER(TO_CHAR(l.DAT_MAJ, 'MI')) / 15) * 15 / 1440, 'HH24:MI')
ORDER BY 1

-- ----------------------------------------------------------------------------
--  REJETS_HEURE   (chaque cycle)
--  Colis rejetés par la balance du convoyeur (écart de poids), heure par heure. Même filtre que la requête R4 du classeur de requêtes.
--  Tables : REXEL.CR_STOCK
-- ----------------------------------------------------------------------------
SELECT TO_NUMBER(TO_CHAR(c.DAT_CREA, 'HH24')) AS HEURE,
       COUNT(DISTINCT c.NUM_CONT) AS REJETS
FROM REXEL.CR_STOCK c
WHERE c.COD_TABLE = 'CONTENANT'
  AND c.TYP_CR_STOCK = 'REJE'
  AND c.COD_MOTIF = 'PDS'
  AND c.DAT_CREA >= TRUNC(SYSDATE)
GROUP BY TO_CHAR(c.DAT_CREA, 'HH24')
ORDER BY 1

-- ----------------------------------------------------------------------------
--  COLIS_PESES   (chaque cycle)
--  Colis passés sur la balance aujourd'hui (poids réel renseigné) : le dénominateur du taux de rejet.
--  Tables : REXEL.CONTENANT
-- ----------------------------------------------------------------------------
SELECT COUNT(*) AS COLIS
FROM REXEL.CONTENANT c
WHERE c.DAT_CREA >= TRUNC(SYSDATE)
  AND c.PDS_CTL_REEL IS NOT NULL

-- ----------------------------------------------------------------------------
--  VAGUES   (chaque cycle (réglage R_VAGUES))
--  Vagues lancées aujourd'hui : lignes prévues, préparées, en rupture ; colis prévus et sortis.
--  Tables : REXEL.F_GESVAG_VAG
-- ----------------------------------------------------------------------------
SELECT v.NUM_ORDRE,
       TO_CHAR(v.DAT_CREA, 'HH24:MI') AS HEURE,
       v.L_ETAT_ORDRE,
       v.LIG_CDE_NB_PREV, v.LIG_CDE_NB_PREP, v.LIG_CDE_NB_RUPT,
       v.CONT_NB_PREV, v.CONT_NB_SORTIE
FROM REXEL.F_GESVAG_VAG v
WHERE v.DAT_CREA >= TRUNC(SYSDATE)
ORDER BY v.DAT_CREA

-- ----------------------------------------------------------------------------
--  DEPARTS   (chaque cycle (réglage R_DEPARTS))
--  Ordres de transport du jour : heure prévue, transporteur, destination, colis chargés et capacité.
--  Tables : REXEL.F_GESOTE_OTE
-- ----------------------------------------------------------------------------
SELECT TO_CHAR(o.DAT_EXP_PREV, 'HH24:MI') AS HEURE,
       o.NOM_TRANSP, o.NOM_DEST,
       o.NB_CONT_REEL, o.NB_CONT_MAX, o.L_ETAT_OTE
FROM REXEL.F_GESOTE_OTE o
WHERE o.DAT_EXP_PREV >= TRUNC(SYSDATE)
  AND o.DAT_EXP_PREV < TRUNC(SYSDATE) + 1
ORDER BY o.DAT_EXP_PREV

-- ----------------------------------------------------------------------------
--  PORTEFEUILLE   (chaque cycle (réglage R_PORTEFEUILLE, NON par défaut))
--  En-cours de l'écran Gestion des vagues : lignes de détail reçues mais pas encore lancées.
--  À vérifier une fois sur l'écran LOGYS avant d'activer : si ce compteur inclut des commandes des jours suivants, laisser sur NON.
--  Tables : REXEL.F_GESVAG_ENCO
-- ----------------------------------------------------------------------------
SELECT e.NB_DETAIL, e.NB_LIG_ENCO, e.NB_CDE
FROM REXEL.F_GESVAG_ENCO e

-- ----------------------------------------------------------------------------
--  DECELEES_LOGYS   (chaque cycle, seulement si le classeur Contrôle des rejets n'est pas branché)
--  Estimation des erreurs décelées : colis contrôlés au poste de rejet avec une quantité trouvée différente de la quantité prévue.
--  Tables : REXEL.F_GESREJET_REJET_CONT
-- ----------------------------------------------------------------------------
SELECT COUNT(DISTINCT r.NUM_CONT) AS ERREURS
FROM REXEL.F_GESREJET_REJET_CONT r
WHERE r.DAT_CREA >= TRUNC(SYSDATE)
  AND NVL(r.REEL, 0) <> NVL(r.PREV, 0)

-- ----------------------------------------------------------------------------
--  TOP_REJETS   (toutes les 15 minutes)
--  Les 5 articles les plus rejetés (extraction TOP40 Rejet) : le plan de remesure.
--  Tables : REXEL.F_LST_REJET
-- ----------------------------------------------------------------------------
SELECT * FROM (
  SELECT j.ARTICLE, j.DESIGNATION, j.NB_REJET
  FROM REXEL.F_LST_REJET j
  ORDER BY j.NB_REJET DESC
) WHERE ROWNUM <= 5

-- ----------------------------------------------------------------------------
--  SERVICES   (toutes les 15 minutes)
--  Les autres préparations du site (câble, hors gabarit, vrac, longueur, volume) : lignes terminées et restantes des tournées du jour.
--  Tables : REXEL.F_GESTOURPREP_TOUR
-- ----------------------------------------------------------------------------
SELECT t.L_STYP_TOUR,
       SUM(NVL(t.NB_LIG_TERM, 0)) AS FAIT,
       SUM(GREATEST(NVL(t.NB_LIG_PREV, 0) - NVL(t.NB_LIG_TERM, 0) - NVL(t.NB_LIG_ANNU, 0), 0)) AS RESTANT
FROM REXEL.F_GESTOURPREP_TOUR t
WHERE t.L_TYP_TOUR = 'PREPAR'
  AND t.L_STYP_TOUR NOT IN ('DETAIL','CARTON')
  AND t.L_ETAT_TOUR IN ('LANCEE','ENCOURS','PRELEVE','TERMINEE')
  AND t.DAT_MAJ >= TRUNC(SYSDATE)
GROUP BY t.L_STYP_TOUR
ORDER BY 2 DESC

-- ----------------------------------------------------------------------------
--  REAPPRO   (toutes les 15 minutes (réglage R_STOCK))
--  Emplacements picking passés sous leur seuil d'alerte, dont ceux au niveau critique. {ZONE} = zone de picking (réglage ZONE_PICK).
--  Tables : REXEL.F_LISSTKE_EMP
-- ----------------------------------------------------------------------------
SELECT COUNT(*) AS SOUS_ALERTE,
       SUM(CASE WHEN s.REEL <= s.CRITIQUE THEN 1 ELSE 0 END) AS CRITIQUES
FROM REXEL.F_LISSTKE_EMP s
WHERE s.ZONE_MVT = '{ZONE}'
  AND s.NUM_ART_AFF IS NOT NULL
  AND s.REEL <= s.ALERTE

-- ----------------------------------------------------------------------------
--  REAPPRO_LISTE   (toutes les 15 minutes (réglage R_STOCK))
--  Les 4 emplacements picking les plus urgents à réapprovisionner (stock au niveau critique).
--  Tables : REXEL.F_LISSTKE_EMP
-- ----------------------------------------------------------------------------
SELECT * FROM (
  SELECT s.EMP, s.NUM_ART_AFF, s.REEL
  FROM REXEL.F_LISSTKE_EMP s
  WHERE s.ZONE_MVT = '{ZONE}'
    AND s.NUM_ART_AFF IS NOT NULL
    AND s.REEL <= s.CRITIQUE
  ORDER BY s.REEL, s.EMP
) WHERE ROWNUM <= 4

-- ----------------------------------------------------------------------------
--  RUPTURES   (toutes les 15 minutes (réglage R_STOCK))
--  Lignes du jour avec une quantité en rupture au picking.
--  Tables : REXEL.LIG_TOUR
-- ----------------------------------------------------------------------------
SELECT COUNT(*) AS LIGNES
FROM REXEL.LIG_TOUR l
WHERE l.DAT_MAJ >= TRUNC(SYSDATE) AND l.DAT_MAJ < TRUNC(SYSDATE) + 1
  AND l.STYP_TOUR IN ('DETA','CART')
  AND l.RUPT > 0

-- ----------------------------------------------------------------------------
--  RETARD   (toutes les 15 minutes (réglage R_RETARD))
--  Commandes dont la date d'expédition prévue est dépassée (30 derniers jours) et dont les colis ne sont pas tous sortis.
--  Tables : REXEL.F_VISCDEC_CDEC
-- ----------------------------------------------------------------------------
SELECT COUNT(*) AS COMMANDES,
       SUM(NVL(o.NB_PREV_LIG, 0) - NVL(o.NB_PREP_LIG, 0)) AS LIGNES
FROM REXEL.F_VISCDEC_CDEC o
WHERE o.DAT_EXP_PREV >= TRUNC(SYSDATE) - 30
  AND o.DAT_EXP_PREV < TRUNC(SYSDATE)
  AND NVL(o.NB_SORTIE_CONT, 0) < NVL(o.NB_PREV_CONT, 0) - NVL(o.NB_ANNU_CONT, 0)

-- ----------------------------------------------------------------------------
--  CARNET   (toutes les 15 minutes (réglage R_CARNET))
--  Carnet de commandes des 7 prochains jours, par date d'expédition prévue : la charge à mettre en face des effectifs.
--  Tables : REXEL.F_VISCDEC_CDEC
-- ----------------------------------------------------------------------------
SELECT TO_CHAR(TRUNC(o.DAT_EXP_PREV), 'YYYY-MM-DD') AS JOUR,
       COUNT(*) AS COMMANDES,
       SUM(NVL(o.NB_PREV_LIG, 0)) AS LIGNES,
       SUM(NVL(o.NB_PREV_LIG, 0) - NVL(o.NB_PREP_LIG, 0)) AS A_PREPARER
FROM REXEL.F_VISCDEC_CDEC o
WHERE o.DAT_EXP_PREV >= TRUNC(SYSDATE) + 1
  AND o.DAT_EXP_PREV < TRUNC(SYSDATE) + 8
GROUP BY TRUNC(o.DAT_EXP_PREV)
ORDER BY 1

-- ----------------------------------------------------------------------------
--  REJETS_JOURS   (toutes les heures)
--  Rejets par jour sur 60 jours, pour l'historique et la moyenne du mois (requête R5 du classeur de requêtes, bornée).
--  Tables : REXEL.CR_STOCK
-- ----------------------------------------------------------------------------
SELECT TO_CHAR(TRUNC(c.DAT_CREA), 'YYYY-MM-DD') AS JOUR,
       COUNT(DISTINCT c.NUM_CONT) AS REJETS
FROM REXEL.CR_STOCK c
WHERE c.COD_TABLE = 'CONTENANT'
  AND c.TYP_CR_STOCK = 'REJE'
  AND c.COD_MOTIF = 'PDS'
  AND c.DAT_CREA >= TRUNC(SYSDATE) - 60
  AND c.DAT_CREA < TRUNC(SYSDATE)
GROUP BY TRUNC(c.DAT_CREA)
ORDER BY 1
