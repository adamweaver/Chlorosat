/* Vegetation change (PlotVegetationChange, CS-061; the view itself is CS-023):
 *   selectYearRange(start, end) -> which two years to compare
 *   calculateDataChange(startNdvi, endNdvi) -> per-pixel change
 *   plotDataChange(change) -> colored pixels for a future map layer
 * Tests: tests/plotVegetationChange.test.js, tests/selectYearRange.test.mjs,
 * tests/plotDataChange.test.mjs. Nothing on the map uses this file yet. */
import { NDVI_YEARS, selectYear } from "./plotGivenYear.js";

/* [AI] Purpose: Check the two years a user picks to compare, before any
 *               tiles are fetched.
 *      Does:    (startYear, endYear, years = NDVI_YEARS) -> { start, end } as
 *               4-digit text ("2019", "2024") when both are offered years and
 *               start is earlier than end; otherwise null (never throws).
 *               Each year is checked with selectYear (plotGivenYear.js), so
 *               the year slider and the comparison accept the same years.
 *      Context: Same year twice is null: there is nothing to compare.
 *      Written: 2026-10-30 · Claude Opus 5.5 · requested by Adam Weaver */
export function selectYearRange(startYear, endYear, years = NDVI_YEARS) {
  const start = selectYear(startYear, years);
  const end = selectYear(endYear, years);
  if (start === null || end === null) return null;
  if (Number(start) >= Number(end)) return null;
  return { start, end };
}

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

// How much NDVI has to move to count as real change, and the colors for it.
// Same keys, threshold and colors as the pipeline's changeClasses
// (pipeline/src/chlorosat/methods.py), so both would draw change alike.
export const CHANGE_THRESHOLD = 0.1;
export const CHANGE_CLASSES = {
  lost: { color: [140, 81, 10], label: "Lost greenness" },    // #8c510a
  stable: { color: null, label: "About the same" },          // not drawn
  gained: { color: [1, 102, 94], label: "Gained greenness" }, // #01665e
};

/* [AI] Purpose: First step of drawing the change view: turn change numbers
 *               into colored pixels.
 *      Does:    change (a grid from calculateDataChange) -> Uint8ClampedArray
 *               with 4 numbers per pixel (red, green, blue, alpha), the
 *               format a canvas or map image layer takes:
 *                 change below -0.1   -> brown "lost"   (alpha 255)
 *                 change +0.1 or more -> teal "gained"  (alpha 255)
 *                 anything between, or NaN (no data) -> transparent.
 *               Returns null if `change` isn't a grid of numbers.
 *      Context: Not on the map yet (CS-023). A legend, opacity and the tile
 *               layout are the next steps. Values come from Float32Array
 *               grids, so a change of exactly ±0.1 can land a hair either side.
 *      Written: 2026-10-30 · Claude Opus 5.5 · requested by Adam Weaver */
export function plotDataChange(change, threshold = CHANGE_THRESHOLD) {
  if (!isNumberGrid(change)) return null;
  const pixels = new Uint8ClampedArray(change.length * 4); // all transparent to start
  for (let i = 0; i < change.length; i++) {
    const key = changeClass(change[i], threshold);
    const color = key ? CHANGE_CLASSES[key].color : null;
    if (!color) continue;
    pixels[i * 4] = color[0];
    pixels[i * 4 + 1] = color[1];
    pixels[i * 4 + 2] = color[2];
    pixels[i * 4 + 3] = 255;
  }
  return pixels;
}

/* [AI] Purpose: Name the change class for one pixel (also handy for a legend
 *               or for counting gained/lost pixels later).
 *      Does:    (change, threshold) -> "lost", "gained", "stable", or null
 *               for no data (NaN or not a number).
 *      Context: Used by plotDataChange. Edges match the pipeline's
 *               render.colorize for exact values; see the note in the code.
 *      Written: 2026-10-30 · Claude Opus 5.5 · requested by Adam Weaver */
export function changeClass(change, threshold = CHANGE_THRESHOLD) {
  if (typeof change !== "number" || Number.isNaN(change)) return null;
  // Same edges as the pipeline's colorize (min <= value < max): -0.1 itself is
  // "stable", +0.1 itself is "gained". Float32Array results right at ±0.1 are
  // rounded a hair either way, so they can land in the neighboring class.
  if (change < -threshold) return "lost";
  if (change >= threshold) return "gained";
  return "stable";
}
