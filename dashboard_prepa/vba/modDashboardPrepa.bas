Attribute VB_Name = "modDashboardPrepa"
' =====================================================================
'  DASHBOARD PRÉPARATION CLR - moteur Excel
'  Logys (Oracle, ODBC, LECTURE SEULE) -> onglet DONNEES -> calculs de
'  l'onglet PILOTAGE -> fichier donnees_dashboard.js lu par l'écran TV
'  (index.html, ouvert en plein écran dans chaque service).
'
'  Macros (Alt+F8 ou boutons) :
'    ActualiserDashboard        interroge Logys, recalcule, historise, exporte
'    DemarrerAutoActualisation  la même chose toutes les N minutes
'    ArreterAutoActualisation
'    ExporterSansLogys          recalcule et exporte la saisie manuelle
'    TesterConnexionLogys       vérifie DSN + requête, sans rien importer
'    InstallerBoutons           crée les 4 boutons en haut de PILOTAGE
'
'  Suppose : onglets PILOTAGE, PARAMETRES, ZONES, DONNEES, HISTO, REQUETES
'  et les noms définis créés par outils/creer_classeur_dashboard_prepa.py.
'  Windows, Excel 2010 ou plus récent, DSN ODBC Oracle configuré.
'  Aucun mot de passe n'est écrit : la fenêtre ODBC le demande.
' =====================================================================
Option Explicit

' --- Feuilles ---
Private Const FEU_PIL As String = "PILOTAGE"
Private Const FEU_DON As String = "DONNEES"
Private Const FEU_ZON As String = "ZONES"
Private Const FEU_HIS As String = "HISTO"

' --- Plages fixes ---
Private Const DON_L1 As Long = 7          ' 1re ligne de données Logys
Private Const DON_MAX As Long = 500       ' lignes 7 à 506
Private Const DON_NB_COL As Long = 6      ' A:F écrits par la macro (G:I = formules)
Private Const ZON_L1 As Long = 5
Private Const ZON_LN As Long = 300
Private Const HIS_L1 As Long = 5
Private Const HIS_NB_COL As Long = 11
Private Const HIS_MAX As Long = 3000      ' au-delà, on purge les 1000 plus anciennes
Private Const HISTO_JS_MAX As Long = 240  ' points envoyés à l'écran (journée)
Private Const A_RENSEIGNER As String = "A_RENSEIGNER"
Private Const SANS_ZONE As String = "'#AUCUNE#'"

' --- Colonnes des lignes de synthèse SYN_* (1 = colonne B) ---
Private Const S_RESTE As Long = 2
Private Const S_LANCE As Long = 3
Private Const S_ENCOURS As Long = 4
Private Const S_AVENIR As Long = 5
Private Const S_PREP As Long = 6
Private Const S_OPS As Long = 7
Private Const S_FIN As Long = 8
Private Const S_FINEQ As Long = 9
Private Const S_MARGE As Long = 11
Private Const S_STATUT As Long = 12
Private Const S_RENFORT As Long = 13
Private Const S_AVANC As Long = 14
Private Const S_MSG As Long = 15
Private Const S_VISEE As Long = 17
Private Const S_ZONE_NC As Long = 19
Private Const S_LOGYS As Long = 21

' --- Colonnes des tableaux de zones ZT_* (1 = colonne B) ---
Private Const Z_NOM As Long = 1
Private Const Z_CODE As Long = 2
Private Const Z_LANCE As Long = 3
Private Const Z_ENCOURS As Long = 4
Private Const Z_PREP As Long = 5
Private Const Z_AVENIR As Long = 6
Private Const Z_RESTE As Long = 7
Private Const Z_OPS As Long = 8
Private Const Z_CAD As Long = 9
Private Const Z_FIN As Long = 11
Private Const Z_STATUT As Long = 12
Private Const Z_RENFORT As Long = 14
Private Const Z_LOGYS As Long = 15

' --- État de la session Excel ---
Private mCn As Object          ' connexion Logys gardée ouverte
Private mAuto As Boolean
Private mProchaine As Date
Private mSilence As Boolean    ' True en automatique : aucune boîte bloquante


' =====================================================================
'  MACROS PUBLIQUES
' =====================================================================
Public Sub ActualiserDashboard()
    mSilence = False
    Executer True
End Sub

Public Sub ExporterSansLogys()
    mSilence = False
    Executer False
End Sub

Public Sub DemarrerAutoActualisation()
    AnnulerPlanification
    mAuto = True
    mSilence = False
    Executer True              ' 1re fois en manuel : la fenêtre ODBC peut demander le mot de passe
    PlanifierSuivante
End Sub

Public Sub ArreterAutoActualisation()
    mAuto = False
    AnnulerPlanification
    Application.StatusBar = False
    EcrireStatut "Actualisation automatique arrêtée."
