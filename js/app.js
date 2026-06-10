/* UI layer: renders tabs, match list, bracket, team odds; everything reads
 * from one simulation run (re-run automatically on load, so editing
 * data/results.js updates every view, the Elo ratings and the accuracy badge). */
(() => {
  const SIM = MODEL.runTournament();
  const projPredCache = {};

  const $ = sel => document.querySelector(sel);
  const pct = (x, dp = 0) => (100 * x).toFixed(dp) + "%";
  const KO_STAGES = { R32: "Round of 32", R16: "Round of 16", QF: "Quarter-final", SF: "Semi-final", "3P": "Third place", F: "FINAL" };

  function americanOdds(p) {
    if (p <= 0.0001) return "—";
    if (p >= 0.5) return "-" + Math.round(100 * p / (1 - p));
    return "+" + Math.round(100 * (1 - p) / p);
  }

  function slotLabel(slot) {
    if (MODEL.teamById[slot]) return MODEL.teamById[slot].name;
    if (slot[0] === "1") return `Group ${slot[1]} winner`;
    if (slot[0] === "2") return `Group ${slot[1]} runner-up`;
    if (slot[0] === "T") {
      const def = THIRD_SLOTS.find(s => s.key === slot);
      return `3rd place (${def ? def.groups.join("/") : "?"})`;
    }
    if (slot[0] === "W") return `Winner M${slot.slice(1)}`;
    if (slot[0] === "L") return `SF${slot.slice(1) === "101" ? 1 : 2} loser`;
    return slot;
  }

  // most likely occupant of one side of a knockout match
  function likelySide(match, side) {
    const direct = MODEL.resolveTeam(side === "home" ? match.home : match.away);
    if (direct) return { id: direct, p: 1, known: true };
    const counts = (SIM.koAppear[match.id] || {})[side] || {};
    let best = null, n = 0, tot = 0;
    for (const [id, c] of Object.entries(counts)) { tot += c; if (c > n) { n = c; best = id; } }
    return best ? { id: best, p: n / MODEL.SIMS, known: false } : null;
  }

  // prediction for a match: real if teams known, else projected most-likely tie
  function predFor(match) {
    if (SIM.currentPreds[match.id]) return { pred: SIM.currentPreds[match.id], projected: false };
    const h = likelySide(match, "home"), a = likelySide(match, "away");
    if (!h || !a) return null;
    const key = match.id + ":" + h.id + ":" + a.id;
    if (!projPredCache[key]) {
      projPredCache[key] = MODEL.predictMatch(h.id, a.id, match.venue, match.stage, SIM.eloMap);
    }
    return { pred: projPredCache[key], projected: !(h.known && a.known) };
  }

  // ---------------- header: accuracy badge ----------------
  function renderAccuracy() {
    const { hits, total } = SIM;
    if (!total) {
      $("#acc-value").textContent = "—";
      $("#acc-detail").textContent = "no games finished yet";
    } else {
      $("#acc-value").textContent = Math.round(100 * hits / total) + "%";
      $("#acc-detail").textContent = `${hits} of ${total} games called right`;
    }
  }

  // ---------------- matches tab ----------------
  function matchRow(m) {
    const info = predFor(m);
    const r = RESULTS[m.id];
    const hS = likelySide(m, "home"), aS = likelySide(m, "away");
    const ht = hS && MODEL.teamById[hS.id], at = aS && MODEL.teamById[aS.id];
    const v = MODEL.venueById[m.venue];
    const stageTxt = m.stage === "group" ? `Group ${m.group}` : KO_STAGES[m.stage];

    const nameCell = (t, s, side) => t
      ? `<div class="match-team ${side}"><span class="flag">${t.flag}</span><span>${t.name}${s.known ? "" : ` <small style="color:var(--muted)">(${pct(s.p)} likely)</small>`}</span></div>`
      : `<div class="match-team ${side}" style="color:var(--muted)">${slotLabel(side === "right" ? m.away : m.home)}</div>`;

    let center;
    if (r) {
      const tag = info && info.pred.correct != null
        ? `<span class="result-tag ${info.pred.correct ? "hit" : "miss"}">${info.pred.correct ? "HIT" : "MISS"}</span>` : "";
      const et = r.winner ? `<span class="pred-tag">${MODEL.teamById[r.winner].name} adv.</span>` : "";
      center = `<div class="match-center"><div class="match-score">${r.h} – ${r.a}</div>${et}${tag}</div>`;
    } else if (info) {
      center = `<div class="match-center"><div class="match-score predicted">${info.pred.predScore.h} – ${info.pred.predScore.a}<span class="pred-tag">predicted</span></div></div>`;
    } else {
      center = `<div class="match-center"><div class="match-score predicted">vs</div></div>`;
    }

    let probs = "";
    if (info) {
      const p = info.pred;
      probs = `<div class="prob-wrap">
        <div class="prob-bar">
          <div class="ph" style="width:${100 * p.pHome}%"></div>
          <div class="pd" style="width:${100 * p.pDraw}%"></div>
          <div class="pa" style="width:${100 * p.pAway}%"></div>
        </div>
        <div class="prob-labels"><span>${pct(p.pHome)}</span><span>draw ${pct(p.pDraw)}</span><span>${pct(p.pAway)}</span></div>
      </div>`;
    }

    return `<div class="match-card" data-mid="${m.id}">
      <div class="match-meta">${stageTxt}<br>${v.city}</div>
      ${nameCell(ht, hS, "")}
      ${center}
      ${nameCell(at, aS, "right")}
      ${probs}
    </div>`;
  }

  function renderMatches() {
    const stage = $("#match-filter-stage").value;
    const group = $("#match-filter-group").value;
    const status = $("#match-filter-status").value;
    const teamQ = $("#match-filter-team").value.trim().toLowerCase();

    let list = [...SCHEDULE].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
    if (stage !== "all") list = list.filter(m => stage === "F" ? (m.stage === "F" || m.stage === "3P") : m.stage === stage);
    if (group !== "all") list = list.filter(m => m.group === group);
    if (status === "past") list = list.filter(m => RESULTS[m.id]);
    if (status === "future") list = list.filter(m => !RESULTS[m.id]);
    if (teamQ) {
      list = list.filter(m => {
        const hS = likelySide(m, "home"), aS = likelySide(m, "away");
        return [hS, aS].some(s => s && MODEL.teamById[s.id].name.toLowerCase().includes(teamQ));
      });
    }

    let html = "", lastDate = "";
    for (const m of list) {
      if (m.date !== lastDate) {
        lastDate = m.date;
        const d = new Date(m.date + "T12:00:00");
        html += `<div class="day-header">${d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>`;
      }
      html += matchRow(m);
    }
    $("#match-list").innerHTML = html || "<p class='hint'>No matches for this filter.</p>";
    document.querySelectorAll("#match-list .match-card").forEach(el =>
      el.addEventListener("click", () => openMatchModal(+el.dataset.mid)));
  }

  // ---------------- match modal ----------------
  function statRows(pred) {
    const h = pred.ratings.home, a = pred.ratings.away, ht = pred.home, at = pred.away;
    const adv = (x, y, lowerBetter = false) => lowerBetter ? (x < y ? "l" : x > y ? "r" : "") : (x > y ? "l" : x < y ? "r" : "");
    const fmtQ = t => t.qual ? `${t.qual.gf}–${t.qual.ga} in ${t.qual.played} qual. games` : "n/a";
    const fmtXg = t => t.qual && t.qual.xgFor != null ? t.qual.xgFor.toFixed(2) + " /game" : "n/a";
    const rows = [
      ["FIFA ranking", "#" + ht.fifaRank, "#" + at.fifaRank, adv(ht.fifaRank, at.fifaRank, true)],
      ["Elo rating (current)", Math.round(SIM.eloMap[ht.id]), Math.round(SIM.eloMap[at.id]), adv(SIM.eloMap[ht.id], SIM.eloMap[at.id])],
      ["Blended base rating", h.base, a.base, adv(h.base, a.base)],
      ["Qualifying goals", fmtQ(ht), fmtQ(at), ""],
      ["Qualifying xG", fmtXg(ht), fmtXg(at), ""],
      ["Form adjustment", signed(h.form), signed(a.form), adv(h.form, a.form)],
      [`Travel from camp`, `${h.travelKm.toLocaleString()} km / ${h.tzShift} tz (${signed(h.travel)})`,
        `${a.travelKm.toLocaleString()} km / ${a.tzShift} tz (${signed(a.travel)})`, adv(h.travel, a.travel)],
      ["Altitude adj.", signed(h.altitude), signed(a.altitude), adv(h.altitude, a.altitude)],
      ["Host advantage", signed(h.host), signed(a.host), adv(h.host, a.host)],
    ];
    if (pred.stage !== "group") rows.push(["History/pedigree", signed(h.pedigree), signed(a.pedigree), adv(h.pedigree, a.pedigree)]);
    rows.push(["<b>Match rating</b>", `<b>${Math.round(h.total)}</b>`, `<b>${Math.round(a.total)}</b>`, adv(h.total, a.total)]);
    rows.push(["Expected goals", pred.xg.home.toFixed(2), pred.xg.away.toFixed(2), adv(pred.xg.home, pred.xg.away)]);
    return rows.map(([label, l, r, advSide]) =>
      `<tr><td class="l ${advSide === "l" ? "adv" : ""}">${l}</td><td class="mid">${label}</td><td class="r ${advSide === "r" ? "adv" : ""}">${r}</td></tr>`).join("");
  }
  const signed = x => (x > 0 ? "+" : "") + (Math.round(x * 10) / 10);

  function openMatchModal(mid) {
    const m = SCHEDULE.find(x => x.id === mid);
    const info = predFor(m);
    const v = MODEL.venueById[m.venue];
    const r = RESULTS[m.id];
    if (!info) {
      showModal(`<button class="modal-close">&times;</button><h3>${slotLabel(m.home)} vs ${slotLabel(m.away)}</h3>
        <div class="modal-sub">${KO_STAGES[m.stage]} · ${m.date} · ${v.stadium}, ${v.city}</div>
        <p class="hint">Participants not determined yet.</p>`);
      return;
    }
    const p = info.pred;
    const proj = info.projected ? `<p class="hint" style="text-align:center">Projected matchup — most likely pairing from ${MODEL.SIMS.toLocaleString()} simulations; slots not decided yet.</p>` : "";
    const resLine = r ? `<div style="text-align:center;font-size:26px;font-weight:800;margin:6px 0">${r.h} – ${r.a}${r.winner ? ` <small>(${MODEL.teamById[r.winner].name} advanced)</small>` : ""}</div>` : "";
    const advLine = (m.stage !== "group" && p.pAdvHome != null)
      ? `<p class="hint" style="text-align:center">Advance (incl. extra time &amp; penalties): ${p.home.name} ${pct(p.pAdvHome)} · ${p.away.name} ${pct(1 - p.pAdvHome)}</p>` : "";
    const chips = p.topScores.map(s => `<span class="chip"><b>${s.h}–${s.a}</b> ${pct(s.p, 1)}</span>`).join("");
    const summary = SUMMARIES.build(m.id, p, r);
    const alt = v.altitude >= 1000 ? ` · ${v.altitude.toLocaleString()} m altitude` : "";

    showModal(`<button class="modal-close">&times;</button>
      <h3>${p.home.flag} ${p.home.name} vs ${p.away.name} ${p.away.flag}</h3>
      <div class="modal-sub">${m.stage === "group" ? "Group " + m.group : KO_STAGES[m.stage]} · ${m.date} · ${v.stadium}, ${v.city}${alt}</div>
      ${proj}${resLine}
      <div class="modal-probs">
        <div class="prob-bar">
          <div class="ph" style="width:${100 * p.pHome}%"></div>
          <div class="pd" style="width:${100 * p.pDraw}%"></div>
          <div class="pa" style="width:${100 * p.pAway}%"></div>
        </div>
        <div class="prob-labels"><span>${p.home.name} ${pct(p.pHome)}</span><span>draw ${pct(p.pDraw)}</span><span>${p.away.name} ${pct(p.pAway)}</span></div>
      </div>
      ${advLine}
      <div class="modal-summary">${summary}</div>
      <table class="stat-table"><tr><th class="l">${p.home.name}</th><th></th><th class="r" style="text-align:left">${p.away.name}</th></tr>${statRows(p)}</table>
      <div class="scoreline-chips"><span class="chip">Most likely scores:</span>${chips}</div>`);
  }

  function showModal(html) {
    $("#modal").innerHTML = html;
    $("#modal-overlay").classList.remove("hidden");
    const close = $("#modal .modal-close");
    if (close) close.addEventListener("click", () => $("#modal-overlay").classList.add("hidden"));
  }
  $("#modal-overlay").addEventListener("click", e => {
    if (e.target.id === "modal-overlay") $("#modal-overlay").classList.add("hidden");
  });

  // ---------------- bracket tab ----------------
  function renderGroups() {
    const groups = [...new Set(TEAMS.map(t => t.group))].sort();
    const oddsById = {}; SIM.teamOdds.forEach(o => oddsById[o.id] = o);
    let html = "";
    for (const g of groups) {
      const teams = TEAMS.filter(t => t.group === g)
        .map(t => ({ t, o: oddsById[t.id] }))
        .sort((x, y) => x.o.avgGroupRank - y.o.avgGroupRank);
      const rows = teams.map((x, i) => {
        const cls = i < 2 ? "q1" : i === 2 ? "q3" : "out";
        return `<tr class="${cls}"><td>${x.t.flag} ${x.t.name}</td>
          <td><b>${x.o.expPts.toFixed(1)}</b></td>
          <td>${x.o.expGf.toFixed(1)}</td><td>${x.o.expGa.toFixed(1)}</td>
          <td>${pct(x.o.r32)}</td></tr>`;
      }).join("");
      html += `<div class="group-table"><h4>Group ${g}</h4>
        <table><tr><th>Team</th><th>Pts</th><th>GF</th><th>GA</th><th>Adv</th></tr>${rows}</table></div>`;
    }
    $("#group-tables").innerHTML = html;
  }

  const BRACKET_ORDER = {
    R32: [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87],
    R16: [89, 90, 93, 94, 91, 92, 95, 96],
    QF: [97, 98, 99, 100],
    SF: [101, 102],
    F: [104],
  };

  function bracketMatchHtml(mid) {
    const m = SCHEDULE.find(x => x.id === mid);
    const r = RESULTS[mid];
    const sides = ["home", "away"].map(side => {
      const s = likelySide(m, side);
      if (!s) return { label: slotLabel(side === "home" ? m.home : m.away), winP: null };
      const t = MODEL.teamById[s.id];
      const winP = (SIM.koWinCount[mid][s.id] || 0) / MODEL.SIMS;
      return { label: `${t.flag} ${t.name}`, id: s.id, winP, known: s.known };
    });
    const favIdx = (sides[0].winP || 0) >= (sides[1].winP || 0) ? 0 : 1;
    const rows = sides.map((s, i) => {
      let right = s.winP != null ? pct(s.winP) : "";
      if (r) right = i === 0 ? r.h : r.a;
      return `<div class="bm-row ${i === favIdx && s.winP != null ? "fav" : ""}">
        <span>${s.label}</span><span class="bm-pct">${right}</span></div>`;
    }).join("");
    const v = MODEL.venueById[m.venue];
    return `<div class="bracket-match" data-mid="${mid}" title="${v.stadium}, ${v.city} — ${m.date}">${rows}</div>`;
  }

  function renderBracket() {
    let html = `<div class="bracket">`;
    const names = { R32: "Round of 32", R16: "Round of 16", QF: "Quarter-finals", SF: "Semi-finals", F: "Final" };
    for (const [stage, ids] of Object.entries(BRACKET_ORDER)) {
      html += `<div class="round"><h5>${names[stage]}</h5>${ids.map(bracketMatchHtml).join("")}</div>`;
    }
    html += `</div>`;
    $("#bracket").innerHTML = html;
    document.querySelectorAll("#bracket .bracket-match").forEach(el =>
      el.addEventListener("click", () => openMatchModal(+el.dataset.mid)));

    const top = SIM.teamOdds.slice(0, 3).map(o => {
      const t = MODEL.teamById[o.id];
      return `${t.flag} <b>${t.name}</b> ${pct(o.title, 1)}`;
    });
    $("#champion-line").innerHTML = `&#127942; Predicted champion: ${top[0]} &nbsp;·&nbsp; next: ${top[1]}, ${top[2]}`;
  }

  // ---------------- teams tab ----------------
  let teamSort = { key: "title", dir: -1 };

  function teamRowData() {
    return SIM.teamOdds.map(o => {
      const t = MODEL.teamById[o.id];
      return {
        id: t.id, name: t.name, flag: t.flag, group: t.group,
        title: o.title, final: o.final, sf: o.sf, qf: o.qf, r16: o.r16, r32: o.r32,
        elo: Math.round(SIM.eloMap[t.id]), rank: t.fifaRank,
        travel: MODEL.groupTravelKm(t.id), odds: o.title,
      };
    });
  }

  function renderTeams() {
    const rows = teamRowData().sort((x, y) => {
      const k = teamSort.key;
      const a = x[k], b = y[k];
      return (typeof a === "string" ? a.localeCompare(b) : a - b) * teamSort.dir;
    });
    const maxTitle = Math.max(...rows.map(r => r.title), 0.01);
    $("#teams-table tbody").innerHTML = rows.map(r => `<tr data-tid="${r.id}">
      <td><span class="mini-bar" style="width:${Math.max(2, 60 * r.title / maxTitle)}px"></span><span class="title-pct">${pct(r.title, 1)}</span></td>
      <td class="team-cell">${r.flag} ${r.name}</td>
      <td>${r.group}</td>
      <td>${americanOdds(r.title)}</td>
      <td>${pct(r.final, 1)}</td><td>${pct(r.sf, 1)}</td><td>${pct(r.qf, 1)}</td>
      <td>${pct(r.r16, 1)}</td><td>${pct(r.r32)}</td>
      <td>${r.elo}</td><td>#${r.rank}</td><td>${r.travel.toLocaleString()} km</td>
    </tr>`).join("");
    document.querySelectorAll("#teams-table tbody tr").forEach(el =>
      el.addEventListener("click", () => openTeamModal(el.dataset.tid)));
  }

  document.querySelectorAll("#teams-table th").forEach(th =>
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (teamSort.key === key) teamSort.dir *= -1;
      else teamSort = { key, dir: key === "name" || key === "group" || key === "rank" || key === "travel" ? 1 : -1 };
      renderTeams();
    }));

  function openTeamModal(tid) {
    const t = MODEL.teamById[tid];
    const o = SIM.teamOdds.find(x => x.id === tid);
    const notes = [];
    if (t.host) notes.push("Tournament co-host — home crowds and no continental travel.");
    if (t.defendingChampion) notes.push("Defending champion: 4 of the last 6 holders went out in the group stage.");
    if (t.fifaRank === 1) notes.push("Enters as FIFA #1 — a position that has never produced the champion since rankings began (n=8).");
    if (t.altitudeReady) notes.push(t.altitudeReady === 1 ? "Fully altitude-acclimatized." : "Partially altitude-acclimatized.");
    if (t.confed === "CONMEBOL") notes.push("South American sides have won 7 of 8 World Cups hosted in the Americas.");
    const q = t.qual
      ? `${t.qual.gf} scored / ${t.qual.ga} conceded in ${t.qual.played} qualifiers${t.qual.xgFor != null ? ` · ${t.qual.xgFor.toFixed(2)} xG/game` : ""}`
      : "Qualified as host or via playoff (no full qualifying record used).";
    const rounds = [["Advance from group", o.r32], ["Round of 16", o.r16], ["Quarter-final", o.qf], ["Semi-final", o.sf], ["Final", o.final], ["WIN THE WORLD CUP", o.title]]
      .map(([l, p]) => `<tr><td class="l">${pct(p, 1)}</td><td class="mid">${l}</td><td class="r">${americanOdds(p)}</td></tr>`).join("");
    showModal(`<button class="modal-close">&times;</button>
      <h3>${t.flag} ${t.name}</h3>
      <div class="modal-sub">Group ${t.group} · ${t.confed} · FIFA #${t.fifaRank} (${Math.round(t.fifaPoints)} pts) · Elo ${Math.round(SIM.eloMap[t.id])}</div>
      <table class="stat-table">
        <tr><td class="l">${t.baseCamp.city}</td><td class="mid">Base camp</td><td class="r">${MODEL.groupTravelKm(t.id).toLocaleString()} km group-stage travel</td></tr>
        <tr><td class="l" colspan="1">${q}</td><td class="mid">Qualifying</td><td class="r">${o.expPts.toFixed(1)} predicted group pts</td></tr>
        <tr><td class="l">${MARKET_ODDS[t.id] || "—"}</td><td class="mid">Market odds (BetMGM) vs model</td><td class="r">${americanOdds(o.title)}</td></tr>
      </table>
      <h3 style="font-size:15px;text-align:left;margin-top:18px">Round-by-round (model %&nbsp;·&nbsp;implied odds)</h3>
      <table class="stat-table">${rounds}</table>
      ${notes.length ? `<div class="modal-summary">${notes.join(" ")}</div>` : ""}`);
  }

  // ---------------- tabs & filters ----------------
  document.querySelectorAll(".tab-btn").forEach(btn =>
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      $("#tab-" + btn.dataset.tab).classList.add("active");
    }));

  const groupSel = $("#match-filter-group");
  [...new Set(TEAMS.map(t => t.group))].sort().forEach(g => {
    const opt = document.createElement("option");
    opt.value = g; opt.textContent = "Group " + g;
    groupSel.appendChild(opt);
  });
  ["#match-filter-stage", "#match-filter-group", "#match-filter-status"].forEach(s =>
    $(s).addEventListener("change", renderMatches));
  $("#match-filter-team").addEventListener("input", renderMatches);

  // ---------------- boot ----------------
  renderAccuracy();
  renderMatches();
  renderGroups();
  renderBracket();
  renderTeams();
})();
