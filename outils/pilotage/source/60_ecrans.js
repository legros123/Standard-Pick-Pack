
/* ════════════════════════════════════════════════════════════════════════════
   Les écrans : une question par écran, une phrase de réponse, un visuel principal.
   Chaque écran : { id, nom, question, html, maj(M), dispo(M), scene }.
   ════════════════════════════════════════════════════════════════════════════ */
const T = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
const Hh = (id, v) => { const e = document.getElementById(id); if (e && e._h !== v) { e._h = v; e.innerHTML = v; } };
const Niv = (id, niv) => { const e = document.getElementById(id); if (e) { if (niv) e.dataset.niv = niv; else delete e.dataset.niv; } };
const jourLong = d => d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const ppm = (n, lig) => (lig > 0 ? n / lig * 1e6 : null);
const nivSeuils = (v, orange, rouge) => (!fini(v) ? "na" : v >= rouge ? "crit" : v >= orange ? "warn" : "ok");
const Scenes = {};
let stdDispo = false;
const stdDuJour = () => { const d = new Date(), j = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); return STANDARDS[j % STANDARDS.length]; };

const ECRANS = [
  /* ───────── 1. La journée ───────── */
  {
    id: "journee", nom: "La journée", question: "Où en est-on ?", scene: "pile",
    html: `<div class="corps e1">
      <div class="vue3d avec-leg anim" style="--i:0"><canvas id="c-pile" aria-label="Piles de cubes : à venir, reste à faire, fait" role="img"></canvas>
        <div class="leg3d"><span><i class="car fait"></i>Fait</span><span><i class="car reste"></i><span id="e1-leg-reste">Reste à faire</span></span><span id="e1-leg-venir"><i class="car venir"></i>À venir : reçu, pas encore lancé en vague</span><span class="note" id="e1-unite"></span></div>
      </div>
      <div class="col">
        <div class="bloc anim" style="--i:1">
          <div class="duo"><div class="geant"><span id="e1-pct">–</span><small>%</small></div><p class="expl">de la charge du jour<br>est <b>déjà préparée</b></p></div>
          <div class="barre3" aria-hidden="true"><i class="s-fait" id="e1-b1"></i><i class="s-reste" id="e1-b2"></i><i class="s-venir" id="e1-b3"></i></div>
          <div class="barre3-leg"><span><i class="car fait"></i>Fait<b id="e1-fait">–</b></span><span><i class="car reste"></i><span id="e1-l2">Reste à faire</span><b id="e1-reste">–</b></span><span id="e1-l3"><i class="car venir"></i>À venir<b id="e1-venir">–</b></span></div>
        </div>
        <div class="trio anim" style="--i:2">
          <div class="mini"><span class="l">Colis terminés</span><b id="e1-cont">–</b><span class="s">bacs et cartons</span></div>
          <div class="mini"><span class="l">Chariots terminés</span><b id="e1-tf">–</b><span class="s">tournées finies</span></div>
          <div class="mini"><span class="l">Chariots en attente</span><b id="e1-tl">–</b><span class="s">sans préparateur</span></div>
        </div>
        <div class="bloc anim" style="--i:3"><h3>${ic("chariot")}Par type de préparation</h3><div class="liste-jauges" id="e1-types"></div><p class="note" id="e1-note" style="margin-top:.7rem"></p></div>
      </div>
    </div>`,
    dispo: () => true,
    maj(M) {
      T("e1-pct", M.aCharge ? Math.floor(M.pct * 100 + 1e-6) : "–");
      const venir = M.cfg.inclureALancer && M.aLancerInfo != null;
      $("#e1-b1").style.flexGrow = M.fait || 0.0001; $("#e1-b2").style.flexGrow = M.restant || 0.0001; $("#e1-b3").style.flexGrow = venir ? M.aLancer || 0.0001 : 0;
      $("#e1-b3").style.display = venir && M.aLancer ? "" : "none";
      $("#e1-l3").hidden = !venir; $("#e1-leg-venir").hidden = !venir;
      T("e1-l2", venir ? "À préparer" : "Reste à faire"); T("e1-leg-reste", venir ? "À préparer : déjà lancé" : "Reste à faire");
      T("e1-fait", n0(M.fait)); T("e1-reste", n0(M.restant)); T("e1-venir", n0(M.aLancer));
      T("e1-cont", n0(M.contFaits)); T("e1-tf", n0(M.tournees.faites)); T("e1-tl", n0(M.tournees.libres));
      Hh("e1-types", M.types.length ? M.types.map(t => { const tot = t.fait + t.restant; return `<div class="lj"><span class="lj-n">${esc(t.lib)}</span><div class="jauge" style="--v:${tot ? (t.fait / tot * 100).toFixed(1) : 0}%"><i></i></div><span class="lj-v"><b>${n0(t.fait)}</b> / ${n0(tot)} lignes</span></div>`; }).join("") : vide("Détail par type non fourni."));
      const ratios = [M.tournees.faites > 0 ? `${n0(M.fait / M.tournees.faites)} lignes par chariot terminé` : "", M.contFaits > 0 ? `${n1(M.fait / M.contFaits)} lignes par colis` : ""].filter(Boolean).join(" · ");
      T("e1-note", (!venir && M.aLancerInfo ? `En plus : ${n0(M.aLancerInfo)} lignes reçues mais pas encore lancées en vague (hors charge). ` : fini(M.tournees.ouvertes) ? `${n0(M.tournees.ouvertes)} chariots encore ouverts, en cours ou en attente. ` : "") + ratios);
      Scenes.pile.donnees(M.fait, M.restant, venir ? M.aLancer : null);
      T("e1-unite", `1 cube = ${n0(Scenes.pile.unite)} lignes`);
      return !M.aCharge ? "La charge du jour n'est pas encore connue."
        : M.reste <= 0 && M.fait > 0 ? `Toute la charge connue est préparée : <b>${n0(M.fait)} lignes</b>. Bravo à l'équipe !`
        : `<b>${Math.floor(M.pct * 100)} %</b> de la charge du jour est faite. Il reste <b>${n0(M.reste)} lignes</b> à préparer.`;
    }
  },

  /* ───────── 2. L'heure de fin ───────── */
  {
    id: "fin", nom: "L'heure de fin", question: "À quelle heure finit-on ?",
    html: `<div class="corps e2">
      <div class="col">
        <div class="bloc anim" style="--i:0" id="e2-bloc"><h3>${ic("horloge")}Fin estimée au rythme actuel</h3>
          <div class="horloge-fin" id="e2-eta">–</div>
          <div class="ligne"><span id="e2-past"></span><span class="expl" id="e2-vise"></span></div>
          <p class="note" id="e2-four" style="margin-top:.7rem"></p>
        </div>
        <div class="bloc anim" style="--i:1"><h3>${ic("equipe")}Préparateurs : le besoin et les présents</h3>
          <div class="bonshommes" id="e2-ops"></div>
          <p class="expl" id="e2-besoin"></p>
          <div class="legende"><span><i class="cle carre" style="background:var(--data)"></i>nécessaires</span><span><i class="cle carre" style="background:#5A6E93"></i>marge</span><span><i class="cle carre" style="background:transparent;border:1.5px dashed var(--crit-ic)"></i>manquants</span></div>
        </div>
      </div>
      <div class="bloc graphe anim" style="--i:2"><h3>${ic("tendance")}Lignes préparées depuis le début du poste</h3><div class="gr" id="g-avancement"></div>
        <div class="legende"><span><i class="cle zone"></i>préparé</span><span><i class="cle tirets"></i>projection au rythme actuel</span><span><i class="cle gris"></i>rythme à tenir pour finir à l'heure visée</span></div>
      </div>
    </div>`,
    dispo: () => true,
    maj(M) {
      const S = M.statut.fin, fin = min2hm(M.finVisee);
      T("e2-eta", fini(M.eta) ? min2hm(M.eta) : "–:–");
      Hh("e2-past", pastille(S.niv, S.mot, true)); Niv("e2-bloc", S.niv === "na" ? null : S.niv);
      T("e2-vise", fini(M.finVisee) ? `heure visée : ${fin}` : "");
      T("e2-four", M.horsJour ? "Au rythme actuel et avec l'effectif prévu, il reste trop de lignes pour finir avant minuit." : fini(M.etaTot) && fini(M.etaTard) && M.etaTard - M.etaTot >= 4 ? `Fourchette : entre ${min2hm(M.etaTot)} et ${min2hm(M.etaTard)}, selon que l'équipe garde le rythme de la dernière heure ou celui de la journée.` : (M.effectif.length ? "Calcul : lignes restantes ÷ cadence constatée × effectif prévu par tranche horaire, pauses déduites." : "Calcul : lignes restantes ÷ lignes validées par heure, pauses déduites."));
      Hh("e2-ops", bonshommes(M.opsRef, M.reste > 0 ? M.besoinOps : null));
      const dispo = M.opsPrevus ? `<b>${n1(M.opsRef)}</b> sont prévus en moyenne d'ici là` : `<b>${n0(M.actifs)}</b> sont actifs`;
      let b;
      if (!fini(M.actifs) || !fini(M.cadenceOp)) b = "Estimation en attente des premières lignes validées.";
      else if (M.reste <= 0) b = "Plus rien à préparer dans la charge connue.";
      else if (M.hRestantes <= 0.05) b = `L'heure visée (${fin}) est passée : il reste <b>${n0(M.reste)} lignes</b>.`;
      else if (M.margeOps >= 0.5) b = `Pour finir à ${fin}, il faut <b>${n1(M.besoinOps)} préparateurs</b>. ${dispo} : <b>${n1(M.margeOps)} de marge</b>.`;
      else if (M.margeOps > -0.5) b = `Pour finir à ${fin}, il faut <b>${n1(M.besoinOps)} préparateurs</b>. ${dispo} : l'effectif est <b>juste suffisant</b>.`;
      else b = `Pour finir à ${fin}, il faut <b>${n1(M.besoinOps)} préparateurs</b>. ${dispo} : <b>il en manque ${n1(-M.margeOps)}</b>.`;
      if (fini(M.cadenceOp) && M.cadenceOp > 0 && M.reste > 0) b += ` Il reste <b>${n0(M.reste / M.cadenceOp)} heures de picking</b> à fournir.`;
      Hh("e2-besoin", b);
      grAvancement($("#g-avancement"), M);
      if (M.horsJour) return `Au rythme actuel, la charge <b>ne sera pas terminée aujourd'hui</b> : il reste <b>${n0(M.reste)} lignes</b>.`;
      if (!fini(M.eta)) return "Pas encore assez de lignes validées pour estimer l'heure de fin.";
      if (M.reste <= 0) return "La charge connue est terminée.";
      if (!fini(M.ecart)) return `Au rythme actuel, tout sera prêt à <b>${min2hm(M.eta)}</b>.`;
      if (M.ecart >= 5) return `Au rythme actuel, tout sera prêt à <b>${min2hm(M.eta)}</b> : <b>${duree(M.ecart)} avant</b> l'heure visée (${fin}).`;
      if (M.ecart >= -2) return `Au rythme actuel, on termine <b>à l'heure visée</b> (${fin}).`;
      return `Au rythme actuel, on terminerait à <b>${min2hm(M.eta)}</b> : <b>${duree(M.ecart)} après</b> l'heure visée (${fin}).`;
    }
  },

  /* ───────── 3. La cadence ───────── */
  {
    id: "cadence", nom: "La cadence", question: "Va-t-on assez vite ?",
    html: `<div class="corps e3">
      <div class="col">
        <div class="bloc anim" style="--i:0" id="e3-bloc"><h3>${ic("vitesse")}Quota de l'équipe, en ce moment</h3>
          <div class="duo"><div class="gros"><span id="e3-q">–</span><small>%</small></div><p class="expl" id="e3-q-t"></p></div>
          <div class="jauge-w" style="margin-top:1.9rem"><div class="jauge etat" id="e3-j"><i></i></div><b class="borne" id="e3-b" style="left:66.7%" data-t="quota 100 %"></b></div>
          <div class="ligne" style="margin-top:.5rem"><span id="e3-past"></span><span class="note" id="e3-seuils"></span></div>
          <p class="note" id="e3-note" style="margin-top:.8rem"></p>
        </div>
        <div class="quatre anim" style="--i:1">
          <div class="mini"><span class="l">Cadence</span><b id="e3-cad">–</b><span class="s">lignes par heure et par préparateur</span></div>
          <div class="mini"><span class="l">Préparateurs actifs</span><b id="e3-act">–</b><span class="s" id="e3-pres"></span></div>
          <div class="mini"><span class="l">Débit de l'équipe</span><b id="e3-debit">–</b><span class="s">lignes par heure</span></div>
          <div class="mini"><span class="l">Débit à tenir</span><b id="e3-need">–</b><span class="s">lignes par heure pour finir à l'heure</span></div>
        </div>
      </div>
      <div class="bloc graphe anim" style="--i:2"><h3>${ic("tendance")}Lignes préparées, heure par heure</h3><div class="gr" id="g-heures"></div>
        <div class="legende"><span><i class="cle carre" style="background:var(--data)"></i>lignes préparées dans l'heure</span><span><i class="cle gris"></i>débit à tenir d'ici la fin pour terminer à l'heure visée</span></div>
      </div>
    </div>`,
    dispo: () => true,
    maj(M) {
      const S = M.statut.cadence, cfg = M.cfg;
      T("e3-q", n0(M.pctStandard));
      Hh("e3-q-t", fini(M.cadenceOp) ? `du quota : chaque préparateur valide<br><b>${n0(M.cadenceOp)} lignes par heure</b>` : "du quota");
      $("#e3-j").style.setProperty("--v", clamp((M.pctStandard || 0) / 150 * 100, 0, 100).toFixed(1) + "%"); Niv("e3-j", S.niv);
      Hh("e3-past", pastille(S.niv, S.mot, true)); Niv("e3-bloc", S.niv === "na" ? null : S.niv);
      T("e3-seuils", `Vert à partir de ${cfg.quotaVert} %, rouge en dessous de ${cfg.quotaRouge} %.`);
      T("e3-note", `Le quota compare la cadence au standard Rexel (${n0(cfg.quotaJour)} lignes par poste de ${n1(cfg.hRef)} h) en tenant compte de la taille des chariots : un petit chariot compte plus, un grand compte moins. ` + (M.aPoids ? `Coefficient du moment : × ${NF2.format(M.w)}.` : "Taille des chariots non fournie : quota calculé sans coefficient."));
      T("e3-cad", n0(M.cadenceOp)); T("e3-debit", n0(M.debit)); T("e3-act", n0(M.actifs)); T("e3-pres", fini(M.presents) ? `sur ${n0(M.presents)} depuis ce matin` : ""); T("e3-need", n0(M.debitNecessaire));
      grHeures($("#g-heures"), M);
      return fini(M.pctStandard) ? `En ce moment, l'équipe est à <b>${n0(M.pctStandard)} % du quota</b>, avec <b>${n0(M.cadenceOp)} lignes par heure</b> par préparateur.` : "La cadence s'affichera dès les premières lignes validées.";
    }
  },

  /* ───────── 4. Les vagues ───────── */
  {
    id: "vagues", nom: "Les vagues", question: "Où en sont les vagues ?",
    html: `<div class="corps e4">
      <div class="col">
        <div class="bloc anim" style="--i:0"><h3>${ic("couches")}Vagues lancées aujourd'hui</h3><div class="vagues" id="e4-vagues"></div></div>
        <div class="deux anim" style="--i:1" id="e4-bas">
          <div class="bloc"><h3>${ic("cible")}Toutes les préparations du site</h3><div class="liste-jauges serre" id="e4-services"></div></div>
          <div class="bloc" id="e4-bloc-z"><h3>${ic("plan")}Reste à préparer, par zone d'allées</h3><div class="liste-jauges serre" id="e4-zones"></div></div>
        </div>
      </div>
      <div class="col">
        <div class="bloc anim" style="--i:2"><h3>${ic("drapeau")}Prochain jalon de la journée</h3>
          <div class="duo"><div class="gros" id="e4-jal">–</div><p class="expl" id="e4-jal-t"></p></div>
          <div class="jalons" id="e4-jalons"></div>
        </div>
        <div class="bloc anim" style="--i:3"><h3>${ic("reste")}Reste dans les vagues lancées</h3>
          <div class="duo"><div class="gros" id="e4-reste">–</div><p class="expl" id="e4-reste-t"></p></div>
        </div>
        <div class="bloc anim" style="--i:4" id="e4-bloc-r"><h3>${ic("warn")}Lignes en rupture dans les vagues</h3>
          <div class="duo"><div class="gros" id="e4-rupt">–</div><p class="expl">lignes de commande<br>que le stock n'a pas pu servir</p></div>
        </div>
      </div>
    </div>`,
    dispo: M => M.vagues.length > 0 || M.services.length > 0,
    maj(M) {
      const v = M.vagues.slice(-6);
      Hh("e4-vagues", v.length ? v.map(x => {
        const p = x.ligPrev ? x.ligPrep / x.ligPrev : 0, fin = x.ligPrev > 0 && x.ligPrep >= x.ligPrev;
        return `<div class="vg"><span class="vg-h">${esc(x.heure || "")}</span><div class="jauge" style="--v:${(clamp(p, 0, 1) * 100).toFixed(1)}%"><i${p > 0 ? "" : ' style="display:none"'}></i></div><span class="vg-v"><b>${n0(x.ligPrep)}</b> / ${n0(x.ligPrev)} lignes</span>${fin ? pastille("ok", "Terminée") : pastille("na", x.ligPrep > 0 ? "En cours" : "Lancée", false, x.ligPrep > 0 ? "horloge" : "drapeau")}</div>`;
      }).join("") : vide("Aucune vague lancée pour l'instant."));
      const j = M.jalonSuivant;
      T("e4-jal", j ? min2hm(j) : "–"); T("e4-jal-t", j ? `dans ${duree(j - M.now)}` : "Tous les jalons du jour sont passés.");
      Hh("e4-jalons", M.jalons.map(x => `<span class="jalon${x <= M.now ? " passe" : x === j ? " suivant" : ""}">${min2hm(x)}</span>`).join(""));
      const tous = [{ lib: M.cfg.service, fait: M.fait, restant: M.restant }].concat(M.services);
      Hh("e4-services", tous.map(t => { const tot = t.fait + t.restant; return `<div class="lj"><span class="lj-n">${esc(t.lib)}</span><div class="jauge" style="--v:${tot ? (t.fait / tot * 100).toFixed(1) : 0}%"><i></i></div><span class="lj-v"><b>${n0(t.fait)}</b> / ${n0(tot)} lignes</span></div>`; }).join(""));
      const finies = M.vagues.filter(x => x.ligPrev > 0 && x.ligPrep >= x.ligPrev).length, reste = M.vagues.reduce((s, x) => s + Math.max(0, x.ligPrev - x.ligPrep), 0), rupt = M.vagues.reduce((s, x) => s + x.ligRupt, 0);
      T("e4-reste", M.vagues.length ? n0(reste) : "–"); Hh("e4-reste-t", `lignes à préparer<br>dans <b>${M.vagues.length - finies} ${pluriel(M.vagues.length - finies, "vague")}</b> en cours`);
      const zmax = Math.max(1, ...M.zones.map(z => z.restant));
      $("#e4-bloc-z").hidden = !M.zones.length; $("#e4-bas").classList.toggle("seul", !M.zones.length);
      Hh("e4-zones", M.zones.map(z => `<div class="lj"><span class="lj-n">${esc(z.lib)}</span><div class="jauge etat" data-niv="na" style="--v:${(z.restant / zmax * 100).toFixed(1)}%"><i${z.restant ? "" : ' style="display:none"'}></i></div><span class="lj-v">reste <b>${n0(z.restant)}</b></span></div>`).join(""));
      T("e4-rupt", M.vagues.length ? n0(rupt) : "–"); Niv("e4-bloc-r", rupt > 0 ? "warn" : null);
      return M.vagues.length ? `<b>${M.vagues.length} ${pluriel(M.vagues.length, "vague")}</b> ${pluriel(M.vagues.length, "lancée")} aujourd'hui, dont <b>${finies} ${pluriel(finies, "terminée")}</b>. Il reste ${n0(reste)} lignes dans les vagues en cours.` : "Aucune vague lancée pour l'instant.";
    }
  },

  /* ───────── 5. La qualité ───────── */
  {
    id: "qualite", nom: "La qualité", question: "Travaille-t-on juste ?", scene: "conv",
    html: `<div class="corps e5">
      <div class="vue3d avec-leg anim" style="--i:0"><canvas id="c-conv" aria-label="Illustration : le convoyeur, la balance et la voie de contrôle" role="img"></canvas>
        <div class="cpts"><div class="cpt"><span>Colis pesés</span><b id="e5-pes">–</b></div><div class="cpt rej"><span>Partis au contrôle</span><b id="e5-rej">–</b></div></div>
        <div class="leg3d"><span class="note" style="margin-left:0">Illustration. Chaque colis est pesé : si son poids ne correspond pas au poids attendu, il part au poste de contrôle. Une vraie erreur trouvée là s'appelle une erreur décelée.</span></div>
      </div>
      <div class="quad">
        <div class="bloc anim" style="--i:1" id="e5-a"><h3>${ic("balance")}Rejets du jour</h3>
          <div class="duo"><div class="gros"><span id="e5-rej2">–</span><small id="e5-max"></small></div></div>
          <div><div class="jauge-w"><div class="jauge etat" id="e5-j"><i></i></div><b class="borne" style="left:80%" id="e5-b"></b></div><div class="ligne"><span id="e5-past-r"></span><span class="note" id="e5-proj"></span></div></div>
        </div>
        <div class="bloc anim" style="--i:2" id="e5-c"><h3>${ic("loupe")}Erreurs décelées au contrôle</h3>
          <div class="duo"><div class="gros" id="e5-dec">–</div><div><span id="e5-past-d"></span><p class="note" id="e5-seuils" style="margin-top:.4rem"></p></div></div>
          <div class="types-mini" id="e5-types"></div>
        </div>
        <div class="bloc q4 anim" style="--i:3"><h3>${ic("cible")}Taux de rejet</h3>
          <div class="duo"><div class="moyen" id="e5-taux">–</div><p class="expl" id="e5-sur"></p></div>
          <p class="note" id="e5-utile"></p>
          <div class="gr" id="g-rejh"></div>
        </div>
        <div class="bloc anim" style="--i:4" id="e5-d"><h3>${ic("camion")}Erreurs arrivées chez le client, ce mois</h3>
          <div class="duo"><div class="moyen" id="e5-ave">–</div><div><span id="e5-past-a"></span><p class="note" id="e5-ppma" style="margin-top:.4rem"></p></div></div>
          <p class="note" id="e5-ppmd" style="align-self:end"></p>
        </div>
      </div>
    </div>`,
    dispo: M => !!(M.rejets || M.dec),
    maj(M) {
      const cfg = M.cfg, R = M.rejets, D = M.dec, S = M.statut;
      Scenes.conv.donnees(R ? R.taux : null);
      T("e5-pes", R ? n0(R.pese) : "–"); T("e5-rej", R ? n0(R.total) : "–"); T("e5-rej2", R ? n0(R.total) : "–"); T("e5-max", ` / ${cfg.rejetsMax} max`);
      $("#e5-j").style.setProperty("--v", (R ? clamp(R.total / (cfg.rejetsMax * 1.25) * 100, 0, 100) : 0).toFixed(1) + "%"); Niv("e5-j", S.rejets.niv);
      Hh("e5-past-r", pastille(S.rejets.niv, S.rejets.mot)); Niv("e5-a", S.rejets.niv === "na" ? null : S.rejets.niv);
      Hh("e5-proj", R && M.pct < 1 && M.pct >= 0.1 ? `Projection en fin de journée : <b>${n0(R.proj)}</b>` : "");
      T("e5-dec", D ? n0(D.total) : "–"); Hh("e5-past-d", pastille(S.dec.niv, S.dec.mot)); Niv("e5-c", S.dec.niv === "na" ? null : S.dec.niv);
      T("e5-seuils", `Alerte à ${cfg.decOrange} par jour, rouge à ${cfg.decRouge}.`);
      Hh("e5-types", D ? barresRang(D.types.filter(x => x.n > 0).slice(0, 3)) : "");
      T("e5-taux", R && fini(R.taux) ? n1(R.taux * 100) + " %" : "–");
      Hh("e5-sur", R && R.total > 0 && R.pese > 0 ? `soit <b>1 colis sur ${n0(R.pese / R.total)}</b><br>écarté par la balance` : "des colis écartés par la balance");
      Hh("e5-utile", R && D && R.total > 0 && D.source.indexOf("estimation") < 0 ? `Rejets utiles : <b>${n0(Math.min(D.total, R.total))} sur ${n0(R.total)}</b> cachaient une vraie erreur (${n0(Math.min(1, D.total / R.total) * 100)} %). Les autres colis étaient justes.` : "");
      grMiniColonnes($("#g-rejh"), R ? R.parHeure : [], "rejets");
      const m = M.mois, pa = m ? ppm(+m.ea || 0, +m.lignes || 0) : null, na = nivSeuils(pa, cfg.ppmAveOrange, cfg.ppmAveRouge);
      T("e5-ave", m ? n0(m.ea) : "–"); Hh("e5-past-a", pastille(na, na === "ok" ? "Dans l'objectif" : na === "warn" ? "À surveiller" : na === "crit" ? "Hors objectif" : "Non branché")); Niv("e5-d", na === "na" ? null : na);
      T("e5-ppma", m ? `${n0(pa)} erreurs par million de lignes (PPM avérée). Orange à ${cfg.ppmAveOrange}, rouge à ${cfg.ppmAveRouge}.` : "Suivi mensuel non branché.");
      T("e5-ppmd", D && fini(D.ppm) ? `Aujourd'hui : ${n0(D.ppm)} erreurs décelées par million de lignes (PPM décelée). Orange à ${n0(cfg.ppmDecOrange)}, rouge à ${n0(cfg.ppmDecRouge)}.` : "");
      if (R && D) return `<b>${n0(R.total)} colis</b> écartés par la balance sur ${n0(R.pese)} pesés. Au contrôle, <b>${n0(D.total)} ${pluriel(D.total, "vraie erreur", "vraies erreurs")}</b> ${pluriel(D.total, "a été trouvée", "ont été trouvées")} avant le départ chez le client.`;
      return R ? `<b>${n0(R.total)} colis</b> écartés par la balance sur ${n0(R.pese)} pesés.` : `<b>${n0(D.total)} ${pluriel(D.total, "erreur décelée", "erreurs décelées")}</b> au poste de contrôle aujourd'hui.`;
    }
  },

  /* ───────── 6. Où sont les erreurs ───────── */
  {
    id: "allees", nom: "Les allées", question: "Où faut-il redoubler d'attention ?", scene: "allees",
    html: `<div class="corps e6">
      <div class="vue3d avec-leg anim" style="--i:0"><canvas id="c-allees" aria-label="Plan des allées : hauteur selon le nombre d'erreurs décelées" role="img"></canvas>
        <div class="titre3d"><div class="titre3">${ic("plan")}<span id="e6-titre">Erreurs décelées par allée</span></div></div>
        <div class="leg3d"><span>Plus la travée est haute et claire, plus il y a eu d'erreurs.</span><span><svg viewBox="0 0 12 12" width="14" height="14" aria-hidden="true"><path d="M6 1.500 11 10.500H1z" fill="#FAB219"/></svg>les trois allées à surveiller</span><span class="note" id="e6-hors"></span></div>
      </div>
      <div class="col">
        <div class="bloc anim" style="--i:1"><h3>${ic("loupe")}<span id="e6-t2">Types d'erreur</span></h3><div class="types-mini grand" id="e6-types"></div></div>
        <div class="bloc anim" style="--i:2"><h3>${ic("balance")}Articles les plus rejetés par la balance</h3><ol class="top" id="e6-top"></ol><p class="note" style="margin-top:.7rem">À faire remesurer : un poids faux dans la fiche article provoque des rejets inutiles.</p></div>
      </div>
    </div>`,
    dispo: M => !!M.dec && (Object.keys((M.dec.hist || M.dec).allees || {}).length > 0),
    maj(M) {
      const D = M.dec, src = D.hist && Object.keys(D.hist.allees).length ? D.hist : { jours: 0, allees: D.allees, types: D.types, total: D.total };
      const periode = src.jours ? `${src.jours} derniers jours` : "aujourd'hui";
      Scenes.allees.donnees(src.allees);
      T("e6-titre", `Erreurs décelées par allée, ${periode}`); T("e6-t2", `Types d'erreur, ${periode}`);
      const hors = Object.keys(src.allees).filter(k => !(+k >= 1 && +k <= 14)).reduce((s, k) => s + (+src.allees[k] || 0), 0);
      T("e6-hors", hors ? `+ ${n0(hors)} hors allées 1 à 14 ou sans emplacement` : "");
      Hh("e6-types", barresRang(src.types.filter(x => x.n > 0).slice(0, 6)) || vide("Aucune erreur sur la période."));
      const top = M.rejets ? M.rejets.top.slice(0, 5) : [];
      Hh("e6-top", top.length ? top.map(x => `<li><span class="ref">${esc(x.art)}</span><span class="lib">${esc(x.lib)}</span><b>${n0(x.n)}</b></li>`).join("") : `<li style="display:block;counter-increment:none">${vide("Liste des articles rejetés non branchée.")}</li>`);
      const tete = Scenes.allees.tete.map(i => String(i + 1).padStart(2, "0"));
      if (!tete.length) return "Aucune erreur décelée sur la période.";
      const liste = tete.length === 1 ? `l'allée <b>${tete[0]}</b> concentre` : `les allées ${tete.slice(0, -1).map(a => `<b>${a}</b>`).join(", ")} et <b>${tete[tete.length - 1]}</b> concentrent`;
      return `${src.jours ? `Sur ${src.jours} jours` : "Aujourd'hui"}, ${liste} le plus d'erreurs. On y lit l'étiquette deux fois.`;
    }
  },

  /* ───────── 7. Les départs ───────── */
  {
    id: "departs", nom: "Les départs", question: "Les camions partent-ils à l'heure ?",
    html: `<div class="corps e7">
      <div class="bloc dep anim" style="--i:0"><div class="dep-l dep-tete"><span>Heure</span><span>Transporteur</span><span>Destination</span><span>Colis chargés</span><span style="text-align:right">État</span></div><div class="dep-corps" id="e7-lignes"></div></div>
      <div class="col">
        <div class="bloc anim" style="--i:1"><h3>${ic("camion")}Prochain départ</h3><div class="duo"><div class="gros" id="e7-proch">–</div><p class="expl" id="e7-proch-t"></p></div></div>
        <div class="pile-mini anim" style="--i:2">
          <div class="mini" id="e7-m1"><b id="e7-ret">–</b><span class="l">Commandes en retard</span><span class="s">date d'expédition dépassée</span></div>
          <div class="mini"><b id="e7-rup">–</b><span class="l">Lignes en rupture</span><span class="s">aujourd'hui, au picking</span></div>
          <div class="mini" id="e7-m3"><b id="e7-rea">–</b><span class="l">Emplacements à réapprovisionner</span><span class="s" id="e7-rea-s">sous le seuil d'alerte</span><ul class="crit" id="e7-crit"></ul></div>
        </div>
      </div>
    </div>`,
    dispo: M => M.departs.length > 0,
    maj(M) {
      const d = M.departs, parti = x => /part|exp[ée]d|termin|cl[oô]t|sorti/i.test(x.etat);
      const iProch = d.findIndex(x => x.m > M.now && !parti(x)), deb = clamp((iProch < 0 ? d.length : iProch) - 2, 0, Math.max(0, d.length - 8));
      Hh("e7-lignes", d.slice(deb, deb + 8).map((x, k) => {
        const i = deb + k, p = x.contMax ? clamp(x.contReel / x.contMax, 0, 1) : 0, part = parti(x), tard = !part && x.m <= M.now;
        const etat = part ? pastille("ok", x.etat || "Parti") : tard ? pastille("warn", "Heure dépassée") : pastille("na", x.etat || "Prévu", false, x.contReel > 0 ? "camion" : "horloge");
        return `<div class="dep-l${i === iProch ? " suivant" : part ? " parti" : ""}" style="--i:${k}"><span class="dep-h">${min2hm(x.m)}</span><span class="dep-t">${esc(x.transp)}</span><span class="dep-d">${esc(x.dest)}</span><span class="dep-c"><div class="jauge" style="--v:${(p * 100).toFixed(1)}%"><i${p > 0 ? "" : ' style="display:none"'}></i></div><span><b>${n0(x.contReel)}</b>${x.contMax ? " / " + n0(x.contMax) : ""}</span></span>${etat}</div>`;
      }).join(""));
      const pr = iProch >= 0 ? d[iProch] : null;
      T("e7-proch", pr ? min2hm(pr.m) : "–"); Hh("e7-proch-t", pr ? `<b>dans ${duree(pr.m - M.now)}</b><br>${esc(pr.transp)}${pr.dest ? " · " + esc(pr.dest) : ""}` : "Tous les départs du jour sont passés.");
      const r = M.retard, st = M.stock;
      T("e7-ret", r ? n0(r.commandes) : "–"); Niv("e7-m1", r && +r.commandes > 0 ? "warn" : null);
      T("e7-rup", st && st.ruptures != null ? n0(st.ruptures) : "–");
      T("e7-rea", st && st.reappro != null ? n0(st.reappro) : "–"); T("e7-rea-s", st && +st.critique > 0 ? `dont ${n0(st.critique)} au niveau critique` : "sous le seuil d'alerte");
      Hh("e7-crit", st && Array.isArray(st.critiques) ? st.critiques.slice(0, 3).map(c => `<li><b>${esc(c.emp)}</b><span>${esc(c.art || "")}</span><span>reste ${n0(c.reel)}</span></li>`).join("") : "");
      const partis = d.filter(parti).length;
      return pr ? `Prochain départ à <b>${min2hm(pr.m)}</b>, dans <b>${duree(pr.m - M.now)}</b>. ${partis} ${pluriel(partis, "départ")} sur ${d.length} ${pluriel(partis, "est déjà parti", "sont déjà partis")}.` : `Les ${d.length} départs du jour sont passés.`;
    }
  },

  /* ───────── 8. L'équipe ───────── */
  {
    id: "equipe", nom: "L'équipe", question: "Comment va l'équipe ?",
    html: `<div class="corps e8">
      <div class="bloc anim" style="--i:0"><h3>${ic("equipe")}Préparateurs actifs</h3>
        <div class="duo"><div class="gros" id="e8-act">–</div><p class="expl" id="e8-act-t"></p></div>
        <div><div class="bonshommes grands" id="e8-ops" style="margin-top:1.1rem"></div><div class="prenoms" id="e8-noms"></div></div>
        <div class="e8-quota"><div class="titre3">${ic("vitesse")}Quota de l'équipe depuis le début du poste</div>
          <div class="duo"><div class="moyen" id="e8-q">–</div><div style="flex:1;min-width:0"><div class="jauge-w"><div class="jauge etat" id="e8-j"><i></i></div><b class="borne" style="left:66.7%" data-t="100 %"></b></div><span id="e8-past"></span></div></div>
        </div>
      </div>
      <div class="bloc anim" style="--i:1"><h3>${ic("cible")}Le quota de chacun, sans les noms</h3>
        <p class="expl" id="e8-rep"></p>
        <div class="gr" id="g-points"></div>
        <p class="note">Un point = un préparateur. Quota estimé depuis sa première validation du jour, chariots pondérés. Le quota officiel reste celui du Suivi Op.</p>
      </div>
      <div class="col">
        <div class="bloc secu anim" style="--i:2"><h3>${ic("bouclier")}Sécurité</h3>
          <div class="duo"><div class="gros" id="e8-jsa">–</div><p class="expl">jours sans accident<br>avec arrêt</p></div>
          <p class="expl" id="e8-msg" style="margin-top:.8rem"></p>
        </div>
        <div class="bloc anim" style="--i:3"><h3>${ic("etoile")}Fierté d'équipe</h3><p class="expl" id="e8-bravo"></p></div>
        <div class="bloc anim" style="--i:4"><h3>${ic("livre")}Le standard du jour</h3><p class="expl" id="e8-std"></p></div>
      </div>
    </div>`,
    dispo: M => fini(M.actifs),
    maj(M, reg) {
      const cfg = M.cfg;
      T("e8-act", n0(M.actifs)); Hh("e8-act-t", `${pluriel(M.actifs, "préparateur")} au picking<br>en ce moment${fini(M.presents) ? `, <b>${n0(M.presents)}</b> depuis ce matin` : ""}`);
      Hh("e8-ops", bonshommes(M.actifs, null));
      const noms = reg.noms ? M.operateurs.filter(o => o.lignes > 0).map(o => String(o.nom)).sort((a, b) => a.localeCompare(b, "fr")) : [];
      Hh("e8-noms", noms.map(n => `<span>${esc(n)}</span>`).join(""));
      const qj = M.pctStandardJour, nq = !fini(qj) ? "na" : qj >= cfg.quotaVert ? "ok" : qj >= cfg.quotaRouge ? "warn" : "crit";
      T("e8-q", fini(qj) ? n0(qj) + " %" : "–");
      $("#e8-j").style.setProperty("--v", clamp((qj || 0) / 150 * 100, 0, 100).toFixed(1) + "%"); Niv("e8-j", nq);
      Hh("e8-past", pastille(nq, { ok: "Quota atteint", warn: "Un peu sous le quota", crit: "Sous le quota", na: "En attente" }[nq]));
      const q = M.operateurs.map(o => o.quota).filter(fini), dessus = q.filter(x => x >= 100).length;
      Hh("e8-rep", q.length ? `<b>${dessus}</b> ${pluriel(dessus, "préparateur est", "préparateurs sont")} à 100 % ou plus, <b>${q.length - dessus}</b> en dessous.` : "");
      grPoints($("#g-points"), M);
      const s = M.securite || {}, acc = reg.dernierAccident ? Math.floor((Date.now() - new Date(reg.dernierAccident + "T00:00:00").getTime()) / 864e5) : s.joursSansAccident;
      T("e8-jsa", fini(acc) && acc >= 0 ? n0(acc) : "–");
      Hh("e8-msg", esc(reg.message || s.message || "La sécurité commence avant la production.") + (fini(+s.remontees) && s.remontees != null && +s.remontees > 0 ? `<br><b>${n0(+s.remontees)}</b> ${pluriel(+s.remontees, "remontée")} « Œil sécurité » ce mois : merci.` : ""));
      const h = M.historique, rec = h.length ? h.reduce((a, b) => (b.lignes > a.lignes ? b : a)) : null, hier = h.length ? h[h.length - 1] : null;
      Hh("e8-bravo", rec ? `Record des ${h.length} derniers jours : <b>${n0(rec.lignes)} lignes</b> le ${jourLong(new Date(rec.d + "T12:00:00"))}.${hier ? `<br>Dernière journée complète : <b>${n0(hier.lignes)} lignes</b> à ${n0(hier.ops)}.` : ""}` : `Aujourd'hui, l'équipe a déjà préparé <b>${n0(M.fait)} lignes</b>.`);
      const st = stdDuJour(); Hh("e8-std", `<b>${esc(st[0])} · ${esc(st[1])}</b><br>${esc(st[2])}`);
      return `<b>${n0(M.actifs)} ${pluriel(M.actifs, "préparateur")}</b> ${pluriel(M.actifs, "est actif", "sont actifs")}.${fini(qj) ? ` Depuis le début du poste, l'équipe est à <b>${n0(qj)} % du quota</b>.` : ""}`;
    }
  },

  /* ───────── 9. Les prochains jours ───────── */
  {
    id: "prevision", nom: "Les prochains jours", question: "Que nous réserve la suite ?",
    html: `<div class="corps e9">
      <div class="bloc graphe anim" style="--i:0"><h3>${ic("calendrier")}Lignes à préparer, par jour d'expédition</h3><div class="gr" id="g-carnet"></div>
        <p class="note" id="e9-note"></p>
      </div>
      <div class="col">
        <div class="bloc anim" style="--i:1"><h3>${ic("equipe")}<span id="e9-j">Prochain jour ouvré</span></h3>
          <div class="duo"><div class="gros" id="e9-ops">–</div><p class="expl" id="e9-ops-t"></p></div>
        </div>
        <div class="bloc anim" style="--i:2"><h3>${ic("tendance")}Lignes préparées par jour, 30 derniers jours</h3><div class="gr" id="g-hist"></div>
          <p class="note" style="margin:.2rem 0 .1rem">Trait gris : la moyenne de la période.</p>
          <div class="trio"><div class="mini"><span class="l">Moyenne</span><b id="e9-moy">–</b></div><div class="mini"><span class="l">Record</span><b id="e9-rec">–</b></div><div class="mini"><span class="l" id="e9-jt">Jour type</span><b id="e9-typ">–</b></div></div>
        </div>
      </div>
    </div>`,
    dispo: M => M.carnet.length > 0,
    maj(M) {
      const cfg = M.cfg, c = M.carnet[0], h = M.historique;
      grCarnet($("#g-carnet"), M);
      T("e9-note", `Estimation : ${n0(cfg.partPick * 100)} % du carnet de commandes revient au Pick & Pack. Besoin = lignes ÷ ${n0(cfg.quotaJour)} lignes par préparateur et par jour.`);
      const d = new Date(c.date + "T12:00:00"), lig = c.lignes * cfg.partPick, besoin = lig / cfg.quotaJour;
      T("e9-j", jourLong(d)); T("e9-ops", n1(besoin)); Hh("e9-ops-t", `préparateurs au standard<br>pour <b>${n0(lig)} lignes</b> estimées`);
      grHistorique($("#g-hist"), h.map(x => ({ v: x.lignes, l: new Date(x.d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) })), { repere: h.length ? h.reduce((s, x) => s + x.lignes, 0) / h.length : null, titre: "Lignes par jour sur 30 jours" });
      const moy = h.length ? h.reduce((s, x) => s + x.lignes, 0) / h.length : null, memes = h.filter(x => new Date(x.d + "T12:00:00").getDay() === d.getDay());
      T("e9-moy", n0(moy)); T("e9-rec", h.length ? n0(Math.max(...h.map(x => x.lignes))) : "–");
      T("e9-jt", "Un " + d.toLocaleDateString("fr-FR", { weekday: "long" }) + " moyen"); T("e9-typ", memes.length ? n0(memes.reduce((s, x) => s + x.lignes, 0) / memes.length) : "–");
      const j = d.toLocaleDateString("fr-FR", { weekday: "long" });
      return `${j.charAt(0).toUpperCase() + j.slice(1)} : environ <b>${n0(lig)} lignes</b> à préparer, soit <b>${n1(besoin)} préparateurs</b> au standard.`;
    }
  },

  /* ───────── 10. Le mois ───────── */
  {
    id: "mois", nom: "Le mois", question: "Tient-on nos objectifs ?",
    html: `<div class="corps e10" id="e10-grille"></div>`,
    dispo: M => !!M.mois && +M.mois.lignes > 0,
    maj(M) {
      const m = M.mois, cfg = M.cfg, h = M.historique, j = +m.jours || 1;
      const lh = +m.hPick > 0 ? m.lignes / m.hPick : null;
      const pd = ppm(+m.ed || 0, +m.lignes), pa = ppm(+m.ea || 0, +m.lignes), rj = fini(+m.rejetsJour) && m.rejetsJour != null ? +m.rejetsJour : null, edj = (+m.ed || 0) / j;
      const moy30 = h.length ? h.reduce((s, x) => s + x.lignes, 0) / h.length : null;
      const mot = n => ({ ok: "Dans l'objectif", warn: "À surveiller", crit: "Hors objectif", na: "Pour information" }[n]);
      const K = [
        { t: "Lignes préparées par jour", icone: "couches", v: n0(m.lignes / j), u: "lignes", niv: "na", obj: fini(moy30) ? `moyenne des 30 derniers jours : ${n0(moy30)}` : "", s: h.map(x => ({ v: x.lignes })), rep: moy30 },
        fini(+m.quota) && m.quota != null
          ? { t: "Quota moyen de l'équipe", icone: "vitesse", v: n1(+m.quota), u: "% du quota, chariots pondérés", niv: +m.quota >= cfg.quotaVert ? "ok" : +m.quota >= cfg.quotaRouge ? "warn" : "crit", obj: `vert à partir de ${cfg.quotaVert} %, rouge sous ${cfg.quotaRouge} %`, s: h.map(x => ({ v: x.quota })), rep: 100, fmt: n0 }
          : { t: "Productivité", icone: "vitesse", v: n1(lh), u: "lignes par heure de picking", niv: "na", obj: `standard sans coefficient : ${n1(M.standardH)}`, s: h.map(x => ({ v: x.hPick > 0 ? x.lignes / x.hPick : null })), rep: M.standardH, fmt: n1 },
        { t: "Erreurs décelées par jour", icone: "loupe", v: n1(edj), u: "au poste de contrôle", niv: nivSeuils(edj, cfg.decOrange, cfg.decRouge), obj: `alerte à ${cfg.decOrange}, rouge à ${cfg.decRouge}`, s: h.map(x => ({ v: x.ed })), rep: cfg.decOrange },
        { t: "PPM décelée", icone: "cible", v: n0(pd), u: "erreurs décelées par million de lignes", niv: nivSeuils(pd, cfg.ppmDecOrange, cfg.ppmDecRouge), obj: `orange à ${n0(cfg.ppmDecOrange)}, rouge à ${n0(cfg.ppmDecRouge)}`, s: h.map(x => ({ v: x.lignes > 0 ? x.ed / x.lignes * 1e6 : null })), rep: cfg.ppmDecOrange },
        { t: "PPM avérée", icone: "camion", v: n0(pa), u: "erreurs arrivées chez le client, par million", niv: nivSeuils(pa, cfg.ppmAveOrange, cfg.ppmAveRouge), obj: `orange à ${cfg.ppmAveOrange}, rouge à ${cfg.ppmAveRouge}`, s: h.map((x, i) => { const f = h.slice(Math.max(0, i - 9), i + 1), l = f.reduce((a, b) => a + b.lignes, 0); return { v: l > 0 ? f.reduce((a, b) => a + b.ea, 0) / l * 1e6 : null }; }), rep: cfg.ppmAveOrange },
        { t: "Rejets par jour", icone: "balance", v: n0(rj), u: "colis écartés par la balance", niv: !fini(rj) ? "na" : rj > cfg.rejetsMax ? "crit" : rj > cfg.rejetsMax * 0.9 ? "warn" : "ok", obj: `maximum : ${cfg.rejetsMax}`, s: h.map(x => ({ v: x.rejets })), rep: cfg.rejetsMax }
      ];
      Hh("e10-grille", K.map((k, i) => `<div class="bloc kpi anim" style="--i:${i}"${k.niv !== "na" ? ` data-niv="${k.niv}"` : ""}><h3>${ic(k.icone)}${esc(k.t)}</h3><div class="kpi-v"><b>${k.v}</b><span>${esc(k.u)}</span></div><div class="ligne">${pastille(k.niv, mot(k.niv), false, k.niv === "na" ? "tendance" : null)}<span class="note">${esc(k.obj)}</span></div><div class="gr" id="g-kpi${i}"></div></div>`).join(""));
      K.forEach((k, i) => grHistorique($("#g-kpi" + i), k.s, { compact: true, repere: k.rep, fmt: k.fmt, titre: k.t + " sur 30 jours" }));
      const juges = K.filter(k => k.niv !== "na"), ok = juges.filter(k => k.niv === "ok").length;
      return `Depuis le début du mois, <b>${ok} ${pluriel(ok, "indicateur")} sur ${juges.length}</b> ${pluriel(ok, "est", "sont")} dans l'objectif. Trait gris : le seuil ou le standard.`;
    }
  },

  /* ───────── 11. Les alertes ───────── */
  {
    id: "alertes", nom: "À faire", question: "Que faut-il faire maintenant ?",
    html: `<div class="corps e11" id="e11-liste"></div>`,
    dispo: () => true,
    maj(M) {
      const A = M.alertes.slice(0, 5);
      Hh("e11-liste", A.length ? A.map((a, i) => `<article class="alerte anim" style="--i:${i}" data-niv="${a.niv}">${ic(a.niv)}<div><h4>${esc(a.titre)}</h4><p>${esc(a.texte)}</p></div><div class="action"><span>À faire</span><b>${esc(a.action)}</b></div></article>`).join("")
        : `<div class="rien anim">${ic("ok")}<b>Rien à signaler</b><p>La journée se déroule comme prévu : fin dans les temps, rejets et erreurs sous les seuils.</p></div>`);
      return A.length ? `<b>${A.length} ${pluriel(A.length, "point demande", "points demandent")}</b> une action. Le plus important est en haut.` : "Aucune alerte en ce moment.";
    }
  },

  /* ───────── 12. Le standard du jour ───────── */
  {
    id: "standard", nom: "Le standard du jour", question: "Le standard du jour",
    html: `<div class="corps e12">
      <div class="std-img anim" style="--i:0"><img id="e12-img" alt="" decoding="async"></div>
      <div class="col anim" style="--i:1">
        <div class="std-img petit" id="e12-cadre2" hidden><img id="e12-img2" alt="" decoding="async"></div>
        <div id="e12-texte" class="col" style="gap:1.1rem"><span class="std-code" id="e12-code"></span>
        <h3 class="std-titre" id="e12-titre"></h3>
        <p class="std-sous" id="e12-sous"></p></div>
        <p class="note" style="font-size:1.1rem">Les 18 standards complets, avec quiz, sont dans l'appli Standards Pick &amp; Pack (QR code au dos de ta carte).</p>
      </div>
    </div>`,
    dispo: () => stdDispo,
    maj() {
      const s = stdDuJour(), img = $("#e12-img"), src = `slides/P${s[0].slice(1).padStart(2, "0")}-1.webp`;
      if (img.getAttribute("src") !== src) {
        img.src = src; img.alt = `Standard ${s[0]} : ${s[1]}`;
        /* deuxième vue : le principe fondateur du standard, quand la diapositive existe */
        const i2 = $("#e12-img2"), c2 = $("#e12-cadre2"), tx = $("#e12-texte");
        i2.onload = () => { c2.hidden = false; tx.hidden = true; }; i2.onerror = () => { c2.hidden = true; tx.hidden = false; };
        i2.alt = `Principe du standard ${s[0]}`; i2.src = src.replace("-1.webp", "-2.webp");
      }
      T("e12-code", "STANDARD " + s[0]); T("e12-titre", s[1]); T("e12-sous", s[2]);
      return `Aujourd'hui, on révise <b>${esc(s[0])} : ${esc(s[1])}</b>.`;
    }
  }
];
