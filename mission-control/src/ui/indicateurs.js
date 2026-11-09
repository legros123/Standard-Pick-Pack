/* ════════════════════════════════════════════════════════════════════
   INDICATEURS MAJEURS — définition, carte, détail.
   Valeur brute d'abord, unité explicite, pourcentage en second.
   ════════════════════════════════════════════════════════════════════ */
import { ICONES, puceEtat } from './icones.js';
import { el, majTexte, majHtml } from './dom.js';
import { Compteur } from './compteur.js';
import { Tendance, histogramme } from './graphiques.js';
import { nombre, pct, signe, duree, echapper } from '../commun/format.js';
import { enHHMM } from '../donnees/temps.js';
import { REGLES } from '../config/defauts.js';

const ORDRE = { critique: 2, vigilance: 1 };

function etatKpi(id, valeur, alertes, m, cfg) {
  if (valeur === null || valeur === undefined) return 'indisponible';
  if (id === 'qualite' && cfg && (m?.qualite?.lignes || 0) < (cfg.seuils.ppmDecelee.minLignes ?? 1000)) return 'attente';
  const a = alertes.filter((x) => x.kpi === id);
  return a.reduce((p, x) => (ORDRE[x.niveau] > (ORDRE[p] || 0) ? x.niveau : p), 'conforme');
}

const hTxt = (m) => (m.heure !== null && m.heure !== undefined ? enHHMM(m.heure) : '');
const serieDe = (m, cle) => (m.serieBrute || []).map((p) => p[cle]).filter((v) => v !== null && v !== undefined);

