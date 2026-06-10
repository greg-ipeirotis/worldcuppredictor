/* 48 qualified teams. Sources (June 10, 2026): FIFA ranking points (live
 * calc, football-ranking.com; April 1 official release corroborates), Elo
 * from the eloratings.net methodology (international-football.net mirror,
 * cross-checked vs Wikipedia's June 1 snapshot), qualifying records from
 * Wikipedia confederation tables, xG/game from xGscore.io (UEFA qualifying),
 * base camps from FIFA's official Team Base Camp list.
 *
 * qual = qualifying record; xgFor/xgAgainst are per-game where a reliable
 * source exists, otherwise omitted (model falls back to actual goals).
 * altitudeReady: 1 = fully acclimatized, 0.5 = partial (Andean federations,
 * teams camped at altitude in Mexico). baseCamp.tz = UTC offset in June. */
const TEAMS = [
  // ---- Group A ----
  { id: "MEX", name: "Mexico", flag: "\u{1F1F2}\u{1F1FD}", confed: "CONCACAF", group: "A", fifaRank: 14, fifaPoints: 1687, elo: 1875, host: true, altitudeReady: 1,
    qual: null, baseCamp: { city: "Mexico City, MX (CAR)", lat: 19.43, lon: -99.13, tz: -6 } },
  { id: "RSA", name: "South Africa", flag: "\u{1F1FF}\u{1F1E6}", confed: "CAF", group: "A", fifaRank: 60, fifaPoints: 1433, elo: 1528, altitudeReady: 1,
    qual: { played: 10, gf: 15, ga: 9 }, baseCamp: { city: "Pachuca, MX (2,400 m)", lat: 20.12, lon: -98.74, tz: -6 } },
  { id: "KOR", name: "South Korea", flag: "\u{1F1F0}\u{1F1F7}", confed: "AFC", group: "A", fifaRank: 25, fifaPoints: 1592, elo: 1758, altitudeReady: 0.5,
    qual: { played: 10, gf: 20, ga: 7 }, baseCamp: { city: "Guadalajara, MX", lat: 20.68, lon: -103.40, tz: -6 } },
  { id: "CZE", name: "Czechia", flag: "\u{1F1E8}\u{1F1FF}", confed: "UEFA", group: "A", fifaRank: 39, fifaPoints: 1506, elo: 1740,
    qual: null, baseCamp: { city: "Mansfield, TX", lat: 32.56, lon: -97.12, tz: -5 } },
  // ---- Group B ----
  { id: "CAN", name: "Canada", flag: "\u{1F1E8}\u{1F1E6}", confed: "CONCACAF", group: "B", fifaRank: 30, fifaPoints: 1559, elo: 1788, host: true,
    qual: null, baseCamp: { city: "Vancouver, BC", lat: 49.25, lon: -123.10, tz: -7 } },
  { id: "BIH", name: "Bosnia & Herzegovina", flag: "\u{1F1E7}\u{1F1E6}", confed: "UEFA", group: "B", fifaRank: 64, fifaPoints: 1387, elo: 1595,
    qual: null, baseCamp: { city: "Sandy, UT", lat: 40.57, lon: -111.85, tz: -6 } },
  { id: "QAT", name: "Qatar", flag: "\u{1F1F6}\u{1F1E6}", confed: "AFC", group: "B", fifaRank: 57, fifaPoints: 1450, elo: 1421,
    qual: null, baseCamp: { city: "Santa Barbara, CA", lat: 34.45, lon: -119.66, tz: -7 } },
  { id: "SUI", name: "Switzerland", flag: "\u{1F1E8}\u{1F1ED}", confed: "UEFA", group: "B", fifaRank: 19, fifaPoints: 1650, elo: 1891,
    qual: { played: 6, gf: 14, ga: 2, xgFor: 1.38 }, baseCamp: { city: "San Diego, CA", lat: 32.77, lon: -117.07, tz: -7 } },
  // ---- Group C ----
  { id: "BRA", name: "Brazil", flag: "\u{1F1E7}\u{1F1F7}", confed: "CONMEBOL", group: "C", fifaRank: 6, fifaPoints: 1766, elo: 1991,
    qual: { played: 18, gf: 24, ga: 17 }, baseCamp: { city: "Morristown, NJ", lat: 40.80, lon: -74.48, tz: -4 } },
  { id: "MAR", name: "Morocco", flag: "\u{1F1F2}\u{1F1E6}", confed: "CAF", group: "C", fifaRank: 7, fifaPoints: 1755, elo: 1824,
    qual: { played: 8, gf: 22, ga: 2 }, baseCamp: { city: "Bernards Twp, NJ", lat: 40.68, lon: -74.55, tz: -4 } },
  { id: "HAI", name: "Haiti", flag: "\u{1F1ED}\u{1F1F9}", confed: "CONCACAF", group: "C", fifaRank: 83, fifaPoints: 1293, elo: 1548,
    qual: null, baseCamp: { city: "Galloway, NJ", lat: 39.47, lon: -74.47, tz: -4 } },
  { id: "SCO", name: "Scotland", flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}", confed: "UEFA", group: "C", fifaRank: 42, fifaPoints: 1503, elo: 1782,
    qual: { played: 6, gf: 13, ga: 7 }, baseCamp: { city: "Charlotte, NC", lat: 35.23, lon: -80.84, tz: -4 } },
  // ---- Group D ----
  { id: "USA", name: "United States", flag: "\u{1F1FA}\u{1F1F8}", confed: "CONCACAF", group: "D", fifaRank: 17, fifaPoints: 1671, elo: 1726, host: true,
    qual: null, baseCamp: { city: "Irvine, CA", lat: 33.68, lon: -117.77, tz: -7 } },
  { id: "PAR", name: "Paraguay", flag: "\u{1F1F5}\u{1F1FE}", confed: "CONMEBOL", group: "D", fifaRank: 40, fifaPoints: 1505, elo: 1833,
    qual: { played: 18, gf: 14, ga: 10 }, baseCamp: { city: "San Jose, CA", lat: 37.32, lon: -121.86, tz: -7 } },
  { id: "AUS", name: "Australia", flag: "\u{1F1E6}\u{1F1FA}", confed: "AFC", group: "D", fifaRank: 27, fifaPoints: 1579, elo: 1777,
    qual: null, baseCamp: { city: "Oakland, CA", lat: 37.80, lon: -122.27, tz: -7 } },
  { id: "TUR", name: "Türkiye", flag: "\u{1F1F9}\u{1F1F7}", confed: "UEFA", group: "D", fifaRank: 22, fifaPoints: 1606, elo: 1911,
    qual: null, baseCamp: { city: "Mesa, AZ", lat: 33.42, lon: -111.83, tz: -7 } },
  // ---- Group E ----
  { id: "GER", name: "Germany", flag: "\u{1F1E9}\u{1F1EA}", confed: "UEFA", group: "E", fifaRank: 10, fifaPoints: 1736, elo: 1932,
    qual: { played: 6, gf: 16, ga: 3, xgFor: 2.42 }, baseCamp: { city: "Winston-Salem, NC", lat: 36.13, lon: -80.28, tz: -4 } },
  { id: "CUW", name: "Curaçao", flag: "\u{1F1E8}\u{1F1FC}", confed: "CONCACAF", group: "E", fifaRank: 82, fifaPoints: 1295, elo: 1434,
    qual: null, baseCamp: { city: "Boca Raton, FL", lat: 26.37, lon: -80.10, tz: -4 } },
  { id: "CIV", name: "Ivory Coast", flag: "\u{1F1E8}\u{1F1EE}", confed: "CAF", group: "E", fifaRank: 33, fifaPoints: 1541, elo: 1695,
    qual: { played: 10, gf: 25, ga: 0 }, baseCamp: { city: "Chester, PA", lat: 39.83, lon: -75.37, tz: -4 } },
  { id: "ECU", name: "Ecuador", flag: "\u{1F1EA}\u{1F1E8}", confed: "CONMEBOL", group: "E", fifaRank: 23, fifaPoints: 1599, elo: 1935, altitudeReady: 0.5,
    qual: { played: 18, gf: 14, ga: 5 }, baseCamp: { city: "Columbus, OH", lat: 39.96, lon: -83.00, tz: -4 } },
  // ---- Group F ----
  { id: "NED", name: "Netherlands", flag: "\u{1F1F3}\u{1F1F1}", confed: "UEFA", group: "F", fifaRank: 8, fifaPoints: 1754, elo: 1944,
    qual: { played: 8, gf: 27, ga: 4, xgFor: 2.33 }, baseCamp: { city: "Kansas City, MO", lat: 39.10, lon: -94.58, tz: -5 } },
  { id: "JPN", name: "Japan", flag: "\u{1F1EF}\u{1F1F5}", confed: "AFC", group: "F", fifaRank: 18, fifaPoints: 1662, elo: 1906,
    qual: { played: 10, gf: 24, ga: 3 }, baseCamp: { city: "Nashville, TN", lat: 36.16, lon: -86.78, tz: -5 } },
  { id: "SWE", name: "Sweden", flag: "\u{1F1F8}\u{1F1EA}", confed: "UEFA", group: "F", fifaRank: 38, fifaPoints: 1510, elo: 1712,
    qual: null, baseCamp: { city: "Frisco, TX", lat: 33.15, lon: -96.84, tz: -5 } },
  { id: "TUN", name: "Tunisia", flag: "\u{1F1F9}\u{1F1F3}", confed: "CAF", group: "F", fifaRank: 46, fifaPoints: 1476, elo: 1628,
    qual: { played: 10, gf: 22, ga: 0 }, baseCamp: { city: "Monterrey, MX", lat: 25.68, lon: -100.31, tz: -6 } },
  // ---- Group G ----
  { id: "BEL", name: "Belgium", flag: "\u{1F1E7}\u{1F1EA}", confed: "UEFA", group: "G", fifaRank: 9, fifaPoints: 1742, elo: 1893,
    qual: { played: 8, gf: 29, ga: 7, xgFor: 2.90 }, baseCamp: { city: "Renton, WA", lat: 47.48, lon: -122.22, tz: -7 } },
  { id: "EGY", name: "Egypt", flag: "\u{1F1EA}\u{1F1EC}", confed: "CAF", group: "G", fifaRank: 29, fifaPoints: 1562, elo: 1696,
    qual: { played: 10, gf: 20, ga: 2 }, baseCamp: { city: "Spokane, WA", lat: 47.66, lon: -117.43, tz: -7 } },
  { id: "IRN", name: "Iran", flag: "\u{1F1EE}\u{1F1F7}", confed: "AFC", group: "G", fifaRank: 21, fifaPoints: 1620, elo: 1772,
    qual: { played: 10, gf: 19, ga: 8 }, baseCamp: { city: "Tijuana, MX", lat: 32.51, lon: -117.01, tz: -7 } },
  { id: "NZL", name: "New Zealand", flag: "\u{1F1F3}\u{1F1FF}", confed: "OFC", group: "G", fifaRank: 85, fifaPoints: 1276, elo: 1562,
    qual: null, baseCamp: { city: "San Diego, CA", lat: 32.77, lon: -117.19, tz: -7 } },
  // ---- Group H ----
  { id: "ESP", name: "Spain", flag: "\u{1F1EA}\u{1F1F8}", confed: "UEFA", group: "H", fifaRank: 2, fifaPoints: 1874, elo: 2155,
    qual: { played: 6, gf: 21, ga: 2, xgFor: 3.22 }, baseCamp: { city: "Chattanooga, TN", lat: 35.05, lon: -85.31, tz: -4 } },
  { id: "CPV", name: "Cape Verde", flag: "\u{1F1E8}\u{1F1FB}", confed: "CAF", group: "H", fifaRank: 67, fifaPoints: 1371, elo: 1578,
    qual: { played: 10, gf: 16, ga: 8 }, baseCamp: { city: "Tampa, FL", lat: 27.95, lon: -82.46, tz: -4 } },
  { id: "KSA", name: "Saudi Arabia", flag: "\u{1F1F8}\u{1F1E6}", confed: "AFC", group: "H", fifaRank: 61, fifaPoints: 1423, elo: 1569,
    qual: null, baseCamp: { city: "Austin, TX", lat: 30.27, lon: -97.74, tz: -5 } },
  { id: "URU", name: "Uruguay", flag: "\u{1F1FA}\u{1F1FE}", confed: "CONMEBOL", group: "H", fifaRank: 16, fifaPoints: 1673, elo: 1892,
    qual: { played: 18, gf: 22, ga: 12 }, baseCamp: { city: "Playa del Carmen, MX", lat: 20.63, lon: -87.07, tz: -5 } },
  // ---- Group I ----
  { id: "FRA", name: "France", flag: "\u{1F1EB}\u{1F1F7}", confed: "UEFA", group: "I", fifaRank: 3, fifaPoints: 1871, elo: 2062,
    qual: { played: 6, gf: 16, ga: 4, xgFor: 2.68, xgAgainst: 0.63 }, baseCamp: { city: "Waltham, MA", lat: 42.39, lon: -71.22, tz: -4 } },
  { id: "SEN", name: "Senegal", flag: "\u{1F1F8}\u{1F1F3}", confed: "CAF", group: "I", fifaRank: 15, fifaPoints: 1685, elo: 1867,
    qual: { played: 10, gf: 22, ga: 3 }, baseCamp: { city: "New Brunswick, NJ", lat: 40.50, lon: -74.45, tz: -4 } },
  { id: "IRQ", name: "Iraq", flag: "\u{1F1EE}\u{1F1F6}", confed: "AFC", group: "I", fifaRank: 56, fifaPoints: 1451, elo: 1618,
    qual: null, baseCamp: { city: "Greenbrier County, WV", lat: 37.79, lon: -80.30, tz: -4 } },
  { id: "NOR", name: "Norway", flag: "\u{1F1F3}\u{1F1F4}", confed: "UEFA", group: "I", fifaRank: 31, fifaPoints: 1557, elo: 1917,
    qual: { played: 8, gf: 37, ga: 5, xgFor: 3.18 }, baseCamp: { city: "Greensboro, NC", lat: 36.07, lon: -79.81, tz: -4 } },
  // ---- Group J ----
  { id: "ARG", name: "Argentina", flag: "\u{1F1E6}\u{1F1F7}", confed: "CONMEBOL", group: "J", fifaRank: 1, fifaPoints: 1876, elo: 2114, defendingChampion: true,
    qual: { played: 18, gf: 31, ga: 10 }, baseCamp: { city: "Kansas City, KS", lat: 39.10, lon: -94.63, tz: -5 } },
  { id: "ALG", name: "Algeria", flag: "\u{1F1E9}\u{1F1FF}", confed: "CAF", group: "J", fifaRank: 28, fifaPoints: 1571, elo: 1760,
    qual: { played: 10, gf: 24, ga: 8 }, baseCamp: { city: "Lawrence, KS", lat: 38.97, lon: -95.24, tz: -5 } },
  { id: "AUT", name: "Austria", flag: "\u{1F1E6}\u{1F1F9}", confed: "UEFA", group: "J", fifaRank: 24, fifaPoints: 1597, elo: 1830,
    qual: { played: 8, gf: 22, ga: 4 }, baseCamp: { city: "Santa Barbara, CA", lat: 34.44, lon: -119.83, tz: -7 } },
  { id: "JOR", name: "Jordan", flag: "\u{1F1EF}\u{1F1F4}", confed: "AFC", group: "J", fifaRank: 63, fifaPoints: 1388, elo: 1685,
    qual: { played: 10, gf: 16, ga: 8 }, baseCamp: { city: "Portland, OR", lat: 45.57, lon: -122.67, tz: -7 } },
  // ---- Group K ----
  { id: "POR", name: "Portugal", flag: "\u{1F1F5}\u{1F1F9}", confed: "UEFA", group: "K", fifaRank: 5, fifaPoints: 1766, elo: 1986,
    qual: { played: 6, gf: 20, ga: 7, xgFor: 3.45 }, baseCamp: { city: "Palm Beach Gardens, FL", lat: 26.82, lon: -80.14, tz: -4 } },
  { id: "COD", name: "DR Congo", flag: "\u{1F1E8}\u{1F1E9}", confed: "CAF", group: "K", fifaRank: 45, fifaPoints: 1477, elo: 1661,
    qual: { played: 10, gf: 15, ga: 6 }, baseCamp: { city: "Houston, TX", lat: 29.76, lon: -95.37, tz: -5 } },
  { id: "UZB", name: "Uzbekistan", flag: "\u{1F1FA}\u{1F1FF}", confed: "AFC", group: "K", fifaRank: 50, fifaPoints: 1459, elo: 1718,
    qual: { played: 10, gf: 14, ga: 7 }, baseCamp: { city: "Atlanta, GA", lat: 33.75, lon: -84.39, tz: -4 } },
  { id: "COL", name: "Colombia", flag: "\u{1F1E8}\u{1F1F4}", confed: "CONMEBOL", group: "K", fifaRank: 13, fifaPoints: 1698, elo: 1977, altitudeReady: 0.5,
    qual: { played: 18, gf: 28, ga: 18 }, baseCamp: { city: "Guadalajara, MX", lat: 20.65, lon: -103.39, tz: -6 } },
  // ---- Group L ----
  { id: "ENG", name: "England", flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", confed: "UEFA", group: "L", fifaRank: 4, fifaPoints: 1827, elo: 2021,
    qual: { played: 8, gf: 22, ga: 0, xgFor: 2.56, xgAgainst: 0.43 }, baseCamp: { city: "Kansas City, MO", lat: 39.02, lon: -94.52, tz: -5 } },
  { id: "CRO", name: "Croatia", flag: "\u{1F1ED}\u{1F1F7}", confed: "UEFA", group: "L", fifaRank: 11, fifaPoints: 1715, elo: 1908,
    qual: { played: 8, gf: 26, ga: 4, xgFor: 3.06 }, baseCamp: { city: "Alexandria, VA", lat: 38.82, lon: -77.09, tz: -4 } },
  { id: "GHA", name: "Ghana", flag: "\u{1F1EC}\u{1F1ED}", confed: "CAF", group: "L", fifaRank: 73, fifaPoints: 1347, elo: 1510,
    qual: null, baseCamp: { city: "Smithfield, RI", lat: 41.92, lon: -71.54, tz: -4 } },
  { id: "PAN", name: "Panama", flag: "\u{1F1F5}\u{1F1E6}", confed: "CONCACAF", group: "L", fifaRank: 34, fifaPoints: 1539, elo: 1730,
    qual: null, baseCamp: { city: "New Tecumseth, ON", lat: 44.09, lon: -79.87, tz: -4 } },
];

/* Pre-tournament bookmaker odds (BetMGM, June 10, 2026) — shown for
 * comparison in team detail views; not a model input. */
const MARKET_ODDS = {
  ESP: "+450", FRA: "+500", ENG: "+700", BRA: "+800", POR: "+800", ARG: "+900",
  GER: "+1400", NED: "+2000", BEL: "+3300", NOR: "+3300", COL: "+4000",
  MAR: "+4000", JPN: "+5000", USA: "+5000", MEX: "+6600", SEN: "+6600",
  SUI: "+6600", TUR: "+6600", URU: "+6600", CRO: "+8000", ECU: "+8000",
};
