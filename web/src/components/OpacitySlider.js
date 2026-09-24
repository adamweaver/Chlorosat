import { useState } from "react";
import Icon from "@/components/Icon";
import styles from "@/css/OpacitySlider.module.css";

/* [AI] Purpose: Let users change how see-through the vegetation colors are, without confusing it with the base map.
 *      Does:    Glass card with a "Vegetation layer opacity · 70%" button that expands into a slider.
 *               Calls onChange(percent 0-100).
 *      Context: Controlled by MapApp; only open/closed is local. VegetationLayer uses the value (CS-035).
 *      Written: 2026-09-23 · Claude Opus 5.5 · requested by Lucas
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · moved out of MapOverlay.js; controlled by MapApp; CSS module */
export default function OpacitySlider({ value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`glass ${styles.card}`}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="opacity-panel"
        onClick={() => setOpen(!open)}
      >
        <Icon name="contrast" />
        <span className={styles.grow}>Vegetation layer opacity</span>
        <span className={styles.value}>{Math.round(value)}%</span>
        <Icon name="chevron" />
      </button>
      {open && (
        <div id="opacity-panel" className={styles.panel}>
          <input
            className="range"
            type="range"
            aria-label="Vegetation layer opacity"
            min={0}
            max={100}
            step="any"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
      )}
    </div>
  );
}
