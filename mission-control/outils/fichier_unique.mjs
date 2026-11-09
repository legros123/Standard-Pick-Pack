// Fabrique une démo en UN SEUL fichier HTML (styles, moteur 3D, polices intégrés) :
//   npm run build && node outils/fichier_unique.mjs
// → demo/PICK-Mission-Control-demo.html, à ouvrir directement (double-clic, pièce jointe, clé USB).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const lire = (f) => readFileSync(join(racine, f), 'utf8');

let css = lire('styles.css').replace(/url\(polices\/([\w.-]+\.woff2)\)/g, (_, f) =>
  `url(data:font/woff2;base64,${readFileSync(join(racine, 'polices', f)).toString('base64')})`);
let js = lire('app.js')
  // hors du site, le lien vers l'application Standards pointe vers la version publiée
  .replace('../index.html#', 'https://legros123.github.io/Standard-Pick-Pack/index.html#');
if (/<\/script/i.test(js)) js = js.replace(/<\/script/gi, '<\\/script');

const html = lire('index.html')
  .replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${css}\n</style>`)
  .replace('<script src="app.js"></script>', () => `<script>\n${js}\n</script>`);

mkdirSync(join(racine, 'demo'), { recursive: true });
const sortie = join(racine, 'demo', 'PICK-Mission-Control-demo.html');
writeFileSync(sortie, html);
console.log(`${sortie} — ${(html.length / 1024 / 1024).toFixed(2)} Mo`);
