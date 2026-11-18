/* ───────── Mise en scène : caméra, lumières, boucle, qualité adaptative ───────── */
const PLANS = [
  { nom: "Vue d'ensemble", c: [1.9, 0.9, -0.4], az: 0.72, el: 0.3, demi: 9.9, fov: 40, dAz: -0.16, duree: 15, pc: [2.2, 1.2, -0.3], pdemi: 4.3 },
  { nom: "Allée", doss: true, c: [-6, 1.2, 3.05], az: 1.39, el: 0.03, demi: 3.2, dAz: -0.07, duree: 9, pdemi: 1.5 },
  { nom: "Retrait", doss: true, c: [3.6, 1.25, 0.4], az: 0.95, el: 0.1, demi: 3.3, dAz: -0.2, duree: 12, pdemi: 1.9 },
  { nom: "Poste de rejet", c: [0.75, 1.3, -0.6], az: -0.3, el: 0.22, demi: 3.05, dAz: 0.22, duree: 12, pdemi: 1.45 },
  { nom: "Balance", c: [-5.5, 1.05, -1.5], az: -0.55, el: 0.26, demi: 3.4, dAz: 0.2, duree: 10, pdemi: 2.0 },
  { nom: "Cercleuses", c: [7.6, 1.1, -1.3], az: 1.02, el: 0.2, demi: 2.6, dAz: -0.18, duree: 10, pdemi: 1.6 }
];
function amorti(cur, cible, etat, cle, tl, dt) {
  const om = 2 / tl, x = om * dt, e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x), ch = cur - cible, v = etat[cle] || 0, tmp = (v + om * ch) * dt;
  etat[cle] = (v - om * tmp) * e; return cible + (ch + tmp) * e;
}

