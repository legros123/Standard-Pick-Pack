/* ════════════════════════════════════════════════════════════════════
   SCÈNE 3D DU FLUX PICK & PACK (Three.js)
   Préparation → convoyeur → contrôle → aiguillage → expédition / rejet.
   Les colis animés illustrent le débit agrégé : aucune localisation
   individuelle n'est simulée. Textes et chiffres restent dans la couche
   HTML, nette, au-dessus du canevas.
   ════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { texCarton, texTapis, texSol, texHalo } from './textures.js';
import {
  Y_TAPIS, LARGEUR_TAPIS, X_COLLECTEUR, Z_LIGNE, X_PORTIQUE, X_AIGUILLAGE, X_FIN_EXPE, TABLE_REJET,
  POSTES, RAYONNAGES, QUAIS, PALETTES, ZONES_PLAN, BORNES, COLLECTEUR, AMENEES, EXPE, REJET, Trajet, route,
} from './plan.js';

const COUL = {
  conforme: new THREE.Color(0x20d69d),
  vigilance: new THREE.Color(0xffb43a),
  critique: new THREE.Color(0xff4d5f),
  indisponible: new THREE.Color(0x5d6d84),
  cyan: new THREE.Color(0x3cd6ff),
};
const FOND = 0x050b17;
const VITESSE = 1.1;                    // m/s, vitesse visuelle du tapis
const ECART = 1.05;                     // m, écart minimal entre deux colis
const MAX_COLIS = 150;

const QUALITES = {
  haute: { budget: 3.6e6, bloom: true, ombres: 2048, msaa: 4 },
  moyenne: { budget: 2.1e6, bloom: false, ombres: 1024, msaa: 0 },
  basse: { budget: 1.0e6, bloom: false, ombres: 0, msaa: 0 },
};
const PALIERS_AUTO = [
  { q: 'haute', echelle: 1 },
  { q: 'haute', echelle: 0.8 },
  { q: 'moyenne', echelle: 0.85 },
  { q: 'moyenne', echelle: 0.65 },
  { q: 'basse', echelle: 0.7 },
  { q: 'basse', echelle: 0.5 },
];

const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function webglDisponible() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
  } catch {
    return false;
  }
}

/* ─────────── géométries le long d'une polyligne ─────────── */
function normales(pts) {
  const n = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const p = pts[i];
    const t1 = i > 0 ? [p[0] - a[0], p[1] - a[1]] : [b[0] - p[0], b[1] - p[1]];
    const t2 = i < pts.length - 1 ? [b[0] - p[0], b[1] - p[1]] : t1;
    const l1 = Math.hypot(...t1) || 1;
    const l2 = Math.hypot(...t2) || 1;
    const n1 = [-t1[1] / l1, t1[0] / l1];
    const n2 = [-t2[1] / l2, t2[0] / l2];
    let m = [n1[0] + n2[0], n1[1] + n2[1]];
    const lm = Math.hypot(...m) || 1;
    m = [m[0] / lm, m[1] / lm];
    const k = 1 / Math.max(0.4, m[0] * n1[0] + m[1] * n1[1]);
    n.push([m[0] * k, m[1] * k]);
  }
  return n;
}

function distances(pts, depart = 0) {
  const d = [depart];
  for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return d;
}

