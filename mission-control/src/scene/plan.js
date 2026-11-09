/* ════════════════════════════════════════════════════════════════════
   PLAN DU SCHÉMA DE FLUX — partagé par la scène 3D et le repli 2D.
   Schéma illustratif : il ne reproduit PAS l'implantation réelle du
   site. Unités : mètres (x vers la droite, z vers le spectateur).
   ════════════════════════════════════════════════════════════════════ */

export const Y_TAPIS = 0.82;
export const LARGEUR_TAPIS = 0.86; // élargi : schéma, pas plan à l'échelle
export const X_COLLECTEUR = -3.0;
export const Z_LIGNE = 4.5;
export const X_PORTIQUE = 3.4;
export const X_AIGUILLAGE = 5.7;
export const X_FIN_EXPE = 12.2;
export const TABLE_REJET = { x: 8.6, z: -2.7, l: 2.4, p: 1.7 };
export const POSTES = [-5.3, -2.7, -0.1].map((z) => ({ x: -6.5, z }));
export const RAYONNAGES = { x0: -15.9, x1: -7.5, rangees: [-6.6, -4.0, -1.4, 1.2], profondeur: 1.0, niveaux: [0.12, 1.02, 1.92, 2.82], hauteur: 3.1, travees: 4 };
export const QUAIS = [3.4, 5.8, 8.2].map((z) => ({ x: 16.6, z }));
export const PALETTES = [{ x: 13.9, z: 6.7 }, { x: 13.9, z: 3.2 }];

/** Rectangles des zones [xmin, xmax, zmin, zmax], ancre de l'étiquette, cadrage caméra. */
export const ZONES_PLAN = {
  preparation: { rect: [-16.6, -4.5, -7.7, 2.3], ancre: [-11.5, 3.6, -1.5], hauteur: 3.2 },
  convoyeur: { rect: [-4.2, 2.0, 2.9, 6.1], ancre: [-2.2, 1.7, 4.5], hauteur: 1.3 },
  controle: { rect: [2.2, 4.9, 3.0, 6.0], ancre: [X_PORTIQUE, 3.5, Z_LIGNE], hauteur: 2.6 },
  rejet: { rect: [6.9, 10.4, -4.0, 2.4], ancre: [8.6, 2.0, -2.4], hauteur: 1.4 },
  expedition: { rect: [10.6, 18.8, 2.0, 9.6], ancre: [14.6, 3.7, 5.6], hauteur: 3.2 },
};

export const BORNES = { x0: -16.6, x1: 19.2, z0: -7.6, z1: 9.8, y1: 3.2 };

/* ─────────── tracés des colis ─────────── */

function arc(cx, cz, r, a0, a1, n = 10) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]);
  }
  return pts;
}

function bezier(p0, p1, p2, n = 14) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    pts.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]);
  }
  return pts;
}

const R = 1.5;
/** Collecteur : longe la préparation (+z) puis tourne vers le contrôle (+x). */
export const COLLECTEUR = [
  [X_COLLECTEUR, -6.2],
  [X_COLLECTEUR, Z_LIGNE - R],
  ...arc(X_COLLECTEUR + R, Z_LIGNE - R, R, Math.PI, Math.PI / 2, 12).slice(1),
  [X_AIGUILLAGE, Z_LIGNE],
];
export const AMENEES = POSTES.map((p) => [[p.x + 0.55, p.z], [X_COLLECTEUR - LARGEUR_TAPIS / 2, p.z]]);
export const EXPE = [[X_AIGUILLAGE, Z_LIGNE], [X_FIN_EXPE, Z_LIGNE]];
export const REJET = [
  ...bezier([X_AIGUILLAGE, Z_LIGNE], [TABLE_REJET.x, Z_LIGNE], [TABLE_REJET.x, Z_LIGNE - 2.4]),
  [TABLE_REJET.x, TABLE_REJET.z + TABLE_REJET.p / 2 + 0.15],
];

/** Polyligne avec abscisse curviligne : position et cap à une distance donnée. */
export class Trajet {
  constructor(points) {
    this.p = points;
    this.cumul = [0];
    for (let i = 1; i < points.length; i++) {
      this.cumul.push(this.cumul[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
    }
    this.longueur = this.cumul[this.cumul.length - 1];
  }

  a(d, out) {
    const L = this.longueur;
    const x = Math.max(0, Math.min(L, d));
    let i = 1;
    while (i < this.cumul.length - 1 && this.cumul[i] < x) i++;
    const a = this.p[i - 1];
    const b = this.p[i];
    const seg = this.cumul[i] - this.cumul[i - 1] || 1;
    const k = (x - this.cumul[i - 1]) / seg;
    out.x = a[0] + (b[0] - a[0]) * k;
    out.z = a[1] + (b[1] - a[1]) * k;
    out.cap = Math.atan2(b[0] - a[0], b[1] - a[1]);
    return out;
  }
}

/** Route complète d'un colis depuis le poste k jusqu'à l'aiguillage. */
export function route(k) {
  const p = POSTES[k];
  const suite = COLLECTEUR.filter(([x, z], i) => i > 0 && !(x === X_COLLECTEUR && z <= p.z));
  return [[p.x + 0.55, p.z], [X_COLLECTEUR, p.z], ...suite];
}
