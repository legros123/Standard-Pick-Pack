/* ───────── Démarrage de la page de démonstration (journée simulée) ───────── */
(function () {
  const $ = id => document.getElementById(id), voile = $("voile"), opts = window.__PR_OPTS || {};
  const DEMO = {
    taux: 0.024, rejMax: 120, cpt: { pese: 4812, rej: 23, dec: 31 },
    vig: [{ mat: "3142", n: 6, d: "rouge" }, { mat: "2087", n: 5, d: "rouge" }, { mat: "1560", n: 4, d: "orange" }, { mat: "2291", n: 4, d: "orange" }, { mat: "1873", n: 3, d: "jaune" }, { mat: "3306", n: 3, d: "jaune" }]
  };
  const polices = ["900 40px 'Big Shoulders Display'", "700 40px 'Big Shoulders Display'", "400 20px Lexend", "500 20px Lexend", "700 20px Lexend"];
  const attente = document.fonts && document.fonts.load ? Promise.race([Promise.all(polices.map(p => document.fonts.load(p))), new Promise(r => setTimeout(r, 2500))]).catch(() => {}) : Promise.resolve();
  attente.then(() => new Promise(r => setTimeout(r, 30))).then(() => {
    let sc;
    const boutons = [], maj = (i, auto) => boutons.forEach((b, k) => b.setAttribute("aria-pressed", String(k === (auto ? PosteRejet3D.PLANS.length : i))));
    try { sc = new PosteRejet3D($("gl"), Object.assign({}, DEMO, { surPlan: maj }, opts)); }
    catch (e) { $("voile-txt").textContent = "La scène 3D n'a pas pu démarrer sur ce poste (affichage WebGL indisponible)."; voile.querySelector("i").hidden = true; if (window.console) console.error(e); return; }
    window.__sc = sc;
    PosteRejet3D.PLANS.forEach((p, i) => { const b = document.createElement("button"); b.type = "button"; b.id = "plan-" + i; b.textContent = p.nom; b.onclick = () => sc.allerAuPlan(i, false); $("plans").appendChild(b); boutons.push(b); });
    const ba = document.createElement("button"); ba.type = "button"; ba.id = "plan-auto"; ba.textContent = "Visite automatique"; ba.onclick = () => sc.allerAuPlan(sc.plan, true); $("plans").appendChild(ba); boutons.push(ba);
    maj(0, sc.auto);
    const n0 = v => v == null ? "–" : Math.round(v).toLocaleString("fr-FR");
    const cpts = () => { $("c-pes").textContent = n0(sc.cpt.pese); $("c-rej").textContent = n0(sc.cpt.rej); $("c-dec").textContent = n0(sc.cpt.dec); };
    cpts(); setInterval(cpts, 500);
    if (!opts.manuel) {
      sc.demarrer();
      document.addEventListener("visibilitychange", () => { if (document.hidden) sc.arreter(); else sc.demarrer(); });
    }
    requestAnimationFrame(() => requestAnimationFrame(() => voile.classList.add("parti")));
  });
})();
