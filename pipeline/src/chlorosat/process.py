"""Run one method for one year from band files on disk. Owner: CS-011 (Carter, S2).

Stopgap until `fetch` (CS-010) and `run` (CS-020) land: the bands are GeoTIFFs downloaded by
hand (e.g. Copernicus Browser), ideally cropped to the region.
"""

import tomllib

import numpy as np
import rasterio

from chlorosat import config, methods
from chlorosat.export import WEB_DATA_DIR, update_manifest, write_year
from chlorosat.ndvi import compute_ndvi
from chlorosat.render import colorize, to_web_mercator


# [AI] Purpose: Look up a region without waiting for config.load_regions (CS-010).
#      Does:    Reads regions.toml and returns the [[region]] with this id.
#      Written: 2026-09-24 · Claude Fable 5.1 · requested by Carter
def region_from_toml(region_id: str) -> dict:
    for region in tomllib.loads(config.REGIONS_FILE.read_text())["region"]:
        if region["id"] == region_id:
            return region
    raise KeyError(f"unknown region {region_id!r}; see regions.toml")


# [AI] Purpose: Read one band from a GeoTIFF as reflectance, with no-data pixels as NaN.
#      Does:    Returns (values, transform, crs). DN 0 = no data; value = (DN - offset) / scale.
#      Written: 2026-09-24 · Claude Fable 5.1 · requested by Carter
def read_band(path, offset: float = 0, scale: float = 10000):
    with rasterio.open(path) as src:
        raw = src.read(1).astype(np.float32)
        transform, crs = src.transform, src.crs
    values = (raw - offset) / scale
    values[raw == 0] = np.nan
    return values, transform, crs


# [AI] Purpose: The whole NDVI chain for one year, so CS-011 can be checked end to end.
#      Does:    red + nir GeoTIFFs -> NDVI -> the region's Web Mercator grid -> colored PNG ->
#               web/public/data/<region>/ndvi/<year>.png + manifest entry. Returns the folder.
#      Context: CS-011. `offset` = 1000 for Sentinel-2 L2A scenes from Jan 2022 on, unless the
#               download already removed it (docs/research/data-sources.md).
#      Written: 2026-09-24 · Claude Fable 5.1 · requested by Carter
def ndvi_year(
    region_id: str,
    year: int,
    red_path,
    nir_path,
    offset: float = 0,
    pixel_size_m: float = 30,
    data_dir=WEB_DATA_DIR,
):
    region = region_from_toml(region_id)
    red, transform, crs = read_band(red_path, offset)
    nir, _, _ = read_band(nir_path, offset)
    values = compute_ndvi(red, nir)
    values, bounds = to_web_mercator(values, transform, crs, pixel_size_m, bbox=region["bbox"])
    rgba = colorize(values, methods.NDVI["classes"])
    folder = write_year(region["id"], "ndvi", year, rgba, data_dir=data_dir)
    update_manifest(region, bounds, "ndvi", year=year, data_dir=data_dir)
    return folder
