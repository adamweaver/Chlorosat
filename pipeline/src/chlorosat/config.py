"""Load region settings from regions.toml. Owner: CS-010 (Kevin, S2)."""

from pathlib import Path

# pipeline/regions.toml (this file is pipeline/src/chlorosat/config.py)
REGIONS_FILE = Path(__file__).resolve().parents[2] / "regions.toml"


# [AI] Purpose: One place that knows where regions are defined, so no code hard-codes a region.
#      Does:    STUB. Planned: read regions.toml with `tomllib` (built into Python)
#               -> dict of region id -> {"id", "name", "bbox", "zoom"}.
#      Context: TODO(CS-010). Validate bbox order: west < east, south < north.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def load_regions(path: Path = REGIONS_FILE) -> dict:
    raise NotImplementedError("TODO(CS-010): load_regions")


# [AI] Purpose: Look up one region by id (e.g. "okc-norman") for the CLI.
#      Does:    STUB. Planned: load_regions()[region_id], with a clear error if missing.
#      Context: TODO(CS-010).
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def get_region(region_id: str) -> dict:
    raise NotImplementedError("TODO(CS-010): get_region")
