/* [AI] Purpose: Place search for the map's search box, run in the browser.
 *      The main site is a static export (docs/ARCHITECTURE.md, D1): no
 *      server, so no API routes. The demo's /api/geocode route moved here
 *      unchanged apart from running client-side.
 *      Does:    searchPlaces(text) -> [{ id, label, lng, lat, bbox, zoom, view }],
 *      up to 5 places (bbox may be null - then fly to lng/lat at zoom; view
 *      'globe' means show the whole globe). Uses Photon (photon.komoot.io),
 *      komoot's free, keyless geocoder on OpenStreetMap data, which (unlike
 *      OpenStreetMap's own Nominatim) allows search-as-you-type from the
 *      browser. Answers are cached in memory for the visit, so going back
 *      over the same text doesn't ask Photon again.
 *      Context: Photon's public server is free for fair use with no
 *      guarantee. If traffic outgrows it, point PHOTON_URL at a self-hosted
 *      Photon; the result shape above is all SearchBar.js depends on.
 *      Written: 2026-09-28 · Claude Opus 5.5 · requested by David (as app/api/geocode/route.js in the demo)
 *      Ported:  2026-09-30 · Claude Opus 5.5 (for David) · server route -> browser module for the static site */

const PHOTON_URL = "https://photon.komoot.io/api/";
const RESULT_LIMIT = 5;
const MAX_QUERY_LENGTH = 200;
const CACHE_LIMIT = 200;

// In-memory cache for this visit: lowercased text -> results.
const cache = new Map();

// "Norman, Oklahoma, United States" - skips missing and repeated parts.
function buildLabel(p) {
  const street = p.street ? [p.housenumber, p.street].filter(Boolean).join(' ') : null;
  const parts = [];
  for (const part of [p.name, street, p.city, p.state, p.country]) {
    if (part && !parts.includes(part)) parts.push(part);
  }
  return parts.join(', ');
}

// Photon's extent is two corner points, but the corner order isn't
// consistent in practice (the docs and live responses disagree), so take
// min/max rather than trusting positions. -> [[west, south], [east, north]]
function toBounds(extent) {
  if (!Array.isArray(extent) || extent.length !== 4) return null;
  const [x1, y1, x2, y2] = extent.map(Number);
  if ([x1, y1, x2, y2].some((n) => !Number.isFinite(n))) return null;
  return [[Math.min(x1, x2), Math.min(y1, y2)], [Math.max(x1, x2), Math.max(y1, y2)]];
}

// [AI] David found "Tokyo, Japan" zooming out to empty ocean. A place's
//      outline box includes ALL of its territory, and Tokyo's includes remote
//      Pacific islands ~1,700 km south and ~1,300 km east of the city - so
//      fitting the box framed mostly sea. Chile (Easter Island) had the same
//      problem, and places crossing the date line (Fiji, the United States
//      via the Aleutians) come back as a box spanning the whole globe.
//      The place's own point (its center / main settlement) stays reliable,
//      so the box is only used as-is when that point sits reasonably inside
//      it. Otherwise it's shrunk to a square around the point, sized by the
//      point's distance to the nearest edge of the box (for Tokyo: the
//      northern border, ~25 km away - central Tokyo). If there's no usable
//      box at all, the result carries a zoom level by place type instead.
//      Written: 2026-09-28 · Claude Opus 5.5 · requested by David
const ZOOM_BY_TYPE = {
  country: 3.5,
  state: 5.5,
  county: 8,
  city: 10,
  district: 12,
  locality: 12,
  street: 15,
  house: 16
};
const DEFAULT_POINT_ZOOM = 14;
// [AI] David found that searching a continent zoomed way in on it. Photon
//      returns continents, oceans, seas and big regions as a single point
//      with no outline box and type "other", so they fell through to the
//      street-level default above. These go by OSM's place=* value instead.
//      'globe' means "show the whole globe centered here" - the client
//      uses the same screen-size-aware zoom as the app's starting view.
//      Written: 2026-09-28 · Claude Opus 5.5 · requested by David
const ZOOM_BY_PLACE_VALUE = {
  continent: 'globe',
  ocean: 'globe',
  sea: 4,
  region: 5,
  archipelago: 6
};
const EDGE_MARGIN = 0.15; // point must lie in the middle 70% of the box on both axes
const MIN_HALF_SIZE_DEG = 0.01; // ~1 km - below this, a box isn't worth fitting

