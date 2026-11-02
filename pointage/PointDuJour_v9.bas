Attribute VB_Name = "PointDuJour"
'==============================================================================
'  POINT DU JOUR - PRÉPARATION - CLR Champigneulles   (version 9)
'
'  Nouveautés v9
'    - Mail en HTML pur (texte, aucune image, aucune animation) : lisible sur
'      téléphone, dans Outlook classique, le nouvel Outlook et le webmail.
'    - Compte rendu : synthèse (ETP total, heures supp, lignes totales,
'      étiquettes), lignes bloquées, SMC (lignes, passées, bloquées), détail
'      par service (+ dévidages câble), projection de demain (ETP prévus au
'      planning, lignes prévues saisies, écart en ETP), infirmerie.
'    - Boutons REMPLIR 7,4 h : PP / HG / CÂBLE / TOUT (cases vides seulement).
'    - Bouton NOUVEAU JOUR : vide les saisies de la veille.
'    - Plus besoin d'Edge ni des images : le module est 3 fois plus court.
'
'  Boutons de l'accueil
'    REMPLIR 7,4 h  : pointage du jour à 7,4 h pour un service (ou tous)
'    ACTUALISER     : lit LOGYS (lignes de tournée, lignes de commande, cross dock)
'    APERÇU         : le mail tel qu'il partira, dans le navigateur
'    PRÉPARER       : mail Outlook prêt à envoyer (sinon brouillon .eml sur le Bureau)
'    NOUVEAU JOUR   : efface les cases jaunes du jour (pas l'ouverture ni les destinataires)
'    COPIER LE CADRE: image de l'accueil dans le presse-papiers (secours)
'    DIAGNOSTIC     : état Outlook / LOGYS
'
'  Secours (si les boutons ont disparu) : Alt+F8 > INSTALLER > Exécuter.
'  Mise à jour d'un autre classeur : Alt+F11 > supprimer le module PointDuJour
'  > Fichier > Importer PointDuJour_v9.bas > Ctrl+S > Alt+F8 > INSTALLER.
'
'  Colonnes LOGYS contrôlées dans le dictionnaire le 16/10/2026 :
'    REXEL.LIG_TOUR et HIST.F_VISLTOUR : STYP_TOUR, TYP_TOUR, NUM_ORDRE,
'      NUM_LIG_ORDRE, REEL, DAT_MAJ
'    REXEL.CONTENANT et HIST.CONTENANT : NUM_CONT, CL_XDOCK, DAT_ENT,
'      NB_LIG_TERM, NB_LIG_PREV, NUM_ORDRE_ENT, NUM_LIG_ORDRE_ENT
'==============================================================================
Option Explicit

#If VBA7 Then
    Private Declare PtrSafe Sub Sleep Lib "kernel32" (ByVal dwMilliseconds As Long)
#Else
    Private Declare Sub Sleep Lib "kernel32" (ByVal dwMilliseconds As Long)
#End If

Private Const WS_PDJ As String = "Point Du Jour"
Private Const WS_LL As String = "LIGNES_LOGYS"
Private Const LL_ROW0 As Long = 7       ' tableau par jour : lignes 7 (jour du point) à 11 (S-4)
Private Const LL_DET0 As Long = 15      ' détail par code : à partir de la ligne 15
Private Const LL_DETMAX As Long = 50
Private Const ONGLETS_MOIS As String = "|JAN|FEV|MAR|AVR|MAI|JUN|JUL|AOU|SEP|OCT|NOV|DEC|"

'==============================================================================
'  MAIL : compte rendu en HTML dans le corps du mail (aucune image)
'==============================================================================
Public Sub MAIL()
    Dim html As String, res As String, eml As String, manque As String, msg As String

    If Not EnsureFresh() Then Exit Sub
    manque = ControlesManquants()
    If Len(manque) > 0 Then
        If MsgBox("Points à vérifier avant l'envoi :" & vbCrLf & vbCrLf & manque & vbCrLf & _
                  "Préparer le mail quand même ?", vbYesNo + vbQuestion + vbDefaultButton2, "Point du jour") = vbNo Then Exit Sub
    End If
    On Error GoTo Echec
    Application.Cursor = xlWait
    html = CorpsMail()
    Application.Cursor = xlDefault

    ' 1) Outlook classique : mail prêt, signature conservée
    res = MailOutlookClassique(html)
    If res = "OK" Then Exit Sub

    ' 2) sinon : brouillon .eml posé sur le Bureau puis ouvert
    eml = DossierBureau() & "\PointDuJour_" & Format$(Rg("PDJ_DATE").Value, "dd-mm") & ".eml"
    If EcrireEml(eml, html) Then
        If OuvrirFichier(eml) Then
            MsgBox "Outlook classique n'a pas pu être piloté (" & res & ")." & vbCrLf & vbCrLf & _
                   "Le mail s'ouvre depuis le fichier posé sur le Bureau :" & vbCrLf & _
                   "- Outlook classique : brouillon, vérifier le destinataire puis Envoyer ;" & vbCrLf & _
                   "- nouvel Outlook : il s'ouvre en lecture, cliquer Transférer, mettre le destinataire" & vbCrLf & _
                   "  (" & Txt(Rg("PAR_DEST").Value) & ") et l'objet, puis Envoyer.", vbInformation, "Point du jour"
        Else
            MsgBox "Le mail est prêt sur le Bureau :" & vbCrLf & eml & vbCrLf & vbCrLf & _
                   "Double-cliquer ce fichier : il s'ouvre dans Outlook.", vbInformation, "Point du jour"
        End If
        Exit Sub
    End If

    ' 3) dernier recours : aperçu dans le navigateur, à copier dans un mail
    APERCU
    MsgBox "Outlook indisponible (" & res & ")." & vbCrLf & vbCrLf & _
           "Dans l'aperçu ouvert : Ctrl+A, Ctrl+C, puis Ctrl+V dans un nouveau mail." & vbCrLf & _
           "Objet : " & MapValue("SUBJECT"), vbInformation, "Point du jour"
    Exit Sub

Echec:
    msg = Err.Description
    Application.Cursor = xlDefault
    Application.StatusBar = False
    If MsgBox("Mail impossible : " & msg & vbCrLf & vbCrLf & _
              "Copier le cadre de l'accueil à la place ?", vbYesNo + vbExclamation, "Point du jour") = vbYes Then
        COPIER_CADRE
    End If
End Sub

