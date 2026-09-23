/* [AI] Purpose: Show one method's vegetation colors for one year on top of the map.
 *      Does:    STUB. Planned: react-leaflet <ImageOverlay> using
 *               url = /data/<regionId>/<methodId>/<year>.png and bounds = region.bounds.
 *               Change maps use the same component with url .../change/<from>_<to>.png.
 *      Context: TODO(CS-012, David). Works for every method (ndvi, visible).
 *               PNGs are EPSG:3857, so they line up with the map (docs/ARCHITECTURE.md).
 *               Planned props: { region, methodId, year, opacity } (opacity fixed ~0.7 until
 *               the slider, CS-035)
 *      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver */
export default function VegetationLayer() {
  return null;
}
