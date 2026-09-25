"""End-to-end test for process.ndvi_year (CS-011) on a tiny synthetic scene."""

import json

import numpy as np
import rasterio
from PIL import Image
from rasterio.transform import from_origin

from chlorosat.process import ndvi_year, region_from_toml


def _geotiff(path, value):
    data = np.full((80, 80), value, dtype=np.uint16)
    data[0, 0] = 0
    profile = {
        "driver": "GTiff",
        "height": 80,
        "width": 80,
        "count": 1,
        "dtype": "uint16",
        "crs": "EPSG:4326",
        "transform": from_origin(-98.0, 36.0, 0.0125, 0.0125),
    }
    with rasterio.open(path, "w", **profile) as dst:
        dst.write(data, 1)
    return path


def test_region_from_toml_knows_okc():
    assert region_from_toml("okc-norman")["zoom"] == 10


def test_ndvi_year_writes_png_and_manifest(tmp_path):
    red = _geotiff(tmp_path / "red.tif", 1000)
    nir = _geotiff(tmp_path / "nir.tif", 5000)
    data_dir = tmp_path / "data"

    folder = ndvi_year("okc-norman", 2024, red, nir, pixel_size_m=1000, data_dir=data_dir)

    with Image.open(folder / "2024.png") as image:
        rgba = np.asarray(image.convert("RGBA"))
    center = tuple(rgba[rgba.shape[0] // 2, rgba.shape[1] // 2])
    assert center == (0x01, 0x66, 0x5E, 255)

    manifest = json.loads((data_dir / "manifest.json").read_text())
    region = manifest["regions"][0]
    assert region["id"] == "okc-norman"
    assert region["layers"]["ndvi"]["years"] == [2024]
    assert region["bounds"][0][0] <= 35.13 <= 35.74 <= region["bounds"][1][0]
