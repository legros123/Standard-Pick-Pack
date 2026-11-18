"""Outils MS-OVBA / MS-CFB : compression, lecture du flux dir, écriture d'un fichier composé."""
import struct, math


# ---------- compression MS-OVBA (2.4.1) ----------
def decompress(data):
    assert data[0] == 1
    out = bytearray(); pos = 1
    while pos < len(data):
        hdr = struct.unpack_from("<H", data, pos)[0]; pos += 2
        size = (hdr & 0x0FFF) + 3; comp = hdr >> 15; end = min(len(data), pos + size - 2)
        start = len(out)
        if not comp:
            out += data[pos:pos + 4096]; pos += 4096; continue
        while pos < end:
            flags = data[pos]; pos += 1
            for bit in range(8):
                if pos >= end: break
                if not (flags >> bit) & 1:
                    out.append(data[pos]); pos += 1
                else:
                    tok = struct.unpack_from("<H", data, pos)[0]; pos += 2
                    diff = len(out) - start
                    nbits = max(4, math.ceil(math.log2(diff))) if diff > 1 else 4
                    lmask = 0xFFFF >> nbits
                    length = (tok & lmask) + 3; off = (tok >> (16 - nbits)) + 1
                    for _ in range(length): out.append(out[-off])
    return bytes(out)


def _chunk(buf):
    """Compresse un bloc d'au plus 4096 octets ; renvoie le bloc avec son en-tête."""
    out = bytearray(); pos = 0; n = len(buf)
    while pos < n:
        flag_pos = len(out); out.append(0); flags = 0
        for bit in range(8):
            if pos >= n: break
            nbits = max(4, math.ceil(math.log2(pos))) if pos > 1 else 4
            maxlen = (0xFFFF >> nbits) + 3
            best_len = 0; best_off = 0
            lim = min(maxlen, n - pos)
            if pos > 0 and lim >= 3:
                # recherche de la plus longue répétition dans la fenêtre du bloc
                first = buf[pos:pos + 3]
                cand = buf.rfind(first, max(0, pos - (1 << nbits)), pos + 2)
                tries = 0
                while cand >= 0 and tries < 64:
                    l = 3
                    while l < lim and buf[cand + l] == buf[pos + l]: l += 1
                    if l > best_len: best_len, best_off = l, pos - cand
                    if l == lim: break
                    cand = buf.rfind(first, max(0, pos - (1 << nbits)), cand + 2) if cand > 0 else -1
                    tries += 1
            if best_len >= 3:
                tok = ((best_off - 1) << (16 - nbits)) | (best_len - 3)
                out += struct.pack("<H", tok); flags |= 1 << bit; pos += best_len
            else:
                out.append(buf[pos]); pos += 1
        out[flag_pos] = flags
    if len(out) >= 4096:                       # incompressible : bloc brut de 4096 octets
        raw = bytes(buf) + b"\x00" * (4096 - n)
        return struct.pack("<H", 0x3000 | 4095) + raw
    return struct.pack("<H", 0xB000 | (len(out) + 2 - 3)) + bytes(out)


def compress(data):
    out = bytearray(b"\x01")
    for i in range(0, len(data), 4096):
        out += _chunk(data[i:i + 4096])
    return bytes(out)


# ---------- flux dir : suite d'enregistrements id / taille / données ----------
def lire_dir(d):
    recs = []; pos = 0
    while pos < len(d):
        rid, size = struct.unpack_from("<HI", d, pos); pos += 6
        if rid == 0x0009: size = 6             # PROJECTVERSION : la taille annoncée (4) ne compte pas la version mineure
        recs.append([rid, d[pos:pos + size]]); pos += size
    return recs


def ecrire_dir(recs):
    out = bytearray()
    for rid, data in recs:
        out += struct.pack("<HI", rid, 4 if rid == 0x0009 else len(data)) + data
    return bytes(out)


def module_recs(nom, document=False):
    b = nom.encode("cp1252"); u = nom.encode("utf-16-le")
    return [[0x0019, b], [0x0047, u], [0x001A, b], [0x0032, u], [0x001C, b""], [0x0048, b""],
            [0x0031, struct.pack("<I", 0)], [0x001E, struct.pack("<I", 0)], [0x002C, struct.pack("<H", 0xFFFF)],
            [0x0022 if document else 0x0021, b""], [0x002B, b""]]


# ---------- fichier composé (MS-CFB v3, secteurs de 512 octets) ----------
FREE, EOC, FATSECT = 0xFFFFFFFF, 0xFFFFFFFE, 0xFFFFFFFD


