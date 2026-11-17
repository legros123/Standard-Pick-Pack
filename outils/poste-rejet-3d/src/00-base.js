/* ════════════════════════════════════════════════════════════════════════════
   Poste de rejet 3D — scène « la qualité » en vraie 3D (three.js embarqué, aucun accès réseau).
   Même contrat que l'ancienne SceneControle : donnees(taux, vigilance), demarrer(), arreter().
   ════════════════════════════════════════════════════════════════════════════ */
const T = window.THREE;
if (T.ColorManagement && "legacyMode" in T.ColorManagement) T.ColorManagement.legacyMode = false;

const PI = Math.PI, TAU = PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, u) => a + (b - a) * u;
const lisse = u => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };
const vers = (a, b, k) => a + (b - a) * clamp(k, 0, 1);
const fini = v => typeof v === "number" && isFinite(v);
function alea(g) { return () => { g |= 0; g = g + 0x6D2B79F5 | 0; let t = Math.imul(g ^ g >>> 15, 1 | g); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const n0 = v => Math.round(v).toLocaleString("fr-FR").replace(/[  ]/g, " ");
const kg = v => v.toFixed(2).replace(".", ",");
const F_D = "'Big Shoulders Display','Arial Narrow','Segoe UI',sans-serif", F_T = "'Lexend','Segoe UI',system-ui,sans-serif";

/* ───────── Implantation (mètres). X = sens de marche du convoyeur, Z = vers l'allée, Y = hauteur ───────── */
const YR = 0.80;                       // plan de roulement
const ZM = -2.0, ZJ = -0.80;           // axe de la ligne principale, axe de la ligne de rejet
const LW = 0.64, PAS = 0.075, RR = 0.025;   // largeur utile, pas et rayon des rouleaux
const X_IN = -17, X_OUT = 17.6;
const X_SCAN = -7.3, X_BAL = -6.2, X_D0 = -5.3, X_D1 = -3.3;   // portique, balance, aiguillage
const X_STOP = 0.45;                   // arrêt des rejets derrière le poste
const X_CA = 7.1, X_CB = 8.25;         // cercleuses (ligne principale, ligne de rejet)
const Z_MUR = -3.3;
const V_LIGNE = 1.1, V_REJ = 0.9;
const TABLE = { x0: 2.15, x1: 6.05, z0: -0.28, z1: 0.36, y: 0.74, pas: 0.54 };
const caseX = k => TABLE.x0 + 0.33 + k * TABLE.pas;
const Z_ALLER = 3.5, Z_RETOUR = 2.72, Z_FILE = 1.5, Z_PRISE = 1.02, X_PORTE = -15.5, X_TOUR = 6.8, X_SORTIE = 1.72;
/* circuit des dossards, à sens unique : allée du fond, file le long de la table, retour par l'allée proche */
const CH = [[X_PORTE, Z_ALLER], [X_TOUR, Z_ALLER], [X_TOUR, Z_FILE], [X_SORTIE, Z_FILE], [X_SORTIE, Z_RETOUR], [X_PORTE, Z_RETOUR]], CUM = [0];
for (let i = 1; i < CH.length; i++) CUM.push(CUM[i - 1] + Math.hypot(CH[i][0] - CH[i - 1][0], CH[i][1] - CH[i - 1][1]));
const sCase = k => CUM[2] + (X_TOUR - caseX(k));
function auChemin(s) { let i = 0; while (i < CH.length - 2 && s > CUM[i + 1]) i++; const u = clamp((s - CUM[i]) / (CUM[i + 1] - CUM[i]), 0, 1); return { seg: i, x: lerp(CH[i][0], CH[i + 1][0], u), z: lerp(CH[i][1], CH[i + 1][1], u), cap: Math.atan2(CH[i + 1][0] - CH[i][0], CH[i + 1][1] - CH[i][1]) }; }

const DOSS = {
  jaune: { css: "#FFD60A", tissu: "#E6E21A", encre: "#141821" },
  orange: { css: "#FF8A1F", tissu: "#FF7A16", encre: "#141821" },
  rouge: { css: "#FF3B3B", tissu: "#EE2D2D", encre: "#FFFFFF" },
  bleu: { css: "#3D8BFF", tissu: "#1E5BD2", encre: "#FFFFFF" }
};

/* ───────── Toiles et textures ───────── */
function toile(w, h, dessin) { const c = document.createElement("canvas"); c.width = w; c.height = h; dessin(c.getContext("2d"), w, h); return c; }
let ANISO = 4;
function texture(c, o = {}) {
  const t = new T.CanvasTexture(c);
  if (!o.lin) t.encoding = T.sRGBEncoding;
  if (o.rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(o.rep[0], o.rep[1]); }
  t.anisotropy = Math.min(ANISO, o.aniso || 8);
  return t;
}
function rrect(x, a, b, w, h, r) { x.beginPath(); if (x.roundRect) x.roundRect(a, b, w, h, r); else x.rect(a, b, w, h); }
function ecrire(x, s, px, py, t, o = {}) {
  x.font = `${o.g || 700} ${t}px ${o.f || F_T}`; x.textAlign = o.al || "left"; x.textBaseline = o.base || "alphabetic";
  if ("letterSpacing" in x) x.letterSpacing = o.esp || "0px";
  x.fillStyle = o.c || "#F3F6FB"; x.fillText(s, px, py);
  if ("letterSpacing" in x) x.letterSpacing = "0px";
}

function texSol() {
  const r = alea(7);
  return texture(toile(512, 512, (x, w, h) => {
    x.fillStyle = "#5f7a6a"; x.fillRect(0, 0, w, h);
    const tache = (px, py, ray, c) => { x.fillStyle = c; for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) { x.beginPath(); x.arc(px + dx, py + dy, ray, 0, TAU); x.fill(); } };
    for (let i = 0; i < 240; i++) tache(r() * w, r() * h, 16 + r() * 70, r() < 0.5 ? "rgba(255,255,255,.022)" : "rgba(8,30,20,.032)");
    for (let i = 0; i < 2400; i++) { x.fillStyle = r() < 0.5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.06)"; x.fillRect(r() * w, r() * h, 1 + r() * 1.6, 1 + r() * 1.6); }
    for (let i = 0; i < 26; i++) { x.strokeStyle = "rgba(20,30,26,.07)"; x.lineWidth = 1 + r() * 2; x.beginPath(); const a = r() * w, b = r() * h; x.moveTo(a, b); x.quadraticCurveTo(a + 60 * (r() - .5), b + 60 * (r() - .5), a + 160 * (r() - .5), b + 160 * (r() - .5)); x.stroke(); }
    x.fillStyle = "rgba(18,38,28,.4)"; x.fillRect(0, 0, w, 2); x.fillRect(0, 0, 2, h);
  }), { rep: [160 / 6, 120 / 6], aniso: 16 });
}
function texBardage() {
  return texture(toile(128, 128, (x, w, h) => {
    for (let i = 0; i < 4; i++) {
      const y0 = i * 32, g = x.createLinearGradient(0, y0, 0, y0 + 32);
      g.addColorStop(0, "#9fa4ab"); g.addColorStop(0.14, "#d9dce0"); g.addColorStop(0.7, "#cfd3d8"); g.addColorStop(0.88, "#a4a9b0"); g.addColorStop(1, "#7d838b");
      x.fillStyle = g; x.fillRect(0, y0, w, 32);
    }
    x.fillStyle = "rgba(0,0,0,.12)"; x.fillRect(0, 0, 1, h);
  }), { rep: [90 / 1.1, 8.2 / 1.0], aniso: 16 });
}
function texVitrage() {
  return texture(toile(128, 128, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#dfeeff"); g.addColorStop(0.5, "#c3dcf8"); g.addColorStop(1, "#9fc0e6");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? "rgba(255,255,255,.10)" : "rgba(30,60,110,.06)"; x.fillRect(i * 8, 0, 4, h); }
    x.fillStyle = "rgba(40,60,100,.55)"; x.fillRect(0, 0, 3, h); x.fillRect(0, 0, w, 3); x.fillRect(0, h - 3, w, 3);
  }), { rep: [90 / 1.25, 1] });
}
function texRouleau() {
  const r = alea(11);
  const t = texture(toile(64, 8, (x, w, h) => {
    x.fillStyle = "#d9dde2"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { x.fillStyle = `rgba(60,70,84,${0.10 + r() * 0.2})`; x.fillRect(r() * w, 0, 1 + r() * 3, h); }
    x.fillStyle = "rgba(255,255,255,.5)"; x.fillRect(20, 0, 5, h);
  }), { rep: [1, 1] });
  return t;
}
function texTapis() {
  return texture(toile(64, 64, (x, w, h) => {
    x.fillStyle = "#1a1c20"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) { x.fillStyle = i % 4 === 0 ? "rgba(255,255,255,.10)" : "rgba(255,255,255,.035)"; x.fillRect(i * 8, 0, 2, h); }
  }), { rep: [6, 1] });
}
function texKraft() {
  const r = alea(3);
  return texture(toile(256, 256, (x, w, h) => {
    x.fillStyle = "#cfa878"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 1500; i++) { x.fillStyle = r() < 0.5 ? "rgba(255,240,215,.06)" : "rgba(90,55,20,.06)"; x.fillRect(r() * w, r() * h, 6 + r() * 26, 1); }
    for (let i = 0; i < 64; i++) { x.fillStyle = "rgba(80,50,20,.035)"; x.fillRect(i * 4, 0, 1, h); }
    x.strokeStyle = "rgba(70,40,10,.22)"; x.lineWidth = 2; x.strokeRect(1, 1, w - 2, h - 2);
  }));
}
function texEtiquette(g) {
  const r = alea(g), code = ["T71B", "A12C", "D05A", "K33F", "B48E"][g % 5];
  return texture(toile(256, 160, (x, w, h) => {
    x.fillStyle = "#f8f8f5"; x.fillRect(0, 0, w, h);
    ecrire(x, "PICK & PACK", 10, 28, 22, { g: 900, f: F_D, c: "#141414" });
    x.fillStyle = "#2a2a2a"; for (let i = 0; i < 4; i++) x.fillRect(10, 40 + i * 13, 70 + r() * 70, 5);
    ecrire(x, code, w - 10, 62, 40, { g: 900, f: F_D, c: "#111", al: "right" });
    ecrire(x, String(100 + Math.floor(r() * 899)), w - 10, 92, 26, { g: 700, f: F_D, c: "#111", al: "right" });
    let px = 10; x.fillStyle = "#0c0c0c";
    while (px < w - 12) { const l = 1 + Math.floor(r() * 4); x.fillRect(px, 104, l, 46); px += l + 1 + Math.floor(r() * 3); }
    x.fillStyle = "#e8742a"; x.fillRect(w - 40, 0, 40, 12);
  }));
}
function texCouvercle() {
  return texture(toile(256, 256, (x, w, h) => {
    x.fillStyle = "#1d1f23"; x.fillRect(0, 0, w, h);
    x.strokeStyle = "rgba(255,255,255,.06)"; x.lineWidth = 2;
    for (let i = 0; i < 26; i++) { x.beginPath(); x.moveTo(0, i * 10 + 3); x.lineTo(w, i * 10 + 3); x.stroke(); }
    x.strokeStyle = "rgba(0,0,0,.9)"; x.lineWidth = 5; x.beginPath(); x.moveTo(0, 128);
    for (let i = 0; i < 8; i++) { const a = i * 32; x.lineTo(a + 6, 128 + (i % 2 ? 36 : -36)); x.lineTo(a + 26, 128 + (i % 2 ? 36 : -36)); x.lineTo(a + 32, 128); }
    x.stroke();
    x.strokeStyle = "rgba(255,255,255,.14)"; x.lineWidth = 3; x.strokeRect(6, 6, w - 12, h - 12);
    x.fillStyle = "#5fb7e8"; x.fillRect(22, 30, 46, 24); x.fillRect(190, 200, 46, 24);
  }));
}
function texRayures(a, b) {
  return texture(toile(64, 64, (x, w, h) => {
    x.fillStyle = a; x.fillRect(0, 0, w, h); x.fillStyle = b;
    for (let i = -2; i < 4; i++) { x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32 + 16, 0); x.lineTo(i * 32 + 16 + 64, 64); x.lineTo(i * 32 + 64, 64); x.closePath(); x.fill(); }
  }), { rep: [8, 1] });
}
function texHachures() {
  return texture(toile(128, 128, (x, w, h) => {
    x.clearRect(0, 0, w, h); x.strokeStyle = "rgba(240,190,0,.85)"; x.lineWidth = 9;
    for (let i = -4; i < 6; i++) { x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32 + 128, 128); x.stroke(); }
  }), { rep: [8.8, 3.1] });
}
function texPieton() {
  return texture(toile(128, 128, (x, w, h) => {
    x.clearRect(0, 0, w, h); x.fillStyle = "#e9b800"; rrect(x, 4, 4, 120, 120, 16); x.fill();
    x.fillStyle = "#3d4a44"; x.beginPath(); x.arc(64, 30, 11, 0, TAU); x.fill();
    x.lineCap = "round"; x.strokeStyle = "#3d4a44"; x.lineWidth = 11;
    const l = (a, b, c, d) => { x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.stroke(); };
    l(64, 46, 62, 78); l(62, 78, 46, 108); l(62, 78, 80, 106); l(64, 50, 44, 66); l(64, 50, 86, 62);
  }));
}
function texClavier() {
  return texture(toile(128, 48, (x, w, h) => {
    x.fillStyle = "#17191d"; x.fillRect(0, 0, w, h); x.fillStyle = "#2d3138";
    for (let j = 0; j < 5; j++) for (let i = 0; i < 15; i++) x.fillRect(4 + i * 8, 4 + j * 8.2, 6.2, 6.2);
    x.fillStyle = "#3b4048"; x.fillRect(36, 37, 46, 6.2);
  }));
}
function texHaloSol() {
  return texture(toile(128, 128, (x, w, h) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, "rgba(255,250,235,1)"); g.addColorStop(0.45, "rgba(255,248,230,.42)"); g.addColorStop(1, "rgba(255,245,225,0)"); x.fillStyle = g; x.fillRect(0, 0, w, h); }));
}
function texPanneau(l, h, dessin) { return texture(toile(l, h, dessin)); }

