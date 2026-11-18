/* ───────── Personnages articulés : marche, port de colis, gestes du contrôleur ───────── */
const POSE0 = { hG: 0, hD: 0, gG: 0.04, gD: 0.04, eG: 0.04, eD: 0.04, zG: 0.07, zD: -0.07, cG: -0.14, cD: -0.14, dos: 0, vrille: 0, tx: 0, ty: 0, haut: 0, roulis: 0 };
const angleCourt = (a, b) => { let d = (b - a) % TAU; if (d > PI) d -= TAU; if (d < -PI) d += TAU; return d; };

class Perso {
  constructor(sc, o) {
    const M = sc.M, g = this.racine = new T.Group(), corps = this.corps = new T.Group(); g.add(corps);
    const i = o.i || 0, peau = M.peau[(i * 3 + 1) % M.peau.length], pant = M.pantalon[i % M.pantalon.length], polo = M.polo[(i + 1) % M.polo.length];
    const mk = (geo, mat, parent, x = 0, y = 0, z = 0) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
    this.mTorse = new T.MeshStandardMaterial({ map: texTorse({ d: o.d, num: o.num, titre: o.titre, polo: "#" + polo.color.getHexString(), pantalon: "#" + pant.color.getHexString() }), roughness: 0.78 });
    this.hanche = []; this.genou = []; this.epaule = []; this.coude = [];
    for (const s of [1, -1]) {
      const h = new T.Group(); h.position.set(0.092 * s, 0.93, 0); corps.add(h); mk(G.cuisse, pant, h);
      const ge = new T.Group(); ge.position.y = -0.42; h.add(ge); mk(G.tibia, pant, ge); mk(G.pied, M.chaussure, ge);
      this.hanche.push(h); this.genou.push(ge);
    }
    mk(G.bassin, pant, corps, 0, 0.95, 0);
    const b = this.buste = new T.Group(); b.position.y = 0.99; corps.add(b);
    mk(G.torse, this.mTorse, b); mk(G.cou, peau, b, 0, 0.55, 0);
    const t = this.tete = new T.Group(); t.position.set(0, 0.672, 0.008); b.add(t);
    mk(G.tete, peau, t);
    if (o.casquette) { mk(G.casquette, M.casquette, t, 0, 0.012, 0); const v = mk(G.visiere, M.casquette, t, 0, 0.052, 0.07); v.rotation.x = 0.16; mk(G.cheveux, M.cheveux[i % M.cheveux.length], t, 0, -0.012, -0.004).scale.setScalar(0.985); }
    else mk(G.cheveux, M.cheveux[(i * 2) % M.cheveux.length], t, 0, 0.004, -0.002);
    mk(G.nez, peau, t, 0, -0.012, 0.108); for (const s of [1, -1]) mk(G.oeil, M.noir, t, 0.04 * s, 0.018, 0.098);
    for (const s of [1, -1]) {
      const e = new T.Group(); e.position.set(0.222 * s, 0.415, 0); b.add(e); mk(G.bras, polo, e);
      const c = new T.Group(); c.position.y = -0.27; e.add(c); mk(G.avbras, peau, c); mk(G.main, o.gants ? M.gant : peau, c);
      this.epaule.push(e); this.coude.push(c);
    }
    this.porte = new T.Group(); this.porte.position.set(0, 0.16, 0.38); b.add(this.porte);
    this.p = Object.assign({}, POSE0); this.c = Object.assign({}, POSE0);
    this.x = o.x || 0; this.z = o.z || 0; this.cap = o.cap || 0; this.v = 0; this.phase = (i * 1.7) % TAU; this.charge = 0; this.t = i * 0.9;
    this.ech = o.ech || 1; g.scale.setScalar(this.ech);
    sc.grPersos.add(g); this.poser(1);
  }
  pose(o, k) { Object.assign(this.c, POSE0, o); if (k) Object.assign(this.p, this.c); }
  /* avance vers un point ; renvoie true à l'arrivée */
  aller(x, z, dt, vmax = 1.6) {
    const dx = x - this.x, dz = z - this.z, d = Math.hypot(dx, dz);
    if (d < 0.035) { this.x = x; this.z = z; this.v = vers(this.v, 0, dt * 12); return true; }
    const cap = Math.atan2(dx, dz), ec = angleCourt(this.cap, cap);
    this.cap += clamp(ec, -dt * 7.5, dt * 7.5);
    const frein = Math.abs(ec) > 0.9 ? 0.15 : 1, cible = Math.min(vmax, 0.35 + d * 2.6) * frein;
    this.v = vers(this.v, cible, dt * 6);
    const pas = Math.min(d, this.v * dt); this.x += dx / d * pas; this.z += dz / d * pas;
    return false;
  }
  tourner(cap, dt) { const ec = angleCourt(this.cap, cap); this.cap += clamp(ec, -dt * 6, dt * 6); this.v = vers(this.v, 0, dt * 10); return Math.abs(ec) < 0.04; }
  /* cycle de marche piloté par la distance parcourue (pas de pied qui glisse) */
  marche(dt) {
    const c = this.c, v = this.v, k = clamp(v / 1.5, 0, 1); this.t += dt;
    this.phase += v * dt * 3.9;
    const s = Math.sin(this.phase), co = Math.cos(this.phase), A = 0.5 * k, n = this.charge;
    Object.assign(c, POSE0);
    c.hG = -A * s - 0.05 * k; c.hD = A * s - 0.05 * k;
    c.gG = 0.05 + 1.05 * k * Math.pow(Math.max(0, co), 1.4); c.gD = 0.05 + 1.05 * k * Math.pow(Math.max(0, -co), 1.4);
    c.haut = 0.024 * k * Math.cos(2 * this.phase) - 0.022 * k; c.roulis = 0.035 * k * co;
    if (n > 0) {
      const b = 0.03 * k * Math.cos(2 * this.phase);
      c.eG = c.eD = -0.34 + b; c.cG = c.cD = -1.27; c.zG = -0.1; c.zD = 0.1;
      c.dos = -0.03 - 0.022 * Math.min(n, 6); c.vrille = 0.03 * k * s; c.tx = 0.08;
    } else {
      c.eG = 0.46 * k * s + 0.03; c.eD = -0.46 * k * s + 0.03;
      c.cG = -0.2 - 0.35 * k * Math.max(0, -s); c.cD = -0.2 - 0.35 * k * Math.max(0, s);
      c.dos = 0.05 * k; c.vrille = 0.09 * k * s;
      if (k < 0.05) { c.dos = 0.012 * Math.sin(this.t * 1.3); c.ty = 0.25 * Math.sin(this.t * 0.45); c.eG = 0.03 + 0.02 * Math.sin(this.t * 1.1); }
    }
  }
  poser(dt) {
    const p = this.p, c = this.c, k = dt >= 1 ? 1 : dt * 13;
    for (const n in p) p[n] = vers(p[n], c[n], k);
    this.hanche[0].rotation.x = p.hG; this.hanche[1].rotation.x = p.hD; this.genou[0].rotation.x = p.gG; this.genou[1].rotation.x = p.gD;
    this.epaule[0].rotation.set(p.eG, 0, p.zG); this.epaule[1].rotation.set(p.eD, 0, p.zD); this.coude[0].rotation.x = p.cG; this.coude[1].rotation.x = p.cD;
    this.buste.rotation.set(p.dos, p.vrille, p.roulis * 0.6); this.tete.rotation.set(p.tx, p.ty - p.vrille * 0.7, 0);
    this.corps.position.y = p.haut; this.corps.rotation.z = -p.roulis * 0.35;
    this.racine.position.set(this.x, 0, this.z); this.racine.rotation.y = this.cap;
  }
  /* position monde du point de portage (là où repose le bas de la pile dans les bras) */
  ancre(v) { this.racine.updateMatrixWorld(true); return this.porte.getWorldPosition(v); }
  retirer(sc) { sc.grPersos.remove(this.racine); this.mTorse.map.dispose(); this.mTorse.dispose(); }
}

