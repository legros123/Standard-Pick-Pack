Public Sub ACTUALISER()
    Dim cn As Object, ws As Worksheet
    Dim d As Date, d2 As Date, dts(0 To 4) As Date
    Dim lt(0 To 4, 1 To 4) As Double, xdk(0 To 4, 1 To 4) As Double
    Dim v As Variant, vDet As Variant
    Dim i As Long, j As Long, need As String, xmsg As String, msg As String
    Dim sqlT As String, sqlD As String, sqlX As String, t0 As Single

    If Not CheckDate() Then Exit Sub
    Application.Calculate
    d = CDate(Rg("PDJ_DATE").Value)
    d2 = CDate(Rg("PDJ_D2").Value)
    dts(0) = d
    For i = 1 To 4
        dts(i) = d2 - 7 * i
    Next i
    Set ws = ThisWorkbook.Worksheets(WS_LL)
    t0 = Timer

    On Error GoTo Echec
    Application.Cursor = xlWait
    Application.StatusBar = "LOGYS : connexion..."
    Set cn = OpenConn()

    ' 1) lignes de tournée (PP / HG / Câble) et lignes de commande, par jour
    Application.StatusBar = "LOGYS : lignes de tournée..."
    sqlT = SqlTournee("REXEL.LIG_TOUR", dts, "01234")
    v = RunSQL(cn, sqlT)
    StoreTournee v, dts, lt

    '    jours de référence absents de LIG_TOUR (purgés) : relus dans l'historique
    need = ""
    For i = 1 To 4
        If lt(i, 1) + lt(i, 2) + lt(i, 3) = 0 Then need = need & CStr(i)
    Next i
    If Len(need) > 0 Then
        Application.StatusBar = "LOGYS : historique des tournées..."
        On Error Resume Next
        v = Empty
        v = RunSQL(cn, SqlTournee("HIST.F_VISLTOUR", dts, need))
        If Err.Number = 0 Then StoreTournee v, dts, lt
        Err.Clear
        On Error GoTo Echec
    End If

    ' 2) cross dock par jour (une erreur ici n'empêche pas le reste)
    Application.StatusBar = "LOGYS : cross dock..."
    sqlX = SqlXdock("REXEL.CONTENANT", dts, "01234")
    On Error Resume Next
    v = Empty
    v = RunSQL(cn, sqlX)
    If Err.Number <> 0 Then
        xmsg = " | cross dock en erreur : " & Err.Description
        Err.Clear
    Else
        StoreXdock v, dts, xdk
        need = ""
        For i = 1 To 4
            If xdk(i, 1) = 0 And lt(i, 4) > 0 Then need = need & CStr(i)
        Next i
        If Len(need) > 0 Then
            v = Empty
            v = RunSQL(cn, SqlXdock("HIST.CONTENANT", dts, need))
            If Err.Number = 0 Then StoreXdock v, dts, xdk
            Err.Clear
        End If
    End If
    On Error GoTo Echec

    ' 3) détail par code LOGYS du jour du point (contrôle)
    Application.StatusBar = "LOGYS : détail par code..."
    sqlD = SqlDetail(d)
    vDet = RunSQL(cn, sqlD)
    cn.Close
    Set cn = Nothing

    ' 4) écriture dans LIGNES_LOGYS
    ws.Range(ws.Cells(LL_ROW0, 1), ws.Cells(LL_ROW0 + 4, 10)).ClearContents
    For i = 0 To 4
        ws.Cells(LL_ROW0 + i, 1).Value = dts(i)
        For j = 1 To 4
            ws.Cells(LL_ROW0 + i, 1 + j).Value = lt(i, j)
            ws.Cells(LL_ROW0 + i, 5 + j).Value = xdk(i, j)
        Next j
        If i = 0 Then
            ws.Cells(LL_ROW0 + i, 10).Value = "jour du point"
        Else
            ws.Cells(LL_ROW0 + i, 10).Value = "référence S-" & i & " de demain"
        End If
    Next i
    ws.Range(ws.Cells(LL_DET0, 1), ws.Cells(LL_DET0 + LL_DETMAX - 1, 5)).ClearContents
    If Not IsEmpty(vDet) Then
        For i = 0 To UBound(vDet, 2)
            If i >= LL_DETMAX Then Exit For
            For j = 0 To 4
                ws.Cells(LL_DET0 + i, 1 + j).Value = Nz(vDet(j, i))
            Next j
        Next i
    End If
    Rg("LL_SQL1").Value = sqlT
    Rg("LL_SQL2").Value = sqlD
    Rg("LL_SQL3").Value = sqlX
    Rg("LL_MAJ").Value = Now
    Rg("LL_STATUT").Value = "OK " & Format$(Now, "dd/mm hh:nn") & " en " & Format$(Timer - t0, "0") & " s" & xmsg

    Application.Calculate
    Application.Cursor = xlDefault
    Application.StatusBar = False
    On Error Resume Next
    ANIMER
    On Error GoTo 0
    If Len(xmsg) > 0 Then
        MsgBox "Lignes LOGYS chargées, mais le cross dock n'a pas pu être lu :" & vbCrLf & Mid$(xmsg, 4), vbExclamation, "Point du jour"
    End If
    Exit Sub