End Sub

' Appelée par Application.OnTime : doit rester Public.
Public Sub ActualiserAuto()
    If Not mAuto Then Exit Sub
    mSilence = True
    Executer True
    mSilence = False
    PlanifierSuivante
End Sub

Public Sub TesterConnexionLogys()
    Dim sql As String, rs As Object, n As Long, t As Single
    mSilence = False
    On Error GoTo Erreur
    sql = ConstruireSql()
    t = Timer
    Set rs = Connexion().Execute(sql)
    Do While Not rs.EOF
        n = n + 1
        rs.MoveNext
    Loop
    rs.Close
    MsgBox "Connexion Logys OK." & vbLf & n & " regroupement(s) renvoyé(s) en " & _
           Format$(Timer - t, "0.0") & " s." & vbLf & "Aucune donnée importée.", _
           vbInformation, "Test Logys"
    Exit Sub
Erreur:
    MsgBox "Test Logys : " & Err.Description & vbLf & vbLf & _
           "Requête générée : onglet REQUETES, cellule B8.", vbExclamation, "Test Logys"
End Sub

Public Sub InstallerBoutons()
    Dim ws As Worksheet, shp As Shape, defs As Variant, i As Long, x As Double
    Set ws = ThisWorkbook.Worksheets(FEU_PIL)
    defs = Array("Actualiser Logys", "ActualiserDashboard", RGB(255, 212, 0), _
                 "Auto ON", "DemarrerAutoActualisation", RGB(63, 191, 110), _
                 "Auto OFF", "ArreterAutoActualisation", RGB(200, 204, 210), _
                 "Exporter (manuel)", "ExporterSansLogys", RGB(200, 204, 210))
    For i = ws.Shapes.Count To 1 Step -1
        If Left$(ws.Shapes(i).Name, 4) = "btn_" Then ws.Shapes(i).Delete
    Next i
    ws.Range("B4").Value2 = ""
    x = ws.Range("B4").Left
    For i = 0 To UBound(defs) Step 3
        Set shp = ws.Shapes.AddShape(msoShapeRoundedRectangle, x, ws.Range("B4").Top + 2, 150, 26)
        shp.Name = "btn_" & defs(i + 1)
        shp.OnAction = defs(i + 1)
        shp.Fill.ForeColor.RGB = defs(i + 2)
        shp.Line.Visible = msoFalse
        With shp.TextFrame2
            .VerticalAnchor = msoAnchorMiddle
            .TextRange.Text = defs(i)
            .TextRange.ParagraphFormat.Alignment = msoAlignCenter
            .TextRange.Font.Size = 10
            .TextRange.Font.Bold = msoTrue
            .TextRange.Font.Fill.ForeColor.RGB = RGB(17, 17, 17)
        End With
        x = x + 158
    Next i
    MsgBox "Boutons installés en haut de l'onglet PILOTAGE.", vbInformation, "Dashboard prépa"
End Sub


' =====================================================================
'  ENCHAÎNEMENT
' =====================================================================
Private Sub Executer(ByVal avecLogys As Boolean)
    Dim calcPrev As XlCalculation, n As Long, chemin As String, notes As String
    calcPrev = Application.Calculation
    On Error GoTo Erreur
    Application.ScreenUpdating = False
    Application.EnableEvents = False
    Application.Calculation = xlCalculationManual

    If avecLogys Then n = ImporterLogys(ConstruireSql())
    ' Horodatage des données : base de calcul des heures de fin
    RangeNom("MAJ_DONNEES").Value = Now
    RangeNom("SOURCE_DONNEES").Value2 = IIf(avecLogys, "LOGYS", "MANUEL")
    Application.Calculate

    notes = AjouterZonesInconnues() & AjouterAlleesInconnues()
    Application.Calculate
    AjouterHisto
    Application.Calculate
    chemin = ExporterJs()

    EcrireStatut IIf(avecLogys, n & " regroupement(s) Logys", "Saisie manuelle") & _
                 " - écran mis à jour : " & chemin & notes

Sortie:
    Application.Calculation = calcPrev
    Application.EnableEvents = True
    Application.ScreenUpdating = True
    Exit Sub
Erreur:
    Dim msg As String
    msg = "Erreur " & Err.Number & " : " & Err.Description
    EcrireStatut msg
    If Not mSilence Then MsgBox msg, vbExclamation, "Dashboard prépa"
    Resume Sortie
End Sub

Private Sub PlanifierSuivante()
    Dim minutes As Double
    If Not mAuto Then Exit Sub
    minutes = Val(CStr(RangeNom("CFG_INTERVALLE").Value2))
    If minutes < 1 Then minutes = 5
    mProchaine = Now + minutes / 1440
    Application.OnTime EarliestTime:=mProchaine, Procedure:="ActualiserAuto"
    Application.StatusBar = "Dashboard prépa : actualisation auto, prochaine à " & _
                            Format$(mProchaine, "hh\:nn")
