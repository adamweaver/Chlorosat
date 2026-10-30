"use client";

import { useEffect, useState } from "react";
import styles from "../Globe.module.css";
import { buildBoundedRegions } from "@/lib/region";

const SOURCE_ID = "chlorosat-region";
const FILL_ID = "chlorosat-region-fill";
const LINE_ID = "chlorosat-region-line";
const DRAFT_ID = "chlorosat-region-draft";
const POINT_ID = "chlorosat-region-points";

/* [AI] Purpose: Turn placed corners into the GeoJSON the map draws.
 *      Does:    A finished region becomes a closed polygon. A draft of two
 *               or more corners becomes a line, closed once there are three.
 *               Every draft corner is its own point.
 *      Context: Drawn by syncRegionOverlay(). Points are { lat, lng }, the
 *               same shape buildBoundedRegions() accepts.
 *      Written: 2026-10-29 · Composer · requested by Lucas */
function regionFeatureCollection(draft, region) {
  const features = [];
  const committed = region && region.points;
  if (committed && committed.length >= 3) {
    const ring = committed.map((p) => [p.lng, p.lat]);
    ring.push(ring[0]);
    features.push({
      type: "Feature",
      properties: { kind: "region" },
      geometry: { type: "Polygon", coordinates: [ring] },
    });
  }
  if (draft.length >= 2) {
    const line = draft.map((p) => [p.lng, p.lat]);
    if (draft.length >= 3) line.push(line[0]);
    features.push({
      type: "Feature",
      properties: { kind: "draft" },
      geometry: { type: "LineString", coordinates: line },
    });
  }
  draft.forEach((p) => {
    features.push({
      type: "Feature",
      properties: { kind: "vertex" },
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
    });
  });
  return { type: "FeatureCollection", features };
}

/* [AI] Purpose: Keep one overlay on the globe for the draft and the finished region.
 *      Does:    Creates the GeoJSON source and layers once, then replaces their
 *               data. Layers sit under place-name symbols so labels stay readable.
 *      Context: Uses the MapLibre map already created by chlorosatGlobeEngine.js.
 *               Does not change that engine.
 *      Written: 2026-10-29 · Composer · requested by Lucas */
function syncRegionOverlay(map, draft, region) {
  if (!map.getStyle()) return;
  const data = regionFeatureCollection(draft, region);
  const source = map.getSource(SOURCE_ID);
  if (source) {
    source.setData(data);
    return;
  }
  map.addSource(SOURCE_ID, { type: "geojson", data });
  const layers = map.getStyle().layers || [];
  const symbol = layers.find((layer) => layer.type === "symbol");
  const before = symbol && map.getLayer(symbol.id) ? symbol.id : undefined;
  map.addLayer({
    id: FILL_ID,
    type: "fill",
    source: SOURCE_ID,
    filter: ["==", ["get", "kind"], "region"],
    paint: { "fill-color": "#2e9e63", "fill-opacity": 0.28 },
  }, before);
  map.addLayer({
    id: LINE_ID,
    type: "line",
    source: SOURCE_ID,
    filter: ["==", ["get", "kind"], "region"],
    paint: { "line-color": "#56c27f", "line-width": 2 },
  }, before);
  map.addLayer({
    id: DRAFT_ID,
    type: "line",
    source: SOURCE_ID,
    filter: ["==", ["get", "kind"], "draft"],
    paint: { "line-color": "#f2f3f5", "line-width": 2, "line-dasharray": [1.5, 1.5] },
  }, before);
  map.addLayer({
    id: POINT_ID,
    type: "circle",
    source: SOURCE_ID,
    filter: ["==", ["get", "kind"], "vertex"],
    paint: {
      "circle-radius": 5,
      "circle-color": "#f2f3f5",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#2e9e63",
    },
  }, before);
}

function removeRegionOverlay(map) {
  if (!map.getStyle()) return;
  for (const id of [POINT_ID, DRAFT_ID, LINE_ID, FILL_ID]) {
    if (map.getLayer(id)) map.removeLayer(id);
  }
  if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
}

/* [AI] Purpose: The control for outlining a region on the globe.
 *      Does:    A polygon icon starts drawing. Map clicks add corners. Clear
 *               drops them. Finish calls buildBoundedRegions(); with three or
 *               more valid corners that returns a region and the map fills it.
 *               The engine then averages NASA's vegetation values inside it.
 *               Fewer than three returns null, so Finish does nothing.
 *      Context: Sits above the legend in MapApp. buildBoundedRegions() in
 *               src/lib/region.js is used as-is.
 *      Written: 2026-10-29 · Composer · requested by Lucas
 *      Edited:  2026-10-29 · Composer · requested by Lucas · icon button, hide the empty point count
 *      Edited:  2026-10-29 · Composer · requested by Lucas · map clicks form a region
 *      Edited:  2026-10-29 · Composer · requested by Lucas · show the average vegetation inside a finished region */
