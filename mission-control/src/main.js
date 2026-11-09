/* ════════════════════════════════════════════════════════════════════
   PICK // MISSION CONTROL — assemblage de l'application
   ════════════════════════════════════════════════════════════════════ */
import { chargerReglages } from './config/reglages.js';
import { Pilote } from './app/pilote.js';
import { priorites, resumeZones } from './donnees/regles.js';
import { isoDate, joursDePeriode, enMinutes, minutesDuJour } from './donnees/temps.js';
import { el, animation } from './ui/dom.js';
import { ICONES } from './ui/icones.js';
import { Entete } from './ui/entete.js';
import { KPIS, CarteIndicateur, detailIndicateur } from './ui/indicateurs.js';
import { ModuleCourbe, ModuleProgression, ModulePriorites } from './ui/bas.js';
import { Tiroir, detailAlerte, detailListeAlertes, detailZone } from './ui/tiroir.js';
import { Reglages } from './ui/reglages.js';
import { Filtres } from './ui/filtres.js';
import { Briefing } from './ui/briefing.js';
import { Notifications } from './ui/notifications.js';
import { Etiquettes } from './scene/etiquettes.js';
import { Schema2D } from './scene/schema2d.js';
import { ilYa, heureMinSec, nombre } from './commun/format.js';