Echec:
    msg = Err.Description
    Resume Nettoyage
Nettoyage:
    On Error Resume Next
    If Not cn Is Nothing Then
        If cn.State <> 0 Then cn.Close
    End If
    Application.Cursor = xlDefault
    Application.StatusBar = False
    Rg("LL_STATUT").Value = "ERREUR " & Format$(Now, "dd/mm hh:nn") & " : " & msg
    On Error GoTo 0
    MsgBox "LOGYS n'a pas répondu :" & vbCrLf & msg & vbCrLf & vbCrLf & _
           "Vérifie la connexion dans PARAMETRES (Connexion LOGYS)." & vbCrLf & _
           "La dernière requête envoyée est dans l'onglet LIGNES_LOGYS.", vbExclamation, "Point du jour"
End Sub

Private Function SqlTournee(ByVal src As String, dts() As Date, ByVal need As String) As String
    Dim pp As String, ca As String, typf As String, s As String
    pp = SqlList(Txt(Rg("PAR_CODES_PP").Value), "'DETA','CART'")
    ca = SqlList(Txt(Rg("PAR_CODES_CABLE").Value), "'CABL'")
    typf = SqlList(Txt(Rg("PAR_TYP_TOUR").Value), "")
    s = "SELECT TO_CHAR(TRUNC(l.DAT_MAJ),'YYYY-MM-DD') AS JOUR," & vbCrLf & _
        "       SUM(CASE WHEN l.STYP_TOUR IN (" & pp & ") THEN 1 ELSE 0 END) AS PP," & vbCrLf & _
        "       SUM(CASE WHEN NVL(l.STYP_TOUR,'?') NOT IN (" & pp & "," & ca & ") THEN 1 ELSE 0 END) AS HG," & vbCrLf & _
        "       SUM(CASE WHEN l.STYP_TOUR IN (" & ca & ") THEN 1 ELSE 0 END) AS CABLE," & vbCrLf & _
        "       COUNT(DISTINCT l.NUM_ORDRE || '/' || l.NUM_LIG_ORDRE) AS LIGNES_CDE" & vbCrLf & _
        "FROM " & src & " l" & vbCrLf & _
        "WHERE l.REEL > 0" & vbCrLf & _
        "  AND (" & DateRanges("l.DAT_MAJ", dts, need) & ")"
    If Len(typf) > 0 Then s = s & vbCrLf & "  AND l.TYP_TOUR IN (" & typf & ")"
    SqlTournee = s & vbCrLf & "GROUP BY TRUNC(l.DAT_MAJ)"
End Function

