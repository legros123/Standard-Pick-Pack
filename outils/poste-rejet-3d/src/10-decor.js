/* ───────── Matières ───────── */
function matieres(sc) {
  const s = o => new T.MeshStandardMaterial(o), M = {};
  sc.uSol = { tReflet: { value: null }, uMatR: { value: new T.Matrix4() }, uReflet: { value: 0 } };
  M.sol = s({ map: texSol(), roughness: 0.46, metalness: 0 }); grefferReflet(M.sol, sc.uSol);
  M.bardage = s({ map: texBardage(), roughness: 0.62, metalness: 0.05 });
  M.vitrage = new T.MeshBasicMaterial({ map: texVitrage() }); M.vitrage.color.setScalar(1.5);
  M.plafond = s({ color: 0x8a9099, roughness: 0.85, emissive: 0x1a1f26 });
  M.halo = new T.MeshBasicMaterial({ map: texHaloSol(), transparent: true, opacity: 0.13, blending: T.AdditiveBlending, depthWrite: false });
  M.mur = s({ color: 0xc3c8ce, roughness: 0.7 });
  M.porte = s({ color: 0xcfd3d8, roughness: 0.5, metalness: 0.1 });
  M.bleu = s({ color: 0x1b3d9a, roughness: 0.48, metalness: 0.25 });
  M.rouge = s({ color: 0xc9281f, roughness: 0.42, metalness: 0.2 });
  M.galva = s({ color: 0xbfc5cc, roughness: 0.42, metalness: 0.9 });
  M.inox = s({ color: 0xcfd3d8, roughness: 0.32, metalness: 1 });
  M.chrome = s({ color: 0xe9ecf0, roughness: 0.1, metalness: 1 });
  M.chassis = s({ color: 0x1b2131, roughness: 0.55, metalness: 0.35 });
  M.noir = s({ color: 0x16181c, roughness: 0.5, metalness: 0.1 });
  M.vide = new T.MeshBasicMaterial({ color: 0x020305 });
  M.caout = s({ color: 0x1a1c20, roughness: 0.92 });
  M.jaune = s({ color: 0xf5c400, roughness: 0.5 });
  M.jauneSecu = s({ color: 0xf0b400, roughness: 0.48, metalness: 0.15 });
  M.peinture = s({ color: 0xe2b100, roughness: 0.75 });
  M.orangeRack = s({ color: 0xe6761a, roughness: 0.5, metalness: 0.2 });
  M.bois = s({ color: 0xb38d5e, roughness: 0.85 });
  M.kraftA = s({ color: 0xc19a6b, roughness: 0.85 }); M.kraftB = s({ color: 0xa9845a, roughness: 0.85 }); M.film = s({ color: 0xdde4ec, roughness: 0.3 });
  M.blancM = s({ color: 0xd6d9dd, roughness: 0.38, metalness: 0.1 });
  M.bleuM = s({ color: 0x2157bd, roughness: 0.38, metalness: 0.2 });
  M.bleuPoste = s({ color: 0x1f5bd0, roughness: 0.4, metalness: 0.25 });
  M.plateau = s({ color: 0x9fa4ac, roughness: 0.5 });
  M.tissuBleu = s({ color: 0x1b4fc2, roughness: 0.95 });
  M.gris = s({ color: 0x6a7079, roughness: 0.6, metalness: 0.3 });
  M.grisClair = s({ color: 0xaab0b8, roughness: 0.55, metalness: 0.1 });
  M.led = new T.MeshBasicMaterial(); M.led.color.setRGB(5.2, 5.4, 5.8);
  M.rouleau = s({ map: texRouleau(), roughness: 0.28, metalness: 1 });
  M.tapis = t => s({ map: t, roughness: 0.9 });
  const tk = texKraft();
  M.kraft = [0xffffff, 0xf0dfc8, 0xe0c9a8].map(c => s({ map: tk, color: c, roughness: 0.86 }));
  M.ruban = s({ color: 0x9d7a4c, roughness: 0.3 });
  M.etiq = [1, 2, 3, 4].map(g => s({ map: texEtiquette(g), roughness: 0.7 }));
  M.bac = s({ color: 0xf2d200, roughness: 0.42 });
  M.couvercle = s({ map: texCouvercle(), roughness: 0.6 });
  M.feuillard = s({ color: 0xe6e9ed, roughness: 0.3 });
  M.danger = s({ map: texRayures("#f2c200", "#15171b"), roughness: 0.5 });
  M.laser = new T.MeshBasicMaterial({ transparent: true, opacity: 0.16, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }); M.laser.color.setRGB(3, 0.1, 0.1);
  M.trait = new T.MeshBasicMaterial(); M.trait.color.setRGB(7, 0.25, 0.2);
  M.voyant = (hex, k = 0.06) => s({ color: 0x1c1f24, emissive: hex, emissiveIntensity: k, roughness: 0.3 });
  M.peau = [0xf0c8a4, 0xd9a577, 0xa87148, 0x7a4f31].map(c => s({ color: c, roughness: 0.7 }));
  M.cheveux = [0x24180f, 0x4a3018, 0x111317, 0x8a5a2a, 0x6b6e73].map(c => s({ color: c, roughness: 0.8 }));
  M.pantalon = [0x232b3b, 0x2e3440, 0x1d2430].map(c => s({ color: c, roughness: 0.85 }));
  M.polo = [0x1b2a4a, 0x2b3038, 0x23395c].map(c => s({ color: c, roughness: 0.85 }));
  M.chaussure = s({ color: 0x15161a, roughness: 0.55 });
  M.gant = s({ color: 0x2b2f36, roughness: 0.8 });
  M.casquette = s({ color: 0x15233f, roughness: 0.8 });
  return M;
}

