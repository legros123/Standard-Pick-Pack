Attribute VB_Name = "modPickPackLive"
Option Explicit
' =====================================================================================
'  PICK & PACK LIVE - un seul classeur, un seul module, un seul fichier de sortie.
'  Lit les tableaux du classeur (PARAMETRES, EQUIPE, TOURNEES, DECELEES, VAGUES,
'  SERVICES, HISTORIQUE) et ecrit "data.js" dans le dossier de pilotage.html.
'  Avec logys = OUI dans PARAMETRES, il remplit d'abord TOURNEES, SERVICES, les rejets
'  et les colis depuis Logys (ODBC, SELECT uniquement).
'  Macros a lancer (Alt+F8) : DemarrerLive, ArreterLive, ExporterMaintenant.
'  Aucune ecriture dans Logys : lecture seule.
' =====================================================================================

Private Const F_LIVE As String = "LIVE"
Private Const F_PARAM As String = "PARAMETRES"
Private Const CELL_ETAT As String = "B4"
Private Const CELL_DERNIER As String = "B5"
Private Const NOM_FICHIER As String = "data.js"
Private Const INTERVALLE_MIN As Long = 15          ' secondes : jamais plus rapide
Private Const JOURS_HISTO_ALLEES As Long = 7
Private Const NB_JOURS_HIST As Long = 30

Private mProchain As Date
Private mActif As Boolean
Private mP As Object                               ' parametres : cle -> valeur
Private mCn As Object                              ' connexion Logys, gardee ouverte entre deux exports
Private mActifs As Object                          ' matricules vus au picking (tournee en cours ou finie depuis peu)
Private mRejetsLogys As Double                     ' -1 = non lu dans Logys
Private mContLogys As Double                       ' -1 = non lu dans Logys
Private mLogysMsg As String
Private Const ACTIF_MIN As Double = 60             ' minutes : un operateur est "present" s'il a fini une tournee depuis moins que cela
Private Const DSN_DEFAUT As String = "LOGP.DR-NORD.REXEL.FR"
Private Const VUE_DEFAUT As String = "REXEL.F_GESTOURPREP_TOUR"

' ------------------------------- commandes -------------------------------------------
Public Sub DemarrerLive()
    mActif = True
    TickLive
End Sub

Public Sub ArreterLive()
    On Error Resume Next
    If mProchain <> 0 Then Application.OnTime mProchain, "modPickPackLive.TickLive", , False
    On Error GoTo 0
    mActif = False
    mProchain = 0
    FermerLogys
    Etat "Arrete"
End Sub

Public Sub TickLive()
    Dim pas As Long
    ExporterMaintenant
    If Not mActif Then Exit Sub
    pas = CLng(ParamNum("intervalle_s", 60))
    If pas < INTERVALLE_MIN Then pas = INTERVALLE_MIN
    mProchain = Now + pas / 86400#
    Application.OnTime mProchain, "modPickPackLive.TickLive"
End Sub

' Pas de MsgBox ici : la macro tourne seule toutes les minutes, une boite de dialogue
' bloquerait l'ecran de l'atelier. L'etat est ecrit dans la feuille LIVE.
Public Sub ExporterMaintenant()
    Dim js As String, dossier As String
    On Error GoTo Erreur
    ChargerParams
    If Oui(Param("rafraichir_requetes")) Then
        On Error Resume Next
        ThisWorkbook.RefreshAll
        DoEvents
        On Error GoTo Erreur
    End If
    mRejetsLogys = -1: mContLogys = -1: mLogysMsg = ""
    If Oui(Param("logys")) Then
        ImporterLogys
        On Error GoTo Erreur
        If Len(mLogysMsg) = 0 Then mLogysMsg = "Logys OK"
    End If
    js = "window.PP_DATA = " & ConstruireDonnees() & ";" & vbLf
    dossier = ParamTxt("dossier_sortie", "")
    If Len(dossier) = 0 Then dossier = ThisWorkbook.Path
    If Right$(dossier, 1) <> "\" Then dossier = dossier & "\"
    EcrireUtf8 dossier & NOM_FICHIER, js
    Etat "OK - " & dossier & NOM_FICHIER & IIf(Len(mLogysMsg) > 0, "  |  " & mLogysMsg, "")
    ThisWorkbook.Worksheets(F_LIVE).Range(CELL_DERNIER).Value = Now
    Exit Sub
Erreur:
    Etat "ERREUR " & Err.Number & " : " & Err.Description
End Sub

