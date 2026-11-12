"use strict";
/* ════════════════════════════════════════════════════════════════════════════
   PILOTAGE PICK & PACK — noyau : outils, modèle de données, calculs, démonstration
   Les données arrivent par le fichier « pilotage_data.js » (écrit par Excel, voir
   outils/pilotage/LISEZMOI.md). Sans ce fichier, la page tourne en démonstration.
   ════════════════════════════════════════════════════════════════════════════ */

/* ───────── 1. Outils ───────── */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const adoucir = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const NF0 = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const NF1 = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const NF2 = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fini = v => v != null && isFinite(v);
const n0 = v => (fini(v) ? NF0.format(Math.round(v)) : "–");
const n1 = v => (fini(v) ? NF1.format(v) : "–");
const pluriel = (n, mot, mots) => (Math.abs(n) >= 2 ? (mots || mot + "s") : mot);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ic = (nom, cls = "") => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${nom}"/></svg>`;
const pastille = (niv, txt, grand, icone) => `<span class="pastille${grand ? " grand" : ""}" data-niv="${niv}">${ic(icone || niv)}<span>${esc(txt)}</span></span>`;
const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
const mouvementReduit = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const modeDeroule = () => window.matchMedia("(max-width:860px),(max-aspect-ratio:1/1)").matches;

/* heures : « 14:35 » ou « 14h35 » -> minutes depuis minuit, et retour */
const hm2min = s => {
  if (s == null || s === "") return null;
  if (typeof s === "number") return s;
  const m = /^(\d{1,2})\s*[:hH]\s*(\d{2})/.exec(String(s).trim());
  return m ? (+m[1]) * 60 + (+m[2]) : null;
};
const min2hm = m => {
  if (!fini(m)) return "–";
  m = Math.round(m);
  const h = Math.floor(m / 60) % 24, r = ((m % 60) + 60) % 60;
  return String(h).padStart(2, "0") + ":" + String(r).padStart(2, "0");
};
const duree = m => {
  m = Math.round(Math.abs(m));
  if (m < 60) return m + " min";
  const h = Math.floor(m / 60), r = m % 60;
  return h + " h" + (r ? " " + String(r).padStart(2, "0") : "");
};
const lirePauses = p => (Array.isArray(p) ? p : []).map(x => [hm2min(x[0]), hm2min(x[1])]).filter(x => x[0] != null && x[1] != null && x[1] > x[0]).sort((a, b) => a[0] - b[0]);
/* minutes réellement travaillées entre a et b (les pauses déclarées sont retirées) */
function minutesProductives(a, b, pauses) {
  if (!(b > a)) return 0;
  let t = b - a;
  for (const [p0, p1] of pauses) t -= Math.max(0, Math.min(b, p1) - Math.max(a, p0));
  return Math.max(0, t);
}
/* avance de « travail » minutes productives à partir de « depart », en sautant les pauses */
function avancer(depart, travail, pauses) {
  let t = depart, r = travail;
  for (const [a, b] of pauses) {
    if (b <= t) continue;
    if (a <= t) { t = b; continue; }
    if (t + r <= a) break;
    r -= a - t; t = b;
  }
  return t + r;
}

/* ───────── 2. Réglages par défaut (repris de PARAMETRES du Suivi Op et de REGLAGES du Contrôle Rejets) ───────── */
const CFG_DEFAUT = {
  site: "CLR Champigneulles", service: "Pick & Pack",
  debut: "06:00", finVisee: "19:00", pauses: [], jalons: ["12:15", "15:15", "17:15", "19:00"],
  effectifPrevu: [],                      // préparateurs prévus par tranche : [["06:00", 6], ["12:30", 15], ["13:30", 9]]
  quotaJour: 620, hRef: 7.4,              // standard Rexel : 620 lignes par poste de 7,4 h
  quotaRouge: 90, quotaVert: 100, quotaMax: 150,   // % du quota : rouge en dessous, vert à partir de, plafond affiché
  milP: 20.5, milM: 60.5, milG: 100.5,    // milieu des tranches de chariots : petits (< 40 lignes), moyens (40 à 79), grands (80 et +)
  coefP: 1.47, coefM: 1.04, coefG: 0.92,  // coefficients de difficulté (PARAMETRES du Suivi Op)
  rejetsMax: 120,                         // objectif site : 120 rejets par jour au maximum
  decOrange: 15, decRouge: 20,            // erreurs décelées par jour, équipe
  ppmDecOrange: 1000, ppmDecRouge: 2000, ppmAveOrange: 180, ppmAveRouge: 220,
  partPick: 0.70,                         // part du Pick & Pack dans le carnet de commandes
  inclureALancer: false,                  // compter dans la charge les lignes pas encore lancées en vague
  fraicheurMin: 10,                       // au-delà, les données sont signalées comme figées
  actifMin: 30                            // « actif » = une ligne validée dans les 30 dernières minutes
};
const NIV = { ok: 0, na: 0, warn: 1, crit: 2 };
const MOT_GLOBAL = { ok: "Tout va bien", warn: "À surveiller", crit: "Action nécessaire" };
const pire = (...n) => n.reduce((a, b) => (NIV[b] > NIV[a] ? b : a), "ok");