'==============================================================================
'  APERÇU : le mail tel qu'il partira, dans le navigateur (rien n'est envoyé)
'==============================================================================
Public Sub APERCU()
    Dim dossier As String, page As String
    On Error GoTo Echec
    dossier = Environ$("TEMP") & "\PointDuJour"
    If Len(Dir$(dossier, vbDirectory)) = 0 Then MkDir dossier
    page = dossier & "\apercu_mail.html"
    EcrireUtf8 page, PageComplete(CorpsMail(), True)
    If Not OuvrirFichier(page) Then MsgBox "Aperçu prêt : " & page, vbInformation, "Point du jour"
    Exit Sub
Echec:
    MsgBox "Aperçu impossible : " & Err.Description, vbExclamation, "Point du jour"
End Sub

Private Function PageComplete(ByVal corps As String, ByVal avecEntete As Boolean) As String
    Dim s As String
    s = "<!DOCTYPE html><html><head><meta charset=""utf-8"">" & _
        "<meta name=""viewport"" content=""width=device-width, initial-scale=1"">" & _
        "<title>" & HtmlEscU(MapValue("SUBJECT")) & "</title></head>" & _
        "<body style=""margin:0;padding:0;background-color:#EEF2F7;"">"
    If avecEntete Then
        s = s & "<div style=""max-width:600px;margin:0 auto;padding:12px 12px 0 12px;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#64748B;"">" & _
                "<b style=""color:#0F172A;"">Aperçu du mail</b> &#183; Objet : " & HtmlEscU(MapValue("SUBJECT")) & _
                "<br>À : " & HtmlEscU(Txt(Rg("PAR_DEST").Value)) & "</div>"
    End If
    PageComplete = s & corps & "</body></html>"
End Function

' Corps du mail : modèle HTML (fonctions MailTpl en bas du module) + table MAIL_MAP (onglet CALC)
Private Function CorpsMail() As String
    Dim h As String, mp As Range, r As Long, k As String, t As String
    Application.Calculate
    h = MailTemplate()
    Set mp = Rg("MAIL_MAP")
    For r = 1 To mp.Rows.Count               ' 1) blocs affichés ou non
        k = Trim$(Txt(mp.Cells(r, 1).Value))
        t = LCase$(Trim$(Txt(mp.Cells(r, 3).Value)))
        If Len(k) > 0 And t = "if" Then h = Bloc(h, k, IsTrue(mp.Cells(r, 2).Value))
    Next r
    For r = 1 To mp.Rows.Count               ' 2) valeurs
        k = Trim$(Txt(mp.Cells(r, 1).Value))
        t = LCase$(Trim$(Txt(mp.Cells(r, 3).Value)))
        If Len(k) > 0 And t <> "if" Then h = Replace(h, "{{" & k & "}}", HtmlEscU(Txt(mp.Cells(r, 2).Value)))
    Next r
    CorpsMail = h
End Function

' Garde (ou retire) le texte entre <!--IF:CLE--> et <!--END:CLE-->
Private Function Bloc(ByVal h As String, ByVal k As String, ByVal garder As Boolean) As String
    Dim a As String, b As String, p As Long, q As Long
    a = "<!--IF:" & k & "-->"
    b = "<!--END:" & k & "-->"
    Do
        p = InStr(1, h, a, vbBinaryCompare)
        If p = 0 Then Exit Do
        q = InStr(p, h, b, vbBinaryCompare)
        If q = 0 Then Exit Do
        If garder Then
            h = Left$(h, p - 1) & Mid$(h, p + Len(a), q - p - Len(a)) & Mid$(h, q + Len(b))
        Else
            h = Left$(h, p - 1) & Mid$(h, q + Len(b))
        End If
    Loop
    Bloc = h
End Function

Private Function MapValue(ByVal key As String) As String
    Dim mp As Range, r As Long
    Set mp = Rg("MAIL_MAP")
    For r = 1 To mp.Rows.Count
        If Txt(mp.Cells(r, 1).Value) = key Then
            MapValue = Txt(mp.Cells(r, 2).Value)
            Exit Function
        End If
    Next r
End Function

' Texte sûr pour le HTML : caractères spéciaux en entités (accents, symboles)
Private Function HtmlEscU(ByVal s As String) As String
    Dim i As Long, c As Long, r As String, ch As String
    s = HtmlEsc(s)
    For i = 1 To Len(s)
        ch = Mid$(s, i, 1)
        c = AscW(ch)
        If c < 0 Then c = c + 65536
        If c > 126 Then
            r = r & "&#" & c & ";"
        Else
            r = r & ch
        End If
    Next i
    HtmlEscU = r
End Function

' Liste des contrôles du soir non remplis (onglet CALC, table CHK_TABLE)
Private Function ControlesManquants() As String
    Dim t As Range, r As Long, s As String
    Application.Calculate
    Set t = Rg("CHK_TABLE")
    For r = 1 To t.Rows.Count
        If Not IsTrue(t.Cells(r, 3).Value) Then s = s & "   - " & Txt(t.Cells(r, 1).Value) & vbCrLf
    Next r
    ControlesManquants = s
End Function

' Mail dans l'Outlook classique : récupéré s'il tourne, lancé sinon.
' Renvoie "OK" ou la raison de l'échec (nouvel Outlook, Outlook absent...).
Private Function MailOutlookClassique(ByVal html As String) As String
    Dim ol As Object, m As Object, horsLigne As Boolean, t0 As Single, raison As String

    On Error Resume Next
    Set ol = GetObject(, "Outlook.Application")
    If ol Is Nothing Then
        Err.Clear
        Application.StatusBar = "Point du jour : ouverture d'Outlook..."
        Set ol = CreateObject("Outlook.Application")
        If ol Is Nothing Then raison = "Outlook classique absent ou bloqué : " & Err.Description
    End If
    Err.Clear
    If Not ol Is Nothing Then
        If ol.Explorers.Count = 0 Then
            ol.Session.Logon
            ol.Session.GetDefaultFolder(6).Display          ' 6 = boîte de réception
            t0 = Timer
            Do While ol.Explorers.Count = 0 And Timer - t0 < 20 And Timer >= t0
                DoEvents
                Sleep 200
            Loop
        End If
        If Err.Number <> 0 Then raison = "Outlook ne répond pas : " & Err.Description
        Err.Clear
        horsLigne = ol.Session.Offline
        Err.Clear
    End If
    Application.StatusBar = False
    On Error GoTo 0
    If ol Is Nothing Then
        MailOutlookClassique = raison
        Exit Function
    End If
    If horsLigne Then
        MsgBox "Outlook est en mode Hors connexion : le mail restera dans la boîte d'envoi." & vbCrLf & _
               "Onglet Envoi/réception > décocher Travailler hors connexion.", vbExclamation, "Point du jour"
    End If

    On Error GoTo Rate
    Set m = ol.CreateItem(0)
    m.BodyFormat = 2                                    ' HTML
    m.To = Txt(Rg("PAR_DEST").Value)
    m.Subject = MapValue("SUBJECT")
    m.Display                                           ' charge la signature
    m.HTMLBody = InsertAfterBody(m.HTMLBody, html)
    MailOutlookClassique = "OK"
    Exit Function
Rate:
    MailOutlookClassique = "Outlook : " & Err.Description
    Resume Nettoie
Nettoie:
    On Error Resume Next
    If Not m Is Nothing Then m.Close 1
End Function

' Brouillon de mail .eml (X-Unsent : Outlook l'ouvre comme un nouveau mail à envoyer)
Private Function EcrireEml(ByVal chemin As String, ByVal corps As String) As Boolean
    Dim s As String, dest As String
    On Error GoTo Fin
    dest = Trim$(Txt(Rg("PAR_DEST").Value))
    s = "X-Unsent: 1" & vbCrLf
    If Len(dest) > 0 Then s = s & "To: " & EnteteDest(dest) & vbCrLf
    s = s & "Subject: " & MotsEncodes(MapValue("SUBJECT")) & vbCrLf
    s = s & "MIME-Version: 1.0" & vbCrLf
    s = s & "Content-Type: text/html; charset=""utf-8""" & vbCrLf
    s = s & "Content-Transfer-Encoding: base64" & vbCrLf & vbCrLf
    s = s & Base64Lignes(Utf8Octets(PageComplete(corps, False))) & vbCrLf
    EcrireAscii chemin, s
    EcrireEml = (TailleFichier(chemin) > 500)
Fin:
End Function

