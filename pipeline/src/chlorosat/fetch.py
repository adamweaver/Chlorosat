"""Find and read satellite bands for a region. Not implemented yet (planned tasks CS-010;
multi-scene composites CS-020).

The data source is researched in docs/research/data-sources.md. The recommendation there:
Sentinel-2 L2A from Earth Search STAC, which needs no account. Reading Cloud-Optimized GeoTIFFs
lets us download ONLY our bbox, not whole ~1 GB scenes.
"""

# Settings to confirm once the team picks the data source.
STAC_URL = "https://earth-search.aws.element84.com/v1"
COLLECTION = "sentinel-2-l2a"

# Band assets both methods need (Earth Search asset names): visible method = blue/green/red,
# infrared method = red/nir, scl = scene classification (cloud mask). All 10 m except scl (20 m).
BANDS = ("blue", "green", "red", "nir", "scl")


# [AI] Purpose: Find satellite images covering our region in a date range.
#      Does:    STUB. Planned: pystac_client.Client.open(STAC_URL).search(
#               collections=[COLLECTION], bbox=bbox, datetime="start/end",
#               query={"eo:cloud_cover": {"lt": max_cloud}}) -> list of STAC items.
#      Context: TODO(CS-010). bbox = [west, south, east, north].
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def search_scenes(bbox: list[float], start: str, end: str, max_cloud: float = 20) -> list:
    raise NotImplementedError("TODO(CS-010): search_scenes")


# [AI] Purpose: Choose the clearest image when several match.
#      Does:    STUB. Planned: return the item with the lowest "eo:cloud_cover".
#      Context: TODO(CS-010). Seasonal composites (CS-020) would replace this.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def pick_best_scene(items: list):
    raise NotImplementedError("TODO(CS-010): pick_best_scene")


# [AI] Purpose: Get the pixel values both methods need, only inside our bbox.
#      Does:    STUB. Planned: for each asset in `bands`, open its URL with rasterio, read a
#               window covering bbox (reproject bbox to the image CRS first), and save a GeoTIFF
#               to pipeline/data/raw/<region>/<date>/. Returns {band name: saved file path}.
#      Context: TODO(CS-010). Raw files are gitignored. Never commit them.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def read_bands(item, bbox: list[float], out_dir, bands: tuple[str, ...] = BANDS) -> dict:
    raise NotImplementedError("TODO(CS-010): read_bands")
