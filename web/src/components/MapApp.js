"use client";

import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createChlorosatGlobe } from "@/lib/chlorosatGlobeEngine";

import YearSelector from "@/components/YearSelector";
import OpacitySlider from "@/components/OpacitySlider";
import SearchBar from "@/components/SearchBar";
import SideControls from "@/components/SideControls";
import Legend from "@/components/Legend";
import BaseMapToggle from "@/components/BaseMapToggle";
import styles from "@/css/MapApp.module.css";

/* [AI] Purpose: David asked for this app to "go into globe view and be
 *      just like the already existing globe" - so this is no longer a
 *      Leaflet 2D map. It hosts the SAME real MapLibre globe engine as the
 *      standalone chlorosat-globe prototype (chlorosatGlobeEngine.js: live
 *      NASA GIBS NDVI fetching, per-pixel recoloring, ocean/lake water
 *      masking, off-screen prefetching - not a mockup), with the same dark
 *      UI chrome this app already had wired up to control it.
 *      Does:    Creates one globe instance on mount (client-only - this
 *      component is only ever loaded via next/dynamic ssr:false in
 *      PersistentMap.js, same as the Leaflet version this replaces), tears it down
 *      on unmount, and holds the year/opacity/visibility/basemap state that
 *      drives it. `engine` is null for one render while the globe spins up
 *      - every child component that calls it (SearchBar, SideControls)
 *      guards for that.
 *      Written: 2026-09-24 · Claude Sonnet 5 · requested by David
 *      Ported:  2026-09-30 · Claude Opus 5.5 (for David) · from chlorosat-map-demo app/components/MapView.jsx */

// 2026 added once NASA's Aug 13, 2026 NDVI composite and Esri's Aug 5, 2026
// Wayback imagery were both published (checked 2026-09-29).
const YEARS = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];

export default function MapApp() {
  const mapContainerRef = useRef(null);
  const starsCanvasRef = useRef(null);
  const engineRef = useRef(null);

  const [engine, setEngine] = useState(null);
  const [year, setYear] = useState('2026');
  const [opacity, setOpacity] = useState(1.0);
  const [vegVisible, setVegVisible] = useState(true);
  const [basemap, setBasemap] = useState('satellite');
  // Whether the year panel is popped open (hover) - pushes OpacitySlider,
  // which sits right below it, further down so the two don't overlap.
  const [yearHovered, setYearHovered] = useState(false);
  // Whether the basemap toggle is popped open (hover) - pushes SideControls'
  // button stack, which David moved to sit right above it, further up so
  // the two don't overlap.
  const [basemapHovered, setBasemapHovered] = useState(false);
  // [AI] Phone-only Year + opacity menu (the three-bar button in the search
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

  // Starfield background, matching the standalone globe's look.
  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;
    function drawStars() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const count = Math.floor((canvas.width * canvas.height) / 1800);
      for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 1.2 + 0.2;
        const brightness = Math.random() * 0.6 + 0.4;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${brightness})`;
        ctx.fill();
      }
    }
    drawStars();
    window.addEventListener('resize', drawStars);
    return () => window.removeEventListener('resize', drawStars);
  }, []);

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

  // Create the real globe engine once, on mount. Strict Mode is off
  // (next.config.js) so this only runs once per real mount - see that
  // file's comment for why that matters with a MapLibre/Leaflet-style
  // library that owns a DOM node directly.
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
      <canvas
        ref={starsCanvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
      />
      <div
        ref={mapContainerRef}
        style={{ position: 'absolute', inset: 0, background: 'transparent', zIndex: 1 }}
      />

      <YearSelector
        years={YEARS}
        year={year}
        availableYears={YEARS}
        onChange={changeYear}
        onHoverChange={setYearHovered}
      />
      <OpacitySlider
        opacity={opacity}
        onChange={changeOpacity}
        visible={vegVisible}
        onToggleVisible={toggleVegVisible}
        pushedDown={yearHovered}
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
          <div className={styles.mapMenuDivider} />
          <OpacitySlider
            opacity={opacity}
            onChange={changeOpacity}
            visible={vegVisible}
            onToggleVisible={toggleVegVisible}
            inMenu
          />
        </div>
      )}
      <SideControls engine={engine} pushedUp={basemapHovered} />
      <Legend />
      <BaseMapToggle
        basemap={basemap}
        onChange={(mode) => {
          setBasemap(mode);
          engine && engine.switchBasemap(mode);
        }}
        onHoverChange={setBasemapHovered}
      />
    </>
  );
}