export const KPIS = [
  {
    id: 'lignes', col: 'g', majeur: true, code: 'KPI·01', titre: 'Lignes préparées', icone: 'lignes', unite: 'lignes', zone: 'preparation',
    valeur: (m) => m.lignes.valeur,
    pied: (m) => {
      const L = m.lignes;
      const l = [[L.objectifMethode === 'quota' ? 'Objectif (quota)' : 'Objectif', L.objectif !== null ? `${nombre(L.objectif)} · ${pct(L.pctObjectif)}` : 'indisponible']];
      if (L.attendu !== null) l.push([m.estJour ? `Attendu à ${hTxt(m)}` : 'Attendu à date', `${nombre(L.attendu)} (${signe(L.ecart)})`]);
      return l;
    },
    tendance: (m) => serieDe(m, 'lignes'),
  },
  {
    id: 'charge', col: 'g', code: 'KPI·03', titre: 'Charge restante', icone: 'charge', unite: 'lignes', zone: 'preparation',
    valeur: (m) => m.charge.valeur,
    pied: (m) => {
      const C = m.charge;
      const l = [];
      if (C.finEstimee) l.push(['Fin de préparation', C.finEstimee.auDela ? 'après fin de poste<span class="est">ESTIM.</span>' : `≈ ${C.finEstimee.heure}<span class="est">ESTIM.</span>`]);
      if (C.ratio !== null) l.push(['Charge / capacité', `${nombre(C.ratio)} %<span class="est">ESTIM.</span>`]);
      if (!l.length) l.push(['Carnet du service', 'toutes équipes']);
      return l;
    },
    tendance: (m) => serieDe(m, 'charge'),
  },
  {
    id: 'effectif', col: 'g', code: 'KPI·06', titre: 'Effectif présent', icone: 'effectif', unite: 'personnes', zone: 'preparation',
    valeur: (m) => m.effectif.present,
    sur: (m) => (m.effectif.prevu !== null ? ` / ${nombre(m.effectif.prevu, m.effectif.moyen ? 1 : 0)}` : ''),
    decimales: (m) => (m.effectif.moyen ? 1 : 0),
    pied: (m) => {
      const E = m.effectif;
      const l = [];
      if (E.preparateurs !== null) l.push(['Dont préparateurs', nombre(E.preparateurs, E.moyen ? 1 : 0)]);
      l.push([E.moyen ? 'Moyenne par jour' : 'Absents vs prévu', E.moyen ? 'sur la période' : nombre(E.absents)]);
      return l;
    },
  },
  {
    id: 'production', col: 'd', majeur: true, code: 'KPI·02', titre: 'Production P&P', icone: 'colis', unite: 'colis', zone: 'expedition',
    valeur: (m) => m.production.valeur,
    pied: (m) => {
      const P = m.production;
      const l = [];
      if (P.debit !== null) l.push(['Débit dernière heure', `${nombre(P.debit)} colis/h`]);
      if (P.debitMoyen !== null) l.push(['Débit moyen du poste', `${nombre(P.debitMoyen)} colis/h`]);
      if (P.objectif !== null) l.unshift(['Objectif', `${nombre(P.objectif)} · ${pct(P.valeur / P.objectif)}`]);
      if (!l.length) l.push(['Colis contrôlés', nombre(P.controles)]);
      return l;
    },
    tendance: (m) => serieDe(m, 'colis'),
  },
  {
    id: 'rejets', col: 'd', code: 'KPI·04', titre: 'Rejets convoyeur', icone: 'rejet', unite: 'colis', zone: 'controle',
    valeur: (m) => m.rejets.valeur,
    pied: (m) => {
      const R = m.rejets;
      const l = [['Taux de rejet', `${pct(R.taux, 1)} des colis contrôlés`]];
      if (R.recent) l.push([`Depuis ${R.recent.depuis}`, pct(R.recent.taux, 1)]);
      if (R.attente !== null) l.push(['En attente au rejet', `${nombre(R.attente)} colis`]);
      return l;
    },
    tendance: (m) => (m.serieBrute || []).filter((p) => p.colis).map((p) => (p.rejets / p.colis) * 100),
  },
  {
    id: 'qualite', col: 'd', code: 'KPI·05', titre: 'Qualité décelée', icone: 'qualite', unite: 'ppm', zone: 'controle',
    valeur: (m) => m.qualite.ppm,
    pied: (m) => {
      const Q = m.qualite;
      const l = [['Erreurs décelées', `${nombre(Q.erreurs)} / ${nombre(Q.lignes)} lignes`]];
      l.push(['PPM avérée', Q.ppmAveree !== null ? `${nombre(Q.ppmAveree)} (${nombre(Q.averees)} litiges)` : 'indisponible']);
      return l;
    },
    tendance: (m) => serieDe(m, 'erreurs'),
  },
];

export class CarteIndicateur {
  constructor(def, i) {
    this.def = def;
    this.noeud = el(`<button class="module kpi pressable${def.majeur ? ' majeur' : ''}" data-kpi="${def.id}" data-etat="indisponible" style="--i:${i}" type="button" aria-label="${def.titre} : ouvrir le détail">
      <div class="module-tete"><span class="module-icone">${ICONES[def.icone]}</span><span class="module-titre">${def.titre}</span><span class="kpi-etat"></span></div>
      <div class="kpi-corps"><div class="kpi-valeur-ligne"><span class="kpi-valeur"><span class="n">—</span><span class="sur"></span></span><span class="kpi-unite">${def.unite}</span></div><svg class="spark" aria-hidden="true"></svg></div>
      <div class="kpi-indispo">Donnée indisponible dans la source</div>
      <div class="kpi-pied"></div>
      <span class="eclat"></span>
    </button>`);
    this.compteur = new Compteur(this.noeud.querySelector('.n'));
    this.tendance = new Tendance(this.noeud.querySelector('.spark'));
    this.etatNoeud = this.noeud.querySelector('.kpi-etat');
    this.pied = this.noeud.querySelector('.kpi-pied');
    this.sur = this.noeud.querySelector('.sur');
  }

