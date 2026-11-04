#!/usr/bin/env python3
"""Contrôle automatique de l'optimiseur sur le jeu d'essai : python3 outils/tournees/test_optimiseur.py"""
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI))
import optimiseur_tournees as ot  # noqa: E402


class TestOptimiseur(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.dossier = Path(tempfile.mkdtemp())
        cls.csv = cls.dossier / "jeu.csv"
        subprocess.run([sys.executable, str(ICI / "generer_jeu_test.py"), "--commandes", "250",
                        "--sortie", str(cls.csv)], check=True, capture_output=True)
        cls.anomalies = []
        cls.lignes = ot.charger_lignes(cls.csv, cls.anomalies)
        cls.plan, cls.tournees, cls.fifo, _ = ot.optimiser(cls.lignes, cls.anomalies, 5)

    def test_emplacements(self):
        self.assertEqual(ot.decouper_emplacement("11-05-B"), (11, 5, 2))
        self.assertEqual(ot.decouper_emplacement("011 05 2"), (11, 5, 2))
        self.assertEqual(ot.decouper_emplacement("110502"), (11, 5, 2))
        self.assertEqual(ot.decouper_emplacement("1105B"), (11, 5, 2))
        self.assertEqual(ot.decouper_emplacement("A11.05.02")[1:], (5, 2))

    def test_controles_conformes(self):
        ecarts = [c for c in ot.controler(self.tournees, self.lignes) if c[1] == "ÉCART"]
        self.assertEqual(ecarts, [])

    def test_bornes(self):
        for t in self.tournees:
            self.assertLessEqual(t.nb_lignes, ot.bornes(t.type)[1])
            if t.type != "MONO":
                self.assertLessEqual(t.places, ot.CHARIOT_PLACES)
            self.assertLessEqual(t.poids, ot.CHARIOT_POIDS_MAX)

    def test_mieux_que_fifo(self):
        opt, fifo = ot.total(self.tournees, self.plan), ot.total(self.fifo, self.plan)
        self.assertLess(opt["distance"], fifo["distance"])
        self.assertLessEqual(opt["tournees"], fifo["tournees"])

    def test_serpentin(self):
        plan = self.plan
        p = {1: (0, 5), 3: (0, 10)}
        d, mode = plan.distance(p, "S")
        # 2 allées (pair) : les deux traversées en entier
        self.assertAlmostEqual(d, 2 * (plan.x(3) - ot.ALLEE_DEPART_X) + plan.longueur(1) + plan.longueur(3))
        self.assertEqual(mode, "S")
        # 1 allée (impair) : aller-retour jusqu'au point le plus profond
        d, _ = plan.distance({3: (0, 10)}, "S")
        self.assertAlmostEqual(d, 2 * (plan.x(3) - ot.ALLEE_DEPART_X) + 2 * 10)
        # MIXTE jamais plus long que S ni que RETOUR
        p = {1: (0, 3), 2: (0, 4), 5: (0, 50)}
        self.assertLessEqual(plan.distance(p, "MIXTE")[0], min(plan.distance(p, "S")[0], plan.distance(p, "RETOUR")[0]))

    def test_sequence_alternee(self):
        ls = [l for t in self.tournees if t.type == "MULTI" and len(t.profil) >= 2
              for l in [ot.lignes_de(t)]][0]
        seq = self.plan.sequence(ls, "S")
        allees = [l.allee for l in seq]
        self.assertEqual(allees, sorted(allees, key=self.plan.x))

    def test_excel(self):
        sortie = self.dossier / "t.xlsx"
        ot.ecrire_excel(sortie, self.tournees, self.plan, self.fifo, None,
                        ot.controler(self.tournees, self.lignes), self.anomalies,
                        {"passes": 0, "ameliorations": 0, "duree_s": 0}, "test")
        import openpyxl
        wb = openpyxl.load_workbook(sortie)
        self.assertEqual(wb.sheetnames, ["SYNTHESE", "TOURNEES", "PRELEVEMENT", "PREVISIONNEL",
                                         "CONTROLES", "ANOMALIES", "PARAMETRES"])
        self.assertEqual(wb["PRELEVEMENT"].max_row - 1, len(self.lignes))


class TestCasLimites(unittest.TestCase):
    """Non-régression des écarts trouvés en revue de code."""

    def _ecrire(self, rows):
        d = Path(tempfile.mkdtemp()) / "cas.csv"
        cols = sorted({k for r in rows for k in r})
        with open(d, "w", encoding="utf-8") as f:
            f.write(";".join(cols) + "\n")
            for r in rows:
                f.write(";".join(str(r.get(c, "")) for c in cols) + "\n")
        an = []
        lignes = ot.charger_lignes(d, an)
        plan, ts, _, _ = ot.optimiser(lignes, an, 1)
        return lignes, ts, an

    def _sans_ecart(self, ts, lignes):
        ecarts = [c for c in ot.controler(ts, lignes) if c[1] == "ÉCART"]
        self.assertEqual(ecarts, [])

    def test_retract_au_dela_du_max(self):
        ancien = ot.NIVEAU_MIN_RETRACT
        ot.NIVEAU_MIN_RETRACT = 4
        try:
            rows = [{"commande": "BL1", "emplacement": f"05-{i % 20 + 1:02d}-E", "quantite": 1,
                     "poids_unitaire_kg": 0.1} for i in range(ot.RETRACT_MAX + 5)]
            rows.append({"commande": "BL1", "emplacement": "02-01-A", "quantite": 1, "poids_unitaire_kg": 0.1})
            lignes, ts, an = self._ecrire(rows)
            self.assertTrue(all(t.nb_lignes <= ot.bornes(t.type)[1] for t in ts))
            self._sans_ecart(ts, lignes)
        finally:
            ot.NIVEAU_MIN_RETRACT = ancien

    def test_commande_plus_grande_que_le_chariot(self):
        rows = [{"commande": "BL2", "emplacement": f"03-{i % 20 + 1:02d}-A", "quantite": 1,
                 "poids_unitaire_kg": 9, "num_colis": i, "type_contenant": "C9"} for i in range(30)]
        lignes, ts, an = self._ecrire(rows)
        self.assertGreater(len(ts), 1)
        self._sans_ecart(ts, lignes)

    def test_colis_numerotes_par_commande(self):
        rows = []
        for c in range(6):
            for i in range(4):
                rows.append({"commande": f"BL{c}", "emplacement": f"0{c + 1}-0{i + 1}-A", "quantite": 1,
                             "poids_unitaire_kg": 0.2, "num_colis": 1, "type_contenant": "C13",
                             "tournee_wms": "TW1"})
        lignes, ts, an = self._ecrire(rows)
        self._sans_ecart(ts, lignes)
        wms = ot.tournees_wms(lignes, ot.Plan(lignes))
        self.assertEqual(len(ot.colis_de(wms[0])), 6)

    def test_monoligne_bac_jamais_avec_cartons(self):
        rows = [{"commande": f"M{i}", "emplacement": f"0{i % 9 + 1}-01-A", "quantite": 1, "poids_unitaire_kg": 0.1,
                 "flux": "AGENCE" if i % 2 else "CLIENT", "type_contenant": "D11" if i % 2 else ""}
                for i in range(30)]
        lignes, ts, an = self._ecrire(rows)
        for t in ts:
            self.assertEqual(len({ot.est_carton(c.contenant) for c in ot.colis_de(t)}), 1)
        self._sans_ecart(ts, lignes)


if __name__ == "__main__":
    unittest.main(verbosity=2)
