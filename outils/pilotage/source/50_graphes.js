
/* ════════════════════════════════════════════════════════════════════════════
   Graphiques (SVG tracé à la main) : une seule teinte de donnée, un seul axe,
   étiquettes directes choisies, valeurs exactes reprises dans le tableau des données.
   ════════════════════════════════════════════════════════════════════════════ */
const vide = msg => `<div class="vide">${ic("na")}<span>${esc(msg)}</span></div>`;
const Gr = {
  dims(el) { const w = el.clientWidth, h = el.clientHeight; return w > 40 && h > 40 ? { w, h, R: rem() } : null; },
  ticks(max, n) {
    const brut = max / (n || 4), p = Math.pow(10, Math.floor(Math.log10(Math.max(brut, 1e-9))));
    const pas = [1, 2, 2.5, 5, 10].map(k => k * p).find(v => v >= brut) || 10 * p, t = [];
    for (let v = 0; v <= max + 1e-9; v += pas) t.push(v);
    return t;
  },
  svg(w, h, titre, corps) { return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(titre)}">${corps}</svg>`; },
  colonne(x0, x1, y1, yb, r) {
    if (yb - y1 < r * 1.2) return `M${x0} ${yb}V${y1}H${x1}V${yb}Z`;
    return `M${x0} ${yb}V${y1 + r}Q${x0} ${y1} ${x0 + r} ${y1}H${x1 - r}Q${x1} ${y1} ${x1} ${y1 + r}V${yb}Z`;
  },
  f(v) { return Math.round(v * 10) / 10; }
};