/* gilet : u = tour du buste (devant à 0,25 ; dos à 0,75), v = hauteur */
function texTorse(o) {
  const d = DOSS[o.d] || DOSS.jaune;
  return texture(toile(512, 256, (x, w, h) => {
    const Y = v => h * (1 - v);
    x.fillStyle = o.polo || "#1b2a4a"; x.fillRect(0, 0, w, h);
    x.fillStyle = o.pantalon || "#232a3a"; x.fillRect(0, Y(0.07), w, h);
    x.fillStyle = d.tissu; x.fillRect(0, Y(0.9), w, Y(0.09) - Y(0.9));
    const g = x.createLinearGradient(0, Y(0.9), 0, Y(0.09)); g.addColorStop(0, "rgba(255,255,255,.10)"); g.addColorStop(1, "rgba(0,0,0,.14)");
    x.fillStyle = g; x.fillRect(0, Y(0.9), w, Y(0.09) - Y(0.9));
    /* encolure en V devant, ronde derrière */
    x.fillStyle = o.polo || "#1b2a4a";
    x.beginPath(); x.moveTo(128 - 44, Y(0.92)); x.lineTo(128, Y(0.66)); x.lineTo(128 + 44, Y(0.92)); x.closePath(); x.fill();
    x.beginPath(); x.ellipse(384, Y(0.92), 40, 22, 0, 0, TAU); x.fill();
    /* emmanchures */
    for (const cx of [0, 256, 512]) { x.beginPath(); x.ellipse(cx, Y(0.78), 34, 46, 0, 0, TAU); x.fill(); }
    /* bandes rétro-réfléchissantes */
    const bande = (a, b, ww, hh) => { const gg = x.createLinearGradient(0, b, 0, b + hh); gg.addColorStop(0, "#9aa1aa"); gg.addColorStop(0.5, "#f1f4f7"); gg.addColorStop(1, "#a3a9b2"); x.fillStyle = gg; x.fillRect(a, b, ww, hh); };
    bande(0, Y(0.32), w, 15); bande(0, Y(0.2), w, 15);
    const vert = cx => { const gg = x.createLinearGradient(cx - 8, 0, cx + 8, 0); gg.addColorStop(0, "#9aa1aa"); gg.addColorStop(0.5, "#f1f4f7"); gg.addColorStop(1, "#a3a9b2"); x.fillStyle = gg; x.fillRect(cx - 8, Y(0.9), 16, Y(0.32) - Y(0.9)); };
    for (const cx of [128 - 62, 128 + 62, 384 - 62, 384 + 62]) vert(cx);
    /* numéro de dossard : poitrine et dos */
    if (o.num) {
      const s = String(o.num), td = s.length > 4 ? 50 : 62;
      ecrire(x, s, 384, Y(0.5), td, { g: 900, f: F_D, c: d.encre, al: "center", base: "middle" });
      ecrire(x, s, 128, Y(0.47), 34, { g: 900, f: F_D, c: d.encre, al: "center", base: "middle" });
    }
    if (o.titre) {
      ecrire(x, o.titre, 384, Y(0.52), 30, { g: 900, f: F_D, c: d.encre, al: "center", base: "middle", esp: "2px" });
      ecrire(x, "QUALITÉ", 128, Y(0.47), 17, { g: 900, f: F_D, c: d.encre, al: "center", base: "middle", esp: "1px" });
    }
  }));
}

