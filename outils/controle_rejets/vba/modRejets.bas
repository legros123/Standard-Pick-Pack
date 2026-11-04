Option Explicit
' ==========================================================================
'  CONTRÔLE DES REJETS v4 · Pick & Pack (sans base Oracle)
'
'  SAISIE           on scanne le contenant : date et heure se mettent seules.
'                   Type (liste ou 1 à 6) ; si Orientation, la case « 2e colis »
'                   s'allume : 2 colis, 1 seule erreur. Puis réf, emplacement
'                   précis (06-121-05 A, lettre A à H),
'                   opérateur (liste ou matricule), commentaire.
'  HISTORIQUE       chaque début de journée, la veille y est rangée (T_REJETS).
'                   Case RECHERCHE : filtre sur contenant, réf, opérateur...
'  SYNTHESE         1 ligne par opérateur et par jour (T_SYNTHESE) : source
'                   pour le Suivi Op (erreurs décelées) et le dashboard.
'  TABLEAU DE BORD  formules ; le top des références est calculé ici.
'  REGLAGES         seuils, types, allées, actions.
'
'  Le fichier marche sans macros (listes, couleurs, tableau de bord) ; les
'  macros ajoutent l'horodatage, l'archivage et les raccourcis de saisie.
' ==========================================================================

' ---- feuilles et tableaux
Private Const SH_SAISIE As String = "SAISIE"
Private Const SH_TDB As String = "TABLEAU DE BORD"
Private Const SH_HISTO As String = "HISTORIQUE"
Private Const SH_SYNTH As String = "SYNTHESE"
Private Const SH_OPE As String = "OPERATEURS"
Private Const SH_REG As String = "REGLAGES"
Private Const SH_CALC As String = "CALC"
Private Const T_REJETS As String = "T_REJETS"
Private Const T_SYNTH As String = "T_SYNTHESE"
Private Const T_OPE As String = "T_OPE"

' ---- SAISIE : lignes et colonnes
Private Const L1 As Long = 7
Private Const LN As Long = 306
Private Const cJOUR As Long = 2
Private Const cHEURE As Long = 3
Private Const cCONT As Long = 4
Private Const cCONT2 As Long = 5
Private Const cTYPE As Long = 6
Private Const cREF As Long = 7
Private Const cEMP As Long = 8
Private Const cOPE As Long = 9
Private Const cCOM As Long = 10
Private Const cMAT As Long = 12
Private Const cUSER As Long = 13
Private Const NCS As Long = 13
Private Const MSG_CELL As String = "A4"

' ---- HISTORIQUE
Private Const RECH_CELL As String = "C4"
Private Const RECH_INFO As String = "K4"
' colonnes de T_REJETS (ordre fixe)
Private Const hDATE As Long = 1
Private Const hHEURE As Long = 2
Private Const hCONT As Long = 3
Private Const hCONT2 As Long = 4
Private Const hCOLIS As Long = 5
Private Const hTYPE As Long = 6
Private Const hREF As Long = 7
Private Const hEMP As Long = 8
Private Const hALLEE As Long = 9
Private Const hOPE As Long = 10
Private Const hMAT As Long = 11
Private Const hCOM As Long = 12
Private Const hANNEE As Long = 13
Private Const hMOIS As Long = 14
Private Const hSEM As Long = 15
Private Const hJOUR As Long = 16
Private Const hTRANCHE As Long = 17
Private Const hUSER As Long = 18
Private Const hSRC As Long = 19
Private Const hID As Long = 20
Private Const NH As Long = 20

' ---- T_SYNTHESE : Date, Opérateur, Matricule, Erreurs, Colis, 6 types, Autre, Année, Mois, Semaine
Private Const NSY As Long = 15
Private Const NT6 As Long = 6
Private Const MAXTYPES As Long = 8

' ---- CALC : listes déroulantes reconstruites
Private Const LISTE_OPE As String = "F2"
Private Const LISTE_FILTRE As String = "G2"
Private Const LISTE_MAX As Long = 200

' ---- Excel (liaison tardive)
Private Const XL_FILTER_VALUES As Long = 7
Private Const XL_NONE As Long = -4142

Private occupe As Boolean
Private aSauver As Boolean
Private ligneRedirigee As Long
Private prochainMinuit As Date
Private tNom(1 To MAXTYPES) As String
Private tCourt(1 To MAXTYPES) As String
Private nbTypes As Long
Private typeDeux As String

' ==========================================================================
'  FEUILLES
' ==========================================================================
Private Function wsS() As Worksheet
    Set wsS = ThisWorkbook.Worksheets(SH_SAISIE)
End Function
Private Function wsH() As Worksheet
    Set wsH = ThisWorkbook.Worksheets(SH_HISTO)
End Function
Private Function wsT() As Worksheet
    Set wsT = ThisWorkbook.Worksheets(SH_TDB)
End Function
Private Function wsR() As Worksheet
    Set wsR = ThisWorkbook.Worksheets(SH_REG)
End Function
Private Function loH() As ListObject
    Set loH = wsH().ListObjects(T_REJETS)
End Function
Private Function Nom(ByVal n As String) As Range
    Set Nom = ThisWorkbook.Names(n).RefersToRange
End Function

' ==========================================================================
'  OUVERTURE, FERMETURE, ENREGISTREMENT, MINUIT
' ==========================================================================
Public Sub Ouverture()
    Dim r As Long
    On Error GoTo Erreur
    occupe = True
    Application.EnableEvents = False
    ParamSet "MACROS", Jour0()
    ProtegerFeuilles
    ChargerTypes
    If NouveauJour() Then ArchiverAvant Jour0()
    ReconstruireListes
    RetablirMessage
    ProgrammerMinuit
    wsS().Activate
    r = PremiereLigneLibre(L1)
    If r = 0 Then r = LN
    wsS().Cells(r, cCONT).Select
Sortie:
    Application.EnableEvents = True
    occupe = False
    Exit Sub
Erreur:
    Info "Ouverture : " & Err.Description, 2
    Resume Sortie
End Sub

Public Sub AvantEnregistrement()
    RetablirMessage
End Sub

Public Sub Fermeture()
    On Error Resume Next      ' rien ne doit bloquer la fermeture
    If prochainMinuit > 0 Then Application.OnTime prochainMinuit, NomMacro("Minuit"), , False
    prochainMinuit = 0
End Sub

' Fichier resté ouvert la nuit : la journée part dans HISTORIQUE à 0 h 01.
Public Sub Minuit()
    prochainMinuit = 0
    ParamSet "MACROS", Jour0()
    ControleJour
    ProgrammerMinuit
End Sub

Private Sub ProgrammerMinuit()
    If prochainMinuit > 0 Then Exit Sub
    prochainMinuit = Jour0() + 1 + TimeSerial(0, 1, 0)
    On Error Resume Next
    Application.OnTime prochainMinuit, NomMacro("Minuit")
    If Err.Number <> 0 Then prochainMinuit = 0
    On Error GoTo 0
End Sub

Private Function NomMacro(ByVal n As String) As String
    NomMacro = "'" & ThisWorkbook.Name & "'!modRejets." & n
End Function

' Activation de SAISIE ou minuit : si la journée a changé, on range la veille.
Public Sub ControleJour()
    If occupe Then Exit Sub
    If Not NouveauJour() Then Exit Sub
    occupe = True
    On Error GoTo Erreur
    Application.EnableEvents = False
    ChargerTypes
    ArchiverAvant Jour0()
Sortie:
    Application.EnableEvents = True
    occupe = False
    Exit Sub
Erreur:
    Info "Archivage : " & Err.Description, 2
    Resume Sortie
End Sub

Private Function NouveauJour() As Boolean
    Dim j As Variant
    j = EnDate(Param("JOUR_SAISIE", ""))
    If IsEmpty(j) Then NouveauJour = True: Exit Function
    NouveauJour = (Int(CDbl(j)) < CDbl(Jour0()))
End Function

Private Sub ProtegerFeuilles()
    ' UserInterfaceOnly : l'utilisateur ne casse pas l'en-tête, les macros écrivent librement
    On Error Resume Next
    wsS().Protect UserInterfaceOnly:=True, AllowFormattingColumns:=True, AllowFormattingRows:=True
    wsT().Protect UserInterfaceOnly:=True, AllowFormattingColumns:=True, AllowFormattingRows:=True
    On Error GoTo 0
End Sub