/* 1. Avancement cumulé : préparé, rythme à tenir, projection */
function grAvancement(el, M) {
  const g = Gr.dims(el); if (!g) return;
  if (!M.aCharge || M.charge <= 0) { el.innerHTML = vide("La charge du jour n'est pas encore connue."); return; }
  const { w, h, R } = g, f = Gr.f, mg = { g: 4.6 * R, d: 1.4 * R, h: 2.4 * R, b: 2.5 * R }, pw = w - mg.g - mg.d, ph = h - mg.h - mg.b;
  const t0 = Math.floor(M.debut / 60) * 60, t1 = Math.min(1440, Math.ceil((Math.max(M.finVisee || 0, M.eta || 0, M.now) + 25) / 30) * 30);
  const yMax = M.charge * 1.12, X = t => mg.g + (t - t0) / (t1 - t0) * pw, Y = v => mg.h + ph - v / yMax * ph;
  let s = "";
  for (const v of Gr.ticks(yMax, 4)) {
    s += `<line x1="${mg.g}" x2="${w - mg.d}" y1="${f(Y(v))}" y2="${f(Y(v))}" stroke="var(--line-2)"/>`;
    s += `<text x="${mg.g - 0.6 * R}" y="${f(Y(v) + 0.32 * R)}" text-anchor="end" font-size="${0.9 * R}">${n0(v)}</text>`;
  }
  const xV = fini(M.finVisee) ? X(M.finVisee) : -999, pasH = (t1 - t0) / 60 > 11 ? 2 : 1;
  for (let t = Math.ceil(t0 / 60) * 60; t <= t1; t += 60 * pasH) if (Math.abs(X(t) - xV) > 5.6 * R) s += `<text x="${f(X(t))}" y="${h - 0.55 * R}" text-anchor="middle" font-size="${0.9 * R}">${t / 60} h</text>`;
  s += `<line x1="${mg.g}" x2="${w - mg.d}" y1="${f(Y(0))}" y2="${f(Y(0))}" stroke="var(--line)"/>`;
  /* charge du jour */
  s += `<line x1="${mg.g}" x2="${w - mg.d}" y1="${f(Y(M.charge))}" y2="${f(Y(M.charge))}" stroke="var(--ink-3)" stroke-width="1"/>`;
  s += `<text x="${mg.g + 0.5 * R}" y="${f(Y(M.charge) - 0.6 * R)}" font-size="${1 * R}" fill="var(--ink-2)">charge du jour : <tspan font-weight="700" fill="var(--ink)">${n0(M.charge)} lignes</tspan></text>`;
  /* rythme à tenir */
  if (fini(M.finVisee) && M.finVisee > M.debut) {
    s += `<line x1="${f(X(M.debut))}" y1="${f(Y(0))}" x2="${f(xV)}" y2="${f(Y(M.charge))}" stroke="var(--ink-3)" stroke-width="${0.14 * R}"/>`;
    s += `<circle cx="${f(xV)}" cy="${f(Y(M.charge))}" r="${0.36 * R}" fill="var(--ink-3)" stroke="var(--panel)" stroke-width="2"/>`;
    s += `<line x1="${f(xV)}" x2="${f(xV)}" y1="${f(Y(0))}" y2="${f(Y(0) + 0.5 * R)}" stroke="var(--ink)" stroke-width="2"/>`;
    s += `<text x="${f(xV)}" y="${h - 0.55 * R}" text-anchor="middle" font-size="${0.95 * R}" font-weight="700" fill="var(--ink)">visée ${min2hm(M.finVisee)}</text>`;
  }
  /* préparé */
  const pts = [[M.debut, 0]]; let cum = 0;
  for (const x of M.heures) { if ((x.h + 1) * 60 <= M.now) { cum += x.lignes; pts.push([(x.h + 1) * 60, Math.min(cum, M.fait)]); } }
  pts.push([M.now, M.fait]);
  const ligne = pts.map((p, i) => (i ? "L" : "M") + f(X(p[0])) + " " + f(Y(p[1]))).join("");
  s += `<path d="${ligne}L${f(X(M.now))} ${f(Y(0))}L${f(X(M.debut))} ${f(Y(0))}Z" fill="var(--data)" opacity=".16"/>`;
  s += `<path d="${ligne}" fill="none" stroke="var(--data)" stroke-width="${0.2 * R}" stroke-linejoin="round" stroke-linecap="round"/>`;
  /* maintenant */
  s += `<line x1="${f(X(M.now))}" x2="${f(X(M.now))}" y1="${f(Y(0))}" y2="${f(Y(M.fait))}" stroke="var(--data-hi)" stroke-width="1" opacity=".6"/>`;
  /* projection */
  if (fini(M.eta) && M.reste > 0) {
    s += `<line x1="${f(X(M.now))}" y1="${f(Y(M.fait))}" x2="${f(X(M.eta))}" y2="${f(Y(M.charge))}" stroke="var(--data-hi)" stroke-width="${0.16 * R}" stroke-dasharray="${0.55 * R} ${0.45 * R}" stroke-linecap="round"/>`;
    s += `<circle cx="${f(X(M.eta))}" cy="${f(Y(M.charge))}" r="${0.46 * R}" fill="var(--data-hi)" stroke="var(--panel)" stroke-width="2"/>`;
    const aDroite = X(M.eta) < w - 11 * R;
    s += `<text x="${f(X(M.eta) + (aDroite ? 0.8 : -0.8) * R)}" y="${f(Y(M.charge) - 0.65 * R)}" text-anchor="${aDroite ? "start" : "end"}" font-size="${1.08 * R}" font-weight="700" fill="var(--ink)">fin estimée ${min2hm(M.eta)}</text>`;
  }
  const ideal = fini(M.finVisee) && M.finVisee > M.debut ? M.charge * (M.now - M.debut) / (M.finVisee - M.debut) : 0, dessus = M.fait >= ideal;
  s += `<circle cx="${f(X(M.now))}" cy="${f(Y(M.fait))}" r="${0.5 * R}" fill="var(--data)" stroke="var(--panel)" stroke-width="2"/>`;
  s += `<text x="${f(X(M.now) + (dessus ? -0.8 : 0.9) * R)}" y="${f(Y(M.fait) + (dessus ? -0.75 : 1.5) * R)}" text-anchor="${dessus ? "end" : "start"}" font-size="${1.08 * R}" font-weight="700" fill="var(--ink)">${n0(M.fait)} à ${min2hm(M.now)}</text>`;
  el.innerHTML = Gr.svg(w, h, `Lignes préparées : ${n0(M.fait)} sur ${n0(M.charge)}, fin estimée ${min2hm(M.eta)}`, s);
}

