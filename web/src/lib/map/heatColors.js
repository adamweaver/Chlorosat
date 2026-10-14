// [AI] Purpose: The globe's real vegetation heatmap ramp (red -> yellow ->
//      green -> dark green), split into its own zero-dependency file so
//      both the rendering engine (chlorosatGlobeEngine.js) and the Legend
//      component can import just these constants without either one
//      pulling in maplibre-gl - keeps Legend safe to use in any context.
//      Written: 2026-09-24 · Claude Sonnet 5 · requested by David
//      Ported:  2026-09-30 · Claude Opus 5.5 (for David) · from chlorosat-map-demo app/lib/heatColors.js
export const HEAT_RED = [211, 47, 47];
export const HEAT_YELLOW = [255, 214, 0];
export const HEAT_GREEN = [76, 175, 80];
export const HEAT_DARK_GREEN = [23, 82, 27];

// [AI] Purpose: Colors for the aquatic layer (algae in water, measured as
//      chlorophyll-a), kept apart from the land ramp above so the two layers
//      can't be confused: deep indigo (little algae) -> violet -> magenta ->
//      pale pink (a bloom), so more algae is simply brighter. Purple was
//      picked because it appears nowhere else on the map (checked
//      2026-10-12): a green-yellow ramp made Lake Erie look like the green
//      land around it, and a blue-cyan ramp looked like the satellite
//      photo's own water and shallow banks (the Bahamas).
//      Each stop is [position 0-1, [r, g, b]].
//      Used by chlorosatGlobeEngine.js (drawing) and Legend.js (the bar).
//      Written: 2026-10-12 · Claude Opus 5.5 · requested by David
export const AQUA_STOPS = [
  [0, [24, 28, 92]],
  [0.4, [96, 60, 190]],
  [0.7, [205, 80, 200]],
  [1, [255, 205, 238]],
];
// The chlorophyll range the ramp covers, in mg per cubic meter (log scale).
// Clear open ocean is ~0.05; a lake bloom can pass 20.
export const AQUA_MIN_MG = 0.03;
export const AQUA_MAX_MG = 20;

// [AI] The two color bars as CSS gradients, built from the same stops the
//      engine draws with, so the legend and the Layers panel can't drift
//      from what's on the map. Written: 2026-10-12 · Claude Opus 5.5 · requested by David
const cssRgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
// Mirrors HEAT_LUT's breakpoints in chlorosatGlobeEngine.js: red->yellow
// (0-35%), yellow->green (35-55%), green->dark green (55-100%).
export const VEG_GRADIENT_CSS = `linear-gradient(to right, ${cssRgb(HEAT_RED)} 0%, ${cssRgb(HEAT_YELLOW)} 35%, ${cssRgb(HEAT_GREEN)} 55%, ${cssRgb(HEAT_DARK_GREEN)} 100%)`;
export const AQUA_GRADIENT_CSS = `linear-gradient(to right, ${AQUA_STOPS.map(([t, c]) => `${cssRgb(c)} ${t * 100}%`).join(", ")})`;
