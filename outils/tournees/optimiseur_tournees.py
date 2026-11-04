#!/usr/bin/env python3
"""
OPTIMISEUR DE TOURNÉES PICK & PACK — CLR Champigneulles
=========================================================

Lit les lignes à préparer (extraction Oracle du WMS, en CSV ou XLSX) et construit
les tournées de préparation : quelles commandes vont ensemble sur un chariot, dans
quel ordre on les lance, et dans quel ordre l'opérateur prend les emplacements.

Règles appliquées (issues des standards du service) :
  - P13  monolignes : tournées dédiées, 1 article = 1 C16, nombre d'étiquettes = nombre de C16
  - P03  jamais de mélange bacs agences / cartons clients dans un même chariot
  - P02  familles de contenants : cartons C9…C16 (client), bacs D11/B13/B16 (MAD agences),
         bacs jaunes A11/A13/A16 (réassort)
  - P07  le bon contenant dès le départ (choix du plus petit contenant adapté)
  - P06  lignes hors de portée (niveaux hauts) regroupées en tournées rétract à part
  - P16  composés de l'allée 11 signalés sur la feuille de prélèvement
  - P12  aérosols / batteries signalés (C16 scotché, enveloppe + étiquette)

Contraintes d'une tournée : lignes MIN / MAX, places chariot, poids chariot, une seule
vague (départ transport), un seul flux, une commande n'est jamais coupée (sauf si elle
dépasse à elle seule le maximum de lignes : elle est alors découpée par colis).

Méthode :
  1. construction  — graine + plus proche voisin (la commande qui ajoute le moins de
                     mètres par ligne rejoint la tournée), par vague × flux × type ;
  2. amélioration  — recherche locale : déplacer une commande, échanger deux commandes,
                     dissoudre une petite tournée ; on garde tout ce qui fait baisser
                     le coût (mètres + coût fixe par tournée + pénalité sous le minimum),
                     jusqu'à ce que plus rien ne s'améliore ou que le temps soit écoulé ;
  3. contrôle      — chaque règle est revérifiée sur le résultat (onglet CONTROLES) ;
  4. comparaison   — même calcul de distance sur un lotissement « premier arrivé »
                     et, si fournie, sur les tournées réelles du WMS (onglet SYNTHESE).

Utilisation
-----------
  python3 outils/tournees/optimiseur_tournees.py lignes.csv --sortie tournees.xlsx
  python3 outils/tournees/optimiseur_tournees.py lignes.csv --lignes-min 20 --lignes-max 45
  python3 outils/tournees/optimiseur_tournees.py historique.csv --calibrer
        (ajuste les temps standards sur des tournées réalisées -> calibration.json)

Dépendance : openpyxl (déjà utilisée par bilan_mensuel.py).
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import math
import re
import sys
import time
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path

# ═══════════════════════════ RÉGLAGES ═══════════════════════════
# Tout ce qui est marqué « À CONFIRMER » est une valeur par défaut à valider
# sur le terrain. Les options en ligne de commande priment sur ces valeurs.

# ── Taille des tournées ──
LIGNES_MIN = 20            # À CONFIRMER — en dessous : tournée signalée « sous le minimum »
LIGNES_MAX = 45            # À CONFIRMER — jamais dépassé
MONO_MIN = 15              # À CONFIRMER — tournée monolignes : nb mini de C16
MONO_MAX = 40              # À CONFIRMER — tournée monolignes : nb maxi de C16 (= étiquettes)
RETRACT_MAX = 25           # À CONFIRMER — tournée rétract : nb maxi de lignes

# ── Chariot ──
CHARIOT_PLACES = 12        # À CONFIRMER — capacité en « places » (voir PLACES de chaque contenant)
CHARIOT_POIDS_MAX = 250.0  # À CONFIRMER — kg

# ── Contenants (P02) ── volume utile en litres, poids maxi en kg, places sur le chariot.
# Les volumes sont des ordres de grandeur À CONFIRMER (mesurer chaque carton / bac).
# Ordre = du plus petit au plus grand : on choisit le premier qui convient.
CONTENANTS = {
    "CLIENT": [   # cartons d'expédition
        {"code": "C16", "volume": 6,  "poids": 8,  "places": 0.5},
        {"code": "C14", "volume": 12, "poids": 12, "places": 0.5},
        {"code": "C13", "volume": 20, "poids": 15, "places": 1},
        {"code": "C12", "volume": 30, "poids": 20, "places": 1},
        {"code": "C11", "volume": 45, "poids": 25, "places": 1.5},
        {"code": "C9",  "volume": 65, "poids": 30, "places": 2},
    ],
    "AGENCE": [   # bacs consignés bleus — mise à disposition agences
        {"code": "D11", "volume": 20, "poids": 20, "places": 1},
        {"code": "B13", "volume": 35, "poids": 25, "places": 1},
        {"code": "B16", "volume": 55, "poids": 30, "places": 1.5},
    ],
    "REASSORT": [  # bacs jaunes
        {"code": "A11", "volume": 20, "poids": 20, "places": 1},
        {"code": "A13", "volume": 35, "poids": 25, "places": 1},
        {"code": "A16", "volume": 55, "poids": 30, "places": 1.5},
    ],
}
CONTENANT_MONO = "C16"     # P13 : 1 article = 1 C16
TAUX_REMPLISSAGE = 0.85    # on ne remplit pas un contenant au-delà de 85 % de son volume
LIGNES_PAR_COLIS = 8       # si le volume des articles est inconnu : nb maxi de lignes par colis
PLACES_DEFAUT = 1.0        # contenant inconnu

# ── Plan de l'entrepôt ── (mètres) À CONFIRMER
ALLEE_LARGEUR_MODULE = 3.2   # distance entre l'axe de deux allées voisines
EP_LONGUEUR = 2.7            # longueur d'un entre-poteau (travée)
ALLEE_DEPART_X = 0.0         # position du poste info / départ chariot (allée 1 = 0 m)
# Position réelle des allées si elles ne sont pas régulièrement espacées : {allée: x en m}
ALLEE_POSITION = {}
# Longueur de chaque allée en entre-poteaux (sinon : plus grand EP vu dans les données)
ALLEE_NB_EP = {}
# Stratégie de parcours :
#   "S"      serpentin (on traverse chaque allée visitée, sens alterné) — compatible sens unique
#   "RETOUR" on entre et ressort par l'avant de chaque allée
#   "MIXTE"  le plus court des deux, tournée par tournée
STRATEGIE = "S"

# ── Flux, vagues, cas particuliers ──
MELANGER_FLUX = False        # P03 : jamais de bacs agences et de cartons clients ensemble
ALLEE_COMPOSES = 11          # P16
NIVEAU_MIN_RETRACT = None    # À CONFIRMER — ex. 4 : niveaux ≥ 4 (D) en tournée rétract. None = désactivé

# ── Temps standards (secondes) ── recalés par --calibrer sur des tournées réalisées
TEMPS = {
    "fixe": 180.0,      # affectation poste info + montage chariot + dépose convoyeur (P03)
    "ligne": 18.0,      # lecture étiquette, prélèvement, sachet, étiquetage (P04)
    "unite": 2.0,       # par pièce prélevée
    "colis": 25.0,      # fermeture, BL, étiquette d'expédition (P05)
    "vitesse": 0.9,     # m/s chariot en déplacement
}
try:   # même quota que le bilan mensuel (PARAMETRES B5, B6)
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from bilan_mensuel import H_REF, QUOTA_JOUR
except Exception:   # segno absent, fichier déplacé…
    QUOTA_JOUR, H_REF = 620, 7.4
RENDEMENT_ETP = 0.85           # part du temps de présence réellement en tournée (pauses, aléas)

# ── Optimisation ──
TEMPS_CALCUL_MAX = 60.0      # secondes d'optimisation au total (réparties selon la taille des groupes)
MONO_TOUS_FLUX = True        # À CONFIRMER — monolignes toutes en C16 : un seul lot quel que soit le flux
PENALITE_SOUS_MIN = 40.0     # mètres « équivalents » par ligne manquante sous le minimum

# ═══════════════════════════════════════════════════════════════

ALIAS_COLONNES = {
    "commande": ["commande", "num_commande", "n_commande", "bl", "num_bl", "no_bl", "order"],
    "client": ["client", "code_client", "agence", "destinataire"],
    "flux": ["flux", "type_flux", "type_commande"],
    "vague": ["vague", "depart", "heure_depart", "cut_off", "tournee_transport", "transporteur"],
    "emplacement": ["emplacement", "adresse", "adressage", "empl", "location"],
    "allee": ["allee", "allée"],
    "ep": ["ep", "entre_poteau", "travee", "colonne"],
    "niveau": ["niveau", "niv", "hauteur"],
    "reference": ["reference", "référence", "ref", "article", "code_article"],
    "designation": ["designation", "désignation", "libelle", "libellé"],
    "quantite": ["quantite", "quantité", "qte", "qty"],
    "poids": ["poids_unitaire_kg", "poids_unitaire", "poids_kg", "poids"],
    "volume": ["volume_unitaire_l", "volume_unitaire", "volume_l", "volume"],
    "colis": ["colis", "num_colis", "n_colis", "no_colis"],
    "contenant": ["contenant", "type_contenant", "emballage", "type_emballage"],
    "tournee_wms": ["tournee_wms", "tournee", "num_tournee", "tournee_prep"],
    "duree_min": ["duree_tournee_min", "duree_min", "duree"],
    "aerosol": ["aerosol", "aérosol"],
    "batterie": ["batterie"],
    "retract": ["retract", "rétract"],
}


# ─────────────────────────── modèle ───────────────────────────
@dataclass
class Ligne:
    idx: int
    commande: str
    client: str
    flux: str
    vague: str
    emplacement: str
    allee: int
    ep: int
    niveau: int
    reference: str
    designation: str
    qte: float
    poids: float          # kg, total de la ligne
    volume: float | None  # litres, total de la ligne (None = inconnu)
    colis: str
    contenant: str
    tournee_wms: str
    duree_min: float | None
    aerosol: bool
    batterie: bool
    retract: bool
    compose: bool
    y: float = 0.0        # position dans l'allée (m)


@dataclass
class Colis:
    id: str
    contenant: str
    lignes: list = field(default_factory=list)

    @property
    def places(self) -> float:
        return places_contenant(self.contenant)


@dataclass
class Bloc:
    """Unité indivisible pour l'optimiseur : une commande (ou un morceau de commande)."""
    id: str
    commande: str
    flux: str
    vague: str
    type: str            # MULTI / MONO / RETRACT
    colis: list
    nb_lignes: int = 0
    unites: float = 0.0
    poids: float = 0.0
    places: float = 0.0
    profil: dict = field(default_factory=dict)   # allée -> (y mini, y maxi)
    ordre_arrivee: int = 0

    def finaliser(self):
        lignes = [l for c in self.colis for l in c.lignes]
        self.nb_lignes = len(lignes)
        self.unites = sum(l.qte for l in lignes)
        self.poids = sum(l.poids for l in lignes)
        self.places = sum(c.places for c in self.colis)
        prof = {}
        for l in lignes:
            lo, hi = prof.get(l.allee, (l.y, l.y))
            prof[l.allee] = (min(lo, l.y), max(hi, l.y))
        self.profil = prof
        self.ordre_arrivee = min(l.idx for l in lignes)
        return self


