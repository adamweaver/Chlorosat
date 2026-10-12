"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

/* [AI] Purpose: Shared open/close logic for the pop-open panels (Year,
 *      vegetation opacity, basemap toggle) that works for both a mouse and a
 *      finger. David asked for the app to work well on phones - these panels
 *      only opened on hover, and a phone has no hover.
 *      Does:    With a mouse, the panel opens while the pointer is over it
 *      and closes when it leaves (unchanged desktop behavior). With touch or
 *      a pen, `toggleFromTap()` (wired to the panel's header) opens/closes it
 *      on tap, and tapping anywhere outside the panel closes it again.
 *      `onChange` mirrors the open state to a parent (MapApp uses it to
 *      nudge neighbouring panels out of the way).
 *      Returns: { expanded, setExpanded, rootRef, rootProps, toggleFromTap,
 *      lastPointerIsMouse } - spread rootProps onto the panel's root element
 *      and give it rootRef.
 *      Written: 2026-09-25 · Claude Opus 5.5 · requested by David
 *      Ported:  2026-09-30 · Claude Opus 5.5 (for David) · from chlorosat-map-demo app/components/useHoverExpand.js */
export default function useHoverExpand(onChange) {
  const [expanded, setExpandedState] = useState(false);
  const rootRef = useRef(null);
  const lastPointerType = useRef('mouse');
  const onChangeRef = useRef(onChange);
  // Keep the latest callback without re-creating setExpanded. Updated after each
  // render (not during it), as the react-hooks/refs lint rule requires.
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const setExpanded = useCallback((value) => {
    setExpandedState(value);
    if (onChangeRef.current) onChangeRef.current(value);
  }, []);

  // Touch has no "pointer left" moment, so close on a tap anywhere else.
  // Capture phase, because the map canvas handles its own pointer events.
  useEffect(() => {
    if (!expanded) return undefined;
    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setExpanded(false);
    }
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [expanded, setExpanded]);

  const rootProps = {
    onPointerDown: (e) => { lastPointerType.current = e.pointerType; },
    onPointerEnter: (e) => { if (e.pointerType === 'mouse') setExpanded(true); },
    onPointerLeave: (e) => { if (e.pointerType === 'mouse') setExpanded(false); }
  };

  const lastPointerIsMouse = () => lastPointerType.current === 'mouse';

  // For the panel header: a tap toggles it; a mouse click does nothing,
  // since hovering already opened it.
  const toggleFromTap = () => {
    if (!lastPointerIsMouse()) setExpanded(!expanded);
  };

  return { expanded, setExpanded, rootRef, rootProps, toggleFromTap, lastPointerIsMouse };
}
