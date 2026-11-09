/* Outils de temps : minutes de la journée, temps productif (pauses exclues),
   calendrier des jours ouvrés. Tout est calculé en heure locale. */

export const enMinutes = (hhmm) => {
  if (typeof hhmm !== 'string') return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(hhmm);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

export const enHHMM = (min) => {
  const m = Math.max(0, Math.round(min));
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

export const isoDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const dateDepuisIso = (s) => {
  const [y, m, j] = s.split('-').map(Number);
  return new Date(y, m - 1, j, 12, 0, 0);
};

export const minutesDuJour = (d) => d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;

const chevauchement = (a0, a1, b0, b1) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));

/** Fenêtre de travail d'un filtre « équipe » : début, fin, pauses (en minutes). */
export function fenetre(equipes, equipeId) {
  const liste = equipeId && equipeId !== 'toutes' ? equipes.filter((e) => e.id === equipeId) : equipes;
  if (!liste.length) return null;
  const debut = Math.min(...liste.map((e) => enMinutes(e.debut)));
  const fin = Math.max(...liste.map((e) => enMinutes(e.fin)));
  const pauses = liste.flatMap((e) => (e.pauses || []).map(([a, b]) => [enMinutes(a), enMinutes(b)]));
  return { debut, fin, pauses, equipes: liste };
}

/** Minutes productives entre a et b (pauses retirées). */
export function minutesProductives(f, a, b) {
  if (!f) return 0;
  const x0 = Math.max(a, f.debut);
  const x1 = Math.min(b, f.fin);
  if (x1 <= x0) return 0;
  let t = x1 - x0;
  for (const [p0, p1] of f.pauses) t -= chevauchement(x0, x1, p0, p1);
  return Math.max(0, t);
}

export const enPause = (f, m) => f.pauses.some(([a, b]) => m >= a && m < b);

/** Jours ouvrés (lundi → vendredi) d'une semaine ISO ou d'un mois. */
export function joursDePeriode(dateIso, periode) {
  const d = dateDepuisIso(dateIso);
  const jours = [];
  if (periode === 'semaine') {
    const lundi = new Date(d);
    lundi.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    for (let i = 0; i < 5; i++) {
      const x = new Date(lundi);
      x.setDate(lundi.getDate() + i);
      jours.push(isoDate(x));
    }
  } else if (periode === 'mois') {
    const x = new Date(d.getFullYear(), d.getMonth(), 1, 12);
    while (x.getMonth() === d.getMonth()) {
      if (x.getDay() !== 0 && x.getDay() !== 6) jours.push(isoDate(x));
      x.setDate(x.getDate() + 1);
    }
  } else {
    jours.push(dateIso);
  }
  return jours;
}

export const estJourOuvre = (dateIso) => {
  const g = dateDepuisIso(dateIso).getDay();
  return g !== 0 && g !== 6;
};
