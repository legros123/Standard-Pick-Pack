/* ════════════════════════════════════════════════════════════════════
   CONNECTEUR — couche d'import indépendante de l'affichage.
   Sources :
     demo     données fictives (demo.js), bandeau permanent
     script   fichier JS déposé à côté de l'application (fonctionne même
              en ouvrant index.html directement depuis un dossier partagé) :
              window.PICK_MC_DATA = { …format normalisé… }
     json     adresse http(s) d'un JSON au format normalisé
     csv      adresse http(s) d'un CSV journalier + correspondance colonnes
     fichier  import manuel (glisser-déposer / sélection) JSON, JS ou CSV
   Toutes renvoient un instantané normalisé (schema.js) ou null.
   ════════════════════════════════════════════════════════════════════ */
import { instantaneDemo } from './demo.js';
import { normaliser, choisirInstantane } from './schema.js';
import { csvVersInstantane, lireCsv } from './csv.js';

const DELAI = 15000;

function avecDelai(promesse, ms, message) {
  return Promise.race([promesse, new Promise((_, rej) => setTimeout(() => rej(new Error(message)), ms))]);
}

function chargerScript(chemin, variable) {
  return new Promise((resolve, reject) => {
    if (!/^[A-Za-z_$][\w$]*$/.test(variable)) { reject(new Error(`Nom de variable invalide : ${variable}`)); return; }
    const ancien = document.querySelector('script[data-pick-source]');
    if (ancien) ancien.remove();
    try { window[variable] = undefined; } catch { /* rien */ }
    const s = document.createElement('script');
    s.dataset.pickSource = '1';
    s.src = `${chemin}${chemin.includes('?') ? '&' : '?'}t=${Date.now()}`;
    s.onload = () => {
      const v = window[variable];
      if (v === undefined) reject(new Error(`Le fichier ${chemin} a été lu mais ne définit pas window.${variable}.`));
      else resolve(v);
    };
    s.onerror = () => reject(new Error(`Fichier introuvable ou illisible : ${chemin}`));
    document.head.appendChild(s);
  });
}

/** Extrait un objet JSON d'un fichier .js du type « window.X = {…}; » ou « const X = {…}; ». */
export function objetDepuisJs(texte) {
  const a = texte.indexOf('{');
  const b = texte.lastIndexOf('}');
  const a2 = texte.indexOf('[');
  const debut = a2 !== -1 && (a === -1 || a2 < a) ? a2 : a;
  const fin = debut === a2 ? texte.lastIndexOf(']') : b;
  if (debut === -1 || fin <= debut) throw new Error('Aucun objet de données trouvé dans le fichier JS.');
  try {
    return JSON.parse(texte.slice(debut, fin + 1));
  } catch {
    throw new Error('Le contenu du fichier JS n’est pas du JSON strict : exporter les données au format JSON, ou utiliser le modèle donnees/pick_data.exemple.js.');
  }
}

/** Décrit la structure d'un fichier pour aider à établir la correspondance (panneau Réglages › Données). */
export function inspecter(nom, texte) {
  const ext = (nom.split('.').pop() || '').toLowerCase();
  const out = { nom, type: ext, taille: texte.length, cles: [], entetes: [], exemples: [], avertissement: null };
  try {
    if (ext === 'csv' || ext === 'txt') {
      const c = lireCsv(texte);
      out.separateur = c.separateur;
      out.entetes = c.entetes;
      out.exemples = c.lignes.slice(0, 3);
      out.nbLignes = c.lignes.length;
      return out;
    }
    const obj = ext === 'js' ? objetDepuisJs(texte) : JSON.parse(texte);
    const decrire = (o, prefixe = '', profondeur = 0) => {
      if (profondeur > 3 || o === null || typeof o !== 'object') return;
      const cibles = Array.isArray(o) ? (o.length ? [['[0]', o[0]]] : []) : Object.entries(o).slice(0, 40);
      for (const [k, v] of cibles) {
        const chemin = prefixe ? `${prefixe}.${k}` : k;
        const type = Array.isArray(v) ? `liste (${v.length})` : v === null ? 'null' : typeof v;
        out.cles.push({ chemin, type, exemple: typeof v === 'object' ? '' : String(v).slice(0, 40) });
        decrire(v, chemin, profondeur + 1);
      }
    };
    decrire(obj);
    out.normalise = !!(obj && (obj.valeurs || obj.instantanes || (Array.isArray(obj) && obj[0]?.valeurs)));
    if (!out.normalise) out.avertissement = 'Structure différente du format normalisé : un adaptateur est nécessaire (voir donnees/LISEZMOI.md › Adaptateurs).';
  } catch (e) {
    out.avertissement = e.message;
  }
  return out;
}

