import Icon from "@/components/Icon";
import styles from "@/css/BaseMapToggle.module.css";

const BASE_MAPS = [
  { id: "satellite", label: "Satellite", icon: "satellite" },
  { id: "map", label: "Map", icon: "map" },
];

/* [AI] Purpose: Switch the base map between satellite imagery and a street map.
 *      Does:    Separate glass buttons stacked bottom-right, one per base map (icon + label).
 *               Calls onChange(baseMapId).
 *      Context: Controlled by MapApp. MapView doesn't swap tiles on it yet (satellite tiles = CS-025, David).
 *      Written: 2026-09-23 · Claude Opus 5.5 · requested by Lucas
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · moved out of MapOverlay.js; controlled by MapApp; CSS module */
export default function BaseMapToggle({ value, onChange }) {
  return (
    <div className={styles.group} role="group" aria-label="Base map">
      {BASE_MAPS.map((base) => (
        <button
          key={base.id}
          type="button"
          className={`glass ${styles.tile}`}
          aria-pressed={value === base.id}
          onClick={() => onChange(base.id)}
        >
          <Icon name={base.icon} />
          <span>{base.label}</span>
        </button>
      ))}
    </div>
  );
}
