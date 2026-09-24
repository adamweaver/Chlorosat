"use client";
// NOTE: Takes the rendered MapView and adds the overlay controls

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { loadManifest } from "@/lib/data";
import MapOverlay from "@/components/MapOverlay";
import { YEARS } from "@/components/YearSelector";
import { DEFAULT_VIEW } from "@/components/MethodToggle";

// Load MapView in the browser only. Leaflet uses `window`, which doesn't exist during the build.
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

/* [AI] Purpose: Client-side wrapper for the map page.
 *      Does:    Loads manifest.json, holds the map settings (`layers`: view, year, opacity, base map),
 *               and passes them to MapView (draws them) and MapOverlay (controls that change them).
 *      Context: page.js stays a server component and just renders <MapApp />.
 *               One state object + updateLayers({ key: value }) keeps every setting in one place.
 *      Written: 2026-09-23 · Claude Opus 5.5 · requested by Lucas
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · added MapOverlay + map instance for zoom
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · pass manifest to MapOverlay (legend)
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · map settings lifted here from MapOverlay */
export default function MapApp() {
  const [manifest, setManifest] = useState(null);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [layers, setLayers] = useState({
    view: DEFAULT_VIEW,
    year: YEARS[YEARS.length - 1],
    opacity: 70,
    baseMap: "map",
  });
  const updateLayers = (changes) => setLayers((prev) => ({ ...prev, ...changes }));

  useEffect(() => {
    loadManifest().then(setManifest).catch(setError);
  }, []);

  if (error) return <p role="alert">Could not load map data.</p>;
  if (!manifest) return null;
  // NOTE: MapContainer only reads the region's bounds on first render. If users can switch regions
  // later (CS-040), add key={region.id} to <MapView> so the map rebuilds for the new region.
  return (
    <>
      <MapView region={manifest.regions[0]} layers={layers} onMapReady={setMap} />
      <MapOverlay map={map} manifest={manifest} layers={layers} onChange={updateLayers} />
    </>
  );
}
