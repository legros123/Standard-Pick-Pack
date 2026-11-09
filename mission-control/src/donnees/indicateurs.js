/* Calcul des indicateurs dérivés à partir d'un instantané normalisé.
   Règle d'or : si une donnée source manque, le résultat est null
   (« indisponible ») — jamais 0. Les estimations portent leur méthode. */
import { enMinutes, enHHMM, fenetre, minutesProductives, isoDate } from './temps.js';

const n = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const div = (a, b) => (n(a) !== null && n(b) ? a / b : null);

/** Avance de `minutes` productives à partir de h (pauses sautées) ; null si dépasse la fin. */
function avancerProductif(f, h, minutes) {
  let t = h;
  let reste = minutes;
  while (reste > 0 && t < f.fin) {
    const pause = f.pauses.find(([a, b]) => t >= a && t < b);
    if (pause) { t = pause[1]; continue; }
    const prochaine = Math.min(f.fin, ...f.pauses.filter(([a]) => a > t).map(([a]) => a));
    const dispo = prochaine - t;
    if (dispo >= reste) return t + reste;
    reste -= dispo;
    t = prochaine;
  }
  return reste > 0 ? null : t;
}

export function calculer(snap, cfg, filtres, maintenant = new Date()) {
  if (!snap) return { disponible: false };
  const v = snap.valeurs;
  const periode = snap.meta.periode || filtres.periode;
  const f = fenetre(cfg.equipes, filtres.equipe);
  const fService = fenetre(cfg.equipes, 'toutes');
  const estJour = periode === 'jour';
  const genere = snap.meta.genereLe ? new Date(snap.meta.genereLe) : null;
  let heure = enMinutes(snap.meta.heure);
  if (heure === null && genere && !Number.isNaN(genere.getTime())) heure = genere.getHours() * 60 + genere.getMinutes();
  const enCours = estJour && snap.meta.date === isoDate(maintenant) && heure !== null && f && heure < f.fin;
  if (estJour && heure === null) heure = f ? f.fin : null;
  const tauxRef = cfg.objectifs.quotaLignes / cfg.objectifs.heuresRef; // lignes / heure / préparateur

  /* ── objectif de lignes ── */
  let objectif = n(v.objectifLignes);
  let objectifMethode = objectif !== null ? 'source' : null;
  if (objectif === null && cfg.objectifs.mode === 'quota' && n(v.preparateursPresents) !== null && estJour) {
    objectif = Math.round(v.preparateursPresents * cfg.objectifs.quotaLignes);
    objectifMethode = 'quota';
  }
  if (objectif === null && cfg.objectifs.mode === 'fixe' && estJour) {
    objectif = cfg.objectifs.objectifFixe;
    objectifMethode = 'fixe';
  }
  const objectifTexte = {
    source: snap.meta.objectifMethode || 'Objectif transmis par la source de données.',
    quota: `Objectif calculé : ${v.preparateursPresents} préparateurs présents × ${cfg.objectifs.quotaLignes} lignes (quota validé, PARAMETRES B5).`,
    fixe: `Objectif fixe défini dans les réglages : ${cfg.objectifs.objectifFixe} lignes / jour.`,
  }[objectifMethode] || 'Objectif indisponible : ni objectif transmis, ni effectif de préparateurs.';

  /* ── série & cumuls ── */
  const serie = snap.serie || [];
  const objectifsSerie = serie.map((p) => n(p.objectif));
  const objectifParBucket = objectifsSerie.every((x) => x !== null) && serie.length ? objectifsSerie : null;

  /* ── lignes attendues à l'heure de la situation ── */
  let attendu = null;
  let attenduMethode = '';
  if (objectif !== null) {
    if (estJour && f && heure !== null) {
      const total = minutesProductives(f, f.debut, f.fin);
      attendu = Math.round(objectif * minutesProductives(f, f.debut, heure) / Math.max(1, total));
      attenduMethode = `objectif × temps productif écoulé (${Math.round(minutesProductives(f, f.debut, heure))} min) ÷ temps productif du poste (${Math.round(total)} min), pauses exclues`;
    } else if (!estJour && objectifParBucket) {
      const auj = isoDate(maintenant);
      attendu = 0;
      serie.forEach((p, i) => {
        if (p.t < auj) attendu += objectifParBucket[i];
        else if (p.t === auj && f && heure !== null) attendu += objectifParBucket[i] * minutesProductives(f, f.debut, heure) / Math.max(1, minutesProductives(f, f.debut, f.fin));
      });
      attendu = Math.round(attendu);
      attenduMethode = 'somme des objectifs des jours écoulés + part écoulée du jour en cours';
    }
  }

  const lignes = n(v.lignesPreparees);
  const ecart = lignes !== null && attendu !== null ? lignes - attendu : null;
  const ecartPct = ecart !== null && attendu > 0 ? (ecart / attendu) * 100 : null;
  const pctObjectif = div(lignes, objectif);

  /* ── cadence & débit : dernière heure complète ── */
  let derniere = null;
  for (let i = serie.length - 1; i >= 0; i--) {
    if (n(serie[i].lignes) !== null && !serie[i].partiel) { derniere = serie[i]; break; }
  }
  const valeursHoraires = serie.filter((p) => n(p.lignes) !== null && !p.partiel);
  const cadence = estJour && derniere ? derniere.lignes : null;
  const debit = estJour && derniere ? n(derniere.colis) : null;
  const debitMoyen = estJour && valeursHoraires.length && valeursHoraires.every((p) => n(p.colis) !== null)
    ? valeursHoraires.reduce((a, p) => a + p.colis, 0) / valeursHoraires.length : null;
  const heuresRestantes = estJour && f && heure !== null ? minutesProductives(f, heure, f.fin) / 60 : null;
  const resteObjectif = objectif !== null && lignes !== null ? Math.max(0, objectif - lignes) : null;
  const rythmeRequis = resteObjectif !== null && heuresRestantes > 0.05 ? resteObjectif / heuresRestantes : null;

  /* ── capacité restante (ESTIMATION, service entier) ── */
  let capacite = null;
  let capaciteMethode = '';
  if (estJour && fService && heure !== null && enCours) {
    const eqs = Array.isArray(snap.equipes) && snap.equipes.length ? snap.equipes : null;
    if (eqs) {
      capacite = 0;
      const morceaux = [];
      for (const e of eqs) {
        const fe = fenetre(cfg.equipes, e.id) || fService;
        const prep = n(e.preparateursPresents) ?? n(e.preparateursPrevus);
        if (prep === null) { capacite = null; break; }
        const hr = minutesProductives(fe, heure, fe.fin) / 60;
        capacite += prep * tauxRef * hr;
        if (hr > 0) morceaux.push(`${e.nom || e.id} : ${prep} prép. × ${hr.toFixed(1).replace('.', ',')} h`);
      }
      if (capacite !== null) {
        capacite = Math.round(capacite);
        capaciteMethode = `${morceaux.join(' + ')} × ${tauxRef.toFixed(1).replace('.', ',')} lignes/h (quota ${cfg.objectifs.quotaLignes} ÷ ${String(cfg.objectifs.heuresRef).replace('.', ',')} h). Équipe à venir comptée à l’effectif prévu.`;
      }
    } else if (n(v.preparateursPresents) !== null && fService) {
      const hr = minutesProductives(fService, heure, fService.fin) / 60;
      capacite = Math.round(v.preparateursPresents * tauxRef * hr);
      capaciteMethode = `${v.preparateursPresents} préparateurs × ${hr.toFixed(1).replace('.', ',')} h productives restantes × ${tauxRef.toFixed(1).replace('.', ',')} lignes/h.`;
    }
  }
  const charge = n(v.chargeRestante);
  const ratioCapacite = charge !== null && capacite ? (charge / capacite) * 100 : null;

  /* ── fin de préparation estimée (ESTIMATION) ── */
  let finEstimee = null;
  if (estJour && enCours && charge !== null && cadence && fService) {
    const minutes = (charge / cadence) * 60;
    const t = avancerProductif(fService, heure, minutes);
    finEstimee = {
      heure: t === null ? null : enHHMM(t),
      auDela: t === null,
      heures: charge / cadence,
      methode: `charge restante (${charge} lignes) ÷ cadence de la dernière heure complète (${cadence} lignes/h), pauses exclues.`,
    };
  }

  /* ── rejets ── */
  const controles = n(v.colisControles);
  const rejets = n(v.rejetsConvoyeur);
  const taux = div(rejets, controles);
  // fenêtre récente : dernière tranche horaire complète + tranche en cours
  let recent = null;
  if (estJour && derniere) {
    const i = serie.indexOf(derniere);
    const fen = serie.slice(i).filter((p) => n(p.rejets) !== null && n(p.colis) !== null);
    const colisR = fen.reduce((a, p) => a + p.colis, 0);
    const rejetsR = fen.reduce((a, p) => a + p.rejets, 0);
    if (colisR > 0) recent = { depuis: derniere.t, colis: colisR, rejets: rejetsR, taux: rejetsR / colisR };
  }

  /* ── qualité ── */
  const erreurs = n(v.erreursDecelees);
  const ppm = erreurs !== null && lignes ? Math.round((erreurs / lignes) * 1e6) : null;
  const averees = n(v.erreursAverees);
  const ppmAveree = averees !== null && lignes ? Math.round((averees / lignes) * 1e6) : null;

  /* ── effectif ── */
  const present = n(v.effectifPresent);
  const prevu = n(v.effectifPrevu);

  /* ── points pour la courbe ── */
  const points = { type: estJour ? 'heure' : 'jour', reel: [], objectif: [], barres: [], etiquettes: [] };
  if (estJour && f) {
    let cumR = 0;
    let cumO = 0;
    points.reel.push({ x: f.debut, y: 0 });
    points.objectif.push({ x: f.debut, y: 0 });
    serie.forEach((p, i) => {
      const t0 = enMinutes(p.t);
      if (t0 === null) return;
      const t1 = Math.min(f.fin, t0 + 60);
      const objB = objectifParBucket ? objectifParBucket[i]
        : objectif !== null ? objectif * minutesProductives(f, t0, t1) / Math.max(1, minutesProductives(f, f.debut, f.fin)) : null;
      if (objB !== null) { cumO += objB; points.objectif.push({ x: t1, y: cumO }); }
      if (n(p.lignes) !== null) {
        cumR += p.lignes;
        points.reel.push({ x: p.partiel && heure !== null ? Math.min(t1, heure) : t1, y: cumR });
      }
      points.barres.push({ x0: Math.max(f.debut, t0), x1: t1, y: n(p.lignes), partiel: !!p.partiel, objectif: objB });
    });
    if (!points.objectif.length || points.objectif.length < 2) points.objectif = [];
    points.domaine = [f.debut, f.fin];
  } else {
    let cumR = 0;
    let cumO = 0;
    serie.forEach((p, i) => {
      if (n(p.objectif) !== null) { cumO += p.objectif; points.objectif.push({ x: i + 1, y: cumO }); }
      if (n(p.lignes) !== null) { cumR += p.lignes; points.reel.push({ x: i + 1, y: cumR }); }
      points.barres.push({ x0: i, x1: i + 1, y: n(p.lignes), partiel: !!p.partiel, objectif: n(p.objectif), t: p.t });
    });
    if (points.reel.length) points.reel.unshift({ x: 0, y: 0 });
    if (points.objectif.length) points.objectif.unshift({ x: 0, y: 0 });
    points.domaine = [0, Math.max(1, serie.length)];
  }

  return {
    disponible: true,
    periode, estJour, enCours, heure, fenetre: f, genere,
    lignes: { valeur: lignes, objectif, objectifMethode, objectifTexte, attendu, attenduMethode, ecart, ecartPct, pctObjectif, cadence, rythmeRequis, resteObjectif, heuresRestantes, derniere },
    production: { valeur: n(v.colisProduits), objectif: n(v.objectifColis), debit, debitMoyen, controles },
    charge: { valeur: charge, capacite, capaciteMethode, ratio: ratioCapacite, finEstimee },
    rejets: { valeur: rejets, controles, taux, recent, attente: n(v.colisEnAttenteRejet) },
    qualite: { ppm, erreurs, lignes, averees, ppmAveree },
    effectif: { present, prevu, absents: present !== null && prevu !== null ? Math.max(0, prevu - present) : null, preparateurs: n(v.preparateursPresents), moyen: !!v.effectifMoyen, equipes: snap.equipes },
    serie: points,
    serieBrute: serie,
  };
}