class PosteRejet3D {
  constructor(canvas, o = {}) {
    this.cv = canvas; this.o = o; this.demo = o.demo !== false;
    const r = this.renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance", alpha: false, stencil: false });
    ANISO = r.capabilities.getMaxAnisotropy();
    r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap; r.shadowMap.autoUpdate = false;
    const fond = 0x151d29;
    this.scene = new T.Scene(); this.scene.background = new T.Color(fond); this.scene.fog = new T.FogExp2(fond, 0.0125);
    this.camera = new T.PerspectiveCamera(34, 1, 0.25, 150); this.vise = new T.Vector3();
    geometries(); this.M = matieres(this); this.M.cellule = this.M.voyant(0x2dff5a, 2.2); this.gBac = geoBac(0.6, 0.4, 0.53, 0.35, 0.245);
    this.grColis = new T.Group(); this.grPersos = new T.Group(); this.grBulles = new T.Group(); this.scene.add(this.grColis, this.grPersos, this.grBulles);
    this.princ = []; this.dev = []; this.rej = []; this.divers = []; this.ops = []; this.bulles = []; this.vig = []; this.serie = 341;
    this.cpt = { pese: null, rej: null, dec: null }; this.rejMax = o.rejMax || 120; this.taux = 0.02; this.pRejet = 0.5; this.cadence = 5.5; this.forceReflet = 1.7;
    this.lumieres();
    this.scene.environment = ambiance(r);
    construireHalle(this); construireLignes(this); construirePoste(this); this.accessoires();
    this.ctrl = new Perso(this, { i: 5, d: "bleu", titre: "CONTRÔLE", casquette: false, x: HX, z: HZ, cap: PI });
    const sc = new T.Mesh(G.box, this.M.jaune); sc.scale.set(0.05, 0.1, 0.07); sc.position.set(0, -0.31, 0.03); this.ctrl.coude[1].add(sc);
    const sn = new T.Mesh(G.box, this.M.noir); sn.scale.set(0.055, 0.05, 0.09); sn.position.set(0, -0.36, 0.045); this.ctrl.coude[1].add(sn);
    this.rendu = new Rendu(this);
    this.q = { prMax: Math.min(o.pr || window.devicePixelRatio || 1, 2), pr: 1, budget: 2.4e6, niveau: 0 }; this.w = 0; this.h = 0;
    if (o.qualite === "basse") { this.rendu.halo = this.rendu.reflet = false; this.rendu.mode(); this.q.budget = 1.2e6; }
    for (let i = 0; i < (o.alleger || 0); i++) this.alleger();          // l'écran est déjà connu pour être lent : on part allégé
    this.cam = { c: new T.Vector3(), az: 0, el: 0, d: 10 }; this.vel = {}; this.plan = 0; this.tPlan = 0; this.auto = o.auto !== false; this.libre = { az: 0, el: 0, z: 1, t: 0 };
    this.actif = false; this._raf = 0; this._der = 0; this.temps = 0; this.noir = 0; this.fondu = null; this.pret = false;
    this.perf = { n: 0, s: 0, calme: 0 }; this._boucle = this._boucle.bind(this);
    /* le tour de caméra : [numéro de plan, durée en secondes], dans l'ordre ; par défaut tous les plans */
    this.tour = (o.tour || PLANS.map((p, i) => [i, p.duree])).map(e => ({ i: e[0], d: e[1] })); this.etape = 0; this.plan = this.tour[0].i;
    if (o.gestes !== false) this.gestes();
    canvas.addEventListener("webglcontextrestored", () => { this.prCourant = -1; try { this.scene.environment = ambiance(this.renderer); } catch (e) {} });
    try { this.renderer.compile(this.scene, this.camera); } catch (e) {}
    this.donnees(o.taux, o.vig || [], o.cpt);
    this.pret = true; this.entree(); this.cadrer(0, true);
  }
  lumieres() {
    const s = this.scene;
    s.add(new T.HemisphereLight(0xcfe0ff, 0x4d5f53, 0.3));
    const cle = this.cle = new T.DirectionalLight(0xfff2e0, 0.98); cle.position.set(-6.5, 15, 10); cle.target.position.set(1.2, 0, -0.6); cle.castShadow = true;
    cle.shadow.mapSize.set(2048, 2048); const sc = cle.shadow.camera; sc.left = -15; sc.right = 15; sc.top = 9; sc.bottom = -9; sc.near = 2; sc.far = 42; cle.shadow.bias = -0.0005; cle.shadow.normalBias = 0.025;
    s.add(cle, cle.target);
    const app = new T.DirectionalLight(0xa9c6ff, 0.24); app.position.set(13, 7, 6); app.target.position.set(1, 1, -1); s.add(app, app.target);
    const dos = new T.DirectionalLight(0xffe2c0, 0.16); dos.position.set(4, 9, -9); dos.target.position.set(1, 1, 0); s.add(dos, dos.target);
    const sp = new T.SpotLight(0xfff4e2, 0.8, 13, 0.62, 0.85, 1.1); sp.position.set(1.4, 5.5, 1.6); sp.target.position.set(1.6, 0.8, -0.1); s.add(sp, sp.target);
    this.lumPoste = new T.PointLight(0x9dc2ff, 0.55, 3.4, 1.5); this.lumPoste.position.set(0.5, 1.45, 0.2); s.add(this.lumPoste);
    this.lumBal = new T.PointLight(0x30ff60, 0, 4.5, 1.4); this.lumBal.position.set(X_BAL - 0.3, 1.7, ZM + 0.5); s.add(this.lumBal);
  }
  accessoires() {
    const M = this.M, s = this.scene;
    this.pousseur = new T.Mesh(G.box, M.jauneSecu); this.pousseur.scale.set(0.34, 0.11, 0.02); this.pousseur.position.set(X_STOP, YR + 0.075, ZJ - LW / 2 - 0.03); this.pousseur.castShadow = true; s.add(this.pousseur);
    this.tige = new T.Mesh(G.cylR, M.chrome); this.tige.rotation.x = PI / 2; this.tige.position.set(X_STOP, YR + 0.075, ZJ - LW / 2 - 0.1); s.add(this.tige);
    const g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(new Float32Array(9), 3)); g.setIndex([0, 1, 2]);
    this.faisceau = new T.Mesh(g, M.laser.clone()); this.faisceau.material.opacity = 0.3; this.faisceau.frustumCulled = false; this.faisceau.visible = false; s.add(this.faisceau);
    this.traitScan = new T.Mesh(G.box, M.trait); this.traitScan.visible = false; s.add(this.traitScan);
  }
  /* même contrat que l'ancienne scène : taux de rejet, liste des dossards {mat, n, d}, compteurs facultatifs */
  donnees(taux, vig, cpt) {
    this.taux = fini(taux) ? clamp(taux, 0.003, 0.4) : 0.02;
    this.pRejet = clamp(0.6 + this.taux * 5, 0.6, 0.9); this.cadence = clamp(4.6 - this.taux * 15, 3.2, 4.6);
    if (cpt) { if (fini(cpt.max)) this.rejMax = cpt.max; for (const n of ["pese", "rej", "dec"]) if (n in cpt) this.cpt[n] = fini(cpt[n]) ? cpt[n] : null; this.cpt0 = Object.assign({}, this.cpt); }
    const ops = (vig || []).slice(0, 7), cle = ops.map(v => v.mat + ":" + v.n + ":" + v.d).join("|");
    if (cle !== this.cleVig) {
      this.cleVig = cle; this.vig = ops;
      /* la liste des dossards a changé : fondu si la scène tourne, remise à zéro immédiate sinon */
      if (this.pret) { if (!this.fondu) { if (this.actif && !this.fige) this.fondu = { t: 0, fait: false }; else this.entree(); } else if (this.fondu.fait) this.aRefaire = true; }
    }
    this.sale = true;
  }
  gestes() {
    const cv = this.cv, L = this.libre; let p = null, pince = 0; const pts = new Map();
    cv.style.touchAction = "none";
    cv.addEventListener("pointerdown", e => { pts.set(e.pointerId, [e.clientX, e.clientY]); p = [e.clientX, e.clientY]; if (pts.size === 2) { const a = [...pts.values()]; pince = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); } try { cv.setPointerCapture(e.pointerId); } catch (_) {} });
    cv.addEventListener("pointermove", e => {
      if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2) { const a = [...pts.values()], d = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); if (pince) L.z = clamp(L.z * pince / d, 0.35, 1.8); pince = d; L.t = 9; return; }
      const dx = e.clientX - p[0], dy = e.clientY - p[1]; p = [e.clientX, e.clientY];
      L.az -= dx * 0.005; L.el = clamp(L.el + dy * 0.004, -0.5, 0.9); L.t = 9;
    });
    const fin = e => { pts.delete(e.pointerId); pince = 0; };
    cv.addEventListener("pointerup", fin); cv.addEventListener("pointercancel", fin);
    cv.addEventListener("wheel", e => { e.preventDefault(); L.z = clamp(L.z * Math.exp(e.deltaY * 0.0012), 0.35, 1.8); L.t = 9; }, { passive: false });
  }
  allerAuPlan(i, auto) {
    this.plan = ((i % PLANS.length) + PLANS.length) % PLANS.length; const e = this.tour.findIndex(q => q.i === this.plan); if (e >= 0) this.etape = e;
    this.tPlan = 0; if (auto != null) this.auto = auto; this.libre.t = 0; if (this.o.surPlan) this.o.surPlan(this.plan, this.auto); if (this.fige && this.actif) this.image(0);
  }
  dureePlan() { const e = this.tour[this.etape]; return e && e.i === this.plan ? e.d : PLANS[this.plan].duree; }
  cadrer(dt, net) {
    const L = this.libre, A = this.w / Math.max(1, this.h) || 1.6, portrait = A < 0.95, P = PLANS[this.plan], cam = this.camera;
    if (L.t > 0) L.t -= dt; else { L.az = vers(L.az, 0, dt * 1.6); L.el = vers(L.el, 0, dt * 1.6); L.z = vers(L.z, 1, dt * 1.6); if (this.auto && !this.fige) this.tPlan += dt; }
    if (this.auto && this.tPlan > this.dureePlan() && !this.fondu) {
      /* plan suivant ; sans dossard aujourd'hui, on saute les plans qui leur sont consacrés */
      let e = this.etape + 1; while (e < this.tour.length && PLANS[this.tour[e].i].doss && !this.ops.length) e++;
      if (e < this.tour.length) this.allerAuPlan(this.tour[e].i);
      else if (this.o.boucle !== false) this.fondu = { t: 0, fait: false };     // fin du tour : fondu, la journée recommence
      else this.allerAuPlan(this.tour[0].i);
    }
    if (this.fondu) {
      const f = this.fondu; f.t += dt; this.noir = clamp(f.t < 0.45 ? f.t / 0.45 : 1 - (f.t - 0.55) / 0.5, 0, 1);
      if (f.t >= 0.45 && !f.fait) { f.fait = true; this.entree(); this.allerAuPlan(this.tour[0].i); net = true; }
      if (f.t >= 1.05) { this.fondu = this.aRefaire ? { t: 0, fait: false } : null; this.aRefaire = false; this.noir = 0; }
      const op = this.rendu.halo || !this.noir ? "" : String(1 - this.noir); if (this.cv.style.opacity !== op) this.cv.style.opacity = op;     // sans halo, le fondu passe par la feuille de style
      if (this.o.surNoir) this.o.surNoir(this.noir);
    }
    const Q = PLANS[this.plan], fov = portrait ? 46 : (Q.fov || 34), u = clamp(this.tPlan / this.dureePlan(), 0, 1), demi = portrait ? Q.pdemi : Q.demi * clamp(0.55 + 0.45 * A / 1.78, 0.78, 1), c = portrait && Q.pc ? Q.pc : Q.c;
    const f = net ? fov : amorti(cam.fov, fov, this.vel, "fov", 1.05, dt);
    if (Math.abs(cam.fov - f) > 1e-4 || cam.aspect !== A) { cam.fov = f; cam.aspect = A; cam.updateProjectionMatrix(); }
    const hf = Math.atan(Math.tan(fov * PI / 360) * A), d = clamp(demi / Math.tan(hf), 2.5, 34) * (1 - 0.05 * u) * L.z * (this.o.zoom || 1);
    const az = Q.az + Q.dAz * (u - 0.5) + L.az, el = clamp(Q.el + (portrait ? 0.06 : 0) + L.el, 0.03, 1.35), S = this.cam, tl = net ? 0 : 1.05;
    if (net) { S.c.set(c[0], c[1], c[2]); S.az = az; S.el = el; S.d = d; this.vel = {}; }
    else {
      S.c.set(amorti(S.c.x, c[0], this.vel, "x", tl, dt), amorti(S.c.y, c[1], this.vel, "y", tl, dt), amorti(S.c.z, c[2], this.vel, "z", tl, dt));
      S.az = amorti(S.az, az, this.vel, "az", tl, dt); S.el = amorti(S.el, el, this.vel, "el", tl, dt); S.d = amorti(S.d, d, this.vel, "d", tl, dt);
    }
    const ce = Math.cos(S.el);
    cam.position.set(S.c.x + S.d * Math.sin(S.az) * ce, clamp(S.c.y + S.d * Math.sin(S.el), 0.35, 6.35), Math.max(Z_MUR + 1.2, S.c.z + S.d * Math.cos(S.az) * ce));
    this.vise.copy(S.c); cam.lookAt(this.vise);
  }
  taille() {
    const w = this.cv.clientWidth, h = this.cv.clientHeight;
    if (w < 4 || h < 4) return false;
    const pr = Math.min(this.q.prMax, Math.sqrt(this.q.budget / (w * h)));       // jamais plus de pixels que le budget, même sur un écran 4K
    if (w !== this.w || h !== this.h || pr !== this.prCourant) { this.w = w; this.h = h; this.prCourant = this.q.pr = pr; this.rendu.taille(w, h, pr); }
    return true;
  }
  /* si le poste peine, on allège : définition, puis reflet du sol, puis halo, puis ombres */
  alleger() {
    const q = this.q, R = this.rendu;
    if (q.budget > 1.1e6) q.budget *= 0.66;
    else if (R.reflet) R.reflet = false;
    else if (!this.ombreDemi) this.ombreDemi = true;
    else if (R.halo) { R.halo = false; R.mode(); for (const n in this.M) { const m = this.M[n]; if (m && m.isMaterial) m.needsUpdate = true; } }
    else if (this.cle.shadow.mapSize.x > 1024) { this.cle.shadow.mapSize.set(1024, 1024); if (this.cle.shadow.map) { this.cle.shadow.map.dispose(); this.cle.shadow.map = null; } }
    else return false;
    q.niveau++; this.prCourant = -1; this.rendu.liberer(); return true;
  }
  pas(dt) {
    let reste = dt; while (reste > 1e-5) { const d = Math.min(reste, 0.034); this.simuler(d); reste -= d; }
    this.cadrer(dt);
    this.rendu.image(this.scene, this.camera, this.temps);
  }
  _boucle(ts) {
    if (!this.actif) return; this._raf = requestAnimationFrame(this._boucle);
    const brut = this._der ? (ts - this._der) / 1000 : 0.016; this._der = ts;
    if (!this.taille()) return;
    this.pas(Math.min(0.1, brut));
    if (this.o.qualite !== "haute" && this.o.qualite !== "basse") {
      /* mesure de la fluidité : on allège si le poste peine, on rend la main s'il n'y arrive pas du tout */
      const p = this.perf;
      if (brut > 2) {                                                 // retour d'onglet ou veille : on repart de zéro ; trois fois de suite, c'est le poste qui ne suit pas
        p.calme = 0; p.n = 0; p.s = 0; p.longues = (p.longues || 0) + 1;
        if (p.longues >= 3 && this.o.surTropLent) { this.o.surTropLent(); return; }
      }
      else if ((p.calme += brut) > 1.2) {
        p.n++; p.s += brut; p.longues = 0;
        if (p.n >= 45 || (p.s >= 2.5 && p.n >= 3)) {
          const moy = p.s / p.n; let crans = 0;
          if (moy > 0.35 && this.o.surTropLent) { this.o.surTropLent(); return; }                                       // moins de 3 images par seconde : inutile d'insister
          if (moy > 0.036) for (let i = 0, n = moy > 0.11 ? 3 : 1; i < n; i++) if (this.alleger()) crans++;             // très lent : trois crans d'un coup
          if (moy > 0.075 && !crans && this.o.surTropLent) { this.o.surTropLent(); return; }                             // plus rien à alléger et toujours saccadé
          p.n = 0; p.s = 0; p.calme = 0;
        }
      }
    }
  }
  demarrer() {
    if (this.actif) return; this.actif = true; this._der = 0; this.perf.n = this.perf.s = this.perf.calme = 0;
    this.fige = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) && this.o.forcerMouvement !== true;
    /* tableau de bord : à chaque retour de l'écran, la journée et le tour de caméra repartent du début */
    if (this.o.rejouer) { this.fondu = null; this.aRefaire = false; this.noir = 0; this.cv.style.opacity = ""; this.entree(); this.etape = 0; this.plan = this.tour[0].i; this.tPlan = 0; if (this.taille()) this.cadrer(0, true); }
    if (this.fige) { this.image(6); return; }
    this._raf = requestAnimationFrame(this._boucle);
  }
  arreter() { this.actif = false; cancelAnimationFrame(this._raf); }
  liberer() { this.arreter(); try { this.rendu.liberer(); this.renderer.dispose(); this.renderer.forceContextLoss(); } catch (e) {} }
  /* écran caché : rien à dessiner, il le sera en revenant */
  visible() {
    if (getComputedStyle(this.cv).visibility === "hidden") return false;
    const r = this.cv.getBoundingClientRect();
    return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight;
  }
  rafraichir() { if (this.actif && !this.fige) return; if (this.visible()) this.image(0); }
  /* image fixe après t secondes de vie (mouvement réduit, vignette, essais) */
  image(t = 0) { if (!this.taille()) return; for (let i = 0, n = Math.round(t / 0.033); i < n; i++) this.simuler(0.033); this.cadrer(0, true); this.rendu.image(this.scene, this.camera, this.temps); }
}
Object.assign(PosteRejet3D.prototype, SIM);
PosteRejet3D.PLANS = PLANS;
window.PosteRejet3D = PosteRejet3D;
