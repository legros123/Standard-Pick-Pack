/* Messages ponctuels : nouvelle alerte (explicite, cliquable) et
   célébration brève d'un objectif effectivement atteint. */
import { ICONES } from './icones.js';
import { el } from './dom.js';
import { ZONES } from '../config/defauts.js';
import { nombre, echapper } from '../commun/format.js';

export class Notifications {
  constructor(conteneur, ouvrirAlerte) {
    this.c = conteneur;
    this.pile = el('<div class="toasts" aria-live="polite"></div>');
    this.c.appendChild(this.pile);
    this.ouvrirAlerte = ouvrirAlerte;
  }

  alerte(a) {
    const z = ZONES.find((x) => x.id === a.zone);
    const t = el(`<button class="toast pressable" type="button" data-niveau="${a.niveau}">
      ${ICONES[a.niveau]}
      <span><span class="c">NOUVELLE ALERTE · ${a.niveau === 'critique' ? 'CRITIQUE' : 'VIGILANCE'} · ${z ? `${z.code} ${z.nom.toUpperCase()}` : ''}</span><br><span class="t">${echapper(a.message)}</span></span>
    </button>`);
    t.addEventListener('click', () => { this.ouvrirAlerte(a.id); fermer(); });
    const fermer = () => {
      if (!t.isConnected) return;
      t.classList.add('sortie');
      setTimeout(() => t.remove(), 360);
    };
    this.pile.prepend(t);
    while (this.pile.children.length > 2) this.pile.lastElementChild.remove();
    setTimeout(fermer, 9000);
  }

  info(texte, niveau = 'info', code = 'INFORMATION') {
    const t = el(`<div class="toast" data-niveau="${niveau}">${ICONES.info}<span><span class="c">${code}</span><br><span class="t">${echapper(texte)}</span></span></div>`);
    this.pile.prepend(t);
    setTimeout(() => { t.classList.add('sortie'); setTimeout(() => t.remove(), 360); }, 5000);
  }

  celebration(valeur, objectif) {
    const b = el(`<div class="celebration" role="status"><span class="c">LIGNES PRÉPARÉES</span><span class="t">OBJECTIF ATTEINT</span><span class="s">${nombre(valeur)} / ${nombre(objectif)} lignes</span></div>`);
    this.c.appendChild(b);
    setTimeout(() => b.remove(), 3500);
  }
}