End Sub

Private Sub AnnulerPlanification()
    If mProchaine = 0 Then Exit Sub
    On Error Resume Next
    Application.OnTime EarliestTime:=mProchaine, Procedure:="ActualiserAuto", Schedule:=False
    On Error GoTo 0
    mProchaine = 0
End Sub


' =====================================================================
'  REQUÊTE LOGYS
' =====================================================================
' Remplace les jetons &&NOM du modèle (REQUETES!B5) par PARAMETRES bloc 7.
Private Function ConstruireSql() As String
    Dim sql As String, cfg As Variant, i As Long, n As Long, p As Long
    Dim noms() As String, vals() As String
    sql = CStr(RangeNom("SQL_MODELE").Value2)
    If Len(Trim$(sql)) = 0 Then Err.Raise vbObjectError + 1, , _
        "Modèle de requête vide (onglet REQUETES, cellule B5)."
    cfg = RangeNom("CFG_SQL").Value2
    n = UBound(cfg, 1) + 1
    ReDim noms(1 To n)
    ReDim vals(1 To n)
    For i = 1 To UBound(cfg, 1)
        noms(i) = UCase$(Trim$(TexteCellule(cfg(i, 1))))
        vals(i) = Trim$(TexteCellule(cfg(i, 2)))
        If noms(i) <> "" Then
            If vals(i) = "" Then vals(i) = ValeurParDefaut(noms(i))
            If UCase$(vals(i)) = A_RENSEIGNER Then Err.Raise vbObjectError + 2, , _
                "Paramètre Logys à renseigner : " & noms(i) & _
                " (onglet PARAMETRES, bloc 7). Voir sql\00_decouverte_schema.sql."
        End If
    Next i
    noms(n) = "ZONES_CABLE"
    vals(n) = ListeZones("CABLE")
    TrierParLongueur noms, vals             ' COL_ZONE avant COL_Z... : les plus longs d'abord
    For i = 1 To n
        If noms(i) <> "" Then sql = Replace(sql, "&&" & noms(i), vals(i))
    Next i
    p = InStr(sql, "&&")
    If p > 0 Then Err.Raise vbObjectError + 3, , _
        "Jeton non remplacé dans le modèle : " & Mid$(sql, p, 30)
    RangeNom("SQL_GENERE").Value2 = sql
    ConstruireSql = sql
End Function

Private Function ValeurParDefaut(ByVal jeton As String) As String
    Select Case jeton
        Case "COL_ZONE":       ValeurParDefaut = "ZONE_MVT"
        Case "COL_ALLEE":      ValeurParDefaut = "'TOUTES'"
        Case "COL_PREPA":      ValeurParDefaut = "CAST(NULL AS VARCHAR2(1))"
        Case "EXPR_NB_LIGNES": ValeurParDefaut = "1"
        Case "COND_RETRACT":   ValeurParDefaut = "1 = 0"
        Case "COND_PERIMETRE": ValeurParDefaut = "1 = 1"
        Case Else:             ValeurParDefaut = A_RENSEIGNER
    End Select
End Function

' Liste SQL des ZONE_MVT d'un service, lue dans l'onglet ZONES : 'CABLE','X'
Private Function ListeZones(ByVal service As String) As String
    Dim v As Variant, i As Long, s As String, z As String
    v = ThisWorkbook.Worksheets(FEU_ZON).Range("A" & ZON_L1 & ":B" & ZON_LN).Value2
    For i = 1 To UBound(v, 1)
        z = UCase$(Trim$(TexteCellule(v(i, 1))))
        If z <> "" And UCase$(Trim$(TexteCellule(v(i, 2)))) = service Then
            If s <> "" Then s = s & ","
            s = s & "'" & Replace(z, "'", "''") & "'"
        End If
    Next i
    If s = "" Then s = SANS_ZONE
    ListeZones = s
End Function

Private Sub TrierParLongueur(noms() As String, vals() As String)
    Dim i As Long, j As Long, tn As String, tv As String
    For i = LBound(noms) + 1 To UBound(noms)
        tn = noms(i)
        tv = vals(i)
        j = i - 1
        Do While j >= LBound(noms)
            If Len(noms(j)) >= Len(tn) Then Exit Do
            noms(j + 1) = noms(j)
            vals(j + 1) = vals(j)
            j = j - 1
        Loop
        noms(j + 1) = tn
        vals(j + 1) = tv
    Next i
End Sub