def places_contenant(code: str) -> float:
    for fam in CONTENANTS.values():
        for c in fam:
            if c["code"] == code:
                return c["places"]
    return PLACES_DEFAUT


# ─────────────────────────── lecture ───────────────────────────
def _norm(s: str) -> str:
    s = (s or "").strip().lower()
    for a, b in (("é", "e"), ("è", "e"), ("ê", "e"), ("à", "a"), ("ô", "o"), ("°", "")):
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "_", s).strip("_")


def lire_table(chemin: Path) -> list[dict]:
    if chemin.suffix.lower() in (".xlsx", ".xlsm"):
        import openpyxl
        wb = openpyxl.load_workbook(chemin, read_only=True, data_only=True)
        ws = wb.worksheets[0]
        lignes = list(ws.iter_rows(values_only=True))
        entetes = [_norm(str(h or "")) for h in lignes[0]]
        return [dict(zip(entetes, r)) for r in lignes[1:] if any(v not in (None, "") for v in r)]
    texte = chemin.read_bytes()
    for enc in ("utf-8-sig", "cp1252", "latin-1"):
        try:
            contenu = texte.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    sep = ";" if contenu.splitlines()[0].count(";") >= contenu.splitlines()[0].count(",") else ","
    rd = csv.DictReader(contenu.splitlines(), delimiter=sep)
    return [{_norm(k): v for k, v in r.items()} for r in rd]


def _val(row: dict, champ: str):
    for a in ALIAS_COLONNES[champ]:
        k = _norm(a)
        if k in row and row[k] not in (None, ""):
            return row[k]
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


def _bool(v) -> bool:
    return str(v or "").strip().upper() in ("1", "O", "OUI", "Y", "YES", "X", "VRAI", "TRUE")


def niveau_en_nombre(v) -> int:
    if v is None or str(v).strip() == "":
        return 0
    s = str(v).strip().upper()
    if s.isdigit():
        return int(s)
    if len(s) == 1 and s.isalpha():
        return ord(s) - ord("A") + 1
    m = re.search(r"\d+", s)
    return int(m.group()) if m else 0


def decouper_emplacement(empl: str):
    """'11-05-B' / '011 05 2' / 'A11.05.02' -> (allée, entre-poteau, niveau). P04 : allée — EP — niveau."""
    s = str(empl or "").strip().upper()
    morceaux = [m for m in re.split(r"[^0-9A-Z]+", s) if m]
    if len(morceaux) == 1:   # format collé, lu par la droite : 110502 = 11-05-02, 1105B = 11-05-B
        m = re.fullmatch(r"(\d{1,3})(\d{2})([A-Z]|\d{2})", morceaux[0])
        if m:
            morceaux = list(m.groups())
    nums = []
    for m in morceaux:
        d = re.search(r"\d+", m)
        nums.append(int(d.group()) if d else None)
    allee = nums[0] if nums else None
    ep = nums[1] if len(nums) > 1 else None
    niv = niveau_en_nombre(morceaux[2]) if len(morceaux) > 2 else 0
    return allee, ep, niv


def deduire_flux(flux: str | None, contenant: str) -> str:
    f = _norm(flux or "")
    if f.startswith("agen") or f in ("mad", "a"):
        return "AGENCE"
    if f.startswith("reas"):
        return "REASSORT"
    if f.startswith("cli") or f in ("c",):
        return "CLIENT"
    c = (contenant or "").upper()
    if c.startswith(("B", "D")):
        return "AGENCE"
    if c.startswith("A"):
        return "REASSORT"
    return "CLIENT"