function demarrer() {
  const { reglages, url, memorises } = chargerReglages();
  reglages.affichage.mode = url.reglages.affichage?.mode || 'exploitation';
  const app = document.getElementById('app');
  app.classList.add('ouverture');
  app.dataset.mode = reglages.affichage.mode;
  animation.regler(reglages.affichage.animations);

  const pilote = new Pilote(reglages, url.filtres, url.heureForcee, memorises);
  const etat = { m: null, alertes: [], zones: {}, snap: null, resume: {}, scene: null, sceneType: null };

  /* ─────────── structure ─────────── */
  const grille = el('<main class="grille"></main>');
  const colG = el('<section class="col col-g" aria-label="Indicateurs : préparation"></section>');
  const colD = el('<section class="col col-d" aria-label="Indicateurs : production et qualité"></section>');
  const cadre = el(`<section class="scene-cadre" aria-label="Schéma 3D du flux Pick & Pack">
    <canvas aria-hidden="true"></canvas>
    <div class="scene-bandeau">
      <div class="scene-titre"><span class="t">SCHÉMA DU FLUX · PRÉPARATION → EXPÉDITION</span><span class="s">Implantation non représentative · colis animés : illustration du débit agrégé</span><span class="avis"></span></div>
      <div class="scene-legende"><span style="color:var(--vert)">${ICONES.conforme}Conforme</span><span style="color:var(--ambre)">${ICONES.vigilance}Vigilance</span><span style="color:var(--rouge)">${ICONES.critique}Critique</span><span style="color:var(--gris)">${ICONES.indisponible}Indisponible</span></div>
    </div>
    <div class="scene-pied"><span class="flux-etat"></span><span class="perf"></span></div>
    <button class="vue-generale pressable" type="button" hidden>${ICONES.vue}Vue générale</button>
    <div class="scene-message" hidden><div><div class="t"></div><div class="s"></div></div></div>
  </section>`);
  const bas = el('<section class="bas" aria-label="Production et priorités"></section>');
  grille.append(colG, cadre, colD, bas);
  app.appendChild(grille);
  [['scene', cadre], ['colg', colG], ['cold', colD], ['bas', bas]].forEach(([n, x]) => { x.style.viewTransitionName = n; });

  const tiroir = new Tiroir(app);
  const filtres = new Filtres(app, pilote);
  const notifications = new Notifications(cadre, (id) => ouvrirAlerte(id));
  const etiquettes = new Etiquettes(cadre, (id) => ouvrirZone(id));
  const avis = cadre.querySelector('.avis');
  const fluxEtat = cadre.querySelector('.flux-etat');
  const perf = cadre.querySelector('.perf');
  const boutonVue = cadre.querySelector('.vue-generale');
  const message = cadre.querySelector('.scene-message');

  /* ─────────── indicateurs ─────────── */
  const cartes = KPIS.map((d, i) => {
    const c = new CarteIndicateur(d, i + 1);
    (d.col === 'g' ? colG : colD).appendChild(c.noeud);
    c.noeud.addEventListener('click', () => ouvrirKpi(d.id));
    return c;
  });
  const courbe = new ModuleCourbe(bas, (id) => ouvrirKpi(id));
  const progression = new ModuleProgression(bas, (id) => ouvrirKpi(id));
  const prioritesMod = new ModulePriorites(bas, (id) => ouvrirAlerte(id), () => reglagesPanneau.ouvrir('briefing'));
  const briefing = new Briefing(grille, {
    ouvrirKpi: (id) => ouvrirKpi(id),
    ouvrirAlerte: (id) => ouvrirAlerte(id),
    modifier: () => reglagesPanneau.ouvrir('briefing'),
  });
  briefing.noeud.style.viewTransitionName = 'briefing';

  /* ─────────── scène : 3D ou repli 2D ─────────── */
  const canvas = cadre.querySelector('canvas');
  async function monterScene() {
    const veut3d = pilote.cfg.affichage.rendu === '3d' && url.webgl;
    if (etat.scene) {
      if ((etat.sceneType === '3d') === veut3d) return;
      etat.scene.liberer?.();
      etat.scene.c?.remove();
      etat.scene = null;
    }
    let raison = '';
    if (veut3d) {
      try {
        const { Scene3D, webglDisponible } = await import('./scene/scene3d.js');
        if (!webglDisponible()) throw new Error('WebGL2 non pris en charge');
        const s = new Scene3D(canvas, cadre, {
          surZone: (id) => ouvrirZone(id),
          surCamera: (p) => etiquettes.positions(p),
          surQualite: (q) => {
            if (q.perdu) { raison = 'Contexte 3D perdu'; basculer2D('3D INTERROMPUE PAR LE NAVIGATEUR · SCHÉMA 2D'); return; }
            perf.textContent = pilote.cfg.affichage.perf ? (q.info || '') : '';
            reglagesPanneau?.t.contenu?.cle === 'affichage' && reglagesPanneau.rafraichir();
          },
        });
        s.reglerAnimation(animation.niveau);
        s.init();
        s.reglerQualite(pilote.cfg.affichage.qualite);
        s.reglerMode(app.dataset.mode);
        canvas.hidden = false;
        etat.scene = s;
        etat.sceneType = '3d';
        new ResizeObserver(() => s.redimensionner()).observe(cadre);
        if (animation.plein && !etat.reveleFait) s.revele();
        etat.reveleFait = true;
        appliquerDonneesScene();
        return;
      } catch (e) {
        console.warn('3D indisponible :', e);
        raison = '3D INDISPONIBLE SUR CET ÉCRAN · SCHÉMA 2D';
      }
    } else raison = url.webgl ? 'SCHÉMA 2D (RÉGLAGES)' : 'SCHÉMA 2D (3D DÉSACTIVÉE PAR L’ADRESSE)';
    basculer2D(raison);
  }

  function basculer2D(raison) {
    if (etat.scene && etat.sceneType === '3d') etat.scene.liberer();
    canvas.hidden = true;
    const s = new Schema2D(cadre, { surZone: (id) => ouvrirZone(id) });
    cadre.insertBefore(s.c, canvas.nextSibling);
    etat.scene = s;
    etat.sceneType = '2d';
    etat.raison2d = raison;
    const placer = () => etiquettes.positions(s.ancres(cadre.clientWidth, cadre.clientHeight));
    new ResizeObserver(placer).observe(cadre);
    placer();
    appliquerDonneesScene();
  }

  /* ─────────── détails ─────────── */
  function masqueDroit() {
    if (!tiroir.ouvert && !tiroirVaOuvrir) return 0;
    const r = cadre.getBoundingClientRect();
    const largeurTiroir = Math.min(window.innerWidth, parseFloat(getComputedStyle(document.documentElement).fontSize) * 46);
    return Math.max(0, r.right - (window.innerWidth - largeurTiroir));
  }
  let tiroirVaOuvrir = false;

  function ouvrirKpi(id) {
    const d = detailIndicateur(id, etat.m, etat.alertes, pilote.cfg, etat.snap, pilote.statut);
    tiroir.ouvrir({ ...d, type: 'kpi', cle: id });
  }
  function ouvrirAlerte(id) {
    const a = etat.alertes.find((x) => x.id === id);
    if (!a) { notifications.info('Cette alerte n’est plus active à la dernière actualisation.'); return; }
    tiroir.ouvrir(detailAlerte(a));
  }
  function ouvrirListeAlertes() { tiroir.ouvrir(detailListeAlertes(etat.alertes)); }
  function ouvrirZone(id) {
    tiroirVaOuvrir = true;
    if (app.dataset.mode === 'briefing') changerMode('exploitation');
    etat.scene?.zoomZone(id, false, masqueDroit());
    etiquettes.activer(id);
    boutonVue.hidden = etat.sceneType !== '3d';
    tiroir.ouvrir(detailZone(id, etat.m, etat.zones, etat.resume));
    tiroirVaOuvrir = false;
  }
  function vueGenerale() {
    etat.scene?.vueGenerale();
    etiquettes.activer(null);
    boutonVue.hidden = true;
  }
  tiroir.surFermeture = () => { if (etat.scene?.zoneActive || !boutonVue.hidden) vueGenerale(); };
  boutonVue.addEventListener('click', () => { tiroir.fermer(); vueGenerale(); });
  tiroir.noeud.addEventListener('click', (e) => {
    const a = e.target.closest('[data-alerte]');
    if (a) { ouvrirAlerte(a.dataset.alerte); return; }
    const z = e.target.closest('[data-zone]');
    if (z && !e.target.closest('.tiroir-tete')) ouvrirZone(z.dataset.zone);
  });

  /* ─────────── réglages ─────────── */
  const reglagesPanneau = new Reglages(tiroir, pilote, {
    get scene() { return etat.scene; },
    surReglage: (chemin, v) => {
      if (chemin === 'affichage.qualite') etat.scene?.reglerQualite?.(v);
      if (chemin === 'affichage.rendu') monterScene();
      if (chemin === 'affichage.animations') reglerAnimations(v);
      if (chemin === 'affichage.perf') perf.textContent = v ? etat.scene?.infoQualite?.() || '' : '';
      if (chemin.startsWith('briefing')) rendre(false);
      if (chemin === 'donnees.source') entete.majDemo(v === 'demo', etat.snap);
    },
  });

  function reglerAnimations(choix) {
    animation.regler(choix);
    etat.scene?.reglerAnimation?.(animation.niveau);
    entete.majAnimations(animation.niveau);
  }

  /* ─────────── modes ─────────── */
  function changerMode(mode) {
    if (app.dataset.mode === mode) return;
    const appliquer = () => {
      app.dataset.mode = mode;
      entete.majMode(mode);
      if (mode === 'briefing') { tiroir.fermer(); }
      etat.scene?.reglerMode?.(mode);
      if (mode !== 'briefing') { etat.scene?.redimensionner?.(); }
    };
    if (document.startViewTransition && animation.plein) document.startViewTransition(appliquer);
    else appliquer();
  }

  function pleinEcran() {
    const d = document;
    if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    else {
      const e = d.documentElement;
      const f = e.requestFullscreen || e.webkitRequestFullscreen;
      if (f) Promise.resolve(f.call(e)).catch(() => notifications.info('Plein écran refusé par le navigateur.'));
      else notifications.info('Plein écran non pris en charge par ce navigateur.');
    }
  }

  const entete = new Entete(app, {
    mode: changerMode,
    filtres: (b) => filtres.basculer(b),
    actualiser: () => pilote.actualiser({ raison: 'manuel' }),
    alertes: ouvrirListeAlertes,
    animations: () => {
      const actuel = pilote.cfg.affichage.animations;
      const v = animation.niveau === 'off' ? (etat.animAvant && etat.animAvant !== 'suspendues' ? etat.animAvant : 'auto') : 'suspendues';
      etat.animAvant = actuel;
      pilote.regler({ affichage: { animations: v } });
      reglerAnimations(v);
    },
    'plein-ecran': pleinEcran,
    reglages: () => reglagesPanneau.ouvrir(),
  });
  entete.majMode(app.dataset.mode);
  entete.majAnimations(animation.niveau);
  entete.majFiltres(pilote.filtres, pilote.cfg);
  window.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change', () => reglerAnimations(pilote.cfg.affichage.animations));

  /* ─────────── données → affichage ─────────── */
  function fluxActif(m) {
    if (!m?.disponible) return false;
    if (m.estJour) return !!m.enCours && m.heure !== null && m.fenetre && m.heure >= m.fenetre.debut;
    const auj = isoDate(new Date());
    if (!joursDePeriode(pilote.filtres.date, pilote.filtres.periode).includes(auj)) return false;
    const h = enMinutes(etat.snap?.meta?.heure) ?? minutesDuJour(new Date());
    return m.fenetre && h >= m.fenetre.debut && h < m.fenetre.fin;
  }

  function appliquerDonneesScene() {
    const s = etat.scene;
    if (!s) return;
    const m = etat.m;
    s.majEtats(etat.zones);
    const actif = fluxActif(m);
    s.majFlux({
      actif,
      debit: m?.disponible ? (m.production.debit ?? m.production.debitMoyen) : null,
      taux: m?.disponible ? (m.rejets.recent?.taux ?? m.rejets.taux) : null,
      attente: m?.disponible ? m.rejets.attente : 0,
    });
    let txt;
    if (!m?.disponible) txt = 'FLUX : DONNÉES INDISPONIBLES';
    else if (actif) txt = `FLUX ILLUSTRÉ · DÉBIT ${m.production.debit !== null ? `${nombre(m.production.debit)} COLIS/H (DERNIÈRE HEURE)` : 'MOYEN DE LA PÉRIODE'} · REJET ${m.rejets.recent ? `${nombre(m.rejets.recent.taux * 100, 1)} %` : m.rejets.taux !== null ? `${nombre(m.rejets.taux * 100, 1)} %` : '—'}`;
    else txt = m.estJour && m.heure !== null && m.fenetre && m.heure < m.fenetre.debut ? 'FLUX À L’ARRÊT · AVANT LA PRISE DE POSTE' : 'VUE HISTORIQUE · FLUX FIGÉ (PÉRIODE TERMINÉE)';
    fluxEtat.textContent = etat.sceneType === '2d' && etat.raison2d ? `${etat.raison2d} · ${txt}` : txt;
  }

  function rendre(transition) {
    const { m, alertes } = etat;
    const premier = !etat.dejaRendu && !!m?.disponible;
    const depuisZero = premier && animation.plein && performance.now() < 4000;
    cartes.forEach((c) => c.maj(m, alertes, { depuisZero, cfg: pilote.cfg }));
    courbe.maj(m, { animer: !premier });
    progression.maj(m, alertes, { depuisZero });
    prioritesMod.maj(priorites(alertes, pilote.cfg.briefing.priorites, 'moment'), !!m?.disponible);
    briefing.maj(m, alertes, priorites(alertes, pilote.cfg.briefing.priorites, 'jour'), pilote.cfg, pilote.filtres);
    etat.resume = resumeZones(m);
    etiquettes.maj(etat.zones, etat.resume);
    entete.majAlertes(alertes);
    entete.majDemo(pilote.cfg.donnees.source === 'demo', etat.snap);
    appliquerDonneesScene();
    message.hidden = !!m?.disponible;
    if (!m?.disponible) {
      const charge = pilote.statut.etat === 'chargement';
      message.querySelector('.t').textContent = charge ? 'CHARGEMENT DES DONNÉES…' : 'DONNÉES INDISPONIBLES';
      message.querySelector('.s').textContent = charge ? pilote.connecteur.libelle(pilote.cfg) : (pilote.statut.erreur || 'Aucune donnée pour cette date, période et équipe.');
    }
    // tiroir ouvert : on met à jour son contenu sans le fermer
    const c = tiroir.contenu;
    if (tiroir.ouvert && c && !transition) {
      if (c.type === 'kpi') ouvrirKpi(c.cle);
      else if (c.type === 'alertes') ouvrirListeAlertes();
      else if (c.type === 'zone') tiroir.ouvrir(detailZone(c.cle, etat.m, etat.zones, etat.resume));
      else if (c.type === 'alerte' && etat.alertes.some((a) => a.id === c.cle)) ouvrirAlerte(c.cle);
    }
    if (m?.disponible) etat.dejaRendu = true;
  }

  pilote.on('donnees', ({ m, alertes, zones, snap, transition }) => {
    Object.assign(etat, { m, alertes, zones, snap });
    rendre(false);
    if (transition === false && tiroir.contenu?.type === 'reglages') reglagesPanneau.rafraichir();
  });
  pilote.on('nouvellesAlertes', (liste) => {
    liste.slice(0, 3).forEach((a, i) => setTimeout(() => {
      notifications.alerte(a);
      etat.scene?.impulsion?.(a.zone, a.niveau);
      etiquettes.flash(a.zone);
    }, i * 600));
  });
  pilote.on('objectif', ({ valeur, objectif }) => {
    notifications.celebration(valeur, objectif);
    etat.scene?.celebrer?.();
    cartes.find((c) => c.def.id === 'lignes')?.celebrer();
  });
  pilote.on('chargement', () => entete.majChargement(true));
  pilote.on('statut', (s) => {
    entete.majChargement(false);
    entete.majStatut(s);
    const ok = s.derniereReussite ? heureMinSec(new Date(s.derniereReussite)) : '—';
    avis.innerHTML = s.etat === 'interrompue' ? `<span class="etat" data-etat="critique">${ICONES.coupe}<span>CONNEXION INTERROMPUE · DERNIÈRES VALEURS CONNUES ${ok}</span></span>`
      : s.etat === 'ancienne' ? `<span class="etat" data-etat="vigilance">${ICONES.ancien}<span>DONNÉES ANCIENNES · EXTRAITES ${s.genere ? ilYa(s.genere).toUpperCase() : ''}</span></span>`
        : s.etat === 'indisponible' && etat.m?.disponible ? `<span class="etat" data-etat="indisponible">${ICONES.vide}<span>DONNÉES INDISPONIBLES · VALEURS DE ${ok}</span></span>` : '';
    if (!etat.m?.disponible && s.etat !== 'chargement') {
      message.querySelector('.t').textContent = 'DONNÉES INDISPONIBLES';
      message.querySelector('.s').textContent = s.erreur || 'Aucune donnée pour cette date, période et équipe.';
    }
  });
  pilote.on('filtres', (f) => { entete.majFiltres(f, pilote.cfg); etat.dejaRenduFiltre = true; });
  pilote.on('reglages', () => entete.majFiltres(pilote.filtres, pilote.cfg));

  /* ─────────── clavier ─────────── */
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select')) return;
    if (e.key === 'Escape') { filtres.fermer(); tiroir.fermer(); vueGenerale(); }
    else if (e.key === '1') changerMode('exploitation');
    else if (e.key === '2') changerMode('immersion');
    else if (e.key === '3') changerMode('briefing');
    else if (e.key === 'f' || e.key === 'F') pleinEcran();
    else if (e.key === 'r' || e.key === 'R') pilote.actualiser({ raison: 'manuel' });
    else if (e.key === ' ') { e.preventDefault(); entete.actions.animations(); }
  });

  /* ─────────── démarrage ─────────── */
  rendre(false);
  monterScene();
  pilote.demarrer();
  setTimeout(() => app.classList.remove('ouverture'), 1900);
  window.PickMC = { pilote, etat, changerMode, ouvrirZone, vueGenerale };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
else demarrer();
