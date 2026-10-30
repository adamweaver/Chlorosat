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
 *               Tests: tests/plotGivenYear.test.mjs, tests/selectYear.test.mjs,
 *               tests/plotYearData.test.mjs.
 *      Written: 2026-10-12 · Claude Opus 5.5 · requested by David */
export const NDVI_YEARS = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];
// First and last offered years ("2019" and "2026"), read from the list so
// they always match it.
export const MIN_YEAR = NDVI_YEARS[0];
export const MAX_YEAR = NDVI_YEARS[NDVI_YEARS.length - 1];
const NDVI_DAY = '08-13';

// Year validation, kept apart from plotting.
// Valid year: text ("2024") or a whole number (2024) that is in `years`
//   -> that year as 4-digit text ("2024").
// Invalid year: out of range, wrong format or wrong type -> null. Never throws.
// `years` defaults to NDVI_YEARS; tests pass a list with a gap in it to check
// a year that has no data.
export function selectYear(year, years = NDVI_YEARS) {
  if (typeof year !== 'string' && typeof year !== 'number') return null;
  const text = String(year);
  if (!/^\d{4}$/.test(text) || !years.includes(text)) return null;
  return text;
}

// Plotting step: the NASA layer date to draw for a year.
// Valid year: an offered year as text ("2024") -> "2024-08-13".
// Anything else (null from selectYear, a number, a year with no layer) -> null.
export function plotYearData(selectedYear) {
  if (!NDVI_YEARS.includes(selectedYear)) return null;
  return `${selectedYear}-${NDVI_DAY}`;
}

// PlotGivenYear: check the year, then pick its layer.
// Valid year -> "YYYY-08-13". Invalid year -> null.
export function plotGivenYear(year) {
  return plotYearData(selectYear(year));
}