const STANDARDS = [
  ["P1", "Prise de poste", "La sécurité commence avant la production."],
  ["P2", "Consommables", "Le bon contenant, au bon moment."],
  ["P3", "Affectation & montage chariot", "Bien s'affecter, bien monter."],
  ["P4", "Préparation détail", "Bien lire, bien prélever, bien coller."],
  ["P5", "Préparation carton", "Bien trier, bien insérer, bien expédier."],
  ["P6", "Préparation retract", "Sécuriser chaque palette avant de gerber."],
  ["P7", "Changement de contenants", "Le bon carton, dès le départ."],
  ["P8", "Ruptures & validation", "Une rupture saisie = un colis conforme."],
  ["P9", "Gestion des déchets", "Trier juste. Évacuer net."],
  ["P10", "Circulation & sécurité", "Chaque déplacement compte."],
  ["P11", "Fin de poste", "Une zone prête pour l'équipe suivante."],
  ["P12", "Aérosol & batterie", "Produits à risque : zéro tolérance sur le conditionnement."],
  ["P13", "Préparation monolignes", "Une étiquette, un article, un C16."],
  ["P14", "Les interdits", "Les règles internes à respecter dans le CLR."],
  ["P15", "Changement de batterie (Togger)", "Manipuler le Togger avec rigueur et sécurité."],
  ["P16", "Les composés", "Prélever les composés avec précision en allée 11."],
  ["P17", "Sécurité incendie", "Évacuer, alerter, intervenir : chacun son rôle."],
  ["P18", "Sécurité au quotidien", "Signaler, circuler, protéger : chaque jour dans le CLR."]
];
const TYPES_ERREUR = ["Manquante", "Quantité +", "Quantité -", "Orientation", "Référence", "Casse"];

