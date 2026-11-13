Attribute VB_Name = "modToutLive"
Option Explicit
'==============================================================================
'  PICK & PACK LIVE - un seul classeur, une seule commande
'
'  Ce classeur contient deja M01_LOGYS, M02_SUIVIOP, M03_EXPORT (data.js) ;
'  on y ajoute modPilotageLive (pilotage_data.js) et ce module, qui lance et
'  arrete les deux boucles ensemble. Les deux fichiers sont ecrits dans le
'  meme dossier que pilotage.html.
'
'  Les deux fichiers sont ecrits d'office dans le dossier de ce classeur.
'    TOUT_TESTER          un passage de chaque module, avec compte rendu
'    TOUT_DEMARRER        lance les deux boucles
'    TOUT_ARRETER         arrete les deux boucles
'
'  A coller dans ThisWorkbook (remplace ce qui y est) :
'      Private Sub Workbook_Open()
'          Application.OnTime Now + TimeSerial(0, 0, 15), "TOUT_DEMARRER"
'      End Sub
'      Private Sub Workbook_BeforeClose(Cancel As Boolean)
'          TOUT_ARRETER
'      End Sub
'==============================================================================

Private Const FEUILLE_PILOTAGE As String = "PILOTAGE"
Private Const NOM_DOSSIER_LIVE As String = "P_DOSSIER_EXPORT"
Private Const CLE_DOSSIER_PILOTAGE As String = "DOSSIER_SORTIE"
Private Const TITRE As String = "Pick & Pack Live"

Public Sub TOUT_DEMARRER()
    ReglerDossier
    If Not DossiersOk() Then Exit Sub
    Lancer "DEMARRER_LIVE"
    Lancer "Pilotage_Demarrer"
End Sub

Public Sub TOUT_ARRETER()
    On Error Resume Next
    Application.Run "'" & ThisWorkbook.Name & "'!ARRETER_LIVE"
    Application.Run "'" & ThisWorkbook.Name & "'!ARRETER_AUTO"
    Application.Run "'" & ThisWorkbook.Name & "'!Pilotage_Arreter"
    On Error GoTo 0
End Sub

Public Sub TOUT_TESTER()
    Dim c As Range
    ReglerDossier
    If Not DossiersOk() Then Exit Sub
    Set c = CelluleDossierPilotage()
    If Len(Dir$(AvecBarre(CStr(c.Value)) & "pilotage.html")) = 0 Then
        MsgBox "Attention : pilotage.html n'est pas dans le dossier ou les donnees sont ecrites :" & vbCrLf & vbCrLf & _
               AvecBarre(CStr(c.Value)) & vbCrLf & vbCrLf & "Mets pilotage.html et ce classeur dans le meme dossier.", vbExclamation, TITRE
    End If
    Lancer "TEST_EXPORT"
    Lancer "Pilotage_Tester"
End Sub

' Les deux modules ont chacun leur reglage de dossier : on y met celui de ce classeur.
Public Sub TOUT_REGLER_DOSSIER()
    Dim d As String, c As Range
    d = ThisWorkbook.Path
    If Len(d) = 0 Then
        MsgBox "Enregistre d'abord ce classeur dans le dossier de pilotage.html.", vbExclamation, TITRE
        Exit Sub
    End If
    If Right$(d, 1) <> "\" Then d = d & "\"
    If MsgBox("Ecrire data.js et pilotage_data.js dans ce dossier ?" & vbCrLf & vbCrLf & d & vbCrLf & vbCrLf & _
              "pilotage.html doit se trouver dans ce meme dossier.", vbQuestion + vbYesNo, TITRE) <> vbYes Then Exit Sub
    On Error GoTo Erreur
    ThisWorkbook.Names(NOM_DOSSIER_LIVE).RefersToRange.Value = d
    Set c = CelluleDossierPilotage()
    If c Is Nothing Then
        MsgBox "Dossier regle pour data.js." & vbCrLf & "La feuille " & FEUILLE_PILOTAGE & " est absente : copie-la depuis l'ancien classeur Pilotage, puis relance cette macro.", vbExclamation, TITRE
        Exit Sub
    End If
    c.Value = d
    MsgBox "Dossier regle pour les deux fichiers.", vbInformation, TITRE
    Exit Sub
