# World Cup 2026 Predictor

A zero-dependency web app that predicts every match of the 2026 FIFA World Cup
(USA / Mexico / Canada, June 11 – July 19, 2026): per-game win/draw/loss
percentages, championship odds for all 48 teams, a full predicted bracket, and
a 2–5 sentence rationale for every prediction. As real results are entered the
model re-runs — standings lock in, Elo ratings update, future predictions
shift, and the header tracks how many games it has called correctly.

## Run it

Open `index.html` in a browser. That's it — no build step, no server needed
(everything is plain HTML/CSS/JS; the 10,000-run simulation executes on load
in a few seconds).

## The three tabs

| Tab | Contents |
|---|---|
| **Matches** | All 104 games, past & future, filterable by stage/group/team. Each card shows the win/draw/win bar, predicted (or actual) score, and a HIT/MISS tag once finished. Click any match for the stat-by-stat breakdown: FIFA rank, Elo, base rating, qualifying goals & xG, travel from base camp, altitude, host advantage, historical priors, expected goals, most-likely scorelines — plus the written rationale. |
| **Bracket** | All 12 predicted group tables (expected points, GF/GA, advance %) and the knockout bracket from the Round of 32 to the Final, showing the most likely team in every slot with win probabilities. |
| **Team Stats & Odds** | Sortable table of all 48 teams: championship %, implied American odds, round-by-round probabilities, current Elo, FIFA rank, and group-stage travel burden. Click a team for base camp, qualifying record, market-vs-model odds and applicable historical notes. |

**Top right:** the share of finished matches whose pre-match predicted outcome
(win/draw/win) was correct. Predictions are *frozen* — each finished game is
scored with the rating state as of its kickoff, so later updates can't flatter
the accuracy number.

## Updating as games are played

Edit `js/data/results.js` and reload:

```js
const RESULTS = {
  1: { h: 2, a: 0 },                    // Mexico 2-0 South Africa
  97: { h: 1, a: 1, winner: "FRA" },    // knockout decided in ET/pens
};
// once knockout slots are decided in reality:
KNOWN_SLOTS["1A"] = "MEX"; KNOWN_SLOTS["W73"] = "SUI"; // etc.
```

Everything downstream recomputes automatically: the accuracy badge, real
points in the group tables, in-tournament Elo updates (K=40, margin-of-victory
weighted), and a fresh 10,000-run Monte Carlo conditioned on every result so
far.

## The model

**Base strength** — 85% [World Football Elo rating](https://www.eloratings.net/)
+ 15% FIFA ranking points. The weighting follows published evidence: across
1994–2022 World Cup knockout games, Elo picked winners ~74% vs ~69% for the
FIFA ranking.

**Per-match adjustments** (Elo-point equivalents):

- **Host advantage** — hosts historically perform ≈ +170 Elo at home. With
  three co-hosts diluting crowds: Mexico +110 at Azteca/Akron, USA/Canada +70
  at their home venues.
- **Altitude** — Mexico City (2,240 m) costs an unacclimatized side ≈ 85
  points (~half a goal per 1,000 m, per McSharry's BMJ study of 1,460
  internationals); Guadalajara about half that. Mexico and South Africa
  (camped at 2,400 m Pachuca) are exempt; Andean sides and teams camped in
  Guadalajara (Colombia, South Korea) half-exempt.
- **Travel** — haversine distance from each team's official FIFA base camp to
  the venue plus time zones crossed, with eastward shifts penalized 1.5×
  (research: eastward adaptation takes ~50% longer). Capped small — the
  literature says jet lag with 3+ days' rest is a minor effect.
- **Form** — qualifying goal difference per game and xG over-performance
  (xGscore/Opta data for UEFA qualifying), both clamped.
- **Historical priors** (knockout rounds only, deliberately small):
  +12 for UEFA/CONMEBOL (every champion ever has come from these two);
  +10 more for CONMEBOL (South America has won 7 of 8 Americas-hosted World
  Cups); −6 for the pre-tournament FIFA #1 (never won, 0-for-8 since 1993 —
  that's Argentina this time); −8 for the defending champion (4 of the last
  6 holders crashed out in the group stage — also Argentina).

**Match engine** — rating difference → expected goals via a calibrated
exponential split of ~2.7 total goals, then a Poisson grid gives win/draw/loss
probabilities and scoreline distribution; knockout draws resolve by a
shrunk-toward-50/50 logistic for ET/penalties.

**Tournament engine** — 10,000 Monte Carlo runs of the remaining tournament:
group tables with FIFA tiebreakers, ranking of third-placed teams, the
official R32 third-place allocation constraints, then every knockout round.
Championship odds, round probabilities and bracket slot likelihoods all come
from these runs (seeded RNG, so results are reproducible).

**What's deliberately weighted low** (per the research): FIFA rank as a
standalone signal, rest-day differences at FIFA's guaranteed ≥72 h spacing,
moderate-altitude venues (<1,000 m), friendlies, and the "#1 curse"/holder's
curse beyond a token nudge — they're historical patterns, not mechanisms.

## Data sources (as of June 10, 2026)

- **Teams, groups, schedule, bracket** — FIFA / Wikipedia (2026 FIFA World Cup
  and knockout-stage articles), incl. March 2026 playoff winners (Bosnia &
  Herzegovina, Sweden, Türkiye, Czechia, DR Congo, Iraq).
- **Elo ratings** — eloratings.net methodology (June 10, 2026 values,
  cross-checked against Wikipedia's June 1 snapshot).
- **FIFA ranking** — live June 10, 2026 calculation (April 1, 2026 official
  release corroborates the ordering).
- **Qualifying records & xG** — Wikipedia confederation tables, xGscore.io,
  Opta.
- **Base camps** — FIFA's official Team Base Camp announcement (all 48 camps,
  with coordinates geocoded per city).
- **Market odds** (comparison only, not a model input) — BetMGM, June 10, 2026.

## Pre-tournament headline numbers

Champion odds (top 8): Spain 24.7%, Argentina 17.7%, France 13.0%,
England 7.9%, Brazil 5.0%, Portugal 4.6%, Netherlands 3.7%, Colombia 3.6%.
Most likely final: Spain vs Argentina at MetLife Stadium.
