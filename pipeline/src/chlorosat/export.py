"""Legacy PNG/manifest export experiment for the future offline pipeline.

The live website does not read this output. The current experimental layout is:
    <region>/<method>/<year>.png|json   and   <region>/<method>/change/<from>_<to>.png|json
A future site integration and persistent data contract still require team approval.
"""

import json
from datetime import date
from pathlib import Path

from chlorosat import methods
from chlorosat.render import save_png

# Experimental output location; the live website does not read it.
WEB_DATA_DIR = Path(__file__).resolve().parents[3] / "web" / "public" / "data"


# [AI] Purpose: Put one year's overlay + stats where the website expects them.
#      Does:    Writes <data_dir>/<region_id>/<method_id>/<year>.png and, if `stats` is given,
#               <year>.json with region/method/year fields added in front. Returns the folder.
#      Context: CS-011 experiment. A future integration may choose a different format.
#      Written: 2026-09-24 · Claude Fable 5.1 · requested by Carter
def write_year(
    region_id: str,
    method_id: str,
    year: int,
    rgba,
    stats: dict | None = None,
    data_dir: Path = WEB_DATA_DIR,
) -> Path:
    folder = data_dir / region_id / method_id
    save_png(rgba, folder / f"{year}.png")
    if stats is not None:
        header = {"region": region_id, "method": method_id, "year": year}
        _write_json(folder / f"{year}.json", header | stats)
    return folder


# [AI] Purpose: Put a change map + change stats where the website expects them.
#      Does:    STUB. Planned: write <region_id>/<method_id>/change/<from>_<to>.png and .json.
#      Context: TODO(CS-021). Same JSON style as write_year.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def write_change(
    region_id: str, method_id: str, year_from: int, year_to: int, rgba, stats: dict
) -> Path:
    raise NotImplementedError("TODO(CS-021): write_change")


# [AI] Purpose: Tell the website which regions/methods/years exist and how to color them.
#      Does:    Loads manifest.json (or starts fresh), copies methods.py in, upserts the region
#               (id/name/zoom from regions.toml, bounds/center from the PNG), adds `year` and/or
#               `change` under layers[method_id] (sorted, unique), stamps "generated", drops "note".
#      Context: CS-011 experiment. The live website does not read this manifest.
#      Written: 2026-09-24 · Claude Fable 5.1 · requested by Carter
def update_manifest(
    region: dict,
    bounds: list,
    method_id: str,
    year: int | None = None,
    change: tuple[int, int] | None = None,
    data_dir: Path = WEB_DATA_DIR,
) -> None:
    path = data_dir / "manifest.json"
    manifest = json.loads(path.read_text()) if path.exists() else {"version": 1}
    manifest.pop("note", None)
    manifest["generated"] = date.today().isoformat()
    manifest["defaultMethod"] = methods.DEFAULT_METHOD
    manifest["methods"] = methods.METHODS

    (south, west), (north, east) = bounds
    entry = {
        "id": region["id"],
        "name": region["name"],
        "bounds": [[round(south, 6), round(west, 6)], [round(north, 6), round(east, 6)]],
        "center": [round((south + north) / 2, 6), round((west + east) / 2, 6)],
        "zoom": region["zoom"],
        "layers": {m["id"]: {"years": [], "changes": []} for m in methods.METHODS},
    }
    regions = manifest.setdefault("regions", [])
    ids = [r["id"] for r in regions]
    if region["id"] in ids:
        entry["layers"].update(regions[ids.index(region["id"])]["layers"])
        regions[ids.index(region["id"])] = entry
    else:
        regions.append(entry)

    layers = entry["layers"][method_id]
    if year is not None:
        layers["years"] = sorted(set(layers["years"]) | {year})
    if change is not None:
        pairs = {tuple(c) for c in layers["changes"]} | {tuple(change)}
        layers["changes"] = [list(c) for c in sorted(pairs)]
    _write_json(path, manifest)


# [AI] Purpose: Keep experimental pipeline JSON consistently formatted.
#      Does:    Creates parent folders and writes `data` as JSON.
#      Written: 2026-09-24 · Claude Fable 5.1 · requested by Carter
#      Edited:  2026-10-12 · GPT-5.6 Sol · requested by Lucas · remove live-site claim.
def _write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n")