Erreur:
    MsgBox "Reglage impossible : " & Err.Description, vbExclamation, TITRE
End Sub

' Sans rien demander : les deux fichiers vont dans le dossier de ce classeur.
' Si le classeur est ouvert depuis OneDrive (chemin en https), on garde le dossier deja inscrit dans PILOTAGE.
Private Sub ReglerDossier()
    Dim d As String, c As Range
    Set c = CelluleDossierPilotage()
    If c Is Nothing Then Exit Sub
    d = ThisWorkbook.Path
    If Not (Mid$(d, 2, 2) = ":\" Or Left$(d, 2) = "\\") Then d = Trim$(CStr(c.Value))
    If Len(d) = 0 Then Exit Sub
    d = AvecBarre(d)
    On Error Resume Next
    c.Value = d
    ThisWorkbook.Names(NOM_DOSSIER_LIVE).RefersToRange.Value = d
    On Error GoTo 0
End Sub

Private Function AvecBarre(ByVal d As String) As String
    d = Trim$(d)
    If Len(d) > 0 And Right$(d, 1) <> "\" Then d = d & "\"
    AvecBarre = d
End Function

Private Sub Lancer(ByVal macro As String)
    On Error GoTo Erreur
    Application.Run "'" & ThisWorkbook.Name & "'!" & macro
    Exit Sub
Erreur:
    MsgBox "La macro " & macro & " n'a pas pu etre lancee : " & Err.Description & vbCrLf & _
           "Verifie que les modules M01_LOGYS, M03_EXPORT et modPilotageLive sont bien dans ce classeur.", vbExclamation, TITRE
End Sub

Private Function DossiersOk() As Boolean
    Dim a As String, b As String, c As Range
    On Error Resume Next
    a = CStr(ThisWorkbook.Names(NOM_DOSSIER_LIVE).RefersToRange.Value)
    On Error GoTo 0
    Set c = CelluleDossierPilotage()
    If c Is Nothing Then
        MsgBox "La feuille " & FEUILLE_PILOTAGE & " est absente de ce classeur." & vbCrLf & _
               "Copie-la depuis l'ancien classeur Pilotage (clic droit sur l'onglet > Deplacer ou copier).", vbExclamation, TITRE
        Exit Function
    End If
    b = CStr(c.Value)
    If SansBarre(a) <> SansBarre(b) Or Len(SansBarre(a)) = 0 Then
        MsgBox "Les deux fichiers ne sont pas ecrits dans le meme dossier :" & vbCrLf & vbCrLf & _
               "data.js : " & a & vbCrLf & "pilotage_data.js : " & b & vbCrLf & vbCrLf & _
               "Enregistre ce classeur sur le disque du PC, dans le dossier de pilotage.html, puis relance.", vbExclamation, TITRE
        Exit Function
    End If
    DossiersOk = True
End Function

Private Function CelluleDossierPilotage() As Range
    Dim ws As Worksheet, r As Long
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(FEUILLE_PILOTAGE)
    On Error GoTo 0
    If ws Is Nothing Then Exit Function
    For r = 1 To 80
        If UCase$(Trim$(CStr(ws.Cells(r, 1).Value))) = CLE_DOSSIER_PILOTAGE Then
            Set CelluleDossierPilotage = ws.Cells(r, 2)
            Exit Function
        End If
    Next r
End Function

Private Function SansBarre(ByVal s As String) As String
    s = LCase$(Trim$(s))
    Do While Right$(s, 1) = "\" Or Right$(s, 1) = "/"
        s = Left$(s, Len(s) - 1)
    Loop
    SansBarre = s
End Function
