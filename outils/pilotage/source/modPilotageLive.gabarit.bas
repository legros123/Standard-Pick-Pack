Attribute VB_Name = "modPilotageLive"
Option Explicit
'==============================================================================
'  PILOTAGE PICK & PACK  -  alimentation du tableau de bord  pilotage.html
'
'  Ce module interroge LOGYS en LECTURE SEULE (uniquement des SELECT), lit le
'  classeur Controle des rejets et le Suivi Op, puis ecrit le fichier
'  pilotage_data.js dans le dossier de pilotage.html. La page relit ce fichier
'  toutes les 30 secondes : aucun serveur, aucune connexion Internet.
'
'  MISE EN ROUTE (une seule fois)
'    1. Classeur Excel vierge > Alt+F11 > Fichier > Importer un fichier >
'       modPilotageLive.bas, puis Debogage > Compiler VBAProject.
'    2. Enregistrer en .xlsm (ex. Pilotage_Live.xlsm).
'    3. Alt+F8 > Pilotage_Installer : cree la feuille PILOTAGE.
'    4. Remplir les cases jaunes : DSN, DOSSIER_SORTIE, puis les deux chemins.
'    5. Alt+F8 > Pilotage_Tester (un seul passage, avec compte rendu),
'       puis Pilotage_Demarrer (boucle).
'
'  ARRET : Pilotage_Arreter. A coller dans ThisWorkbook pour arreter seul :
'      Private Sub Workbook_BeforeClose(Cancel As Boolean)
'          Pilotage_Arreter
'      End Sub
'
'  SECURITE
'    - Aucun mot de passe dans le classeur : la source ODBC le demande une
'      fois, a la premiere connexion.
'    - Le fichier pilotage_data.js contient des noms : il reste sur le poste
'      ou le partage, il ne se publie pas.
'    - Les classeurs lus sont ouverts en lecture seule, macros desactivees.
'
'  Conseil : faire tourner ce classeur dans une fenetre Excel a part
'  (Excel reste occupe quelques secondes a chaque passage).
'==============================================================================

Private Const FEUILLE_CFG As String = "PILOTAGE"
Private Const NOM_FICHIER As String = "pilotage_data.js"
Private Const MINUTES_LENT As Long = 15        ' requetes lourdes : une fois par quart d'heure
Private Const MINUTES_SUIVI As Long = 60       ' Suivi Op et historique : une fois par heure

Private mCn As Object                          ' connexion ADODB gardee ouverte entre deux passages
Private mCfg As Object                         ' reglages lus dans la feuille PILOTAGE
Private mActif As Boolean
Private mProchain As Date
Private mJournal As String                     ' incidents du dernier passage
Private mNbReq As Long
Private mCacheLent As String
Private mCacheLentA As Date
Private mCacheTop As String
Private mCacheSuivi As String
Private mCacheSuiviA As Date

'==============================================================================
'  COMMANDES
'==============================================================================
Public Sub Pilotage_Installer()
    Dim ws As Worksheet, r As Long, finJaune As Long
    If FeuilleExiste(FEUILLE_CFG) Then
        MsgBox "La feuille " & FEUILLE_CFG & " existe deja : elle n'est pas modifiee.", vbInformation, "Pilotage"
        ThisWorkbook.Worksheets(FEUILLE_CFG).Activate
        Exit Sub
    End If
    Set ws = ThisWorkbook.Worksheets.Add(After:=ThisWorkbook.Worksheets(ThisWorkbook.Worksheets.Count))
    ws.Name = FEUILLE_CFG
    ws.Columns(2).NumberFormat = "@"
    r = 0
    Poser ws, r, "REGLAGE", "VALEUR", "A QUOI CA SERT"
    Poser ws, r, "DSN", "", "Nom de la source ODBC LOGYS, la meme que dans tes classeurs de requetes."
    Poser ws, r, "DOSSIER_SORTIE", ThisWorkbook.Path, "Dossier ou se trouve pilotage.html : le fichier pilotage_data.js y est ecrit."
    Poser ws, r, "INTERVALLE_SEC", "120", "Secondes entre deux passages (60 au minimum)."
    Poser ws, r, "FICHIER_REJETS", "", "Chemin complet du classeur Controle des rejets (erreurs decelees). Vide = estimation LOGYS."
    Poser ws, r, "FICHIER_SUIVI_OP", "", "Chemin complet du Suivi Op (historique, quota, PPM). Vide = ce classeur s'il contient l'onglet PROD."
    Poser ws, r, "SITE", "CLR Champigneulles", "Nom affiche en haut a gauche."
    Poser ws, r, "SERVICE", "Pick & Pack", "Nom du service."
    Poser ws, r, "DEBUT", "06:00", "Heure de debut du poste (utilisee tant qu'aucune ligne n'est validee)."
    Poser ws, r, "FIN_VISEE", "19:00", "Heure a laquelle toute la charge doit etre preparee."
    Poser ws, r, "PAUSES", "", "Pauses de l'equipe, ex. 09:00-09:20;16:30-16:50 (deduites du calcul de l'heure de fin)."
    Poser ws, r, "JALONS", "12:15;15:15;17:15;19:00", "Heures reperes de la journee (departs, fins de vague)."
    Poser ws, r, "QUOTA_JOUR", "620", "Standard : lignes par poste (PARAMETRES du Suivi Op)."
    Poser ws, r, "H_REF", "7,4", "Duree d'un poste en heures."
    Poser ws, r, "REJETS_MAX", "120", "Objectif site : rejets par jour au maximum."
    Poser ws, r, "DEC_ORANGE", "15", "Erreurs decelees par jour : seuil d'alerte."
    Poser ws, r, "DEC_ROUGE", "20", "Erreurs decelees par jour : seuil rouge."
    Poser ws, r, "PART_PICK", "0,70", "Part du Pick & Pack dans le carnet de commandes (prevision)."
    Poser ws, r, "ZONE_PICK", "PICK01A14", "Zone de picking (alertes de reappro)."
    Poser ws, r, "JOURS_REPORT", "3", "Tournees ouvertes prises en compte : jusqu'a combien de jours en arriere."
    Poser ws, r, "R_VAGUES", "OUI", "Lire l'avancement des vagues."
    Poser ws, r, "R_DEPARTS", "OUI", "Lire les ordres de transport du jour."
    Poser ws, r, "R_STOCK", "OUI", "Lire les alertes de reappro et les ruptures (toutes les 15 min)."
    Poser ws, r, "R_RETARD", "OUI", "Lire les commandes en retard (toutes les 15 min)."
    Poser ws, r, "R_CARNET", "OUI", "Lire le carnet de commandes des 7 prochains jours (toutes les 15 min)."
    Poser ws, r, "R_PORTEFEUILLE", "NON", "Compter les lignes pas encore lancees en vague. A verifier sur l'ecran LOGYS avant de passer a OUI."
    Poser ws, r, "DATE_DERNIER_ACCIDENT", "", "jj/mm/aaaa : sert au compteur de jours sans accident."
    Poser ws, r, "MESSAGE_SECURITE", "", "Message securite du jour."
    Poser ws, r, "MESSAGE_1", "", "Message libre affiche dans le bandeau du bas."
    Poser ws, r, "MESSAGE_2", "", "Deuxieme message libre."
    finJaune = r
    r = r + 1
    Poser ws, r, "ETAT", "", "Rempli par le module."
    Poser ws, r, "DERNIER_PASSAGE", "", "Rempli par le module."
    Poser ws, r, "DERNIER_MESSAGE", "", "Rempli par le module."
    ws.Range("A1:C1").Font.Bold = True
    ws.Range(ws.Cells(2, 2), ws.Cells(finJaune, 2)).Interior.Color = RGB(255, 242, 153)
    ws.Columns(1).ColumnWidth = 26
    ws.Columns(2).ColumnWidth = 48
    ws.Columns(3).ColumnWidth = 96
    Set mCfg = Nothing
    MsgBox "Feuille " & FEUILLE_CFG & " creee." & vbCrLf & _
           "Remplis les cases jaunes (au minimum DSN et DOSSIER_SORTIE), puis lance Pilotage_Tester.", vbInformation, "Pilotage"