Private Function Connexion() As Object
    Dim dsn As String, uid As String, cs As String
    If Not mCn Is Nothing Then
        If mCn.State = 1 Then
            Set Connexion = mCn
            Exit Function
        End If
    End If
    dsn = Trim$(TexteCellule(RangeNom("CFG_DSN").Value2))
    If dsn = "" Or UCase$(dsn) = A_RENSEIGNER Then Err.Raise vbObjectError + 10, , _
        "DSN ODBC Logys à renseigner (onglet PARAMETRES, bloc 6)."
    uid = Trim$(TexteCellule(RangeNom("CFG_UID").Value2))
    cs = "DSN=" & dsn & ";"
    If uid <> "" Then cs = cs & "UID=" & uid & ";"
    Set mCn = CreateObject("ADODB.Connection")
    mCn.Provider = "MSDASQL"
    mCn.ConnectionTimeout = 15
    mCn.CommandTimeout = 120
    ' Fenêtre ODBC (mot de passe masqué) en manuel ; jamais en automatique
    On Error Resume Next
    mCn.Properties("Prompt") = IIf(mSilence, 4, 2)   ' adPromptNever / adPromptComplete
    On Error GoTo 0
    mCn.Open cs
    Set Connexion = mCn
End Function

Private Sub FermerConnexion()
    On Error Resume Next
    If Not mCn Is Nothing Then
        If mCn.State = 1 Then mCn.Close
    End If
    Set mCn = Nothing
End Sub

' Exécute la requête et écrit DONNEES!A:F. Renvoie le nombre de lignes.
Private Function ImporterLogys(ByVal sql As String) As Long
    Dim ws As Worksheet, cn As Object, rs As Object, v As Variant, sortie() As Variant
    Dim nbL As Long, i As Long, msg As String
    Set ws = ThisWorkbook.Worksheets(FEU_DON)
    Set cn = Connexion()                  ' erreur de DSN : message clair, remonté tel quel

    On Error GoTo ErreurSql
    Set rs = cn.Execute(sql)
    On Error GoTo 0

    ws.Range(ws.Cells(DON_L1, 1), ws.Cells(DON_L1 + DON_MAX - 1, DON_NB_COL)).ClearContents
    If Not rs.EOF Then
        v = rs.GetRows()                       ' v(colonne, ligne), base 0
        If UBound(v, 1) + 1 < DON_NB_COL Then
            rs.Close
            Err.Raise vbObjectError + 4, , "La requête doit renvoyer 6 colonnes : " & _
                "ZONE_MVT, ALLEE, STATUT, RETRACT, NB_LIGNES, NB_PREPA."
        End If
        nbL = UBound(v, 2) + 1
        If nbL > DON_MAX Then nbL = DON_MAX
        ReDim sortie(1 To nbL, 1 To DON_NB_COL)
        For i = 1 To nbL
            sortie(i, 1) = TexteZone(v(0, i - 1))
            sortie(i, 2) = TexteBrut(v(1, i - 1))
            sortie(i, 3) = UCase$(TexteBrut(v(2, i - 1)))
            sortie(i, 4) = Nombre(v(3, i - 1))
            sortie(i, 5) = Nombre(v(4, i - 1))
            sortie(i, 6) = Nombre(v(5, i - 1))
        Next i
        ws.Cells(DON_L1, 1).Resize(nbL, DON_NB_COL).Value2 = sortie
    End If
    rs.Close
    ImporterLogys = nbL
    Exit Function

ErreurSql:
    msg = Err.Description
    FermerConnexion                       ' connexion peut-être coupée : rouverte au prochain tour
    Err.Raise vbObjectError + 5, , "Requête Logys refusée : " & msg & _
              " (requête envoyée : onglet REQUETES, B8)"
End Function


