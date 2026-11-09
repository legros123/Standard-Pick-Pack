/* ════════════════════════════════════════════════════════════════════
   CONFIGURATION PAR DÉFAUT — PICK // MISSION CONTROL
   Tous ces réglages sont modifiables dans le panneau « Réglages »
   (mémorisés sur l'appareil) ou directement ici avant compilation.

   validee: true  → règle reprise d'une source validée (classeur
                    Suivi_Op_PP_OFFICIEL, onglet PARAMETRES, ou script
                    outils/bilan_mensuel.py).
   validee: false → valeur proposée par défaut, À VALIDER par le
                    superviseur avant usage en exploitation.
   ════════════════════════════════════════════════════════════════════ */

export const VERSION = '1.0.0';

export const SITE = {
  entreprise: 'Rexel',
  site: 'CLR Champigneulles',
  service: 'Pick & Pack',
};

/** Les 18 standards du service (application Standards, ../index.html). */
export const STANDARDS = [
  ['P1', 'Prise de poste', 'La sécurité commence avant la production.'],
  ['P2', 'Consommables', 'Le bon contenant, au bon moment.'],
  ['P3', 'Affectation & montage chariot', "Bien s'affecter, bien monter."],
  ['P4', 'Préparation détail', 'Bien lire, bien prélever, bien coller.'],
  ['P5', 'Préparation carton', 'Bien trier, bien insérer, bien expédier.'],
  ['P6', 'Préparation retract', 'Sécuriser chaque palette avant de gerber.'],
  ['P7', 'Changement de contenants', 'Le bon carton, dès le départ.'],
  ['P8', 'Ruptures & validation', 'Une rupture saisie = un colis conforme.'],
  ['P9', 'Gestion des déchets', 'Trier juste. Évacuer net.'],
  ['P10', 'Circulation & sécurité', 'Chaque déplacement compte.'],
  ['P11', 'Fin de poste', "Une zone prête pour l'équipe suivante."],
  ['P12', 'Aérosol & batterie', 'Produits à risque — zéro tolérance sur le conditionnement.'],
  ['P13', 'Préparation monolignes', 'Une étiquette, un article, un C16.'],
  ['P14', 'Les interdits', 'Les règles internes à respecter dans le CLR.'],
  ['P15', 'Changement de batterie (Togger)', 'Manipuler le Togger avec rigueur et sécurité.'],
  ['P16', 'Les composés', 'Prélever les composés avec précision en allée 11.'],
  ['P17', 'Sécurité incendie', 'Évacuer, alerter, intervenir — chacun son rôle.'],
  ['P18', 'Sécurité au quotidien', 'Signaler, circuler, protéger — chaque jour dans le CLR.'],
].map(([id, titre, sous]) => ({ id, titre, sous }));

/** Les 5 zones du schéma de flux (identifiants utilisés partout). */
export const ZONES = [
  { id: 'preparation', code: 'Z1', nom: 'Préparation', court: 'PRÉPA' },
  { id: 'convoyeur', code: 'Z2', nom: 'Convoyeur', court: 'CONVOYEUR' },
  { id: 'controle', code: 'Z3', nom: 'Contrôle', court: 'CONTRÔLE' },
  { id: 'rejet', code: 'Z4', nom: 'Rejet', court: 'REJET' },
  { id: 'expedition', code: 'Z5', nom: 'Expédition', court: 'EXPÉ' },
];

