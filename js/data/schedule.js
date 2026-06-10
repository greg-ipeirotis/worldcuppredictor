/* Full 104-match schedule (source: FIFA / Wikipedia, June 2026).
 * Group matches: ids 1-72. Knockout: official match numbers 73-104.
 * Knockout slots: "1A" group winner, "2A" runner-up, "T74" = third-placed
 * team allocated to match 74 (allowed groups in THIRD_SLOTS), "W89"/"L101"
 * = winner/loser of match. */
const SCHEDULE = [
  // ---- Group A ----
  { id: 1,  stage: "group", group: "A", date: "2026-06-11", home: "MEX", away: "RSA", venue: "AZT" },
  { id: 2,  stage: "group", group: "A", date: "2026-06-11", home: "KOR", away: "CZE", venue: "AKR" },
  { id: 3,  stage: "group", group: "A", date: "2026-06-18", home: "CZE", away: "RSA", venue: "ATL" },
  { id: 4,  stage: "group", group: "A", date: "2026-06-18", home: "MEX", away: "KOR", venue: "AKR" },
  { id: 5,  stage: "group", group: "A", date: "2026-06-24", home: "CZE", away: "MEX", venue: "AZT" },
  { id: 6,  stage: "group", group: "A", date: "2026-06-24", home: "RSA", away: "KOR", venue: "BBV" },
  // ---- Group B ----
  { id: 7,  stage: "group", group: "B", date: "2026-06-12", home: "CAN", away: "BIH", venue: "BMO" },
  { id: 8,  stage: "group", group: "B", date: "2026-06-13", home: "QAT", away: "SUI", venue: "SFO" },
  { id: 9,  stage: "group", group: "B", date: "2026-06-18", home: "SUI", away: "BIH", venue: "LAX" },
  { id: 10, stage: "group", group: "B", date: "2026-06-18", home: "CAN", away: "QAT", venue: "BCP" },
  { id: 11, stage: "group", group: "B", date: "2026-06-24", home: "SUI", away: "CAN", venue: "BCP" },
  { id: 12, stage: "group", group: "B", date: "2026-06-24", home: "BIH", away: "QAT", venue: "SEA" },
  // ---- Group C ----
  { id: 13, stage: "group", group: "C", date: "2026-06-13", home: "BRA", away: "MAR", venue: "NYC" },
  { id: 14, stage: "group", group: "C", date: "2026-06-13", home: "HAI", away: "SCO", venue: "BOS" },
  { id: 15, stage: "group", group: "C", date: "2026-06-19", home: "SCO", away: "MAR", venue: "BOS" },
  { id: 16, stage: "group", group: "C", date: "2026-06-19", home: "BRA", away: "HAI", venue: "PHI" },
  { id: 17, stage: "group", group: "C", date: "2026-06-24", home: "SCO", away: "BRA", venue: "MIA" },
  { id: 18, stage: "group", group: "C", date: "2026-06-24", home: "MAR", away: "HAI", venue: "ATL" },
  // ---- Group D ----
  { id: 19, stage: "group", group: "D", date: "2026-06-12", home: "USA", away: "PAR", venue: "LAX" },
  { id: 20, stage: "group", group: "D", date: "2026-06-13", home: "AUS", away: "TUR", venue: "BCP" },
  { id: 21, stage: "group", group: "D", date: "2026-06-19", home: "USA", away: "AUS", venue: "SEA" },
  { id: 22, stage: "group", group: "D", date: "2026-06-19", home: "TUR", away: "PAR", venue: "SFO" },
  { id: 23, stage: "group", group: "D", date: "2026-06-25", home: "TUR", away: "USA", venue: "LAX" },
  { id: 24, stage: "group", group: "D", date: "2026-06-25", home: "PAR", away: "AUS", venue: "SFO" },
  // ---- Group E ----
  { id: 25, stage: "group", group: "E", date: "2026-06-14", home: "GER", away: "CUW", venue: "HOU" },
  { id: 26, stage: "group", group: "E", date: "2026-06-14", home: "CIV", away: "ECU", venue: "PHI" },
  { id: 27, stage: "group", group: "E", date: "2026-06-20", home: "GER", away: "CIV", venue: "BMO" },
  { id: 28, stage: "group", group: "E", date: "2026-06-20", home: "ECU", away: "CUW", venue: "KC" },
  { id: 29, stage: "group", group: "E", date: "2026-06-25", home: "CUW", away: "CIV", venue: "PHI" },
  { id: 30, stage: "group", group: "E", date: "2026-06-25", home: "ECU", away: "GER", venue: "NYC" },
  // ---- Group F ----
  { id: 31, stage: "group", group: "F", date: "2026-06-14", home: "NED", away: "JPN", venue: "DAL" },
  { id: 32, stage: "group", group: "F", date: "2026-06-14", home: "SWE", away: "TUN", venue: "BBV" },
  { id: 33, stage: "group", group: "F", date: "2026-06-20", home: "NED", away: "SWE", venue: "HOU" },
  { id: 34, stage: "group", group: "F", date: "2026-06-20", home: "TUN", away: "JPN", venue: "BBV" },
  { id: 35, stage: "group", group: "F", date: "2026-06-25", home: "JPN", away: "SWE", venue: "DAL" },
  { id: 36, stage: "group", group: "F", date: "2026-06-25", home: "TUN", away: "NED", venue: "KC" },
  // ---- Group G ----
  { id: 37, stage: "group", group: "G", date: "2026-06-15", home: "IRN", away: "NZL", venue: "LAX" },
  { id: 38, stage: "group", group: "G", date: "2026-06-15", home: "BEL", away: "EGY", venue: "SEA" },
  { id: 39, stage: "group", group: "G", date: "2026-06-21", home: "BEL", away: "IRN", venue: "LAX" },
  { id: 40, stage: "group", group: "G", date: "2026-06-21", home: "NZL", away: "EGY", venue: "BCP" },
  { id: 41, stage: "group", group: "G", date: "2026-06-26", home: "EGY", away: "IRN", venue: "SEA" },
  { id: 42, stage: "group", group: "G", date: "2026-06-26", home: "NZL", away: "BEL", venue: "BCP" },
  // ---- Group H ----
  { id: 43, stage: "group", group: "H", date: "2026-06-15", home: "ESP", away: "CPV", venue: "ATL" },
  { id: 44, stage: "group", group: "H", date: "2026-06-15", home: "KSA", away: "URU", venue: "MIA" },
  { id: 45, stage: "group", group: "H", date: "2026-06-21", home: "ESP", away: "KSA", venue: "ATL" },
  { id: 46, stage: "group", group: "H", date: "2026-06-21", home: "URU", away: "CPV", venue: "MIA" },
  { id: 47, stage: "group", group: "H", date: "2026-06-26", home: "CPV", away: "KSA", venue: "HOU" },
  { id: 48, stage: "group", group: "H", date: "2026-06-26", home: "URU", away: "ESP", venue: "AKR" },
  // ---- Group I ----
  { id: 49, stage: "group", group: "I", date: "2026-06-16", home: "FRA", away: "SEN", venue: "NYC" },
  { id: 50, stage: "group", group: "I", date: "2026-06-16", home: "IRQ", away: "NOR", venue: "BOS" },
  { id: 51, stage: "group", group: "I", date: "2026-06-22", home: "FRA", away: "IRQ", venue: "PHI" },
  { id: 52, stage: "group", group: "I", date: "2026-06-22", home: "NOR", away: "SEN", venue: "NYC" },
  { id: 53, stage: "group", group: "I", date: "2026-06-26", home: "NOR", away: "FRA", venue: "BOS" },
  { id: 54, stage: "group", group: "I", date: "2026-06-26", home: "SEN", away: "IRQ", venue: "BMO" },
  // ---- Group J ----
  { id: 55, stage: "group", group: "J", date: "2026-06-16", home: "ARG", away: "ALG", venue: "KC" },
  { id: 56, stage: "group", group: "J", date: "2026-06-16", home: "AUT", away: "JOR", venue: "SFO" },
  { id: 57, stage: "group", group: "J", date: "2026-06-22", home: "ARG", away: "AUT", venue: "DAL" },
  { id: 58, stage: "group", group: "J", date: "2026-06-22", home: "JOR", away: "ALG", venue: "SFO" },
  { id: 59, stage: "group", group: "J", date: "2026-06-27", home: "ALG", away: "AUT", venue: "KC" },
  { id: 60, stage: "group", group: "J", date: "2026-06-27", home: "JOR", away: "ARG", venue: "DAL" },
  // ---- Group K ----
  { id: 61, stage: "group", group: "K", date: "2026-06-17", home: "POR", away: "COD", venue: "HOU" },
  { id: 62, stage: "group", group: "K", date: "2026-06-17", home: "UZB", away: "COL", venue: "AZT" },
  { id: 63, stage: "group", group: "K", date: "2026-06-23", home: "POR", away: "UZB", venue: "HOU" },
  { id: 64, stage: "group", group: "K", date: "2026-06-23", home: "COL", away: "COD", venue: "AKR" },
  { id: 65, stage: "group", group: "K", date: "2026-06-27", home: "COL", away: "POR", venue: "MIA" },
  { id: 66, stage: "group", group: "K", date: "2026-06-27", home: "COD", away: "UZB", venue: "ATL" },
  // ---- Group L ----
  { id: 67, stage: "group", group: "L", date: "2026-06-17", home: "ENG", away: "CRO", venue: "DAL" },
  { id: 68, stage: "group", group: "L", date: "2026-06-17", home: "GHA", away: "PAN", venue: "BMO" },
  { id: 69, stage: "group", group: "L", date: "2026-06-23", home: "ENG", away: "GHA", venue: "BOS" },
  { id: 70, stage: "group", group: "L", date: "2026-06-23", home: "PAN", away: "CRO", venue: "BMO" },
  { id: 71, stage: "group", group: "L", date: "2026-06-27", home: "PAN", away: "ENG", venue: "NYC" },
  { id: 72, stage: "group", group: "L", date: "2026-06-27", home: "CRO", away: "GHA", venue: "PHI" },
  // ---- Round of 32 ----
  { id: 73, stage: "R32", date: "2026-06-28", home: "2A",  away: "2B",  venue: "LAX" },
  { id: 74, stage: "R32", date: "2026-06-29", home: "1E",  away: "T74", venue: "BOS" },
  { id: 75, stage: "R32", date: "2026-06-29", home: "1F",  away: "2C",  venue: "BBV" },
  { id: 76, stage: "R32", date: "2026-06-29", home: "1C",  away: "2F",  venue: "HOU" },
  { id: 77, stage: "R32", date: "2026-06-30", home: "1I",  away: "T77", venue: "NYC" },
  { id: 78, stage: "R32", date: "2026-06-30", home: "2E",  away: "2I",  venue: "DAL" },
  { id: 79, stage: "R32", date: "2026-06-30", home: "1A",  away: "T79", venue: "AZT" },
  { id: 80, stage: "R32", date: "2026-07-01", home: "1L",  away: "T80", venue: "ATL" },
  { id: 81, stage: "R32", date: "2026-07-01", home: "1D",  away: "T81", venue: "SFO" },
  { id: 82, stage: "R32", date: "2026-07-01", home: "1G",  away: "T82", venue: "SEA" },
  { id: 83, stage: "R32", date: "2026-07-02", home: "2K",  away: "2L",  venue: "BMO" },
  { id: 84, stage: "R32", date: "2026-07-02", home: "1H",  away: "2J",  venue: "LAX" },
  { id: 85, stage: "R32", date: "2026-07-02", home: "1B",  away: "T85", venue: "BCP" },
  { id: 86, stage: "R32", date: "2026-07-03", home: "1J",  away: "2H",  venue: "MIA" },
  { id: 87, stage: "R32", date: "2026-07-03", home: "1K",  away: "T87", venue: "KC" },
  { id: 88, stage: "R32", date: "2026-07-03", home: "2D",  away: "2G",  venue: "DAL" },
  // ---- Round of 16 ----
  { id: 89, stage: "R16", date: "2026-07-04", home: "W74", away: "W77", venue: "PHI" },
  { id: 90, stage: "R16", date: "2026-07-04", home: "W73", away: "W75", venue: "HOU" },
  { id: 91, stage: "R16", date: "2026-07-05", home: "W76", away: "W78", venue: "NYC" },
  { id: 92, stage: "R16", date: "2026-07-05", home: "W79", away: "W80", venue: "AZT" },
  { id: 93, stage: "R16", date: "2026-07-06", home: "W83", away: "W84", venue: "DAL" },
  { id: 94, stage: "R16", date: "2026-07-06", home: "W81", away: "W82", venue: "SEA" },
  { id: 95, stage: "R16", date: "2026-07-07", home: "W86", away: "W88", venue: "ATL" },
  { id: 96, stage: "R16", date: "2026-07-07", home: "W85", away: "W87", venue: "BCP" },
  // ---- Quarter-finals ----
  { id: 97,  stage: "QF", date: "2026-07-09", home: "W89", away: "W90", venue: "BOS" },
  { id: 98,  stage: "QF", date: "2026-07-10", home: "W93", away: "W94", venue: "LAX" },
  { id: 99,  stage: "QF", date: "2026-07-11", home: "W91", away: "W92", venue: "MIA" },
  { id: 100, stage: "QF", date: "2026-07-11", home: "W95", away: "W96", venue: "KC" },
  // ---- Semi-finals ----
  { id: 101, stage: "SF", date: "2026-07-14", home: "W97", away: "W98",  venue: "DAL" },
  { id: 102, stage: "SF", date: "2026-07-15", home: "W99", away: "W100", venue: "ATL" },
  // ---- Third place & Final ----
  { id: 103, stage: "3P", date: "2026-07-18", home: "L101", away: "L102", venue: "MIA" },
  { id: 104, stage: "F",  date: "2026-07-19", home: "W101", away: "W102", venue: "NYC" },
];

/* R32 slots taking a third-placed team, with the groups each slot may
 * receive (official FIFA allocation constraints). */
const THIRD_SLOTS = [
  { key: "T74", groups: ["A", "B", "C", "D", "F"] },
  { key: "T77", groups: ["C", "D", "F", "G", "H"] },
  { key: "T79", groups: ["C", "E", "F", "H", "I"] },
  { key: "T80", groups: ["E", "H", "I", "J", "K"] },
  { key: "T81", groups: ["B", "E", "F", "I", "J"] },
  { key: "T82", groups: ["A", "E", "H", "I", "J"] },
  { key: "T85", groups: ["E", "F", "G", "I", "J"] },
  { key: "T87", groups: ["D", "E", "I", "J", "L"] },
];
