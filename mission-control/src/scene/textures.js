/* Textures procédurales (aucun fichier image) : carton, tapis, sol. */
import * as THREE from 'three';

function toile(w, h, dessin) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  dessin(c.getContext('2d'), w, h);
  return c;
}

function bruit(ctx, w, h, force, n = 2400) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * force;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}

/** Carton ondulé : fibres, ruban adhésif, étiquette d'expédition. */
export function texCarton(anisotropie = 4) {
  const c = toile(256, 256, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#b48a5a');
    g.addColorStop(1, '#a07746');
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      x.strokeStyle = `rgba(80,50,20,${0.04 + Math.random() * 0.05})`;
      x.beginPath();
      const y = Math.random() * h;
      x.moveTo(0, y);
      x.lineTo(w, y + (Math.random() - 0.5) * 8);
      x.stroke();
    }
    bruit(x, w, h, 0.06);
    // ruban adhésif
    x.fillStyle = 'rgba(205,175,125,0.85)';
    x.fillRect(w * 0.42, 0, w * 0.16, h);
    x.fillStyle = 'rgba(255,255,255,0.12)';
    x.fillRect(w * 0.44, 0, w * 0.03, h);
    // étiquette
    x.fillStyle = '#eef1f2';
    x.fillRect(w * 0.08, h * 0.1, w * 0.28, h * 0.22);
    x.fillStyle = '#1b1f24';
    for (let i = 0; i < 9; i++) x.fillRect(w * 0.1 + i * 6, h * 0.14, 2 + (i % 3), h * 0.09);
    x.fillRect(w * 0.1, h * 0.26, w * 0.2, 3);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = anisotropie;
  return t;
}

/** Bande transporteuse : nervures transversales, répétée sur la longueur. */
export function texTapis() {
  const c = toile(64, 128, (x, w, h) => {
    x.fillStyle = '#10151d';
    x.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16) {
      x.fillStyle = '#1d2531';
      x.fillRect(0, y, w, 5);
      x.fillStyle = '#070a0f';
      x.fillRect(0, y + 5, w, 2);
    }
    bruit(x, w, h, 0.05, 400);
  });
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Sol béton résiné : quadrillage technique (1 m / 5 m). */
export function texSol(anisotropie = 8) {
  const c = toile(1024, 1024, (x, w, h) => {
    x.fillStyle = '#0b1322';
    x.fillRect(0, 0, w, h);
    bruit(x, w, h, 0.035, 9000);
    const pas = w / 10;
    for (let i = 0; i <= 10; i++) {
      x.strokeStyle = i % 5 === 0 ? 'rgba(90,170,255,0.22)' : 'rgba(90,170,255,0.08)';
      x.lineWidth = i % 5 === 0 ? 3 : 1.5;
      x.beginPath(); x.moveTo(i * pas, 0); x.lineTo(i * pas, h); x.stroke();
      x.beginPath(); x.moveTo(0, i * pas); x.lineTo(w, i * pas); x.stroke();
    }
  });
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = anisotropie;
  return t;
}

/** Halo radial (particules, lueurs au sol). */
export function texHalo() {
  const c = toile(128, 128, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
  });
  return new THREE.CanvasTexture(c);
}
