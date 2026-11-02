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
