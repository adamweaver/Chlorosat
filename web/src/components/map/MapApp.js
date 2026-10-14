"use client";

import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createChlorosatGlobe } from "@/lib/map/chlorosatGlobeEngine";

import YearSelector from "./controls/YearSelector";
import SearchBar from "./controls/SearchBar";
import SideControls from "./controls/SideControls";
import Legend from "./controls/Legend";
import LayersControl from "./controls/LayersControl";
import styles from "./Globe.module.css";

/* [AI] Purpose: The map page's app: the MapLibre globe plus the controls that drive it.
 *      Does:    Creates one globe instance on mount (chlorosatGlobeEngine.js: live NASA
 *      GIBS NDVI, per-pixel recoloring, water masking, off-screen prefetching), tears it
 *      down on unmount, and holds the year/opacity/visibility/basemap state that drives
 *      it. Client-only: PersistentMap.js loads it with next/dynamic ssr:false.
 *      `engine` is null for one render while the globe spins up - every child
 *      component that calls it (SearchBar, SideControls) guards for that.
 *      Context: Replaced the earlier Leaflet 2D map (2026-09-30), ported from the
 *      team's chlorosat-map-demo prototype.
 *      Written: 2026-09-24 · Claude Sonnet 5 · requested by David
 *      Ported:  2026-09-30 · Claude Opus 5.5 (for David) · from chlorosat-map-demo app/components/MapView.jsx
 *      Edited:  2026-10-12 · Claude Opus 5.5 · requested by Adam Weaver · comment describes the current app */

// 2026 added once NASA's Aug 13, 2026 NDVI composite and Esri's Aug 5, 2026
// Wayback imagery were both published (checked 2026-09-29).
const YEARS = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];

export default function MapApp() {
  const mapContainerRef = useRef(null);
  const engineRef = useRef(null);

  const [engine, setEngine] = useState(null);
  const [year, setYear] = useState('2026');
  const [opacity, setOpacity] = useState(1.0);
  const [vegVisible, setVegVisible] = useState(true);
  const [aquaVisible, setAquaVisible] = useState(false);
  const [aquaOpacity, setAquaOpacity] = useState(1.0);
  const [basemap, setBasemap] = useState('satellite');
  // [AI] Phone-only Year menu (the three-bar button in the search
  //      bar). A tap anywhere outside the menu or its button closes it.
  //      Written: 2026-09-29 · Claude Opus 5.5 · requested by David
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return undefined;
    function onPointerDown(e) {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      if (e.target.closest && e.target.closest('[data-map-menu-toggle]')) return;
      setMenuOpen(false);
    }
    // Capture phase, because the map canvas handles its own pointer events.
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [menuOpen]);

  function changeYear(y) {
    setYear(y);
    scheduleEngineYear(y);
  }

  function changeOpacity(v) {
    setOpacity(v);
    engine && engine.setOpacity(v);
  }

  function toggleVegVisible() {
    const next = !vegVisible;
    setVegVisible(next);
    engine && engine.setVegVisible(next);
  }

  // [AI] The Layers panel's "Algae in water" switch (off by default) and its
  //      own opacity (the plants layer's slider no longer dims it too).
  //      Written: 2026-10-12 · Claude Opus 5.5 · requested by David
  function toggleAquaVisible() {
    const next = !aquaVisible;
    setAquaVisible(next);
    engine && engine.setAquaVisible(next);
  }

  function changeAquaOpacity(v) {
    setAquaOpacity(v);
    engine && engine.setAquaOpacity(v);
  }

  function changeBasemap(mode) {
    setBasemap(mode);
    engine && engine.switchBasemap(mode);
  }


  // [AI] Slider pause. Swiping across the year slider used to start loading
  //      every year it passed over (a full set of NASA tiles and satellite
  //      photos each time). The label still updates instantly, but the map
  //      only switches once the slider has rested on a year for
  //      YEAR_LOAD_DELAY_MS - years swiped past never load.
  //      Written: 2026-09-29 · Claude Opus 5.5 · requested by David
  const YEAR_LOAD_DELAY_MS = 450;
  const yearTimerRef = useRef(null);
  const engineYearRef = useRef('2026');
  function scheduleEngineYear(y) {
    clearTimeout(yearTimerRef.current);
    yearTimerRef.current = setTimeout(() => {
      if (engine && engineYearRef.current !== y) {
        engineYearRef.current = y;
        engine.setYear(y);
      }
    }, YEAR_LOAD_DELAY_MS);
  }
  useEffect(() => () => clearTimeout(yearTimerRef.current), []);

  // Create the real globe engine on mount, and destroy it on unmount.
  // Strict Mode is off (next.config.mjs), so this runs once in development
  // too; if it's ever turned back on, the cleanup still handles the extra
  // create -> destroy -> create.
  useEffect(() => {
    if (!mapContainerRef.current) return;
    // No onLoadingChange here anymore - David asked for the "Loading
    // tiles..." badge to be removed; the engine treats that callback as
    // optional.
    const instance = createChlorosatGlobe({
      container: mapContainerRef.current
    });
    engineRef.current = instance;
    setEngine(instance);
    return () => {
      instance.destroy();
      engineRef.current = null;
    };
  }, []);

  return (
    <>
      {/* Night sky behind the globe: a fixed image (public/stars.svg, see
          .night-sky in globals.css), so it never redraws or changes. */}
      <div className="night-sky" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
      <div
        ref={mapContainerRef}
        style={{ position: 'absolute', inset: 0, background: 'transparent', zIndex: 1 }}
      />

      <YearSelector
        years={YEARS}
        year={year}
        availableYears={YEARS}
        onChange={changeYear}
      />
      <SearchBar
        engine={engine}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((open) => !open)}
        onSearchFocus={() => setMenuOpen(false)}
      />
      {menuOpen && (
        <div ref={menuRef} className={styles.mapMenu}>
          <YearSelector years={YEARS} year={year} availableYears={YEARS} onChange={changeYear} inMenu />
        </div>
      )}
      <SideControls engine={engine} />
      <Legend vegVisible={vegVisible} aquaVisible={aquaVisible} />
      {/* [AI] Base map, both data layers and their opacity, all in one
           panel (LayersControl.js). Written: 2026-10-12 · Claude Opus 5.5 · requested by David */}
      <LayersControl
        basemap={basemap}
        onBasemap={changeBasemap}
        vegVisible={vegVisible}
        onToggleVeg={toggleVegVisible}
        vegOpacity={opacity}
        onVegOpacity={changeOpacity}
        aquaVisible={aquaVisible}
        onToggleAqua={toggleAquaVisible}
        aquaOpacity={aquaOpacity}
        onAquaOpacity={changeAquaOpacity}
      />
    </>
  );
}