/* écran lumineux : une toile 2D plaquée sur un plan */
function ecran(l, h, pw, ph, eclat = 1.5) {
  const c = document.createElement("canvas"); c.width = pw; c.height = ph;
  const tex = texture(c), mat = new T.MeshBasicMaterial({ map: tex }); mat.color.setScalar(eclat);
  const mesh = new T.Mesh(G.plan, mat); mesh.scale.set(l, h, 1);
  return { mesh, c, x: c.getContext("2d"), tex, w: pw, h: ph, maj() { tex.needsUpdate = true; } };
}
function enseigne(l, h, pw, ph, dessin, eclat = 1) {
  const m = new T.MeshBasicMaterial({ map: texPanneau(pw, ph, dessin) }); m.color.setScalar(eclat);
  const mesh = new T.Mesh(G.plan, m); mesh.scale.set(l, h, 1); return mesh;
}
/* colonne lumineuse : bleu, rouge, orange, vert (de haut en bas) */
function colonne(sc, k, x, y, z) {
  const M = sc.M, f = {}, g = new T.Group(); g.position.set(x, y, z); sc.scene.add(g);
  k.cyl(M.noir, x, y - 0.03, z, 0.03, 0.06);
  [["bleu", 0x2f7bff], ["rouge", 0xff2a1e], ["orange", 0xff9a1a], ["vert", 0x2dff5a]].forEach(([n, c], i) => {
    const m = f[n] = M.voyant(c), s = new T.Mesh(G.cyl, m); s.scale.set(0.036, 0.066, 0.036); s.position.y = 0.033 + (3 - i) * 0.07; g.add(s);
  });
  const cap = new T.Mesh(G.cyl, M.noir); cap.scale.set(0.038, 0.02, 0.038); cap.position.y = 0.29; g.add(cap);
  return f;
}
const allumer = (m, k) => { m.emissiveIntensity = k; };

/* ───────── Convoyeur à rouleaux ───────── */
function ligne(k, R, M, x0, x1, z, larg, o = {}) {
  const za = z - larg / 2, zf = z + larg / 2, y0 = YR - 0.165, y1 = YR - 0.006;
  if (!o.sansAr) k.ext(M.chassis, x0, x1, y0, y1, za - 0.05, za);
  if (!o.sansAv) k.ext(M.chassis, x0, x1, y0, y1, zf, zf + 0.05);
  const n = Math.max(1, Math.floor((x1 - x0 - 0.02) / PAS)), d = x0 + ((x1 - x0) - (n - 1) * PAS) / 2;
  for (let i = 0; i < n; i++) R.push([d + i * PAS, z, larg]);
  const np = Math.max(2, Math.round((x1 - x0) / 1.9) + 1);
  for (let i = 0; i < np; i++) {
    const px = np === 1 ? (x0 + x1) / 2 : lerp(x0 + 0.12, x1 - 0.12, i / (np - 1));
    for (const pz of [za - 0.025, zf + 0.025]) { k.box(M.chassis, px, y0 / 2 + 0.01, pz, 0.05, y0 - 0.02, 0.05); k.box(M.noir, px, 0.012, pz, 0.11, 0.024, 0.11); }
    k.box(M.chassis, px, 0.3, z, 0.04, 0.04, larg + 0.05); k.box(M.chassis, px, y0 - 0.03, z, 0.04, 0.05, larg + 0.05);
  }
  /* chemin de câbles sous la ligne */
  k.ext(M.galva, x0 + 0.1, x1 - 0.1, YR - 0.33, YR - 0.3, z - 0.1, z + 0.1);
  /* rives de guidage */
  const rive = (zc, cote, plages) => { for (const [a, b] of plages) { if (b - a < 0.1) continue; k.ext(M.galva, a, b, YR + 0.07, YR + 0.115, zc - 0.008, zc + 0.008); const m = Math.max(2, Math.round((b - a) / 0.95) + 1); for (let i = 0; i < m; i++) k.box(M.galva, lerp(a + 0.04, b - 0.04, i / (m - 1)), YR + 0.04, zc + cote * 0.022, 0.025, 0.15, 0.02); } };
  if (o.riveAr) rive(za - 0.012, -1, o.riveAr);
  if (o.riveAv) rive(zf + 0.012, 1, o.riveAv);
}

function rayonnage(k, M, x0, x1, zc, r) {
  const P = 1.1, niv = [0.12, 1.95, 3.7, 5.4], trav = 2.75, n = Math.round((x1 - x0) / trav);
  for (let i = 0; i <= n; i++) {
    const x = x0 + i * trav;
    for (const z of [zc - P / 2, zc + P / 2]) k.box(M.bleu, x, 3.55, z, 0.1, 7.1, 0.08);
    for (const y of [0.5, 1.4, 2.6, 3.8, 5.0, 6.2]) k.box(M.bleu, x, y, zc, 0.035, 0.035, P);
  }
  for (let i = 0; i < n; i++) {
    const xa = x0 + i * trav;
    for (const y of niv.slice(1)) for (const z of [zc - P / 2, zc + P / 2]) k.box(M.orangeRack, xa + trav / 2, y - 0.07, z, trav - 0.1, 0.13, 0.05);
    for (const y of niv) for (let j = 0; j < 2; j++) {
      if (r() < 0.16) continue;
      const px = xa + 0.72 + j * 1.31, hh = 0.45 + r() * 0.85, mat = r() < 0.25 ? M.film : r() < 0.5 ? M.kraftB : M.kraftA;
      k.box(M.bois, px, y + 0.07, zc, 1.15, 0.14, 1.0);
      k.box(mat, px + (r() - 0.5) * 0.05, y + 0.14 + hh / 2, zc, 0.92 + r() * 0.2, hh, 0.86 + r() * 0.16);
      if (hh < 0.85 && r() < 0.5) { const h2 = 0.2 + r() * 0.3; k.box(M.kraftA, px + (r() - 0.5) * 0.3, y + 0.14 + hh + h2 / 2, zc, 0.5 + r() * 0.3, h2, 0.5 + r() * 0.3); }
    }
  }
}