/* ───────── Géométries partagées ───────── */
const G = {};
function geometries() {
  G.box = new T.BoxGeometry(1, 1, 1);
  G.cyl = new T.CylinderGeometry(1, 1, 1, 18);
  G.cylR = new T.CylinderGeometry(1, 1, 1, 12);
  G.cyl8 = new T.CylinderGeometry(1, 1, 1, 8);
  G.plan = new T.PlaneGeometry(1, 1);
  G.sph = new T.SphereGeometry(1, 16, 12);
  /* personnages (1,76 m) */
  G.cuisse = new T.CapsuleGeometry(0.07, 0.30, 4, 12).translate(0, -0.21, 0);
  G.tibia = new T.CapsuleGeometry(0.052, 0.30, 4, 12).translate(0, -0.21, 0);
  G.pied = new T.CapsuleGeometry(0.052, 0.15, 4, 10).rotateX(PI / 2).scale(1, 0.82, 1).translate(0, -0.435, 0.06);
  G.bras = new T.CapsuleGeometry(0.046, 0.20, 4, 10).translate(0, -0.135, 0);
  G.avbras = new T.CapsuleGeometry(0.039, 0.19, 4, 10).translate(0, -0.125, 0);
  G.main = new T.SphereGeometry(0.046, 10, 8).scale(0.78, 1.15, 1).translate(0, -0.285, 0);
  G.bassin = new T.SphereGeometry(1, 14, 10).scale(0.185, 0.12, 0.128);
  const pts = [[0.001, -0.045], [0.13, -0.04], [0.166, 0.0], [0.172, 0.1], [0.186, 0.26], [0.202, 0.37], [0.192, 0.43], [0.14, 0.478], [0.07, 0.502], [0.05, 0.52], [0.001, 0.525]].map(p => new T.Vector2(p[0], p[1]));
  G.torse = new T.LatheGeometry(pts, 28).rotateY(-PI / 2).scale(1, 1, 0.68);
  { const p = G.torse.attributes.position, uv = G.torse.attributes.uv; for (let i = 0; i < p.count; i++) uv.setY(i, (p.getY(i) + 0.045) / 0.57); G.torse.computeVertexNormals(); }
  G.cou = new T.CylinderGeometry(0.046, 0.054, 0.1, 10);
  G.tete = new T.SphereGeometry(0.112, 18, 14).scale(0.93, 1.06, 1.0);
  G.cheveux = new T.SphereGeometry(0.119, 18, 10, 0, TAU, 0, PI * 0.5).scale(0.95, 1.07, 1.03).rotateX(-0.28);
  G.casquette = new T.SphereGeometry(0.121, 18, 10, 0, TAU, 0, PI * 0.42).scale(0.96, 1.05, 1.04).rotateX(-0.1);
  G.visiere = new T.CylinderGeometry(0.1, 0.1, 0.012, 14, 1, false, -PI / 2, PI).scale(0.95, 1, 1.05);
  G.oeil = new T.SphereGeometry(0.0125, 8, 6);
  G.nez = new T.SphereGeometry(0.017, 8, 6);
  G.tore = new T.TorusGeometry(1, 0.06, 8, 28);
}
/* bac tronconique (fond plus étroit que le haut) */
function geoBac(lh, ph, lb, pb, h) {
  const g = new T.BoxGeometry(1, 1, 1), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const haut = p.getY(i) > 0; p.setXYZ(i, p.getX(i) * (haut ? lh : lb), (p.getY(i) + 0.5) * h, p.getZ(i) * (haut ? ph : pb)); }
  g.computeVertexNormals(); return g;
}
function plaqueArrondie(l, p, e, r) {
  const s = new T.Shape(), a = l / 2, b = p / 2;
  s.moveTo(-a + r, -b); s.lineTo(a - r, -b); s.quadraticCurveTo(a, -b, a, -b + r); s.lineTo(a, b - r); s.quadraticCurveTo(a, b, a - r, b);
  s.lineTo(-a + r, b); s.quadraticCurveTo(-a, b, -a, b - r); s.lineTo(-a, -b + r); s.quadraticCurveTo(-a, -b, -a + r, -b);
  return new T.ExtrudeGeometry(s, { depth: e - 0.008, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 6 }).rotateX(PI / 2).translate(0, -0.004, 0);
}

