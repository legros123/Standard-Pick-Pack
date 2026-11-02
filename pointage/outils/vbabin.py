"""Remplace le source d'un module VBA dans un vbaProject.bin (MS-OVBA / MS-CFB).

- le module cible recoit le nouveau source compresse a l'offset 0 (pas de p-code)
- _VBA_PROJECT reecrit (version 0xFFFF) : Office recompile tout depuis le source
- caches __SRP_* supprimes
- fichier composite (CFB v3) reecrit entierement
"""
import struct, math, sys
import olefile
from oletools.olevba import decompress_stream


# ---------------------------------------------------------------- compression
def _bitcount(diff):
    if diff <= 1:
        return 4
    return max(math.ceil(math.log2(diff)), 4)


def compress(data: bytes) -> bytes:
    out = bytearray(b"\x01")
    pos = 0
    n = len(data)
    while pos < n:
        start = pos
        end = min(pos + 4096, n)
        chunk = bytearray()
        table = {}
        cur = start
        while cur < end:
            flag_idx = len(chunk)
            chunk.append(0)
            flag = 0
            for bit in range(8):
                if cur >= end:
                    break
                diff = cur - start
                best_len = 0
                best_off = 0
                if diff > 0 and cur + 3 <= end:
                    bc = _bitcount(diff)
                    maxlen = (0xFFFF >> bc) + 3
                    key = bytes(data[cur:cur + 3])
                    for cand in reversed(table.get(key, ())):
                        off = cur - cand
                        if off > (1 << bc):
                            break
                        l = 0
                        lim = min(maxlen, end - cur)
                        while l < lim and data[cand + l] == data[cur + l]:
                            l += 1
                        if l > best_len:
                            best_len, best_off = l, off
                            if l == lim:
                                break
                if best_len >= 3:
                    bc = _bitcount(diff)
                    tok = ((best_off - 1) << (16 - bc)) | (best_len - 3)
                    chunk += struct.pack("<H", tok)
                    flag |= 1 << bit
                    for k in range(cur, cur + best_len):
                        if k + 3 <= end:
                            table.setdefault(bytes(data[k:k + 3]), []).append(k)
                    cur += best_len
                else:
                    chunk.append(data[cur])
                    if cur + 3 <= end:
                        table.setdefault(bytes(data[cur:cur + 3]), []).append(cur)
                    cur += 1
            chunk[flag_idx] = flag
        if len(chunk) + 2 > 4098:
            assert end - start == 4096, "bloc non compressible"
            out += struct.pack("<H", 0x3FFF & 0x0FFF | 0x3000)  # raw chunk, flag 0
            out += data[start:end]
        else:
            hdr = (len(chunk) + 2 - 3) | 0x3000 | 0x8000
            out += struct.pack("<H", hdr) + chunk
        pos = end
    return bytes(out)


# ---------------------------------------------------------------- dir stream
def patch_dir(dir_raw: bytes, module: str) -> bytes:
    d = bytearray(decompress_stream(bytearray(dir_raw)))
    i = 0
    cur = None
    done = False
    while i < len(d):
        rid, sz = struct.unpack_from("<HI", d, i)
        ln = 6 if rid == 0x0009 else sz
        data = d[i + 6:i + 6 + ln]
        if rid == 0x0019:
            cur = bytes(data).decode("cp1252")
        if rid == 0x0031 and cur == module:
            struct.pack_into("<I", d, i + 6, 0)
            done = True
        i += 6 + ln
    assert done, "module introuvable dans dir"
    return compress(bytes(d))


# ---------------------------------------------------------------- CFB writer
FREE, END, FATSECT = 0xFFFFFFFF, 0xFFFFFFFE, 0xFFFFFFFD
NOSTREAM = 0xFFFFFFFF


class Node:
    def __init__(self, name, kind, data=b""):
        self.name, self.kind, self.data = name, kind, data  # kind: 1 storage, 2 stream, 5 root
        self.children = []
        self.left = self.right = self.child = NOSTREAM
        self.color = 1
        self.start = END
        self.size = 0
        self.sid = None


def _key(n):
    return (len(n.name), n.name.upper())


def _build_tree(children):
    """BST equilibre + couleurs rouge/noir valides ; renvoie l'id de la racine."""
    items = sorted(children, key=_key)
    depth = {}

    def rec(lo, hi, dep):
        if lo > hi:
            return None
        mid = (lo + hi) // 2
        node = items[mid]
        depth[id(node)] = dep
        l = rec(lo, mid - 1, dep + 1)
        r = rec(mid + 1, hi, dep + 1)
        node.left = l.sid if l else NOSTREAM
        node.right = r.sid if r else NOSTREAM
        return node

    root = rec(0, len(items) - 1, 0)
    if items:
        maxd = max(depth.values())
        full = (len(items) == 2 ** (maxd + 1) - 1)
        for it in items:
            it.color = 0 if (not full and depth[id(it)] == maxd) else 1
    return root.sid if root else NOSTREAM