' =====================================================================
'  COMPLÉTER ZONES ET ALLÉES
' =====================================================================
' Zone Logys inconnue -> ajoutée dans ZONES en PICK, marquée À VÉRIFIER.
Private Function AjouterZonesInconnues() As String
    Dim wsD As Worksheet, wsZ As Worksheet, vD As Variant, vZ As Variant
    Dim dico As Object, i As Long, r As Long, n As Long, z As String
    Set wsD = ThisWorkbook.Worksheets(FEU_DON)
    Set wsZ = ThisWorkbook.Worksheets(FEU_ZON)
    vD = wsD.Range(wsD.Cells(DON_L1, 1), wsD.Cells(DON_L1 + DON_MAX - 1, 1)).Value2
    vZ = wsZ.Range(wsZ.Cells(ZON_L1, 1), wsZ.Cells(ZON_LN, 1)).Value2
    Set dico = CreateObject("Scripting.Dictionary")
    dico.CompareMode = vbTextCompare
    r = ZON_L1 - 1
    For i = 1 To UBound(vZ, 1)
        z = Trim$(TexteCellule(vZ(i, 1)))
        If z <> "" Then
            If Not dico.Exists(z) Then dico.Add z, True
            r = ZON_L1 + i - 1
        End If
    Next i
    For i = 1 To UBound(vD, 1)
        z = Trim$(TexteCellule(vD(i, 1)))
        If z <> "" Then
            If Not dico.Exists(z) Then
                r = r + 1
                If r > ZON_LN Then
                    AjouterZonesInconnues = " - onglet ZONES plein, zone " & z & " non ajoutée"
                    Exit Function
                End If
                wsZ.Cells(r, 1).Value2 = z
                wsZ.Cells(r, 2).Value2 = "PICK"
                wsZ.Cells(r, 3).Value2 = "PICK"
                wsZ.Cells(r, 4).Value2 = "À VÉRIFIER - ajoutée le " & Format$(Now, "dd/mm/yyyy hh\:nn")
                dico.Add z, True
                n = n + 1
            End If
        End If
    Next i
    If n > 0 Then AjouterZonesInconnues = " - " & n & " zone(s) Logys ajoutée(s) dans ZONES (À VÉRIFIER)"
End Function

' Allée câble avec du travail mais absente de PILOTAGE -> 1re case libre.
Private Function AjouterAlleesInconnues() As String
    Dim wsD As Worksheet, vD As Variant, zt As Range, vC As Variant
    Dim dico As Object, i As Long, j As Long, n As Long, a As String, st As String
    Set wsD = ThisWorkbook.Worksheets(FEU_DON)
    vD = wsD.Range(wsD.Cells(DON_L1, 2), wsD.Cells(DON_L1 + DON_MAX - 1, 7)).Value2  ' B:G
    Set zt = RangeNom("ZT_CABLE")
    vC = zt.Columns(Z_CODE).Value2
    Set dico = CreateObject("Scripting.Dictionary")
    dico.CompareMode = vbTextCompare
    For j = 1 To UBound(vC, 1)
        a = Trim$(TexteCellule(vC(j, 1)))
        If a <> "" Then
            If Not dico.Exists(a) Then dico.Add a, True
        End If
    Next j
    For i = 1 To UBound(vD, 1)
        If TexteCellule(vD(i, 6)) = "CABLE" Then          ' colonne G = SERVICE
            a = Trim$(TexteCellule(vD(i, 1)))               ' colonne B = ALLEE
            st = TexteCellule(vD(i, 2))                     ' colonne C = STATUT
            If a <> "" And (st = "LANCE" Or st = "EN_COURS") Then
                If Not dico.Exists(a) Then
                    For j = 1 To UBound(vC, 1)
                        If Trim$(TexteCellule(vC(j, 1))) = "" Then Exit For
                    Next j
                    If j > UBound(vC, 1) Then
                        AjouterAlleesInconnues = AjouterAlleesInconnues & _
                            " - plus de case libre pour l'allée câble " & a
                    Else
                        zt.Cells(j, Z_CODE).Value2 = a
                        zt.Cells(j, Z_NOM).Value2 = "Allée " & a
                        vC(j, 1) = a
                        n = n + 1
                    End If
                    dico.Add a, True
                End If
            End If
        End If
    Next i
    If n > 0 Then AjouterAlleesInconnues = AjouterAlleesInconnues & _
        " - " & n & " allée(s) câble ajoutée(s) dans PILOTAGE : saisir leurs opérateurs"
End Function


' =====================================================================
'  HISTORIQUE
' =====================================================================
Private Sub AjouterHisto()
    Dim ws As Worksheet, r As Long, k As Long, syn As Range
    Dim ligne(1 To 1, 1 To HIS_NB_COL) As Variant, svcs As Variant
    Set ws = ThisWorkbook.Worksheets(FEU_HIS)
    r = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
    If r < HIS_L1 Then r = HIS_L1
    ligne(1, 1) = RangeNom("H_CALC").Value2
    svcs = Array("SYN_PICK", "SYN_CABLE", "SYN_HG")
    For k = 0 To 2
        Set syn = RangeNom(CStr(svcs(k)))
        ligne(1, 2 + k * 3) = syn.Cells(1, S_RESTE).Value2
        ligne(1, 3 + k * 3) = syn.Cells(1, S_FIN).Value2
        ligne(1, 4 + k * 3) = syn.Cells(1, S_STATUT).Value2
    Next k
    ligne(1, 11) = RangeNom("PREVI").Value2
    ws.Cells(r, 1).Resize(1, HIS_NB_COL).Value2 = ligne
    ws.Cells(r, 1).NumberFormat = "dd/mm/yyyy hh:mm"
    ws.Cells(r, 3).NumberFormat = "dd/mm hh:mm"
    ws.Cells(r, 6).NumberFormat = "dd/mm hh:mm"
    ws.Cells(r, 9).NumberFormat = "dd/mm hh:mm"
    If r - HIS_L1 + 1 > HIS_MAX Then ws.Rows(HIS_L1 & ":" & (HIS_L1 + 999)).Delete
