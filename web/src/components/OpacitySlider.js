"use client";

import styles from "@/css/MapApp.module.css";
import useHoverExpand from "@/lib/useHoverExpand";

/* [AI] Purpose: Collapsible opacity control below the year slider.
 *      Context: added the eye icon (show/hide the vegetation layer
 *      entirely, independent of the opacity value) to match the standalone
 *      chlorosat-globe's ui.js, now that this app drives the same real
 *      globe engine and has an equivalent setVegVisible() to call.
 *      Update: David asked for this to collapse/expand on hover the same
 *      way YearSelector does, instead of staying a permanently-full-width row
 *      that only opened the slider on click. The eye icon stays
 *      independently clickable in both states - it toggles visibility, not
 *      expand/collapse, which is now driven purely by hovering the panel.
 *      `pushedDown` (from MapApp, driven by the Year panel's own hover) is
 *      an unrelated dimension and still composes fine alongside this.
 *      Update (mobile): open/close now comes from useHoverExpand - hover
 *      with a mouse, tap the row on a phone. The eye icon stops its click
 *      from bubbling, so tapping it only toggles visibility.
 *      Written: 2026-09-24 · Claude Sonnet 5 · requested by David
 *      Ported:  2026-09-30 · Claude Opus 5.5 (for David) · from chlorosat-map-demo app/components/OpacityControl.jsx */
/* [AI] inMenu: David asked for Year and opacity to live in a menu on phones
 *      (the three-bar button in the search bar, like Google Maps' phone
 *      layout). MapApp renders a second copy of this control inside that
 *      menu with inMenu set: always open, no hover/tap toggling, and laid out
 *      as a menu section instead of a floating panel. The floating copy is
 *      hidden on phones by CSS (MapApp.module.css phone section).
 *      Written: 2026-09-29 · Claude Opus 5.5 · requested by David */
export default function OpacitySlider({ opacity, onChange, visible, onToggleVisible, pushedDown, inMenu = false }) {
  const hover = useHoverExpand();
  const expanded = inMenu || hover.expanded;
  const { rootRef, rootProps, toggleFromTap } = inMenu ? { rootRef: undefined, rootProps: {}, toggleFromTap: undefined } : hover;

  return (
    <div
      ref={rootRef}
      className={inMenu ? `${styles.menuSection} ${styles.opacityPanelExpanded}` : `${styles.opacityPanel} ${expanded ? styles.opacityPanelExpanded : ''} ${pushedDown ? styles.opacityPanelPushed : ''}`}
      {...rootProps}
    >
      <div className={styles.opacityRow} onClick={toggleFromTap}>
        <span
          className={`${styles.eyeToggle} ${!visible ? styles.eyeToggleOff : ''}`}
          title="Show/hide vegetation layer"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisible();
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
            {!visible && <line x1="21" y1="3" x2="3" y2="21" stroke="currentColor" strokeWidth="1.6" />}
          </svg>
        </span>
        <span className={styles.opacityLabel}>Vegetation layer opacity</span>
        <span className={styles.opacityValue}>{Math.round(opacity * 100)}%</span>
        <svg
          className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <div className={styles.opacitySliderWrap}>
        <input
          type="range"
          className={styles.opacitySlider}
          min={0}
          max={1}
          step={0.05}
          value={opacity}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