/** Bande horizontale (dessus du tapis, liserés lumineux). UV : u travers, v = mètres. */
function ruban(pts, decal, largeur, y, depart = 0) {
  const n = normales(pts);
  const d = distances(pts, depart);
  const pos = [];
  const uv = [];
  const idx = [];
  pts.forEach((p, i) => {
    const cx = p[0] + n[i][0] * decal;
    const cz = p[1] + n[i][1] * decal;
    pos.push(cx - n[i][0] * largeur / 2, y, cz - n[i][1] * largeur / 2, cx + n[i][0] * largeur / 2, y, cz + n[i][1] * largeur / 2);
    uv.push(0, d[i], 1, d[i]);
    if (i) { const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  if (g.attributes.normal.array[1] < 0) { g.setIndex(idx.map((v, i) => idx[i - (i % 3) + [0, 2, 1][i % 3]])); g.computeVertexNormals(); }
  return g;
}

/** Paroi verticale le long de la polyligne. */
function paroi(pts, decal, y0, y1) {
  const n = normales(pts);
  const d = distances(pts);
  const pos = [];
  const uv = [];
  const idx = [];
  pts.forEach((p, i) => {
    const x = p[0] + n[i][0] * decal;
    const z = p[1] + n[i][1] * decal;
    pos.push(x, y0, z, x, y1, z);
    uv.push(d[i], 0, d[i], 1);
    if (i) { const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* ─────────── matériau des liserés de flux (shader) ─────────── */
function materiauFlux() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    clipping: true,
    uniforms: {
      uTemps: { value: 0 },
      uCouleur: { value: COUL.cyan.clone() },
      uIntensite: { value: 1 },
      uVague: { value: -100 },
      uVagueCouleur: { value: COUL.conforme.clone() },
      uActif: { value: 1 },
    },
    vertexShader: `#include <clipping_planes_pars_vertex>
      varying vec2 vUv;
      void main(){ vUv = uv; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mvPosition;
      #include <clipping_planes_vertex>
      }`,
    fragmentShader: `
      #include <clipping_planes_pars_fragment>
      uniform float uTemps; uniform vec3 uCouleur; uniform float uIntensite; uniform float uVague; uniform vec3 uVagueCouleur; uniform float uActif;
      varying vec2 vUv;
      void main(){
        #include <clipping_planes_fragment>
        float d = vUv.y;
        float f = fract((d - uTemps * ${VITESSE.toFixed(2)}) / 1.6);
        float tiret = smoothstep(0.0, 0.06, f) * (1.0 - smoothstep(0.22, 0.42, f)) * uActif;
        float bord = 1.0 - abs(vUv.x - 0.5) * 1.6;
        float a = (0.22 + tiret * 1.1) * bord;
        float w = exp(-pow((d - uVague) / 1.4, 2.0));
        vec3 c = mix(uCouleur, uVagueCouleur, clamp(w * 1.6, 0.0, 1.0));
        a += w * 2.2 * bord;
        gl_FragColor = vec4(c * a * uIntensite, 1.0);
      }`,
  });
}

export class Scene3D {
  constructor(canvas, conteneur, { surZone, surCamera, surQualite }) {
    this.canvas = canvas;
    this.conteneur = conteneur;
    this.surZone = surZone;
    this.surCamera = surCamera;
    this.surQualite = surQualite;
    this.tAnim = 0;
    this.animNiveau = 'plein';
    this.mode = 'exploitation';
    this.actifRendu = true;
    this.zoneActive = null;
    this.etats = {};
    this.flux = { actif: true, cadence: 0.7, taux: 0.03, attente: 6, production: 0 };
    this.qualiteChoix = 'auto';
    this.palier = 0;
    this.perf = { n: 0, somme: 0, t0: 0, fps: 0, bas: 0, haut: 0, dernierChangement: 0 };
    this.impulsions = [];
    this.vague = null;
    this.particules = null;
    this.revelation = null;
    this.derive = 0;
  }

  init() {
    const r = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance', stencil: false });
    if (!r.capabilities.isWebGL2) throw new Error('WebGL2 indisponible');
    this.r = r;
    r.setClearColor(FOND, 1);
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.05;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    this.canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.perdu = true; this.surQualite?.({ perdu: true }); });

    const s = new THREE.Scene();
    this.s = s;
    s.background = new THREE.Color(FOND); // gestion des couleurs correcte aussi via le post-traitement
    s.fog = new THREE.Fog(FOND, 34, 74);
    const pmrem = new THREE.PMREMGenerator(r);
    s.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    s.environmentIntensity = 0.32;
    pmrem.dispose();

    this.cam = new THREE.PerspectiveCamera(26, 1, 0.5, 220);
    this.dir = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(51), THREE.MathUtils.degToRad(15));
    this.cible = new THREE.Vector3(0.6, 0, 0.4);
    this.camVue = { cible: this.cible.clone(), dist: 50 };

    this.lumieres();
    this.textures = { carton: texCarton(r.capabilities.getMaxAnisotropy() > 4 ? 4 : 2), tapis: texTapis(), sol: texSol(Math.min(8, r.capabilities.getMaxAnisotropy())), halo: texHalo() };
    this.mat = {
      cadre: new THREE.MeshStandardMaterial({ color: 0x1a2537, metalness: 0.75, roughness: 0.4, side: THREE.DoubleSide }),
      garde: new THREE.MeshStandardMaterial({ color: 0xb4c3d4, metalness: 0.9, roughness: 0.28, side: THREE.DoubleSide }),
      tapis: new THREE.MeshStandardMaterial({ color: 0xffffff, map: this.textures.tapis, metalness: 0.1, roughness: 0.75 }),
      pied: new THREE.MeshStandardMaterial({ color: 0x2a3648, metalness: 0.7, roughness: 0.45 }),
      carton: new THREE.MeshStandardMaterial({ color: 0xffffff, map: this.textures.carton, roughness: 0.82, metalness: 0 }),
      graphite: new THREE.MeshStandardMaterial({ color: 0x1b2638, metalness: 0.6, roughness: 0.42 }),
      acier: new THREE.MeshStandardMaterial({ color: 0x8fa2b8, metalness: 0.85, roughness: 0.3 }),
      bleu: new THREE.MeshStandardMaterial({ color: 0x1d4f8f, metalness: 0.55, roughness: 0.42 }),
      bois: new THREE.MeshStandardMaterial({ color: 0x6d5236, metalness: 0, roughness: 0.9 }),
      flux: materiauFlux(),
    };
    this.mat.tapis.map.repeat.set(1, 1);

    this.racine = new THREE.Group();
    s.add(this.racine);
    this.construireSol();
    this.construireRayonnages();
    this.construirePostes();
    this.construireConvoyeurs();
    this.construirePortique();
    this.construireAiguillage();
    this.construireRejet();
    this.construireExpedition();
    this.construireZones();
    this.construireColis();
    this.ancres = Object.fromEntries(Object.entries(ZONES_PLAN).map(([id, z]) => [id, new THREE.Vector3(...z.ancre)]));

    this.ombresMeshes();
    this.ecouteurs();
    this.appliquerQualite(true);
    this.redimensionner();
    this.prechauffer(30);
    this.horloge = performance.now();
    this.boucle = this.boucle.bind(this);
    this.relancer();
    return true;
  }

  /* ─────────── éclairage ─────────── */
  lumieres() {
    const s = this.s;
    s.add(new THREE.HemisphereLight(0x9cd2ff, 0x060a12, 0.6));
    const d = new THREE.DirectionalLight(0xe8f5ff, 2.5);
    d.position.set(-9, 22, 13);
    d.target.position.set(1, 0, 0);
    d.castShadow = true;
    d.shadow.bias = -0.0004;
    d.shadow.normalBias = 0.03;
    const c = d.shadow.camera;
    c.left = -22; c.right = 22; c.top = 16; c.bottom = -16; c.near = 4; c.far = 60;
    s.add(d, d.target);
    this.soleil = d;
    const contre = new THREE.DirectionalLight(0x3cd6ff, 0.55);
    contre.position.set(14, 8, -16);
    s.add(contre);
    this.lumiereControle = new THREE.PointLight(0x3cd6ff, 7, 7, 1.8);
    this.lumiereControle.position.set(X_PORTIQUE, 2.4, Z_LIGNE);
    s.add(this.lumiereControle);
  }

  construireSol() {
    const t = this.textures.sol;
    t.repeat.set(12, 12);
    const sol = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color: 0xffffff, map: t, roughness: 0.72, metalness: 0.2 }));
    sol.rotation.x = -Math.PI / 2;
    sol.position.set(0, 0, 0);
    sol.receiveShadow = true;
    this.racine.add(sol);
    // allée piétonne : marquage blanc discontinu le long de la ligne principale
    const g = new THREE.PlaneGeometry(0.6, 0.12);
    const m = new THREE.MeshBasicMaterial({ color: 0x9fb3c8, transparent: true, opacity: 0.35 });
    const inst = new THREE.InstancedMesh(g, m, 40);
    const o = new THREE.Object3D();
    let i = 0;
    for (let x = -4.0; x < 12; x += 1.1) {
      o.position.set(x, 0.006, Z_LIGNE + 1.55);
      o.rotation.set(-Math.PI / 2, 0, 0);
      o.updateMatrix();
      inst.setMatrixAt(i++, o.matrix);
    }
    inst.count = i;
    this.racine.add(inst);
  }

  /* ─────────── préparation : rayonnages à palettes, cartons ─────────── */
  construireRayonnages() {
    const R = RAYONNAGES;
    const L = (R.x1 - R.x0) / R.travees;
    const montants = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, R.hauteur, 0.09), this.mat.bleu, R.rangees.length * (R.travees + 1) * 2);
    const lisses = new THREE.InstancedMesh(new THREE.BoxGeometry(L - 0.1, 0.1, 0.06), this.mat.acier, R.rangees.length * R.travees * R.niveaux.length * 2);
    const plateaux = new THREE.InstancedMesh(new THREE.BoxGeometry(L - 0.12, 0.03, R.profondeur - 0.1), this.mat.graphite, R.rangees.length * R.travees * (R.niveaux.length - 1));
    const cartons = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), this.mat.carton, 400);
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    let im = 0; let il = 0; let ip = 0; let ic = 0;
    let graine = 7;
    const al = () => { graine = (graine * 16807) % 2147483647; return graine / 2147483647; };
    for (const z of R.rangees) {
      for (let t = 0; t <= R.travees; t++) {
        for (const dz of [-R.profondeur / 2, R.profondeur / 2]) {
          o.position.set(R.x0 + t * L, R.hauteur / 2, z + dz);
          o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1); o.updateMatrix();
          montants.setMatrixAt(im++, o.matrix);
        }
      }
      for (let t = 0; t < R.travees; t++) {
        const xc = R.x0 + (t + 0.5) * L;
        R.niveaux.forEach((y, n) => {
          for (const dz of [-R.profondeur / 2, R.profondeur / 2]) {
            o.position.set(xc, y + 0.05, z + dz); o.scale.set(1, 1, 1); o.updateMatrix();
            lisses.setMatrixAt(il++, o.matrix);
          }
          if (n > 0) { o.position.set(xc, y + 0.1, z); o.updateMatrix(); plateaux.setMatrixAt(ip++, o.matrix); }
          if (n === R.niveaux.length - 1) return;
          let x = xc - L / 2 + 0.15;
          while (x < xc + L / 2 - 0.4 && ic < 400) {
            const w = 0.35 + al() * 0.4;
            const h = 0.3 + al() * 0.42;
            const p = 0.5 + al() * 0.35;
            if (x + w > xc + L / 2 - 0.1) break;
            if (al() > 0.18) {
              o.position.set(x + w / 2, y + 0.115 + h / 2, z + (al() - 0.5) * 0.1);
              o.rotation.set(0, (al() - 0.5) * 0.08, 0);
              o.scale.set(w, h, p);
              o.updateMatrix();
              cartons.setMatrixAt(ic, o.matrix);
              cartons.setColorAt(ic, c.setHSL(0.08, 0.25 + al() * 0.15, 0.62 + al() * 0.22));
              ic++;
            }
            x += w + 0.06;
          }
        });
      }
    }
    cartons.count = ic;
    [montants, lisses, plateaux, cartons].forEach((m) => { m.castShadow = true; m.receiveShadow = true; this.racine.add(m); });
    this.revelables = [montants, lisses, plateaux, cartons];
  }

  construirePostes() {
    const tableG = new THREE.BoxGeometry(0.9, 0.08, 1.2);
    const piedG = new THREE.BoxGeometry(0.06, 0.82, 0.06);
    const ecranG = new THREE.PlaneGeometry(0.42, 0.26);
    this.ecrans = [];
    POSTES.forEach((p) => {
      const g = new THREE.Group();
      const table = new THREE.Mesh(tableG, this.mat.graphite);
      table.position.set(0, 0.86, 0);
      g.add(table);
      for (const [dx, dz] of [[-0.4, -0.55], [0.4, -0.55], [-0.4, 0.55], [0.4, 0.55]]) {
        const pd = new THREE.Mesh(piedG, this.mat.pied);
        pd.position.set(dx, 0.41, dz);
        g.add(pd);
      }
      const ecran = new THREE.Mesh(ecranG, new THREE.MeshBasicMaterial({ color: COUL.cyan.clone().multiplyScalar(1.6), toneMapped: false }));
      ecran.position.set(-0.3, 1.18, 0.35);
      ecran.rotation.y = Math.PI / 2;
      g.add(ecran);
      this.ecrans.push(ecran);
      // scanner / poste : petite colonne
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.36, 0.08), this.mat.acier);
      col.position.set(-0.3, 1.0, 0.35);
      g.add(col);
      g.position.set(p.x - 0.1, 0, p.z);
      g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
      this.racine.add(g);
      // chariot de préparation dans l'allée
      const ch = new THREE.Group();
      const caisse = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 0.6), this.mat.graphite);
      caisse.position.y = 0.55;
      const bac = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.32, 0.4), this.mat.carton);
      bac.position.set(-0.2, 0.96, 0);
      const poignee = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.55), this.mat.acier);
      poignee.position.set(0.58, 0.95, 0);
      ch.add(caisse, bac, poignee);
      ch.position.set(p.x - 3.4 - (p.z + 3) * 0.6, 0, p.z);
      ch.traverse((m) => { if (m.isMesh) { m.castShadow = true; } });
      this.racine.add(ch);
    });
  }

  /* ─────────── convoyeurs : châssis, bande, garde-corps, liserés lumineux ─────────── */
  troncon(pts, depart) {
    const W = LARGEUR_TAPIS;
    const g = new THREE.Group();
    const bande = new THREE.Mesh(ruban(pts, 0, W, Y_TAPIS, 0), this.mat.tapis);
    bande.receiveShadow = true;
    const cg = new THREE.Mesh(paroi(pts, -W / 2 - 0.01, 0.55, Y_TAPIS + 0.01), this.mat.cadre);
    const cd = new THREE.Mesh(paroi(pts, W / 2 + 0.01, 0.55, Y_TAPIS + 0.01), this.mat.cadre);
    const gg = new THREE.Mesh(paroi(pts, -W / 2 - 0.04, Y_TAPIS - 0.02, Y_TAPIS + 0.14), this.mat.garde);
    const gd = new THREE.Mesh(paroi(pts, W / 2 + 0.04, Y_TAPIS - 0.02, Y_TAPIS + 0.14), this.mat.garde);
    const lg = new THREE.Mesh(ruban(pts, -W / 2 - 0.04, 0.05, Y_TAPIS + 0.142, depart), this.mat.flux);
    const ld = new THREE.Mesh(ruban(pts, W / 2 + 0.04, 0.05, Y_TAPIS + 0.142, depart), this.mat.flux);
    [cg, cd, gg, gd].forEach((m) => { m.castShadow = true; m.receiveShadow = true; });
    g.add(bande, cg, cd, gg, gd, lg, ld);
    this.racine.add(g);
    // pieds
    const tr = new Trajet(pts);
    const n = new THREE.Vector3();
    const p = { x: 0, z: 0, cap: 0 };
    for (let d = 0.4; d < tr.longueur; d += 1.5) {
      tr.a(d, p);
      n.set(Math.cos(p.cap), 0, -Math.sin(p.cap));
      for (const s of [-1, 1]) this.pieds.push([p.x + n.x * s * (W / 2 - 0.05), p.z + n.z * s * (W / 2 - 0.05)]);
    }
  }

  construireConvoyeurs() {
    this.pieds = [];
    AMENEES.forEach((pts) => this.troncon(pts, 0));
    this.troncon(COLLECTEUR, 3.0);
    this.troncon(EXPE, 3.0 + new Trajet(COLLECTEUR).longueur);
    this.troncon(REJET, 3.0 + new Trajet(COLLECTEUR).longueur);
    const pieds = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.55, 8), this.mat.pied, this.pieds.length);
    const o = new THREE.Object3D();
    this.pieds.forEach(([x, z], i) => { o.position.set(x, 0.275, z); o.updateMatrix(); pieds.setMatrixAt(i, o.matrix); });
    pieds.castShadow = true;
    this.racine.add(pieds);
    // table à rouleaux en fin de ligne expédition
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, LARGEUR_TAPIS + 0.2), this.mat.graphite);
    fin.position.set(X_FIN_EXPE + 0.25, Y_TAPIS - 0.03, Z_LIGNE);
    fin.castShadow = true;
    this.racine.add(fin);
    // trajets des colis
    this.routes = [0, 1, 2].map((k) => new Trajet(route(k)));
    this.trajetExpe = new Trajet(EXPE);
    this.trajetRejet = new Trajet(REJET);
    const zCommun = Z_LIGNE - 1.5;
    this.versCommun = POSTES.map((p) => (X_COLLECTEUR - (p.x + 0.55)) + (zCommun - p.z));
  }

  construirePortique() {
    const g = new THREE.Group();
    const lx = 1.5;
    const lz = LARGEUR_TAPIS + 0.75;
    const h = 2.05;
    const pil = new THREE.BoxGeometry(0.16, h, 0.16);
    for (const dx of [-lx / 2, lx / 2]) for (const dz of [-lz / 2, lz / 2]) {
      const m = new THREE.Mesh(pil, this.mat.graphite);
      m.position.set(dx, h / 2, dz);
      g.add(m);
    }
    const toit = new THREE.Mesh(new THREE.BoxGeometry(lx + 0.24, 0.28, lz + 0.24), this.mat.graphite);
    toit.position.y = h + 0.1;
    g.add(toit);
    const verre = new THREE.MeshStandardMaterial({ color: 0x0c2236, metalness: 0.2, roughness: 0.15, transparent: true, opacity: 0.38, depthWrite: false, side: THREE.DoubleSide });
    for (const dz of [-lz / 2, lz / 2]) {
      const v = new THREE.Mesh(new THREE.PlaneGeometry(lx - 0.16, 1.05), verre);
      v.position.set(0, Y_TAPIS + 0.68, dz);
      g.add(v);
    }
    // arêtes lumineuses
    const neon = new THREE.MeshBasicMaterial({ color: COUL.cyan.clone().multiplyScalar(2.4), toneMapped: false });
    for (const dz of [-lz / 2 - 0.085, lz / 2 + 0.085]) {
      const a = new THREE.Mesh(new THREE.BoxGeometry(lx + 0.2, 0.035, 0.035), neon);
      a.position.set(0, h - 0.02, dz);
      g.add(a);
      for (const dx of [-lx / 2, lx / 2]) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.035, h - 0.2, 0.035), neon);
        b.position.set(dx + (dx < 0 ? -0.085 : 0.085), h / 2, dz);
        g.add(b);
      }
    }
    // nappe de balayage (scanner)
    const nappe = new THREE.Mesh(new THREE.PlaneGeometry(lz - 0.1, 1.1), new THREE.MeshBasicMaterial({
      map: this.textures.halo, color: COUL.cyan.clone().multiplyScalar(1.5), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide,
    }));
    nappe.rotation.y = Math.PI / 2;
    nappe.position.y = Y_TAPIS + 0.62;
    g.add(nappe);
    this.nappe = nappe;
    // plateau de pesée
    const pesee = new THREE.Mesh(new THREE.BoxGeometry(lx - 0.2, 0.05, LARGEUR_TAPIS + 0.06), this.mat.acier);
    pesee.position.y = Y_TAPIS - 0.01;
    g.add(pesee);
    g.position.set(X_PORTIQUE, 0, Z_LIGNE);
    g.traverse((m) => { if (m.isMesh && m.material !== neon && m !== nappe && m.material !== verre) { m.castShadow = true; m.receiveShadow = true; } });
    this.racine.add(g);
    this.portique = g;
  }

  construireAiguillage() {
    const g = new THREE.Group();
    const socle = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.0, 0.4), this.mat.graphite);
    socle.position.set(0, 0.5, 0);
    g.add(socle);
    const bras = new THREE.Group();
    const lame = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.16, 0.06), this.mat.acier);
    lame.position.set(-0.5, 0, 0);
    bras.add(lame);
    const liseré = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.03, 0.065), new THREE.MeshBasicMaterial({ color: COUL.cyan.clone().multiplyScalar(2), toneMapped: false }));
    liseré.position.set(-0.5, 0.06, 0);
    bras.add(liseré);
    bras.position.set(0, Y_TAPIS + 0.1, 0);
    g.add(bras);
    g.position.set(X_AIGUILLAGE + 0.15, 0, Z_LIGNE + LARGEUR_TAPIS / 2 + 0.3);
    g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
    this.racine.add(g);
    this.bras = bras;
    this.brasAngle = 0;
    this.brasCible = 0;
  }

  construireRejet() {
    const T = TABLE_REJET;
    const plateau = new THREE.Mesh(new THREE.BoxGeometry(T.l, 0.08, T.p), this.mat.acier);
    plateau.position.set(T.x, 0.78, T.z);
    const caisson = new THREE.Mesh(new THREE.BoxGeometry(T.l - 0.1, 0.72, T.p - 0.1), this.mat.graphite);
    caisson.position.set(T.x, 0.37, T.z);
    [plateau, caisson].forEach((m) => { m.castShadow = true; m.receiveShadow = true; this.racine.add(m); });
    // file d'attente au rejet : colis posés sur la table (nombre = donnée « en attente »)
    this.fileRejet = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 2, 0.06), this.mat.carton, 24);
    this.fileRejet.castShadow = true;
    this.fileRejet.count = 0;
    this.racine.add(this.fileRejet);
  }

  construireExpedition() {
    // palettes
    this.palettes = PALETTES.map((p) => {
      const pal = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.14, 1.0), this.mat.bois);
      pal.position.set(p.x, 0.07, p.z);
      pal.castShadow = true; pal.receiveShadow = true;
      this.racine.add(pal);
      return { ...p, n: 0 };
    });
    this.colisPalette = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 2, 0.06), this.mat.carton, 48);
    this.colisPalette.castShadow = true;
    this.colisPalette.count = 0;
    this.racine.add(this.colisPalette);
    // quais : portiques, niveleurs, remorques
    const poteau = new THREE.BoxGeometry(0.24, 3.2, 0.24);
    const linteau = new THREE.BoxGeometry(0.3, 0.32, 2.9);
    const lumiere = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xdff4ff).multiplyScalar(2.2), toneMapped: false });
    QUAIS.forEach((q, i) => {
      for (const dz of [-1.35, 1.35]) {
        const m = new THREE.Mesh(poteau, this.mat.graphite);
        m.position.set(q.x, 1.6, q.z + dz);
        m.castShadow = true;
        this.racine.add(m);
      }
      const l = new THREE.Mesh(linteau, this.mat.graphite);
      l.position.set(q.x, 3.25, q.z);
      l.castShadow = true;
      this.racine.add(l);
      const bande = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 2.4), lumiere);
      bande.position.set(q.x - 0.17, 3.05, q.z);
      this.racine.add(bande);
      const porte = new THREE.Mesh(new THREE.PlaneGeometry(2.46, 0.9), new THREE.MeshStandardMaterial({ color: 0x223146, metalness: 0.5, roughness: 0.5, side: THREE.DoubleSide }));
      porte.rotation.y = -Math.PI / 2;
      porte.position.set(q.x + 0.05, 2.62, q.z);
      this.racine.add(porte);
      const niveleur = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 2.1), this.mat.acier);
      niveleur.position.set(q.x - 0.9, 0.03, q.z);
      niveleur.receiveShadow = true;
      this.racine.add(niveleur);
      if (i < 2) {
        const rem = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.7, 2.45), new THREE.MeshStandardMaterial({ color: 0x2a3444, metalness: 0.45, roughness: 0.55 }));
        rem.position.set(q.x + 1.55, 1.65, q.z);
        rem.castShadow = true;
        this.racine.add(rem);
      }
    });
  }

  /* ─────────── zones : dalles, contours d'état, colonnes lumineuses ─────────── */
  construireZones() {
    this.zones = {};
    const fillG = new THREE.PlaneGeometry(1, 1);
    for (const [id, z] of Object.entries(ZONES_PLAN)) {
      const [x0, x1, z0, z1] = z.rect;
      const w = x1 - x0;
      const p = z1 - z0;
      const g = new THREE.Group();
      g.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
      const couleur = COUL.cyan.clone();
      const matFill = new THREE.MeshBasicMaterial({ color: couleur, transparent: true, opacity: 0.045, depthWrite: false, toneMapped: false });
      const fill = new THREE.Mesh(fillG, matFill);
      fill.rotation.x = -Math.PI / 2;
      fill.scale.set(w, p, 1);
      fill.position.y = 0.008;
      g.add(fill);
      const matBord = new THREE.MeshBasicMaterial({ color: couleur.clone().multiplyScalar(1.3), transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false });
      const matCoin = new THREE.MeshBasicMaterial({ color: couleur.clone().multiplyScalar(2.4), toneMapped: false });
      const bord = (lx, lz, x, zz, m) => {
        const b = new THREE.Mesh(fillG, m);
        b.rotation.x = -Math.PI / 2;
        b.scale.set(lx, lz, 1);
        b.position.set(x, 0.012, zz);
        g.add(b);
      };
      bord(w, 0.05, 0, -p / 2, matBord); bord(w, 0.05, 0, p / 2, matBord);
      bord(0.05, p, -w / 2, 0, matBord); bord(0.05, p, w / 2, 0, matBord);
      const c = Math.min(1.1, w * 0.18, p * 0.18);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        bord(c, 0.12, sx * (w / 2 - c / 2), sz * p / 2, matCoin);
        bord(0.12, c, sx * w / 2, sz * (p / 2 - c / 2), matCoin);
      }
      // colonne lumineuse (andon) : vert / ambre / rouge — position = signification
      const andon = new THREE.Group();
      const mat = (hex) => new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: 0.08, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.92 });
      const mat3 = { conforme: mat(0x20d69d), vigilance: mat(0xffb43a), critique: mat(0xff4d5f) };
      const mat0 = new THREE.MeshStandardMaterial({ color: 0x2a3648, metalness: 0.7, roughness: 0.4 });
      const lampeG = new THREE.CylinderGeometry(0.12, 0.12, 0.2, 16);
      const fut = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.1, 8), mat0);
      fut.position.y = 1.05;
      andon.add(fut);
      ['conforme', 'vigilance', 'critique'].forEach((k, i) => {
        const l = new THREE.Mesh(lampeG, mat3[k]);
        l.position.y = 2.68 - i * 0.22;
        andon.add(l);
      });
      const chapeau = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 16), mat0);
      chapeau.position.y = 2.82;
      andon.add(chapeau);
      andon.position.set(w / 2 - 0.35, 0, -p / 2 + 0.35);
      andon.traverse((m) => { if (m.isMesh) m.castShadow = true; });
      g.add(andon);
      // volume de sélection (invisible)
      const vol = new THREE.Mesh(new THREE.BoxGeometry(w, z.hauteur, p), new THREE.MeshBasicMaterial({ visible: false }));
      vol.position.y = z.hauteur / 2;
      vol.userData.zone = id;
      g.add(vol);
      // anneau d'impulsion (nouvelle alerte)
      const anneau = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 72), new THREE.MeshBasicMaterial({ color: couleur.clone().multiplyScalar(2), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
      anneau.rotation.x = -Math.PI / 2;
      anneau.position.y = 0.02;
      g.add(anneau);
      this.racine.add(g);
      this.zones[id] = { g, matFill, matBord, matCoin, mat3, vol, anneau, rayon: Math.max(w, p) * 0.62, etat: 'indisponible', survol: false };
    }
    this.volumes = Object.values(this.zones).map((z) => z.vol);
  }

  /* ─────────── colis instanciés ─────────── */
  construireColis() {
    this.colisMesh = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 2, 0.06), this.mat.carton, MAX_COLIS);
    this.colisMesh.castShadow = true;
    this.colisMesh.receiveShadow = true;
    this.colisMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.colisMesh.count = 0;
    this.colisMesh.frustumCulled = false;
    this.racine.add(this.colisMesh);
    this.colisMesh.setColorAt(0, new THREE.Color(1, 1, 1));
    this.colis = [];
    this.attenteSpawn = 0;
    this.dernierCommun = -10;
    this.dernierParRoute = [-10, -10, -10];
    this.accRejet = 0;
    this.tourRoute = 0;
    this.horlogeFlux = 0;
    this._o = new THREE.Object3D();
    this._c = new THREE.Color();
    this._p = { x: 0, z: 0, cap: 0 };
  }

  majColis(dt) {
    const F = this.flux;
    const v = F.actif ? VITESSE : 0;
    this.horlogeFlux += dt * (F.actif ? 1 : 0);
    // apparition : ordonnancement pour garder l'écart à la jonction des amenées
    if (F.actif && F.cadence > 0) {
      this.attenteSpawn -= dt;
      if (this.attenteSpawn <= 0 && this.colis.length < MAX_COLIS - 2) {
        const k = [0, 2, 1, 0, 1, 2][this.tourRoute % 6];
        const tCommun = this.horlogeFlux + this.versCommun[k] / VITESSE;
        if (tCommun - this.dernierCommun >= ECART / VITESSE && this.horlogeFlux - this.dernierParRoute[k] >= ECART / VITESSE) {
          const t = 0.85 + ((this.tourRoute * 37) % 10) / 33;
          this.colis.push({ r: k, d: 0, br: 0, d2: 0, sx: 0.56 * t, sy: 0.4 * (0.85 + ((this.tourRoute * 13) % 7) / 18), sz: 0.5 * t, teinte: 0.9 + ((this.tourRoute * 7) % 5) / 25, alpha: 1 });
          this.dernierCommun = tCommun;
          this.dernierParRoute[k] = this.horlogeFlux;
          this.tourRoute++;
          this.attenteSpawn = 1 / F.cadence;
          this.ecrans[k].material.color.copy(COUL.cyan).multiplyScalar(3.2);
        } else {
          this.tourRoute++;
          this.attenteSpawn = 0.05;
        }
      }
    }
    this.ecrans.forEach((e) => e.material.color.lerp(this._c.copy(COUL.cyan).multiplyScalar(1.4), Math.min(1, dt * 3)));
    // déplacement
    const garder = [];
    for (const c of this.colis) {
      if (c.br === 0) {
        c.d += v * dt;
        const L = this.routes[c.r].longueur;
        if (c.d >= L) {
          this.accRejet += F.taux;
          if (this.accRejet >= 1) { this.accRejet -= 1; c.br = 2; this.brasCible = 1; this.brasT = 0.7; } else c.br = 1;
          c.d2 = c.d - L;
        }
      } else {
        c.d2 += v * dt;
        const tr = c.br === 1 ? this.trajetExpe : this.trajetRejet;
        if (c.d2 >= tr.longueur) {
          if (c.br === 1) this.deposerPalette();
          continue;
        }
      }
      garder.push(c);
    }
    this.colis = garder;
    if (this.brasT > 0) { this.brasT -= dt; if (this.brasT <= 0) this.brasCible = 0; }
    this.brasAngle = lerp(this.brasAngle, this.brasCible, Math.min(1, dt * 9));
    this.bras.rotation.y = -this.brasAngle * 0.6;
    this.ecrireColis();
  }

  ecrireColis() {
    const o = this._o;
    const p = this._p;
    let i = 0;
    for (const c of this.colis) {
      if (c.br === 0) this.routes[c.r].a(c.d, p);
      else (c.br === 1 ? this.trajetExpe : this.trajetRejet).a(c.d2, p);
      o.position.set(p.x, Y_TAPIS + c.sy / 2 + 0.005, p.z);
      o.rotation.set(0, p.cap, 0);
      o.scale.set(c.sz, c.sy, c.sx);
      o.updateMatrix();
      this.colisMesh.setMatrixAt(i, o.matrix);
      const rej = c.br === 2 ? Math.min(1, c.d2 / 1.2) : 0;
      this._c.setRGB(c.teinte, c.teinte, c.teinte).lerp(COUL.vigilance, rej * 0.55);
      this.colisMesh.setColorAt(i, this._c);
      i++;
    }
    this.colisMesh.count = i;
    this.colisMesh.instanceMatrix.needsUpdate = true;
    if (this.colisMesh.instanceColor) this.colisMesh.instanceColor.needsUpdate = true;
  }

  deposerPalette() {
    const pal = this.palettes[this.palIndex || 0];
    pal.n += 1;
    if (pal.n > 24) { pal.n = 0; this.palIndex = ((this.palIndex || 0) + 1) % this.palettes.length; }
    this.ecrirePalettes();
  }

  ecrirePalettes() {
    const o = this._o;
    let i = 0;
    this.palettes.forEach((pal) => {
      for (let k = 0; k < Math.min(24, pal.n); k++) {
        const couche = Math.floor(k / 8);
        const j = k % 8;
        o.position.set(pal.x - 0.42 + (j % 4) * 0.28, 0.14 + 0.17 + couche * 0.34, pal.z - 0.23 + Math.floor(j / 4) * 0.46);
        o.rotation.set(0, 0, 0);
        o.scale.set(0.27, 0.33, 0.44);
        o.updateMatrix();
        this.colisPalette.setMatrixAt(i++, o.matrix);
      }
    });
    this.colisPalette.count = i;
    this.colisPalette.instanceMatrix.needsUpdate = true;
  }

  ecrireFileRejet(n) {
    const T = TABLE_REJET;
    const o = this._o;
    const m = Math.min(24, Math.max(0, Math.round(n || 0)));
    for (let k = 0; k < m; k++) {
      const couche = Math.floor(k / 12);
      const j = k % 12;
      o.position.set(T.x - T.l / 2 + 0.3 + (j % 4) * 0.58, 0.82 + 0.17 + couche * 0.35, T.z - T.p / 2 + 0.3 + Math.floor(j / 4) * 0.55);
      o.rotation.set(0, ((k * 37) % 9 - 4) * 0.03, 0);
      o.scale.set(0.46, 0.33, 0.4);
      o.updateMatrix();
      this.fileRejet.setMatrixAt(k, o.matrix);
      this.fileRejet.setColorAt(k, this._c.setRGB(1, 0.92, 0.82));
    }
    this.fileRejet.count = m;
    this.fileRejet.instanceMatrix.needsUpdate = true;
    if (this.fileRejet.instanceColor) this.fileRejet.instanceColor.needsUpdate = true;
  }

  /** Simule quelques dizaines de secondes pour présenter un convoyeur déjà en charge (y compris à l'arrêt). */
  prechauffer(secondes) {
    const actif = this.flux.actif;
    this.flux.actif = true;
    for (let t = 0; t < secondes; t += 0.05) this.majColis(0.05);
    this.flux.actif = actif;
    this.palettes[0].n = 14;
    this.palettes[1].n = 6;
    this.ecrirePalettes();
  }

  ombresMeshes() {
    this.racine.traverse((m) => { if (m.isMesh && m.material === this.mat.carton) m.castShadow = true; });
  }

  /* ─────────── états, flux, événements ─────────── */
  majEtats(zones) {
    for (const [id, z] of Object.entries(this.zones)) {
      const etat = zones?.[id]?.etat || 'indisponible';
      z.etat = etat;
      const c = etat === 'conforme' ? COUL.cyan : COUL[etat];
      const forte = etat === 'critique' || etat === 'vigilance';
      z.matFill.color.copy(c);
      z.matFill.opacity = forte ? 0.085 : etat === 'indisponible' ? 0.02 : 0.04;
      z.matBord.color.copy(c).multiplyScalar(forte ? 1.8 : 1.1);
      z.matBord.opacity = etat === 'indisponible' ? 0.3 : forte ? 0.9 : 0.5;
      z.matCoin.color.copy(c).multiplyScalar(forte ? 3.2 : etat === 'indisponible' ? 0.8 : 2.2);
      for (const [k, m] of Object.entries(z.mat3)) m.emissiveIntensity = k === etat ? 3.2 : 0.06;
    }
    this.demander();
  }

  majFlux({ actif, debit, taux, attente }) {
    const cadence = debit !== null && debit !== undefined ? Math.max(0.22, Math.min(1.5, (debit / 180) * 0.9)) : 0.7;
    this.flux.actif = !!actif;
    this.flux.cadence = cadence;
    this.flux.taux = Math.max(0, Math.min(0.5, taux ?? 0.03));
    this.flux.attente = attente;
    this.mat.flux.uniforms.uActif.value = actif ? 1 : 0.15;
    this.ecrireFileRejet(attente);
    this.demander();
  }

  impulsion(zoneId, niveau) {
    const z = this.zones[zoneId];
    if (!z) return;
    z.anneau.material.color.copy(COUL[niveau] || COUL.cyan).multiplyScalar(2.4);
    this.impulsions.push({ z, t: 0, duree: this.animNiveau === 'plein' ? 2.6 : 6, statique: this.animNiveau !== 'plein' });
    this.demander();
  }

  celebrer() {
    if (this.animNiveau !== 'plein') {
      for (const z of Object.values(this.zones)) z.mat3.conforme.emissiveIntensity = 4;
      setTimeout(() => this.majEtats(Object.fromEntries(Object.entries(this.zones).map(([k, z]) => [k, { etat: z.etat }]))), 3000);
      this.demander();
      return;
    }
    this.vague = { t: 0 };
    const n = 220;
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3);
    const vit = [];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 1.6;
      pos.set([14.0 + Math.cos(a) * r, 0.6 + Math.random() * 0.6, 4.6 + Math.sin(a) * r], i * 3);
      vit.push([Math.cos(a) * (0.6 + Math.random()), 2.4 + Math.random() * 2.6, Math.sin(a) * (0.6 + Math.random())]);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ map: this.textures.halo, color: COUL.conforme.clone().multiplyScalar(2.2), size: 0.42, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
    if (this.particules) { this.s.remove(this.particules.p); this.particules.p.geometry.dispose(); }
    const p = new THREE.Points(g, m);
    this.s.add(p);
    this.particules = { p, vit, t: 0 };
  }

  /* ─────────── caméra ─────────── */
  ajuster(bornes, marge = { h: 0.13, b: 0.1, g: 0.05, d: 0.05 }, cible) {
    const coins = [];
    for (const x of [bornes.x0, bornes.x1]) for (const y of [0, bornes.y1]) for (const z of [bornes.z0, bornes.z1]) coins.push(new THREE.Vector3(x, y, z));
    const cam = this.cam.clone();
    let lo = 4;
    let hi = 160;
    const v = new THREE.Vector3();
    for (let it = 0; it < 26; it++) {
      const mid = (lo + hi) / 2;
      cam.position.copy(cible).addScaledVector(this.dir, mid);
      cam.lookAt(cible);
      cam.updateMatrixWorld();
      cam.updateProjectionMatrix();
      const ok = coins.every((c) => {
        v.copy(c).project(cam);
        return v.x > -1 + marge.g * 2 && v.x < 1 - marge.d * 2 && v.y > -1 + marge.b * 2 && v.y < 1 - marge.h * 2;
      });
      if (ok) hi = mid; else lo = mid;
    }
    return hi;
  }

  vueGenerale(instantane = false) {
    this.zoneActive = null;
    this.masque = 0;
    this.cam.clearViewOffset();
    const marge = this.mode === 'immersion' ? { h: 0.1, b: 0.04, g: 0.16, d: 0.16 } : { h: 0.12, b: 0.05, g: 0.015, d: 0.015 };
    const cible = new THREE.Vector3((BORNES.x0 + BORNES.x1) / 2, 0, (BORNES.z0 + BORNES.z1) / 2);
    const dist = this.ajuster(BORNES, marge, cible);
    this.allerVers(cible, dist, instantane);
    Object.values(this.zones).forEach((z) => { z.survol = false; });
  }

  /** Rapprochement sur une zone ; `masque` = largeur (px) du canevas cachée à droite par le panneau de détail. */
  zoomZone(id, instantane = false, masque = this.masque || 0) {
    const z = ZONES_PLAN[id];
    if (!z) return;
    this.zoneActive = id;
    this.masque = masque;
    const { w, h } = this.taille || { w: 1, h: 1 };
    if (masque > 0 && masque < w * 0.7) this.cam.setViewOffset(w + masque, h, masque, 0, w, h);
    else this.cam.clearViewOffset();
    const [x0, x1, z0, z1] = z.rect;
    const cible = new THREE.Vector3((x0 + x1) / 2, 0.6, (z0 + z1) / 2);
    const fr = masque > 0 && masque < w * 0.7 ? masque / w : 0;
    const dist = this.ajuster({ x0: x0 - 1.2, x1: x1 + 1.2, z0: z0 - 1.2, z1: z1 + 1.2, y1: z.hauteur + 0.6 }, { h: 0.2, b: 0.1, g: 0.06, d: 0.06 + fr / 2 }, cible);
    this.allerVers(cible, dist, instantane);
  }

  allerVers(cible, dist, instantane) {
    const dep = { cible: this.camVue.cible.clone(), dist: this.camVue.dist };
    this.camVue = { cible: cible.clone(), dist };
    if (instantane || this.animNiveau !== 'plein' || !this.camPrete) {
      this.tween = null;
      this.placerCamera(cible, dist);
      this.camPrete = true;
      this.demander();
      return;
    }
    this.tween = { dep, arr: { cible, dist }, t: 0, duree: 0.75 };
    this.relancer();
  }

  placerCamera(cible, dist, azimut = 0) {
    const d = this.dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), azimut);
    this.cam.position.copy(cible).addScaledVector(d, dist);
    this.cam.lookAt(cible);
    this.cam.updateMatrixWorld();
    this.s.fog.near = dist + 12;
    this.s.fog.far = dist + 60;
    this.camBouge = true;
  }

  /* ─────────── qualité & résolution ─────────── */
  reglerQualite(choix) {
    this.qualiteChoix = choix;
    this.palier = 0;
    this.appliquerQualite();
  }

  qualiteCourante() {
    if (this.qualiteChoix === 'auto') return PALIERS_AUTO[this.palier];
    return { q: this.qualiteChoix, echelle: 1 };
  }

  infoQualite() {
    const c = this.qualiteCourante();
    const lib = { haute: 'Haute', moyenne: 'Moyenne', basse: 'Basse' }[c.q];
    return `${this.qualiteChoix === 'auto' ? 'Auto → ' : ''}${lib}, résolution ${Math.round((this.prEffectif || 1) * 100)} %${this.perf.fps ? ` · ${Math.round(this.perf.fps)} img/s` : ''}`;
  }

  appliquerQualite(init = false) {
    const c = this.qualiteCourante();
    const Q = QUALITES[c.q];
    this.Q = Q;
    this.echelle = c.echelle;
    const ombres = Q.ombres > 0;
    this.r.shadowMap.enabled = ombres;
    this.soleil.castShadow = ombres;
    if (ombres && this.soleil.shadow.mapSize.x !== Q.ombres) {
      this.soleil.shadow.mapSize.set(Q.ombres, Q.ombres);
      this.soleil.shadow.map?.dispose();
      this.soleil.shadow.map = null;
    }
    if (!init) this.s.traverse((m) => { if (m.material && m.isMesh) { (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => { x.needsUpdate = true; }); } });
    if (Q.bloom && !this.composer) this.creerComposer();
    this.redimensionner();
    this.surQualite?.({ info: this.infoQualite() });
  }

  creerComposer() {
    const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: QUALITES.haute.msaa });
    this.composer = new EffectComposer(this.r, rt);
    this.composer.addPass(new RenderPass(this.s, this.cam));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.6, 0.45, 0.82);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
  }

  redimensionner() {
    if (!this.r) return;
    const w = Math.max(1, this.conteneur.clientWidth);
    const h = Math.max(1, this.conteneur.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const budget = this.Q?.budget || 2e6;
    const pr = Math.max(0.5, Math.min(dpr, Math.sqrt(budget / (w * h))) * (this.echelle || 1));
    this.prEffectif = pr / dpr;
    this.r.setPixelRatio(pr);
    this.r.setSize(w, h, false);
    if (this.composer) {
      this.composer.setPixelRatio(pr);
      this.composer.setSize(w, h);
    }
    this.cam.aspect = w / h;
    this.cam.updateProjectionMatrix();
    if (this.zoneActive) this.zoomZone(this.zoneActive, true);
    else this.vueGenerale(true);
    this.taille = { w, h };
    this.demander();
  }

  /* ─────────── interaction ─────────── */
  ecouteurs() {
    document.addEventListener('visibilitychange', () => this.relancer());
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let bas = null;
    const viser = (e) => {
      const r = this.canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, this.cam);
      const hit = ray.intersectObjects(this.volumes, false)[0];
      return hit ? hit.object.userData.zone : null;
    };
    this.canvas.addEventListener('pointerdown', (e) => { bas = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    this.canvas.addEventListener('pointerup', (e) => {
      if (!bas) return;
      const ok = Math.hypot(e.clientX - bas.x, e.clientY - bas.y) < 12 && performance.now() - bas.t < 800;
      bas = null;
      if (!ok) return;
      const z = viser(e);
      if (z) this.surZone?.(z);
    });
    this.canvas.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const z = viser(e);
      this.canvas.style.cursor = z ? 'pointer' : 'default';
      let change = false;
      for (const [id, zz] of Object.entries(this.zones)) {
        const s = id === z;
        if (zz.survol !== s) { zz.survol = s; change = true; }
      }
      if (change) this.demander();
    });
  }

  /* ─────────── animation ─────────── */
  reglerAnimation(niveau) {
    this.animNiveau = niveau;
    this.relancer();
    this.demander();
  }

  reglerMode(mode) {
    this.mode = mode;
    this.actifRendu = mode !== 'briefing';
    if (this.bloom) this.bloom.strength = mode === 'immersion' ? 0.95 : 0.6;
    this.r.toneMappingExposure = mode === 'immersion' ? 1.12 : 1.05;
    if (this.actifRendu) { this.redimensionner(); this.relancer(); } else this.r.setAnimationLoop(null);
  }

  revele() {
    if (this.animNiveau !== 'plein') return;
    this.r.localClippingEnabled = false;
    this.plan = new THREE.Plane(new THREE.Vector3(-1, 0, 0), BORNES.x0 - 2);
    this.r.clippingPlanes = [this.plan];
    // ligne de balayage : trait lumineux au sol + voile vertical discret (sans saturer le bloom)
    const balai = new THREE.Group();
    const trait = new THREE.Mesh(new THREE.PlaneGeometry(0.08, BORNES.z1 - BORNES.z0 + 3), new THREE.MeshBasicMaterial({ color: COUL.cyan.clone().multiplyScalar(3), toneMapped: false, transparent: true, depthWrite: false }));
    trait.rotation.x = -Math.PI / 2;
    trait.position.y = 0.03;
    const voile = new THREE.Mesh(new THREE.PlaneGeometry(BORNES.z1 - BORNES.z0 + 3, 3.4), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide,
      uniforms: { uC: { value: COUL.cyan.clone().multiplyScalar(0.55) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 uC; varying vec2 vUv; void main(){ float a = pow(1.0 - vUv.y, 2.2) * smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x); gl_FragColor = vec4(uC * a, 1.0); }',
    }));
    voile.rotation.y = Math.PI / 2;
    voile.position.y = 1.7;
    balai.add(trait, voile);
    balai.position.set(BORNES.x0, 0, (BORNES.z0 + BORNES.z1) / 2);
    this.s.add(balai);
    this.revelation = { t: 0, duree: 1.35, balai };
    this.relancer();
  }

  doitAnimer() {
    return this.actifRendu && !document.hidden && (this.animNiveau === 'plein' || this.tween || this.revelation);
  }

  relancer() {
    if (!this.r || this.perdu) return;
    if (this.doitAnimer()) {
      this.horloge = performance.now();
      this.r.setAnimationLoop(this.boucle);
    } else {
      this.r.setAnimationLoop(null);
      this.demander();
    }
  }

  demander() {
    if (!this.r || this.perdu || !this.actifRendu || this.doitAnimer() || this.attenteRendu) return;
    this.attenteRendu = true;
    requestAnimationFrame(() => {
      this.attenteRendu = false;
      this.majStatique();
      this.rendre();
    });
  }

  /** Effets ponctuels en mode réduit / suspendu : rendu unique, sans mouvement. */
  majStatique() {
    this.impulsions = this.impulsions.filter((p) => {
      const z = p.z;
      z.anneau.material.opacity = 0;
      z.matBord.opacity = Math.max(z.matBord.opacity, 1);
      setTimeout(() => this.majEtats(Object.fromEntries(Object.entries(this.zones).map(([k, x]) => [k, { etat: x.etat }]))), p.duree * 1000);
      return false;
    });
    this.ecrireColis();
    this.survolVisuel();
  }

  survolVisuel() {
    for (const [id, z] of Object.entries(this.zones)) {
      const actif = z.survol || this.zoneActive === id;
      z.matFill.opacity = actif ? 0.13 : (z.etat === 'critique' || z.etat === 'vigilance' ? 0.085 : z.etat === 'indisponible' ? 0.02 : 0.04);
    }
  }

  boucle(maintenant) {
    const brut = (maintenant - this.horloge) / 1000;
    const dt = Math.min(0.05, brut);        // simulation du flux (stable)
    const dtR = Math.min(0.25, brut);       // effets minutés : durée réelle respectée même si l'écran rame
    this.horloge = maintenant;
    const plein = this.animNiveau === 'plein';
    if (plein) {
      this.tAnim += dt;
      if (this.flux.actif) {
        this.mat.flux.uniforms.uTemps.value = this.tAnim;
        this.mat.tapis.map.offset.y = (this.mat.tapis.map.offset.y - dt * VITESSE) % 1;
      }
      this.majColis(dt);
      // nappe du scanner
      this.nappe.position.x = Math.sin(this.tAnim * 2.4) * 0.55;
      this.nappe.material.opacity = 0.35 + 0.25 * Math.abs(Math.sin(this.tAnim * 2.4));
      // colonnes critiques : clignotement lent
      const clign = 0.5 + 0.5 * Math.sin(this.tAnim * 4.2);
      for (const z of Object.values(this.zones)) if (z.etat === 'critique') z.mat3.critique.emissiveIntensity = 1.2 + 2.6 * clign;
      // dérive de caméra (Immersion uniquement)
      if (this.mode === 'immersion' && !this.zoneActive && !this.tween) {
        this.derive += dt;
        this.placerCamera(this.camVue.cible, this.camVue.dist, Math.sin(this.derive * 0.16) * 0.06);
      }
    }
    // déplacement de caméra
    if (this.tween) {
      const T = this.tween;
      T.t += dtR / T.duree;
      const k = easeIO(Math.min(1, T.t));
      const c = T.dep.cible.clone().lerp(T.arr.cible, k);
      const d = lerp(T.dep.dist, T.arr.dist, k) + Math.sin(k * Math.PI) * 1.5;
      this.placerCamera(c, d);
      if (T.t >= 1) this.tween = null;
    }
    // impulsions d'alerte
    this.impulsions = this.impulsions.filter((p) => {
      p.t += dtR;
      const k = (p.t % 0.85) / 0.85;
      const s = p.z.rayon * (0.6 + k * 1.1);
      p.z.anneau.scale.set(s, s, 1);
      p.z.anneau.material.opacity = (1 - k) * 0.95;
      p.z.matBord.opacity = 0.6 + 0.4 * (1 - k);
      if (p.t >= p.duree) { p.z.anneau.material.opacity = 0; return false; }
      return true;
    });
    // vague de célébration le long des liserés + particules
    if (this.vague) {
      this.vague.t += dtR;
      this.mat.flux.uniforms.uVague.value = -2 + this.vague.t * 16;
      for (const z of Object.values(this.zones)) z.mat3.conforme.emissiveIntensity = z.etat === 'conforme' || Math.sin(this.vague.t * 9) > 0 ? 3.6 : 0.06;
      if (this.vague.t > 2.6) {
        this.vague = null;
        this.mat.flux.uniforms.uVague.value = -100;
        this.majEtats(Object.fromEntries(Object.entries(this.zones).map(([k, z]) => [k, { etat: z.etat }])));
      }
    }
    if (this.particules) {
      const P = this.particules;
      P.t += dtR;
      const a = P.p.geometry.attributes.position;
      for (let i = 0; i < P.vit.length; i++) {
        P.vit[i][1] -= 2.2 * dtR;
        a.array[i * 3] += P.vit[i][0] * dtR;
        a.array[i * 3 + 1] = Math.max(0.05, a.array[i * 3 + 1] + P.vit[i][1] * dtR);
        a.array[i * 3 + 2] += P.vit[i][2] * dtR;
      }
      a.needsUpdate = true;
      P.p.material.opacity = Math.max(0, 1 - P.t / 2.4);
      if (P.t > 2.4) { this.s.remove(P.p); P.p.geometry.dispose(); this.particules = null; }
    }
    // révélation d'ouverture
    if (this.revelation) {
      const R = this.revelation;
      R.t += dtR;
      const k = 1 - Math.pow(1 - Math.min(1, R.t / R.duree), 2.2);
      const x = lerp(BORNES.x0 - 2, BORNES.x1 + 3, k);
      this.plan.constant = x;
      R.balai.position.x = x - 0.02;
      R.balai.children[0].material.opacity = 1 - smooth(0.85, 1, k);
      if (R.t >= R.duree) {
        this.r.clippingPlanes = [];
        this.s.remove(R.balai);
        R.balai.traverse((m) => { if (m.isMesh) { m.geometry.dispose(); m.material.dispose(); } });
        this.revelation = null;
      }
    }
    this.survolVisuel();
    this.rendre();
    this.mesurer(dt);
    if (!this.doitAnimer()) this.r.setAnimationLoop(null);
  }

  rendre() {
    if (this.composer && this.Q.bloom) this.composer.render();
    else this.r.render(this.s, this.cam);
    if (this.camBouge || this.dernierTaille !== this.taille) {
      this.camBouge = false;
      this.dernierTaille = this.taille;
      this.surCamera?.(this.projeter());
    }
  }

  projeter() {
    const v = new THREE.Vector3();
    const { w, h } = this.taille || { w: 1, h: 1 };
    const out = {};
    for (const [id, a] of Object.entries(this.ancres)) {
      v.copy(a).project(this.cam);
      out[id] = { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, visible: v.z < 1 && v.x > -1.1 && v.x < 1.1 && v.y > -1.1 && v.y < 1.1 };
    }
    return out;
  }

  /** Réduction automatique des effets coûteux si l'animation devient saccadée. */
  mesurer(dt) {
    const P = this.perf;
    P.n++;
    P.somme += dt;
    if (P.somme < 2) return;
    const moy = P.somme / P.n;
    P.fps = 1 / moy;
    P.n = 0;
    P.somme = 0;
    this.surQualite?.({ fps: P.fps, info: this.infoQualite() });
    if (this.qualiteChoix !== 'auto' || this.animNiveau !== 'plein' || document.hidden) return;
    const t = performance.now();
    if (moy > 1 / 40) P.bas++; else P.bas = 0;
    if (moy < 1 / 58) P.haut++; else P.haut = 0;
    if (P.bas >= 2 && this.palier < PALIERS_AUTO.length - 1) {
      this.palier++;
      P.bas = 0;
      P.dernierChangement = t;
      this.appliquerQualite();
    } else if (P.haut >= 6 && this.palier > 0 && t - P.dernierChangement > 30000) {
      this.palier--;
      P.haut = 0;
      P.dernierChangement = t;
      this.appliquerQualite();
    }
  }

  liberer() {
    this.r?.setAnimationLoop(null);
    this.r?.dispose();
  }
}
