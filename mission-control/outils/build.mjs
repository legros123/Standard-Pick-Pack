// Compilation : src/ → app.js (un seul fichier, fonctionne aussi en ouvrant index.html depuis un dossier).
import * as esbuild from 'esbuild';

const surveiller = process.argv.includes('--watch');
const options = {
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  minify: !surveiller,
  sourcemap: surveiller ? 'inline' : false,
  target: ['chrome87', 'edge88', 'firefox91', 'safari15'],
  outfile: 'app.js',
  legalComments: 'eof',
  logLevel: 'info',
  banner: { js: '/* PICK // MISSION CONTROL — compilé depuis src/ (npm run build). Ne pas modifier ce fichier à la main. */' },
};
if (surveiller) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log('Surveillance de src/ …');
} else {
  await esbuild.build(options);
}