def charger_lignes(chemin: Path, anomalies: list) -> list[Ligne]:
    brutes = lire_table(chemin)
    if not brutes:
        sys.exit(f"Aucune ligne lue dans {chemin}")
    lignes = []
    for i, r in enumerate(brutes):
        empl = str(_val(r, "emplacement") or "").strip()
        allee, ep, niv = decouper_emplacement(empl)
        if _val(r, "allee") is not None:
            allee = int(_num(_val(r, "allee"), 0))
        if _val(r, "ep") is not None:
            ep = int(_num(_val(r, "ep"), 0))
        if _val(r, "niveau") is not None:
            niv = niveau_en_nombre(_val(r, "niveau"))
        cmd = str(_val(r, "commande") or "").strip()
        if not cmd:
            anomalies.append(("Donnée", f"ligne {i + 2}", "numéro de commande vide — ligne ignorée"))
            continue
        if allee is None or ep is None:
            anomalies.append(("Donnée", f"commande {cmd}", f"emplacement illisible « {empl} » — placé en allée 0"))
            allee, ep = allee or 0, ep or 1
        qte = _num(_val(r, "quantite"), 1.0) or 1.0
        pu = _num(_val(r, "poids"), None)
        if pu is None:
            anomalies.append(("Donnée", f"commande {cmd}", f"poids absent pour {_val(r, 'reference')} — compté 0 kg"))
            pu = 0.0
        vu = _num(_val(r, "volume"), None)
        contenant = str(_val(r, "contenant") or "").strip().upper()
        flux = deduire_flux(_val(r, "flux"), contenant)
        retract = _bool(_val(r, "retract")) or (NIVEAU_MIN_RETRACT is not None and niv >= NIVEAU_MIN_RETRACT)
        lignes.append(Ligne(
            idx=i, commande=cmd, client=str(_val(r, "client") or ""), flux=flux,
            vague=str(_val(r, "vague") or "UNIQUE").strip(), emplacement=empl,
            allee=int(allee), ep=int(ep), niveau=niv,
            reference=str(_val(r, "reference") or ""), designation=str(_val(r, "designation") or ""),
            qte=qte, poids=pu * qte, volume=(vu * qte if vu is not None else None),
            colis=str(_val(r, "colis") or "").strip(), contenant=contenant,
            tournee_wms=str(_val(r, "tournee_wms") or "").strip(),
            duree_min=_num(_val(r, "duree_min"), None),
            aerosol=_bool(_val(r, "aerosol")), batterie=_bool(_val(r, "batterie")),
            retract=retract, compose=(int(allee) == ALLEE_COMPOSES),
        ))
    return lignes


# ─────────────────────────── géométrie ───────────────────────────
class Plan:
    def __init__(self, lignes: list[Ligne]):
        self.nb_ep = dict(ALLEE_NB_EP)
        for l in lignes:
            if l.allee not in ALLEE_NB_EP:
                self.nb_ep[l.allee] = max(self.nb_ep.get(l.allee, 1), l.ep)
        for l in lignes:
            l.y = (l.ep - 0.5) * EP_LONGUEUR

    def x(self, allee: int) -> float:
        if allee in ALLEE_POSITION:
            return ALLEE_POSITION[allee]
        return (allee - 1) * ALLEE_LARGEUR_MODULE

    def longueur(self, allee: int) -> float:
        return self.nb_ep.get(allee, 1) * EP_LONGUEUR

    def distance(self, profil: dict, strategie: str = None) -> tuple[float, str]:
        """Distance (m) d'un parcours départ -> emplacements -> départ. profil : allée -> (y mini, y maxi)."""
        if not profil:
            return 0.0, "S"
        strategie = strategie or STRATEGIE
        xs = [self.x(a) for a in profil]
        horiz = 2 * (max(max(xs), ALLEE_DEPART_X) - min(min(xs), ALLEE_DEPART_X))
        allees = sorted(profil, key=self.x)
        # serpentin : chaque allée traversée ; si nombre impair, la dernière en aller-retour
        s = sum(self.longueur(a) for a in allees)
        if len(allees) % 2 == 1:
            der = allees[-1]
            s += 2 * profil[der][1] - self.longueur(der)
        r = sum(2 * profil[a][1] for a in allees)
        if strategie == "RETOUR":
            return horiz + r, "RETOUR"
        if strategie == "MIXTE" and r < s:
            return horiz + r, "RETOUR"
        return horiz + s, "S"

    def sequence(self, lignes: list[Ligne], mode: str) -> list[Ligne]:
        """Ordre de prélèvement : allées de gauche à droite, sens alterné en serpentin."""
        par_allee = defaultdict(list)
        for l in lignes:
            par_allee[l.allee].append(l)
        res = []
        for k, a in enumerate(sorted(par_allee, key=self.x)):
            montant = (mode == "RETOUR") or (k % 2 == 0)
            res += sorted(par_allee[a], key=lambda l: (l.y, l.niveau), reverse=not montant)
        return res


def fusion_profils(*profils: dict) -> dict:
    out = {}
    for p in profils:
        for a, (lo, hi) in p.items():
            if a in out:
                o = out[a]
                out[a] = (min(o[0], lo), max(o[1], hi))
            else:
                out[a] = (lo, hi)
    return out


# ─────────────────────────── colisage ───────────────────────────
def choisir_contenant(flux: str, volume: float, poids: float) -> str | None:
    for c in CONTENANTS[flux]:
        if volume <= c["volume"] * TAUX_REMPLISSAGE and poids <= c["poids"]:
            return c["code"]
    return None


def construire_colis(cmd: str, flux: str, lignes: list[Ligne], anomalies: list, prefixe: str = "") -> list[Colis]:
    """Colis du WMS s'ils sont fournis (P03 : monter par n° de colis), sinon calculés."""
    if all(l.colis for l in lignes):
        par = defaultdict(list)
        for l in lignes:
            par[l.colis].append(l)
        res = []
        for num, ls in par.items():
            cont = ls[0].contenant
            vol = sum(l.volume for l in ls) if all(l.volume is not None for l in ls) else None
            if vol is not None and cont:
                ideal = choisir_contenant(flux, vol, sum(l.poids for l in ls))
                if ideal and ideal != cont:
                    anomalies.append(("Contenant (P07)", f"commande {cmd} colis {num}",
                                      f"WMS : {cont} — proposé : {ideal} (volume {vol:.1f} L)"))
            res.append(Colis(id=f"{cmd}/{num}", contenant=cont or CONTENANTS[flux][0]["code"], lignes=ls))
        return res

    grand = CONTENANTS[flux][-1]
    cap_v, cap_p = grand["volume"] * TAUX_REMPLISSAGE, grand["poids"]
    volumes_connus = all(l.volume is not None for l in lignes)
    bacs: list[list[Ligne]] = []
    if volumes_connus:   # rangement décroissant (First Fit Decreasing) volume + poids
        for l in sorted(lignes, key=lambda l: l.volume, reverse=True):
            for b in bacs:
                if sum(x.volume for x in b) + l.volume <= cap_v and sum(x.poids for x in b) + l.poids <= cap_p:
                    b.append(l)
                    break
            else:
                bacs.append([l])
    else:
        for l in lignes:
            if bacs and len(bacs[-1]) < LIGNES_PAR_COLIS and sum(x.poids for x in bacs[-1]) + l.poids <= cap_p:
                bacs[-1].append(l)
            else:
                bacs.append([l])
    res = []
    for k, b in enumerate(bacs, 1):
        if volumes_connus:
            code = choisir_contenant(flux, sum(l.volume for l in b), sum(l.poids for l in b))
            if code is None:
                code = grand["code"]
                anomalies.append(("Contenant (P07)", f"commande {cmd}",
                                  f"article hors gabarit ({b[0].reference}) — {code} par défaut, à vérifier"))
        else:
            code = b[0].contenant or ("C13" if flux == "CLIENT" else CONTENANTS[flux][1]["code"])
        res.append(Colis(id=f"{cmd}/{prefixe}{k}", contenant=code, lignes=b))
    return res


