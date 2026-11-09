/* ════════════════════════════════════════════════════════════════════
   GRAPHIQUES 2D (SVG) — lecture exacte des quantités.
   Les courbes glissent vers les nouvelles données (interpolation des
   points) au lieu d'être redessinées.
   ════════════════════════════════════════════════════════════════════ */
import { tween, ease } from './dom.js';
import { nombre } from '../commun/format.js';
import { enHHMM } from '../donnees/temps.js';

const NS = 'http://www.w3.org/2000/svg';
const lerp = (a, b, k) => a + (b - a) * k;

function interpoler(points, x) {
  if (!points.length) return 0;
  if (x <= points[0].x) return points[0].y;
  for (let i = 1; i < points.length; i++) {
    if (x <= points[i].x) {
      const a = points[i - 1];
      const b = points[i];
      return lerp(a.y, b.y, (x - a.x) / Math.max(1e-6, b.x - a.x));
    }
  }
  return points[points.length - 1].y;
}

function graduations(max, n = 4) {
  if (!(max > 0)) return [0];
  const brut = max / n;
  const p = Math.pow(10, Math.floor(Math.log10(brut)));
  const pas = [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= brut) || brut;
  const out = [];
  for (let v = 0; v <= max + 1e-9; v += pas) out.push(v);
  return out;
}

const court = (v) => (v >= 10000 ? `${nombre(v / 1000, v % 1000 ? 1 : 0)} k` : nombre(v));

/** Courbe de production : cumul réalisé vs objectif au rythme + barres par tranche. */
export class CourbeProduction {
  constructor(conteneur, { compacte = false } = {}) {
    this.c = conteneur;
    this.compacte = compacte;
    this.svg = document.createElementNS(NS, 'svg');
    this.svg.setAttribute('role', 'img');
    this.c.appendChild(this.svg);
    this.vide = document.createElement('div');
    this.vide.className = 'vide';
    this.vide.hidden = true;
    this.c.appendChild(this.vide);
    this.affiche = null;
    this.cible = null;
    this.stop = () => {};
    new ResizeObserver(() => this.dessiner(this.affiche)).observe(this.c);
  }

  /** @param d { type, domaine, reel, objectif, barres, heure, attendu, objectifFinal } */
  regler(d, { animer = true } = {}) {
    if (!d || (!d.reel.length && !d.objectif.length)) {
      this.affiche = null;
      this.svg.innerHTML = '';
      this.vide.hidden = false;
      this.vide.textContent = 'Courbe indisponible : aucune série de production dans les données.';
      return;
    }
    this.vide.hidden = true;
    const cible = { ...d, yMax: this.yMax(d) };
    const depart = this.affiche && this.affiche.type === d.type && this.affiche.domaine[0] === d.domaine[0] && this.affiche.domaine[1] === d.domaine[1] ? this.affiche : null;
    this.stop();
    if (!animer || !depart) {
      this.affiche = cible;
      this.dessiner(cible);
      return;
    }
    const finR0 = depart.reel.length ? depart.reel[depart.reel.length - 1].x : d.domaine[0];
    const finR1 = cible.reel.length ? cible.reel[cible.reel.length - 1].x : d.domaine[0];
    this.stop = tween(900, (k) => {
      const finR = lerp(finR0, finR1, k);
      const reel = [];
      for (const p of cible.reel) {
        if (p.x > finR) break;
        reel.push({ x: p.x, y: lerp(interpoler(depart.reel, p.x), p.y, k) });
      }
      if (cible.reel.length && (!reel.length || reel[reel.length - 1].x < finR)) {
        reel.push({ x: finR, y: lerp(interpoler(depart.reel, finR), interpoler(cible.reel, finR), k) });
      }
      const etat = {
        ...cible,
        reel,
        objectif: cible.objectif.map((p) => ({ x: p.x, y: lerp(interpoler(depart.objectif, p.x), p.y, k) })),
        barres: cible.barres.map((b, i) => ({ ...b, y: b.y === null ? null : lerp(depart.barres[i]?.y ?? 0, b.y, k) })),
        yMax: lerp(depart.yMax, cible.yMax, k),
        heure: depart.heure !== null && cible.heure !== null ? lerp(depart.heure, cible.heure, k) : cible.heure,
        attendu: depart.attendu !== null && cible.attendu !== null ? lerp(depart.attendu, cible.attendu, k) : cible.attendu,
      };
      this.dessiner(etat);
    }, () => { this.affiche = cible; this.dessiner(cible); }, ease.inOutCubic);
    this.affiche = cible;
  }

