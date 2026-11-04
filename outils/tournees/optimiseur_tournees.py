#!/usr/bin/env python3
"""
OPTIMISEUR DE TOURNÉES PICK & PACK — CLR Champigneulles (WMS Logys, Oracle)
=============================================================================

Lit les lignes à préparer extraites de Logys (CSV ou XLSX) et refait les tournées :
quelles commandes partent ensemble sur un chariot, dans quel ordre on les lance et
dans quel ordre l'opérateur passe aux emplacements. Compare ensuite, ligne pour
ligne, avec les tournées que Logys a réellement créées.

Modèle (mesuré sur les tournées Logys des 21-23/10/2026, voir LISEZMOI) :
  - Zone pick PICK01A14 : allées A01 à A14, emplacement 54APP + allée(2) + position(3)
    + niveau(2) + case. Les positions croissent dans le sens de marche.
  - Sens unique : allées impaires dans le sens entrée (vers le fond), allées paires
    dans le sens sortie, traverse à chaque bout -> on traverse toujours une allée
    en entier ; une allée vide peut servir à changer de bout.
  - Chariot : 45 équivalents C16 (chaque contenant posé sur sa plus grande face ;
    les vraies tournées Logys plafonnent à 44-45).
  - Tournée multi-lignes (DETA) : 50 à 180 lignes.
  - Tournée monolignes (P13) : 36 à 72 C16, commandes d'une ligne en C16 / C14.
    Les monolignes agences (B16 / A16) restent en multi-lignes, comme dans Logys.
  - Tournée carton complet (CART) : limites Logys MODEL_REAL (80 contenants, 800 kg,
    2,8 m³).
  - Une tournée = une seule vague (NUM_ORDRE_PREP). Bacs et cartons peuvent partager
    un chariot (P03 interdit la confusion, pas le mélange : Logys le fait déjà).
  - Une commande n'est jamais répartie sur deux chariots, sauf si elle ne tient pas
    sur un seul (P05 : BL, tournée et nombre de colis concordants).
  - Hors zone pick (rétract, aérosols, préparateur, hors gabarit…) : non touché,
    ces tournées restent celles de Logys.

Méthode :
  1. construction : on part d'une graine, puis on ajoute la commande qui coûte le moins
     de mètres par ligne ;
  2. descente : déplacer une commande, échanger deux commandes, supprimer une petite
     tournée ;
  3. recherche itérée : défaire et refaire des tournées voisines tant qu'il reste du
     temps ;
  4. contrôle : toutes les règles revérifiées sur le résultat.

  python3 outils/tournees/optimiseur_tournees.py lignes.xlsx --sortie tournees.xlsx
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import math
import random
import re
import sys
import time
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path

# ═══════════════════════════ RÉGLAGES ═══════════════════════════
# ── Taille des tournées (validé superviseur 04/11/2026) ──
LIGNES_MIN, LIGNES_MAX = 50, 180      # multi-lignes (DETA)
MONO_MIN, MONO_MAX = 36, 72           # monolignes : nombre de C16 (= étiquettes)
MONO_CONTENANTS = {"C16"}             # tournées monolignes : C16 uniquement (validé superviseur 04/11/2026)

# ── Chariot ──
CHARIOT_EQ_C16 = 45                   # capacité : 45 C16 (surface au sol équivalente)
CHARIOT_POIDS_MAX = 800.0             # kg — Logys MODEL_REAL (CART), non limitant en détail
# Carton complet (STYP CART) — Logys MODEL_REAL PREP/CART/PREPARATEUR
CART_CONT_MAX, CART_POIDS_MAX, CART_VOL_MAX_L = 80, 800.0, 2800.0

# ── Contenants Logys (dimensions mm, requête contenants du dictionnaire tournée) ──
CONTENANTS = {
    # code: (x, y, z, famille, flux)
    "C16": (335, 97, 190, "CARTON", "CLIENT"),
    "C14": (400, 150, 200, "CARTON", "CLIENT"),
    "C13": (400, 300, 200, "CARTON", "CLIENT"),
    "C12": (600, 200, 200, "CARTON", "CLIENT"),
    "C11": (600, 400, 200, "CARTON", "CLIENT"),
    "C9":  (600, 400, 300, "CARTON", "CLIENT"),
    "B16": (330, 100, 194, "BAC", "AGENCE"),     # bleu foncé — MAD agences
    "B13": (400, 280, 265, "BAC", "AGENCE"),
    "D11": (600, 433, 250, "BAC", "AGENCE"),     # bleu ciel
    "A16": (330, 100, 194, "BAC", "REASSORT"),   # jaune
    "A13": (400, 300, 270, "BAC", "REASSORT"),
    "A11": (600, 417, 268, "BAC", "REASSORT"),
    "CARTON": (380, 271, 155, "FOURNISSEUR", "CLIENT"),   # carton complet (dimension moyenne)
    "COLIS": (2, 2, 2, "AUTRE", "CLIENT"),
}
ORDRE_CHOIX = {"CLIENT": ["C16", "C14", "C13", "C12", "C11", "C9"],
               "AGENCE": ["B16", "B13", "D11"], "REASSORT": ["A16", "A13", "A11"]}
TAUX_REMPLISSAGE = 0.85      # si Logys n'a pas encore créé les colis : remplissage maxi

# ── Plan de la zone pick ──
ZONES_OPTIMISEES = {"PICK01A14"}
ALLEES = list(range(1, 15))          # A01…A14 (A14 présente dans les données Logys)
ALLEE_LARGEUR_MODULE = 3.0           # m entre l'axe de deux allées voisines — À CONFIRMER
METRES_PAR_POSITION = 0.5            # m par numéro de position (impair/pair face à face) — À CONFIRMER
TRAVERSE_M = 3.0                     # m ajoutés à chaque allée traversée (entrée + sortie de traverse)
ALLEE_DEPART = 1                     # le chariot part et revient devant l'allée 1 (poste info)
# Sens de circulation : +1 = de la traverse avant vers le fond (impaires), -1 = du fond vers l'avant
SENS_ALLEE = {a: (1 if a % 2 else -1) for a in ALLEES}
# Longueur des allées en positions (min, max) — relevée sur 25 206 lignes Logys
POSITIONS = {1: (5, 32), 2: (5, 32), 3: (5, 32), 4: (23, 122), 5: (19, 118), 6: (23, 122),
             7: (19, 117), 8: (23, 122), 9: (19, 118), 10: (23, 122), 11: (19, 117),
             12: (23, 122), 13: (19, 118), 14: (24, 112)}
ALLEE_COMPOSES = 11                  # P16
# Mode exploitation (--figer-entamees) : une tournée Logys dont une ligne est dans un de ces états
# est déjà commencée -> on ne la touche pas
ETATS_ENTAMES = {"ENCO", "TERM", "PREL", "VALI"}

# ── Temps standards (s) — calés sur la productivité détail réelle (voir LISEZMOI) ──
# calage : les tournées Logys réelles (21-23/10) donnent 69 lignes/h = productivité détail 2026 (513 l/j)
TEMPS = {"fixe": 230.0, "ligne": 30.5, "unite": 1.4, "colis": 11.5, "vitesse": 0.84}
try:   # même quota que le bilan mensuel
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from bilan_mensuel import H_REF
except Exception:
    H_REF = 7.4
RENDEMENT_ETP = 0.85

# ── Optimisation ──
TEMPS_CALCUL_MAX = 90.0      # s au total, réparties selon la taille des vagues
CHARIOT_PLEIN_MARGE = 2.0    # éq. C16 : à moins de 2 C16 de la capacité, le chariot est considéré plein
PENALITE_CHARIOT_PLEIN = 20.0   # m par ligne manquante quand le chariot est déjà plein (meilleur compromis testé : 0, 20, 50, 100, 200)
PENALITE_SOUS_MIN = 500.0    # m « équivalents » par ligne manquante : le minimum est tenu dès que la vague le permet
# ═══════════════════════════════════════════════════════════════

C16_SURFACE = 335 * 190      # C16 posé à plat (plus grande face)
VOL_LOGYS_PAR_LITRE = 100_000  # LIG_TOUR.VOL / CONTENANT.VOL : 1/100 cm³

ALIAS = {
    "commande": ["commande", "num_ordre", "num_commande", "bl", "num_bl"],
    "client": ["client", "cod_client", "cod_client_liv", "agence"],
    "vague": ["vague", "num_ordre_prep", "depart"],
    "tournee_wms": ["chariot", "tournee_wms", "num_tour", "tournee"],
    "styp": ["styp_tour", "service", "styp"],
    "zone": ["zone", "zone_mvt_prise", "zone_mvt"],
    "emplacement": ["emplacement", "emp_prise", "emp"],
    "allee": ["allee", "allee_mvt_prise"],
    "reference": ["article", "reference", "num_art", "ref"],
    "designation": ["designation", "lib_art", "libelle"],
    "quantite": ["qte_prevue", "quantite", "prev", "qte"],
    "pds_ligne_g": ["pds_ligne", "pds"],
    "vol_ligne_logys": ["vol_ligne", "vol"],
    "poids_unitaire_kg": ["poids_unitaire_kg"],
    "volume_unitaire_l": ["volume_unitaire_l"],
    "colis": ["contenant", "num_cont_depose", "num_colis", "colis"],
    "contenant": ["type_contenant", "num_art_emb", "contenant_type"],
    "etat": ["etat_ligne", "etat_lig_tour", "etat"],
    "jour": ["jour"],
}


# ─────────────────────────── modèle ───────────────────────────
@dataclass
class Ligne:
    idx: int
    commande: str
    client: str
    vague: str
    jour: str
    styp: str
    zone: str
    emplacement: str
    allee: int
    position: int
    niveau: int
    reference: str
    designation: str
    qte: float
    poids: float          # kg (ligne)
    volume: float | None  # L (ligne)
    colis: str
    contenant: str
    tournee_wms: str
    etat: str = ""

    @property
    def compose(self):
        return self.allee == ALLEE_COMPOSES


@dataclass
class Colis:
    id: str
    contenant: str
    lignes: list = field(default_factory=list)


def eq_c16(code: str) -> float:
    x, y, z, *_ = CONTENANTS.get(code, CONTENANTS["C13"])
    return x * max(y, z) / C16_SURFACE


@dataclass
class Bloc:
    """Unité indivisible : une commande (ou un morceau si elle dépasse un chariot)."""
    id: str
    commande: str
    vague: str
    type: str                 # MULTI / MONO / CART
    colis: list
    nb_lignes: int = 0
    unites: float = 0.0
    poids: float = 0.0
    volume: float = 0.0
    eq: float = 0.0
    masque: int = 0           # allées à traverser (bit a = allée a)
    ordre_arrivee: int = 0

    def finaliser(self):
        ls = [l for c in self.colis for l in c.lignes]
        self.nb_lignes = len(ls)
        self.unites = sum(l.qte for l in ls)
        self.poids = sum(l.poids for l in ls)
        self.volume = sum(l.volume or 0 for l in ls)
        self.eq = sum(eq_c16(c.contenant) for c in self.colis)
        m = 0
        for l in ls:
            m |= 1 << l.allee
        self.masque = m
        self.ordre_arrivee = min(l.idx for l in ls)
        return self


# ─────────────────────────── lecture ───────────────────────────
def _norm(s) -> str:
    s = str(s or "").strip().lower()
    for a, b in (("é", "e"), ("è", "e"), ("ê", "e"), ("à", "a"), ("ô", "o")):
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "_", s).strip("_")


def lire_table(chemin: Path) -> list[dict]:
    if chemin.suffix.lower() in (".xlsx", ".xlsm"):
        import openpyxl
        wb = openpyxl.load_workbook(chemin, read_only=True, data_only=True)
        for ws in wb.worksheets:   # première feuille qui ressemble à des lignes de tournée
            it = ws.iter_rows(values_only=True)
            try:
                tete = [_norm(h) for h in next(it)]
            except StopIteration:
                continue
            if "emplacement" in tete or "emp_prise" in tete:
                return [dict(zip(tete, r)) for r in it if any(v not in (None, "") for v in r)]
        sys.exit(f"{chemin} : aucune feuille avec une colonne EMPLACEMENT")
    brut = chemin.read_bytes()
    for enc in ("utf-8-sig", "cp1252", "latin-1"):
        try:
            texte = brut.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    l0 = texte.splitlines()[0]
    sep = ";" if l0.count(";") >= l0.count(",") else ","
    return [{_norm(k): v for k, v in r.items()} for r in csv.DictReader(texte.splitlines(), delimiter=sep)]


def _val(r, champ):
    for a in ALIAS[champ]:
        v = r.get(a)
        if v not in (None, ""):
            return v
    return None


def _num(v, defaut=None):
    if v is None or v == "":
        return defaut
    if isinstance(v, (int, float)):
        return float(v)
    try:
        return float(str(v).replace(",", ".").replace(" ", ""))
    except ValueError:
        return defaut


RX_LOGYS = re.compile(r"^\d{2}AP[A-Z](\d{2})(\d{3})(\d{2})([A-Z]?)$")


def decouper_emplacement(empl) -> tuple[int | None, int | None, int]:
    """54APP0302201A -> (3, 22, 1) : allée, position, niveau. Repli : 'AA-PPP-NN' séparés."""
    s = str(empl or "").strip().upper()
    m = RX_LOGYS.match(s)
    if m:
        return int(m.group(1)), int(m.group(2)), int(m.group(3))
    nums = [int(x) for x in re.findall(r"\d+", s)]
    if len(nums) >= 2:
        return nums[0], nums[1], nums[2] if len(nums) > 2 else 0
    return None, None, 0


def charger_lignes(chemin: Path, anomalies: list, compteurs: dict) -> list[Ligne]:
    lignes = []
    for i, r in enumerate(lire_table(chemin)):
        etat = str(_val(r, "etat") or "").upper()
        if etat.startswith("ANNU"):
            compteurs["annulees"] = compteurs.get("annulees", 0) + 1
            continue
        cmd = str(_val(r, "commande") or "").strip()
        empl = str(_val(r, "emplacement") or "").strip()
        zone = str(_val(r, "zone") or "").strip().upper()
        if not cmd:
            anomalies.append(("Donnée", f"ligne {i + 2}", "commande vide — ignorée"))
            continue
        allee, pos, niv = decouper_emplacement(empl)
        if allee is None and _val(r, "allee"):
            d = re.findall(r"\d+", str(_val(r, "allee")))
            allee = int(d[0]) if d else None
        if ZONES_OPTIMISEES and zone and zone not in ZONES_OPTIMISEES:
            compteurs[f"hors_zone:{zone}"] = compteurs.get(f"hors_zone:{zone}", 0) + 1
            continue
        if allee not in POSITIONS:
            if zone:   # dans la zone pick mais emplacement inconnu : signalé, pas routable
                anomalies.append(("Emplacement", f"commande {cmd}",
                                  f"« {empl} » hors allées A01-A{max(POSITIONS):02d} : ligne laissée à Logys"))
            compteurs[f"hors_zone:{zone or '?'}"] = compteurs.get(f"hors_zone:{zone or '?'}", 0) + 1
            continue
        if pos is None:
            anomalies.append(("Emplacement", f"commande {cmd}", f"position illisible « {empl} »"))
            pos = POSITIONS[allee][0]
        qte = _num(_val(r, "quantite"), 1.0)
        if _val(r, "pds_ligne_g") is not None:
            poids = _num(_val(r, "pds_ligne_g"), 0) / 1000
        else:
            poids = _num(_val(r, "poids_unitaire_kg"), 0) * qte
        if _val(r, "vol_ligne_logys") is not None:   # Logys : VOL en 1/100 cm³ (carton 415×278×102 = 1 176 774)
            vol = _num(_val(r, "vol_ligne_logys"), 0) / VOL_LOGYS_PAR_LITRE
        elif _val(r, "volume_unitaire_l") is not None:
            vol = _num(_val(r, "volume_unitaire_l"), 0) * qte
        else:
            vol = None
        styp = str(_val(r, "styp") or "DETA").strip().upper()
        jour = _val(r, "jour")
        lignes.append(Ligne(
            idx=i, commande=cmd, client=str(_val(r, "client") or ""),
            vague=str(_val(r, "vague") or "UNIQUE").strip(),
            jour=jour.strftime("%d/%m/%Y") if hasattr(jour, "strftime") else str(jour or ""),
            styp="CART" if styp.startswith("CART") else "DETA", zone=zone, emplacement=empl,
            allee=allee, position=pos, niveau=niv,
            reference=str(_val(r, "reference") or ""), designation=str(_val(r, "designation") or ""),
            qte=qte, poids=poids, volume=vol,
            colis=str(_val(r, "colis") or "").strip(),
            contenant=str(_val(r, "contenant") or "").strip().upper(),
            tournee_wms=str(_val(r, "tournee_wms") or "").strip(), etat=etat))
    if not lignes:
        sys.exit(f"Aucune ligne de la zone {', '.join(ZONES_OPTIMISEES)} dans {chemin}")
    return lignes


# ─────────────────────────── plan & parcours ───────────────────────────
class Plan:
    """Zone pick à sens unique : chaque allée visitée est traversée en entier dans son sens."""

    def __init__(self):
        self.allees = sorted(ALLEES)
        self.L = {a: (POSITIONS[a][1] - POSITIONS[a][0]) * METRES_PAR_POSITION + TRAVERSE_M for a in self.allees}
        self.x0 = self.x(ALLEE_DEPART)
        self._memo = {}

    @staticmethod
    def x(a: int) -> float:
        return (a - 1) * ALLEE_LARGEUR_MODULE

    def chemin(self, masque: int) -> tuple[float, list[int]]:
        """Plus court circuit départ -> allées requises -> départ, en respectant les sens.
        Programmation dynamique sur les allées de gauche à droite, état = traverse avant (0)
        ou arrière (1). Une allée non requise peut être traversée pour changer de bout."""
        if masque in self._memo:
            return self._memo[masque]
        if not masque:
            return 0.0, []
        INF = math.inf
        dp = {0: (0.0, ()), 1: (INF, ())}
        derniere_req = max(a for a in self.allees if masque >> a & 1)
        meilleur = (INF, ())
        for a in self.allees:
            dep, arr = (0, 1) if SENS_ALLEE[a] > 0 else (1, 0)
            requise = masque >> a & 1
            nv = {0: (INF, ()), 1: (INF, ())} if requise else dict(dp)
            c, ch = dp[dep]
            if c + self.L[a] < nv[arr][0]:
                nv[arr] = (c + self.L[a], ch + (a,))
            dp = nv
            if a >= derniere_req and dp[0][0] < INF:
                tot = dp[0][0] + 2 * (self.x(a) - self.x0)
                if tot < meilleur[0]:
                    meilleur = (tot, dp[0][1])
        res = (meilleur[0], list(meilleur[1]))
        self._memo[masque] = res
        return res

    def distance(self, masque: int) -> float:
        return self.chemin(masque)[0]

    def sequence(self, lignes: list[Ligne]) -> list[Ligne]:
        """Ordre de passage : allées de gauche à droite, positions croissantes (sens de marche)."""
        return sorted(lignes, key=lambda l: (l.allee, l.position, l.niveau))


# ─────────────────────────── colis & blocs ───────────────────────────
def colis_calcules(cmd, lignes, anomalies) -> list[Colis]:
    """Si Logys n'a pas encore créé les colis : rangement décroissant dans le plus petit contenant.
    Commande PV- -> bacs jaunes réassort ; sinon cartons client (une commande MAD agence
    ne se reconnaît qu'à son contenant Logys : à défaut, carton)."""
    flux = "REASSORT" if cmd.upper().startswith("PV") else "CLIENT"
    choix = ORDRE_CHOIX[flux]
    vol = lambda c: CONTENANTS[c][0] * CONTENANTS[c][1] * CONTENANTS[c][2] / 1e6 * TAUX_REMPLISSAGE
    cap = vol(choix[-1])
    bacs = []
    for l in sorted(lignes, key=lambda l: -(l.volume or 1)):
        v = l.volume or 1
        for b in bacs:
            if sum(x.volume or 1 for x in b) + v <= cap:
                b.append(l)
                break
        else:
            bacs.append([l])
    res = []
    for k, b in enumerate(bacs, 1):
        v = sum(x.volume or 1 for x in b)
        code = next((c for c in choix if v <= vol(c)), choix[-1])
        if v > cap:
            anomalies.append(("Contenant (P07)", f"commande {cmd}", f"{v:.0f} L : hors gabarit, à vérifier"))
        res.append(Colis(f"{cmd}/{k}", code, b))
    return res


def bornes(t: str) -> tuple[int, int]:
    return {"MONO": (MONO_MIN, MONO_MAX), "CART": (1, CART_CONT_MAX)}.get(t, (LIGNES_MIN, LIGNES_MAX))


def admissible(type_, lignes, eq, poids, volume, ncolis) -> bool:
    if type_ == "MONO":
        return ncolis <= MONO_MAX
    if type_ == "CART":
        return ncolis <= CART_CONT_MAX and poids <= CART_POIDS_MAX and volume <= CART_VOL_MAX_L
    return lignes <= LIGNES_MAX and eq <= CHARIOT_EQ_C16 + 1e-9 and poids <= CHARIOT_POIDS_MAX


def admissible_blocs(type_, blocs) -> bool:
    return admissible(type_, sum(b.nb_lignes for b in blocs), sum(b.eq for b in blocs),
                      sum(b.poids for b in blocs), sum(b.volume for b in blocs), sum(len(b.colis) for b in blocs))


def construire_blocs(lignes: list[Ligne], anomalies: list) -> list[Bloc]:
    par = defaultdict(list)
    for l in lignes:
        par[(l.vague, l.commande, l.styp)].append(l)
    inconnus = set()
    groupes = []
    for (vague, cmd, styp), ls in par.items():
        if all(l.colis for l in ls):
            pc = defaultdict(list)
            for l in ls:
                pc[l.colis].append(l)
            colis = [Colis(f"{cmd}/{k}", v[0].contenant or "C13", v) for k, v in pc.items()]
        else:
            colis = colis_calcules(cmd, ls, anomalies)
        for c in colis:
            if c.contenant not in CONTENANTS and c.contenant not in inconnus:
                inconnus.add(c.contenant)
                anomalies.append(("Contenant", c.contenant, "type inconnu : compté comme un C13 (1,89 éq. C16)"))
        mono = styp != "CART" and len(ls) == 1 and colis[0].contenant in MONO_CONTENANTS
        groupes.append((vague, cmd, styp, ls, colis, mono))
    # vague avec moins de MONO_MIN monolignes : elles rejoignent les multi-lignes (pas de mini-tournée P13)
    mono_v = defaultdict(int)
    for g in groupes:
        mono_v[g[0]] += g[5]
    blocs = []
    for vague, cmd, styp, ls, colis, mono in groupes:
        if styp == "CART":
            type_ = "CART"
        elif mono and mono_v[vague] >= MONO_MIN:
            type_ = "MONO"
        else:
            type_ = "MULTI"
        # découpage si la commande ne tient pas sur un chariot (par colis entiers)
        morceaux, cur = [], []
        for c in sorted(colis, key=lambda c: min(l.allee * 1000 + l.position for l in c.lignes)):
            b = Bloc("", cmd, vague, type_, cur + [c]).finaliser()
            if cur and not admissible(type_, b.nb_lignes, b.eq, b.poids, b.volume, len(b.colis)):
                morceaux.append(cur)
                cur = [c]
            else:
                cur = cur + [c]
        morceaux.append(cur)
        if len(morceaux) > 1:
            anomalies.append(("Découpage", f"commande {cmd}",
                              f"{len(ls)} lignes / {sum(eq_c16(c.contenant) for c in colis):.0f} éq. C16 : "
                              f"ne tient pas sur un chariot, répartie sur {len(morceaux)} tournées"))
        for k, m in enumerate(morceaux, 1):
            blocs.append(Bloc(cmd if len(morceaux) == 1 else f"{cmd}#{k}", cmd, vague, type_, m).finaliser())
    return blocs


# ─────────────────────────── tournées ───────────────────────────
class Tournee:
    __slots__ = ("blocs", "type", "vague", "nb_lignes", "eq", "poids", "volume", "ncolis", "masque", "_cout")

    def __init__(self, type_, vague, blocs=None):
        self.blocs, self.type, self.vague = list(blocs or []), type_, vague
        self.recalcul()

    def recalcul(self):
        bs = self.blocs
        self.nb_lignes = sum(b.nb_lignes for b in bs)
        self.eq = sum(b.eq for b in bs)
        self.poids = sum(b.poids for b in bs)
        self.volume = sum(b.volume for b in bs)
        self.ncolis = sum(len(b.colis) for b in bs)
        m = 0
        for b in bs:
            m |= b.masque
        self.masque = m
        self._cout = None

    def peut_ajouter(self, b: Bloc, sans: Bloc | None = None) -> bool:
        s = sans
        return admissible(self.type,
                          self.nb_lignes + b.nb_lignes - (s.nb_lignes if s else 0),
                          self.eq + b.eq - (s.eq if s else 0),
                          self.poids + b.poids - (s.poids if s else 0),
                          self.volume + b.volume - (s.volume if s else 0),
                          self.ncolis + len(b.colis) - (len(s.colis) if s else 0))


class Optimiseur:
    def __init__(self, plan: Plan):
        self.plan = plan
        self.fixe_m = TEMPS["fixe"] * TEMPS["vitesse"]

    def cout_brut(self, masque, nb_lignes, type_, eq=0.0) -> float:
        if nb_lignes == 0:
            return 0.0
        manque = max(0, bornes(type_)[0] - nb_lignes)
        plein = type_ == "MULTI" and eq >= CHARIOT_EQ_C16 - CHARIOT_PLEIN_MARGE
        # chariot plein : on ne peut plus ajouter de lignes, la pénalité ne sert qu'à préférer
        # les mélanges « gros contenants + commandes denses en lignes »
        return (self.plan.distance(masque) + self.fixe_m
                + (PENALITE_CHARIOT_PLEIN if plein else PENALITE_SOUS_MIN) * manque)

    def cout(self, t: Tournee) -> float:
        if t._cout is None:
            t._cout = self.cout_brut(t.masque, t.nb_lignes, t.type, t.eq)
        return t._cout

    def _masque(self, blocs):
        m = 0
        for b in blocs:
            m |= b.masque
        return m

    def cout_liste(self, blocs, type_):
        return self.cout_brut(self._masque(blocs), sum(b.nb_lignes for b in blocs), type_, sum(b.eq for b in blocs))

    # 1. construction
    def construire(self, blocs, type_, vague) -> list[Tournee]:
        restants = sorted(blocs, key=lambda b: (-b.masque.bit_length(), -b.nb_lignes))
        tournees = []
        while restants:
            t = Tournee(type_, vague, [restants.pop(0)])
            while True:
                base = self.plan.distance(t.masque)
                best, score_b = None, math.inf
                for i, b in enumerate(restants):
                    if not t.peut_ajouter(b):
                        continue
                    s = (self.plan.distance(t.masque | b.masque) - base) / b.nb_lignes
                    if s < score_b:
                        best, score_b = i, s
                if best is None:
                    break
                t.blocs.append(restants.pop(best))
                t.recalcul()
            tournees.append(t)
        return tournees

    # 2. descente
    def _descente(self, ts: list[Tournee], fin: float) -> int:
        gains, encore = 0, True
        while encore and time.time() < fin:
            encore = False
            for ta in ts:                                   # a) déplacer
                for b in list(ta.blocs):
                    if time.time() > fin:
                        break
                    reste = [x for x in ta.blocs if x is not b]
                    ca = self.cout_liste(reste, ta.type)
                    base_a = self.cout(ta)
                    for tb in ts:
                        if tb is ta or not tb.peut_ajouter(b):
                            continue
                        cb = self.cout_brut(tb.masque | b.masque, tb.nb_lignes + b.nb_lignes, tb.type, tb.eq + b.eq)
                        if ca + cb < base_a + self.cout(tb) - 1e-6:
                            ta.blocs.remove(b); tb.blocs.append(b)
                            ta.recalcul(); tb.recalcul()
                            encore, gains = True, gains + 1
                            break
            ts[:] = [t for t in ts if t.blocs]
            for i, ta in enumerate(ts):                     # b) échanger
                for tb in ts[i + 1:]:
                    if time.time() > fin or not (ta.masque ^ tb.masque):
                        continue
                    fait = False
                    for ba in list(ta.blocs):
                        for bb in list(tb.blocs):
                            if not (ta.peut_ajouter(bb, sans=ba) and tb.peut_ajouter(ba, sans=bb)):
                                continue
                            na = [x for x in ta.blocs if x is not ba] + [bb]
                            nb = [x for x in tb.blocs if x is not bb] + [ba]
                            if self.cout_liste(na, ta.type) + self.cout_liste(nb, tb.type) < \
                                    self.cout(ta) + self.cout(tb) - 1e-6:
                                ta.blocs, tb.blocs = na, nb
                                ta.recalcul(); tb.recalcul()
                                encore, gains, fait = True, gains + 1, True
                                break
                        if fait:
                            break
            for t in sorted(ts, key=lambda t: t.nb_lignes)[:3]:   # c) dissoudre une petite tournée
                if len(ts) < 2 or time.time() > fin:
                    break
                autres = [o for o in ts if o is not t]
                essai = {id(o): list(o.blocs) for o in autres}
                ok = True
                for b in sorted(t.blocs, key=lambda b: -b.nb_lignes):
                    best, bd = None, math.inf
                    for o in autres:
                        cand = essai[id(o)] + [b]
                        if not admissible_blocs(o.type, cand):
                            continue
                        d = self.cout_liste(cand, o.type) - self.cout_liste(essai[id(o)], o.type)
                        if d < bd:
                            best, bd = o, d
                    if best is None:
                        ok = False
                        break
                    essai[id(best)].append(b)
                if ok and sum(self.cout_liste(essai[id(o)], o.type) for o in autres) < \
                        sum(self.cout(o) for o in ts) - 1e-6:
                    for o in autres:
                        o.blocs = essai[id(o)]
                        o.recalcul()
                    ts.remove(t)
                    encore, gains = True, gains + 1
                    break
        return gains

    def _reinserer(self, ts, blocs, type_, vague):
        for b in sorted(blocs, key=lambda b: -b.nb_lignes):
            best, bd = None, self.cout_brut(b.masque, b.nb_lignes, type_, b.eq)
            for t in ts:
                if not t.peut_ajouter(b):
                    continue
                d = self.cout_brut(t.masque | b.masque, t.nb_lignes + b.nb_lignes, type_, t.eq + b.eq) - self.cout(t)
                if d < bd:
                    best, bd = t, d
            if best is None:
                best = Tournee(type_, vague)
                ts.append(best)
            best.blocs.append(b)
            best.recalcul()

    # 3. recherche locale itérée
    def ameliorer(self, ts: list[Tournee], limite_s: float, graine=1) -> int:
        fin = time.time() + limite_s
        gains = self._descente(ts, fin)
        if len(ts) < 2:
            return gains
        type_, vague = ts[0].type, ts[0].vague
        rnd = random.Random(graine)
        meilleur = [list(t.blocs) for t in ts]
        cout_m = sum(self.cout(t) for t in ts)
        essais = 0
        while time.time() < fin and essais < 600:
            essais += 1
            t1 = rnd.choice(ts)
            voisines = sorted((t for t in ts if t is not t1), key=lambda t: -bin(t.masque & t1.masque).count("1"))
            cibles = [t1] + voisines[:rnd.choice((1, 1, 2))]
            libres = [b for t in cibles for b in t.blocs]
            for t in ts:
                if t not in cibles and len(t.blocs) > 1 and rnd.random() < 0.15:
                    b = rnd.choice(t.blocs)
                    t.blocs.remove(b)
                    t.recalcul()
                    libres.append(b)
            ts[:] = [t for t in ts if t not in cibles and t.blocs]
            self._reinserer(ts, libres, type_, vague)
            g = self._descente(ts, fin)
            c = sum(self.cout(t) for t in ts)
            if c < cout_m - 1e-6:
                meilleur, cout_m, gains = [list(t.blocs) for t in ts], c, gains + g + 1
            else:
                ts[:] = [Tournee(type_, vague, bl) for bl in meilleur]
        return gains


# ─────────────────────────── mesures ───────────────────────────
def lignes_de(t: Tournee) -> list[Ligne]:
    return [l for b in t.blocs for c in b.colis for l in c.lignes]


def colis_de(t: Tournee) -> list[Colis]:
    return [c for b in t.blocs for c in b.colis]


def mesurer(t: Tournee, plan: Plan) -> dict:
    ls = lignes_de(t)
    dist = plan.distance(t.masque)
    unites = sum(l.qte for l in ls)
    sec = (TEMPS["fixe"] + TEMPS["ligne"] * len(ls) + TEMPS["unite"] * unites
           + TEMPS["colis"] * t.ncolis + dist / TEMPS["vitesse"])
    return {"lignes": len(ls), "unites": unites, "colis": t.ncolis, "distance": dist, "minutes": sec / 60,
            "commandes": len({b.commande for b in t.blocs}), "allees": bin(t.masque).count("1"),
            "eq": t.eq, "poids": t.poids}


def total(ts, plan) -> dict:
    ms = [mesurer(t, plan) for t in ts]
    lig = sum(m["lignes"] for m in ms)
    mn = sum(m["minutes"] for m in ms)
    sous = sum(1 for t in ts if t.nb_lignes < bornes(t.type)[0])
    cmd_t = defaultdict(set)
    for k, t in enumerate(ts):
        for b in t.blocs:
            cmd_t[(b.vague, b.commande, b.type == "CART")].add(k)
    return {"tournees": len(ms), "lignes": lig, "distance": sum(m["distance"] for m in ms), "minutes": mn,
            "lignes_h": lig / (mn / 60) if mn else 0, "sous_min": sous,
            "lignes_par_tournee": lig / len(ms) if ms else 0,
            "allees_par_tournee": sum(m["allees"] for m in ms) / len(ms) if ms else 0,
            "cmd_coupees": sum(1 for s in cmd_t.values() if len(s) > 1),
            "hors_capacite": sum(1 for t in ts if t.type == "MULTI" and t.eq > CHARIOT_EQ_C16 + 1e-9)}


def tournees_logys(lignes: list[Ligne]) -> list[Tournee] | None:
    """Les tournées telles que Logys les a créées (colonne CHARIOT / NUM_TOUR)."""
    if not all(l.tournee_wms for l in lignes):
        return None
    par = defaultdict(list)
    for l in lignes:
        par[l.tournee_wms].append(l)
    res = []
    for num, ls in par.items():
        pc = defaultdict(list)
        for l in ls:
            pc[(l.commande, l.colis)].append(l)
        colis = [Colis(f"{k[0]}/{k[1]}", v[0].contenant or "C13", v) for k, v in pc.items()]
        if ls[0].styp == "CART":
            type_ = "CART"
        elif all(len(c.lignes) == 1 for c in colis) and all(c.contenant in MONO_CONTENANTS for c in colis):
            type_ = "MONO"
        else:
            type_ = "MULTI"
        blocs = []
        for cmd in {c.id.split("/")[0] for c in colis}:
            blocs.append(Bloc(cmd, cmd, ls[0].vague, type_, [c for c in colis if c.id.split("/")[0] == cmd]).finaliser())
        res.append(Tournee(type_, ls[0].vague, blocs))
    return res


# ─────────────────────────── contrôles ───────────────────────────
def controler(ts: list[Tournee], lignes: list[Ligne]) -> list[tuple]:
    res = []

    def regle(nom, n, detail=""):
        res.append((nom, "OK" if n == 0 else "ÉCART", n, detail))

    vues = defaultdict(int)
    for t in ts:
        for l in lignes_de(t):
            vues[l.idx] += 1
    manq = [l for l in lignes if vues[l.idx] == 0]
    regle("Chaque ligne affectée à une tournée", len(manq), ", ".join(l.commande for l in manq[:10]))
    regle("Aucune ligne affectée deux fois", sum(1 for v in vues.values() if v > 1))
    regle(f"Multi-lignes ≤ {LIGNES_MAX} lignes", sum(1 for t in ts if t.type == "MULTI" and t.nb_lignes > LIGNES_MAX))
    regle(f"Chariot ≤ {CHARIOT_EQ_C16} équivalents C16",
          sum(1 for t in ts if t.type == "MULTI" and t.eq > CHARIOT_EQ_C16 + 1e-9))
    regle(f"Monolignes ≤ {MONO_MAX} C16", sum(1 for t in ts if t.type == "MONO" and t.ncolis > MONO_MAX))
    regle("P13 — monolignes : 1 article = 1 contenant C16/C14",
          sum(1 for t in ts if t.type == "MONO" and any(len(c.lignes) != 1 or c.contenant not in MONO_CONTENANTS
                                                         for c in colis_de(t))))
    regle(f"Carton complet ≤ {CART_CONT_MAX} cont., {CART_POIDS_MAX:g} kg, {CART_VOL_MAX_L / 1000:g} m³",
          sum(1 for t in ts if t.type == "CART" and not admissible("CART", 0, 0, t.poids, t.volume, t.ncolis)))
    regle("Une seule vague par tournée", sum(1 for t in ts if len({b.vague for b in t.blocs}) > 1))
    cmd_t = defaultdict(set)
    for k, t in enumerate(ts):
        for b in t.blocs:
            cmd_t[(b.vague, b.commande, b.type == "CART")].add(k)
    volont = {(b.vague, b.commande, b.type == "CART") for t in ts for b in t.blocs if b.id != b.commande}
    imprev = [c[1] for c, s in cmd_t.items() if len(s) > 1 and c not in volont]
    regle("P05 — une commande = un seul chariot (sauf si elle ne tient pas)", len(imprev), ", ".join(imprev[:10]))
    colis_t = defaultdict(set)
    for k, t in enumerate(ts):
        for c in colis_de(t):
            colis_t[(c.id, t.type == "CART")].add(k)   # Logys peut réutiliser un n° entre détail et carton complet
    regle("Un colis = une seule tournée", sum(1 for s in colis_t.values() if len(s) > 1))
    sous = [t for t in ts if t.nb_lignes < bornes(t.type)[0]]
    res.append(("Minimum de lignes atteint", "OK" if not sous else "INFO", len(sous),
                f"{sum(1 for t in sous if t.type == 'MULTI' and t.eq >= CHARIOT_EQ_C16 - CHARIOT_PLEIN_MARGE)} chariot(s) "
                f"plein(s) à {CHARIOT_EQ_C16} éq. C16 avant le minimum, le reste : vagues trop petites" if sous else ""))
    return res


# ─────────────────────────── optimisation ───────────────────────────
def optimiser(lignes, anomalies, limite_s, journal=print):
    plan = Plan()
    blocs = construire_blocs(lignes, anomalies)
    opt = Optimiseur(plan)
    groupes = defaultdict(list)
    for b in blocs:
        groupes[(b.vague, b.type)].append(b)
    n_tot = sum(len(v) for v in groupes.values()) or 1
    ts, gains = [], 0
    t0 = time.time()
    for (vague, type_), bs in sorted(groupes.items()):
        g = opt.construire(bs, type_, vague)
        gains += opt.ameliorer(g, max(0.2, limite_s * len(bs) / n_tot))
        ts += g
    stats = {"ameliorations": gains, "duree_s": round(time.time() - t0, 1)}
    return plan, ts, stats


# ─────────────────────────── réaffectation Logys ───────────────────────────
def ordonner(ts):
    """Ordre de lancement : vague, multi-lignes puis monolignes puis carton complet, grosses d'abord."""
    ordre = sorted(ts, key=lambda t: (t.vague, {"MULTI": 0, "MONO": 1, "CART": 2}[t.type], -t.nb_lignes))
    return ordre, {id(t): f"T{k:03d}" for k, t in enumerate(ordre, 1)}


def plan_reaffectation(ts) -> tuple[list, dict]:
    """Une ligne par contenant : tournée Logys actuelle -> nouvelle tournée.
    Une nouvelle tournée qui reprend exactement les contenants d'une tournée Logys garde son n°."""
    ordre, num = ordonner(ts)
    par_logys = defaultdict(set)          # tournée Logys -> ses contenants (dans le périmètre)
    for t in ts:
        for c in colis_de(t):
            for l in c.lignes:
                if l.tournee_wms:
                    par_logys[l.tournee_wms].add(c.id)
    rows, bilan = [], {"inchangees": 0, "a_creer": 0, "contenants_deplaces": 0, "contenants": 0}
    for k, t in enumerate(ordre, 1):
        cs = colis_de(t)
        ids = {c.id for c in cs}
        logys = {l.tournee_wms for c in cs for l in c.lignes}
        garde = None
        if len(logys) == 1:
            tw = next(iter(logys))
            if tw and par_logys[tw] == ids:
                garde = tw
        bilan["inchangees" if garde else "a_creer"] += 1
        for c in cs:
            bilan["contenants"] += 1
            bilan["contenants_deplaces"] += not garde
            rows.append([t.vague, c.id.split("/", 1)[-1], c.id.split("/", 1)[0], c.contenant, len(c.lignes),
                         ", ".join(sorted({l.tournee_wms for l in c.lignes if l.tournee_wms})),
                         garde or num[id(t)], k, t.type, "INCHANGÉE" if garde else "À RÉAFFECTER"])
    return rows, bilan


ENTETE_REAFFECTATION = ["VAGUE", "NUM_CONT", "COMMANDE", "TYPE_CONTENANT", "NB_LIGNES", "NUM_TOUR_LOGYS",
                        "NOUVELLE_TOURNEE", "ORDRE_LANCEMENT", "TYPE_TOURNEE", "ACTION"]


def ecrire_reaffectation_csv(chemin: Path, rows):
    with open(chemin, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(ENTETE_REAFFECTATION)
        w.writerows(rows)


# ─────────────────────────── sortie Excel ───────────────────────────
def ecrire_excel(chemin, ts, plan, ref, controles, anomalies, stats, source, compteurs):
    import openpyxl
    from openpyxl.styles import Alignment, Font, PatternFill
    from openpyxl.utils import get_column_letter

    ROUGE, VERT, ORANGE = "C8102E", "E2F0D9", "FCE4D6"
    tete, fond = Font(bold=True, color="FFFFFF"), PatternFill("solid", fgColor=ROUGE)

    def feuille(ws, ent, rows, larg=None):
        ws.append(ent)
        for c in ws[1]:
            c.font, c.fill = tete, fond
            c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        for r in rows:
            ws.append(r)
        ws.freeze_panes = "A2"
        if rows:
            ws.auto_filter.ref = ws.dimensions
        for i, h in enumerate(ent, 1):
            w = (larg or {}).get(h) or min(40, max(9, len(str(h)) + 2,
                                                  *(len(str(r[i - 1])) + 2 for r in rows[:300] if r[i - 1] is not None)))
            ws.column_dimensions[get_column_letter(i)].width = w
        ws.row_dimensions[1].height = 32

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "SYNTHESE"
    o = total(ts, plan)
    ws["A1"] = "Tournées Pick & Pack optimisées — CLR Champigneulles"
    ws["A1"].font = Font(bold=True, size=14, color=ROUGE)
    ws["A2"] = f"Source : {source} — calcul du {dt.datetime.now():%d/%m/%Y %H:%M}"
    ws["A2"].font = Font(italic=True, color="7F7F7F")
    ws.append([])
    ent = ["Indicateur", "Optimisé"] + (["Logys (réel)", "Écart"] if ref else [])
    ws.append(ent)
    for c in ws[4]:
        c.font, c.fill = tete, fond
    r = total(ref, plan) if ref else None

    def ecart(a, b, haut=False):
        if not b:
            return ""
        return f"{(a - b) / b:+.1%}" + ("  ✔" if (a > b) == haut and a != b else "")

    kpis = [("Tournées", "tournees", "{:.0f}", False), ("Lignes", "lignes", "{:.0f}", None),
            ("Lignes par tournée", "lignes_par_tournee", "{:.0f}", True),
            ("Allées traversées par tournée", "allees_par_tournee", "{:.1f}", False),
            ("Distance totale (km)", "distance", "{:.1f}", False),
            ("Distance par ligne (m)", "dpl", "{:.1f}", False),
            ("Temps estimé (h)", "heures", "{:.1f}", False),
            ("Productivité estimée (lignes/h)", "lignes_h", "{:.0f}", True),
            (f"Tournées sous le minimum", "sous_min", "{:.0f}", False),
            ("Commandes sur plusieurs chariots (P05)", "cmd_coupees", "{:.0f}", False),
            (f"Chariots > {CHARIOT_EQ_C16} éq. C16", "hors_capacite", "{:.0f}", False)]

    def v(d, k):
        if k == "distance":
            return d["distance"] / 1000
        if k == "dpl":
            return d["distance"] / d["lignes"] if d["lignes"] else 0
        if k == "heures":
            return d["minutes"] / 60
        return d[k]

    for lib, k, fmt, haut in kpis:
        row = [lib, fmt.format(v(o, k))]
        if r:
            row += [fmt.format(v(r, k)), "" if haut is None else ecart(v(o, k), v(r, k), haut)]
        ws.append(row)
    ws.append([])
    h = o["minutes"] / 60
    for lib, val in [("Prévisionnel", None), ("Heures de préparation estimées", f"{h:.1f} h"),
                     (f"ETP ({H_REF} h × {RENDEMENT_ETP:.0%} en tournée)", f"{h / (H_REF * RENDEMENT_ETP):.1f}"),
                     ("", None), ("Contrôles", None)]:
        ws.append([lib] + ([val] if val else []))
        if val is None and lib:
            ws.cell(ws.max_row, 1).font = Font(bold=True, color=ROUGE)
    n_ec = sum(1 for c in controles if c[1] == "ÉCART")
    ws.append(["Règles vérifiées", f"{len(controles)} — " + (f"{n_ec} écart(s)" if n_ec else "toutes conformes")])
    ws.cell(ws.max_row, 2).fill = PatternFill("solid", fgColor=ORANGE if n_ec else VERT)
    rea, bil = plan_reaffectation(ts)
    ws.append(["Réaffectation Logys", f"{bil['inchangees']} tournées inchangées · {bil['a_creer']} à créer · "
               f"{bil['contenants_deplaces']}/{bil['contenants']} contenants à réaffecter (onglet REAFFECTATION)"])
    if compteurs.get("figees"):
        ws.append(["Tournées Logys déjà entamées (non touchées)", compteurs["figees"]])
    ws.append(["Lignes annulées écartées", compteurs.get("annulees", 0)])
    hz = {k.split(":", 1)[1]: n for k, n in compteurs.items() if k.startswith("hors_zone:")}
    ws.append(["Lignes hors zone pick (laissées à Logys)", " · ".join(f"{z} {n}" for z, n in sorted(hz.items())) or "0"])
    ws.append(["Optimisation", f"{stats['ameliorations']} améliorations en {stats['duree_s']} s"])
    ws.append([])
    ws.append(["Même plan, mêmes sens de circulation et mêmes temps standards pour les deux colonnes : "
               "l'écart vient uniquement du regroupement des commandes."])
    ws.cell(ws.max_row, 1).font = Font(italic=True, color="7F7F7F")
    ws.column_dimensions["A"].width = 46
    for col in "BCD":
        ws.column_dimensions[col].width = 18

    ordre, num = ordonner(ts)
    rows = []
    for k, t in enumerate(ordre, 1):
        m = mesurer(t, plan)
        cont = defaultdict(int)
        for c in colis_de(t):
            cont[c.contenant] += 1
        att = []
        if t.nb_lignes < bornes(t.type)[0]:
            att.append("chariot plein avant le minimum" if t.type == "MULTI" and
                       t.eq >= CHARIOT_EQ_C16 - CHARIOT_PLEIN_MARGE else "vague trop petite")
        if any(l.compose for l in lignes_de(t)):
            att.append("composé allée 11 (P16)")
        if any(b.id != b.commande for b in t.blocs):
            att.append("commande sur 2 chariots")
        _, ch = plan.chemin(t.masque)
        vides = [a for a in ch if not t.masque >> a & 1]
        rows.append([k, num[id(t)], t.vague, t.type, m["commandes"], m["lignes"], round(m["unites"]), m["colis"],
                     " + ".join(f"{n}×{c}" for c, n in sorted(cont.items())), round(t.eq, 1), round(t.poids, 1),
                     " ".join(f"A{a:02d}" for a in ch), ", ".join(f"A{a:02d}" for a in vides),
                     round(m["distance"]), round(m["minutes"], 1), " · ".join(att)])
    feuille(wb.create_sheet("TOURNEES"),
            ["Ordre", "Tournée", "Vague", "Type", "Commandes", "Lignes", "Unités", "Colis", "Contenants à monter",
             f"Éq. C16 (max {CHARIOT_EQ_C16})", "Poids (kg)", "Allées dans l'ordre", "Allées traversées à vide",
             "Distance (m)", "Durée est. (min)", "Points d'attention"], rows,
            {"Contenants à monter": 34, "Allées dans l'ordre": 40, "Points d'attention": 34})

    rows = []
    for t in ordre:
        cl = {l.idx: c for c in colis_de(t) for l in c.lignes}
        for i, l in enumerate(plan.sequence(lignes_de(t)), 1):
            cons = []
            if t.type == "MONO":
                cons.append("1 article = 1 C16, étiquette après prélèvement (P13)")
            if l.compose:
                cons.append("Composé : lire l'image, nb exact (P16)")
            rows.append([num[id(t)], i, l.emplacement, f"A{l.allee:02d}", l.position, l.reference, l.qte,
                         l.commande, cl[l.idx].id.split("/", 1)[-1], cl[l.idx].contenant, l.tournee_wms,
                         " · ".join(cons)])
    feuille(wb.create_sheet("PRELEVEMENT"),
            ["Tournée", "Ordre", "Emplacement", "Allée", "Position", "Article", "Qté", "Commande", "Contenant n°",
             "Type", "Tournée Logys", "Consigne"], rows, {"Consigne": 44})

    par_v = defaultdict(list)
    for t in ts:
        par_v[t.vague].append(t)
    ref_v = defaultdict(list)
    for t in ref or []:
        ref_v[t.vague].append(t)
    rows = []
    for vg in sorted(set(par_v) | set(ref_v)):
        a = total(par_v[vg], plan)
        b = total(ref_v[vg], plan) if ref else None
        rows.append([vg, a["lignes"], a["tournees"], b["tournees"] if b else "", round(a["distance"]),
                     round(b["distance"]) if b else "", f"{(b['distance'] - a['distance']) / b['distance']:.1%}"
                     if b and b["distance"] else "", round(a["minutes"] / 60, 1),
                     round(a["minutes"] / 60 / (H_REF * RENDEMENT_ETP), 2), a["sous_min"],
                     "vague trop petite" if a["lignes"] < LIGNES_MIN else ""])
    feuille(wb.create_sheet("PREVISIONNEL"),
            ["Vague", "Lignes", "Tournées optimisées", "Tournées Logys", "Distance opt. (m)", "Distance Logys (m)",
             "Gain distance", "Heures de prépa", "ETP", "Tournées sous min.", "Remarque"], rows)

    ws = wb.create_sheet("CONTROLES")
    feuille(ws, ["Règle", "Résultat", "Nb", "Détail"], [list(c) for c in controles], {"Règle": 60, "Détail": 60})
    for i in range(2, ws.max_row + 1):
        ws.cell(i, 2).fill = PatternFill("solid", fgColor=VERT if ws.cell(i, 2).value == "OK" else ORANGE)
    ws = wb.create_sheet("REAFFECTATION")
    feuille(ws, ENTETE_REAFFECTATION, rea, {"NUM_TOUR_LOGYS": 26})
    for i in range(2, ws.max_row + 1):
        if ws.cell(i, 10).value == "INCHANGÉE":
            ws.cell(i, 10).fill = PatternFill("solid", fgColor=VERT)
    feuille(wb.create_sheet("ANOMALIES"), ["Type", "Objet", "Détail"], [list(a) for a in anomalies], {"Détail": 80})
    params = [("Multi-lignes min / max", f"{LIGNES_MIN} / {LIGNES_MAX}"),
              ("Monolignes min / max (C16)", f"{MONO_MIN} / {MONO_MAX} — contenants {', '.join(sorted(MONO_CONTENANTS))}"),
              ("Chariot", f"{CHARIOT_EQ_C16} équivalents C16 (surface au sol)"),
              ("Carton complet", f"{CART_CONT_MAX} contenants, {CART_POIDS_MAX:g} kg, {CART_VOL_MAX_L / 1000:g} m³"),
              ("Zone optimisée", ", ".join(sorted(ZONES_OPTIMISEES))),
              ("Sens de circulation", "impaires vers le fond, paires vers la sortie, traverse à chaque bout"),
              ("Plan", f"module allée {ALLEE_LARGEUR_MODULE} m · {METRES_PAR_POSITION} m par position"),
              ("Temps (s)", " · ".join(f"{k} {v:g}" for k, v in TEMPS.items()))]
    params += [(f"Contenant {k}", f"{x}×{y}×{z} mm · {fam} · {eq_c16(k):.2f} éq. C16")
               for k, (x, y, z, fam, _) in CONTENANTS.items()]
    feuille(wb.create_sheet("PARAMETRES"), ["Paramètre", "Valeur"], [list(p) for p in params],
            {"Paramètre": 34, "Valeur": 80})
    wb.save(chemin)


# ─────────────────────────── programme ───────────────────────────
def main(argv=None):
    g = globals()
    sauve = {k: g[k] for k in ("LIGNES_MIN", "LIGNES_MAX", "MONO_MIN", "MONO_MAX", "CHARIOT_EQ_C16")}
    try:
        return _main(argv)
    finally:
        g.update(sauve)   # un appel en ligne de commande ne modifie pas les réglages pour la suite


def _main(argv=None):
    global LIGNES_MIN, LIGNES_MAX, MONO_MIN, MONO_MAX, CHARIOT_EQ_C16
    ap = argparse.ArgumentParser(description="Optimisation des tournées Pick & Pack (Logys)")
    ap.add_argument("fichier", type=Path, help="lignes de tournée Logys (.xlsx ou .csv)")
    ap.add_argument("--sortie", type=Path)
    ap.add_argument("--lignes-min", type=int)
    ap.add_argument("--lignes-max", type=int)
    ap.add_argument("--mono-min", type=int)
    ap.add_argument("--mono-max", type=int)
    ap.add_argument("--chariot-c16", type=float, help="capacité chariot en équivalents C16")
    ap.add_argument("--temps-calcul", type=float, default=TEMPS_CALCUL_MAX)
    ap.add_argument("--figer-entamees", action="store_true",
                    help="exploitation : ne pas toucher aux tournées Logys déjà commencées (lignes ENCO/TERM…)")
    a = ap.parse_args(argv)

    def opt(v, d):
        return d if v is None else v
    LIGNES_MIN, LIGNES_MAX = opt(a.lignes_min, LIGNES_MIN), opt(a.lignes_max, LIGNES_MAX)
    MONO_MIN, MONO_MAX = opt(a.mono_min, MONO_MIN), opt(a.mono_max, MONO_MAX)
    CHARIOT_EQ_C16 = opt(a.chariot_c16, CHARIOT_EQ_C16)
    if not (1 <= LIGNES_MIN <= LIGNES_MAX and 1 <= MONO_MIN <= MONO_MAX):
        sys.exit("Réglages incohérents : il faut 1 ≤ minimum ≤ maximum.")

    anomalies, compteurs = [], {}
    lignes = charger_lignes(a.fichier, anomalies, compteurs)
    if a.figer_entamees:
        entamees = {l.tournee_wms for l in lignes if l.etat in ETATS_ENTAMES and l.tournee_wms}
        compteurs["figees"] = len(entamees)
        lignes = [l for l in lignes if l.tournee_wms not in entamees]
        if not lignes:
            sys.exit(f"Toutes les tournées sont déjà entamées ({len(entamees)}) : rien à réaffecter.")
    plan, ts, stats = optimiser(lignes, anomalies, a.temps_calcul)
    ref = tournees_logys(lignes)
    controles = controler(ts, lignes)
    sortie = a.sortie or Path(f"tournees_{dt.datetime.now():%Y%m%d_%H%M}.xlsx")
    ecrire_excel(sortie, ts, plan, ref, controles, anomalies, stats, a.fichier.name, compteurs)
    rea, bil = plan_reaffectation(ts)
    csv_rea = sortie.with_name(sortie.stem + "_reaffectation.csv")
    ecrire_reaffectation_csv(csv_rea, rea)

    o = total(ts, plan)
    print(f"{o['lignes']} lignes zone pick · {len({l.commande for l in lignes})} commandes · "
          f"{len({l.vague for l in lignes})} vagues")
    print(f"Optimisé : {o['tournees']} tournées · {o['lignes_par_tournee']:.0f} lignes/tournée · "
          f"{o['distance'] / 1000:.1f} km · {o['lignes_h']:.0f} lignes/h estimées")
    if ref:
        r = total(ref, plan)
        print(f"Logys    : {r['tournees']} tournées · {r['lignes_par_tournee']:.0f} lignes/tournée · "
              f"{r['distance'] / 1000:.1f} km · {r['lignes_h']:.0f} lignes/h estimées")
        print(f"Gain     : distance {(r['distance'] - o['distance']) / r['distance']:.1%} · "
              f"temps {(r['minutes'] - o['minutes']) / 60:.1f} h · {r['tournees'] - o['tournees']} tournées de moins")
    ec = [c for c in controles if c[1] == "ÉCART"]
    print(f"Contrôles : {len(controles) - len(ec)}/{len(controles)} conformes" + (" — VOIR CONTROLES" if ec else ""))
    print(f"Réaffectation : {bil['inchangees']} tournées inchangées, {bil['a_creer']} à créer, "
          f"{bil['contenants_deplaces']}/{bil['contenants']} contenants à réaffecter"
          + (f" · {compteurs['figees']} tournées entamées non touchées" if compteurs.get("figees") else ""))
    print(f"→ {sortie}\n→ {csv_rea}")
    return 1 if ec else 0


if __name__ == "__main__":
    sys.exit(main())
