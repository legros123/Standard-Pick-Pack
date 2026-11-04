#!/usr/bin/env python3
"""
Jeu d'essai fictif (aucune donnée réelle) au format de l'extraction Oracle :
une journée type du CLR, 3 vagues, flux client / agences / réassort, ~35 % de
monolignes, composés en allée 11, aérosols et batteries.

Les colonnes tournee_wms et duree_tournee_min simulent les tournées actuelles
(lotissement par ordre d'arrivée) pour tester la comparaison et la calibration.

  python3 outils/tournees/generer_jeu_test.py --commandes 400 --sortie jeu_test.csv
"""
import argparse
import csv
import random
from collections import defaultdict

VAGUES = ["10H00", "13H30", "16H00"]
NB_ALLEES, NB_EP, NIVEAUX = 24, 20, "ABCDE"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--commandes", type=int, default=400)
    ap.add_argument("--graine", type=int, default=7)
    ap.add_argument("--sortie", default="jeu_test.csv")
    a = ap.parse_args()
    rnd = random.Random(a.graine)

    # articles : les allées proches du départ sont les plus demandées (rotation ABC)
    articles = []
    for k in range(3000):
        allee = min(NB_ALLEES, 1 + int(rnd.expovariate(1 / 7)))
        articles.append({
            "ref": f"REF{k:05d}", "des": f"Article {k}",
            "empl": f"{allee:02d}-{rnd.randint(1, NB_EP):02d}-{rnd.choice(NIVEAUX[:3] if rnd.random() < .85 else NIVEAUX)}",
            "poids": round(rnd.uniform(0.02, 3.5), 3), "vol": round(rnd.uniform(0.05, 4.0), 2),
            "aerosol": rnd.random() < .02, "batterie": rnd.random() < .02,
        })
    poids_art = [1 / (i + 1) ** 0.8 for i in range(len(articles))]

    lignes = []
    for c in range(a.commandes):
        flux = rnd.choices(["CLIENT", "AGENCE", "REASSORT"], [60, 30, 10])[0]
        vague = rnd.choices(VAGUES, [45, 35, 20])[0]
        n = 1 if rnd.random() < .35 else max(2, int(rnd.lognormvariate(1.6, .7)))
        for art in rnd.choices(articles, poids_art, k=n):
            lignes.append({
                "commande": f"BL{100000 + c}", "client": f"{'AG' if flux != 'CLIENT' else 'CL'}{rnd.randint(1, 300):04d}",
                "flux": flux, "vague": vague, "emplacement": art["empl"], "reference": art["ref"],
                "designation": art["des"], "quantite": rnd.choice([1, 1, 1, 2, 2, 3, 5, 10]),
                "poids_unitaire_kg": str(art["poids"]).replace(".", ","),
                "volume_unitaire_l": str(art["vol"]).replace(".", ","),
                "aerosol": "O" if art["aerosol"] else "", "batterie": "O" if art["batterie"] else "",
            })

    # « tournées actuelles » : ordre d'arrivée, 35 lignes maxi, par vague et flux
    groupes = defaultdict(list)
    for l in lignes:
        groupes[(l["vague"], l["flux"])].append(l)
    num = 0
    for ls in groupes.values():
        cur, n_cur, cmd_prec = None, 0, None
        for l in ls:
            if l["commande"] != cmd_prec:
                nb = sum(1 for x in ls if x["commande"] == l["commande"])
                if cur is None or n_cur + nb > 35:
                    num += 1
                    cur, n_cur = f"TW{num:04d}", 0
                n_cur += nb
                cmd_prec = l["commande"]
            l["tournee_wms"] = cur
    # durée réalisée simulée : 200 s + 20 s/ligne + 2 s/unité + 30 s/colis + distance / 0,8 m/s, ± bruit
    par_t = defaultdict(list)
    for l in lignes:
        par_t[l["tournee_wms"]].append(l)
    for t, ls in par_t.items():
        allees = {int(l["emplacement"][:2]): 0 for l in ls}
        for l in ls:
            al, ep = int(l["emplacement"][:2]), int(l["emplacement"][3:5])
            allees[al] = max(allees[al], ep)
        dist = 2 * (max(allees) - 1) * 3.2 + sum(NB_EP * 2.7 for _ in allees)
        colis = len({l["commande"] for l in ls}) * 1.3
        sec = 200 + 20 * len(ls) + 2 * sum(l["quantite"] for l in ls) + 30 * colis + dist / 0.8
        for l in ls:
            l["duree_tournee_min"] = str(round(sec * rnd.uniform(.9, 1.1) / 60, 1)).replace(".", ",")

    with open(a.sortie, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(lignes[0]), delimiter=";")
        w.writeheader()
        w.writerows(lignes)
    print(f"{len(lignes)} lignes, {a.commandes} commandes, {num} tournées simulées -> {a.sortie}")


if __name__ == "__main__":
    main()
