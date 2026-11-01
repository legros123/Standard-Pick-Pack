/* ════════════════════════════════════════════════════════════════════
   STANDARDS PICK & PACK — SERVEUR DE SUIVI (Google Apps Script)
   Reçoit l'activité de l'appli et calcule le tableau de bord superviseur.
   Installation : voir suivi/INSTALLATION.md
   ════════════════════════════════════════════════════════════════════ */

/* Code d'accès au tableau de bord : à changer, puis à saisir dans
   l'appli (Moi › Espace superviseur › Suivi en direct). */
const CLE = "CHANGER-CE-CODE";

const STDS = ["P1","P2","P3","P4","P5","P6","P7","P8","P9","P10","P11","P12","P13","P14","P15","P16","P17","P18"];
const SEUIL = 80;          // % au test du standard pour être habilité
const JOURS = 30;          // profondeur de la courbe d'affluence
const ENTETES = ["Reçu le","Date appareil","Événement","Standard","Score","Matricule","Nom","Prénom","Équipe","Appareil","Version","Mode"];

/* ── réception : l'appli envoie des lots d'événements ── */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const evs = Array.isArray(data.events) ? data.events.slice(0, 300) : [];
    const recu = new Date();
    const lignes = evs.filter(v => v && v.t && v.op).map(v => [
      recu, new Date(Number(v.ts) || recu), txt_(v.t, 20), txt_(v.std, 4),
      v.score === "" || v.score == null || isNaN(Number(v.score)) ? "" : Math.max(0, Math.min(100, Math.round(Number(v.score)))),
      txt_(v.op.mat, 20), txt_(String(v.op.nom || "").toUpperCase(), 40), txt_(v.op.prenom, 40), txt_(v.op.eq, 30),
      txt_(v.dev, 40), txt_(v.v, 20), txt_(v.mode, 12)
    ]);
    if (lignes.length) {
      const sh = journal_();
      sh.getRange(sh.getLastRow() + 1, 1, lignes.length, ENTETES.length).setValues(lignes);
    }
    return json_({ ok: true, n: lignes.length });
  } catch (err) {
    return json_({ ok: false, err: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* ── lecture : le tableau de bord, protégé par le code d'accès ── */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.ping) return json_({ ok: true });
  if (String(p.cle || "") !== CLE) return json_({ ok: false, err: "cle" });
  return json_(stats_());
}

/* ── calculs ── */
function stats_() {
  const tz = Session.getScriptTimeZone() || "Europe/Paris";
  const jour = d => Utilities.formatDate(d, tz, "yyyy-MM-dd");
  const sh = journal_();
  const v = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, ENTETES.length).getValues() : [];
  const U = {}, J = {};

  v.forEach(r => {
    const ev = String(r[2]), std = String(r[3]), score = r[4];
    const mat = String(r[5]).trim(), nom = String(r[6]).trim(), prenom = String(r[7]).trim();
    const k = (mat || (nom + "|" + prenom)).toLowerCase();
    if (!k || k === "|") return;
    const dt = r[1] instanceof Date ? r[1] : new Date(r[1]);
    const d = jour(dt);
    const u = U[k] || (U[k] = { nom, prenom, mat, eq: "", premier: dt, dernier: dt, sessions: 0, jours: {},
      ouv: {}, sup: {}, chk: {}, best: {}, tests: 0, somme: 0 });
    if (nom) u.nom = nom; if (prenom) u.prenom = prenom; if (r[8]) u.eq = String(r[8]);
    if (dt < u.premier) u.premier = dt;
    if (dt > u.dernier) u.dernier = dt;
    u.jours[d] = 1;
    const j = J[d] || (J[d] = { s: 0, u: {} });
    j.u[k] = 1;
    if (ev === "session") { u.sessions++; j.s++; }
    else if (ev === "ouverture" && std) u.ouv[std] = 1;
    else if (ev === "support" && std) u.sup[std] = 1;
    else if (ev === "checklist" && std) u.chk[std] = 1;
    else if (ev === "test" && score !== "") {
      u.tests++; u.somme += Number(score);
      if (std) u.best[std] = Math.max(u.best[std] || 0, Number(score));
    }
  });

  const st = (u, id) => (u.chk[id] && (u.best[id] || 0) >= SEUIL) ? "H"
    : (u.ouv[id] || u.sup[id] || u.chk[id] || u.best[id] != null) ? "F" : "N";
  const users = Object.keys(U).map(k => {
    const u = U[k], s = {};
    STDS.forEach(id => s[id] = st(u, id));
    return {
      nom: u.nom, prenom: u.prenom, mat: u.mat, eq: u.eq,
      premier: u.premier.toISOString(), dernier: u.dernier.toISOString(),
      sessions: u.sessions, jours: Object.keys(u.jours).length,
      ouverts: Object.keys(u.ouv).length, supports: Object.keys(u.sup).length,
      valides: Object.keys(u.chk).length, habilites: STDS.filter(id => s[id] === "H").length,
      tests: u.tests, moy: u.tests ? Math.round(u.somme / u.tests) : null, st: s
    };
  });

  const auj = new Date(), jours = [];
  for (let i = JOURS - 1; i >= 0; i--) {
    const d = jour(new Date(auj.getTime() - i * 864e5)), x = J[d];
    jours.push({ d, users: x ? Object.keys(x.u).length : 0, sessions: x ? x.s : 0 });
  }
  const parStd = STDS.map(id => ({
    id,
    ouverts: users.filter(u => u.st[id] !== "N").length,
    valides: Object.keys(U).filter(k => U[k].chk[id]).length,
    habilites: users.filter(u => u.st[id] === "H").length
  }));
  const depuis = n => users.filter(u => auj - new Date(u.dernier) < n * 864e5).length;
  const tests = users.reduce((a, u) => a + u.tests, 0);
  const somme = Object.keys(U).reduce((a, k) => a + U[k].somme, 0);
  return {
    ok: true, maj: auj.toISOString(), seuil: SEUIL,
    total: {
      users: users.length, auj: jours[jours.length - 1].users, j7: depuis(7), j30: depuis(30),
      sessions30: jours.reduce((a, x) => a + x.sessions, 0), tests, moy: tests ? Math.round(somme / tests) : null,
      valides: users.reduce((a, u) => a + u.valides, 0), habilites: users.reduce((a, u) => a + u.habilites, 0)
    },
    users, jours, parStd
  };
}

/* ── synthèse lisible dans le classeur (et exportable vers Excel) ── */
function onOpen() {
  SpreadsheetApp.getUi().createMenu("Suivi P&P")
    .addItem("Mettre à jour la synthèse", "majSynthese")
    .addItem("Mise à jour automatique toutes les heures", "installer")
    .addToUi();
}
function majSynthese() {
  const s = stats_(), ss = SpreadsheetApp.getActiveSpreadsheet();
  const ecrit = (nom, entetes, lignes) => {
    const sh = ss.getSheetByName(nom) || ss.insertSheet(nom);
    sh.clearContents();
    sh.getRange(1, 1, 1, entetes.length).setValues([entetes]).setFontWeight("bold").setBackground("#FFD400");
    if (lignes.length) sh.getRange(2, 1, lignes.length, entetes.length).setValues(lignes);
    sh.setFrozenRows(1);
  };
  const lib = { H: "Habilité", F: "En formation", N: "Non formé" };
  ecrit("Utilisateurs",
    ["Nom", "Prénom", "Matricule", "Équipe", "Première connexion", "Dernière connexion", "Connexions", "Jours actifs",
     "Standards ouverts", "Supports lus", "Checklists validées", "Habilités", "Tests", "Score moyen %"].concat(STDS),
    s.users.sort((a, b) => b.dernier.localeCompare(a.dernier)).map(u => [u.nom, u.prenom, u.mat, u.eq,
      new Date(u.premier), new Date(u.dernier), u.sessions, u.jours, u.ouverts, u.supports, u.valides, u.habilites,
      u.tests, u.moy == null ? "" : u.moy].concat(STDS.map(id => lib[u.st[id]]))));
  ecrit("Par jour", ["Date", "Utilisateurs actifs", "Connexions"], s.jours.map(j => [j.d, j.users, j.sessions]));
  ecrit("Par standard", ["Standard", "Ont commencé", "Checklists validées", "Habilités"],
    s.parStd.map(p => [p.id, p.ouverts, p.valides, p.habilites]));
}
function installer() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === "majSynthese").forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("majSynthese").timeBased().everyHours(1).create();
  majSynthese();
}

/* ── outils ── */
function journal_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName("Journal");
  if (!sh) {
    sh = ss.insertSheet("Journal");
    sh.getRange(1, 1, 1, ENTETES.length).setValues([ENTETES]).setFontWeight("bold").setBackground("#FFD400");
    sh.setFrozenRows(1);
  }
  return sh;
}
/* texte court, sans formule (protège le classeur contre l'injection =, +, -, @) */
function txt_(s, n) {
  s = String(s == null ? "" : s).replace(/[\r\n\t]+/g, " ").trim().slice(0, n);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
