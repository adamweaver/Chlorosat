import MapApp from "@/components/MapApp";
import styles from "@/css/page.module.css";

export const metadata = { title: "Map · Chlorosat" };

/* [AI] Purpose: The map page (/map/): the vegetation map and its controls.
 *      Does:    Renders <MapApp /> in a <main> that fills the space below the header.
 *      Context: Stays a server component (no "use client"). Controls = CS-022, compare = CS-023.
 *               Lived at / until CS-038 (D11) made the landing page the home page.
 *      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · replaced placeholder with <MapApp />
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · CSS module
 *      Edited:  2026-09-24 · Claude Opus 5.5 (for Adam) · moved from / to /map/ (CS-038) */
export default function MapPage() {
  return (
    <main className={styles.mapPage}>
      <MapApp />
    </main>
  );
}