' ==========================================================================
'  SAISIE : événements
' ==========================================================================
Public Sub SurChangementSaisie(ByVal Target As Range)
    Dim ws As Worksheet, zone As Range, c As Range, calcPrev As Long
    Dim v As String, lig As Long, colEdit As Long, etaitComplete As Boolean
    If occupe Then Exit Sub
    Set ws = Target.Worksheet
    Set zone = Application.Intersect(Target, ws.Range(ws.Cells(L1, cJOUR), ws.Cells(LN, cCOM)))
    If zone Is Nothing Then Exit Sub
    If zone.Cells.CountLarge > 200 Then Exit Sub   ' collage ou effacement massif : on laisse faire
    occupe = True
    aSauver = False
    ligneRedirigee = 0
    calcPrev = Application.Calculation
    On Error GoTo Erreur
    Application.EnableEvents = False
    Application.ScreenUpdating = False
    ChargerTypes

    If NouveauJour() Then
        ' la saisie d'hier part d'abord dans HISTORIQUE ; on retrouve ensuite le colis scanné
        If zone.Cells.CountLarge = 1 Then
            v = NettoyerScan(Texte(zone.Value))
            colEdit = zone.Column
            If colEdit = cCONT And v <> "" And Texte(ws.Cells(zone.Row, cJOUR).Value) = "" Then Horodater ws, zone.Row
        End If
        ArchiverAvant Jour0()
        If colEdit = cCONT And v <> "" Then
            lig = DerniereLigneContenant(ws, v)
            If lig = 0 Then GoTo Sortie
            Set zone = ws.Cells(lig, cCONT)
        Else
            GoTo Sortie
        End If
    End If

    Application.Calculation = -4135      ' manuel pendant le traitement
    If zone.Cells.CountLarge = 1 Then etaitComplete = LigneComplete(ws, zone.Row)
    For Each c In zone.Cells
        If Not Rediriger(ws, c) Then
            Select Case c.Column
                Case cCONT: TraiterContenant ws, c.Row
                Case cCONT2: TraiterContenant2 ws, c.Row
                Case cTYPE: TraiterType ws, c.Row
                Case cREF: TraiterRef ws, c.Row
                Case cEMP: TraiterEmplacement ws, c.Row
                Case cOPE: TraiterOperateur ws, c.Row
                Case cCOM: If Texte(ws.Cells(c.Row, cCONT).Value) <> "" Then Horodater ws, c.Row
            End Select
        End If
    Next c
    If zone.Cells.CountLarge = 1 Then
        If Not etaitComplete And LigneComplete(ws, zone.Row) Then aSauver = True
        Suivant ws, zone.Row
    End If
Sortie:
    Application.Calculation = calcPrev
    Application.ScreenUpdating = True
    Application.EnableEvents = True
    occupe = False
    If aSauver Then Sauver
    Exit Sub
Erreur:
    Info "Erreur macro : " & Err.Description, 2
    Resume Sortie
End Sub

' ==========================================================================
'  SAISIE : traitement d'une case
' ==========================================================================
Private Sub TraiterContenant(ByVal ws As Worksheet, ByVal lig As Long)
    Dim brut As String, cont As String, autre As Long
    brut = Texte(ws.Cells(lig, cCONT).Value)
    cont = NettoyerScan(brut)
    If cont = "" Then
        If LigneVide(ws, lig) Then
            ws.Range(ws.Cells(lig, cJOUR), ws.Cells(lig, cHEURE)).ClearContents
            ws.Range(ws.Cells(lig, cMAT), ws.Cells(lig, cUSER)).ClearContents
            Info "Ligne vidée.", 3
        End If
        Exit Sub
    End If
    If cont <> brut Then ws.Cells(lig, cCONT).Value = cont
    Horodater ws, lig
    autre = AutreLigneContenant(ws, lig, cont)
    If autre > 0 Then
        Info ChrW(9888) & "  " & cont & " est déjà saisi à " & HHMM(ws.Cells(autre, cHEURE).Value) & _
             " (ligne " & (autre - L1 + 1) & ") : 2e erreur sur ce colis ? Sinon vider la ligne.     " & _
             Fleche() & "TYPE : " & TypesCourts(), 1
    Else
        Info ChrW(10004) & "  Contenant " & cont & " · " & HHMM(ws.Cells(lig, cHEURE).Value) & "     " & _
             Fleche() & "TYPE : " & TypesCourts(), 0
    End If
End Sub

Private Sub TraiterContenant2(ByVal ws As Worksheet, ByVal lig As Long)
    Dim brut As String, c2 As String, c1 As String, t As String
    brut = Texte(ws.Cells(lig, cCONT2).Value)
    c2 = NettoyerScan(brut)
    If c2 <> brut Then ws.Cells(lig, cCONT2).Value = Vide(c2)
    If c2 = "" Then Exit Sub
    c1 = Texte(ws.Cells(lig, cCONT).Value)
    If c1 = "" Then
        ws.Cells(lig, cCONT2).ClearContents
        Info ChrW(9888) & "  Scanner d'abord le 1er colis dans la colonne CONTENANT.", 1
        Exit Sub
    End If
    If MemeCont(c1, c2) Then
        ws.Cells(lig, cCONT2).ClearContents
        Info ChrW(9888) & "  C'est le même colis : scanner l'AUTRE colis concerné.", 1
        Exit Sub
    End If
    t = Texte(ws.Cells(lig, cTYPE).Value)
    If t = "" And typeDeux <> "" Then
        ws.Cells(lig, cTYPE).Value = typeDeux      ' un 2e colis scanné = orientation
        t = typeDeux
    End If
    Horodater ws, lig
    If Not EstDeuxColis(t) Then
        Info ChrW(9888) & "  2e colis noté, mais le type n'est pas « " & typeDeux & " » : vérifier le type.", 1
    Else
        Info ChrW(10004) & "  2e colis " & c2 & " · 2 colis, 1 seule erreur     " & Fleche() & "RÉFÉRENCE concernée", 0
    End If
End Sub

Private Sub TraiterType(ByVal ws As Worksheet, ByVal lig As Long)
    Dim s As String, t As String
    s = Trim$(Texte(ws.Cells(lig, cTYPE).Value))
    If s = "" Then Exit Sub
    t = TypeDepuisSaisie(s)
    If t = "" Then
        Info ChrW(9888) & "  « " & s & " » : type inconnu. Taper un n° : " & TypesCourts(), 2
        Exit Sub
    End If
    If t <> s Then ws.Cells(lig, cTYPE).Value = t
    If Texte(ws.Cells(lig, cCONT).Value) <> "" Then Horodater ws, lig
    If EstDeuxColis(t) Then
        If Texte(ws.Cells(lig, cCONT2).Value) = "" Then
            Info Fleche() & UCase$(t) & " : scanner l'AUTRE colis dans la case jaune « 2e colis » (2 colis, 1 seule erreur)", 3
        Else
            Info ChrW(10004) & "  " & t & "     " & Fleche() & "RÉFÉRENCE concernée", 0
        End If
    Else
        If Texte(ws.Cells(lig, cCONT2).Value) <> "" Then
            ws.Cells(lig, cCONT2).ClearContents
            Info ChrW(10004) & "  " & t & " · 2e colis retiré (réservé à « " & typeDeux & " »)     " & Fleche() & "RÉFÉRENCE concernée", 1
        Else
            Info ChrW(10004) & "  " & t & "     " & Fleche() & "RÉFÉRENCE concernée (taper ou scanner)", 0
        End If
    End If
End Sub

Private Sub TraiterRef(ByVal ws As Worksheet, ByVal lig As Long)
    Dim brut As String, ref As String
    brut = Texte(ws.Cells(lig, cREF).Value)
    ref = NettoyerScan(brut)
    If ref <> brut Then ws.Cells(lig, cREF).Value = Vide(ref)
    If ref = "" Then Exit Sub
    If Texte(ws.Cells(lig, cCONT).Value) <> "" Then Horodater ws, lig
    Info ChrW(10004) & "  Réf " & ref & "     " & Fleche() & "EMPLACEMENT (ex. 06-121-05 A ou 0612105a)", 0
End Sub

Private Sub TraiterEmplacement(ByVal ws As Worksheet, ByVal lig As Long)
    Dim brut As String, e As String, a As String
    brut = Trim$(Texte(ws.Cells(lig, cEMP).Value))
    If brut = "" Then Exit Sub
    e = NormaliserEmplacement(brut)
    If Texte(ws.Cells(lig, cCONT).Value) <> "" Then Horodater ws, lig
    If e = "" Then
        If UCase$(brut) <> brut Then ws.Cells(lig, cEMP).Value = UCase$(brut)
        Info ChrW(9888) & "  « " & UCase$(brut) & " » : emplacement attendu 06-121-05 A (2-3-2 chiffres + lettre A à H). " & _
             "Taper 0612105a suffit.", 2
        Exit Sub
    End If
    If e <> brut Then ws.Cells(lig, cEMP).Value = e
    a = Left$(e, 2)
    If Not DansListe("L_ALLEES", a) Then
        Info ChrW(9888) & "  " & e & " : allée " & a & " absente de la liste (REGLAGES), gardé tel quel.     " & _
             Fleche() & "OPÉRATEUR", 1
    Else
        Info ChrW(10004) & "  Emplacement " & e & " · allée " & a & "     " & Fleche() & "OPÉRATEUR (liste ou matricule)", 0
    End If
End Sub

Private Sub TraiterOperateur(ByVal ws As Worksheet, ByVal lig As Long)
    Dim s As String, nomOp As String, mat As String, actif As Boolean
    s = Trim$(Texte(ws.Cells(lig, cOPE).Value))
    If s = "" Then
        ws.Cells(lig, cMAT).ClearContents
        Exit Sub
    End If
    If TrouverOperateur(s, nomOp, mat, actif) Then
        If nomOp <> s Then ws.Cells(lig, cOPE).Value = nomOp
        ws.Cells(lig, cMAT).NumberFormat = "@"
        ws.Cells(lig, cMAT).Value = Vide(mat)
        If Texte(ws.Cells(lig, cCONT).Value) <> "" Then Horodater ws, lig
        If Not actif Then
            Info ChrW(9888) & "  " & nomOp & " est marqué inactif (OPERATEURS) : erreur enregistrée quand même.", 1
        ElseIf LigneComplete(ws, lig) Then
            Info ChrW(10004) & "  Ligne complète · " & nomOp & "     " & Fleche() & "Scanner le contenant suivant (commentaire : cliquer la case)", 0
        Else
            InviteSuite ws, lig
        End If
    Else
        ws.Cells(lig, cMAT).ClearContents
        Info ChrW(9888) & "  « " & s & " » : opérateur inconnu. Choisir dans la liste, taper un matricule, ou l'ajouter dans OPERATEURS.", 2
    End If
