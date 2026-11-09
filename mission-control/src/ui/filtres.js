/* Filtres simples : date, période, équipe — appliqués immédiatement. */
import { el } from './dom.js';
import { isoDate } from '../donnees/temps.js';

export class Filtres {
  constructor(app, pilote) {
    this.p = pilote;
    this.app = app;
    this.noeud = null;
    this.fermerSiDehors = (e) => {
      if (this.noeud && !this.noeud.contains(e.target) && !e.target.closest('[data-action="filtres"]')) this.fermer();
    };
  }

  get ouvert() { return !!this.noeud; }

  basculer(ancre) {
    if (this.noeud) this.fermer();
    else this.ouvrir(ancre);
  }

  ouvrir(ancre) {
    const f = this.p.filtres;
    const eqs = [['toutes', 'Toutes'], ...this.p.cfg.equipes.map((e) => [e.id, e.nom])];
    this.noeud = el(`<div class="popover" role="dialog" aria-label="Filtres">
      <h2>FILTRES · DATE, PÉRIODE, ÉQUIPE</h2>
      <div class="champ"><label for="flt-date">Date</label>
        <div class="duo"><input id="flt-date" class="saisie" type="date" value="${f.date}" max="${isoDate(new Date())}">
        <button class="bouton pressable" type="button" data-auj>Aujourd’hui</button></div></div>
      <div class="champ"><span class="lib">Période</span><div class="segment" data-k="periode">${[['jour', 'Jour'], ['semaine', 'Semaine'], ['mois', 'Mois']].map(([v, l]) => `<button type="button" class="pressable" data-v="${v}" aria-pressed="${f.periode === v}">${l}</button>`).join('')}</div></div>
      <div class="champ"><span class="lib">Équipe</span><div class="segment" data-k="equipe">${eqs.map(([v, l]) => `<button type="button" class="pressable" data-v="${v}" aria-pressed="${f.equipe === v}">${l}</button>`).join('')}</div></div>
      <div class="rangee"><button class="bouton primaire pressable" type="button" data-fermer style="flex:1">Retour au tableau de bord</button></div>
    </div>`);
    this.app.appendChild(this.noeud);
    const r = ancre.getBoundingClientRect();
    const w = this.noeud.offsetWidth;
    this.noeud.style.left = `${Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2))}px`;
    this.noeud.style.top = `${r.bottom + 10}px`;
    this.noeud.querySelector('#flt-date').addEventListener('change', (e) => { if (e.target.value) this.p.setFiltres({ date: e.target.value }); });
    this.noeud.querySelector('[data-auj]').addEventListener('click', () => {
      const d = isoDate(new Date());
      this.noeud.querySelector('#flt-date').value = d;
      this.p.setFiltres({ date: d });
    });
    this.noeud.querySelectorAll('.segment').forEach((g) => g.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      this.p.setFiltres({ [g.dataset.k]: b.dataset.v });
    }));
    this.noeud.querySelector('[data-fermer]').addEventListener('click', () => this.fermer());
    setTimeout(() => document.addEventListener('pointerdown', this.fermerSiDehors), 0);
  }

  fermer() {
    document.removeEventListener('pointerdown', this.fermerSiDehors);
    this.noeud?.remove();
    this.noeud = null;
  }
}
