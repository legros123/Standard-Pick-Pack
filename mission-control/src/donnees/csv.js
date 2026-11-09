/* Lecture CSV tolérante (exports Excel français : « ; », virgule décimale,
   guillemets) et conversion d'un CSV journalier en instantané normalisé. */
import { enHHMM } from './temps.js';

export function detecterSeparateur(texte) {
  const l = texte.split(/\r?\n/).find((x) => x.trim()) || '';
  const n = (c) => l.split(c).length;
  return [';', ',', '\t', '|'].sort((a, b) => n(b) - n(a))[0];
}

export function lireCsv(texte, separateur = 'auto') {
  const sep = separateur === 'auto' ? detecterSeparateur(texte) : separateur;
  const lignes = [];
  let champ = '';
  let ligne = [];
  let guill = false;
  const t = texte.replace(/^﻿/, '');
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (guill) {
      if (c === '"' && t[i + 1] === '"') { champ += '"'; i++; } else if (c === '"') guill = false; else champ += c;
    } else if (c === '"') guill = true;
    else if (c === sep) { ligne.push(champ); champ = ''; } else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++;
      ligne.push(champ); champ = '';
      if (ligne.some((x) => x.trim() !== '')) lignes.push(ligne);
      ligne = [];
    } else champ += c;
  }
  if (champ !== '' || ligne.length) { ligne.push(champ); if (ligne.some((x) => x.trim() !== '')) lignes.push(ligne); }
  const entetes = (lignes.shift() || []).map((h) => h.trim());
  return { separateur: sep, entetes, lignes: lignes.map((l) => Object.fromEntries(entetes.map((h, i) => [h, (l[i] ?? '').trim()]))) };
}

const num = (v) => {
  if (v === undefined || v === null || String(v).trim() === '') return null;
  const x = Number(String(v).replace(/\s| | /g, '').replace(',', '.'));
  return Number.isFinite(x) ? x : null;
};

/** Repère la date et l'heure d'une cellule « 10:00 », « 09/11/2026 10:00 », « 2026-11-09T10:00 »… */
function lireHorodatage(v) {
  const s = String(v || '').trim();
  let date = null;
  let m = /(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) date = `${m[1]}-${m[2]}-${m[3]}`;
  m = !date && /(\d{2})\/(\d{2})\/(\d{4})/.exec(s);
  if (m) date = `${m[3]}-${m[2]}-${m[1]}`;
  const h = /(\d{1,2})[:h](\d{2})/.exec(s);
  return { date, minutes: h ? Number(h[1]) * 60 + Number(h[2]) : null };
}

/**
 * CSV journalier → instantané. Chaque ligne = un créneau (heure, quart d'heure…).
 * Flux (lignes, colis, rejets, erreurs) additionnés ; stocks (charge, attente,
 * effectifs) : dernière valeur renseignée.
 */
export function csvVersInstantane(texte, mapping, filtres, origine) {
  const { entetes, lignes, separateur } = lireCsv(texte, mapping.separateur || 'auto');
  const col = mapping.colonnes || {};
  const manquantes = Object.entries(col).filter(([, c]) => c && !entetes.includes(c)).map(([k, c]) => `${k} → « ${c} »`);
  if (!entetes.includes(col.horodatage)) {
    throw new Error(`Colonne d'horodatage « ${col.horodatage} » introuvable. Colonnes lues : ${entetes.join(', ')}.`);
  }
  const buckets = new Map();
  const stocks = {};
  let derniere = null;
  let dateLue = null;
  for (const l of lignes) {
    const { date, minutes } = lireHorodatage(l[col.horodatage]);
    if (minutes === null) continue;
    if (date && filtres?.date && date !== filtres.date) continue;
    dateLue = dateLue || date;
    const cle = Math.floor(minutes / 60) * 60;
    const b = buckets.get(cle) || { lignes: null, colis: null, rejets: null, erreurs: null, produits: null };
    for (const k of ['lignes', 'colis', 'rejets', 'erreurs', 'produits']) {
      const x = col[k] ? num(l[col[k]]) : null;
      if (x !== null) b[k] = (b[k] || 0) + x;
    }
    buckets.set(cle, b);
    for (const k of ['charge', 'attente', 'effectif', 'effectifPrevu', 'preparateurs']) {
      const x = col[k] ? num(l[col[k]]) : null;
      if (x !== null) stocks[k] = x;
    }
    derniere = Math.max(derniere ?? 0, minutes);
  }
  if (!buckets.size) throw new Error('Aucune ligne exploitable pour la date sélectionnée.');
  const cles = [...buckets.keys()].sort((a, b) => a - b);
  const serie = cles.map((k) => ({ t: enHHMM(k), ...buckets.get(k), partiel: false }));
  // le dernier créneau horaire est partiel si la dernière ligne lue n'est pas en fin d'heure
  if (derniere !== null && serie.length && derniere % 60 !== 0 && derniere - cles[cles.length - 1] < 59) serie[serie.length - 1].partiel = true;
  const somme = (k) => (serie.some((p) => p[k] !== null) ? serie.reduce((a, p) => a + (p[k] || 0), 0) : null);
  const colis = somme('colis');
  const produits = somme('produits');
  serie.forEach((p) => { delete p.produits; });
  return {
    snap: {
      version: 1,
      meta: {
        source: origine, genereLe: null, date: dateLue || filtres?.date, periode: 'jour', equipe: filtres?.equipe || 'toutes',
        heure: derniere !== null ? enHHMM(derniere) : null,
      },
      valeurs: {
        lignesPreparees: somme('lignes'),
        colisControles: colis,
        rejetsConvoyeur: somme('rejets'),
        erreursDecelees: somme('erreurs'),
        colisEnAttenteRejet: stocks.attente ?? null,
        colisProduits: produits,
        chargeRestante: stocks.charge ?? null,
        effectifPresent: stocks.effectif ?? null,
        effectifPrevu: stocks.effectifPrevu ?? null,
        preparateursPresents: stocks.preparateurs ?? null,
      },
      serie,
    },
    info: { separateur, entetes, nbLignes: lignes.length, manquantes },
  };
}