// [AI] Natural features usually come back from Photon as a bare point with
//      no outline, so they all fell to the street-level default (zoom 14):
//      searching "Grand Canyon" showed ~2 km of one cliff. These zooms are
//      sized to the typical feature instead. Found by searching 100 places
//      and measuring the result (David, 2026-09-30).
//      Written: 2026-09-30 · Claude Opus 5.5 · requested by David
const ZOOM_BY_NATURAL = {
  peak: 12,
  volcano: 11,
  valley: 9,
  glacier: 10,
  ridge: 10,
  mountain_range: 7,
  desert: 6,
  island: 10,
  bay: 9,
  strait: 8,
  cape: 11,
  beach: 14,
  water: 11,
};

function pointView(p) {
  const placeZoom = p.osm_key === 'place' ? ZOOM_BY_PLACE_VALUE[p.osm_value] : undefined;
  if (placeZoom === 'globe') return { zoom: null, view: 'globe' };
  const naturalZoom = p.osm_key === 'natural' ? ZOOM_BY_NATURAL[p.osm_value] : undefined;
  return { zoom: placeZoom ?? naturalZoom ?? ZOOM_BY_TYPE[p.type] ?? DEFAULT_POINT_ZOOM };
}

// [AI] Places that cross the 180° line (the date line). Photon gives them a
//      box running all the way round the globe (-180 to 180), which can't be
//      fitted, so they used to fall back to a fixed zoom on one point:
//      "Russia" showed a patch of central Siberia. Only a handful of places
//      cross that line, so their frames are listed here. Boxes are
//      [[west, south], [east, north]]; an east value above 180 continues past
//      the date line (190 = 170°W), which MapLibre fits correctly.
//      The United States frames the lower 48, like most map sites do.
//      Written: 2026-09-30 · Claude Opus 5.5 · requested by David
const DATELINE_FRAMES = {
  'country:Russia': [[20, 41], [190, 78]],
  'country:United States': [[-125, 24.5], [-66.9, 49.4]],
  'country:Fiji': [[176.9, -19.3], [181.6, -15.6]],
  'country:Kiribati': [[169, -11.5], [210, 5]],
  'country:New Zealand': [[166.4, -47.4], [178.6, -34.3]],
  'state:Alaska': [[172, 51], [230, 71.5]],
};

function datelineFrame(p) {
  return DATELINE_FRAMES[`${p.osm_value}:${p.name}`] || null;
}

function framingBounds(bounds, lng, lat) {
  if (!bounds) return null;
  const [[west, south], [east, north]] = bounds;
  const width = east - west;
  const height = north - south;
  // Date-line crossers / whole-globe boxes, and zero-size "boxes".
  if (width > 180 || width <= 0 || height <= 0) return null;
  const fx = (lng - west) / width;
  const fy = (lat - south) / height;
  if (fx >= EDGE_MARGIN && fx <= 1 - EDGE_MARGIN && fy >= EDGE_MARGIN && fy <= 1 - EDGE_MARGIN) {
    return bounds;
  }
  // [AI] A box under ~2 degrees (~200 km) is the town itself, even when its
  //      point sits near one edge, so use it whole. Shrinking it made "Hakone"
  //      (point near the town's edge) zoom in to a few streets. The shrink
  //      below is for huge boxes stretched by far-off territory (Tokyo's
  //      Pacific islands, Chile's Easter Island). (David, 2026-09-30)
  if (width <= 2 && height <= 2) return bounds;
  const half = Math.min(lng - west, east - lng, lat - south, north - lat);
  if (!(half >= MIN_HALF_SIZE_DEG)) return null;
  return [[lng - half, lat - half], [lng + half, lat + half]];
}

// How many candidates to ask Photon for; re-ranking then keeps RESULT_LIMIT.
const FETCH_LIMIT = 10;

