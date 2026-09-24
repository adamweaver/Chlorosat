"use client";
// NOTE: is what what renders the map, then called by MapApp to add the layers and controls

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import VegetationLayer from "@/components/VegetationLayer";
import styles from "@/css/MapView.module.css";

/* [AI] Purpose: Stop users from ever seeing past the region's edges (it looked like a bug).
 *      Does:    Sets the map's minimum zoom so the region always fills the screen,
 *               and recalculates it when the window is resized.
 *      Context: getBoundsZoom(bounds, true) = the lowest zoom where the view fits INSIDE the bounds.
 *      Written: 2026-09-23 · Claude Opus 5.5 · requested by Lucas */
function FillBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    const fill = () => {
      const zoom = map.getBoundsZoom(bounds, true);
      if (map.getZoom() < zoom) map.setZoom(zoom, { animate: false });
      map.setMinZoom(zoom);
    };
    fill();
    map.on("resize", fill);
    return () => map.off("resize", fill);
  }, [map, bounds]);
  return null;
}

/* [AI] Purpose: The base map everything else is drawn on.
 *      Does:    Shows an OpenStreetMap street map limited to region.bounds (from manifest.json).
 *               Draws the data layers from `layers` (MapApp's settings). onMapReady(map) receives
 *               the Leaflet map once it exists.
 *      Context: Never import this directly; MapApp.js loads it client-only (Leaflet needs `window`).
 *               Every map layer lives here (base tiles, vegetation, labels, hotspots), so all
 *               Leaflet code stays client-only. Base map swap on layers.baseMap = CS-025 (David).
 *      Written: 2026-09-23 · Claude Opus 5.5 · requested by Lucas
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · takes `layers`, renders VegetationLayer; CSS module */
export default function MapView({ region, layers, onMapReady, children }) {
  return (
    <MapContainer
      ref={onMapReady}
      className={styles.map}
      zoomControl={false}
      bounds={region.bounds}
      maxBounds={region.bounds}
      maxBoundsViscosity={1}
      zoomSnap={0.25}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <FillBounds bounds={region.bounds} />
      <VegetationLayer
        region={region}
        methodId={layers.view}
        year={Math.round(layers.year)}
        opacity={layers.opacity / 100}
      />
      {children}
    </MapContainer>
  );
}
