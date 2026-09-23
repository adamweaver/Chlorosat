/* [AI] Purpose: The interactive map everything else is drawn on.
 *      Does:    STUB. Planned: Leaflet map centered on the region's `center`/`zoom`
 *               from manifest.json, a satellite base layer (Esri World Imagery, with
 *               attribution), and children layers (VegetationLayer).
 *      Context: TODO(CS-012, David):
 *               1. `npm install leaflet react-leaflet`, import "leaflet/dist/leaflet.css"
 *               2. Add "use client" at the top of this file
 *               3. Leaflet touches `window`, which doesn't exist during the build, so never
 *                  import this file directly. Load it with
 *                  dynamic(() => import("@/components/MapView"), { ssr: false }).
 *                  That call only works inside a "use client" file. The page also needs state
 *                  (selected method + year), so make a client component (e.g. components/MapApp.js)
 *                  that holds the state + dynamic import, and render <MapApp /> from page.js.
 *               Planned props: { region, children }
 *      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver */
export default function MapView() {
  return null;
}