End Sub


' =====================================================================
'  EXPORT POUR L'ÉCRAN TV
' =====================================================================
Private Function ExporterJs() As String
    Dim dossier As String, fichier As String, chemin As String, tmp As String
    Dim contenu As String, ok As Boolean
    dossier = Trim$(TexteCellule(RangeNom("CFG_DOSSIER").Value2))
    If dossier = "" Then dossier = ThisWorkbook.Path
    If LCase$(Left$(dossier, 4)) = "http" Then Err.Raise vbObjectError + 6, , _
        "Classeur ouvert depuis OneDrive / SharePoint : renseigner le dossier d'export " & _
        "(onglet PARAMETRES, bloc 6)."
    If Right$(dossier, 1) <> "\" Then dossier = dossier & "\"
    fichier = Trim$(TexteCellule(RangeNom("CFG_FICHIER").Value2))
    If fichier = "" Then fichier = "donnees_dashboard.js"
    chemin = dossier & fichier
    tmp = chemin & ".tmp"
    contenu = "window.DASH_PREPA = " & JsonDashboard() & ";" & vbLf

    ' Écriture dans un .tmp puis renommage : l'écran ne lit jamais un fichier à moitié écrit
    EcrireUtf8 tmp, contenu
    On Error Resume Next
    If Len(Dir$(chemin)) > 0 Then Kill chemin
    Name tmp As chemin
    ok = (Err.Number = 0)
    Err.Clear
    On Error GoTo 0
    If Not ok Then
        EcrireUtf8 chemin, contenu         ' 2e essai en direct (fichier verrouillé un instant)
        On Error Resume Next
        Kill tmp
        On Error GoTo 0
    End If
    ExporterJs = chemin
End Function

Private Sub EcrireUtf8(ByVal chemin As String, ByVal texte As String)
    Dim st As Object
    Set st = CreateObject("ADODB.Stream")
    st.Type = 2                 ' adTypeText
    st.Charset = "utf-8"
    st.Open
    st.WriteText texte
    st.SaveToFile chemin, 2     ' adSaveCreateOverWrite
    st.Close
End Sub

Private Function JsonDashboard() As String
    Dim j As String, hCalc As Double, jour As Double
    hCalc = CDbl(RangeNom("H_CALC").Value2)
    jour = Int(hCalc)
    j = "{" & vbLf
    j = j & Kv("v", "1") & ","
    j = j & Kv("site", Q(TexteCellule(RangeNom("CFG_SITE").Value2))) & ","
    j = j & Kv("maj", Q(Format$(CDate(hCalc), "yyyy\-mm\-dd\Thh\:nn\:ss"))) & ","
    j = j & Kv("export", Q(Format$(Now, "yyyy\-mm\-dd\Thh\:nn\:ss"))) & ","
    j = j & Kv("source", Q(TexteCellule(RangeNom("SOURCE_DONNEES").Value2))) & ","
    j = j & Kv("perime_min", Num(RangeNom("PERIME_MIN").Value2)) & ","
    j = j & Kv("previ", Num(RangeNom("PREVI").Value2)) & ","
    j = j & Kv("zones_a_verifier", Num(RangeNom("NB_ZONES_VERIF").Value2)) & ","
    j = j & Kv("non_ventilees", Num(RangeNom("NON_VENTILEES").Value2)) & "," & vbLf
    j = j & Q("services") & ":[" & vbLf
    j = j & JsonService("PICK", "Pick", "SYN_PICK", "ZT_PICK", "PART_PICK", jour) & "," & vbLf
    j = j & JsonService("CABLE", "Câble", "SYN_CABLE", "ZT_CABLE", "PART_CABLE", jour) & "," & vbLf
    j = j & JsonService("HG", "Hors gabarit", "SYN_HG", "ZT_HG", "PART_HG", jour) & vbLf
    j = j & "]," & vbLf
    j = j & Q("histo") & ":" & JsonHisto(jour) & vbLf
    j = j & "}"
    JsonDashboard = j
End Function

