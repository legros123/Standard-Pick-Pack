#!/usr/bin/env python3
"""
Jeu d'essai FICTIF au format de l'extraction Logys (mêmes colonnes que la requête
sql/02) : aucune donnée réelle. Sert aux tests automatiques.

Profil calqué sur les 21-23/10/2026 : ~43 % de monolignes, commandes CL (cartons
C16…C9 ou bacs bleus B16/B13/D11) et PV (bacs jaunes A16/A13/A11), une partie en
carton complet (CART), allées A01-A14, quelques lignes hors zone pick.
La colonne CHARIOT simule des tournées « à la Logys » (ordre d'arrivée, 120 lignes
ou 45 éq. C16 maxi, commandes coupées) pour tester la comparaison.

  python3 outils/tournees/generer_jeu_test.py --commandes 600 --sortie jeu_test.csv
"""
import argparse
import csv
import random

POS = {1: (5, 32), 2: (5, 32), 3: (5, 32), 4: (23, 122), 5: (19, 118), 6: (23, 122), 7: (19, 117),
       8: (23, 122), 9: (19, 118), 10: (23, 122), 11: (19, 117), 12: (23, 122), 13: (19, 118), 14: (24, 112)}
EQ = {"C16": 1, "C14": 1.26, "C13": 1.89, "C12": 1.89, "C11": 3.77, "C9": 3.77, "B16": 1.01, "B13": 1.76,
      "D11": 4.08, "A16": 1.01, "A13": 1.89, "A11": 3.93, "CARTON": 1.62}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--commandes", type=int, default=600)
    ap.add_argument("--vagues", type=int, default=3)
    ap.add_argument("--graine", type=int, default=7)
    ap.add_argument("--sortie", default="jeu_test.csv")
    a = ap.parse_args()
    rnd = random.Random(a.graine)

    allees = list(POS)
    poids_allee = [9, 10, 10, 8, 9, 8, 7, 9, 7, 6, 3, 3, 4, 3]
    articles = []
    for k in range(4000):
        al = rnd.choices(allees, poids_allee)[0]
        p = rnd.randint(*POS[al])
        articles.append((f"ART{k:05d}", f"54APP{al:02d}{p:03d}{rnd.choice(['00', '01', '03', '05']):s}"
                         f"{rnd.choice('ABCD')}", al, rnd.randint(10, 3000), rnd.randint(500, 400000)))
    pop = [1 / (i + 1) ** 0.7 for i in range(len(articles))]

    lignes, n_cont = [], 248800000
    for c in range(a.commandes):
        vague = f"VAG{136000 + rnd.randint(1, a.vagues)}"
        pref = rnd.choices(["CL", "PV"], [88, 12])[0]
        cmd = f"{pref}-{rnd.randint(1000, 9999)}-{715000000 + c}-01"
        cart = rnd.random() < 0.04
        n = 1 if rnd.random() < 0.43 else max(2, int(rnd.lognormvariate(1.4, 0.8)))
        arts = rnd.choices(articles, pop, k=n)
        if cart:
            types = ["CARTON"] * n
        elif n == 1:
            types = [rnd.choices(["C16", "C14", "B16", "A16" if pref == "PV" else "C13"], [55, 15, 20, 10])[0]]
        else:
            fam = (["A16", "A13", "A11"] if pref == "PV" else
                   rnd.choice([["C16", "C14", "C13", "C12", "C11", "C9"], ["B16", "B13", "D11"]]))
            nb_cont = max(1, n // rnd.randint(4, 9))
            types = [rnd.choice(fam) for _ in range(nb_cont)]
        conts = []
        for t in types:
            n_cont += 1
            conts.append((f"{n_cont:012d}", t))
        for i, (ref, empl, al, pds, vol) in enumerate(arts):
            num, typ = conts[i % len(conts)]
            hors = rnd.random() < 0.03
            q = rnd.choice([1, 1, 1, 2, 3, 5, 10])
            lignes.append({
                "JOUR": "21/10/2026", "VAGUE": vague, "CHARIOT": "", "STYP_TOUR": "CART" if cart else "DETA",
                "ZONE": "AEROSOLS" if hors else "PICK01A14", "COMMANDE": cmd, "ORDRE_PASSAGE": 0,
                "ARTICLE": ref, "QTE_PREVUE": q, "PDS_LIGNE": pds * q, "VOL_LIGNE": vol * q,
                "EMPLACEMENT": empl, "ALLEE": f"A{al:02d}", "CONTENANT": num, "TYPE_CONTENANT": typ,
                "ETAT_LIGNE": "ANNU" if rnd.random() < 0.02 else "TERM", "_eq": EQ[typ]})

    # « tournées Logys » simulées : ordre d'arrivée par vague et service, coupe les commandes
    num_t, vus = 5012000, {}
    for cle in sorted({(l["VAGUE"], l["STYP_TOUR"], l["ZONE"]) for l in lignes}):
        ls = [l for l in lignes if (l["VAGUE"], l["STYP_TOUR"], l["ZONE"]) == cle]
        n_l, eq, cur = 0, 0.0, None
        for l in ls:
            neuf = l["CONTENANT"] not in vus
            if cur is None or n_l >= 120 or (neuf and eq + l["_eq"] > 45):
                num_t += 1
                cur, n_l, eq = f"TO{num_t:08d}", 0, 0.0
            if neuf:
                vus[l["CONTENANT"]] = cur
                eq += l["_eq"]
            l["CHARIOT"] = vus[l["CONTENANT"]]
            n_l += 1
    for l in lignes:
        del l["_eq"]
    with open(a.sortie, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(lignes[0]), delimiter=";")
        w.writeheader()
        w.writerows(lignes)
    print(f"{len(lignes)} lignes, {a.commandes} commandes -> {a.sortie}")


if __name__ == "__main__":
    main()
