"""Turn index arrays (any method) into map-ready images. Owner: CS-011 (Carter, S2)."""

import math
from pathlib import Path

import numpy as np
from PIL import Image
from rasterio.crs import CRS
from rasterio.transform import array_bounds, from_origin
from rasterio.warp import Resampling, reproject, transform_bounds

WEB_MERCATOR = CRS.from_epsg(3857)
WGS84 = CRS.from_epsg(4326)


# [AI] Purpose: Leaflet draws in Web Mercator (EPSG:3857); other projections won't line up.
#      Does:    Reprojects `array` onto a 3857 grid with `pixel_size_m` pixels. With `bbox`
#               ([west, south, east, north] in lon/lat) the grid is anchored to the region, so
#               every year and method of a region lands on the same pixels (data contract).
#               Returns (array, bounds); bounds = [[south, west], [north, east]] in lat/lng.
#      Context: CS-011. NaN means no data, in and out. Pixels are averaged when shrinking.
#      Written: 2026-09-24 · Claude Fable 5.1 · requested by Carter
def to_web_mercator(array, transform, crs, pixel_size_m: float = 30, bbox=None):
    array = np.asarray(array, dtype=np.float32)
    if bbox is None:
        src_crs, extent = crs, array_bounds(*array.shape, transform)
    else:
        src_crs, extent = WGS84, bbox
    west, south, east, north = transform_bounds(src_crs, WEB_MERCATOR, *extent)
    width = math.ceil((east - west) / pixel_size_m)
    height = math.ceil((north - south) / pixel_size_m)
    dst_transform = from_origin(west, north, pixel_size_m, pixel_size_m)

    out = np.full((height, width), np.nan, dtype=np.float32)
    reproject(
        array,
        out,
        src_transform=transform,
        src_crs=crs,
        src_nodata=np.nan,
        dst_transform=dst_transform,
        dst_crs=WEB_MERCATOR,
        dst_nodata=np.nan,
        resampling=Resampling.average,
    )
    east, south = west + width * pixel_size_m, north - height * pixel_size_m
    west, south, east, north = transform_bounds(WEB_MERCATOR, WGS84, west, south, east, north)
    return out, [[south, west], [north, east]]


# [AI] Purpose: Color each pixel by its class so people can read the map.
#      Does:    values (H, W) + class table -> RGBA uint8 (H, W, 4). A pixel gets the color of
#               the class with min <= value < max; the top class also includes its max.
#               NaN or out-of-range -> transparent.
#      Context: CS-011. `classes` = a method's "classes" or "changeClasses" (methods.py).
#      Written: 2026-09-24 · Claude Fable 5.1 · requested by Carter
def colorize(values: np.ndarray, classes: list[dict]) -> np.ndarray:
    values = np.asarray(values, dtype=np.float32)
    rgba = np.zeros(values.shape + (4,), dtype=np.uint8)
    top = max(c["max"] for c in classes)
    for c in classes:
        hit = (values >= c["min"]) & (values < c["max"])
        if c["max"] == top:
            hit |= values == top
        rgba[hit] = _hex_to_rgba(c["color"])
    return rgba


# [AI] Purpose: Class colors are hex strings in methods.py; pixels need numbers.
#      Does:    "#rrggbb" or "#rrggbbaa" -> (r, g, b, a), alpha 255 when omitted.
#      Written: 2026-09-24 · Claude Fable 5.1 · requested by Carter
def _hex_to_rgba(color: str) -> tuple[int, int, int, int]:
    digits = color.lstrip("#")
    r, g, b = (int(digits[i : i + 2], 16) for i in (0, 2, 4))
    a = int(digits[6:8], 16) if len(digits) == 8 else 255
    return r, g, b, a


# [AI] Purpose: Write the colored image the website overlays on the map, as small as possible.
#      Does:    Saves `rgba` as an indexed (palette) PNG when it has <= 256 colors, else as RGBA.
#      Context: CS-011. Budget: < 2 MB per PNG (docs/PRINCIPLES.md).
#      Written: 2026-09-24 · Claude Fable 5.1 · requested by Carter
def save_png(rgba: np.ndarray, path) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    rgba = np.ascontiguousarray(rgba, dtype=np.uint8)
    palette, index = np.unique(rgba.reshape(-1, 4), axis=0, return_inverse=True)
    if len(palette) > 256:
        Image.fromarray(rgba, "RGBA").save(path, optimize=True)
        return
    image = Image.fromarray(index.reshape(rgba.shape[:2]).astype(np.uint8), "P")
    image.putpalette(palette[:, :3].tobytes())
    image.save(path, optimize=True, transparency=palette[:, 3].tobytes())
