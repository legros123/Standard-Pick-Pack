/* ════════════════════════════════════════════════════════════════════
   REPLI 2D — schéma du flux en SVG quand la 3D n'est pas disponible
   (ou choisi dans les réglages). Même plan, mêmes zones, mêmes états.
   ════════════════════════════════════════════════════════════════════ */
import { ZONES_PLAN, COLLECTEUR, AMENEES, EXPE, REJET, TABLE_REJET, RAYONNAGES, QUAIS, X_PORTIQUE, Z_LIGNE, Trajet, route } from './plan.js';
import { ZONES } from '../config/defauts.js';
import { animation } from '../ui/dom.js';

const COUL = { conforme: '#20d69d', vigilance: '#ffb43a', critique: '#ff4d5f', indisponible: '#5d6d84' };

export class Schema2D {
  constructor(conteneur, { surZone }) {
    this.c = document.createElement('div');
    this.c.className = 'schema2d';
    conteneur.appendChild(this.c);
    this.surZone = surZone;
    // projection isométrique simple (plan → écran)
    const a = (15 * Math.PI) / 180;
    const sinE = Math.sin((39 * Math.PI) / 180);
    const iso = (x, z) => [(x * Math.cos(a) - z * Math.sin(a)) * 24, (x * Math.sin(a) + z * Math.cos(a)) * sinE * 24];
    const pts = [];
    for (const zp of Object.values(ZONES_PLAN)) { const [x0, x1, z0, z1] = zp.rect; pts.push(iso(x0, z0), iso(x1, z1), iso(x0, z1), iso(x1, z0)); }
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const m = 40;
    this.vb = [Math.min(...xs) - m, Math.min(...ys) - m - 60, Math.max(...xs) - Math.min(...xs) + 2 * m, Math.max(...ys) - Math.min(...ys) + 2 * m + 60];
    this.iso = iso;
    const poly = (p) => p.map(([x, z]) => iso(x, z).map((v) => v.toFixed(1)).join(',')).join(' ');
    const rect = ([x0, x1, z0, z1]) => poly([[x0, z0], [x1, z0], [x1, z1], [x0, z1]]);
    const rayons = RAYONNAGES.rangees.map((z) => `<polygon points="${rect([RAYONNAGES.x0, RAYONNAGES.x1, z - 0.5, z + 0.5])}" fill="#1d4f8f" fill-opacity=".55" stroke="#4d86c8" stroke-width="1"/>`).join('');
    const tapis = (p) => `<polyline points="${poly(p)}" fill="none" stroke="#1a2537" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/><polyline points="${poly(p)}" fill="none" stroke="#3cd6ff" stroke-opacity=".55" stroke-width="2" stroke-dasharray="8 10" class="flux"/>`;
    const zones = Object.entries(ZONES_PLAN).map(([id, z]) => `<g class="zone2d" data-zone="${id}" role="button" tabindex="0"><polygon points="${rect(z.rect)}" fill="#3cd6ff" fill-opacity=".05" stroke="#3cd6ff" stroke-width="2" data-contour/></g>`).join('');
    const quais = QUAIS.map((q) => `<polygon points="${rect([q.x - 0.15, q.x + 0.15, q.z - 1.3, q.z + 1.3])}" fill="#dff4ff" fill-opacity=".6"/>`).join('');
    const T = TABLE_REJET;
    this.c.innerHTML = `<svg viewBox="${this.vb.join(' ')}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Schéma 2D du flux Pick & Pack">
      ${zones}${rayons}
      ${AMENEES.map(tapis).join('')}${tapis(COLLECTEUR)}${tapis(EXPE)}${tapis(REJET)}
      <polygon points="${rect([X_PORTIQUE - 0.75, X_PORTIQUE + 0.75, Z_LIGNE - 0.75, Z_LIGNE + 0.75])}" fill="none" stroke="#9eeaff" stroke-width="3"/>
      <polygon points="${rect([T.x - T.l / 2, T.x + T.l / 2, T.z - T.p / 2, T.z + T.p / 2])}" fill="#8fa2b8" fill-opacity=".5" stroke="#b4c3d4"/>
      ${quais}
      <g class="colis"></g>
    </svg>`;
    this.svg = this.c.querySelector('svg');
    this.gColis = this.c.querySelector('.colis');
    this.c.addEventListener('click', (e) => {
      const g = e.target.closest('[data-zone]');
      if (g) surZone(g.dataset.zone);
    });
    this.trajets = [0, 1, 2].map((k) => new Trajet([...route(k), ...EXPE.slice(1)]));
    this.trajetRejet = new Trajet([...route(1), ...REJET.slice(1)]);
    this.points = Array.from({ length: 26 }, (_, i) => ({ k: i % 4, d: i * 1.4 }));
    this.flux = { actif: true, taux: 0.03 };
    this.boucle = this.boucle.bind(this);
    this.t0 = performance.now();
    this.dessinerColis(0);
    requestAnimationFrame(this.boucle);
  }

