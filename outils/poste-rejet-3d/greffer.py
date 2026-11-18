# Greffe la scène 3D du poste de rejet dans le pilotage (l'original n'est jamais modifié).
# Usage : python3 outils/poste-rejet-3d/greffer.py <pilotage d'origine.html> outils/poste-rejet-3d/sortie/greffe.html <pilotage 3D.html>
import sys
src, greffe, dst = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(src, encoding="utf-8").read(); g = open(greffe, encoding="utf-8").read()
# pilotage déjà greffé : on remplace seulement le bloc 3D (three.js + scène), le reste est déjà branché
DEBUT = "<!-- ═══ Scène 3D du poste de rejet"
if DEBUT in s:
    i = s.index(DEBUT); j = s.index("</script>\n", s.index('<script id="poste-rejet-3d">', i)) + len("</script>\n")
    s = s[:i] + g + s[j:]
    open(dst, "w", encoding="utf-8").write(s)
    print("déjà greffé : scène 3D mise à jour ·", dst, round(len(s.encode("utf-8")) / 1024), "Ko")
    sys.exit(0)
def rempl(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)
# 1. le moteur et la scène, juste avant le script du tableau de bord
rempl('\n<script>\n"use strict";\n', '\n' + g + '<script>\n"use strict";\n')
# 2. l'enveloppe : la 3D par-dessus la scène dessinée, qui reste le filet de sécurité
enveloppe = r'''/* ───────── Scène « la qualité » en vraie 3D (WebGL, three.js embarqué plus haut dans la page) : la ligne, la balance,
   les cercleuses, le poste de rejet et ses grands écrans, les dossards qui viennent chercher leurs colis.
   La scène dessinée ci-dessus reste en place : elle s'affiche tant que la 3D n'est pas prête et reprend la main si le poste
   ne sait pas afficher du WebGL ou s'il est trop lent. Dans l'adresse : ?3d=non pour s'en passer, ?3d=oui pour l'essayer même
   sans carte graphique, ?3d=force pour l'imposer en qualité maximale. ───────── */
class SceneRejet {
  constructor(cv) {
    this.cv = cv; this.plan = new SceneControle(cv); this.sc3 = null; this.c3 = null; this.rate = false; this.actif = false; this.args = [null, [], null];
    const veut = new URLSearchParams(location.search).get("3d");
    if (veut === "non" || veut === "0" || !window.PosteRejet3D) { this.rate = true; return; }
    this.force = veut === "force"; this.insiste = this.force || veut === "oui";
    const pol = ["900 40px 'Big Shoulders Display'", "700 40px 'Big Shoulders Display'", "400 20px Lexend", "500 20px Lexend", "700 20px Lexend"];
    const pretes = document.fonts && document.fonts.load ? Promise.all(pol.map(p => document.fonts.load(p))).catch(() => {}) : Promise.resolve();
    Promise.race([pretes, new Promise(r => setTimeout(r, 3000))]).then(() => setTimeout(() => this.construire(), 700));     // après les polices, hors du démarrage de la page
  }
  construire() {
    if (this.sc3 || this.rate) return;
    /* sonde discrète : ce poste sait-il afficher du WebGL ? */
    try {
      const e = document.createElement("canvas"), gl = e.getContext("webgl2") || e.getContext("webgl"); if (!gl) throw 0;
      const d = gl.getExtension("WEBGL_debug_renderer_info"), carte = d ? String(gl.getParameter(d.UNMASKED_RENDERER_WEBGL)) : "", p = gl.getExtension("WEBGL_lose_context"); if (p) p.loseContext();
      if (!this.insiste && /swiftshader|llvmpipe|software|basic render/i.test(carte)) throw 0;       // rendu logiciel, sans carte graphique : trop lent pour la 3D
    } catch (e) { this.rate = true; return; }
    const c = document.createElement("canvas");
    c.setAttribute("role", "img"); c.setAttribute("aria-label", this.cv.getAttribute("aria-label") || "");
    this.cv.parentNode.insertBefore(c, this.cv.nextSibling);
    try {
      /* tour de caméra calé sur la durée d'un écran : ensemble, retrait, allée (les dossards arrivent à la table entre 6,5 et 12 s), puis poste, balance, cercleuses */
      this.sc3 = new window.PosteRejet3D(c, { demo: false, gestes: false, rejouer: true, zoom: 0.9, qualite: this.force ? "haute" : "auto", alleger: this.force || typeof Fluidite === "undefined" ? 0 : Fluidite.niv,
        tour: [[0, 8], [2, 6], [1, 6], [3, 6], [4, 5], [5, 5]], vague: [6.5, 12], surTropLent: () => this.repli("poste trop lent") });
    } catch (e) { this.sc3 = null; c.remove(); this.rate = true; if (window.console) console.warn("Scène 3D indisponible : la scène dessinée reste en place.", e); return; }
    this.c3 = c; this.sc3.donnees(...this.args); this.cv.style.visibility = "hidden";
    if (this.actif) { this.plan.arreter(); this.sc3.demarrer(); } else this.sc3.rafraichir();
  }
  repli(motif) {
    if (!this.sc3) return;
    this.sc3.liberer(); this.c3.remove(); this.sc3 = this.c3 = null; this.rate = true; this.cv.style.visibility = "";
    if (window.console) console.warn("Scène 3D abandonnée (" + motif + ") : retour à la scène dessinée.");
    this.plan.cadre = null; if (this.actif) this.plan.demarrer(); else this.plan.rafraichir();
  }
  get cadre() { return this.plan.cadre; }
  set cadre(v) { this.plan.cadre = v; }
  donnees(taux, vig, cpt) { this.args = [taux, vig, cpt]; this.plan.donnees(taux, vig); if (this.sc3) this.sc3.donnees(taux, vig, cpt); }
  demarrer() { this.actif = true; if (this.sc3) this.sc3.demarrer(); else this.plan.demarrer(); }
  arreter() { this.actif = false; this.plan.arreter(); if (this.sc3) this.sc3.arreter(); }
  rafraichir() { if (this.sc3) this.sc3.rafraichir(); else this.plan.rafraichir(); }
}

'''
rempl('/* ───────── Scène « les allées » : le vrai plan,', enveloppe + '/* ───────── Scène « les allées » : le vrai plan,')
# 3. branchements
rempl('Scenes.ctrl = new SceneControle($("#c-conv"));', 'Scenes.ctrl = new SceneRejet($("#c-conv"));')
rempl('Scenes.ctrl.donnees(fini(rej) && pese > 0 ? rej / pese : null, A.vigilance);', 'Scenes.ctrl.donnees(fini(rej) && pese > 0 ? rej / pese : null, A.vigilance, { pese, rej, dec, max: S.rej_orange });')
rempl('aria-label="Animation : le convoyeur, la balance, le poste de contrôle, et les opérateurs qui viennent chercher les colis de leurs erreurs"',
      'aria-label="Animation : la ligne de convoyeurs, la balance, les cercleuses, le poste de rejet et ses grands écrans, et les opérateurs en dossard qui viennent chercher les colis de leurs erreurs"')
open(dst, "w", encoding="utf-8").write(s)
print("écrit", dst, round(len(s.encode("utf-8")) / 1024), "Ko")