export default function RegionPanel({ engine, mapYear }) {
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [region, setRegion] = useState(null);
  // The finished request: which outline and year it belongs to, and the
  // average (null when NASA had no usable land pixels).
  const [report, setReport] = useState(null);
  const pointCount = points.length;
  const regionKey = region
    ? `${mapYear}|${region.points.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join(";")}`
    : "";

  useEffect(() => {
    if (!engine || !region || !engine.averageNdvi) return undefined;
    const key = regionKey;
    let cancelled = false;
    engine.averageNdvi(region.points).then((result) => {
      if (!cancelled) setReport({ key, result });
    }).catch(() => {
      if (!cancelled) setReport({ key, result: null });
    });
    return () => {
      cancelled = true;
    };
  }, [engine, region, regionKey]);

  useEffect(() => {
    const map = engine && engine.map;
    if (!map || !drawing) return undefined;
    function onClick(event) {
      const lat = event.lngLat.lat;
      let lng = event.lngLat.lng;
      while (lng > 180) lng -= 360;
      while (lng < -180) lng += 360;
      setPoints((current) => [...current, { lat, lng }]);
    }
    map.on("click", onClick);
    const canvas = map.getCanvas();
    const previousCursor = canvas.style.cursor;
    canvas.style.cursor = "crosshair";
    return () => {
      map.off("click", onClick);
      canvas.style.cursor = previousCursor;
    };
  }, [engine, drawing]);

  useEffect(() => {
    const map = engine && engine.map;
    if (!map) return undefined;
    let cancelled = false;
    const draw = () => {
      if (!cancelled) syncRegionOverlay(map, points, region);
    };
    if (map.isStyleLoaded()) draw();
    else map.once("idle", draw);
    return () => {
      cancelled = true;
      map.off("idle", draw);
    };
  }, [engine, points, region]);

  useEffect(() => {
    const map = engine && engine.map;
    if (!map) return undefined;
    return () => removeRegionOverlay(map);
  }, [engine]);

  function cancelDrawing() {
    setPoints([]);
    setDrawing(false);
  }

  function finishRegion() {
    let built = null;
    try {
      built = buildBoundedRegions(points);
    } catch {
      return;
    }
    if (!built) return;
    setRegion(built);
    setPoints([]);
    setDrawing(false);
  }

  const matched = report && report.key === regionKey ? report.result : undefined;
  const averageState = !region || drawing
    ? "idle"
    : matched === undefined
      ? "loading"
      : matched
        ? "ready"
        : "empty";
  const showValue = averageState !== "idle";
  const valueText = averageState === "loading"
    ? "…"
    : averageState === "ready"
      ? matched.mean.toFixed(2)
      : "No data";
  const valueLabel = averageState === "ready"
    ? `Average vegetation health ${matched.mean.toFixed(2)} for mid-August ${matched.year}. Water and missing data are left out.`
    : averageState === "loading"
      ? "Calculating average vegetation health"
      : "No vegetation data inside this outline";

  return (
    <div className={`${styles.regionPanel} ${drawing || showValue ? styles.regionPanelOpen : ""}`}>
      <button
        type="button"
        className={styles.regionToggle}
        aria-expanded={drawing}
        aria-controls="region-draw-panel"
        aria-label={drawing ? "Cancel drawing" : "Draw region"}
        title={
          drawing
            ? "Cancel drawing"
            : "Click the map. Three or more points outline a region."
        }
        onClick={() => (drawing ? cancelDrawing() : setDrawing(true))}
      >
        {drawing ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7 5 L18 8 L16 18 L5 15 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <circle cx="7" cy="5" r="1.5" fill="currentColor" />
            <circle cx="18" cy="8" r="1.5" fill="currentColor" />
            <circle cx="16" cy="18" r="1.5" fill="currentColor" />
            <circle cx="5" cy="15" r="1.5" fill="currentColor" />
          </svg>
        )}
      </button>
      {showValue && (
        <span className={styles.regionReadout} role="status" title={valueLabel} aria-label={valueLabel}>
          {valueText}
        </span>
      )}
      {drawing && (
        <div id="region-draw-panel" className={styles.regionDraw}>
          {pointCount > 0 && (
            <span className={styles.regionCount}>
              {pointCount === 1 ? "1 point" : `${pointCount} points`}
            </span>
          )}
          <button
            type="button"
            className={styles.regionButton}
            disabled={pointCount === 0 && !region}
            onClick={() => {
              setPoints([]);
              setRegion(null);
            }}
          >
            Clear
          </button>
          <button
            type="button"
            className={styles.regionButton}
            disabled={pointCount < 3}
            onClick={finishRegion}
          >
            Finish
          </button>
        </div>
      )}
    </div>
  );
}
