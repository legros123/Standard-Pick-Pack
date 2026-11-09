/* Mode Briefing équipe : très gros caractères, chiffres essentiels,
   point sécurité, trois priorités du jour. Lisible à plusieurs mètres. */
import { ICONES, puceEtat } from './icones.js';
import { el, majHtml, majTexte } from './dom.js';
import { Compteur } from './compteur.js';
import { nombre, pct, capitale, dateLongue, echapper } from '../commun/format.js';
import { STANDARDS, ZONES } from '../config/defauts.js';
import { dateDepuisIso, enHHMM } from '../donnees/temps.js';

const ORDRE = { critique: 2, vigilance: 1 };
const etatDe = (id, v, alertes) => (v === null || v === undefined ? 'indisponible'
  : alertes.filter((a) => a.kpi === id).reduce((p, a) => (ORDRE[a.niveau] > (ORDRE[p] || 0) ? a.niveau : p), 'conforme'));

export class Briefing {
  constructor(parent, actions) {
    this.noeud = el(`<section class="briefing" aria-label="Briefing équipe">
      <div class="brief-titre"><h1>BRIEFING ÉQUIPE</h1><span class="s"></span><span class="h"></span></div>
      <div class="brief-chiffres">
        ${[['lignes', 'Lignes préparées', 'lignes'], ['charge', 'Charge restante', 'charge'], ['qualite', 'Qualité · PPM', 'qualite'], ['effectif', 'Effectif', 'effectif']].map(([id, l, ic], i) => `
          <button class="module brief-chiffre pressable" type="button" data-kpi="${id}" data-etat="indisponible" style="--i:${i}">
            <span class="l">${ICONES[ic]}${l}</span>
            <span class="v"><span class="n">—</span><small class="u"></small></span>
            <span class="c"><span class="x"></span><span class="etat-z"></span></span>
          </button>`).join('')}
      </div>
      <div class="brief-bas">
        <section class="module brief-bloc securite" data-etat="conforme">
          <h2>${ICONES.securite}Point sécurité<button class="modifier pressable" type="button" data-modifier>${ICONES.modifier}Modifier</button></h2>
          <div class="std"><span class="code"></span><div><div class="t"></div><div class="s"></div></div></div>
          <div class="msg"></div>
          <a class="lien" target="_blank" rel="noopener">${ICONES.lien}<span>Ouvrir le standard dans l’application Standards</span></a>
        </section>
        <section class="module brief-bloc">
          <h2>${ICONES.priorite}<span class="tp">3 priorités du jour</span><button class="modifier pressable" type="button" data-modifier>${ICONES.modifier}Modifier</button></h2>
          <ol class="brief-prio"></ol>
        </section>
      </div>
    </section>`);
    parent.appendChild(this.noeud);
    this.compteurs = {};
    this.noeud.querySelectorAll('.brief-chiffre').forEach((b) => {
      this.compteurs[b.dataset.kpi] = new Compteur(b.querySelector('.n'));
      b.addEventListener('click', () => actions.ouvrirKpi(b.dataset.kpi));
    });
    this.noeud.querySelectorAll('[data-modifier]').forEach((b) => b.addEventListener('click', () => actions.modifier()));
    this.noeud.querySelector('.brief-prio').addEventListener('click', (e) => {
      const b = e.target.closest('[data-alerte]');
      if (b) actions.ouvrirAlerte(b.dataset.alerte);
    });
  }

