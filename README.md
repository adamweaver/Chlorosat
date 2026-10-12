# Chlorosat

Chlorosat is a worldwide vegetation viewer. It displays NASA MODIS NDVI data
over either satellite imagery or a street map on an interactive 3D globe.

**Live site:** [chlorosat.com](https://chlorosat.com) ·
**Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) ·
**UML:** [docs/UML.md](docs/UML.md)

## What works

- Worldwide MapLibre globe with no regional boundary.
- NASA MODIS NDVI for 2019–2026, shown as a continuous low-to-high vegetation scale.
- Esri satellite imagery, including historical Wayback releases where available.
- OpenFreeMap/OpenMapTiles street-map view.
- Year, vegetation visibility, opacity and basemap controls.
- Place search, recent searches, geolocation, zoom, recenter and north reset.
- Responsive Home, Map and About pages.
- Static build and automatic deployment to nginx.

## Not implemented

- Comparing two years or displaying gained/lost vegetation.
- Statistics for a place, region or selected area.
- Visible-light vegetation detection.
- A method selector.
- Downloadable map or statistics files.
- URL-based sharing of the current map view.
- Production use of the Python pipeline.

The controls show one year at a time. Changing the year is not a comparison:
it replaces the current NASA layer and, where possible, the historical
satellite basemap.

## How the live site works

```text
Browser
  ├─ NASA GIBS: precomputed MODIS NDVI tiles
  ├─ Esri: satellite and Wayback imagery
  ├─ OpenFreeMap/OpenMapTiles: vector map, labels and water
  └─ Photon: place search
```

The browser decodes and recolors NASA’s existing NDVI tiles. It does **not**
calculate NDVI from red and near-infrared bands. Raw NASA tiles are persisted
in browser Cache Storage on HTTPS/localhost; recolored tiles are rebuilt in
memory after a full refresh.

The app is a Next.js static export. nginx serves the generated files from
`web/out/`; no application code or satellite processing runs on the VPS.

## Future pipeline

`pipeline/` is retained for a future offline Sentinel-2 workflow. It is not
connected to the live website.

One manual local-file NDVI path works today. Fetching scenes, cloud masking,
seasonal composites, visible-light detection, statistics, change maps and
multi-year runs are not implemented. See
[pipeline/README.md](pipeline/README.md) for the exact status.

## Project structure

| Path | Purpose |
|---|---|
| `web/src/app/` | Next.js routes and shared layout |
| `web/src/components/map/` | Globe container, controls and map-specific styles |
| `web/src/components/home/` | Landing-page art and styles |
| `web/src/components/Header.js` | Header shared by every route |
| `web/src/lib/map/` | MapLibre engine, remote data, colors and labels |
| `web/src/styles/` | Global tokens, resets and MapLibre overrides |
| `web/public/` | Static assets copied into the build |
| `pipeline/` | Future offline processing package; not used by the site |
| `deploy/` | nginx config and deployment script |
| `.github/workflows/` | CI and automatic deployment |
| `docs/` | Current architecture, setup, deployment, planning and historical research |
| `branding/` | Logo and palette source files |

## Setup

Requires Git and Node.js 22. `uv` and Python 3.12 are only needed for future
pipeline work.

```bash
cd web
npm ci
npm run dev       # http://localhost:3000
npm run lint
npm run build     # static export -> web/out/
```

Pipeline checks:

```bash
cd pipeline
uv sync
uv run ruff check
uv run pytest
```

More detail: [docs/SETUP.md](docs/SETUP.md).

## Contributing

1. Create `feature/<name>` or `bugfix/<name>` from an up-to-date `main`.
2. Make one focused change.
3. Run the relevant checks above.
4. Open a pull request into `main`.
5. Merge after CI passes and one teammate approves.

The repository is public. Never commit passwords, tokens, private keys,
`.env` files, raw satellite data or the VPS address. See
[AGENTS.md](AGENTS.md#security--secrets).

Group E — CS3203-001: Adam, Carter, David, Kevin and Lucas.