def decouper(cmd, flux, vague, type_, colis: list[Colis], anomalies) -> list[Bloc]:
    """Commande plus grande qu'un chariot (lignes, places ou poids) : découpée par colis entiers."""
    morceaux, cur = [], []
    for c in colis:
        essai = cur + [c]
        n = sum(len(x.lignes) for x in essai)
        if cur and not admissible(n, sum(x.places for x in essai),
                                  sum(l.poids for x in essai for l in x.lignes), type_):
            morceaux.append(cur)
            cur = [c]
        else:
            cur = essai
        if len(cur) == 1 and not admissible(len(c.lignes), c.places, sum(l.poids for l in c.lignes), type_):
            anomalies.append(("Hors chariot", f"commande {cmd} colis {c.id}",
                              "un seul colis dépasse les limites de tournée / chariot — à traiter à part"))
    morceaux.append(cur)
    if len(morceaux) > 1:
        anomalies.append(("Découpage", f"commande {cmd}",
                          f"{sum(len(c.lignes) for c in colis)} lignes ({type_}) dépassent un chariot : "
                          f"répartie sur {len(morceaux)} tournées"))
    suffixe = "/R" if type_ == "RETRACT" else ""
    return [Bloc(f"{cmd}{suffixe}" if len(morceaux) == 1 else f"{cmd}{suffixe}/{k}", cmd, flux, vague, type_, m).finaliser()
            for k, m in enumerate(morceaux, 1)]


def construire_blocs(lignes: list[Ligne], anomalies: list) -> list[Bloc]:
    par_cmd = defaultdict(list)
    for l in lignes:
        par_cmd[l.commande].append(l)
    blocs = []
    for cmd, ls in par_cmd.items():
        flux = ls[0].flux
        if len({l.flux for l in ls}) > 1:
            anomalies.append(("Donnée", f"commande {cmd}", "plusieurs flux dans une commande — flux de la 1re ligne retenu"))
        if len({l.vague for l in ls}) > 1:
            anomalies.append(("Donnée", f"commande {cmd}", "plusieurs vagues dans une commande — 1re vague retenue"))
        vague = ls[0].vague
        for l in ls:
            l.flux, l.vague = flux, vague
        rtr = [l for l in ls if l.retract]
        pied = [l for l in ls if not l.retract]
        if rtr:
            blocs += decouper(cmd, flux, vague, "RETRACT", construire_colis(cmd, flux, rtr, anomalies, "R"), anomalies)
        if not pied:
            continue
        if len(ls) == 1:   # P13 — vraie monoligne : 1 article, 1 C16
            l = pied[0]
            num = f"{cmd}/{l.colis}" if l.colis else f"{cmd}/1"
            blocs.append(Bloc(cmd, cmd, flux, vague, "MONO",
                              [Colis(num, l.contenant or CONTENANT_MONO, [l])]).finaliser())
            continue
        blocs += decouper(cmd, flux, vague, "MULTI", construire_colis(cmd, flux, pied, anomalies), anomalies)
    return blocs


# ─────────────────────────── tournées ───────────────────────────
class Tournee:
    __slots__ = ("blocs", "type", "flux", "vague", "nb_lignes", "places", "poids", "profil", "_cout")

    def __init__(self, type_, flux, vague):
        self.blocs, self.type, self.flux, self.vague = [], type_, flux, vague
        self.nb_lignes, self.places, self.poids, self.profil, self._cout = 0, 0.0, 0.0, {}, None

    def recalcul(self):
        self.nb_lignes = sum(b.nb_lignes for b in self.blocs)
        self.places = sum(b.places for b in self.blocs)
        self.poids = sum(b.poids for b in self.blocs)
        self.profil = fusion_profils(*(b.profil for b in self.blocs))
        self._cout = None


def bornes(type_: str) -> tuple[int, int]:
    if type_ == "MONO":
        return MONO_MIN, MONO_MAX
    if type_ == "RETRACT":
        return 1, RETRACT_MAX
    return LIGNES_MIN, LIGNES_MAX


def admissible(nb_lignes, places, poids, type_) -> bool:
    _, mx = bornes(type_)
    if nb_lignes > mx or poids > CHARIOT_POIDS_MAX:
        return False
    return type_ == "MONO" or places <= CHARIOT_PLACES   # monolignes : capacité = MONO_MAX C16


