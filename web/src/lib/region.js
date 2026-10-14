/* [AI] Purpose: Minimal buildBoundedRegions() so the TDD tests pass.
 *      Does:    Reject null/empty/<3 points with null; throw on lat/lng
 *               outside valid ranges; otherwise return a simple region
 *               object holding the points. Not a full region implementation.
 *      Context: web/tests/buildBoundedRegions.test.mjs
 *      Written: 2026-10-14 · Composer · requested by Lucas */

/**
 * Build a bounded region from an array of { lat, lng } points.
 * @param {Array<{lat: number, lng: number}>|null} points
 * @returns {{ points: Array<{lat: number, lng: number}> }|null}
 */
export function buildBoundedRegions(points) {
  if (!Array.isArray(points) || points.length < 3) {
    return null;
  }

  for (const p of points) {
    if (p.lat < -90 || p.lat > 90) {
      throw new Error(`latitude out of range: ${p.lat}`);
    }
    if (p.lng < -180 || p.lng > 180) {
      throw new Error(`longitude out of range: ${p.lng}`);
    }
  }

  return { points };
}
