/* [AI] Purpose: Decide which NASA NDVI layer to plot for a year picked on
 *      the year slider (PlotGivenYear). Before this, the globe engine's
 *      setYear() built the layer date as `year + '-08-13'` with no check, so
 *      a bad year (e.g. "abc" or 2031) produced a date NASA has no tiles for
 *      and the vegetation layer went blank.
 *      Does:    year (string or whole number) -> "YYYY-08-13" for a year the
 *               app offers (NDVI_YEARS, 2019-2026), otherwise null.
 *      Context: Mid-August composite, one per year (docs/PRINCIPLES.md).
 *               Used by setYear() in chlorosatGlobeEngine.js. MapApp.js has
 *               its own copy of the year list (YEARS); keep the two in sync.
 *               Tests: tests/plotGivenYear.test.mjs.
 *      Written: 2026-10-12 · Claude Opus 5.5 · requested by David */
export const NDVI_YEARS = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];
const NDVI_DAY = '08-13';

export function plotGivenYear(year) {
  if (typeof year !== 'string' && typeof year !== 'number') return null;
  const text = String(year);
  if (!/^\d{4}$/.test(text) || !NDVI_YEARS.includes(text)) return null;
  return `${text}-${NDVI_DAY}`;
}
