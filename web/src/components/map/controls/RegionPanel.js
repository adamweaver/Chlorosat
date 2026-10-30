"use client";

import { useState } from "react";
import styles from "../Globe.module.css";

/* [AI] Purpose: The control for outlining a region on the globe.
 *      Does:    A small polygon icon. While drawing, the same button becomes
 *               an X, and Clear / Finish sit beside it. The point count shows
 *               only after a point exists. This file does not listen for map
 *               clicks or draw a shape; that is the next step.
 *      Context: Sits above the legend in MapApp. buildBoundedRegions() in
 *               src/lib/region.js is the check the drawing step will call.
 *      Written: 2026-10-29 · Composer · requested by Lucas
 *      Edited:  2026-10-29 · Composer · requested by Lucas · icon button, hide the empty point count */
export default function RegionPanel() {
  const [drawing, setDrawing] = useState(false);
  const pointCount = 0;

  return (
    <div className={`${styles.regionPanel} ${drawing ? styles.regionPanelOpen : ""}`}>
      <button
        type="button"
        className={styles.regionToggle}
        aria-expanded={drawing}
        aria-controls="region-draw-panel"
        aria-label={drawing ? "Cancel drawing" : "Draw region"}
        title={
          drawing
            ? "Cancel drawing"
            : "Click the map. Three or more points outline a region."
        }
        onClick={() => setDrawing((open) => !open)}
      >
        {drawing ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7 5 L18 8 L16 18 L5 15 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <circle cx="7" cy="5" r="1.5" fill="currentColor" />
            <circle cx="18" cy="8" r="1.5" fill="currentColor" />
            <circle cx="16" cy="18" r="1.5" fill="currentColor" />
            <circle cx="5" cy="15" r="1.5" fill="currentColor" />
          </svg>
        )}
      </button>
      {drawing && (
        <div id="region-draw-panel" className={styles.regionDraw}>
          {pointCount > 0 && (
            <span className={styles.regionCount}>{pointCount} points</span>
          )}
          <button type="button" className={styles.regionButton} disabled>
            Clear
          </button>
          <button type="button" className={styles.regionButton} disabled>
            Finish
          </button>
        </div>
      )}
    </div>
  );
}
