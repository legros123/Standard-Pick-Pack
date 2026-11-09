/* Compteur animé : transition courte de l'ancienne vers la nouvelle valeur
   (jamais de retour à zéro lors d'une actualisation). */
import { animation } from './dom.js';
import { nombre, INDISPONIBLE } from '../commun/format.js';

export class Compteur {
  constructor(noeud, { decimales = 0, format = null } = {}) {
    this.noeud = noeud;
    this.dec = decimales;
    this.format = format || ((v) => nombre(v, this.dec));
    this.valeur = null;
    this.raf = 0;
  }

  regler(v, { duree = 700, depuisZero = false } = {}) {
    cancelAnimationFrame(this.raf);
    if (v === null || v === undefined || !Number.isFinite(v)) {
      this.valeur = null;
      this.noeud.textContent = INDISPONIBLE;
      return;
    }
    const depart = depuisZero ? 0 : this.valeur;
    this.valeur = v;
    if (depart === null || depart === v || !animation.plein) {
      this.noeud.textContent = this.format(v);
      return;
    }
    const t0 = performance.now();
    const pas = (t) => {
      const k = Math.min(1, (t - t0) / duree);
      const e = 1 - Math.pow(1 - k, 3);
      const x = depart + (v - depart) * e;
      this.noeud.textContent = this.format(this.dec ? x : Math.round(x));
      if (k < 1) this.raf = requestAnimationFrame(pas);
    };
    this.raf = requestAnimationFrame(pas);
  }
}