End Sub

Private Sub Poser(ByVal ws As Worksheet, ByRef r As Long, ByVal nom As String, ByVal valeur As String, ByVal aide As String)
    r = r + 1
    ws.Cells(r, 1).Value = nom
    ws.Cells(r, 2).Value = valeur
    ws.Cells(r, 3).Value = aide
End Sub

Public Sub Pilotage_Demarrer()
    If Not FeuilleExiste(FEUILLE_CFG) Then
        Pilotage_Installer
        Exit Sub
    End If
    If mActif Then Annuler
    mActif = True
    Pilotage_Actualiser
End Sub

Public Sub Pilotage_Arreter()
    Annuler
    mActif = False
    FermerConnexion
    EcrireReglage "ETAT", "Arrete le " & Format$(Now, "dd/mm/yyyy hh:nn")
End Sub

Public Sub Pilotage_Tester()
    Dim etaitActif As Boolean
    If Not FeuilleExiste(FEUILLE_CFG) Then
        Pilotage_Installer
        Exit Sub
    End If
    etaitActif = mActif
    mActif = False
    mCacheLentA = 0
    mCacheSuiviA = 0
    Pilotage_Actualiser
    mActif = etaitActif
    MsgBox "Passage termine : " & mNbReq & " requetes." & vbCrLf & vbCrLf & _
           "Fichier : " & CheminFichier() & vbCrLf & vbCrLf & _
           IIf(Len(mJournal) = 0, "Aucun incident.", "Incidents :" & vbCrLf & mJournal), _
           IIf(Len(mJournal) = 0, vbInformation, vbExclamation), "Pilotage"
End Sub

' Un passage : lit tout, ecrit le fichier, puis se replanifie si la boucle est active.
Public Sub Pilotage_Actualiser()
    Dim json As String, t0 As Double
    Dim majEcran As Boolean, evts As Boolean, alertes As Boolean
    t0 = Timer
    mJournal = ""
    mNbReq = 0
    majEcran = Application.ScreenUpdating
    evts = Application.EnableEvents
    alertes = Application.DisplayAlerts
    On Error GoTo Erreur
    Application.ScreenUpdating = False
    Application.EnableEvents = False
    Application.DisplayAlerts = False
    Set mCfg = Nothing
    ChargerReglages
    If Connecter() Then
        json = ConstruireJson()
        EcrireFichier json
    End If
Sortie:
    On Error Resume Next
    Application.DisplayAlerts = alertes
    Application.EnableEvents = evts
    Application.ScreenUpdating = majEcran
    EcrireReglage "DERNIER_PASSAGE", Format$(Now, "dd/mm/yyyy hh:nn:ss") & "  (" & Format$(DureeDepuis(t0), "0.0") & " s, " & mNbReq & " requetes)"
    EcrireReglage "DERNIER_MESSAGE", IIf(Len(mJournal) = 0, "OK", Left$(Replace(mJournal, vbCrLf, " | "), 900))
    EcrireReglage "ETAT", IIf(mActif, "En marche", "A l'arret")
    On Error GoTo 0
    If mActif Then Planifier
    Exit Sub
Erreur:
    Noter "passage", Err.Description
    Resume Sortie
End Sub

Public Sub Pilotage_OuvrirPage()
    Dim p As String
    ChargerReglages
    p = Dossier() & "pilotage.html"
    If Len(Dir$(p)) = 0 Then
        MsgBox "pilotage.html est introuvable dans " & Dossier(), vbExclamation, "Pilotage"
    Else
        ThisWorkbook.FollowHyperlink p
    End If
End Sub

'==============================================================================
'  BOUCLE
'==============================================================================
Private Sub Planifier()
    Dim s As Long
    s = Entier(Cfg("INTERVALLE_SEC", "120"), 120)
    If s < 60 Then s = 60
    mProchain = Now + s / 86400#
    Application.OnTime mProchain, "'" & ThisWorkbook.Name & "'!Pilotage_Actualiser"
End Sub

Private Sub Annuler()
    On Error Resume Next
    If mProchain <> 0 Then Application.OnTime mProchain, "'" & ThisWorkbook.Name & "'!Pilotage_Actualiser", , False
    On Error GoTo 0
    mProchain = 0
End Sub

Private Function DureeDepuis(ByVal t0 As Double) As Double
    Dim d As Double
    d = Timer - t0
    If d < 0 Then d = d + 86400#                ' passage de minuit
    DureeDepuis = d
End Function

'==============================================================================
'  REGLAGES
'==============================================================================
Private Function FeuilleExiste(ByVal nom As String) As Boolean
    Dim ws As Worksheet
    For Each ws In ThisWorkbook.Worksheets
        If StrComp(ws.Name, nom, vbTextCompare) = 0 Then
            FeuilleExiste = True
            Exit Function
        End If
    Next ws
End Function

Private Sub ChargerReglages()
    Dim ws As Worksheet, v As Variant, i As Long, der As Long, k As String
    If Not mCfg Is Nothing Then Exit Sub
    Set mCfg = CreateObject("Scripting.Dictionary")
    mCfg.CompareMode = vbTextCompare
    If Not FeuilleExiste(FEUILLE_CFG) Then Exit Sub
    Set ws = ThisWorkbook.Worksheets(FEUILLE_CFG)
    der = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If der < 2 Then Exit Sub
    v = ws.Range(ws.Cells(1, 1), ws.Cells(der, 2)).Value
    For i = 2 To UBound(v, 1)
        If Not IsError(v(i, 1)) Then
            k = Trim$(CStr(v(i, 1)))
            If Len(k) > 0 And Not mCfg.Exists(k) Then
                If IsError(v(i, 2)) Then
                    mCfg.Add k, ""
                Else
                    mCfg.Add k, Trim$(CStr(v(i, 2)))
                End If
            End If
        End If
    Next i
