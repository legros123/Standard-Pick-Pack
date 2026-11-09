/* Bandeau bas : courbe de production, progression vers l'objectif,
   trois priorités du moment. */
import { ICONES } from './icones.js';
import { el, majTexte, majHtml } from './dom.js';
import { Compteur } from './compteur.js';
import { CourbeProduction } from './graphiques.js';
import { nombre, pct, signe, echapper } from '../commun/format.js';
import { enHHMM } from '../donnees/temps.js';
import { ZONES } from '../config/defauts.js';

export class ModuleCourbe {
  constructor(parent, ouvrir) {
    this.noeud = el(`<button class="module courbe pressable" type="button" style="--i:7" aria-label="Courbe de production — ouvrir le détail">
      <div class="module-tete"><span class="module-icone">${ICONES.courbe}</span><span class="module-titre">Courbe de production</span>
        <span class="courbe-legende"><span><i></i>Réalisé cumulé</span><span><i class="obj"></i>Objectif au rythme</span><span><i class="barre"></i><span class="lib-b">Lignes / heure</span></span></span>
      </div>
      <div class="graphique"></div>
    </button>`);
    parent.appendChild(this.noeud);
    this.courbe = new CourbeProduction(this.noeud.querySelector('.graphique'));
    this.noeud.addEventListener('click', () => ouvrir('lignes'));
  }

  maj(m, { animer }) {
    if (!m?.disponible) { this.courbe.regler(null); return; }
    majTexte(this.noeud.querySelector('.lib-b'), m.estJour ? 'Lignes / heure' : 'Lignes / jour');
    const s = m.serie;
    this.courbe.regler({
      type: s.type, domaine: s.domaine, reel: s.reel, objectif: s.objectif, barres: s.barres,
      heure: m.estJour ? m.heure : null, attendu: m.estJour ? m.lignes.attendu : null, objectifFinal: m.lignes.objectif,
    }, { animer });
  }
}

export class ModuleProgression {
  constructor(parent, ouvrir) {
    this.noeud = el(`<button class="module progression pressable" type="button" data-etat="indisponible" style="--i:8" aria-label="Progression vers l’objectif — ouvrir le détail">
      <div class="module-tete"><span class="module-icone">${ICONES.cible}</span><span class="module-titre">Progression vers l’objectif</span></div>
      <div class="prog-chiffres"><span class="v">—</span><span class="o"></span><span class="u">lignes</span><span class="p"></span></div>
      <div class="jauge"><div class="jauge-remplie"></div><div class="jauge-repere" hidden></div></div>
      <div class="prog-legende"><span class="g"></span><span class="d"></span></div>
      <div class="prog-detail"></div>
    </button>`);
    parent.appendChild(this.noeud);
    this.c = new Compteur(this.noeud.querySelector('.v'));
    this.noeud.addEventListener('click', () => ouvrir('lignes'));
  }

  maj(m, alertes, { depuisZero }) {
    const n = this.noeud;
    const L = m?.disponible ? m.lignes : null;
    const ok = L && L.valeur !== null && L.objectif;
    const etat = !ok ? 'indisponible' : alertes.some((a) => a.kpi === 'lignes' && a.niveau === 'critique') ? 'critique'
      : alertes.some((a) => a.kpi === 'lignes') ? 'vigilance' : 'conforme';
    n.dataset.etat = etat;
    this.c.regler(L ? L.valeur : null, { depuisZero, duree: depuisZero ? 1100 : 700 });
    majTexte(n.querySelector('.o'), ok ? `/ ${nombre(L.objectif)}` : '');
    majTexte(n.querySelector('.p'), ok ? pct(L.pctObjectif) : '');
    const remplie = n.querySelector('.jauge-remplie');
    remplie.style.width = ok ? `${Math.min(100, L.pctObjectif * 100)}%` : '0%';
    const rep = n.querySelector('.jauge-repere');
    rep.hidden = !(ok && L.attendu !== null);
    if (ok && L.attendu !== null) rep.style.left = `calc(${Math.min(100, (L.attendu / L.objectif) * 100)}% - 0.09rem)`;
    majHtml(n.querySelector('.g'), ok && L.attendu !== null ? `▼ attendu ${m.estJour ? enHHMM(m.heure) : 'à date'} : <b>${nombre(L.attendu)}</b>` : '');
    majHtml(n.querySelector('.d'), ok ? `<b>${signe(L.ecart)}</b> lignes` : '');
    const det = [];
    if (ok) {
      det.push(['Reste à préparer', `<b>${nombre(L.resteObjectif)}</b> lignes`]);
      if (L.rythmeRequis !== null) det.push(['Rythme requis', `<b>${nombre(L.rythmeRequis)}</b> lignes/h`]);
      if (L.cadence !== null) det.push(['Cadence dernière heure', `<b>${nombre(L.cadence)}</b> lignes/h`]);
    } else det.push(['Objectif', 'indisponible']);
    majHtml(n.querySelector('.prog-detail'), det.slice(0, 2).map(([a, b]) => `<div class="l"><span>${a}</span><span>${b}</span></div>`).join(''));
  }
}

export class ModulePriorites {
  constructor(parent, ouvrirAlerte, ouvrirBriefing) {
    this.noeud = el(`<section class="module priorites" style="--i:9" aria-label="Trois priorités du moment">
      <div class="module-tete"><span class="module-icone">${ICONES.priorite}</span><span class="module-titre">Priorités du moment</span><span class="module-code">TOP 3</span></div>
      <ol class="prio-liste"></ol>
    </section>`);
    parent.appendChild(this.noeud);
    this.liste = this.noeud.querySelector('.prio-liste');
    this.liste.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.alerte) ouvrirAlerte(b.dataset.alerte);
      else ouvrirBriefing();
    });
  }

  maj(prios, disponible) {
    const items = [];
    for (let i = 0; i < 3; i++) {
      const p = prios[i];
      if (!p) {
        items.push(`<li class="prio vide">${i === 0 ? (disponible ? 'Aucune alerte — situation conforme aux seuils' : 'Données indisponibles') : 'Pas d’autre priorité'}</li>`);
        continue;
      }
      const zone = ZONES.find((z) => z.id === p.zone);
      const sous = p.origine === 'superviseur' ? 'Fixée par le superviseur' : `${zone ? `${zone.code} ${zone.nom}` : ''} · ${p.alerte?.titre || ''}`;
      items.push(`<li><button class="prio pressable" type="button" data-niveau="${p.niveau}" ${p.alerte ? `data-alerte="${p.alerte.id}"` : ''}>
        <span class="prio-n">${i + 1}</span><span class="prio-icone">${ICONES[p.niveau] || ICONES.priorite}</span>
        <span class="prio-texte"><span class="t">${echapper(p.texte)}</span><span class="s">${echapper(sous)}</span></span>
      </button></li>`);
    }
    majHtml(this.liste, items.join(''));
    this.liste.querySelectorAll('li').forEach((li) => { li.style.display = 'flex'; li.style.flex = '1 1 0'; li.style.minHeight = '0'; });
  }
}