/* ───────── La halle : sol, mur, charpente, sprinklers, éclairage, rayonnages ───────── */
function construireHalle(sc) {
  const M = sc.M, scene = sc.scene, k = new Kit(), kh = new Kit(), kd = new Kit(), r = alea(21);
  const sol = new T.Mesh(new T.PlaneGeometry(160, 120), M.sol); sol.rotation.x = -PI / 2; sol.position.set(-6, 0, 14); sol.receiveShadow = true; scene.add(sol); sc.sol = sol;
  const mur = new T.Mesh(new T.PlaneGeometry(90, 8.2), M.bardage); mur.position.set(-8, 4.1, Z_MUR); mur.receiveShadow = true; scene.add(mur);
  const vit = new T.Mesh(new T.PlaneGeometry(90, 1.15), M.vitrage); vit.position.set(-8, 4.75, Z_MUR + 0.02); scene.add(vit);
  const pl = new T.Mesh(new T.PlaneGeometry(90, 26), M.plafond); pl.rotation.x = PI / 2; pl.position.set(-8, 8.02, 9); scene.add(pl);
  /* pignon côté préparation et long pan côté allée : la halle est fermée */
  const mg = new T.Mesh(new T.PlaneGeometry(26, 8.2), M.mur); mg.rotation.y = PI / 2; mg.position.set(-44.8, 4.1, 9); mg.receiveShadow = true; scene.add(mg);
  const mf = new T.Mesh(new T.PlaneGeometry(90, 8.2), M.mur); mf.rotation.y = PI; mf.position.set(-8, 4.1, 21.6); scene.add(mf);
  /* poteaux en H, lisses, contreventements */
  const POT = [-39, -33, -27, -21, -15, -9, -3, 3, 9, 15];
  for (const x of POT) {
    const z = Z_MUR + 0.17;
    k.box(M.bleu, x, 4.0, z - 0.11, 0.26, 8.0, 0.03); k.box(M.bleu, x, 4.0, z + 0.11, 0.26, 8.0, 0.03); k.box(M.bleu, x, 4.0, z, 0.03, 8.0, 0.2);
    k.box(M.gris, x, 0.02, z, 0.42, 0.04, 0.42);
    kh.ext(M.bleu, x - 0.1, x + 0.1, 7.45, 7.86, Z_MUR, 21);
  }
  k.ext(M.bleu, -45, 17.6, 5.42, 5.6, Z_MUR + 0.03, Z_MUR + 0.13); k.ext(M.bleu, -45, 17.6, 3.98, 4.1, Z_MUR + 0.03, Z_MUR + 0.11);
  for (const [a, b] of [[-15, -9], [9, 15]]) { k.tube(M.bleu, [a + 0.16, 0.3, Z_MUR + 0.2], [b - 0.16, 3.95, Z_MUR + 0.2], 0.04); k.tube(M.bleu, [b - 0.16, 0.3, Z_MUR + 0.24], [a + 0.16, 3.95, Z_MUR + 0.24], 0.04); }
  for (let z = -2.4; z < 21; z += 2.4) kh.ext(M.galva, -45, 17.6, 7.87, 7.97, z - 0.03, z + 0.03);
  /* réseau sprinkler rouge */
  kh.cyl(M.rouge, -13.5, 6.92, 1.2, 0.065, 62, "x");
  for (let x = -42; x <= 15; x += 3) { kh.cyl(M.rouge, x, 6.78, 8.2, 0.027, 22.4, "z"); for (let z = -1.8; z < 19; z += 3) { kh.cyl(M.rouge, x, 6.69, z, 0.011, 0.14); kh.cyl(M.galva, x, 6.61, z, 0.03, 0.02); } }
  k.cyl(M.rouge, 3.42, 3.46, Z_MUR + 0.34, 0.055, 6.92); kh.cyl(M.rouge, 3.42, 6.92, (Z_MUR + 0.34 + 1.2) / 2, 0.055, 1.2 - Z_MUR - 0.34, "z");
  k.box(M.rouge, 3.42, 1.25, Z_MUR + 0.34, 0.2, 0.24, 0.2); k.cyl(M.rouge, 3.42, 1.25, Z_MUR + 0.5, 0.11, 0.03, "z");
  /* air comprimé et chemin de câbles le long du mur */
  k.cyl(M.galva, -13, 2.02, Z_MUR + 0.13, 0.035, 62, "x"); k.cyl(M.galva, -13, 1.88, Z_MUR + 0.13, 0.026, 62, "x");
  for (let x = -42; x < 17; x += 3) k.box(M.galva, x + 1.5, 1.95, Z_MUR + 0.06, 0.03, 0.3, 0.12);
  /* armoire électrique, extincteur */
  k.ext(M.grisClair, -9.0, -8.1, 0, 2.0, Z_MUR + 0.02, Z_MUR + 0.44); k.box(M.jauneSecu, -8.55, 1.5, Z_MUR + 0.445, 0.16, 0.16, 0.01); k.box(M.noir, -8.2, 1.05, Z_MUR + 0.45, 0.03, 0.16, 0.03);
  k.cyl(M.rouge, -3.0, 1.0, Z_MUR + 0.42, 0.075, 0.46); k.cyl(M.noir, -3.0, 1.27, Z_MUR + 0.42, 0.025, 0.08); k.box(M.rouge, -3.0, 1.75, Z_MUR + 0.31, 0.22, 0.22, 0.01);
  /* luminaires LED suspendus */
  const gs = sc.grSol = new T.Group(); scene.add(gs);
  const lampe = (x, z) => { const h = new T.Mesh(G.plan, M.halo); h.rotation.x = -PI / 2; h.scale.set(6.4, 4.6, 1); h.position.set(x, 0.006, z + 0.5); h.renderOrder = 2; gs.add(h); kh.box(M.grisClair, x, 5.67, z, 1.56, 0.07, 0.14); kh.box(M.led, x, 5.62, z, 1.5, 0.02, 0.1); kh.cyl(M.noir, x - 0.6, 6.72, z, 0.004, 2.05); kh.cyl(M.noir, x + 0.6, 6.72, z, 0.004, 2.05); };
  for (let x = -33; x <= 15; x += 6) { lampe(x, -1.25); if (x < 6) lampe(x + 3, 3.1); if (x < -6) { lampe(x + 1.5, 7.7); lampe(x + 1.5, 11.1); } }
  /* mur d'expédition, à droite : la ligne le traverse */
  const XM = X_OUT;
  k.ext(M.mur, XM, XM + 0.2, 0, 8.0, Z_MUR, ZM - 0.6); k.ext(M.mur, XM, XM + 0.2, 1.72, 8.0, ZM - 0.6, ZJ + 0.6); k.ext(M.mur, XM, XM + 0.2, 0, 0.5, ZM - 0.6, ZJ + 0.6); k.ext(M.mur, XM, XM + 0.2, 0, 8.0, ZJ + 0.6, 22);
  k.ext(M.vide, XM + 0.19, XM + 0.21, 0.5, 1.72, ZM - 0.6, ZJ + 0.6);
  k.ext(M.danger, XM - 0.02, XM, 1.72, 1.8, ZM - 0.66, ZJ + 0.66);
  for (const z of [4.2, 9.6]) { k.ext(M.porte, XM - 0.04, XM, 0, 3.5, z, z + 3.2); k.ext(M.noir, XM - 0.05, XM - 0.03, 1.5, 1.85, z + 0.3, z + 2.9); k.ext(M.jauneSecu, XM - 0.3, XM - 0.1, 0, 1.0, z - 0.25, z - 0.1); k.ext(M.jauneSecu, XM - 0.3, XM - 0.1, 0, 1.0, z + 3.3, z + 3.45); }
  const exp = enseigne(2.3, 0.46, 512, 104, (x, w, h) => { x.fillStyle = "#12305f"; x.fillRect(0, 0, w, h); ecrire(x, "EXPÉDITION  ›", w / 2, h / 2 + 3, 62, { g: 900, f: F_D, al: "center", base: "middle", esp: "4px" }); }, 1.1);
  exp.position.set(XM - 0.03, 2.25, (ZM + ZJ) / 2); exp.rotation.y = -PI / 2; scene.add(exp);
  /* carter d'arrivée, à gauche : les colis sortent de la préparation */
  const XC = X_IN + 0.7;
  k.ext(M.bleuM, XC - 3.2, XC, 1.5, 2.5, ZM - 0.85, ZM + 0.85); k.ext(M.bleuM, XC - 3.2, XC, 0, 2.5, ZM - 0.85, ZM - 0.45); k.ext(M.bleuM, XC - 3.2, XC, 0, 2.5, ZM + 0.45, ZM + 0.85); k.ext(M.bleuM, XC - 3.2, XC, 0, 0.6, ZM - 0.45, ZM + 0.45);
  k.ext(M.vide, XC - 0.25, XC - 0.2, 0.6, 1.5, ZM - 0.45, ZM + 0.45); k.ext(M.danger, XC, XC + 0.015, 1.5, 1.58, ZM - 0.5, ZM + 0.5);
  const prep = enseigne(1.5, 0.3, 512, 104, (x, w, h) => { x.fillStyle = "#e9ebee"; x.fillRect(0, 0, w, h); ecrire(x, "PRÉPARATION", w / 2, h / 2 + 3, 66, { g: 900, f: F_D, al: "center", base: "middle", c: "#12305f", esp: "3px" }); });
  prep.position.set(XC + 0.012, 2.1, ZM); prep.rotation.y = PI / 2; scene.add(prep);
  /* allée piétonne et zone de retrait */
  kd.ext(M.peinture, -45, XM - 0.4, 0.001, 0.005, 2.36, 2.46); kd.ext(M.peinture, -45, XM - 0.4, 0.001, 0.005, 3.78, 3.88);
  const zx0 = TABLE.x0 - 0.7, zx1 = TABLE.x1 + 1.1;
  kd.ext(M.peinture, zx0, zx1, 0.001, 0.005, 0.5, 0.58); kd.ext(M.peinture, zx0, zx1, 0.001, 0.005, 2.0, 2.08); kd.ext(M.peinture, zx0, zx0 + 0.08, 0.001, 0.005, 0.5, 2.08); kd.ext(M.peinture, zx1 - 0.08, zx1, 0.001, 0.005, 0.5, 2.08);
  const hach = new T.Mesh(G.plan, new T.MeshStandardMaterial({ map: texHachures(), transparent: true, opacity: 0.5, depthWrite: false, roughness: 0.8 })); hach.rotation.x = -PI / 2; hach.scale.set(zx1 - zx0 - 0.16, 1.42, 1); hach.material.map.repeat.set((zx1 - zx0) / 0.5, 2.84); hach.position.set((zx0 + zx1) / 2, 0.004, 1.29); hach.receiveShadow = true; gs.add(hach);
  const mp = new T.MeshStandardMaterial({ map: texPieton(), transparent: true, depthWrite: false, roughness: 0.8 });
  for (const x of [-21, -13, -5, 9.5]) { const p = new T.Mesh(G.plan, mp); p.rotation.x = -PI / 2; p.scale.set(0.85, 0.85, 1); p.position.set(x, 0.004, 3.12); p.receiveShadow = true; gs.add(p); }
  /* barrières jaunes entre l'allée et la ligne */
  const barriere = (a, b, z) => { const n = Math.round((b - a) / 1.55); for (let i = 0; i <= n; i++) { const x = lerp(a, b, i / n); k.box(M.jauneSecu, x, 0.53, z, 0.07, 1.06, 0.07); k.box(M.noir, x, 0.012, z, 0.16, 0.024, 0.16); } k.cyl(M.jauneSecu, (a + b) / 2, 1.0, z, 0.028, b - a, "x"); k.cyl(M.jauneSecu, (a + b) / 2, 0.52, z, 0.028, b - a, "x"); };
  barriere(-15.6, -7.9, 1.72); barriere(10.2, 16.4, 1.72);
  /* rayonnages à palettes, côté préparation */
  rayonnage(k, M, -42, -9.4, 6.4, r); rayonnage(k, M, -42, -9.4, 7.75, r); rayonnage(k, M, -42, -12.2, 11.4, r);
  /* au premier plan : une palette de cartons et son transpalette, deux chariots de préparation */
  const px = 9.6, pz = 6.3;
  k.box(M.bois, px, 0.07, pz, 1.2, 0.14, 0.8); k.box(M.kraftA, px, 0.44, pz, 1.12, 0.6, 0.74); k.box(M.kraftB, px - 0.2, 0.9, pz, 0.7, 0.32, 0.62); k.box(M.kraftA, px + 0.34, 0.86, pz + 0.05, 0.36, 0.24, 0.4);
  k.box(M.orangeRack, px + 1.02, 0.25, pz, 0.36, 0.34, 0.5); for (const dz of [-0.2, 0.2]) k.box(M.noir, px + 0.2, 0.05, pz + dz, 1.3, 0.05, 0.16);
  k.tube(M.noir, [px + 1.12, 0.4, pz], [px + 1.5, 1.18, pz], 0.022); k.cyl(M.noir, px + 1.5, 1.18, pz, 0.02, 0.4, "z"); k.cyl(M.noir, px + 1.15, 0.08, pz, 0.08, 0.1, "z");
  const chariot = (x, z) => { for (const dx of [-0.6, 0.6]) for (const dz of [-0.34, 0.34]) k.box(M.bleuPoste, x + dx, 0.82, z + dz, 0.05, 1.42, 0.05); [0.2, 0.68, 1.16].forEach((y, i) => { k.box(M.bois, x, y, z, 1.26, 0.04, 0.74); if (i < 2) { k.box(M.kraftA, x - 0.3, y + 0.17, z, 0.5, 0.3, 0.5); if (i === 0) k.box(M.kraftB, x + 0.3, y + 0.13, z + 0.05, 0.44, 0.22, 0.46); } }); for (const dx of [-0.5, 0.5]) for (const dz of [-0.28, 0.28]) k.cyl(M.noir, x + dx, 0.06, z + dz, 0.06, 0.04, "z"); };
  chariot(-3.4, 5.2); chariot(-1.7, 5.25);
  k.poser(scene); kh.poser(scene, { ombre: false }); kd.poser(scene, { ombre: false });
}