Private Function SqlDetail(ByVal d As Date) As String
    Dim pp As String, ca As String, dd As String
    pp = SqlList(Txt(Rg("PAR_CODES_PP").Value), "'DETA','CART'")
    ca = SqlList(Txt(Rg("PAR_CODES_CABLE").Value), "'CABL'")
    dd = "DATE '" & Format$(d, "yyyy-mm-dd") & "'"
    SqlDetail = "SELECT l.STYP_TOUR AS CODE, l.TYP_TOUR," & vbCrLf & _
        "       CASE WHEN l.STYP_TOUR IN (" & pp & ") THEN 'PP' WHEN l.STYP_TOUR IN (" & ca & ") THEN 'CABLE' ELSE 'HG' END AS SERVICE," & vbCrLf & _
        "       COUNT(*) AS LIGNES_TOURNEE," & vbCrLf & _
        "       COUNT(DISTINCT l.NUM_ORDRE || '/' || l.NUM_LIG_ORDRE) AS LIGNES_CDE" & vbCrLf & _
        "FROM REXEL.LIG_TOUR l" & vbCrLf & _
        "WHERE l.REEL > 0" & vbCrLf & _
        "  AND l.DAT_MAJ >= " & dd & " AND l.DAT_MAJ < " & dd & " + 1" & vbCrLf & _
        "GROUP BY l.STYP_TOUR, l.TYP_TOUR" & vbCrLf & _
        "ORDER BY 3, 4 DESC"
End Function

Private Function SqlXdock(ByVal src As String, dts() As Date, ByVal need As String) As String
    SqlXdock = "SELECT TO_CHAR(TRUNC(c.DAT_ENT),'YYYY-MM-DD') AS JOUR," & vbCrLf & _
        "       COUNT(DISTINCT c.NUM_CONT) AS XD_CONTENANTS," & vbCrLf & _
        "       SUM(NVL(c.NB_LIG_TERM,0)) AS XD_LIG_TERM," & vbCrLf & _
        "       SUM(NVL(c.NB_LIG_PREV,0)) AS XD_LIG_PREV," & vbCrLf & _
        "       COUNT(DISTINCT CASE WHEN c.NUM_ORDRE_ENT IS NOT NULL THEN c.NUM_ORDRE_ENT || '/' || c.NUM_LIG_ORDRE_ENT END) AS XD_LIG_RECEP" & vbCrLf & _
        "FROM " & src & " c" & vbCrLf & _
        "WHERE c.CL_XDOCK IS NOT NULL" & vbCrLf & _
        "  AND (" & DateRanges("c.DAT_ENT", dts, need) & ")" & vbCrLf & _
        "GROUP BY TRUNC(c.DAT_ENT)"
End Function

Private Function DateRanges(ByVal col As String, dts() As Date, ByVal need As String) As String
    Dim i As Long, s As String, dd As String
    For i = 0 To 4
        If InStr(1, need, CStr(i)) > 0 Then
            dd = "DATE '" & Format$(dts(i), "yyyy-mm-dd") & "'"
            If Len(s) > 0 Then s = s & " OR "
            s = s & "(" & col & " >= " & dd & " AND " & col & " < " & dd & " + 1)"
        End If
    Next i
    DateRanges = s
End Function

Private Function SqlList(ByVal csv As String, ByVal dflt As String) As String
    Dim parts() As String, i As Long, j As Long, c As String, w As String, sortie As String
    csv = Replace(csv, ";", ",")
    parts = Split(csv, ",")
    For i = LBound(parts) To UBound(parts)
        w = ""
        For j = 1 To Len(parts(i))
            c = UCase$(Mid$(parts(i), j, 1))
            If (c >= "A" And c <= "Z") Or (c >= "0" And c <= "9") Or c = "_" Then w = w & c
        Next j
        If Len(w) > 0 Then
            If Len(sortie) > 0 Then sortie = sortie & ","
            sortie = sortie & "'" & w & "'"
        End If
    Next i
    If Len(sortie) = 0 Then sortie = dflt
    SqlList = sortie
End Function

Private Sub StoreTournee(ByVal v As Variant, dts() As Date, lt() As Double)
    Dim r As Long, i As Long, j As Long
    If IsEmpty(v) Then Exit Sub
    For r = 0 To UBound(v, 2)
        i = DayIndex(Txt(v(0, r)), dts)
        If i >= 0 Then
            For j = 1 To 4
                lt(i, j) = NzD(v(j, r))
            Next j
        End If
    Next r
End Sub

