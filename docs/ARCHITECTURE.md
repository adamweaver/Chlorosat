# Architecture

## Big picture
```
 ON LAPTOPS (heavy work)                        IN GIT                       ON THE VPS (light work)
┌──────────────────────────┐          ┌─────────────────────────┐         ┌────────────────────────┐
│ pipeline/ (Python)       │  writes  │ web/public/data/        │  build  │ nginx serves web/out/  │
│ fetch → ndvi / visible   │ ───────► │  manifest.json          │ ──────► │ (plain static files,   │
│  → composite → render    │          │  <region>/<method>/...  │  (CI)   │  HTTPS, no compute)    │
│  → stats → export        │          │ web/src/ (Next.js)      │         └────────────────────────┘
└──────────────────────────┘          └─────────────────────────┘                    ▲
        ▲                                                                  Browser: Leaflet map
  Satellite STAC API                                                       + base map tiles (Esri/OSM)
  (source TBD, see research/)
```

**Why this shape:** the VPS is tiny, so it never processes imagery. The website is a **static export**: Next.js turns our React pages into plain HTML/JS/CSS files in `web/out/`. nginx just hands those files out. That's cheap, fast, and hard to break, and it barely touches the personal site that shares the VPS.

## Two detection methods (D8)
We show vegetation two ways. Users switch between them on the map.

| Method id | Name on site | Uses | Measures | Code |
|---|---|---|---|---|
| `ndvi` (default) | Infrared (NDVI) | red + near-infrared | Plant **health** (healthy leaves reflect lots of NIR) | `ndvi.py` |
| `visible` | Visible light | red + green + blue (a normal photo) | Areas that **look green** | `visible.py` |

They **will disagree sometimes**, e.g. stressed plants that still look green, artificial turf, green-painted roofs, shadows, water. That's expected. The site always labels which method is showing, and the About page explains why they differ. Which visible-light index to use is decision **D9** ([research/visible-detection.md](research/visible-detection.md)).

## Pipeline (`pipeline/src/chlorosat/`)
| Module | Job |
|---|---|
| `config.py` | Load `regions.toml` (region id, name, bbox, zoom). |
| `methods.py` | **Single source of truth** for each method: name, description, bands, class breakpoints + colors. |
| `fetch.py` | Search the satellite catalog (STAC) for a region + date range; read only the needed bands (blue, green, red, NIR, cloud mask) inside the bbox. |
| `ndvi.py` | Infrared method: NDVI = (NIR − Red) / (NIR + Red), range −1…1. |
| `visible.py` | Visible-light method: an RGB vegetation index (D9). |
| `composite.py` | Cloud masking + seasonal median of many scenes (works for any method). |
| `render.py` | Index array → colored PNG, reprojected to **EPSG:3857** (Web Mercator, what Leaflet uses) so it lines up with the map. |
| `stats.py` | Summary stats per year + change between two years (any method). |
| `export.py` | Write files into `web/public/data/` and update `manifest.json`. |
| `cli.py` | Command-line entry: `uv run chlorosat ...`. |

**Size tip:** OKC/Norman at 10 m is about 5,000 × 6,300 pixels. For the overview PNG, downsample (e.g. to 30 m) and use a **palette (indexed) PNG** with a few color classes. That keeps files small (< 2 MB). If we need more detail later, switch to XYZ tiles.

## Website (`web/src/`)
| Path | Job |
|---|---|
| `app/layout.js` | Page shell (html, header, fonts). |
| `app/page.js` | Main map page. |
| `app/about/page.js` | Plain-language "what is this / how to read it / why the methods differ". |
| `components/MapView.js` | Leaflet map. **Client-only** (Leaflet needs `window`), loaded with `next/dynamic` + `ssr: false` from a `"use client"` component (e.g. `MapApp.js`, which also holds page state). |
| `components/VegetationLayer.js` | Draws one method + year PNG (or a change PNG) with `ImageOverlay` at the region bounds. |
| `components/MethodToggle.js`, `YearSelector.js`, `Legend.js`, `StatsPanel.js`, `Header.js` | UI controls. |
| `lib/data.js` | Fetch `manifest.json` + stats JSON. |

`web/landing/` (outside `src/`, not built by Next) holds the plain-HTML placeholder page that's live now. It will become the home page (D11). See [web/landing/README.md](../web/landing/README.md).

## Data contract
The **only** link between pipeline and website. Both sides must follow it. **Changing it = major change** (team approval).

```
web/public/data/
├── manifest.json
└── <region-id>/
    └── <method-id>/                 ndvi | visible
        ├── <year>.png               colored overlay (EPSG:3857)
        ├── <year>.json              stats for that year
        └── change/
            ├── <y1>_<y2>.png        change overlay (diverging colors)
            └── <y1>_<y2>.json       change stats
```
Example: `okc-norman/ndvi/2024.png`, `okc-norman/visible/change/2019_2024.json`.