/* ───────── Les lignes : rouleaux, balance, aiguillage, cercleuses ───────── */
function construireLignes(sc) {
  const M = sc.M, scene = sc.scene, k = new Kit(), R = [];
  const xa = X_IN + 0.5, bA = X_BAL - 0.66, bB = X_BAL + 0.66, j1 = X_D1 + 0.1, cA0 = X_CA - 0.56, cA1 = X_CA + 0.56, cB0 = X_CB - 0.56, cB1 = X_CB + 0.56, zm = (ZM + ZJ) / 2;
  ligne(k, R, M, xa, bA, ZM, LW, { riveAr: [[xa, bA]], riveAv: [[xa, bA]] });
  ligne(k, R, M, bB, X_D0, ZM, LW, { riveAr: [[bB, X_D0 - 0.05]], riveAv: [[bB, X_D0]] });
  ligne(k, R, M, X_D0, j1, zm, ZJ - ZM + LW, { riveAv: [[X_D0 + 0.45, j1]] });
  k.ext(M.chassis, X_D0 - 0.05, X_D0, YR - 0.165, YR - 0.006, ZM + LW / 2 + 0.05, ZJ + LW / 2 + 0.05); k.ext(M.galva, X_D0 - 0.02, X_D0 - 0.004, YR + 0.07, YR + 0.115, ZM + LW / 2 + 0.03, ZJ + LW / 2 + 0.02);
  k.ext(M.chassis, j1, j1 + 0.05, YR - 0.165, YR - 0.006, ZM + LW / 2 + 0.05, ZJ - LW / 2 - 0.05);
  ligne(k, R, M, j1, cA0, ZM, LW, { riveAr: [[j1, cA0]], riveAv: [[j1 + 0.3, cA0]] });
  ligne(k, R, M, cA1, X_OUT, ZM, LW, { riveAr: [[cA1, X_OUT]], riveAv: [[cA1, X_OUT]] });
  ligne(k, R, M, j1, cB0, ZJ, LW, { riveAr: [[j1 + 0.3, X_STOP - 0.32], [X_STOP + 0.32, cB0]], riveAv: [[j1, -0.78], [1.78, cB0]] });
  k.box(M.gris, X_STOP, YR + 0.075, ZJ - LW / 2 - 0.36, 0.13, 0.11, 0.3); k.box(M.chassis, X_STOP, (YR - 0.1) / 2 + 0.06, ZJ - LW / 2 - 0.36, 0.06, YR - 0.1, 0.06);
  ligne(k, R, M, cB1, X_OUT, ZJ, LW, { riveAr: [[cB1, X_OUT]], riveAv: [[cB1, X_OUT]] });
  /* cellules de détection */
  for (const [x, z] of [[-12, ZM], [-9, ZM], [-2.2, ZM], [1.5, ZM], [4.8, ZM], [11, ZM], [-2.2, ZJ], [4.6, ZJ], [11.4, ZJ]]) { k.box(M.noir, x, YR + 0.16, z - LW / 2 - 0.04, 0.05, 0.07, 0.04); k.box(M.cellule, x, YR + 0.16, z - LW / 2 - 0.018, 0.016, 0.016, 0.006); }
  /* moteurs sous la ligne */
  for (const [x, z] of [[-11, ZM], [-1, ZM], [3.2, ZM], [12.5, ZM], [-1.6, ZJ], [4.2, ZJ], [12.8, ZJ]]) { k.box(M.gris, x, YR - 0.27, z + 0.2, 0.2, 0.16, 0.16); k.cyl(M.bleuM, x + 0.2, YR - 0.27, z + 0.2, 0.07, 0.24, "x"); }
  const n = R.length, rou = new T.InstancedMesh(G.cylR, M.rouleau, n), cap = new T.InstancedMesh(G.cyl8, M.jaune, n * 2);
  const m = new T.Matrix4(), q = new T.Quaternion().setFromEuler(new T.Euler(PI / 2, 0, 0)), p = new T.Vector3(), s = new T.Vector3();
  R.forEach((r, i) => {
    rou.setMatrixAt(i, m.compose(p.set(r[0], YR - RR, r[1]), q, s.set(RR, r[2] - 0.012, RR)));
    for (const c of [0, 1]) cap.setMatrixAt(i * 2 + c, m.compose(p.set(r[0], YR - RR, r[1] + (c ? 1 : -1) * (r[2] / 2 - 0.006)), q, s.set(RR + 0.0015, 0.013, RR + 0.0015)));
  });
  for (const im of [rou, cap]) { im.receiveShadow = true; im.frustumCulled = false; im.matrixAutoUpdate = false; scene.add(im); }

  /* ── portique de lecture et balance (contrôle pondéral) ── */
  const tb = sc.tapisBal = texTapis(); tb.repeat.set(8, 1);
  const bel = new T.Mesh(G.box, M.tapis(tb)); bel.scale.set(bB - bA - 0.04, 0.04, LW - 0.02); bel.position.set(X_BAL, YR - 0.02, ZM); bel.receiveShadow = true; scene.add(bel);
  for (const x of [bA + 0.03, bB - 0.03]) k.cyl(M.inox, x, YR - 0.035, ZM, 0.036, LW + 0.02, "z");
  for (const z of [ZM - LW / 2 - 0.035, ZM + LW / 2 + 0.035]) k.ext(M.inox, bA, bB, YR - 0.2, YR + 0.03, z - 0.02, z + 0.02);
  k.ext(M.inox, X_BAL - 0.45, X_BAL + 0.45, 0.16, YR - 0.2, ZM - 0.3, ZM + 0.3); k.ext(M.gris, X_BAL - 0.5, X_BAL + 0.5, 0.0, 0.16, ZM - 0.34, ZM + 0.34);
  for (const dx of [-0.42, 0.42]) for (const dz of [-0.3, 0.3]) k.cyl(M.noir, X_BAL + dx, 0.02, ZM + dz, 0.05, 0.04);
  const zp = [ZM - 0.5, ZM + 0.5];
  for (const z of zp) { k.box(M.chassis, X_SCAN, 1.02, z, 0.07, 2.04, 0.07); k.box(M.noir, X_SCAN, 0.012, z, 0.2, 0.024, 0.2); }
  k.box(M.chassis, X_SCAN, 2.04, ZM, 0.09, 0.09, 1.07);
  k.box(M.noir, X_SCAN, 1.93, ZM, 0.26, 0.13, 0.36); k.box(M.trait, X_SCAN, 1.862, ZM, 0.03, 0.006, 0.26);
  const ens = enseigne(1.0, 0.17, 512, 88, (x, w, h) => { x.fillStyle = "#12305f"; x.fillRect(0, 0, w, h); ecrire(x, "CONTRÔLE PONDÉRAL", w / 2, h / 2 + 3, 50, { g: 900, f: F_D, al: "center", base: "middle", esp: "3px" }); }, 1.1);
  ens.position.set(X_SCAN + 0.048, 2.2, ZM); ens.rotation.y = PI / 2; scene.add(ens);
  const ens2 = ens.clone(); ens2.position.set(X_SCAN, 2.2, ZM + 0.55); ens2.rotation.y = 0; scene.add(ens2); k.box(M.chassis, X_SCAN, 2.2, ZM + 0.535, 1.04, 0.2, 0.02);
  /* nappe laser du lecteur */
  const gl = new T.BufferGeometry(); gl.setAttribute("position", new T.Float32BufferAttribute([0, 1.86, -0.08, 0, 0, -0.3, 0, 0, 0.3, 0, 1.86, 0.08], 3)); gl.setIndex([0, 1, 2, 0, 2, 3]);
  const nap = sc.nappe = new T.Mesh(gl, M.laser); nap.position.set(X_SCAN, 0, ZM); scene.add(nap);
  const tr = sc.traitLaser = new T.Mesh(G.box, M.trait); tr.scale.set(0.012, 0.004, 0.56); tr.position.set(X_SCAN, YR + 0.004, ZM); scene.add(tr);
  /* afficheur de la balance, tourné vers l'allée */
  const ex = X_BAL + 0.1, ez = ZM + 0.62;
  k.box(M.chassis, ex, 0.66, ez, 0.06, 1.32, 0.06); k.box(M.noir, ex, 0.012, ez, 0.3, 0.024, 0.3);
  const eb = sc.eBal = ecran(0.5, 0.31, 384, 240, 1.7); eb.mesh.position.set(ex, 1.5, ez + 0.036); eb.mesh.rotation.x = -0.12; scene.add(eb.mesh);
  const cb = new T.Mesh(G.box, M.noir); cb.scale.set(0.54, 0.35, 0.05); cb.position.set(ex, 1.5, ez + 0.008); cb.rotation.x = -0.12; cb.castShadow = true; scene.add(cb);
  sc.feuBal = colonne(sc, k, X_SCAN, 2.12, ZM - 0.5);

  /* ── aiguillage : un bras pivotant pousse le colis rejeté vers la ligne de rejet ── */
  const br = sc.bras = new T.Group(); br.position.set(X_D0 + 0.1, YR + 0.1, ZM - LW / 2 - 0.03); scene.add(br);
  const pale = new T.Mesh(G.box, M.danger); pale.scale.set(1.75, 0.13, 0.035); pale.position.set(0.875, 0, 0); pale.castShadow = true; br.add(pale);
  const moy = new T.Mesh(G.cyl, M.gris); moy.scale.set(0.05, 0.2, 0.05); br.add(moy);
  k.box(M.gris, X_D0 + 0.1, YR - 0.05, ZM - LW / 2 - 0.12, 0.22, 0.3, 0.16); k.cyl(M.galva, X_D0 + 0.5, YR + 0.02, ZM - LW / 2 - 0.13, 0.03, 0.6, "x");
  sc.vAig = M.voyant(0xff9a1a); k.box(sc.vAig, X_D0 + 0.1, YR + 0.25, ZM - LW / 2 - 0.12, 0.07, 0.05, 0.07);

  /* ── cercleuses ── */
  sc.cercA = construireCercleuse(sc, k, X_CA, ZM, -1);
  sc.cercB = construireCercleuse(sc, k, X_CB, ZJ, 1);
  k.poser(scene, { fin: true });
}

