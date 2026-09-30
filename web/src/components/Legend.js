"use client";

import styles from "@/css/MapApp.module.css";
import { HEAT_RED, HEAT_YELLOW, HEAT_GREEN, HEAT_DARK_GREEN } from "@/lib/heatColors";

/* [AI] Purpose: Legend now matches the standalone chlorosat-globe's real
 *      continuous NDVI heat gradient, since this app renders the same
 *      globe engine (chlorosatGlobeEngine.js) rather than the old Leaflet
 *      2D map with discrete land-cover classes from methods.py. Pulls the
 *      gradient stops from the SAME heatColors.js constants the engine
 *      actually recolors tiles with, so this can't drift out of sync with
 *      what's really rendered.
 *      Update: made the panel a bit larger and reworded the labels to read
 *      more like a professional map legend - "None/Some/Dense" and "hidden"
 *      were a little casual for what's otherwise a data-viz-style overlay.
 *      Written: 2026-09-24 · Claude Sonnet 5 · requested by David
 *      Ported:  2026-09-30 · Claude Opus 5.5 (for David) · from chlorosat-map-demo app/components/Legend.jsx */
const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
// Stops mirror HEAT_LUT's breakpoints in chlorosatGlobeEngine.js: red->yellow
// (0-35%), yellow->green (35-55%), green->dark green (55-100%).
const GRADIENT = `linear-gradient(to right, ${rgb(HEAT_RED)} 0%, ${rgb(HEAT_YELLOW)} 35%, ${rgb(HEAT_GREEN)} 55%, ${rgb(HEAT_DARK_GREEN)} 100%)`;

export default function Legend() {
  return (
    <div className={styles.legendPanel}>
      <div className={styles.legendTitle}>VEGETATION (NDVI)</div>
      <div className={styles.legendBar} style={{ background: GRADIENT }} />
      <div className={styles.legendLabels}>
        <span>Low</span>
        {/* Hidden on phones, where the legend is compact. */}
        <span className={styles.legendModerate}>Moderate</span>
        <span>High</span>
      </div>
      <div className={styles.legendDivider} />
      <div className={styles.legendRow}>
        <span className={styles.legendSwatch} />
        Water / No Data
      </div>
    </div>
  );
}