/* ───────── Kit : pièces fixes regroupées par matière (une seule passe de dessin par matière) ───────── */
class Kit {
  constructor() { this.bo = new Map(); this.cy = new Map(); this.m = new T.Matrix4(); this.q = new T.Quaternion(); this.e = new T.Euler(); this.p = new T.Vector3(); this.s = new T.Vector3(); }
  _aj(map, mat) { let a = map.get(mat); if (!a) map.set(mat, a = []); a.push(new T.Matrix4().compose(this.p, this.q, this.s)); }
  box(mat, x, y, z, w, h, d, ry = 0, rx = 0, rz = 0) { this.p.set(x, y, z); this.q.setFromEuler(this.e.set(rx, ry, rz)); this.s.set(w, h, d); this._aj(this.bo, mat); }
  ext(mat, x0, x1, y0, y1, z0, z1) { this.box(mat, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)); }
  cyl(mat, x, y, z, r, len, axe = "y") { this.p.set(x, y, z); this.q.setFromEuler(this.e.set(axe === "z" ? PI / 2 : 0, 0, axe === "x" ? PI / 2 : 0)); this.s.set(r, len, r); this._aj(this.cy, mat); }
  tube(mat, a, b, r) {
    const d = new T.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), l = d.length();
    this.p.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); this.q.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); this.s.set(r, l, r); this._aj(this.cy, mat);
  }
  poser(parent, o = {}) {
    const un = (map, geo) => { for (const [mat, l] of map) { const im = new T.InstancedMesh(geo, mat, l.length); l.forEach((m, i) => im.setMatrixAt(i, m)); im.castShadow = o.ombre !== false; im.receiveShadow = true; im.frustumCulled = false; im.matrixAutoUpdate = false; parent.add(im); } };
    un(this.bo, G.box); un(this.cy, o.fin ? G.cyl : G.cylR);
  }
}

