"use client";

import styles from "../Globe.module.css";
import { VEG_GRADIENT_CSS, AQUA_GRADIENT_CSS } from "@/lib/map/heatColors";

/* [AI] Purpose: The map key: what the colors of each layer that's turned on
 *      mean. Read-only - turning layers on and off lives in the Layers panel
 *      (LayersControl.js).
 *      Does:    Shows the plants bar (Low / Moderate / High) while that layer
 *      is on and the algae bar (Clear / Bloom, plus the note about faded
 *      filled-in readings) while that one is on. Nothing on = no legend.
 *      Bars use the same color stops the engine draws with (heatColors.js).
 *      Written: 2026-09-24 · Claude Sonnet 5 · requested by David
 *      Ported:  2026-09-30 · Claude Opus 5.5 (for David) · from chlorosat-map-demo app/components/Legend.jsx
 *      Edited:  2026-10-12 · Claude Opus 5.5 · requested by Adam Weaver · comment describes the current legend
 *      Edited:  2026-10-12 · Claude Opus 5.5 · requested by David · read-only key; switches moved to the Layers panel */
export default function Legend({ vegVisible = true, aquaVisible = false }) {
  if (!vegVisible && !aquaVisible) return null;
  return (
    <div className={styles.legendPanel}>
      {vegVisible && (
        <>
          <div className={styles.legendTitle}>PLANTS ON LAND</div>
          <div className={styles.legendBar} style={{ background: VEG_GRADIENT_CSS }} />
          <div className={styles.legendLabels}>
            <span>Low</span>
            {/* Hidden on phones, where the legend is compact. */}
            <span className={styles.legendModerate}>Moderate</span>
            <span>High</span>
          </div>
        </>
      )}
      {vegVisible && aquaVisible && <div className={styles.legendDivider} />}
      {aquaVisible && (
        <>
          <div className={styles.legendTitle}>ALGAE IN WATER</div>
          <div className={styles.legendBar} style={{ background: AQUA_GRADIENT_CSS }} />
          <div className={styles.legendLabels}>
            <span>Clear</span>
            <span>Bloom</span>
          </div>
          {/* Holes in the chosen weeks are filled from the season or year
              around them and drawn faded (chlorosatGlobeEngine.js,
              AQUA_TIER_ALPHA). */}
          <div className={styles.legendNote}>Faded: filled in from nearby months</div>
        </>
      )}
    </div>
  );
}
