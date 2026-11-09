// Petit serveur local (sans dépendance) : node outils/serveur.mjs [port]
// Sert le dossier de l'application, et le dossier parent (pour le lien vers les Standards).
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const port = Number(process.argv[2]) || 8080;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.csv': 'text/csv; charset=utf-8', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8' };

http.createServer(async (req, res) => {
  try {
    let chemin = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (chemin === '/') { res.writeHead(302, { Location: '/mission-control/' }); res.end(); return; }
    let f = normalize(join(racine, chemin));
    if (!f.startsWith(racine)) { res.writeHead(403); res.end(); return; }
    if ((await stat(f).catch(() => null))?.isDirectory()) f = join(f, 'index.html');
    const corps = await readFile(f);
    const s = await stat(f);
    res.writeHead(200, { 'Content-Type': types[extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Last-Modified': s.mtime.toUTCString() });
    res.end(corps);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Introuvable');
  }
}).listen(port, () => console.log(`PICK // MISSION CONTROL : http://localhost:${port}/mission-control/`));
