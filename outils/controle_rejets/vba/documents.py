"""Code des modules de document (ThisWorkbook et feuilles), relié au module modRejets."""

THISWORKBOOK = """Option Explicit
Private Sub Workbook_Open()
    modRejets.Ouverture
End Sub
Private Sub Workbook_BeforeSave(ByVal SaveAsUI As Boolean, Cancel As Boolean)
    modRejets.AvantEnregistrement
End Sub
Private Sub Workbook_BeforeClose(Cancel As Boolean)
    modRejets.Fermeture
End Sub
"""

SAISIE = """Option Explicit
Private Sub Worksheet_Change(ByVal Target As Range)
    modRejets.SurChangementSaisie Target
End Sub
Private Sub Worksheet_Activate()
    modRejets.ControleJour
End Sub
"""

TDB = """Option Explicit
Private Sub Worksheet_Activate()
    modRejets.ActualiserTDB
End Sub
Private Sub Worksheet_Change(ByVal Target As Range)
    modRejets.ChangementTDB Target
End Sub
"""

HISTO = """Option Explicit
Private Sub Worksheet_Change(ByVal Target As Range)
    modRejets.SurChangementHisto Target
End Sub
"""

OPE = """Option Explicit
Private Sub Worksheet_Change(ByVal Target As Range)
    modRejets.SurChangementOperateurs Target
End Sub
"""

REGLAGES = """Option Explicit
Private Sub Worksheet_FollowHyperlink(ByVal Target As Hyperlink)
    modRejets.Bouton Target.Range.Address(False, False)
End Sub
"""

VIDE = "Option Explicit\n"

# codeName -> code (l'ordre est celui du projet VBA)
DOCUMENTS = [
    ("ThisWorkbook", THISWORKBOOK, True),
    ("shSaisie", SAISIE, False),
    ("shTdb", TDB, False),
    ("shHisto", HISTO, False),
    ("shSynth", VIDE, False),
    ("shOpe", OPE, False),
    ("shReglages", REGLAGES, False),
    ("shCalc", VIDE, False),
]