End Sub

' Un n° de contenant scanné dans Type / Allée / Opérateur / Commentaire part sur la ligne suivante.
Private Function Rediriger(ByVal ws As Worksheet, ByVal c As Range) As Boolean
    Dim s As String, lig As Long, r As Long
    Select Case c.Column
        Case cTYPE, cEMP, cOPE, cCOM
        Case Else: Exit Function
    End Select
    s = NettoyerScan(Texte(c.Value))
    If Not EstContenant(s) Then Exit Function
    lig = c.Row
    c.ClearContents
    If Texte(ws.Cells(lig, cCONT).Value) = "" Then r = lig Else r = PremiereLigneLibre(lig + 1)
    If r = 0 Then
        Info ChrW(9888) & "  Plus de ligne libre dans SAISIE.", 2
        Rediriger = True
        Exit Function
    End If
    ws.Cells(r, cCONT).NumberFormat = "@"
    ws.Cells(r, cCONT).Value = s
    TraiterContenant ws, r
    ligneRedirigee = r
    Rediriger = True
End Function

Private Sub Horodater(ByVal ws As Worksheet, ByVal lig As Long)
    If Texte(ws.Cells(lig, cJOUR).Value) <> "" Then Exit Sub
    ws.Cells(lig, cJOUR).Value = Jour0()
    ws.Cells(lig, cHEURE).Value = CDbl(Now) - Int(CDbl(Now))
    ws.Cells(lig, cUSER).Value = Vide(Utilisateur())
End Sub

' Curseur : case suivante à remplir, sinon contenant suivant.
Private Sub Suivant(ByVal ws As Worksheet, ByVal lig As Long)
    Dim cible As Long, r As Long
    r = lig
    If ligneRedirigee > 0 Then r = ligneRedirigee
    If Not Oui("NAV_AUTO") Then Exit Sub
    If ActiveSheet.Name <> ws.Name Then Exit Sub
    If Texte(ws.Cells(r, cCONT).Value) = "" Then Exit Sub
    cible = ProchaineCase(ws, r)
    If cible = 0 Then
        r = PremiereLigneLibre(r + 1)
        If r > 0 Then ws.Cells(r, cCONT).Select
    Else
        ws.Cells(r, cible).Select
    End If
End Sub

Private Function ProchaineCase(ByVal ws As Worksheet, ByVal lig As Long) As Long
    Dim t As String
    t = Texte(ws.Cells(lig, cTYPE).Value)
    If t = "" Then ProchaineCase = cTYPE: Exit Function
    If EstDeuxColis(t) And Texte(ws.Cells(lig, cCONT2).Value) = "" Then ProchaineCase = cCONT2: Exit Function
    If Texte(ws.Cells(lig, cREF).Value) = "" Then ProchaineCase = cREF: Exit Function
    If Not EmplacementOk(Texte(ws.Cells(lig, cEMP).Value)) Then ProchaineCase = cEMP: Exit Function
    If Texte(ws.Cells(lig, cOPE).Value) = "" Then ProchaineCase = cOPE: Exit Function
End Function

Private Sub InviteSuite(ByVal ws As Worksheet, ByVal lig As Long)
    Select Case ProchaineCase(ws, lig)
        Case cTYPE: Info Fleche() & "TYPE : " & TypesCourts(), 3
        Case cCONT2: Info Fleche() & "Scanner l'AUTRE colis (case jaune « 2e colis »)", 3
        Case cREF: Info Fleche() & "RÉFÉRENCE concernée (taper ou scanner)", 3
        Case cEMP: Info Fleche() & "EMPLACEMENT : 06-121-05 A (lettre A à H)", 3
        Case cOPE: Info Fleche() & "OPÉRATEUR (liste ou matricule)", 3
        Case Else: Info ChrW(10004) & "  Ligne complète     " & Fleche() & "Scanner le contenant suivant", 0
    End Select
End Sub

Private Function LigneComplete(ByVal ws As Worksheet, ByVal lig As Long) As Boolean
    If Texte(ws.Cells(lig, cCONT).Value) = "" Then Exit Function
    LigneComplete = (ProchaineCase(ws, lig) = 0)
End Function

Private Function LigneVide(ByVal ws As Worksheet, ByVal lig As Long) As Boolean
    Dim j As Long
    For j = cCONT To cCOM
        If Texte(ws.Cells(lig, j).Value) <> "" Then Exit Function
    Next j
    LigneVide = True
End Function

' 1re ligne sans contenant, type, réf ni opérateur à partir de « depuis » (0 si plus de place).
Private Function PremiereLigneLibre(ByVal depuis As Long) As Long
    Dim ws As Worksheet, v As Variant, i As Long
    Set ws = wsS()
    If depuis < L1 Then depuis = L1
    If depuis > LN Then Exit Function
    v = ws.Range(ws.Cells(depuis, cCONT), ws.Cells(LN, cOPE)).Value
    For i = 1 To UBound(v, 1)
        If Texte(v(i, 1)) = "" And Texte(v(i, 3)) = "" And Texte(v(i, 4)) = "" And Texte(v(i, 6)) = "" Then
            PremiereLigneLibre = depuis + i - 1
            Exit Function
        End If
    Next i
End Function

Private Function AutreLigneContenant(ByVal ws As Worksheet, ByVal lig As Long, ByVal cont As String) As Long
    Dim v As Variant, i As Long
    v = ws.Range(ws.Cells(L1, cCONT), ws.Cells(LN, cCONT2)).Value
    For i = 1 To UBound(v, 1)
        If L1 + i - 1 <> lig Then
            If MemeCont(Texte(v(i, 1)), cont) Or MemeCont(Texte(v(i, 2)), cont) Then
                AutreLigneContenant = L1 + i - 1
                Exit Function
            End If
        End If
    Next i
End Function

Private Function DerniereLigneContenant(ByVal ws As Worksheet, ByVal cont As String) As Long
    Dim v As Variant, i As Long
    v = ws.Range(ws.Cells(L1, cCONT), ws.Cells(LN, cCONT)).Value
    For i = UBound(v, 1) To 1 Step -1
        If MemeCont(Texte(v(i, 1)), cont) Then DerniereLigneContenant = L1 + i - 1: Exit Function
    Next i
End Function

Private Sub Sauver()
    If Not PeutSauver() Then Exit Sub
    RetablirMessage
    On Error Resume Next
    ThisWorkbook.Save
    On Error GoTo 0
End Sub

' Enregistrement automatique : jamais en lecture seule ni sur un fichier jamais enregistré.
Private Function PeutSauver() As Boolean
    If Not Oui("SAUVE_AUTO") Then Exit Function
    If ThisWorkbook.ReadOnly Then Exit Function
    If ThisWorkbook.Path = "" Then Exit Function
    PeutSauver = True
End Function

' ==========================================================================
'  ARCHIVAGE : SAISIE -> HISTORIQUE (T_REJETS)
' ==========================================================================
Public Function ArchiverAvant(ByVal jour As Date) As Long
    Dim ws As Worksheet, v As Variant, i As Long, j As Long, n As Long, ng As Long, nbl As Long
    Dim js As Variant, d As Double, dmin As Double, dmax As Double, txt As String
    Dim out() As Variant, garde() As Variant, prochainId As Long
    ChargerTypes
    Set ws = wsS()
    v = ws.Range(ws.Cells(L1, 1), ws.Cells(LN, NCS)).Value
    js = EnDate(Param("JOUR_SAISIE", ""))
    nbl = UBound(v, 1)
    For i = 1 To nbl
        If LigneRemplie(v, i) Then
            If JourLigne(v, i, js, jour) < CDbl(jour) Then n = n + 1 Else ng = ng + 1
        End If
    Next i
    ParamSet "JOUR_SAISIE", jour
    If n = 0 Then Exit Function

    ReDim out(1 To n, 1 To NH)
    If ng > 0 Then ReDim garde(1 To ng, 1 To NCS)
    prochainId = CLng(Val(Texte(Param("DERNIER_ID", 0)))) + 1
    n = 0: ng = 0: dmin = 1E+30: dmax = 0
    For i = 1 To nbl
        If LigneRemplie(v, i) Then
            d = JourLigne(v, i, js, jour)
            If d < CDbl(jour) Then
                n = n + 1
                VersHisto v, i, d, out, n, prochainId
                prochainId = prochainId + 1
                If d < dmin Then dmin = d
                If d > dmax Then dmax = d
            Else
                ng = ng + 1
                For j = 1 To NCS: garde(ng, j) = v(i, j): Next j
            End If
        End If
    Next i

    AjouterHisto out, n
    ParamSet "DERNIER_ID", prochainId - 1

    ' SAISIE : on vide les cases de saisie (pas les formules #, Statut) puis on remet la journée en cours
    ws.Range(ws.Cells(L1, cJOUR), ws.Cells(LN, cCOM)).ClearContents
    ws.Range(ws.Cells(L1, cMAT), ws.Cells(LN, cUSER)).ClearContents
    If ng > 0 Then
        For i = 1 To ng
            For j = cJOUR To cCOM
                ws.Cells(L1 + i - 1, j).Value = garde(i, j)
            Next j
            ws.Cells(L1 + i - 1, cMAT).Value = garde(i, cMAT)
            ws.Cells(L1 + i - 1, cUSER).Value = garde(i, cUSER)
        Next i
    End If

    ReconstruireSynthese
    If Oui("EXPORT_CSV") Then ExporterCSV True
    ParamSet "DERNIER_ARCHIVAGE", Format$(Now, "dd/mm/yyyy") & " " & HHMM(Now) & " : " & n & " ligne(s)"
    If dmin = dmax Then
        txt = "du " & Format$(CDate(dmin), "dd/mm")
    Else
        txt = "du " & Format$(CDate(dmin), "dd/mm") & " au " & Format$(CDate(dmax), "dd/mm")
    End If
    Info ChrW(10004) & "  Nouvelle journée : " & n & " erreur(s) " & txt & " rangée(s) dans HISTORIQUE.     " & _
         Fleche() & "Scanner un contenant", 0
    ArchiverAvant = n
    If PeutSauver() Then
        On Error Resume Next
        ThisWorkbook.Save
        On Error GoTo 0
    End If
