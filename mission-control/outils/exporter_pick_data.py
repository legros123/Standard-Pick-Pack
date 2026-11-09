#!/usr/bin/env python3
"""
EXPORT → donnees/pick_data.js  (format normalisé v1 de PICK // MISSION CONTROL)
================================================================================

Convertit un CSV journalier (une ligne par créneau horaire) en fichier de
données lu par le tableau de bord toutes les 120 s, y compris lorsque
index.html est ouvert directement depuis un dossier partagé.

Les structures des exports LOGYS (Requete1 DETAIL / CARTON), OPE_MAJ,
equipe_jour.json et vision_board_data.js n'ont pas été fournies : la
correspondance des colonnes se règle ici par --col, après inspection des
fichiers réels (Réglages › Données › Inspecter un fichier, dans l'application).

Exemples
--------
  python3 outils/exporter_pick_data.py donnees/exemple_journalier.csv
  python3 outils/exporter_pick_data.py export_du_jour.csv --col lignes=NB_LIGNES --col colis=NB_COLIS \\
          --objectif 12400 --sortie donnees/pick_data.js

Planification (Windows) : tâche planifiée toutes les 2 minutes qui lance ce
script après l'extraction ; le tableau de bord se met à jour seul.

Règles
------
* Flux (lignes, colis, rejets, erreurs, colis expédiés) : additionnés par heure.
* Stocks (charge restante, attente rejet, effectifs) : dernière valeur renseignée.
* Cellule vide → null (affiché « indisponible »), jamais 0.
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import re
from pathlib import Path

COLONNES = {  # champ normalisé -> en-tête attendue dans le CSV (modifiable par --col)
    "horodatage": "heure",
    "lignes": "lignes",
    "colis": "colis_controles",
    "produits": "colis_expedies",
    "rejets": "rejets",
    "erreurs": "erreurs_decelees",
    "charge": "charge_restante",
    "attente": "attente_rejet",
    "effectif": "effectif_present",
    "effectifPrevu": "effectif_prevu",
    "preparateurs": "preparateurs",
}
FLUX = ["lignes", "colis", "rejets", "erreurs", "produits"]
STOCKS = ["charge", "attente", "effectif", "effectifPrevu", "preparateurs"]


def nombre(v):
    if v is None:
        return None
    s = str(v).strip().replace(" ", "").replace("\xa0", "").replace(" ", "").replace(",", ".")
    if not s:
        return None
    try:
        x = float(s)
    except ValueError:
        return None
    return int(x) if x.is_integer() else x


def lire_horodatage(v):
    s = str(v or "").strip()
    d = None
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", s)
    if m:
        d = f"{m[1]}-{m[2]}-{m[3]}"
    else:
        m = re.search(r"(\d{2})/(\d{2})/(\d{4})", s)
        if m:
            d = f"{m[3]}-{m[2]}-{m[1]}"
    h = re.search(r"(\d{1,2})[:h](\d{2})", s)
    return d, (int(h[1]) * 60 + int(h[2])) if h else None


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("csv", type=Path)
    ap.add_argument("--sortie", type=Path, default=Path(__file__).resolve().parent.parent / "donnees" / "pick_data.js")
    ap.add_argument("--col", action="append", default=[], help="champ=EN-TÊTE (ex. lignes=NB_LIGNES)")
    ap.add_argument("--date", help="AAAA-MM-JJ (défaut : date lue dans le CSV, sinon aujourd'hui)")
    ap.add_argument("--equipe", default="toutes")
    ap.add_argument("--objectif", type=int, help="objectif de lignes du jour (sinon calculé par l'application : préparateurs × quota)")
    ap.add_argument("--source", default=None, help="libellé de la source affiché dans les détails")
    a = ap.parse_args()

    col = dict(COLONNES)
    for c in a.col:
        k, _, v = c.partition("=")
        if k not in col:
            ap.error(f"champ inconnu : {k} (connus : {', '.join(col)})")
        col[k] = v

    texte = a.csv.read_text(encoding="utf-8-sig", errors="replace")
    sep = max([";", ",", "\t"], key=lambda c: texte.splitlines()[0].count(c))
    lignes = list(csv.DictReader(texte.splitlines(), delimiter=sep))
    if not lignes:
        raise SystemExit("CSV vide.")
    entetes = list(lignes[0].keys())
    absentes = [f"{k} → {v}" for k, v in col.items() if v and v not in entetes]
    if col["horodatage"] not in entetes:
        raise SystemExit(f"Colonne d'horodatage « {col['horodatage']} » absente. Colonnes : {', '.join(entetes)}")
    if absentes:
        print("Colonnes non trouvées (valeurs indisponibles) :", "; ".join(absentes))

    paquets, stocks, derniere, date_lue = {}, {}, None, None
    for r in lignes:
        d, m = lire_horodatage(r.get(col["horodatage"]))
        if m is None or (a.date and d and d != a.date):
            continue
        date_lue = date_lue or d
        b = paquets.setdefault(m // 60 * 60, {k: None for k in FLUX})
        for k in FLUX:
            x = nombre(r.get(col[k])) if col.get(k) in r else None
            if x is not None:
                b[k] = (b[k] or 0) + x
        for k in STOCKS:
            x = nombre(r.get(col[k])) if col.get(k) in r else None
            if x is not None:
                stocks[k] = x
        derniere = m if derniere is None else max(derniere, m)

    def somme(k):
        v = [b[k] for b in paquets.values() if b[k] is not None]
        return sum(v) if v else None

    hh = lambda m: f"{m // 60:02d}:{m % 60:02d}"
    cles = sorted(paquets)
    serie = [{"t": hh(k), **{c: paquets[k][c] for c in ["lignes", "colis", "rejets", "erreurs"]}, "partiel": False} for k in cles]
    if serie and derniere is not None and derniere % 60 and derniere - cles[-1] < 59:
        serie[-1]["partiel"] = True
    maintenant = dt.datetime.now().astimezone()
    snap = {
        "version": 1,
        "meta": {
            "source": a.source or f"Export {a.csv.name}",
            "genereLe": maintenant.isoformat(timespec="seconds"),
            "date": a.date or date_lue or maintenant.date().isoformat(),
            "periode": "jour",
            "equipe": a.equipe,
            "heure": hh(derniere) if derniere is not None else None,
        },
        "valeurs": {
            "lignesPreparees": somme("lignes"),
            "objectifLignes": a.objectif,
            "colisProduits": somme("produits"),
            "colisControles": somme("colis"),
            "rejetsConvoyeur": somme("rejets"),
            "erreursDecelees": somme("erreurs"),
            "colisEnAttenteRejet": stocks.get("attente"),
            "chargeRestante": stocks.get("charge"),
            "effectifPresent": stocks.get("effectif"),
            "effectifPrevu": stocks.get("effectifPrevu"),
            "preparateursPresents": stocks.get("preparateurs"),
            "erreursAverees": None,
        },
        "serie": serie,
    }
    corps = json.dumps(snap, ensure_ascii=False, indent=2)
    a.sortie.parent.mkdir(parents=True, exist_ok=True)
    tmp = a.sortie.with_suffix(".tmp")
    tmp.write_text(f"/* Généré par outils/exporter_pick_data.py le {maintenant:%d/%m/%Y %H:%M:%S} — ne pas modifier à la main. */\nwindow.PICK_MC_DATA = {corps};\n", encoding="utf-8")
    tmp.replace(a.sortie)   # remplacement atomique : jamais de fichier à moitié écrit
    print(f"{a.sortie} écrit : {snap['valeurs']['lignesPreparees']} lignes, {len(serie)} tranches horaires, situation à {snap['meta']['heure']}.")


if __name__ == "__main__":
    main()
