/* ───────── La vie de la scène : flux de colis, balance, cercleuses, contrôleur, dossards ───────── */
const HX = 0.5, HZ = 0.66, BUREAU = { x: 0.47, z: -0.02 };
const P_TEND = { eG: -1.2, eD: -1.2, cG: -0.3, cD: -0.3, zG: -0.06, zD: 0.06, dos: 0.5, tx: -0.12 };
const P_TIENT = { eG: -0.78, eD: -0.78, cG: -0.72, cD: -0.72, zG: -0.12, zD: 0.12, dos: 0.24, tx: 0.2 };
const P_SCAN = { eD: -1.0, cD: -0.55, zD: 0.1, eG: -0.62, cG: -0.9, zG: -0.18, dos: 0.2, tx: 0.3, vrille: 0.1 };
const P_REGARDE = { eG: -0.25, eD: -0.25, cG: -0.7, cD: -0.7, dos: 0.02, tx: -0.14 };
const P_POSE = { eG: -0.98, eD: -0.98, cG: -0.42, cD: -0.42, zG: -0.08, zD: 0.08, dos: 0.36 };
const V1 = new T.Vector3(), V2 = new T.Vector3();

const SIM = {
  vider() {
    for (const c of [...this.princ, ...this.dev, ...this.rej, ...this.divers]) c.retirer();
    this.parc = this.parc || new Map();
    for (const o of this.ops) { for (const c of [...o.pile, ...o.portes, ...(o.aPrendre || [])]) c.retirer(); o.perso.racine.visible = false; this.parc.set(o.cle, o.perso); }
    for (const b of this.bulles) b.detruire();
    this.princ = []; this.dev = []; this.rej = []; this.divers = []; this.ops = []; this.bulles = [];
  },
  /* remise à zéro : lignes déjà en mouvement, piles prêtes sur la table, premiers dossards en chemin */
  entree() {
    this.vider();
    const r = this.rnd = alea(20261117); this.serie = 341; this.temps = 0; this.tApp = 0.4; this.tRejet = -3; this.eclatBal = null; this.dernPesee = null;
    this.zone = { veut: false, dedans: false }; if (this.demo && this.cpt0) Object.assign(this.cpt, this.cpt0); this.dernier = null; this.eclatPoste = null;
    for (const m of [this.cercA, this.cercB]) { m.c = null; m.t = 0; }
    let x = X_OUT - 0.5, force = false;
    while (x > X_IN + 0.6) {
      const avant = x < X_BAL - 0.25, c = new Colis(this, r, avant && !force ? { h: 0.17, w: 0.4, d: 0.32 } : { bac: r() < 0.13 });
      if (avant && !force) { c.forcer = true; force = true; }
      c.x = x; c.pese = x > X_BAL; if (x > X_CA) { c.feuillard(); c.passe = this.cercA; }
      c.placer(); this.princ.push(c); x -= 1.18 + r() * 0.42;
    }
    for (const [px, lib] of [[X_STOP, false], [-1.7, false], [11.6, true]]) {
      const c = new Colis(this, r, { h: 0.15 + r() * 0.08 }); c.x = px; c.z = ZJ; c.rejet = c.pese = true; c.libere = lib; c.ecart = 0.2 + r() * 0.4;
      if (lib) { c.feuillard(); c.passe = this.cercB; } else c.bulle = new Bulle(this, "REJET", "#FF3B3B", "#FFFFFF", 0.2);
      c.placer(); this.rej.push(c);
    }
    this.rej.sort((a, b) => b.x - a.x);
    /* dossards */
    this.ops = this.vig.map((v, k) => {
      const o = { k, mat: String(v.mat), n: +v.n || 0, d: DOSS[v.d] ? v.d : "jaune", x: caseX(k), sCase: sCase(k), pile: [], portes: [], etat: "absent", t: 0, s: 0, seg: 0, debut: 0, vit: 1.52 + r() * 0.2 };
      const ech = 0.97 + r() * 0.07; o.cle = k + "|" + o.mat + "|" + o.d;
      const garde = this.parc && this.parc.get(o.cle);
      if (garde) {
        this.parc.delete(o.cle); o.perso = garde;
        Object.assign(garde, { x: X_PORTE, z: Z_ALLER, cap: PI / 2, v: 0, charge: 0, ech }); garde.racine.scale.setScalar(ech); garde.pose({}, true); garde.poser(1);
      } else o.perso = new Perso(this, { i: k, d: o.d, num: o.mat, casquette: k % 3 !== 1, gants: k % 2 === 0, x: X_PORTE, z: Z_ALLER, cap: PI / 2, ech });
      o.perso.racine.visible = false;
      const e = DOSS[o.d]; o.bulle = new Bulle(this, `${o.mat}  ×${o.n}`, e.css, o.d === "rouge" ? "#FFFFFF" : "#12151C", 0.34); o.bulle.sp.visible = false;
      for (let i = 0; i < Math.min(o.n, 6); i++) this.empiler(o, new Colis(this, r, { w: 0.3 + r() * 0.13, d: 0.25 + r() * 0.08, h: 0.13 + r() * 0.07 }));
      /* le cortège est déjà en marche : chacun arrive à sa case à son heure (fenêtre réglable, pour coller au tour de caméra) */
      const f = this.o.vague, nb = this.vig.length, arrivee = f ? (nb > 1 ? lerp(f[0], f[1], k / (nb - 1)) : (f[0] + f[1]) / 2) : 1.3 + k * 3.0, allure = o.vit * 0.97, s0 = o.sCase - allure * arrivee;
      if (s0 >= 0) this.partir(o, s0); else o.debut = -s0 / allure;
      return o;
    });
    /* personnages qui ne servent plus (la liste des dossards a changé) : rendus à la mémoire */
    if (this.parc) { for (const p of this.parc.values()) p.retirer(this); this.parc.clear(); }
    this.poste = { etat: "attend", t: 0, colis: null, verdict: null }; this.ctrl.x = HX; this.ctrl.z = HZ; this.ctrl.cap = PI; this.ctrl.charge = 0; this.ctrl.pose({}, true);
    for (const c of [...this.ctrl.porte.children]) this.ctrl.porte.remove(c);
    this.pousseU = 0; this.sale = true; this.dessinerCases(); this.dessinerBalance(); this.majEcrans(1, true);
  },
  empiler(o, c) {
    let y = TABLE.y; for (const q of o.pile) y += q.h;
    c.x = o.x + (this.rnd() - 0.5) * 0.03; c.z = 0.05 + (this.rnd() - 0.5) * 0.03; c.y = y; c.lacet = (this.rnd() - 0.5) * 0.22; c.rejet = true; c.dep = null; c.enMain = false;
    if (!c.g.parent || c.g.parent !== this.grColis) this.grColis.add(c.g);
    c.g.rotation.set(0, 0, 0); c.placer(); o.pile.push(c);
  },
  suivre(c) { if (c.bulle) c.bulle.en(c.x, c.y + c.h + 0.07, c.z); },

  simuler(dt) {
    this.temps += dt;
    this.flux(dt); this.majCerc(this.cercA, dt); this.majCerc(this.cercB, dt);
    this.majPoste(dt); this.majOps(dt);
    this.bulles = this.bulles.filter(b => b.maj(dt) || (b.detruire(), false));
    this.majVoyants(dt); this.majEcrans(dt);
    this.M.rouleau.map.offset.x -= dt * 1.9; this.tapisBal.offset.x -= dt * V_LIGNE * 6.2;
  },

  flux(dt) {
    const r = this.rnd; this.tApp -= dt;
    const der = this.princ[this.princ.length - 1];
    if (this.tApp <= 0 && (!der || der.x > X_IN + 0.9)) { const c = new Colis(this, r, { bac: r() < 0.13 }); c.x = X_IN; c.placer(); this.princ.push(c); this.tApp = 1.12 + r() * 0.5; }
    /* ligne principale */
    let dev = null, garde = [];
    for (const c of this.princ) {
      let nx = this.limiteCerc(this.cercA, c, c.x + V_LIGNE * dt);
      if (dev) nx = Math.min(nx, dev.x - dev.w / 2 - c.w / 2 - 0.09);
      nx = Math.max(nx, c.x);
      if (c.x < X_BAL && nx >= X_BAL) this.peser(c);
      c.x = nx;
      if (c.rejet && c.x >= X_D0) { c.u = 0; this.dev.push(c); continue; }
      if (c.x > X_OUT + 0.45) { c.retirer(); continue; }
      c.placer(); this.suivre(c); garde.push(c); dev = c;
    }
    this.princ = garde;
    /* aiguillage : trajectoire en S vers la ligne de rejet */
    garde = [];
    for (const c of this.dev) {
      c.u += V_REJ * dt / (X_D1 - X_D0);
      const u = Math.min(1, c.u);
      c.x = lerp(X_D0, X_D1, u); c.z = lerp(ZM, ZJ, lisse(u)); c.lacet = -Math.sin(PI * u) * 0.4;
      if (u >= 1) { c.lacet = 0; this.rej.push(c); this.rej.sort((a, b) => b.x - a.x); } else garde.push(c);
      c.placer(); this.suivre(c);
    }
    this.dev = garde;
    const actif = this.dev.some(c => c.u < 0.6) || this.princ.some(c => c.rejet && c.x > X_D0 - 0.8);
    this.brasU = vers(this.brasU || 0, actif ? 1 : 0, dt * 11); this.bras.rotation.y = -0.5 * this.brasU; allumer(this.vAig, actif ? 3 : 0.06);
    /* ligne de rejet : accumulation derrière le poste, puis départ vers la seconde cercleuse */
    dev = null; garde = []; this.tete = null;
    for (const c of this.rej) {
      let nx = c.x + V_REJ * dt;
      nx = c.libere ? this.limiteCerc(this.cercB, c, nx) : Math.min(nx, X_STOP);
      if (dev) nx = Math.min(nx, dev.x - dev.w / 2 - c.w / 2 - 0.1);
      c.x = Math.max(nx, c.x); c.z = ZJ;
      if (!c.libere && c.x >= X_STOP - 0.003) this.tete = c;
      if (c.x > X_OUT + 0.45) { c.retirer(); continue; }
      c.placer(); this.suivre(c); garde.push(c); dev = c;
    }
    this.rej = garde;
    /* lecteur du portique : le trait rouge se pose sur le colis qui passe */
    let ys = YR + 0.004; for (const c of this.princ) if (Math.abs(c.x - X_SCAN) < c.w / 2) ys = YR + c.h + 0.004;
    this.traitLaser.position.y = ys; this.nappe.scale.y = (1.86 - ys) / 1.86; this.nappe.position.y = ys;
  },
  peser(c) {
    c.pese = true; if (this.demo) this.cpt.pese++;
    const attente = this.rej.filter(q => !q.libere).length + this.dev.length + (this.poste.colis ? 1 : 0);
    let rejet = !!c.forcer;
    if (!rejet && !c.bac && c.h <= 0.26 && attente < 3 && this.temps - this.tRejet > this.cadence) rejet = this.rnd() < this.pRejet;
    if (rejet) { c.rejet = true; this.tRejet = this.temps; c.ecart = (0.08 + this.rnd() * 0.6) * (this.rnd() < 0.72 ? 1 : -1); c.bulle = new Bulle(this, "REJET", "#FF3B3B", "#FFFFFF", 0.2); }
    this.eclatBal = { rejet, t: rejet ? 1.3 : 0.45 };
    this.dernPesee = { poids: c.poids + (c.ecart || 0), ecart: c.ecart || 0, rejet };
    this.dessinerBalance();
  },

  /* cercleuse : le colis s'arrête sous l'arche, le presseur descend, le feuillard se referme */
  limiteCerc(m, c, nx) {
    if (c.bac || c.passe === m || c.x > m.x + 0.001 || nx < m.x) return nx;
    if (!m.c) { m.c = c; m.t = 0; }
    return m.c === c ? m.x : Math.min(nx, m.x - 0.3);
  },
  majCerc(m, dt) {
    const D = 0.86, haut = YR + 0.78; let yb = haut, vis = false, cycle = false;
    if (m.c) {
      m.t += dt; cycle = true; const c = m.c, t = m.t, s = lisse((t - 0.32) / 0.2);
      yb = lerp(haut, YR + c.h + 0.018, lisse(t / 0.18) - lisse((t - 0.62) / 0.2));
      const W = lerp(0.86, c.d + 0.008, s), H = lerp(0.82, c.h + 0.004, s); vis = t > 0.1 && t < 0.56;
      m.boucle[0].scale.set(0.014, 0.004, W); m.boucle[0].position.set(m.x, YR + H, m.z);
      m.boucle[1].scale.set(0.014, H, 0.004); m.boucle[1].position.set(m.x, YR + H / 2, m.z + W / 2);
      m.boucle[2].scale.set(0.014, H, 0.004); m.boucle[2].position.set(m.x, YR + H / 2, m.z - W / 2);
      m.eclair.intensity = t > 0.5 && t < 0.62 ? 1.4 : 0;
      if (t >= 0.56) c.feuillard();
      if (t >= D) { c.passe = m; m.c = null; }
    } else { m.eclair.intensity = 0; m.tapis.offset.x -= dt * V_LIGNE * 7; }
    for (const b of m.boucle) b.visible = vis;
    m.presseur.position.y = vers(m.presseur.position.y, yb, dt * 30);
    allumer(m.feu.vert, 2.6); allumer(m.feu.orange, cycle && m.t < 0.6 ? 3 : 0.05); allumer(m.vOk, cycle ? 0.2 : 1.8);
  },

  /* ───────── le contrôleur ───────── */
  verdict() {
    const dispo = this.ops.filter(o => o.pile.length < Math.min(o.n, 6) && (o.etat === "absent" || o.servi || o.s < o.sCase - 4));
    if (!dispo.length || this.rnd() > 0.82) return { ok: true };
    let tot = 0; for (const o of dispo) tot += o.n + (o.etat === "absent" ? 4 : 0);
    let a = this.rnd() * tot;
    for (const o of dispo) { a -= o.n + (o.etat === "absent" ? 4 : 0); if (a <= 0) return { ok: false, op: o }; }
    return { ok: false, op: dispo[0] };
  },
  majPoste(dt) {
    const P = this.poste, k = this.ctrl, c = P.colis; P.t += dt;
    const passer = e => { P.etat = e; P.t = 0; this.sale = true; };
    let pousse = 0, scan = false, marche = false;
    switch (P.etat) {
      case "attend": {
        const la = k.aller(HX, HZ, dt, 1.5) && k.tourner(PI, dt); marche = true;
        if (la && this.zone.dedans) { this.zone.dedans = this.zone.veut = false; }
        if (la && this.tete) { P.colis = this.tete; this.divers.push(this.tete); this.rej = this.rej.filter(q => q !== this.tete); this.tete = null; P.verdict = null; passer("pousse"); }
        else if (la && P.t > 1.2) { k.pose({ eG: -0.5, eD: -0.42, cG: -1.05, cD: -1.1, zG: -0.16, zD: 0.02, dos: 0.1, tx: 0.16, vrille: -0.12, ty: 0.3 * Math.sin(this.temps * 0.6) }); marche = false; }
        break;
      }
      case "pousse": {   // le pousseur amène le colis au bord du bureau
        const u = lisse(P.t / 0.5); c.z = lerp(ZJ, -0.36, u); pousse = 1; if (P.t > 0.15) k.pose(P_TEND);
        if (P.t >= 0.5) passer("tire"); break;
      }
      case "tire": {
        const u = lisse(P.t / 0.42); c.z = lerp(-0.36, BUREAU.z, u); c.x = lerp(X_STOP, BUREAU.x, u); k.pose(u < 0.5 ? P_TEND : P_TIENT);
        if (P.t >= 0.42) passer("scan"); break;
      }
      case "scan": {
        k.pose(P_SCAN); scan = P.t > 0.25 && P.t < 1.5;
        if (P.t >= 1.3 && !P.verdict) {
          const v = P.verdict = this.verdict(); this.sale = true;
          if (c.bulle) { c.bulle.fin(); c.bulle = null; }
          if (v.ok) c.bulle = new Bulle(this, "CONFORME ✓", "#22C55E", "#06210F", 0.2);
          else { const e = DOSS[v.op.d]; c.bulle = new Bulle(this, `ERREUR  ${v.op.mat}`, e.css, v.op.d === "rouge" ? "#FFFFFF" : "#12151C", 0.2); if (this.demo) this.cpt.dec++; }
          this.dernier = { ok: v.ok, mat: v.ok ? null : v.op.mat, d: v.ok ? null : v.op.d, ecart: c.ecart || 0, poids: c.poids, id: c.id };
          this.eclatPoste = { ok: v.ok, t: 2.2 };
        }
        if (P.t >= 1.95) passer(P.verdict.ok ? "repousse" : "leve"); else if (P.t > 1.4) k.pose(P_REGARDE);
        break;
      }
      case "repousse": {  // conforme : retour sur la ligne, direction la cercleuse
        const u = lisse(P.t / 0.5); c.x = lerp(BUREAU.x, 0.95, u); c.z = lerp(BUREAU.z, -0.36, u); k.pose(u < 0.85 ? P_TEND : {});
        if (P.t >= 0.5) passer("glisse"); break;
      }
      case "glisse": {
        const u = lisse(P.t / 0.45); c.x = lerp(0.95, 1.4, u); c.z = lerp(-0.36, ZJ, u); k.pose({});
        if (P.t >= 0.45) { c.z = ZJ; c.libere = true; this.rej.push(c); this.rej.sort((a, b) => b.x - a.x); if (c.bulle) { c.bulle.fin(1.6); } P.colis = null; this.divers = this.divers.filter(q => q !== c); passer("attend"); }
        break;
      }
      case "leve": {     // erreur : le colis part vers la case du dossard
        const u = lisse(P.t / 0.4), a = k.ancre(V1); k.charge = 1; marche = true;
        c.x = lerp(BUREAU.x, a.x, u); c.z = lerp(BUREAU.z, a.z, u); c.y = lerp(YR, a.y, u); c.lacet = lerp(0, k.cap, u);
        if (P.t >= 0.4) { k.porte.add(c.g); c.g.position.set(0, 0, 0); c.g.rotation.set(0, 0, 0); P.tenu = true; this.zone.veut = true; passer("veut"); }
        break;
      }
      case "veut": {
        marche = true; k.aller(1.35, 0.92, dt, 1.2);
        const occupe = this.ops.some(o => o.etat === "entre" || o.etat === "prise" || o.etat === "attend" || o.etat === "sort");
        if (!occupe) { this.zone.dedans = true; passer("va"); }
        break;
      }
      case "va": { marche = true; if (k.aller(P.verdict.op.x, 0.94, dt, 1.45) && k.tourner(PI, dt)) passer("pose"); break; }
      case "pose": {
        const o = P.verdict.op; k.pose(P_POSE);
        if (P.tenu) { const a = k.ancre(V1); this.grColis.add(c.g); c.dep = { x: a.x, y: a.y, z: a.z }; P.tenu = false; k.charge = 0; let y = TABLE.y; for (const q of o.pile) y += q.h; c.fin = { x: o.x + (this.rnd() - 0.5) * 0.03, y, z: 0.05, l: (this.rnd() - 0.5) * 0.2 }; }
        const u = clamp(P.t / 0.4, 0, 1), e = lisse(u);
        c.x = lerp(c.dep.x, c.fin.x, e); c.y = lerp(c.dep.y, c.fin.y, e) + Math.sin(PI * u) * 0.06; c.z = lerp(c.dep.z, c.fin.z, e); c.lacet = lerp(PI, c.fin.l, e); c.g.rotation.set(0, 0, 0);
        if (P.t >= 0.5) { c.lacet = c.fin.l; c.dep = null; c.enMain = false; o.pile.push(c); if (c.bulle) { c.bulle.fin(0.4); c.bulle = null; } P.colis = null; this.divers = this.divers.filter(q => q !== c); passer("attend"); }
        break;
      }
    }
    if (c && P.colis) { if (!P.tenu) c.placer(); if (c.bulle) { if (P.tenu) { c.g.getWorldPosition(V2); c.bulle.en(V2.x, V2.y + c.h + 0.07, V2.z); } else this.suivre(c); } }
    if (marche) k.marche(dt);
    k.poser(dt);
    /* pousseur pneumatique */
    this.pousseU = vers(this.pousseU, pousse, dt * (pousse ? 30 : 6));
    const z0 = ZJ - LW / 2 - 0.03, zp = pousse && c ? Math.max(z0, c.z - c.d / 2 - 0.014) : lerp(z0, this.pousseur.position.z, 1 - Math.min(1, dt * 7));
    this.pousseur.position.z = zp; const zr = ZJ - LW / 2 - 0.2; this.tige.scale.set(0.014, Math.max(0.02, zp - zr), 0.014); this.tige.position.z = (zp + zr) / 2;
    /* faisceau du lecteur à main */
    this.faisceau.visible = this.traitScan.visible = scan;
    if (scan && c) {
      const m = k.coude[1].localToWorld(V1.set(0, -0.33, 0.05)), bal = Math.sin(this.temps * 9) * c.d * 0.3, y = YR + c.h + 0.004, p = this.faisceau.geometry.attributes.position;
      p.setXYZ(0, m.x, m.y, m.z); p.setXYZ(1, c.x - c.w * 0.42, y, c.z + bal); p.setXYZ(2, c.x + c.w * 0.42, y, c.z + bal); p.needsUpdate = true;
      this.traitScan.scale.set(c.w * 0.84, 0.004, 0.012); this.traitScan.position.set(c.x, y, c.z + bal);
    }
  },

  /* ───────── les dossards viennent chercher leurs colis ───────── */
  partir(o, s0) {
    const p = o.perso, q = auChemin(s0);
    o.etat = "chemin"; o.servi = false; o.seg = q.seg; o.s = s0; p.x = q.x; p.z = q.z; p.cap = q.cap; p.v = s0 > 0 ? 1.4 : 0; p.charge = 0;
    p.racine.visible = true; o.bulle.sp.visible = true; this.sale = true;
  },
  majOps(dt) {
    const file = this.ops.filter(o => o.etat === "chemin" || o.etat === "sort");
    for (const o of this.ops) {
      const p = o.perso; o.t += dt; let geste = false;
      switch (o.etat) {
        case "absent":
          if (o.pile.length && this.temps >= o.debut && !file.some(q => q.s < 1.3)) { this.partir(o, 0); file.push(o); }
          break;
        case "chemin": {
          const but = !o.servi && o.seg === 2 ? [o.x, Z_FILE] : CH[o.seg + 1];
          if (file.some(q => q !== o && q.s > o.s && q.s - o.s < 0.85)) p.v = vers(p.v, 0, dt * 9);        // on garde ses distances dans la file
          else if (p.aller(but[0], but[1], dt, p.charge ? o.vit * 0.88 : o.vit)) {
            if (!o.servi && o.seg === 2) { if (!this.zone.veut && !this.zone.dedans && o.pile.length) o.etat = "entre"; else p.tourner(PI, dt); }
            else if (o.seg >= CH.length - 2) { o.etat = "absent"; p.racine.visible = false; o.bulle.sp.visible = false; for (const c of o.portes) c.retirer(); o.portes = []; p.charge = 0; o.debut = this.temps + 1.5 + this.rnd() * 2; this.sale = true; }
            else o.seg++;
          }
          if (o.etat !== "absent") o.s = o.etat === "entre" ? o.sCase : CUM[o.seg] + Math.hypot(p.x - CH[o.seg][0], p.z - CH[o.seg][1]);
          break;
        }
        case "entre": if (p.aller(o.x, Z_PRISE, dt, 1.2) && p.tourner(PI, dt)) { o.etat = "prise"; o.t = 0; o.aPrendre = o.pile.slice().reverse(); o.pile = []; } break;
        case "prise": {
          geste = true; let fait = true, hy = 0; const L = o.aPrendre;
          L.forEach((c, i) => {
            const u = clamp((o.t - 0.32 - i * 0.2) / 0.3, 0, 1);
            if (!c.enMain) {
              fait = false;
              if (u > 0) {
                if (!c.dep) c.dep = { x: c.x, y: c.y, z: c.z, l: c.lacet };
                const a = p.ancre(V1), e = lisse(u);
                c.x = lerp(c.dep.x, a.x, e); c.z = lerp(c.dep.z, a.z, e); c.y = lerp(c.dep.y, a.y + hy * p.ech, e) + Math.sin(PI * u) * 0.1; c.lacet = lerp(c.dep.l, p.cap, e); c.placer();
                if (u >= 1) { c.enMain = true; p.porte.add(c.g); c.g.position.set(0, hy, 0); c.g.rotation.set(0, (i % 2 ? 1 : -1) * 0.06, 0); o.portes.push(c); p.charge = o.portes.length; }
              }
            }
            hy += c.h;
          });
          p.pose(o.portes.length >= Math.max(1, L.length - 1) ? { eG: -0.4, eD: -0.4, cG: -1.25, cD: -1.25, zG: -0.1, zD: 0.1, dos: -0.03 * L.length } : { eG: -1.02, eD: -1.02, cG: -0.38, cD: -0.38, zG: -0.07, zD: 0.07, dos: 0.34 });
          if (fait && o.t > 0.32 + L.length * 0.2 + 0.35) { o.etat = "attend"; o.aPrendre = null; this.sale = true; }
          break;
        }
        case "attend": if (!file.some(q => q !== o && Math.abs(q.s - o.sCase) < 0.5)) { o.etat = "sort"; o.s = o.sCase; file.push(o); } break;
        case "sort": if (p.aller(o.x, Z_FILE, dt, 1.15)) { o.etat = "chemin"; o.servi = true; } break;
      }
      if (!geste) p.marche(dt);
      p.poser(dt);
      /* la pile tangue dans les bras */
      const kv = clamp(p.v / 1.3, 0, 1); let hp = 0;
      o.portes.forEach((c, i) => { c.g.position.x = Math.sin(p.phase + i * 0.7) * 0.004 * i * kv; c.g.rotation.z = Math.sin(p.phase + i * 0.6) * 0.012 * i * kv; hp += c.h; });
      if (p.racine.visible) o.bulle.en(p.x, Math.max(1.98, 1.16 + hp + 0.16) * p.ech + (o.k % 2 ? 0.4 : 0), p.z);
    }
  },

  majVoyants(dt) {
    const cl = Math.sin(this.temps * 14) > 0, eb = this.eclatBal, ep = this.eclatPoste;
    if (eb && (eb.t -= dt) <= 0) this.eclatBal = null;
    if (ep && (ep.t -= dt) <= 0) this.eclatPoste = null;
    const fb = this.feuBal; allumer(fb.vert, eb && eb.rejet ? 0.05 : 2.6); allumer(fb.rouge, eb && eb.rejet && cl ? 4 : 0.05); allumer(fb.orange, 0.05); allumer(fb.bleu, 1.6);
    this.lumBal.color.setHex(eb && eb.rejet ? 0xff3020 : 0x30ff60); this.lumBal.intensity = vers(this.lumBal.intensity, eb ? (eb.rejet ? 1.5 : 0.7) : 0, dt * 9);
    const fp = this.feuPoste, att = this.rej.some(c => !c.libere) || !!this.poste.colis, err = ep && !ep.ok, ok = ep && ep.ok;
    allumer(fp.bleu, 1.6); allumer(fp.rouge, err && cl ? 4 : 0.05); allumer(fp.orange, att && !err && !ok ? 2.6 : 0.05); allumer(fp.vert, ok || !att ? 2.8 : 0.05);
    this.lumPoste.color.setHex(err ? 0xff3020 : ok ? 0x30ff60 : 0x9dc2ff); this.lumPoste.intensity = vers(this.lumPoste.intensity, err || ok ? 1.1 : 0.55, dt * 8);
  },

  /* ───────── les écrans ───────── */
  dessinerBalance() {
    const e = this.eBal, x = e.x, W = e.w, H = e.h, p = this.dernPesee, rej = p && p.rejet;
    x.fillStyle = "#07101f"; x.fillRect(0, 0, W, H);
    ecrire(x, "BALANCE · POIDS MESURÉ", 18, 34, 20, { g: 500, c: "#BCC8DD", esp: "2px" });
    ecrire(x, p ? kg(p.poids) : "–,––", W - 78, 128, 104, { g: 900, f: F_D, al: "right" }); ecrire(x, "kg", W - 22, 128, 40, { g: 700, f: F_D, al: "right", c: "#BCC8DD" });
    x.fillStyle = !p ? "#22324E" : rej ? "#E0262B" : "#16A34A"; rrect(x, 14, 150, W - 28, 76, 12); x.fill();
    ecrire(x, !p ? "EN ATTENTE" : rej ? `REJET  ${p.ecart > 0 ? "+" : "−"}${kg(Math.abs(p.ecart))} kg` : "CONFORME", W / 2, 190, 46, { g: 900, f: F_D, al: "center", base: "middle", esp: "2px" });
    e.maj();
  },
  dessinerCases() {
    this.E.cases.forEach((e, i) => {
      const x = e.x, W = e.w, H = e.h, o = this.ops[i] || this.vig[i];
      if (!o) { x.fillStyle = "#0b1426"; x.fillRect(0, 0, W, H); x.strokeStyle = "rgba(150,180,240,.25)"; x.lineWidth = 4; x.strokeRect(6, 6, W - 12, H - 12); ecrire(x, "LIBRE", W / 2, H / 2 + 4, 44, { g: 900, f: F_D, al: "center", base: "middle", c: "#51607c", esp: "4px" }); }
      else {
        const d = DOSS[o.d] || DOSS.jaune, enc = o.d === "rouge" ? "#FFFFFF" : "#12151C";
        x.fillStyle = d.css; x.fillRect(0, 0, W, H); x.fillStyle = "rgba(0,0,0,.16)"; x.fillRect(0, H - 62, W, 62);
        ecrire(x, String(o.mat), W / 2, 74, 104, { g: 900, f: F_D, al: "center", base: "middle", c: enc });
        ecrire(x, `×${o.n}`, W / 2, H - 30, 54, { g: 900, f: F_D, al: "center", base: "middle", c: enc });
      }
      e.maj();
    });
  },
  dessinerTV() {
    const e = this.E.tv, x = e.x, W = e.w, H = e.h, c = this.cpt, max = this.rejMax;
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#081226"); g.addColorStop(1, "#050a16"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = "#0e1d3d"; x.fillRect(0, 0, W, 104); x.fillStyle = "#3987E5"; x.fillRect(0, 100, W, 4);
    ecrire(x, "POSTE DE REJET", 40, 76, 70, { g: 900, f: F_D, esp: "3px" });
    ecrire(x, "CONTRÔLE PONDÉRAL · PICK & PACK", 510, 68, 26, { g: 500, c: "#BCC8DD", esp: "3px" });
    const h = new Date(), hh = (this.heure || `${String(h.getHours()).padStart(2, "0")}:${String(h.getMinutes()).padStart(2, "0")}`);
    ecrire(x, hh, W - 40, 76, 62, { g: 900, f: F_D, al: "right", c: "#7DB8FF" });
    const tuile = (i, lab, val, sous, coul) => {
      const x0 = 40 + i * 406, w = 388;
      x.fillStyle = "rgba(150,180,240,.07)"; rrect(x, x0, 128, w, 236, 22); x.fill(); x.strokeStyle = "rgba(150,180,240,.2)"; x.lineWidth = 2; x.stroke();
      x.fillStyle = coul; rrect(x, x0, 128, 10, 236, 5); x.fill();
      ecrire(x, lab, x0 + 34, 176, 27, { g: 500, c: "#BCC8DD", esp: "3px" });
      ecrire(x, fini(val) ? n0(val) : "–", x0 + 34, 304, 142, { g: 900, f: F_D, c: coul });
      ecrire(x, sous, x0 + 34, 344, 24, { g: 400, c: "#8696B0" });
    };
    const nivR = !fini(c.rej) ? "#7DB8FF" : c.rej > max ? "#FF5A5A" : c.rej > max * 0.85 ? "#FAB219" : "#5FDB5F";
    tuile(0, "COLIS PESÉS", c.pese, "depuis le début du poste", "#7DB8FF");
    tuile(1, "REJETS", c.rej, `objectif : ${n0(max)} au maximum`, nivR);
    tuile(2, "ERREURS DÉCELÉES", c.dec, "avant le départ chez le client", "#FF8A8A");
    ecrire(x, "DOSSARDS · COLIS À RÉCUPÉRER AU CONTRÔLE", 40, 424, 27, { g: 500, c: "#BCC8DD", esp: "3px" });
    const L = this.ops, n = Math.max(1, L.length), pw = Math.min(232, (W - 80 - (n - 1) * 14) / n);
    if (!L.length) ecrire(x, "Personne à 3 décelées ou plus : bravo.", 40, 520, 44, { g: 700, c: "#5FDB5F" });
    L.forEach((o, i) => {
      const d = DOSS[o.d], x0 = 40 + i * (pw + 14), enCours = o.etat !== "absent", enc = o.d === "rouge" ? "#FFFFFF" : "#12151C";
      x.fillStyle = d.css; rrect(x, x0, 448, pw, 150, 20); x.fill();
      if (enCours) { x.strokeStyle = "#FFFFFF"; x.lineWidth = 7; x.stroke(); }
      ecrire(x, o.mat, x0 + pw / 2, 512, Math.min(84, pw * 0.5), { g: 900, f: F_D, al: "center", c: enc });
      ecrire(x, `×${o.n}`, x0 + pw / 2, 580, 58, { g: 900, f: F_D, al: "center", c: enc });
      ecrire(x, enCours ? "AU RETRAIT" : o.pile.length ? "APPELÉ" : "À JOUR", x0 + pw / 2, 628, 21, { g: 700, al: "center", c: enCours ? "#FFFFFF" : "#8696B0", esp: "2px" });
    });
    const d = this.dernier;
    x.fillStyle = !d ? "#13213C" : d.ok ? "#14532D" : "#7F1D1D"; x.fillRect(0, H - 62, W, 62);
    ecrire(x, !d ? "Dernier contrôle : en attente du premier colis" : d.ok ? `Dernier contrôle : colis ${d.id} · conforme, réinjecté vers la cercleuse` : `Dernier contrôle : colis ${d.id} · erreur décelée · matricule ${d.mat}`, 40, H - 22, 28, { g: 500 });
    e.maj();
  },
  dessinerMoniteurs() {
    const P = this.poste, c = P.colis, v = P.verdict, G_ = this.E.g, D = this.E.d;
    /* écran gauche : le colis en cours */
    let x = G_.x, W = G_.w, H = G_.h;
    x.fillStyle = "#081226"; x.fillRect(0, 0, W, H); x.fillStyle = "#0e1d3d"; x.fillRect(0, 0, W, 62);
    ecrire(x, "CONTRÔLE DU COLIS", 26, 43, 32, { g: 900, f: F_D, esp: "3px" });
    ecrire(x, c ? `N° ${c.id}` : "", W - 26, 43, 30, { g: 900, f: F_D, al: "right", c: "#7DB8FF" });
    const lecture = P.etat === "scan" && !v, etat = !c ? "EN ATTENTE D'UN REJET" : lecture ? "LECTURE EN COURS…" : !v ? "COLIS REÇU" : v.ok ? "CONFORME · RÉINJECTION" : `ERREUR DÉCELÉE · ${v.op.mat}`;
    const coul = !c ? "#22324E" : lecture || !v ? "#1D4ED8" : v.ok ? "#16A34A" : "#DC2626";
    const col = (i, lab, val, cc) => { const x0 = 26 + i * 250; ecrire(x, lab, x0, 104, 19, { g: 500, c: "#8696B0", esp: "2px" }); ecrire(x, val, x0, 180, 76, { g: 900, f: F_D, c: cc || "#F3F6FB" }); };
    const th = c ? c.poids : null, ec = c ? c.ecart || 0 : null;
    col(0, "POIDS ATTENDU", c ? kg(th) + " kg" : "–");
    col(1, "POIDS MESURÉ", c ? kg(th + ec) + " kg" : "–");
    col(2, "ÉCART", c ? (ec >= 0 ? "+" : "−") + kg(Math.abs(ec)) + " kg" : "–", c ? "#FAB219" : null);
    /* silhouette du colis */
    x.fillStyle = "rgba(150,180,240,.08)"; rrect(x, W - 236, 82, 210, 206, 16); x.fill();
    if (c) { x.fillStyle = "#c9a172"; x.fillRect(W - 196, 150, 130, 86); x.fillStyle = "#b08a5c"; x.fillRect(W - 196, 150, 130, 16); x.fillStyle = "#f7f7f4"; x.fillRect(W - 176, 184, 54, 34); if (lecture) { x.fillStyle = "#ff3b3b"; x.fillRect(W - 206, 150 + ((this.temps * 120) % 86), 150, 3); } }
    x.fillStyle = coul; rrect(x, 26, 316, W - 52, 96, 16); x.fill();
    ecrire(x, etat, W / 2, 366, 56, { g: 900, f: F_D, al: "center", base: "middle", esp: "3px" });
    if (lecture) { x.fillStyle = "rgba(255,255,255,.3)"; x.fillRect(26, 402, (W - 52) * clamp((P.t - 0.25) / 1.05, 0, 1), 10); }
    G_.maj();
    /* écran droit : détail des lignes, rejets par heure */
    x = D.x; W = D.w; H = D.h;
    x.fillStyle = "#081226"; x.fillRect(0, 0, W, H); x.fillStyle = "#0e1d3d"; x.fillRect(0, 0, W, 62);
    ecrire(x, "LIGNES DU COLIS", 26, 43, 32, { g: 900, f: F_D, esp: "3px" }); ecrire(x, "REJETS PAR HEURE", 604, 43, 32, { g: 900, f: F_D, esp: "3px" });
    const refs = ["LEG405821  Prise 2P+T", "SCH219340  Disjoncteur 16 A", "BIZ700118  Collier 200 mm", "NDX554203  Embout 1,5 mm²", "BLI680077  Boîte Ø 67"], s = c ? c.id : 0;
    ecrire(x, "RÉFÉRENCE", 26, 96, 17, { g: 500, c: "#8696B0", esp: "2px" }); ecrire(x, "PRÉVU", 430, 96, 17, { g: 500, c: "#8696B0", al: "right", esp: "2px" }); ecrire(x, "COMPTÉ", 556, 96, 17, { g: 500, c: "#8696B0", al: "right", esp: "2px" });
    for (let i = 0; i < 5; i++) {
      const y = 132 + i * 58, q = 1 + (s + i * 3) % 6, faux = c && v && !v.ok && i === s % 5, vu = c && (v || (lecture && i < (P.t - 0.25) * 5));
      x.fillStyle = faux ? "rgba(220,38,38,.3)" : i % 2 ? "rgba(150,180,240,.05)" : "rgba(150,180,240,.1)"; rrect(x, 18, y - 30, 560, 50, 8); x.fill();
      ecrire(x, c ? refs[(s + i) % 5] : "—", 30, y + 3, 23, { g: 500, c: c ? "#F3F6FB" : "#51607c" });
      ecrire(x, c ? String(q) : "", 430, y + 6, 32, { g: 900, f: F_D, al: "right" });
      ecrire(x, vu ? String(faux ? q - 1 : q) : "", 556, y + 6, 32, { g: 900, f: F_D, al: "right", c: faux ? "#FF8A8A" : "#5FDB5F" });
    }
    const hist = [1, 3, 2, 4, 3, 5, 2, 3], hm = 5, bw = 38;
    hist.forEach((n, i) => { const bh = n / hm * 250, x0 = 612 + i * (bw + 12); x.fillStyle = i === hist.length - 1 ? "#7DB8FF" : "#3987E5"; rrect(x, x0, 372 - bh, bw, bh, 6); x.fill(); ecrire(x, String(6 + i) + "h", x0 + bw / 2, 404, 18, { g: 500, c: "#8696B0", al: "center" }); });
    D.maj();
  },
  majEcrans(dt, force) {
    this.tEcr = (this.tEcr || 0) + dt; this.tTV = (this.tTV || 0) + dt;
    const anim = this.poste.etat === "scan" && !this.poste.verdict;
    if (force || this.sale || (anim && this.tEcr > 0.12)) { this.dessinerMoniteurs(); this.tEcr = 0; }
    if (force || this.sale || this.tTV > 1.5) { this.dessinerTV(); this.tTV = 0; }
    this.sale = false;
  }
};