class Optimiseur:
    def __init__(self, plan: Plan):
        self.plan = plan
        self.cout_fixe = TEMPS["fixe"] * TEMPS["vitesse"]   # une tournée de plus = ces mètres-là

    def cout(self, profil, nb_lignes, type_) -> float:
        if nb_lignes == 0:
            return 0.0
        mn, _ = bornes(type_)
        return self.plan.distance(profil)[0] + self.cout_fixe + PENALITE_SOUS_MIN * max(0, mn - nb_lignes)

    def cout_t(self, t: Tournee) -> float:
        if t._cout is None:
            t._cout = self.cout(t.profil, t.nb_lignes, t.type)
        return t._cout

    # 1. construction : graine + insertion au moindre surcoût par ligne
    def construire(self, blocs: list[Bloc], type_, flux, vague) -> list[Tournee]:
        restants = sorted(blocs, key=lambda b: (-max(self.plan.x(a) for a in b.profil), -b.nb_lignes))
        tournees = []
        while restants:
            t = Tournee(type_, flux, vague)
            graine = restants.pop(0)
            t.blocs.append(graine)
            t.recalcul()
            while True:
                base = self.plan.distance(t.profil)[0]
                meilleur, score_m = None, math.inf
                for i, b in enumerate(restants):
                    if not admissible(t.nb_lignes + b.nb_lignes, t.places + b.places, t.poids + b.poids, type_):
                        continue
                    d = self.plan.distance(fusion_profils(t.profil, b.profil))[0] - base
                    score = d / b.nb_lignes
                    if score < score_m:
                        meilleur, score_m = i, score
                if meilleur is None:
                    break
                t.blocs.append(restants.pop(meilleur))
                t.recalcul()
            tournees.append(t)
        return tournees

    # 2. amélioration continue : on garde chaque changement qui baisse le coût total
    def _descente(self, tournees: list[Tournee], fin: float) -> tuple[int, int]:
        passes, gains = 0, 0
        type_ = tournees[0].type if tournees else "MULTI"

        def cout_avec(t, retirer=(), ajouter=()):
            bl = [b for b in t.blocs if b not in retirer] + list(ajouter)
            n = sum(b.nb_lignes for b in bl)
            if bl and not admissible(n, sum(b.places for b in bl), sum(b.poids for b in bl), type_):
                return None
            return self.cout(fusion_profils(*(b.profil for b in bl)), n, type_)

        ameliore = True
        while ameliore and time.time() < fin:
            ameliore, passes = False, passes + 1
            # a) déplacer un bloc vers une autre tournée
            for ta in tournees:
                for b in list(ta.blocs):
                    if time.time() > fin:
                        break
                    ca_sans = cout_avec(ta, retirer=(b,))
                    base_a = self.cout_t(ta)
                    for tb in tournees:
                        if tb is ta or b not in ta.blocs:
                            continue
                        cb_avec = cout_avec(tb, ajouter=(b,))
                        if cb_avec is None:
                            continue
                        delta = ca_sans + cb_avec - base_a - self.cout_t(tb)
                        if delta < -1e-6:
                            ta.blocs.remove(b)
                            tb.blocs.append(b)
                            ta.recalcul(); tb.recalcul()
                            ameliore, gains = True, gains + 1
                            break
            tournees[:] = [t for t in tournees if t.blocs]
            # b) échanger deux blocs entre tournées
            for i, ta in enumerate(tournees):
                for tb in tournees[i + 1:]:
                    if time.time() > fin:
                        break
                    fait = False
                    for ba in list(ta.blocs):
                        for bb in list(tb.blocs):
                            ca = cout_avec(ta, retirer=(ba,), ajouter=(bb,))
                            cb = cout_avec(tb, retirer=(bb,), ajouter=(ba,))
                            if ca is None or cb is None:
                                continue
                            if ca + cb < self.cout_t(ta) + self.cout_t(tb) - 1e-6:
                                ta.blocs.remove(ba); tb.blocs.remove(bb)
                                ta.blocs.append(bb); tb.blocs.append(ba)
                                ta.recalcul(); tb.recalcul()
                                ameliore, gains, fait = True, gains + 1, True
                                break
                        if fait:
                            break
            # c) dissoudre la plus petite tournée si ses commandes tiennent ailleurs
            for t in sorted(tournees, key=lambda t: t.nb_lignes)[:3]:
                if len(tournees) < 2 or time.time() > fin:
                    break
                autres = [o for o in tournees if o is not t]
                essai = {id(o): list(o.blocs) for o in autres}
                ok = True
                for b in sorted(t.blocs, key=lambda b: -b.nb_lignes):
                    best, best_d = None, math.inf
                    for o in autres:
                        bl = essai[id(o)] + [b]
                        n = sum(x.nb_lignes for x in bl)
                        if not admissible(n, sum(x.places for x in bl), sum(x.poids for x in bl), type_):
                            continue
                        d = self.cout(fusion_profils(*(x.profil for x in bl)), n, type_) - self.cout(
                            fusion_profils(*(x.profil for x in essai[id(o)])),
                            sum(x.nb_lignes for x in essai[id(o)]), type_)
                        if d < best_d:
                            best, best_d = o, d
                    if best is None:
                        ok = False
                        break
                    essai[id(best)].append(b)
                if not ok:
                    continue
                avant = sum(self.cout_t(o) for o in tournees)
                apres = sum(self.cout(fusion_profils(*(x.profil for x in essai[id(o)])),
                                      sum(x.nb_lignes for x in essai[id(o)]), type_) for o in autres)
                if apres < avant - 1e-6:
                    for o in autres:
                        o.blocs = essai[id(o)]
                        o.recalcul()
                    tournees.remove(t)
                    ameliore, gains = True, gains + 1
                    break
        return passes, gains

    def _total(self, tournees) -> float:
        return sum(self.cout_t(t) for t in tournees)

    def _reinserer(self, tournees, blocs, type_, flux, vague):
        """Remet chaque bloc là où il coûte le moins (ou ouvre une tournée)."""
        for b in sorted(blocs, key=lambda b: -b.nb_lignes):
            best, best_d = None, self.cout(b.profil, b.nb_lignes, type_)   # coût d'une tournée neuve
            for t in tournees:
                if not admissible(t.nb_lignes + b.nb_lignes, t.places + b.places, t.poids + b.poids, type_):
                    continue
                d = self.cout(fusion_profils(t.profil, b.profil), t.nb_lignes + b.nb_lignes, type_) - self.cout_t(t)
                if d < best_d:
                    best, best_d = t, d
            if best is None:
                best = Tournee(type_, flux, vague)
                tournees.append(best)
            best.blocs.append(b)
            best.recalcul()

    def ameliorer(self, tournees: list[Tournee], limite_s: float, graine: int = 1) -> dict:
        """Descente, puis recherche locale itérée (détruire / reconstruire) tant qu'il reste du temps."""
        debut = time.time()
        fin = debut + limite_s
        passes, gains = self._descente(tournees, fin)
        if len(tournees) < 2:
            return {"passes": passes, "ameliorations": gains, "duree_s": round(time.time() - debut, 1)}
        type_, flux, vague = tournees[0].type, tournees[0].flux, tournees[0].vague
        rnd = __import__("random").Random(graine)
        meilleur = [list(t.blocs) for t in tournees]
        cout_m = self._total(tournees)
        essais = 0
        while time.time() < fin and essais < 400:
            essais += 1
            # détruire : une tournée au hasard + sa voisine la plus proche (allées communes)
            t1 = rnd.choice(tournees)
            voisines = sorted((t for t in tournees if t is not t1),
                              key=lambda t: -len(set(t.profil) & set(t1.profil)))
            cibles = [t1] + voisines[:rnd.choice((1, 1, 2))]
            libres = [b for t in cibles for b in t.blocs]
            for t in tournees:   # + quelques commandes isolées ailleurs
                if t not in cibles and t.blocs and rnd.random() < 0.15:
                    b = rnd.choice(t.blocs)
                    t.blocs.remove(b)
                    t.recalcul()
                    libres.append(b)
            tournees[:] = [t for t in tournees if t not in cibles and t.blocs]
            self._reinserer(tournees, libres, type_, flux, vague)
            p, g = self._descente(tournees, fin)
            passes += p
            c = self._total(tournees)
            if c < cout_m - 1e-6:
                meilleur, cout_m, gains = [list(t.blocs) for t in tournees], c, gains + g + 1
            else:   # pas mieux : on revient à la meilleure solution connue
                tournees[:] = []
                for bl in meilleur:
                    t = Tournee(type_, flux, vague)
                    t.blocs = list(bl)
                    t.recalcul()
                    tournees.append(t)
        return {"passes": passes, "ameliorations": gains, "duree_s": round(time.time() - debut, 1)}

    def lotir_fifo(self, blocs: list[Bloc], type_, flux, vague) -> list[Tournee]:
        """Référence de comparaison : commandes prises dans l'ordre d'arrivée."""
        tournees, t = [], None
        for b in sorted(blocs, key=lambda b: b.ordre_arrivee):
            if t is None or not admissible(t.nb_lignes + b.nb_lignes, t.places + b.places, t.poids + b.poids, type_):
                t = Tournee(type_, flux, vague)
                tournees.append(t)
            t.blocs.append(b)
            t.recalcul()
        return tournees


def est_carton(code: str) -> bool:
    return any(c["code"] == code for c in CONTENANTS["CLIENT"])


def groupes(blocs: list[Bloc]) -> dict:
    g = defaultdict(list)
    for b in blocs:
        tous = MELANGER_FLUX or (b.type == "MONO" and MONO_TOUS_FLUX
                                 and all(est_carton(c.contenant) for c in b.colis))
        g[(b.vague, b.type, "TOUS" if tous else b.flux)].append(b)
    return g


def cle_vague(v: str):
    m = re.search(r"(\d{1,2})[:hH](\d{2})?", v)
    return (0, int(m.group(1)) * 60 + int(m.group(2) or 0), v) if m else (1, 0, v)


# ─────────────────────────── mesures ───────────────────────────
def lignes_de(t: Tournee) -> list[Ligne]:
    return [l for b in t.blocs for c in b.colis for l in c.lignes]


def colis_de(t: Tournee) -> list[Colis]:
    return [c for b in t.blocs for c in b.colis]


def mesurer(t: Tournee, plan: Plan) -> dict:
    ls = lignes_de(t)
    dist, mode = plan.distance(t.profil)
    unites = sum(l.qte for l in ls)
    nb_colis = len(colis_de(t))
    sec = (TEMPS["fixe"] + TEMPS["ligne"] * len(ls) + TEMPS["unite"] * unites
           + TEMPS["colis"] * nb_colis + dist / TEMPS["vitesse"])
    return {"lignes": len(ls), "unites": unites, "colis": nb_colis, "distance": dist, "mode": mode,
            "minutes": sec / 60, "commandes": len({b.commande for b in t.blocs}),
            "allees": len(t.profil), "poids": t.poids, "places": t.places}


def total(tournees, plan) -> dict:
    ms = [mesurer(t, plan) for t in tournees]
    lig = sum(m["lignes"] for m in ms)
    mn = sum(m["minutes"] for m in ms)
    return {"tournees": len(ms), "lignes": lig, "distance": sum(m["distance"] for m in ms),
            "minutes": mn, "lignes_h": lig / (mn / 60) if mn else 0}


def tournees_wms(lignes: list[Ligne], plan: Plan) -> list[Tournee] | None:
    if not all(l.tournee_wms for l in lignes):
        return None
    par = defaultdict(list)
    for l in lignes:
        par[l.tournee_wms].append(l)
    res = []
    for num, ls in par.items():
        nb_par_cmd = defaultdict(int)
        for l in ls:
            nb_par_cmd[l.commande] += 1
        t = Tournee("MONO" if max(nb_par_cmd.values()) == 1 else "MULTI", ls[0].flux, ls[0].vague)
        colis = defaultdict(list)
        for l in ls:
            colis[(l.commande, l.colis)].append(l)
        b = Bloc(num, num, ls[0].flux, ls[0].vague, t.type,
                 [Colis(f"{k[0]}/{k[1]}", v[0].contenant or "C13", v) for k, v in colis.items()]).finaliser()
        t.blocs.append(b)
        t.recalcul()
        res.append(t)
    return res