def write_cfb(root: Node) -> bytes:
    # numerotation des entrees
    order = []

    def walk(n):
        n.sid = len(order)
        order.append(n)
        for c in n.children:
            walk(c)

    walk(root)
    for n in order:
        if n.kind in (1, 5):
            n.child = _build_tree(n.children)
    root.color = 1

    # mini stream
    mini = bytearray()
    minifat = []
    big = []
    for n in order:
        if n.kind != 2:
            continue
        n.size = len(n.data)
        if n.size == 0:
            n.start = END
        elif n.size < 4096:
            nsec = (n.size + 63) // 64
            n.start = len(mini) // 64
            for k in range(nsec):
                minifat.append(n.start + k + 1 if k < nsec - 1 else END)
            mini += n.data + b"\0" * (nsec * 64 - n.size)
        else:
            big.append(n)

    def nsect(nbytes):
        return (nbytes + 511) // 512

    dir_bytes = len(order) * 128
    n_dir = nsect(dir_bytes)
    n_minifat = nsect(len(minifat) * 4)
    n_mini = nsect(len(mini))
    n_big = sum(nsect(len(b.data)) for b in big)
    n_data = n_dir + n_minifat + n_mini + n_big
    n_fat = 1
    while n_fat * 128 < n_data + n_fat:
        n_fat += 1
    assert n_fat <= 109

    fat = []
    sec = 0

    def alloc(count):
        nonlocal sec
        first = sec
        for k in range(count):
            fat.append(sec + 1 if k < count - 1 else END)
            sec += 1
        return first if count else END

    for _ in range(n_fat):
        fat.append(FATSECT)
        sec += 1
    first_dir = alloc(n_dir)
    first_minifat = alloc(n_minifat) if n_minifat else END
    root.start = alloc(n_mini) if n_mini else END
    root.size = len(mini)
    for b in big:
        b.start = alloc(nsect(len(b.data)))
    fat += [FREE] * (n_fat * 128 - len(fat))

    # header
    hdr = bytearray(512)
    hdr[0:8] = bytes.fromhex("D0CF11E0A1B11AE1")
    struct.pack_into("<HHHHH", hdr, 24, 0x003E, 0x0003, 0xFFFE, 9, 6)
    struct.pack_into("<I", hdr, 40, 0)
    struct.pack_into("<I", hdr, 44, n_fat)
    struct.pack_into("<I", hdr, 48, first_dir)
    struct.pack_into("<I", hdr, 52, 0)
    struct.pack_into("<I", hdr, 56, 4096)
    struct.pack_into("<I", hdr, 60, first_minifat)
    struct.pack_into("<I", hdr, 64, n_minifat)
    struct.pack_into("<I", hdr, 68, END)
    struct.pack_into("<I", hdr, 72, 0)
    difat = list(range(n_fat)) + [FREE] * (109 - n_fat)
    struct.pack_into("<109I", hdr, 76, *difat)

    # directory
    dirb = bytearray()
    for n in order:
        e = bytearray(128)
        nm = n.name.encode("utf-16-le") + b"\0\0"
        e[0:len(nm)] = nm
        struct.pack_into("<HBB", e, 64, len(nm), n.kind, n.color)
        struct.pack_into("<III", e, 68, n.left, n.right, n.child)
        start = n.start if n.kind in (2, 5) else 0
        size = n.size if n.kind in (2, 5) else 0
        struct.pack_into("<II", e, 116, start, size)
        struct.pack_into("<I", e, 124, 0)
        dirb += e
    while len(dirb) % 512:
        e = bytearray(128)
        struct.pack_into("<III", e, 68, NOSTREAM, NOSTREAM, NOSTREAM)
        dirb += e

    def pad(b):
        return bytes(b) + b"\0" * ((-len(b)) % 512)

    out = bytearray(hdr)
    out += struct.pack("<%dI" % len(fat), *fat)
    out += dirb
    mf = minifat + [FREE] * (n_minifat * 128 - len(minifat))
    if n_minifat:
        out += struct.pack("<%dI" % len(mf), *mf)
    out += pad(mini)
    for b in big:
        out += pad(b.data)
    return bytes(out)


# ---------------------------------------------------------------- main patch
def patch(bin_in: str, bin_out: str, module: str, source_text: str):
    o = olefile.OleFileIO(bin_in)
    root = Node("Root Entry", 5)
    storages = {(): root}
    for path in sorted(o.listdir(streams=True, storages=True), key=len):
        parent = storages[tuple(path[:-1])]
        name = path[-1]
        if o.get_type("/".join(path)) == olefile.STGTY_STORAGE:
            node = Node(name, 1)
            storages[tuple(path)] = node
        else:
            if name.startswith("__SRP_"):
                continue
            node = Node(name, 2, o.openstream("/".join(path)).read())
        parent.children.append(node)
    vba = storages[("VBA",)]
    by = {c.name: c for c in vba.children}
    src = source_text.replace("\r\n", "\n").replace("\n", "\r\n").encode("cp1252")
    by[module].data = compress(src)
    by["dir"].data = patch_dir(by["dir"].data, module)
    by["_VBA_PROJECT"].data = bytes.fromhex("CC61FFFF000000")
    o.close()
    open(bin_out, "wb").write(write_cfb(root))


if __name__ == "__main__":
    patch(sys.argv[1], sys.argv[2], sys.argv[3], open(sys.argv[4], encoding="utf-8").read())
