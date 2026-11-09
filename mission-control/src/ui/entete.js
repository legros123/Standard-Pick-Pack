/* En-tête : identité, contexte (date / période / équipe), horloge, état de
   la connexion, alertes, modes, commandes. */
import { ICONES } from './icones.js';
import { el, majTexte, majHtml } from './dom.js';
import { SITE } from '../config/defauts.js';
import { dateLongue, heureMinSec, ilYa, capitale, moisAnnee } from '../commun/format.js';
import { dateDepuisIso, joursDePeriode } from '../donnees/temps.js';

const ETATS = {
  ok: ['connecte', 'Données à jour'],
  ancienne: ['ancien', 'Données anciennes'],
  interrompue: ['coupe', 'Connexion interrompue'],
  indisponible: ['vide', 'Données indisponibles'],
  chargement: ['actualiser', 'Connexion…'],
};

export class Entete {
  constructor(app, actions) {
    this.actions = actions;
    this.bandeau = el(`<div class="bandeau-demo" role="status" hidden>
      <b>▲ DONNÉES DE DÉMONSTRATION</b><span class="sep">—</span><span class="fin">valeurs fictives, sans lien avec l’activité réelle</span><span class="sep">·</span><span class="fin horloge-sim"></span>
    </div>`);
    this.noeud = el(`<header class="entete">
      <div class="marque">
        <span class="marque-logo">${ICONES.logo}</span>
        <div>
          <div class="marque-nom"><span class="pick">PICK</span><span class="barres">//</span>MISSION CONTROL</div>
          <div class="marque-site">${SITE.entreprise.toUpperCase()} · ${SITE.site.toUpperCase()}</div>
        </div>
      </div>
      <button class="contexte pressable" type="button" data-action="filtres" aria-label="Changer la date, la période ou l’équipe">
        <div>
          <div class="contexte-date"></div>
          <div class="contexte-puces"></div>
        </div>
        <div class="contexte-horloge"><small>HEURE LOCALE</small><span class="hh">--:--:--</span></div>
        <span class="chevron">${ICONES.chevron}</span>
      </button>
      <button class="statut pressable" type="button" data-action="actualiser" data-etat="chargement" aria-label="État des données — toucher pour actualiser">
        <span class="statut-icone"></span>
        <span><div class="statut-texte"></div><div class="statut-heure"></div></span>
      </button>
      <button class="bouton-alertes pressable" type="button" data-action="alertes" aria-label="Alertes actives">
        <span class="ic"></span><span class="nb">0</span><span class="lib">alertes</span>
      </button>
      <div class="modes" role="group" aria-label="Mode de présentation">
        <button class="mode pressable" type="button" data-mode="exploitation" aria-pressed="true">${ICONES.exploitation}<span class="lib">Exploitation</span></button>
        <button class="mode pressable" type="button" data-mode="immersion" aria-pressed="false">${ICONES.immersion}<span class="lib">Immersion</span></button>
        <button class="mode pressable" type="button" data-mode="briefing" aria-pressed="false">${ICONES.briefing}<span class="lib">Briefing</span></button>
      </div>
      <div class="outils">
        <button class="outil pressable" type="button" data-action="animations" aria-pressed="false" aria-label="Suspendre les animations">${ICONES.pause}</button>
        <button class="outil pressable" type="button" data-action="plein-ecran" aria-label="Plein écran">${ICONES.pleinEcran}</button>
        <button class="outil pressable" type="button" data-action="reglages" aria-label="Réglages">${ICONES.reglages}</button>
      </div>
    </header>`);
    app.prepend(this.noeud);
    app.prepend(this.bandeau);
    this.noeud.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.mode) actions.mode(b.dataset.mode);
      else if (b.dataset.action) actions[b.dataset.action]?.(b);
    });
    this.r = {
      date: this.noeud.querySelector('.contexte-date'),
      puces: this.noeud.querySelector('.contexte-puces'),
      hh: this.noeud.querySelector('.hh'),
      statut: this.noeud.querySelector('.statut'),
      statutIc: this.noeud.querySelector('.statut-icone'),
      statutTx: this.noeud.querySelector('.statut-texte'),
      statutH: this.noeud.querySelector('.statut-heure'),
      alertes: this.noeud.querySelector('.bouton-alertes'),
      alertesIc: this.noeud.querySelector('.bouton-alertes .ic'),
      alertesNb: this.noeud.querySelector('.bouton-alertes .nb'),
      anim: this.noeud.querySelector('[data-action="animations"]'),
      plein: this.noeud.querySelector('[data-action="plein-ecran"]'),
      sim: this.bandeau.querySelector('.horloge-sim'),
    };
    this.statut = null;
    setInterval(() => this.tic(), 1000);
    this.tic();
    document.addEventListener('fullscreenchange', () => this.majPleinEcran());
    document.addEventListener('webkitfullscreenchange', () => this.majPleinEcran());
  }

  tic() {
    majTexte(this.r.hh, heureMinSec(new Date()));
    if (this.statut) this.majStatut(this.statut);
  }

  majFiltres(f, cfg) {
    const d = dateDepuisIso(f.date);
    let txt;
    if (f.periode === 'jour') txt = capitale(dateLongue(d));
    else if (f.periode === 'mois') txt = capitale(moisAnnee(d));
    else {
      const j = joursDePeriode(f.date, 'semaine');
      const a = dateDepuisIso(j[0]);
      const b = dateDepuisIso(j[j.length - 1]);
      txt = `Semaine du ${a.getDate()} au ${dateLongue(b).replace(/^\S+ /, '')}`;
    }
    majTexte(this.r.date, txt);
    const eq = f.equipe === 'toutes' ? 'TOUTES ÉQUIPES' : `ÉQUIPE ${(cfg.equipes.find((e) => e.id === f.equipe)?.nom || f.equipe).toUpperCase()}`;
    majHtml(this.r.puces, `<span class="puce">${f.periode.toUpperCase()}</span><span class="puce">${eq}</span>`);
  }

  majStatut(s) {
    this.statut = s;
    const [ic, tx] = ETATS[s.etat] || ETATS.chargement;
    this.r.statut.dataset.etat = s.etat;
    majHtml(this.r.statutIc, ICONES[ic]);
    majTexte(this.r.statutTx, tx);
    const ok = s.derniereReussite ? new Date(s.derniereReussite) : null;
    let h;
    if (s.etat === 'interrompue') h = `Dernières valeurs : <b>${ok ? heureMinSec(ok) : '—'}</b>`;
    else if (s.etat === 'ancienne' && s.genere) h = `Extraites <b>${ilYa(s.genere)}</b>`;
    else if (s.etat === 'indisponible') h = ok ? `Dernière réussite : <b>${heureMinSec(ok)}</b>` : 'Aucune donnée reçue';
    else h = ok ? `Actualisé à <b>${heureMinSec(ok)}</b>` : 'Chargement…';
    majHtml(this.r.statutH, h);
    this.r.statut.setAttribute('aria-label', `${tx}. ${this.r.statutH.textContent}. Toucher pour actualiser.`);
  }

  majChargement(actif) {
    this.r.statut.classList.toggle('actualise', actif);
  }

  majAlertes(alertes) {
    const niv = alertes.some((a) => a.niveau === 'critique') ? 'critique' : alertes.length ? 'vigilance' : 'conforme';
    this.r.alertes.dataset.niveau = niv;
    majHtml(this.r.alertesIc, ICONES[niv === 'conforme' ? 'conforme' : niv]);
    majTexte(this.r.alertesNb, String(alertes.length));
    majTexte(this.r.alertes.querySelector('.lib'), alertes.length > 1 ? 'alertes' : 'alerte');
    this.r.alertes.setAttribute('aria-label', `${alertes.length} alerte(s) active(s) — ouvrir la liste`);
  }

  majMode(mode) {
    this.noeud.querySelectorAll('.mode').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  }

  majAnimations(niveau) {
    const off = niveau === 'off';
    this.r.anim.setAttribute('aria-pressed', String(off));
    this.r.anim.innerHTML = off ? ICONES.lecture : ICONES.pause;
    this.r.anim.setAttribute('aria-label', off ? 'Reprendre les animations' : 'Suspendre les animations');
  }

  majPleinEcran() {
    const fs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    this.r.plein.innerHTML = fs ? ICONES.quitterPleinEcran : ICONES.pleinEcran;
    this.r.plein.setAttribute('aria-label', fs ? 'Quitter le plein écran' : 'Plein écran');
  }

  majDemo(actif, snap) {
    const exemple = !actif && !!snap?.meta?.exemple;
    this.bandeau.hidden = !actif && !exemple;
    majTexte(this.bandeau.querySelector('b'), exemple ? '▲ DONNÉES D’EXEMPLE' : '▲ DONNÉES DE DÉMONSTRATION');
    const sim = exemple ? 'fichier modèle, à remplacer par l’export réel' : snap?.meta?.heureSimulee ? `horloge simulée ${snap.meta.heure}` : 'horloge réelle';
    majTexte(this.r.sim, sim);
  }
}