  maj(m, alertes, { depuisZero = false, cfg = null } = {}) {
    const d = this.def;
    const v = m?.disponible ? d.valeur(m) : null;
    const etat = m?.disponible ? etatKpi(d.id, v, alertes, m, cfg) : 'indisponible';
    this.noeud.dataset.etat = etat;
    this.compteur.dec = d.decimales && m?.disponible ? d.decimales(m) : 0;
    this.compteur.regler(v, { depuisZero, duree: depuisZero ? 1100 : 700 });
    majTexte(this.sur, v !== null && d.sur ? d.sur(m) : '');
    majHtml(this.etatNoeud, etat === 'attente' ? puceEtat('indisponible', 'NON ÉVALUÉ').replace('data-etat="indisponible"', 'data-etat="attente"') : puceEtat(etat));
    const pied = m?.disponible ? d.pied(m) : [['Source', 'aucune donnée reçue']];
    majHtml(this.pied, pied.map(([a, b]) => `<div class="l"><span>${a}</span><b>${b}</b></div>`).join(''));
    const couleur = { critique: '#ff4d5f', vigilance: '#ffb43a', conforme: '#3cd6ff', attente: '#8ea5c2' }[etat] || '#7d8da3';
    this.tendance.couleur = couleur;
    this.tendance.regler(m?.disponible && d.tendance ? d.tendance(m) : null);
    this.noeud.setAttribute('aria-label', `${d.titre} : ${v === null ? 'indisponible' : `${nombre(v)} ${d.unite}`}, état ${etat}. Ouvrir le détail.`);
  }

  celebrer() {
    this.noeud.classList.remove('celebre');
    void this.noeud.offsetWidth;
    this.noeud.classList.add('celebre');
    setTimeout(() => this.noeud.classList.remove('celebre'), 3600);
  }
}

/* ─────────────── détail d'un indicateur (tiroir) ─────────────── */

function tableFaits(lignes) {
  return `<table class="faits"><tbody>${lignes.map(([a, b]) => `<tr><th>${a}</th><td>${b}</td></tr>`).join('')}</tbody></table>`;
}

function badgeRegle(id) {
  const r = REGLES[id];
  if (!r) return '';
  return r.validee
    ? '<span class="badge-regle ok">● RÈGLE VALIDÉE (source)</span>'
    : '<span class="badge-regle av">▲ SEUIL PAR DÉFAUT — À VALIDER</span>';
}

function libBucket(p, m) {
  if (m.estJour) return p.t.slice(0, 2) + 'h';
  const d = new Date(`${p.t}T12:00:00`);
  return `${['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'][d.getDay()]} ${d.getDate()}`;
}

