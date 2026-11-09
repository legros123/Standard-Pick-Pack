/* Contrôleur central : filtres, actualisation périodique, états de
   connexion, indicateurs, alertes. L'affichage s'abonne aux événements ;
   une actualisation ne recharge jamais l'interface. */
import { Connecteur } from '../donnees/connecteur.js';
import { calculer } from '../donnees/indicateurs.js';
import { evaluer, etatsZones, nouvelles } from '../donnees/regles.js';
import { isoDate, joursDePeriode } from '../donnees/temps.js';
import { ecrireStockage, fusion } from '../config/reglages.js';

export class Pilote {
  constructor(reglages, filtresUrl = {}, heureForcee = null, memorises = null) {
    this.cfg = reglages;
    this.memo = memorises || {};   // seules les valeurs modifiées sur cet écran sont mémorisées
    this.connecteur = new Connecteur();
    this.connecteur.heureForcee = heureForcee;
    const auj = isoDate(new Date());
    this.filtres = { date: auj, periode: 'jour', equipe: 'toutes', ...filtresUrl };
    this.snap = null;
    this.m = null;
    this.alertes = [];
    this.zones = {};
    this.statut = { etat: 'chargement', derniereReussite: null, derniereTentative: null, erreur: null, ageDonnees: null };
    this.ecouteurs = new Map();
    this.minuteur = null;
    this.enCours = false;
    this.cleFiltres = null;
  }

  on(evt, fn) {
    if (!this.ecouteurs.has(evt)) this.ecouteurs.set(evt, new Set());
    this.ecouteurs.get(evt).add(fn);
    return () => this.ecouteurs.get(evt).delete(fn);
  }

  emettre(evt, detail) {
    (this.ecouteurs.get(evt) || []).forEach((fn) => {
      try { fn(detail); } catch (e) { console.error(`[${evt}]`, e); }
    });
  }

  /** Modifie les réglages (fusion profonde), mémorise si demandé, relance si nécessaire. */
  regler(patch, { memoriser = true, recharger = false } = {}) {
    this.cfg = fusion(this.cfg, patch);
    if (memoriser) { this.memo = fusion(this.memo, patch); ecrireStockage(this.memo); }
    this.emettre('reglages', this.cfg);
    if (recharger) this.actualiser({ raison: 'reglages' });
    else if (this.snap) this.recalculer();
  }

  setFiltres(f) {
    this.filtres = { ...this.filtres, ...f };
    this.emettre('filtres', this.filtres);
    this.actualiser({ raison: 'filtres' });
  }

  demarrer() {
    this.actualiser({ raison: 'ouverture' });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) return;
      const p = this.cfg.donnees.actualisation * 1000;
      if (!this.statut.derniereTentative || Date.now() - this.statut.derniereTentative > p) this.actualiser({ raison: 'retour' });
    });
    this.horloge = setInterval(() => this.majStatut(), 15000);
  }

  planifier() {
    clearTimeout(this.minuteur);
    if (!this.connecteur.actualisable(this.cfg)) return;
    const s = Math.max(10, Number(this.cfg.donnees.actualisation) || 120);
    this.minuteur = setTimeout(() => {
      if (document.hidden) { this.planifier(); return; }
      this.actualiser({ raison: 'auto' });
    }, s * 1000);
    this.prochaine = Date.now() + s * 1000;
  }

  async actualiser({ raison = 'manuel' } = {}) {
    if (this.enCours) return;
    this.enCours = true;
    this.statut.derniereTentative = Date.now();
    const cle = JSON.stringify(this.filtres);
    const memesFiltres = cle === this.cleFiltres;
    this.emettre('chargement', { raison });
    try {
      const snap = await this.connecteur.charger(this.filtres, this.cfg);
      if (!snap) {
        if (!memesFiltres) this.appliquer(null, { memesFiltres, raison });
        this.statut.etat = 'indisponible';
        this.statut.erreur = memesFiltres && this.snap
          ? 'La source ne contient plus de données pour ce filtre : dernières valeurs connues conservées.'
          : 'Aucune donnée disponible pour cette date, période et équipe.';
      } else {
        this.statut.derniereReussite = Date.now();
        this.statut.erreur = null;
        this.appliquer(snap, { memesFiltres, raison });
        this.statut.etat = 'ok';
      }
      this.cleFiltres = cle;
    } catch (e) {
      console.warn('Actualisation impossible :', e);
      if (!memesFiltres) { this.appliquer(null, { memesFiltres, raison }); this.cleFiltres = cle; }
      this.statut.etat = this.snap ? 'interrompue' : 'indisponible';
      this.statut.erreur = e.message || String(e);
    } finally {
      this.enCours = false;
      this.majStatut();
      this.planifier();
    }
  }

  /** Recalcule indicateurs et alertes sans recharger (changement de seuils). */
  recalculer() {
    this.appliquer(this.snap, { memesFiltres: true, raison: 'recalcul', silencieux: true });
  }

  appliquer(snap, { memesFiltres, raison, silencieux = false }) {
    const avant = { m: this.m, alertes: this.alertes };
    this.snap = snap;
    this.m = calculer(snap, this.cfg, this.filtres, new Date());
    this.alertes = evaluer(this.m, this.cfg);
    this.zones = etatsZones(this.m, this.alertes);
    const premier = !avant.m;
    const comparer = memesFiltres && !premier && !silencieux && avant.m?.disponible;
    const nouv = comparer ? nouvelles(avant.alertes, this.alertes) : [];
    this.emettre('donnees', { m: this.m, alertes: this.alertes, zones: this.zones, snap, premier, transition: comparer || raison === 'reglages', raison });
    if (nouv.length) this.emettre('nouvellesAlertes', nouv);
    // Objectif franchi entre deux actualisations successives du même filtre
    const a = avant.m?.lignes;
    const b = this.m?.lignes;
    if (comparer && a && b && b.objectif && a.valeur !== null && b.valeur !== null && a.valeur < a.objectif && b.valeur >= b.objectif) {
      const cle = `pick-mc/objectif/${JSON.stringify(this.filtres)}`;
      let deja = false;
      try { deja = !!sessionStorage.getItem(cle); sessionStorage.setItem(cle, '1'); } catch { /* rien */ }
      if (!deja) this.emettre('objectif', { valeur: b.valeur, objectif: b.objectif });
    }
  }

  /** Ancienneté des données : seulement pour une période qui contient aujourd'hui. */
  majStatut() {
    const s = this.statut;
    const genere = this.snap?.meta?.genereLe ? new Date(this.snap.meta.genereLe) : null;
    s.ageDonnees = genere && !Number.isNaN(genere.getTime()) ? (Date.now() - genere.getTime()) / 60000 : null;
    const auj = isoDate(new Date());
    const contientAuj = joursDePeriode(this.filtres.date, this.filtres.periode).includes(auj);
    if (s.etat === 'ok' || s.etat === 'ancienne') {
      const tropVieux = contientAuj && s.ageDonnees !== null && s.ageDonnees > this.cfg.donnees.seuilAncien;
      const pasActualise = s.derniereReussite && this.connecteur.actualisable(this.cfg)
        && Date.now() - s.derniereReussite > Math.max(this.cfg.donnees.seuilAncien * 60000, this.cfg.donnees.actualisation * 3000);
      s.etat = tropVieux || (contientAuj && pasActualise) ? 'ancienne' : 'ok';
    }
    s.source = this.connecteur.libelle(this.cfg);
    s.demo = this.cfg.donnees.source === 'demo';
    s.genere = genere;
    s.prochaine = this.prochaine;
    this.emettre('statut', s);
  }
}
