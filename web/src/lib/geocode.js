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

function pointView(p) {
  const placeZoom = p.osm_key === 'place' ? ZOOM_BY_PLACE_VALUE[p.osm_value] : undefined;
  if (placeZoom === 'globe') return { zoom: null, view: 'globe' };
  return { zoom: placeZoom ?? ZOOM_BY_TYPE[p.type] ?? DEFAULT_POINT_ZOOM };
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
  const half = Math.min(lng - west, east - lng, lat - south, north - lat);
  if (!(half >= MIN_HALF_SIZE_DEG)) return null;
  return [[lng - half, lat - half], [lng + half, lat + half]];
}

/* [AI] Purpose: What SearchBar.js calls. Looks up `text` with Photon.
 *      Does:    text -> Promise of up to 5 places (see the file header).
 *      Text under 3 characters returns [] without asking. Throws if Photon
 *      can't be reached (SearchBar shows no results then).
 *      Written: 2026-09-30 · Claude Opus 5.5 · requested by David */
export async function searchPlaces(text) {
  const query = String(text || "").trim().slice(0, MAX_QUERY_LENGTH);
  if (query.length < 3) return [];
  const key = query.toLowerCase();
  if (cache.has(key)) return cache.get(key);

  const url = `${PHOTON_URL}?q=${encodeURIComponent(query)}&limit=${RESULT_LIMIT}&lang=en`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Photon responded ${res.status}`);
  const data = await res.json();

  const seen = new Set();
  const results = [];
  for (const feature of data.features || []) {
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
      bbox: framingBounds(toBounds(p.extent), lng, lat),
      ...pointView(p),
    });
  }

  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value);
  cache.set(key, results);
  return results;
}