/* 2. Lignes heure par heure, avec le débit à tenir d'ici la fin */
function grHeures(el, M) {
  const g = Gr.dims(el); if (!g) return;
  if (!M.heures.length) { el.innerHTML = vide("Aucune ligne validée pour l'instant."); return; }
  const { w, h, R } = g, f = Gr.f, mg = { g: 8.2 * R, d: 0.8 * R, h: 2.4 * R, b: 5.6 * R }, pw = w - mg.g - mg.d, ph = h - mg.h - mg.b;
  const h0 = Math.min(M.heures[0].h, Math.floor(M.debut / 60)), h1 = Math.max(M.heures[M.heures.length - 1].h, fini(M.finVisee) ? Math.ceil(M.finVisee / 60) - 1 : 0);
  const n = h1 - h0 + 1, bande = pw / n, lc = Math.min(2.5 * R, bande * 0.56), hc = Math.floor(M.now / 60);
  const maxL = Math.max(...M.heures.map(x => x.lignes)), besoin = fini(M.debitNecessaire) ? M.debitNecessaire : 0, yMax = Math.max(maxL, besoin) * 1.2 || 1;
  const Y = v => mg.h + ph - v / yMax * ph, yb = Y(0);
  let s = "";
  for (const v of Gr.ticks(yMax, 4)) {
    s += `<line x1="${mg.g}" x2="${w - mg.d}" y1="${f(Y(v))}" y2="${f(Y(v))}" stroke="var(--line-2)"/>`;
    s += `<text x="${mg.g - 0.6 * R}" y="${f(Y(v) + 0.32 * R)}" text-anchor="end" font-size="${0.9 * R}">${n0(v)}</text>`;
  }
  s += `<line x1="${mg.g}" x2="${w - mg.d}" y1="${f(yb)}" y2="${f(yb)}" stroke="var(--line)"/>`;
  const yH = yb + 1.5 * R, yL = yb + 3.2 * R, yO = yb + 4.75 * R;
  s += `<text x="${mg.g - 0.6 * R}" y="${f(yL)}" text-anchor="end" font-size="${0.92 * R}">lignes</text><text x="${mg.g - 0.6 * R}" y="${f(yO)}" text-anchor="end" font-size="${0.92 * R}">préparateurs</text>`;
  s += `<line x1="${0.4 * R}" x2="${w - mg.d}" y1="${f(yb + 2.05 * R)}" y2="${f(yb + 2.05 * R)}" stroke="var(--line-2)"/><line x1="${0.4 * R}" x2="${w - mg.d}" y1="${f(yb + 3.65 * R)}" y2="${f(yb + 3.65 * R)}" stroke="var(--line-2)"/>`;
  for (let i = 0; i < n; i++) {
    const hh = h0 + i, xc = mg.g + bande * (i + 0.5), x = M.heures.find(q => q.h === hh), enCours = hh === hc;
    s += `<text x="${f(xc)}" y="${f(yH)}" text-anchor="middle" font-size="${0.95 * R}" ${enCours ? 'font-weight="700" fill="var(--ink)"' : ""}>${hh} h</text>`;
    if (!x) continue;
    const y1 = Y(x.lignes);
    s += `<path d="${Gr.colonne(f(xc - lc / 2), f(xc + lc / 2), f(y1), f(yb), 0.3 * R)}" fill="var(--data)" ${enCours ? 'opacity=".55"' : ""} data-bulle="${hh} h : ${n0(x.lignes)} lignes${fini(x.ops) ? " · " + x.ops + " préparateurs" : ""}"/>`;
    if (x.lignes === maxL || enCours) s += `<text x="${f(xc)}" y="${f(y1 - 0.55 * R)}" text-anchor="middle" font-size="${1.05 * R}" font-weight="700" fill="var(--ink)">${enCours ? "en cours" : n0(x.lignes)}</text>`;
    s += `<text x="${f(xc)}" y="${f(yL)}" text-anchor="middle" font-size="${1 * R}" fill="var(--ink)" style="font-variant-numeric:tabular-nums">${n0(x.lignes)}</text>`;
    if (fini(x.ops)) s += `<text x="${f(xc)}" y="${f(yO)}" text-anchor="middle" font-size="${1 * R}" style="font-variant-numeric:tabular-nums">${x.ops}</text>`;
  }
  /* débit à tenir : de l'heure en cours à l'heure visée */
  if (besoin > 0 && hc >= h0 && hc <= h1) {
    const xa = mg.g + bande * (hc - h0) + bande * 0.08, xb = w - mg.d, yy = Y(besoin);
    s += `<line x1="${f(xa)}" x2="${f(xb)}" y1="${f(yy)}" y2="${f(yy)}" stroke="var(--ink-3)" stroke-width="${0.16 * R}" stroke-linecap="round"/>`;
    s += `<text x="${f(xb)}" y="${f(yy - 0.6 * R)}" text-anchor="end" font-size="${1 * R}" fill="var(--ink)">à tenir : <tspan font-weight="700">${n0(besoin)} par heure</tspan></text>`;
  }
  el.innerHTML = Gr.svg(w, h, "Lignes préparées par heure", s);
}

