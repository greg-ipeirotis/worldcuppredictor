/* =========================================================================
 * World Cup 2026 prediction model
 *
 * Strength = blend of Elo rating (primary — research shows Elo beats the
 * FIFA ranking as a predictor) + FIFA points, with per-match adjustments:
 *   - host advantage (playing in own country)
 *   - travel distance + time-zone shift from team base camp to venue
 *   - altitude (Mexico City 2240 m, Guadalajara 1566 m) vs. acclimatized teams
 *   - qualifying form (goals + xG over/under-performance)
 *   - knockout-only historical priors: UEFA/CONMEBOL title pedigree
 *     (every winner ever), CONMEBOL bonus in Americas-hosted editions,
 *     small "FIFA #1 curse" haircut
 *
 * Match result -> Poisson goal model; tournament -> Monte Carlo.
 * Played results (data/results.js) are locked in: Elo is updated game by
 * game, group tables use real points, and the simulation conditions on
 * everything already decided — so predictions update as games go along.
 * ========================================================================= */

const MODEL = (() => {
  const SIMS = 10000;
  const AVG_GOALS = 2.7;        // expected total goals per WC match
  const POISSON_SCALE = 620;    // Elo-diff -> goal-ratio steepness (calibrated
                                // so title odds track market/Opta consensus)
  const ELO_K = 40;             // K-factor for in-tournament Elo updates

  // ---------- helpers ----------
  const teamById = {};
  TEAMS.forEach(t => teamById[t.id] = t);
  const venueById = {};
  VENUES.forEach(v => venueById[v.id] = v);

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371, d = Math.PI / 180;
    const a = Math.sin((lat2 - lat1) * d / 2) ** 2 +
      Math.cos(lat1 * d) * Math.cos(lat2 * d) * Math.sin((lon2 - lon1) * d / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function poissonSample(lambda, rng) {
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= rng(); } while (p > L);
    return k - 1;
  }

  // deterministic RNG so the page renders the same numbers on each load
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------- base strength ----------
  // Elo dominates: studies of WC knockouts 1994-2022 show Elo predicts
  // winners ~74% vs ~69% for the FIFA ranking, so FIFA points get a
  // small residual weight only.
  function blend(elo, fifaPoints) {
    const fifaAsElo = 1300 + (fifaPoints - 1200) * 1.55;
    return 0.85 * elo + 0.15 * fifaAsElo;
  }
  function baseRating(t) { return blend(t.elo, t.fifaPoints); }

  // form: goal difference per game in qualifying + xG over-performance
  function formAdj(t) {
    if (!t.qual || !t.qual.played) return 0;
    const gdpg = (t.qual.gf - t.qual.ga) / t.qual.played;
    let adj = Math.max(-12, Math.min(12, gdpg * 4));
    if (t.qual.xgFor != null) {
      // xGA rarely published for qualifiers; fall back to actual GA/game
      const xga = t.qual.xgAgainst != null ? t.qual.xgAgainst : t.qual.ga / t.qual.played;
      adj += Math.max(-8, Math.min(8, (t.qual.xgFor - xga) * 3));
    }
    return adj;
  }

  // ---------- per-match contextual adjustments (in Elo points) ----------
  // Travel is a small effect per the literature; eastward shifts hurt more
  // (~50% longer adaptation), so they carry a 1.5x multiplier.
  function travelPenalty(team, venue) {
    if (!team.baseCamp) return { km: 0, tz: 0, pts: 0 };
    const km = haversineKm(team.baseCamp.lat, team.baseCamp.lon, venue.lat, venue.lon);
    const tzDiff = Math.abs(team.baseCamp.tz - venue.tz);
    const eastward = venue.tz > team.baseCamp.tz;
    const distPts = -Math.min(14, Math.max(0, (km - 400) / 250));
    const tzPts = -Math.min(18, Math.max(0, (tzDiff - 1) * 5) * (eastward ? 1.5 : 1));
    return { km: Math.round(km), tz: tzDiff, eastward, pts: distPts + tzPts };
  }

  // Altitude: ~+0.5 goals per 1000 m differential (McSharry, BMJ). Azteca
  // (2240 m) costs an unacclimatized side ~85 Elo-equivalent points;
  // Guadalajara (1566 m) about half that. altitudeReady: 1 = acclimatized
  // (Mexico; South Africa camped at 2400 m Pachuca), 0.5 = partial
  // (Andean sides, teams camped in Guadalajara).
  function altitudePenalty(team, venue) {
    if (venue.altitude < 1000) return 0;
    const ready = team.altitudeReady || 0;
    return -((venue.altitude - 1000) / 14.5) * (1 - ready);
  }

  // Hosts historically perform ~ +160-190 Elo at home; 2026's three-way
  // hosting dilutes crowds, so USA/Canada get +70 and Mexico — with the
  // purest version of the effect at the Azteca/Akron — +110.
  function hostBonus(team, venue) {
    if (!team.host || venue.country !== team.id) return 0;
    return team.id === 'MEX' ? 110 : 70;
  }

  // knockout-only title pedigree priors (kept deliberately small —
  // historical patterns, not mechanisms)
  function pedigreeAdj(team, stage) {
    if (stage === 'group') return 0;
    let adj = 0;
    if (team.confed === 'UEFA' || team.confed === 'CONMEBOL') adj += 12; // every winner ever
    if (team.confed === 'CONMEBOL') adj += 10; // Americas-hosted WCs: 7 of 8 won by S. America
    if (team.fifaRank === 1) adj -= 6;         // FIFA #1 entering the WC has never won (n=8)
    if (team.defendingChampion) adj -= 8;      // holders' curse: 4 of last 6 holders out in groups
    return adj;
  }

  function effectiveRating(team, venue, stage, eloOverride) {
    const base = (eloOverride != null) ? blend(eloOverride, team.fifaPoints) : baseRating(team);
    const trav = travelPenalty(team, venue);
    const parts = {
      base: Math.round(base),
      form: Math.round(formAdj(team) * 10) / 10,
      travel: Math.round(trav.pts * 10) / 10,
      travelKm: trav.km,
      tzShift: trav.tz,
      altitude: Math.round(altitudePenalty(team, venue) * 10) / 10,
      host: hostBonus(team, venue),
      pedigree: pedigreeAdj(team, stage),
    };
    parts.total = parts.base + parts.form + parts.travel + parts.altitude + parts.host + parts.pedigree;
    return parts;
  }

  // ---------- match probability model ----------
  function lambdas(diff) {
    const lh = Math.min(4.6, Math.max(0.15, (AVG_GOALS / 2) * Math.exp(diff / POISSON_SCALE)));
    const la = Math.min(4.6, Math.max(0.15, (AVG_GOALS / 2) * Math.exp(-diff / POISSON_SCALE)));
    return [lh, la];
  }

  function poissonPmf(lambda, max) {
    const p = [Math.exp(-lambda)];
    for (let k = 1; k <= max; k++) p.push(p[k - 1] * lambda / k);
    return p;
  }

  // Full analytic breakdown for the UI (probabilities, expected goals, scorelines).
  function predictMatch(homeId, awayId, venueId, stage, eloMap) {
    const h = teamById[homeId], a = teamById[awayId], v = venueById[venueId];
    const eh = effectiveRating(h, v, stage, eloMap ? eloMap[homeId] : null);
    const ea = effectiveRating(a, v, stage, eloMap ? eloMap[awayId] : null);
    const diff = eh.total - ea.total;
    const [lh, la] = lambdas(diff);
    const MAXG = 8;
    const ph = poissonPmf(lh, MAXG), pa = poissonPmf(la, MAXG);
    let pHome = 0, pDraw = 0, pAway = 0;
    const scores = [];
    for (let i = 0; i <= MAXG; i++) for (let j = 0; j <= MAXG; j++) {
      const p = ph[i] * pa[j];
      if (i > j) pHome += p; else if (i === j) pDraw += p; else pAway += p;
      scores.push({ h: i, a: j, p });
    }
    const norm = pHome + pDraw + pAway;
    pHome /= norm; pDraw /= norm; pAway /= norm;
    scores.sort((x, y) => y.p - x.p);
    // most-likely single score, plus expected-goals rounded score
    const topScores = scores.slice(0, 5);
    // KO: who advances if drawn after 90' (ET + pens lean on rating diff, shrunk)
    const pAdvHomeIfDraw = 1 / (1 + Math.pow(10, -diff / 700));
    const pAdvHome = stage === 'group' ? null : pHome + pDraw * pAdvHomeIfDraw;
    return {
      home: h, away: a, venue: v, stage,
      ratings: { home: eh, away: ea }, diff: Math.round(diff),
      xg: { home: Math.round(lh * 100) / 100, away: Math.round(la * 100) / 100 },
      pHome, pDraw, pAway, pAdvHome,
      topScores,
      predScore: { h: topScores[0].h, a: topScores[0].a },
    };
  }

  function simulateMatchOutcome(pred, rng, knockout) {
    let gh = poissonSample(pred.xg.home, rng);
    let ga = poissonSample(pred.xg.away, rng);
    if (knockout && gh === ga) {
      const pHomeAdv = 1 / (1 + Math.pow(10, -pred.diff / 700));
      return rng() < pHomeAdv ? { gh: gh + 1, ga, et: true } : { gh, ga: ga + 1, et: true };
    }
    return { gh, ga, et: false };
  }

  // ---------- Elo replay over actual results ----------
  // Processes finished matches chronologically: records the frozen pre-match
  // prediction (for the accuracy badge) then updates Elo from the result.
  function replayResults() {
    const eloMap = {};
    TEAMS.forEach(t => eloMap[t.id] = t.elo);
    const frozen = {};   // matchId -> prediction made with pre-match Elo
    let hits = 0, total = 0;
    const finished = SCHEDULE
      .filter(m => RESULTS[m.id])
      .sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
    for (const m of finished) {
      const r = RESULTS[m.id];
      const home = resolveTeam(m.home), away = resolveTeam(m.away);
      if (!home || !away) continue;
      const pred = predictMatch(home, away, m.venue, m.stage, eloMap);
      frozen[m.id] = pred;
      // accuracy: predicted 90-minute outcome vs actual
      const predOutcome = pred.pHome >= pred.pDraw && pred.pHome >= pred.pAway ? 'H'
        : (pred.pAway >= pred.pDraw ? 'A' : 'D');
      const actOutcome = r.h > r.a ? 'H' : r.h < r.a ? 'A' : 'D';
      total++; if (predOutcome === actOutcome) hits++;
      frozen[m.id].correct = predOutcome === actOutcome;
      // Elo update
      const we = 1 / (1 + Math.pow(10, -(eloMap[home] - eloMap[away]) / 400));
      const sc = r.h > r.a ? 1 : r.h < r.a ? 0 : 0.5;
      const gd = Math.abs(r.h - r.a);
      const gMult = gd <= 1 ? 1 : gd === 2 ? 1.5 : (11 + gd) / 8;
      eloMap[home] += ELO_K * gMult * (sc - we);
      eloMap[away] -= ELO_K * gMult * (sc - we);
    }
    return { eloMap, frozen, hits, total };
  }

  // resolve a schedule slot: either a team id ("ARG") or a placeholder
  // ("1A", "2B", "W73", "3ABCD") that needs sim/actual state. Returns null
  // if not yet determined in reality.
  function resolveTeam(slot) {
    if (teamById[slot]) return slot;
    return KNOWN_SLOTS[slot] || null;   // filled in results.js as reality unfolds
  }

  // ---------- group stage machinery ----------
  function groupMatchesOf(g) {
    return SCHEDULE.filter(m => m.stage === 'group' && m.group === g);
  }

  function tableFromGames(group, games) {
    // games: [{home, away, gh, ga}]
    const rows = {};
    TEAMS.filter(t => t.group === group).forEach(t =>
      rows[t.id] = { id: t.id, pts: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0, played: 0 });
    for (const g of games) {
      const h = rows[g.home], a = rows[g.away];
      if (!h || !a) continue;
      h.played++; a.played++;
      h.gf += g.gh; h.ga += g.ga; a.gf += g.ga; a.ga += g.gh;
      if (g.gh > g.ga) { h.pts += 3; h.w++; a.l++; }
      else if (g.gh < g.ga) { a.pts += 3; a.w++; h.l++; }
      else { h.pts++; a.pts++; h.d++; a.d++; }
    }
    return rows;
  }

  function rankGroup(rows, rng) {
    const list = Object.values(rows);
    list.sort((x, y) =>
      y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf ||
      (rng ? rng() - 0.5 : x.id.localeCompare(y.id)));
    return list;
  }

  // ---------- full tournament Monte Carlo ----------
  function runTournament() {
    const { eloMap, frozen, hits, total } = replayResults();

    // cache: current prediction for every schedulable match with known teams
    const currentPreds = {};
    for (const m of SCHEDULE) {
      const h = resolveTeam(m.home), a = resolveTeam(m.away);
      if (h && a) {
        currentPreds[m.id] = RESULTS[m.id] && frozen[m.id]
          ? frozen[m.id]
          : predictMatch(h, a, m.venue, m.stage, eloMap);
      }
    }

    const agg = {};
    TEAMS.forEach(t => agg[t.id] = {
      r32: 0, r16: 0, qf: 0, sf: 0, final: 0, title: 0,
      pts: 0, gf: 0, ga: 0, groupRankSum: 0,
    });
    const koWinCount = {};   // matchId -> { teamId: wins }
    const koAppear = {};     // matchId -> { home: {teamId: n}, away: {teamId: n} }
    SCHEDULE.filter(m => m.stage !== 'group').forEach(m => {
      koWinCount[m.id] = {}; koAppear[m.id] = { home: {}, away: {} };
    });

    const rng = mulberry32(20260611);
    const groups = [...new Set(TEAMS.map(t => t.group))].sort();

    for (let s = 0; s < SIMS; s++) {
      // -- group stage --
      const thirds = [];
      const slot = {};   // "1A", "2A", "3A" -> teamId
      for (const g of groups) {
        const games = [];
        for (const m of groupMatchesOf(g)) {
          const r = RESULTS[m.id];
          if (r) { games.push({ home: m.home, away: m.away, gh: r.h, ga: r.a }); continue; }
          const pred = currentPreds[m.id];
          const o = simulateMatchOutcome(pred, rng, false);
          games.push({ home: m.home, away: m.away, gh: o.gh, ga: o.ga });
        }
        const ranked = rankGroup(tableFromGames(g, games), rng);
        ranked.forEach((row, i) => {
          const a = agg[row.id];
          a.pts += row.pts; a.gf += row.gf; a.ga += row.ga; a.groupRankSum += i + 1;
        });
        slot['1' + g] = ranked[0].id; slot['2' + g] = ranked[1].id;
        thirds.push({ ...ranked[2], group: g });
        agg[ranked[0].id].r32++; agg[ranked[1].id].r32++;
      }
      // best 8 thirds
      thirds.sort((x, y) =>
        y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf || rng() - 0.5);
      const qualThirds = thirds.slice(0, 8);
      qualThirds.forEach(t => agg[t.id].r32++);
      assignThirds(qualThirds, slot);

      // -- knockout rounds --
      const stageBuckets = { R32: 'r16', R16: 'qf', QF: 'sf', SF: 'final' };
      const ko = SCHEDULE.filter(m => m.stage !== 'group').sort((a, b) => a.id - b.id);
      let champion = null;
      for (const m of ko) {
        const h = RESULTS[m.id] ? resolveTeam(m.home) : (teamById[m.home] ? m.home : slot[m.home]);
        const a = RESULTS[m.id] ? resolveTeam(m.away) : (teamById[m.away] ? m.away : slot[m.away]);
        if (!h || !a) continue;
        koAppear[m.id].home[h] = (koAppear[m.id].home[h] || 0) + 1;
        koAppear[m.id].away[a] = (koAppear[m.id].away[a] || 0) + 1;
        let winner;
        const r = RESULTS[m.id];
        if (r) {
          winner = r.winner || (r.h > r.a ? h : a);
        } else {
          const pred = predictMatch(h, a, m.venue, m.stage, eloMap);
          const o = simulateMatchOutcome(pred, rng, true);
          winner = o.gh > o.ga ? h : a;
        }
        koWinCount[m.id][winner] = (koWinCount[m.id][winner] || 0) + 1;
        slot['W' + m.id] = winner;
        slot['L' + m.id] = winner === h ? a : h;
        if (stageBuckets[m.stage]) agg[winner][stageBuckets[m.stage]]++;
        if (m.stage === 'F') champion = winner;
      }
      if (champion) agg[champion].title++;
    }

    // normalize
    const teamOdds = TEAMS.map(t => {
      const a = agg[t.id];
      return {
        id: t.id,
        r32: a.r32 / SIMS, r16: a.r16 / SIMS, qf: a.qf / SIMS,
        sf: a.sf / SIMS, final: a.final / SIMS, title: a.title / SIMS,
        expPts: a.pts / SIMS, expGf: a.gf / SIMS, expGa: a.ga / SIMS,
        avgGroupRank: a.groupRankSum / SIMS,
      };
    }).sort((x, y) => y.title - x.title);

    return { eloMap, frozen, hits, total, currentPreds, teamOdds, koWinCount, koAppear };
  }

  // FIFA's third-place allocation depends on which groups' thirds qualify;
  // we use a greedy assignment honoring each R32 slot's allowed groups
  // (defined in schedule.js THIRD_SLOTS), best-ranked thirds placed first.
  function assignThirds(qualThirds, slot) {
    const open = THIRD_SLOTS.map(s => ({ ...s }));
    for (const t of qualThirds) {
      let pick = open.find(s => !s.used && s.groups.includes(t.group));
      if (!pick) pick = open.find(s => !s.used);
      if (pick) { pick.used = true; slot[pick.key] = t.id; }
    }
  }

  // total round-trip km from base camp across a team's three group games
  function groupTravelKm(teamId) {
    const t = teamById[teamId];
    if (!t || !t.baseCamp) return 0;
    let km = 0;
    for (const m of SCHEDULE) {
      if (m.stage === 'group' && (m.home === teamId || m.away === teamId)) {
        const v = venueById[m.venue];
        km += haversineKm(t.baseCamp.lat, t.baseCamp.lon, v.lat, v.lon);
      }
    }
    return Math.round(km * 2);
  }

  return { runTournament, predictMatch, replayResults, resolveTeam, groupTravelKm, teamById, venueById, SIMS };
})();