export const DEFAUTS = {
  affichage: {
    mode: 'exploitation',        // exploitation | immersion | briefing
    qualite: 'auto',             // auto | haute | moyenne | basse
    rendu: '3d',                 // 3d | 2d
    animations: 'auto',          // auto (suit la préférence système) | actives | reduites | suspendues
    perf: false,                 // affiche le compteur d'images / seconde
  },

  donnees: {
    source: 'demo',              // demo | script | json | csv | fichier
    fichier: 'donnees/pick_data.js',   // mode « script » : fichier JS déposé à côté de l'application
    variable: 'PICK_MC_DATA',    // variable globale renseignée par ce fichier
    url: '',                     // modes « json » / « csv » : adresse http(s) du fichier
    actualisation: 120,          // secondes entre deux actualisations
    seuilAncien: 10,             // minutes : au-delà, les données sont « anciennes »
    csv: {                       // correspondance colonnes CSV → champs (voir donnees/LISEZMOI.md)
      separateur: 'auto',
      colonnes: {
        horodatage: 'heure',
        lignes: 'lignes',
        colis: 'colis_controles',
        produits: 'colis_expedies',
        rejets: 'rejets',
        erreurs: 'erreurs_decelees',
        charge: 'charge_restante',
        attente: 'attente_rejet',
        effectif: 'effectif_present',
        effectifPrevu: 'effectif_prevu',
        preparateurs: 'preparateurs',
      },
    },
  },

  /** Horaires des équipes : à ajuster aux horaires réels du service. */
  equipes: [
    { id: 'matin', nom: 'Matin', debut: '06:00', fin: '13:24', pauses: [['09:30', '09:50']] },
    { id: 'apres-midi', nom: 'Après-midi', debut: '13:24', fin: '20:48', pauses: [['17:00', '17:20']] },
  ],

  objectifs: {
    quotaLignes: 620,            // lignes par jour de référence — PARAMETRES B5 (validé)
    heuresRef: 7.4,              // heures d'un jour de référence — PARAMETRES B6 (validé)
    mode: 'quota',               // quota : préparateurs présents × quota | fixe : valeur ci-dessous
    objectifFixe: 12000,         // lignes / jour si mode = fixe
    objectifColis: null,         // colis / jour (facultatif, null = non suivi)
  },

  /** Seuils des règles d'alerte. */
  seuils: {
    rythme: { vigilance: 5, critique: 12 },          // % sous le rythme attendu
    capacite: { vigilance: 100, critique: 115 },     // charge restante en % de la capacité restante estimée
    rejetTaux: { vigilance: 3, critique: 5 },        // % des colis contrôlés
    rejetAttente: { vigilance: 15, critique: 30 },   // colis en attente au poste de rejet
    ppmDecelee: { vigilance: 1000, critique: 2000, minLignes: 1000 }, // PPM décelée — vert sous 1 000 (PARAMETRES, validé)
    effectif: { vigilance: 1, critique: 3 },         // personnes absentes par rapport au prévu
    debit: { vigilance: 60 },                        // débit de la dernière heure en % du débit moyen
  },

  /** Actions proposées : affichées uniquement si renseignées (règle métier définie). */
  actions: {
    rythme: 'Vérifier les affectations et lever les blocages (ruptures, consommables) — standards P3 et P8.',
    capacite: 'Arbitrer avec le responsable : renfort, heures supplémentaires ou report de charge.',
    rejetTaux: "Analyser les motifs de rejet avec l'opérateur contrôle et rappeler le standard P5.",
    rejetAttente: 'Affecter une personne au poste de rejet jusqu’au retour sous le seuil.',
    ppmDecelee: 'Rappeler le standard P4 (bien lire, bien prélever, bien coller) aux préparateurs concernés.',
    effectif: '',
    debit: '',
  },

  briefing: {
    standard: 'P10',
    message: 'Allées dégagées, priorité aux piétons sur les passages marqués.',
    priorites: ['', '', ''],     // priorités du jour fixées par le superviseur
  },

  demo: {
    scenario: 'normal',          // normal | objectif | incident | ancienne | interrompue | vide
    horloge: 'auto',             // auto : heure réelle pendant le poste, sinon horloge simulée
  },
};

/** Métadonnées des règles (texte affiché dans les détails). */
export const REGLES = {
  rythme: {
    titre: 'Rythme de préparation',
    zone: 'preparation', kpi: 'lignes', validee: false,
    formule: 'écart = (lignes préparées − lignes attendues à cette heure) ÷ lignes attendues. Lignes attendues = objectif × temps productif écoulé ÷ temps productif total (pauses exclues).',
  },
  capacite: {
    titre: 'Charge restante / capacité',
    zone: 'preparation', kpi: 'charge', validee: false,
    formule: 'capacité restante (estimation) = préparateurs présents × (quota ÷ heures de référence) × heures productives restantes du poste.',
  },
  rejetTaux: {
    titre: 'Taux de rejet convoyeur',
    zone: 'controle', kpi: 'rejets', validee: false,
    formule: 'taux = colis rejetés ÷ colis contrôlés.',
  },
  rejetAttente: {
    titre: 'Colis en attente au rejet',
    zone: 'rejet', kpi: 'rejets', validee: false,
    formule: 'nombre de colis présents au poste de rejet au moment de l’extraction.',
  },
  ppmDecelee: {
    titre: 'Qualité décelée (PPM)',
    zone: 'controle', kpi: 'qualite', validee: true,
    formule: 'PPM décelée = erreurs décelées au rejet ÷ lignes préparées × 1 000 000 (définition du bilan mensuel). Seuil vert < 1 000 (PARAMETRES).',
  },
  effectif: {
    titre: 'Effectif présent',
    zone: 'preparation', kpi: 'effectif', validee: false,
    formule: 'absents = effectif prévu − effectif présent.',
  },
  debit: {
    titre: 'Débit convoyeur',
    zone: 'convoyeur', kpi: 'production', validee: false,
    formule: 'débit de la dernière heure complète ÷ débit horaire moyen depuis le début du poste.',
  },
};
