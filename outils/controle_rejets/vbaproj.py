"""
vbaproj.py — fabrique un xl/vbaProject.bin à partir de sources VBA (texte).

Le projet est écrit « source seule » (MS-OVBA) : pas de p-code, _VBA_PROJECT en
version 0xFFFF. À l'ouverture, Excel recompile les modules depuis le source.
Bibliothèque standard uniquement.

    from vbaproj import construire_projet
    bin_ = construire_projet(modules)   # modules : liste de (nom, "doc"|"std", source)

Les modules « doc » (ThisWorkbook, feuilles) doivent porter le même nom que le
codeName du classeur / de la feuille.
"""
from __future__ import annotations

import struct
import uuid

CODEPAGE = 1252
ENDOFCHAIN = 0xFFFFFFFE
FREESECT = 0xFFFFFFFF
FATSECT = 0xFFFFFFFD
NOSTREAM = 0xFFFFFFFF

# ─────────────────────────── compression MS-OVBA 2.4.1 ───────────────────────────


def _compresser_bloc(data: bytes) -> bytes:
    """Compresse un bloc décompressé (≤ 4096 octets) en séquences de jetons."""
    out = bytearray()
    pos, n = 0, len(data)
    index: dict[bytes, list[int]] = {}

    def ajouter(i: int) -> None:
        if i + 3 <= n:
            index.setdefault(data[i:i + 3], []).append(i)

    while pos < n:
        flag_pos = len(out)
        out.append(0)
        flags = 0
        for bit in range(8):
            if pos >= n:
                break
            diff = pos  # position relative au début du bloc
            best_len, best_off = 0, 0
            if diff > 0 and pos + 3 <= n:
                bc = 4
                while (1 << bc) < diff:
                    bc += 1
                max_len = (0xFFFF >> bc) + 3
                max_off = 1 << bc
                for cand in reversed(index.get(data[pos:pos + 3], [])[-64:]):
                    off = pos - cand
                    if off > max_off:
                        break
                    ln = 3
                    lim = min(max_len, n - pos)
                    while ln < lim and data[cand + ln] == data[pos + ln]:
                        ln += 1
                    if ln > best_len:
                        best_len, best_off = ln, off
                        if ln == lim:
                            break
            if best_len >= 3:
                bc = 4
                while (1 << bc) < diff:
                    bc += 1
                jeton = ((best_off - 1) << (16 - bc)) | (best_len - 3)
                out += struct.pack("<H", jeton)
                flags |= 1 << bit
                for k in range(best_len):
                    ajouter(pos + k)
                pos += best_len
            else:
                out.append(data[pos])
                ajouter(pos)
                pos += 1
        out[flag_pos] = flags
    return bytes(out)


def compresser(data: bytes) -> bytes:
    out = bytearray(b"\x01")
    for deb in range(0, len(data), 4096):
        bloc = data[deb:deb + 4096]
        comp = _compresser_bloc(bloc)
        if len(comp) <= 4096 - 2 + 2 and len(comp) + 2 <= 4098:
            out += struct.pack("<H", 0xB000 | (len(comp) + 2 - 3))
            out += comp
        else:  # bloc incompressible : stocké brut (toujours 4096 octets)
            assert len(bloc) == 4096, "bloc final incompressible"
            out += struct.pack("<H", 0x3000 | 0x0FFF)
            out += bloc
    return bytes(out)


# ─────────────────────────── fichier composé (CFB v3) ───────────────────────────


class _Noeud:
    def __init__(self, nom: str, donnees: bytes | None = None, enfants=None):
        self.nom = nom
        self.donnees = donnees            # None = stockage
        self.enfants = enfants or []
        self.id = -1
        self.gauche = self.droite = self.fils = NOSTREAM
        self.debut = 0
        self.taille = 0


def _cle(n: _Noeud):
    return (len(n.nom), n.nom.upper())


def _arbre(enfants: list[_Noeud]) -> int:
    """Arbre binaire de recherche équilibré (tous noirs) ; renvoie l'id de la racine."""
    if not enfants:
        return NOSTREAM
    enfants = sorted(enfants, key=_cle)
    m = len(enfants) // 2
    r = enfants[m]
    r.gauche = _arbre(enfants[:m])
    r.droite = _arbre(enfants[m + 1:])
    return r.id


