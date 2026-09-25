"""Tests for render.py (CS-011): colorize, save_png, to_web_mercator."""

import numpy as np
from PIL import Image
from rasterio.transform import from_origin

from chlorosat import methods
from chlorosat.render import colorize, save_png, to_web_mercator

CLASSES = [
    {"key": "low", "min": -1.0, "max": 0.0, "color": "#ff0000", "label": "low"},
    {"key": "high", "min": 0.0, "max": 1.0, "color": "#00ff0080", "label": "high"},
]
BBOX = [-97.86, 35.13, -97.20, 35.74]


def test_colorize_picks_class_by_range():
    rgba = colorize(np.array([[-0.5, 0.0], [0.5, 1.0]]), CLASSES)
    assert rgba.shape == (2, 2, 4)
    assert tuple(rgba[0, 0]) == (255, 0, 0, 255)
    assert tuple(rgba[0, 1]) == (0, 255, 0, 128)
    assert tuple(rgba[1, 1]) == (0, 255, 0, 128)


def test_colorize_nan_and_out_of_range_are_transparent():
    rgba = colorize(np.array([[np.nan, 2.0]]), CLASSES)
    assert rgba[0, 0, 3] == 0
    assert rgba[0, 1, 3] == 0


def test_save_png_round_trips_as_small_palette_image(tmp_path):
    values = np.tile(np.linspace(-1, 1, 300), (300, 1))
    rgba = colorize(values, methods.NDVI["classes"])
    path = tmp_path / "out" / "2024.png"
    save_png(rgba, path)
    with Image.open(path) as image:
        assert image.mode == "P"
        assert np.array_equal(np.asarray(image.convert("RGBA")), rgba)
    assert path.stat().st_size < 10_000


def test_to_web_mercator_anchors_grid_to_region():
    transform = from_origin(-97.5, 36.0, 0.01, 0.01)
    array = np.ones((100, 100), dtype=np.float32)
    out, bounds = to_web_mercator(array, transform, "EPSG:4326", pixel_size_m=1000, bbox=BBOX)
    (south, west), (north, east) = bounds

    assert west <= BBOX[0] and south <= BBOX[1] and east >= BBOX[2] and north >= BBOX[3]
    assert np.isnan(out[:, 0]).all()
    assert (out[:, -1] == 1.0).all()

    again, bounds_again = to_web_mercator(
        array * 2, transform, "EPSG:4326", pixel_size_m=1000, bbox=BBOX
    )
    assert again.shape == out.shape
    assert bounds_again == bounds
