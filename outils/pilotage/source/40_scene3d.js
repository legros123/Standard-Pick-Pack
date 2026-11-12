
/* ════════════════════════════════════════════════════════════════════════════
   Mini-moteur 3D : boîtes en perspective sur un canvas 2D (algorithme du peintre).
   Aucune bibliothèque, aucun WebGL : fonctionne sur n'importe quel poste.
   ════════════════════════════════════════════════════════════════════════════ */
const ENCRE = "243,246,251", ENCRE2 = "188,200,221";
const C_FAIT = [57, 135, 229], C_RESTE = [96, 116, 152], C_ACIER = [44, 60, 92], C_COLIS = [172, 187, 212], C_ALERTE = [250, 178, 25], C_BON = [40, 190, 60];

class Scene3D {
  constructor(cv) {
    this.cv = cv; this.ctx = cv.getContext("2d");
    this.cam = { yaw: -0.5, pitch: 0.5, dist: 30, cible: [0, 0, 0], focale: 1.9 };
    this.yaw0 = -0.5; this.balancement = 0.12;
    this.ox = 0; this.oy = 0; this.cadre = null;
    this.marges = [0.05, 0.08, 0.05, 0.16];            // gauche, haut, droite, bas (fractions du canvas)
    this.w = 0; this.h = 0; this.dpr = 1;
    this.actif = false; this.fige = mouvementReduit(); this._raf = 0; this._der = 0; this.t = 0;
    this.L = (() => { const a = [-0.5, 0.78, 0.45], l = Math.hypot(a[0], a[1], a[2]); return a.map(v => v / l); })();
    this._boucle = this._boucle.bind(this);
  }
  taille() {
    const w = this.cv.clientWidth, h = this.cv.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (w !== this.w || h !== this.h || dpr !== this.dpr) {
      this.w = w; this.h = h; this.dpr = dpr;
      this.cv.width = Math.max(1, Math.round(w * dpr)); this.cv.height = Math.max(1, Math.round(h * dpr));
      this.cadre = null;
    }
    return w > 4 && h > 4;
  }
  camera() {
    const c = this.cam, cy = Math.cos(c.yaw), sy = Math.sin(c.yaw), cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
    this.C = [c.cible[0] + c.dist * cp * sy, c.cible[1] + c.dist * sp, c.cible[2] + c.dist * cp * cy];
    this.R = [cy, 0, -sy]; this.U = [-sy * sp, cp, -cy * sp]; this.F = [-cp * sy, -sp, -cp * cy];
    this.foc = c.focale * this.h;
  }
  /* point du monde -> [x écran, y écran, profondeur] */
  p(x, y, z) {
    const C = this.C, vx = x - C[0], vy = y - C[1], vz = z - C[2];
    const zc = vx * this.F[0] + vy * this.F[1] + vz * this.F[2], k = this.foc / Math.max(zc, 0.05);
    return [this.w / 2 + this.ox + (vx * this.R[0] + vy * this.R[1] + vz * this.R[2]) * k,
            this.h / 2 + this.oy - (vx * this.U[0] + vy * this.U[1] + vz * this.U[2]) * k, zc];
  }
  /* règle distance et décalage pour que la boîte englobante b tienne dans le canvas, balancement compris */
  cadrer(b) {
    if (!this.taille()) return;
    const [mg, mh, md, mb] = this.marges, aw = this.w * (1 - mg - md), ah = this.h * (1 - mh - mb);
    const coins = [];
    for (const x of [b[0], b[3]]) for (const y of [b[1], b[4]]) for (const z of [b[2], b[5]]) coins.push([x, y, z]);
    const yawAvant = this.cam.yaw, distAvant = this.cam.dist, oxA = this.ox, oyA = this.oy;
    this.ox = 0; this.oy = 0;
    const etendue = (yaw, dist) => {
      this.cam.yaw = yaw; this.cam.dist = dist; this.camera();
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (const c of coins) { const q = this.p(c[0], c[1], c[2]); x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
      return [x0, x1, y0, y1];
    };
    const amp = this.fige ? 0 : this.balancement;
    let lo = 3, hi = 600;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      let ok = true;
      for (const y of [this.yaw0 - amp, this.yaw0, this.yaw0 + amp]) { const e = etendue(y, mid); if (e[1] - e[0] > aw || e[3] - e[2] > ah) { ok = false; break; } }
      if (ok) hi = mid; else lo = mid;
    }
    const e = etendue(this.yaw0, hi);
    const cible = { dist: hi, ox: this.w * mg + aw / 2 - (e[0] + e[1]) / 2, oy: this.h * mh + ah / 2 - (e[2] + e[3]) / 2 };
    this.cam.yaw = yawAvant;
    if (this.cadre) { this.cam.dist = distAvant; this.ox = oxA; this.oy = oyA; }      // transition douce vers le nouveau cadrage
    else { this.cam.dist = cible.dist; this.ox = cible.ox; this.oy = cible.oy; }
    this.cadre = cible;
    this.camera();
  }
  suivreCadre() {
    const c = this.cadre; if (!c) return;
    const k = this.fige ? 1 : 0.07;
    this.cam.dist = lerp(this.cam.dist, c.dist, k); this.ox = lerp(this.ox, c.ox, k); this.oy = lerp(this.oy, c.oy, k);
  }
  poly(pts, remplir, trait, ep) {
    const x = this.ctx;
    x.beginPath(); x.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
    x.closePath();
    if (remplir) { x.fillStyle = remplir; x.fill(); }
    if (trait) { x.strokeStyle = trait; x.lineWidth = ep || 1; x.stroke(); }
  }
  /* boîte alignée sur les axes : {x,y,z,w,h,d,c:[r,v,b],a,e,fil} — seules les faces visibles sont tracées */
  boite(b) {
    const C = this.C, L = this.L, x0 = b.x, y0 = b.y, z0 = b.z, x1 = b.x + b.w, y1 = b.y + b.h, z1 = b.z + b.d;
    const F = [];
    if (C[0] > x1) F.push([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], L[0]]);
    else if (C[0] < x0) F.push([[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1], -L[0]]);
    if (C[2] > z1) F.push([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], L[2]]);
    else if (C[2] < z0) F.push([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], -L[2]]);
    if (C[1] > y1) F.push([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], L[1]]);
    const a = b.a == null ? 1 : b.a, c = b.c;
    for (const f of F) {
      const pts = [this.p(f[0][0], f[0][1], f[0][2]), this.p(f[1][0], f[1][1], f[1][2]), this.p(f[2][0], f[2][1], f[2][2]), this.p(f[3][0], f[3][1], f[3][2])];
      if (b.fil) { this.poly(pts, `rgba(${ENCRE2},${0.05 * a})`, `rgba(${ENCRE2},${0.5 * a})`, 1); continue; }
      const k = 0.44 + 0.62 * Math.max(0, f[4]) + (b.e || 0);
      this.poly(pts, `rgba(${Math.min(255, c[0] * k) | 0},${Math.min(255, c[1] * k) | 0},${Math.min(255, c[2] * k) | 0},${a})`, b.sansTrait ? null : `rgba(255,255,255,${0.13 * a})`, 1);
    }
  }
  profondeur(b) { return this.p(b.x + b.w / 2, b.y + b.h / 2, b.z + b.d / 2)[2]; }
  peindre(liste) {
    for (const b of liste) b._z = this.profondeur(b);
    liste.sort((p, q) => q._z - p._z);
    for (const b of liste) this.boite(b);
  }
  /* quadrillage du sol, estompé vers les bords */
  sol(nx, nz, pas) {
    const x = this.ctx;
    x.lineWidth = 1;
    for (let i = -nx; i <= nx; i++) {
      const a = this.p(i * pas, 0, -nz * pas), b = this.p(i * pas, 0, nz * pas);
      x.strokeStyle = `rgba(150,180,240,${0.13 * (1 - Math.abs(i) / (nx + 1))})`;
      x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
    }
    for (let j = -nz; j <= nz; j++) {
      const a = this.p(-nx * pas, 0, j * pas), b = this.p(nx * pas, 0, j * pas);
      x.strokeStyle = `rgba(150,180,240,${0.13 * (1 - Math.abs(j) / (nz + 1))})`;
      x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
    }
  }
  texte(s, px, py, o) {
    const x = this.ctx;
    x.font = `${o.gras || 500} ${o.t}px ${o.f || "'Lexend','Segoe UI',sans-serif"}`;
    x.textAlign = o.al || "center"; x.textBaseline = o.base || "alphabetic";
    if ("letterSpacing" in x) x.letterSpacing = o.esp || "0px";
    x.fillStyle = o.c || `rgb(${ENCRE})`;
    x.fillText(s, px, py);
    if ("letterSpacing" in x) x.letterSpacing = "0px";
  }
  demarrer() {
    if (this.actif) return;
    this.fige = mouvementReduit();
    this.actif = true; this._der = 0;
    if (this.entree) this.entree();
    if (this.fige) { this.image(0); return; }
    this._raf = requestAnimationFrame(this._boucle);
  }
  arreter() { this.actif = false; cancelAnimationFrame(this._raf); }
  _boucle(ts) {
    if (!this.actif) return;
    this._raf = requestAnimationFrame(this._boucle);
    if (this._der && ts - this._der < 30) return;
    const dt = this._der ? Math.min(0.1, (ts - this._der) / 1000) : 0.016;
    this._der = ts; this.t += dt;
    this.image(dt);
  }
  image(dt) {
    if (!this.taille()) return;
    const x = this.ctx;
    x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    x.clearRect(0, 0, this.w, this.h);
    x.lineJoin = "round";
    if (!this.cadre && this.bornes) this.cadrer(this.bornes());
    if (!this.fige) this.cam.yaw = this.yaw0 + Math.sin(this.t * 0.24) * this.balancement;
    this.suivreCadre(); this.camera();
    this.dessiner(dt || 0);
  }
  rafraichir() { if (this.fige || !this.actif) this.image(0); }
}

