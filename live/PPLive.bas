Attribute VB_Name = "PPLive"
'==============================================================================
' PP LIVE - alimente l'écran Flip (data.js) depuis LOGYS, le suivi op et le
' fichier des décelées.
'
' Installation (une fois) : Alt+F11 > Fichier > Importer un fichier > PPLive.bas
'   > Débogage > Compiler VBAProject > Enregistrer sous ... (*.xlsm).
'
' Fonctionnement :
'   - à l'ouverture (Auto_Open) : nouvelle journée si la date a changé, puis
'     l'écran tourne seul ; à la fermeture (Auto_Close) tout s'arrête ;
'   - chaque minute : requête LOGYS des tournées (+ rejets) > onglet TOURS,
'     décelées toutes les 5 min, puis l'onglet EXPORT (des formules) est recopié
'     dans data.js. La macro ne calcule aucun indicateur : tout est dans les formules.
'
' La macro ne connaît que les NOMS DÉFINIS du classeur (Formules > Gestionnaire
' de noms) : renommer un onglet ne casse rien.
' LOGYS est seulement LU (requêtes SELECT de l'onglet REQUÊTES). Le suivi op et
' le fichier des décelées sont ouverts en lecture seule, macros désactivées.
'==============================================================================
Option Explicit

Private Const AUTO_FORCE_DISABLE As Long = 3   ' msoAutomationSecurityForceDisable
Private mProchain As Date                      ' prochaine actualisation planifiée

'============================================================ boutons et démarrage

Public Sub Auto_Open()
    ' Ouverture du classeur : prépare la journée si besoin, puis démarre l'écran.
    If JourEnregistre() <> CLng(Date) Then NouvelleJournee
    DEMARRER
End Sub

Public Sub Auto_Close()
    ' Sans cela, Excel rouvrirait le classeur pour lancer l'actualisation suivante.
    ArretSilencieux
End Sub

Public Sub DEMARRER()
    ArretSilencieux
    ACTUALISER
    Planifier
End Sub

Public Sub ARRETER()
    ArretSilencieux
    Etat "Écran arrêté à " & Format$(Now, "hh:mm") & " : bouton Démarrer pour relancer", True
End Sub

Public Sub NOUVELLE_JOURNEE()
    If MsgBox("Nouvelle journée ?" & vbLf & vbLf & _
              "- l'équipe est rechargée depuis le suivi op, tout le monde est coché ;" & vbLf & _
              "- la prévision et les heures de départ / retour sont effacées.", _
              vbQuestion + vbYesNo, "PP LIVE") <> vbYes Then Exit Sub
    NouvelleJournee
    ACTUALISER
End Sub

Public Sub RECHARGER_SUIVI_OP()
    If ChargerSuiviOp() Then
        MsgBox "Suivi op relu : registre, cadences et historique à jour.", vbInformation, "PP LIVE"
    Else
        MsgBox SafeStr(R("C_MSG").Value2), vbExclamation, "PP LIVE"
    End If
End Sub

Public Sub PPLive_Cycle()
    ' Appelée par Application.OnTime à chaque actualisation.
    mProchain = 0
    If JourEnregistre() <> CLng(Date) Then NouvelleJournee
    ACTUALISER
    Planifier
End Sub

'============================================================ planification

Private Sub Planifier()
    Dim s As Double
    s = NumP("P_REFRESH_SEC")
    If s < 15 Then s = 60
    mProchain = Now + s / 86400#
    R("C_PROCHAIN").Value = mProchain
    Application.OnTime EarliestTime:=mProchain, Procedure:=NomCycle(), Schedule:=True
End Sub

Private Function NomCycle() As String
    NomCycle = "'" & ThisWorkbook.Name & "'!PPLive_Cycle"
End Function

Private Sub ArretSilencieux()
    ' Annule l'actualisation planifiée (heure gardée en mémoire, ou dans CONTRÔLE si VBA a été réinitialisé).
    Dim t As Double, v As Variant
    t = CDbl(mProchain)
    If t = 0 Then
        v = R("C_PROCHAIN").Value2
        If Not IsEmpty(v) And Not IsError(v) Then
            If IsNumeric(v) Then t = CDbl(v)
        End If
    End If
    If t > 0 Then
        On Error Resume Next                    ' rien de planifié à cette heure-là : sans importance
        Application.OnTime EarliestTime:=CDate(t), Procedure:=NomCycle(), Schedule:=False
        On Error GoTo 0
    End If
    mProchain = 0
    R("C_PROCHAIN").ClearContents
End Sub

'============================================================ un cycle d'actualisation

Public Sub ACTUALISER()
    ' LOGYS > TOURS et rejets, décelées si c'est l'heure, journal du jour, puis data.js.
    Dim calcPrev As XlCalculation, t0 As Single, nb As Long, msg As String, msgX As String, okX As Boolean
    calcPrev = Application.Calculation
    On Error GoTo Erreur
    Application.ScreenUpdating = False
    Application.EnableEvents = False
    Application.Calculation = xlCalculationManual
    t0 = Timer

    nb = LireTournees(msg)                       ' -1 si LOGYS n'a pas répondu
    If nb >= 0 Then
        LireRejets
        R("C_MAJ").Value = Now
        R("C_NB_TOURS").Value = nb
    End If
    If DeceleesADue() Then LireDecelees
    Application.Calculate
    MajJournal
    Application.Calculate
    okX = EcrireDataJs(msgX)
    R("C_DUREE").Value = Round(Abs(Timer - t0), 1)

    If nb < 0 Then
        Etat msg & " - nouvel essai à la prochaine actualisation", True
    ElseIf Not okX Then
        Etat msgX, True
    Else
        Etat "En marche - LOGYS lu à " & Format$(Now, "hh:mm:ss") & " - " & nb & " tournées - écran à jour", False
    End If