/* ───────── 3. Du fichier de données au modèle affiché ───────── */
function calculer(d, forcer) {
  const cfg = Object.assign({}, CFG_DEFAUT, d.cfg || {}, forcer || {});
  const pauses = lirePauses(cfg.pauses);
  const M = { brut: d, cfg, pauses, demo: d.source === "DEMO" };
  M.maj = d.maj ? new Date(d.maj) : new Date();
  if (isNaN(M.maj)) M.maj = new Date();
  const now = M.maj.getHours() * 60 + M.maj.getMinutes() + M.maj.getSeconds() / 60;
  M.now = now;
  M.standardH = cfg.quotaJour / cfg.hRef;

  /* charge */
  const c = d.charge || {};
  M.aCharge = d.charge != null;
  M.fait = +c.fait || 0;
  M.restant = +c.restant || 0;
  M.aLancerInfo = c.aLancer != null ? +c.aLancer || 0 : null;
  M.aLancer = cfg.inclureALancer && M.aLancerInfo ? M.aLancerInfo : 0;
  M.reste = M.restant + M.aLancer;
  M.charge = M.fait + M.reste;
  M.pct = M.charge > 0 ? M.fait / M.charge : 0;
  M.contFaits = c.contFaits != null ? +c.contFaits : null;
  M.tournees = { faites: c.tourneesFaites, ouvertes: c.tourneesOuvertes, libres: c.tourneesLibres };
  M.types = (c.types || []).map(t => ({ lib: t.lib || t.code, fait: +t.fait || 0, restant: +t.restant || 0 }));
  /* coefficient de difficulté : un petit chariot coûte plus cher par ligne qu'un grand (même formule que le Suivi Op) */
  const poids = k => { if (!k) return null; const p = +k.p || 0, m = +k.m || 0, g = +k.g || 0, den = p * cfg.milP + m * cfg.milM + g * cfg.milG; return den > 0 ? (p * cfg.milP * cfg.coefP + m * cfg.milM * cfg.coefM + g * cfg.milG * cfg.coefG) / den : null; };
  M.w = poids(c.classes); M.aPoids = M.w != null; if (!M.aPoids) M.w = 1;

  /* séries horaires */
  M.heures = (d.heures || []).map(x => ({ h: +x.h, lignes: +x.lignes || 0, ops: x.ops != null ? +x.ops : null })).sort((a, b) => a.h - b.h);
  M.quarts = (d.quarts || []).map(x => ({ m: hm2min(x.t), lignes: +x.lignes || 0 })).filter(x => x.m != null).sort((a, b) => a.m - b.m);
  M.operateurs = (d.operateurs || []).map(o => ({ code: o.code, nom: o.nom || o.code, lignes: +o.lignes || 0, tournees: o.tournees, cont: o.cont, premiere: hm2min(o.premiere), derniere: hm2min(o.derniere), w: poids(o) || M.w }));

  /* début réel du poste */
  const premieres = M.operateurs.map(o => o.premiere).filter(fini);
  const hActives = M.heures.filter(x => x.lignes > 0).map(x => x.h * 60);
  M.debut = hm2min(d.premiere) != null ? hm2min(d.premiere) : premieres.length ? Math.min(...premieres) : hActives.length ? Math.min(...hActives) : hm2min(cfg.debut);
  if (!fini(M.debut) || M.debut > now) M.debut = Math.min(now, hm2min(cfg.debut) || now);

  /* ── rythme ──
     Débit de l'équipe = lignes validées par heure. Cadence = lignes par heure et par préparateur, calculée sur les
     heures de présence au picking de chacun : elle reste juste quand deux équipes se croisent. */
  const prodJour = minutesProductives(M.debut, now, pauses);
  M.debitJour = prodJour >= 20 && M.fait >= 30 ? M.fait / (prodJour / 60) : null;      // pas d'estimation sur les toutes premières minutes
  const w0 = Math.max(now - 60, M.debut), prodFen = minutesProductives(w0, now, pauses);
  let lignesFen = null;
  if (M.quarts.length) {
    lignesFen = 0;
    for (const q of M.quarts) {
      const fin = q.m + 15, lon = now < fin ? Math.max(1, now - q.m) : 15, rec = Math.max(0, Math.min(fin, now) - Math.max(q.m, w0));
      if (rec > 0) lignesFen += q.lignes * Math.min(1, rec / lon);
    }
  } else if (M.heures.length) {
    const hc = Math.floor(now / 60), ha = M.heures.find(x => x.h === hc), hb = M.heures.find(x => x.h === hc - 1), dansH = now - hc * 60;
    lignesFen = (ha ? ha.lignes : 0) + (hb ? hb.lignes * clamp((60 - dansH) / 60, 0, 1) : 0);
  }
  M.debitRecent = fini(lignesFen) && prodFen >= 20 ? lignesFen / (prodFen / 60) : null;

  /* effectif */
  const avecLignes = M.operateurs.filter(o => o.lignes > 0);
  if (avecLignes.length) {
    M.presents = avecLignes.length;
    M.actifs = avecLignes.filter(o => fini(o.derniere) && now - o.derniere <= cfg.actifMin).length;
  } else {
    const opsH = M.heures.filter(x => fini(x.ops));
    M.presents = opsH.length ? Math.max(...opsH.map(x => x.ops)) : null;
    M.actifs = opsH.length ? opsH[opsH.length - 1].ops : null;
  }

  /* heures de présence et cadence de chacun (amplitude entre première et dernière validation, pas un temps de travail) */
  let hJour = 0, hFen = 0, ligOps = 0, ligPond = 0;
  for (const o of M.operateurs) {
    const actif = fini(o.derniere) && now - o.derniere <= cfg.actifMin;
    const fin = !fini(o.derniere) ? now : actif ? now : Math.min(now, o.derniere + 5);
    const h = fini(o.premiere) ? minutesProductives(o.premiere, fin, pauses) / 60 : null;
    o.heures = h;
    o.cadence = h && h >= 0.5 ? o.lignes / h : null;
    o.quota = fini(o.cadence) ? Math.min(cfg.quotaMax, o.cadence * o.w / M.standardH * 100) : null;
    o.inactif = fini(o.derniere) ? Math.max(0, now - o.derniere) : null;
    if (h) { hJour += h; ligOps += o.lignes; ligPond += o.lignes * o.w; hFen += minutesProductives(Math.max(o.premiere, w0), fin, pauses) / 60; }
  }
  const cadJour = hJour >= 1 && ligOps >= 30 ? ligOps / hJour : null;
  const cadRecente = fini(lignesFen) && hFen >= 0.5 && prodFen >= 20 ? lignesFen / hFen : null;
  M.pctStandardJour = hJour >= 1 ? ligPond / hJour / M.standardH * 100 : null;                // quota de l'équipe depuis le début du poste
  const melange = (r, j) => (fini(r) && fini(j) ? (r < 0.4 * j ? j : 0.65 * r + 0.35 * j) : fini(r) && r > 0 ? r : j);
  if (fini(cadJour) || fini(cadRecente)) {
    M.cadenceOp = melange(cadRecente, cadJour);
    M.debit = M.actifs > 0 ? M.cadenceOp * M.actifs : melange(M.debitRecent, M.debitJour);
  } else {
    M.debit = melange(M.debitRecent, M.debitJour);
    M.cadenceOp = fini(M.debit) && M.actifs > 0 ? M.debit / M.actifs : null;
  }
  M.pctStandard = fini(M.cadenceOp) ? M.cadenceOp * M.w / M.standardH * 100 : null;           // quota de l'équipe en ce moment

  /* ── heure de fin ──
     Sans planning : l'équipe du moment reste jusqu'au bout. Avec « effectifPrevu » : on applique la cadence
     constatée à l'effectif prévu de chaque tranche horaire. */
  M.finVisee = hm2min(cfg.finVisee);
  M.eta = null; M.etaTot = null; M.etaTard = null; M.horsJour = false;
  M.effectif = (Array.isArray(cfg.effectifPrevu) ? cfg.effectifPrevu : []).map(x => [hm2min(x[0]), +x[1]]).filter(x => x[0] != null && fini(x[1]) && x[1] >= 0).sort((a, b) => a[0] - b[0]);
  const profil = M.effectif.length > 0 && M.actifs > 0 && fini(M.cadenceOp);
  const prevuA = t => { let n = M.actifs; for (const e of M.effectif) if (e[0] <= t && e[0] > now) n = e[1]; return n; };
  const projeter = cad => {                               // cad : lignes par heure et par préparateur
    if (!(cad > 0)) return null;
    if (!(M.actifs > 0)) return null;
    let t = now, r = M.reste, n = M.actifs;
    for (const b of (profil ? M.effectif.map(e => e[0]).filter(h => h > now) : []).concat([1440])) {
      const cap = cad * n * minutesProductives(t, b, pauses) / 60;
      if (n > 0 && cap >= r) return avancer(t, r / (cad * n) * 60, pauses);
      r -= cap; t = b; n = prevuA(b);
    }
    return null;
  };
  if (M.aCharge && M.reste <= 0 && M.fait > 0) M.eta = now;
  else if (M.reste > 0 && fini(M.cadenceOp) && M.actifs > 0) {
    M.eta = projeter(M.cadenceOp);
    M.horsJour = M.eta == null;
    if (!M.horsJour && fini(cadJour) && fini(cadRecente)) { M.etaTot = projeter(Math.max(cadJour, cadRecente)); M.etaTard = projeter(Math.min(cadJour, cadRecente)); }
  } else if (M.reste > 0 && fini(M.debit) && M.debit > 0) {
    const f = avancer(now, M.reste / M.debit * 60, pauses);
    if (f < 1440) M.eta = f; else M.horsJour = true;
  }
  M.ecart = fini(M.eta) && fini(M.finVisee) ? M.finVisee - M.eta : null;      // positif = avance
  const hRest = fini(M.finVisee) ? minutesProductives(now, M.finVisee, pauses) / 60 : 0;
  M.hRestantes = hRest;
  M.debitNecessaire = hRest > 0.05 && M.reste > 0 ? M.reste / hRest : null;
  M.besoinOps = fini(M.cadenceOp) && M.cadenceOp > 0 && fini(M.debitNecessaire) ? M.debitNecessaire / M.cadenceOp : null;
  /* effectif de référence d'ici l'heure visée : la moyenne prévue si le planning est fourni, sinon les actifs du moment */
  M.opsRef = M.actifs; M.opsPrevus = false;
  if (profil && hRest > 0.05) {
    let t = now, n = M.actifs, somme = 0;
    for (const b of M.effectif.map(e => e[0]).filter(h => h > now && h < M.finVisee).concat([M.finVisee])) { somme += n * minutesProductives(t, b, pauses); t = b; n = prevuA(b); }
    M.opsRef = somme / (hRest * 60); M.opsPrevus = M.effectif.some(e => e[0] > now && e[0] < M.finVisee);
  }
  M.margeOps = fini(M.besoinOps) && fini(M.opsRef) ? M.opsRef - M.besoinOps : null;

  /* rejets (contrôle pondéral du convoyeur) */
  const r = d.rejets || null;
  M.rejets = r ? {
    total: +r.total || 0, pese: r.pese != null ? +r.pese : M.contFaits,
    parHeure: (r.parHeure || []).map(x => ({ h: +x.h, n: +x.n || 0 })),
    top: (r.top || []).map(x => ({ art: x.art, lib: x.lib || "", n: +x.n || 0 }))
  } : null;
  if (M.rejets) {
    M.rejets.taux = M.rejets.pese > 0 ? M.rejets.total / M.rejets.pese : null;
    M.rejets.proj = M.pct >= 0.1 && M.pct < 1 ? M.rejets.total / M.pct : M.rejets.total;
  }

  /* erreurs décelées au poste de contrôle */
  const e = d.decelees || null;
  const versListe = o => Array.isArray(o) ? o.map(x => ({ nom: x.nom, n: +x.n || 0 })) : Object.keys(o || {}).map(k => ({ nom: k, n: +o[k] || 0 }));
  M.dec = e ? {
    total: +e.total || 0,
    types: versListe(e.types).sort((a, b) => b.n - a.n),
    allees: e.allees || {}, derniere: e.derniere || null, source: e.source || "",
    hist: e.hist ? { jours: +e.hist.jours || 7, total: +e.hist.total || 0, allees: e.hist.allees || {}, types: versListe(e.hist.types).sort((a, b) => b.n - a.n) } : null
  } : null;
  if (M.dec) M.dec.ppm = M.fait > 0 ? M.dec.total / M.fait * 1e6 : null;

  /* le reste, tel que fourni */
  M.vagues = (d.vagues || []).map(v => ({ num: v.num, heure: v.heure, etat: v.etat || "", ligPrev: +v.ligPrev || 0, ligPrep: +v.ligPrep || 0, ligRupt: +v.ligRupt || 0, contPrev: v.contPrev, contSortie: v.contSortie }));
  M.departs = (d.departs || []).map(x => ({ m: hm2min(x.heure), heure: x.heure, transp: x.transp || "", dest: x.dest || "", contReel: +x.contReel || 0, contMax: +x.contMax || 0, etat: x.etat || "" })).filter(x => x.m != null).sort((a, b) => a.m - b.m);
  M.services = (d.services || []).map(s => ({ lib: s.lib || s.code, fait: +s.fait || 0, restant: +s.restant || 0 }));
  M.stock = d.stock || null;
  M.retard = d.retard || null;
  M.carnet = (d.carnet || []).map(x => ({ date: x.date, lignes: +x.lignes || 0, aPreparer: x.aPreparer != null ? +x.aPreparer : null, commandes: x.commandes }));
  M.historique = (d.historique || []).map(x => ({ d: x.d, lignes: +x.lignes || 0, hPick: +x.hPick || 0, ops: +x.ops || 0, ed: +x.ed || 0, ea: +x.ea || 0, rejets: x.rejets != null ? +x.rejets : null, quota: x.quota != null ? +x.quota : null }));
  M.mois = d.mois || null;
  M.securite = d.securite || null;
  M.messages = d.messages || [];

  /* jalons de la journée */
  M.jalons = (cfg.jalons || []).map(hm2min).filter(fini).sort((a, b) => a - b);
  M.jalonSuivant = M.jalons.find(j => j > now) || null;

  /* ── états ── */
  const S = M.statut = {};
  if (M.horsJour) S.fin = { niv: "crit", mot: "Ne finit pas aujourd'hui" };
  else if (!M.aCharge || !fini(M.eta)) S.fin = { niv: "na", mot: M.aCharge ? "Estimation en attente" : "Charge inconnue" };
  else if (M.reste <= 0) S.fin = { niv: "ok", mot: "Charge terminée" };
  else if (!fini(M.ecart)) S.fin = { niv: "na", mot: "Pas d'heure visée" };
  else if (M.ecart >= 5) S.fin = { niv: "ok", mot: duree(M.ecart) + " d'avance" };
  else if (M.ecart >= -2) S.fin = { niv: "ok", mot: "À l'heure" };
  else if (M.ecart >= -20) S.fin = { niv: "warn", mot: duree(M.ecart) + " de retard" };
  else S.fin = { niv: "crit", mot: duree(M.ecart) + " de retard" };

  if (!M.rejets) S.rejets = { niv: "na", mot: "Non branché" };
  else if (M.rejets.total > cfg.rejetsMax) S.rejets = { niv: "crit", mot: "Objectif dépassé" };
  else if (M.rejets.proj > cfg.rejetsMax * 1.15) S.rejets = { niv: "crit", mot: "Dépassement probable" };
  else if (M.rejets.proj > cfg.rejetsMax) S.rejets = { niv: "warn", mot: "Dépassement possible" };
  else S.rejets = { niv: "ok", mot: "Dans l'objectif" };

  if (!M.dec) S.dec = { niv: "na", mot: "Non branché" };
  else if (M.dec.total >= cfg.decRouge) S.dec = { niv: "crit", mot: "Seuil rouge atteint" };
  else if (M.dec.total >= cfg.decOrange) S.dec = { niv: "warn", mot: "Seuil d'alerte atteint" };
  else S.dec = { niv: "ok", mot: "Sous le seuil d'alerte" };

  if (!fini(M.pctStandard)) S.cadence = { niv: "na", mot: "En attente" };
  else if (M.pctStandard >= cfg.quotaVert) S.cadence = { niv: "ok", mot: "Quota atteint" };
  else if (M.pctStandard >= cfg.quotaRouge) S.cadence = { niv: "warn", mot: "Un peu sous le quota" };
  else S.cadence = { niv: "crit", mot: "Sous le quota" };

  M.ageMin = (Date.now() - M.maj.getTime()) / 60000;
  M.perime = !M.demo && M.ageMin > cfg.fraicheurMin;
  S.global = pire(S.fin.niv, S.rejets.niv, S.dec.niv);
  M.alertes = construireAlertes(M);
  return M;
}

