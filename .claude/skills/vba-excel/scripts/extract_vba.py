#!/usr/bin/env python3
"""Extrait le code VBA d'un .xlsm / .xlsb / .xlam / .docm (ou d'un vbaProject.bin / .xls OLE)
sans dépendance externe. Lecture seule : ne lance jamais les macros.
Usage : python3 -I extract_vba.py FICHIER DOSSIER_SORTIE
"""
import struct, sys, zipfile, io, os

def read_cfb(data):
    if data[:8] != b"\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1":
        raise ValueError("pas un conteneur OLE/CFB")
    ssz = 1 << struct.unpack_from("<H", data, 0x1E)[0]
    msz = 1 << struct.unpack_from("<H", data, 0x20)[0]
    n_fat, dir_start = struct.unpack_from("<II", data, 0x2C)
    cutoff, mfat_start, n_mfat, difat_start, n_difat = struct.unpack_from("<IIIII", data, 0x38)
    sec = lambda i: data[(i + 1) * ssz:(i + 2) * ssz]
    difat = list(struct.unpack_from("<109I", data, 0x4C))
    nxt = difat_start
    for _ in range(n_difat):
        s = sec(nxt); vals = struct.unpack("<%dI" % (ssz // 4), s)
        difat += vals[:-1]; nxt = vals[-1]
    fat = []
    for i in difat[:n_fat]:
        fat += struct.unpack("<%dI" % (ssz // 4), sec(i))
    def chain(start, table):
        out, seen = [], set()
        while start < 0xFFFFFFFA and start not in seen:
            seen.add(start); out.append(start); start = table[start]
        return out
    big = lambda start: b"".join(sec(i) for i in chain(start, fat))
    raw_dir = big(dir_start)
    ents = []
    for o in range(0, len(raw_dir), 128):
        e = raw_dir[o:o + 128]
        nlen = struct.unpack_from("<H", e, 0x40)[0]
        name = e[:max(nlen - 2, 0)].decode("utf-16-le", "replace")
        typ = e[0x42]
        left, right, child = struct.unpack_from("<III", e, 0x44)
        start, size = struct.unpack_from("<II", e, 0x74)
        ents.append(dict(name=name, type=typ, left=left, right=right, child=child, start=start, size=size))
    root = ents[0]
    mini_stream = big(root["start"])
    mfat = []
    for i in chain(mfat_start, fat):
        mfat += struct.unpack("<%dI" % (ssz // 4), sec(i))
    def stream(e):
        if e["size"] < cutoff:
            d = b"".join(mini_stream[i * msz:(i + 1) * msz] for i in chain(e["start"], mfat))
        else:
            d = big(e["start"])
        return d[:e["size"]]
    paths = {}
    def walk(idx, prefix):
        stack = [idx]
        while stack:
            i = stack.pop()
            if i >= len(ents) or i == 0xFFFFFFFF:
                continue
            e = ents[i]
            stack += [e["left"], e["right"]]
            p = prefix + [e["name"]]
            if e["type"] == 2:
                paths["/".join(p)] = e
            elif e["type"] == 1:
                walk(e["child"], p)
    walk(root["child"], [])
    return {k: stream(v) for k, v in paths.items()}

def decompress(d):
    if not d or d[0] != 1:
        raise ValueError("conteneur compressé VBA invalide")
    out, pos = bytearray(), 1
    while pos < len(d):
        hdr = struct.unpack_from("<H", d, pos)[0]
        end = min(len(d), pos + (hdr & 0x0FFF) + 3); pos += 2
        cstart = len(out)
        if not (hdr & 0x8000):
            out += d[pos:pos + 4096]; pos += 4096; continue
        while pos < end:
            flags = d[pos]; pos += 1
            for b in range(8):
                if pos >= end:
                    break
                if not flags & (1 << b):
                    out.append(d[pos]); pos += 1
                else:
                    tok = struct.unpack_from("<H", d, pos)[0]; pos += 2
                    bits = max((len(out) - cstart - 1).bit_length(), 4)
                    off = (tok >> (16 - bits)) + 1
                    ln = (tok & (0xFFFF >> bits)) + 3
                    for _ in range(ln):
                        out.append(out[-off])
    return bytes(out)

def modules(streams):
    vba_dirs = [k[:-3] for k in streams if k.lower().endswith("vba/dir")]
    if not vba_dirs:
        raise ValueError("aucun projet VBA trouvé")
    base = vba_dirs[0]
    d = decompress(streams[base + "dir"])
    pos, codepage, mods, cur = 0, 1252, [], None
    while pos + 6 <= len(d):
        rid, size = struct.unpack_from("<HI", d, pos); pos += 6
        if rid == 0x0009:
            size = 6
        val = d[pos:pos + size]; pos += size
        if rid == 0x0003:
            codepage = struct.unpack("<H", val[:2])[0]
        elif rid == 0x0019:
            cur = {"name": val, "type": "bas"}; mods.append(cur)
        elif rid == 0x001A and cur is not None:
            cur["stream"] = val
        elif rid == 0x0031 and cur is not None:
            cur["offset"] = struct.unpack("<I", val)[0]
        elif rid == 0x0022 and cur is not None:
            cur["type"] = "cls"
    enc = "cp%d" % codepage
    try:
        "".encode(enc)
    except LookupError:
        enc = "cp1252"
    out = []
    for m in mods:
        name = m["name"].decode(enc, "replace")
        sname = m.get("stream", m["name"]).decode(enc, "replace")
        key = next((k for k in streams if k.lower() == (base + sname).lower()), None)
        if key is None:
            continue
        code = decompress(streams[key][m.get("offset", 0):]).decode(enc, "replace")
        out.append((name, m["type"], code))
    return out

def main(src, dst):
    raw = open(src, "rb").read()
    if raw[:2] == b"PK":
        z = zipfile.ZipFile(io.BytesIO(raw))
        bins = [n for n in z.namelist() if n.lower().endswith("vbaproject.bin")]
        if not bins:
            print("Aucun vbaProject.bin : le fichier ne contient pas de macros VBA."); return 1
        raw = z.read(bins[0])
    mods = modules(read_cfb(raw))
    os.makedirs(dst, exist_ok=True)
    for name, typ, code in mods:
        safe = "".join(c if c.isalnum() or c in "_-" else "_" for c in name)
        p = os.path.join(dst, "%s.%s" % (safe, typ))
        with open(p, "w", encoding="utf-8", newline="\r\n") as f:
            f.write(code.replace("\r\n", "\n"))
        n = len([l for l in code.splitlines() if l.strip() and not l.startswith("Attribute VB_")])
        print("%-30s %s  %5d lignes" % (name, typ, n))
    return 0

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__); sys.exit(2)
    sys.exit(main(sys.argv[1], sys.argv[2]))
