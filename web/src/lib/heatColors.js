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
