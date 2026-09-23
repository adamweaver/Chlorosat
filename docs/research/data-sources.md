# Research: Satellite Data Sources (CS-002, Kevin)

## Team findings
> TODO (Kevin): sources compared, pros/cons, final pick. Then update decision **D7** in [ARCHITECTURE.md](../ARCHITECTURE.md#decision-log).

## Questions to answer
- Which source(s)? Resolution? Years available? Revisit frequency?
- Free? Account/API key needed? License + required attribution?
- How do we get the bands we need (blue, green, red for the visible method; red + NIR for NDVI) for just our bounding box, without downloading whole scenes?
- Is the same source good for both methods? (See [visible-detection.md](visible-detection.md).)
- How are clouds flagged (cloud mask band)?

---

## Claude's recommendation (suggestion only, not a team decision)
*Written 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver*

**Primary: Sentinel-2 L2A** (ESA Copernicus)
- **10 m** pixels for blue (B02), green (B03), red (B04), NIR (B08), which is neighborhood-level detail. Every ~5 days. One source covers **both methods**.
- **L2A = surface reflectance** (atmosphere-corrected), which is what both methods should use.
- Consistent L2A for the US from about **late 2018**, so plan on **2019+** (~7 summers). Verify the earliest year for our bbox.
- **Gotcha:** from **Jan 25, 2022** (processing baseline 04.00), L2A pixel values include a **+1000 offset**. It must be removed before computing **any** index (NDVI or visible), or pre-2022 vs post-2022 comparisons will be wrong. Check whether the host already corrects it (Earth Search item metadata says so; Planetary Computer does not).
- Includes an **SCL** band (scene classification) for masking clouds, shadows, and water.
- Access: **Earth Search STAC** (AWS, `https://earth-search.aws.element84.com/v1`, collection `sentinel-2-l2a`). **No account needed.** Files are Cloud-Optimized GeoTIFFs (COGs), so `rasterio` can read **only our bbox** over HTTP instead of downloading ~1 GB scenes.
- Alternative host: Microsoft Planetary Computer STAC (also free; needs URL signing via `planetary-computer` package).
- License: free and open; attribution "Contains modified Copernicus Sentinel data [year]".

**Fallback / extension: Landsat 8/9 Collection 2 Level-2** (USGS)
- 30 m pixels, from 2013 (or 1984+ with older Landsat). Use it if we want history before 2019.
- Same STAC tooling, so our `fetch.py` can support both if written with a source setting.

**Python libraries:** `pystac-client` (search), `rasterio` (read bbox windows / reproject), `numpy` (math).

**Base map (the imagery *under* our overlay):** Esri World Imagery tiles (attribution required) for satellite view; OpenStreetMap tiles for streets (follow the OSM tile usage policy, attribution required).
