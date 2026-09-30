"use client";

import styles from "@/css/MapApp.module.css";
import useHoverExpand from "@/lib/useHoverExpand";

/* [AI] Purpose: Year picker matching the mockup's floating top-left slider
 *      (2019-2025 shown, even though the manifest only has real data for
 *      one year so far). Does: a discrete range input over the fixed
 *      display range, snapping to the nearest year that actually exists in
 *      manifest.json rather than showing blank years as data grows the
 *      slider works without code changes - years with no data render dim
 *      and unclickable-looking but the slider still lands on them (parent
 *      falls back to the nearest available year for the actual overlay).
 *      Was a permanently-open panel; David asked for it to collapse down
 *      to just the current year and pop the slider open on hover (same
 *      idea as BaseMapToggle), with the header always reading "Year 2025"
 *      (not just the bare number) whether collapsed or expanded. Expansion
 *      grows straight down from a top-anchored box, so - unlike
 *      BaseMapToggle's upward popup - this doesn't need the invisible
 *      hover-hitbox trick: the panel is simply taller while expanded, all
 *      still within its own bounds. `onHoverChange` reports the hover
 *      state up to MapApp so it can push the opacity panel (which sits
 *      right below this one) further down out of the way while this is
 *      expanded, rather than letting the two overlap.
 *      Update (mobile): open/close now comes from useHoverExpand, so it
 *      still opens on hover with a mouse but opens on tap (and closes on a
 *      tap elsewhere) on a phone, which has no hover.
 *      Written: 2026-09-24 · Claude Sonnet 5 · requested by David
 *      Ported:  2026-09-30 · Claude Opus 5.5 (for David) · from chlorosat-map-demo app/components/YearSlider.jsx */
/* [AI] inMenu: David asked for Year and opacity to live in a menu on phones
 *      (the three-bar button in the search bar, like Google Maps' phone
 *      layout). MapApp renders a second copy of this control inside that
 *      menu with inMenu set: always open, no hover/tap toggling, and laid out
 *      as a menu section instead of a floating panel. The floating copy is
 *      hidden on phones by CSS (MapApp.module.css phone section).
 *      Written: 2026-09-29 · Claude Opus 5.5 · requested by David */
export default function YearSelector({ years, year, availableYears, onChange, onHoverChange, inMenu = false }) {
  const hover = useHoverExpand(inMenu ? undefined : onHoverChange);
  const expanded = inMenu || hover.expanded;
  const { rootRef, rootProps, toggleFromTap } = inMenu ? { rootRef: undefined, rootProps: {}, toggleFromTap: undefined } : hover;
  const index = years.indexOf(year);

  return (
    <div
      ref={rootRef}
      className={inMenu ? `${styles.menuSection} ${styles.yearPanelExpanded}` : `${styles.yearPanel} ${expanded ? styles.yearPanelExpanded : ''}`}
      {...rootProps}
    >
      <div className={styles.yearPanelHeader} onClick={toggleFromTap}>
        <span className={styles.yearPanelHeaderLabel}>Year</span>
        <span className={styles.yearPanelHeaderValue}>{year}</span>
        <svg className={styles.yearPanelChevron} width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className={styles.yearPanelBody}>
        <input
          type="range"
          className={styles.yearSlider}
          min={0}
          max={years.length - 1}
          step={1}
          value={index === -1 ? years.length - 1 : index}
          onChange={(e) => onChange(years[Number(e.target.value)])}
        />
        <div className={styles.yearLabels}>
          {years.map((y) => {
            const hasData = availableYears.includes(y);
            const active = y === year;
            return (
              <span
                key={y}
                className={
                  active
                    ? styles.yearLabelActive
                    : hasData
                      ? undefined
                      : styles.yearLabelDisabled
                }
              >
                {y}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
