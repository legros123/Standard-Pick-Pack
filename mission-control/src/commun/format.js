/* Mise en forme française (espaces fines insécables, virgule décimale). */
const nf0 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const INDISPONIBLE = '—';

export const nombre = (v, dec = 0) => {
  if (v === null || v === undefined || !Number.isFinite(v)) return INDISPONIBLE;
  return dec ? new Intl.NumberFormat('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v) : nf0.format(Math.round(v));
};

export const signe = (v, dec = 0) => {
  if (v === null || v === undefined || !Number.isFinite(v)) return INDISPONIBLE;
  const s = nombre(Math.abs(v), dec);
  return v > 0 ? `+${s}` : v < 0 ? `−${s}` : s;
};

export const pct = (ratio, dec = 0) => (ratio === null || ratio === undefined || !Number.isFinite(ratio) ? INDISPONIBLE : `${nombre(ratio * 100, dec)} %`);

export const un = (v) => nf1.format(v);

export const duree = (heures) => {
  if (heures === null || !Number.isFinite(heures)) return INDISPONIBLE;
  const m = Math.round(heures * 60);
  const h = Math.floor(m / 60);
  return h ? `${h} h ${String(m % 60).padStart(2, '0')}` : `${m} min`;
};

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MOIS_C = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

export const dateLongue = (d) => `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
export const dateCourte = (d) => `${JOURS[d.getDay()].slice(0, 3)}. ${d.getDate()} ${MOIS_C[d.getMonth()]}`;
export const moisAnnee = (d) => `${MOIS[d.getMonth()]} ${d.getFullYear()}`;
export const heureMinSec = (d) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
export const heureMin = (d) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
export const capitale = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export const ilYa = (date, maintenant = new Date()) => {
  const s = Math.max(0, Math.round((maintenant - date) / 1000));
  if (s < 60) return `il y a ${s} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 48) return `il y a ${h} h ${String(m % 60).padStart(2, '0')}`;
  return `il y a ${Math.round(h / 24)} jours`;
};

export const echapper = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