/* ───────── Colis : cartons kraft étiquetés, bacs jaunes à couvercle noir ───────── */
class Colis {
  constructor(sc, r, o = {}) {
    const M = sc.M, g = this.g = new T.Group(); this.sc = sc;
    const bac = this.bac = !!o.bac;
    if (bac) {
      this.w = 0.6; this.d = 0.4; this.h = 0.315;
      const c = new T.Mesh(sc.gBac, M.bac); g.add(c);
      const b = new T.Mesh(G.box, M.bac); b.scale.set(0.61, 0.035, 0.41); b.position.y = 0.262; g.add(b);
      const cv = new T.Mesh(G.box, [M.noir, M.noir, M.couvercle, M.noir, M.noir, M.noir]); cv.scale.set(0.6, 0.035, 0.4); cv.position.y = 0.2975; g.add(cv);
      const e = new T.Mesh(G.plan, M.etiq[Math.floor(r() * 4)]); e.scale.set(0.2, 0.125, 1); e.position.set(0.02, 0.15, 0.189); e.rotation.x = -0.1; g.add(e);
      for (const m of [c, b, cv]) m.castShadow = true;
    } else {
      this.w = o.w || 0.28 + r() * 0.26; this.d = o.d || 0.25 + r() * 0.2; this.h = o.h || (r() < 0.62 ? 0.13 + r() * 0.11 : 0.24 + r() * 0.16);
      const c = new T.Mesh(G.box, M.kraft[Math.floor(r() * 3)]); c.scale.set(this.w, this.h, this.d); c.position.y = this.h / 2; c.castShadow = c.receiveShadow = true; g.add(c);
      const ru = new T.Mesh(G.box, M.ruban); ru.scale.set(this.w + 0.003, 0.003, 0.05); ru.position.y = this.h + 0.0005; g.add(ru);
      for (const s of [1, -1]) { const rc = new T.Mesh(G.box, M.ruban); rc.scale.set(0.003, Math.min(0.06, this.h * 0.5), 0.05); rc.position.set(s * (this.w / 2 + 0.0008), this.h - Math.min(0.03, this.h * 0.25), 0); g.add(rc); }
      const ew = Math.min(0.17, this.w * 0.6), eh = Math.min(0.105, this.h * 0.72);
      const e = new T.Mesh(G.plan, M.etiq[Math.floor(r() * 4)]); e.scale.set(ew, eh, 1); e.position.set((r() - 0.5) * (this.w - ew) * 0.7, this.h * 0.5, this.d / 2 + 0.0015); g.add(e);
      const e2 = new T.Mesh(G.plan, M.etiq[Math.floor(r() * 4)]); e2.scale.set(ew * 0.8, eh * 0.8, 1); e2.rotation.x = -PI / 2; e2.position.set(-this.w * 0.18, this.h + 0.0025, this.d * 0.26); g.add(e2);
    }
    this.x = 0; this.z = ZM; this.y = YR; this.lacet = 0; this.rejet = false; this.pese = false; this.cercle = false; this.libere = false; this.u = 0; this.bulle = null; this.id = sc.serie++;
    this.poids = 0.6 + this.w * this.h * this.d * 190 * (0.6 + r() * 0.8);
    sc.grColis.add(g);
  }
  placer() { this.g.position.set(this.x, this.y, this.z); this.g.rotation.y = this.lacet; }
  feuillard() {
    if (this.bac || this.cercle) return; this.cercle = true;
    const M = this.sc.M, e = 0.003, l = 0.014;
    for (const [x, y, z, w, h, d] of [[0, this.h + e / 2, 0, l, e, this.d + 2 * e], [0, this.h / 2, this.d / 2 + e / 2, l, this.h, e], [0, this.h / 2, -this.d / 2 - e / 2, l, this.h, e]]) { const b = new T.Mesh(G.box, M.feuillard); b.scale.set(w, h, d); b.position.set(x, y, z); this.g.add(b); }
  }
  retirer() { if (this.bulle) { this.bulle.fin(); this.bulle = null; } if (this.g.parent) this.g.parent.remove(this.g); }
}

