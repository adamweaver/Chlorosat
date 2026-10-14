/* [AI] Purpose: Code stub for buildLabel (CS 3203 Activity 4-2). Same
 *      signature as the real one in src/lib/map/geocode.js but no logic, so
 *      the tests can be shown failing first.
 *      Does:    place -> just its name (or ""), with no street, city, state
 *               or country added.
 *      Context: Run with SEARCH_IMPL=stub. Tests whose answer is only the
 *               name (or "") pass; the rest fail.
 *      Written: 2026-10-13 · Claude Opus 5.5 · requested by David */
export function buildLabel(p) {
  return p.name || "";
}
