"use client";

import { useEffect, useState } from 'react';
import styles from "@/css/MapApp.module.css";

/* [AI] Purpose: The recenter/locate/zoom button stack from the mockup.
 *      Context: no longer uses react-leaflet's useMap() - now driven
 *      through the `engine` prop (chlorosatGlobeEngine.js's API) since the
 *      map is the real MapLibre globe, not Leaflet.
 *      Update: the old filter button was a placeholder with no filtering
 *      logic behind it. David pointed out that right-click-dragging the
 *      globe (MapLibre's default rotate/tilt gesture) can spin it into a
 *      disorienting angle, and asked for a recenter button in that spot
 *      instead - swapped for a counter-clockwise reset-arrow icon calling
 *      the engine's recenter(), which flies back to the starting
 *      center/zoom and resets bearing/pitch to 0.
 *      Does:    Recenter/locate/zoom call straight through to the engine's
 *      own recenter()/locate()/zoomIn()/zoomOut(), which wrap the MapLibre
 *      map (and, for locate, the browser geolocation API) respectively.
 *      Update: David asked for this stack to sit right above the basemap
 *      toggle instead of under the search bar. `pushedUp` (from MapApp,
 *      driven by BaseMapToggle's own hover) shifts it further up while
 *      that toggle is popped open, so the floating basemap option doesn't
 *      overlap it.
 *      Update: when "Find my location" can't get a location (most often a
 *      phone opening the dev server over plain http://, where browsers block
 *      location entirely), a short message now explains why instead of the
 *      button silently doing nothing. It clears itself after a few seconds,
 *      or on tap.
 *      Written: 2026-09-24 · Claude Sonnet 5 · requested by David
 *      Ported:  2026-09-30 · Claude Opus 5.5 (for David) · from chlorosat-map-demo app/components/SideControls.jsx */
export default function SideControls({ engine, pushedUp }) {
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 7000);
    return () => clearTimeout(timer);
  }, [notice]);

  return (
    <>
    <div className={`${styles.sideStack} ${pushedUp ? styles.sideStackPushed : ''}`}>
      <div
        className={styles.iconButton}
        title="Recenter view"
        role="button"
        onClick={() => engine && engine.recenter()}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <polyline points="1 4 1 10 7 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div
        className={styles.iconButton}
        title="Find my location"
        role="button"
        onClick={() => {
          setNotice(null);
          if (engine) engine.locate(setNotice);
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <div className={styles.zoomGroup}>
        <button className={styles.zoomButton} onClick={() => engine && engine.zoomIn()} aria-label="Zoom in">
          +
        </button>
        <div className={styles.zoomDivider} />
        <button className={styles.zoomButton} onClick={() => engine && engine.zoomOut()} aria-label="Zoom out">
          −
        </button>
      </div>
    </div>
    {notice && (
      <div className={styles.mapNotice} role="status" onClick={() => setNotice(null)}>
        {notice}
      </div>
    )}
    </>
  );
}