End Sub

Private Function Cfg(ByVal nom As String, Optional ByVal defaut As String = "") As String
    Cfg = defaut
    ChargerReglages
    If mCfg.Exists(nom) Then
        If Len(CStr(mCfg(nom))) > 0 Then Cfg = CStr(mCfg(nom))
    End If
End Function

Private Function Oui(ByVal nom As String, ByVal defaut As Boolean) As Boolean
    Dim v As String
    v = UCase$(Cfg(nom, IIf(defaut, "OUI", "NON")))
    Oui = (v = "OUI" Or v = "O" Or v = "1" Or v = "VRAI" Or v = "TRUE")
End Function

Private Function Entier(ByVal s As String, ByVal defaut As Long) As Long
    Entier = defaut
    If IsNumeric(s) Then
        If CDbl(s) >= 0 And CDbl(s) < 2000000000# Then Entier = CLng(CDbl(s))
    End If
End Function

' Nombre saisi avec une virgule ou un point -> Double, quels que soient les parametres regionaux
Private Function Reel(ByVal s As String, ByVal defaut As Double) As Double
    s = Replace(Trim$(s), ",", ".")
    If Len(s) = 0 Then
        Reel = defaut
    ElseIf s Like "*[!0-9.]*" Then
        Reel = defaut
    Else
        Reel = Val(s)
    End If
End Function

' Ne garde que lettres, chiffres et tiret bas : la valeur est inseree dans une requete
Private Function Propre(ByVal s As String) As String
    Dim i As Long, c As String, r As String
    For i = 1 To Len(s)
        c = Mid$(s, i, 1)
        If c Like "[A-Za-z0-9_]" Then r = r & c
    Next i
    Propre = r
End Function

' Heure saisie en texte (19:00, 19h00) ou en heure Excel (0,79) -> "19:00"
Private Function Heure(ByVal s As String) As String
    Dim p As Long, h As Long, m As Long, x As Double
    s = Replace(LCase$(Trim$(s)), "h", ":")
    p = InStr(s, ":")
    If p > 1 Then
        h = Entier(Left$(s, p - 1), 0)
        m = Entier(Mid$(s, p + 1, 2), 0)
    ElseIf Len(s) > 0 Then
        x = Reel(s, -1)
        If x < 0 Or x >= 1 Then Exit Function
        h = Int(x * 24 + 0.0001)
        m = Int((x * 24 - h) * 60 + 0.5)
    Else
        Exit Function
    End If
    If h > 23 Or m > 59 Then Exit Function
    Heure = Format$(h, "00") & ":" & Format$(m, "00")
End Function

Private Sub EcrireReglage(ByVal nom As String, ByVal valeur As String)
    Dim ws As Worksheet, i As Long, der As Long
    On Error Resume Next
    If FeuilleExiste(FEUILLE_CFG) Then
        Set ws = ThisWorkbook.Worksheets(FEUILLE_CFG)
        der = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
        For i = 2 To der
            If StrComp(Trim$(CStr(ws.Cells(i, 1).Value)), nom, vbTextCompare) = 0 Then
                ws.Cells(i, 2).Value = valeur
                Exit For
            End If
        Next i
    End If
    On Error GoTo 0
End Sub

Private Sub Noter(ByVal quoi As String, ByVal message As String)
    If Len(mJournal) > 0 Then mJournal = mJournal & vbCrLf
    mJournal = mJournal & quoi & " : " & message
End Sub

Private Function Dossier() As String
    Dim d As String
    d = Cfg("DOSSIER_SORTIE", ThisWorkbook.Path)
    If Len(d) = 0 Then d = CurDir$
    If Right$(d, 1) <> Application.PathSeparator Then d = d & Application.PathSeparator
    Dossier = d
End Function

Private Function CheminFichier() As String
    CheminFichier = Dossier() & NOM_FICHIER
End Function

'==============================================================================
'  LOGYS (ODBC, lecture seule)
'==============================================================================
Private Function Connecter() As Boolean
    Dim dsn As String
    On Error GoTo Erreur
    If Not mCn Is Nothing Then
        If mCn.State = 1 Then
            Connecter = True
            Exit Function
        End If
    End If
    dsn = Cfg("DSN", "")
    If Len(dsn) = 0 Then
        Noter "connexion LOGYS", "le reglage DSN est vide (nom de la source ODBC)."
        Exit Function
    End If
    Set mCn = CreateObject("ADODB.Connection")
    mCn.ConnectionTimeout = 20
    mCn.CommandTimeout = 90
    On Error Resume Next
    mCn.Properties("Prompt") = 2                ' la source ODBC demande le mot de passe s'il manque, une seule fois
    On Error GoTo Erreur
    mCn.Open "DSN=" & dsn
    Connecter = True
    Exit Function
Erreur:
    Noter "connexion LOGYS", Err.Description
    Set mCn = Nothing
    Connecter = False
End Function

Private Sub FermerConnexion()
    On Error Resume Next
    If Not mCn Is Nothing Then
        If mCn.State = 1 Then mCn.Close
    End If
    Set mCn = Nothing
    On Error GoTo 0
End Sub

' Execute une requete ; t(colonne, ligne) en base 0 ; renvoie le nombre de lignes
Private Function Lire(ByVal sql As String, ByRef t As Variant) As Long
    Dim rs As Object
    Lire = 0
    mNbReq = mNbReq + 1
    Set rs = CreateObject("ADODB.Recordset")
    rs.Open sql, mCn, 0, 1                      ' curseur avant seulement, lecture seule
    If Not rs.EOF Then
        t = rs.GetRows()
        Lire = UBound(t, 2) + 1
    End If
    rs.Close
    Set rs = Nothing
End Function

'==============================================================================
'  JSON (tout en ASCII : les accents sont ecrits \uXXXX)
'==============================================================================
Private Function JS(ByVal v As Variant) As String
    Dim s As String, i As Long, c As Long, r As String, ch As String
    If IsNull(v) Or IsEmpty(v) Then
        JS = """"""
        Exit Function
    End If
    s = Trim$(CStr(v))
    For i = 1 To Len(s)
        ch = Mid$(s, i, 1)
        c = AscW(ch)
        If c < 0 Then c = c + 65536
        Select Case c
            Case 34
                r = r & "\"""
            Case 92
                r = r & "\\"
            Case 0 To 31
                r = r & " "
            Case 32 To 126
                r = r & ch
            Case Else
                r = r & "\u" & Right$("0000" & Hex$(c), 4)
        End Select
    Next i
    JS = """" & r & """"
End Function

Private Function JN(ByVal v As Variant) As String
    Dim d As Double
    JN = "null"
    If IsNull(v) Or IsEmpty(v) Then Exit Function
    If Not IsNumeric(v) Then Exit Function
    d = CDbl(v)
    If d = Fix(d) And Abs(d) < 1E+15 Then
        JN = Format$(d, "0")
    Else
        JN = Replace(Format$(d, "0.0###"), ",", ".")
    End If
End Function

