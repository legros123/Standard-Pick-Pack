/* Réglages : défauts + valeurs mémorisées sur l'appareil + paramètres d'URL.
   Le stockage local ne sert qu'aux préférences de cet écran ; il peut être
   vide (navigation privée, données effacées) sans conséquence. */
import { DEFAUTS } from './defauts.js';

const CLE = 'pick-mc/reglages/v1';

const estObjet = (v) => v && typeof v === 'object' && !Array.isArray(v);

export function fusion(base, ajout) {
  if (!estObjet(ajout)) return structuredCloneSafe(base);
  const out = structuredCloneSafe(base);
  for (const k of Object.keys(ajout)) {
    if (estObjet(base?.[k]) && estObjet(ajout[k])) out[k] = fusion(base[k], ajout[k]);
    else if (ajout[k] !== undefined) out[k] = structuredCloneSafe(ajout[k]);
  }
  return out;
}

function structuredCloneSafe(v) {
  return v === undefined ? undefined : JSON.parse(JSON.stringify(v));
}

export function lireStockage() {
  try {
    const t = window.localStorage.getItem(CLE);
    return t ? JSON.parse(t) : null;
  } catch {
    return null;
  }
}

export function ecrireStockage(reglages) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(reglages));
    return true;
  } catch {
    return false;
  }
}

export function effacerStockage() {
  try { window.localStorage.removeItem(CLE); } catch { /* rien */ }
}

/** Paramètres d'URL reconnus (non mémorisés) — pratiques pour un favori par mode sur le Flip. */
export function lireParametresUrl() {
  const p = new URLSearchParams(window.location.search);
  const o = {};
  const set = (chemin, v) => {
    const parts = chemin.split('.');
    let cur = o;
    parts.slice(0, -1).forEach((k) => { cur = cur[k] ??= {}; });
    cur[parts[parts.length - 1]] = v;
  };
  const choix = (nom, chemin, valeurs) => {
    const v = p.get(nom);
    if (v && valeurs.includes(v)) set(chemin, v);
  };
  choix('mode', 'affichage.mode', ['exploitation', 'immersion', 'briefing']);
  choix('qualite', 'affichage.qualite', ['auto', 'haute', 'moyenne', 'basse']);
  choix('rendu', 'affichage.rendu', ['3d', '2d']);
  choix('anim', 'affichage.animations', ['auto', 'actives', 'reduites', 'suspendues']);
  choix('source', 'donnees.source', ['demo', 'script', 'json', 'csv']);
  choix('scenario', 'demo.scenario', ['normal', 'objectif', 'incident', 'ancienne', 'interrompue', 'vide']);
  choix('horloge', 'demo.horloge', ['auto', 'reelle']);
  if (p.get('perf') === '1') set('affichage.perf', true);
  const fichier = p.get('fichier');
  if (fichier && /^[\w./-]+\.js$/.test(fichier) && !fichier.includes('..')) set('donnees.fichier', fichier);
  const adr = p.get('url');
  if (adr && /^(https?:\/\/|[\w./-]+$)/.test(adr)) set('donnees.url', adr);
  const act = Number(p.get('actualisation'));
  if (act >= 10) set('donnees.actualisation', act);
  const filtres = {};
  if (/^\d{4}-\d{2}-\d{2}$/.test(p.get('date') || '')) filtres.date = p.get('date');
  if (['jour', 'semaine', 'mois'].includes(p.get('periode'))) filtres.periode = p.get('periode');
  if (p.get('equipe')) filtres.equipe = p.get('equipe');
  const horloge = p.get('heure');
  return { reglages: o, filtres, heureForcee: /^\d{2}:\d{2}$/.test(horloge || '') ? horloge : null, webgl: p.get('webgl') !== '0' };
}

export function chargerReglages() {
  const url = lireParametresUrl();
  const memo = lireStockage();
  const base = fusion(DEFAUTS, memo || {});
  return { reglages: fusion(base, url.reglages), memorises: memo, url };
}
