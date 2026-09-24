import styles from "@/css/YearSelector.module.css";

// TODO: YEARS is hard-coded (draft range, WHATS_NEW decision #6). Migrate it to manifest.json
// (region.layers[methodId].years) so the slider only offers years that actually have data.
export const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

/* [AI] Purpose: Let users slide between years.
 *      Does:    Glass card with a range slider (first to last year) and a label under each year.
 *               step="any" lets the thumb glide smoothly; calls onChange(year) with the raw value.
 *      Context: Controlled by MapApp (value + onChange). Round to a whole year wherever a real
 *               file is picked (e.g. VegetationLayer), or snap on release later. CS-022.
 *      Written: 2026-09-23 · Claude Opus 5.5 · requested by Lucas
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · moved here from MapOverlay.js (replaces the
 *               CS-022 stub); controlled by MapApp; CSS module */
export default function YearSelector({ value, onChange }) {
  return (
    <div className={`glass ${styles.card}`}>
      <input
        className="range"
        type="range"
        aria-label="Year"
        min={YEARS[0]}
        max={YEARS[YEARS.length - 1]}
        step="any"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className={styles.ticks} aria-hidden="true">
        {YEARS.map((year) => <span key={year}>{year}</span>)}
      </div>
    </div>
  );
}
