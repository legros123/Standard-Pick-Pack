/* Tiroir latéral : détail d'un indicateur, d'une alerte, d'une zone,
   liste des alertes, réglages. Retour à la vue principale évident. */
import { ICONES, puceEtat } from './icones.js';
import { el } from './dom.js';
import { ZONES, REGLES } from '../config/defauts.js';
import { echapper } from '../commun/format.js';

export class Tiroir {
  constructor(app) {
    this.voile = el('<div class="voile" hidden></div>');
    this.noeud = el(`<aside class="tiroir" role="dialog" aria-modal="true" aria-labelledby="tiroir-titre" hidden>
      <div class="tiroir-tete">
        <button class="tiroir-retour pressable" type="button" data-fermer>${ICONES.retour}<span>Vue principale</span></button>
        <div class="tiroir-titre"><span class="c"></span><span class="t" id="tiroir-titre"></span></div>
        <button class="tiroir-fermer pressable" type="button" data-fermer aria-label="Fermer">${ICONES.fermer}</button>
      </div>
      <div class="tiroir-onglets"></div>
      <div class="tiroir-corps"></div>
    </aside>`);
    app.appendChild(this.voile);
    app.appendChild(this.noeud);
    this.corps = this.noeud.querySelector('.tiroir-corps');
    this.onglets = this.noeud.querySelector('.tiroir-onglets');
    this.voile.addEventListener('click', () => this.fermer());
    this.noeud.addEventListener('click', (e) => {
      if (e.target.closest('[data-fermer]')) this.fermer();
    });
    this.surFermeture = null;
    this.contenu = null;
  }

  get ouvert() { return !this.noeud.hidden; }

  ouvrir({ code = '', titre = '', etat = null, corps = '', onglets = '', apres = null, type = '', cle = '' }) {
    this.contenu = { type, cle };
    this.noeud.querySelector('.c').textContent = code;
    this.noeud.querySelector('.t').textContent = titre;
    this.noeud.style.setProperty('--c', { critique: 'var(--rouge)', vigilance: 'var(--ambre)', conforme: 'var(--vert)' }[etat] || 'var(--cyan)');
    this.onglets.innerHTML = onglets;
    this.corps.innerHTML = corps;
    this.corps.scrollTop = 0;
    const deja = this.ouvert;
    this.voile.hidden = false;
    this.noeud.hidden = false;
    if (!deja) {
      void this.noeud.offsetWidth;
      this.voile.classList.add('ouvert');
      this.noeud.classList.add('ouvert');
      setTimeout(() => this.noeud.querySelector('.tiroir-retour')?.focus({ preventScroll: true }), 50);
    }
    apres?.(this.corps, this.onglets);
  }

  fermer() {
    if (!this.ouvert) return;
    this.voile.classList.remove('ouvert');
    this.noeud.classList.remove('ouvert');
    const fin = () => {
      if (this.noeud.classList.contains('ouvert')) return;
      this.noeud.hidden = true;
      this.voile.hidden = true;
    };
    setTimeout(fin, document.getElementById('app').dataset.anim === 'plein' ? 380 : 0);
    this.contenu = null;
    this.surFermeture?.();
  }
}

const tableFaits = (lignes) => `<table class="faits"><tbody>${lignes.map(([a, b]) => `<tr><th>${echapper(a)}</th><td>${echapper(b)}</td></tr>`).join('')}</tbody></table>`;

export function detailAlerte(a) {
  const zone = ZONES.find((z) => z.id === a.zone);
  return {
    type: 'alerte', cle: a.id,
    code: `ALERTE · ${zone ? `${zone.code} ${zone.nom.toUpperCase()}` : ''}`,
    titre: a.titre,
    etat: a.niveau,
    corps: `
      <div class="d-valeur">${puceEtat(a.niveau)}</div>
      <div class="d-section"><h3>Constat</h3><p><b>${echapper(a.message)}</b></p></div>
      <div class="d-section"><h3>Éléments factuels</h3>${tableFaits(a.faits)}</div>
      <div class="d-section"><h3>Règle déclenchée</h3><p class="note">${echapper(a.formule)}</p><p class="note">Seuils : ${echapper(a.seuil)}.</p>
        ${a.validee ? '<span class="badge-regle ok">● RÈGLE VALIDÉE (source)</span>' : '<span class="badge-regle av">▲ SEUIL PAR DÉFAUT — À VALIDER</span>'}</div>
      <div class="d-section"><h3>Action proposée</h3>${a.action
        ? `<div class="action">${echapper(a.action)}</div><p class="note" style="margin-top:.5rem">Action définie dans les réglages pour la règle « ${echapper(REGLES[a.regle]?.titre || a.regle)} ».</p>`
        : '<p class="note">Aucune action n’est définie pour cette règle (Réglages › Seuils & actions). Aucune action n’est donc proposée.</p>'}</div>
      ${zone ? `<button class="lien-zone pressable" type="button" data-zone="${zone.id}">${ICONES.vue}Voir la zone ${zone.code} ${zone.nom} dans le schéma</button>` : ''}`,
  };
}

