import { useState } from "react";
import Icon from "@/components/Icon";
import IconButton from "@/components/IconButton";
import styles from "@/css/MethodToggle.module.css";

// TODO: VIEWS is hard-coded. Migrate it to manifest.json (manifest.methods + defaultMethod) so the
// menu always matches the data. The ids must then match manifest method ids ("ndvi", "visible",
// plus the combined view once it's in the data contract; changes D8, needs team OK).
export const DEFAULT_VIEW = "recommended";
const VIEWS = [
  { id: "recommended", label: "Recommended", note: "Infrared and visible light analyzed together." },
  { id: "infrared", label: "Infrared only", note: "Less accurate on its own.", warn: true },
  { id: "visible", label: "Visible light only", note: "Less accurate on its own.", warn: true },
];

/* [AI] Purpose: Tuck the single-source views away so the recommended view stays the everyday default.
 *      Does:    "View settings" icon button (amber dot when not on the default) that opens a menu of
 *               radio options, each with a subtitle (warnings in amber). Calls onChange(viewId).
 *      Context: Controlled by MapApp. Escape closes the menu. Replaces the CS-022 stub (agreed with Kevin).
 *      Written: 2026-09-23 · Claude Opus 5.5 · requested by Lucas
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · moved here from MapOverlay.js; controlled by MapApp; CSS module */
export default function MethodToggle({ value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.anchor} onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      <IconButton
        icon="sliders"
        label="View settings"
        dot={value !== DEFAULT_VIEW}
        aria-expanded={open}
        aria-controls="view-menu"
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div id="view-menu" className={`glass ${styles.menu}`}>
          <fieldset>
            <legend>Vegetation data</legend>
            {VIEWS.map((view) => (
              <label key={view.id} className={styles.option}>
                <input
                  type="radio"
                  name="view"
                  value={view.id}
                  checked={value === view.id}
                  onChange={() => onChange(view.id)}
                />
                <strong>{view.label}</strong>
                <small className={view.warn ? styles.warn : undefined}>{view.note}</small>
              </label>
            ))}
          </fieldset>
        </div>
      )}
    </div>
  );
}

/* [AI] Purpose: Keep users from forgetting they switched to a less accurate single-source view.
 *      Does:    Amber notice ("Showing infrared only, which is less accurate") with a Reset button.
 *               Renders nothing on the default view.
 *      Written: 2026-09-23 · Claude Opus 5.5 · requested by Lucas
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · moved here from MapOverlay.js; CSS module */
export function MethodNotice({ value, onReset }) {
  if (value === DEFAULT_VIEW) return null;
  const view = VIEWS.find((v) => v.id === value);
  return (
    <div className={`glass ${styles.notice}`} role="status">
      <Icon name="alert" />
      <p>Showing {view.label.toLowerCase()}, which is less accurate.</p>
      <button type="button" onClick={onReset}>Reset</button>
    </div>
  );
}