/* ───────── Rendu : ombres, reflet du sol, halo des sources lumineuses, tons filmiques ───────── */
const VS_PLEIN = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
const FS_SEUIL = `uniform sampler2D tSrc; uniform vec2 uTx; uniform float uSeuil; varying vec2 vUv;
void main(){
  vec3 c = texture2D(tSrc, vUv + uTx * vec2(-1., -1.)).rgb + texture2D(tSrc, vUv + uTx * vec2(1., -1.)).rgb + texture2D(tSrc, vUv + uTx * vec2(-1., 1.)).rgb + texture2D(tSrc, vUv + uTx * vec2(1., 1.)).rgb;
  c = min(c * 0.25, vec3(24.0));
  float b = max(c.r, max(c.g, c.b)), k = max(b - uSeuil, 0.0) / max(b, 1e-4);
  gl_FragColor = vec4(c * k, 1.0);
}`;
const FS_REDUIT = `uniform sampler2D tSrc; uniform vec2 uTx; varying vec2 vUv;
void main(){
  vec3 c = texture2D(tSrc, vUv).rgb * 4.0;
  c += texture2D(tSrc, vUv + uTx * vec2(-1., -1.)).rgb + texture2D(tSrc, vUv + uTx * vec2(1., -1.)).rgb + texture2D(tSrc, vUv + uTx * vec2(-1., 1.)).rgb + texture2D(tSrc, vUv + uTx * vec2(1., 1.)).rgb;
  c += (texture2D(tSrc, vUv + uTx * vec2(-2., 0.)).rgb + texture2D(tSrc, vUv + uTx * vec2(2., 0.)).rgb + texture2D(tSrc, vUv + uTx * vec2(0., -2.)).rgb + texture2D(tSrc, vUv + uTx * vec2(0., 2.)).rgb) * 0.5;
  gl_FragColor = vec4(c / 10.0, 1.0);
}`;
const FS_AGRANDI = `uniform sampler2D tBas; uniform sampler2D tHaut; uniform vec2 uTx; uniform float uK; varying vec2 vUv;
void main(){
  vec3 s = texture2D(tBas, vUv).rgb * 4.0;
  s += (texture2D(tBas, vUv + uTx * vec2(-1., 0.)).rgb + texture2D(tBas, vUv + uTx * vec2(1., 0.)).rgb + texture2D(tBas, vUv + uTx * vec2(0., -1.)).rgb + texture2D(tBas, vUv + uTx * vec2(0., 1.)).rgb) * 2.0;
  s += texture2D(tBas, vUv + uTx * vec2(-1., -1.)).rgb + texture2D(tBas, vUv + uTx * vec2(1., -1.)).rgb + texture2D(tBas, vUv + uTx * vec2(-1., 1.)).rgb + texture2D(tBas, vUv + uTx * vec2(1., 1.)).rgb;
  gl_FragColor = vec4(texture2D(tHaut, vUv).rgb + s / 16.0 * uK, 1.0);
}`;
const FS_FINAL = `uniform sampler2D tScene; uniform sampler2D tHalo; uniform float uHalo; uniform float uExpo; uniform float uVig; uniform float uT; uniform float uNoir; varying vec2 vUv;
vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
void main(){
  vec3 c = texture2D(tScene, vUv).rgb + texture2D(tHalo, vUv).rgb * uHalo;
  vec2 q = vUv - 0.5; c *= 1.0 - uVig * smoothstep(0.12, 0.62, dot(q, q) * 1.35);
  c = aces(c * uExpo);
  c = mix(c, vec3(dot(c, vec3(0.299, 0.587, 0.114))), -0.08);
  c = pow(c, vec3(1.0 / 2.2)) * (1.0 - uNoir);
  float n = fract(sin(dot(gl_FragCoord.xy + uT * 61.0, vec2(12.9898, 78.233))) * 43758.5453);
  gl_FragColor = vec4(c + (n - 0.5) / 255.0, 1.0);
}`;