def ecrire_cfb(racine_enfants: list[_Noeud]) -> bytes:
    SECT = 512
    racine = _Noeud("Root Entry", None, racine_enfants)
    tous: list[_Noeud] = []

    def numeroter(n: _Noeud):
        n.id = len(tous)
        tous.append(n)
        for e in n.enfants:
            numeroter(e)
    numeroter(racine)
    for n in tous:
        if n.donnees is None:
            n.fils = _arbre(n.enfants)

    flux = [n for n in tous if n.donnees is not None]
    petits = [n for n in flux if len(n.donnees) < 4096]
    gros = [n for n in flux if len(n.donnees) >= 4096]

    # mini-flux
    mini = bytearray()
    minifat: list[int] = []
    for n in petits:
        n.taille = len(n.donnees)
        nb = max(1, -(-len(n.donnees) // 64))
        n.debut = len(minifat)
        for k in range(nb):
            minifat.append(n.debut + k + 1 if k < nb - 1 else ENDOFCHAIN)
        mini += n.donnees + b"\0" * (nb * 64 - len(n.donnees))

    def nb_sect(octets: int) -> int:
        return -(-octets // SECT)

    n_dir = nb_sect(len(tous) * 128)
    n_minifat = nb_sect(len(minifat) * 4)
    n_mini = nb_sect(len(mini))
    n_gros = sum(nb_sect(len(n.donnees)) for n in gros)
    n_fat = 1
    while True:
        total = n_fat + n_dir + n_minifat + n_mini + n_gros
        if n_fat * 128 >= total:
            break
        n_fat += 1
    assert n_fat <= 109

    fat = [FREESECT] * (n_fat * 128)
    s = 0
    for _ in range(n_fat):
        fat[s] = FATSECT
        s += 1

    def chaine(nb: int) -> int:
        nonlocal s
        if nb == 0:
            return ENDOFCHAIN
        deb = s
        for k in range(nb):
            fat[s] = s + 1 if k < nb - 1 else ENDOFCHAIN
            s += 1
        return deb

    dir_deb = chaine(n_dir)
    minifat_deb = chaine(n_minifat)
    mini_deb = chaine(n_mini)
    for n in gros:
        n.taille = len(n.donnees)
        n.debut = chaine(nb_sect(len(n.donnees)))
    racine.debut = mini_deb if n_mini else ENDOFCHAIN
    racine.taille = len(mini)

    # répertoire
    rep = bytearray()
    for n in tous:
        nom = n.nom.encode("utf-16-le")
        assert len(nom) <= 62
        e = bytearray(128)
        e[0:len(nom)] = nom
        struct.pack_into("<H", e, 64, len(nom) + 2)
        e[66] = 5 if n is racine else (1 if n.donnees is None else 2)
        e[67] = 1  # noir
        struct.pack_into("<III", e, 68, n.gauche, n.droite, n.fils)
        debut = n.debut if (n is racine or n.donnees is not None) else 0
        taille = n.taille if (n is racine or n.donnees is not None) else 0
        if n.donnees is not None and taille == 0:
            debut = ENDOFCHAIN
        struct.pack_into("<IQ", e, 116, debut, taille)
        rep += e
    while len(rep) % SECT:
        e = bytearray(128)
        struct.pack_into("<III", e, 68, NOSTREAM, NOSTREAM, NOSTREAM)
        rep += e

    mf = bytearray()
    for v in minifat:
        mf += struct.pack("<I", v)
    while len(mf) % SECT:
        mf += struct.pack("<I", FREESECT)

    entete = bytearray(512)
    entete[0:8] = bytes.fromhex("D0CF11E0A1B11AE1")
    struct.pack_into("<HHHHH", entete, 24, 0x003E, 0x0003, 0xFFFE, 9, 6)
    struct.pack_into("<I", entete, 44, n_fat)
    struct.pack_into("<I", entete, 48, dir_deb)
    struct.pack_into("<I", entete, 56, 4096)
    struct.pack_into("<I", entete, 60, minifat_deb if n_minifat else ENDOFCHAIN)
    struct.pack_into("<I", entete, 64, n_minifat)
    struct.pack_into("<I", entete, 68, ENDOFCHAIN)
    struct.pack_into("<I", entete, 72, 0)
    for k in range(109):
        struct.pack_into("<I", entete, 76 + 4 * k, k if k < n_fat else FREESECT)

    corps = bytearray()
    for v in fat:
        corps += struct.pack("<I", v)
    corps += rep + mf
    corps += mini + b"\0" * (n_mini * SECT - len(mini))
    for n in gros:
        corps += n.donnees + b"\0" * (nb_sect(len(n.donnees)) * SECT - len(n.donnees))
    assert len(corps) == s * SECT
    return bytes(entete + corps)


# ─────────────────────────── projet VBA (MS-OVBA 2.3) ───────────────────────────


def _rec(rid: int, data: bytes) -> bytes:
    return struct.pack("<HI", rid, len(data)) + data


def _flux_dir(modules) -> bytes:
    cp = "cp1252"
    d = bytearray()
    d += _rec(0x01, struct.pack("<I", 1))              # SYSKIND Win32
    d += _rec(0x02, struct.pack("<I", 0x0409))         # LCID
    d += _rec(0x14, struct.pack("<I", 0x0409))         # LCIDINVOKE
    d += _rec(0x03, struct.pack("<H", CODEPAGE))       # CODEPAGE
    d += _rec(0x04, b"VBAProject")
    d += _rec(0x05, b"") + _rec(0x40, b"")             # DOCSTRING
    d += _rec(0x06, b"") + _rec(0x3D, b"")             # HELPFILE
    d += _rec(0x07, struct.pack("<I", 0))              # HELPCONTEXT
    d += _rec(0x08, struct.pack("<I", 0))              # LIBFLAGS
    d += struct.pack("<HIIH", 0x09, 4, 1, 0)           # VERSION (taille 4 + minor)
    d += _rec(0x0C, b"") + _rec(0x3C, b"")             # CONSTANTS
    # référence stdole (OLE Automation)
    lib = b"*\\G{00020430-0000-0000-C000-000000000046}#2.0#0#C:\\Windows\\System32\\stdole2.tlb#OLE Automation"
    d += _rec(0x16, b"stdole") + _rec(0x3E, "stdole".encode("utf-16-le"))
    d += _rec(0x0D, struct.pack("<I", len(lib)) + lib + struct.pack("<IH", 0, 0))
    d += _rec(0x0F, struct.pack("<H", len(modules)))   # MODULES
    d += _rec(0x13, struct.pack("<H", 0xFFFF))         # COOKIE
    for nom, genre, _src in modules:
        b = nom.encode(cp)
        u = nom.encode("utf-16-le")
        d += _rec(0x19, b) + _rec(0x47, u)
        d += _rec(0x1A, b) + _rec(0x32, u)
        d += _rec(0x1C, b"") + _rec(0x48, b"")
        d += _rec(0x31, struct.pack("<I", 0))          # MODULEOFFSET : source seul
        d += _rec(0x1E, struct.pack("<I", 0))
        d += _rec(0x2C, struct.pack("<H", 0xFFFF))
        d += _rec(0x22 if genre == "doc" else 0x21, b"")
        d += _rec(0x2B, b"")
    d += _rec(0x10, b"")
    return bytes(d)


def _flux_project(modules, ident: str) -> bytes:
    lignes = [f'ID="{{{ident}}}"']
    for nom, genre, _ in modules:
        lignes.append(f"Document={nom}/&H00000000" if genre == "doc" else f"Module={nom}")
    lignes += [
        'Name="VBAProject"',
        'HelpContextID="0"',
        'VersionCompatible32="393222000"',
        'CMG="888A627066706670667066"',
        'DPB="888A627563756375"',
        'GC="989A72857385737A"',
        "",
        "[Host Extender Info]",
        "&H00000001={3832D640-CF90-11CF-8E43-00A0C911005A};VBE;&H00000000",
        "",
        "[Workspace]",
    ]
    lignes += [f"{nom}=0, 0, 0, 0, C" for nom, _, _ in modules]
    return ("\r\n".join(lignes) + "\r\n").encode("cp1252")


def _flux_projectwm(modules) -> bytes:
    d = bytearray()
    for nom, _, _ in modules:
        d += nom.encode("cp1252") + b"\0" + nom.encode("utf-16-le") + b"\0\0"
    return bytes(d + b"\0\0")


def construire_projet(modules, ident: str | None = None) -> bytes:
    """modules : [(nom, 'doc'|'std', source_texte)] ; source avec ses lignes Attribute."""
    ident = ident or str(uuid.uuid4()).upper()
    vba = []
    for nom, _genre, src in modules:
        texte = src.replace("\r\n", "\n").replace("\n", "\r\n")
        if not texte.endswith("\r\n"):
            texte += "\r\n"
        vba.append(_Noeud(nom, compresser(texte.encode("cp1252"))))
    vba.append(_Noeud("_VBA_PROJECT", bytes.fromhex("CC61FFFF000000")))
    vba.append(_Noeud("dir", compresser(_flux_dir(modules))))
    enfants = [
        _Noeud("VBA", None, vba),
        _Noeud("PROJECT", _flux_project(modules, ident)),
        _Noeud("PROJECTwm", _flux_projectwm(modules)),
    ]
    return ecrire_cfb(enfants)


ENTETE_DOC = """Attribute VB_Name = "{nom}"
Attribute VB_Base = "{base}"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = True
Attribute VB_TemplateDerived = False
Attribute VB_Customizable = True
"""
BASE_CLASSEUR = "0{00020819-0000-0000-C000-000000000046}"
BASE_FEUILLE = "0{00020820-0000-0000-C000-000000000046}"


def module_document(nom: str, code: str, classeur: bool = False) -> str:
    base = BASE_CLASSEUR if classeur else BASE_FEUILLE
    return ENTETE_DOC.format(nom=nom, base=base) + code


def module_standard(nom: str, code: str) -> str:
    return f'Attribute VB_Name = "{nom}"\n' + code
