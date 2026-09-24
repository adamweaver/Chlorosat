// Helpers that load pipeline output from /data (web/public/data/ in the repo).
// All shapes are defined in docs/ARCHITECTURE.md#data-contract.
// Browsers cache these files, and nginx serves them with no computing (decision D1).

/* [AI] Purpose: Find out which regions, methods, and years exist, and how to color them.
 *      Does:    fetch("/data/manifest.json") -> parsed JSON. Throws if the request fails.
 *      Context: CS-012. Callers catch the error and show a message (see MapApp.js).
 *      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · implemented the fetch */
export async function loadManifest() {
  const res = await fetch("/data/manifest.json");
  if (!res.ok) throw new Error(`manifest.json failed to load (${res.status})`);
  return res.json();
}

/* [AI] Purpose: Get the numbers for one region + method + year.
 *      Does:    STUB. Planned: fetch(`/data/${regionId}/${methodId}/${year}.json`) -> JSON.
 *      Context: TODO(CS-022, Kevin).
 *      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver */
export async function loadStats(regionId, methodId, year) {
  throw new Error(`TODO(CS-022): loadStats(${regionId}, ${methodId}, ${year}) not implemented`);
}

/* [AI] Purpose: Get change numbers between two years for one method.
 *      Does:    STUB. Planned: fetch(`/data/${regionId}/${methodId}/change/${from}_${to}.json`) -> JSON.
 *      Context: TODO(CS-023, Adam).
 *      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver */
export async function loadChange(regionId, methodId, from, to) {
  throw new Error(
    `TODO(CS-023): loadChange(${regionId}, ${methodId}, ${from}, ${to}) not implemented`,
  );
}