/* la carte graphique sait-elle dessiner dans une image en demi-flottants ? (sinon : rendu direct, sans halo ni reflet) */
function sondeHDR(r) {
  const gl = r.getContext(); let ok = false;
  try {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, 4, 4, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.bindTexture(gl.TEXTURE_2D, null); gl.deleteFramebuffer(f); gl.deleteTexture(t);
  } catch (e) { ok = false; }
  r.resetState(); return ok;
}

class Rendu {
  constructor(sc) {
    this.sc = sc; const r = this.r = sc.renderer;
    this.hdr = r.capabilities.isWebGL2 && (r.extensions.has("EXT_color_buffer_float") || r.extensions.has("EXT_color_buffer_half_float")) && sondeHDR(r);
    this.halo = this.hdr; this.reflet = this.hdr;
    this.cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)); g.setAttribute("uv", new T.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    this.plein = new T.Mesh(g, null); this.plein.frustumCulled = false; this.sp = new T.Scene(); this.sp.add(this.plein);
    const sm = (fs, u) => new T.ShaderMaterial({ vertexShader: VS_PLEIN, fragmentShader: fs, uniforms: u, depthTest: false, depthWrite: false, toneMapped: false });
    this.mSeuil = sm(FS_SEUIL, { tSrc: { value: null }, uTx: { value: new T.Vector2() }, uSeuil: { value: 1.12 } });
    this.mReduit = sm(FS_REDUIT, { tSrc: { value: null }, uTx: { value: new T.Vector2() } });
    this.mAgrandi = sm(FS_AGRANDI, { tBas: { value: null }, tHaut: { value: null }, uTx: { value: new T.Vector2() }, uK: { value: 1 } });
    this.mFinal = sm(FS_FINAL, { tScene: { value: null }, tHalo: { value: null }, uHalo: { value: 0.6 }, uExpo: { value: 0.95 }, uVig: { value: 0.55 }, uT: { value: 0 }, uNoir: { value: 0 } });
    this.camR = new T.PerspectiveCamera(); this.matR = new T.Matrix4();
    this.vide = new T.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); this.vide.needsUpdate = true;
    this.rt = null; this.A = []; this.B = []; this.rtR = null;
    this.mode();
  }
  mode() {
    const r = this.r;
    r.toneMapping = this.halo ? T.NoToneMapping : T.ACESFilmicToneMapping; r.toneMappingExposure = this.halo ? 1 : 1.05;
    r.outputEncoding = T.sRGBEncoding;
  }
  liberer() { for (const t of [this.rt, this.rtR, ...this.A, ...this.B]) if (t) t.dispose(); this.rt = this.rtR = null; this.A = []; this.B = []; }
  taille(w, h, pr) {
    const r = this.r; r.setPixelRatio(pr); r.setSize(w, h, false);
    const W = Math.max(2, Math.round(w * pr)), H = Math.max(2, Math.round(h * pr));
    this.W = W; this.H = H; this.liberer();
    const o = { type: T.HalfFloatType, minFilter: T.LinearFilter, magFilter: T.LinearFilter, generateMipmaps: false };
    if (this.halo) {
      this.rt = new T.WebGLRenderTarget(W, H, Object.assign({ samples: Math.min(4, r.capabilities.maxSamples || 0) }, o));
      for (let i = 0; i < 5; i++) { const a = Math.max(2, W >> (i + 1)), b = Math.max(2, H >> (i + 1)); this.A.push(new T.WebGLRenderTarget(a, b, Object.assign({ depthBuffer: false }, o))); this.B.push(new T.WebGLRenderTarget(a, b, Object.assign({ depthBuffer: false }, o))); }
    }
    if (this.reflet) this.rtR = new T.WebGLRenderTarget(Math.max(2, W >> 1), Math.max(2, H >> 1), o);
  }
  passe(mat, cible) { this.plein.material = mat; this.r.setRenderTarget(cible); this.r.render(this.sp, this.cam); }
  image(scene, cam, t) {
    const r = this.r, sc = this.sc, uS = sc.uSol;
    r.shadowMap.needsUpdate = true;
    if (this.reflet && this.rtR) {
      /* caméra miroir sous le sol */
      const c = this.camR, P = cam.position, V = sc.vise;
      c.position.set(P.x, -P.y, P.z); c.up.set(0, -1, 0); c.lookAt(V.x, -V.y, V.z);
      c.near = cam.near; c.far = cam.far; c.updateMatrixWorld(); c.matrixWorldInverse.copy(c.matrixWorld).invert(); c.projectionMatrix.copy(cam.projectionMatrix); c.projectionMatrixInverse.copy(cam.projectionMatrixInverse);
      this.matR.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(c.projectionMatrix).multiply(c.matrixWorldInverse);
      sc.sol.visible = false; sc.grBulles.visible = false; if (sc.grSol) sc.grSol.visible = false;
      r.setRenderTarget(this.rtR); r.clear(); r.render(scene, c);
      sc.sol.visible = true; sc.grBulles.visible = true; if (sc.grSol) sc.grSol.visible = true;
      uS.tReflet.value = this.rtR.texture; uS.uMatR.value.copy(this.matR); uS.uReflet.value = sc.forceReflet;
    } else { uS.tReflet.value = this.vide; uS.uReflet.value = 0; }
    if (!this.halo) { r.setRenderTarget(null); r.render(scene, cam); return; }
    r.setRenderTarget(this.rt); r.render(scene, cam);
    const A = this.A, B = this.B;
    this.mSeuil.uniforms.tSrc.value = this.rt.texture; this.mSeuil.uniforms.uTx.value.set(0.5 / A[0].width, 0.5 / A[0].height); this.passe(this.mSeuil, A[0]);
    for (let i = 1; i < 5; i++) { this.mReduit.uniforms.tSrc.value = A[i - 1].texture; this.mReduit.uniforms.uTx.value.set(1 / A[i - 1].width, 1 / A[i - 1].height); this.passe(this.mReduit, A[i]); }
    let bas = A[4];
    for (let i = 3; i >= 0; i--) { const u = this.mAgrandi.uniforms; u.tBas.value = bas.texture; u.tHaut.value = A[i].texture; u.uTx.value.set(1 / bas.width, 1 / bas.height); u.uK.value = 1.0; this.passe(this.mAgrandi, B[i]); bas = B[i]; }
    const f = this.mFinal.uniforms; f.tScene.value = this.rt.texture; f.tHalo.value = B[0].texture; f.uT.value = t % 10; f.uNoir.value = sc.noir || 0;
    this.passe(this.mFinal, null);
  }
}

