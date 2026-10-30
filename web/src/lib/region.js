/* [AI] Purpose: The region math behind the "draw an outline" tool
 *      (SelectedRegionStats, CS-042 / CS-060): check a drawn outline, test
 *      whether a map pixel is inside it, and summarize the vegetation values
 *      found inside. Kept apart from the globe engine so it can be unit tested
 *      without a map or a browser.
 *      Does:    buildBoundedRegions(points) -> region object or null
 *               containsPoint(region, lat, lng) -> true / false
 *               calculateRegionStats(values) -> { mean, min, max, count } or null
 *      Context: RegionPanel.js calls buildBoundedRegions when the user presses
 *               Finish; averageNdvi() in map/chlorosatGlobeEngine.js uses all
 *               three. Tests: tests/buildBoundedRegions.test.mjs and
 *               tests/calculateRegionStats.test.mjs.
 *      Written: 2026-10-14 · Composer · requested by Lucas
 *      Edited:  2026-10-30 · Claude Opus 5.5 · requested by Adam Weaver · bounding box, containsPoint and calculateRegionStats (first working versions) */

/* [AI] Purpose: Turn the corners a user clicked into a region the rest of the
 *      app can use.
 *      Does:    points [{ lat, lng }, ...] ->
 *                 null when there is no list or fewer than 3 points
 *                 (a region needs at least a triangle);
 *                 throws when a coordinate is not a number or is out of range
 *                 (latitude -90..90, longitude -180..180);
 *                 otherwise { points, ring, bbox, crossesDateline }:
 *                   points: copies of the corners as given;
 *                   ring:   the corners used for inside tests. For an outline
 *                           that crosses the date line (spans more than 180°
 *                           of longitude), negative longitudes get +360 so
 *                           the shape stays in one piece;
 *                   bbox:   { west, south, east, north } around `ring`.
 *      Context: Called by RegionPanel.js (Finish) and averageNdvi(); tests in
 *               tests/buildBoundedRegions.test.mjs and calculateRegionStats.test.mjs.
 *      Written: 2026-10-14 · Composer · requested by Lucas
 *      Edited:  2026-10-30 · Claude Opus 5.5 · requested by Adam Weaver · number check, ring, bbox and date-line handling (moved here from averageNdvi) */
export function buildBoundedRegions(points) {
  if (!Array.isArray(points) || points.length < 3) {
    return null;
  }

  for (const p of points) {
    if (!p || !Number.isFinite(p.lat) || !Number.isFinite(p.lng)) {
      throw new Error(`point is not a pair of numbers: ${JSON.stringify(p)}`);
    }
    if (p.lat < -90 || p.lat > 90) {
      throw new Error(`latitude out of range: ${p.lat}`);
    }
    if (p.lng < -180 || p.lng > 180) {
      throw new Error(`longitude out of range: ${p.lng}`);
    }
  }

  const copies = points.map((p) => ({ lat: p.lat, lng: p.lng }));
  const lngs = copies.map((p) => p.lng);
  const crossesDateline = Math.max(...lngs) - Math.min(...lngs) > 180;
  const ring = crossesDateline
    ? copies.map((p) => ({ lat: p.lat, lng: p.lng < 0 ? p.lng + 360 : p.lng }))
    : copies.map((p) => ({ ...p }));

  const bbox = { west: Infinity, south: Infinity, east: -Infinity, north: -Infinity };
  for (const p of ring) {
    bbox.west = Math.min(bbox.west, p.lng);
    bbox.east = Math.max(bbox.east, p.lng);
    bbox.south = Math.min(bbox.south, p.lat);
    bbox.north = Math.max(bbox.north, p.lat);
  }

  return { points: copies, ring, bbox, crossesDateline };
}

/* [AI] Purpose: Decide whether one spot (e.g. the center of a NASA pixel)
 *      is inside a drawn outline.
 *      Does:    (region from buildBoundedRegions, lat, lng) -> true if the
 *               spot is inside the outline, false otherwise (also false for a
 *               missing region or a spot that isn't a pair of numbers).
 *               Uses the "ray casting" rule: walk east from the spot and
 *               count how many outline edges you cross; an odd count means
 *               inside. Longitudes may be given as -180..180, or already in
 *               the ring's 0..360 form for a date-line outline.
 *      Context: Flat latitude/longitude geometry, which is close enough for
 *               outlines a person draws on screen; very large outlines are
 *               only approximate.
 *      Written: 2026-10-30 · Claude Opus 5.5 · requested by Adam Weaver (moved out of averageNdvi) */
export function containsPoint(region, lat, lng) {
  if (!region || !Array.isArray(region.ring) || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return false;
  }
  const x = region.crossesDateline && lng < 0 ? lng + 360 : lng;
  const ring = region.ring;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const yi = ring[i].lat;
    const yj = ring[j].lat;
    const xi = ring[i].lng;
    const xj = ring[j].lng;
    // Does the edge from corner j to corner i pass the spot's latitude, east of it?
    const crosses = (yi > lat) !== (yj > lat);
    if (crosses && x < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/* [AI] Purpose: Summarize the vegetation (NDVI) values found inside a region
 *      into the numbers the region readout shows.
 *      Does:    values (any list of numbers, e.g. an array or Float32Array) ->
 *                 { mean, min, max, count } over the real numbers in it;
 *                 NaN / Infinity / non-numbers mean "no data" and are skipped;
 *                 null when there is no list or no real number in it.
 *               NDVI at or below 0 is kept as it is (the engine's average
 *               did the same before this function existed).
 *      Context: The caller decides which pixels count (inside the outline,
 *               on land). The map itself paints NDVI <= 0 and no-data land
 *               as "no vegetation" (0), and calculateDataChange floors at 0;
 *               whether this average should match the map is CS-065.
 *      Written: 2026-10-30 · Claude Opus 5.5 · requested by Adam Weaver */
export function calculateRegionStats(values) {
  if (values == null || typeof values[Symbol.iterator] !== 'function' || typeof values === 'string') {
    return null;
  }
  let sum = 0;
  let count = 0;
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;
    sum += value;
    count += 1;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (count === 0) return null;
  return { mean: sum / count, min, max, count };
}