Private Function NZ(ByVal v As Variant) As Double
    If IsNull(v) Or IsEmpty(v) Then Exit Function
    If IsNumeric(v) Then NZ = CDbl(v)
End Function

Private Sub Ajouter(ByRef p As String, ByVal s As String)
    If Len(s) > 0 Then p = p & "," & s
End Sub

' Dictionnaire { cle : nombre } -> objet JSON
Private Function DicoJson(ByVal d As Object) As String
    Dim k As Variant, s As String
    For Each k In d.Keys
        If Len(s) > 0 Then s = s & ","
        s = s & JS(k) & ":" & JN(d(k))
    Next k
    DicoJson = "{" & s & "}"
End Function

Private Sub Compter(ByVal d As Object, ByVal cle As String)
    If d.Exists(cle) Then d(cle) = d(cle) + 1 Else d.Add cle, 1
End Sub

'==============================================================================
'  ASSEMBLAGE
'==============================================================================
Private Function ConstruireJson() As String
    Dim p As String
    p = "{""v"":1,""source"":""LOGYS"",""maj"":""" & Format$(Now, "yyyy-mm-dd") & "T" & Format$(Now, "hh:nn:ss") & """"
    Ajouter p, SectionReglages()
    RafraichirLent
    Ajouter p, SectionCharge()
    Ajouter p, SectionHeures()
    Ajouter p, SectionQuarts()
    Ajouter p, SectionRejets()
    Ajouter p, SectionDecelees()
    If Oui("R_VAGUES", True) Then Ajouter p, SectionVagues()
    If Oui("R_DEPARTS", True) Then Ajouter p, SectionDeparts()
    Ajouter p, mCacheLent
    Ajouter p, SectionSuiviOp()
    Ajouter p, SectionDivers()
    ConstruireJson = p & "}"
End Function

Private Function SectionReglages() As String
    Dim s As String, v As Variant, i As Long, a As String, b As String, x As String, pos As Long
    s = """cfg"":{""site"":" & JS(Cfg("SITE", "CLR Champigneulles")) & ",""service"":" & JS(Cfg("SERVICE", "Pick & Pack"))
    If Len(Heure(Cfg("DEBUT", ""))) > 0 Then s = s & ",""debut"":" & JS(Heure(Cfg("DEBUT", "")))
    If Len(Heure(Cfg("FIN_VISEE", ""))) > 0 Then s = s & ",""finVisee"":" & JS(Heure(Cfg("FIN_VISEE", "")))
    ' pauses : 09:00-09:20;16:30-16:50
    x = ""
    v = Split(Cfg("PAUSES", ""), ";")
    For i = LBound(v) To UBound(v)
        pos = InStr(CStr(v(i)), "-")
        If pos > 1 Then
            a = Heure(Left$(CStr(v(i)), pos - 1))
            b = Heure(Mid$(CStr(v(i)), pos + 1))
            If Len(a) > 0 And Len(b) > 0 Then
                If Len(x) > 0 Then x = x & ","
                x = x & "[" & JS(a) & "," & JS(b) & "]"
            End If
        End If
    Next i
    s = s & ",""pauses"":[" & x & "]"
    ' jalons : 12:15;15:15
    x = ""
    v = Split(Cfg("JALONS", ""), ";")
    For i = LBound(v) To UBound(v)
        a = Heure(CStr(v(i)))
        If Len(a) > 0 Then
            If Len(x) > 0 Then x = x & ","
            x = x & JS(a)
        End If
    Next i
    s = s & ",""jalons"":[" & x & "]"
    s = s & ",""quotaJour"":" & JN(Reel(Cfg("QUOTA_JOUR", "620"), 620))
    s = s & ",""hRef"":" & JN(Reel(Cfg("H_REF", "7.4"), 7.4))
    s = s & ",""rejetsMax"":" & JN(Reel(Cfg("REJETS_MAX", "120"), 120))
    s = s & ",""decOrange"":" & JN(Reel(Cfg("DEC_ORANGE", "15"), 15))
    s = s & ",""decRouge"":" & JN(Reel(Cfg("DEC_ROUGE", "20"), 20))
    s = s & ",""partPick"":" & JN(Reel(Cfg("PART_PICK", "0.7"), 0.7))
    s = s & ",""inclureALancer"":" & IIf(Oui("R_PORTEFEUILLE", False), "true", "false")
    SectionReglages = s & "}"
End Function

' Preparateurs du jour + charge : fait, reste a faire, chariots, taille des chariots
Private Function SectionCharge() As String
    Dim t As Variant, n As Long, i As Long, ops As String, s As String
    Dim nbP As Double, nbM As Double, nbG As Double
    Dim faitD As Double, faitC As Double, colis As Double
    Dim resteD As Double, resteC As Double, ouvertes As Double, libres As Double, finies As Double
    On Error GoTo Erreur
    n = Lire(SqlOperateurs(), t)
    For i = 0 To n - 1
        If i > 0 Then ops = ops & ","
        ops = ops & "{""code"":" & JS(t(0, i)) & ",""nom"":" & JS(t(1, i)) & ",""lignes"":" & JN(t(2, i)) & _
              ",""tournees"":" & JN(t(3, i)) & ",""cont"":" & JN(t(4, i)) & ",""premiere"":" & JS(t(5, i)) & _
              ",""derniere"":" & JS(t(6, i)) & ",""p"":" & JN(t(7, i)) & ",""m"":" & JN(t(8, i)) & ",""g"":" & JN(t(9, i)) & "}"
        nbP = nbP + NZ(t(7, i))
        nbM = nbM + NZ(t(8, i))
        nbG = nbG + NZ(t(9, i))
    Next i
    n = Lire(SqlFaitParType(), t)
    For i = 0 To n - 1
        If UCase$(Trim$(CStr(t(0, i)))) = "CART" Then faitC = faitC + NZ(t(1, i)) Else faitD = faitD + NZ(t(1, i))
        colis = colis + NZ(t(2, i))
    Next i
    n = Lire(SqlRestantParType(), t)
    For i = 0 To n - 1
        If UCase$(Trim$(CStr(t(0, i)))) = "CARTON" Then resteC = resteC + NZ(t(3, i)) Else resteD = resteD + NZ(t(3, i))
        ouvertes = ouvertes + NZ(t(1, i))
        libres = libres + NZ(t(2, i))
    Next i
    n = Lire(SqlTourneesFinies(), t)
    If n > 0 Then finies = NZ(t(0, 0))
    s = """charge"":{""fait"":" & JN(faitD + faitC) & ",""restant"":" & JN(resteD + resteC) & ",""contFaits"":" & JN(colis) & _
        ",""tourneesFaites"":" & JN(finies) & ",""tourneesOuvertes"":" & JN(ouvertes) & ",""tourneesLibres"":" & JN(libres)
    If nbP + nbM + nbG > 0 Then s = s & ",""classes"":{""p"":" & JN(nbP) & ",""m"":" & JN(nbM) & ",""g"":" & JN(nbG) & "}"
    If Oui("R_PORTEFEUILLE", False) Then
        n = Lire(SqlPortefeuille(), t)
        If n > 0 Then s = s & ",""aLancer"":" & JN(NZ(t(0, 0)))
    End If
    s = s & ",""types"":[{""code"":""DETAIL"",""lib"":" & JS("D" & ChrW$(233) & "tail") & ",""fait"":" & JN(faitD) & ",""restant"":" & JN(resteD) & "}," & _
        "{""code"":""CARTON"",""lib"":""Carton"",""fait"":" & JN(faitC) & ",""restant"":" & JN(resteC) & "}]}"
    SectionCharge = s & ",""operateurs"":[" & ops & "]"
    Exit Function
Erreur:
    Noter "charge du jour", Err.Description
    FermerConnexion                              ' on se reconnectera au prochain passage
    SectionCharge = ""
End Function

Private Function SectionHeures() As String
    Dim t As Variant, n As Long, i As Long, s As String
    On Error GoTo Erreur
    If mCn Is Nothing Then Exit Function
    n = Lire(SqlHeures(), t)
    For i = 0 To n - 1
        If i > 0 Then s = s & ","
        s = s & "{""h"":" & JN(t(0, i)) & ",""lignes"":" & JN(t(1, i)) & ",""ops"":" & JN(t(2, i)) & "}"
    Next i
    SectionHeures = """heures"":[" & s & "]"
    Exit Function
Erreur:
    Noter "lignes par heure", Err.Description
    SectionHeures = ""
End Function

Private Function SectionQuarts() As String
    Dim t As Variant, n As Long, i As Long, s As String
    On Error GoTo Erreur
    If mCn Is Nothing Then Exit Function
    n = Lire(SqlQuarts(), t)
    For i = 0 To n - 1
        If i > 0 Then s = s & ","
        s = s & "{""t"":" & JS(t(0, i)) & ",""lignes"":" & JN(t(1, i)) & "}"
    Next i
    SectionQuarts = """quarts"":[" & s & "]"
    Exit Function
Erreur:
    Noter "rythme recent", Err.Description
    SectionQuarts = ""
End Function

Private Function SectionRejets() As String
    Dim t As Variant, n As Long, i As Long, s As String, total As Double, peses As String
    On Error GoTo Erreur
    If mCn Is Nothing Then Exit Function
    n = Lire(SqlRejetsHeure(), t)
    For i = 0 To n - 1
        If i > 0 Then s = s & ","
        s = s & "{""h"":" & JN(t(0, i)) & ",""n"":" & JN(t(1, i)) & "}"
        total = total + NZ(t(1, i))
    Next i
    peses = "null"
    n = Lire(SqlColisPeses(), t)
    If n > 0 Then
        If NZ(t(0, 0)) > 0 Then peses = JN(t(0, 0))
    End If
    SectionRejets = """rejets"":{""total"":" & JN(total) & ",""pese"":" & peses & ",""parHeure"":[" & s & "],""top"":[" & mCacheTop & "]}"
    Exit Function
Erreur:
    Noter "rejets", Err.Description
    SectionRejets = ""
End Function

Private Function SectionVagues() As String
    Dim t As Variant, n As Long, i As Long, s As String
    On Error GoTo Erreur
    If mCn Is Nothing Then Exit Function
    n = Lire(SqlVagues(), t)
    For i = 0 To n - 1
        If i > 0 Then s = s & ","
        s = s & "{""num"":" & JS(t(0, i)) & ",""heure"":" & JS(t(1, i)) & ",""etat"":" & JS(t(2, i)) & _
            ",""ligPrev"":" & JN(t(3, i)) & ",""ligPrep"":" & JN(t(4, i)) & ",""ligRupt"":" & JN(t(5, i)) & _
            ",""contPrev"":" & JN(t(6, i)) & ",""contSortie"":" & JN(t(7, i)) & "}"
    Next i
    SectionVagues = """vagues"":[" & s & "]"
    Exit Function
Erreur:
    Noter "vagues", Err.Description
    SectionVagues = ""
End Function

Private Function SectionDeparts() As String
    Dim t As Variant, n As Long, i As Long, s As String
    On Error GoTo Erreur
    If mCn Is Nothing Then Exit Function
    n = Lire(SqlDeparts(), t)
    For i = 0 To n - 1
        If i > 0 Then s = s & ","
        s = s & "{""heure"":" & JS(t(0, i)) & ",""transp"":" & JS(t(1, i)) & ",""dest"":" & JS(t(2, i)) & _
            ",""contReel"":" & JN(t(3, i)) & ",""contMax"":" & JN(t(4, i)) & ",""etat"":" & JS(t(5, i)) & "}"
    Next i
    SectionDeparts = """departs"":[" & s & "]"
    Exit Function
Erreur:
    Noter "departs", Err.Description
    SectionDeparts = ""
End Function

' Requetes lourdes : relues toutes les MINUTES_LENT minutes, gardees en memoire entre-temps
Private Sub RafraichirLent()
    Dim p As String
    If mCn Is Nothing Then Exit Sub
    If mCacheLentA <> 0 And (Now - mCacheLentA) * 1440# < MINUTES_LENT Then Exit Sub
    mCacheTop = LentTopRejets()
    p = ""
    AjouterLent p, LentServices()
    If Oui("R_STOCK", True) Then AjouterLent p, LentStock()
    If Oui("R_RETARD", True) Then AjouterLent p, LentRetard()
    If Oui("R_CARNET", True) Then AjouterLent p, LentCarnet()
    mCacheLent = p
    mCacheLentA = Now
End Sub

Private Sub AjouterLent(ByRef p As String, ByVal s As String)
    If Len(s) = 0 Then Exit Sub
    If Len(p) > 0 Then p = p & ","
    p = p & s
End Sub

Private Function LentTopRejets() As String
    Dim t As Variant, n As Long, i As Long, s As String
    On Error GoTo Erreur
    n = Lire(SqlTopRejets(), t)
    For i = 0 To n - 1
        If i > 0 Then s = s & ","
        s = s & "{""art"":" & JS(t(0, i)) & ",""lib"":" & JS(t(1, i)) & ",""n"":" & JN(t(2, i)) & "}"
    Next i
    LentTopRejets = s
    Exit Function
Erreur:
    Noter "articles rejetes", Err.Description
    LentTopRejets = ""
End Function

Private Function LentServices() As String
    Dim t As Variant, n As Long, i As Long, s As String
    On Error GoTo Erreur
    n = Lire(SqlServices(), t)
    For i = 0 To n - 1
        If i > 0 Then s = s & ","
        s = s & "{""code"":" & JS(t(0, i)) & ",""lib"":" & JS(t(0, i)) & ",""fait"":" & JN(t(1, i)) & ",""restant"":" & JN(t(2, i)) & "}"
    Next i
    LentServices = """services"":[" & s & "]"
    Exit Function
Erreur:
    Noter "autres preparations", Err.Description
    LentServices = ""
End Function

Private Function LentStock() As String
    Dim t As Variant, n As Long, alerte As String, critique As String, rupt As String
    On Error GoTo Erreur
    alerte = "null"
    critique = "null"
    rupt = "null"
    n = Lire(SqlReappro(), t)
    If n > 0 Then
        alerte = JN(NZ(t(0, 0)))
        critique = JN(NZ(t(1, 0)))
    End If
    n = Lire(SqlRuptures(), t)
    If n > 0 Then rupt = JN(NZ(t(0, 0)))
    LentStock = """stock"":{""reappro"":" & alerte & ",""critique"":" & critique & ",""ruptures"":" & rupt & "}"
    Exit Function
Erreur:
    Noter "reappro et ruptures", Err.Description
    LentStock = ""
End Function

Private Function LentRetard() As String
    Dim t As Variant, n As Long
    On Error GoTo Erreur
    n = Lire(SqlRetard(), t)
    If n > 0 Then LentRetard = """retard"":{""commandes"":" & JN(NZ(t(0, 0))) & ",""lignes"":" & JN(NZ(t(1, 0))) & "}"
    Exit Function
Erreur:
    Noter "commandes en retard", Err.Description
    LentRetard = ""
End Function

Private Function LentCarnet() As String
    Dim t As Variant, n As Long, i As Long, s As String
    On Error GoTo Erreur
    n = Lire(SqlCarnet(), t)
    For i = 0 To n - 1
        If i > 0 Then s = s & ","
        s = s & "{""date"":" & JS(t(0, i)) & ",""commandes"":" & JN(t(1, i)) & ",""lignes"":" & JN(t(2, i)) & ",""aPreparer"":" & JN(t(3, i)) & "}"
    Next i
    LentCarnet = """carnet"":[" & s & "]"
    Exit Function
Erreur:
    Noter "carnet de commandes", Err.Description
    LentCarnet = ""
End Function

Private Function SectionDivers() As String
    Dim s As String, d As String, v As Variant, jours As String, m As String, i As Long
    jours = "null"
    d = Cfg("DATE_DERNIER_ACCIDENT", "")
    v = Split(d, "/")
    If UBound(v) = 2 Then
        If IsNumeric(v(0)) And IsNumeric(v(1)) And IsNumeric(v(2)) Then
            jours = JN(CLng(Date - DateSerial(CLng(v(2)), CLng(v(1)), CLng(v(0)))))
        End If
    End If
    s = """securite"":{""joursSansAccident"":" & jours & ",""message"":" & JS(Cfg("MESSAGE_SECURITE", "")) & "}"
    m = ""
    For i = 1 To 2
        If Len(Cfg("MESSAGE_" & i, "")) > 0 Then
            If Len(m) > 0 Then m = m & ","
            m = m & JS(Cfg("MESSAGE_" & i, ""))
        End If
    Next i
    SectionDivers = s & ",""messages"":[" & m & "]"
End Function

'==============================================================================
'  ERREURS DECELEES  (classeur Controle des rejets : onglets SAISIE et HISTORIQUE)
'==============================================================================
Private Function SectionDecelees() As String
    Dim chemin As String, t As Variant, n As Long
    chemin = Cfg("FICHIER_REJETS", "")
    If Len(chemin) > 0 Then
        SectionDecelees = DeceleesClasseur(chemin)
        If Len(SectionDecelees) > 0 Then Exit Function
    End If
    ' repli : estimation LOGYS (colis controles avec une quantite trouvee differente de la quantite prevue)
    On Error GoTo Erreur
    If mCn Is Nothing Then Exit Function
    n = Lire(SqlDeceleesLogys(), t)
    If n > 0 Then SectionDecelees = """decelees"":{""total"":" & JN(NZ(t(0, 0))) & ",""types"":{},""allees"":{},""source"":""LOGYS (estimation)""}"
    Exit Function
Erreur:
    Noter "erreurs decelees (LOGYS)", Err.Description
    SectionDecelees = ""
End Function

Private Function DeceleesClasseur(ByVal chemin As String) As String
    Dim wb As Workbook, aFermer As Boolean, ws As Worksheet, v As Variant, i As Long, der As Long
    Dim dTyp As Object, dAll As Object, hTyp As Object, hAll As Object
    Dim total As Long, hTotal As Long, derniere As String, jour As Long, auj As Long, k As String
    On Error GoTo Erreur
    If Len(Dir$(chemin)) = 0 Then
        Noter "controle des rejets", "fichier introuvable : " & chemin
        Exit Function
    End If
    Set dTyp = CreateObject("Scripting.Dictionary")
    Set dAll = CreateObject("Scripting.Dictionary")
    Set hTyp = CreateObject("Scripting.Dictionary")
    Set hAll = CreateObject("Scripting.Dictionary")
    For i = 1 To 6
        dTyp.Add NomType(i), 0
    Next i
    auj = CLng(Date)
    Set wb = OuvrirLecture(chemin, aFermer)

    ' saisie du jour : B date, C heure, D contenant, F type, H emplacement (ligne 7 et suivantes)
    Set ws = Nothing
    On Error Resume Next
    Set ws = wb.Worksheets("SAISIE")
    On Error GoTo Erreur
    If Not ws Is Nothing Then
        der = ws.Cells(ws.Rows.Count, 4).End(xlUp).Row
        If der >= 7 Then
            v = ws.Range(ws.Cells(7, 1), ws.Cells(der, 9)).Value2
            For i = 1 To UBound(v, 1)
                If Len(Trim$(TexteCellule(v(i, 4)))) > 0 Then
                    jour = JourCellule(v(i, 2))
                    If jour = auj Or jour = 0 Then
                        total = total + 1
                        Compter dTyp, TypeErreur(v(i, 6))
                        k = AlleeDe(TexteCellule(v(i, 8)))
                        If Len(k) > 0 Then Compter dAll, k
                        If Len(HeureCellule(v(i, 3))) > 0 Then derniere = HeureCellule(v(i, 3))
                    End If
                End If
            Next i
        End If
    End If

    ' historique : A date, B heure, F type, I allee (ligne 7 et suivantes)
    Set ws = Nothing
    On Error Resume Next
    Set ws = wb.Worksheets("HISTORIQUE")
    On Error GoTo Erreur
    If Not ws Is Nothing Then
        der = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
        If der >= 7 Then
            v = ws.Range(ws.Cells(7, 1), ws.Cells(der, 9)).Value2
            For i = 1 To UBound(v, 1)
                jour = JourCellule(v(i, 1))
                If jour = auj Then
                    total = total + 1
                    Compter dTyp, TypeErreur(v(i, 6))
                    k = AlleeDe(TexteCellule(v(i, 9)))
                    If Len(k) > 0 Then Compter dAll, k
                    If Len(HeureCellule(v(i, 2))) > 0 Then derniere = HeureCellule(v(i, 2))
                ElseIf jour >= auj - 7 And jour < auj Then
                    hTotal = hTotal + 1
                    Compter hTyp, TypeErreur(v(i, 6))
                    k = AlleeDe(TexteCellule(v(i, 9)))
                    If Len(k) > 0 Then Compter hAll, k Else Compter hAll, "?"
                End If
            Next i
        End If
    End If
    If aFermer Then wb.Close SaveChanges:=False

    DeceleesClasseur = """decelees"":{""total"":" & JN(total) & ",""types"":" & DicoJson(dTyp) & ",""allees"":" & DicoJson(dAll) & _
        ",""derniere"":" & JS(derniere) & ",""source"":" & JS("Contr" & ChrW$(244) & "le des rejets") & _
        ",""hist"":{""jours"":7,""total"":" & JN(hTotal) & ",""allees"":" & DicoJson(hAll) & ",""types"":" & DicoJson(hTyp) & "}}"
    Exit Function
Erreur:
    Noter "controle des rejets", Err.Description
    On Error Resume Next
    If aFermer Then
        If Not wb Is Nothing Then wb.Close SaveChanges:=False
    End If
    On Error GoTo 0
    DeceleesClasseur = ""
End Function

' Ouvre un classeur en lecture seule, macros desactivees ; reutilise le classeur s'il est deja ouvert ici
Private Function OuvrirLecture(ByVal chemin As String, ByRef aFermer As Boolean) As Workbook
    Dim wb As Workbook, secu As Long, num As Long, texte As String
    aFermer = False
    For Each wb In Application.Workbooks
        If StrComp(wb.FullName, chemin, vbTextCompare) = 0 Then
            Set OuvrirLecture = wb
            Exit Function
        End If
    Next wb
    secu = Application.AutomationSecurity
    Application.AutomationSecurity = 3          ' aucune macro du classeur lu ne s'execute
    On Error Resume Next
    Set OuvrirLecture = Application.Workbooks.Open(Filename:=chemin, UpdateLinks:=0, ReadOnly:=True, AddToMru:=False)
    num = Err.Number
    texte = Err.Description
    On Error GoTo 0
    Application.AutomationSecurity = secu
    If num <> 0 Then Err.Raise vbObjectError + 513, "OuvrirLecture", "ouverture impossible (" & texte & ")"
    aFermer = True
End Function

Private Function NomType(ByVal k As Long) As String
    Select Case k
        Case 1: NomType = "Manquante"
        Case 2: NomType = "Quantit" & ChrW$(233) & " +"
        Case 3: NomType = "Quantit" & ChrW$(233) & " -"
        Case 4: NomType = "Orientation"
        Case 5: NomType = "R" & ChrW$(233) & "f" & ChrW$(233) & "rence"
        Case 6: NomType = "Casse"
        Case Else: NomType = "Autre"
    End Select
End Function

' Type saisi en chiffre (1 a 6) ou en toutes lettres -> libelle normalise
Private Function TypeErreur(ByVal v As Variant) As String
    Dim s As String
    s = LCase$(Trim$(TexteCellule(v)))
    If Len(s) = 0 Then
        TypeErreur = "Autre"
    ElseIf IsNumeric(s) Then
        TypeErreur = NomType(CLng(Val(s)))
    ElseIf Left$(s, 4) = "manq" Then
        TypeErreur = NomType(1)
    ElseIf Left$(s, 5) = "quant" Or Left$(s, 3) = "qt" & ChrW$(233) Or Left$(s, 3) = "qte" Then
        If InStr(s, "+") > 0 Then TypeErreur = NomType(2) Else TypeErreur = NomType(3)
    ElseIf Left$(s, 6) = "orient" Then
        TypeErreur = NomType(4)
    ElseIf Left$(s, 1) = "r" And InStr(s, "f") > 0 And InStr(s, "f") <= 3 Then
        TypeErreur = NomType(5)
    ElseIf Left$(s, 4) = "cass" Then
        TypeErreur = NomType(6)
    Else
        TypeErreur = "Autre"
    End If
End Function

Private Function TexteCellule(ByVal v As Variant) As String
    If IsError(v) Or IsNull(v) Or IsEmpty(v) Then Exit Function
    TexteCellule = CStr(v)
End Function

' Date d'une cellule (numero de serie ou texte jj/mm/aaaa) -> numero de jour ; 0 si vide ou illisible
Private Function JourCellule(ByVal v As Variant) As Long
    Dim p As Variant
    On Error GoTo Fin
    If IsError(v) Or IsNull(v) Or IsEmpty(v) Then Exit Function
    If IsNumeric(v) Then
        If CDbl(v) > 30000 And CDbl(v) < 80000 Then JourCellule = CLng(Fix(CDbl(v)))
    Else
        p = Split(Trim$(CStr(v)), "/")
        If UBound(p) = 2 Then JourCellule = CLng(DateSerial(CLng(Left$(p(2), 4)), CLng(p(1)), CLng(p(0))))
    End If
Fin:
End Function

' Heure d'une cellule (fraction de jour ou texte) -> "hh:mm"
Private Function HeureCellule(ByVal v As Variant) As String
    Dim x As Double
    On Error GoTo Fin
    If IsError(v) Or IsNull(v) Or IsEmpty(v) Then Exit Function
    If IsNumeric(v) Then
        x = CDbl(v) - Fix(CDbl(v))
        HeureCellule = Format$(Int(x * 24 + 0.0001), "00") & ":" & Format$(Int((x * 24 - Int(x * 24 + 0.0001)) * 60 + 0.5) Mod 60, "00")
    Else
        HeureCellule = Heure(CStr(v))
    End If
Fin:
End Function

' "06-121-05 A" ou "6" -> "06" ; vide si l'allee n'est pas lisible
Private Function AlleeDe(ByVal s As String) As String
    Dim a As String
    s = Trim$(s)
    If Len(s) = 0 Then Exit Function
    a = Left$(s, 2)
    If Len(s) = 1 Then a = "0" & s
    If a Like "#[!0-9]" Then a = "0" & Left$(a, 1)
    If a Like "##" Then AlleeDe = a
End Function

'==============================================================================
'  SUIVI OP  (onglet PROD : une ligne = un operateur x un jour)  +  rejets par jour (LOGYS)
'==============================================================================
Private Function SectionSuiviOp() As String
    If mCacheSuiviA <> 0 And (Now - mCacheSuiviA) * 1440# < MINUTES_SUIVI Then
        SectionSuiviOp = mCacheSuivi
        Exit Function
    End If
    mCacheSuivi = LireSuiviOp()
    mCacheSuiviA = Now
    SectionSuiviOp = mCacheSuivi
End Function

Private Function LireSuiviOp() As String
    Dim chemin As String, wb As Workbook, aFermer As Boolean, ws As Worksheet, v As Variant
    Dim i As Long, k As Long, n As Long, der As Long, nbJ As Long, a As Long, b As Long, tmp As Long
    Dim dJours As Object, dRej As Object, t As Variant
    Dim cle() As Long, lig() As Double, hp() As Double, nbOps() As Double, ed() As Double, ea() As Double, qSom() As Double, qNb() As Double
    Dim ordre() As Long, j As Long, s As String, h As Double, q As Double, jour As Long, debut As Long
    Dim mLig As Double, mEd As Double, mEa As Double, mHp As Double, mQs As Double, mQn As Double, mJ As Long, mRej As Double, mRejN As Long
    Dim moisDeb As Long, dateTxt As String, rej As String
    On Error GoTo Erreur

    ' rejets par jour (LOGYS), pour l'historique et la moyenne du mois
    Set dRej = CreateObject("Scripting.Dictionary")
    If Not mCn Is Nothing Then
        On Error Resume Next
        n = Lire(SqlRejetsJours(), t)
        If Err.Number <> 0 Then
            Noter "rejets par jour", Err.Description
            n = 0
        End If
        On Error GoTo Erreur
        For i = 0 To n - 1
            If Not dRej.Exists(CStr(t(0, i))) Then dRej.Add CStr(t(0, i)), NZ(t(1, i))
        Next i
    End If

    chemin = Cfg("FICHIER_SUIVI_OP", "")
    If Len(chemin) = 0 Then
        If Not FeuilleExiste("PROD") Then Exit Function
        Set wb = ThisWorkbook
    Else
        If Len(Dir$(chemin)) = 0 Then
            Noter "suivi op", "fichier introuvable : " & chemin
            Exit Function
        End If
        Set wb = OuvrirLecture(chemin, aFermer)
    End If
    Set ws = wb.Worksheets("PROD")
    der = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If der < 5 Then
        If aFermer Then wb.Close SaveChanges:=False
        Exit Function
    End If
    ' A date, D heures, E h. hors pick, F lignes, L err. decelee, M err. averee, N quota %, Z doublon, AB soumis quota
    v = ws.Range(ws.Cells(5, 1), ws.Cells(der, 28)).Value2
    If aFermer Then wb.Close SaveChanges:=False
    aFermer = False

    Set dJours = CreateObject("Scripting.Dictionary")
    n = UBound(v, 1)
    ReDim cle(1 To n): ReDim lig(1 To n): ReDim hp(1 To n): ReDim nbOps(1 To n)
    ReDim ed(1 To n): ReDim ea(1 To n): ReDim qSom(1 To n): ReDim qNb(1 To n)
    debut = CLng(Date) - 70
    For i = 1 To n
        jour = JourCellule(v(i, 1))
        If jour >= debut And jour < CLng(Date) And NZ(v(i, 26)) = 0 Then
            If dJours.Exists(jour) Then
                k = dJours(jour)
            Else
                nbJ = nbJ + 1
                k = nbJ
                dJours.Add jour, k
                cle(k) = jour
            End If
            h = NZ(v(i, 4)) - NZ(v(i, 5))
            If h < 0 Then h = 0
            lig(k) = lig(k) + NZ(v(i, 6))
            hp(k) = hp(k) + h
            If NZ(v(i, 6)) > 0 Then nbOps(k) = nbOps(k) + 1
            ed(k) = ed(k) + NZ(v(i, 12))
            ea(k) = ea(k) + NZ(v(i, 13))
            q = NZ(v(i, 14))
            If q > 0 And h >= 2 And UCase$(Trim$(TexteCellule(v(i, 28)))) <> "NON" Then
                qSom(k) = qSom(k) + q
                qNb(k) = qNb(k) + 1
            End If
        End If
    Next i
    If nbJ = 0 Then Exit Function

    ' tri des jours par date croissante (peu de jours : tri par insertion)
    ReDim ordre(1 To nbJ)
    For i = 1 To nbJ
        ordre(i) = i
    Next i
    For a = 2 To nbJ
        tmp = ordre(a)
        b = a - 1
        Do While b >= 1
            If cle(ordre(b)) <= cle(tmp) Then Exit Do
            ordre(b + 1) = ordre(b)
            b = b - 1
        Loop
        ordre(b + 1) = tmp
    Next a

    moisDeb = CLng(DateSerial(Year(Date), Month(Date), 1))
    For j = 1 To nbJ
        k = ordre(j)
        dateTxt = Format$(CDate(cle(k)), "yyyy-mm-dd")
        rej = "null"
        If dRej.Exists(dateTxt) Then rej = JN(dRej(dateTxt))
        If cle(k) >= moisDeb Then
            mJ = mJ + 1
            mLig = mLig + lig(k): mEd = mEd + ed(k): mEa = mEa + ea(k): mHp = mHp + hp(k)
            mQs = mQs + qSom(k): mQn = mQn + qNb(k)
            If dRej.Exists(dateTxt) Then
                mRej = mRej + dRej(dateTxt)
                mRejN = mRejN + 1
            End If
        End If
        If j > nbJ - 30 Then
            If Len(s) > 0 Then s = s & ","
            s = s & "{""d"":""" & dateTxt & """,""lignes"":" & JN(lig(k)) & ",""hPick"":" & JN(Round(hp(k), 1)) & ",""ops"":" & JN(nbOps(k)) & _
                ",""ed"":" & JN(ed(k)) & ",""ea"":" & JN(ea(k)) & ",""rejets"":" & rej
            If qNb(k) > 0 Then s = s & ",""quota"":" & JN(Round(qSom(k) / qNb(k), 1))
            s = s & "}"
        End If
    Next j
    LireSuiviOp = """historique"":[" & s & "]"
    If mJ > 0 And mLig > 0 Then
        LireSuiviOp = LireSuiviOp & ",""mois"":{""lignes"":" & JN(mLig) & ",""jours"":" & JN(mJ) & ",""ed"":" & JN(mEd) & ",""ea"":" & JN(mEa) & _
            ",""hPick"":" & JN(Round(mHp, 1))
        If mQn > 0 Then LireSuiviOp = LireSuiviOp & ",""quota"":" & JN(Round(mQs / mQn, 1))
        If mRejN > 0 Then LireSuiviOp = LireSuiviOp & ",""rejetsJour"":" & JN(Round(mRej / mRejN, 0))
        LireSuiviOp = LireSuiviOp & "}"
    End If
    Exit Function
Erreur:
    Noter "suivi op", Err.Description
    On Error Resume Next
    If aFermer Then
        If Not wb Is Nothing Then wb.Close SaveChanges:=False
    End If
    On Error GoTo 0
    LireSuiviOp = ""
End Function

'==============================================================================
'  ECRITURE DU FICHIER  (dans un fichier temporaire, puis renomme : la page ne lit jamais un fichier a moitie ecrit)
'==============================================================================
Private Sub EcrireFichier(ByVal json As String)
    Dim cible As String, tmp As String, f As Integer
    cible = CheminFichier()
    tmp = cible & ".tmp"
    f = FreeFile
    Open tmp For Output As #f
    Print #f, "window.PP_DATA=" & json & ";"
    Close #f
    On Error Resume Next
    Kill cible
    On Error GoTo 0
    Name tmp As cible
End Sub

'==============================================================================
'  REQUETES LOGYS  (generees ; le detail commente est dans requetes_pilotage.sql)
'==============================================================================
'@@SQL@@