/* le sol reflète la scène : on greffe le reflet sur la matière standard */
function grefferReflet(mat, u) {
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nuniform mat4 uMatR; varying vec4 vRefl;")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvRefl = uMatR * (modelMatrix * vec4(transformed, 1.0));");
    const greffe = `{
      vec2 ruv = vRefl.xy / max(vRefl.w, 1e-4);
      vec2 e = vec2(0.0035, 0.006);
      vec3 rc = texture2D(tReflet, ruv).rgb * 0.36 + texture2D(tReflet, ruv + vec2(e.x, 0.)).rgb * 0.12 + texture2D(tReflet, ruv - vec2(e.x, 0.)).rgb * 0.12 + texture2D(tReflet, ruv + vec2(0., e.y)).rgb * 0.14 + texture2D(tReflet, ruv - vec2(0., e.y)).rgb * 0.14 + texture2D(tReflet, ruv + vec2(0., e.y * 2.2)).rgb * 0.06 + texture2D(tReflet, ruv - vec2(0., e.y * 2.2)).rgb * 0.06;
      float ndv = clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0);
      float fr = 0.07 + 0.93 * pow(1.0 - ndv, 3.2);
      float grain = 0.72 + 0.56 * diffuseColor.g;
      outgoingLight += rc * fr * uReflet * grain;
    }`;
    const cle = sh.fragmentShader.indexOf("#include <output_fragment>") >= 0 ? "#include <output_fragment>" : "#include <opaque_fragment>";
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform sampler2D tReflet; uniform float uReflet; varying vec4 vRefl;").replace(cle, greffe + "\n" + cle);
  };
}

