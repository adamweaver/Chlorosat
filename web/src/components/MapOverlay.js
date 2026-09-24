"use client";
// NOTE: this is the overlay controls for the map inside MapApp

import Icon from "@/components/Icon";
import IconButton from "@/components/IconButton";
import SearchBar from "@/components/SearchBar";
import YearSelector from "@/components/YearSelector";
import OpacitySlider from "@/components/OpacitySlider";
import MethodToggle, { MethodNotice, DEFAULT_VIEW } from "@/components/MethodToggle";
import Legend from "@/components/Legend";
import BaseMapToggle from "@/components/BaseMapToggle";
import styles from "@/css/MapOverlay.module.css";

const stub = () => {};

/* [AI] Purpose: The floating glass controls drawn on top of the map (layout only).
 *      Does:    Places each control: top-left year slider, opacity, single-source notice;
 *               top-right search bar, view settings, recenter, zoom; bottom-left legend;
 *               bottom-right base map buttons. Controls report changes with onChange({ key: value }).
 *      Context: `layers` + `onChange` come from MapApp (the single source of map settings).
 *               `map` = the Leaflet map (zoom only). `manifest` = parsed manifest.json (legend).
 *      Written: 2026-09-23 · Claude Opus 5.5 · requested by Lucas
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · bottom dock -> year slider + left view rail
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · view rail -> base map buttons; dropped layers button
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · method switch, opacity slider, legend
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · view settings menu + notice; search bar top-right
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · controls split into own files; state lifted to MapApp; CSS module */
export default function MapOverlay({ map, manifest, layers, onChange }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.panelStack}>
        <YearSelector value={layers.year} onChange={(year) => onChange({ year })} />
        <OpacitySlider value={layers.opacity} onChange={(opacity) => onChange({ opacity })} />
        <MethodNotice value={layers.view} onReset={() => onChange({ view: DEFAULT_VIEW })} />
      </div>

      <div className={styles.rightStack}>
        <SearchBar />
        <div className={styles.toolStack}>
          <MethodToggle value={layers.view} onChange={(view) => onChange({ view })} />
          <IconButton icon="locate" label="Recenter map" onClick={stub} />
          <div className={`glass ${styles.zoom}`} role="group" aria-label="Zoom">
            <button type="button" aria-label="Zoom in" onClick={() => map?.zoomIn()}><Icon name="plus" /></button>
            <button type="button" aria-label="Zoom out" onClick={() => map?.zoomOut()}><Icon name="minus" /></button>
          </div>
        </div>
      </div>

      {/* TODO: methods[0] is hard-coded. Pick the active method from manifest.json once the
          combined view is in the data contract (class colors/labels are shared across methods today). */}
      <Legend method={manifest.methods[0]} />
      <BaseMapToggle value={layers.baseMap} onChange={(baseMap) => onChange({ baseMap })} />
    </div>
  );
}
