
/* ════════════════════════════════════════════════════════════════════════════
   L'application : chargement des données, rail des essentiels, rotation des écrans,
   fenêtres (encadrement, données, réglages, aide), clavier.
   ════════════════════════════════════════════════════════════════════════════ */
const Appli = (() => {
  const CLE = "pilotage-pick-pack";
  const REG_DEFAUT = { duree: 20, rotation: true, exclus: [], noms: false, finVisee: "", dernierAccident: "", message: "" };
  const params = new URLSearchParams(location.search);
  const FICHIER = "pilotage_data.js";
  let reg = Object.assign({}, REG_DEFAUT);
  let M = null, brut = null, mode = "attente", pret = false;
  let iActif = -1, debutEcran = 0, gelDepuis = 0, pause = false, deroule = false, fenetre = null;
  let secs = [], puces = [], dispo = [], infos = [], iInfo = 0, observateur = null, veille = null;

  /* ───────── réglages ───────── */
  function lireReglages() {
    try { const s = JSON.parse(localStorage.getItem(CLE) || "null"); if (s && typeof s === "object") reg = Object.assign({}, REG_DEFAUT, s); } catch (e) { /* stockage indisponible : réglages par défaut */ }
    if (!Array.isArray(reg.exclus)) reg.exclus = [];
    const d = parseFloat(params.get("duree")); if (d >= 5 && d <= 600) reg.duree = d;
    if (params.get("fixe") === "1") reg.rotation = false;
    if (params.get("noms") === "1") reg.noms = true;
    reg.duree = clamp(+reg.duree || 20, 5, 600);
  }
  function ecrireReglages() { try { localStorage.setItem(CLE, JSON.stringify(reg)); } catch (e) { /* tant pis : valable pour cette session */ } }

  /* ───────── construction ───────── */
  function construire() {
    const scene = $("#scene"), fil = $("#fil");
    ECRANS.forEach((e, i) => {
      const s = document.createElement("section");
      s.className = "ecran"; s.id = "e-" + e.id; s.setAttribute("aria-label", e.nom);
      s.innerHTML = `<div class="tete"><div><div class="sur">${i + 1} / ${ECRANS.length} · ${esc(e.nom)}</div><h2>${esc(e.question)}</h2></div><p class="verdict" id="vd-${e.id}"></p></div>${e.html}`;
      scene.appendChild(s); secs.push(s);
      const p = document.createElement("button");
      p.className = "puce"; p.type = "button"; p.title = e.nom; p.setAttribute("aria-label", `Écran ${i + 1} : ${e.nom}`);
      p.innerHTML = `<i></i><span>${esc(e.nom)}</span>`;
      p.addEventListener("click", () => aller(i, i < iActif ? -1 : 1));
      fil.appendChild(p); puces.push(p);
    });
    Scenes.pile = new ScenePile($("#c-pile"));
    Scenes.conv = new SceneConvoyeur($("#c-conv"));
    Scenes.allees = new SceneAllees($("#c-allees"));
    const s = stdDuJour(), im = new Image();
    im.onload = () => { stdDispo = true; if (brut) appliquer(brut); };
    im.onerror = () => { stdDispo = false; };
    im.src = `slides/P${s[0].slice(1).padStart(2, "0")}-1.webp`;
  }

  /* ───────── données ───────── */
  function chargerFichier() {
    if (params.get("demo") === "1") return Promise.resolve(null);
    return new Promise(res => {
      const s = document.createElement("script");
      let clos = false;
      const fin = ok => { if (clos) return; clos = true; s.remove(); res(ok); };
      window.PP_DATA = undefined;
      s.src = FICHIER + "?t=" + Date.now();
      s.onload = () => fin(window.PP_DATA && typeof window.PP_DATA === "object" ? window.PP_DATA : false);
      s.onerror = () => fin(null);
      document.head.appendChild(s);
      setTimeout(() => fin(null), 8000);
    });
  }
  async function cycle() {
    const d = await chargerFichier();
    if (d) { mode = "live"; appliquer(d); }
    else if (mode === "live" && brut) appliquer(brut);        // fichier absent ou en cours d'écriture : on garde le dernier état, l'âge augmente
    else { mode = "demo"; appliquer(Demo.instantane()); }
  }
  function appliquer(d) {
    brut = d;
    const avant = M, forcer = {};
    if (reg.finVisee) forcer.finVisee = reg.finVisee;
    try { M = calculer(d, forcer); } catch (err) { console.error("Données illisibles", err); return; }
    majRail(); majSource();
    ECRANS.forEach((e, i) => {
      let ok = false;
      try { ok = !!e.dispo(M); } catch (err) { ok = false; }
      if (ok) { try { const v = e.maj(M, reg); if (v != null) $("#vd-" + e.id).innerHTML = v; } catch (err) { console.error("Écran « " + e.nom + " »", err); ok = false; } }
      dispo[i] = ok && !reg.exclus.includes(e.id);
      puces[i].classList.toggle("saute", !dispo[i]);
      secs[i].hidden = deroule && !dispo[i];
    });
    construireInfos();
    if (avant && avant.aCharge && avant.pct < 1 && M.pct >= 1 && M.fait > 0) Fete.lancer();
    if (!pret) { pret = true; reglerMode(true); }
    else if (!deroule && (iActif < 0 || !dispo[iActif])) suivant();
  }

  /* ───────── rail ───────── */
  function compter(el, v) {
    if (!fini(v)) { el.textContent = "–"; el._v = null; return; }
    const de = fini(el._v) ? el._v : 0; el._v = v;
    if (de === v || mouvementReduit()) { el.textContent = n0(v); return; }
    const t0 = performance.now();
    const pas = ts => { if (el._v !== v) return; const u = clamp((ts - t0) / 800, 0, 1); el.textContent = n0(lerp(de, v, adoucir(u))); if (u < 1) requestAnimationFrame(pas); };
    requestAnimationFrame(pas);
  }
  function majRail() {
    const S = M.statut, cfg = M.cfg;
    $("#app").dataset.statut = S.global;
    T("site", cfg.site);
    compter($("#v-charge"), M.aCharge ? M.charge : null);
    T("s-charge", M.aLancer > 0 ? `dont ${n0(M.aLancer)} à venir` : "à préparer aujourd'hui");
    compter($("#v-reste"), M.aCharge ? M.reste : null);
    $("#j-reste").style.setProperty("--v", (M.pct * 100).toFixed(1) + "%");
    T("s-reste", M.aCharge ? `${Math.floor(M.pct * 100 + 1e-6)} % fait` : "");
    T("v-fin", fini(M.eta) ? min2hm(M.eta) : "–:–");
    T("vise-fin", fini(M.finVisee) ? `visée ${min2hm(M.finVisee)}` : "");
    Hh("s-fin", pastille(S.fin.niv, S.fin.mot)); Niv("ess-fin", S.fin.niv === "na" ? null : S.fin.niv);
    compter($("#v-rejets"), M.rejets ? M.rejets.total : null); T("u-rejets", `/ ${cfg.rejetsMax} max`);
    Hh("s-rejets", pastille(S.rejets.niv, S.rejets.mot)); Niv("ess-rejets", S.rejets.niv === "na" ? null : S.rejets.niv);
    compter($("#v-dec"), M.dec ? M.dec.total : null);
    Hh("s-dec", pastille(S.dec.niv, S.dec.mot)); Niv("ess-dec", S.dec.niv === "na" ? null : S.dec.niv);
  }
  function majSource() {
    const el = $("#source"), t = $("#source-txt");
    if (mode === "demo") { el.dataset.etat = "demo"; t.textContent = "Démo · données simulées"; }
    else if (M.perime) { el.dataset.etat = "perime"; t.textContent = `Données figées depuis ${min2hm(M.now)}`; }
    else { el.dataset.etat = "live"; t.textContent = `Logys · mis à jour à ${min2hm(M.now)}`; }
  }
  function majHorloge() {
    const d = new Date(), m = mode === "demo" ? Demo.horloge() : d.getHours() * 60 + d.getMinutes();
    const hm = min2hm(Math.floor(m));
    $("#horloge").innerHTML = `${hm.slice(0, 2)}<i>:</i>${hm.slice(3)}`;
    T("date", jourLong(d));
  }

  /* ───────── bandeau d'information ───────── */
  function construireInfos() {
    const L = M.alertes.map(a => ({ niv: a.niv, t: a.titre }));
    if (!L.length && M.statut.global === "ok" && M.aCharge) L.push({ niv: "ok", t: "Tout va bien : fin dans les temps, rejets et erreurs sous les seuils." });
    for (const m of M.messages) L.push({ niv: "na", t: String(m) });
    const s = M.securite || {}, msg = reg.message || s.message;
    if (msg) L.push({ niv: "na", t: "Sécurité : " + msg });
    const std = stdDuJour(); L.push({ niv: "na", t: `Standard du jour : ${std[0]}, ${std[1]}. ${std[2]}` });
    if (mode === "demo") L.push({ niv: "na", t: "Démonstration : ces chiffres sont simulés. Branchez Excel pour afficher Logys (voir outils/pilotage/LISEZMOI.md)." });
    infos = L; if (iInfo >= L.length) iInfo = 0;
    montrerInfo(false);
  }
  function montrerInfo(fondu) {
    const x = infos[iInfo]; if (!x) return;
    const el = $("#info-txt"), b = $("#infos");
    const poser = () => { el.textContent = x.t; b.dataset.niv = x.niv; el.classList.remove("change"); };
    if (fondu && !mouvementReduit()) { el.classList.add("change"); setTimeout(poser, 400); } else poser();
  }

  /* ───────── rotation ───────── */
  const maintenant = () => performance.now();
  function geler(on) { if (on) { if (!gelDepuis) gelDepuis = maintenant(); } else if (gelDepuis && !pause && !fenetre) { debutEcran += maintenant() - gelDepuis; gelDepuis = 0; } }
  function aller(i, sens) {
    if (deroule) { secs[i].scrollIntoView({ behavior: mouvementReduit() ? "auto" : "smooth", block: "start" }); return; }
    if (i === iActif || i < 0 || i >= ECRANS.length) return;
    const anc = iActif;
    if (anc >= 0) {
      secs[anc].classList.remove("actif"); secs[anc].classList.toggle("sorti", sens !== -1);
      const sc = ECRANS[anc].scene; if (sc) Scenes[sc].arreter();
      puces[anc].classList.remove("actif"); puces[anc].removeAttribute("aria-current"); puces[anc].style.removeProperty("--p");
    }
    iActif = i;
    const s = secs[i];
    s.style.transition = "none"; s.classList.toggle("sorti", sens === -1); void s.offsetWidth; s.style.transition = "";
    s.classList.remove("sorti"); s.classList.add("actif", "entre");
    clearTimeout(s._t); s._t = setTimeout(() => s.classList.remove("entre"), 2400);       // les entrées ne rejouent pas à chaque rafraîchissement
    puces[i].classList.add("actif"); puces[i].setAttribute("aria-current", "true");
    const sc = ECRANS[i].scene; if (sc) Scenes[sc].demarrer();
    debutEcran = maintenant(); gelDepuis = pause || fenetre ? debutEcran : 0;
    try { history.replaceState(null, "", "#" + ECRANS[i].id); } catch (e) { /* sans importance */ }
  }
  function voisin(pas) {
    const n = ECRANS.length;
    for (let k = 1; k <= n; k++) { const j = ((iActif + pas * k) % n + n) % n; if (dispo[j]) return j; }
    return -1;
  }
  function suivant() { const j = voisin(1); if (j >= 0) aller(j, 1); }
  function precedent() { const j = voisin(-1); if (j >= 0) aller(j, -1); }
  function tic() {
    if (deroule || iActif < 0) return;
    if (pause || fenetre || !reg.rotation) { puces[iActif].style.setProperty("--p", reg.rotation ? clamp(((gelDepuis || maintenant()) - debutEcran) / (reg.duree * 1000), 0, 1).toFixed(3) : "0"); return; }
    const p = (maintenant() - debutEcran) / (reg.duree * 1000);
    puces[iActif].style.setProperty("--p", clamp(p, 0, 1).toFixed(3));
    if (p >= 1) suivant();
  }
  function basculerPause(force) {
    pause = force != null ? force : !pause;
    if (pause) geler(true); else geler(false);
    const b = $("#b-pause"); b.setAttribute("aria-pressed", String(pause)); b.setAttribute("aria-label", pause ? "Reprendre la rotation" : "Mettre la rotation en pause");
    $("#u-pause").setAttribute("href", pause ? "#i-lecture" : "#i-pause");
  }
  /* mur (rotation) ou déroulé (téléphone, écran vertical) */
  function reglerMode(force) {
    const d = modeDeroule();
    if (d === deroule && !force) return;
    deroule = d;
    Object.values(Scenes).forEach(sc => sc.arreter());
    if (observateur) { observateur.disconnect(); observateur = null; }
    secs.forEach((s, i) => { s.classList.remove("actif", "sorti"); s.hidden = deroule && !dispo[i]; });
    puces.forEach(p => p.classList.remove("actif"));
    if (deroule) {
      iActif = -1;
      if ("IntersectionObserver" in window) {
        observateur = new IntersectionObserver(es => es.forEach(e => { const sc = Object.values(Scenes).find(x => x.cv === e.target); if (sc) { if (e.isIntersecting) sc.demarrer(); else sc.arreter(); } }), { threshold: 0.15 });
        Object.values(Scenes).forEach(sc => observateur.observe(sc.cv));
      } else Object.values(Scenes).forEach(sc => sc.demarrer());
    } else {
      iActif = -1;
      const h = location.hash.slice(1), pe = params.get("ecran");
      let i = ECRANS.findIndex(e => e.id === h);
      if (i < 0 && pe) i = /^\d+$/.test(pe) ? +pe - 1 : ECRANS.findIndex(e => e.id === pe);
      if (!(i >= 0 && dispo[i])) i = dispo.indexOf(true);
      if (i >= 0) aller(i, 1);
    }
  }

  /* ───────── fenêtres ───────── */
  function ouvrir(nom, titre, html) {
    const f = $("#fenetre");
    f.innerHTML = `<header><h2 id="fen-titre">${esc(titre)}</h2><button class="btn" type="button" id="fen-fermer" aria-label="Fermer la fenêtre">${ic("fermer")}</button></header>${html}`;
    $("#voile").hidden = false; fenetre = nom; geler(true);
    $("#fen-fermer").addEventListener("click", fermer);
    f.focus();
  }
  function fermer() { if (!fenetre) return; $("#voile").hidden = true; $("#fenetre").innerHTML = ""; fenetre = null; geler(false); }
  const table = (tetes, lignes) => `<div class="table-w"><table><thead><tr>${tetes.map(t => `<th scope="col">${esc(t)}</th>`).join("")}</tr></thead><tbody>${lignes.map(l => `<tr>${l.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

  function vueEncadrement() {
    if (!M) return;
    const ops = M.operateurs.filter(o => o.lignes > 0);
    let tri = "nom", sens = 1;
    const cols = [["nom", "Préparateur"], ["lignes", "Lignes"], ["tournees", "Chariots"], ["cont", "Colis"], ["cadence", "Lignes / h"], ["quota", "Quota estimé"], ["premiere", "Première"], ["derniere", "Dernière"], ["inactif", "Sans validation depuis"]];
    ouvrir("encadrement", "Vue encadrement", `<div class="avis">${ic("warn")}<span>Vue réservée à l'encadrement : ne pas la laisser affichée sur l'écran de l'atelier. Aucun classement n'est établi, l'ordre par défaut est alphabétique.</span></div><div id="enc-table"></div><p class="note" style="margin-top:.9rem">Cadence observée = lignes ÷ temps entre la première et la dernière validation du jour, pauses déduites. C'est une amplitude, pas un temps de travail : un renfort dans un autre service la fait baisser. Quota estimé = cadence × coefficient de taille des chariots ÷ standard. Le quota officiel reste celui du Suivi Op.</p>`);
    const rendre = () => {
      const L = ops.slice();
      L.sort((a, b) => tri === "nom" ? sens * String(a.nom).localeCompare(String(b.nom), "fr") : sens * ((fini(a[tri]) ? a[tri] : -1) - (fini(b[tri]) ? b[tri] : -1)));
      $("#enc-table").innerHTML = L.length ? `<div class="table-w"><table><thead><tr>${cols.map(c => `<th scope="col" data-tri="${c[0]}" tabindex="0" aria-sort="${tri === c[0] ? (sens > 0 ? "ascending" : "descending") : "none"}">${esc(c[1])}${tri === c[0] ? (sens > 0 ? " ▲" : " ▼") : ""}</th>`).join("")}</tr></thead><tbody>${L.map(o => `<tr><td>${esc(o.nom)}</td><td>${n0(o.lignes)}</td><td>${n0(o.tournees)}</td><td>${n0(o.cont)}</td><td>${n0(o.cadence)}</td><td>${fini(o.quota) ? n0(o.quota) + " %" : "–"}</td><td>${min2hm(o.premiere)}</td><td>${min2hm(o.derniere)}</td><td>${fini(o.inactif) ? duree(o.inactif) : "–"}</td></tr>`).join("")}</tbody></table></div>` : vide("Aucune ligne validée par préparateur dans les données.");
      $$("#enc-table th").forEach(th => { const agir = () => { const k = th.dataset.tri; if (tri === k) sens = -sens; else { tri = k; sens = k === "nom" ? 1 : -1; } rendre(); }; th.addEventListener("click", agir); th.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); agir(); } }); });
    };
    rendre();
  }

  /* résumé en texte simple, à coller dans un message */
  function pointDuJour() {
    const S = M.statut, L = [];
    L.push(`Point ${M.cfg.service}, ${M.cfg.site} : ${jourLong(M.maj)}, ${min2hm(M.now)}${mode === "demo" ? " (démonstration, chiffres simulés)" : ""}`);
    if (M.aCharge) L.push(`Charge du jour : ${n0(M.charge)} lignes. Fait : ${n0(M.fait)} (${Math.floor(M.pct * 100)} %). Reste à faire : ${n0(M.reste)}.`);
    L.push(fini(M.eta) ? `Fin estimée : ${min2hm(M.eta)} (${S.fin.mot.toLowerCase()}${fini(M.finVisee) ? ", heure visée " + min2hm(M.finVisee) : ""}).` : `Fin estimée : ${S.fin.mot.toLowerCase()}.`);
    if (fini(M.pctStandard)) L.push(`Quota de l'équipe : ${n0(M.pctStandard)} % (${n0(M.cadenceOp)} lignes par heure et par préparateur, ${n0(M.actifs)} actifs).`);
    if (M.rejets) L.push(`Rejets : ${n0(M.rejets.total)} pour un maximum de ${M.cfg.rejetsMax} (${S.rejets.mot.toLowerCase()}).`);
    if (M.dec) L.push(`Erreurs décelées : ${n0(M.dec.total)} (${S.dec.mot.toLowerCase()}).`);
    if (M.alertes.length) { L.push("", "À faire :"); M.alertes.slice(0, 5).forEach(a => L.push(`- ${a.titre}. ${a.action}`)); }
    else L.push("Aucune alerte.");
    return L.join("\n");
  }

  function vueDonnees() {
    if (!M) return;
    const S = M.statut, D = M.dec, R = M.rejets, h = [];
    h.push(`<h4>Le point du jour, à coller dans un message</h4><textarea class="point" id="pt-txt" readonly aria-label="Le point du jour en texte">${esc(pointDuJour())}</textarea><div class="ligne" style="margin-top:.6rem"><button class="bouton" type="button" id="pt-copier">Copier le texte</button><span class="note" id="pt-ok" role="status"></span></div>`);
    h.push(`<p>Toutes les valeurs affichées sur les écrans, sous forme de tableaux. Source : ${mode === "demo" ? "données simulées (démonstration)" : "Logys, Contrôle des rejets et Suivi Op, à " + min2hm(M.now)}.</p>`);
    h.push("<h4>Les essentiels</h4>" + table(["Indicateur", "Valeur", "État"], [
      ["Charge du jour (lignes)", n0(M.charge), ""], ["Lignes faites", n0(M.fait), ""], ["Reste à faire (lignes)", n0(M.reste), `${Math.floor(M.pct * 100)} % fait`],
      ["Fin estimée", fini(M.eta) ? min2hm(M.eta) : "–", S.fin.mot], ["Heure visée", min2hm(M.finVisee), ""],
      ["Débit de l'équipe (lignes par heure)", n0(M.debit), ""], ["Préparateurs actifs", n0(M.actifs), ""], ["Cadence par préparateur (lignes par heure)", n0(M.cadenceOp), ""], ["Quota de l'équipe en ce moment (%)", n0(M.pctStandard), S.cadence.mot], ["Coefficient de taille des chariots", M.aPoids ? NF2.format(M.w) : "non fourni", ""],
      ["Préparateurs nécessaires pour finir à l'heure", n1(M.besoinOps), ""],
      ["Rejets (colis)", R ? n0(R.total) : "–", S.rejets.mot], ["Colis pesés", R ? n0(R.pese) : "–", ""], ["Erreurs décelées", D ? n0(D.total) : "–", S.dec.mot]]));
    if (M.heures.length) h.push("<h4>Heure par heure</h4>" + table(["Heure", "Lignes", "Préparateurs"], M.heures.map(x => [x.h + " h", n0(x.lignes), fini(x.ops) ? x.ops : "–"])));
    if (M.vagues.length) h.push("<h4>Vagues</h4>" + table(["Lancée à", "N°", "Lignes prévues", "Lignes préparées", "En rupture", "État"], M.vagues.map(v => [v.heure || "", v.num || "", n0(v.ligPrev), n0(v.ligPrep), n0(v.ligRupt), v.etat])));
    if (M.zones.length) h.push("<h4>Par zone d'allées</h4>" + table(["Zone", "Lignes faites", "Lignes restantes"], M.zones.map(z => [z.lib, n0(z.fait), n0(z.restant)])));
    else if (M.zonesEcart) h.push("<h4>Par zone d'allées</h4><p>Découpage non affiché : le total des lignes restantes par allée ne recoupe pas le reste à faire des tournées (écart de plus de 15 %).</p>");
    if (R && R.parHeure.length) h.push("<h4>Rejets par heure</h4>" + table(["Heure", "Rejets"], R.parHeure.map(x => [x.h + " h", n0(x.n)])));
    if (D) {
      h.push("<h4>Erreurs décelées aujourd'hui, par type</h4>" + table(["Type", "Nombre"], D.types.map(x => [x.nom, n0(x.n)])));
      const a = (D.hist || D).allees || {};
      h.push(`<h4>Erreurs décelées par allée${D.hist ? ", " + D.hist.jours + " derniers jours" : ", aujourd'hui"}</h4>` + table(["Allée", "Nombre"], Object.keys(a).sort().map(k => [k, n0(a[k])])));
    }
    if (M.departs.length) h.push("<h4>Départs</h4>" + table(["Heure", "Transporteur", "Destination", "Colis chargés", "Colis prévus", "État"], M.departs.map(x => [min2hm(x.m), x.transp, x.dest, n0(x.contReel), x.contMax ? n0(x.contMax) : "–", x.etat])));
    if (M.carnet.length) h.push("<h4>Carnet de commandes</h4>" + table(["Jour d'expédition", "Lignes (tous services)", "Estimation Pick & Pack", "Préparateurs au standard"], M.carnet.map(x => [jourLong(new Date(x.date + "T12:00:00")), n0(x.lignes), n0(x.lignes * M.cfg.partPick), n1(x.lignes * M.cfg.partPick / M.cfg.quotaJour)])));
    if (M.historique.length) h.push("<h4>Historique</h4>" + table(["Jour", "Lignes", "Heures de picking", "Préparateurs", "Décelées", "Avérées", "Rejets"], M.historique.slice().reverse().map(x => [new Date(x.d + "T12:00:00").toLocaleDateString("fr-FR"), n0(x.lignes), n1(x.hPick), n0(x.ops), n0(x.ed), n0(x.ea), fini(x.rejets) ? n0(x.rejets) : "–"])));
    ouvrir("donnees", "Tableau des données", h.join(""));
    $("#pt-copier").addEventListener("click", () => {
      const z = $("#pt-txt"), dit = t => { $("#pt-ok").textContent = t; };
      const secours = () => { z.focus(); z.select(); dit("Texte sélectionné : Ctrl+C pour le copier."); };
      try { navigator.clipboard.writeText(z.value).then(() => dit("Copié."), secours); } catch (e) { secours(); }
    });
  }

  function vueReglages() {
    const coches = ECRANS.map(e => `<label class="coche" for="r-e-${e.id}"><input type="checkbox" id="r-e-${e.id}" ${reg.exclus.includes(e.id) ? "" : "checked"}>${esc(e.nom)}</label>`).join("");
    ouvrir("reglages", "Réglages de l'affichage", `
      <p>Ces réglages sont gardés sur ce poste. Les objectifs et les seuils viennent du fichier de données (feuille PILOTAGE du classeur Excel).</p>
      <h4>Rotation</h4>
      <div class="champs">
        <label class="champ" for="r-duree">Durée de chaque écran, en secondes<input type="number" id="r-duree" min="5" max="600" step="1" value="${reg.duree}"></label>
        <label class="coche" for="r-rotation"><input type="checkbox" id="r-rotation" ${reg.rotation ? "checked" : ""}>Faire tourner les écrans automatiquement</label>
      </div>
      <h4>Écrans affichés</h4><div class="coches">${coches}</div>
      <h4>Journée</h4>
      <div class="champs">
        <label class="champ" for="r-fin">Heure de fin visée (vide = celle du fichier de données)<input type="time" id="r-fin" value="${esc(reg.finVisee)}"></label>
        <label class="champ" for="r-acc">Date du dernier accident avec arrêt (vide = fichier de données)<input type="date" id="r-acc" value="${esc(reg.dernierAccident)}"></label>
        <label class="champ" for="r-msg">Message sécurité du jour<input type="text" id="r-msg" maxlength="140" value="${esc(reg.message)}"></label>
        <label class="coche" for="r-noms"><input type="checkbox" id="r-noms" ${reg.noms ? "checked" : ""}>Afficher les noms des présents sur l'écran « L'équipe »</label>
      </div>
      <div class="ligne" style="margin-top:1.5rem"><button class="bouton" type="button" id="r-ok">Enregistrer</button><button class="bouton discret" type="button" id="r-raz">Revenir aux réglages d'origine</button></div>`);
    $("#r-ok").addEventListener("click", () => {
      reg.duree = clamp(parseFloat($("#r-duree").value) || 20, 5, 600); reg.rotation = $("#r-rotation").checked; reg.noms = $("#r-noms").checked;
      reg.finVisee = $("#r-fin").value || ""; reg.dernierAccident = $("#r-acc").value || ""; reg.message = $("#r-msg").value.trim();
      reg.exclus = ECRANS.filter(e => !$("#r-e-" + e.id).checked).map(e => e.id);
      ecrireReglages(); fermer(); if (brut) appliquer(brut);
    });
    $("#r-raz").addEventListener("click", () => { reg = Object.assign({}, REG_DEFAUT); ecrireReglages(); fermer(); if (brut) appliquer(brut); });
  }

  function vueAide() {
    ouvrir("aide", "Aide", `
      <h4>Lire le tableau de bord</h4>
      <p>En haut, cinq chiffres toujours visibles : la charge du jour, ce qu'il reste à faire, l'heure de fin estimée, les rejets et les erreurs décelées. En dessous, les écrans tournent toutes les ${n0(reg.duree)} secondes. Chaque écran répond à une question, écrite en gros, avec la réponse en une phrase.</p>
      <p>Vert : dans l'objectif. Orange : à surveiller. Rouge : action nécessaire. La couleur est toujours accompagnée d'un mot et d'un pictogramme.</p>
      <h4>Les mots</h4>
      <div class="touches">
        <span><b>Ligne</b> : un article prélevé pour une commande.</span>
        <span><b>Chariot (tournée)</b> : un lot de lignes préparé en un passage.</span>
        <span><b>Vague</b> : un lot de commandes lancé en préparation.</span>
        <span><b>Rejet</b> : colis écarté par la balance du convoyeur, à contrôler.</span>
        <span><b>Erreur décelée</b> : vraie erreur trouvée au contrôle, avant le départ.</span>
        <span><b>Erreur avérée</b> : erreur arrivée chez le client (litige).</span>
        <span><b>PPM</b> : nombre d'erreurs pour un million de lignes.</span>
        <span><b>Standard</b> : ${n0(CFG_DEFAUT.quotaJour)} lignes par poste de ${n1(CFG_DEFAUT.hRef)} h.</span>
      </div>
      <h4>Raccourcis clavier</h4>
      <div class="touches">
        <span><kbd>→</kbd><kbd>←</kbd>écran suivant, précédent</span><span><kbd>Espace</kbd>pause ou reprise</span>
        <span><kbd>1</kbd>…<kbd>9</kbd>aller à un écran</span><span><kbd>F</kbd>plein écran</span>
        <span><kbd>E</kbd>vue encadrement</span><span><kbd>T</kbd>tableau des données</span>
        <span><kbd>R</kbd>réglages</span><span><kbd>Échap</kbd>fermer la fenêtre</span>
      </div>
      <h4>Brancher les vraies données</h4>
      <p>La page lit le fichier <b>${FICHIER}</b> placé dans le même dossier qu'elle, et le relit toutes les 30 secondes. Ce fichier est écrit par le module Excel <b>modPilotageLive</b> (dossier outils/pilotage du dépôt), qui interroge Logys en lecture seule. Sans ce fichier, la page affiche une journée simulée, signalée « Démonstration ».</p>`);
  }

  /* ───────── divers ───────── */
  function pleinEcran() {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else { const p = document.documentElement.requestFullscreen(); if (p && p.catch) p.catch(() => {}); }
    } catch (e) { /* plein écran indisponible */ }
  }
  async function garderEveille() {
    try { if ("wakeLock" in navigator && document.visibilityState === "visible") veille = await navigator.wakeLock.request("screen"); } catch (e) { veille = null; }
  }
  function bulles() {
    const b = $("#bulle");
    const placer = e => { const w = b.offsetWidth, h = b.offsetHeight; b.style.left = clamp(e.clientX + 14, 8, window.innerWidth - w - 8) + "px"; b.style.top = clamp(e.clientY - h - 12, 8, window.innerHeight - h - 8) + "px"; };
    document.addEventListener("mouseover", e => { const c = e.target.closest && e.target.closest("[data-bulle]"); if (c) { b.textContent = c.getAttribute("data-bulle"); b.hidden = false; placer(e); } else b.hidden = true; });
    document.addEventListener("mousemove", e => { if (!b.hidden) placer(e); });
  }
  function clavier(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Escape") { if (fenetre) { fermer(); e.preventDefault(); } return; }
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ""))) return;
    if (fenetre) return;
    const k = e.key;
    if (k === "ArrowRight") suivant();
    else if (k === "ArrowLeft") precedent();
    else if (k === " ") { if (e.target.tagName === "BUTTON") return; basculerPause(); }
    else if (/^[0-9]$/.test(k)) { const i = k === "0" ? 9 : +k - 1; if (dispo[i]) aller(i, i < iActif ? -1 : 1); }
    else if (k === "f" || k === "F") pleinEcran();
    else if (k === "e" || k === "E") vueEncadrement();
    else if (k === "t" || k === "T") vueDonnees();
    else if (k === "r" || k === "R") vueReglages();
    else if (k === "?" || k === "h" || k === "H") vueAide();
    else return;
    e.preventDefault();
  }

  function demarrer() {
    lireReglages(); construire(); bulles();
    Demo.regler({ t: hm2min(params.get("t")), vitesse: parseFloat(params.get("vitesse")) });
    majHorloge(); setInterval(majHorloge, 1000);
    cycle();
    setInterval(cycle, 30000);
    setInterval(() => { if (mode === "demo" && brut) appliquer(Demo.instantane()); }, 5000);
    setInterval(tic, 200);
    setInterval(() => { if (infos.length > 1) { iInfo = (iInfo + 1) % infos.length; montrerInfo(true); } }, 9000);
    $("#b-prec").addEventListener("click", precedent); $("#b-suiv").addEventListener("click", suivant);
    $("#b-pause").addEventListener("click", () => basculerPause());
    $("#b-enc").addEventListener("click", vueEncadrement); $("#b-don").addEventListener("click", vueDonnees);
    $("#b-reg").addEventListener("click", vueReglages); $("#b-aide").addEventListener("click", vueAide); $("#b-plein").addEventListener("click", pleinEcran);
    $("#voile").addEventListener("mousedown", e => { if (e.target.id === "voile") fermer(); });
    document.addEventListener("keydown", clavier);
    let tSouris = 0;
    document.addEventListener("mousemove", () => { $("#app").classList.add("souris"); clearTimeout(tSouris); tSouris = setTimeout(() => $("#app").classList.remove("souris"), 4000); });
    let tTaille = 0;
    window.addEventListener("resize", () => { clearTimeout(tTaille); tTaille = setTimeout(() => { reglerMode(false); if (brut) appliquer(brut); Object.values(Scenes).forEach(sc => sc.rafraichir()); }, 180); });
    window.addEventListener("hashchange", () => { const i = ECRANS.findIndex(e => e.id === location.hash.slice(1)); if (i >= 0 && i !== iActif && dispo[i]) aller(i, i < iActif ? -1 : 1); });
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { garderEveille(); cycle(); } });
    garderEveille();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (brut) appliquer(brut); Object.values(Scenes).forEach(sc => sc.rafraichir()); });
  }
  return { demarrer, etat: () => ({ M, mode, iActif, dispo, reg }), aller, appliquer };
})();
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", Appli.demarrer); else Appli.demarrer();
