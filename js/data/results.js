/* =========================================================================
 * ACTUAL RESULTS — update this file as games are played; everything else
 * (accuracy %, standings, Elo, re-simulated odds) recomputes automatically.
 *
 * RESULTS[matchId] = { h: <home goals after 90'>, a: <away goals after 90'> }
 *   For knockout games decided in extra time / penalties, keep the 90'/120'
 *   score and add the team that advanced:
 *     RESULTS[97] = { h: 1, a: 1, winner: "FRA" };
 *
 * KNOWN_SLOTS: once real qualification is decided, map knockout slots to
 * team ids so finished knockout results can be attributed, e.g.:
 *   KNOWN_SLOTS["1A"] = "MEX"; KNOWN_SLOTS["T79"] = "ECU";
 *   KNOWN_SLOTS["W73"] = "SUI";
 * (Only needed for slots whose matches have RESULTS entries.)
 * ========================================================================= */
const RESULTS = {
  // Example (uncomment & edit as games finish):
  // 1: { h: 2, a: 0 },   // Mexico 2-0 South Africa, June 11, Azteca
};

const KNOWN_SLOTS = {
};
