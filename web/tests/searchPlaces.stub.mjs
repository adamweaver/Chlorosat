/* [AI] Purpose: Code stub for searchPlaces (CS 3203 Activity 4-2, Chapter 9
 *      equivalence partitions). It has the same signature as the real
 *      function in src/lib/map/geocode.js but no logic, so the unit tests in
 *      searchPlaces.test.mjs can be shown failing first, then passing
 *      against the real implementation.
 *      Does:    (text, near) -> Promise of [] for every input; never calls Photon.
 *      Context: Run with SEARCH_IMPL=stub (see the test file). With this stub,
 *               the "invalid" partition tests pass (they expect []) and the
 *               "valid", "boundary" and "edge" tests that expect results fail.
 *      Written: 2026-10-12 · Claude Opus 5.5 · requested by David */
export async function searchPlaces(text, near = null) {
  return [];
}

export function minSearchLength(text) {
  return 3;
}