Private Sub StoreXdock(ByVal v As Variant, dts() As Date, xdk() As Double)
    Dim r As Long, i As Long, j As Long
    If IsEmpty(v) Then Exit Sub
    For r = 0 To UBound(v, 2)
        i = DayIndex(Txt(v(0, r)), dts)
        If i >= 0 Then
            For j = 1 To 4
                xdk(i, j) = NzD(v(j, r))
            Next j
        End If
    Next r
End Sub

Private Function DayIndex(ByVal jour As String, dts() As Date) As Long
    Dim i As Long
    DayIndex = -1
    For i = 0 To 4
        If Format$(dts(i), "yyyy-mm-dd") = jour Then
            DayIndex = i
            Exit Function
        End If
    Next i
End Function

Private Function OpenConn() As Object
    Dim cn As Object, s As String
    s = GetConnString()
    If Len(s) = 0 Then
        Err.Raise vbObjectError + 512, , "Connexion LOGYS inconnue. Ouvre ton ancien fichier Heures_Preparation (connexion ODBC) " & _
                  "puis relance ACTUALISER, ou colle la chaîne ODBC (DSN=...;UID=...;PWD=...) dans PARAMETRES."
    End If
    Set cn = CreateObject("ADODB.Connection")
    cn.ConnectionTimeout = 20
    cn.CommandTimeout = 180
    cn.ConnectionString = s
    On Error Resume Next
    cn.Properties("Prompt") = 2      ' demande le mot de passe s'il manque dans la chaîne
    On Error GoTo 0
    cn.Open
    Set OpenConn = cn
End Function

Private Function GetConnString() As String
    Dim s As String, wb As Workbook, c As Object
    s = Trim$(Txt(Rg("PAR_CNX").Value))
    If Len(s) = 0 Then
        ' reprise automatique de la connexion ODBC d'un classeur ouvert (ancien fichier)
        On Error Resume Next
        For Each wb In Application.Workbooks
            For Each c In wb.Connections
                s = ""
                If c.Type = 2 Then s = CStr(c.ODBCConnection.Connection)       ' ODBC
                If c.Type = 1 Then s = CStr(c.OLEDBConnection.Connection)      ' OLE DB
                If InStr(1, s, "Mashup", vbTextCompare) > 0 Then s = ""         ' Power Query : inutilisable ici
                If Len(s) > 0 Then Exit For
            Next c
            If Len(s) > 0 Then Exit For
        Next wb
        On Error GoTo 0
        If Len(s) > 0 Then Rg("PAR_CNX").Value = s
    End If
    If UCase$(Left$(s, 5)) = "ODBC;" Then s = Mid$(s, 6)
    If UCase$(Left$(s, 6)) = "OLEDB;" Then s = Mid$(s, 7)
    GetConnString = s
End Function

Private Function RunSQL(ByVal cn As Object, ByVal sql As String) As Variant
    Dim rs As Object
    Set rs = CreateObject("ADODB.Recordset")
    rs.Open sql, cn, 0, 1               ' lecture seule, en avant
    If rs.EOF Then
        RunSQL = Empty
    Else
        RunSQL = rs.GetRows()
    End If
    rs.Close
End Function

Private Function CheckDate() As Boolean
    Dim c As Range
    Set c = Rg("PDJ_DATE_IN")
    CheckDate = True
    If c.HasFormula Then Exit Function
    If IsDate(c.Value) Then
        If CLng(CDate(c.Value)) <> CLng(Date) Then
            Select Case MsgBox("Le point est réglé sur le " & Format$(c.Value, "dd/mm/yyyy") & "." & vbCrLf & vbCrLf & _
                               "Oui = repasser sur aujourd'hui" & vbCrLf & "Non = garder cette date", _
                               vbYesNoCancel + vbQuestion, "Point du jour")
                Case vbYes: c.Formula = "=TODAY()"
                Case vbCancel: CheckDate = False
            End Select
        End If
    Else
        c.Formula = "=TODAY()"
    End If
End Function