Sortie:
    Application.Calculation = calcPrev
    Application.EnableEvents = True
    Application.ScreenUpdating = True
    Exit Sub
Erreur:
    Etat "Erreur " & Err.Number & " : " & Err.Description, True
    Resume Sortie
End Sub

'============================================================ LOGYS (Oracle, lecture seule)

Private Function LireTournees(ByRef msg As String) As Long
    ' Requête Q_TOURS > onglet TOURS. Chaque champ va sous l'en-tête du même nom. -1 si échec.
    Dim sql As String, data As Variant, champs As Variant, ent As Variant, x As Variant
    Dim cible As Range, sortie() As Variant, colDe() As Long
    Dim nbL As Long, nbC As Long, i As Long, c As Long, f As Long

    LireTournees = -1
    sql = SqlPropre(Txt("Q_TOURS"))
    If Len(sql) = 0 Or InStr(1, sql, "<<", vbBinaryCompare) > 0 Then
        msg = "Requête des tournées à compléter (onglet REQUÊTES)"
        Exit Function
    End If
    If Not ExecSql(sql, data, champs, msg) Then Exit Function

    Set cible = R("T_TOURS")
    cible.ClearContents
    LireTournees = 0
    If IsEmpty(data) Then Exit Function          ' aucune tournée : onglet vide, pas une erreur

    nbL = UBound(data, 2) - LBound(data, 2) + 1  ' GetRows renvoie (champ, ligne)
    If nbL > cible.Rows.Count Then
        Journaliser "TOURS : " & nbL & " tournées renvoyées, seules les " & cible.Rows.Count & " premières sont lues"
        nbL = cible.Rows.Count
    End If
    nbC = cible.Columns.Count
    ent = R("T_TOURS_ENTETE").Value2
    ReDim colDe(1 To nbC)
    For c = 1 To nbC
        colDe(c) = -1
        For f = LBound(champs) To UBound(champs)
            If StrComp(SafeStr(ent(1, c)), CStr(champs(f)), vbTextCompare) = 0 Then
                colDe(c) = f
                Exit For
            End If
        Next f
    Next c
    ReDim sortie(1 To nbL, 1 To nbC)
    For i = 1 To nbL
        For c = 1 To nbC
            If colDe(c) >= 0 Then
                x = data(colDe(c), LBound(data, 2) + i - 1)
                If Not IsNull(x) Then sortie(i, c) = x
            End If
        Next c
    Next i
    cible.Resize(nbL, nbC).Value = sortie
    LireTournees = nbL
End Function

Private Sub LireRejets()
    ' Requête Q_REJETS : 1re valeur de la 1re ligne. Ignorée tant qu'elle contient des <<...>>.
    Dim sql As String, data As Variant, champs As Variant, msg As String
    sql = SqlPropre(Txt("Q_REJETS"))
    If Len(sql) = 0 Or InStr(1, sql, "<<", vbBinaryCompare) > 0 Then Exit Sub
    If ExecSql(sql, data, champs, msg) Then
        If IsEmpty(data) Then
            R("R_REJETS").Value = 0
        ElseIf IsNull(data(0, 0)) Then
            R("R_REJETS").Value = 0
        Else
            R("R_REJETS").Value = data(0, 0)
        End If
    Else
        Journaliser "Rejets : " & msg
    End If
End Sub

Public Sub CHERCHER_TABLE()
    ' Cherche dans le dictionnaire Oracle la table qui a les colonnes des tournées (lecture seule).
    Dim data As Variant, champs As Variant, msg As String, zone As Range, sortie() As Variant
    Dim i As Long, k As Long, n As Long, nomTable As String

    Application.Cursor = xlWait
    If Not ExecSql(SqlPropre(Txt("Q_RECHERCHE")), data, champs, msg) Then
        Application.Cursor = xlDefault
        MsgBox msg, vbExclamation, "PP LIVE"
        Exit Sub
    End If
    Application.Cursor = xlDefault

    Set zone = R("Q_RESULTAT")
    zone.ClearContents
    If IsEmpty(data) Then
        MsgBox "Aucune table de LOGYS visible avec ce compte n'a les colonnes des tournées." & vbLf & _
               "Demande le nom de la table à l'informatique.", vbInformation, "PP LIVE"
        Exit Sub
    End If
    n = UBound(data, 2) - LBound(data, 2) + 1
    If n > zone.Rows.Count Then n = zone.Rows.Count
    ReDim sortie(1 To n, 1 To zone.Columns.Count)
    For i = 1 To n
        For k = 1 To zone.Columns.Count
            If k - 1 <= UBound(data, 1) Then sortie(i, k) = data(k - 1, LBound(data, 2) + i - 1)
        Next k
    Next i
    zone.Resize(n, zone.Columns.Count).Value = sortie

    nomTable = SafeStr(sortie(1, 1)) & "." & SafeStr(sortie(1, 2))
    If InStr(1, Txt("Q_TOURS"), "<<TABLE_TOURNEES>>", vbTextCompare) > 0 Then
        If MsgBox("Table la plus probable : " & nomTable & vbLf & vbLf & _
                  "La mettre dans la requête des tournées ?", vbQuestion + vbYesNo, "PP LIVE") = vbYes Then
            R("Q_TOURS").Value = Replace(SafeStr(R("Q_TOURS").Value2), "<<TABLE_TOURNEES>>", nomTable, , , vbTextCompare)
            ACTUALISER
        End If
    Else
        MsgBox "Résultat dans l'onglet REQUÊTES. La requête des tournées est déjà complétée.", vbInformation, "PP LIVE"
    End If