/* 3. Barres classées (HTML) */
function barresRang(items, classe) {
  const max = Math.max(1, ...items.map(x => x.n));
  return items.map(x => `<div class="${classe || "tm"}"><span>${esc(x.nom)}</span><div class="jauge" style="--v:${(x.n / max * 100).toFixed(1)}%"><i${x.n ? "" : ' style="display:none"'}></i></div><b>${n0(x.n)}</b></div>`).join("");
}

/* 4. Quota de chacun, anonymisé : un point par préparateur, empilés par tranche de 5 % */
function grPoints(el, M) {
  const g = Gr.dims(el); if (!g) return;
  const vals = M.operateurs.map(o => o.quota).filter(fini);
  if (vals.length < 2) { el.innerHTML = vide("Pas encore assez de lignes pour comparer."); return; }
  const { w, h, R } = g, f = Gr.f, mg = { g: 1.4 * R, d: 1.4 * R, h: 2.8 * R, b: 2.8 * R }, pw = w - mg.g - mg.d, yb = h - mg.b;
  const x0 = Math.min(50, Math.floor(Math.min(...vals) / 10) * 10), x1 = Math.max(140, Math.ceil(Math.max(...vals) / 10) * 10), X = v => mg.g + (v - x0) / (x1 - x0) * pw;
  const pas = 5, tas = {}, compte = {};
  vals.forEach(v => { const b = Math.floor(v / pas); compte[b] = (compte[b] || 0) + 1; });
  const haut = Math.max(...Object.values(compte)), r = Math.min(1.05 * R, pw / ((x1 - x0) / pas) * 0.45, (yb - mg.h - 0.6 * R) / (haut * 2.25));
  let s = `<line x1="${mg.g}" x2="${w - mg.d}" y1="${yb}" y2="${yb}" stroke="var(--line)"/>`;
  for (let v = Math.ceil(x0 / 20) * 20; v <= x1; v += 20) s += `<text x="${f(X(v))}" y="${yb + 1.5 * R}" text-anchor="middle" font-size="${0.95 * R}">${v} %</text>`;
  const xs = X(100);
  s += `<line x1="${f(xs)}" x2="${f(xs)}" y1="${mg.h - 0.2 * R}" y2="${yb}" stroke="var(--ink)" stroke-width="2"/>`;
  s += `<text x="${f(xs)}" y="${mg.h - 0.9 * R}" text-anchor="middle" font-size="${1.05 * R}" font-weight="700" fill="var(--ink)">quota 100 %</text>`;
  vals.slice().sort((a, b) => a - b).forEach(v => {
    const b = Math.floor(v / pas), k = tas[b] = (tas[b] || 0) + 1, cx = X((b + 0.5) * pas), cy = yb - r - 3 - (k - 1) * (2 * r + 3);
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="var(--data)" stroke="var(--panel)" stroke-width="2" data-bulle="${n0(v)} % du quota"/>`;
  });
  el.innerHTML = Gr.svg(w, h, "Répartition des quotas des préparateurs, sans les noms", s);
}

/* 5. Carnet des prochains jours : lignes à préparer et préparateurs nécessaires */
function grCarnet(el, M) {
  const g = Gr.dims(el); if (!g) return;
  if (!M.carnet.length) { el.innerHTML = vide("Carnet de commandes non branché."); return; }
  const { w, h, R } = g, f = Gr.f, mg = { g: 4.6 * R, d: 1 * R, h: 2.6 * R, b: 5.2 * R }, pw = w - mg.g - mg.d, ph = h - mg.h - mg.b;
  const d = M.carnet.map(x => ({ date: new Date(x.date + "T12:00:00"), lig: Math.round(x.lignes * M.cfg.partPick) }));
  const yMax = Math.max(...d.map(x => x.lig)) * 1.18 || 1, Y = v => mg.h + ph - v / yMax * ph, yb = Y(0), bande = pw / d.length, lc = Math.min(3.4 * R, bande * 0.42);
  let s = "";
  for (const v of Gr.ticks(yMax, 4)) {
    s += `<line x1="${mg.g}" x2="${w - mg.d}" y1="${f(Y(v))}" y2="${f(Y(v))}" stroke="var(--line-2)"/>`;
    s += `<text x="${mg.g - 0.6 * R}" y="${f(Y(v) + 0.32 * R)}" text-anchor="end" font-size="${0.9 * R}">${n0(v)}</text>`;
  }
  s += `<line x1="${mg.g}" x2="${w - mg.d}" y1="${f(yb)}" y2="${f(yb)}" stroke="var(--line)"/>`;
  d.forEach((x, i) => {
    const xc = mg.g + bande * (i + 0.5), y1 = Y(x.lig), besoin = x.lig / M.cfg.quotaJour;
    s += `<path d="${Gr.colonne(f(xc - lc / 2), f(xc + lc / 2), f(y1), f(yb), 0.35 * R)}" fill="var(--data)" data-bulle="${n0(x.lig)} lignes estimées pour le Pick &amp; Pack"/>`;
    s += `<text x="${f(xc)}" y="${f(y1 - 0.6 * R)}" text-anchor="middle" font-size="${1.25 * R}" font-weight="700" fill="var(--ink)">${n0(x.lig)}</text>`;
    s += `<text x="${f(xc)}" y="${f(yb + 1.6 * R)}" text-anchor="middle" font-size="${1.05 * R}" fill="var(--ink)">${esc(x.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric" }))}</text>`;
    const lp = Math.min(bande * 0.92, 11.2 * R);
    s += `<rect x="${f(xc - lp / 2)}" y="${f(yb + 2.4 * R)}" width="${f(lp)}" height="${2.1 * R}" rx="${1.05 * R}" fill="rgba(57,135,229,.2)" stroke="rgba(125,184,255,.55)"/>`;
    s += `<text x="${f(xc)}" y="${f(yb + 3.8 * R)}" text-anchor="middle" font-size="${1.05 * R}" font-weight="700" fill="var(--ink)">${n1(besoin)} préparateurs</text>`;
  });
  el.innerHTML = Gr.svg(w, h, "Lignes à préparer sur les prochains jours", s);
}

/* 6. Courbe d'historique : aire légère, dernier point mis en avant, moyenne en repère */
function grHistorique(el, serie, o) {
  const g = Gr.dims(el); if (!g) return;
  o = o || {};
  const v = serie.filter(x => fini(x.v));
  if (v.length < 3) { el.innerHTML = vide("Historique non branché."); return; }
  const { w, h, R } = g, f = Gr.f, compact = !!o.compact;
  const mg = compact ? { g: 0.3 * R, d: 4.4 * R, h: 0.9 * R, b: 0.5 * R } : { g: 0.6 * R, d: 5.6 * R, h: 1.6 * R, b: 2 * R }, pw = w - mg.g - mg.d, ph = h - mg.h - mg.b;
  const vs = v.map(x => x.v), repere = o.repere, lo = Math.min(...vs, fini(repere) ? repere : Infinity), hi = Math.max(...vs, fini(repere) ? repere : -Infinity), e = (hi - lo) || 1;
  const y0 = o.zero ? 0 : lo - e * 0.12, y1 = hi + e * 0.12, X = i => mg.g + (v.length > 1 ? i / (v.length - 1) : 0.5) * pw, Y = q => mg.h + ph - (q - y0) / (y1 - y0) * ph;
  const ligne = v.map((x, i) => (i ? "L" : "M") + f(X(i)) + " " + f(Y(x.v))).join("");
  let s = `<path d="${ligne}L${f(X(v.length - 1))} ${f(mg.h + ph)}L${f(X(0))} ${f(mg.h + ph)}Z" fill="var(--data)" opacity=".13"/>`;
  if (fini(repere)) {
    s += `<line x1="${mg.g}" x2="${f(mg.g + pw)}" y1="${f(Y(repere))}" y2="${f(Y(repere))}" stroke="var(--ink-3)" stroke-width="1"/>`;
    if (!compact) s += `<text x="${f(mg.g + 0.3 * R)}" y="${f(Y(repere) - 0.45 * R)}" font-size="${0.9 * R}">${esc(o.repereTxt || "")}</text>`;
  }
  s += `<path d="${ligne}" fill="none" stroke="var(--data)" stroke-width="${(compact ? 0.15 : 0.18) * R}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const der = v[v.length - 1];
  s += `<circle cx="${f(X(v.length - 1))}" cy="${f(Y(der.v))}" r="${(compact ? 0.38 : 0.46) * R}" fill="var(--data-hi)" stroke="var(--panel)" stroke-width="2"/>`;
  s += `<text x="${f(X(v.length - 1) + 0.8 * R)}" y="${f(Y(der.v) + 0.38 * R)}" font-size="${(compact ? 0.98 : 1.1) * R}" font-weight="700" fill="var(--ink)">${o.fmt ? o.fmt(der.v) : n0(der.v)}</text>`;
  if (!compact) {
    s += `<text x="${mg.g}" y="${h - 0.4 * R}" font-size="${0.9 * R}">${esc(v[0].l || "")}</text>`;
    s += `<text x="${f(mg.g + pw)}" y="${h - 0.4 * R}" text-anchor="end" font-size="${0.9 * R}">${esc(der.l || "")}</text>`;
  }
  el.innerHTML = Gr.svg(w, h, o.titre || "Historique", s);
}

/* 7. Petites colonnes (rejets par heure) */
function grMiniColonnes(el, vals, unite) {
  const g = Gr.dims(el); if (!g) return;
  if (!vals.length) { el.innerHTML = ""; return; }
  const { w, h, R } = g, f = Gr.f, mg = { g: 0.2 * R, d: 0.2 * R, h: 1.6 * R, b: 1.5 * R }, pw = w - mg.g - mg.d, ph = h - mg.h - mg.b;
  const max = Math.max(1, ...vals.map(x => x.n)), bande = pw / vals.length, lc = Math.min(1.5 * R, bande * 0.6), yb = mg.h + ph;
  let s = `<line x1="${mg.g}" x2="${w - mg.d}" y1="${yb}" y2="${yb}" stroke="var(--line)"/>`, etiq = false;
  vals.forEach((x, i) => {
    const xc = mg.g + bande * (i + 0.5), y1 = yb - x.n / max * ph;
    if (x.n > 0) s += `<path d="${Gr.colonne(f(xc - lc / 2), f(xc + lc / 2), f(y1), f(yb), 0.22 * R)}" fill="var(--data)" data-bulle="${x.h} h : ${n0(x.n)} ${unite}"/>`;
    if (x.n === max && !etiq) { etiq = true; s += `<text x="${f(xc)}" y="${f(y1 - 0.4 * R)}" text-anchor="middle" font-size="${0.95 * R}" font-weight="700" fill="var(--ink)">${n0(x.n)}</text>`; }
    if (i === 0 || i === vals.length - 1) s += `<text x="${f(xc)}" y="${f(yb + 1.2 * R)}" text-anchor="middle" font-size="${0.85 * R}">${x.h} h</text>`;
  });
  el.innerHTML = Gr.svg(w, h, "Répartition par heure", s);
}

/* 8. Silhouettes : besoin, marge, manque */
function bonshommes(actifs, besoin) {
  const a = Math.max(0, Math.round(actifs || 0)), b = fini(besoin) ? Math.ceil(besoin - 0.05) : a, n = Math.min(40, Math.max(a, b));
  let s = "";
  for (let i = 0; i < n; i++) {
    const cls = i < Math.min(a, b) ? "" : i < a ? " marge" : " manque";
    s += `<svg class="bh${cls}" viewBox="0 0 24 32" aria-hidden="true"><circle cx="12" cy="6" r="5"/><path d="M2.500 30c0-9 3.500-15 9.500-15s9.500 6 9.500 15z"/></svg>`;
  }
  return s;
}
