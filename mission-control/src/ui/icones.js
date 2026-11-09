/* Pictogrammes : trait 1,75, coins arrondis, évoquent le métier
   (rayonnage, colis, convoyeur, portique de contrôle, aiguillage…). */
const svg = (corps, vb = '0 0 24 24') =>
  `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${corps}</svg>`;

export const ICONES = {
  logo: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <defs><linearGradient id="lg-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a5eeff"/><stop offset="1" stop-color="#1aa7d6"/></linearGradient></defs>
    <circle cx="32" cy="32" r="29" fill="none" stroke="#3cd6ff" stroke-opacity=".28" stroke-width="1.5"/>
    <path d="M32 3 a29 29 0 0 1 25.1 14.5" fill="none" stroke="#3cd6ff" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M32 61 a29 29 0 0 1 -25.1 -14.5" fill="none" stroke="#3cd6ff" stroke-opacity=".6" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M32 15 L47 23.5 V40.5 L32 49 L17 40.5 V23.5 Z" fill="url(#lg-a)" fill-opacity=".14" stroke="url(#lg-a)" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M17 23.5 L32 32 L47 23.5 M32 32 V49" fill="none" stroke="url(#lg-a)" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M24.5 19.2 L39.5 27.7" stroke="#eef7ff" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="57.1" cy="17.5" r="2.6" fill="#eef7ff"/>
  </svg>`,
  preparation: svg('<path d="M3 21V4M21 21V4M3 9h18M3 15h18"/><rect x="6" y="5.5" width="4" height="3.5" rx=".5"/><rect x="12.5" y="11" width="5" height="4" rx=".5"/><rect x="6" y="16.5" width="5" height="4.5" rx=".5"/>'),
  colis: svg('<path d="M12 2.8 20.5 7.4v9.2L12 21.2 3.5 16.6V7.4Z"/><path d="m3.5 7.4 8.5 4.6 8.5-4.6M12 12v9.2"/><path d="m7.7 5.1 8.6 4.6"/>'),
  convoyeur: svg('<rect x="2.5" y="6" width="19" height="7" rx="3.5"/><circle cx="6" cy="9.5" r="1.2"/><circle cx="12" cy="9.5" r="1.2"/><circle cx="18" cy="9.5" r="1.2"/><path d="M5 13v7M19 13v7M8.5 3h7M13 1.5 15.5 3 13 4.5"/>'),
  controle: svg('<path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M2 21h20"/><rect x="8.5" y="12" width="7" height="6" rx=".6"/><path d="M7 8h10" stroke-dasharray="1.6 1.6"/>'),
  rejet: svg('<path d="M3 17h8.5c2 0 3-1 4-2.6L19.5 7"/><path d="M15.4 6.2 19.8 6.6 19.4 11"/><path d="M11.5 17H21"/><path d="m18.5 14.5 2.5 2.5-2.5 2.5"/>'),
  expedition: svg('<path d="M2.5 6.5h11v10h-11z"/><path d="M13.5 9.5h4.2l3.3 3.6v3.4h-7.5"/><circle cx="6.5" cy="17.5" r="1.9"/><circle cx="17" cy="17.5" r="1.9"/>'),
  effectif: svg('<path d="M5.5 11a6.5 6.5 0 0 1 13 0"/><path d="M4 11h16v1.6H4z"/><path d="M12 4.5V7"/><path d="M7 15.5c.9 2.8 2.7 4.5 5 4.5s4.1-1.7 5-4.5"/>'),
  qualite: svg('<path d="M12 2.5 19.5 5.3v6c0 4.6-3.2 8.4-7.5 10.2-4.3-1.8-7.5-5.6-7.5-10.2v-6Z"/><path d="m8.5 12 2.4 2.4 4.8-4.9"/>'),
  charge: svg('<rect x="3" y="13" width="6" height="8" rx=".6"/><rect x="9" y="6.5" width="6" height="14.5" rx=".6"/><rect x="15" y="10" width="6" height="11" rx=".6"/><path d="M4.5 3.5h4M6.5 1.5v4"/>'),
  lignes: svg('<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1.3 1.3L7.2 4.8M3.5 12l1.3 1.3 2.4-2.5M3.5 18l1.3 1.3 2.4-2.5"/>'),
  courbe: svg('<path d="M3 3v18h18"/><path d="m6.5 15.5 4-4.5 3.2 2.8L20 7"/><path d="M6.5 18 20 10" stroke-dasharray="2 2"/>'),
  cible: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>'),
  priorite: svg('<path d="M4 21V4"/><path d="M4 4.5h12.5l-2.4 4 2.4 4H4"/>'),
  securite: svg('<path d="M3.5 18.5h17"/><path d="M5.5 18.5V15a6.5 6.5 0 0 1 13 0v3.5"/><path d="M12 8.5v-3M9 9.5V7.2M15 9.5V7.2"/><path d="M2.5 21h19"/>'),
  // états
  conforme: svg('<circle cx="12" cy="12" r="9.2"/><path d="m7.8 12.3 2.8 2.8 5.6-5.8"/>'),
  vigilance: svg('<path d="M12 3.2 21.3 19.6H2.7Z"/><path d="M12 9.5v4.6M12 16.9v.2"/>'),
  critique: svg('<path d="M8.2 2.8h7.6l5.4 5.4v7.6l-5.4 5.4H8.2l-5.4-5.4V8.2Z"/><path d="M12 7.6v5.6M12 16.2v.2"/>'),
  indisponible: svg('<circle cx="12" cy="12" r="9.2" stroke-dasharray="2.6 2.4"/><path d="M8.5 12h7"/>'),
  info: svg('<circle cx="12" cy="12" r="9.2"/><path d="M12 11v5.5M12 7.6v.2"/>'),
  // statut connexion
  connecte: svg('<path d="M2.5 9a14 14 0 0 1 19 0"/><path d="M5.8 12.6a9 9 0 0 1 12.4 0"/><path d="M9.2 16.1a4 4 0 0 1 5.6 0"/><circle cx="12" cy="19.4" r="1" fill="currentColor"/>'),
  ancien: svg('<circle cx="12" cy="12" r="9.2"/><path d="M12 6.8V12l3.6 2.2"/>'),
  coupe: svg('<path d="M2.5 9a14 14 0 0 1 7.2-3.7M14.3 5.3A14 14 0 0 1 21.5 9"/><path d="M5.8 12.6a9 9 0 0 1 3.3-2"/><path d="M9.2 16.1a4 4 0 0 1 5.6 0"/><path d="m3 3 18 18"/>'),
  vide: svg('<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v13c0 1.6 3.4 2.8 7.5 2.8s7.5-1.2 7.5-2.8v-13"/><path d="M4.5 12c0 1.6 3.4 2.8 7.5 2.8s7.5-1.2 7.5-2.8"/><path d="m3 3 18 18"/>'),
  actualiser: svg('<path d="M20 11a8 8 0 0 0-14.3-4.6L4 8.5"/><path d="M4 3.5v5h5"/><path d="M4 13a8 8 0 0 0 14.3 4.6l1.7-2.1"/><path d="M20 20.5v-5h-5"/>'),
  // commandes
  exploitation: svg('<rect x="2.5" y="3.5" width="19" height="13" rx="1.6"/><path d="M8 20.5h8M12 16.5v4"/><path d="m6 12.5 3-3.2 2.6 2.2L17.5 6"/>'),
  immersion: svg('<path d="M12 2.8 20.5 7.6v8.8L12 21.2 3.5 16.4V7.6Z"/><path d="M3.5 7.6 12 12.4l8.5-4.8M12 12.4v8.8"/>'),
  briefing: svg('<circle cx="8" cy="7.5" r="2.6"/><circle cx="16.5" cy="7.5" r="2.6"/><path d="M3 19c.4-3.4 2.4-5.4 5-5.4s4.6 2 5 5.4"/><path d="M13.6 14.4c.9-.6 1.8-.8 2.9-.8 2.6 0 4.6 2 5 5.4"/>'),
  pause: svg('<rect x="6.5" y="4.5" width="3.6" height="15" rx="1"/><rect x="13.9" y="4.5" width="3.6" height="15" rx="1"/>'),
  lecture: svg('<path d="M7 4.5v15l12-7.5Z"/>'),
  pleinEcran: svg('<path d="M3.5 9V3.5H9M15 3.5h5.5V9M20.5 15v5.5H15M9 20.5H3.5V15"/>'),
  quitterPleinEcran: svg('<path d="M9 3.5V9H3.5M20.5 9H15V3.5M15 20.5V15h5.5M3.5 15H9v5.5"/>'),
  reglages: svg('<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>'),
  fermer: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  retour: svg('<path d="M10 5 3 12l7 7"/><path d="M3.5 12H21"/>'),
  vue: svg('<path d="M3.5 9V3.5H9M15 3.5h5.5V9M20.5 15v5.5H15M9 20.5H3.5V15"/><circle cx="12" cy="12" r="3"/>'),
  chevron: svg('<path d="m6 9 6 6 6-6"/>'),
  modifier: svg('<path d="M4 20h4L19.5 8.5a2.8 2.8 0 0 0-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>'),
  lien: svg('<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
  importer: svg('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v3h16v-3"/>'),
  alerte: svg('<path d="M6 17V11a6 6 0 0 1 12 0v6"/><path d="M4 17h16M10 20.5h4"/><path d="M12 2.5V4M4.2 5.6l1.1 1.1M19.8 5.6l-1.1 1.1"/>'),
};

export const ETAT_LIBELLE = {
  conforme: 'CONFORME',
  vigilance: 'VIGILANCE',
  critique: 'CRITIQUE',
  indisponible: 'INDISPONIBLE',
};

export const puceEtat = (etat, texte) =>
  `<span class="etat" data-etat="${etat}">${ICONES[etat] || ICONES.info}<span>${texte || ETAT_LIBELLE[etat] || etat}</span></span>`;
