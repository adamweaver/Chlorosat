export const metadata = { title: "Map · Chlorosat" };

/* [AI] Purpose: The map page (/map/).
 *      Does:    Nothing visible itself. The globe is drawn by <PersistentMap />
 *               in the root layout, which shows it on this page and keeps it
 *               loaded (hidden) on the others, so coming back is instant.
 *               This file still has to exist so /map/ is a real page.
 *      Context: Stays a server component. Lived at / until CS-038 (D11).
 *      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · replaced placeholder with <MapApp />
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · CSS module
 *      Edited:  2026-09-24 · Claude Opus 5.5 (for Adam) · moved from / to /map/ (CS-038)
 *      Edited:  2026-09-30 · Claude Opus 5.5 (for David) · globe map moved to <PersistentMap /> (layout.js) */
export default function MapPage() {
  return null;
}