/* ───────── 4. Alertes : un constat, une action ───────── */
function construireAlertes(M) {
  const A = [], cfg = M.cfg, S = M.statut;
  const push = (niv, titre, texte, action) => A.push({ niv, titre, texte, action });
  if (M.perime) push("warn", "Les données ne sont plus actualisées", `Dernière mise à jour à ${min2hm(M.now)}, il y a ${duree(M.ageMin)}.`, "Vérifier que le classeur Excel d'alimentation tourne toujours sur le poste.");
  if (M.horsJour) push("crit", "Au rythme actuel, la charge ne sera pas terminée aujourd'hui", `Il reste ${n0(M.reste)} lignes et l'équipe en valide ${n0(M.debit)} par heure.`, fini(M.margeOps) && M.margeOps < 0 ? `Il manque ${n1(-M.margeOps)} préparateur${-M.margeOps >= 2 ? "s" : ""} pour finir à ${min2hm(M.finVisee)} : demander un renfort ou reporter une vague.` : "Demander un renfort ou reporter une vague.");
  else if (S.fin.niv === "warn" || S.fin.niv === "crit") {
    const manque = fini(M.margeOps) && M.margeOps < 0 ? -M.margeOps : null;
    push(S.fin.niv, `Fin estimée à ${min2hm(M.eta)} : ${S.fin.mot}`,
      `Il reste ${n0(M.reste)} lignes et l'équipe en valide ${n0(M.debit)} par heure. L'heure visée est ${min2hm(M.finVisee)}.`,
      manque ? `Renforcer le picking de ${n1(manque)} préparateur${manque >= 2 ? "s" : ""} dès maintenant, ou prévoir ${duree(-M.ecart)} de plus en fin de poste.` : `Prévoir ${duree(-M.ecart)} de plus en fin de poste ou basculer un renfort sur le picking.`);
  }
  if (S.rejets.niv === "warn" || S.rejets.niv === "crit") {
    const top = M.rejets.top[0];
    push(S.rejets.niv, `Rejets : ${n0(M.rejets.total)} colis, ${n0(M.rejets.proj)} attendus en fin de journée`,
      `L'objectif du site est de ${cfg.rejetsMax} rejets par jour au maximum.`,
      top ? `Faire remesurer l'article le plus rejeté (${top.art}, ${top.n} rejets) : un poids faux dans la fiche provoque des rejets inutiles.` : "Vérifier le réglage de la balance et les articles les plus rejetés.");
  }
  if (S.dec.niv === "warn" || S.dec.niv === "crit") {
    const t = M.dec.types.find(x => x.n > 0);
    push(S.dec.niv, `${n0(M.dec.total)} erreurs décelées au contrôle (seuil ${S.dec.niv === "crit" ? cfg.decRouge : cfg.decOrange})`,
      t ? `Première cause aujourd'hui : « ${t.nom} » (${t.n}).` : "Vraies erreurs trouvées dans les colis rejetés.",
      "Faire un rappel de 2 minutes à l'équipe : lire l'étiquette en entier, compter, puis valider (standard P4).");
  }
  if (S.cadence.niv === "crit") push("warn", `Quota de l'équipe : ${n0(M.pctStandard)} % en ce moment`, `Chaque préparateur valide ${n0(M.cadenceOp)} lignes par heure. Le seuil rouge est à ${cfg.quotaRouge} %.`, "Regarder ce qui freine : attente de chariots, ruptures, réappro, allées encombrées.");
  if (fini(M.tournees.libres) && fini(M.actifs) && M.tournees.libres >= Math.max(12, M.actifs * 1.5)) push("warn", `${n0(M.tournees.libres)} chariots attendent un préparateur`, "Tournées lancées mais pas encore prises.", "Vérifier l'affectation : priorité aux chariots de la prochaine vague.");
  if (M.stock && +M.stock.critique > 0) push(+M.stock.critique >= 5 ? "crit" : "warn", `${n0(M.stock.critique)} ${pluriel(+M.stock.critique, "emplacement")} picking au niveau critique`, `${n0(M.stock.reappro)} emplacements sont sous leur seuil d'alerte.`, "Prévenir le cariste : réapprovisionner avant que la rupture ne bloque les chariots.");
  if (M.retard && +M.retard.commandes > 0) push("warn", `${n0(M.retard.commandes)} ${pluriel(+M.retard.commandes, "commande")} en retard d'expédition`, "Date d'expédition prévue dépassée, colis pas tous sortis.", "Les traiter en priorité et prévenir l'expédition.");
  const rang = { crit: 0, warn: 1 };
  return A.sort((a, b) => rang[a.niv] - rang[b.niv]);
}