'==============================================================================
'  COPIER LE CADRE (secours) : image de l'accueil dans le presse-papiers
'==============================================================================
Public Sub COPIER_CADRE()
    On Error GoTo Echec
    Application.Calculate
    ThisWorkbook.Worksheets(WS_PDJ).Activate
    Rg("PDJ_CAPTURE").CopyPicture Appearance:=xlScreen, Format:=xlBitmap
    MsgBox "Cadre copié : le coller dans le mail (Ctrl+V)." & vbCrLf & "Objet : " & MapValue("SUBJECT"), vbInformation, "Point du jour"
    Exit Sub
Echec:
    MsgBox "Copie impossible : " & Err.Description, vbExclamation, "Point du jour"
End Sub

'==============================================================================
'  NOUVEAU JOUR : vide les cases jaunes de la journée (accueil)
'==============================================================================
Public Sub NOUVEAU_JOUR()
    Dim c As Range
    If MsgBox("Vider les saisies du jour de l'accueil ?" & vbCrLf & vbCrLf & _
              "Fins de poste, convoyeur, dévidages, lignes bloquées, SMC, étiquettes," & vbCrLf & _
              "lignes prévues et infirmerie seront effacées." & vbCrLf & _
              "Le pointage des onglets mois, l'ouverture et les destinataires ne bougent pas.", _
              vbOKCancel + vbQuestion + vbDefaultButton2, "Point du jour") <> vbOK Then Exit Sub
    On Error GoTo Echec
    Rg("PDJ_SAISIES").ClearContents
    Set c = Rg("PDJ_DATE_IN")
    c.Formula = "=TODAY()"
    Application.Calculate
    ThisWorkbook.Worksheets(WS_PDJ).Activate
    ThisWorkbook.Worksheets(WS_PDJ).Range("D30").Select
    Exit Sub
Echec:
    MsgBox "Effacement impossible : " & Err.Description, vbExclamation, "Point du jour"
End Sub

'==============================================================================
'  REMPLIR 7,4 h : cases vides du jour, opérateurs nommés, absences conservées.
'  Jour visé : colonne de la cellule active si on est dans un onglet mois,
'  sinon la date du point (accueil).
'==============================================================================
Public Sub REMPLIR_PP()
    RemplirService "PP"
End Sub

Public Sub REMPLIR_HG()
    RemplirService "HG"
End Sub

Public Sub REMPLIR_CABLE()
    RemplirService "CA"
End Sub

Public Sub REMPLIR_TOUT()
    RemplirService "TOUT"
End Sub

Private Sub RemplirService(ByVal svc As String)
    Dim ws As Worksheet, col As Long, d As Date, h As Double, svcs As Variant, s As Variant
    Dim r As Long, r1 As Long, r2 As Long, n As Long, lib As String, msg As String

    If Not JourCible(ws, col, d) Then Exit Sub
    h = CDbl(Rg("PAR_ETP_H").Value)
    If svc = "TOUT" Then
        svcs = Array("PP", "HG", "CA")
    Else
        svcs = Array(svc)
    End If
    For Each s In svcs
        Bornes CStr(s), r1, r2
        For r = r1 To r2
            If ACompleter(ws, r, col) Then n = n + 1
        Next r
        If Len(lib) > 0 Then lib = lib & ", "
        lib = lib & NomService(CStr(s))
    Next s
    If n = 0 Then
        MsgBox "Rien à remplir pour " & lib & " le " & Format$(d, "dddd dd/mm") & " :" & vbCrLf & _
               "toutes les cases des opérateurs sont déjà saisies (heures ou absence).", vbInformation, "Point du jour"
        Exit Sub
    End If
    msg = "Remplir à " & Format$(h, "0.0#") & " h les " & n & " case" & IIf(n > 1, "s", "") & " vide" & IIf(n > 1, "s", "") & vbCrLf & _
          "de " & lib & " le " & Format$(d, "dddd dd/mm/yyyy") & " (onglet " & ws.Name & ") ?" & vbCrLf & vbCrLf & _
          "Les heures et absences déjà saisies sont conservées." & vbCrLf & _
          "Ensuite : corriger les absences et les horaires différents."
    If Weekday(d, vbMonday) > 5 Then msg = msg & vbCrLf & vbCrLf & "Attention : ce jour est un " & Format$(d, "dddd") & "."
    If MsgBox(msg, vbOKCancel + vbQuestion, "Point du jour") <> vbOK Then Exit Sub

    Application.ScreenUpdating = False
    For Each s In svcs
        Bornes CStr(s), r1, r2
        For r = r1 To r2
            If ACompleter(ws, r, col) Then ws.Cells(r, col).Value = h
        Next r
    Next s
    Application.ScreenUpdating = True
    Application.Calculate
    Bornes CStr(svcs(0)), r1, r2
    Application.Goto ws.Cells(r1, col)
    Application.StatusBar = "Point du jour : " & n & " case(s) remplie(s) à " & Format$(h, "0.0#") & " h (" & lib & ")."
End Sub

Private Function ACompleter(ByVal ws As Worksheet, ByVal r As Long, ByVal col As Long) As Boolean
    If Len(Trim$(Txt(ws.Cells(r, 1).Value) & Txt(ws.Cells(r, 2).Value))) = 0 Then Exit Function
    ACompleter = IsEmpty(ws.Cells(r, col).Value)
End Function

' Lignes des opérateurs de chaque service dans les onglets mois
Private Sub Bornes(ByVal svc As String, ByRef r1 As Long, ByRef r2 As Long)
    Select Case svc
        Case "PP": r1 = 8: r2 = 37
        Case "HG": r1 = 44: r2 = 63
        Case Else: r1 = 70: r2 = 83
    End Select
End Sub

Private Function NomService(ByVal svc As String) As String
    Select Case svc
        Case "PP": NomService = "Pick & Pack"
        Case "HG": NomService = "Hors gabarit"
        Case Else: NomService = "Câble"
    End Select
End Function

Private Function JourCible(ByRef ws As Worksheet, ByRef col As Long, ByRef d As Date) As Boolean
    Dim nom As String, v As Variant
    If TypeName(ActiveSheet) = "Worksheet" Then
        If InStr(1, ONGLETS_MOIS, "|" & UCase$(ActiveSheet.Name) & "|") > 0 Then
            If ActiveCell.Column >= 5 And ActiveCell.Column <= 35 Then
                v = ActiveSheet.Cells(6, ActiveCell.Column).Value
                If IsDate(v) Then
                    Set ws = ActiveSheet
                    col = ActiveCell.Column
                    d = CDate(v)
                    JourCible = True
                    Exit Function
                End If
            End If
        End If
    End If
    Application.Calculate
    d = CDate(Rg("PDJ_DATE").Value)
    nom = Mid$(ONGLETS_MOIS, (Month(d) - 1) * 4 + 2, 3)
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(nom)
    On Error GoTo 0
    If ws Is Nothing Then
        MsgBox "L'onglet " & nom & " n'existe pas dans ce classeur : impossible de pointer le " & Format$(d, "dd/mm/yyyy") & ".", vbExclamation, "Point du jour"
        Exit Function
    End If
    v = Application.Match(CLng(d), ws.Range("A6:AI6"), 0)
    If IsError(v) Then
        MsgBox "Le " & Format$(d, "dd/mm/yyyy") & " est introuvable en ligne 6 de l'onglet " & nom & ".", vbExclamation, "Point du jour"
        Exit Function
    End If
    col = CLng(v)
    JourCible = True
