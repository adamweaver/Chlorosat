# Future offline pipeline

This package is **not used by the live website**. The current site downloads
NASA MODIS NDVI tiles directly in the browser.

The long-term purpose of this folder is to build project-owned regional data
from source satellite bands: fetch scenes, mask clouds, calculate vegetation
indexes, make seasonal composites, calculate statistics, and export compact
map layers. That full workflow is not implemented.

## Current status

Implemented:

- Read local red and near-infrared GeoTIFF files.
- Calculate NDVI.
- Reproject and color the result.
- Write one PNG and update a manifest.

Not implemented:

- Downloading source scenes (`fetch.py`).
- Cloud masking and seasonal composites (`composite.py`).
- Visible-light vegetation detection (`visible.py`).
- Year and change statistics (`stats.py`).
- Change-map export.
- A full multi-year command.
- Any connection between pipeline output and the live globe.

The only working command is:

```bash
uv run chlorosat ndvi --region okc-norman --year 2024 --red B04.tif --nir B08.tif
```

Run checks with:

```bash
uv sync
uv run ruff check
uv run pytest
```

Raw satellite data belongs under `pipeline/data/` and must never be committed.