/* ───────── Scène 1 : les piles de la journée (à venir -> reste à faire -> fait) ───────── */
class ScenePile extends Scene3D {
  constructor(cv) {
    super(cv);
    this.yaw0 = this.cam.yaw = -0.4; this.cam.pitch = 0.5; this.balancement = 0.1;
    this.marges = [0.03, 0.05, 0.03, 0.25];
    this.piles = { venir: [], reste: [], fait: [] };
    this.unite = 50; this.aVenir = false; this.pret = false; this.vals = { fait: 0, reste: 0, venir: 0 };
    this.cx = { venir: -7.7, reste: 0, fait: 7.7 };
  }
  static unitePour(charge) { for (const u of [10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000]) if (charge / u <= 168) return u; return 10000; }
  slot(pile, i) {
    const P = 1.14, c = Math.floor(i / 30), r = i % 30, col = r % 5, rang = Math.floor(r / 5);
    return [this.cx[pile] + (col - 2) * P - 0.5, c * P, (rang - 2.5) * P - 0.5];
  }
  bornes() {
    const plus = Math.max(this.piles.venir.length, this.piles.reste.length, this.piles.fait.length, 30);
    const haut = Math.ceil(plus / 30) * 1.14 + 0.6, g = this.aVenir ? 11 : 7.4;
    return [-g, 0, -3.9, g, haut, 3.9];
  }
  donnees(fait, reste, venir) {
    const charge = fait + reste + (venir || 0), u = ScenePile.unitePour(charge);
    const N = Math.max(1, Math.round(charge / u));
    const nF = clamp(Math.round(fait / u), 0, N), nV = venir ? clamp(Math.round(venir / u), 0, N - nF) : 0, nR = N - nF - nV;
    const refaire = !this.pret || u !== this.unite || (venir != null) !== this.aVenir;
    this.unite = u; this.aVenir = venir != null; this.vals = { fait, reste, venir };
    this.cx = this.aVenir ? { venir: -7.7, reste: 0, fait: 7.7 } : { venir: 0, reste: -4.1, fait: 4.1 };
    const P = this.piles;
    if (refaire) {
      this.piles = { venir: [], reste: [], fait: [] };
      for (const [k, n] of [["venir", nV], ["reste", nR], ["fait", nF]]) for (let i = 0; i < n; i++) { const s = this.slot(k, i); this.piles[k].push({ x: s[0], y: s[1], z: s[2], a: null }); }
      this.pret = true; this.cadre = null;
      if (this.actif) this.entree();
      this.rafraichir();
      return;
    }
    const deplacer = (de, vers, delai) => { const c = P[de].pop(), s = this.slot(vers, P[vers].length); c.a = { x0: c.x, y0: c.y, z0: c.z, x1: s[0], y1: s[1], z1: s[2], t: -delai, d: 1.2, arc: 3.4 }; P[vers].push(c); };
    const creer = vers => { const s = this.slot(vers, P[vers].length); P[vers].push({ x: s[0], y: s[1] + 8, z: s[2], a: { x0: s[0], y0: s[1] + 8, z0: s[2], x1: s[0], y1: s[1], z1: s[2], t: 0, d: 0.7, arc: 0, masque: true } }); };
    let k = 0;
    while (P.fait.length < nF) { if (P.reste.length) deplacer("reste", "fait", k * 0.16); else if (P.venir.length) deplacer("venir", "fait", k * 0.16); else creer("fait"); k++; }
    while (P.fait.length > nF) P.fait.pop();
    k = 0;
    while (P.reste.length < nR) { if (P.venir.length) deplacer("venir", "reste", k * 0.05); else creer("reste"); k++; }
    while (P.reste.length > nR) { const c = P.reste.pop(); if (P.venir.length < nV) { const s = this.slot("venir", P.venir.length); c.a = { x0: c.x, y0: c.y, z0: c.z, x1: s[0], y1: s[1], z1: s[2], t: 0, d: 0.9, arc: 2 }; P.venir.push(c); } }
    while (P.venir.length < nV) creer("venir");
    while (P.venir.length > nV) P.venir.pop();
    if (this.fige) for (const q of ["venir", "reste", "fait"]) for (const c of P[q]) if (c.a) { c.x = c.a.x1; c.y = c.a.y1; c.z = c.a.z1; c.a = null; }
    if (this.taille()) this.cadrer(this.bornes());
    this.rafraichir();
  }
  entree() {
    if (this.fige) return;
    for (const q of ["venir", "reste", "fait"]) this.piles[q].forEach((c, i) => {
      const s = this.slot(q, i);
      c.x = s[0]; c.z = s[2]; c.y = s[1] + 9;
      c.a = { x0: s[0], y0: s[1] + 9, z0: s[2], x1: s[0], y1: s[1], z1: s[2], t: -(0.15 + i * 0.007 + (q === "fait" ? 0.25 : q === "reste" ? 0.1 : 0)), d: 0.55, arc: 0, masque: true };
    });
  }
  dessiner(dt) {
    const x = this.ctx, H = this.h, zones = this.aVenir ? ["venir", "reste", "fait"] : ["reste", "fait"];
    this.sol(this.aVenir ? 14 : 10, 7, 1.14);
    /* zones marquées au sol, comme dans l'entrepôt */
    for (const q of zones) {
      const cx = this.cx[q], pts = [this.p(cx - 3.2, 0, -3.8), this.p(cx + 3.2, 0, -3.8), this.p(cx + 3.2, 0, 3.8), this.p(cx - 3.2, 0, 3.8)];
      this.poly(pts, q === "fait" ? "rgba(57,135,229,.10)" : "rgba(255,255,255,.035)", q === "fait" ? "rgba(125,184,255,.75)" : `rgba(${ENCRE2},.4)`, 1.5);
    }
    /* chevrons de flux entre les zones */
    for (let i = 0; i < zones.length - 1; i++) {
      const xm = (this.cx[zones[i]] + this.cx[zones[i + 1]]) / 2;
      for (let j = 0; j < 3; j++) {
        const ph = ((this.t * 0.9 + j / 3) % 1 + 1) % 1, xx = xm - 0.55 + ph * 1.1, al = Math.sin(ph * Math.PI) * 0.75;
        const a = this.p(xx - 0.22, 0, -0.5), b = this.p(xx + 0.22, 0, 0), c = this.p(xx - 0.22, 0, 0.5);
        x.strokeStyle = `rgba(125,184,255,${this.fige ? 0.5 : al})`; x.lineWidth = 2.2;
        x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.lineTo(c[0], c[1]); x.stroke();
      }
    }
    const L = [];
    for (const q of ["venir", "reste", "fait"]) for (const c of this.piles[q]) {
      let vol = 0;
      if (c.a) {
        c.a.t += dt;
        if (c.a.t >= 0) { const u = clamp(c.a.t / c.a.d, 0, 1), e = adoucir(u); c.x = lerp(c.a.x0, c.a.x1, e); c.z = lerp(c.a.z0, c.a.z1, e); c.y = lerp(c.a.y0, c.a.y1, e) + Math.sin(Math.PI * u) * c.a.arc; vol = c.a.arc ? Math.sin(Math.PI * u) : 0; }
        else if (c.a.masque) continue;
        if (c.a.t >= c.a.d) { c.x = c.a.x1; c.y = c.a.y1; c.z = c.a.z1; c.a = null; }
      }
      if (q === "venir") L.push({ x: c.x + 0.04, y: c.y, z: c.z + 0.04, w: 0.92, h: 0.92, d: 0.92, fil: true });
      else L.push({ x: c.x, y: c.y, z: c.z, w: 1, h: 1, d: 1, c: q === "fait" ? C_FAIT : C_RESTE, e: vol * 0.35 });
    }
    this.peindre(L);
    /* étiquettes des zones */
    const noms = { venir: "À VENIR", reste: this.aVenir ? "À PRÉPARER" : "RESTE À FAIRE", fait: "FAIT" }, v = this.vals;
    const tN = clamp(H * 0.036, 11, 34), tV = clamp(H * 0.1, 26, 120);
    for (const q of zones) {
      const a = this.p(this.cx[q], 0, 3.8), bas = Math.max(this.p(this.cx[q] - 3.2, 0, 3.8)[1], this.p(this.cx[q] + 3.2, 0, 3.8)[1]), y = Math.min(bas + tN * 1.55, H - tV * 1.02 - 4);
      this.texte(noms[q], a[0], y, { t: tN, gras: 500, esp: "0.14em", c: q === "fait" ? "rgb(125,184,255)" : `rgb(${ENCRE2})` });
      this.texte(n0(v[q] || 0), a[0], y + tV * 0.92, { t: tV, gras: 900, f: "'Big Shoulders Display','Arial Narrow',sans-serif" });
    }
  }
}

