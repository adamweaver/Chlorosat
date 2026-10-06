"use client";

import styles from "@/css/MapApp.module.css";
import useHoverExpand from "@/lib/useHoverExpand";

/* [AI] Purpose: Bottom-right basemap switcher. Was two pills stacked and
 *      always visible; David asked for it to be more visible and to
 *      collapse down to just the currently-picked option, popping up the
 *      other choice(s) on hover instead of taking up permanent space.
 *      Does:    Renders one bigger, brighter "anchor" pill showing the
 *      active basemap with a chevron hinting there's more. Hovering the
 *      whole stack (or tapping the anchor, for touch devices with no
 *      hover) reveals the other option(s) floating just above it; picking
 *      one calls onChange and collapses back down. The floating pills are
 *      always rendered (not conditionally), so the pure-CSS fade/slide in
 *      MapApp.module.css can transition them in and out - only the
 *      `expanded` class flips.
 *      Update: `onHoverChange` reports the hover/expanded state up to
 *      MapApp, the same pattern YearSelector already uses, so it can push
 *      the recenter/locate/zoom button stack (which David moved to sit
 *      right above this) further up out of the way while the floating
 *      option pill is popped open, rather than letting the two overlap.
 *      Update: the old fix for "can't reach the floating pill" was a big
 *      invisible padding area covering the whole toggle, which ended up
 *      swallowing clicks meant for that button stack once it moved to sit
 *      right above this. Replaced with .basemapHoverBridge - a small,
 *      precisely-placed strip that only bridges the narrow visual gap
 *      between the anchor and the floating pill, leaving the space above
 *      them (where the buttons now live) untouched.
 *      Update (mobile): open/close now comes from useHoverExpand, so a tap
 *      elsewhere closes it on a phone, and picking an option by tap closes
 *      it too (with a mouse it still stays open until the pointer leaves).
 *      Written: 2026-09-24 · Claude Sonnet 5 · requested by David
 *      Ported:  2026-09-30 · Claude Opus 5.5 (for David) · from chlorosat-map-demo app/components/BasemapToggle.jsx */
const OPTIONS = [
  {
    id: 'satellite',
    label: 'Satellite',
    thumb:
      'linear-gradient(135deg, #3b4a2e 0%, #1e2b1a 60%, #0d140b 100%)',
  },
  {
    id: 'map',
    label: 'Map',
    thumb: 'linear-gradient(135deg, #d8d8d0 0%, #b9c9b0 100%)',
  },
];

export default function BaseMapToggle({ basemap, onChange, onHoverChange }) {
  const { expanded, setExpanded, rootRef, rootProps, lastPointerIsMouse } = useHoverExpand(onHoverChange);

  const active = OPTIONS.find((opt) => opt.id === basemap) || OPTIONS[0];
  const inactive = OPTIONS.filter((opt) => opt.id !== basemap);

  function pick(id) {
    // Only onChange - deliberately does NOT collapse here. David wants the
    // popup to stay open as long as the cursor is still over it after a
    // pick; only the container's own onMouseLeave (below) should collapse
    // it. The just-picked option becomes the anchor and the old anchor
    // becomes the floating one, but since the mouse hasn't left the
    // container, `expanded` stays true and nothing closes out from under it.
    onChange(id);
    // On touch there's no "pointer left" moment, so close once a choice is made.
    if (!lastPointerIsMouse()) setExpanded(false);
  }

  return (
    <div
      ref={rootRef}
      className={`${styles.basemapStack} ${expanded ? styles.basemapStackExpanded : ''}`}
      {...rootProps}
    >
      {inactive.length > 0 && <div className={styles.basemapHoverBridge} />}
      {inactive.map((opt, i) => (
        <div
          key={opt.id}
          role="button"
          className={styles.basemapOptionFloating}
          style={{ bottom: `${(i + 1) * 52}px` }}
          onClick={() => pick(opt.id)}
        >
          <span className={styles.basemapThumb} style={{ background: opt.thumb }} />
          {opt.label}
        </div>
      ))}
      <div
        role="button"
        className={`${styles.basemapOption} ${styles.basemapOptionActive} ${styles.basemapOptionAnchor}`}
        onClick={() => setExpanded(!expanded)}
      >
        <span className={styles.basemapThumb} style={{ background: active.thumb }} />
        {active.label}
        <svg className={styles.basemapChevron} width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