export function detailIndicateur(id, m, alertes, cfg, snap, statut) {
  const def = KPIS.find((k) => k.id === id);
  const v = m?.disponible ? def.valeur(m) : null;
  const etat = m?.disponible ? etatKpi(id, v, alertes, m, cfg) : 'indisponible';
  const s = cfg.seuils;
  const serie = m?.serieBrute || [];
  let lecture = '';
  let regles = '';
  let faits = [];
  let histo = null;
  const H = hTxt(m || {});

  if (!m?.disponible) {
    lecture = '<p>Aucune donnée n’a été reçue pour cette date, cette période et cette équipe. La valeur est affichée comme indisponible, jamais comme zéro.</p>';
  } else if (id === 'lignes') {
    const L = m.lignes;
    const f = m.fenetre;
    lecture = `<p>${m.estJour ? `À ${H}` : 'À date'}, <b>${nombre(L.valeur)} lignes</b> préparées${L.attendu !== null ? ` pour <b>${nombre(L.attendu)}</b> attendues au rythme de l’objectif` : ''}${L.objectif !== null ? ` (${nombre(L.objectif)} lignes${m.estJour && f ? ` sur ${enHHMM(f.debut)}–${enHHMM(f.fin)}` : ''})` : ''}.</p>`;
    if (L.ecart !== null) lecture += `<p>${L.ecart >= 0 ? 'Avance' : 'Retard'} de <b>${nombre(Math.abs(L.ecart))} lignes</b> (${signe(L.ecartPct, 1)} %) sur le rythme attendu.</p>`;
    if (L.cadence !== null) lecture += `<p>Cadence de la dernière heure complète (${L.derniere?.t}) : <b>${nombre(L.cadence)} lignes/h</b>${L.rythmeRequis !== null ? ` ; rythme requis pour atteindre l’objectif : <b>${nombre(L.rythmeRequis)} lignes/h</b> sur ${duree(L.heuresRestantes)} productives restantes` : ''}.</p>`;
    if (L.objectif !== null && L.valeur >= L.objectif) lecture += '<p><b>Objectif atteint.</b></p>';
    regles = `<p>${echapper(L.objectifTexte)}</p><p class="note">Lignes attendues = ${L.attenduMethode || 'indisponible'}.</p><p class="note">Vigilance au-delà de ${s.rythme.vigilance} % de retard, critique au-delà de ${s.rythme.critique} %.</p>${badgeRegle('rythme')}`;
    faits = [['Lignes préparées', nombre(L.valeur)], ['Objectif', nombre(L.objectif)], ['Préparateurs présents', nombre(m.effectif.preparateurs, m.effectif.moyen ? 1 : 0)]];
    histo = { cle: 'lignes', unite: 'lignes', objectif: true };
  } else if (id === 'production') {
    const P = m.production;
    lecture = `<p><b>${nombre(P.valeur)} colis</b> produits par le Pick & Pack et dirigés vers l’expédition${m.rejets.attente !== null ? ` (colis contrôlés ${nombre(P.controles)}, dont ${nombre(m.rejets.attente)} encore en attente au rejet)` : ''}.</p>`;
    if (P.debit !== null) lecture += `<p>Débit de la dernière heure complète : <b>${nombre(P.debit)} colis/h</b>${P.debitMoyen !== null ? ` — moyenne du poste : ${nombre(P.debitMoyen)} colis/h` : ''}.</p>`;
    if (P.objectif === null) lecture += '<p class="note">Aucun objectif de colis n’est défini (Réglages › Seuils & objectifs).</p>';
    regles = `<p class="note">Définition : ${snap?.meta?.demo ? 'en démonstration, colis contrôlés − colis en attente au rejet.' : 'valeur « colisProduits » transmise par la source.'} À confirmer avec l’export LOGYS (contenants expédiés).</p><p class="note">Règle débit : ${REGLES.debit.formule} Vigilance sous ${s.debit.vigilance} %.</p>${badgeRegle('debit')}`;
    faits = [['Colis produits', nombre(P.valeur)], ['Colis contrôlés', nombre(P.controles)], ['Débit dernière heure', P.debit !== null ? `${nombre(P.debit)} colis/h` : 'indisponible']];
    histo = { cle: 'colis', unite: 'colis', objectif: false };
  } else if (id === 'charge') {
    const C = m.charge;
    lecture = `<p><b>${nombre(C.valeur)} lignes</b> restent à préparer : carnet du service, toutes équipes confondues, au moment de l’extraction.</p>`;
    if (C.capacite !== null) lecture += `<p>Capacité restante <b>estimée</b> : ${nombre(C.capacite)} lignes, soit une charge à <b>${nombre(C.ratio)} %</b> de la capacité.</p><p class="note">Méthode : ${C.capaciteMethode}</p>`;
    if (C.finEstimee) lecture += `<p>Fin de préparation <b>estimée</b> : ${C.finEstimee.auDela ? 'après la fin de poste' : C.finEstimee.heure}.</p><p class="note">Méthode : ${C.finEstimee.methode} Ce n’est pas une prévision : la cadence et les arrivées de commandes peuvent changer.</p>`;
    if (!m.estJour) lecture += '<p class="note">La comparaison charge / capacité n’est calculée que sur la vue Jour.</p>';
    regles = `<p class="note">${REGLES.capacite.formule}</p><p class="note">Vigilance à ${s.capacite.vigilance} %, critique à ${s.capacite.critique} %.</p>${badgeRegle('capacite')}`;
    faits = [['Charge restante', `${nombre(C.valeur)} lignes`], ['Capacité estimée', C.capacite !== null ? `${nombre(C.capacite)} lignes` : 'indisponible']];
    histo = { cle: 'charge', unite: 'lignes', objectif: false, libelle: 'Charge en fin de tranche' };
  } else if (id === 'rejets') {
    const R = m.rejets;
    lecture = `<p><b>${nombre(R.valeur)} colis</b> rejetés par le convoyeur sur ${nombre(R.controles)} colis contrôlés, soit <b>${pct(R.taux, 1)}</b>.</p>`;
    if (R.recent) lecture += `<p>Depuis ${R.recent.depuis} : ${nombre(R.recent.rejets)} rejets / ${nombre(R.recent.colis)} colis (${pct(R.recent.taux, 1)}).</p>`;
    if (R.attente !== null) lecture += `<p><b>${nombre(R.attente)} colis</b> en attente au poste de rejet.</p>`;
    regles = `<p class="note">${REGLES.rejetTaux.formule} Fenêtre : dernière tranche horaire complète et tranche en cours (vue Jour), période entière sinon. Vigilance à ${s.rejetTaux.vigilance} %, critique à ${s.rejetTaux.critique} %.</p>${badgeRegle('rejetTaux')}<p class="note" style="margin-top:.6rem">${REGLES.rejetAttente.formule} Vigilance à ${s.rejetAttente.vigilance} colis, critique à ${s.rejetAttente.critique}.</p>${badgeRegle('rejetAttente')}`;
    faits = [['Rejets', nombre(R.valeur)], ['Colis contrôlés', nombre(R.controles)], ['Taux', pct(R.taux, 2)], ['En attente', nombre(R.attente)]];
    histo = { cle: 'taux', unite: '%', objectif: false, seuil: s.rejetTaux.vigilance, seuilLib: `seuil ${s.rejetTaux.vigilance} %` };
  } else if (id === 'qualite') {
    const Q = m.qualite;
    lecture = `<p>PPM décelée = <b>${nombre(Q.erreurs)}</b> erreur${Q.erreurs > 1 ? 's' : ''} décelée${Q.erreurs > 1 ? 's' : ''} au rejet ÷ <b>${nombre(Q.lignes)}</b> lignes préparées × 1 000 000 = <b>${nombre(Q.ppm)}</b>.</p>`;
    if ((Q.lignes || 0) < (s.ppmDecelee.minLignes ?? 1000)) lecture += `<p class="note">Volume encore faible (< ${nombre(s.ppmDecelee.minLignes ?? 1000)} lignes) : la règle d’alerte n’est pas encore évaluée.</p>`;
    lecture += Q.ppmAveree !== null
      ? `<p>PPM avérée (litiges clients) : <b>${nombre(Q.ppmAveree)}</b> (${nombre(Q.averees)} litiges).</p>`
      : '<p class="note">PPM avérée indisponible : les litiges clients sont connus a posteriori (vues Semaine / Mois).</p>';
    regles = `<p class="note">${REGLES.ppmDecelee.formule} Critique à partir de ${nombre(s.ppmDecelee.critique)} (par défaut).</p>${badgeRegle('ppmDecelee')}`;
    faits = [['Erreurs décelées', nombre(Q.erreurs)], ['Lignes préparées', nombre(Q.lignes)], ['Litiges (avérées)', Q.averees !== null ? nombre(Q.averees) : 'indisponible']];
    histo = { cle: 'erreurs', unite: 'erreurs', objectif: false };
  } else if (id === 'effectif') {
    const E = m.effectif;
    lecture = `<p><b>${nombre(E.present, E.moyen ? 1 : 0)}</b> personne${E.present > 1 ? 's' : ''} présente${E.present > 1 ? 's' : ''} sur ${nombre(E.prevu, E.moyen ? 1 : 0)} prévue${E.prevu > 1 ? 's' : ''}${E.moyen ? ' (moyenne par jour sur la période)' : ' (équipes ayant pris leur poste)'}.</p>`;
    if (E.preparateurs !== null) lecture += `<p>Dont <b>${nombre(E.preparateurs, E.moyen ? 1 : 0)} préparateurs</b>, base du calcul de l’objectif (quota).</p>`;
    if (Array.isArray(E.equipes) && E.equipes.length) {
      lecture += tableFaits(E.equipes.map((e) => [`${echapper(e.nom || e.id)} ${e.debut ? `(${e.debut}–${e.fin})` : ''}${e.enPoste ? ' · en poste' : ''}`,
        e.effectifPresent !== null && e.effectifPresent !== undefined ? `${nombre(e.effectifPresent)} / ${nombre(e.effectifPrevu)} · ${nombre(e.preparateursPresents)} prép.` : `prévu ${nombre(e.effectifPrevu)} · pas encore en poste`]));
    }
    regles = `<p class="note">${REGLES.effectif.formule} Vigilance dès ${s.effectif.vigilance} absent, critique dès ${s.effectif.critique}.</p>${badgeRegle('effectif')}`;
    faits = [['Présents', nombre(E.present, 1)], ['Prévus', nombre(E.prevu, 1)], ['Préparateurs', nombre(E.preparateurs, 1)]];
  }

  const lies = alertes.filter((a) => a.kpi === id);
  const corps = `
    <div class="d-valeur"><span class="v">${v === null ? '—' : nombre(v, def.decimales ? def.decimales(m) : 0)}</span><span class="u">${def.unite}</span>${etat === 'attente' ? puceEtat('indisponible', 'NON ÉVALUÉ · VOLUME FAIBLE') : puceEtat(etat)}</div>
    <div class="d-section"><h3>Lecture de la situation</h3>${lecture}</div>
    ${histo ? `<div class="d-section"><h3>Historique ${m?.estJour ? 'par heure' : 'par jour'}${histo.libelle ? ` · ${histo.libelle}` : ''}</h3><div class="d-graph" data-histo></div></div>` : ''}
    ${lies.length ? `<div class="d-section"><h3>Alertes liées</h3><ul class="liste-alertes">${lies.map((a) => `<li><button class="pressable" data-alerte="${a.id}" data-etat="${a.niveau}">${ICONES[a.niveau]}<span><span class="t">${a.titre}</span><br><span class="s">${a.message}</span></span></button></li>`).join('')}</ul></div>` : ''}
    <div class="d-section"><h3>Objectif, seuils & règle de calcul</h3>${regles}</div>
    <div class="d-section"><h3>Données disponibles</h3>${tableFaits([...faits,
      ['Source', echapper(statut?.source || '—')],
      ['Données extraites le', snap?.meta?.genereLe ? new Date(snap.meta.genereLe).toLocaleString('fr-FR') : 'horodatage absent'],
      ['Situation à', m?.estJour ? H : 'fin de période / date du jour']])}</div>`;

  const apres = (racine) => {
    const c = racine.querySelector('[data-histo]');
    if (!c || !histo) return;
    const barres = serie.map((p) => ({
      lib: libBucket(p, m),
      y: histo.cle === 'taux' ? (p.colis ? (p.rejets / p.colis) * 100 : null) : p[histo.cle],
      objectif: histo.objectif ? p.objectif : null,
      partiel: p.partiel,
    }));
    const couleur = { critique: '#ff4d5f', vigilance: '#ffb43a' }[etat] || '#3cd6ff';
    requestAnimationFrame(() => histogramme(c, barres, {
      unite: histo.unite, objectif: histo.objectif, couleur,
      format: histo.cle === 'taux' ? (x) => `${nombre(x, 1)}` : (x) => nombre(x),
      seuil: histo.seuil ?? null, seuilLib: histo.seuilLib,
    }));
  };
  return { code: def.code, titre: def.titre, etat, corps, apres };
}
