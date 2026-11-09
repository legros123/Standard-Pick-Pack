/* Petits outils DOM + gestion du niveau d'animation. */

export const $ = (sel, racine = document) => racine.querySelector(sel);
export const $$ = (sel, racine = document) => [...racine.querySelectorAll(sel)];

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function majTexte(noeud, texte) {
  if (noeud && noeud.textContent !== texte) noeud.textContent = texte;
}

export function majHtml(noeud, html) {
  if (noeud && noeud.__html !== html) {
    noeud.innerHTML = html;
    noeud.__html = html;
  }
}

/** Niveau d'animation effectif : plein | reduit | off. */
export const animation = {
  niveau: 'plein',
  ecouteurs: new Set(),
  regler(choix) {
    const reduit = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    this.niveau = choix === 'suspendues' ? 'off'
      : choix === 'reduites' ? 'reduit'
        : choix === 'actives' ? 'plein'
          : reduit ? 'reduit' : 'plein';
    document.getElementById('app')?.setAttribute('data-anim', this.niveau);
    this.ecouteurs.forEach((f) => f(this.niveau));
  },
  get plein() { return this.niveau === 'plein'; },
};

export const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

export const ease = {
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
};

/** Interpolation pilotée par requestAnimationFrame ; renvoie une fonction d'arrêt. */
export function tween(duree, chaque, fin, courbe = ease.outCubic) {
  if (!animation.plein || duree <= 0) { chaque(1); fin?.(); return () => {}; }
  const t0 = performance.now();
  let id;
  let stop = false;
  const pas = (t) => {
    if (stop) return;
    const k = Math.min(1, (t - t0) / duree);
    chaque(courbe(k));
    if (k < 1) id = requestAnimationFrame(pas);
    else fin?.();
  };
  id = requestAnimationFrame(pas);
  return () => { stop = true; cancelAnimationFrame(id); };
}
