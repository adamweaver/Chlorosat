"""Tests for export.py (CS-011): write_year and update_manifest."""

import json

import numpy as np

from chlorosat import methods
from chlorosat.export import update_manifest, write_year

REGION = {"id": "test-region", "name": "Test Region", "bbox": [-1.0, -1.0, 1.0, 1.0], "zoom": 9}
BOUNDS = [[-1.0, -1.0], [1.0, 1.0]]
RGBA = np.zeros((2, 2, 4), dtype=np.uint8)


def test_write_year_writes_png_and_stats(tmp_path):
    folder = write_year("r", "ndvi", 2024, RGBA, {"mean": 0.5}, data_dir=tmp_path)
    assert folder == tmp_path / "r" / "ndvi"
    assert (folder / "2024.png").exists()
    stats = json.loads((folder / "2024.json").read_text())
    assert stats == {"region": "r", "method": "ndvi", "year": 2024, "mean": 0.5}


def test_write_year_without_stats_writes_no_json(tmp_path):
    folder = write_year("r", "ndvi", 2024, RGBA, data_dir=tmp_path)
    assert not (folder / "2024.json").exists()


def test_update_manifest_creates_and_updates(tmp_path):
    update_manifest(REGION, BOUNDS, "ndvi", year=2024, data_dir=tmp_path)
    update_manifest(REGION, BOUNDS, "ndvi", year=2019, data_dir=tmp_path)
    update_manifest(REGION, BOUNDS, "ndvi", year=2024, change=(2019, 2024), data_dir=tmp_path)
    manifest = json.loads((tmp_path / "manifest.json").read_text())

    assert manifest["methods"] == methods.METHODS
    assert manifest["defaultMethod"] == methods.DEFAULT_METHOD
    assert "note" not in manifest
    assert manifest["generated"]
    [region] = manifest["regions"]
    assert region["name"] == "Test Region"
    assert region["zoom"] == 9
    assert region["bounds"] == BOUNDS
    assert region["center"] == [0.0, 0.0]
    assert region["layers"]["ndvi"] == {"years": [2019, 2024], "changes": [[2019, 2024]]}
    assert region["layers"]["visible"] == {"years": [], "changes": []}


def test_update_manifest_keeps_existing_file(tmp_path):
    sample = {"version": 1, "note": "SAMPLE", "regions": []}
    (tmp_path / "manifest.json").write_text(json.dumps(sample))
    update_manifest(REGION, BOUNDS, "visible", year=2020, data_dir=tmp_path)
    manifest = json.loads((tmp_path / "manifest.json").read_text())
    assert manifest["version"] == 1
    assert "note" not in manifest
    assert manifest["regions"][0]["layers"]["visible"]["years"] == [2020]