End Sub

Private Function ExecSql(ByVal sql As String, ByRef data As Variant, ByRef champs As Variant, _
                         ByRef msg As String) As Boolean
    ' Exécute un SELECT par le DSN ODBC ; data = GetRows (champ, ligne) ou Empty si aucune ligne.
    Dim cn As Object, rs As Object, i As Long, noms() As String
    On Error GoTo Erreur
    data = Empty
    Set cn = CreateObject("ADODB.Connection")
    cn.ConnectionTimeout = 15
    cn.CommandTimeout = 90
    cn.Open ChaineConnexion()
    Set rs = CreateObject("ADODB.Recordset")
    rs.Open sql, cn, 0, 1                        ' adOpenForwardOnly, adLockReadOnly
    ReDim noms(0 To rs.Fields.Count - 1)
    For i = 0 To rs.Fields.Count - 1
        noms(i) = rs.Fields(i).Name
    Next i
    champs = noms
    If Not rs.EOF Then data = rs.GetRows()
    ExecSql = True
Sortie:
    On Error Resume Next
    If Not rs Is Nothing Then If rs.State <> 0 Then rs.Close
    If Not cn Is Nothing Then If cn.State <> 0 Then cn.Close
    Exit Function
Erreur:
    msg = "LOGYS : " & Replace(Replace(Err.Description, vbCr, " "), vbLf, " ")
    ExecSql = False
    Resume Sortie
End Function

Private Function ChaineConnexion() As String
    ' DSN déjà configuré sur le poste ; identifiants seulement s'ils sont renseignés dans PARAMÈTRES.
    Dim s As String
    s = "DSN=" & Txt("P_DSN") & ";"
    If Len(Txt("P_UID")) > 0 Then s = s & "UID=" & Txt("P_UID") & ";"
    If Len(Txt("P_PWD")) > 0 Then s = s & "PWD=" & Txt("P_PWD") & ";"
    ChaineConnexion = s
End Function

Private Function SqlPropre(ByVal s As String) As String
    ' Via ODBC : pas de point-virgule final (ORA-00911), retours chariot Windows retirés.
    s = Replace(s, vbCr, "")
    Do While Len(s) > 0
        Select Case Right$(s, 1)
            Case ";", " ", vbLf, vbTab
                s = Left$(s, Len(s) - 1)
            Case Else
                Exit Do
        End Select
    Loop
    SqlPropre = Trim$(s)
End Function

'============================================================ décelées (fichier réseau)

