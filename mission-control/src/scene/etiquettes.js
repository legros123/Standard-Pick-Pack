/* Étiquettes de zones : couche HTML au-dessus de la 3D (texte net,
   tactile, cible ≥ 48 px). Symbole + mot + couleur pour chaque état. */
import { ZONES } from '../config/defauts.js';
import { ICONES, ETAT_LIBELLE } from '../ui/icones.js';
import { el, majHtml, majTexte } from '../ui/dom.js';

export class Etiquettes {
  constructor(conteneur, surZone) {
    this.c = el('<div class="etiquettes"></div>');
    conteneur.appendChild(this.c);
    this.n = {};
    for (const z of ZONES) {
      const b = el(`<button class="etiquette pressable" type="button" data-zone="${z.id}" data-etat="indisponible" aria-label="Zone ${z.nom}">
        <span class="h"><span class="code">${z.code}</span>${z.court}<span class="ic"></span></span>
        <span class="v"><b>—</b><span></span></span>
        <span class="e"></span>
      </button>`);
      b.addEventListener('click', () => surZone(z.id));
      this.c.appendChild(b);
      this.n[z.id] = b;
    }
  }

  positions(p) {
    for (const [id, b] of Object.entries(this.n)) {
      const q = p[id];
      if (!q) continue;
      b.style.visibility = q.visible ? 'visible' : 'hidden';
      b.style.transform = `translate3d(${q.x.toFixed(1)}px, ${(q.y).toFixed(1)}px, 0) translate(-50%, -100%)`;
    }
  }

  maj(zones, resume) {
    for (const z of ZONES) {
      const b = this.n[z.id];
      const etat = zones?.[z.id]?.etat || 'indisponible';
      b.dataset.etat = etat;
      majHtml(b.querySelector('.ic'), ICONES[etat]);
      const r = resume?.[z.id];
      majTexte(b.querySelector('.v b'), r ? r[0] : '—');
      majTexte(b.querySelector('.v span'), r ? r[1] : '');
      majTexte(b.querySelector('.e'), ETAT_LIBELLE[etat]);
      b.setAttribute('aria-label', `Zone ${z.nom} : ${r ? `${r[0]} ${r[1]}` : 'indisponible'}, état ${ETAT_LIBELLE[etat].toLowerCase()}. Ouvrir le détail.`);
    }
  }

  activer(id) {
    this.c.classList.toggle('masquees', !!id);
    for (const [k, b] of Object.entries(this.n)) b.classList.toggle('active', k === id);
  }

  flash(id) {
    const b = this.n[id];
    if (!b) return;
    b.classList.remove('flash');
    void b.offsetWidth;
    b.classList.add('flash');
    setTimeout(() => b.classList.remove('flash'), 3400);
  }
}
