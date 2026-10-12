"use client";

import styles from "../Globe.module.css";
import { HEAT_RED, HEAT_YELLOW, HEAT_GREEN, HEAT_DARK_GREEN } from "@/lib/map/heatColors";

/* [AI] Purpose: Explain the vegetation colors: one continuous low-to-high NDVI
 *      gradient (the engine scores vegetation on a continuous scale, not in
 *      classes), plus a "Water / No Data" row for see-through areas.
 *      Does:    Builds the gradient from the SAME heatColors.js constants the
 *      engine recolors tiles with, so the legend can't drift from what's drawn.
 *      Labels use map-legend wording (Low / Moderate / High).
 *      Written: 2026-09-24 · Claude Sonnet 5 · requested by David
 *      Ported:  2026-09-30 · Claude Opus 5.5 (for David) · from chlorosat-map-demo app/components/Legend.jsx
 *      Edited:  2026-10-12 · Claude Opus 5.5 · requested by Adam Weaver · comment describes the current legend */
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