' ------------------------------- construction ----------------------------------------
Private Function ConstruireDonnees() As String
    Dim b As New Collection
    Dim aujourdhui As Date
    Dim fait As Double, restant As Double, contFaits As Double
    Dim nbF As Long, nbL As Long, nbC As Long
    Dim heures As Object, decMat As Object, typesJ As Object, alleesJ As Object
    Dim typesH As Object, alleesH As Object
    Dim totJ As Long, totH As Long
    Dim sTours As String, sEquipe As String

    aujourdhui = Date
    Set heures = NouveauDico()
    Set mActifs = NouveauDico()
    Set decMat = NouveauDico(): Set typesJ = NouveauDico(): Set alleesJ = NouveauDico()
    Set typesH = NouveauDico(): Set alleesH = NouveauDico()

    sTours = JsonTours(aujourdhui, fait, restant, contFaits, nbF, nbL, nbC, heures)   ' avant l'equipe : repere qui est actif
    If mContLogys >= 0 Then contFaits = mContLogys
    sEquipe = JsonEquipe()
    LireDecelees aujourdhui, decMat, typesJ, alleesJ, typesH, alleesH, totJ, totH

    b.Add """genere"":" & JStr(IsoDT(Now))
    b.Add """jour"":{""date"":" & JStr(Format$(aujourdhui, "yyyy-mm-dd")) & ",""debut"":" & JStr(ParamHeure("debut", "13:06")) & _
          ",""fin"":" & JStr(ParamHeure("fin", "21:00")) & ",""pauses"":" & JsonPauses() & "}"
    b.Add """params"":{""heures_pointees"":" & JNum(ParamNum("heures_pointees", 7.4)) & ",""cadence_defaut"":" & JNum(ParamNum("cadence_defaut", 50)) & _
          ",""fin_prevision"":" & JStr(ParamHeure("fin_prevision", "18:20")) & "}"
    b.Add """seuils"":" & JsonSeuils()
    b.Add """saisie"":{""prevu"":" & JNum(ParamNum("prevu", 0)) & "}"
    b.Add """equipe"":" & sEquipe
    b.Add """tours"":" & sTours
    b.Add """rejets"":" & JNum(RejetsJour())
    b.Add """decelees"":" & JsonDicoListe(decMat, "mat", "n")
    b.Add JsonHistorique(aujourdhui)
    b.Add """pilotage"":" & JsonPilotage(aujourdhui, fait, restant, contFaits, nbF, nbL, nbC, heures, typesJ, alleesJ, typesH, alleesH, totJ, totH)
    ConstruireDonnees = "{" & Joindre(b, "," & vbLf) & "}"
End Function

Private Function JsonPauses() As String
    Dim b As New Collection, i As Long, d As String, f As String
    For i = 1 To 3
        d = ParamHeure("pause" & i & "_debut", "")
        f = ParamHeure("pause" & i & "_fin", "")
        If Len(d) > 0 And Len(f) > 0 Then b.Add "[" & JStr(d) & "," & JStr(f) & "]"
    Next i
    JsonPauses = "[" & Joindre(b, ",") & "]"
End Function

Private Function JsonSeuils() As String
    Dim b As New Collection, k As Variant, defauts As Variant, i As Long
    k = Array("avance_stable", "retard_critique", "rej_orange", "rej_rouge", "dec_orange", "dec_rouge", "vig_orange", "vig_rouge", "obj_lignes_op", "obj_ppm_averee")
    defauts = Array(10, 0, 120, 140, 15, 20, 3, 5, 620, 220)
    For i = LBound(k) To UBound(k)
        b.Add JStr(CStr(k(i))) & ":" & JNum(ParamNum(CStr(k(i)), CDbl(defauts(i))))
    Next i
    JsonSeuils = "{" & Joindre(b, ",") & "}"
End Function

Private Function JsonEquipe() As String
    Dim v As Variant, lo As ListObject, b As New Collection, i As Long
    Dim cMat As Long, cRole As Long, cPres As Long, cSorti As Long, cRev As Long, cCoef As Long, cCad As Long
    Dim vus As Object, mat As String, pres As Boolean, k As Variant, sp As String
    Set vus = NouveauDico()
    Set lo = Tableau("EQUIPE", "tblEquipe")
    v = Corps(lo)
    If IsArray(v) Then
        cMat = Col(lo, "Matricule"): cRole = Col(lo, "Role"): cPres = Col(lo, "Present")
        cSorti = Col(lo, "Sorti"): cRev = Col(lo, "Revenu"): cCoef = Col(lo, "Coef"): cCad = Col(lo, "Cadence")
        For i = 1 To UBound(v, 1)
            mat = Matricule(v(i, cMat))
            If Len(mat) > 0 Then
                vus(mat) = 1
                ' Present = OUI / NON force la valeur ; AUTO ou vide = present s'il prepare en ce moment dans Logys
                sp = ""
                If Not Vide(v(i, cPres)) Then sp = UCase$(Trim$(CStr(v(i, cPres))))
                If sp = "" Or sp = "AUTO" Then pres = mActifs.Exists(mat) Else pres = Oui(v(i, cPres))
                b.Add "{""mat"":" & JStr(mat) & ",""role"":" & JStr(Txt(v(i, cRole))) & _
                      ",""present"":" & IIf(pres, "true", "false") & _
                      ",""sorti"":" & JHeureOuNull(v(i, cSorti)) & ",""revenu"":" & JHeureOuNull(v(i, cRev)) & _
                      ",""coef"":" & JNum(NumDef(v(i, cCoef), 1)) & ",""cadence"":" & JNum(NumDef(v(i, cCad), ParamNum("cadence_defaut", 50))) & "}"
            End If
        Next i
    End If
    ' un operateur actif dans Logys mais absent de la feuille EQUIPE compte quand meme, a la cadence par defaut
    For Each k In mActifs.Keys
        If Not vus.Exists(CStr(k)) Then
            b.Add "{""mat"":" & JStr(CStr(k)) & ",""role"":""Picking"",""present"":true,""sorti"":null,""revenu"":null,""coef"":1,""cadence"":" & JNum(ParamNum("cadence_defaut", 50)) & "}"
        End If
    Next k
    JsonEquipe = "[" & Joindre(b, "," & vbLf) & "]"
End Function

' Tournees : ecrit la liste et cumule au passage ce qui sert a la page "La journee".
Private Function JsonTours(ByVal aujourdhui As Date, ByRef fait As Double, ByRef restant As Double, ByRef contFaits As Double, _
                           ByRef nbF As Long, ByRef nbL As Long, ByRef nbC As Long, ByVal heures As Object) As String
    Dim v As Variant, lo As ListObject, b As New Collection, i As Long
    Dim cNum As Long, cEtat As Long, cType As Long, cLig As Long, cTr As Long, cAn As Long, cOp As Long, cDeb As Long, cFin As Long, cColis As Long
    Dim k As String, l As Double, t As Double, a As Double, dFin As Variant, lignesFaites As Double, op As String
    Set lo = Tableau("TOURNEES", "tblTournees")
    v = Corps(lo)
    If IsArray(v) Then
        cNum = Col(lo, "Numero"): cEtat = Col(lo, "Etat"): cType = Col(lo, "Type"): cLig = Col(lo, "Lignes")
        cTr = Col(lo, "Traitees"): cAn = Col(lo, "Annulees"): cOp = Col(lo, "Operateur"): cDeb = Col(lo, "Debut")
        cFin = Col(lo, "Fin"): cColis = Col(lo, "Colis")
        For i = 1 To UBound(v, 1)
            k = CodeEtat(v(i, cEtat))
            If Len(k) > 0 Then
                l = Num(v(i, cLig)): t = Num(v(i, cTr)): a = Num(v(i, cAn))
                op = Matricule(v(i, cOp))
                If UCase$(op) = "AQ" Then op = ""              ' AQ = tournee pas encore prise
                Select Case k
                    Case "F"
                        If t > 0 Then lignesFaites = t Else lignesFaites = Max0(l - a)
                        fait = fait + lignesFaites
                        contFaits = contFaits + Num(v(i, cColis))
                        nbF = nbF + 1
                        dFin = DateHeure(v(i, cFin), aujourdhui)
                        If Not IsEmpty(dFin) Then
                            If Int(CDbl(dFin)) = CLng(aujourdhui) Then Ajouter heures, CStr(Hour(dFin)), lignesFaites
                            If Len(op) > 0 And (CDbl(Now) - CDbl(dFin)) * 1440# <= ACTIF_MIN Then mActifs(op) = 1
                        End If
                    Case "L"
                        restant = restant + Max0(l - a - t): nbL = nbL + 1
                    Case "C"
                        restant = restant + Max0(l - a - t): nbC = nbC + 1
                        If Len(op) > 0 Then mActifs(op) = 1
                End Select
                b.Add "{""n"":" & JStr(Txt(v(i, cNum))) & ",""k"":" & JStr(k) & ",""st"":" & JStr(Txt(v(i, cType))) & _
                      ",""l"":" & JNum(l) & ",""t"":" & JNum(t) & ",""a"":" & JNum(a) & ",""op"":" & JStr(op) & _
                      ",""deb"":" & JDateHeureOuNull(v(i, cDeb), aujourdhui) & "}"
            End If
        Next i
    End If
    JsonTours = "[" & Joindre(b, "," & vbLf) & "]"
End Function

Private Sub LireDecelees(ByVal aujourdhui As Date, ByVal decMat As Object, ByVal typesJ As Object, ByVal alleesJ As Object, _
                         ByVal typesH As Object, ByVal alleesH As Object, ByRef totJ As Long, ByRef totH As Long)
    Dim v As Variant, lo As ListObject, i As Long, d As Variant
    Dim cDate As Long, cMat As Long, cType As Long, cAllee As Long, jour As Long, al As String, ty As String
    Set lo = Tableau("DECELEES", "tblDecelees")
    v = Corps(lo)
    If Not IsArray(v) Then Exit Sub
    cDate = Col(lo, "Date"): cMat = Col(lo, "Matricule"): cType = Col(lo, "Type"): cAllee = Col(lo, "Allee")
    For i = 1 To UBound(v, 1)
        d = DateHeure(v(i, cDate), aujourdhui)
        If Not IsEmpty(d) Then
            jour = Int(CDbl(d))
            al = Allee(v(i, cAllee)): ty = Txt(v(i, cType))
            If jour = CLng(aujourdhui) Then
                totJ = totJ + 1
                If Len(Matricule(v(i, cMat))) > 0 Then Ajouter decMat, Matricule(v(i, cMat)), 1
                If Len(ty) > 0 Then Ajouter typesJ, ty, 1
                If Len(al) > 0 Then Ajouter alleesJ, al, 1
            End If
            If jour <= CLng(aujourdhui) And jour > CLng(aujourdhui) - JOURS_HISTO_ALLEES Then
                totH = totH + 1
                If Len(ty) > 0 Then Ajouter typesH, ty, 1
                If Len(al) > 0 Then Ajouter alleesH, al, 1
            End If
        End If
    Next i
End Sub

' hist (30 derniers jours), mois et dec_mois pour la page "Les indicateurs"
Private Function JsonHistorique(ByVal aujourdhui As Date) As String
    Dim v As Variant, lo As ListObject, bH As New Collection, bD As New Collection, i As Long, debut As Long
    Dim cDate As Long, cProd As Long, cPpm As Long, cRej As Long, cDec As Long
    Dim d As Variant, sProd As Double, sPpm As Double, nMois As Long, iso As String
    Set lo = Tableau("HISTORIQUE", "tblHisto")
    v = Corps(lo)
    If IsArray(v) Then
        cDate = Col(lo, "Date"): cProd = Col(lo, "Prod"): cPpm = Col(lo, "PPM"): cRej = Col(lo, "Rejets"): cDec = Col(lo, "Decelees")
        debut = UBound(v, 1) - NB_JOURS_HIST + 1
        If debut < 1 Then debut = 1
        For i = 1 To UBound(v, 1)
            d = DateHeure(v(i, cDate), aujourdhui)
            If Not IsEmpty(d) Then
                If Int(CDbl(d)) < CLng(aujourdhui) Then
                    iso = Format$(CDate(d), "yyyy-mm-dd")
                    If i >= debut Then bH.Add "{""d"":" & JStr(iso) & ",""prod"":" & JNum(Num(v(i, cProd))) & ",""ppm"":" & JNum(Num(v(i, cPpm))) & ",""rej"":" & JNumOuNull(v(i, cRej)) & "}"
                    If Year(d) = Year(aujourdhui) And Month(d) = Month(aujourdhui) Then
                        bD.Add "{""d"":" & JStr(iso) & ",""n"":" & JNum(Num(v(i, cDec))) & "}"
                        sProd = sProd + Num(v(i, cProd)): sPpm = sPpm + Num(v(i, cPpm)): nMois = nMois + 1
                    End If
                End If
            End If
        Next i
    End If
    If nMois = 0 Then nMois = 1
    JsonHistorique = """hist"":[" & Joindre(bH, "," & vbLf) & "]," & vbLf & _
        """mois"":{""nom"":" & JStr(StrConv(MonthName(Month(aujourdhui)), vbProperCase)) & _
        ",""prod"":" & JNum(Round(ParamNum("mois_prod", sProd / nMois), 0)) & ",""ppm"":" & JNum(Round(ParamNum("mois_ppm", sPpm / nMois), 0)) & "}," & vbLf & _
        """dec_mois"":[" & Joindre(bD, ",") & "]"
End Function

' Bloc "pilotage" : journee, vagues, services, allees, securite
Private Function JsonPilotage(ByVal aujourdhui As Date, ByVal fait As Double, ByVal restant As Double, ByVal contFaits As Double, _
                              ByVal nbF As Long, ByVal nbL As Long, ByVal nbC As Long, ByVal heures As Object, _
                              ByVal typesJ As Object, ByVal alleesJ As Object, ByVal typesH As Object, ByVal alleesH As Object, _
                              ByVal totJ As Long, ByVal totH As Long) As String
    Dim b As New Collection, aLancer As Double, jsa As Variant, sSecu As String, bH As New Collection, k As Variant, dAcc As Variant
    aLancer = 0
    If TimeValue(Now) < HeureEnJour(ParamHeure("fin_prevision", "18:20")) Then aLancer = Max0(ParamNum("prevu", 0) - fait - restant)

    b.Add """v"":1,""source"":""EXCEL"",""maj"":" & JStr(IsoDT(Now))
    b.Add """cfg"":{""site"":" & JStr(ParamTxt("site", "CLR Champigneulles")) & ",""debut"":" & JStr(ParamHeure("debut", "13:06")) & _
          ",""finVisee"":" & JStr(ParamHeure("fin", "21:00")) & ",""pauses"":" & JsonPauses() & ",""inclureALancer"":true" & _
          ",""rejetsMax"":" & JNum(ParamNum("rej_orange", 120)) & ",""decOrange"":" & JNum(ParamNum("dec_orange", 15)) & ",""decRouge"":" & JNum(ParamNum("dec_rouge", 20)) & "}"
    b.Add """charge"":{""fait"":" & JNum(fait) & ",""restant"":" & JNum(restant) & ",""aLancer"":" & JNum(aLancer) & _
          ",""contFaits"":" & IIf(contFaits > 0, JNum(contFaits), "null") & ",""tourneesFaites"":" & nbF & ",""tourneesOuvertes"":" & (nbL + nbC) & ",""tourneesLibres"":" & nbL & "}"
    For Each k In heures.Keys
        bH.Add "{""h"":" & k & ",""lignes"":" & JNum(heures(k)) & "}"
    Next k
    b.Add """heures"":[" & Joindre(bH, ",") & "]"
    b.Add """vagues"":" & JsonVagues()
    b.Add """services"":" & JsonServices()
    b.Add """rejets"":{""total"":" & JNum(RejetsJour()) & "}"
    b.Add """decelees"":{""total"":" & totJ & ",""types"":" & JsonDicoObjet(typesJ) & ",""allees"":" & JsonDicoObjet(alleesJ) & _
          ",""hist"":{""jours"":" & JOURS_HISTO_ALLEES & ",""total"":" & totH & ",""allees"":" & JsonDicoObjet(alleesH) & ",""types"":" & JsonDicoObjet(typesH) & "}}"
    b.Add """historique"":" & JsonHistoPilotage(aujourdhui)
    dAcc = DateHeure(Param("dernier_accident"), aujourdhui)
    If IsEmpty(dAcc) Then jsa = "null" Else jsa = CStr(CLng(aujourdhui) - Int(CDbl(dAcc)))
    sSecu = "{""joursSansAccident"":" & jsa & ",""message"":" & JStr(ParamTxt("message_securite", "")) & "}"
    b.Add """securite"":" & sSecu
    JsonPilotage = "{" & Joindre(b, "," & vbLf) & "}"
End Function

Private Function JsonVagues() As String
    Dim v As Variant, lo As ListObject, b As New Collection, i As Long
    Dim cH As Long, cN As Long, cPrev As Long, cPrep As Long, cRupt As Long
    Set lo = Tableau("VAGUES", "tblVagues")
    v = Corps(lo)
    If IsArray(v) Then
        cH = Col(lo, "Heure"): cN = Col(lo, "Numero"): cPrev = Col(lo, "Lignes_prevues"): cPrep = Col(lo, "Lignes_preparees"): cRupt = Col(lo, "Ruptures")
        For i = 1 To UBound(v, 1)
            If Num(v(i, cPrev)) > 0 Then
                b.Add "{""heure"":" & JStr(HeureTxt(v(i, cH))) & ",""num"":" & JStr(Txt(v(i, cN))) & ",""ligPrev"":" & JNum(Num(v(i, cPrev))) & _
                      ",""ligPrep"":" & JNum(Num(v(i, cPrep))) & ",""ligRupt"":" & JNum(Num(v(i, cRupt))) & "}"
            End If
        Next i
    End If
    JsonVagues = "[" & Joindre(b, ",") & "]"
End Function

Private Function JsonServices() As String
    Dim v As Variant, lo As ListObject, b As New Collection, i As Long, cS As Long, cF As Long, cR As Long
    Set lo = Tableau("SERVICES", "tblServices")
    v = Corps(lo)
    If IsArray(v) Then
        cS = Col(lo, "Service"): cF = Col(lo, "Fait"): cR = Col(lo, "Restant")
        For i = 1 To UBound(v, 1)
            If Len(Txt(v(i, cS))) > 0 Then b.Add "{""lib"":" & JStr(Txt(v(i, cS))) & ",""fait"":" & JNum(Num(v(i, cF))) & ",""restant"":" & JNum(Num(v(i, cR))) & "}"
        Next i
    End If
    JsonServices = "[" & Joindre(b, ",") & "]"
End Function

' Historique pour "Fierte d'equipe" : lignes du jour et nombre de preparateurs
Private Function JsonHistoPilotage(ByVal aujourdhui As Date) As String
    Dim v As Variant, lo As ListObject, b As New Collection, i As Long, d As Variant
    Dim cDate As Long, cLig As Long, cOps As Long, cDec As Long, cRej As Long, cPpm As Long, lig As Double
    Set lo = Tableau("HISTORIQUE", "tblHisto")
    v = Corps(lo)
    If IsArray(v) Then
        cDate = Col(lo, "Date"): cLig = Col(lo, "Lignes"): cOps = Col(lo, "Ops"): cDec = Col(lo, "Decelees"): cRej = Col(lo, "Rejets"): cPpm = Col(lo, "PPM")
        For i = 1 To UBound(v, 1)
            d = DateHeure(v(i, cDate), aujourdhui)
            lig = Num(v(i, cLig))
            If Not IsEmpty(d) And lig > 0 Then
                If Int(CDbl(d)) < CLng(aujourdhui) Then
                    b.Add "{""d"":" & JStr(Format$(CDate(d), "yyyy-mm-dd")) & ",""lignes"":" & JNum(lig) & ",""ops"":" & JNum(Num(v(i, cOps))) & _
                          ",""ed"":" & JNum(Num(v(i, cDec))) & ",""ea"":" & JNum(Round(Num(v(i, cPpm)) * lig / 1000000#, 0)) & ",""rejets"":" & JNumOuNull(v(i, cRej)) & "}"
                End If
            End If
        Next i
    End If
    JsonHistoPilotage = "[" & Joindre(b, ",") & "]"
End Function

' ------------------------------- Logys (lecture seule) --------------------------------
' Remplit TOURNEES et SERVICES, lit les rejets et les colis du convoyeur.
' Une panne Logys ne bloque pas l'export : on garde le contenu des feuilles et on le signale.
Private Sub ImporterLogys()
    Dim vue As String, ouvert As String, d As Variant
    On Error GoTo Erreur
    vue = ParamTxt("vue_tournees", VUE_DEFAUT)
    ouvert = "(t.L_ETAT_TOUR IN ('LANCEE','ENCOURS','PRELEVE') OR t.DAT_MAJ >= TRUNC(SYSDATE))"
    OuvrirLogys
    Application.ScreenUpdating = False

    d = LireLogys("SELECT t.NUM_TOUR, t.L_ETAT_TOUR, t.L_STYP_TOUR, NVL(t.NB_LIG_PREV,0), NVL(t.NB_LIG_TERM,0), NVL(t.NB_LIG_ANNU,0), " & _
                  "t.OPE_MAJ, TO_CHAR(t.DAT_MAJ,'YYYY-MM-DD HH24:MI:SS'), NVL(t.NB_CONT_TERM,0) " & _
                  "FROM " & vue & " t WHERE t.L_TYP_TOUR = 'PREPAR' AND UPPER(TRIM(t.L_STYP_TOUR)) IN ('DETAIL','CARTON') " & _
                  "AND " & ouvert & " ORDER BY t.NUM_TOUR")
    EcrireTournees d

    d = LireLogys("SELECT CASE WHEN UPPER(TRIM(t.L_STYP_TOUR)) = 'CABLE' THEN 'CABLE' ELSE 'HG' END, " & _
                  "SUM(CASE WHEN t.DAT_MAJ >= TRUNC(SYSDATE) THEN NVL(t.NB_LIG_TERM,0) ELSE 0 END), " & _
                  "SUM(CASE WHEN t.L_ETAT_TOUR IN ('LANCEE','ENCOURS') THEN GREATEST(0, NVL(t.NB_LIG_PREV,0) - NVL(t.NB_LIG_TERM,0) - NVL(t.NB_LIG_ANNU,0)) ELSE 0 END) " & _
                  "FROM " & vue & " t WHERE t.L_TYP_TOUR = 'PREPAR' AND UPPER(TRIM(t.L_STYP_TOUR)) NOT IN ('DETAIL','CARTON') " & _
                  "AND " & ouvert & " GROUP BY CASE WHEN UPPER(TRIM(t.L_STYP_TOUR)) = 'CABLE' THEN 'CABLE' ELSE 'HG' END ORDER BY 1")
    EcrireServices d

    d = LireLogys("SELECT (SELECT NVL(SUM(t.NB_CONT_TERM),0) FROM " & vue & " t WHERE t.L_TYP_TOUR = 'PREPAR' " & _
                  "AND t.L_STYP_TOUR IN ('DETAIL','CARTON') AND TRUNC(t.DAT_MAJ) = TRUNC(SYSDATE)), " & _
                  "(SELECT COUNT(DISTINCT cr.NUM_CONT) FROM CR_STOCK cr WHERE cr.COD_TABLE = 'CONTENANT' AND cr.TYP_CR_STOCK = 'REJE' " & _
                  "AND cr.COD_MOTIF = 'PDS' AND TRUNC(cr.DAT_CREA) = TRUNC(SYSDATE)) FROM DUAL")
    If IsArray(d) Then
        mContLogys = NumDef(d(0, 0), -1)
        mRejetsLogys = NumDef(d(1, 0), -1)
    End If
Sortie:
    Application.ScreenUpdating = True
    Exit Sub
Erreur:
    mLogysMsg = "LOGYS INDISPONIBLE (" & Err.Description & ") : feuilles non actualisees"
    FermerLogys
    Resume Sortie
End Sub

Private Sub OuvrirLogys()
    If Not mCn Is Nothing Then
        If mCn.State = 1 Then Exit Sub
    End If
    Set mCn = CreateObject("ADODB.Connection")
    mCn.ConnectionTimeout = 15
    mCn.CommandTimeout = 60
    mCn.Properties("Prompt") = 2                   ' le pilote ODBC ne demande l'identifiant que s'il manque
    mCn.Open "DSN=" & ParamTxt("dsn_logys", DSN_DEFAUT)
End Sub

Private Sub FermerLogys()
    On Error Resume Next
    If Not mCn Is Nothing Then
        If mCn.State = 1 Then mCn.Close
    End If
    Set mCn = Nothing
    On Error GoTo 0
End Sub

' Resultat d'un SELECT : tableau (colonne, ligne) a partir de 0, ou Empty s'il n'y a aucune ligne
Private Function LireLogys(ByVal sql As String) As Variant
    Dim rs As Object
    Set rs = mCn.Execute(sql)
    If rs.EOF Then LireLogys = Empty Else LireLogys = rs.GetRows
    rs.Close
End Function

Private Sub EcrireTournees(ByVal d As Variant)
    Dim lo As ListObject, a() As Variant, n As Long, i As Long, k As String, op As String
    Dim cNum As Long, cEtat As Long, cType As Long, cLig As Long, cTr As Long, cAn As Long, cOp As Long, cDeb As Long, cFin As Long, cColis As Long
    Set lo = Tableau("TOURNEES", "tblTournees")
    If Not IsArray(d) Then
        EcrireTable lo, Empty, 0
        Exit Sub
    End If
    cNum = Col(lo, "Numero"): cEtat = Col(lo, "Etat"): cType = Col(lo, "Type"): cLig = Col(lo, "Lignes")
    cTr = Col(lo, "Traitees"): cAn = Col(lo, "Annulees"): cOp = Col(lo, "Operateur"): cDeb = Col(lo, "Debut")
    cFin = Col(lo, "Fin"): cColis = Col(lo, "Colis")
    n = UBound(d, 2) + 1
    ReDim a(1 To n, 1 To lo.ListColumns.Count)
    For i = 1 To n
        k = CodeEtat(d(1, i - 1))
        op = ""
        If Not Vide(d(6, i - 1)) Then op = Trim$(CStr(d(6, i - 1)))
        If UCase$(op) = "AQ" Then op = ""
        a(i, cNum) = Txt(d(0, i - 1))
        a(i, cEtat) = k
        a(i, cType) = Txt(d(2, i - 1))
        a(i, cLig) = Num(d(3, i - 1))
        a(i, cTr) = Num(d(4, i - 1))
        a(i, cAn) = Num(d(5, i - 1))
        a(i, cOp) = op
        ' Logys ne donne que la derniere mise a jour : elle sert de debut pour une tournee en cours, de fin pour une tournee faite
        If k = "C" Then a(i, cDeb) = Txt(d(7, i - 1))
        If k = "F" Then a(i, cFin) = Txt(d(7, i - 1))
        a(i, cColis) = Num(d(8, i - 1))
    Next i
    EcrireTable lo, a, n
End Sub

Private Sub EcrireServices(ByVal d As Variant)
    Dim lo As ListObject, a() As Variant, n As Long, i As Long
    Set lo = Tableau("SERVICES", "tblServices")
    If Not IsArray(d) Then
        EcrireTable lo, Empty, 0
        Exit Sub
    End If
    n = UBound(d, 2) + 1
    ReDim a(1 To n, 1 To lo.ListColumns.Count)
    For i = 1 To n
        If Txt(d(0, i - 1)) = "CABLE" Then a(i, Col(lo, "Service")) = "C" & ChrW$(226) & "ble" Else a(i, Col(lo, "Service")) = "Hors gabarit"
        a(i, Col(lo, "Fait")) = Num(d(1, i - 1))
        a(i, Col(lo, "Restant")) = Num(d(2, i - 1))
    Next i
    EcrireTable lo, a, n
End Sub

' Remplace tout le contenu d'un tableau structure par n lignes (lecture en bloc, ecriture en bloc)
Private Sub EcrireTable(ByVal lo As ListObject, ByVal a As Variant, ByVal n As Long)
    If Not lo.DataBodyRange Is Nothing Then lo.DataBodyRange.ClearContents
    If n <= 0 Then
        lo.Resize lo.HeaderRowRange.Resize(2)
        Exit Sub
    End If
    lo.Resize lo.HeaderRowRange.Resize(n + 1)
    lo.DataBodyRange.Value2 = a
End Sub

Private Function RejetsJour() As Double
    If mRejetsLogys >= 0 Then RejetsJour = mRejetsLogys Else RejetsJour = ParamNum("rejets_jour", 0)
End Function

' ------------------------------- parametres ------------------------------------------
Private Sub ChargerParams()
    Dim v As Variant, lo As ListObject, i As Long, cK As Long, cV As Long, k As String
    Set mP = NouveauDico()
    Set lo = Tableau(F_PARAM, "tblParam")
    v = Corps(lo)
    If Not IsArray(v) Then Exit Sub
    cK = Col(lo, "Cle"): cV = Col(lo, "Valeur")
    For i = 1 To UBound(v, 1)
        k = LCase$(Trim$(CStr(v(i, cK))))
        If Len(k) > 0 Then mP(k) = v(i, cV)
    Next i
End Sub

Private Function Param(ByVal cle As String) As Variant
    If mP Is Nothing Then ChargerParams
    If mP.Exists(cle) Then Param = mP(cle) Else Param = Empty
End Function

Private Function ParamNum(ByVal cle As String, ByVal defaut As Double) As Double
    ParamNum = NumDef(Param(cle), defaut)
End Function

Private Function ParamTxt(ByVal cle As String, ByVal defaut As String) As String
    Dim v As Variant, s As String
    v = Param(cle)
    If Not Vide(v) Then s = Trim$(CStr(v))
    If Len(s) = 0 Then s = defaut
    ParamTxt = s
End Function

Private Function ParamHeure(ByVal cle As String, ByVal defaut As String) As String
    Dim s As String
    s = HeureTxt(Param(cle))
    If Len(s) = 0 Then s = defaut
    ParamHeure = s
End Function

' ------------------------------- tableaux --------------------------------------------
Private Function Tableau(ByVal feuille As String, ByVal nom As String) As ListObject
    Set Tableau = ThisWorkbook.Worksheets(feuille).ListObjects(nom)
End Function

Private Function Corps(ByVal lo As ListObject) As Variant
    If lo.DataBodyRange Is Nothing Then
        Corps = Empty
    Else
        Corps = lo.DataBodyRange.Value2
    End If
End Function

Private Function Col(ByVal lo As ListObject, ByVal nom As String) As Long
    Col = lo.ListColumns(nom).Index
End Function

' ------------------------------- conversions -----------------------------------------
Private Function NouveauDico() As Object
    Dim d As Object
    Set d = CreateObject("Scripting.Dictionary")
    d.CompareMode = vbTextCompare                  ' matricules et types : la casse ne compte pas
    Set NouveauDico = d
End Function

Private Sub Ajouter(ByVal d As Object, ByVal cle As String, ByVal n As Double)
    If d.Exists(cle) Then d(cle) = d(cle) + n Else d(cle) = n
End Sub

Private Function Vide(ByVal v As Variant) As Boolean
    If IsError(v) Then
        Vide = True
    ElseIf IsNull(v) Then
        Vide = True
    ElseIf IsEmpty(v) Then
        Vide = True
    Else
        Vide = (Len(Trim$(CStr(v))) = 0)
    End If
End Function

Private Function Num(ByVal v As Variant) As Double
    Num = NumDef(v, 0)
End Function

Private Function NumDef(ByVal v As Variant, ByVal defaut As Double) As Double
    NumDef = defaut
    If Vide(v) Then Exit Function
    If IsNumeric(v) Then NumDef = CDbl(v)
End Function

Private Function Max0(ByVal x As Double) As Double
    If x > 0 Then Max0 = x Else Max0 = 0
End Function

Private Function Txt(ByVal v As Variant) As String
    If Vide(v) Then Exit Function
    If VarType(v) = vbDouble Then
        If v = Int(v) Then Txt = Format$(v, "0") Else Txt = CStr(v)
    Else
        Txt = Trim$(CStr(v))
    End If
End Function

' Matricule : toujours du texte, sur 3 chiffres s'il a ete saisi comme un nombre (17 -> "017")
Private Function Matricule(ByVal v As Variant) As String
    If Vide(v) Then Exit Function
    If VarType(v) = vbDouble Then Matricule = Format$(v, "000") Else Matricule = Trim$(CStr(v))
End Function

Private Function Allee(ByVal v As Variant) As String
    If Vide(v) Then Exit Function
    If IsNumeric(v) Then Allee = Format$(CDbl(v), "00") Else Allee = Trim$(CStr(v))
End Function

Private Function Oui(ByVal v As Variant) As Boolean
    Dim s As String
    If Vide(v) Then Exit Function
    If VarType(v) = vbBoolean Then Oui = v: Exit Function
    s = UCase$(Trim$(CStr(v)))
    Oui = (s = "OUI" Or s = "O" Or s = "1" Or s = "VRAI" Or s = "TRUE" Or s = "X")
End Function

' L = lancee, C = en cours, F = faite. Accepte la lettre, le mot, ou l'etat Logys (LANCEE, ENCOURS, PRELEVE, TERMINEE).
Private Function CodeEtat(ByVal v As Variant) As String
    Dim s As String
    If Vide(v) Then Exit Function
    s = UCase$(Left$(Trim$(CStr(v)), 1))
    Select Case s
        Case "L": CodeEtat = "L"
        Case "C", "E": CodeEtat = "C"
        Case "F", "T", "P": CodeEtat = "F"            ' TERMINEE, PRELEVE : le preparateur a fini
    End Select
End Function

' Heure "hh:mm" a partir d'une cellule heure (nombre) ou d'un texte "13:06" / "13h06"
Private Function HeureTxt(ByVal v As Variant) As String
    Dim s As String, x As Double
    If Vide(v) Then Exit Function
    If VarType(v) = vbDouble Or VarType(v) = vbDate Then
        x = CDbl(v): x = x - Int(x)
        HeureTxt = Format$(CDate(x), "hh:nn")
    Else
        s = Replace(Replace(Trim$(CStr(v)), "h", ":"), "H", ":")
        If IsDate(s) Then HeureTxt = Format$(CDate(s), "hh:nn") Else HeureTxt = s
    End If
End Function

Private Function HeureEnJour(ByVal hhmm As String) As Double
    If IsDate(hhmm) Then HeureEnJour = CDbl(TimeValue(CDate(hhmm))) Else HeureEnJour = 1
End Function

' Date-heure : nombre Excel, texte de date, ou heure seule (alors rattachee a aujourd'hui). Empty si vide.
Private Function DateHeure(ByVal v As Variant, ByVal aujourdhui As Date) As Variant
    Dim x As Double, s As String
    DateHeure = Empty
    If Vide(v) Then Exit Function
    If VarType(v) = vbDouble Or VarType(v) = vbDate Then
        x = CDbl(v)
    Else
        s = Replace(Replace(Trim$(CStr(v)), "h", ":"), "H", ":")
        If Not IsDate(s) Then Exit Function
        x = CDbl(CDate(s))
    End If
    If x < 1 Then x = x + CDbl(aujourdhui)
    DateHeure = CDate(x)
End Function

Private Function IsoDT(ByVal d As Date) As String
    IsoDT = Format$(d, "yyyy-mm-dd") & "T" & Format$(d, "hh:nn:ss")
End Function

' ------------------------------- ecriture JSON ---------------------------------------
Private Function JStr(ByVal s As String) As String
    s = Replace(s, "\", "\\")
    s = Replace(s, """", "\""")
    s = Replace(s, vbCr, " ")
    s = Replace(s, vbLf, " ")
    s = Replace(s, vbTab, " ")
    s = Replace(s, "</", "<\/")
    JStr = """" & s & """"
End Function

' Nombre avec un point decimal, quel que soit le reglage regional d'Excel
Private Function JNum(ByVal x As Double) As String
    Dim s As String
    s = Trim$(Str$(Round(x, 3)))
    If Left$(s, 1) = "." Then s = "0" & s
    If Left$(s, 2) = "-." Then s = "-0" & Mid$(s, 2)
    JNum = s
End Function

Private Function JNumOuNull(ByVal v As Variant) As String
    If Vide(v) Then
        JNumOuNull = "null"
    ElseIf IsNumeric(v) Then
        JNumOuNull = JNum(CDbl(v))
    Else
        JNumOuNull = "null"
    End If
End Function

Private Function JHeureOuNull(ByVal v As Variant) As String
    Dim s As String
    s = HeureTxt(v)
    If Len(s) = 0 Then JHeureOuNull = "null" Else JHeureOuNull = JStr(s)
End Function

Private Function JDateHeureOuNull(ByVal v As Variant, ByVal aujourdhui As Date) As String
    Dim d As Variant
    d = DateHeure(v, aujourdhui)
    If IsEmpty(d) Then JDateHeureOuNull = "null" Else JDateHeureOuNull = JStr(IsoDT(CDate(d)))
End Function

Private Function JsonDicoObjet(ByVal d As Object) As String
    Dim b As New Collection, k As Variant
    For Each k In d.Keys
        b.Add JStr(CStr(k)) & ":" & JNum(d(k))
    Next k
    JsonDicoObjet = "{" & Joindre(b, ",") & "}"
End Function

Private Function JsonDicoListe(ByVal d As Object, ByVal nomCle As String, ByVal nomVal As String) As String
    Dim b As New Collection, k As Variant
    For Each k In d.Keys
        b.Add "{" & JStr(nomCle) & ":" & JStr(CStr(k)) & "," & JStr(nomVal) & ":" & JNum(d(k)) & "}"
    Next k
    JsonDicoListe = "[" & Joindre(b, ",") & "]"
End Function

Private Function Joindre(ByVal c As Collection, ByVal sep As String) As String
    Dim t() As String, i As Long
    If c.Count = 0 Then Exit Function
    ReDim t(1 To c.Count)
    For i = 1 To c.Count
        t(i) = c(i)
    Next i
    Joindre = Join(t, sep)
End Function

' ------------------------------- fichier ---------------------------------------------
' Ecrit d'abord un fichier temporaire puis le renomme : la page ne lit jamais un fichier a moitie ecrit.
Private Sub EcrireUtf8(ByVal chemin As String, ByVal contenu As String)
    Dim st As Object, tmp As String
    tmp = chemin & ".tmp"
    Set st = CreateObject("ADODB.Stream")
    st.Type = 2                                    ' texte
    st.Charset = "utf-8"
    st.Open
    st.WriteText contenu
    st.SaveToFile tmp, 2                           ' ecrase
    st.Close
    On Error Resume Next
    Kill chemin
    On Error GoTo 0
    Name tmp As chemin
End Sub

Private Sub Etat(ByVal msg As String)
    On Error Resume Next
    ThisWorkbook.Worksheets(F_LIVE).Range(CELL_ETAT).Value = Format$(Now, "hh:nn:ss") & "  " & msg
    On Error GoTo 0
End Sub
