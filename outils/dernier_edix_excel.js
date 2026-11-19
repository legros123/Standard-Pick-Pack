#!/usr/bin/env node
/*
 * DERNIER EDIX PAR OPÉRATEUR — génère le classeur Excel (Power Query, sans macro)
 * ==============================================================================
 * Le classeur lit directement la base Oracle du WMS par ODBC et affiche, pour les
 * derniers jours, l'heure du dernier EDIX de chaque opérateur. Il s'actualise à
 * l'ouverture (ou Données > Actualiser tout). La requête M est dans
 * outils/dernier_edix.m ; ses réglages peuvent être remplis ici, en ligne de commande.
 *
 *   npm install --no-save @microsoft/connected-workbooks
 *   node outils/dernier_edix_excel.js --sortie Dernier_EDIX.xlsx \
 *        [--connexion NOM_DSN] [--table SCHEMA.TABLE] [--etat COL] [--date COL] \
 *        [--ope COL] [--nom COL] [--col-table COL] [--valeur-edix EDIX] [--jours 7]
 *
 * Sans réglage, le fichier guide l'utilisateur (onglet « Mode d'emploi »).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { workbookManager } = require('@microsoft/connected-workbooks');
const JSZip = require('jszip');

const NOM_REQUETE = 'Dernier_EDIX';
const FEUILLE_RESULTAT = 'Dernier EDIX';
const FEUILLE_AIDE = "Mode d'emploi";

const OPTIONS = {
  connexion: 'CONNEXION_ODBC', table: 'TABLE_TRACES', etat: 'COL_ETAT', date: 'COL_DATE_MAJ',
  ope: 'COL_OPE_MAJ', nom: 'COL_NOM_OPE', 'col-table': 'COL_TABLE', 'valeur-edix': 'VALEUR_EDIX',
  'valeur-table': 'VALEUR_TABLE', jours: 'NB_JOURS'
};

/* ── arguments ── */
function lireArguments(argv) {
  const r = { reglages: {}, sortie: 'Dernier_EDIX.xlsx' };
  for (let i = 0; i < argv.length; i++) {
    const cle = argv[i].replace(/^--/, '');
    const val = argv[i + 1];
    if (!argv[i].startsWith('--') || val === undefined) throw new Error('Argument inattendu : ' + argv[i]);
    i++;
    if (cle === 'sortie') r.sortie = val;
    else if (OPTIONS[cle]) r.reglages[OPTIONS[cle]] = cle === 'jours' ? Number(val) : val;
    else throw new Error('Option inconnue : --' + cle);
  }
  return r;
}

