"""Smoke tests: quick checks that the package, config, and color classes are wired up correctly."""

import json
import tomllib
from itertools import pairwise

from chlorosat import (  # noqa: F401  (importing every module proves none are broken)
    cli,
    composite,
    config,
    export,
    fetch,
    methods,
    ndvi,
    render,
    stats,
    visible,
)


# [AI] Purpose: Catch broken packaging early (CI runs this on every PR).
#      Does:    Runs the CLI with no command; it should print help and return 0.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def test_cli_help():
    assert cli.main([]) == 0


# [AI] Purpose: A typo in regions.toml would silently break every pipeline run.
#      Does:    Parses regions.toml; checks each region has an id/name and a bbox in
#               [west, south, east, north] order.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def test_regions_file_is_valid():
    data = tomllib.loads(config.REGIONS_FILE.read_text())
    regions = data["region"]
    assert regions, "regions.toml needs at least one [[region]]"

    for region in regions:
        assert region["id"] and region["name"]
        west, south, east, north = region["bbox"]
        assert -180 <= west < east <= 180
        assert -90 <= south < north <= 90


# [AI] Purpose: Bad class tables would color the map wrong or leave gaps with no color.
#      Does:    For every method: unique id; classes sorted with no gaps/overlaps (each max ==
#               next min); the default method exists; a class key means the same color + label
#               in every method (so the legend reads the same across methods).
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def test_method_classes_are_consistent():
    ids = [m["id"] for m in methods.METHODS]
    assert len(ids) == len(set(ids)), "method ids must be unique"
    assert methods.DEFAULT_METHOD in ids

    look = {}  # class key -> (color, label), first seen
    for method in methods.METHODS:
        for table in (method["classes"], method["changeClasses"]):
            keys = [c["key"] for c in table]
            assert len(keys) == len(set(keys)), f"{method['id']}: duplicate class keys"
            for c in table:
                assert c["min"] < c["max"], f"{method['id']}/{c['key']}: min must be < max"
            for a, b in pairwise(table):  # neighbors: (1st, 2nd), (2nd, 3rd), ...
                assert a["max"] == b["min"], f"{method['id']}: gap/overlap at {a['key']}"
            for c in table:
                expected = look.setdefault(c["key"], (c["color"], c["label"]))
                assert (c["color"], c["label"]) == expected, f"'{c['key']}' differs by method"


# [AI] Purpose: The website legend reads classes from manifest.json. If they drift from
#               methods.py, the legend would lie about what the map colors mean.
#      Does:    Checks manifest.json "methods"/"defaultMethod" equal methods.py.
#      Context: If this fails, update both together (docs/ARCHITECTURE.md#data-contract).
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def test_manifest_matches_methods():
    manifest = json.loads((export.WEB_DATA_DIR / "manifest.json").read_text())
    assert manifest["methods"] == methods.METHODS
    assert manifest["defaultMethod"] == methods.DEFAULT_METHOD