End Function

Private Function LigneRemplie(v As Variant, ByVal i As Long) As Boolean
    LigneRemplie = (Texte(v(i, cCONT)) <> "" Or Texte(v(i, cTYPE)) <> "" Or Texte(v(i, cREF)) <> "" _
                    Or Texte(v(i, cOPE)) <> "")
End Function

' Jour d'une ligne : sa date, sinon la journée affichée (saisie sans macros), sinon aujourd'hui.
Private Function JourLigne(v As Variant, ByVal i As Long, js As Variant, ByVal jour As Date) As Double
    Dim d As Variant
    d = EnDate(v(i, cJOUR))
    If IsEmpty(d) Then
        If Not IsEmpty(js) Then
            If CDbl(js) < CDbl(jour) Then d = js
        End If
    End If
    If IsEmpty(d) Then d = jour
    JourLigne = Int(CDbl(d))
End Function

Private Sub VersHisto(v As Variant, ByVal i As Long, ByVal d As Double, out() As Variant, _
                      ByVal n As Long, ByVal id As Long)
    Dim h As Double, c2 As String, ope As String, mat As String, nomOp As String, actif As Boolean
    Dim cal As Variant, j As Long
    h = Fraction(v(i, cHEURE))
    c2 = Texte(v(i, cCONT2))
    ope = Texte(v(i, cOPE))
    mat = Texte(v(i, cMAT))
    If mat = "" And ope <> "" Then
        If TrouverOperateur(ope, nomOp, mat, actif) Then ope = nomOp
    End If
    out(n, hDATE) = CDate(d)
    If h > 0 Then out(n, hHEURE) = h
    out(n, hCONT) = Vide(Texte(v(i, cCONT)))
    out(n, hCONT2) = Vide(c2)
    out(n, hCOLIS) = IIf(c2 <> "", 2, 1)
    out(n, hTYPE) = Vide(Texte(v(i, cTYPE)))
    out(n, hREF) = Vide(Texte(v(i, cREF)))
    out(n, hEMP) = Vide(Texte(v(i, cEMP)))
    out(n, hALLEE) = Vide(AlleeDepuisTexte(Texte(v(i, cEMP))))
    out(n, hOPE) = Vide(ope)
    out(n, hMAT) = Vide(mat)
    out(n, hCOM) = Vide(Texte(v(i, cCOM)))
    out(n, hUSER) = Vide(Texte(v(i, cUSER)))
    out(n, hSRC) = "Saisie"
    out(n, hID) = "R" & Format$(id, "000000")
    cal = Calendrier(out(n, hDATE), out(n, hHEURE))
    If IsArray(cal) Then
        For j = 0 To 4: out(n, hANNEE + j) = cal(j): Next j
    End If
End Sub

' Colonnes calculées d'une ligne d'historique : Array(année, mois, semaine ISO, jour, tranche) ou Empty.
Private Function Calendrier(ByVal vd As Variant, ByVal vh As Variant) As Variant
    Dim d As Variant, h As Variant, tranche As Variant
    d = EnDate(vd)
    If IsEmpty(d) Then Exit Function
    h = Num(vh)
    tranche = Empty
    If Not IsEmpty(h) Then
        If h > 0 Then tranche = Hour(CDate(h - Int(h)))
    End If
    Calendrier = Array(Year(d), Month(d), SemaineIso(CDate(d)), _
                       Choose(Weekday(d, vbMonday), "lun", "mar", "mer", "jeu", "ven", "sam", "dim"), tranche)
End Function

Private Function SemaineIso(ByVal d As Date) As Long
    On Error Resume Next
    SemaineIso = Application.WorksheetFunction.IsoWeekNum(d)
    If Err.Number <> 0 Then SemaineIso = DatePart("ww", d, vbMonday, vbFirstFourDays)
    On Error GoTo 0
End Function

Private Function NbLignes(ByVal lo As ListObject) As Long
    If lo.DataBodyRange Is Nothing Then Exit Function
    NbLignes = lo.DataBodyRange.Rows.Count
    If NbLignes = 1 Then
        If Application.WorksheetFunction.CountA(lo.DataBodyRange) = 0 Then NbLignes = 0
    End If
End Function

' Ajoute n lignes (tableau out) à la fin de T_REJETS.
Private Sub AjouterHisto(out() As Variant, ByVal n As Long)
    Dim lo As ListObject, ws As Worksheet, n0 As Long, r0 As Long, c0 As Long, blocs As Range
    Set lo = loH()
    Set ws = lo.Parent
    If lo.ShowAutoFilter Then
        If lo.AutoFilter.FilterMode Then lo.AutoFilter.ShowAllData
    End If
    ws.Range(RECH_CELL).Value = Empty
    n0 = NbLignes(lo)
    r0 = lo.HeaderRowRange.Row + n0 + 1
    c0 = lo.HeaderRowRange.Column
    lo.Resize lo.HeaderRowRange.Resize(n0 + n + 1)
    Set blocs = ws.Range(ws.Cells(r0, c0), ws.Cells(r0 + n - 1, c0 + NH - 1))
    FormaterHisto blocs
    blocs.Value = out
End Sub

Private Sub FormaterHisto(ByVal blocs As Range)
    With blocs
        .Interior.Pattern = XL_NONE          ' laisse voir le style du tableau
        .Columns(hDATE).NumberFormat = "dd/mm/yyyy"
        .Columns(hHEURE).NumberFormat = "hh:mm"
        .Columns(hCONT).NumberFormat = "@"
        .Columns(hCONT2).NumberFormat = "@"
        .Columns(hREF).NumberFormat = "@"
        .Columns(hEMP).NumberFormat = "@"
        .Columns(hALLEE).NumberFormat = "@"
        .Columns(hMAT).NumberFormat = "@"
        .Columns(hID).NumberFormat = "@"
        .Columns(hTRANCHE).NumberFormat = "0""h"""
    End With
End Sub

Public Sub ArchiverMaintenant()
    If Not Demander("Ranger dès maintenant toutes les lignes de SAISIE dans HISTORIQUE ?" & vbCrLf & _
                    "(Le fichier le fait seul chaque début de journée.)") Then Exit Sub
    occupe = True
    On Error GoTo Erreur
    Application.EnableEvents = False
    Application.ScreenUpdating = False
    ArchiverAvant Jour0() + 1
    ParamSet "JOUR_SAISIE", Jour0()
Sortie:
    Application.ScreenUpdating = True
    Application.EnableEvents = True
    occupe = False
    Exit Sub
Erreur:
    Avertir "Archivage interrompu : " & Err.Description
    Resume Sortie
End Sub

