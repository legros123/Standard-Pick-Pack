/* ════════════════════════════════════════════════════════════════════
   RÈGLES MÉTIER — alertes, états des zones, priorités.
   Chaque alerte découle d'un seuil configurable appliqué à une donnée
   mesurée : aucune alerte aléatoire, aucun score global arbitraire.
   ════════════════════════════════════════════════════════════════════ */
import { REGLES, ZONES } from '../config/defauts.js';
import { nombre, pct, signe } from '../commun/format.js';
import { enHHMM } from './temps.js';

const ORDRE = { critique: 2, vigilance: 1, conforme: 0 };

function niveau(valeur, seuil, inverse = false) {
  if (valeur === null || valeur === undefined) return null;
  if (!inverse) {
    if (seuil.critique !== undefined && valeur >= seuil.critique) return 'critique';
    if (valeur >= seuil.vigilance) return 'vigilance';
  } else {
    if (seuil.critique !== undefined && valeur <= seuil.critique) return 'critique';
    if (valeur <= seuil.vigilance) return 'vigilance';
  }
  return null;
}

function alerte(regle, niv, message, faits, cfg, seuilTexte) {
  const r = REGLES[regle];
  const action = (cfg.actions?.[regle] || '').trim();
  return {
    id: regle,
    regle,
    zone: r.zone,
    kpi: r.kpi,
    niveau: niv,
    titre: r.titre,
    message,
    faits,
    formule: r.formule,
    validee: r.validee,
    seuil: seuilTexte,
    action: action || null,
  };
}

export function evaluer(m, cfg) {
  if (!m?.disponible) return [];
  const s = cfg.seuils;
  const out = [];
  const hTxt = m.heure !== null && m.heure !== undefined ? enHHMM(m.heure) : '';

  // 1. Rythme de préparation
  const L = m.lignes;
  if (L.ecartPct !== null && L.attendu > 0 && L.objectif && L.attendu >= L.objectif * 0.04) {
    const niv = niveau(-L.ecartPct, s.rythme);
    if (niv) {
      out.push(alerte('rythme', niv,
        `Préparation en retard de ${nombre(-L.ecart)} lignes sur le rythme attendu (${signe(L.ecartPct, 1)} %).`,
        [
          ['Lignes préparées', `${nombre(L.valeur)} lignes`],
          [m.estJour ? `Lignes attendues à ${hTxt}` : 'Lignes attendues à date', `${nombre(L.attendu)} lignes`],
          ['Écart', `${signe(L.ecart)} lignes (${signe(L.ecartPct, 1)} %)`],
          ['Objectif', `${nombre(L.objectif)} lignes`],
          ...(L.cadence !== null ? [['Cadence de la dernière heure complète', `${nombre(L.cadence)} lignes/h`]] : []),
          ...(L.rythmeRequis !== null ? [['Rythme requis pour atteindre l’objectif', `${nombre(L.rythmeRequis)} lignes/h`]] : []),
        ], cfg, `vigilance au-delà de ${s.rythme.vigilance} % de retard, critique au-delà de ${s.rythme.critique} %`));
    }
  }

  // 2. Charge restante vs capacité (estimation)
  const C = m.charge;
  if (C.ratio !== null) {
    const niv = niveau(C.ratio, s.capacite);
    if (niv) {
      out.push(alerte('capacite', niv,
        `Charge restante supérieure à la capacité restante estimée (${nombre(C.ratio)} %).`,
        [
          ['Charge restante', `${nombre(C.valeur)} lignes`],
          ['Capacité restante (estimation)', `${nombre(C.capacite)} lignes`],
          ['Méthode', C.capaciteMethode],
          ['Rapport charge / capacité', `${nombre(C.ratio)} %`],
        ], cfg, `vigilance à ${s.capacite.vigilance} %, critique à ${s.capacite.critique} %`));
    }
  }

  // 3. Taux de rejet : fenêtre récente (vue Jour) sinon période
  const R = m.rejets;
  const recent = m.estJour && R.recent && R.recent.colis >= 40 ? R.recent : null;
  const tauxEval = recent ? recent.taux : R.taux;
  if (tauxEval !== null && (recent || (R.controles || 0) >= 50)) {
    const niv = niveau(tauxEval * 100, s.rejetTaux);
    if (niv) {
      const surQuoi = recent ? `depuis ${recent.depuis}` : 'sur la période';
      out.push(alerte('rejetTaux', niv,
        `Taux de rejet convoyeur de ${pct(tauxEval, 1)} ${surQuoi} — seuil ${nombre(s.rejetTaux.vigilance)} %.`,
        [
          ['Taux évalué', `${pct(tauxEval, 1)} ${surQuoi}`],
          ...(recent ? [[`Rejets depuis ${recent.depuis}`, `${nombre(recent.rejets)} rejets / ${nombre(recent.colis)} colis`]] : []),
          ['Cumul de la période', `${nombre(R.valeur)} rejets / ${nombre(R.controles)} colis contrôlés (${pct(R.taux, 1)})`],
        ], cfg, `vigilance à ${s.rejetTaux.vigilance} %, critique à ${s.rejetTaux.critique} %`));
    }
  }

  // 4. Attente au poste de rejet
  if (R.attente !== null) {
    const niv = niveau(R.attente, s.rejetAttente);
    if (niv) {
      out.push(alerte('rejetAttente', niv,
        `${nombre(R.attente)} colis en attente au poste de rejet (seuil ${s.rejetAttente.vigilance}).`,
        [['Colis en attente au rejet', `${nombre(R.attente)} colis`], ['Rejets de la période', `${nombre(R.valeur)} colis`]],
        cfg, `vigilance à ${s.rejetAttente.vigilance} colis, critique à ${s.rejetAttente.critique}`));
    }
  }

  // 5. PPM décelée
  const Q = m.qualite;
  const minL = s.ppmDecelee.minLignes ?? 1000;
  if (Q.ppm !== null && (Q.lignes || 0) >= minL) {
    const niv = niveau(Q.ppm, s.ppmDecelee);
    if (niv) {
      out.push(alerte('ppmDecelee', niv,
        `PPM décelée à ${nombre(Q.ppm)} — au-dessus du seuil vert de ${nombre(s.ppmDecelee.vigilance)}.`,
        [
          ['Erreurs décelées au rejet', `${nombre(Q.erreurs)}`],
          ['Lignes préparées', `${nombre(Q.lignes)}`],
          ['PPM décelée', `${nombre(Q.ppm)} (= ${nombre(Q.erreurs)} ÷ ${nombre(Q.lignes)} × 1 000 000)`],
        ], cfg, `vert sous ${nombre(s.ppmDecelee.vigilance)} (validé), critique à partir de ${nombre(s.ppmDecelee.critique)} ; évaluée dès ${nombre(minL)} lignes`));
    }
  }

  // 6. Effectif
  const E = m.effectif;
  if (E.absents !== null && !E.moyen) {
    const niv = niveau(E.absents, s.effectif);
    if (niv) {
      out.push(alerte('effectif', niv,
        `${nombre(E.absents)} absent${E.absents > 1 ? 's' : ''} par rapport à l’effectif prévu.`,
        [['Effectif présent', `${nombre(E.present)} personnes`], ['Effectif prévu', `${nombre(E.prevu)} personnes`], ...(E.preparateurs !== null ? [['Dont préparateurs présents', `${nombre(E.preparateurs)}`]] : [])],
        cfg, `vigilance dès ${s.effectif.vigilance} absent, critique dès ${s.effectif.critique}`));
    }
  }

  // 7. Débit convoyeur
  const P = m.production;
  if (m.estJour && m.enCours && P.debit !== null && P.debitMoyen > 0) {
    const ratio = (P.debit / P.debitMoyen) * 100;
    if (ratio < s.debit.vigilance) {
      out.push(alerte('debit', 'vigilance',
        `Débit convoyeur de la dernière heure à ${nombre(ratio)} % du débit moyen du poste.`,
        [['Débit dernière heure complète', `${nombre(P.debit)} colis/h`], ['Débit horaire moyen du poste', `${nombre(P.debitMoyen)} colis/h`]],
        cfg, `vigilance sous ${s.debit.vigilance} % du débit moyen`));
    }
  }

  return out.sort((a, b) => ORDRE[b.niveau] - ORDRE[a.niveau]);
}