Private Function JsonService(ByVal id As String, ByVal libelle As String, ByVal nomSyn As String, _
                             ByVal nomZt As String, ByVal nomPart As String, _
                             ByVal jour As Double) As String
    Dim syn As Range, zt As Range, j As String, zones As String, r As Long, fin As Variant
    Set syn = RangeNom(nomSyn)
    Set zt = RangeNom(nomZt)
    fin = syn.Cells(1, S_FIN).Value2
    j = "{" & Kv("id", Q(id)) & "," & Kv("nom", Q(libelle)) & ","
    j = j & Kv("part", Num(RangeNom(nomPart).Value2)) & ","
    j = j & Kv("statut", Q(TexteCellule(syn.Cells(1, S_STATUT).Value2))) & ","
    j = j & Kv("fin_min", Minutes(fin, jour)) & ","
    j = j & Kv("fin_txt", Q(TexteNonNumerique(fin))) & ","
    j = j & Kv("fin_eq_min", Minutes(syn.Cells(1, S_FINEQ).Value2, jour)) & ","
    j = j & Kv("cible_min", Minutes(syn.Cells(1, S_VISEE).Value2, jour)) & ","
    j = j & Kv("marge_min", Num(syn.Cells(1, S_MARGE).Value2)) & ","
    j = j & Kv("renfort", Num(syn.Cells(1, S_RENFORT).Value2)) & ","
    j = j & Kv("renfort_txt", Q(TexteNonNumerique(syn.Cells(1, S_RENFORT).Value2))) & ","
    j = j & Kv("zone_nc", Q(TexteCellule(syn.Cells(1, S_ZONE_NC).Value2))) & ","
    j = j & Kv("message", Q(TexteCellule(syn.Cells(1, S_MSG).Value2))) & ","
    j = j & Kv("reste", Entier(syn.Cells(1, S_RESTE).Value2)) & ","
    j = j & Kv("lancees", Entier(syn.Cells(1, S_LANCE).Value2)) & ","
    j = j & Kv("en_cours", Entier(syn.Cells(1, S_ENCOURS).Value2)) & ","
    j = j & Kv("a_venir", Entier(syn.Cells(1, S_AVENIR).Value2)) & ","
    j = j & Kv("preparees", Entier(syn.Cells(1, S_PREP).Value2)) & ","
    j = j & Kv("ops", Num(syn.Cells(1, S_OPS).Value2)) & ","
    j = j & Kv("ops_logys", Num(syn.Cells(1, S_LOGYS).Value2)) & ","
    j = j & Kv("avancement", Num(syn.Cells(1, S_AVANC).Value2)) & ","
    For r = 1 To zt.Rows.Count
        If Trim$(TexteCellule(zt.Cells(r, Z_CODE).Value2)) <> "" Then
            If zones <> "" Then zones = zones & ","
            zones = zones & JsonZone(zt.Rows(r), jour)
        End If
    Next r
    j = j & Q("zones") & ":[" & zones & "]"
    If id = "CABLE" Then j = j & "," & JsonRetract()
    JsonService = j & "}"
End Function

Private Function JsonZone(ByVal ligne As Range, ByVal jour As Double) As String
    Dim j As String, fin As Variant
    fin = ligne.Cells(1, Z_FIN).Value2
    j = "{" & Kv("nom", Q(TexteCellule(ligne.Cells(1, Z_NOM).Value2))) & ","
    j = j & Kv("code", Q(TexteCellule(ligne.Cells(1, Z_CODE).Value2))) & ","
    j = j & Kv("lancees", Entier(ligne.Cells(1, Z_LANCE).Value2)) & ","
    j = j & Kv("en_cours", Entier(ligne.Cells(1, Z_ENCOURS).Value2)) & ","
    j = j & Kv("preparees", Entier(ligne.Cells(1, Z_PREP).Value2)) & ","
    j = j & Kv("a_venir", Entier(ligne.Cells(1, Z_AVENIR).Value2)) & ","
    j = j & Kv("reste", Entier(ligne.Cells(1, Z_RESTE).Value2)) & ","
    j = j & Kv("ops", Num(ligne.Cells(1, Z_OPS).Value2)) & ","
    j = j & Kv("cadence", Num(ligne.Cells(1, Z_CAD).Value2)) & ","
    j = j & Kv("fin_min", Minutes(fin, jour)) & ","
    j = j & Kv("fin_txt", Q(TexteNonNumerique(fin))) & ","
    j = j & Kv("statut", Q(TexteCellule(ligne.Cells(1, Z_STATUT).Value2))) & ","
    j = j & Kv("renfort", Num(ligne.Cells(1, Z_RENFORT).Value2)) & ","
    j = j & Kv("logys", Num(ligne.Cells(1, Z_LOGYS).Value2)) & "}"
    JsonZone = j
End Function

Private Function JsonRetract() As String
    Dim rr As Range
    Set rr = RangeNom("RETR_CABLE")
    JsonRetract = Q("retract") & ":{" & _
        Kv("lancees", Entier(rr.Cells(1, Z_LANCE).Value2)) & "," & _
        Kv("en_cours", Entier(rr.Cells(1, Z_ENCOURS).Value2)) & "," & _
        Kv("alerte", IIf(TexteCellule(rr.Cells(1, Z_STATUT).Value2) = "PRÉVOIR CARISTE", _
                         "true", "false")) & "}"