export function detailListeAlertes(alertes) {
  return {
    type: 'alertes', cle: 'liste',
    code: 'ALERTES ACTIVES',
    titre: `${alertes.length} alerte${alertes.length > 1 ? 's' : ''}`,
    etat: alertes.some((a) => a.niveau === 'critique') ? 'critique' : alertes.length ? 'vigilance' : 'conforme',
    corps: alertes.length
      ? `<ul class="liste-alertes">${alertes.map((a) => `<li><button class="pressable" type="button" data-alerte="${a.id}" data-etat="${a.niveau}">${ICONES[a.niveau]}<span><span class="t">${echapper(a.titre)} · ${a.niveau === 'critique' ? 'CRITIQUE' : 'VIGILANCE'}</span><br><span class="s">${echapper(a.message)}</span></span></button></li>`).join('')}</ul>
         <p class="note" style="margin-top:1rem;color:var(--texte-2)">Chaque alerte découle d’un seuil appliqué à une donnée mesurée. Aucune alerte n’est générée aléatoirement.</p>`
      : `<div class="d-valeur">${puceEtat('conforme', 'AUCUNE ALERTE')}</div><p style="margin-top:1rem">Toutes les règles évaluées sont sous leurs seuils.</p>`,
  };
}

export function detailZone(zoneId, m, zones, resume) {
  const z = ZONES.find((x) => x.id === zoneId);
  const st = zones[zoneId] || { etat: 'indisponible', alertes: [] };
  const r = resume?.[zoneId];
  const lignes = {
    preparation: m?.disponible ? [['Lignes préparées', m.lignes.valeur], ['Cadence dernière heure', m.lignes.cadence !== null ? `${m.lignes.cadence} lignes/h` : 'indisponible'], ['Préparateurs présents', m.effectif.preparateurs ?? 'indisponible'], ['Charge restante', m.charge.valeur ?? 'indisponible']] : [],
    convoyeur: m?.disponible ? [['Colis contrôlés (entrés sur le convoyeur)', m.production.controles ?? 'indisponible'], ['Débit dernière heure', m.production.debit !== null ? `${m.production.debit} colis/h` : 'indisponible'], ['Débit moyen du poste', m.production.debitMoyen !== null ? `${Math.round(m.production.debitMoyen)} colis/h` : 'indisponible']] : [],
    controle: m?.disponible ? [['Colis contrôlés', m.rejets.controles ?? 'indisponible'], ['Taux de rejet (période)', m.rejets.taux !== null ? `${(m.rejets.taux * 100).toFixed(1).replace('.', ',')} %` : 'indisponible'], ['Erreurs décelées', m.qualite.erreurs ?? 'indisponible'], ['PPM décelée', m.qualite.ppm ?? 'indisponible']] : [],
    rejet: m?.disponible ? [['Colis rejetés (période)', m.rejets.valeur ?? 'indisponible'], ['En attente au poste de rejet', m.rejets.attente ?? 'indisponible']] : [],
    expedition: m?.disponible ? [['Colis produits vers l’expédition', m.production.valeur ?? 'indisponible'], ['Objectif colis', m.production.objectif ?? 'non défini']] : [],
  }[zoneId] || [];
  return {
    type: 'zone', cle: zoneId,
    code: `ZONE ${z.code} · SCHÉMA DU FLUX`,
    titre: z.nom,
    etat: st.etat,
    corps: `
      <div class="d-valeur">${r ? `<span class="v">${r[0]}</span><span class="u">${r[1]}</span>` : ''}${puceEtat(st.etat)}</div>
      <div class="d-section"><h3>Détail opérationnel</h3>${lignes.length ? tableFaits(lignes.map(([a, b]) => [a, typeof b === 'number' ? new Intl.NumberFormat('fr-FR').format(b) : b])) : '<p>Données indisponibles.</p>'}</div>
      <div class="d-section"><h3>Alertes de la zone</h3>${st.alertes.length
        ? `<ul class="liste-alertes">${st.alertes.map((a) => `<li><button class="pressable" type="button" data-alerte="${a.id}" data-etat="${a.niveau}">${ICONES[a.niveau]}<span><span class="t">${echapper(a.titre)}</span><br><span class="s">${echapper(a.message)}</span></span></button></li>`).join('')}</ul>`
        : `<p>${st.etat === 'indisponible' ? 'État indisponible : la donnée de base de cette zone manque.' : 'Aucune alerte : zone conforme aux seuils.'}</p>`}</div>
      <div class="d-section"><h3>À propos du schéma</h3><p class="note">Schéma du flux, sans reproduction de l’implantation réelle. Les colis animés illustrent le débit agrégé de la période ; ils ne représentent ni une localisation ni un suivi individuel.</p></div>`,
  };
}