/** État de chaque zone : critique > vigilance > conforme ; indisponible si sa donnée de base manque. */
export function etatsZones(m, alertes) {
  const base = {
    preparation: m?.lignes?.valeur,
    convoyeur: m?.production?.controles ?? m?.production?.valeur,
    controle: m?.rejets?.controles,
    rejet: m?.rejets?.attente ?? m?.rejets?.valeur,
    expedition: m?.production?.valeur,
  };
  const out = {};
  for (const z of ZONES) {
    const a = alertes.filter((x) => x.zone === z.id);
    const pire = a.reduce((p, x) => (ORDRE[x.niveau] > ORDRE[p] ? x.niveau : p), 'conforme');
    out[z.id] = {
      etat: !m?.disponible || base[z.id] === null || base[z.id] === undefined ? 'indisponible' : (pire === 'conforme' ? 'conforme' : pire),
      alertes: a,
    };
  }
  return out;
}

/** Chiffre-clé affiché sur l'étiquette de chaque zone. */
export function resumeZones(m) {
  if (!m?.disponible) return {};
  return {
    preparation: m.lignes.cadence !== null ? [nombre(m.lignes.cadence), 'lignes/h'] : [nombre(m.lignes.valeur), 'lignes'],
    convoyeur: m.production.debit !== null ? [nombre(m.production.debit), 'colis/h'] : [nombre(m.production.controles), 'colis'],
    controle: [pct(m.rejets.recent?.taux ?? m.rejets.taux, 1), 'rejet'],
    rejet: [nombre(m.rejets.attente), 'en attente'],
    expedition: [nombre(m.production.valeur), 'colis'],
  };
}

/** Priorités : alertes (critique → vigilance) complétées par les priorités fixées par le superviseur. */
export function priorites(alertes, manuelles, mode = 'moment') {
  const man = (manuelles || []).map((t) => (t || '').trim()).filter(Boolean)
    .map((t, i) => ({ id: `manuelle-${i}`, origine: 'superviseur', texte: t, niveau: 'info' }));
  const auto = alertes.map((a) => ({
    id: a.id, origine: 'regle', niveau: a.niveau, zone: a.zone, alerte: a,
    texte: a.action ? a.action : a.message, constat: a.message,
  }));
  const liste = mode === 'jour' ? [...man, ...auto] : [...auto, ...man];
  return liste.slice(0, 3);
}

/** Nouvelles alertes (ou aggravées) entre deux évaluations. */
export function nouvelles(avant, apres) {
  if (!avant) return [];
  const idx = new Map(avant.map((a) => [a.id, a]));
  return apres.filter((a) => !idx.has(a.id) || ORDRE[a.niveau] > ORDRE[idx.get(a.id).niveau]);
}