/* ───────── Scène 2 : le convoyeur, la balance et la voie de contrôle ───────── */
class SceneConvoyeur extends Scene3D {
  constructor(cv) {
    super(cv);
    this.yaw0 = this.cam.yaw = -0.92; this.cam.pitch = 0.58; this.balancement = 0.06;
    this.marges = [0.02, 0.2, 0.02, 0.15];
    this.colis = []; this.taux = 0.02; this.prochain = 0; this.serie = 0; this.eclat = null;
  }
  bornes() { return [-6.2, 0, -1.4, 6.6, 4.4, 8.9]; }      /* le tapis déborde du cadre : les colis arrivent et repartent hors champ */
  donnees(taux) { this.taux = fini(taux) ? clamp(taux, 0.003, 0.4) : 0.02; this.rafraichir(); }
  nouveau(x, rejet) {
    const s = this.serie++, a = n => { const v = Math.sin(s * 12.9898 + n * 78.233) * 43758.5453; return v - Math.floor(v); };
    return { x, z: 0, w: 1.05 + a(1) * 0.5, h: 0.65 + a(2) * 0.6, d: 0.95 + a(3) * 0.45, rejet, sortie: false, pese: x > -2 };
  }
  entree() {
    this.colis = []; this.serie = 0; this.prochain = 0.2; this.eclat = null; this.depuis = 0;
    for (let x = -12.6; x < 13; x += 2.65) this.colis.push(this.nouveau(x, false));
    if (this.fige) { const c = this.nouveau(2.2, true); c.sortie = true; c.z = 3.4; c.pese = true; this.colis.push(c); }
  }
  dessiner(dt) {
    const x = this.ctx, H = this.h;
    this.sol(14, 10, 1.3);
    /* animation des colis */
    if (!this.fige) {
      this.prochain -= dt;
      if (this.prochain <= 0) { this.prochain = 0.86; this.depuis++; this.colis.push(this.nouveau(-14.6, this.depuis === 2 || Math.random() < this.taux)); }
      for (const c of this.colis) {
        if (c.sortie) c.z += 2.5 * dt;
        else {
          c.x += 3.1 * dt;
          if (!c.pese && c.x >= -2) { c.pese = true; this.eclat = { rejet: c.rejet, t: 0.55 }; }
          if (c.rejet && c.x >= 2.2) { c.sortie = true; c.x = 2.2; }
        }
      }
      this.colis = this.colis.filter(c => c.x < 14.5 && c.z < 7.2);
      if (this.eclat && (this.eclat.t -= dt) <= 0) this.eclat = null;
    }
    /* structure fixe : pieds, tapis principal, voie de contrôle, table */
    const fixe = [];
    for (const px of [-12.9, -8.6, -4.3, 0, 4.3, 8.6, 12.9]) fixe.push({ x: px, y: 0, z: -0.75, w: 0.3, h: 0.78, d: 1.5, c: [30, 42, 66] });
    for (const pz of [2.6, 5.4]) fixe.push({ x: 1.45, y: 0, z: pz, w: 1.5, h: 0.78, d: 0.3, c: [30, 42, 66] });
    this.peindre(fixe);
    this.boite({ x: -15, y: 0.78, z: -0.98, w: 30, h: 0.24, d: 1.96, c: C_ACIER });
    this.boite({ x: 1.3, y: 0.78, z: 0.98, w: 1.8, h: 0.24, d: 6.4, c: [70, 62, 40] });
    /* rouleaux qui défilent */
    x.lineWidth = 1;
    const dec = this.fige ? 0 : (this.t * 3.1) % 1.1;
    for (let rx = -15 + dec; rx < 15; rx += 1.1) { const a = this.p(rx, 1.02, -0.98), b = this.p(rx, 1.02, 0.98); x.strokeStyle = "rgba(255,255,255,.10)"; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); }
    const dz = this.fige ? 0 : (this.t * 2.5) % 1.1;
    for (let rz = 0.98 + dz; rz < 7.38; rz += 1.1) { const a = this.p(1.3, 1.02, rz), b = this.p(3.1, 1.02, rz); x.strokeStyle = "rgba(250,178,25,.22)"; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); }
    this.boite({ x: 0.5, y: 0, z: 7.4, w: 3.4, h: 1.02, d: 1.7, c: [58, 72, 102] });
    /* plateau de pesée */
    this.boite({ x: -2.75, y: 1.02, z: -0.98, w: 1.5, h: 0.05, d: 1.96, c: C_FAIT, a: 0.75, sansTrait: true });
    /* portique + colis, triés ensemble par profondeur */
    const coul = this.eclat ? (this.eclat.rejet ? C_ALERTE : C_BON) : [70, 86, 118];
    const L = [
      { x: -2.16, y: 0, z: -1.5, w: 0.32, h: 3.5, d: 0.32, c: [52, 68, 100] },
      { x: -2.16, y: 0, z: 1.18, w: 0.32, h: 3.5, d: 0.32, c: [52, 68, 100] },
      { x: -2.16, y: 3.5, z: -1.5, w: 0.32, h: 0.32, d: 3, c: [52, 68, 100] },
      { x: -2.26, y: 2.78, z: -0.5, w: 0.5, h: 0.62, d: 1, c: coul, e: this.eclat ? 0.35 : 0 }
    ];
    for (const c of this.colis) {
      const alerte = c.rejet && c.pese;
      L.push({ x: c.x - c.w / 2, y: 1.02, z: c.z - c.d / 2, w: c.w, h: c.h, d: c.d, c: alerte ? C_ALERTE : C_COLIS, e: alerte ? 0.08 : 0 });
    }
    this.peindre(L);
    /* halo de la balance */
    if (this.eclat) {
      const q = this.p(-2, 3.1, 0), r = H * 0.16, g = x.createRadialGradient(q[0], q[1], 0, q[0], q[1], r), c = this.eclat.rejet ? "250,178,25" : "40,190,60";
      g.addColorStop(0, `rgba(${c},${0.5 * this.eclat.t / 0.55})`); g.addColorStop(1, `rgba(${c},0)`);
      x.fillStyle = g; x.fillRect(q[0] - r, q[1] - r, r * 2, r * 2);
    }
    /* repères */
    const t = clamp(H * 0.034, 11, 30);
    const a = this.p(-2, 4.25, 0); this.texte("BALANCE", a[0], a[1], { t, esp: "0.14em", c: `rgb(${ENCRE2})` });
    const b = this.p(8.4, 0.9, 0); this.texte("VERS L'EXPÉDITION", this.w - t * 0.9, Math.max(b[1] + t * 2.2, this.h * 0.2 + t), { t, esp: "0.14em", c: `rgb(${ENCRE2})`, al: "right" });
    const c = this.p(2.2, 0, 9.6); this.texte("POSTE DE CONTRÔLE", c[0], Math.min(c[1] + t * 0.4, H - 6), { t, esp: "0.14em", c: "rgb(250,178,25)" });
  }
}