def ecrire_cfb(arbre, clsid_racine=b"\x00" * 16):
    """arbre : dict nom -> bytes (flux) ou dict (dossier). Renvoie les octets du fichier."""
    entrees = [dict(nom="Root Entry", typ=5, enfants=[], data=b"")]

    def ajouter(parent, contenu):
        for nom in sorted(contenu, key=lambda n: (len(n.encode("utf-16-le")), n.upper())):
            v = contenu[nom]; i = len(entrees)
            entrees.append(dict(nom=nom, typ=1 if isinstance(v, dict) else 2, enfants=[], data=b"" if isinstance(v, dict) else v))
            entrees[parent]["enfants"].append(i)
            if isinstance(v, dict): ajouter(i, v)
    ajouter(0, arbre)

    for e in entrees: e.update(g=FREE, d=FREE, fils=FREE)

    def equilibrer(ids):
        if not ids: return FREE
        m = len(ids) // 2; r = ids[m]
        entrees[r]["g"] = equilibrer(ids[:m]); entrees[r]["d"] = equilibrer(ids[m + 1:])
        return r
    for e in entrees:
        if e["typ"] in (1, 5): e["fils"] = equilibrer(e["enfants"])

    # mini-flux : tous les flux de moins de 4096 octets
    mini = bytearray(); minifat = []
    secteurs = []                                  # contenu des secteurs de données, dans l'ordre
    fat = []

    def poser(data):                               # place des données en secteurs normaux, renvoie le premier secteur
        if not data: return EOC
        n = -(-len(data) // 512); debut = len(secteurs)
        for k in range(n):
            secteurs.append(data[k * 512:(k + 1) * 512].ljust(512, b"\x00"))
            fat.append(debut + k + 1 if k < n - 1 else EOC)
        return debut

    for e in entrees:
        if e["typ"] != 2: e["debut"] = EOC if e["typ"] == 5 else 0; continue
        d = e["data"]
        if len(d) == 0: e["debut"] = EOC
        elif len(d) < 4096:
            n = -(-len(d) // 64); debut = len(minifat)
            mini += d.ljust(n * 64, b"\x00")
            minifat += [debut + k + 1 if k < n - 1 else EOC for k in range(n)]
            e["debut"] = debut
        else: e["debut"] = poser(d)
    entrees[0]["data"] = bytes(mini)
    entrees[0]["debut"] = poser(bytes(mini))
    minifat_bytes = b"".join(struct.pack("<I", x) for x in minifat)
    minifat_bytes = minifat_bytes.ljust(-(-len(minifat_bytes) // 512) * 512, b"\xff") if minifat_bytes else b""
    debut_minifat = poser(minifat_bytes); n_minifat = len(minifat_bytes) // 512

    def entree_bytes(e):
        nom = e["nom"].encode("utf-16-le") + b"\x00\x00"
        taille = len(e["data"]) if e["typ"] in (2, 5) else 0
        debut = e["debut"] if e["typ"] != 1 else 0
        return (nom.ljust(64, b"\x00") + struct.pack("<HBB", len(nom), e["typ"], 1) + struct.pack("<III", e["g"], e["d"], e["fils"]) +
                (clsid_racine if e["typ"] == 5 else b"\x00" * 16) + struct.pack("<I", 0) + b"\x00" * 16 + struct.pack("<IQ", debut, taille))
    rep = b"".join(entree_bytes(e) for e in entrees)
    while len(rep) % 512:
        rep += b"\x00" * 64 + struct.pack("<HBB", 0, 0, 0) + struct.pack("<III", FREE, FREE, FREE) + b"\x00" * 16 + b"\x00" * 4 + b"\x00" * 16 + struct.pack("<IQ", 0, 0)
    debut_rep = poser(rep)

    # secteurs de FAT : ils se décrivent eux-mêmes
    n_fat = 1
    while n_fat * 128 < len(fat) + n_fat: n_fat += 1
    assert n_fat <= 109
    debut_fat = len(secteurs)
    fat += [FATSECT] * n_fat
    fat_bytes = b"".join(struct.pack("<I", x) for x in fat).ljust(n_fat * 512, b"\xff")
    for k in range(n_fat): secteurs.append(fat_bytes[k * 512:(k + 1) * 512])

    entete = (b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1" + b"\x00" * 16 + struct.pack("<HHHHH", 0x003E, 3, 0xFFFE, 9, 6) + b"\x00" * 6 +
              struct.pack("<IIIIIIIII", 0, n_fat, debut_rep, 0, 4096, debut_minifat if n_minifat else EOC, n_minifat, EOC, 0))
    difat = [debut_fat + k for k in range(n_fat)] + [FREE] * (109 - n_fat)
    entete += b"".join(struct.pack("<I", x) for x in difat)
    assert len(entete) == 512
    return entete + b"".join(secteurs)