  maj(m, alertes, prios, cfg, filtres) {
    const d = dateDepuisIso(filtres.date);
    const eq = filtres.equipe === 'toutes' ? 'toutes équipes' : `équipe ${cfg.equipes.find((e) => e.id === filtres.equipe)?.nom || filtres.equipe}`;
    majTexte(this.noeud.querySelector('.brief-titre .s'), `${capitale(dateLongue(d))} · ${eq}`);
    majTexte(this.noeud.querySelector('.brief-titre .h'), m?.disponible && m.estJour && m.heure !== null ? `Situation à ${enHHMM(m.heure)}` : '');
    const ok = m?.disponible;
    const v = {
      lignes: ok ? m.lignes.valeur : null,
      charge: ok ? m.charge.valeur : null,
      qualite: ok ? m.qualite.ppm : null,
      effectif: ok ? m.effectif.present : null,
    };
    const unites = { lignes: ok && m.lignes.objectif ? `/ ${nombre(m.lignes.objectif)}` : 'lignes', charge: 'lignes', qualite: 'ppm', effectif: ok && m.effectif.prevu !== null ? `/ ${nombre(m.effectif.prevu, m.effectif.moyen ? 1 : 0)}` : 'pers.' };
    const comment = {
      lignes: ok && m.lignes.objectif ? `<span><b>${pct(m.lignes.pctObjectif)}</b> de l’objectif</span>` : '<span>objectif indisponible</span>',
      charge: ok && m.charge.finEstimee ? `<span>fin estimée <b>${m.charge.finEstimee.auDela ? 'après le poste' : m.charge.finEstimee.heure}</b></span>` : '<span>lignes à préparer</span>',
      qualite: ok ? `<span><b>${nombre(m.qualite.erreurs)}</b> erreurs décelées · seuil ${nombre(cfg.seuils.ppmDecelee.vigilance)}</span>` : '<span>—</span>',
      effectif: ok && m.effectif.preparateurs !== null ? `<span>dont <b>${nombre(m.effectif.preparateurs, m.effectif.moyen ? 1 : 0)}</b> préparateurs</span>` : '<span>personnes</span>',
    };
    this.noeud.querySelectorAll('.brief-chiffre').forEach((b) => {
      const id = b.dataset.kpi;
      const etat = ok ? etatDe(id, v[id], alertes) : 'indisponible';
      b.dataset.etat = etat;
      this.compteurs[id].dec = id === 'effectif' && m?.effectif?.moyen ? 1 : 0;
      this.compteurs[id].regler(v[id]);
      majTexte(b.querySelector('.u'), unites[id]);
      majHtml(b.querySelector('.x'), comment[id]);
      majHtml(b.querySelector('.etat-z'), puceEtat(etat));
    });
    // point sécurité
    const st = STANDARDS.find((s) => s.id === cfg.briefing.standard) || STANDARDS[9];
    majTexte(this.noeud.querySelector('.std .code'), st.id);
    majTexte(this.noeud.querySelector('.std .t'), st.titre);
    majTexte(this.noeud.querySelector('.std .s'), st.sous);
    majTexte(this.noeud.querySelector('.msg'), cfg.briefing.message || st.sous);
    this.noeud.querySelector('.lien').href = `../index.html#${st.id}`;
    // priorités du jour : fixées par le superviseur, complétées par les règles
    const manuelles = prios.some((p) => p.origine === 'superviseur');
    majTexte(this.noeud.querySelector('.tp'), '3 priorités du jour');
    const items = [];
    for (let i = 0; i < 3; i++) {
      const p = prios[i];
      if (!p) { items.push(`<li class="vide">${i === 0 ? 'Aucune priorité : définir les priorités du jour (Modifier)' : 'Pas d’autre priorité'}</li>`); continue; }
      const z = ZONES.find((x) => x.id === p.zone);
      items.push(`<li data-niveau="${p.niveau}" ${p.alerte ? `data-alerte="${p.alerte.id}" role="button" tabindex="0"` : ''}><span class="n">${i + 1}</span><div><div class="t">${echapper(p.texte)}</div><div class="s">${p.origine === 'superviseur' ? 'Fixée par le superviseur' : `Règle d’alerte · ${z ? `${z.code} ${z.nom}` : ''} · ${echapper(p.constat || '')}`}</div></div></li>`);
    }
    majHtml(this.noeud.querySelector('.brief-prio'), items.join(''));
    this.noeud.dataset.manuelles = String(manuelles);
  }
}
