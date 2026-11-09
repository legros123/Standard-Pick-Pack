/* ════════════════════════════════════════════════════════════════════
   FORMAT NORMALISÉ (version 1) — contrat entre la couche d'import et
   l'affichage. Toute source (démo, fichier JS, JSON, CSV) est convertie
   dans ce format. Une valeur absente vaut null = « indisponible »,
   jamais zéro. Détail complet : donnees/LISEZMOI.md
   ════════════════════════════════════════════════════════════════════ */

export const CHAMPS_VALEURS = {
  lignesPreparees: 'lignes',
  objectifLignes: 'lignes',
  colisProduits: 'colis',
  objectifColis: 'colis',
  chargeRestante: 'lignes',
  colisControles: 'colis',
  rejetsConvoyeur: 'colis',
  colisEnAttenteRejet: 'colis',
  erreursDecelees: 'erreurs',
  erreursAverees: 'litiges',
  effectifPresent: 'personnes',
  effectifPrevu: 'personnes',
  preparateursPresents: 'personnes',
};

const nombre = (v) => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const n = Number(String(v).replace(/\s| | /g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

/**
 * Vérifie et nettoie un instantané. Lève une erreur explicite si la
 * structure est inutilisable ; renvoie la liste des avertissements.
 */
export function normaliser(brut, filtres) {
  if (!brut || typeof brut !== 'object') throw new Error('Instantané vide ou illisible.');
  if (!brut.valeurs || typeof brut.valeurs !== 'object') throw new Error('Champ « valeurs » absent : le fichier ne suit pas le format normalisé.');
  const avertissements = [];
  const meta = { ...(brut.meta || {}) };
  meta.periode = meta.periode || filtres?.periode || 'jour';
  meta.equipe = meta.equipe || filtres?.equipe || 'toutes';
  meta.date = meta.date || filtres?.date;
  if (!meta.genereLe) avertissements.push('Horodatage « meta.genereLe » absent : l’ancienneté des données ne peut pas être contrôlée.');
  const valeurs = {};
  for (const k of Object.keys(CHAMPS_VALEURS)) valeurs[k] = nombre(brut.valeurs[k]);
  valeurs.effectifMoyen = !!brut.valeurs.effectifMoyen;
  const serie = Array.isArray(brut.serie)
    ? brut.serie.filter((p) => p && p.t).map((p) => ({
      t: String(p.t),
      lignes: nombre(p.lignes), colis: nombre(p.colis), rejets: nombre(p.rejets), erreurs: nombre(p.erreurs), charge: nombre(p.charge),
      objectif: nombre(p.objectif), partiel: !!p.partiel,
    }))
    : [];
  if (!serie.length) avertissements.push('Aucune série horaire : courbe de production indisponible.');
  return {
    version: 1,
    meta,
    valeurs,
    serie,
    equipes: Array.isArray(brut.equipes) ? brut.equipes : null,
    priorites: Array.isArray(brut.priorites) ? brut.priorites.filter(Boolean).map(String) : null,
    securite: brut.securite && typeof brut.securite === 'object' ? brut.securite : null,
    avertissements,
  };
}

/** Choisit, dans un fichier contenant plusieurs instantanés, celui qui correspond aux filtres. */
export function choisirInstantane(contenu, filtres) {
  if (!contenu) return null;
  const liste = Array.isArray(contenu) ? contenu : Array.isArray(contenu.instantanes) ? contenu.instantanes : [contenu];
  const ok = (s) => (!s.meta?.date || s.meta.date === filtres.date)
    && (!s.meta?.periode || s.meta.periode === filtres.periode)
    && (!s.meta?.equipe || s.meta.equipe === filtres.equipe);
  return liste.find(ok) || null;
}