/* ───────── 5. Démonstration : une journée type simulée, cohérente d'une minute à l'autre ───────── */
const Demo = (() => {
  const DEB = 360, FIN = 1230;
  const PAUSES = [["09:00", "09:20"], ["16:30", "16:50"]];
  const P = lirePauses(PAUSES);
  const PRENOMS = ["Camille", "Lucas", "Inès", "Hugo", "Léa", "Nathan", "Sarah", "Yanis", "Manon", "Théo", "Jade", "Enzo", "Chloé", "Karim", "Laura"];
  const alea = (a, b) => { let t = (a * 73856093) ^ (b * 19349663) ^ 0x9E3779B9; t = Math.imul(t ^ (t >>> 15), 2246822507); t = Math.imul(t ^ (t >>> 13), 3266489909); return ((t ^ (t >>> 16)) >>> 0) / 4294967296; };
  const OPS = PRENOMS.map((p, i) => ({ code: String(104 + i * 41), nom: p, deb: i < 6 ? 360 : 750 + (i % 3) * 5, fin: i < 6 ? 810 : 1200, cad: 64 + Math.round(alea(i, 7) * 30) }));
  const VAGUES = [{ m: 340, lig: 2600 }, { m: 490, lig: 1500 }, { m: 645, lig: 1400 }, { m: 800, lig: 1300 }, { m: 940, lig: 800 }];
  const TOTAL = VAGUES.reduce((s, v) => s + v.lig, 0);
  const ERREURS = [[415, 4, "06"], [452, 2, "03"], [508, 1, "10"], [561, 3, "02"], [598, 4, "09"], [633, 0, "07"], [682, 3, "04"], [731, 1, "10"], [770, 4, "01"], [803, 3, "05"], [826, 2, "10"], [851, 3, "03"], [873, 1, "08"], [889, 3, "02"], [905, 2, "09"], [918, 4, "10"], [947, 3, "06"], [981, 1, "13"], [1012, 5, "04"], [1049, 3, "01"], [1090, 2, "11"], [1128, 3, "07"], [1161, 1, "03"]];
  const DEPARTS = [[510, "Navette agences", "Agences Lorraine nord", 260], [600, "Messagerie", "Clients directs 54 / 57", 180], [735, "Navette agences", "Agences Alsace", 420], [810, "Express", "Chantiers urgents", 90], [915, "Navette agences", "Agences Champagne", 380], [990, "Messagerie", "Clients directs 88 / 55", 210], [1035, "Navette agences", "Agences Bourgogne", 440], [1140, "Navette de nuit", "Plateforme régionale", 620]];
  const t0 = Date.now();
  let depart = null, vitesse = 1;

  function regler(opts) {
    vitesse = opts.vitesse > 0 ? opts.vitesse : 1;
    const maintenant = new Date(), reel = maintenant.getHours() * 60 + maintenant.getMinutes() + maintenant.getSeconds() / 60;
    depart = fini(opts.t) ? opts.t : (reel >= DEB + 25 && reel <= FIN - 75 ? reel : 920);
  }
  function horloge() {
    let m = depart + (Date.now() - t0) / 60000 * vitesse;
    if (vitesse > 1) { const span = FIN + 20 - DEB; m = DEB + ((m - DEB) % span + span) % span; }
    return clamp(m, DEB, FIN + 20);
  }
  /* lignes validées par un préparateur dans le quart d'heure [q, q+15), limitées à l'instant t */
  function lignesQuart(o, i, q, t) {
    const a = Math.max(q, o.deb), b = Math.min(q + 15, o.fin, t);
    if (b <= a) return 0;
    const lance = a - o.deb < 30 ? 0.8 : 1;
    return o.cad * (0.86 + 0.28 * alea(i + 1, q)) * lance * minutesProductives(a, b, P) / 60;
  }
  function instantane() {
    const t = horloge();
    const quarts = [], parOp = OPS.map(() => 0), prem = OPS.map(() => null), dern = OPS.map(() => null);
    let brut = 0;
    for (let q = DEB; q < t; q += 15) {
      let s = 0;
      OPS.forEach((o, i) => { const l = lignesQuart(o, i, q, t); if (l > 0) { parOp[i] += l; s += l; if (prem[i] == null) prem[i] = Math.max(q, o.deb) + 2; dern[i] = Math.min(q + 15, o.fin, t) - alea(i, q) * 3; } });
      quarts.push({ m: q, l: s }); brut += s;
    }
    const lance = VAGUES.filter(v => v.m <= t).reduce((s, v) => s + v.lig, 0);
    const k = brut > 0 ? Math.min(1, (lance - (lance < TOTAL ? 60 : 0)) / brut) : 1;    // on ne prépare pas plus que ce qui est lancé
    const fait = Math.round(brut * k);
    const heures = [];
    for (let h = 6; h <= Math.floor((t - 0.01) / 60); h++) {
      const l = quarts.filter(q => Math.floor(q.m / 60) === h).reduce((s, q) => s + q.l, 0) * k;
      const ops = OPS.filter(o => o.deb < Math.min((h + 1) * 60, t) && o.fin > h * 60).length;
      heures.push({ h, lignes: Math.round(l), ops });
    }
    const operateurs = OPS.map((o, i) => { if (!(parOp[i] > 0)) return null; const nt = Math.max(1, Math.round(parOp[i] * k / 49)), p = Math.round(nt * (0.38 + 0.3 * alea(i, 31))), g = Math.round(nt * 0.1 * alea(i, 17)); return { code: o.code, nom: o.nom, lignes: Math.round(parOp[i] * k), tournees: nt, cont: Math.round(parOp[i] * k / 2.56), premiere: min2hm(prem[i]), derniere: min2hm(dern[i]), p, m: Math.max(0, nt - p - g), g }; }).filter(Boolean);
    const restant = Math.max(0, lance - fait), aLancer = TOTAL - lance;
    const cont = Math.round(fait / 2.56), actifs = OPS.filter(o => o.deb <= t && o.fin > t).length;
    let cumul = 0;
    const vagues = VAGUES.filter(v => v.m <= t).map((v, i) => { const prep = clamp(fait - cumul, 0, v.lig); cumul += v.lig; return { num: 481200 + i * 37, heure: min2hm(v.m), etat: prep >= v.lig ? "Terminée" : prep > 0 ? "En cours" : "Lancée", ligPrev: v.lig, ligPrep: Math.round(prep), ligRupt: Math.round(v.lig * 0.004), contPrev: Math.round(v.lig / 2.56), contSortie: Math.round(prep / 2.56 * 0.9) }; });
    const rejH = heures.map(x => ({ h: x.h, n: Math.round(x.lignes / 2.56 * (0.016 + 0.014 * alea(x.h, 3))) }));
    const errs = ERREURS.filter(x => x[0] <= t), types = {}, allees = {};
    TYPES_ERREUR.forEach(n => (types[n] = 0));
    errs.forEach(x => { types[TYPES_ERREUR[x[1]]]++; allees[x[2]] = (allees[x[2]] || 0) + 1; });
    const departs = DEPARTS.map(x => { const parti = t >= x[0], av = clamp((t - (x[0] - 150)) / 150, 0, 1); return { heure: min2hm(x[0]), transp: x[1], dest: x[2], contMax: x[3], contReel: Math.round(x[3] * (parti ? 0.94 + 0.05 * alea(x[0], 1) : av * 0.9)), etat: parti ? "Parti" : av > 0 ? "Chargement" : "Prévu" }; });
    const jour = new Date(); jour.setHours(0, 0, 0, 0);
    const maj = new Date(jour.getTime() + t * 60000);
    const hist = [], dd = new Date(jour);
    while (hist.length < 30) { dd.setDate(dd.getDate() - 1); const js = dd.getDay(); if (js === 0 || js === 6) continue; const s = dd.getDate() + dd.getMonth() * 31; const lig = Math.round(6700 + 1300 * alea(s, 11) + (js === 5 ? -550 : 0)); const ops = 13 + Math.round(alea(s, 5) * 4); hist.unshift({ d: dd.toISOString().slice(0, 10), quota: Math.round((93 + 11 * alea(s, 8)) * 10) / 10, lignes: lig, hPick: Math.round(lig / (70 + 8 * alea(s, 9)) * 10) / 10, ops, ed: Math.round(lig * (0.0016 + 0.0022 * alea(s, 2))), ea: Math.round(alea(s, 4) * 2.4), rejets: Math.round(70 + 60 * alea(s, 6)) }); }
    const carnet = []; const dc = new Date(jour);
    while (carnet.length < 5) { dc.setDate(dc.getDate() + 1); const js = dc.getDay(); if (js === 0 || js === 6) continue; const s = dc.getDate() * 3 + dc.getMonth(); const lig = Math.round(9200 + 2600 * alea(s, 21) - carnet.length * 450); carnet.push({ date: dc.toISOString().slice(0, 10), lignes: lig, aPreparer: lig, commandes: Math.round(lig / 9.5) }); }
    const moisCourant = hist.filter(x => x.d.slice(0, 7) === jour.toISOString().slice(0, 7));
    const base = moisCourant.length >= 3 ? moisCourant : hist.slice(-10);
    const sm = k2 => base.reduce((s, x) => s + x[k2], 0);
    return {
      v: 1, source: "DEMO", maj: maj.toISOString().slice(0, 10) + "T" + min2hm(t) + ":" + String(Math.floor((t % 1) * 60)).padStart(2, "0"),
      cfg: { site: "CLR Champigneulles", debut: "06:00", finVisee: "19:00", pauses: PAUSES, jalons: ["12:15", "15:15", "17:15", "19:00"], inclureALancer: true, effectifPrevu: [["06:00", 6], ["12:30", 15], ["13:30", 9], ["20:00", 0]] },
      charge: { fait, restant, aLancer, contFaits: cont, tourneesFaites: Math.round(fait / 49), tourneesOuvertes: Math.round(restant / 47), tourneesLibres: Math.max(0, Math.round(restant / 47) - actifs),
        classes: { p: operateurs.reduce((s, o) => s + o.p, 0), m: operateurs.reduce((s, o) => s + o.m, 0), g: operateurs.reduce((s, o) => s + o.g, 0) },
        types: [{ code: "DETAIL", lib: "Détail", fait: Math.round(fait * 0.86), restant: Math.round(restant * 0.86) }, { code: "CARTON", lib: "Carton", fait: fait - Math.round(fait * 0.86), restant: restant - Math.round(restant * 0.86) }] },
      heures, quarts: quarts.slice(-10).map(q => ({ t: min2hm(q.m), lignes: Math.round(q.l * k) })), operateurs, vagues,
      rejets: { total: rejH.reduce((s, x) => s + x.n, 0), pese: cont, parHeure: rejH, top: [{ art: "LEG405821", lib: "Prise 2P+T affleurante", n: 7 }, { art: "SCH219340", lib: "Disjoncteur 16 A courbe C", n: 5 }, { art: "BIZ700118", lib: "Collier de fixation 200 mm", n: 4 }, { art: "NDX554203", lib: "Embout de câblage 1,5 mm²", n: 4 }, { art: "BLI680077", lib: "Boîte d'encastrement Ø 67", n: 3 }] },
      decelees: { total: errs.length, types, allees, derniere: errs.length ? min2hm(errs[errs.length - 1][0]) : null, source: "Contrôle des rejets",
        hist: { jours: 7, total: 148, allees: { "01": 10, "02": 13, "03": 14, "04": 11, "05": 11, "06": 8, "07": 10, "08": 11, "09": 12, "10": 17, "11": 7, "12": 3, "13": 5, "14": 3 }, types: { "Orientation": 41, "Quantité -": 36, "Quantité +": 33, "Référence": 32, "Manquante": 4, "Casse": 2 } } },
      departs,
      services: [{ code: "HG", lib: "Hors gabarit", fait: Math.round(fait * 0.36), restant: Math.round(restant * 0.4) }, { code: "CABL", lib: "Câble", fait: Math.round(fait * 0.055), restant: Math.round(restant * 0.06) }],
      stock: { reappro: 9, critique: 2, ruptures: 6, critiques: [{ emp: "06-121-05", art: "LEG405821", reel: 2 }, { emp: "10-075-02", art: "SCH219340", reel: 0 }] }, retard: { commandes: 3, lignes: 21 }, carnet, historique: hist,
      mois: { lignes: sm("lignes"), jours: base.length, ed: sm("ed"), ea: sm("ea"), hPick: sm("hPick"), rejetsJour: Math.round(sm("rejets") / base.length), quota: Math.round(sm("quota") / base.length * 10) / 10 },
      securite: { joursSansAccident: 187, message: "Je regarde derrière moi avant de reculer avec mon chariot." },
      messages: ["Brief d'équipe à 13:00 au point Top 5."]
    };
  }
  return { regler, horloge, instantane, DEB, FIN };
})();
