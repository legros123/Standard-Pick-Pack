/* Panneau Réglages : réservé aux paramètres détaillés pour garder la vue
   principale épurée. Tout est tactile (cibles ≥ 48 px équivalent). */
import { ICONES } from './icones.js';
import { STANDARDS, REGLES, DEFAUTS, VERSION } from '../config/defauts.js';
import { effacerStockage } from '../config/reglages.js';
import { inspecter } from '../donnees/connecteur.js';
import { echapper } from '../commun/format.js';

const ONGLETS = [
  ['affichage', 'Affichage'],
  ['donnees', 'Données'],
  ['seuils', 'Seuils & actions'],
  ['equipes', 'Équipes'],
  ['briefing', 'Briefing'],
  ['demo', 'Démonstration'],
  ['apropos', 'À propos'],
];

const seg = (chemin, valeur, options) => `<div class="segment" data-seg="${chemin}">${options.map(([v, l]) => `<button type="button" class="pressable" data-v="${v}" aria-pressed="${String(valeur) === String(v)}">${l}</button>`).join('')}</div>`;
const num = (chemin, valeur, attrs = '') => `<input class="saisie" type="number" inputmode="decimal" data-num="${chemin}" value="${valeur ?? ''}" ${attrs}>`;
const txt = (chemin, valeur, attrs = '') => `<input class="saisie" type="text" data-txt="${chemin}" value="${echapper(valeur ?? '')}" ${attrs}>`;
const tagV = (ok) => (ok ? '<span class="tag ok">VALIDÉ · SOURCE</span>' : '<span class="tag av">PAR DÉFAUT · À VALIDER</span>');

function patchDepuis(chemin, v) {
  const parts = chemin.split('.');
  const o = {};
  let cur = o;
  parts.slice(0, -1).forEach((k) => { cur = cur[k] = {}; });
  cur[parts[parts.length - 1]] = v;
  return o;
}

export class Reglages {
  constructor(tiroir, pilote, ctx) {
    this.t = tiroir;
    this.p = pilote;
    this.ctx = ctx;
    this.onglet = 'affichage';
    this.inspection = null;
  }

  ouvrir(onglet = this.onglet) {
    this.onglet = onglet;
    this.t.ouvrir({
      type: 'reglages', cle: onglet,
      code: 'PARAMÈTRES DE L’ÉCRAN',
      titre: 'Réglages',
      onglets: `<div class="onglets" role="tablist">${ONGLETS.map(([id, l]) => `<button class="onglet pressable" type="button" role="tab" data-onglet="${id}" aria-selected="${id === onglet}">${l}</button>`).join('')}</div>`,
      corps: this.corps(onglet),
      apres: (corps, onglets) => this.brancher(corps, onglets),
    });
  }

  rafraichir() {
    if (this.t.ouvert && this.t.contenu?.type === 'reglages') this.ouvrir(this.onglet);
  }

