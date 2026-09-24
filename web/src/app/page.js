import MapApp from "@/components/MapApp";
import styles from "@/css/page.module.css";

/* [AI] Purpose: Main page: the vegetation map and its controls.
 *      Does:    Renders <MapApp /> in a <main> that fills the space below the header.
 *      Context: Stays a server component (no "use client"). Controls = CS-022, compare = CS-023.
 *      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · replaced placeholder with <MapApp />
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · CSS module */
export default function Home() {
  return (
    <main className={styles.mapPage}>
      <MapApp />
    </main>
  );
}
