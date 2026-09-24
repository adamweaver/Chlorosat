import styles from "@/css/Legend.module.css";

/* [AI] Purpose: A map pin drawn in a given color, with + or - inside (so color isn't the only clue).
 *      Does:    kind "gained" -> plus sign, anything else -> minus sign. Same shape the map markers can use later.
 *      Written: 2026-09-23 · Claude Opus 5.5 · requested by Lucas
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · moved here from MapOverlay.js */
export function Pin({ color, kind }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 15 4 10a8 8 0 0 1 16 0" fill={color} stroke="#fff" strokeWidth="1.5" />
      <path d={kind === "gained" ? "M9 10h6M12 7v6" : "M9 10h6"} stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* [AI] Purpose: Explain what each map color and pin means, in plain words (PRINCIPLES #1).
 *      Does:    "Legend" rows (swatch + label) from method.classes, then "Change hotspots"
 *               rows (pin + label) for the gained/lost entries in method.changeClasses.
 *      Context: Colors/labels come from manifest.json, never hard-coded, so the legend always matches
 *               the PNGs. Hotspot pins aren't in the data contract yet (needs team OK).
 *               Replaces the CS-022 stub (agreed with Kevin).
 *      Written: 2026-09-23 · Claude Opus 5.5 · requested by Lucas
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · moved here from MapOverlay.js; CSS module */
export default function Legend({ method }) {
  const hotspots = method.changeClasses.filter((c) => c.key !== "stable");
  return (
    <section className={`glass ${styles.legend}`} aria-label="Legend">
      <h2>Legend</h2>
      <ul>
        {method.classes.map((c) => (
          <li key={c.key}>
            <span className={styles.swatch} style={{ background: c.color }} />
            {c.label}
          </li>
        ))}
      </ul>
      <h2>Change hotspots</h2>
      <ul>
        {hotspots.map((c) => (
          <li key={c.key}>
            <Pin color={c.color} kind={c.key} />
            {c.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