/* ───────── Scène 3 : le plan des allées, hauteur = erreurs décelées ───────── */
class SceneAllees extends Scene3D {
  constructor(cv) {
    super(cv);
    this.yaw0 = this.cam.yaw = -0.72; this.cam.pitch = 0.5; this.balancement = 0.1;
    this.marges = [0.04, 0.13, 0.04, 0.15];
    this.vals = new Array(14).fill(0); this.cibles = this.vals.map(() => 0.45); this.haut = this.cibles.slice(); this.max = 1; this.tete = [];
  }
  bornes() { return [-12.4, 0, -4.6, 12.4, 5.4, 6]; }
  donnees(allees) {
    const a = allees || {};
    this.vals = Array.from({ length: 14 }, (_, i) => +a[String(i + 1).padStart(2, "0")] || +a[String(i + 1)] || 0);
    this.max = Math.max(1, ...this.vals);
    this.cibles = this.vals.map(v => 0.45 + 4.3 * v / this.max);
    this.tete = this.vals.map((v, i) => [v, i]).filter(x => x[0] > 0).sort((p, q) => q[0] - p[0]).slice(0, 3).map(x => x[1]);
    if (this.fige) this.haut = this.cibles.slice();
    this.rafraichir();
  }
  entree() { if (!this.fige) this.haut = this.cibles.map(() => 0.3); }
  dessiner(dt) {
    const x = this.ctx, H = this.h, pas = 1.72, L = [];
    this.sol(14, 6, 1.2);
    for (let i = 0; i < 14; i++) {
      this.haut[i] = this.fige ? this.cibles[i] : lerp(this.haut[i], this.cibles[i], 0.07 + i * 0.004);
      const k = this.vals[i] / this.max;
      L.push({ x: (i - 6.5) * pas - 0.52, y: 0, z: -4.4, w: 1.04, h: this.haut[i], d: 8.8, c: [lerp(24, 125, k), lerp(79, 184, k), lerp(149, 255, k)], i });
    }
    this.peindre(L);
    const tA = clamp(H * 0.04, 11, 34), tV = clamp(H * 0.052, 13, 46);
    for (let i = 0; i < 14; i++) {
      const xc = (i - 6.5) * pas, bas = this.p(xc, 0, 5.3), hautP = this.p(xc, this.haut[i] + 0.25, 4.4), enTete = this.tete.includes(i);
      this.texte(String(i + 1).padStart(2, "0"), bas[0], bas[1] + tA * 0.9, { t: tA, gras: 700, f: "'Big Shoulders Display','Arial Narrow',sans-serif", c: `rgb(${ENCRE2})`, esp: "0.04em" });
      if (this.vals[i] > 0) {
        this.texte(String(this.vals[i]), hautP[0], hautP[1] - 2, { t: enTete ? tV * 1.25 : tV, gras: 900, f: "'Big Shoulders Display','Arial Narrow',sans-serif" });
        if (enTete) { const yy = hautP[1] - tV * 1.25 - 8, r = tV * 0.3; x.fillStyle = "rgb(250,178,25)"; x.beginPath(); x.moveTo(hautP[0], yy - r); x.lineTo(hautP[0] + r, yy + r * 0.75); x.lineTo(hautP[0] - r, yy + r * 0.75); x.closePath(); x.fill(); }
      }
    }
    const g = this.p(-6.5 * pas - 0.9, 0, 5.3);
    this.texte("ALLÉE", g[0], g[1] + tA * 0.9, { t: tA * 0.62, esp: "0.14em", c: `rgb(${ENCRE2})`, al: "right" });
  }
}