# ─────────────────────────── contrôles ───────────────────────────
def controler(tournees: list[Tournee], lignes: list[Ligne]) -> list[tuple]:
    res = []

    def ok(regle, n_ko, detail=""):
        res.append((regle, "OK" if n_ko == 0 else "ÉCART", n_ko, detail))

    vues = defaultdict(int)
    for t in tournees:
        for l in lignes_de(t):
            vues[l.idx] += 1
    manquantes = [l for l in lignes if vues[l.idx] == 0]
    doubles = [k for k, v in vues.items() if v > 1]
    ok("Chaque ligne affectée à une tournée", len(manquantes), ", ".join(l.commande for l in manquantes[:10]))
    ok("Aucune ligne affectée deux fois", len(doubles))
    ko = [t for t in tournees if t.nb_lignes > bornes(t.type)[1]]
    ok("Maximum de lignes respecté", len(ko))
    ko = [t for t in tournees if t.type != "MONO" and t.places > CHARIOT_PLACES]
    ok(f"Places chariot ≤ {CHARIOT_PLACES}", len(ko))
    ko = [t for t in tournees if t.poids > CHARIOT_POIDS_MAX]
    ok(f"Poids chariot ≤ {CHARIOT_POIDS_MAX:g} kg", len(ko))
    ko = [t for t in tournees if len({est_carton(c.contenant) for c in colis_de(t)}) > 1
          or (t.type != "MONO" and len({b.flux for b in t.blocs}) > 1)]
    ok("P03 — pas de mélange bacs agences / cartons clients", len(ko) if not MELANGER_FLUX else 0,
       "monolignes en C16 : lot commun tous flux" if MONO_TOUS_FLUX else "")
    ko = [t for t in tournees if len({b.vague for b in t.blocs}) > 1]
    ok("Une seule vague (départ) par tournée", len(ko))
    ko = [t for t in tournees if t.type == "MONO" and any(len(c.lignes) != 1 for c in colis_de(t))]
    ok("P13 — monolignes : 1 article = 1 C16, tournées dédiées", len(ko))
    cmd_t = defaultdict(set)
    for k, t in enumerate(tournees):
        for b in t.blocs:
            if b.type != "RETRACT":
                cmd_t[b.commande].add(k)
    volontaires = {b.commande for t in tournees for b in t.blocs if b.type == "MULTI" and b.id != b.commande}
    coupees = [c for c, s in cmd_t.items() if len(s) > 1]
    imprevues = [c for c in coupees if c not in volontaires]
    ok("Commandes non coupées (hors commandes > chariot)", len(imprevues),
       ", ".join(imprevues[:10]) or (f"{len(coupees)} commande(s) volontairement découpée(s)" if coupees else ""))
    colis_t = defaultdict(set)
    for k, t in enumerate(tournees):
        for c in colis_de(t):
            colis_t[c.id].add(k)
    ok("Un colis = une seule tournée", sum(1 for s in colis_t.values() if len(s) > 1))
    sous = [t for t in tournees if t.nb_lignes < bornes(t.type)[0]]
    res.append(("Minimum de lignes atteint", "OK" if not sous else "INFO", len(sous),
                "reliquats de fin de vague : pas assez de lignes dans la vague pour mieux faire" if sous else ""))
    return res