/* Remplace la valeur d'un réglage en tête de la requête M (NOM = "valeur" ou NOM = 7) */
function regler(m, nom, valeur) {
  const re = new RegExp('^(\\s*' + nom + '\\s*=\\s*)("(?:[^"]|"")*"|\\d+)', 'm');
  if (!re.test(m)) throw new Error('Réglage introuvable dans la requête : ' + nom);
  const v = typeof valeur === 'number' ? String(valeur) : '"' + String(valeur).replace(/"/g, '""') + '"';
  return m.replace(re, (_, avant) => avant + v);
}

/* ── texte XML ── */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function remplacer(xml, avant, apres, quoi) {
  if (!xml.includes(avant)) throw new Error('Modèle inattendu (' + quoi + ')');
  return xml.replace(avant, () => apres);
}

/* ── styles ajoutés au modèle ── */
const S = { titre: 1, bande: 2, texte: 3, code: 4, note: 5, gras: 6, num: 7 };

function ajouterStyles(xml) {
  const police = (attrs) => '<font>' + attrs + '<family val="2"/><scheme val="minor"/></font>';
  xml = xml.replace(/<fonts count="1"([^>]*)>([\s\S]*?)<\/fonts>/, (_, a, f) => '<fonts count="6"' + a + '>' + f
    + police('<b/><sz val="18"/><color theme="1"/><name val="Arial"/>')
    + police('<b/><sz val="11"/><color rgb="FF111111"/><name val="Arial"/>')
    + police('<sz val="10"/><color rgb="FF595959"/><name val="Arial"/>')
    + '<font><sz val="10"/><color theme="1"/><name val="Consolas"/><family val="3"/></font>'
    + police('<b/><sz val="11"/><color theme="1"/><name val="Arial"/>')
    + '</fonts>');
  xml = remplacer(xml, '<fills count="2">', '<fills count="4">', 'fills');
  xml = remplacer(xml, '<fill><patternFill patternType="gray125"/></fill></fills>',
    '<fill><patternFill patternType="gray125"/></fill>'
    + '<fill><patternFill patternType="solid"><fgColor rgb="FFFFD400"/><bgColor indexed="64"/></patternFill></fill>'
    + '<fill><patternFill patternType="solid"><fgColor rgb="FFF2F2F2"/><bgColor indexed="64"/></patternFill></fill></fills>', 'fills');
  xml = remplacer(xml, '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>',
    '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>'
    + '<border><left/><right/><top/><bottom style="thin"><color rgb="FFD9D9D9"/></bottom><diagonal/></border></borders>', 'borders');
  const haut = '<alignment vertical="top" wrapText="1"/>';
  xml = remplacer(xml, '<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>',
    '<cellXfs count="8"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
    + '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
    + '<xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>'
    + '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1">' + haut + '</xf>'
    + '<xf numFmtId="0" fontId="4" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">' + haut + '</xf>'
    + '<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1">' + haut + '</xf>'
    + '<xf numFmtId="0" fontId="5" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">' + haut + '</xf>'
    + '<xf numFmtId="0" fontId="5" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>'
    + '</cellXfs>', 'cellXfs');
  return xml;
}

/* ── onglet Mode d'emploi ── */
const LARGEURS = { A: 5, B: 32, C: 88 };

function contenuAide() {
  const L = [];
  const titre = t => L.push({ h: 30, c: [['A', t, S.titre]] });
  const note = t => L.push({ c: [['A', t, S.note]], fusion: true });
  const vide = () => L.push({ h: 10, c: [] });
  const bande = t => L.push({ h: 22, c: [['A', t, S.bande], ['B', '', S.bande], ['C', '', S.bande]] });
  const etape = (n, t, d) => L.push({ c: [['A', n, S.num], ['B', t, S.gras], ['C', d, S.texte]] });
  const ligne = (a, b, sa) => L.push({ c: [['B', a, sa], ['C', b, S.texte]] });

  titre('Dernier EDIX par opérateur');
  note("Heure du dernier EDIX de chaque opérateur, lue directement dans la base du WMS (traces sur contenant). Les derniers jours, aujourd'hui en haut, du premier qui a fini au dernier. Lecture seule : rien n'est modifié dans le WMS.");
  vide();
  bande('AU QUOTIDIEN');
  etape('1', 'Ouvrir le fichier', "Le résultat se met à jour tout seul à l'ouverture. Si un bandeau jaune apparaît : « Activer la modification », puis « Activer le contenu ».");
  etape('2', 'Relancer la recherche', 'Données > Actualiser tout (Ctrl + Alt + F5).');
  etape('3', 'Lire le résultat', "Onglet « " + FEUILLE_RESULTAT + " » : une ligne par jour et par opérateur, avec l'heure de son dernier EDIX et son nombre d'EDIX. Filtrer la colonne Jour pour ne garder qu'une journée.");
  vide();
  bande('MISE EN ROUTE (UNE SEULE FOIS)');
  etape('1', 'Trouver la connexion ODBC', "Touche Windows, taper « ODBC », ouvrir « Sources de données ODBC (64 bits) ». Dans les onglets « Sources de données utilisateur » et « Sources de données système », noter le nom de la ligne Oracle. S'il n'y en a pas : demander à l'informatique un accès ODBC en lecture à la base du WMS.");
  etape('2', 'Ouvrir la requête', 'Données > Requêtes et connexions. Clic droit sur « ' + NOM_REQUETE + ' » > Modifier. Dans Power Query : Accueil > Éditeur avancé.');
  etape('3', 'Mettre le nom de la connexion', "Remplacer A_RENSEIGNER par le nom noté à l'étape 1, en gardant les guillemets. Terminé, puis Accueil > Fermer et charger.");
  etape('4', 'Se connecter', "Excel demande l'accès à la base : onglet « Base de données », identifiant et mot de passe Oracle, puis Se connecter. Il demande aussi d'autoriser la requête : Exécuter. Ces questions ne reviennent plus ensuite.");
  etape('5', 'Repérer la table des traces', "L'onglet « " + FEUILLE_RESULTAT + " » liste alors les tables qui ressemblent à des traces, avec leurs colonnes. Chercher celle qui a l'état (EDIX), la date de mise à jour et l'opérateur. Le plus simple : envoyer une capture de cette liste à Claude, qui renvoie le fichier rempli.");
  etape('6', 'Renseigner la table et les colonnes', "Ou le faire soi-même : rouvrir l'Éditeur avancé (étape 2), remplir TABLE_TRACES, COL_ETAT, COL_DATE_MAJ, COL_OPE_MAJ, et si possible COL_NOM_OPE et COL_TABLE. Fermer et charger : le résultat s'affiche.");
  vide();
  bande('LES RÉGLAGES (EN HAUT DE LA REQUÊTE)');
  ligne('CONNEXION_ODBC', 'Nom de la connexion ODBC (étape 1).', S.code);
  ligne('TABLE_TRACES', 'Table des traces sur contenant, précédée du schéma. Ex. : "SCHEMA.TABLE". Vide = liste des tables candidates.', S.code);
  ligne('COL_ETAT', 'Colonne « Etat » (EDIX, CHGT TRANS, PREPARE…).', S.code);
  ligne('COL_DATE_MAJ', 'Colonne « Date Maj » (date et heure).', S.code);
  ligne('COL_OPE_MAJ', 'Colonne « Opé Maj » (code opérateur, ex. 121).', S.code);
  ligne('COL_NOM_OPE', 'Colonne « Nom Opé Maj ». Facultatif.', S.code);
  ligne('COL_TABLE', 'Colonne « Table » (CONTENANT). Facultatif : utile si la table contient aussi des traces sur autre chose que les contenants.', S.code);
  ligne('VALEUR_EDIX', 'État recherché, "EDIX" par défaut. Mettre "?" pour afficher les valeurs réellement stockées dans la colonne Etat.', S.code);
  ligne('NB_JOURS', "Nombre de jours affichés, aujourd'hui compris (7 par défaut).", S.code);
  vide();
  bande('EN CAS DE PROBLÈME');
  ligne('Source de données introuvable (IM002)', 'Nom de connexion incorrect, ou connexion ODBC en 32 bits alors qu\'Excel est en 64 bits (ou l\'inverse).', S.gras);
  ligne('ORA-01017', 'Identifiant ou mot de passe refusé. Pour le ressaisir : Données > Obtenir des données > Paramètres de la source de données > Modifier les autorisations.', S.gras);
  ligne('ORA-00942', 'Table inconnue ou pas de droit de lecture : vérifier TABLE_TRACES (avec le schéma).', S.gras);
  ligne('ORA-00904', 'Nom de colonne incorrect : vérifier les réglages COL_….', S.gras);
  ligne('Tableau vide', 'La valeur stockée n\'est peut-être pas exactement EDIX : mettre VALEUR_EDIX = "?" pour la voir.', S.gras);
  ligne('ORA-00932 ou date bizarre', "La date et l'heure sont peut-être dans deux colonnes séparées : envoyer la capture de l'étape 5, la requête sera adaptée.", S.gras);
  return L;
}

function hauteur(l) {
  let n = 1;
  for (const [col, txt] of l.c) {
    if (!txt || (col === 'A' && !l.fusion)) continue;   // numéros et bandeaux : une ligne
    const largeur = l.fusion ? LARGEURS.A + LARGEURS.B + LARGEURS.C : LARGEURS[col];
    n = Math.max(n, Math.ceil(txt.length / largeur));
  }
  return n * 15 + 4;
}

function feuilleAide() {
  const lignes = contenuAide();
  const fusions = [];
  const rows = lignes.map((l, i) => {
    const r = i + 1;
    if (l.fusion) fusions.push('A' + r + ':C' + r);
    const ht = l.h || hauteur(l);
    const cels = l.c.map(([col, txt, s]) => txt === ''
      ? '<c r="' + col + r + '"' + (s ? ' s="' + s + '"' : '') + '/>'
      : '<c r="' + col + r + '"' + (s ? ' s="' + s + '"' : '') + ' t="inlineStr"><is><t xml:space="preserve">' + esc(txt) + '</t></is></c>');
    return '<row r="' + r + '" ht="' + ht + '" customHeight="1">' + cels.join('') + '</row>';
  });
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
    + '<sheetPr><tabColor rgb="FFFFD400"/></sheetPr>'
    + '<dimension ref="A1:C' + lignes.length + '"/>'
    + '<sheetViews><sheetView showGridLines="0" workbookViewId="0"><selection activeCell="A1" sqref="A1"/></sheetView></sheetViews>'
    + '<sheetFormatPr defaultRowHeight="15"/>'
    + '<cols>' + Object.entries(LARGEURS).map(([c, w], i) => '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>').join('') + '</cols>'
    + '<sheetData>' + rows.join('') + '</sheetData>'
    + (fusions.length ? '<mergeCells count="' + fusions.length + '">' + fusions.map(f => '<mergeCell ref="' + f + '"/>').join('') + '</mergeCells>' : '')
    + '<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>'
    + '<pageSetup paperSize="9" orientation="landscape" fitToHeight="0"/>'
    + '</worksheet>';
}

/* ── assemblage ── */
async function generer(reglages, sortie) {
  let m = fs.readFileSync(path.join(__dirname, 'dernier_edix.m'), 'utf8');
  for (const [nom, val] of Object.entries(reglages)) m = regler(m, nom, val);

  const blob = await workbookManager.generateSingleQueryWorkbook(
    { queryMashup: m, refreshOnOpen: true, queryName: NOM_REQUETE },
    { data: [['À faire'], ["Ouvrir l'onglet « " + FEUILLE_AIDE + " » : mise en route, étape 1."]], config: { promoteHeaders: true } },
    { docProps: { title: 'Dernier EDIX par opérateur', createdBy: 'Pick & Pack', lastModifiedBy: 'Pick & Pack' } }
  );
  const zip = await JSZip.loadAsync(Buffer.from(await blob.arrayBuffer()));
  const lire = p => zip.file(p).async('string');

  // classeur : onglets renommés, onglet d'aide ajouté, chemin du modèle retiré
  let wb = await lire('xl/workbook.xml');
  wb = wb.replace(/<mc:AlternateContent[\s\S]*?<\/mc:AlternateContent>/, '');
  wb = remplacer(wb, '<sheet name="Sheet1" sheetId="2" r:id="rId1"/>',
    '<sheet name="' + esc(FEUILLE_RESULTAT) + '" sheetId="2" r:id="rId1"/><sheet name="' + esc(FEUILLE_AIDE) + '" sheetId="3" r:id="rId8"/>', 'onglets');
  wb = remplacer(wb, '>Sheet1!$', ">'" + FEUILLE_RESULTAT + "'!$", 'plage ExternalData');
  zip.file('xl/workbook.xml', wb);

  let rels = await lire('xl/_rels/workbook.xml.rels');
  if (rels.includes('Id="rId8"')) throw new Error('rId8 déjà utilisé dans le modèle');
  rels = remplacer(rels, '</Relationships>', '<Relationship Id="rId8" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/></Relationships>', 'relations');
  zip.file('xl/_rels/workbook.xml.rels', rels);

  let ct = await lire('[Content_Types].xml');
  ct = ct.replace('<Override PartName="/docMetadata/LabelInfo.xml" ContentType="application/vnd.ms-office.classificationlabels+xml"/>', '');
  ct = remplacer(ct, '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>',
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
    + '<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>', 'types');
  zip.file('[Content_Types].xml', ct);

  let app = await lire('docProps/app.xml');
  app = app.replace('<vt:i4>1</vt:i4>', '<vt:i4>2</vt:i4>')
    .replace('<vt:vector size="1" baseType="lpstr"><vt:lpstr>Sheet1</vt:lpstr></vt:vector>',
      '<vt:vector size="2" baseType="lpstr"><vt:lpstr>' + esc(FEUILLE_RESULTAT) + '</vt:lpstr><vt:lpstr>' + esc(FEUILLE_AIDE) + '</vt:lpstr></vt:vector>');
  zip.file('docProps/app.xml', app);

  zip.file('xl/styles.xml', ajouterStyles(await lire('xl/styles.xml')));

  // onglet résultat : ligne d'en-tête figée, colonne lisible avant la première actualisation
  let s1 = await lire('xl/worksheets/sheet1.xml');
  s1 = s1.replace(/<sheetView tabSelected="1" workbookViewId="0">[\s\S]*?<\/sheetView>/,
    '<sheetView tabSelected="1" workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView>');
  s1 = s1.replace(/<cols>[\s\S]*?<\/cols>/, '<cols><col min="1" max="1" width="70" customWidth="1"/></cols>');
  zip.file('xl/worksheets/sheet1.xml', s1);

  zip.file('xl/worksheets/sheet2.xml', feuilleAide());

  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  fs.writeFileSync(sortie, buf);
  return sortie;
}

if (require.main === module) {
  const { reglages, sortie } = lireArguments(process.argv.slice(2));
  generer(reglages, sortie)
    .then(f => console.log('Classeur écrit : ' + f + (Object.keys(reglages).length ? ' (réglages : ' + Object.keys(reglages).join(', ') + ')' : '')))
    .catch(e => { console.error('Erreur : ' + e.message); process.exit(1); });
}

module.exports = { generer, regler };
