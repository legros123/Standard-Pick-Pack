/* ════════════════════════════════════════════════════════════════════
   MODE DÉMONSTRATION — DONNÉES FICTIVES
   Ce module est volontairement isolé du connecteur réel : il fabrique un
   instantané au format normalisé (voir schema.js) à partir d'un modèle
   simple et déterministe (même date → mêmes valeurs). Aucun nom, aucune
   donnée réelle. Le bandeau « DONNÉES DE DÉMONSTRATION » reste affiché
   tant que cette source est active.
   ════════════════════════════════════════════════════════════════════ */
import { enMinutes, enHHMM, isoDate, minutesDuJour, minutesProductives, joursDePeriode, estJourOuvre, fenetre } from './temps.js';

const PAS = 5; // minutes par créneau simulé

function graine(texte) {
  let h = 2166136261;
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function alea(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Répartit un total entier selon des poids (arrondi cumulatif, sans dérive). */
function repartir(total, poids) {
  const somme = poids.reduce((a, b) => a + b, 0) || 1;
  let cumul = 0;
  let deja = 0;
  return poids.map((p) => {
    cumul += (p / somme) * total;
    const v = Math.round(cumul) - deja;
    deja += v;
    return v;
  });
}

/** Simule une journée complète, créneau par créneau, pour chaque équipe. */
function simulerJour(dateIso, cfg, scenario) {
  const { equipes, objectifs } = cfg;
  const r = alea(graine(`pmc-${dateIso}`));
  const effectifs = { matin: 13, 'apres-midi': 12 };
  const sortie = { date: dateIso, equipes: [] };

  for (const e of equipes) {
    const re = alea(graine(`pmc-${dateIso}-${e.id}`));
    const f = fenetre(equipes, e.id);
    const prevu = effectifs[e.id] ?? 11;
    const horsPrep = 3; // contrôle, rejet / emballage, pilote
    const absents = scenario === 'objectif' ? 0 : Math.floor(re() * re() * 3.2);
    const present = prevu - absents;
    const prep = prevu - horsPrep - absents;
    const objectif = prep * objectifs.quotaLignes; // règle validée : 620 lignes par préparateur et par jour
    const perf = scenario === 'objectif' ? 1.075 : 0.9 + re() * 0.15;
    const total = Math.round(objectif * perf);
    const lpc = 3.7 + re() * 0.7;                  // lignes par colis
    const tau = 0.021 + re() * 0.011;              // taux de rejet de base
    const partErreur = 0.08 + re() * 0.07;         // part des rejets qui sont des erreurs avérées au contrôle

    const creneaux = [];
    let bruit = 1;
    for (let m = f.debut; m < f.fin; m += PAS) {
      const dep = m - f.debut;
      const reste = f.fin - m;
      bruit = 0.75 * bruit + 0.25 * (0.88 + re() * 0.24);
      let w = dep < 15 ? 0.5 : dep < 35 ? 0.85 : reste <= 25 ? 0.72 : 1;
      const prod = minutesProductives(f, m, m + PAS) / PAS;
      w *= prod * bruit;
      creneaux.push({ m, w });
    }
    const lignes = repartir(total, creneaux.map((c) => c.w));
    const colis = repartir(Math.round(total / lpc), creneaux.map((c, i) => lignes[i]));
    creneaux.forEach((c, i) => {
      c.lignes = lignes[i];
      c.colis = colis[i];
      c.tau = tau;
    });
    sortie.equipes.push({ id: e.id, nom: e.nom, f, prevu, present, prep, prepPrevu: prevu - horsPrep, objectif, creneaux, partErreur, lpc });
  }

  // Carnet de commandes du service : stock initial + arrivées jusqu'à 16:30
  const totalJour = sortie.equipes.reduce((a, e) => a + e.creneaux.reduce((s, c) => s + c.lignes, 0), 0);
  // demande du jour légèrement inférieure à la production : le carnet se termine en fin de poste
  const demande = Math.round(totalJour * (0.965 + r() * 0.025));
  sortie.carnetInitial = Math.round(totalJour * (0.4 + r() * 0.05));
  sortie.arriveesTotal = demande - sortie.carnetInitial;
  sortie.finArrivees = enMinutes('16:30');
  sortie.debutJour = Math.min(...sortie.equipes.map((e) => e.f.debut));
  return sortie;
}

/** Charge restante du service (lignes) à l'heure h : carnet initial + arrivées − lignes préparées. */
function chargeService(jour, h) {
  let produit = 0;
  for (const e of jour.equipes) for (const c of e.creneaux) {
    if (c.m >= h) break;
    produit += Math.round(c.lignes * Math.min(1, (h - c.m) / PAS));
  }
  const fracArrivee = Math.max(0, Math.min(1, (h - jour.debutJour) / (jour.finArrivees - jour.debutJour)));
  const arrivees = Math.round(jour.arriveesTotal * (1 - Math.pow(1 - fracArrivee, 1.25)));
  return Math.max(0, jour.carnetInitial + arrivees - produit);
}

/** Applique le scénario « incident rejet » : taux de rejet fortement relevé sur les 40 dernières minutes. */
function rejetsCreneau(c, heure, scenario) {
  const incident = scenario === 'incident' && c.m >= heure - 40 && c.m < heure;
  const tau = incident ? 0.115 : c.tau;
  return { tau, incident };
}

/** Coupe une journée simulée à l'heure h (minutes) et agrège pour un filtre d'équipe. */
function etatJour(jour, h, equipeId, scenario) {
  const eqs = equipeId === 'toutes' ? jour.equipes : jour.equipes.filter((e) => e.id === equipeId);
  const v = { lignes: 0, colis: 0, rejets: 0, erreurs: 0 };
  const heures = new Map();
  let rejetsRecents = 0;
  for (const e of eqs) {
    let acc = 0;
    let accErr = 0;
    for (const c of e.creneaux) {
      if (c.m >= h) break;
      const frac = Math.min(1, (h - c.m) / PAS);
      const l = Math.round(c.lignes * frac);
      const co = Math.round(c.colis * frac);
      const { tau, incident } = rejetsCreneau(c, h, scenario);
      acc += co * tau;
      const rj = Math.floor(acc);
      acc -= rj;
      accErr += rj * (incident ? 0.32 : e.partErreur);
      const er = Math.floor(accErr);
      accErr -= er;
      v.lignes += l; v.colis += co; v.rejets += rj; v.erreurs += er;
      if (c.m >= h - 45) rejetsRecents += rj;
      const cle = Math.floor(c.m / 60) * 60;
      const b = heures.get(cle) || { lignes: 0, colis: 0, rejets: 0, erreurs: 0 };
      b.lignes += l; b.colis += co; b.rejets += rj; b.erreurs += er;
      heures.set(cle, b);
    }
  }
  const charge = chargeService(jour, h);
  const attente = Math.round(3 + rejetsRecents * 0.8);
  return { v, heures, charge, attente, eqs };
}

/** Heure simulée (minutes) : heure réelle pendant le poste, sinon horloge simulée qui avance. */
function heureSimulee({ maintenant, debutSession, demo, heureForcee, f, jour, scenario, equipeId, estAujourdhui }) {
  if (!estAujourdhui) return f.fin; // jour passé : journée complète
  const ecoule = (maintenant - debutSession) / 60000;
  if (heureForcee) return enMinutes(heureForcee) + ecoule;
  if (scenario === 'objectif') {
    // juste avant le franchissement de l'objectif : la prochaine actualisation le franchit
    const eqs = equipeId === 'toutes' ? jour.equipes : jour.equipes.filter((e) => e.id === equipeId);
    const obj = eqs.reduce((a, e) => a + e.objectif, 0);
    let cum = 0;
    const tous = eqs.flatMap((e) => e.creneaux).sort((a, b) => a.m - b.m);
    for (const c of tous) {
      if (cum + c.lignes >= obj) {
        const frac = (obj - cum) / Math.max(1, c.lignes);
        return c.m + frac * PAS - 1.6 + ecoule;
      }
      cum += c.lignes;
    }
  }
  const m = minutesDuJour(maintenant);
  if (demo.horloge === 'reelle' || (m >= f.debut + 20 && m < f.fin - 10)) return m;
  // hors poste : horloge simulée à partir de 10:36 (matin) / 15:12 (après-midi)
  const base = equipeId === 'apres-midi' ? enMinutes('15:12') : f.debut + Math.min(276, (f.fin - f.debut) * 0.62);
  return Math.min(f.fin - 1, base + ecoule);
}

let chargements = 0;

/**
 * Produit un instantané de démonstration au format normalisé.
 * @returns {object|null} null = aucune donnée (scénario « vide »)
 */
export function instantaneDemo({ filtres, cfg, maintenant = new Date(), debutSession = Date.now(), heureForcee = null }) {
  const scenario = cfg.demo.scenario;
  chargements += 1;
  if (scenario === 'vide') return null;
  if (scenario === 'interrompue' && chargements > 1) {
    throw new Error('Délai dépassé : la source de données ne répond pas (scénario de démonstration).');
  }

  const aujourdHui = isoDate(maintenant);
  const { date, periode, equipe } = filtres;
  const f = fenetre(cfg.equipes, equipe);
  const jours = joursDePeriode(date, periode).filter(estJourOuvre);
  if (!f || !jours.length || jours[0] > aujourdHui) return null;

  const jourRef = jours.includes(aujourdHui) ? aujourdHui : jours[jours.length - 1];
  const simRef = simulerJour(jourRef, cfg, scenario);
  const h = heureSimulee({ maintenant, debutSession, demo: cfg.demo, heureForcee, f, jour: simRef, scenario, equipeId: equipe, estAujourdhui: jourRef === aujourdHui });
  const heureTxt = enHHMM(h);

  const genere = new Date(maintenant);
  if (scenario === 'ancienne') genere.setMinutes(genere.getMinutes() - 34);

  const meta = {
    source: 'Démonstration — modèle fictif',
    genereLe: genere.toISOString(),
    date, periode, equipe,
    heure: heureTxt,
    heureSimulee: jourRef === aujourdHui && Math.abs(h - minutesDuJour(maintenant)) > 1,
    debut: enHHMM(f.debut), fin: enHHMM(f.fin),
    demo: true,
    objectifMethode: `Démonstration : préparateurs × ${cfg.objectifs.quotaLignes} lignes (quota validé, PARAMETRES B5) pour chaque équipe du filtre ; une équipe qui n’a pas encore pris son poste est comptée à son effectif prévu.`,
  };

  if (periode === 'jour') {
    if (!estJourOuvre(date)) return null;
    const s = etatJour(simRef, h, equipe, scenario);
    const objectif = s.eqs.reduce((a, e) => a + e.objectif, 0);
    const actives = s.eqs.filter((e) => e.f.debut <= h);
    const serie = [];
    for (let m = Math.floor(f.debut / 60) * 60; m < f.fin; m += 60) {
      const b = s.heures.get(m);
      const objH = s.eqs.reduce((a, e) => a + e.objectif * minutesProductives(e.f, m, m + 60) / Math.max(1, minutesProductives(e.f, e.f.debut, e.f.fin)), 0);
      serie.push(b && m < h
        ? { t: enHHMM(m), lignes: b.lignes, colis: b.colis, rejets: b.rejets, erreurs: b.erreurs, charge: chargeService(simRef, Math.min(h, m + 60)), objectif: Math.round(objH), partiel: m + 60 > h }
        : { t: enHHMM(m), lignes: null, colis: null, rejets: null, erreurs: null, objectif: Math.round(objH) });
    }
    return {
      version: 1, meta,
      valeurs: {
        lignesPreparees: s.v.lignes,
        objectifLignes: objectif,
        colisControles: s.v.colis,
        rejetsConvoyeur: s.v.rejets,
        colisEnAttenteRejet: h > f.debut ? s.attente : 0,
        colisProduits: Math.max(0, s.v.colis - (h > f.debut ? s.attente : 0)),
        objectifColis: cfg.objectifs.objectifColis,
        chargeRestante: s.charge,
        erreursDecelees: s.v.erreurs,
        erreursAverees: null,
        effectifPresent: actives.length ? actives.reduce((a, e) => a + e.present, 0) : null,
        effectifPrevu: actives.length ? actives.reduce((a, e) => a + e.prevu, 0) : null,
        preparateursPresents: actives.length ? actives.reduce((a, e) => a + e.prep, 0) : null,
      },
      serie,
      equipes: simRef.equipes.map((e) => ({
        id: e.id, nom: e.nom, debut: enHHMM(e.f.debut), fin: enHHMM(e.f.fin),
        enPoste: e.f.debut <= h && h < e.f.fin,
        effectifPresent: e.f.debut <= h ? e.present : null,
        effectifPrevu: e.prevu,
        preparateursPresents: e.f.debut <= h ? e.prep : null,
        preparateursPrevus: e.prepPrevu,
        objectifLignes: e.objectif,
      })),
    };
  }

  // Semaine / mois : un point par jour ouvré
  const serie = [];
  const tot = { lignes: 0, colis: 0, rejets: 0, erreurs: 0, averees: 0, obj: 0, pres: 0, prev: 0, prep: 0, n: 0 };
  let charge = null;
  let attente = 0;
  for (const j of jours) {
    const sim = j === jourRef ? simRef : simulerJour(j, cfg, scenario === 'objectif' ? 'normal' : scenario);
    const eqs = equipe === 'toutes' ? sim.equipes : sim.equipes.filter((e) => e.id === equipe);
    const objJ = eqs.reduce((a, e) => a + e.objectif, 0);
    tot.obj += objJ;
    if (j > aujourdHui) {
      serie.push({ t: j, lignes: null, colis: null, rejets: null, erreurs: null, objectif: objJ });
      continue;
    }
    const hj = j === aujourdHui ? h : f.fin;
    const s = etatJour(sim, hj, equipe, j === aujourdHui ? scenario : 'normal');
    const ra = alea(graine(`pmc-av-${j}`));
    const averees = j <= isoDate(new Date(maintenant.getTime() - 2 * 864e5)) ? Math.round(s.v.lignes * (0.00012 + ra() * 0.00012)) : 0;
    tot.lignes += s.v.lignes; tot.colis += s.v.colis; tot.rejets += s.v.rejets; tot.erreurs += s.v.erreurs; tot.averees += averees;
    const act = s.eqs.filter((e) => e.f.debut <= hj);
    if (act.length) {
      tot.pres += act.reduce((a, e) => a + e.present, 0);
      tot.prev += act.reduce((a, e) => a + e.prevu, 0);
      tot.prep += act.reduce((a, e) => a + e.prep, 0);
      tot.n += 1;
    }
    charge = s.charge;
    attente = j === aujourdHui ? s.attente : 0;
    serie.push({ t: j, lignes: s.v.lignes, colis: s.v.colis, rejets: s.v.rejets, erreurs: s.v.erreurs, objectif: objJ, partiel: j === aujourdHui && h < f.fin });
  }
  return {
    version: 1, meta,
    valeurs: {
      lignesPreparees: tot.lignes,
      objectifLignes: tot.obj,
      colisControles: tot.colis,
      rejetsConvoyeur: tot.rejets,
      colisEnAttenteRejet: attente,
      colisProduits: Math.max(0, tot.colis - attente),
      objectifColis: null,
      chargeRestante: charge,
      erreursDecelees: tot.erreurs,
      erreursAverees: tot.averees || null,
      effectifPresent: tot.n ? Math.round((tot.pres / tot.n) * 10) / 10 : null,
      effectifPrevu: tot.n ? Math.round((tot.prev / tot.n) * 10) / 10 : null,
      preparateursPresents: tot.n ? Math.round((tot.prep / tot.n) * 10) / 10 : null,
      effectifMoyen: true,
    },
    serie,
  };
}

export function reinitialiserDemo() {
  chargements = 0;
}