/* ───────── Confettis : quand toute la charge du jour est préparée ───────── */
const Fete = (() => {
  let parts = [], raf = 0, cv, ctx, der = 0;
  function pas(ts) {
    const dt = Math.min(0.05, (ts - (der || ts)) / 1000); der = ts;
    const w = cv.clientWidth, h = cv.clientHeight;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter(p => p.y < h + 30 && p.vie > 0);
    for (const p of parts) {
      p.vy += 520 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.vie -= dt;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = clamp(p.vie, 0, 1);
      ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
    }
    if (parts.length) raf = requestAnimationFrame(pas); else { cv.hidden = true; raf = 0; }
    void w;
  }
  return {
    lancer() {
      if (mouvementReduit()) return;
      cv = $("#confetti"); ctx = cv.getContext("2d"); cv.hidden = false;
      cv.width = cv.clientWidth; cv.height = cv.clientHeight;
      const w = cv.width, teintes = ["#3987E5", "#7DB8FF", "#F3F6FB", "#184F95"];
      for (let i = 0; i < 170; i++) parts.push({ x: w / 2 + (Math.random() - 0.5) * w * 0.5, y: -20 - Math.random() * 80, vx: (Math.random() - 0.5) * 520, vy: 80 + Math.random() * 260, r: Math.random() * 6, vr: (Math.random() - 0.5) * 9, s: 8 + Math.random() * 10, c: teintes[i % 4], vie: 3.2 + Math.random() * 1.6 });
      der = 0; if (!raf) raf = requestAnimationFrame(pas);
    }
  };
})();