/* panneau de ciel pour les reflets des métaux : une halle sombre et ses rampes lumineuses */
function ambiance(renderer) {
  const s = new T.Scene(), b = c => { const m = new T.MeshBasicMaterial({ side: T.BackSide }); m.color.setRGB(c[0], c[1], c[2]); return m; };
  s.add(new T.Mesh(new T.BoxGeometry(40, 16, 40), [b([0.05, 0.06, 0.08]), b([0.05, 0.06, 0.08]), b([0.035, 0.04, 0.05]), b([0.07, 0.1, 0.08]), b([0.16, 0.19, 0.24]), b([0.04, 0.05, 0.07])]));
  const lm = new T.MeshBasicMaterial(); lm.color.setRGB(11, 11.4, 12.5);
  for (const z of [-9, -3, 3, 9]) { const l = new T.Mesh(new T.BoxGeometry(26, 0.1, 0.5), lm); l.position.set(0, 7.5, z); s.add(l); }
  const vm = new T.MeshBasicMaterial(); vm.color.setRGB(1.5, 1.9, 2.5);
  const v = new T.Mesh(new T.BoxGeometry(34, 2.2, 0.1), vm); v.position.set(0, 2.5, -19.5); s.add(v);
  const p = new T.PMREMGenerator(renderer), t = p.fromScene(s, 0.035).texture; p.dispose(); return t;
}
