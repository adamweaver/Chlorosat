"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import styles from "@/css/page.module.css";

// The globe engine uses `window`, which doesn't exist during the build, so
// MapApp only loads in the browser.
const MapApp = dynamic(() => import("@/components/MapApp"), {
  ssr: false,
  loading: () => <p className={styles.mapLoading}>Loading map…</p>,
});

/* [AI] Purpose: Keep the globe loaded when leaving the map page. David asked
 *      for this: going to About and back used to rebuild the globe and
 *      download every tile again.
 *      Does:    Lives in the root layout (layout.js), which Next.js keeps
 *               mounted while you move between pages. Creates the map the
 *               first time /map/ is visited (so / and /about/ stay light,
 *               D11), then only hides it on other pages. visibility:hidden
 *               (not display:none) keeps its size, so MapLibre doesn't
 *               resize to 0x0 and drop its tiles.
 *      Context: app/map/page.js renders nothing itself; the map shows here.
 *               A full page load of /about/ doesn't create the map at all.
 *      Written: 2026-09-30 · Claude Opus 5.5 · requested by David */
export default function PersistentMap() {
  const path = (usePathname() || "/").replace(/\/$/, "") || "/"; // "/map/" and "/map" are the same page.
  const onMap = path === "/map";
  const [opened, setOpened] = useState(onMap);
  // First visit to /map/: create the map (React allows this state update during render).
  if (onMap && !opened) setOpened(true);
  if (!opened) return null;

  return (
    <div className={onMap ? styles.mapPage : `${styles.mapPage} ${styles.mapPageHidden}`} role={onMap ? "main" : undefined}>
      <MapApp />
    </div>
  );
}
