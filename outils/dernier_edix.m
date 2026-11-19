let
    // ════════ À RENSEIGNER UNE SEULE FOIS (voir l'onglet « Mode d'emploi ») ════════
    CONNEXION_ODBC = "A_RENSEIGNER",   // nom de la connexion ODBC vers la base du WMS
    TABLE_TRACES   = "",               // table des traces sur contenant, ex. "SCHEMA.TABLE" (vide = liste des tables candidates)
    COL_ETAT       = "",               // colonne « Etat »         (contient EDIX)
    COL_DATE_MAJ   = "",               // colonne « Date Maj »     (date + heure)
    COL_OPE_MAJ    = "",               // colonne « Opé Maj »      (code opérateur)
    COL_NOM_OPE    = "",               // colonne « Nom Opé Maj »  (facultatif)
    COL_TABLE      = "",               // colonne « Table »        (facultatif, filtre sur CONTENANT)
    VALEUR_EDIX    = "EDIX",           // "?" = afficher les valeurs présentes dans la colonne Etat
    VALEUR_TABLE   = "CONTENANT",
    NB_JOURS       = 7,                // jours affichés, aujourd'hui compris
    // ═════════════════════════════════════════════════════════════════════════════════

    // Lecture seule : uniquement des SELECT. Le texte SQL ne change pas d'un jour à
    // l'autre (TRUNC(SYSDATE)), donc Excel ne redemande pas l'autorisation chaque matin.

    AFaire = (texte as text) as table => #table(type table [#"À faire" = text], {{texte}}),
    Valide = (nom as text) as logical =>
        Text.Length(Text.Select(nom, {"A".."Z", "a".."z", "0".."9", "_", "$", "#", "."})) = Text.Length(nom),
    Litteral = (v as text) as text => "'" & Text.Replace(v, "'", "''") & "'",
    Cnx = if Text.Contains(CONNEXION_ODBC, "=") then CONNEXION_ODBC else "dsn=" & CONNEXION_ODBC,
    NomsInvalides = List.Select({TABLE_TRACES, COL_ETAT, COL_DATE_MAJ, COL_OPE_MAJ, COL_NOM_OPE, COL_TABLE}, each not Valide(_)),

    // Étape 2 : tables dont le nom ou le libellé évoque des traces / un historique
    SQL_RECHERCHE =
        "SELECT * FROM ("
        & " SELECT c.owner AS SCHEMA_, c.table_name AS TABLE_, tc.comments AS LIB_TABLE, t.num_rows AS NB_LIGNES,"
        & " c.column_id AS NUM, c.column_name AS COLONNE, c.data_type AS TYPE_, cc.comments AS LIB_COLONNE"
        & " FROM all_tab_columns c"
        & " JOIN all_tables t ON t.owner = c.owner AND t.table_name = c.table_name"
        & " LEFT JOIN all_tab_comments tc ON tc.owner = c.owner AND tc.table_name = c.table_name"
        & " LEFT JOIN all_col_comments cc ON cc.owner = c.owner AND cc.table_name = c.table_name AND cc.column_name = c.column_name"
        & " WHERE c.owner NOT IN ('SYS','SYSTEM','OUTLN','DBSNMP','APPQOSSYS','AUDSYS','CTXSYS','DVSYS','GSMADMIN_INTERNAL',"
        & " 'LBACSYS','MDSYS','OJVMSYS','OLAPSYS','ORDDATA','ORDSYS','WMSYS','XDB')"
        & " AND (c.table_name LIKE '%TRAC%' OR c.table_name LIKE '%TRC%' OR c.table_name LIKE '%HIS%'"
        & " OR UPPER(tc.comments) LIKE '%TRACE%' OR UPPER(tc.comments) LIKE '%HISTO%')"
        & " ORDER BY c.owner, c.table_name, c.column_id"
        & ") WHERE ROWNUM <= 3000",

    // Contrôle : valeurs réellement stockées dans la colonne Etat (hier et aujourd'hui)
    SQL_VALEURS =
        "SELECT t." & COL_ETAT & " AS ETAT, COUNT(*) AS NB"
        & " FROM " & TABLE_TRACES & " t"
        & " WHERE t." & COL_DATE_MAJ & " >= TRUNC(SYSDATE) - 1"
        & " GROUP BY t." & COL_ETAT
        & " ORDER BY 2 DESC",

    // Résultat : par jour et par opérateur, heure du dernier EDIX (à la minute) et nombre d'EDIX
    NomSql = if COL_NOM_OPE = "" then "CAST(NULL AS VARCHAR2(1))" else "MAX(t." & COL_NOM_OPE & ")",
    FiltreTable = if COL_TABLE = "" then "" else " AND t." & COL_TABLE & " = " & Litteral(VALEUR_TABLE),
    SQL_EDIX =
        "SELECT t." & COL_OPE_MAJ & " AS OPE, " & NomSql & " AS NOM,"
        & " TRUNC(t." & COL_DATE_MAJ & ") AS JOUR,"
        & " TRUNC(MAX(t." & COL_DATE_MAJ & "), 'MI') AS DERNIER,"
        & " COUNT(*) AS NB"
        & " FROM " & TABLE_TRACES & " t"
        & " WHERE t." & COL_ETAT & " = " & Litteral(VALEUR_EDIX)
        & FiltreTable
        & " AND t." & COL_DATE_MAJ & " >= TRUNC(SYSDATE) - " & Text.From(NB_JOURS - 1)
        & " GROUP BY t." & COL_OPE_MAJ & ", TRUNC(t." & COL_DATE_MAJ & ")",

    Recherche = Table.RenameColumns(
        Odbc.Query(Cnx, SQL_RECHERCHE),
        {{"SCHEMA_", "Schéma"}, {"TABLE_", "Table"}, {"LIB_TABLE", "Libellé table"},
         {"NB_LIGNES", "Nb lignes (estim.)"}, {"NUM", "N°"}, {"COLONNE", "Colonne"},
         {"TYPE_", "Type"}, {"LIB_COLONNE", "Libellé colonne"}},
        MissingField.Ignore),

    Valeurs = Table.RenameColumns(
        Odbc.Query(Cnx, SQL_VALEURS),
        {{"ETAT", "Valeur Etat"}, {"NB", "Nb lignes (hier et aujourd'hui)"}},
        MissingField.Ignore),

    DernierEdix =
        let
            Brut = Odbc.Query(Cnx, SQL_EDIX),
            Types = Table.TransformColumns(Brut, {
                {"JOUR", each Date.From(_), type date},
                {"OPE", each if _ = null then null else Text.Trim(Text.From(_)), type text},
                {"NOM", each if _ = null then null else Text.Trim(Text.From(_)), type text},
                {"DERNIER", each Time.From(_), type time},
                {"NB", each Int64.From(_), Int64.Type}}),
            Noms = Table.RenameColumns(Types,
                {{"JOUR", "Jour"}, {"OPE", "Opé"}, {"NOM", "Nom"}, {"DERNIER", "Dernier EDIX"}, {"NB", "Nb EDIX"}}),
            Ordre = Table.ReorderColumns(Noms, {"Jour", "Opé", "Nom", "Dernier EDIX", "Nb EDIX"}),
            Tri = Table.Sort(Ordre, {{"Jour", Order.Descending}, {"Dernier EDIX", Order.Ascending}})
        in
            Tri,

    Resultat =
        if CONNEXION_ODBC = "" or CONNEXION_ODBC = "A_RENSEIGNER" then
            AFaire("Étape 1 : renseigner CONNEXION_ODBC dans la requête. Voir l'onglet « Mode d'emploi ».")
        else if List.Count(NomsInvalides) > 0 then
            AFaire("Nom invalide : " & Text.Combine(NomsInvalides, ", ") & " (lettres, chiffres, _ et point uniquement).")
        else if TABLE_TRACES = "" then
            Recherche
        else if COL_ETAT = "" or COL_DATE_MAJ = "" then
            AFaire("Renseigner aussi COL_ETAT et COL_DATE_MAJ. Voir l'onglet « Mode d'emploi ».")
        else if VALEUR_EDIX = "?" then
            Valeurs
        else if COL_OPE_MAJ = "" then
            AFaire("Renseigner aussi COL_OPE_MAJ. Voir l'onglet « Mode d'emploi ».")
        else
            DernierEdix
in
    Resultat