# ─────────────────────────── calibration ───────────────────────────
def calibrer(lignes: list[Ligne], plan: Plan, chemin_sortie: Path):
    """Moindres carrés : durée réelle = fixe + a·lignes + b·unités + c·colis + distance/vitesse."""
    ts = tournees_wms(lignes, plan)
    if not ts:
        sys.exit("Calibration : il faut les colonnes tournee_wms et duree_tournee_min sur toutes les lignes.")
    X, Y = [], []
    for t in ts:
        ls = lignes_de(t)
        if ls[0].duree_min is None:
            continue
        m = mesurer(t, plan)
        X.append([1.0, m["lignes"], m["unites"], m["colis"], m["distance"]])
        Y.append(ls[0].duree_min * 60)
    if len(X) < 10:
        sys.exit(f"Calibration : {len(X)} tournées avec durée — il en faut au moins 10.")
    n = len(X[0])
    A = [[sum(x[i] * x[j] for x in X) + (1e-6 if i == j else 0) for j in range(n)] for i in range(n)]
    B = [sum(x[i] * y for x, y in zip(X, Y)) for i in range(n)]
    for i in range(n):   # Gauss
        p = max(range(i, n), key=lambda r: abs(A[r][i]))
        A[i], A[p], B[i], B[p] = A[p], A[i], B[p], B[i]
        for r in range(n):
            if r != i and A[i][i]:
                f = A[r][i] / A[i][i]
                A[r] = [a - f * b for a, b in zip(A[r], A[i])]
                B[r] -= f * B[i]
    coef = [B[i] / A[i][i] for i in range(n)]
    nouveau = {"fixe": max(coef[0], 0), "ligne": max(coef[1], 0), "unite": max(coef[2], 0),
               "colis": max(coef[3], 0), "vitesse": (1 / coef[4]) if coef[4] > 1e-4 else TEMPS["vitesse"]}
    pred = [sum(c * v for c, v in zip(
        [nouveau["fixe"], nouveau["ligne"], nouveau["unite"], nouveau["colis"], 1 / nouveau["vitesse"]], x)) for x in X]
    ecart = sum(abs(p - y) for p, y in zip(pred, Y)) / len(Y) / 60
    nouveau["_tournees"] = len(X)
    nouveau["_ecart_moyen_min"] = round(ecart, 2)
    nouveau["_date"] = dt.date.today().isoformat()
    chemin_sortie.write_text(json.dumps(nouveau, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Calibration sur {len(X)} tournées — écart moyen {ecart:.1f} min par tournée")
    for k in ("fixe", "ligne", "unite", "colis"):
        print(f"  {k:8s} {TEMPS[k]:7.1f} s  ->  {nouveau[k]:7.1f} s")
    print(f"  vitesse  {TEMPS['vitesse']:7.2f} m/s -> {nouveau['vitesse']:7.2f} m/s")
    print(f"Enregistré : {chemin_sortie} (chargé automatiquement aux prochains calculs)")


# ─────────────────────────── sortie Excel ───────────────────────────
def ecrire_excel(chemin: Path, tournees, plan, ref_fifo, ref_wms, controles, anomalies, stats, source):
    import openpyxl
    from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
    from openpyxl.utils import get_column_letter

    ROUGE, GRIS, VERT, ORANGE = "C8102E", "F2F2F2", "E2F0D9", "FCE4D6"
    tete = Font(bold=True, color="FFFFFF")
    fond_tete = PatternFill("solid", fgColor=ROUGE)
    fin = Side(style="thin", color="BFBFBF")
    cadre = Border(top=fin, bottom=fin, left=fin, right=fin)

    def feuille(ws, entetes, lignes_, largeurs=None):
        ws.append(entetes)
        for c in ws[1]:
            c.font, c.fill, c.alignment = tete, fond_tete, Alignment(horizontal="center", vertical="center", wrap_text=True)
        for r in lignes_:
            ws.append(r)
        ws.freeze_panes = "A2"
        if lignes_:
            ws.auto_filter.ref = ws.dimensions
        for i, h in enumerate(entetes, 1):
            w = (largeurs or {}).get(h) or min(45, max(10, len(str(h)) + 2,
                                                        *(len(str(r[i - 1])) + 2 for r in lignes_[:200] if r[i - 1] is not None)))
            ws.column_dimensions[get_column_letter(i)].width = w
        ws.row_dimensions[1].height = 30

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "SYNTHESE"
    opt = total(tournees, plan)
    fifo = total(ref_fifo, plan)
    ws["A1"] = "Optimisation des tournées Pick & Pack — CLR Champigneulles"
    ws["A1"].font = Font(bold=True, size=14, color=ROUGE)
    ws["A2"] = f"Source : {source} — calcul du {dt.datetime.now():%d/%m/%Y %H:%M}"
    ws["A2"].font = Font(italic=True, color="7F7F7F")
    entetes = ["Indicateur", "Optimisé", "Ordre d'arrivée (FIFO)", "Gain vs FIFO"]
    if ref_wms:
        wms = total(ref_wms, plan)
        entetes += ["Tournées WMS actuelles", "Gain vs WMS"]
    ws.append([])
    ws.append(entetes)
    for c in ws[4]:
        c.font, c.fill = tete, fond_tete

    def gain(a, b, plus_haut_mieux=False):
        if not b:
            return ""
        g = (a - b) / b if plus_haut_mieux else (b - a) / b
        return f"{g:+.1%}"

    lignes_kpi = [
        ("Tournées", "tournees", False, "{:.0f}"),
        ("Lignes", "lignes", None, "{:.0f}"),
        ("Distance totale (m)", "distance", False, "{:,.0f}"),
        ("Distance par ligne (m)", None, False, "{:.1f}"),
        ("Temps estimé (h)", "minutes", False, "{:.1f}"),
        ("Productivité estimée (lignes/h)", "lignes_h", True, "{:.0f}"),
    ]
    for lib, k, sens, fmt in lignes_kpi:
        def v(d):
            if k is None:
                return d["distance"] / d["lignes"] if d["lignes"] else 0
            return d[k] / 60 if k == "minutes" else d[k]
        row = [lib, fmt.format(v(opt)).replace(",", " "), fmt.format(v(fifo)).replace(",", " "),
               "" if sens is None else gain(v(opt), v(fifo), sens)]
        if ref_wms:
            row += [fmt.format(v(wms)).replace(",", " "), "" if sens is None else gain(v(opt), v(wms), sens)]
        ws.append(row)
    ws.append([])
    heures = opt["minutes"] / 60
    etp = heures / (H_REF * RENDEMENT_ETP)
    ws.append(["Prévisionnel"])
    ws.cell(ws.max_row, 1).font = Font(bold=True, color=ROUGE)
    ws.append(["Heures de préparation estimées", f"{heures:.1f} h"])
    ws.append([f"ETP nécessaires ({H_REF} h × {RENDEMENT_ETP:.0%} de temps en tournée)", f"{etp:.1f}"])
    ws.append([f"Productivité estimée vs quota ({QUOTA_JOUR} lignes / {H_REF} h)",
               f"{opt['lignes_h'] / (QUOTA_JOUR / H_REF):.0%}"])
    ws.append([])
    ws.append(["Contrôles"])
    ws.cell(ws.max_row, 1).font = Font(bold=True, color=ROUGE)
    n_ecart = sum(1 for c in controles if c[1] == "ÉCART")
    ws.append(["Règles vérifiées", f"{len(controles)} — {n_ecart} écart(s)" if n_ecart else f"{len(controles)} — toutes conformes"])
    ws.cell(ws.max_row, 2).fill = PatternFill("solid", fgColor=ORANGE if n_ecart else VERT)
    ws.append(["Anomalies de données / contenants", f"{len(anomalies)} (onglet ANOMALIES)"])
    ws.append(["Recherche locale", f"{stats['ameliorations']} améliorations en {stats['passes']} passes, {stats['duree_s']} s"])
    ws.append([])
    ws.append(["Distances : même modèle de plan pour les trois colonnes — la comparaison est équitable ; "
               "les valeurs absolues dépendent des réglages de plan (onglet PARAMETRES)."])
    ws.cell(ws.max_row, 1).font = Font(italic=True, color="7F7F7F")
    ws.column_dimensions["A"].width = 52
    for col in "BCDEF":
        ws.column_dimensions[col].width = 22

    # TOURNEES
    ordre = sorted(tournees, key=lambda t: (cle_vague(t.vague), {"MULTI": 0, "MONO": 1, "RETRACT": 2}[t.type],
                                            t.flux, -t.nb_lignes))
    numeros = {id(t): f"T{k:03d}" for k, t in enumerate(ordre, 1)}
    rows = []
    for k, t in enumerate(ordre, 1):
        m = mesurer(t, plan)
        cont = defaultdict(int)
        for c in colis_de(t):
            cont[c.contenant] += 1
        mn, mx = bornes(t.type)
        ls = lignes_de(t)
        alerte = []
        if m["lignes"] < mn:
            alerte.append("sous le minimum")
        if any(l.aerosol for l in ls):
            alerte.append("aérosol (C16 scotché)")
        if any(l.batterie for l in ls):
            alerte.append("batterie")
        if any(l.compose for l in ls):
            alerte.append("composé allée 11")
        rows.append([k, numeros[id(t)], t.vague, t.type, t.flux, m["commandes"], m["lignes"], round(m["unites"]),
                     m["colis"], " + ".join(f"{n}×{c}" for c, n in sorted(cont.items())),
                     round(m["places"], 1), round(m["poids"], 1), m["allees"],
                     f"{min(t.profil)}→{max(t.profil)}", round(m["distance"]), m["mode"],
                     round(m["minutes"], 1), round(m["lignes"] / (m["minutes"] / 60)), " · ".join(alerte)])
    feuille(wb.create_sheet("TOURNEES"),
            ["Ordre lancement", "Tournée", "Vague", "Type", "Flux", "Commandes", "Lignes", "Unités", "Colis",
             "Contenants à prendre", "Places chariot", "Poids (kg)", "Allées", "Allées de→à", "Distance (m)",
             "Parcours", "Durée est. (min)", "Lignes/h est.", "Points d'attention"], rows,
            {"Contenants à prendre": 30, "Points d'attention": 40})

    # PRELEVEMENT : ordre de passage
    rows = []
    for t in ordre:
        _, mode = plan.distance(t.profil)
        colis_ligne = {l.idx: c for c in colis_de(t) for l in c.lignes}
        for i, l in enumerate(plan.sequence(lignes_de(t), mode), 1):
            consigne = []
            if t.type == "MONO":
                consigne.append("1 article = 1 C16, étiquette après prélèvement (P13)")
            if l.compose:
                consigne.append("Composé : lire l'image, nb exact d'éléments (P16)")
            if l.aerosol:
                consigne.append("Aérosol : C16 scotché (P12)")
            if l.batterie:
                consigne.append("Batterie : enveloppe + étiquette DANGER (P12)")
            colis = colis_ligne[l.idx]
            rows.append([numeros[id(t)], i, l.emplacement, l.allee, l.ep, l.niveau, l.reference, l.designation,
                         l.qte, l.commande, l.client, colis.id, colis.contenant, " · ".join(consigne)])
    feuille(wb.create_sheet("PRELEVEMENT"),
            ["Tournée", "Ordre", "Emplacement", "Allée", "EP", "Niveau", "Référence", "Désignation", "Qté",
             "Commande", "Client", "Colis", "Contenant", "Consigne"], rows, {"Désignation": 34, "Consigne": 45})

    # PREVISIONNEL par vague
    par_v = defaultdict(list)
    for t in tournees:
        par_v[t.vague].append(t)
    rows = []
    for v in sorted(par_v, key=cle_vague):
        d = total(par_v[v], plan)
        rows.append([v, d["tournees"], d["lignes"], round(d["minutes"] / 60, 1),
                     round(d["minutes"] / 60 / (H_REF * RENDEMENT_ETP), 1),
                     round(d["minutes"] / 60 / RENDEMENT_ETP, 1)])
    rows.append(["TOTAL", opt["tournees"], opt["lignes"], round(heures, 1), round(etp, 1),
                 round(heures / RENDEMENT_ETP, 1)])
    feuille(wb.create_sheet("PREVISIONNEL"),
            ["Vague / départ", "Tournées", "Lignes", "Heures de prépa", "ETP journée", "Heures de présence à planifier"],
            rows)

    # CONTROLES
    ws = wb.create_sheet("CONTROLES")
    feuille(ws, ["Règle", "Résultat", "Nb", "Détail"], [list(c) for c in controles], {"Règle": 55, "Détail": 70})
    for r in range(2, ws.max_row + 1):
        v = ws.cell(r, 2).value
        ws.cell(r, 2).fill = PatternFill("solid", fgColor=VERT if v == "OK" else ORANGE)

    feuille(wb.create_sheet("ANOMALIES"), ["Type", "Objet", "Détail"], [list(a) for a in anomalies],
            {"Détail": 80, "Objet": 30})

    # PARAMETRES
    params = [
        ("Lignes min / max (multi)", f"{LIGNES_MIN} / {LIGNES_MAX}"),
        ("Monolignes min / max (C16)", f"{MONO_MIN} / {MONO_MAX}"),
        ("Rétract max lignes", RETRACT_MAX),
        ("Niveau mini rétract", NIVEAU_MIN_RETRACT if NIVEAU_MIN_RETRACT is not None else "désactivé"),
        ("Chariot : places / poids max", f"{CHARIOT_PLACES} / {CHARIOT_POIDS_MAX:g} kg"),
        ("Mélange de flux autorisé", "oui" if MELANGER_FLUX else "non (P03)"),
        ("Stratégie de parcours", STRATEGIE),
        ("Plan : module allée / longueur EP", f"{ALLEE_LARGEUR_MODULE} m / {EP_LONGUEUR} m"),
        ("Taux de remplissage contenant", f"{TAUX_REMPLISSAGE:.0%}"),
        ("Temps : fixe / ligne / unité / colis", f"{TEMPS['fixe']:.0f} / {TEMPS['ligne']:.0f} / {TEMPS['unite']:.1f} / {TEMPS['colis']:.0f} s"),
        ("Vitesse chariot", f"{TEMPS['vitesse']:.2f} m/s"),
    ]
    for fam, cs in CONTENANTS.items():
        params.append((f"Contenants {fam}", " · ".join(f"{c['code']} {c['volume']} L {c['poids']} kg {c['places']} pl."
                                                       for c in cs)))
    feuille(wb.create_sheet("PARAMETRES"), ["Paramètre", "Valeur"], [list(p) for p in params],
            {"Paramètre": 40, "Valeur": 90})
    wb.save(chemin)


# ─────────────────────────── programme ───────────────────────────
def optimiser(lignes: list[Ligne], anomalies: list, limite_s: float):
    plan = Plan(lignes)
    blocs = construire_blocs(lignes, anomalies)
    opt = Optimiseur(plan)
    tournees, fifo = [], []
    stats = {"passes": 0, "ameliorations": 0, "duree_s": 0.0}
    gr = sorted(groupes(blocs).items(), key=lambda kv: cle_vague(kv[0][0]))
    n_total = sum(len(bs) for _, bs in gr) or 1
    for (vague, type_, flux), bs in gr:
        ts = opt.construire(bs, type_, flux, vague)
        s = opt.ameliorer(ts, limite_s * len(bs) / n_total)
        for k in stats:
            stats[k] += s[k]
        tournees += ts
        fifo += opt.lotir_fifo(bs, type_, flux, vague)
    stats["duree_s"] = round(stats["duree_s"], 1)
    return plan, tournees, fifo, stats


def charger_calibration(chemin: Path):
    if chemin.exists():
        d = json.loads(chemin.read_text(encoding="utf-8"))
        for k in ("fixe", "ligne", "unite", "colis", "vitesse"):
            if k in d:
                TEMPS[k] = float(d[k])
        return d
    return None


def main(argv=None):
    global LIGNES_MIN, LIGNES_MAX, MONO_MIN, MONO_MAX, CHARIOT_PLACES, STRATEGIE, NIVEAU_MIN_RETRACT
    ap = argparse.ArgumentParser(description="Optimisation des tournées Pick & Pack")
    ap.add_argument("fichier", type=Path, help="extraction des lignes à préparer (.csv ou .xlsx)")
    ap.add_argument("--sortie", type=Path, help="classeur Excel produit (défaut : tournees_<date>.xlsx)")
    ap.add_argument("--lignes-min", type=int)
    ap.add_argument("--lignes-max", type=int)
    ap.add_argument("--mono-min", type=int)
    ap.add_argument("--mono-max", type=int)
    ap.add_argument("--places", type=float, help="capacité chariot en places")
    ap.add_argument("--niveau-retract", type=int, help="niveau à partir duquel la ligne part en tournée rétract")
    ap.add_argument("--strategie", choices=["S", "RETOUR", "MIXTE"])
    ap.add_argument("--temps-calcul", type=float, default=TEMPS_CALCUL_MAX, help="secondes d'optimisation au total")
    ap.add_argument("--calibrer", action="store_true", help="recaler les temps standards sur des tournées réalisées")
    ap.add_argument("--calibration", type=Path, default=Path(__file__).with_name("calibration.json"))
    a = ap.parse_args(argv)

    def opt(v, defaut):
        return defaut if v is None else v
    LIGNES_MIN, LIGNES_MAX = opt(a.lignes_min, LIGNES_MIN), opt(a.lignes_max, LIGNES_MAX)
    MONO_MIN, MONO_MAX = opt(a.mono_min, MONO_MIN), opt(a.mono_max, MONO_MAX)
    CHARIOT_PLACES = opt(a.places, CHARIOT_PLACES)
    STRATEGIE = opt(a.strategie, STRATEGIE)
    NIVEAU_MIN_RETRACT = opt(a.niveau_retract, NIVEAU_MIN_RETRACT)
    if LIGNES_MIN > LIGNES_MAX or MONO_MIN > MONO_MAX or LIGNES_MAX < 1 or MONO_MAX < 1:
        sys.exit("Réglages incohérents : il faut 1 ≤ minimum ≤ maximum (lignes et monolignes).")

    anomalies = []
    lignes = charger_lignes(a.fichier, anomalies)
    if a.calibrer:
        calibrer(lignes, Plan(lignes), a.calibration)
        return
    cal = charger_calibration(a.calibration)

    plan, tournees, fifo, stats = optimiser(lignes, anomalies, a.temps_calcul)
    wms = tournees_wms(lignes, plan)
    controles = controler(tournees, lignes)
    sortie = a.sortie or Path(f"tournees_{dt.datetime.now():%Y%m%d_%H%M}.xlsx")
    ecrire_excel(sortie, tournees, plan, fifo, wms, controles, anomalies, stats, a.fichier.name)

    o, f = total(tournees, plan), total(fifo, plan)

    def gain(ref):
        return f"{(ref - o['distance']) / ref:.1%}" if ref else "—"
    print(f"{len(lignes)} lignes · {len({l.commande for l in lignes})} commandes · {o['tournees']} tournées")
    print(f"Distance : {o['distance']:.0f} m (FIFO {f['distance']:.0f} m, gain {gain(f['distance'])})")
    if wms:
        w = total(wms, plan)
        print(f"           vs tournées WMS {w['distance']:.0f} m, gain {gain(w['distance'])}")
    print(f"Temps estimé : {o['minutes'] / 60:.1f} h · {o['lignes_h']:.0f} lignes/h"
          + (f" (temps calibrés le {cal.get('_date')})" if cal else " (temps standards non calibrés)"))
    ecarts = [c for c in controles if c[1] == "ÉCART"]
    print(f"Contrôles : {len(controles) - len(ecarts)}/{len(controles)} conformes" + (" — VOIR ONGLET CONTROLES" if ecarts else ""))
    print(f"Anomalies de données : {len(anomalies)}")
    print(f"→ {sortie}")
    return 1 if ecarts else 0


if __name__ == "__main__":
    sys.exit(main())