End Function

'==============================================================================
'  INSTALLER : (re)pose les boutons (accueil et onglets mois)
'==============================================================================
Public Sub INSTALLER()
    Dim spec As Variant, p() As String, ws As Worksheet, surb As Boolean, txtSurb As String
    surb = PoserSurbrillance()
    For Each spec In SpecBoutons()
        p = Split(CStr(spec), "|")
        Set ws = Nothing
        On Error Resume Next
        Set ws = ThisWorkbook.Worksheets(p(0))
        On Error GoTo 0
        If Not ws Is Nothing Then Bouton ws, p(1), p(2), p(3), ws.Range(p(4)), RGB(CLng(p(5)), CLng(p(6)), CLng(p(7)))
    Next spec
    On Error Resume Next
    Application.Calculate
    ThisWorkbook.Worksheets(WS_PDJ).Activate
    ActiveWindow.DisplayHeadings = False
    ActiveWindow.DisplayGridlines = False
    On Error GoTo 0
    If surb Then
        txtSurb = "Surbrillance de la ligne de pointage : active dans les onglets mois."
    Else
        txtSurb = "Surbrillance de la ligne : Alt+F11 > double-clic ThisWorkbook > coller :" & vbCrLf & _
                  "Private Sub Workbook_SheetSelectionChange(ByVal Sh As Object, ByVal Target As Range)" & vbCrLf & _
                  "    PDJ_Surbrillance Sh, Target" & vbCrLf & "End Sub"
    End If
    MsgBox "Boutons installés." & vbCrLf & vbCrLf & _
           "Chaque soir : REMPLIR 7,4 h > cases jaunes > 1 ACTUALISER LOGYS > 2 PRÉPARER LE MAIL." & vbCrLf & vbCrLf & _
           txtSurb, vbInformation, "Point du jour"
End Sub

Private Sub Bouton(ByVal ws As Worksheet, ByVal nom As String, ByVal texte As String, ByVal macro As String, _
                   ByVal zone As Range, ByVal couleur As Long)
    Dim s As Shape, m As Double
    On Error Resume Next
    ws.Shapes(nom).Delete
    On Error GoTo 0
    m = 3
    Set s = ws.Shapes.AddShape(msoShapeRoundedRectangle, zone.Left + m, zone.Top + m, zone.Width - 2 * m, zone.Height - 2 * m)
    s.Name = nom
    s.Fill.ForeColor.RGB = couleur
    s.Line.Visible = msoFalse
    With s.TextFrame2
        .VerticalAnchor = msoAnchorMiddle
        .MarginLeft = 2
        .MarginRight = 2
        With .TextRange
            .Text = texte
            .Font.Bold = msoTrue
            .Font.Size = 9
            .Font.Name = "Segoe UI"
            .Font.Fill.ForeColor.RGB = RGB(255, 255, 255)
            .ParagraphFormat.Alignment = msoAlignCenter
        End With
    End With
    s.OnAction = macro
    s.Placement = xlMove
End Sub

'==============================================================================
'  DIAGNOSTIC : état Outlook et LOGYS (rapport ouvert dans le Bloc-notes)
'==============================================================================
Public Sub DIAGNOSTIC()
    Dim s As String, ol As Object, v As String, f As String, dossier As String

    dossier = Environ$("TEMP") & "\PointDuJour"
    On Error Resume Next
    If Len(Dir$(dossier, vbDirectory)) = 0 Then MkDir dossier
    s = "POINT DU JOUR v9 - DIAGNOSTIC du " & Format$(Now, "dd/mm/yyyy hh:nn") & vbCrLf & String$(60, "-") & vbCrLf
#If Win64 Then
    s = s & "Excel " & Application.Version & " (build " & Application.Build & ", 64 bits)" & vbCrLf
#Else
    s = s & "Excel " & Application.Version & " (build " & Application.Build & ", 32 bits)" & vbCrLf
