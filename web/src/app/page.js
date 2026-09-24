
import MapApp from "@/components/MapApp";

/* [AI] Purpose: Main page: the vegetation map and its controls.
 *      Does:    Planned layout (inside a client component, e.g. <MapApp />,
 *               that holds the selected method + year and the loaded data):
 *                 <MapView>  (loaded client-only; see components/MapView.js)
 *                   <VegetationLayer> (a year, or a change map in compare mode)
 *                 side panel: <MethodToggle> <YearSelector> <Legend> <StatsPanel>
 *      Context: Map = CS-012 (S2), controls = CS-022 (S3), compare = CS-023 (S3).
 *               This file stays a server component (no "use client") and just renders <MapApp />.
 *      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver 
 *      Edited: 2026-09-23 by David Lindesmith 
 */

export default function Home() {
  return (
    <main style={{ padding: "1rem" }}>
      <h1>Vegetation map</h1>
      <MapApp />
    </main>
  );
}