Private Function EnsureFresh() As Boolean
    Application.Calculate
    If Not IsTrue(Rg("LOGYS_OK").Value) Then
        Select Case MsgBox("Les lignes LOGYS ne sont pas celles du " & Format$(Rg("PDJ_DATE").Value, "dd/mm/yyyy") & "." & vbCrLf & vbCrLf & _
                           "Oui = actualiser LOGYS maintenant" & vbCrLf & "Non = continuer quand même", _
                           vbYesNoCancel + vbQuestion, "Point du jour")
            Case vbYes
                ACTUALISER
                Application.Calculate
                If Not IsTrue(Rg("LOGYS_OK").Value) Then Exit Function
            Case vbCancel
                Exit Function
        End Select
    End If
    EnsureFresh = True
End Function

Private Function Rg(ByVal nom As String) As Range
    Set Rg = ThisWorkbook.Names(nom).RefersToRange
End Function

Private Function Txt(ByVal v As Variant) As String
    If IsError(v) Then
        Txt = "—"
    ElseIf IsNull(v) Or IsEmpty(v) Then
        Txt = ""
    Else
        Txt = CStr(v)
    End If
End Function

Private Function IsTrue(ByVal v As Variant) As Boolean
    If IsError(v) Then Exit Function
    Select Case VarType(v)
        Case vbBoolean
            IsTrue = v
        Case vbString
            IsTrue = (UCase$(v) = "VRAI" Or UCase$(v) = "TRUE")
        Case vbEmpty, vbNull
            IsTrue = False
        Case Else
            If IsNumeric(v) Then IsTrue = (CDbl(v) <> 0)
    End Select
End Function

Private Function Nz(ByVal x As Variant) As Variant
    If IsNull(x) Then
        Nz = ""
    Else
        Nz = x
    End If
End Function

Private Function NzD(ByVal x As Variant) As Double
    If IsNull(x) Or IsEmpty(x) Then
        NzD = 0
    ElseIf IsNumeric(x) Then
        NzD = CDbl(x)
    End If
End Function

Private Function EnteteDest(ByVal dest As String) As String
    Dim parts() As String, i As Long, p As String, r As String
    parts = Split(Replace(dest, ",", ";"), ";")
    For i = LBound(parts) To UBound(parts)
        p = Trim$(parts(i))
        If Len(p) > 0 Then
            If InStr(p, "@") = 0 Then p = """" & Replace(p, """", "") & """"
            If Len(r) > 0 Then r = r & ", "
            r = r & p
        End If
    Next i
    EnteteDest = r
End Function

Private Function MotsEncodes(ByVal t As String) As String
    Dim i As Long, r As String, bout As String
    For i = 1 To Len(t) Step 12
        bout = Mid$(t, i, 12)
        If Len(r) > 0 Then r = r & vbCrLf & " "
        r = r & "=?utf-8?B?" & Replace(Base64Lignes(Utf8Octets(bout)), vbCrLf, "") & "?="
    Next i
    MotsEncodes = r
End Function

Private Function Utf8Octets(ByVal t As String) As Variant
    Dim st As Object
    Set st = CreateObject("ADODB.Stream")
    st.Type = 2
    st.Charset = "utf-8"
    st.Open
    st.WriteText t
    st.Position = 0
    st.Type = 1
    st.Position = 3             ' marque UTF-8 laissée de côté
    Utf8Octets = st.Read
    st.Close
End Function

Private Function Base64Lignes(ByVal octets As Variant) As String
    Dim dom As Object, node As Object, t As String, n As Long, i As Long, lignes() As String
    Set dom = CreateObject("MSXML2.DOMDocument")
    Set node = dom.createElement("b64")
    node.DataType = "bin.base64"
    node.nodeTypedValue = octets
    t = Replace(Replace(node.Text, vbCr, ""), vbLf, "")
    If Len(t) = 0 Then Exit Function
    n = (Len(t) - 1) \ 76
    ReDim lignes(0 To n)
    For i = 0 To n
        lignes(i) = Mid$(t, i * 76 + 1, 76)
    Next i
    Base64Lignes = Join(lignes, vbCrLf)
End Function

Private Sub EcrireAscii(ByVal chemin As String, ByVal texte As String)
    Dim f As Integer, b() As Byte
    SupprimerFichier chemin
    b = StrConv(texte, vbFromUnicode)
    f = FreeFile
    Open chemin For Binary Access Write As #f
    Put #f, 1, b
    Close #f
End Sub

Private Function OuvrirFichier(ByVal chemin As String) As Boolean
    On Error Resume Next
    CreateObject("Shell.Application").ShellExecute chemin, "", "", "open", 1
    If Err.Number = 0 Then OuvrirFichier = True: Exit Function
    Err.Clear
    ThisWorkbook.FollowHyperlink Address:=chemin
    OuvrirFichier = (Err.Number = 0)
End Function

Private Function InsertAfterBody(ByVal body As String, ByVal html As String) As String
    Dim p As Long, q As Long
    p = InStr(1, body, "<body", vbTextCompare)
    If p > 0 Then q = InStr(p, body, ">")
    If p > 0 And q > 0 Then
        InsertAfterBody = Left$(body, q) & html & Mid$(body, q + 1)
    Else
        InsertAfterBody = html & body
    End If
End Function

Private Function HtmlEsc(ByVal s As String) As String
    s = Replace(s, "&", "&amp;")
    s = Replace(s, "<", "&lt;")
    s = Replace(s, ">", "&gt;")
    s = Replace(s, """", "&quot;")
    HtmlEsc = s
