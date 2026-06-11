/* 16 host venues. tz = UTC offset in effect during the tournament (June-July
 * 2026, DST where observed; Mexico no longer observes DST). altitude in m. */
const VENUES = [
  { id: "AZT", stadium: "Estadio Azteca",        city: "Mexico City",            country: "MEX", lat: 19.303, lon: -99.150,  altitude: 2240, tz: -6 },
  { id: "AKR", stadium: "Estadio Akron",         city: "Guadalajara (Zapopan)",  country: "MEX", lat: 20.682, lon: -103.462, altitude: 1566, tz: -6 },
  { id: "BBV", stadium: "Estadio BBVA",          city: "Monterrey (Guadalupe)",  country: "MEX", lat: 25.669, lon: -100.244, altitude: 540,  tz: -6 },
  { id: "BCP", stadium: "BC Place",              city: "Vancouver",              country: "CAN", lat: 49.277, lon: -123.112, altitude: 5,    tz: -7 },
  { id: "BMO", stadium: "BMO Field",             city: "Toronto",                country: "CAN", lat: 43.633, lon: -79.418,  altitude: 76,   tz: -4 },
  { id: "SEA", stadium: "Lumen Field",           city: "Seattle",                country: "USA", lat: 47.595, lon: -122.332, altitude: 5,    tz: -7 },
  { id: "SFO", stadium: "Levi's Stadium",        city: "San Francisco Bay Area", country: "USA", lat: 37.403, lon: -121.970, altitude: 25,   tz: -7 },
  { id: "LAX", stadium: "SoFi Stadium",          city: "Los Angeles",            country: "USA", lat: 33.953, lon: -118.339, altitude: 30,   tz: -7 },
  { id: "KC",  stadium: "Arrowhead Stadium",     city: "Kansas City",            country: "USA", lat: 39.049, lon: -94.484,  altitude: 265,  tz: -5 },
  { id: "DAL", stadium: "AT&T Stadium",          city: "Dallas (Arlington)",     country: "USA", lat: 32.748, lon: -97.093,  altitude: 185,  tz: -5 },
  { id: "HOU", stadium: "NRG Stadium",           city: "Houston",                country: "USA", lat: 29.685, lon: -95.411,  altitude: 15,   tz: -5 },
  { id: "ATL", stadium: "Mercedes-Benz Stadium", city: "Atlanta",                country: "USA", lat: 33.755, lon: -84.401,  altitude: 305,  tz: -4 },
  { id: "MIA", stadium: "Hard Rock Stadium",     city: "Miami",                  country: "USA", lat: 25.958, lon: -80.239,  altitude: 3,    tz: -4 },
  { id: "BOS", stadium: "Gillette Stadium",      city: "Boston (Foxborough)",    country: "USA", lat: 42.091, lon: -71.264,  altitude: 90,   tz: -4 },
  { id: "PHI", stadium: "Lincoln Financial Field", city: "Philadelphia",         country: "USA", lat: 39.901, lon: -75.168,  altitude: 12,   tz: -4 },
  { id: "NYC", stadium: "MetLife Stadium",       city: "New York / New Jersey",  country: "USA", lat: 40.813, lon: -74.074,  altitude: 3,    tz: -4 },
];
