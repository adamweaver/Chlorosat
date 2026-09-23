"""Turn index arrays (any method) into map-ready images. Owner: CS-011 (Carter, S2)."""

import numpy as np


# [AI] Purpose: Leaflet maps use Web Mercator (EPSG:3857); images in other projections
#               won't line up with streets.
#      Does:    STUB. Planned: rasterio.warp.reproject the array to EPSG:3857, optionally
#               downsampling (e.g. to ~30 m) to keep the PNG small. Returns the new array and
#               its exact lat/lng bounds [[south, west], [north, east]] (these go in manifest.json).
#      Context: TODO(CS-011). Budget: PNG < 2 MB (docs/PRINCIPLES.md). Every PNG of a region
#               (all years, all methods) must use the SAME output grid (extent + pixel size), so
#               layers line up and change maps can subtract pixel by pixel (CS-020).
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def to_web_mercator(array: np.ndarray, transform, crs, pixel_size_m: float = 30):
    raise NotImplementedError("TODO(CS-011): to_web_mercator")


# [AI] Purpose: Color each pixel by its class so people can read the map.
#      Does:    STUB. Planned: RGBA array (H, W, 4). Each pixel gets the color of the class
#               whose min <= value < max; NaN -> fully transparent.
#      Context: TODO(CS-011). `classes` = a method's "classes" or "changeClasses" (methods.py).
#               Few flat colors = small palette PNG.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def colorize(values: np.ndarray, classes: list[dict]) -> np.ndarray:
    raise NotImplementedError("TODO(CS-011): colorize")


# [AI] Purpose: Write the colored image the website overlays on the map.
#      Does:    STUB. Planned: Pillow Image.fromarray(rgba).save(path, optimize=True);
#               consider quantize() to an indexed palette for smaller files.
#      Context: TODO(CS-011).
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def save_png(rgba: np.ndarray, path) -> None:
    raise NotImplementedError("TODO(CS-011): save_png")