/* ───────── Bulles : pastilles de texte face caméra (dossard, rejet, verdict) ─────────
   Chaque texte n'est dessiné qu'une fois : sa texture est gardée et resservie (pas d'à-coup à chaque nouvelle étiquette). */
const TEX_BULLES = new Map();
class Bulle {
  constructor(sc, s, fond, encre, t = 0.3) {
    this.sc = sc; this.t = t; this.mat = new T.SpriteMaterial({ depthWrite: false, transparent: true }); this.sp = new T.Sprite(this.mat); this.sp.center.set(0.5, 0); this.sp.renderOrder = 5;
    this.vie = Infinity; this.a = 0; this.texte(s, fond, encre); sc.grBulles.add(this.sp); sc.bulles.push(this);
  }
  texte(s, fond, encre) {
    if (s === this.s && fond === this.fond) return; this.s = s; this.fond = fond;
    const cle = s + "|" + fond + "|" + encre, deja = TEX_BULLES.get(cle);
    if (deja) { this.mat.map = deja.tex; this.mat.needsUpdate = true; this.sp.scale.set(this.t * deja.W / deja.H, this.t, 1); return; }
    const H = 96, f = `900 62px ${F_D}`, m = toile(8, 8, () => {}).getContext("2d"); m.font = f;
    const W = Math.ceil(m.measureText(s).width) + 56;
    const c = toile(W, H, x => { rrect(x, 3, 3, W - 6, H - 6, 26); x.fillStyle = fond; x.fill(); x.lineWidth = 5; x.strokeStyle = "rgba(8,12,22,.75)"; x.stroke(); ecrire(x, s, W / 2, H / 2 + 4, 62, { g: 900, f: F_D, c: encre, al: "center", base: "middle" }); });
    this.mat.map = texture(c); this.mat.needsUpdate = true; this.sp.scale.set(this.t * W / H, this.t, 1);
    TEX_BULLES.set(cle, { tex: this.mat.map, W, H });
  }
  en(x, y, z) { this.sp.position.set(x, y, z); }
  maj(dt) { this.vie -= dt; this.a = vers(this.a, this.vie > 0 ? 1 : 0, dt * 9); this.mat.opacity = this.a; return this.vie > 0 || this.a > 0.02; }
  fin(delai = 0) { this.vie = Math.min(this.vie, delai); }
  detruire() { this.sc.grBulles.remove(this.sp); this.mat.dispose(); }
}