function construireCercleuse(sc, k, x, z, cote) {
  const M = sc.M, scene = sc.scene, o = { x, z };
  /* table : quatre courroies noires, tôle inox, fente du feuillard */
  k.ext(M.inox, x - 0.56, x + 0.56, YR - 0.06, YR - 0.012, z - 0.38, z + 0.38);
  const tt = o.tapis = texTapis(); tt.repeat.set(7, 1); const mt = M.tapis(tt);
  for (const dz of [-0.24, -0.08, 0.08, 0.24]) for (const dx of [-0.29, 0.29]) { const b = new T.Mesh(G.box, mt); b.scale.set(0.5, 0.012, 0.11); b.position.set(x + dx, YR - 0.006, z + dz); b.receiveShadow = true; scene.add(b); }
  k.ext(M.noir, x - 0.014, x + 0.014, YR - 0.05, YR - 0.002, z - 0.38, z + 0.38);
  /* bâti bleu sur roulettes */
  k.ext(M.bleuM, x - 0.36, x + 0.36, 0.11, YR - 0.06, z - 0.44, z + 0.44); k.ext(M.chassis, x - 0.37, x + 0.37, 0.07, 0.12, z - 0.45, z + 0.45);
  for (const dx of [-0.3, 0.3]) for (const dz of [-0.38, 0.38]) k.cyl(M.noir, x + dx, 0.04, z + dz, 0.04, 0.035, "x");
  k.box(M.noir, x + 0.365, 0.45, z, 0.01, 0.07, 0.3); k.box(M.noir, x - 0.365, 0.45, z, 0.01, 0.07, 0.3);
  for (let i = 0; i < 5; i++) k.box(M.chassis, x + 0.365, 0.2 + i * 0.03, z + cote * 0.22, 0.008, 0.012, 0.22);
  /* arche blanche */
  const y0 = YR - 0.28, y1 = YR + 1.0;
  for (const s of [-1, 1]) { k.ext(M.blancM, x - 0.09, x + 0.09, y0, y1, z + s * 0.45, z + s * 0.57); k.ext(M.noir, x - 0.03, x + 0.03, YR, y1 - 0.12, z + s * 0.445, z + s * 0.452); for (const yy of [YR + 0.2, YR + 0.7]) for (const dx of [-0.092, 0.092]) k.box(M.noir, x + dx, yy, z + s * 0.51, 0.006, 0.05, 0.03); }
  k.ext(M.blancM, x - 0.09, x + 0.09, y1 - 0.12, y1, z - 0.57, z + 0.57); k.ext(M.noir, x - 0.03, x + 0.03, y1 - 0.127, y1 - 0.12, z - 0.45, z + 0.45);
  for (const dx of [-1, 1]) { const e = enseigne(0.36, 0.085, 256, 60, (c, w, h) => { c.fillStyle = "#e9ebee"; c.fillRect(0, 0, w, h); ecrire(c, "MOSCA", 8, h / 2 + 2, 46, { g: 900, f: F_D, c: "#1b2f55", base: "middle", esp: "4px" }); c.fillStyle = "#1f4fa8"; c.fillRect(196, 22, 46, 16); }, 0.8); e.position.set(x + dx * 0.0915, y1 - 0.06, z - dx * 0.33); e.rotation.y = dx * PI / 2; scene.add(e); }
  /* coffret de commande, arrêt d'urgence */
  k.box(M.blancM, x, YR + 0.5, z + cote * 0.61, 0.16, 0.26, 0.08); k.box(M.jauneSecu, x + 0.02, YR + 0.72, z + cote * 0.6, 0.08, 0.08, 0.07); k.cyl(M.rouge, x + 0.02, YR + 0.72, z + cote * 0.645, 0.028, 0.03, "z");
  o.vOk = M.voyant(0x2dff5a, 1.6); k.box(o.vOk, x - 0.03, YR + 0.56, z + cote * 0.652, 0.03, 0.03, 0.006);
  /* bobine de feuillard */
  const bx = x + 0.5, bz = z + cote * 0.4;
  k.cyl(M.noir, bx, 0.43, bz, 0.27, 0.07, "z"); k.cyl(M.feuillard, bx, 0.43, bz, 0.2, 0.085, "z"); k.cyl(M.gris, bx, 0.43, bz, 0.05, 0.11, "z"); k.box(M.chassis, bx - 0.12, 0.3, bz, 0.06, 0.5, 0.05);
  const fz = z + cote * 0.67;
  o.feu = colonne(sc, k, x - 0.22, 2.02, fz); k.cyl(M.galva, x - 0.22, (YR - 0.28 + 2.02) / 2, fz, 0.014, 2.02 - YR + 0.28);
  /* presseur et boucle de feuillard (animés) */
  const pr = o.presseur = new T.Mesh(G.box, M.noir); pr.scale.set(0.05, 0.03, 0.84); pr.position.set(x + 0.07, YR + 0.78, z); pr.castShadow = true; scene.add(pr);
  o.boucle = [0, 1, 2].map(() => { const b = new T.Mesh(G.box, M.feuillard); b.visible = false; scene.add(b); return b; });
  o.eclair = new T.PointLight(0xfff0d0, 0, 2.2); o.eclair.position.set(x, YR + 0.25, z); scene.add(o.eclair);
  return o;
}

