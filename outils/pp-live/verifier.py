import sys, zipfile, re, xml.dom.minidom
from oletools.olevba import VBA_Parser
from openpyxl import load_workbook
f = sys.argv[1]
# 1. XML bien formé
z = zipfile.ZipFile(f); mauvais = []
for n in z.namelist():
    if n.endswith(".xml") or n.endswith(".rels"):
        try: xml.dom.minidom.parseString(z.read(n))
        except Exception as e: mauvais.append((n, str(e)))
print("1. parties XML :", len([n for n in z.namelist() if n.endswith(('.xml', '.rels'))]), "· mal formées :", mauvais or "aucune")
# 2. relecture indépendante du projet VBA
vp = VBA_Parser(f); mods = {}
for (_, _, nom, src) in vp.extract_macros(): mods[nom.split("/")[-1].replace(".bas", "").replace(".cls", "")] = src
print("2. olevba relit", len(mods), "modules :", ", ".join(sorted(mods)))
std = {n: s for n, s in mods.items() if not n.startswith("Feuil") and n != "ThisWorkbook"}
# 3. structure : chaque bloc ouvert est refermé
def blocs(src):
    pile, err = [], []
    for i, l in enumerate(src.splitlines(), 1):
        t = re.sub(r"'.*$", "", re.sub(r'"[^"]*"', '""', l)).strip()
        if not t or t.startswith("Attribute "): continue
        if re.match(r"(Public |Private |Friend )?(Static )?(Sub|Function|Property \w+) ", t): pile.append(("PROC", i))
        elif re.match(r"End (Sub|Function|Property)\b", t):
            if not pile or pile[-1][0] != "PROC": err.append("End Sub/Function L%d sans ouverture (pile %s)" % (i, pile[-3:]))
            else: pile.pop()
        elif re.match(r"If\b.*\bThen\s*$", t): pile.append(("IF", i))
        elif re.match(r"End If\b", t):
            if not pile or pile[-1][0] != "IF": err.append("End If L%d" % i)
            else: pile.pop()
        elif re.match(r"(For|For Each)\b", t): pile.append(("FOR", i))
        elif re.match(r"Next\b", t):
            if not pile or pile[-1][0] != "FOR": err.append("Next L%d" % i)
            else: pile.pop()
        elif re.match(r"Do\b", t): pile.append(("DO", i))
        elif re.match(r"Loop\b", t):
            if not pile or pile[-1][0] != "DO": err.append("Loop L%d" % i)
            else: pile.pop()
        elif re.match(r"With\b", t): pile.append(("WITH", i))
        elif re.match(r"End With\b", t):
            if not pile or pile[-1][0] != "WITH": err.append("End With L%d" % i)
            else: pile.pop()
        elif re.match(r"Select Case\b", t): pile.append(("SEL", i))
        elif re.match(r"End Select\b", t):
            if not pile or pile[-1][0] != "SEL": err.append("End Select L%d" % i)
            else: pile.pop()
    return err + (["blocs non fermés : %s" % pile] if pile else [])
for n, s in sorted(mods.items()):
    e = blocs(s)
    if e: print("   !!", n, e[:5])
print("3. structure des blocs vérifiée dans", len(mods), "modules")
# 4. les procédures appelées par PP_LIVE et ThisWorkbook existent, publiques, dans un autre module
publiques = {}
for n, s in std.items():
    for m in re.finditer(r"^Public (?:Sub|Function) (\w+)", s, re.M): publiques.setdefault(m.group(1).upper(), []).append(n)
appels = ["Equipe_PreparerJournee", "Pilotage_Reinitialiser", "Export_EnMarche", "Pilotage_EnMarche", "Export_Maintenant", "Pilotage_ActualiserMaintenant",
          "Export_Alertes", "Pilotage_Journal", "Pilotage_Reglage", "Pilotage_Fichier", "Pilotage_NbRequetes", "DEMARRER_LIVE", "Pilotage_Demarrer",
          "ARRETER_LIVE", "ARRETER_AUTO", "Pilotage_Arreter", "PP_Ouverture", "PP_Fermeture", "ACTUALISER", "TICK", "TICK_LIVE", "Pilotage_Actualiser", "PP_DemarrageAuto", "PP_Sonde"]
manque = [a for a in appels if a.upper() not in publiques]
doublons = {k: v for k, v in publiques.items() if len(v) > 1}
print("4. appels vers d'autres modules :", len(appels), "· introuvables :", manque or "aucun", "· noms publics en double :", doublons or "aucun")
# 5. Alt+F8
vis = [(n, m.group(1)) for n, s in std.items() for m in re.finditer(r"^(?:Public\s+)?Sub\s+(\w+)\s*\(\s*\)", s, re.M)]
print("5. macros visibles dans Alt+F8 :", vis)
# 6. ouverture du classeur
wb = load_workbook(f, keep_vba=True)
print("6. onglets :", wb.sheetnames, "· actif :", wb.active.title, "· J_INFO →", wb.defined_names["J_INFO"].attr_text)
print("   PILOTAGE inchangé :", wb["PILOTAGE"]["B2"].value, "| PARAMETRES P_DSN :", wb["PARAMETRES"]["B6"].value)