  yMax(d) {
    const m = Math.max(1, ...d.reel.map((p) => p.y), ...d.objectif.map((p) => p.y), d.objectifFinal || 0);
    return m * 1.08;
  }

  dessiner(d) {
    if (!d) return;
    const W = this.c.clientWidth;
    const H = this.c.clientHeight;
    if (W < 20 || H < 20) return;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const fs = 0.78 * rem;
    const g = { l: 3.7 * rem, r: 1.2 * rem, t: 0.5 * rem, b: 1.7 * rem };
    const pw = W - g.l - g.r;
    const ph = H - g.t - g.b;
    const hb = this.compacte ? 0 : ph * 0.24; // bande des barres
    const [x0, x1] = d.domaine;
    const X = (x) => g.l + ((x - x0) / Math.max(1e-6, x1 - x0)) * pw;
    const Y = (y) => g.t + ph - (y / d.yMax) * ph;
    const maxB = Math.max(1, ...d.barres.map((b) => Math.max(b.y || 0, b.objectif || 0)));
    const YB = (y) => g.t + ph - (y / maxB) * hb;
    const parts = [];
    parts.push(`<defs>
      <linearGradient id="cp-aire" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3cd6ff" stop-opacity=".38"/><stop offset="1" stop-color="#3cd6ff" stop-opacity="0"/></linearGradient>
      <pattern id="cp-hach" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="6" fill="#3cd6ff" fill-opacity=".35"/></pattern>
      <filter id="cp-lueur" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="${0.25 * rem}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>`);
    // grille horizontale
    for (const v of graduations(d.yMax / 1.08)) {
      const y = Y(v);
      parts.push(`<line x1="${g.l}" x2="${W - g.r}" y1="${y}" y2="${y}" stroke="rgba(120,180,255,${v === 0 ? 0.3 : 0.1})" stroke-width="1"/>`);
      parts.push(`<text x="${g.l - 0.5 * rem}" y="${y + fs * 0.35}" text-anchor="end" font-size="${fs}">${court(v)}</text>`);
    }
    // graduations temporelles
    if (d.type === 'heure') {
      const pasH = pw / ((x1 - x0) / 60) < 3.2 * rem ? 120 : 60;
      for (let m = Math.ceil(x0 / 60) * 60; m <= x1; m += pasH) {
        const x = X(m);
        parts.push(`<line x1="${x}" x2="${x}" y1="${g.t}" y2="${g.t + ph}" stroke="rgba(120,180,255,.06)"/>`);
        parts.push(`<text x="${x}" y="${H - 0.35 * rem}" text-anchor="middle" font-size="${fs}">${String(Math.floor(m / 60)).padStart(2, '0')}h</text>`);
      }
    } else {
      const n = d.barres.length;
      const pas = Math.max(1, Math.ceil((n * 3.4 * rem) / pw));
      d.barres.forEach((b, i) => {
        if (i % pas) return;
        const jj = b.t ? new Date(`${b.t}T12:00:00`) : null;
        const lib = jj ? `${['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'][jj.getDay()]} ${jj.getDate()}` : '';
        parts.push(`<text x="${X(i + 0.5)}" y="${H - 0.35 * rem}" text-anchor="middle" font-size="${fs}">${lib}</text>`);
      });
    }
    // barres par tranche
    if (!this.compacte) {
      for (const b of d.barres) {
        const xa = X(b.x0) + 0.12 * rem;
        const xb = X(b.x1) - 0.12 * rem;
        if (b.objectif) parts.push(`<line x1="${xa}" x2="${xb}" y1="${YB(b.objectif)}" y2="${YB(b.objectif)}" stroke="rgba(238,247,255,.45)" stroke-width="1.5" stroke-dasharray="3 3"/>`);
        if (b.y === null || b.y === undefined) continue;
        const yb = YB(b.y);
        parts.push(`<rect x="${xa}" y="${yb}" width="${Math.max(1, xb - xa)}" height="${Math.max(0, g.t + ph - yb)}" rx="${0.15 * rem}" fill="${b.partiel ? 'url(#cp-hach)' : 'rgba(60,214,255,.26)'}" stroke="rgba(60,214,255,.45)" stroke-width="1"/>`);
      }
    }
    // objectif cumulé (pointillés)
    if (d.objectif.length > 1) {
      parts.push(`<polyline points="${d.objectif.map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ')}" fill="none" stroke="rgba(238,247,255,.7)" stroke-width="${0.13 * rem}" stroke-dasharray="${0.45 * rem} ${0.35 * rem}"/>`);
    }
    if (d.objectifFinal) {
      const y = Y(d.objectifFinal);
      parts.push(`<line x1="${g.l}" x2="${W - g.r}" y1="${y}" y2="${y}" stroke="rgba(32,214,157,.45)" stroke-width="1"/>`);
      parts.push(`<text x="${g.l + 0.4 * rem}" y="${y - 0.35 * rem}" text-anchor="start" font-size="${fs}" fill="#20d69d">OBJECTIF ${nombre(d.objectifFinal)}</text>`);
    }
    // réalisé cumulé (aire + trait lumineux)
    if (d.reel.length > 1) {
      const pts = d.reel.map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
      const der = d.reel[d.reel.length - 1];
      parts.push(`<polygon points="${X(d.reel[0].x)},${Y(0)} ${pts} ${X(der.x)},${Y(0)}" fill="url(#cp-aire)"/>`);
      parts.push(`<polyline points="${pts}" fill="none" stroke="#3cd6ff" stroke-width="${0.2 * rem}" stroke-linejoin="round" filter="url(#cp-lueur)"/>`);
      // repère « maintenant »
      if (d.heure !== null && d.heure !== undefined && d.type === 'heure') {
        const xn = X(d.heure);
        parts.push(`<line x1="${xn}" x2="${xn}" y1="${g.t}" y2="${g.t + ph}" stroke="rgba(158,234,255,.55)" stroke-dasharray="2 3"/>`);
        if (d.attendu !== null && d.attendu !== undefined) {
          parts.push(`<circle cx="${xn}" cy="${Y(d.attendu)}" r="${0.32 * rem}" fill="#050c18" stroke="#eef7ff" stroke-width="${0.11 * rem}"/>`);
        }
      }
      const xd = X(der.x);
      const yd = Y(der.y);
      parts.push(`<circle cx="${xd}" cy="${yd}" r="${0.62 * rem}" fill="#3cd6ff" fill-opacity=".18"/><circle cx="${xd}" cy="${yd}" r="${0.34 * rem}" fill="#eef7ff" stroke="#3cd6ff" stroke-width="${0.12 * rem}"/>`);
      const lib = `${d.type === 'heure' && d.heure !== null ? `${enHHMM(d.heure)} · ` : ''}${nombre(der.y)}`;
      const lw = (lib.length * 0.6 + 1.2) * fs;
      const lx = Math.min(W - g.r - lw, Math.max(g.l, xd - lw / 2));
      const ly = Math.max(g.t, yd - 2.5 * rem);
      parts.push(`<g><rect x="${lx}" y="${ly}" width="${lw}" height="${1.55 * rem}" rx="${0.3 * rem}" fill="#06101f" stroke="rgba(60,214,255,.6)"/><text x="${lx + lw / 2}" y="${ly + 1.06 * rem}" text-anchor="middle" font-size="${fs * 1.05}" fill="#eef7ff" font-weight="600">${lib}</text></g>`);
    }
    this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    this.svg.innerHTML = parts.join('');
    this.svg.setAttribute('aria-label', `Courbe de production : ${d.reel.length ? nombre(d.reel[d.reel.length - 1].y) : 'aucune'} lignes cumulées, objectif ${nombre(d.objectifFinal)}`);
  }
}