End Function

Private Function DossierBureau() As String
    On Error Resume Next
    DossierBureau = CreateObject("WScript.Shell").SpecialFolders("Desktop")
    If Len(DossierBureau) = 0 Then DossierBureau = Environ$("USERPROFILE") & "\Desktop"
End Function

Private Sub EcrireUtf8(ByVal chemin As String, ByVal texte As String)
    Dim st As Object
    Set st = CreateObject("ADODB.Stream")
    st.Type = 2
    st.Charset = "utf-8"
    st.Open
    st.WriteText texte
    st.SaveToFile chemin, 2
    st.Close
End Sub

Private Function LireUtf8(ByVal chemin As String) As String
    Dim st As Object
    On Error GoTo Fin
    If Len(Dir$(chemin)) = 0 Then Exit Function
    Set st = CreateObject("ADODB.Stream")
    st.Type = 2
    st.Charset = "utf-8"
    st.Open
    st.LoadFromFile chemin
    LireUtf8 = st.ReadText
    st.Close
Fin:
End Function

Private Function TailleFichier(ByVal chemin As String) As Long
    On Error Resume Next
    If Len(Dir$(chemin)) > 0 Then TailleFichier = FileLen(chemin)
End Function

Private Sub SupprimerFichier(ByVal chemin As String)
    On Error Resume Next
    If Len(Dir$(chemin)) > 0 Then Kill chemin
End Sub

Private Function LireRegistre(ByVal cle As String) As String
    On Error Resume Next
    LireRegistre = CStr(CreateObject("WScript.Shell").RegRead(cle))
End Function

Public Sub PDJ_Surbrillance(ByVal Sh As Object, ByVal Target As Range)
    ' la mise en forme des onglets mois suit CELLULE("ligne") : un recalcul suffit à déplacer la surbrillance
    On Error Resume Next
    If Sh.Name = WS_PDJ Then Exit Sub
    If Target.CountLarge > 20000 Then
        ActiveCell.Calculate
    Else
        Target.Calculate
    End If
End Sub

Private Function PoserSurbrillance() As Boolean
    Dim cm As Object, code As String
    On Error GoTo Fin
    Set cm = ThisWorkbook.VBProject.VBComponents(ThisWorkbook.CodeName).CodeModule
    If cm.CountOfLines > 0 Then code = cm.Lines(1, cm.CountOfLines)
    If InStr(1, code, "PDJ_Surbrillance", vbTextCompare) > 0 Then PoserSurbrillance = True: Exit Function
    If InStr(1, code, "Workbook_SheetSelectionChange", vbTextCompare) > 0 Then Exit Function
    cm.AddFromString "Private Sub Workbook_SheetSelectionChange(ByVal Sh As Object, ByVal Target As Range)" & vbCrLf & _
                     "    PDJ_Surbrillance Sh, Target" & vbCrLf & "End Sub"
    PoserSurbrillance = True
Fin:
End Function

Private Function UrlFichier(ByVal chemin As String) As String
    UrlFichier = "file:///" & Replace(Replace(chemin, "\", "/"), " ", "%20")
End Function