export class Connecteur {
  constructor() {
    this.importe = null; // { nom, texte }
    this.debutSession = Date.now();
    this.heureForcee = null;
  }

  libelle(cfg) {
    const d = cfg.donnees;
    return {
      demo: 'Démonstration (données fictives)',
      script: `Fichier ${d.fichier}`,
      json: d.url ? `JSON ${d.url}` : 'JSON (adresse non renseignée)',
      csv: d.url ? `CSV ${d.url}` : 'CSV (adresse non renseignée)',
      fichier: this.importe ? `Import manuel : ${this.importe.nom}` : 'Import manuel (aucun fichier)',
    }[d.source] || d.source;
  }

  actualisable(cfg) {
    return cfg.donnees.source !== 'fichier';
  }

  /** @returns {Promise<object|null>} instantané normalisé, ou null si aucune donnée */
  async charger(filtres, cfg) {
    const d = cfg.donnees;
    let brut;
    switch (d.source) {
      case 'demo':
        brut = instantaneDemo({ filtres, cfg, maintenant: new Date(), debutSession: this.debutSession, heureForcee: this.heureForcee });
        break;
      case 'script': {
        const contenu = await avecDelai(chargerScript(d.fichier, d.variable || 'PICK_MC_DATA'), DELAI, `Délai dépassé en lisant ${d.fichier}`);
        brut = choisirInstantane(contenu, filtres);
        break;
      }
      case 'json': {
        if (!d.url) throw new Error('Adresse JSON non renseignée (Réglages › Données).');
        const r = await avecDelai(fetch(d.url, { cache: 'no-store' }), DELAI, 'Délai dépassé : la source JSON ne répond pas.');
        if (!r.ok) throw new Error(`Source JSON : réponse ${r.status}`);
        brut = choisirInstantane(await r.json(), filtres);
        break;
      }
      case 'csv': {
        if (!d.url) throw new Error('Adresse CSV non renseignée (Réglages › Données).');
        const r = await avecDelai(fetch(d.url, { cache: 'no-store' }), DELAI, 'Délai dépassé : la source CSV ne répond pas.');
        if (!r.ok) throw new Error(`Source CSV : réponse ${r.status}`);
        const { snap } = csvVersInstantane(await r.text(), d.csv, filtres, d.url);
        snap.meta.genereLe = r.headers.get('last-modified') ? new Date(r.headers.get('last-modified')).toISOString() : null;
        brut = snap;
        break;
      }
      case 'fichier': {
        if (!this.importe) return null;
        const { nom, texte, date } = this.importe;
        const ext = nom.split('.').pop().toLowerCase();
        if (ext === 'csv' || ext === 'txt') {
          const { snap } = csvVersInstantane(texte, d.csv, filtres, nom);
          snap.meta.genereLe = date || null;
          brut = snap;
        } else {
          brut = choisirInstantane(ext === 'js' ? objetDepuisJs(texte) : JSON.parse(texte), filtres);
        }
        break;
      }
      default:
        throw new Error(`Source inconnue : ${d.source}`);
    }
    if (!brut) return null;
    const snap = normaliser(brut, filtres);
    if (d.source !== 'demo') snap.meta.demo = false;
    const nomSource = `${d.source === 'fichier' ? this.importe?.nom || '' : d.source === 'script' ? d.fichier : d.url}`;
    snap.meta.exemple = !!brut.meta?.exemple || /exemple/i.test(nomSource);
    return snap;
  }
}