`manifest.json`: what exists, and how to color it.
```jsonc
{
  "version": 1,
  "generated": "2026-09-22",
  "note": "SAMPLE ...",                 // optional; only on sample data (export.py removes it)
  "defaultMethod": "ndvi",
  "methods": [{                         // copied from pipeline/src/chlorosat/methods.py (single source of truth)
    "id": "ndvi",
    "name": "Infrared (NDVI)",
    "description": "Plant health, measured from near-infrared light ...",
    "bands": ["red", "nir"],
    "classes":       [{ "key": "bare", "min": 0.0, "max": 0.2, "color": "#8c510a", "label": "Bare ground / built up" }, ...],
    "changeClasses": [{ "key": "lost", "min": -2.0, "max": -0.1, "color": "#8c510a", "label": "Lost greenness" }, ...]
  }, { "id": "visible", ... }],
  "regions": [{
    "id": "okc-norman",
    "name": "Oklahoma City & Norman, OK",
    "bounds": [[35.13, -97.75], [35.7, -97.2]],  // [[south, west], [north, east]], Leaflet order (lat, lng)
                                                 // = the PNGs' exact extent (from render.py), not just regions.toml
    "center": [35.415, -97.475],                 // midpoint of bounds
    "zoom": 10,                                  // from regions.toml
    "layers": {                                  // per method: which files exist (can differ by method)
      "ndvi":    { "years": [2019, 2024], "changes": [[2019, 2024]] },
      "visible": { "years": [2024],       "changes": [] }
    }
  }]
}
```

`<method>/<year>.json`
```jsonc
{
  "region": "okc-norman", "method": "ndvi", "year": 2024,
  "source": "sentinel-2-l2a", "dateRange": ["2024-06-01", "2024-08-31"], "scenes": 7, "pixelSizeM": 30,
  "mean": 0.41, "median": 0.43,                   // average index value (method's own scale)
  "validFraction": 0.97,                          // share of pixels that were not cloud/no-data
  "classes": { "water": 0.03, "bare": 0.18, "sparse": 0.25, "moderate": 0.32, "dense": 0.22 } // share of valid area
}
```

`<method>/change/<y1>_<y2>.json`
```jsonc
{ "region": "okc-norman", "method": "ndvi", "from": 2019, "to": 2024, "threshold": 0.1,
  "meanChange": -0.02, "gainedFraction": 0.08, "lostFraction": 0.12, "stableFraction": 0.80 }
```

Rules:
- **One grid per region.** Every PNG of a region (all years, all methods) covers the same `bounds` with the same pixel grid. That's what lets one `bounds` value work for every layer, and lets change maps subtract year A from year B pixel by pixel. (If D9 picks a different image source for the visible method, revisit this rule.)
- **Same class keys, colors, and labels across methods** (a CI test checks this), so the legend reads the same. Only breakpoints differ, because each index has its own value range. A method may skip a class (visible light has no "water").
- JSON keys are `camelCase` (JS-friendly).
- Breakpoints, colors, and change thresholds are **drafts** in `methods.py`. Finalize them with the CS-003 / CS-026 research and update this doc.

## Decision log
Status `Proposed` = suggested during outlining; needs team OK. Change to `Accepted` (with date) once agreed. `Accepted (VPS owner)` = Adam's call, because it's his server.

| # | Decision | Why | Status |
|---|---|---|---|
| D1 | Static site + offline pipeline (no backend server) | Tiny VPS; cheap, fast, reliable | Proposed 2026-09-22 |
| D2 | Colored PNG overlays (Leaflet `ImageOverlay`), not Leaflet.heat | Accurate per-pixel values; light on client. Heatmaps show point density, not values | Proposed 2026-09-22 |
| D3 | CI builds + auto-deploys `web/out/` via rsync with a locked-down key (rrsync: write-only to `/var/www/chlorosat.com`); `deploy/deploy.sh` fallback | Meets CI/CD; no built files in git; key can't touch the rest of the VPS | Proposed 2026-09-22 (key lock: Accepted by VPS owner) |
| D4 | nginx (already on Adam's VPS) + certbot for HTTPS | Existing server; Chlorosat is one extra site block | Accepted 2026-09-22 (VPS owner) |
| D5 | JavaScript (not TypeScript); uv for Python (venv+pip fallback) | Lower learning curve | Proposed 2026-09-22 |
| D6 | Processed output committed to `web/public/data/`; raw data never committed | CI can build without running the pipeline | Proposed 2026-09-22 |
| D7 | Satellite data source | See [research/data-sources.md](research/data-sources.md) | **Open** (Kevin) |
| D8 | Two detection methods: infrared (NDVI, default) + visible light, shown separately with differences explained | Team intent; visible light works on any color imagery, NDVI measures plant health | Team intent 2026-09-22; confirm details |
| D9 | Visible-light method: which index + which imagery | See [research/visible-detection.md](research/visible-detection.md) | **Open** (Carter, CS-026) |
| D10 | Hosting is on Adam's personal VPS (shared with his personal site). All server-side work is **Adam only**: VPS, nginx, DNS/domain, HTTPS, deploy keys, GitHub settings/secrets | Adam owns the server; protects his personal site | Accepted 2026-09-22 (VPS owner) |
| D11 | Landing page becomes the home page (`/`); the map moves to its own page (e.g. `/map/`), opened with a button | First load stays light (no Leaflet/overlays until asked), which helps low-end devices. Source: `web/landing/` (CS-038) | Proposed 2026-09-24 |