' ==========================================================================
'  SYNTHESE : une ligne par jour et par opérateur (pour Suivi Op / dashboard)
' ==========================================================================
Public Sub ReconstruireSynthese()
    Dim lo As ListObject, ls As ListObject, v As Variant, n As Long, i As Long, j As Long, m As Long
    Dim dic As Object, cle As String, k As Long, d As Variant, cles() As String, out() As Variant
    Dim cnt() As Double, infos() As Variant, t As Long
    Set lo = loH()
    Set ls = ThisWorkbook.Worksheets(SH_SYNTH).ListObjects(T_SYNTH)
    ChargerTypes
    n = NbLignes(lo)
    If n > 0 Then v = lo.DataBodyRange.Value
    Set dic = CreateObject("Scripting.Dictionary")
    dic.CompareMode = vbTextCompare
    If n > 0 Then
        ReDim cnt(1 To n, 1 To 2 + NT6 + 1)
        ReDim infos(1 To n, 1 To 3)
        ReDim cles(1 To n)
        For i = 1 To n
            d = EnDate(v(i, hDATE))
            If Not IsEmpty(d) Then
                cle = Format$(CDate(Int(CDbl(d))), "yyyymmdd") & "|" & UCase$(Texte(v(i, hOPE)))
                If dic.Exists(cle) Then
                    k = dic(cle)
                Else
                    m = m + 1
                    k = m
                    dic.Add cle, k
                    cles(m) = cle & "|" & Format$(k, "000000")
                    infos(k, 1) = CDate(Int(CDbl(d)))
                    infos(k, 2) = Vide(Texte(v(i, hOPE)))
                    infos(k, 3) = Vide(Texte(v(i, hMAT)))
                End If
                cnt(k, 1) = cnt(k, 1) + 1
                cnt(k, 2) = cnt(k, 2) + IIf(Texte(v(i, hCONT2)) <> "", 2, 1)
                t = IndexType(Texte(v(i, hTYPE)))
                If t >= 1 And t <= NT6 Then
                    cnt(k, 2 + t) = cnt(k, 2 + t) + 1
                Else
                    cnt(k, 2 + NT6 + 1) = cnt(k, 2 + NT6 + 1) + 1
                End If
                If Texte(infos(k, 3)) = "" Then infos(k, 3) = Vide(Texte(v(i, hMAT)))
            End If
        Next i
    End If

    If Not ls.DataBodyRange Is Nothing Then ls.DataBodyRange.ClearContents
    If m = 0 Then
        ls.Resize ls.HeaderRowRange.Resize(2)
        Exit Sub
    End If
    ReDim Preserve cles(1 To m)
    TriTexte cles, 1, m
    ReDim out(1 To m, 1 To NSY)
    For i = 1 To m
        k = CLng(Right$(cles(i), 6))
        out(i, 1) = infos(k, 1)
        out(i, 2) = infos(k, 2)
        out(i, 3) = infos(k, 3)
        For j = 1 To 2 + NT6 + 1
            out(i, 3 + j) = cnt(k, j)
        Next j
        out(i, 13) = Year(infos(k, 1))
        out(i, 14) = Month(infos(k, 1))
        out(i, 15) = SemaineIso(infos(k, 1))
    Next i
    ls.Resize ls.HeaderRowRange.Resize(m + 1)
    With ls.DataBodyRange
        .Interior.Pattern = XL_NONE
        .Columns(1).NumberFormat = "dd/mm/yyyy"
        .Columns(3).NumberFormat = "@"
        .Value = out
    End With
End Sub

' ==========================================================================
'  HISTORIQUE : recherche et corrections à la main
' ==========================================================================
Public Sub SurChangementHisto(ByVal Target As Range)
    Dim lo As ListObject, z As Range, r As Range, calcPrev As Long
    If occupe Then Exit Sub
    calcPrev = Application.Calculation
    If Not Application.Intersect(Target, wsH().Range(RECH_CELL).MergeArea) Is Nothing Then
        occupe = True
        On Error GoTo Erreur
        Application.EnableEvents = False
        Rechercher Texte(wsH().Range(RECH_CELL).Value)
        GoTo Sortie
    End If
    Set lo = loH()
    If lo.DataBodyRange Is Nothing Then Exit Sub
    Set z = Application.Intersect(Target, lo.DataBodyRange)
    If z Is Nothing Then Exit Sub
    If z.Rows.Count > 2000 Then Exit Sub
    occupe = True
    On Error GoTo Erreur
    Application.EnableEvents = False
    Application.Calculation = -4135
    For Each r In Application.Intersect(z.EntireRow, lo.DataBodyRange).Rows
        CompleterLigneHisto r
    Next r
Sortie:
    Application.Calculation = calcPrev
    Application.EnableEvents = True
    occupe = False
    Exit Sub
Erreur:
    Avertir "Historique : " & Err.Description
    Resume Sortie
End Sub

' Ligne ajoutée ou corrigée à la main : colonnes calculées, ID, nombre de colis.
Private Sub CompleterLigneHisto(ByVal r As Range)
    Dim v As Variant, id As Long, cal As Variant
    v = r.Value
    If IsEmpty(EnDate(v(1, hDATE))) Then Exit Sub
    If Texte(v(1, hID)) = "" Then
        id = CLng(Val(Texte(Param("DERNIER_ID", 0)))) + 1
        ParamSet "DERNIER_ID", id
        r.Cells(1, hID).NumberFormat = "@"
        r.Cells(1, hID).Value = "R" & Format$(id, "000000")
        If Texte(v(1, hSRC)) = "" Then r.Cells(1, hSRC).Value = "Manuel"
    End If
    r.Cells(1, hCOLIS).Value = IIf(Texte(v(1, hCONT2)) <> "", 2, 1)
    If Texte(v(1, hALLEE)) = "" And Texte(v(1, hEMP)) <> "" Then
        r.Cells(1, hALLEE).NumberFormat = "@"
        r.Cells(1, hALLEE).Value = AlleeDepuisTexte(Texte(v(1, hEMP)))
    End If
    cal = Calendrier(v(1, hDATE), v(1, hHEURE))
    If IsArray(cal) Then r.Cells(1, hANNEE).Resize(1, 5).Value = cal
End Sub

' Tous les mots doivent se trouver dans la ligne (contenant, réf, opérateur, allée, type, date...).
Public Sub Rechercher(ByVal terme As String)
    Dim lo As ListObject, v As Variant, i As Long, j As Long, k As Long, s As String
    Dim mots() As String, ok As Boolean, ids() As String, n As Long, d As Variant
    Set lo = loH()
    If Not lo.ShowAutoFilter Then lo.ShowAutoFilter = True
    If lo.AutoFilter.FilterMode Then lo.AutoFilter.ShowAllData
    terme = Trim$(Normaliser(terme))
    n = NbLignes(lo)
    If terme = "" Or n = 0 Then
        wsH().Range(RECH_INFO).Value = n & " ligne(s) · tout est affiché"
        Exit Sub
    End If
    mots = Split(terme, " ")
    v = lo.DataBodyRange.Value
    ReDim ids(0 To n - 1)
    For i = 1 To n
        s = ""
        For j = 1 To NH
            If j = hDATE Then
                d = EnDate(v(i, j))
                If Not IsEmpty(d) Then s = s & " " & Format$(d, "dd/mm/yyyy")
            ElseIf j <> hHEURE Then
                s = s & " " & Texte(v(i, j))
            End If
        Next j
        s = Normaliser(s)
        ok = True
        For j = LBound(mots) To UBound(mots)
            If mots(j) <> "" Then
                If InStr(1, s, mots(j), vbBinaryCompare) = 0 Then ok = False: Exit For
            End If
        Next j
        If ok And Texte(v(i, hID)) <> "" Then ids(k) = Texte(v(i, hID)): k = k + 1
    Next i
    If k = 0 Then
        lo.Range.AutoFilter Field:=hID, Criteria1:="=#aucun#"
    Else
        ReDim Preserve ids(0 To k - 1)
        lo.Range.AutoFilter Field:=hID, Criteria1:=ids, Operator:=XL_FILTER_VALUES
    End If
    wsH().Range(RECH_INFO).Value = k & " résultat(s) sur " & n & " · effacer la case pour tout revoir"
End Sub

Public Sub ToutAfficher()
    occupe = True
    On Error GoTo Sortie
    Application.EnableEvents = False
    wsH().Range(RECH_CELL).Value = Empty
    Rechercher ""
Sortie:
    Application.EnableEvents = True
    occupe = False
End Sub

Public Sub RecalculerHistorique()
    Dim lo As ListObject, v As Variant, i As Long, j As Long, n As Long, id As Long, cal As Variant
    occupe = True
    On Error GoTo Erreur
    Application.EnableEvents = False
    Application.ScreenUpdating = False
    ChargerTypes
    Set lo = loH()
    n = NbLignes(lo)
    If n > 0 Then
        v = lo.DataBodyRange.Value
        id = CLng(Val(Texte(Param("DERNIER_ID", 0))))
        For i = 1 To n
            If Texte(v(i, hID)) = "" Then id = id + 1: v(i, hID) = "R" & Format$(id, "000000")
            If Texte(v(i, hSRC)) = "" Then v(i, hSRC) = "Manuel"
            v(i, hCOLIS) = IIf(Texte(v(i, hCONT2)) <> "", 2, 1)
            If Texte(v(i, hALLEE)) = "" And Texte(v(i, hEMP)) <> "" Then v(i, hALLEE) = AlleeDepuisTexte(Texte(v(i, hEMP)))
            cal = Calendrier(v(i, hDATE), v(i, hHEURE))
            If IsArray(cal) Then
                For j = 0 To 4: v(i, hANNEE + j) = cal(j): Next j
            End If
        Next i
        FormaterHisto lo.DataBodyRange
        lo.DataBodyRange.Value = v
        ParamSet "DERNIER_ID", id
    End If
    ReconstruireSynthese
    Avertir n & " ligne(s) d'historique contrôlée(s), synthèse reconstruite."
Sortie:
    Application.ScreenUpdating = True
    Application.EnableEvents = True
    occupe = False
    Exit Sub
Erreur:
    Avertir "Recalcul interrompu : " & Err.Description
    Resume Sortie
End Sub

