// Vérification visuelle automatisée (Playwright + Chromium) :
//   node outils/serveur.mjs 8080 &   puis   node outils/verifier.mjs [dossier-captures]
// Produit des captures des modes, panneaux, états dégradés et résolutions cibles,
// et signale les débordements horizontaux et les erreurs JavaScript.
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }

const SORTIE = process.argv[2] || 'captures';
const BASE = process.env.BASE || 'http://localhost:8080/mission-control/';
mkdirSync(SORTIE, { recursive: true });
const args = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const navigateur = await chromium.launch({ args });
const bilan = [];

async function page(nom, { w = 1920, h = 1080, q = '', dsf = 1, toucher = false } = {}) {
  const ctx = await navigateur.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf, hasTouch: toucher });
  const p = await ctx.newPage();
  const erreurs = [];
  p.on('pageerror', (e) => erreurs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
  await p.goto(BASE + q);
  await p.waitForFunction(() => window.PickMC?.etat?.scene, null, { timeout: 30000 });
  await p.waitForTimeout(2500);
  return { p, ctx, erreurs, nom };
}

async function capturer({ p, erreurs }, nom) {
  const d = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight, ih: innerHeight }));
  await p.screenshot({ path: `${SORTIE}/${nom}.png` });
  const deb = d.sw > d.iw + 1 ? `DÉBORDEMENT horizontal ${d.sw}>${d.iw}` : '';
  bilan.push(`${nom.padEnd(28)} ${deb || 'ok'}${erreurs.length ? ` · ERREURS: ${erreurs.join(' | ')}` : ''}`);
}

const clic = (p, sel) => p.locator(sel).first().click();
const SUSP = 'anim=suspendues';

// 1. Modes
{ const x = await page('exploitation', { q: `?${SUSP}` }); await capturer(x, '01-exploitation-1080p');
  await clic(x.p, '.mode[data-mode="immersion"]'); await x.p.waitForTimeout(1200); await capturer(x, '02-immersion-1080p');
  await clic(x.p, '.mode[data-mode="briefing"]'); await x.p.waitForTimeout(800); await capturer(x, '03-briefing-1080p');
  await clic(x.p, '.mode[data-mode="exploitation"]'); await x.p.waitForTimeout(800);
  await clic(x.p, '.kpi[data-kpi="lignes"]'); await x.p.waitForTimeout(700); await capturer(x, '04-detail-kpi-lignes');
  await clic(x.p, '.tiroir-retour'); await x.p.waitForTimeout(500);
  await clic(x.p, '.kpi[data-kpi="rejets"]'); await x.p.waitForTimeout(700); await capturer(x, '05-detail-kpi-rejets');
  await clic(x.p, '.tiroir-fermer'); await x.p.waitForTimeout(500);
  await clic(x.p, '.etiquette[data-zone="controle"]'); await x.p.waitForTimeout(1200); await capturer(x, '06-zoom-zone-controle');
  await clic(x.p, '.tiroir-retour'); await x.p.waitForTimeout(800);
  await clic(x.p, '.prio[data-alerte]'); await x.p.waitForTimeout(700); await capturer(x, '07-detail-alerte');
  await clic(x.p, '.tiroir-fermer'); await x.p.waitForTimeout(500);
  await clic(x.p, '[data-action="reglages"]'); await x.p.waitForTimeout(700); await capturer(x, '08-reglages-affichage');
  await clic(x.p, '[data-onglet="seuils"]'); await x.p.waitForTimeout(500); await capturer(x, '09-reglages-seuils');
  await clic(x.p, '[data-onglet="donnees"]'); await x.p.waitForTimeout(500); await capturer(x, '10-reglages-donnees');
  await clic(x.p, '.tiroir-fermer'); await x.p.waitForTimeout(500);
  await clic(x.p, '[data-action="filtres"]'); await x.p.waitForTimeout(500); await capturer(x, '11-filtres');
  await clic(x.p, '.segment[data-k="periode"] [data-v="semaine"]'); await x.p.waitForTimeout(1500);
  await clic(x.p, '.popover [data-fermer]'); await x.p.waitForTimeout(800); await capturer(x, '12-vue-semaine');
  await x.ctx.close(); }

// 2. Résolutions
for (const [w, h, dsf, n] of [[3840, 2160, 1, '13-4k-3840x2160'], [1920, 1080, 2, '14-1080p-dsf2'], [1366, 768, 1, '15-portable-1366x768'], [1440, 900, 1, '16-portable-1440x900']]) {
  const x = await page(n, { w, h, dsf, q: `?${SUSP}` }); await capturer(x, n); await x.ctx.close();
}

// 3. États
{ const x = await page('ancienne', { q: `?${SUSP}&scenario=ancienne` }); await capturer(x, '17-etat-donnees-anciennes'); await x.ctx.close(); }
{ const x = await page('interrompue', { q: `?${SUSP}&scenario=interrompue` });
  await x.p.evaluate(() => window.PickMC.pilote.actualiser()); await x.p.waitForTimeout(1200); await capturer(x, '18-etat-connexion-interrompue'); await x.ctx.close(); }
{ const x = await page('vide', { q: `?${SUSP}&scenario=vide` }); await capturer(x, '19-etat-sans-donnees'); await x.ctx.close(); }
{ const x = await page('webgl0', { q: `?${SUSP}&webgl=0` }); await capturer(x, '20-3d-indisponible-repli-2d'); await x.ctx.close(); }
{ const x = await page('incident', { q: '' });
  await x.p.waitForTimeout(1500);
  await x.p.evaluate(() => window.PickMC.pilote.regler({ demo: { scenario: 'incident' } }, { recharger: true, memoriser: false }));
  await x.p.waitForTimeout(1600); await capturer(x, '21-nouvelle-alerte-incident'); await x.ctx.close(); }
{ const x = await page('objectif', { q: '?scenario=objectif' });
  await x.p.waitForTimeout(1000);
  await x.p.evaluate(() => { window.PickMC.pilote.connecteur.debutSession -= 180000; return window.PickMC.pilote.actualiser(); });
  await x.p.waitForTimeout(900); await capturer(x, '22-objectif-atteint-celebration'); await x.ctx.close(); }

// 4. Tactile
{ const x = await page('tactile', { q: `?${SUSP}`, toucher: true });
  await x.p.locator('.kpi[data-kpi="qualite"]').tap(); await x.p.waitForTimeout(700); await capturer(x, '23-tactile-detail-qualite');
  await x.p.locator('.tiroir-fermer').tap(); await x.p.waitForTimeout(500);
  await x.p.locator('.etiquette[data-zone="expedition"]').tap(); await x.p.waitForTimeout(1000); await capturer(x, '24-tactile-zone-expedition');
  await x.ctx.close(); }

// 5. Briefing 4K (lecture à distance)
{ const x = await page('briefing4k', { w: 3840, h: 2160, q: `?${SUSP}&mode=briefing` }); await capturer(x, '25-briefing-4k'); await x.ctx.close(); }

await navigateur.close();
console.log(bilan.join('\n'));