#End If
    s = s & vbCrLf & "[OUTLOOK]" & vbCrLf
    v = LireRegistre("HKCU\Software\Microsoft\Office\16.0\Outlook\Preferences\UseNewOutlook")
    s = s & "Nouvel Outlook activé : " & IIf(v = "1", "OUI (la macro passe alors par un brouillon .eml)", "non") & vbCrLf
    v = LireRegistre("HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\OUTLOOK.EXE\")
    s = s & "Outlook classique installé : " & IIf(Len(v) > 0, v, "introuvable") & vbCrLf
    Err.Clear
    Set ol = GetObject(, "Outlook.Application")
    If ol Is Nothing Then
        s = s & "Outlook classique : pas lancé (la macro MAIL le lancera)" & vbCrLf
    Else
        s = s & "Outlook classique : lancé, version " & ol.Version & IIf(ol.Session.Offline, ", HORS CONNEXION", "") & vbCrLf
    End If
    Err.Clear
    s = s & vbCrLf & "[LOGYS]" & vbCrLf & Txt(Rg("LL_STATUT").Value) & vbCrLf
    s = s & vbCrLf & "[CONTRÔLES DU SOIR]" & vbCrLf
    v = ControlesManquants()
    If Len(v) = 0 Then v = "   tout est saisi" & vbCrLf
    s = s & v
    f = dossier & "\diagnostic_complet.txt"
    EcrireUtf8 f, s
    Shell "notepad.exe """ & f & """", vbNormalFocus
    If Err.Number <> 0 Then MsgBox s, vbInformation, "Point du jour - diagnostic"
End Sub

'==============================================================================
'  Fonctions reprises de la v8 (LOGYS, outils)
'==============================================================================

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
    ThisWorkbook.Worksheets(WS_PDJ).Activate
    Application.StatusBar = "Point du jour : LOGYS actualisé (" & Txt(Rg("LL_STATUT").Value) & ")"
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

Private Function SpecBoutons() As Variant
    ' onglet|nom|texte|macro|zone|R|G|B
    Dim a(0 To 18) As String
    a(0) = "Point Du Jour|btn_pp|PP|REMPLIR_PP|D9|47|111|237"
    a(1) = "Point Du Jour|btn_hg|HG|REMPLIR_HG|E9|124|58|237"
    a(2) = "Point Du Jour|btn_ca|CÂBLE|REMPLIR_CABLE|F9|13|148|136"
    a(3) = "Point Du Jour|btn_tout|TOUT|REMPLIR_TOUT|G9|19|41|75"
    a(4) = "Point Du Jour|btn_actualiser|1 · ACTUALISER LOGYS|ACTUALISER|H9:I9|29|78|216"
    a(5) = "Point Du Jour|btn_apercu|APERÇU DU MAIL|APERCU|J9:K9|71|85|105"
    a(6) = "Point Du Jour|btn_mail|2 · PRÉPARER LE MAIL|MAIL|L9:M9|21|128|61"
    a(7) = "Point Du Jour|btn_nouveau|NOUVEAU JOUR · vider les saisies|NOUVEAU_JOUR|O42:R42|180|83|9"
    a(8) = "Point Du Jour|btn_cadre|COPIER LE CADRE|COPIER_CADRE|O44:P44|100|116|139"
    a(9) = "Point Du Jour|btn_diag|DIAGNOSTIC|DIAGNOSTIC|Q44:R44|100|116|139"
    a(10) = "OCT|btn_pp|REMPLIR 7,4 h|REMPLIR_PP|B7:D7|30|64|175"
    a(11) = "OCT|btn_hg|REMPLIR 7,4 h|REMPLIR_HG|B43:D43|91|33|182"
    a(12) = "OCT|btn_ca|REMPLIR 7,4 h|REMPLIR_CABLE|B69:D69|15|118|110"
    a(13) = "NOV|btn_pp|REMPLIR 7,4 h|REMPLIR_PP|B7:D7|30|64|175"
    a(14) = "NOV|btn_hg|REMPLIR 7,4 h|REMPLIR_HG|B43:D43|91|33|182"
    a(15) = "NOV|btn_ca|REMPLIR 7,4 h|REMPLIR_CABLE|B69:D69|15|118|110"
    a(16) = "DEC|btn_pp|REMPLIR 7,4 h|REMPLIR_PP|B7:D7|30|64|175"
    a(17) = "DEC|btn_hg|REMPLIR 7,4 h|REMPLIR_HG|B43:D43|91|33|182"
    a(18) = "DEC|btn_ca|REMPLIR 7,4 h|REMPLIR_CABLE|B69:D69|15|118|110"
    SpecBoutons = a
End Function

'==============================================================================
'  Modèle HTML du mail (généré, ne pas modifier à la main)
'==============================================================================
Private Function MailTemplate() As String
    MailTemplate = MailTpl1() & MailTpl2() & MailTpl3() & MailTpl4() & MailTpl5()
End Function

Private Function MailTpl1() As String
    Dim s As String
    s = s & "<div style=""display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;"">{{PREHEADER}}</div>" & vbLf
    s = s & "<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"" bgcolor=""#EEF2F7"" style=""background-color:#EEF2F7;"">" & vbLf
    s = s & "<tr><td align=""center"" style=""padding:16px 8px 24px 8px;"">" & vbLf
    s = s & "<table role=""presentation"" width=""600"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""width:100%;max-width:600px;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#0F172A;"">" & vbLf
    s = s & "<tr><td bgcolor=""#0B1F3A"" style=""background-color:#0B1F3A;padding:20px 22px 18px 22px;border-radius:14px 14px 0 0;"">" & vbLf
    s = s & "<div style=""font-size:11px;letter-spacing:2px;color:#8FB3FF;font-weight:bold;"">POINT DU JOUR &#183; PR&#201;PARATION</div>" & vbLf
    s = s & "<div style=""font-size:24px;line-height:30px;font-weight:bold;color:#FFFFFF;padding-top:4px;"">{{JOUR}}</div>" & vbLf
    s = s & "<div style=""font-size:13px;color:#C7D2E3;padding-top:2px;"">CLR Champigneulles &#183; {{RELEVE}}</div>" & vbLf
    s = s & "</td></tr>" & vbLf
    s = s & "<tr><td bgcolor=""#13294B"" style=""background-color:#13294B;padding:12px 22px;border-radius:0 0 14px 14px;"">" & vbLf
    s = s & "<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""><tr>" & vbLf
    s = s & "<td style=""font-size:12px;color:#C7D2E3;letter-spacing:1px;"">PROD. GLOBALE</td>" & vbLf
    s = s & "<td align=""right"" style=""white-space:nowrap;""><span style=""font-size:20px;font-weight:bold;color:#FFFFFF;"">{{GL_PROD}}</span><span style=""font-size:12px;color:#C7D2E3;""> lignes/ETP</span>&nbsp;&nbsp;<span style=""display:inline-block;background-color:{{GL_BG}};color:{{GL_COL}};font-size:12px;font-weight:bold;padding:3px 9px;border-radius:10px;"">{{GL_BADGE}}</span></td>" & vbLf
    s = s & "</tr></table>" & vbLf
    s = s & "</td></tr>" & vbLf
    s = s & "<!--IF:WARN-->" & vbLf
    s = s & "<tr><td style=""padding:10px 0 0 0;""><table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""><tr><td bgcolor=""#FEE2E2"" style=""background-color:#FEE2E2;border-left:4px solid #B91C1C;padding:10px 14px;font-size:13px;color:#B91C1C;font-weight:bold;border-radius:8px;"">{{WARN_TXT}}</td></tr></table></td></tr>" & vbLf
    s = s & "<!--END:WARN-->" & vbLf
    s = s & "<tr><td style=""padding:22px 4px 8px 4px;font-size:12px;letter-spacing:1.5px;color:#475569;font-weight:bold;"">1 &#183; SYNTH&#200;SE DU JOUR</td></tr>" & vbLf
    s = s & "<tr><td bgcolor=""#FFFFFF"" style=""background-color:#FFFFFF;border:1px solid #DCE3EC;border-radius:12px;"">" & vbLf
    s = s & "<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"">" & vbLf
    s = s & "<tr>" & vbLf
    s = s & "<td width=""50%"" valign=""top"" style=""padding:14px 16px;border-right:1px solid #EEF2F7;border-bottom:1px solid #EEF2F7;"">" & vbLf
    s = s & "<div style=""font-size:11px;letter-spacing:1px;color:#64748B;font-weight:bold;"">ETP TOTAL</div>" & vbLf
    s = s & "<div style=""font-size:30px;line-height:36px;font-weight:bold;color:#0F172A;"">{{TOT_ETP}}</div>" & vbLf
    s = s & "<div style=""font-size:12px;color:#64748B;"">{{TOT_ETP_SUB}}</div></td>" & vbLf
    s = s & "<td width=""50%"" valign=""top"" style=""padding:14px 16px;border-bottom:1px solid #EEF2F7;"">" & vbLf
    s = s & "<div style=""font-size:11px;letter-spacing:1px;color:#64748B;font-weight:bold;"">HEURES SUPP</div>" & vbLf
    s = s & "<div style=""font-size:30px;line-height:36px;font-weight:bold;color:{{TOT_HS_COL}};"">{{TOT_HS}}</div>" & vbLf
    s = s & "<div style=""font-size:12px;color:#64748B;"">{{TOT_HS_SUB}}</div></td>" & vbLf
    s = s & "</tr>" & vbLf
    s = s & "<tr>" & vbLf
    s = s & "<td width=""50%"" valign=""top"" style=""padding:14px 16px;border-right:1px solid #EEF2F7;"">" & vbLf
    s = s & "<div style=""font-size:11px;letter-spacing:1px;color:#64748B;font-weight:bold;"">LIGNES TOTALES</div>" & vbLf
    s = s & "<div style=""font-size:30px;line-height:36px;font-weight:bold;color:#0F172A;"">{{TOT_LIG}}</div>" & vbLf
    s = s & "<div style=""font-size:12px;color:#64748B;"">{{TOT_LIG_SUB}}</div></td>" & vbLf
    s = s & "<td width=""50%"" valign=""top"" style=""padding:14px 16px;"">" & vbLf
    s = s & "<div style=""font-size:11px;letter-spacing:1px;color:#64748B;font-weight:bold;"">&#201;TIQUETTES</div>" & vbLf
    s = s & "<div style=""font-size:30px;line-height:36px;font-weight:bold;color:#0F172A;"">{{ETIQ}}</div>" & vbLf
    s = s & "<div style=""font-size:12px;color:#64748B;"">{{ETIQ_SUB}}</div></td>" & vbLf
    s = s & "</tr>" & vbLf
    s = s & "</table>" & vbLf
    s = s & "</td></tr>" & vbLf
    s = s & "<tr><td style=""padding:10px 0 0 0;"">" & vbLf
    s = s & "<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""><tr>" & vbLf
    MailTpl1 = s
End Function

Private Function MailTpl2() As String
    Dim s As String
    s = s & "<td bgcolor=""#FFFFFF"" style=""background-color:#FFFFFF;border:1px solid #DCE3EC;border-left:5px solid {{BLOQ_COL}};border-radius:12px;padding:12px 16px;"">" & vbLf
    s = s & "<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""><tr>" & vbLf
    s = s & "<td valign=""middle""><div style=""font-size:11px;letter-spacing:1px;color:#64748B;font-weight:bold;"">LIGNES BLOQU&#201;ES DU JOUR</div>" & vbLf
    s = s & "<div style=""font-size:12px;color:#64748B;"">{{BLOQ_SUB}}</div></td>" & vbLf
    s = s & "<td align=""right"" valign=""middle"" style=""font-size:30px;line-height:36px;font-weight:bold;color:{{BLOQ_COL}};white-space:nowrap;"">{{BLOQ}}</td>" & vbLf
    s = s & "</tr></table>" & vbLf
    s = s & "</td></tr></table>" & vbLf
    s = s & "</td></tr>" & vbLf
    s = s & "<tr><td style=""padding:10px 0 0 0;"">" & vbLf
    s = s & "<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""><tr><td bgcolor=""#FFFFFF"" style=""background-color:#FFFFFF;border:1px solid #DCE3EC;border-radius:12px;"">" & vbLf
    s = s & "<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"">" & vbLf
    s = s & "<tr><td colspan=""3"" style=""padding:12px 16px 0 16px;font-size:11px;letter-spacing:1px;color:#0F172A;font-weight:bold;"">SMC DU JOUR</td></tr>" & vbLf
    s = s & "<tr>" & vbLf
    s = s & "<td width=""34%"" valign=""top"" style=""padding:6px 8px 14px 16px;"">" & vbLf
    s = s & "<div style=""font-size:11px;color:#64748B;"">Lignes SMC</div>" & vbLf
    s = s & "<div style=""font-size:24px;line-height:30px;font-weight:bold;color:#0F172A;"">{{SMC}}</div>" & vbLf
    s = s & "<div style=""font-size:12px;color:#64748B;"">&nbsp;</div></td>" & vbLf
    s = s & "<td width=""33%"" valign=""top"" style=""padding:6px 8px 14px 8px;border-left:1px solid #EEF2F7;"">" & vbLf
    s = s & "<div style=""font-size:11px;color:#64748B;"">Pass&#233;es</div>" & vbLf
    s = s & "<div style=""font-size:24px;line-height:30px;font-weight:bold;color:#15803D;"">{{SMC_PASS}}</div>" & vbLf
    s = s & "<div style=""font-size:12px;color:#64748B;"">{{SMC_PASS_PCT}}</div></td>" & vbLf
    s = s & "<td width=""33%"" valign=""top"" style=""padding:6px 16px 14px 8px;border-left:1px solid #EEF2F7;"">" & vbLf
    s = s & "<div style=""font-size:11px;color:#64748B;"">Bloqu&#233;es</div>" & vbLf
    s = s & "<div style=""font-size:24px;line-height:30px;font-weight:bold;color:{{SMC_BLOQ_COL}};"">{{SMC_BLOQ}}</div>" & vbLf
    s = s & "<div style=""font-size:12px;color:#64748B;"">{{SMC_BLOQ_PCT}}</div></td>" & vbLf
    s = s & "</tr>" & vbLf
    s = s & "</table>" & vbLf
    s = s & "</td></tr></table>" & vbLf
    s = s & "</td></tr>" & vbLf
    s = s & "<tr><td style=""padding:22px 4px 8px 4px;font-size:12px;letter-spacing:1.5px;color:#475569;font-weight:bold;"">2 &#183; D&#201;TAIL PAR SERVICE</td></tr>" & vbLf
    s = s & "<tr><td style=""padding:0 0 10px 0;"">" & vbLf
    s = s & "<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""><tr><td bgcolor=""#FFFFFF"" style=""background-color:#FFFFFF;border:1px solid #DCE3EC;border-top:4px solid #2F6FED;border-radius:12px;"">" & vbLf
    s = s & "<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"">" & vbLf
    s = s & "<tr>" & vbLf
    s = s & "<td valign=""top"" style=""padding:12px 8px 6px 16px;"">" & vbLf
    s = s & "<div style=""font-size:16px;font-weight:bold;color:#0F172A;"">PICK &amp; PACK</div>" & vbLf
    s = s & "<div style=""font-size:12px;color:#64748B;"">objectif {{PP_OBJ}} lignes/ETP</div></td>" & vbLf
    s = s & "<td align=""right"" valign=""top"" style=""padding:10px 16px 6px 8px;white-space:nowrap;"">" & vbLf
    s = s & "<span style=""font-size:26px;line-height:30px;font-weight:bold;color:{{PP_COL}};"">{{PP_PROD}}</span><span style=""font-size:12px;color:#64748B;""> l/ETP</span><br>" & vbLf
    s = s & "<span style=""display:inline-block;background-color:{{PP_BG}};color:{{PP_COL}};font-size:12px;font-weight:bold;padding:2px 8px;border-radius:10px;"">{{PP_BADGE}}</span></td>" & vbLf
    s = s & "</tr>" & vbLf
    s = s & "<tr><td colspan=""2"" style=""padding:4px 8px 4px 8px;"">" & vbLf
    s = s & "<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""><tr>" & vbLf
    s = s & "<td width=""25%"" valign=""top"" style=""padding:8px;""><div style=""font-size:10px;letter-spacing:1px;color:#64748B;font-weight:bold;"">ETP</div><div style=""font-size:18px;font-weight:bold;color:#0F172A;"">{{PP_ETP}}</div></td>" & vbLf
    s = s & "<td width=""25%"" valign=""top"" style=""padding:8px;border-left:1px solid #EEF2F7;""><div style=""font-size:10px;letter-spacing:1px;color:#64748B;font-weight:bold;"">LIGNES</div><div style=""font-size:18px;font-weight:bold;color:#0F172A;"">{{PP_LIG}}</div></td>" & vbLf
    MailTpl2 = s
End Function

Private Function MailTpl3() As String
    Dim s As String
    s = s & "<td width=""25%"" valign=""top"" style=""padding:8px;border-left:1px solid #EEF2F7;""><div style=""font-size:10px;letter-spacing:1px;color:#64748B;font-weight:bold;"">H. SUPP</div><div style=""font-size:18px;font-weight:bold;color:{{PP_HS_COL}};"">{{PP_HS}}</div></td>" & vbLf
    s = s & "<td width=""25%"" valign=""top"" style=""padding:8px;border-left:1px solid #EEF2F7;""><div style=""font-size:10px;letter-spacing:1px;color:#64748B;font-weight:bold;"">FIN POSTE</div><div style=""font-size:18px;font-weight:bold;color:{{PP_FIN_COL}};"">{{PP_FIN}}</div></td>" & vbLf
    s = s & "</tr></table>" & vbLf
    s = s & "</td></tr>" & vbLf
    s = s & "<tr><td colspan=""2"" style=""padding:0 16px 10px 16px;""><table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""><tr><td bgcolor=""#F8FAFC"" style=""background-color:#F8FAFC;border-radius:8px;padding:8px 12px;font-size:13px;color:#475569;"">Fin du convoyeur&nbsp;&nbsp;<b style=""color:{{PP_CONV_COL}};"">{{PP_CONV}}</b></td></tr></table></td></tr>" & vbLf
    s = s & "<!--IF:PP_MVT_ON-->" & vbLf
    s = s & "<tr><td colspan=""2"" style=""padding:0 16px 10px 16px;font-size:12px;color:#64748B;"">{{PP_MVT}}</td></tr>" & vbLf
    s = s & "<!--END:PP_MVT_ON-->" & vbLf
    s = s & "<tr><td colspan=""2"" style=""height:6px;font-size:0;line-height:0;"">&nbsp;</td></tr>" & vbLf
    s = s & "</table>" & vbLf
    s = s & "</td></tr></table>" & vbLf
    s = s & "</td></tr>" & vbLf
    s = s & "<tr><td style=""padding:0 0 10px 0;"">" & vbLf
    s = s & "<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""><tr><td bgcolor=""#FFFFFF"" style=""background-color:#FFFFFF;border:1px solid #DCE3EC;border-top:4px solid #7C3AED;border-radius:12px;"">" & vbLf
    s = s & "<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"">" & vbLf
    s = s & "<tr>" & vbLf
    s = s & "<td valign=""top"" style=""padding:12px 8px 6px 16px;"">" & vbLf
    s = s & "<div style=""font-size:16px;font-weight:bold;color:#0F172A;"">HORS GABARIT</div>" & vbLf
    s = s & "<div style=""font-size:12px;color:#64748B;"">objectif {{HG_OBJ}} lignes/ETP</div></td>" & vbLf
    s = s & "<td align=""right"" valign=""top"" style=""padding:10px 16px 6px 8px;white-space:nowrap;"">" & vbLf
    s = s & "<span style=""font-size:26px;line-height:30px;font-weight:bold;color:{{HG_COL}};"">{{HG_PROD}}</span><span style=""font-size:12px;color:#64748B;""> l/ETP</span><br>" & vbLf
    s = s & "<span style=""display:inline-block;background-color:{{HG_BG}};color:{{HG_COL}};font-size:12px;font-weight:bold;padding:2px 8px;border-radius:10px;"">{{HG_BADGE}}</span></td>" & vbLf
    s = s & "</tr>" & vbLf
    s = s & "<tr><td colspan=""2"" style=""padding:4px 8px 4px 8px;"">" & vbLf
    s = s & "<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""><tr>" & vbLf
    s = s & "<td width=""25%"" valign=""top"" style=""padding:8px;""><div style=""font-size:10px;letter-spacing:1px;color:#64748B;font-weight:bold;"">ETP</div><div style=""font-size:18px;font-weight:bold;color:#0F172A;"">{{HG_ETP}}</div></td>" & vbLf
    s = s & "<td width=""25%"" valign=""top"" style=""padding:8px;border-left:1px solid #EEF2F7;""><div style=""font-size:10px;letter-spacing:1px;color:#64748B;font-weight:bold;"">LIGNES</div><div style=""font-size:18px;font-weight:bold;color:#0F172A;"">{{HG_LIG}}</div></td>" & vbLf
    s = s & "<td width=""25%"" valign=""top"" style=""padding:8px;border-left:1px solid #EEF2F7;""><div style=""font-size:10px;letter-spacing:1px;color:#64748B;font-weight:bold;"">H. SUPP</div><div style=""font-size:18px;font-weight:bold;color:{{HG_HS_COL}};"">{{HG_HS}}</div></td>" & vbLf
    s = s & "<td width=""25%"" valign=""top"" style=""padding:8px;border-left:1px solid #EEF2F7;""><div style=""font-size:10px;letter-spacing:1px;color:#64748B;font-weight:bold;"">FIN POSTE</div><div style=""font-size:18px;font-weight:bold;color:{{HG_FIN_COL}};"">{{HG_FIN}}</div></td>" & vbLf
    s = s & "</tr></table>" & vbLf
    s = s & "</td></tr>" & vbLf
    s = s & "<!--IF:HG_MVT_ON-->" & vbLf
    s = s & "<tr><td colspan=""2"" style=""padding:0 16px 10px 16px;font-size:12px;color:#64748B;"">{{HG_MVT}}</td></tr>" & vbLf
    s = s & "<!--END:HG_MVT_ON-->" & vbLf
    s = s & "<tr><td colspan=""2"" style=""height:6px;font-size:0;line-height:0;"">&nbsp;</td></tr>" & vbLf
    s = s & "</table>" & vbLf
    s = s & "</td></tr></table>" & vbLf
    s = s & "</td></tr>" & vbLf
    s = s & "<tr><td style=""padding:0 0 10px 0;"">" & vbLf
    s = s & "<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""><tr><td bgcolor=""#FFFFFF"" style=""background-color:#FFFFFF;border:1px solid #DCE3EC;border-top:4px solid #0D9488;border-radius:12px;"">" & vbLf
    s = s & "<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"">" & vbLf
    s = s & "<tr>" & vbLf
    s = s & "<td valign=""top"" style=""padding:12px 8px 6px 16px;"">" & vbLf
    s = s & "<div style=""font-size:16px;font-weight:bold;color:#0F172A;"">C&#194;BLE</div>" & vbLf
    s = s & "<div style=""font-size:12px;color:#64748B;"">objectif {{CA_OBJ}} lignes/ETP</div></td>" & vbLf
    MailTpl3 = s
End Function

Private Function MailTpl4() As String
    Dim s As String
    s = s & "<td align=""right"" valign=""top"" style=""padding:10px 16px 6px 8px;white-space:nowrap;"">" & vbLf
    s = s & "<span style=""font-size:26px;line-height:30px;font-weight:bold;color:{{CA_COL}};"">{{CA_PROD}}</span><span style=""font-size:12px;color:#64748B;""> l/ETP</span><br>" & vbLf
    s = s & "<span style=""display:inline-block;background-color:{{CA_BG}};color:{{CA_COL}};font-size:12px;font-weight:bold;padding:2px 8px;border-radius:10px;"">{{CA_BADGE}}</span></td>" & vbLf
    s = s & "</tr>" & vbLf
    s = s & "<tr><td colspan=""2"" style=""padding:4px 8px 4px 8px;"">" & vbLf
    s = s & "<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""><tr>" & vbLf
    s = s & "<td width=""25%"" valign=""top"" style=""padding:8px;""><div style=""font-size:10px;letter-spacing:1px;color:#64748B;font-weight:bold;"">ETP</div><div style=""font-size:18px;font-weight:bold;color:#0F172A;"">{{CA_ETP}}</div></td>" & vbLf
    s = s & "<td width=""25%"" valign=""top"" style=""padding:8px;border-left:1px solid #EEF2F7;""><div style=""font-size:10px;letter-spacing:1px;color:#64748B;font-weight:bold;"">LIGNES</div><div style=""font-size:18px;font-weight:bold;color:#0F172A;"">{{CA_LIG}}</div></td>" & vbLf
    s = s & "<td width=""25%"" valign=""top"" style=""padding:8px;border-left:1px solid #EEF2F7;""><div style=""font-size:10px;letter-spacing:1px;color:#64748B;font-weight:bold;"">H. SUPP</div><div style=""font-size:18px;font-weight:bold;color:{{CA_HS_COL}};"">{{CA_HS}}</div></td>" & vbLf
    s = s & "<td width=""25%"" valign=""top"" style=""padding:8px;border-left:1px solid #EEF2F7;""><div style=""font-size:10px;letter-spacing:1px;color:#64748B;font-weight:bold;"">FIN POSTE</div><div style=""font-size:18px;font-weight:bold;color:{{CA_FIN_COL}};"">{{CA_FIN}}</div></td>" & vbLf
    s = s & "</tr></table>" & vbLf
    s = s & "</td></tr>" & vbLf
    s = s & "<tr><td colspan=""2"" style=""padding:0 16px 10px 16px;""><table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""><tr><td bgcolor=""#F8FAFC"" style=""background-color:#F8FAFC;border-radius:8px;padding:8px 12px;font-size:13px;color:#475569;"">D&#233;vidages&nbsp;&nbsp;<b style=""color:#0F172A;"">{{CA_DEV}}</b></td></tr></table></td></tr>" & vbLf
    s = s & "<!--IF:CA_MVT_ON-->" & vbLf
    s = s & "<tr><td colspan=""2"" style=""padding:0 16px 10px 16px;font-size:12px;color:#64748B;"">{{CA_MVT}}</td></tr>" & vbLf
    s = s & "<!--END:CA_MVT_ON-->" & vbLf
    s = s & "<tr><td colspan=""2"" style=""height:6px;font-size:0;line-height:0;"">&nbsp;</td></tr>" & vbLf
    s = s & "</table>" & vbLf
    s = s & "</td></tr></table>" & vbLf
    s = s & "</td></tr>" & vbLf
    s = s & "<tr><td style=""padding:22px 4px 8px 4px;font-size:12px;letter-spacing:1.5px;color:#475569;font-weight:bold;"">3 &#183; PROJECTION &#183; {{D2_TITRE}}</td></tr>" & vbLf
    s = s & "<tr><td bgcolor=""#FFFFFF"" style=""background-color:#FFFFFF;border:1px solid #DCE3EC;border-radius:12px;"">" & vbLf
    s = s & "<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"">" & vbLf
    s = s & "<tr>" & vbLf
    s = s & "<td width=""34%"" valign=""top"" style=""padding:14px 8px 12px 16px;"">" & vbLf
    s = s & "<div style=""font-size:10px;letter-spacing:0.5px;color:#64748B;font-weight:bold;white-space:nowrap;"">ETP PR&#201;VUS</div>" & vbLf
    s = s & "<div style=""font-size:26px;line-height:32px;font-weight:bold;color:#0F172A;"">{{PREV_ETP}}</div>" & vbLf
    s = s & "<div style=""font-size:11px;color:#64748B;"">planning</div></td>" & vbLf
    s = s & "<td width=""33%"" valign=""top"" style=""padding:14px 8px 12px 8px;border-left:1px solid #EEF2F7;"">" & vbLf
    s = s & "<div style=""font-size:10px;letter-spacing:0.5px;color:#64748B;font-weight:bold;white-space:nowrap;"">LIGNES PR&#201;VUES</div>" & vbLf
    s = s & "<div style=""font-size:26px;line-height:32px;font-weight:bold;color:#0F172A;"">{{PREV_LIG}}</div>" & vbLf
    s = s & "<div style=""font-size:11px;color:#64748B;"">{{PREV_LIG_SUB}}</div></td>" & vbLf
    s = s & "<td width=""33%"" valign=""top"" style=""padding:14px 16px 12px 8px;border-left:1px solid #EEF2F7;"">" & vbLf
    s = s & "<div style=""font-size:10px;letter-spacing:0.5px;color:#64748B;font-weight:bold;white-space:nowrap;"">&#201;CART</div>" & vbLf
    s = s & "<div style=""font-size:26px;line-height:32px;font-weight:bold;color:{{PREV_COL}};"">{{PREV_ECART}}</div>" & vbLf
    s = s & "<div style=""font-size:11px;color:#64748B;"">ETP</div></td>" & vbLf
    s = s & "</tr>" & vbLf
    s = s & "<tr><td colspan=""3"" style=""padding:0 12px 12px 12px;"">" & vbLf
    s = s & "<table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""><tr><td bgcolor=""{{PREV_BG}}"" style=""background-color:{{PREV_BG}};border-radius:8px;padding:10px 12px;"">" & vbLf
    s = s & "<div style=""font-size:14px;font-weight:bold;color:{{PREV_COL}};"">{{PREV_VERDICT}}</div>" & vbLf
    s = s & "<div style=""font-size:12px;color:#475569;padding-top:2px;"">{{PREV_DETAIL}}</div>" & vbLf
    s = s & "</td></tr></table>" & vbLf
    s = s & "</td></tr>" & vbLf
    s = s & "<!--IF:OUV_ON-->" & vbLf
    s = s & "<tr><td colspan=""3"" style=""padding:0 16px 14px 16px;font-size:12px;color:#475569;""><b style=""color:#0F172A;"">Ouverture</b> &#183; {{OUV_TXT}}</td></tr>" & vbLf
    MailTpl4 = s
End Function

Private Function MailTpl5() As String
    Dim s As String
    s = s & "<!--END:OUV_ON-->" & vbLf
    s = s & "</table>" & vbLf
    s = s & "</td></tr>" & vbLf
    s = s & "<tr><td style=""padding:22px 4px 8px 4px;font-size:12px;letter-spacing:1.5px;color:#475569;font-weight:bold;"">4 &#183; INFIRMERIE</td></tr>" & vbLf
    s = s & "<tr><td bgcolor=""#FFFFFF"" style=""background-color:#FFFFFF;border:1px solid #DCE3EC;border-left:5px solid {{INF_COL}};border-radius:12px;padding:12px 16px;"">" & vbLf
    s = s & "<div style=""font-size:15px;font-weight:bold;color:{{INF_COL}};"">{{INF_TITRE}}</div>" & vbLf
    s = s & "<!--IF:INF1--><div style=""font-size:13px;color:#0F172A;padding-top:8px;border-top:1px solid #EEF2F7;margin-top:8px;""><b>{{INF1_TETE}}</b><br><span style=""color:#475569;"">{{INF1_DESC}}</span></div><!--END:INF1-->" & vbLf
    s = s & "<!--IF:INF2--><div style=""font-size:13px;color:#0F172A;padding-top:8px;border-top:1px solid #EEF2F7;margin-top:8px;""><b>{{INF2_TETE}}</b><br><span style=""color:#475569;"">{{INF2_DESC}}</span></div><!--END:INF2-->" & vbLf
    s = s & "<!--IF:INF3--><div style=""font-size:13px;color:#0F172A;padding-top:8px;border-top:1px solid #EEF2F7;margin-top:8px;""><b>{{INF3_TETE}}</b><br><span style=""color:#475569;"">{{INF3_DESC}}</span></div><!--END:INF3-->" & vbLf
    s = s & "<!--IF:INF4--><div style=""font-size:13px;color:#0F172A;padding-top:8px;border-top:1px solid #EEF2F7;margin-top:8px;""><b>{{INF4_TETE}}</b><br><span style=""color:#475569;"">{{INF4_DESC}}</span></div><!--END:INF4-->" & vbLf
    s = s & "</td></tr>" & vbLf
    s = s & "<tr><td style=""padding:18px 6px 0 6px;font-size:11px;line-height:16px;color:#94A3B8;"">{{PIED}}</td></tr>" & vbLf
    s = s & "</table>" & vbLf
    s = s & "</td></tr>" & vbLf
    s = s & "</table>" & vbLf
    MailTpl5 = s
End Function