' ==========================================================================
'  EXPORT CSV (Power Query du Suivi Op / dashboard, même si le .xlsm est ouvert)
' ==========================================================================
Public Function ExporterCSV(ByVal silencieux As Boolean) As String
    Dim lo As ListObject, v As Variant, h As Variant, i As Long, j As Long, n As Long
    Dim lignes() As String, champs() As String, chemin As String, st As Object, d As Variant
    On Error GoTo Erreur
    If ThisWorkbook.Path = "" Or InStr(1, ThisWorkbook.Path, "http", vbTextCompare) = 1 Then
        If Not silencieux Then Avertir "Enregistrer d'abord le fichier sur un dossier du réseau ou du PC."
        Exit Function
    End If
    chemin = ThisWorkbook.Path & Application.PathSeparator & Texte(Param("CSV_NOM", "Rejets_historique.csv"))
    Set lo = loH()
    n = NbLignes(lo)
    h = lo.HeaderRowRange.Value
    ReDim lignes(0 To n)
    ReDim champs(1 To NH)
    For j = 1 To NH: champs(j) = ChampCSV(Texte(h(1, j))): Next j
    lignes(0) = Join(champs, ";")
    If n > 0 Then
        v = lo.DataBodyRange.Value
        For i = 1 To n
            For j = 1 To NH
                Select Case j
                    Case hDATE
                        d = EnDate(v(i, j))
                        If IsEmpty(d) Then champs(j) = "" Else champs(j) = Format$(d, "yyyy-mm-dd")
                    Case hHEURE
                        If IsEmpty(Num(v(i, j))) Then champs(j) = "" Else champs(j) = Format$(CDate(Fraction(v(i, j))), "hh:nn:ss")
                    Case Else
                        champs(j) = ChampCSV(Texte(v(i, j)))
                End Select
            Next j
            lignes(i) = Join(champs, ";")
        Next i
    End If
    Set st = CreateObject("ADODB.Stream")
    st.Type = 2
    st.Charset = "utf-8"
    st.Open
    st.WriteText Join(lignes, vbCrLf) & vbCrLf
    st.SaveToFile chemin, 2
    st.Close
    ExporterCSV = chemin
    If Not silencieux Then Avertir n & " ligne(s) exportée(s) dans :" & vbCrLf & chemin
    Exit Function
Erreur:
    If Not silencieux Then Avertir "Export CSV impossible : " & Err.Description
End Function