/* [AI] Purpose: Ask Photon for candidates, optionally near what's on screen.
 *      Does:    query + near ({ lng, lat, zoom } or null) -> Photon's raw features.
 *      Context: Photon's lat/lon/zoom parameters make nearby places rank
 *      higher (zoomed into Oklahoma, "Moore" gives Moore, OK). The bias is
 *      only sent when zoomed in to about city level (zoom 8+): further out,
 *      the screen center says little about what someone is looking for. location_bias_scale 0.5 keeps famous
 *      places winning over tiny nearby ones ("Paris" still means France).
 *      Written: 2026-09-30 · Claude Opus 5.5 · requested by David */
async function fetchCandidates(query, near) {
  let url = `${PHOTON_URL}?q=${encodeURIComponent(query)}&limit=${FETCH_LIMIT}&lang=en`;
  if (near) {
    url += `&lat=${near.lat.toFixed(3)}&lon=${near.lng.toFixed(3)}&zoom=${Math.round(near.zoom)}&location_bias_scale=0.5`;
  }
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Photon responded ${res.status}`);
  const data = await res.json();
  return data.features || [];
}

// Joins candidate lists in order, keeping the first copy of each OSM object.
function mergeFeatures(...lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const f of list) {
      const p = f.properties || {};
      const id = `${p.osm_type}${p.osm_id}`;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(f);
    }
  }
  return out;
}

/* [AI] Purpose: How many characters to wait for before searching.
 *      Does:    text -> 3, or 2 for text in a non-Latin script.
 *      Context: 3 Latin letters narrow things down enough, but many
 *      Japanese/Chinese/Korean place names are only 2 characters ("東京",
 *      "大阪", "京都"), so those never got searched (found testing Japan).
 *      SearchBar.js uses this too. Written: 2026-09-30 · Claude Opus 5.5 · requested by David */
export function minSearchLength(text) {
  return hasNonLatin(text) ? 2 : 3;
}

// True if the text has letters outside the Latin alphabets (e.g. Japanese).
function hasNonLatin(text) {
  return /[^\u0000-\u024F\u1E00-\u1EFF\s\p{P}\p{N}\p{S}]/u.test(String(text || ""));
}

// Lowercase, no accents, punctuation as spaces: "Île-de-France" -> "ile de france".
function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Places: countries, states, counties, cities, towns, villages, islands...
// OpenStreetMap's own place tags count too: Photon files some big cities under
// a different type (Lima, Peru is place=city but type "district").
const PLACE_TYPES = new Set(["country", "state", "county", "city"]);
const PLACE_VALUES = new Set([
  "continent", "ocean", "sea", "region", "archipelago", "island",
  "country", "state", "province", "city", "town", "village", "municipality",
]);
function isPlace(p) {
  return PLACE_TYPES.has(p.type) || (p.osm_key === "place" && PLACE_VALUES.has(p.osm_value));
}

// Things people rarely mean when they type just a name: streets, buildings,
// shops, businesses, offices, hotels, housing areas, stations, census areas.
// Amenities are businesses unless they're a real landmark (a university,
// hospital, town hall...). These still rank among themselves, nearby first,
// so "Starbucks" or "Main Street" still finds the one near you.
const LOW_VALUE_KEYS = new Set([
  "highway", "building", "landuse", "shop", "office", "railway", "public_transport",
  "craft", "healthcare", "club", "emergency",
]);
const LANDMARK_AMENITIES = new Set([
  "university", "college", "school", "hospital", "townhall", "library",
  "theatre", "arts_centre", "courthouse", "place_of_worship",
]);
const LODGING = new Set(["hotel", "motel", "guest_house", "hostel", "apartment"]);
function isLowValue(p) {
  if (p.type === "street" || LOW_VALUE_KEYS.has(p.osm_key)) return true;
  if (p.osm_key === "amenity") return !LANDMARK_AMENITIES.has(p.osm_value);
  if (p.osm_key === "tourism" && LODGING.has(p.osm_value)) return true;
  return p.osm_key === "boundary" && p.osm_value === "census";
}

const SMALL_PLACES = new Set(["village", "hamlet", "isolated_dwelling", "locality", "suburb", "quarter", "neighbourhood"]);
function isSmallPlace(p) {
  return p.osm_key === "place" && SMALL_PLACES.has(p.osm_value);
}

function exactName(p, wanted) {
  const name = normalize(p.name);
  if (name === wanted) return true;
  // "New York City" -> the city OpenStreetMap calls "New York".
  return wanted.endsWith(" city") && p.type === "city" && name === wanted.slice(0, -5);
}

// Rough distance in km (equirectangular; plenty for "is it on screen").
function distanceKm(lng1, lat1, lng2, lat2) {
  const toRad = Math.PI / 180;
  let dLng = Math.abs(lng2 - lng1);
  if (dLng > 180) dLng = 360 - dLng;
  const x = dLng * toRad * Math.cos(((lat1 + lat2) / 2) * toRad);
  const y = (lat2 - lat1) * toRad;
  return 6371 * Math.hypot(x, y);
}

/* [AI] Purpose: Put the place people most likely mean first, while keeping
 *      Photon's own ranking (which knows what's famous) as much as possible.
 *      Built by searching 100 places in a row like a user would and checking
 *      each top result (David, 2026-09-30). It fixed: "Everglades" listing
 *      two housing areas and a street before the national park; "New York
 *      City" never reaching the city; "Moore" (zoomed into Oklahoma) giving
 *      Moore County, Texas; "Starbucks" giving one in Japan.
 *      A first, bolder version that promoted exact-name places and natural
 *      features made other searches worse ("Uluru" -> a village in India,
 *      "Alaska" right after viewing Texas -> a village in Canada), so this
 *      one only does three small things:
 *      Does:    (nearby, plain) Photon lists + text + near -> one list:
 *        1. Photon's normal order, but streets, businesses, housing areas,
 *           stations etc. (isLowValue) move below everything else.
 *        2. "X City" -> a city named X moves to the top (OpenStreetMap
 *           calls New York City "New York").
 *        3. Zoomed in to roughly city level (near is set), results with
 *           exactly the searched name within ~4 screen-widths move to the
 *           top, closest first, if they are a town/city Photon also ranks
 *           without the bias, or a shop/street when nothing famous has that
 *           name. So "Taj Mahal" seen from New York stays the monument,
 *           "Lima" seen from Buenos Aires stays Lima, Peru (not the subway
 *           station), but "Moore", "Starbucks" or "Main Street" finds the
 *           one near you.
 *      Only the text before a comma is compared ("Norman, Oklahoma" -> "norman").
 *      Written: 2026-09-30 · Claude Opus 5.5 · requested by David */
function rerank(nearby, plain, query, near) {
  const wanted = normalize(query.split(",")[0]);
  const osmId = (f) => `${(f.properties || {}).osm_type}${(f.properties || {}).osm_id}`;
  const plainRank = new Map(plain.map((f, i) => [osmId(f), i]));
  // About 4 screen-widths at this zoom (40,075 km around the equator):
  // ~250 km at zoom 9, ~50 km zoomed into a city.
  const radiusKm = near ? (4 * 40075 * Math.cos((near.lat * Math.PI) / 180)) / 2 ** near.zoom : 0;

  const items = mergeFeatures(nearby, plain).map((f) => {
    const p = f.properties || {};
    const [lng, lat] = (f.geometry && f.geometry.coordinates) || [];
    const exact = Boolean(wanted) && exactName(p, wanted);
    const low = isLowValue(p);
    const dist = near && Number.isFinite(lng) ? distanceKm(near.lng, near.lat, lng, lat) : Infinity;
    const order = plainRank.has(osmId(f)) ? plainRank.get(osmId(f)) : 100 + nearby.indexOf(f);
    const cityRule = wanted.endsWith(" city") && p.type === "city" && exact && normalize(p.name) !== wanted;
    return { f, p, exact, low, dist, order, cityRule };
  });
  // Does something well known (not a shop/street, and not just a village or
  // hamlet) have exactly this name? If so, nearby shops don't jump ahead of
  // it. Villages don't count: a village in France called "Target" shouldn't
  // stop the Target stores near you from coming first.
  const notableExact = items.some((x) => x.exact && !x.low && !isSmallPlace(x.p));
  for (const x of items) {
    const close = x.exact && x.dist <= radiusKm;
    // A nearby town/city only if Photon also lists it without the bias (so
    // it's reasonably well known: Moore, OK yes; a hamlet called Bermuda in
    // Scotland, seen from the Isle of Man, no). A nearby shop/street only if
    // nothing famous has that name. Nearby landmarks never jump: the small
    // Statue of Liberty replica in Paris shouldn't beat New York's.
    x.nearExact = close && (isPlace(x.p) ? plainRank.has(osmId(x.f)) : x.low && !notableExact);
  }
  // Text in another script ("東京") can't be compared with Photon's English
  // names, so there, actual places (cities, prefectures...) go before other
  // things: "東京" -> Tokyo, not Tokyo Bay or Tokyo Station.
  const nonLatin = hasNonLatin(query);
  const tier = (x) =>
    x.nearExact ? 0 : x.cityRule ? 1 : nonLatin && isPlace(x.p) ? 2 : x.low ? 4 : 3;
  return items
    .sort((a, b) => tier(a) - tier(b) || (tier(a) === 0 ? a.dist - b.dist : a.order - b.order))
    .map((x) => x.f);
}

/* [AI] Purpose: What SearchBar.js calls. Looks up `text` with Photon.
 *      Does:    text (+ optional near = { lng, lat, zoom } of the map view)
 *      -> Promise of up to 5 places (see the file header), best first
 *      (rerank above). Text under 3 characters returns [] without asking.
 *      Throws if Photon can't be reached (SearchBar shows no results then).
 *      Nearby + famous: when zoomed in, it asks twice at the same time (no
 *      extra wait): once near the view and once without that bias, then
 *      merges them (see rerank for the order). Only asking near the view went
 *      wrong in testing: "Lima" while looking at Buenos Aires gave a
 *      Buenos Aires subway station and Lima, Peru wasn't in the list at all.
 *      "... City" retry: if the text ends in "city" and no city of that name
 *      came back (see exactName), it asks once more without "city".
 *      Written: 2026-09-30 · Claude Opus 5.5 · requested by David
 *      Edited:  2026-09-30 · Claude Opus 5.5 (for David) · 10 candidates + rerank, nearby bias, "City" retry */
export async function searchPlaces(text, near = null) {
  const query = String(text || "").trim().slice(0, MAX_QUERY_LENGTH);
  if (query.length < minSearchLength(query)) return [];
  // Nearby preference only when zoomed in to about city level or closer.
  const bias = near && near.zoom >= 8 ? near : null;
  // Cache per area too (rounded to ~100 km), since the bias changes the answer.
  const key = query.toLowerCase() + (bias ? `@${bias.lat.toFixed(0)},${bias.lng.toFixed(0)},${Math.round(bias.zoom)}` : "");
  if (cache.has(key)) return cache.get(key);

  const [nearby, plain] = await Promise.all([
    bias ? fetchCandidates(query, bias) : Promise.resolve([]),
    fetchCandidates(query, null),
  ]);
  let features = rerank(nearby, plain, query, bias);

  const wanted = normalize(query.split(",")[0]);
  const hasExact = features.some((f) => isPlace(f.properties || {}) && exactName(f.properties, wanted));
  if (!hasExact && wanted.endsWith(" city") && wanted.length > 8) {
    const shorter = query.split(",")[0].replace(/\s*city\s*$/i, "");
    const cityMatches = (await fetchCandidates(shorter, null)).filter((f) => {
      const p = f.properties || {};
      return p.type === "city" && normalize(p.name) === normalize(shorter);
    });
    features = mergeFeatures(cityMatches, features);
  }

  const seen = new Set();
  const results = [];
  for (const feature of features) {
    if (results.length >= RESULT_LIMIT) break;
    const coords = feature.geometry && feature.geometry.coordinates;
    const p = feature.properties || {};
    const label = buildLabel(p);
    // Photon can return the same OSM place twice (e.g. as a town and as its
    // boundary) under different labels; the id doubles as the React key.
    const id = `${p.osm_type || "X"}${p.osm_id || results.length}`;
    if (!Array.isArray(coords) || !label || seen.has(label) || seen.has(id)) continue;
    seen.add(label);
    seen.add(id);
    const lng = Number(coords[0]);
    const lat = Number(coords[1]);
    results.push({
      id,
      label,
      lng,
      lat,
      bbox: datelineFrame(p) || framingBounds(toBounds(p.extent), lng, lat),
      ...pointView(p),
    });
  }

  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value);
  cache.set(key, results);
  return results;
}
