"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../Globe.module.css";
import { VEG_GRADIENT_CSS, AQUA_GRADIENT_CSS } from "@/lib/map/heatColors";

/* [AI] Purpose: One place for everything about what the map draws. The
 *      controls used to be in four places (an eye icon in the opacity pill,
 *      a switch in the legend, a hover-only base map pill, and one opacity
 *      slider that quietly dimmed both layers); David asked for them to be
 *      friendlier (2026-10-12).
 *      Does:    A "Layers" button in the bottom-right corner (where the base
 *      map pill was) opens a panel with:
 *        - Base map: two picture tiles, Satellite and Map.
 *        - Plants on land / Algae in water: an on/off switch each, a small
 *          color bar, a one-line explanation (the (i) button), and the
 *          layer's own opacity slider while it's on.
 *      Clicking outside the panel, pressing Escape or the X closes it. On
 *      phones the same panel slides up from the bottom (Globe.module.css).
 *      Context: Replaces BaseMapToggle.js and OpacitySlider.js in MapApp.js
 *      (the files are kept for now). Layer names are plain words; the
 *      technical names (NDVI, chlorophyll-a) are in the (i) text and About.
 *      Written: 2026-10-12 · Claude Opus 5.5 · requested by David */

const BASEMAPS = [
  { id: "satellite", label: "Satellite", thumb: "linear-gradient(135deg, #3b4a2e 0%, #1e2b1a 60%, #0d140b 100%)" },
  { id: "map", label: "Map", thumb: "linear-gradient(135deg, #d8d8d0 0%, #b9c9b0 100%)" },
];

// One layer's row: switch, name, (i), color bar, and opacity while on.
function LayerRow({ id, name, info, gradient, low, high, visible, onToggle, opacity, onOpacity }) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div className={styles.layerRow}>
      <div className={styles.layerHead}>
        <button
          type="button"
          role="switch"
          aria-checked={visible}
          aria-label={name}
          className={styles.layerSwitchButton}
          onClick={onToggle}
        >
          <span className={`${styles.aquaSwitch} ${visible ? styles.aquaSwitchOn : ""}`} />
          <span className={styles.layerName}>{name}</span>
        </button>
        <button
          type="button"
          className={styles.layerInfoButton}
          aria-expanded={showInfo}
          aria-controls={id + "-info"}
          aria-label={"About " + name}
          onClick={() => setShowInfo((v) => !v)}
        >
          i
        </button>
      </div>
      {showInfo && (
        <p id={id + "-info"} className={styles.layerInfo}>
          {info}
        </p>
      )}
      <div className={`${styles.layerBody} ${visible ? "" : styles.layerBodyOff}`}>
        <div className={styles.layerBar} style={{ background: gradient }} />
        <div className={styles.layerBarLabels}>
          <span>{low}</span>
          <span>{high}</span>
        </div>
        {visible && (
          <label className={styles.layerOpacity}>
            <span>Opacity</span>
            <input
              type="range"
              className={styles.opacitySlider}
              min={0}
              max={1}
              step={0.05}
              value={opacity}
              aria-label={name + " opacity"}
              onChange={(e) => onOpacity(Number(e.target.value))}
            />
            <span className={styles.layerOpacityValue}>{Math.round(opacity * 100)}%</span>
          </label>
        )}
      </div>
    </div>
  );
}

export default function LayersControl({
  basemap, onBasemap,
  vegVisible, onToggleVeg, vegOpacity, onVegOpacity,
  aquaVisible, onToggleAqua, aquaOpacity, onAquaOpacity,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  // Close on a click/tap outside, or Escape. Capture phase, because the map
  // canvas handles its own pointer events.
  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={styles.layersRoot}>
      {open && (
        <div className={styles.layersPanel} role="dialog" aria-label="Map layers">
          <div className={styles.layersHeader}>
            <span>Map layers</span>
            <button type="button" className={styles.layersClose} aria-label="Close" onClick={() => setOpen(false)}>
              ×
            </button>
          </div>

          <div className={styles.layersSectionTitle}>Base map</div>
          <div className={styles.baseTiles}>
            {BASEMAPS.map((b) => (
              <button
                key={b.id}
                type="button"
                aria-pressed={basemap === b.id}
                className={`${styles.baseTile} ${basemap === b.id ? styles.baseTileActive : ""}`}
                onClick={() => onBasemap(b.id)}
              >
                <span className={styles.baseTileThumb} style={{ background: b.thumb }} />
                {b.label}
              </button>
            ))}
          </div>

          <div className={styles.layersSectionTitle}>Data</div>
          <LayerRow
            id="layer-veg"
            name="Plants on land"
            info="How green and healthy plants are, from NASA's MODIS satellite (NDVI), averaged over mid-August of the chosen year."
            gradient={VEG_GRADIENT_CSS}
            low="Low"
            high="High"
            visible={vegVisible}
            onToggle={onToggleVeg}
            opacity={vegOpacity}
            onOpacity={onVegOpacity}
          />
          <LayerRow
            id="layer-aqua"
            name="Algae in water"
            info="Tiny algae in oceans and large lakes, measured as chlorophyll from NASA and ESA satellites over the same weeks. Faded areas are filled in from nearby months."
            gradient={AQUA_GRADIENT_CSS}
            low="Clear"
            high="Bloom"
            visible={aquaVisible}
            onToggle={onToggleAqua}
            opacity={aquaOpacity}
            onOpacity={onAquaOpacity}
          />
        </div>
      )}
      <button
        type="button"
        className={`${styles.layersButton} ${open ? styles.layersButtonOpen : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3l9 5-9 5-9-5 9-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M3 13l9 5 9-5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        Layers
      </button>
    </div>
  );
}