/* ───────── Le poste de rejet : bureau réglable, deux grands écrans, mur d'images, table de retrait ───────── */
function construirePoste(sc) {
  const M = sc.M, scene = sc.scene, k = new Kit();
  const bx0 = -0.55, bx1 = 1.55, bz0 = -0.43, bz1 = 0.37;
  const pl = new T.Mesh(plaqueArrondie(bx1 - bx0, bz1 - bz0, 0.036, 0.05), M.plateau); pl.position.set((bx0 + bx1) / 2, YR, (bz0 + bz1) / 2); pl.castShadow = pl.receiveShadow = true; scene.add(pl);
  for (const x of [bx0 + 0.16, bx1 - 0.16]) {
    k.box(M.bleuPoste, x, 0.3, -0.03, 0.09, 0.44, 0.17); k.box(M.bleu, x, 0.62, -0.03, 0.07, 0.3, 0.14); k.box(M.bleuPoste, x, 0.045, -0.03, 0.09, 0.06, 0.74);
    for (const z of [-0.36, 0.3]) k.cyl(M.noir, x, 0.012, z, 0.035, 0.024);
    k.box(M.bleuPoste, x, 0.75, -0.03, 0.1, 0.03, 0.6);
  }
  k.box(M.bleuPoste, (bx0 + bx1) / 2, 0.735, -0.2, bx1 - bx0 - 0.3, 0.05, 0.06);
  k.box(M.noir, 1.2, 0.5, -0.1, 0.18, 0.42, 0.4);                                         // unité centrale
  k.ext(M.galva, bx0 + 0.3, bx1 - 0.3, 0.66, 0.69, -0.36, -0.2);                           // goulotte
  /* mâts bleus, bras articulés, deux grands écrans */
  const E = sc.E = {};
  [["g", 0.01, 0.17, bx0 + 0.07], ["d", 0.99, -0.17, bx1 - 0.07]].forEach(([n, ex, lacet, mx]) => {
    k.box(M.bleuPoste, mx, 1.19, bz0 + 0.03, 0.05, 0.78, 0.05);
    k.tube(M.noir, [mx, 1.5, bz0 + 0.03], [lerp(mx, ex, 0.55), 1.5, bz0 - 0.03], 0.02); k.tube(M.noir, [lerp(mx, ex, 0.55), 1.5, bz0 - 0.03], [ex, 1.47, bz0 + 0.035], 0.02);
    const g = new T.Group(); g.position.set(ex, 1.47, bz0 + 0.075); g.rotation.y = lacet; scene.add(g);
    const c = new T.Mesh(G.box, M.noir); c.scale.set(0.975, 0.43, 0.022); c.castShadow = true; g.add(c);
    const e = E[n] = ecran(0.95, 0.405, 1024, 436, 1.55); e.mesh.position.z = 0.0125; g.add(e.mesh);
  });
  sc.feuPoste = colonne(sc, k, bx0 + 0.07, 1.6, bz0 + 0.03);
  /* clavier, souris, socle du lecteur, imprimante d'étiquettes */
  const cl = new T.Mesh(G.box, [M.noir, M.noir, new T.MeshStandardMaterial({ map: texClavier(), roughness: 0.6 }), M.noir, M.noir, M.noir]); cl.scale.set(0.44, 0.018, 0.15); cl.position.set(0.78, YR + 0.009, 0.18); scene.add(cl);
  k.box(M.noir, 1.12, YR + 0.012, 0.2, 0.06, 0.024, 0.1); k.box(M.caout, 1.12, YR + 0.002, 0.2, 0.22, 0.004, 0.2);
  k.box(M.noir, -0.36, YR + 0.03, 0.2, 0.09, 0.06, 0.11);
  k.box(M.gris, 1.36, YR + 0.1, 0.02, 0.24, 0.2, 0.3); k.box(M.noir, 1.36, YR + 0.205, 0.02, 0.2, 0.012, 0.26); k.box(M.feuillard, 1.36, YR + 0.07, 0.19, 0.11, 0.003, 0.08); sc.vImp = M.voyant(0x2dff5a, 1.5); k.box(sc.vImp, 1.44, YR + 0.16, 0.172, 0.014, 0.014, 0.004);
  /* tapis anti-fatigue, tabouret */
  k.box(M.caout, 0.5, 0.008, 0.85, 1.6, 0.016, 0.8); k.ext(M.peinture, -0.3, 1.3, 0.016, 0.018, 1.2, 1.24);
  const tx = -0.95, tz = 0.9;
  for (let i = 0; i < 5; i++) { const a = i * TAU / 5; k.box(M.chrome, tx + Math.sin(a) * 0.14, 0.06, tz + Math.cos(a) * 0.14, 0.035, 0.03, 0.3, a); k.cyl(M.noir, tx + Math.sin(a) * 0.28, 0.03, tz + Math.cos(a) * 0.28, 0.03, 0.03); }
  k.cyl(M.chrome, tx, 0.35, tz, 0.025, 0.56); k.cyl(M.tissuBleu, tx, 0.66, tz, 0.2, 0.08); k.box(M.noir, tx, 0.82, tz + 0.2, 0.05, 0.3, 0.025); k.box(M.tissuBleu, tx, 0.98, tz + 0.2, 0.36, 0.24, 0.06);
  const an = new T.Mesh(G.tore, M.chrome); an.scale.set(0.2, 0.2, 0.2); an.rotation.x = PI / 2; an.position.set(tx, 0.28, tz); an.castShadow = true; scene.add(an);

  /* mur d'images au-dessus de la ligne */
  const tv = E.tv = ecran(2.7, 1.52, 1280, 720, 1.45), gt = new T.Group(); gt.position.set(0.5, 3.06, Z_MUR + 0.26); gt.rotation.x = 0.07; scene.add(gt);
  const ct = new T.Mesh(G.box, M.noir); ct.scale.set(2.78, 1.6, 0.06); ct.castShadow = true; gt.add(ct); tv.mesh.position.z = 0.032; gt.add(tv.mesh);
  for (const dx of [-0.8, 0.8]) k.box(M.chassis, 0.5 + dx, 3.06, Z_MUR + 0.12, 0.08, 1.0, 0.2);

  /* table de retrait : une case par dossard, panneau lumineux au-dessus */
  const t = TABLE, tm = (t.z0 + t.z1) / 2;
  k.ext(M.plateau, t.x0, t.x1, t.y - 0.04, t.y, t.z0, t.z1); k.ext(M.bleuPoste, t.x0, t.x1, t.y - 0.1, t.y - 0.04, t.z0 + 0.03, t.z0 + 0.07); k.ext(M.bleuPoste, t.x0, t.x1, t.y - 0.1, t.y - 0.04, t.z1 - 0.07, t.z1 - 0.03);
  k.ext(M.grisClair, t.x0 + 0.05, t.x1 - 0.05, 0.2, 0.225, t.z0 + 0.04, t.z1 - 0.04);
  for (const x of [t.x0 + 0.04, (t.x0 + t.x1) / 2, t.x1 - 0.04]) for (const z of [t.z0 + 0.05, t.z1 - 0.05]) { k.box(M.bleuPoste, x, (t.y - 0.04) / 2, z, 0.05, t.y - 0.04, 0.05); k.cyl(M.noir, x, 0.01, z, 0.035, 0.02); }
  for (let i = 0; i <= 7; i++) k.box(M.bleuPoste, t.x0 + 0.06 + i * t.pas, t.y + 0.05, tm, 0.012, 0.1, t.z1 - t.z0 - 0.06);
  for (const x of [t.x0 + 0.03, t.x1 - 0.03]) k.box(M.bleuPoste, x, (t.y + 2.56) / 2, t.z0 + 0.03, 0.05, 2.56 - t.y, 0.05);
  k.ext(M.bleuPoste, t.x0, t.x1, 2.5, 2.56, t.z0, t.z0 + 0.06);
  const titre = enseigne(2.9, 0.2, 1024, 72, (x, w, h) => { x.fillStyle = "#0e1f44"; x.fillRect(0, 0, w, h); ecrire(x, "RETRAIT DES COLIS EN ERREUR", w / 2, h / 2 + 3, 46, { g: 900, f: F_D, al: "center", base: "middle", esp: "5px" }); }, 1.25);
  titre.position.set((t.x0 + t.x1) / 2, 2.69, t.z0 + 0.065); scene.add(titre); k.box(M.chassis, (t.x0 + t.x1) / 2, 2.69, t.z0 + 0.045, 2.96, 0.26, 0.03);
  E.cases = [];
  for (let i = 0; i < 7; i++) {
    const e = ecran(0.48, 0.36, 256, 192, 1.25); e.mesh.position.set(caseX(i), 2.28, t.z0 + 0.075); scene.add(e.mesh); E.cases.push(e);
    k.box(M.noir, caseX(i), 2.28, t.z0 + 0.055, 0.5, 0.38, 0.03);
  }
  k.poser(scene, { fin: true });
}