  corps(o) {
    const c = this.p.cfg;
    const s = this.p.statut;
    if (o === 'affichage') {
      const q = this.ctx.scene?.infoQualite?.() || '';
      return `
        <div class="champ"><span class="lib">Qualité graphique de la scène 3D</span>${seg('affichage.qualite', c.affichage.qualite, [['auto', 'Auto'], ['haute', 'Haute'], ['moyenne', 'Moyenne'], ['basse', 'Basse']])}
          <span class="aide">Auto : réduit d’abord la résolution de rendu, puis les reflets lumineux et les ombres si l’animation devient saccadée. ${q ? `État actuel : <b>${q}</b>.` : ''}</span></div>
        <div class="champ"><span class="lib">Rendu du schéma de flux</span>${seg('affichage.rendu', c.affichage.rendu, [['3d', 'Scène 3D'], ['2d', 'Schéma 2D (secours)']])}
          <span class="aide">Le schéma 2D s’active automatiquement si la 3D n’est pas prise en charge.</span></div>
        <div class="champ"><span class="lib">Animations</span>${seg('affichage.animations', c.affichage.animations, [['auto', 'Auto (préférence système)'], ['actives', 'Actives'], ['reduites', 'Réduites'], ['suspendues', 'Suspendues']])}
          <span class="aide">Réduites ou suspendues : toute l’information reste affichée, sans mouvement.</span></div>
        <div class="champ"><span class="lib">Compteur de performances (images / seconde)</span>${seg('affichage.perf', c.affichage.perf, [['false', 'Masqué'], ['true', 'Affiché']])}</div>
        <div class="champ"><span class="lib">Raccourcis clavier</span><span class="aide">1 / 2 / 3 : modes · F : plein écran · Espace : suspendre les animations · R : actualiser · Échap : vue principale.</span></div>`;
    }
    if (o === 'donnees') {
      const d = c.donnees;
      const src = d.source;
      return `
        <div class="champ"><span class="lib">Source des données</span>${seg('donnees.source', src, [['demo', 'Démonstration'], ['script', 'Fichier JS'], ['json', 'URL JSON'], ['csv', 'URL CSV'], ['fichier', 'Import manuel']])}</div>
        ${src === 'demo' ? '<div class="message-info">Données fictives générées par un modèle déterministe. Le bandeau « DONNÉES DE DÉMONSTRATION » reste affiché. Aucune donnée réelle n’est utilisée.</div>' : ''}
        ${src === 'script' ? `<div class="champ"><label>Fichier de données (chemin relatif à l’application)</label>${txt('donnees.fichier', d.fichier)}
          <span class="aide">Fonctionne aussi en ouvrant index.html directement depuis un dossier partagé. Le fichier doit contenir <code class="mono">window.${echapper(d.variable)} = { … }</code> au format normalisé (modèle : donnees/pick_data.exemple.js).</span></div>
          <div class="champ"><label>Nom de la variable globale</label>${txt('donnees.variable', d.variable)}</div>` : ''}
        ${src === 'json' || src === 'csv' ? `<div class="champ"><label>Adresse ${src.toUpperCase()} (http ou https)</label>${txt('donnees.url', d.url, 'placeholder="https://…" inputmode="url"')}
          <span class="aide">Le serveur doit autoriser la lecture depuis cette page (même site, ou en-tête CORS).</span></div>` : ''}
        ${src === 'fichier' || src === 'csv' || src === 'script' ? `<div class="champ"><span class="lib">${src === 'fichier' ? 'Fichier à importer' : 'Inspecter un fichier source'} (JSON, JS, CSV)</span>
          <label class="depot" data-depot>${ICONES.importer}<br>Glisser un fichier ici ou toucher pour le choisir<input type="file" accept=".json,.js,.csv,.txt" hidden data-fichier></label>
          <span class="aide">L’inspection montre la structure réelle du fichier (colonnes, clés, exemples) avant d’établir la correspondance avec les indicateurs. Rien n’est envoyé sur internet.</span>
          <div class="inspection">${this.htmlInspection()}</div></div>` : ''}
        ${src === 'csv' || src === 'fichier' ? `<div class="champ"><span class="lib">Correspondance des colonnes CSV</span>
          <span class="aide">Une ligne = un créneau horaire. Flux (lignes, colis, rejets, erreurs, colis expédiés) additionnés ; stocks (charge, attente, effectifs) : dernière valeur.</span>
          <div class="duo">${Object.entries(d.csv.colonnes).map(([k, v]) => `<div class="champ" style="margin-top:.3rem"><label class="mono" style="font-size:.85rem">${k}</label>${txt(`donnees.csv.colonnes.${k}`, v)}</div>`).join('')}</div></div>` : ''}
        <div class="duo">
          <div class="champ"><label>Actualisation (secondes)</label>${num('donnees.actualisation', d.actualisation, 'min="10" step="10"')}</div>
          <div class="champ"><label>Données anciennes au-delà de (minutes)</label>${num('donnees.seuilAncien', d.seuilAncien, 'min="1"')}</div>
        </div>
        <div class="rangee"><button class="bouton primaire pressable" type="button" data-cmd="actualiser">${ICONES.actualiser}Actualiser maintenant</button></div>
        <div class="message-info${s.erreur ? ' erreur' : ''}"><b>État :</b> ${echapper({ ok: 'données à jour', ancienne: 'données anciennes', interrompue: 'connexion interrompue', indisponible: 'données indisponibles', chargement: 'chargement' }[s.etat])} · ${echapper(this.p.connecteur.libelle(c))}${s.erreur ? `<br>${echapper(s.erreur)}` : ''}
          ${(this.p.snap?.avertissements || []).map((a) => `<br>▲ ${echapper(a)}`).join('')}</div>`;
    }
    if (o === 'seuils') {
      const ob = c.objectifs;
      const lignesRegle = (id, unite, critique = true) => `
        <div class="champ" style="padding-top:.8rem;border-top:1px solid var(--trait)"><span class="lib">${REGLES[id].titre} ${tagV(REGLES[id].validee)}</span>
          <span class="aide">${echapper(REGLES[id].formule)}</span>
          <div class="duo"><div class="champ" style="margin-top:.2rem"><label>Vigilance (${unite})</label>${num(`seuils.${id}.vigilance`, c.seuils[id].vigilance)}</div>
          ${critique ? `<div class="champ" style="margin-top:.2rem"><label>Critique (${unite})</label>${num(`seuils.${id}.critique`, c.seuils[id].critique)}</div>` : '<div></div>'}</div>
          <div class="champ" style="margin-top:.3rem"><label>Action proposée (laisser vide si aucune règle définie)</label>${txt(`actions.${id}`, c.actions[id])}</div></div>`;
      return `
        <div class="champ"><span class="lib">Objectif de lignes</span>${seg('objectifs.mode', ob.mode, [['quota', 'Quota × préparateurs présents'], ['fixe', 'Valeur fixe']])}
          <span class="aide">Un objectif transmis par la source est toujours prioritaire.</span></div>
        <div class="trio">
          <div class="champ"><label>Quota (lignes / jour) ${tagV(true)}</label>${num('objectifs.quotaLignes', ob.quotaLignes)}</div>
          <div class="champ"><label>Heures de référence ${tagV(true)}</label>${num('objectifs.heuresRef', ob.heuresRef, 'step="0.1"')}</div>
          <div class="champ"><label>Objectif fixe (lignes)</label>${num('objectifs.objectifFixe', ob.objectifFixe)}</div>
        </div>
        <div class="champ"><label>Objectif de colis / jour (vide = non suivi)</label>${num('objectifs.objectifColis', ob.objectifColis)}</div>
        ${lignesRegle('rythme', '% de retard')}
        ${lignesRegle('capacite', '% de la capacité')}
        ${lignesRegle('rejetTaux', '%')}
        ${lignesRegle('rejetAttente', 'colis')}
        ${lignesRegle('ppmDecelee', 'PPM')}
        <div class="champ"><label>PPM décelée : volume minimal avant évaluation (lignes)</label>${num('seuils.ppmDecelee.minLignes', c.seuils.ppmDecelee.minLignes)}</div>
        ${lignesRegle('effectif', 'absents')}
        ${lignesRegle('debit', '% du débit moyen', false)}
        <div class="rangee"><button class="bouton danger pressable" type="button" data-cmd="seuils-defaut">Rétablir les seuils par défaut</button></div>`;
    }
    if (o === 'equipes') {
      return `<p class="aide" style="margin-top:.8rem;color:var(--texte-2)">Horaires utilisés pour le rythme attendu, la capacité restante et les filtres. À ajuster aux horaires réels du service.</p>
        ${c.equipes.map((e, i) => `<div class="champ" style="padding-top:.8rem;border-top:1px solid var(--trait)"><span class="lib">Équipe ${echapper(e.nom)}</span>
          <div class="duo">
            <div class="champ" style="margin-top:.2rem"><label>Début</label><input class="saisie" type="time" data-eq="${i}.debut" value="${e.debut}"></div>
            <div class="champ" style="margin-top:.2rem"><label>Fin</label><input class="saisie" type="time" data-eq="${i}.fin" value="${e.fin}"></div>
            <div class="champ" style="margin-top:.2rem"><label>Pause : début</label><input class="saisie" type="time" data-eq="${i}.p0" value="${e.pauses?.[0]?.[0] || ''}"></div>
            <div class="champ" style="margin-top:.2rem"><label>Pause : fin</label><input class="saisie" type="time" data-eq="${i}.p1" value="${e.pauses?.[0]?.[1] || ''}"></div>
          </div></div>`).join('')}`;
    }
    if (o === 'briefing') {
      const b = c.briefing;
      return `
        <div class="champ"><label>Point sécurité : standard du jour</label>
          <select class="saisie" data-sel="briefing.standard">${STANDARDS.map((st) => `<option value="${st.id}" ${st.id === b.standard ? 'selected' : ''}>${st.id} — ${echapper(st.titre)}</option>`).join('')}</select></div>
        <div class="champ"><label>Message sécurité</label><textarea class="saisie" data-txt="briefing.message" rows="3">${echapper(b.message)}</textarea></div>
        <div class="champ"><span class="lib">Trois priorités du jour (fixées par le superviseur)</span>
          ${[0, 1, 2].map((i) => `<input class="saisie" type="text" data-prio="${i}" value="${echapper(b.priorites[i] || '')}" placeholder="Priorité ${i + 1}" style="margin-top:.4rem">`).join('')}
          <span class="aide">Vides : le briefing reprend les priorités issues des règles d’alerte. Mémorisé sur cet écran.</span></div>`;
    }
    if (o === 'demo') {
      return `
        <div class="message-info">Ces scénarios ne concernent que la démonstration. Ils permettent de présenter et de vérifier chaque état de l’écran. En exploitation, aucune alerte n’est simulée.</div>
        <div class="champ"><span class="lib">Scénario</span>${seg('demo.scenario', c.demo.scenario, [['normal', 'Journée normale'], ['objectif', 'Objectif bientôt atteint'], ['incident', 'Incident rejet'], ['ancienne', 'Données anciennes'], ['interrompue', 'Connexion interrompue'], ['vide', 'Aucune donnée']])}
          <span class="aide">« Objectif bientôt atteint » : l’objectif est franchi à l’actualisation suivante (≈ 2 min) et déclenche la célébration.</span></div>
        <div class="champ"><span class="lib">Horloge de démonstration</span>${seg('demo.horloge', c.demo.horloge, [['auto', 'Réelle pendant le poste, simulée sinon'], ['reelle', 'Toujours réelle']])}</div>`;
    }
    return `
      <div class="d-section"><h3>PICK // MISSION CONTROL</h3><p>Version ${VERSION} · format de données normalisé v1.</p>
        <p class="note">Schéma de flux illustratif ; graphiques quantitatifs en 2D ; valeurs manquantes affichées comme indisponibles ; estimations identifiées avec leur méthode.</p></div>
      <div class="d-section"><h3>Liens utiles</h3><p class="note">Paramètres d’URL : <code class="mono">?mode=briefing</code>, <code class="mono">?mode=immersion</code>, <code class="mono">?qualite=basse</code>, <code class="mono">?rendu=2d</code>, <code class="mono">?anim=suspendues</code>, <code class="mono">?equipe=matin</code>.</p></div>
      <div class="rangee"><button class="bouton danger pressable" type="button" data-cmd="tout-reinitialiser">Effacer les réglages mémorisés sur cet écran</button></div>`;
  }

