# Research: Tech Stack (CS-004, Carter)

## Team findings
> TODO (Carter): options compared and final choices, with reasons.

## Proposed so far (see [decision log](../ARCHITECTURE.md#decision-log))
| Area | Choice | Notes |
|---|---|---|
| Frontend | Next.js (static export), JavaScript, React | `output: 'export'` → plain files in `web/out/` |
| Map | Leaflet + react-leaflet | `ImageOverlay` for vegetation PNGs (both methods); no Leaflet.heat (D2) |
| Pipeline | Python 3.12, uv, numpy, rasterio, pystac-client, pillow | Runs on laptops only |
| Quality | ESLint (web), Ruff + pytest (pipeline) | Run in CI on every PR |
| Hosting | Adam's VPS + existing nginx | HTTPS via certbot; static files only; shared with Adam's personal site |
| CI/CD | GitHub Actions | `ci.yml` now; `deploy.yml` in Sprint 3 |
