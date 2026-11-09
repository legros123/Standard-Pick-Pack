/* ════════════════════════════════════════════════════════════════════
   MODÈLE DE FICHIER DE DONNÉES — format normalisé v1 (valeurs FICTIVES)
   Copier en « pick_data.js » et le faire régénérer par l'export (voir
   ../outils/exporter_pick_data.py ou donnees/LISEZMOI.md).
   Le tableau de bord relit ce fichier à chaque actualisation (120 s).
   Une valeur absente ou null s'affiche « indisponible », jamais zéro.
   ════════════════════════════════════════════════════════════════════ */
window.PICK_MC_DATA = {
  "version": 1,
  "meta": {
    "source": "EXEMPLE — fichier modèle (valeurs fictives)",
    "exemple": true,
    "genereLe": "2026-11-09T10:42:00+01:00",
    "date": "2026-11-09",
    "periode": "jour",
    "equipe": "toutes",
    "heure": "10:42"
  },
  "valeurs": {
    "lignesPreparees": 3298,
    "objectifLignes": null,
    "colisProduits": 771,
    "objectifColis": null,
    "chargeRestante": 4890,
    "colisControles": 792,
    "rejetsConvoyeur": 22,
    "colisEnAttenteRejet": 6,
    "erreursDecelees": 3,
    "erreursAverees": null,
    "effectifPresent": 12,
    "effectifPrevu": 13,
    "preparateursPresents": 9
  },
  "serie": [
    { "t": "06:00", "lignes": 412, "colis": 98, "rejets": 3, "erreurs": 0, "charge": 6120 },
    { "t": "07:00", "lignes": 655, "colis": 158, "rejets": 4, "erreurs": 1, "charge": 5890 },
    { "t": "08:00", "lignes": 702, "colis": 169, "rejets": 5, "erreurs": 0, "charge": 5530 },
    { "t": "09:00", "lignes": 688, "colis": 165, "rejets": 4, "erreurs": 1, "charge": 5210 },
    { "t": "10:00", "lignes": 841, "colis": 202, "rejets": 6, "erreurs": 1, "charge": 4890, "partiel": true },
    { "t": "11:00", "lignes": null }, { "t": "12:00", "lignes": null }, { "t": "13:00", "lignes": null },
    { "t": "14:00", "lignes": null }, { "t": "15:00", "lignes": null }, { "t": "16:00", "lignes": null },
    { "t": "17:00", "lignes": null }, { "t": "18:00", "lignes": null }, { "t": "19:00", "lignes": null },
    { "t": "20:00", "lignes": null }
  ],
  "equipes": [
    { "id": "matin", "nom": "Matin", "debut": "06:00", "fin": "13:24", "enPoste": true, "effectifPresent": 12, "effectifPrevu": 13, "preparateursPresents": 9, "preparateursPrevus": 10 },
    { "id": "apres-midi", "nom": "Après-midi", "debut": "13:24", "fin": "20:48", "enPoste": false, "effectifPresent": null, "effectifPrevu": 12, "preparateursPresents": null, "preparateursPrevus": 9 }
  ],
  "priorites": [],
  "securite": null
};