  ancres(largeur, hauteur) {
    const [vx, vy, vw, vh] = this.vb;
    const s = Math.min(largeur / vw, hauteur / vh);
    const ox = (largeur - vw * s) / 2;
    const oy = (hauteur - vh * s) / 2;
    const out = {};
    for (const [id, z] of Object.entries(ZONES_PLAN)) {
      const [x0, x1, z0, z1] = z.rect;
      const [px, py] = this.iso((x0 + x1) / 2, (z0 + z1) / 2);
      out[id] = { x: ox + (px - vx) * s, y: oy + (py - vy) * s - 18, visible: true };
    }
    return out;
  }

  majEtats(zones) {
    this.c.querySelectorAll('[data-zone]').forEach((g) => {
      const e = zones?.[g.dataset.zone]?.etat || 'indisponible';
      const p = g.querySelector('[data-contour]');
      p.setAttribute('stroke', COUL[e]);
      p.setAttribute('fill', COUL[e]);
      p.setAttribute('fill-opacity', e === 'critique' || e === 'vigilance' ? '.14' : '.05');
      p.setAttribute('stroke-width', e === 'critique' ? '4' : '2');
      p.setAttribute('stroke-dasharray', e === 'indisponible' ? '6 6' : '');
      const zz = ZONES.find((x) => x.id === g.dataset.zone);
      g.setAttribute('aria-label', `Zone ${zz?.nom} : ${e}`);
    });
  }

  majFlux({ actif, taux }) {
    this.flux = { actif, taux: taux ?? 0.03 };
  }

  dessinerColis(t) {
    const p = { x: 0, z: 0, cap: 0 };
    const html = this.points.map((c, i) => {
      const rej = this.flux.taux > 0 && i % Math.max(2, Math.round(1 / Math.max(0.02, this.flux.taux))) === 0;
      const tr = rej ? this.trajetRejet : this.trajets[c.k % 3];
      const d = (c.d + t * 1.1) % tr.longueur;
      tr.a(d, p);
      const [x, y] = this.iso(p.x, p.z);
      return `<rect x="${(x - 5).toFixed(1)}" y="${(y - 9).toFixed(1)}" width="10" height="8" rx="1.5" fill="${rej && d > tr.longueur - 7 ? '#ffcf8a' : '#c49a68'}" stroke="#2a1d10" stroke-width=".8"/>`;
    }).join('');
    this.gColis.innerHTML = html;
  }

  boucle(n) {
    if (!this.c.isConnected) return;
    if (animation.plein && this.flux.actif && !document.hidden && this.c.offsetParent) this.dessinerColis((n - this.t0) / 1000);
    requestAnimationFrame(this.boucle);
  }

  impulsion() {}
  celebrer() {}
  reglerAnimation() {}
  reglerMode() {}
  reglerQualite() {}
  redimensionner() {}
  zoomZone() {}
  vueGenerale() {}
  infoQualite() { return 'Schéma 2D (sans 3D)'; }
}