End Function

' Points de la journée : {"t":minutes, "r":[reste x3], "f":[fin en minutes x3]}
Private Function JsonHisto(ByVal jour As Double) As String
    Dim ws As Worksheet, der As Long, deb As Long, v As Variant, i As Long, s As String
    Set ws = ThisWorkbook.Worksheets(FEU_HIS)
    der = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If der < HIS_L1 Then
        JsonHisto = "[]"
        Exit Function
    End If
    deb = der - HISTO_JS_MAX + 1
    If deb < HIS_L1 Then deb = HIS_L1
    v = ws.Range(ws.Cells(deb, 1), ws.Cells(der, HIS_NB_COL)).Value2
    If Not IsArray(v) Then
        JsonHisto = "[]"
        Exit Function
    End If
    For i = 1 To UBound(v, 1)
        If EstNombre(v(i, 1)) Then
            If Int(CDbl(v(i, 1))) = jour Then
                If s <> "" Then s = s & ","
                s = s & "{" & Kv("t", Minutes(v(i, 1), jour)) & "," & _
                    Q("r") & ":[" & Entier(v(i, 2)) & "," & Entier(v(i, 5)) & "," & _
                    Entier(v(i, 8)) & "]," & _
                    Q("f") & ":[" & Minutes(v(i, 3), jour) & "," & Minutes(v(i, 6), jour) & "," & _
                    Minutes(v(i, 9), jour) & "]}"
            End If
        End If
    Next i
    JsonHisto = "[" & s & "]"
End Function


' =====================================================================
'  OUTILS
' =====================================================================
Private Function RangeNom(ByVal nom As String) As Range
    Set RangeNom = ThisWorkbook.Names(nom).RefersToRange
End Function

Private Sub EcrireStatut(ByVal msg As String)
    On Error Resume Next
    RangeNom("STATUT_MAJ").Value2 = Format$(Now, "hh\:nn\:ss") & " - " & msg
End Sub

Private Function EstNombre(ByVal v As Variant) As Boolean
    If IsError(v) Or IsEmpty(v) Or IsNull(v) Then Exit Function
    If VarType(v) = vbString Then Exit Function
    EstNombre = IsNumeric(v)
End Function

Private Function TexteCellule(ByVal v As Variant) As String
    If IsError(v) Or IsNull(v) Then Exit Function
    TexteCellule = CStr(v)
End Function

Private Function TexteBrut(ByVal v As Variant) As String
    If IsNull(v) Then Exit Function
    TexteBrut = Trim$(CStr(v))
End Function

Private Function TexteZone(ByVal v As Variant) As String
    TexteZone = UCase$(TexteBrut(v))
    If TexteZone = "" Then TexteZone = "(VIDE)"
End Function

' Texte d'une cellule qui n'est pas un nombre (ex. « Non couverte »), sinon vide
Private Function TexteNonNumerique(ByVal v As Variant) As String
    If IsError(v) Then
        TexteNonNumerique = "?"
    ElseIf VarType(v) = vbString Then
        TexteNonNumerique = v
    End If
End Function

Private Function Nombre(ByVal v As Variant) As Double
    If IsNull(v) Or IsEmpty(v) Then Exit Function
    If IsNumeric(v) Then
        Nombre = CDbl(v)
    Else
        Nombre = Val(CStr(v))
    End If
End Function

' Nombre JSON (point décimal quelle que soit la langue de Windows) ou null
Private Function Num(ByVal v As Variant) As String
    If EstNombre(v) Then
        Num = Trim$(Str$(Round(CDbl(v), 3)))
    Else
        Num = "null"
    End If
End Function

Private Function Entier(ByVal v As Variant) As String
    If EstNombre(v) Then
        Entier = Trim$(Str$(Round(CDbl(v), 0)))
    Else
        Entier = "0"
    End If
End Function

' Date-heure Excel -> minutes depuis minuit du jour de calcul (peut dépasser 1440)
Private Function Minutes(ByVal v As Variant, ByVal jour As Double) As String
    If EstNombre(v) Then
        Minutes = Trim$(Str$(Round((CDbl(v) - jour) * 1440, 0)))
    Else
        Minutes = "null"
    End If
End Function

Private Function Q(ByVal s As String) As String
    s = Replace(s, "\", "\\")
    s = Replace(s, """", "\""")
    s = Replace(s, vbCr, "")
    s = Replace(s, vbLf, "\n")
    s = Replace(s, vbTab, " ")
    Q = """" & s & """"
End Function

Private Function Kv(ByVal cle As String, ByVal valeur As String) As String
    Kv = Q(cle) & ":" & valeur
End Function
