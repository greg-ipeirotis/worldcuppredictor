/* Generates a short (2-5 sentence) rationale for each prediction, built
 * from the factors that actually drove the number — rating gap, qualifying
 * form/xG, travel, altitude, host crowd, and historical priors. */
const SUMMARIES = (() => {

  function pct(x) { return Math.round(x * 100) + "%"; }

  // small deterministic variety so 104 summaries don't all read identically
  function pick(arr, seed) { return arr[seed % arr.length]; }

  function build(matchId, pred, result) {
    const seed = matchId * 7919;
    const { home, away, venue, stage } = pred;
    const rh = pred.ratings.home, ra = pred.ratings.away;
    const homeFav = pred.pHome >= pred.pAway;
    const fav = homeFav ? home : away, dog = homeFav ? away : home;
    const favR = homeFav ? rh : ra, dogR = homeFav ? ra : rh;
    const favP = Math.max(pred.pHome, pred.pAway);
    const s = [];

    // 1) headline
    const gap = Math.abs(pred.diff);
    if (gap < 40) {
      s.push(pick([
        `This is close to a coin flip: ${fav.name} edge it at ${pct(favP)} with the draw at ${pct(pred.pDraw)}.`,
        `The model can barely separate these sides — ${fav.name} ${pct(favP)}, ${dog.name} ${pct(Math.min(pred.pHome, pred.pAway))}, draw ${pct(pred.pDraw)}.`,
      ], seed));
    } else if (gap < 120) {
      s.push(pick([
        `${fav.name} are clear but not overwhelming favorites at ${pct(favP)}.`,
        `${fav.name} should have the edge here, winning ${pct(favP)} of simulations.`,
      ], seed));
    } else {
      s.push(pick([
        `${fav.name} are heavy favorites at ${pct(favP)} — the gap in class (${Math.round(favR.base)} vs ${Math.round(dogR.base)} rating) is the whole story.`,
        `A mismatch on paper: ${fav.name} win ${pct(favP)} of simulations, with a ${gap}-point edge in this matchup once venue and form are counted.`,
      ], seed));
    }

    // 2) rank remaining factors by how much they tilt the match
    const factors = [];
    const formDiff = favR.form - dogR.form;
    if (Math.abs(formDiff) >= 5) {
      const better = formDiff > 0 ? fav : dog;
      const q = better.qual;
      factors.push({
        w: Math.abs(formDiff),
        txt: q ? `${better.name} arrive in better form — they outscored opponents ${q.gf}-${q.ga} in qualifying${q.xgFor ? ` (${q.xgFor} xG per game)` : ""}.`
               : `${better.name} arrive in noticeably better recent form.`,
      });
    }
    const travDiff = favR.travel - dogR.travel;
    if (Math.abs(travDiff) >= 4) {
      const fresher = travDiff > 0 ? fav : dog;
      const tired = travDiff > 0 ? dog : fav;
      const tiredR = travDiff > 0 ? dogR : favR;
      factors.push({
        w: Math.abs(travDiff),
        txt: `Travel tilts things toward ${fresher.name}: ${tired.name} make a ${tiredR.travelKm.toLocaleString()} km trip from their ${tired.baseCamp.city} base${tiredR.tzShift > 1 ? ` across ${tiredR.tzShift} time zones` : ""}, while ${fresher.name} stay close to camp.`,
      });
    }
    const altDiff = favR.altitude - dogR.altitude;
    if (Math.abs(altDiff) >= 8) {
      const suited = altDiff > 0 ? fav : dog;
      const gasping = altDiff > 0 ? dog : fav;
      factors.push({
        w: Math.abs(altDiff),
        txt: `${venue.stadium} sits at ${venue.altitude.toLocaleString()} m, and ${suited.name} are acclimatized to thin air while ${gasping.name} are not — research puts that at roughly half a goal per 1,000 m.`,
      });
    }
    const hostDiff = favR.host - dogR.host;
    if (Math.abs(hostDiff) > 0) {
      const h2 = hostDiff > 0 ? fav : dog;
      factors.push({
        w: Math.abs(hostDiff),
        txt: `${h2.name} play this one at home in ${venue.city} — World Cup hosts have historically performed about 170 Elo points above their baseline.`,
      });
    }
    if (stage !== "group") {
      const pedDiff = favR.pedigree - dogR.pedigree;
      if (Math.abs(pedDiff) >= 10) {
        const blessed = pedDiff > 0 ? fav : dog;
        factors.push({
          w: Math.abs(pedDiff) * 0.8,
          txt: blessed.confed === "CONMEBOL"
            ? `History leans ${blessed.name}'s way too: South American sides have won 7 of the 8 World Cups staged in the Americas.`
            : `Knockout pedigree favors ${blessed.name} — every World Cup ever played has been won by a European or South American side.`,
        });
      }
    }
    factors.sort((a, b) => b.w - a.w);
    factors.slice(0, 2).forEach(f => s.push(f.txt));

    // 3) curses, where they apply to either side
    const cursed = [home, away].find(t => t.fifaRank === 1);
    if (cursed && stage !== "group" && s.length < 4) {
      s.push(`One omen against ${cursed.name}: in eight tournaments since rankings began, the FIFA #1 entering the World Cup has never lifted the trophy.`);
    }

    // 4) score line / closing
    if (s.length < 5) {
      const ps = pred.predScore;
      const scoreStr = homeFav ? `${home.name} ${Math.max(ps.h, ps.a)}-${Math.min(ps.h, ps.a)}` : `${away.name} ${Math.max(ps.h, ps.a)}-${Math.min(ps.h, ps.a)}`;
      if (gap < 40 && pred.pDraw > 0.26 && stage === "group") {
        s.push(`With expected goals of ${pred.xg.home} - ${pred.xg.away}, a draw is a very live outcome.`);
      } else {
        s.push(`The most likely scoreline is ${pred.predScore.h}-${pred.predScore.a}, with expected goals ${pred.xg.home} - ${pred.xg.away}.`);
      }
    }

    // 5) hindsight tag for finished games
    if (result) {
      const actOutcome = result.h > result.a ? "H" : result.h < result.a ? "A" : "D";
      const predOutcome = pred.pHome >= pred.pDraw && pred.pHome >= pred.pAway ? "H" : (pred.pAway >= pred.pDraw ? "A" : "D");
      s.push(predOutcome === actOutcome
        ? `Verdict: the model called this one correctly (${result.h}-${result.a}).`
        : `Verdict: the model got this one wrong — it finished ${result.h}-${result.a}.`);
    }

    return s.slice(0, result ? 6 : 5).join(" ");
  }

  return { build };
})();
