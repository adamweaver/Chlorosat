# Chlorosat: Vegetation Monitoring (CS3203)

## Table of Contents

- [What is this?](#what-is-this)
- [What it does](#what-it-does)
- [Status](#status)
- [How it works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Project Structure](#project-structure)
- [Docs](#docs)
- [Branching Strategy](#branching-strategy)
- [CI/CD](#cicd)
- [Contributing](#contributing)
- [Team](#team)

## What is this?

Chlorosat maps vegetation health in the Oklahoma City area (Yukon to Choctaw, Edmond to Norman) from satellite data, so non-experts can see, compare, and understand how green their area is and how it's changing.

Built for policymakers, environmental activists and scientists, and homebuyers. See [docs/PRINCIPLES.md](docs/PRINCIPLES.md).

## What it does

- Shows vegetation as a colored layer over an interactive map (street or satellite base map).
- Detects vegetation two ways:
  - **Infrared (NDVI):** plant *health*, from near-infrared light.
  - **Visible light:** areas that *look green* in a normal photo.
- By default shows a **recommended view** that uses both together. Single-method views are available in View settings, with a warning that they're less accurate on their own.
- Compares years (2019 to 2025 planned), marks change hotspots, and shows simple stats in plain language.

## Status

Early development (Sprint 2 → 3). Working now:

- Leaflet map locked to the region bounds from `manifest.json`.
- Glass UI overlay: search bar, year slider, vegetation layer opacity, View settings, legend, recenter/zoom, Satellite/Map buttons. Controls update shared state, but **most don't change the map yet** (stubs until the data layers land).
- **Live site:** a placeholder page at [chlorosat.com](https://chlorosat.com) (HTTPS). The map goes live once auto-deploy is set up (Sprint 3).

Not yet: real vegetation overlays, satellite tiles, stats, compare mode, auto-deploy. See [docs/BACKLOG.md](docs/BACKLOG.md).

## How it works

```
pipeline/ (Python, on laptops)  →  web/public/data/ (PNGs + JSON, committed)  →  web/ (static Next.js site)  →  nginx on the VPS
```

- The **pipeline** downloads satellite bands, computes vegetation per method, and writes colored PNG overlays + stats JSON.
- The **website** is a static export: plain HTML/JS/CSS, no backend server. It reads `manifest.json` to know which regions, methods, and years exist.
- The two sides only talk through the **data contract** in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#data-contract).

## Tech Stack

**Frontend:** Next.js (static export), React, JavaScript, CSS Modules

- Map: Leaflet + react-leaflet
- Vegetation drawn as PNG image overlays (not heatmaps; decision D2 in ARCHITECTURE)

**Pipeline:** Python 3.12, managed with [uv](https://docs.astral.sh/uv/)

- Parses satellite imagery (source: decision D7) into PNG overlays + stats JSON

**Hosting:** nginx serving static files on a small VPS (server side: Adam only)

## Setup

Needs Git, Node.js 22, and uv. Full guide: [docs/SETUP.md](docs/SETUP.md).

```bash
git clone https://github.com/adamweaver/Chlorosat.git
cd Chlorosat

# Website
cd web
npm ci
npm run dev        # http://localhost:3000
npm run lint
npm run build      # static site -> web/out/

# Pipeline (from the repo root)
cd pipeline
uv sync
uv run pytest
uv run ruff check
uv run chlorosat --help
```

## Project Structure

| Path | What |
|---|---|
| `pipeline/` | Python pipeline. `regions.toml` = region list; `src/chlorosat/methods.py` = detection methods + class colors. |
| `web/src/app/` | Pages (`page.js` = map, `about/`) and the root layout. |
| `web/src/components/` | UI. `MapApp` holds map state → `MapView` draws the map layers, `MapOverlay` lays out the controls (one component per control). |
| `web/src/css/` | `globals.css` (design tokens, shared `.glass` / `.range`) + one CSS Module per component. |
| `web/src/lib/data.js` | Loads `manifest.json` and stats files. |
| `web/landing/` | The placeholder page live now (plain HTML). Becomes the home page later; the map moves to `/map/` (CS-038, D11). |
| `web/public/data/` | Pipeline output the site reads (committed). |
| `deploy/` | nginx config + deploy script (Adam only). |
| `docs/` | Principles, architecture, backlog, setup, deployment, research, sprint plans. |
| `branding/` | Logo + color palette. |

## Docs

- [PRINCIPLES.md](docs/PRINCIPLES.md): goals, audiences, design rules
- [ARCHITECTURE.md](docs/ARCHITECTURE.md): how it fits together, data contract, decision log
- [BACKLOG.md](docs/BACKLOG.md): tasks and owners
- [SETUP.md](docs/SETUP.md): developer setup + common problems
- [DEPLOYMENT.md](docs/DEPLOYMENT.md): how the site gets to the VPS
- [docs/scrum/](docs/scrum/): sprint plans
- [AGENTS.md](AGENTS.md): rules for AI tools (AI-written code is tagged `[AI]`)

## Branching Strategy

Process: Open a PR into main, get at least 1 review, then merge. Delete branches after merging.
`main` is protected: a PR with 1 approval and passing CI is required, and direct or force pushes are blocked.

- `main` — main production branch, never push directly to it
- `feature/<name>` — one branch per feature (e.g. `feature/ndvi-calculation`)
- `bugfix/<name>` — one branch per bug fix (e.g. `bugfix/<bug>`)
- If branching off a branch, branch from the feature branch (not `main`), then merge back into it when done.

## Commit Messages

Keep them short and straightforward (e.g. `Add NDVI calculation endpoint`, not `added stuff`).

## CI/CD

- **CI (live):** every PR and push to `main` runs pipeline lint + tests and web lint + build via GitHub Actions ([ci.yml](.github/workflows/ci.yml)). CI must pass before merging.
- **CD (planned, CS-024 + CS-027):** auto-deploy `web/out/` to the VPS on every merge to `main`, using a deploy key that can only write the site's folder. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Contributing

1. Create a branch off `main` (see [Branching Strategy](#branching-strategy))
2. Make your changes and commit
3. Open a PR into `main` and request a review
4. Merge once approved

**This repo is public.** Never commit passwords, tokens, keys, `.env` files, or server addresses (use placeholders like `<host>`). Rules: [AGENTS.md → Security & secrets](AGENTS.md#security--secrets) and [DEPLOYMENT.md → Security](docs/DEPLOYMENT.md#security).

## Team

Group E — CS3203-001 Software Engineering: Adam, Carter, David, Kevin, Lucas
