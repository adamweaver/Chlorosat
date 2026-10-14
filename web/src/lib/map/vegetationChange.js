/* [AI] Purpose: Core math for the planned "vegetation change" view: how much
 *               greener or browner each pixel got between two years. The
 *               map layer that will use it is not built yet.
 *      Does:    (startNdvi, endNdvi) -> Float32Array of endNdvi - startNdvi per
 *               pixel, or null if the input is invalid. NDVI <= 0 (water,
 *               pavement) counts as 0. NaN (no data, e.g. clouds) in either
 *               year stays NaN.
 *      Context: Tested by web/tests/plotVegetationChange.test.js.
 *      Written: 2026-10-14 · Claude Opus 5.5 · requested by Adam */
export function calculateDataChange(startNdvi, endNdvi) {
  // Both grids must be real lists of numbers of the same size.
  if (!isNumberGrid(startNdvi) || !isNumberGrid(endNdvi)) return null;
  if (startNdvi.length !== endNdvi.length) return null;

  const change = new Float32Array(startNdvi.length);
  for (let i = 0; i < change.length; i++) {
    // NaN - anything = NaN, so missing data carries through automatically.
    change[i] = floorAtZero(endNdvi[i]) - floorAtZero(startNdvi[i]);
  }
  return change;
}

/* [AI] Purpose: Treat bare ground and water as "no vegetation".
 *      Does:    number -> 0 if it is at or below 0, otherwise unchanged
 *               (NaN stays NaN because NaN <= 0 is false).
 *      Written: 2026-10-14 · Claude Opus 5.5 · requested by Adam */
function floorAtZero(ndvi) {
  return ndvi <= 0 ? 0 : ndvi;
}

/* [AI] Purpose: Reject inputs that are not a grid of numbers (null, strings,
 *               objects, arrays holding non-numbers).
 *      Does:    value -> true for a typed array (e.g. Float32Array) or a plain
 *               array whose items are all numbers.
 *      Written: 2026-10-14 · Claude Opus 5.5 · requested by Adam */
function isNumberGrid(value) {
  if (ArrayBuffer.isView(value) && !(value instanceof DataView)) return true;
  return Array.isArray(value) && value.every((v) => typeof v === "number");
}