/** Mini-courbe de tendance (carte indicateur). */
export class Tendance {
  constructor(svg, couleur = '#3cd6ff') {
    this.svg = svg;
    this.couleur = couleur;
    this.valeurs = null;
    this.stop = () => {};
  }

  regler(valeurs) {
    const v = (valeurs || []).filter((x) => x !== null && Number.isFinite(x));
    if (v.length < 2) { this.svg.innerHTML = ''; this.valeurs = null; return; }
    const depart = this.valeurs && this.valeurs.length ? this.valeurs : null;
    this.stop();
    if (!depart) { this.valeurs = v; this.dessiner(v); return; }
    this.stop = tween(800, (k) => {
      const n = v.length;
      const pts = v.map((y, i) => {
        const xo = (i / Math.max(1, n - 1)) * (depart.length - 1);
        const a = depart[Math.floor(xo)] ?? depart[depart.length - 1];
        const b = depart[Math.ceil(xo)] ?? a;
        return lerp(lerp(a, b, xo - Math.floor(xo)), y, k);
      });
      this.dessiner(pts);
    }, () => { this.valeurs = v; this.dessiner(v); }, ease.inOutCubic);
    this.valeurs = v;
  }

  dessiner(v) {
    const W = 100;
    const H = 30;
    const min = Math.min(...v);
    const max = Math.max(...v);
    const Y = (y) => (max === min ? H / 2 : H - 3 - ((y - min) / (max - min)) * (H - 6));
    const X = (i) => (i / (v.length - 1)) * W;
    const pts = v.map((y, i) => `${X(i).toFixed(2)},${Y(y).toFixed(2)}`).join(' ');
    const id = `tg${Math.random().toString(36).slice(2, 7)}`;
    this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    this.svg.setAttribute('preserveAspectRatio', 'none');
    this.svg.innerHTML = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${this.couleur}" stop-opacity=".3"/><stop offset="1" stop-color="${this.couleur}" stop-opacity="0"/></linearGradient></defs>
      <polygon points="0,${H} ${pts} ${W},${H}" fill="url(#${id})"/>
      <polyline points="${pts}" fill="none" stroke="${this.couleur}" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
      <circle cx="${X(v.length - 1)}" cy="${Y(v[v.length - 1])}" r="2.4" fill="#eef7ff" vector-effect="non-scaling-stroke"/>`;
  }
}

/** Histogramme détaillé (tiroir) : une barre par tranche, valeur lisible, objectif en pointillés. */
export function histogramme(conteneur, barres, { unite = '', format = (v) => nombre(v), objectif = true, couleur = '#3cd6ff', seuil = null, seuilLib = '' } = {}) {
  conteneur.innerHTML = '';
  const W = conteneur.clientWidth || 600;
  const H = conteneur.clientHeight || 240;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const fs = 0.75 * rem;
  const g = { l: 3.4 * rem, r: 0.6 * rem, t: 1.4 * rem, b: 1.6 * rem };
  const pw = W - g.l - g.r;
  const ph = H - g.t - g.b;
  const vals = barres.map((b) => b.y).filter((x) => x !== null && Number.isFinite(x));
  if (!vals.length) {
    conteneur.innerHTML = '<div class="vide" style="display:grid;place-items:center;height:100%;color:var(--texte-2)">Historique indisponible</div>';
    return;
  }
  const max = Math.max(...vals, ...(objectif ? barres.map((b) => b.objectif || 0) : [0]), seuil || 0) * 1.12 || 1;
  const n = barres.length;
  const bw = pw / n;
  const Y = (y) => g.t + ph - (y / max) * ph;
  const p = [];
  for (const v of graduations(max / 1.12, 3)) {
    p.push(`<line x1="${g.l}" x2="${W - g.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="rgba(120,180,255,${v ? 0.1 : 0.3})"/>`);
    p.push(`<text x="${g.l - 0.4 * rem}" y="${Y(v) + fs * 0.35}" text-anchor="end" font-size="${fs}">${court(v)}</text>`);
  }
  if (seuil !== null) {
    p.push(`<line x1="${g.l}" x2="${W - g.r}" y1="${Y(seuil)}" y2="${Y(seuil)}" stroke="#ffb43a" stroke-width="1.5" stroke-dasharray="5 4"/>`);
    p.push(`<text x="${W - g.r}" y="${Y(seuil) - 0.3 * rem}" text-anchor="end" font-size="${fs}" fill="#ffb43a">${seuilLib}</text>`);
  }
  const pasLib = Math.max(1, Math.ceil((n * 2.6 * rem) / pw));
  barres.forEach((b, i) => {
    const x = g.l + i * bw + bw * 0.14;
    const w = bw * 0.72;
    if (objectif && b.objectif) p.push(`<line x1="${x - bw * 0.06}" x2="${x + w + bw * 0.06}" y1="${Y(b.objectif)}" y2="${Y(b.objectif)}" stroke="rgba(238,247,255,.6)" stroke-width="1.5" stroke-dasharray="3 3"/>`);
    if (b.y !== null && Number.isFinite(b.y)) {
      p.push(`<rect x="${x}" y="${Y(b.y)}" width="${w}" height="${g.t + ph - Y(b.y)}" rx="${0.15 * rem}" fill="${couleur}" fill-opacity="${b.partiel ? 0.25 : 0.55}" stroke="${couleur}" stroke-opacity=".8" ${b.partiel ? 'stroke-dasharray="3 2"' : ''}/>`);
      if (bw > 2.4 * rem) p.push(`<text x="${x + w / 2}" y="${Y(b.y) - 0.3 * rem}" text-anchor="middle" font-size="${fs * 0.95}" fill="#eef7ff">${format(b.y)}</text>`);
    } else {
      p.push(`<text x="${x + w / 2}" y="${g.t + ph - 0.3 * rem}" text-anchor="middle" font-size="${fs * 0.9}" fill="#5f7491">—</text>`);
    }
    if (i % pasLib === 0) p.push(`<text x="${x + w / 2}" y="${H - 0.3 * rem}" text-anchor="middle" font-size="${fs}">${b.lib || ''}</text>`);
  });
  conteneur.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Historique ${unite}">${p.join('')}</svg>`;
}