Private Function ChampCSV(ByVal s As String) As String
    s = Replace(Replace(s, vbCr, " "), vbLf, " ")
    If InStr(s, ";") > 0 Or InStr(s, """") > 0 Then s = """" & Replace(s, """", """""") & """"
    ChampCSV = s
End Function

' ==========================================================================
'  TABLEAU DE BORD : top des références de la période (le reste est en formules)
' ==========================================================================
Public Sub ChangementTDB(ByVal Target As Range)
    Dim n As Variant
    For Each n In Array("F_PERIODE", "F_OPE", "F_DU", "F_AU")
        If Not Application.Intersect(Target, Nom(CStr(n))) Is Nothing Then ActualiserTDB: Exit Sub
    Next n
End Sub

Public Sub ActualiserTDB()
    Dim d1 As Double, d2 As Double, op As String, dic As Object, i As Long, k As Long, r As Long
    Dim v As Variant, s As Variant, n As Long, ref As String, refs() As String, nb() As Long
    Dim derniere() As Double, qui() As Object, quoi() As Object, best As Long, j As Long, tmp As Variant
    Dim rRef As Range, rNb As Range, rDat As Range, rInfo As Range, calcPrev As Long
    If occupe Then Exit Sub
    occupe = True
    calcPrev = Application.Calculation
    On Error GoTo Erreur
    Application.EnableEvents = False
    Application.ScreenUpdating = False
    Application.Calculate
    d1 = CDbl(Nom("P_DEBUT").Value)
    d2 = CDbl(Nom("P_FIN").Value)
    op = UCase$(Trim$(Texte(Nom("F_OPE").Value)))
    If op = "TOUS" Then op = ""
    Set dic = CreateObject("Scripting.Dictionary")
    dic.CompareMode = vbTextCompare
    ReDim refs(1 To 64): ReDim nb(1 To 64): ReDim derniere(1 To 64)
    ReDim qui(1 To 64): ReDim quoi(1 To 64)

    n = NbLignes(loH())
    If n > 0 Then
        v = loH().DataBodyRange.Value
        For i = 1 To n
            CompterRef dic, refs, nb, derniere, qui, quoi, k, v(i, hDATE), v(i, hREF), v(i, hOPE), v(i, hTYPE), d1, d2, op
        Next i
    End If
    s = wsS().Range(wsS().Cells(L1, 1), wsS().Cells(LN, NCS)).Value
    For i = 1 To UBound(s, 1)
        CompterRef dic, refs, nb, derniere, qui, quoi, k, s(i, cJOUR), s(i, cREF), s(i, cOPE), s(i, cTYPE), d1, d2, op
    Next i

    ' tri partiel : les 10 plus fréquentes (puis la plus récente)
    For i = 1 To IIf(k < 10, k, 10)
        best = i
        For j = i + 1 To k
            If nb(j) > nb(best) Or (nb(j) = nb(best) And derniere(j) > derniere(best)) Then best = j
        Next j
        If best <> i Then
            tmp = refs(i): refs(i) = refs(best): refs(best) = tmp
            tmp = nb(i): nb(i) = nb(best): nb(best) = tmp
            tmp = derniere(i): derniere(i) = derniere(best): derniere(best) = tmp
            Set tmp = qui(i): Set qui(i) = qui(best): Set qui(best) = tmp
            Set tmp = quoi(i): Set quoi(i) = quoi(best): Set quoi(best) = tmp
        End If
    Next i

    Set rRef = Nom("TOP_REF"): Set rNb = Nom("TOP_NB"): Set rDat = Nom("TOP_DATE"): Set rInfo = Nom("TOP_INFO")
    For r = 1 To rRef.Rows.Count
        If r <= k Then
            rRef.Cells(r, 1).Value = refs(r)
            rNb.Cells(r, 1).Value = nb(r)
            rDat.Cells(r, 1).Value = CDate(derniere(r))
            rInfo.Cells(r, 1).Value = Majoritaire(qui(r)) & "  ·  " & Majoritaire(quoi(r))
        Else
            rRef.Cells(r, 1).Value = IIf(r = 1, "aucune référence sur la période", Empty)
            rNb.Cells(r, 1).Value = Empty
            rDat.Cells(r, 1).Value = Empty
            rInfo.Cells(r, 1).Value = Empty
        End If
    Next r
    Nom("TOP_MAJ").Value = "actualisé le " & Format$(Now, "dd/mm") & " à " & HHMM(Now)
Sortie:
    Application.Calculation = calcPrev
    Application.ScreenUpdating = True
    Application.EnableEvents = True
    occupe = False
    Exit Sub
Erreur:
    Resume Sortie
End Sub

Private Sub CompterRef(dic As Object, refs() As String, nb() As Long, derniere() As Double, _
                       qui() As Object, quoi() As Object, k As Long, ByVal vd As Variant, _
                       ByVal vref As Variant, ByVal vope As Variant, ByVal vtype As Variant, _
                       ByVal d1 As Double, ByVal d2 As Double, ByVal op As String)
    Dim d As Variant, ref As String, i As Long, o As String, t As String
    d = EnDate(vd)
    If IsEmpty(d) Then Exit Sub
    If Int(CDbl(d)) < d1 Or Int(CDbl(d)) > d2 Then Exit Sub
    ref = UCase$(Trim$(Texte(vref)))
    If ref = "" Then Exit Sub
    o = Trim$(Texte(vope))
    If op <> "" And UCase$(o) <> op Then Exit Sub
    If dic.Exists(ref) Then
        i = dic(ref)
    Else
        k = k + 1
        If k > UBound(refs) Then
            ReDim Preserve refs(1 To 2 * k): ReDim Preserve nb(1 To 2 * k)
            ReDim Preserve derniere(1 To 2 * k): ReDim Preserve qui(1 To 2 * k): ReDim Preserve quoi(1 To 2 * k)
        End If
        i = k
        dic.Add ref, i
        refs(i) = ref
        Set qui(i) = CreateObject("Scripting.Dictionary")
        Set quoi(i) = CreateObject("Scripting.Dictionary")
    End If
    nb(i) = nb(i) + 1
    If Int(CDbl(d)) > derniere(i) Then derniere(i) = Int(CDbl(d))
    If o = "" Then o = "(non renseigné)"
    t = Trim$(Texte(vtype))
    If t = "" Then t = "(type ?)"
    qui(i).Item(o) = qui(i).Item(o) + 1
    quoi(i).Item(t) = quoi(i).Item(t) + 1
End Sub

Private Function Majoritaire(ByVal dic As Object) As String
    Dim k As Variant, best As Long
    If dic Is Nothing Then Exit Function
    For Each k In dic.Keys
        If dic.Item(k) > best Then best = dic.Item(k): Majoritaire = CStr(k)
    Next k
    If dic.Count > 1 Then Majoritaire = Majoritaire & " (+" & (dic.Count - 1) & ")"
End Function

' ==========================================================================
'  LISTES DÉROULANTES : opérateurs actifs (SAISIE) et filtre du tableau de bord
' ==========================================================================
Public Sub SurChangementOperateurs(ByVal Target As Range)
    Dim lo As ListObject
    If occupe Then Exit Sub
    Set lo = Target.Worksheet.ListObjects(T_OPE)
    If Application.Intersect(Target, lo.Range) Is Nothing Then Exit Sub
    occupe = True
    On Error GoTo Sortie
    Application.EnableEvents = False
    ReconstruireListes
Sortie:
    Application.EnableEvents = True
    occupe = False
End Sub

Public Sub ReconstruireListes()
    Dim lo As ListObject, v As Variant, i As Long, na As Long, nt As Long
    Dim actifs() As String, tous() As String, ws As Worksheet, colNom As Long, colActif As Long, nomOp As String
    Dim outA() As Variant, outT() As Variant
    Set lo = ThisWorkbook.Worksheets(SH_OPE).ListObjects(T_OPE)
    Set ws = ThisWorkbook.Worksheets(SH_CALC)
    colNom = lo.ListColumns("NOM PRÉNOM").Index
    colActif = lo.ListColumns("Actif").Index
    ReDim actifs(1 To LISTE_MAX): ReDim tous(1 To LISTE_MAX)
    If NbLignes(lo) > 0 Then
        v = lo.DataBodyRange.Value
        For i = 1 To UBound(v, 1)
            nomOp = Trim$(Texte(v(i, colNom)))
            If nomOp <> "" And nt < LISTE_MAX - 1 Then
                nt = nt + 1: tous(nt) = nomOp
                If UCase$(Left$(Trim$(Texte(v(i, colActif))), 1)) <> "N" Then na = na + 1: actifs(na) = nomOp
            End If
        Next i
    End If
    If na > 1 Then TriTexte actifs, 1, na
    If nt > 1 Then TriTexte tous, 1, nt
    ReDim outA(1 To LISTE_MAX, 1 To 1)
    ReDim outT(1 To LISTE_MAX, 1 To 1)
    outT(1, 1) = "Tous"
    For i = 1 To na: outA(i, 1) = actifs(i): Next i
    For i = 1 To nt: outT(i + 1, 1) = tous(i): Next i
    ws.Range(LISTE_OPE).Resize(LISTE_MAX, 1).Value = outA
    ws.Range(LISTE_FILTRE).Resize(LISTE_MAX, 1).Value = outT
End Sub

' « 123 », « dupon », « DUPONT JEAN » -> nom, matricule, actif
Private Function TrouverOperateur(ByVal s As String, ByRef nomOp As String, ByRef mat As String, _
                                  ByRef actif As Boolean) As Boolean
    Dim lo As ListObject, v As Variant, i As Long, cM As Long, cN As Long, cA As Long
    Dim u As String, n As Long, k As Long
    Set lo = ThisWorkbook.Worksheets(SH_OPE).ListObjects(T_OPE)
    If NbLignes(lo) = 0 Then Exit Function
    cM = lo.ListColumns("Matricule").Index
    cN = lo.ListColumns("NOM PRÉNOM").Index
    cA = lo.ListColumns("Actif").Index
    v = lo.DataBodyRange.Value
    s = Trim$(s)
    If QueChiffres(s) Then
        For i = 1 To UBound(v, 1)
            If SansZeros(Texte(v(i, cM))) = SansZeros(s) And Texte(v(i, cN)) <> "" Then k = i: Exit For
        Next i
    Else
        u = Normaliser(s)
        For i = 1 To UBound(v, 1)
            If Texte(v(i, cN)) <> "" And Normaliser(Texte(v(i, cN))) = u Then k = i: Exit For
        Next i
        If k = 0 Then        ' début de nom unique parmi les actifs (« dup »)
            For i = 1 To UBound(v, 1)
                If Texte(v(i, cN)) <> "" And UCase$(Left$(Trim$(Texte(v(i, cA))), 1)) <> "N" Then
                    If InStr(1, Normaliser(Texte(v(i, cN))), u, vbBinaryCompare) > 0 Then n = n + 1: k = i
                End If
            Next i
            If n <> 1 Then k = 0
        End If
    End If
    If k = 0 Then Exit Function
    nomOp = Trim$(Texte(v(k, cN)))
    mat = Trim$(Texte(v(k, cM)))
    actif = (UCase$(Left$(Trim$(Texte(v(k, cA))), 1)) <> "N")
    TrouverOperateur = True
End Function

' ==========================================================================
'  TYPES D'ERREUR (onglet REGLAGES)
' ==========================================================================
Private Sub ChargerTypes()
    Dim v As Variant, i As Long
    v = Nom("R_TYPES").Value          ' N°, Type, Abrégé
    nbTypes = 0
    For i = 1 To UBound(v, 1)
        If Trim$(Texte(v(i, 2))) <> "" And nbTypes < MAXTYPES Then
            nbTypes = nbTypes + 1
            tNom(nbTypes) = Trim$(Texte(v(i, 2)))
            tCourt(nbTypes) = Trim$(Texte(v(i, 3)))
        End If
    Next i
    typeDeux = Trim$(Texte(Nom("TYPE_2COLIS").Value))
End Sub

Private Function EstDeuxColis(ByVal t As String) As Boolean
    If typeDeux = "" Then Exit Function
    EstDeuxColis = (Normaliser(t) = Normaliser(typeDeux))
End Function

Private Function IndexType(ByVal t As String) As Long
    Dim i As Long, u As String
    u = Normaliser(t)
    If u = "" Then Exit Function
    For i = 1 To nbTypes
        If Normaliser(tNom(i)) = u Then IndexType = i: Exit Function
    Next i
End Function

' « 4 », « orient », « + », « q- », « casse » -> libellé exact du type
Private Function TypeDepuisSaisie(ByVal s As String) As String
    Dim i As Long, k As Long, n As Long, u As String
    s = Trim$(s)
    If QueChiffres(s) And Len(s) <= 2 Then
        k = CLng(s)
        If k >= 1 And k <= nbTypes Then TypeDepuisSaisie = tNom(k)
        Exit Function
    End If
    u = Normaliser(s)
    For i = 1 To nbTypes
        If Normaliser(tNom(i)) = u Or Normaliser(tCourt(i)) = u Then TypeDepuisSaisie = tNom(i): Exit Function
    Next i
    ' « + » / « - » seuls ou en fin de mot : quantité + / quantité -
    If Right$(u, 1) = "+" Or Right$(u, 1) = "-" Then
        For i = 1 To nbTypes
            If Right$(Normaliser(tNom(i)), 1) = Right$(u, 1) Then n = n + 1: k = i
        Next i
        If n = 1 Then TypeDepuisSaisie = tNom(k)
        Exit Function
    End If
    For i = 1 To nbTypes
        If InStr(1, Normaliser(tNom(i)), u, vbBinaryCompare) = 1 Then n = n + 1: k = i
    Next i
    If n = 1 Then TypeDepuisSaisie = tNom(k)
End Function

Private Function TypesCourts() As String
    Dim i As Long, s As String
    For i = 1 To nbTypes
        s = s & IIf(s = "", "", "  ·  ") & i & " " & tNom(i)
    Next i
    TypesCourts = s
End Function

' ==========================================================================
'  BOUTONS (liens de l'onglet REGLAGES ; le code de l'action est en colonne A)
' ==========================================================================
Public Sub Bouton(ByVal adresse As String)
    Dim code As String
    If InStr(adresse, ":") > 0 Then adresse = Left$(adresse, InStr(adresse, ":") - 1)
    code = UCase$(Trim$(Texte(wsR().Cells(wsR().Range(adresse).Row, 1).Value)))
    Select Case code
        Case "ACT_ARCHIVER": ArchiverMaintenant
        Case "ACT_RECALC": RecalculerHistorique
        Case "ACT_CSV": ExporterCSV False
        Case "ACT_LISTES"
            ReconstruireListes
            Avertir "Listes des opérateurs reconstruites."
        Case "ACT_TOUT"
            ToutAfficher
            wsH().Activate
    End Select
End Sub

' ==========================================================================
'  RÉGLAGES (colonne A = code, colonne C = valeur)
' ==========================================================================
Private Function Param(ByVal code As String, Optional ByVal defaut As Variant = "") As Variant
    Dim v As Variant, i As Long
    v = wsR().Range("A1:C120").Value
    For i = 1 To UBound(v, 1)
        If UCase$(Trim$(Texte(v(i, 1)))) = UCase$(code) Then
            If Trim$(Texte(v(i, 3))) = "" Then Param = defaut Else Param = v(i, 3)
            Exit Function
        End If
    Next i
    Param = defaut
End Function

Private Sub ParamSet(ByVal code As String, ByVal valeur As Variant)
    Dim v As Variant, i As Long
    v = wsR().Range("A1:A120").Value
    For i = 1 To UBound(v, 1)
        If UCase$(Trim$(Texte(v(i, 1)))) = UCase$(code) Then
            If IsEmpty(valeur) Then wsR().Cells(i, 3).ClearContents Else wsR().Cells(i, 3).Value = valeur
            Exit Sub
        End If
    Next i
End Sub

Private Function Oui(ByVal code As String) As Boolean
    Oui = (UCase$(Left$(Trim$(Texte(Param(code, "OUI"))), 1)) = "O")
End Function

Private Function DansListe(ByVal nomListe As String, ByVal valeur As String) As Boolean
    Dim v As Variant, i As Long
    On Error GoTo Fin
    v = ThisWorkbook.Names(nomListe).RefersToRange.Value
    If Not IsArray(v) Then DansListe = (UCase$(Texte(v)) = UCase$(valeur)): Exit Function
    For i = 1 To UBound(v, 1)
        If UCase$(Texte(v(i, 1))) = UCase$(valeur) Then DansListe = True: Exit Function
    Next i
Fin:
End Function

' ==========================================================================
'  BANDEAU DE MESSAGES (SAISIE, ligne 4) · 0 vert, 1 orange, 2 rouge, 3 consigne
' ==========================================================================
Private Sub Info(ByVal msg As String, ByVal niveau As Long)
    Dim c As Range
    Set c = wsS().Range(MSG_CELL)
    c.Value = msg
    Select Case niveau
        Case 0: c.Font.Color = RGB(63, 191, 110)
        Case 1: c.Font.Color = RGB(255, 138, 31)
        Case 2: c.Font.Color = RGB(229, 51, 42)
        Case Else: c.Font.Color = RGB(255, 212, 0)
    End Select
End Sub

' Remet la consigne par défaut : une formule qui signale aussi des macros désactivées.
Private Sub RetablirMessage()
    Dim c As Range
    Set c = wsS().Range(MSG_CELL)
    c.Formula = "=IF(MACROS<>TODAY(),""" & ChrW(9888) & "  Macros désactivées : cliquer « Activer le contenu ». " & _
                "Sans macros, pas d'heure automatique ni d'archivage."",""" & ChrW(8594) & _
                "  Scanner un contenant (case jaune) : la date et l'heure se mettent seules."")"
    c.Font.Color = RGB(255, 212, 0)
End Sub

Private Function Demander(ByVal msg As String) As Boolean
    Demander = (MsgBox(msg, vbYesNo + vbQuestion + vbDefaultButton2, "Contrôle des rejets") = vbYes)
End Function

Private Sub Avertir(ByVal msg As String)
    MsgBox msg, vbInformation, "Contrôle des rejets"
End Sub

' ==========================================================================
'  OUTILS
' ==========================================================================
Private Sub TriTexte(a() As String, ByVal lo As Long, ByVal hi As Long)
    Dim i As Long, j As Long, p As String, t As String
    Do While lo < hi
        i = lo: j = hi
        p = a((lo + hi) \ 2)
        Do While i <= j
            Do While StrComp(a(i), p, vbTextCompare) < 0: i = i + 1: Loop
            Do While StrComp(a(j), p, vbTextCompare) > 0: j = j - 1: Loop
            If i <= j Then
                t = a(i): a(i) = a(j): a(j) = t
                i = i + 1: j = j - 1
            End If
        Loop
        If j - lo < hi - i Then
            If lo < j Then TriTexte a, lo, j
            lo = i
        Else
            If i < hi Then TriTexte a, i, hi
            hi = j
        End If
    Loop
End Sub

Private Function AlleeDepuisTexte(ByVal s As String) As String
    Dim i As Long, ch As String, chiffres As String
    s = UCase$(Trim$(s))
    If QueChiffres(s) Then
        If Len(s) = 1 Then s = "0" & s
        AlleeDepuisTexte = s
        Exit Function
    End If
    ' emplacement « 06-121-05 A » -> « 06 » ; sinon (ex. « HG ») tel quel
    For i = 1 To Len(s)
        ch = Mid$(s, i, 1)
        If ch >= "0" And ch <= "9" Then
            chiffres = chiffres & ch
        ElseIf chiffres <> "" Then
            Exit For
        ElseIf i = 1 Then
            AlleeDepuisTexte = s
            Exit Function
        End If
    Next i
    If Len(chiffres) = 1 Then chiffres = "0" & chiffres
    If chiffres = "" Then AlleeDepuisTexte = s Else AlleeDepuisTexte = chiffres
End Function

' « 0612105a », « 6-121-5 A », « PICK0612105A » -> « 06-121-05 A » ; "" si le format est faux.
' Format : 2-3-2 chiffres + une lettre de A à H (obligatoire).
Private Function NormaliserEmplacement(ByVal s As String) As String
    Dim g(1 To 3) As String, n As Long, i As Long, ch As String, lettre As String, nouveau As Boolean
    s = UCase$(Trim$(s))
    Do While Len(s) > 0                      ' préfixe éventuel de l'étiquette (ex. PICK)
        ch = Left$(s, 1)
        If ch >= "0" And ch <= "9" Then Exit Do
        s = Mid$(s, 2)
    Loop
    If Len(s) = 0 Then Exit Function
    ch = Right$(s, 1)
    If ch < "A" Or ch > "H" Then Exit Function
    lettre = ch
    s = Left$(s, Len(s) - 1)
    n = 1
    For i = 1 To Len(s)
        ch = Mid$(s, i, 1)
        If ch >= "0" And ch <= "9" Then
            If nouveau Then n = n + 1: nouveau = False
            If n > 3 Then Exit Function
            g(n) = g(n) & ch
        ElseIf InStr("-./_ ", ch) > 0 Then
            If g(n) <> "" Then nouveau = True
        Else
            Exit Function
        End If
    Next i
    If n = 1 Then                            ' saisie compacte : 7 chiffres
        If Len(g(1)) <> 7 Then Exit Function
        g(2) = Mid$(g(1), 3, 3)
        g(3) = Mid$(g(1), 6, 2)
        g(1) = Left$(g(1), 2)
    ElseIf n <> 3 Then
        Exit Function
    End If
    If g(1) = "" Or g(2) = "" Or g(3) = "" Then Exit Function
    If Len(g(1)) > 2 Or Len(g(2)) > 3 Or Len(g(3)) > 2 Then Exit Function
    NormaliserEmplacement = Right$("0" & g(1), 2) & "-" & Right$("00" & g(2), 3) & "-" & Right$("0" & g(3), 2) & " " & lettre
End Function

Private Function EmplacementOk(ByVal s As String) As Boolean
    If s = "" Then Exit Function
    EmplacementOk = (NormaliserEmplacement(s) = s)
End Function

Private Function NettoyerScan(ByVal s As String) As String
    s = Replace(Replace(Replace(s, vbCr, ""), vbLf, ""), vbTab, "")
    s = Trim$(s)
    If Left$(s, 1) = "]" And Len(s) > 3 Then s = Mid$(s, 4)     ' préfixe AIM du scanner (]C1...)
    NettoyerScan = UCase$(s)
End Function

Private Function EstContenant(ByVal s As String) As Boolean
    EstContenant = QueChiffres(s) And Len(s) >= CLng(Val(Texte(Param("LONGUEUR_CONTENANT", 10))))
End Function

Private Function MemeCont(ByVal a As String, ByVal b As String) As Boolean
    If a = "" Or b = "" Then Exit Function
    MemeCont = (SansZeros(a) = SansZeros(b))
End Function

Private Function SansZeros(ByVal s As String) As String
    s = UCase$(Trim$(s))
    If QueChiffres(s) Then
        Do While Len(s) > 1 And Left$(s, 1) = "0"
            s = Mid$(s, 2)
        Loop
    End If
    SansZeros = s
End Function

Private Function QueChiffres(ByVal s As String) As Boolean
    Dim i As Long, ch As String
    If Len(s) = 0 Then Exit Function
    For i = 1 To Len(s)
        ch = Mid$(s, i, 1)
        If ch < "0" Or ch > "9" Then Exit Function
    Next i
    QueChiffres = True
End Function

' minuscules sans accents, espaces simples (comparaisons et recherche)
Private Function Normaliser(ByVal s As String) As String
    Dim a As Variant, b As Variant, i As Long
    s = LCase$(Replace(Replace(Replace(s, vbCr, " "), vbLf, " "), ChrW(8722), "-"))
    a = Array("é", "è", "ê", "ë", "à", "â", "ä", "î", "ï", "ô", "ö", "ù", "û", "ü", "ç")
    b = Array("e", "e", "e", "e", "a", "a", "a", "i", "i", "o", "o", "u", "u", "u", "c")
    For i = 0 To UBound(a)
        s = Replace(s, a(i), b(i))
    Next i
    Do While InStr(s, "  ") > 0
        s = Replace(s, "  ", " ")
    Loop
    Normaliser = Trim$(s)
End Function

Private Function Texte(ByVal v As Variant) As String
    If IsError(v) Or IsNull(v) Or IsEmpty(v) Or IsArray(v) Or IsObject(v) Then Exit Function
    Texte = CStr(v)
End Function

Private Function Vide(ByVal s As String) As Variant
    If s = "" Then Vide = Empty Else Vide = s
End Function

Private Function Num(ByVal v As Variant) As Variant
    Num = Empty
    If IsError(v) Or IsNull(v) Or IsEmpty(v) Or IsArray(v) Then Exit Function
    If VarType(v) = vbDate Then
        Num = CDbl(v)
    ElseIf VarType(v) = vbString Then
        If Trim$(v) <> "" And IsNumeric(v) Then Num = CDbl(v)
    ElseIf IsNumeric(v) Then
        Num = CDbl(v)
    End If
End Function

Private Function Fraction(ByVal v As Variant) As Double
    Dim x As Variant
    x = Num(v)
    If IsEmpty(x) Then Exit Function
    Fraction = CDbl(x) - Int(CDbl(x))
End Function

Private Function EnDate(ByVal v As Variant) As Variant
    EnDate = Empty
    If IsError(v) Or IsNull(v) Or IsEmpty(v) Or IsArray(v) Then Exit Function
    If VarType(v) = vbDate Then EnDate = v: Exit Function
    If IsNumeric(v) Then
        If CDbl(v) > 30000 And CDbl(v) < 100000 Then EnDate = CDate(CDbl(v))
        Exit Function
    End If
    If IsDate(v) Then EnDate = CDate(v)
End Function

Private Function HHMM(ByVal t As Variant) As String
    Dim x As Variant
    x = Num(t)
    If IsEmpty(x) Then Exit Function
    HHMM = Format$(CDate(CDbl(x) - Int(CDbl(x))), "hh:nn")
End Function

Private Function Jour0() As Date
    Jour0 = Date
End Function

Private Function Utilisateur() As String
    Utilisateur = Environ$("USERNAME")
End Function

Private Function Fleche() As String
    Fleche = ChrW(8594) & "  "
End Function
