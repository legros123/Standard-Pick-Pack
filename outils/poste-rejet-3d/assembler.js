/* Assemble la scène 3D du poste de rejet :
   - ../../poste-rejet-3d.html : page autonome (three.js embarqué, fonctionne sans réseau) ;
   - sortie/greffe.html : bloc à greffer dans le pilotage avec greffer.py ;
   - sortie/artefact.html : variante dont three.js vient du CDN.
   Usage : node outils/poste-rejet-3d/assembler.js */
const fs = require("fs"), path = require("path"), D = __dirname;
const lire = f => fs.readFileSync(path.join(D, f), "utf8");
const code = ["00-base.js", "10-decor.js", "20-persos.js", "30-sim.js", "40-main.js"].map(f => lire("src/" + f)).join("\n");
try { new Function("window", code); new Function(lire("src/boot.js")); } catch (e) { console.error("ERREUR DE SYNTAXE :", e.message); process.exit(1); }
const css = lire("src/page.css"), polices = lire("src/polices.css"), corps = lire("src/page.body.html"), boot = lire("src/boot.js");
const three = lire("three.min.js");
const moteur = `<script>\n(function () {\n"use strict";\n${code}\n})();\n</script>`;
const scene = `${moteur}\n<script>\n${boot}</script>`;
const titre = "Poste de rejet 3D";
const autonome = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${titre}</title>
<meta name="description" content="Animation 3D du poste de rejet du service Pick &amp; Pack : balance, aiguillage, cercleuses, poste de contrôle et dossards.">
<style>
${css}</style>
<style id="polices">
${polices}</style>
</head>
<body>
${corps}
<!-- three.js r149 (licence MIT), embarqué pour fonctionner sans accès réseau -->
<script>
${three}
</script>
${scene}
</body>
</html>
`;
const artefact = `<title>${titre}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
${css}</style>
<style id="polices">
${polices}</style>
${corps}
<script src="https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js"></script>
${scene}
`;
const greffe = `<!-- ═══ Scène 3D du poste de rejet (écran « La qualité ») : three.js r149, licence MIT, embarqué pour fonctionner sans accès réseau ═══ -->
<script id="three-r149">
${three}
</script>
<script id="poste-rejet-3d">
(function () {
"use strict";
${code}
})();
</script>
`;
fs.mkdirSync(path.join(D, "sortie"), { recursive: true });
fs.writeFileSync(path.join(D, "../../poste-rejet-3d.html"), autonome);
fs.writeFileSync(path.join(D, "sortie/artefact.html"), artefact);
fs.writeFileSync(path.join(D, "sortie/greffe.html"), greffe);
console.log("autonome", (autonome.length / 1024).toFixed(0) + " Ko", "· artefact", (artefact.length / 1024).toFixed(0) + " Ko", "· greffe", (greffe.length / 1024).toFixed(0) + " Ko");