Private Function DeceleesADue() As Boolean
    Dim v As Variant, m As Double
    m = NumP("P_DEC_MINUTES")
    If m < 1 Then m = 5
    v = R("C_DEC").Value2
    If IsEmpty(v) Or IsError(v) Then
        DeceleesADue = True
    ElseIf Not IsNumeric(v) Then
        DeceleesADue = True
    Else
        DeceleesADue = ((CDbl(Now) - CDbl(v)) * 1440# >= m) Or (Int(CDbl(v)) <> CLng(Date))
    End If
End Function

Private Sub LireDecelees()
    ' Décelées du jour par matricule : fichier du mois, onglet jjmmaa ou jjmmaaaa, une ligne = une décelée.
    Dim dossier As String, chemin As String, colMat As String, m As String
    Dim l1 As Long, der As Long, i As Long, n As Long
    Dim wb As Workbook, ws As Worksheet, v As Variant, d As Object, cles As Variant
    Dim zone As Range, sortie() As Variant

    On Error GoTo Erreur
    R("C_DEC").Value = Now                       ' même en cas d'échec : nouvel essai au prochain créneau
    dossier = Txt("P_DOSSIER_DECELEES")
    colMat = Txt("P_DEC_COL_MAT")
    If Not Renseigne(dossier) Or Not Renseigne(colMat) Then Exit Sub
    If Right$(dossier, 1) <> "\" Then dossier = dossier & "\"
    chemin = dossier & Replace(Replace(Txt("P_MODELE_DECELEES"), "{mois}", MoisFr(Month(Date)), , , vbTextCompare), _
                               "{aaaa}", CStr(Year(Date)), , , vbTextCompare)
    If Len(Dir$(chemin)) = 0 Then
        Journaliser "Décelées : fichier introuvable " & chemin
        Exit Sub
    End If
    l1 = CLng(NumP("P_DEC_LIGNE1"))
    If l1 < 1 Then l1 = 2

    Set d = CreateObject("Scripting.Dictionary")
    d.CompareMode = vbTextCompare
    Set wb = OuvrirLecture(chemin)
    Set ws = FeuilleDuJour(wb)
    If ws Is Nothing Then
        Journaliser "Décelées : pas d'onglet " & Format$(Date, "ddmmyy") & " dans " & wb.Name
    Else
        der = ws.Cells(ws.Rows.Count, colMat).End(xlUp).Row
        If der >= l1 Then
            v = ws.Range(ws.Cells(l1, colMat), ws.Cells(der, colMat)).Value2
            If Not IsArray(v) Then v = Tableau1(v)
            For i = 1 To UBound(v, 1)
                m = NormMat(v(i, 1))
                If Len(m) > 0 Then d(m) = d(m) + 1
            Next i
        End If
    End If
    wb.Close SaveChanges:=False
    Set wb = Nothing

    Set zone = R("D_TABLE")
    zone.ClearContents
    n = d.Count
    If n = 0 Then Exit Sub
    cles = d.Keys
    ReDim sortie(1 To n, 1 To 2)
    For i = 1 To n
        sortie(i, 1) = "'" & CStr(cles(i - 1))  ' apostrophe : le matricule reste du texte (017)
        sortie(i, 2) = d(cles(i - 1))
    Next i
    TriDecroissant sortie, 2
    If n > zone.Rows.Count Then n = zone.Rows.Count
    zone.Resize(n, 2).Value = sortie            ' seules les n premières lignes du tableau sont écrites
    Exit Sub
Erreur:
    Journaliser "Décelées : " & Err.Description
    On Error Resume Next
    If Not wb Is Nothing Then wb.Close SaveChanges:=False
End Sub

Private Function FeuilleDuJour(ByVal wb As Workbook) As Worksheet
    Dim ws As Worksheet, n1 As String, n2 As String
    n1 = Format$(Date, "ddmmyy")
    n2 = Format$(Date, "ddmmyyyy")
    For Each ws In wb.Worksheets
        If Trim$(ws.Name) = n1 Or Trim$(ws.Name) = n2 Then
            Set FeuilleDuJour = ws
            Exit Function
        End If
    Next ws
End Function

'============================================================ suivi op (registre, cadences, historique)

Private Function ChargerSuiviOp() As Boolean
    ' Lit OPERATEURS (dès la ligne 7), PROD (dès la ligne 5) et ERREURS (dès la ligne 4) du suivi op.
    Dim chemin As String, wb As Workbook, ops As Variant, prod As Variant, errs As Variant
    On Error GoTo Erreur
    chemin = Txt("P_SUIVI_OP")
    If Not Renseigne(chemin) Then
        Etat "Suivi op non renseigné (PARAMÈTRES) : cadence de démarrage pour tous", True
        Exit Function
    End If
    If Len(Dir$(chemin)) = 0 Then
        Etat "Suivi op introuvable : " & chemin, True
        Exit Function
    End If
    Set wb = OuvrirLecture(chemin)
    ops = Bloc(wb.Worksheets("OPERATEURS"), 7, 13)      ' A:M
    prod = Bloc(wb.Worksheets("PROD"), 5, 26)           ' A:Z
    errs = Bloc(wb.Worksheets("ERREURS"), 4, 4)         ' A:D
    wb.Close SaveChanges:=False
    Set wb = Nothing
    If Not IsArray(ops) Then
        Etat "Suivi op : onglet OPERATEURS vide", True
        Exit Function
    End If
    EcrireCadences ops, prod
    EcrireHisto prod, errs
    R("C_SUIVI").Value = Now
    ChargerSuiviOp = True
    Exit Function
Erreur:
    Etat "Suivi op : " & Err.Description, True
    On Error Resume Next
    If Not wb Is Nothing Then wb.Close SaveChanges:=False
End Function

Private Sub EcrireCadences(ByVal ops As Variant, ByVal prod As Variant)
    ' Une ligne par opérateur du registre : jours de prod, cadence sur ses derniers jours de prod
    ' (somme  lignes / somme  heures de picking réelles, heures de picking = heures - heures hors pick).
    Const O_MAT As Long = 1, O_NOM As Long = 2, O_PRENOM As Long = 3, O_NP As Long = 4, O_ROLE As Long = 5
    Const O_POSTE As Long = 6, O_CONTRAT As Long = 7, O_ACTIF As Long = 10, O_QUOTA As Long = 13
    Const P_DATE As Long = 1, P_NP As Long = 3, P_H As Long = 4, P_HHP As Long = 5, P_LIG As Long = 6
    Const P_DOUBLON As Long = 26
    Dim idx As Object, nOps As Long, i As Long, k As Long, n As Long, fen As Long
    Dim jours() As Long, nbF() As Long, ligF() As Double, hF() As Double, dernier() As Double
    Dim hp As Double, np As String, zone As Range, sortie() As Variant

    fen = CLng(NumP("P_FENETRE_CADENCE"))
    If fen < 1 Then fen = 30
    nOps = UBound(ops, 1)
    Set idx = CreateObject("Scripting.Dictionary")
    idx.CompareMode = vbTextCompare
    For i = 1 To nOps
        np = NomPrenom(ops, i, O_NP, O_NOM, O_PRENOM)
        If Len(np) > 0 And Not idx.Exists(np) Then idx.Add np, i
    Next i
    ReDim jours(1 To nOps): ReDim nbF(1 To nOps): ReDim ligF(1 To nOps)
    ReDim hF(1 To nOps): ReDim dernier(1 To nOps)

    If IsArray(prod) Then
        For i = UBound(prod, 1) To 1 Step -1    ' du plus récent au plus ancien (PROD est chronologique)
            np = SafeStr(prod(i, P_NP))
            If Len(np) > 0 And EstDate(prod(i, P_DATE)) And Not EstDoublon(prod(i, P_DOUBLON)) Then
                If idx.Exists(np) Then
                    k = idx(np)
                    hp = Num(prod(i, P_H)) - Num(prod(i, P_HHP))
                    If hp > 0 Then
                        jours(k) = jours(k) + 1
                        If CDbl(prod(i, P_DATE)) > dernier(k) Then dernier(k) = CDbl(prod(i, P_DATE))
                        If nbF(k) < fen Then
                            nbF(k) = nbF(k) + 1
                            ligF(k) = ligF(k) + Num(prod(i, P_LIG))
                            hF(k) = hF(k) + hp
                        End If
                    End If
                End If
            End If
        Next i
    End If

    ReDim sortie(1 To nOps, 1 To 12)
    For i = 1 To nOps
        np = NomPrenom(ops, i, O_NP, O_NOM, O_PRENOM)
        If Len(np) > 0 Then
            n = n + 1
            sortie(n, 1) = "'" & NormMat(ops(i, O_MAT))
            sortie(n, 2) = np
            sortie(n, 3) = SafeStr(ops(i, O_ROLE))
            sortie(n, 4) = SafeStr(ops(i, O_POSTE))
            sortie(n, 5) = SafeStr(ops(i, O_CONTRAT))
            If UCase$(SafeStr(ops(i, O_ACTIF))) = "OUI" Then sortie(n, 6) = "OUI" Else sortie(n, 6) = "NON"
            If UCase$(SafeStr(ops(i, O_QUOTA))) = "NON" Then sortie(n, 7) = "NON" Else sortie(n, 7) = "OUI"
            sortie(n, 8) = jours(i)
            sortie(n, 9) = ligF(i)
            sortie(n, 10) = Round(hF(i), 2)
            If hF(i) > 0 Then sortie(n, 11) = Round(ligF(i) / hF(i), 1)
            If dernier(i) > 0 Then sortie(n, 12) = CDate(dernier(i))
        End If
    Next i
    Set zone = R("CAD_TABLE")
    zone.ClearContents
    If n = 0 Then Exit Sub
    If n > zone.Rows.Count Then
        Journaliser "Registre : " & n & " opérateurs, seuls les " & zone.Rows.Count & " premiers sont gardés"
        n = zone.Rows.Count
    End If
    zone.Resize(n, 12).Value = sortie
End Sub

Private Sub EcrireHisto(ByVal prod As Variant, ByVal errs As Variant)
    ' 30 derniers jours travaillés avant aujourd'hui : productivité de l'équipe
    ' (somme  lignes / somme  heures de picking x heures pointées) et PPM avérées (somme  avérées / somme  lignes x 1 000 000) ;
    ' mêmes calculs pour le mois en cours ; décelées par jour du mois (une ligne d'ERREURS = une décelée).
    Const P_DATE As Long = 1, P_NP As Long = 3, P_H As Long = 4, P_HHP As Long = 5, P_LIG As Long = 6
    Const P_AVER As Long = 13, P_DOUBLON As Long = 26
    Dim jours As Object, decs As Object, kk As Variant, zone As Range, sortie() As Variant
    Dim i As Long, j As Long, k As Long, d As Long, n As Long, nb As Long, debMois As Long, auj As Long
    Dim cles() As Long, sLigP() As Double, sH() As Double, sLig() As Double, sAv() As Double
    Dim lig As Double, hp As Double, hpt As Double
    Dim mLigP As Double, mH As Double, mLig As Double, mAv As Double

    hpt = NumP("P_HEURES_POINTEES")
    If hpt <= 0 Then hpt = 7.4
    auj = CLng(Date)
    debMois = CLng(DateSerial(Year(Date), Month(Date), 1))
    Set jours = CreateObject("Scripting.Dictionary")

    If IsArray(prod) Then
        ReDim sLigP(1 To UBound(prod, 1)): ReDim sH(1 To UBound(prod, 1))
        ReDim sLig(1 To UBound(prod, 1)): ReDim sAv(1 To UBound(prod, 1))
        For i = 1 To UBound(prod, 1)
            If EstDate(prod(i, P_DATE)) And Len(SafeStr(prod(i, P_NP))) > 0 And Not EstDoublon(prod(i, P_DOUBLON)) Then
                d = CLng(Int(CDbl(prod(i, P_DATE))))
                If d < auj Then
                    If Not jours.Exists(d) Then
                        n = n + 1
                        jours.Add d, n
                    End If
                    k = jours(d)
                    lig = Num(prod(i, P_LIG))
                    hp = Num(prod(i, P_H)) - Num(prod(i, P_HHP))
                    sLig(k) = sLig(k) + lig
                    sAv(k) = sAv(k) + Num(prod(i, P_AVER))
                    If hp > 0 Then
                        sLigP(k) = sLigP(k) + lig
                        sH(k) = sH(k) + hp
                    End If
                End If
            End If
        Next i
    End If

    ' dates connues, triées
    If n > 0 Then
        ReDim cles(1 To n)
        j = 0
        For Each kk In jours.Keys
            j = j + 1
            cles(j) = CLng(kk)
        Next kk
        TriCroissant cles
    End If

    ' 30 derniers jours travaillés (rangés du plus ancien au plus récent, lignes vides en haut s'il en manque)
    Set zone = R("H_HIST")
    zone.ClearContents
    nb = zone.Rows.Count
    ReDim sortie(1 To nb, 1 To 3)
    j = 0
    For i = n To 1 Step -1
        If j >= nb Then Exit For
        k = jours(cles(i))
        If sH(k) > 0 Then
            sortie(nb - j, 1) = CDate(cles(i))
            sortie(nb - j, 2) = Round(sLigP(k) / sH(k) * hpt, 0)
            If sLig(k) > 0 Then sortie(nb - j, 3) = Round(sAv(k) / sLig(k) * 1000000#, 0)
            j = j + 1
        End If
    Next i
    zone.Value = sortie

    ' mois en cours (jusqu'à hier)
    For i = 1 To n
        If cles(i) >= debMois Then
            k = jours(cles(i))
            mLigP = mLigP + sLigP(k): mH = mH + sH(k)
            mLig = mLig + sLig(k): mAv = mAv + sAv(k)
        End If
    Next i
    R("H_MOIS_PROD").ClearContents
    R("H_MOIS_PPM").ClearContents
    If mH > 0 Then R("H_MOIS_PROD").Value = Round(mLigP / mH * hpt, 0)
    If mLig > 0 Then R("H_MOIS_PPM").Value = Round(mAv / mLig * 1000000#, 0)

    ' décelées par jour travaillé du mois (0 si aucune)
    Set decs = CreateObject("Scripting.Dictionary")
    If IsArray(errs) Then
        For i = 1 To UBound(errs, 1)
            If EstDate(errs(i, 1)) And Len(SafeStr(errs(i, 3))) > 0 Then
                d = CLng(Int(CDbl(errs(i, 1))))
                If d >= debMois And d < auj Then decs(d) = decs(d) + 1
            End If
        Next i
    End If
    Set zone = R("H_DEC")
    zone.ClearContents
    ReDim sortie(1 To zone.Rows.Count, 1 To 2)
    j = 0
    For i = 1 To n
        If cles(i) >= debMois And j < zone.Rows.Count Then
            j = j + 1
            sortie(j, 1) = CDate(cles(i))
            If decs.Exists(cles(i)) Then sortie(j, 2) = decs(cles(i)) Else sortie(j, 2) = 0
        End If
    Next i
    zone.Value = sortie
End Sub

'============================================================ journée

Private Sub NouvelleJournee()
    ' Suivi op relu, équipe rechargée et recochée, prévision et heures effacées, date notée.
    Dim calcPrev As XlCalculation
    calcPrev = Application.Calculation
    On Error GoTo Erreur
    Application.ScreenUpdating = False
    Application.EnableEvents = False
    Application.Calculation = xlCalculationManual

    R("C_JOUR").Value = CLng(Date)               ' d'abord : un échec ne relance pas tout chaque minute
    ChargerSuiviOp
    RemplirEquipe
    R("J_PREVU").MergeArea.ClearContents
    Journaliser "Nouvelle journée préparée"

Sortie:
    Application.Calculation = calcPrev
    Application.EnableEvents = True
    Application.ScreenUpdating = True
    Exit Sub
Erreur:
    Etat "Nouvelle journée : " & Err.Description, True
    Resume Sortie
End Sub

Private Sub RemplirEquipe()
    ' Liste du jour = opérateurs ACTIFS du registre (onglet CADENCES), rôle Pilote si le registre le dit.
    ' Sans registre lu, la liste actuelle est gardée. Dans tous les cas : tout le monde coché.
    Dim cad As Variant, eqMat As Range, v As Variant, nbMax As Long, n As Long, i As Long, nbActifs As Long
    Dim mats() As Variant, roles() As Variant, coches() As Variant, role As String

    Set eqMat = R("J_MAT")
    nbMax = eqMat.Rows.Count
    ReDim mats(1 To nbMax, 1 To 1): ReDim roles(1 To nbMax, 1 To 1): ReDim coches(1 To nbMax, 1 To 1)
    cad = R("CAD_TABLE").Value2
    For i = 1 To UBound(cad, 1)
        If Len(SafeStr(cad(i, 1))) > 0 And SafeStr(cad(i, 6)) = "OUI" Then
            nbActifs = nbActifs + 1
            If n < nbMax Then
                n = n + 1
                mats(n, 1) = "'" & SafeStr(cad(i, 1))
                role = UCase$(SafeStr(cad(i, 3)) & " " & SafeStr(cad(i, 4)))
                If InStr(1, role, "PILOT", vbTextCompare) > 0 Then roles(n, 1) = "Pilote" Else roles(n, 1) = "Picking"
            End If
        End If
    Next i
    If n > 0 Then
        eqMat.Value = mats
        R("J_ROLE").Value = roles
        If nbActifs > nbMax Then Journaliser "Registre : " & nbActifs & " actifs, seuls " & nbMax & " tiennent dans la liste"
    End If
    v = eqMat.Value2
    For i = 1 To nbMax
        coches(i, 1) = (Len(SafeStr(v(i, 1))) > 0)
    Next i
    R("J_CHK").Value = coches
    R("J_PART").ClearContents
    R("J_REVIENT").ClearContents
    R("J_VERS").ClearContents
End Sub

Private Sub MajJournal()
    ' Une ligne par jour (onglet JOURNAL) : sert à l'historique des rejets affiché par l'écran.
    Dim zone As Range, v As Variant, i As Long, ligne As Long, auj As Long
    Set zone = R("JR_TABLE")
    v = zone.Columns(1).Value2
    auj = CLng(Date)
    For i = 1 To UBound(v, 1)
        If IsEmpty(v(i, 1)) Then
            ligne = i                            ' première ligne libre : on ajoute aujourd'hui
            Exit For
        ElseIf Not IsError(v(i, 1)) Then
            If IsNumeric(v(i, 1)) Then
                If CLng(Int(CDbl(v(i, 1)))) = auj Then
                    ligne = i
                    Exit For
                End If
            End If
        End If
    Next i
    If ligne = 0 Then Exit Sub                   ' journal plein (1 000 jours)
    zone.Cells(ligne, 1).Value = CDate(auj)
    zone.Cells(ligne, 2).Value = Sure(R("R_REJETS").Value2)
    zone.Cells(ligne, 3).Value = Sure(R("C_FAITES").Value2)
    zone.Cells(ligne, 4).Value = Sure(R("C_DEC_TOTAL").Value2)
    zone.Cells(ligne, 5).Value = Sure(R("J_PREVU").Value2)
    zone.Cells(ligne, 6).Value = Sure(R("J_PRESENTS").Value2)
End Sub

'============================================================ data.js

Private Function EcrireDataJs(ByRef msg As String) As Boolean
    ' Recopie l'onglet EXPORT (une ligne de JavaScript par cellule) dans data.js, en UTF-8.
    ' Écrit d'abord data.js.tmp puis le renomme : l'écran ne lit jamais un fichier à moitié écrit.
    Dim dossier As String, fin As String, tmp As String, v As Variant, parts() As String
    Dim i As Long, n As Long, st As Object
    On Error GoTo Erreur
    dossier = Txt("P_DOSSIER_EXPORT")
    If Not Renseigne(dossier) Then
        msg = "Dossier de l'écran non renseigné (PARAMÈTRES)"
        Exit Function
    End If
    If Right$(dossier, 1) <> "\" Then dossier = dossier & "\"
    If Len(Dir$(dossier, vbDirectory)) = 0 Then
        msg = "Dossier de l'écran introuvable : " & dossier
        Exit Function
    End If
    v = R("X_LIGNES").Value2
    ReDim parts(1 To UBound(v, 1))
    For i = 1 To UBound(v, 1)
        If IsError(v(i, 1)) Then
            msg = "data.js non écrit : erreur de formule ligne " & i & " de l'onglet EXPORT"
            Exit Function
        End If
        If Len(SafeStr(v(i, 1))) > 0 Then
            n = n + 1
            parts(n) = CStr(v(i, 1))
        End If
    Next i
    If n = 0 Then
        msg = "Onglet EXPORT vide"
        Exit Function
    End If
    ReDim Preserve parts(1 To n)
    fin = dossier & "data.js"
    tmp = dossier & "data.js.tmp"
    Set st = CreateObject("ADODB.Stream")
    st.Type = 2                                  ' adTypeText
    st.Charset = "utf-8"
    st.Open
    st.WriteText Join(parts, vbLf) & vbLf
    st.SaveToFile tmp, 2                         ' adSaveCreateOverWrite
    st.Close
    If Len(Dir$(fin)) > 0 Then Kill fin
    Name tmp As fin
    R("C_EXPORT").Value = Now
    EcrireDataJs = True
    Exit Function
Erreur:
    msg = "data.js non écrit : " & Err.Description
End Function

'============================================================ état et journal

Private Sub Etat(ByVal texte As String, ByVal alerte As Boolean)
    ' Bandeau d'état de l'onglet AUJOURD'HUI + dernier message (CONTRÔLE) + journal si alerte.
    With R("J_ETAT").MergeArea
        If alerte Then
            .Cells(1, 1).Value = ChrW(9888) & "  " & texte   ' panneau attention
            .Font.Color = RGB(180, 35, 24)
            .Interior.Color = RGB(254, 243, 242)
        Else
            .Cells(1, 1).Value = ChrW(9679) & "  " & texte   ' point plein
            .Font.Color = RGB(0, 120, 60)
            .Interior.Color = RGB(236, 253, 243)
        End If
    End With
    R("C_MSG").Value = Format$(Now, "hh:mm:ss") & "  " & texte
    If alerte Then Journaliser texte
End Sub

Private Sub Journaliser(ByVal texte As String)
    ' Les derniers messages en haut de l'onglet CONTRÔLE, le plus récent en premier.
    Dim zone As Range, v As Variant, i As Long
    Set zone = R("C_LOG")
    v = zone.Value2
    If Not IsEmpty(v(1, 2)) And Not IsError(v(1, 2)) Then
        If CStr(v(1, 2)) = texte Then            ' même message qu'à la minute précédente : on met l'heure à jour
            zone.Cells(1, 1).Value = Now
            Exit Sub
        End If
    End If
    For i = UBound(v, 1) To 2 Step -1
        v(i, 1) = v(i - 1, 1)
        v(i, 2) = v(i - 1, 2)
    Next i
    v(1, 1) = CDbl(Now)
    v(1, 2) = texte
    zone.Value2 = v
End Sub

'============================================================ utilitaires

Private Function R(ByVal nom As String) As Range
    Set R = ThisWorkbook.Names(nom).RefersToRange
End Function

Private Function Txt(ByVal nom As String) As String
    Txt = SafeStr(R(nom).Cells(1, 1).Value2)
End Function

Private Function NumP(ByVal nom As String) As Double
    NumP = Num(R(nom).Cells(1, 1).Value2)
End Function

Private Function Num(ByVal x As Variant) As Double
    If IsError(x) Or IsEmpty(x) Or IsNull(x) Then Exit Function
    If IsNumeric(x) Then Num = CDbl(x)
End Function

Private Function SafeStr(ByVal x As Variant) As String
    If IsError(x) Or IsEmpty(x) Or IsNull(x) Then Exit Function
    SafeStr = Trim$(CStr(x))
End Function

Private Function Sure(ByVal x As Variant) As Variant
    ' Valeur recopiable dans une cellule : une erreur de formule devient une cellule vide.
    If IsError(x) Then Sure = Empty Else Sure = x
End Function

Private Function Renseigne(ByVal s As String) As Boolean
    Renseigne = Len(s) > 0 And InStr(1, s, "RENSEIGNER", vbTextCompare) = 0
End Function

Private Function EstDate(ByVal x As Variant) As Boolean
    ' Value2 renvoie les dates en nombre de jours : on accepte de 2000 à 2100.
    If IsError(x) Or IsEmpty(x) Then Exit Function
    If VarType(x) = vbDouble Then EstDate = (x > 36526# And x < 73051#)
End Function

Private Function EstDoublon(ByVal x As Variant) As Boolean
    ' Colonne DOUBLON du suivi op : tout ce qui n'est ni vide ni 0 compte comme doublon.
    If IsError(x) Or IsEmpty(x) Then Exit Function
    If IsNumeric(x) Then
        EstDoublon = (CDbl(x) <> 0)
    Else
        EstDoublon = (Len(Trim$(CStr(x))) > 0)
    End If
End Function

Private Function NormMat(ByVal x As Variant) As String
    ' Matricule en texte : 149 (nombre) > "149", "017" reste "017".
    If IsError(x) Or IsEmpty(x) Then Exit Function
    If VarType(x) = vbDouble Then
        NormMat = Format$(x, "0")
    Else
        NormMat = Trim$(CStr(x))
    End If
End Function

Private Function NomPrenom(ByVal ops As Variant, ByVal i As Long, ByVal cNp As Long, _
                           ByVal cNom As Long, ByVal cPrenom As Long) As String
    ' Colonne NOM PRENOM du registre, ou NOM + PRENOM si elle est vide.
    NomPrenom = SafeStr(ops(i, cNp))
    If Len(NomPrenom) = 0 And Len(SafeStr(ops(i, cNom))) > 0 Then
        NomPrenom = Trim$(SafeStr(ops(i, cNom)) & " " & SafeStr(ops(i, cPrenom)))
    End If
End Function

Private Function Bloc(ByVal ws As Worksheet, ByVal l1 As Long, ByVal nbCol As Long) As Variant
    ' Valeurs de la ligne l1 jusqu'à la dernière ligne remplie (colonne A ou B), sur nbCol colonnes.
    Dim der As Long, derB As Long
    der = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    derB = ws.Cells(ws.Rows.Count, 2).End(xlUp).Row
    If derB > der Then der = derB
    If der < l1 Then Exit Function               ' renvoie Empty
    Bloc = ws.Range(ws.Cells(l1, 1), ws.Cells(der, nbCol)).Value2
End Function

Private Function OuvrirLecture(ByVal chemin As String) As Workbook
    ' Ouvre un classeur en lecture seule, sans lancer ses macros ni mettre à jour ses liaisons.
    Dim secPrev As Long, evtPrev As Boolean
    secPrev = Application.AutomationSecurity
    evtPrev = Application.EnableEvents
    Application.AutomationSecurity = AUTO_FORCE_DISABLE
    Application.EnableEvents = False
    On Error GoTo Erreur
    Set OuvrirLecture = Workbooks.Open(Filename:=chemin, UpdateLinks:=0, ReadOnly:=True, AddToMru:=False)
    Application.AutomationSecurity = secPrev
    Application.EnableEvents = evtPrev
    Exit Function
Erreur:
    Application.AutomationSecurity = secPrev
    Application.EnableEvents = evtPrev
    Err.Raise Err.Number, "OuvrirLecture", Err.Description
End Function

Private Function Tableau1(ByVal x As Variant) As Variant
    ' Une plage d'une seule cellule renvoie une valeur, pas un tableau : on la met dans un tableau 1 x 1.
    Dim a(1 To 1, 1 To 1) As Variant
    a(1, 1) = x
    Tableau1 = a
End Function

Private Function MoisFr(ByVal m As Long) As String
    MoisFr = Choose(m, "janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", _
                    "septembre", "octobre", "novembre", "décembre")
End Function

Private Function JourEnregistre() As Long
    Dim v As Variant
    v = R("C_JOUR").Value2
    If IsEmpty(v) Or IsError(v) Then Exit Function
    If IsNumeric(v) Then JourEnregistre = CLng(Int(CDbl(v)))
End Function

Private Sub TriDecroissant(ByRef a() As Variant, ByVal col As Long)
    ' Tri par insertion des lignes d'un tableau 2D (petits tableaux : quelques dizaines de lignes).
    Dim i As Long, j As Long, k As Long, t As Variant
    For i = LBound(a, 1) + 1 To UBound(a, 1)
        j = i
        Do While j > LBound(a, 1)
            If a(j - 1, col) >= a(j, col) Then Exit Do
            For k = LBound(a, 2) To UBound(a, 2)
                t = a(j, k): a(j, k) = a(j - 1, k): a(j - 1, k) = t
            Next k
            j = j - 1
        Loop
    Next i
End Sub

Private Sub TriCroissant(ByRef a() As Long)
    Dim i As Long, j As Long, t As Long
    For i = LBound(a) + 1 To UBound(a)
        t = a(i)
        j = i - 1
        Do While j >= LBound(a)
            If a(j) <= t Then Exit Do
            a(j + 1) = a(j)
            j = j - 1
        Loop
        a(j + 1) = t
    Next i
End Sub