  htmlInspection() {
    const i = this.inspection;
    if (!i) return '';
    let h = `<div class="message-info${i.avertissement ? ' erreur' : ''}"><b>${echapper(i.nom)}</b> · ${echapper(i.type.toUpperCase())} · ${Math.round(i.taille / 1024)} ko${i.avertissement ? `<br>▲ ${echapper(i.avertissement)}` : ''}${i.normalise ? '<br>● Format normalisé reconnu.' : ''}</div>`;
    if (i.entetes.length) {
      h += `<p class="aide" style="margin-top:.5rem">${i.nbLignes} lignes · séparateur « ${i.separateur === '\t' ? 'tabulation' : echapper(i.separateur)} » · colonnes :</p>
        <code class="code-bloc">${i.entetes.map(echapper).join(' | ')}</code>
        <table><thead><tr>${i.entetes.slice(0, 6).map((e) => `<th>${echapper(e)}</th>`).join('')}</tr></thead><tbody>${i.exemples.map((r) => `<tr>${i.entetes.slice(0, 6).map((e) => `<td>${echapper(r[e])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    }
    if (i.cles.length) {
      h += `<table><thead><tr><th>Clé</th><th>Type</th><th>Exemple</th></tr></thead><tbody>${i.cles.slice(0, 30).map((k) => `<tr><td>${echapper(k.chemin)}</td><td>${echapper(k.type)}</td><td>${echapper(k.exemple)}</td></tr>`).join('')}</tbody></table>`;
    }
    return h;
  }

  appliquer(chemin, v) {
    const recharger = chemin.startsWith('donnees.') || chemin.startsWith('demo.') || chemin.startsWith('equipes');
    this.p.regler(patchDepuis(chemin, v), { recharger });
    this.ctx.surReglage?.(chemin, v);
  }

  brancher(corps, onglets) {
    onglets.querySelectorAll('[data-onglet]').forEach((b) => b.addEventListener('click', () => this.ouvrir(b.dataset.onglet)));
    corps.querySelectorAll('[data-seg]').forEach((g) => g.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      let v = b.dataset.v;
      if (v === 'true' || v === 'false') v = v === 'true';
      this.appliquer(g.dataset.seg, v);
      if (['donnees.source', 'affichage.qualite'].includes(g.dataset.seg)) this.ouvrir(this.onglet);
      else g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }));
    corps.querySelectorAll('[data-num]').forEach((i) => i.addEventListener('change', () => {
      const brut = i.value.trim().replace(',', '.');
      const v = brut === '' ? null : Number(brut);
      if (v !== null && !Number.isFinite(v)) return;
      const chemin = i.dataset.num;
      if (chemin === 'donnees.actualisation' && v !== null && v < 10) { i.value = 10; this.appliquer(chemin, 10); return; }
      this.appliquer(chemin, v);
    }));
    corps.querySelectorAll('[data-txt]').forEach((i) => i.addEventListener('change', () => this.appliquer(i.dataset.txt, i.value)));
    corps.querySelectorAll('[data-sel]').forEach((i) => i.addEventListener('change', () => this.appliquer(i.dataset.sel, i.value)));
    corps.querySelectorAll('[data-prio]').forEach((i) => i.addEventListener('change', () => {
      const pr = [...this.p.cfg.briefing.priorites];
      pr[Number(i.dataset.prio)] = i.value;
      this.appliquer('briefing.priorites', pr);
    }));
    corps.querySelectorAll('[data-eq]').forEach((i) => i.addEventListener('change', () => {
      const [idx, champ] = i.dataset.eq.split('.');
      const eqs = JSON.parse(JSON.stringify(this.p.cfg.equipes));
      const e = eqs[Number(idx)];
      if (!i.value) return;
      if (champ === 'debut' || champ === 'fin') e[champ] = i.value;
      else {
        e.pauses = e.pauses?.length ? e.pauses : [['', '']];
        e.pauses[0][champ === 'p0' ? 0 : 1] = i.value;
        if (!e.pauses[0][0] || !e.pauses[0][1]) return;
      }
      this.p.cfg.equipes = eqs;
      this.appliquer('equipes', eqs);
    }));
    corps.querySelector('[data-cmd="actualiser"]')?.addEventListener('click', () => this.p.actualiser({ raison: 'manuel' }));
    corps.querySelector('[data-cmd="seuils-defaut"]')?.addEventListener('click', () => {
      this.p.regler({ seuils: DEFAUTS.seuils, actions: DEFAUTS.actions, objectifs: DEFAUTS.objectifs });
      this.ouvrir('seuils');
    });
    corps.querySelector('[data-cmd="tout-reinitialiser"]')?.addEventListener('click', () => {
      effacerStockage();
      window.location.reload();
    });
    const depot = corps.querySelector('[data-depot]');
    if (depot) {
      const lire = (f) => {
        if (!f) return;
        const r = new FileReader();
        r.onload = () => {
          const texte = String(r.result || '');
          this.inspection = inspecter(f.name, texte);
          if (this.p.cfg.donnees.source === 'fichier') {
            this.p.connecteur.importe = { nom: f.name, texte, date: f.lastModified ? new Date(f.lastModified).toISOString() : null };
            this.p.actualiser({ raison: 'import' }).then(() => this.ouvrir('donnees'));
          } else this.ouvrir('donnees');
        };
        r.readAsText(f, /\.csv$|\.txt$/i.test(f.name) ? 'utf-8' : 'utf-8');
      };
      depot.querySelector('input').addEventListener('change', (e) => lire(e.target.files[0]));
      depot.addEventListener('dragover', (e) => { e.preventDefault(); depot.classList.add('survol'); });
      depot.addEventListener('dragleave', () => depot.classList.remove('survol'));
      depot.addEventListener('drop', (e) => { e.preventDefault(); depot.classList.remove('survol'); lire(e.dataTransfer.files[0]); });
    }
  }
}
