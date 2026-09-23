"""Write pipeline output where the website reads it. Owners: CS-011 (Carter, S2); CS-021 (change).

Target: web/public/data/, following the data contract in docs/ARCHITECTURE.md:
    <region>/<method>/<year>.png|json   and   <region>/<method>/change/<from>_<to>.png|json
These files ARE committed (decision D6), so keep them small.
"""

from pathlib import Path

# web/public/data/ (this file is pipeline/src/chlorosat/export.py)
WEB_DATA_DIR = Path(__file__).resolve().parents[3] / "web" / "public" / "data"


# [AI] Purpose: Put one year's overlay + stats where the website expects them.
#      Does:    STUB. Planned: create <WEB_DATA_DIR>/<region_id>/<method_id>/, write <year>.png
#               (render.save_png) and, if given, <year>.json (stats + region/method/year/source
#               fields; json.dump, indent=2). Returns the folder path.
#      Context: TODO(CS-011; stats from CS-021).
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def write_year(region_id: str, method_id: str, year: int, rgba, stats: dict | None = None) -> Path:
    raise NotImplementedError("TODO(CS-011): write_year")


# [AI] Purpose: Put a change map + change stats where the website expects them.
#      Does:    STUB. Planned: write <region_id>/<method_id>/change/<from>_<to>.png and .json.
#      Context: TODO(CS-021). Same JSON style as write_year.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def write_change(
    region_id: str, method_id: str, year_from: int, year_to: int, rgba, stats: dict
) -> Path:
    raise NotImplementedError("TODO(CS-021): write_change")


# [AI] Purpose: Tell the website which regions/methods/years exist and how to color them.
#      Does:    STUB. Planned: load manifest.json (or start fresh); set "methods" =
#               methods.METHODS and "defaultMethod" = methods.DEFAULT_METHOD; upsert the region
#               with id/name/zoom from regions.toml, `bounds` = the PNG's exact extent (from
#               render.to_web_mercator), `center` = midpoint of bounds; under
#               region["layers"][method_id], add the year / change pair (sorted, no duplicates);
#               set "generated" to today; remove "note"; write back with json.dump(indent=2).
#      Context: TODO(CS-011). Keep key names exactly as in the data contract.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def update_manifest(
    region: dict,
    bounds: list,
    method_id: str,
    year: int | None = None,
    change: tuple[int, int] | None = None,
) -> None:
    raise NotImplementedError("TODO(CS-011): update_manifest")
