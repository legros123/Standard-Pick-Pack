#!/usr/bin/env python3
"""Contrôle automatique de l'optimiseur : python3 outils/tournees/test_optimiseur.py"""
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI))
import optimiseur_tournees as ot  # noqa: E402


def ecrire(rows, dossier=None):
    d = Path(dossier or tempfile.mkdtemp()) / "cas.csv"
    cols = sorted({k for r in rows for k in r})
    with open(d, "w", encoding="utf-8") as f:
        f.write(";".join(cols) + "\n")
        for r in rows:
            f.write(";".join(str(r.get(c, "")) for c in cols) + "\n")
    return d


def ligne(cmd, allee, pos, cont="C11", num="1", vague="V1", **kw):
    r = {"COMMANDE": cmd, "EMPLACEMENT": f"54APP{allee:02d}{pos:03d}01A", "ZONE": "PICK01A14",
         "VAGUE": vague, "QTE_PREVUE": 1, "PDS_LIGNE": 500, "VOL_LIGNE": 100000, "CONTENANT": num,
         "TYPE_CONTENANT": cont, "STYP_TOUR": "DETA", "ETAT_LIGNE": "TERM"}
    r.update(kw)
    return r


class TestJeuEssai(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.dossier = Path(tempfile.mkdtemp())
        cls.csv = cls.dossier / "jeu.csv"
        subprocess.run([sys.executable, str(ICI / "generer_jeu_test.py"), "--commandes", "500",
                        "--sortie", str(cls.csv)], check=True, capture_output=True)
        cls.an, cls.cp = [], {}
        cls.lignes = ot.charger_lignes(cls.csv, cls.an, cls.cp)
        cls.plan, cls.ts, _ = ot.optimiser(cls.lignes, cls.an, 6)
        cls.ref = ot.tournees_logys(cls.lignes)

    def test_lecture(self):
        self.assertGreater(self.cp.get("annulees", 0), 0)
        self.assertGreater(self.cp.get("hors_zone:AEROSOLS", 0), 0)
        self.assertTrue(all(l.zone == "PICK01A14" for l in self.lignes))

    def test_controles_conformes(self):
        self.assertEqual([c for c in ot.controler(self.ts, self.lignes) if c[1] == "ÉCART"], [])

    def test_capacites(self):
        for t in self.ts:
            if t.type == "MULTI":
                self.assertLessEqual(t.nb_lignes, ot.LIGNES_MAX)
                self.assertLessEqual(t.eq, ot.CHARIOT_EQ_C16 + 1e-9)
            if t.type == "MONO":
                self.assertLessEqual(t.ncolis, ot.MONO_MAX)

    def test_mieux_que_logys_simule(self):
        o, r = ot.total(self.ts, self.plan), ot.total(self.ref, self.plan)
        self.assertLess(o["distance"], r["distance"])
        self.assertEqual(o["cmd_coupees"], 0)

    def test_excel(self):
        sortie = self.dossier / "t.xlsx"
        ot.ecrire_excel(sortie, self.ts, self.plan, self.ref, ot.controler(self.ts, self.lignes), self.an,
                        {"ameliorations": 0, "duree_s": 0}, "test", self.cp)
        import openpyxl
        wb = openpyxl.load_workbook(sortie)
        self.assertEqual(wb.sheetnames, ["SYNTHESE", "TOURNEES", "PRELEVEMENT", "PREVISIONNEL",
                                         "CONTROLES", "REAFFECTATION", "ANOMALIES", "PARAMETRES"])
        self.assertEqual(wb["PRELEVEMENT"].max_row - 1, len(self.lignes))


class TestModele(unittest.TestCase):
    def test_emplacement_logys(self):
        self.assertEqual(ot.decouper_emplacement("54APP0302201A"), (3, 22, 1))
        self.assertEqual(ot.decouper_emplacement("54APP0608105"), (6, 81, 5))
        self.assertEqual(ot.decouper_emplacement("54APP1310812H"), (13, 108, 12))
        self.assertEqual(ot.decouper_emplacement("54APA2105802D")[0], 21)   # rétract : hors zone pick

    def test_equivalents_c16(self):
        self.assertAlmostEqual(ot.eq_c16("C16"), 1)
        self.assertAlmostEqual(ot.eq_c16("C11"), 600 * 400 / (335 * 190))

    def test_sens_unique(self):
        p = ot.Plan()
        L = p.L
        # allée 1 seule (impaire, vers le fond) : retour obligatoire par une paire -> 2
        d, ch = p.chemin(1 << 1)
        self.assertEqual(ch, [1, 2])
        self.assertAlmostEqual(d, L[1] + L[2] + 2 * (p.x(2) - p.x0))
        # allée 2 seule (paire, vers la sortie) : il faut d'abord aller au fond par la 1
        self.assertEqual(p.chemin(1 << 2)[1], [1, 2])
        # 1 et 3 (deux impaires) : la 2 sert de retour entre les deux, la 4 pour revenir
        self.assertEqual(p.chemin((1 << 1) | (1 << 3))[1], [1, 2, 3, 4])
        # 4 et 5 : une impaire courte (1 ou 3, même longueur) pour aller au fond, 4 revient, 5, 6
        self.assertIn(p.chemin((1 << 4) | (1 << 5))[1], ([1, 4, 5, 6], [3, 4, 5, 6]))
        # chaque allée du chemin est parcourue dans son sens : on alterne fond / avant
        for m in range(2, 1 << 15, 97):
            ch = p.chemin(m & ~1)[1]
            if ch:
                self.assertEqual([a % 2 for a in ch], [1, 0] * (len(ch) // 2))

    def test_sequence(self):
        p = ot.Plan()
        ls = [ot.Ligne(i, "C", "", "V", "", "DETA", "PICK01A14", "", a, pos, 0, "", "", 1, 0, None, "1", "C11", "")
              for i, (a, pos) in enumerate([(5, 90), (2, 10), (5, 20), (2, 30)])]
        self.assertEqual([(l.allee, l.position) for l in p.sequence(ls)], [(2, 10), (2, 30), (5, 20), (5, 90)])


class TestCasLimites(unittest.TestCase):
    def _run(self, rows):
        an, cp = [], {}
        lignes = ot.charger_lignes(ecrire(rows), an, cp)
        plan, ts, _ = ot.optimiser(lignes, an, 1)
        return lignes, ts, an

    def _ok(self, ts, lignes):
        self.assertEqual([c for c in ot.controler(ts, lignes) if c[1] == "ÉCART"], [])

    def test_commande_plus_grande_que_le_chariot(self):
        rows = [ligne("BIG", 4 + i % 10, 30 + i, cont="C9", num=str(i)) for i in range(30)]   # 30 × 3,77 éq.
        lignes, ts, an = self._run(rows)
        self.assertGreater(len(ts), 1)
        self.assertTrue(all(t.eq <= ot.CHARIOT_EQ_C16 for t in ts))
        self.assertTrue(any(a[0] == "Découpage" for a in an))
        self._ok(ts, lignes)

    def test_monolignes(self):
        rows = [ligne(f"M{i}", 1 + i % 14, 30, cont="C16", num="1") for i in range(80)]
        lignes, ts, an = self._run(rows)
        self.assertEqual({t.type for t in ts}, {"MONO"})
        self.assertTrue(all(ot.MONO_MIN <= t.ncolis <= ot.MONO_MAX for t in ts))
        self._ok(ts, lignes)

    def test_peu_de_monolignes_vont_en_multi(self):
        rows = [ligne(f"M{i}", 4, 30 + i, cont="C16", num="1") for i in range(10)]
        lignes, ts, an = self._run(rows)
        self.assertEqual({t.type for t in ts}, {"MULTI"})

    def test_monoligne_agence_reste_en_multi(self):
        rows = [ligne(f"B{i}", 4, 30, cont="B16", num="1") for i in range(50)]
        lignes, ts, an = self._run(rows)
        self.assertEqual({t.type for t in ts}, {"MULTI"})

    def test_vagues_jamais_melangees(self):
        rows = [ligne(f"V{i}", 4, 30, num="1", vague=f"VAG{i % 2}") for i in range(20)]
        lignes, ts, an = self._run(rows)
        self.assertTrue(all(len({b.vague for b in t.blocs}) == 1 for t in ts))

    def test_monolignes_comptees_comme_construites(self):
        # 30 monolignes C16 + 10 monolignes sans type : seules les 30 comptent -> < 36 -> tout en multi
        rows = [ligne(f"M{i}", 4, 30 + i, cont="C16") for i in range(30)]
        rows += [ligne(f"X{i}", 5, 30 + i, cont="") for i in range(10)]
        lignes, ts, an = self._run(rows)
        self.assertNotIn("MONO", {t.type for t in ts})

    def test_quantite_zero_conservee(self):
        an, cp = [], {}
        lignes = ot.charger_lignes(ecrire([ligne("Q", 4, 30, QTE_PREVUE=0)]), an, cp)
        self.assertEqual(lignes[0].qte, 0)

    def test_emplacement_inconnu_signale(self):
        an, cp = [], {}
        rows = [ligne("A", 4, 30), {**ligne("B", 4, 30), "EMPLACEMENT": "54APP1501001A"}]
        lignes = ot.charger_lignes(ecrire(rows), an, cp)
        self.assertEqual(len(lignes), 1)
        self.assertTrue(any(a[0] == "Emplacement" for a in an))

    def test_main_ne_modifie_pas_les_reglages(self):
        avant = ot.LIGNES_MAX
        d = ecrire([ligne(f"C{i}", 4, 30 + i) for i in range(3)])
        ot.main([str(d), "--lignes-max", "60", "--sortie", str(d.with_suffix(".xlsx")), "--temps-calcul", "0.2"])
        self.assertEqual(ot.LIGNES_MAX, avant)

    def test_reaffectation(self):
        # deux tournées Logys mal faites (mêmes allées éclatées) : chaque contenant reçoit une nouvelle tournée
        rows = [ligne(f"C{i}", 4 + i % 2, 30 + i, num=str(i), CHARIOT=f"TO{i % 2}") for i in range(60)]
        lignes, ts, an = self._run(rows)
        rea, bil = ot.plan_reaffectation(ts)
        self.assertEqual(len(rea), 60)                       # un contenant = une ligne du plan
        self.assertEqual(bil["contenants"], 60)
        self.assertTrue(all(r[6] for r in rea))              # chaque contenant a une tournée cible
        # une tournée identique à Logys garde son numéro
        rows = [ligne(f"K{i}", 4, 30 + i, cont="C16", num=str(i), CHARIOT="TOK") for i in range(55)]   # 1 tournée mono
        lignes, ts, an = self._run(rows)
        rea, bil = ot.plan_reaffectation(ts)
        self.assertEqual(bil["inchangees"], 1)
        self.assertEqual({r[6] for r in rea}, {"TOK"})

    def test_figer_tournees_entamees(self):
        rows = [ligne(f"E{i}", 4, 30 + i, num=str(i), CHARIOT="TO_ENCO", ETAT_LIGNE="ENCO") for i in range(5)]
        rows += [ligne(f"P{i}", 5, 30 + i, num=str(i), CHARIOT="TO_PREV", ETAT_LIGNE="PREV") for i in range(5)]
        d = ecrire(rows)
        sortie = d.with_suffix(".xlsx")
        ot.main([str(d), "--figer-entamees", "--sortie", str(sortie), "--temps-calcul", "0.2"])
        import csv as _csv
        with open(sortie.with_name(sortie.stem + "_reaffectation.csv"), encoding="utf-8-sig") as f:
            r = list(_csv.reader(f, delimiter=";"))[1:]
        self.assertEqual({x[5] for x in r}, {"TO_PREV"})     # la tournée entamée n'est pas dans le plan

    def test_annulees_et_hors_zone(self):
        rows = [ligne("A", 4, 30, ETAT_LIGNE="ANNU"), ligne("B", 4, 31, ZONE="ARETRACT"), ligne("C", 4, 32)]
        an, cp = [], {}
        lignes = ot.charger_lignes(ecrire(rows), an, cp)
        self.assertEqual([l.commande for l in lignes], ["C"])
        self.assertEqual(cp["annulees"], 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
