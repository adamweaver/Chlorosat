# Chlorosat

Chlorosat shows **how green any place on Earth is**, using NASA satellite vegetation data (MODIS NDVI) on an interactive 3D globe. It's built for people who aren't map experts: policymakers, environmental activists and scientists, and homebuyers.

**Live site:** [chlorosat.com](https://chlorosat.com) · **Tasks:** [docs/BACKLOG.md](docs/BACKLOG.md) · **Team:** Group E, CS3203-001

## Contents

- [Screenshots](#screenshots)
- [What works](#what-works)
- [Not implemented yet](#not-implemented-yet)
- [How the live site works](#how-the-live-site-works)
- [Setup](#setup)
  - [Run the unit tests](#run-the-unit-tests)
- [Contributing](#contributing)
- [Project structure](#project-structure)
- [Docs](#docs)
- [Future pipeline](#future-pipeline)

## Screenshots

| Home page (`/`) | Map page (`/map/`) |
|---|---|
| ![Home page: the Chlorosat name, an animated satellite, and an Open map button](docs/images/home.png) | ![Map page: the globe with the NDVI vegetation layer, year and layer controls, and search](docs/images/map.jpg) |

*Data: NASA GIBS (MODIS NDVI), Esri World Imagery, OpenFreeMap/OpenMapTiles, © OpenStreetMap contributors.*

## What works

- Worldwide 3D globe (MapLibre) with no regional limits.
- **Vegetation (NDVI)** for each year from 2019 to 2026: NASA's MODIS Terra 16-day composite from mid-August, about 250 m per pixel, shown on a continuous low-to-high vegetation color scale. Water is hidden.
- **Satellite view:** Esri World Imagery. For each year it uses the Esri Wayback release closest to mid-August, and the credit line shows when the photos on screen were actually taken.
- **Map view:** a street map drawn by the app from OpenFreeMap vector tiles (OpenStreetMap data).
- Place names and borders drawn by the app in both views.
- Controls for year, vegetation visibility, opacity and view (Satellite/Map).
- **Region average:** press the draw-region (outline) button above the legend, click 3 or more points on the globe, then press **Finish** to see the average NDVI inside the outline for the year on screen. Water and missing data are left out.
- Place search with recent searches, your location, zoom, recenter and north reset.
- Home, Map and About pages that work on phones and desktops.
- Unit tests, lint and a static build checked on every pull request; automatic deployment on every merge to `main`.

## Not implemented yet

- Comparing two years or showing gained/lost vegetation.
- Statistics beyond the drawn-outline average (for example, for a searched place or ZIP code).
- Visible-light vegetation detection, or a method selector.
- Downloading maps or statistics.
- Sharing the current map view by URL.
- Using the Python pipeline on the live site.

The year control shows **one year at a time**. Changing the year is not a comparison: it swaps the NASA layer and, where possible, the historical satellite imagery.

## How the live site works

The site is a Next.js **static export**: plain HTML, CSS and JavaScript in `web/out/`, served by nginx. No app code or satellite processing runs on the server. Your browser fetches all map data directly from these public services:

| Service | What the browser gets | Used for |
|---|---|---|
| [NASA GIBS](https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api) | `MODIS_Terra_L3_NDVI_16Day` tiles + the `MODIS_NDVI` color legend | Vegetation layer |
| NASA GIBS | `OSM_Land_Water_Map` tiles | Backup water mask (if the OpenFreeMap tile is unavailable) |
| [Esri World Imagery](https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9) | Satellite tiles (keyed endpoint if an API key is set, otherwise the keyless one) | Satellite view |
| [Esri World Imagery Wayback](https://livingatlas.arcgis.com/wayback/) | Release list, past imagery tiles, and photo-date metadata | Satellite imagery for the selected year + its credit line |
| [OpenFreeMap](https://openfreemap.org) | Vector tiles (OpenMapTiles schema, © OpenStreetMap contributors) + fonts | Map view, place names, borders, exact water outlines |
| [Photon](https://photon.komoot.io) (komoot) | Place search results | Search bar |
| Your browser's location feature | Your position, only if you allow it | "My location" button (no outside service) |

How the vegetation layer is made:
1. The browser downloads NASA's ready-made NDVI tiles. Chlorosat does **not** calculate NDVI from raw satellite bands on the live site.
2. Each pixel's NDVI value is read from NASA's published legend, then shown in Chlorosat's own color scale. Water pixels are hidden.
3. Raw NASA tiles are kept in the browser's Cache Storage (on HTTPS or localhost), so revisits load faster. Recolored tiles are rebuilt in memory after a full refresh.
4. If NASA can't be reached, the vegetation layer stays empty. The site never fills in made-up data.

More detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and the diagrams in [docs/UML.md](docs/UML.md).

## Setup

**You need:** [Git](https://git-scm.com) and [Node.js](https://nodejs.org) **22.13 or newer** (the LTS download works, and it includes npm). No API keys are needed. To check what you have, run:

```bash
git --version
node --version
```

`node --version` must print `v22.13.0` or higher.

### Run the unit tests

Run these four commands in a terminal, one at a time:

```bash
git clone https://github.com/adamweaver/Chlorosat.git
cd Chlorosat/web
npm ci
npm test
```

1. `git clone` downloads the code into a new `Chlorosat` folder. Already cloned it? Skip this line.
2. `cd Chlorosat/web` moves into the website folder. Every `npm` command in this README runs there.
3. `npm ci` installs the exact package versions from `package-lock.json`. It may print warnings about deprecated packages or vulnerabilities. They don't affect the tests, so don't run `npm audit fix`.
4. `npm test` runs every unit test. The tests need no internet, browser or API key.

At the end you should see **`pass`** with the number of tests and **`fail 0`**. `fail 0` means every test passed.

To run a single test file instead (still in `web/`), name it:

```bash
node --test tests/plotGivenYear.test.mjs
```

It prints a `MODULE_TYPELESS_PACKAGE_JSON` warning first; that warning is harmless.

| Test file | What it checks |
|---|---|
| [plotGivenYear.test.mjs](web/tests/plotGivenYear.test.mjs) | `plotGivenYear`: a chosen year gives the date of NASA's map for it; years without data give `null` |
| [selectYear.test.mjs](web/tests/selectYear.test.mjs) | `selectYear`: only years the map offers (2019–2026) are accepted |
| [plotYearData.test.mjs](web/tests/plotYearData.test.mjs) | `plotYearData`: an accepted year gives its mid-August map date |
| [searchPlaces.test.mjs](web/tests/searchPlaces.test.mjs) | `searchPlaces`: place search results (a fake search service stands in, so no internet is used) |
| [minSearchLength.test.mjs](web/tests/minSearchLength.test.mjs) | `minSearchLength`: how many letters to type before a search starts |
| [buildLabel.test.mjs](web/tests/buildLabel.test.mjs) | `buildLabel`: the text shown for each search result |
| [buildBoundedRegions.test.mjs](web/tests/buildBoundedRegions.test.mjs) | `buildBoundedRegions`: a drawn outline needs 3 or more points with valid latitude and longitude |
| [calculateRegionStats.test.mjs](web/tests/calculateRegionStats.test.mjs) | `calculateRegionStats`, `containsPoint` and the region `buildBoundedRegions` returns: the average the outline tool shows, whether a spot is inside an outline, and the outline's bounding box |
| [plotVegetationChange.test.js](web/tests/plotVegetationChange.test.js) | `calculateDataChange`: vegetation change between two years (not on the map yet) |
| [selectYearRange.test.mjs](web/tests/selectYearRange.test.mjs) | `selectYearRange`: which two years a comparison may use (not on the map yet) |
| [plotDataChange.test.mjs](web/tests/plotDataChange.test.mjs) | `plotDataChange` and `changeClass`: vegetation change turned into colored pixels (not on the map yet) |

Each file tests correct, incorrect, boundary and edge cases (a course unit-test activity). The [backlog](docs/BACKLOG.md) lists who owns which (CS-057 to CS-061). The `*.stub.mjs` files beside them are stand-ins used to show a test failing; `npm test` skips them. GitHub runs the same tests on every pull request.

**If something goes wrong**

- `Could not read package.json` or `` `npm ci` command can only install with an existing package-lock.json ``: you're in the wrong folder. Go to `Chlorosat/web` and try again. Don't run `npm install` in the top `Chlorosat` folder.
- `cd: Chlorosat/web: No such file or directory`: you're not in the folder you cloned into. Already inside `Chlorosat`? Run `cd web` instead. Already in `web`? Skip the `cd`.
- `SyntaxError: Unexpected token 'export'` or `Could not find '…/tests/*.test.*'`: your Node.js is too old. Install the LTS from nodejs.org.

### Run the website

In `web/`, after `npm ci`:

```bash
npm run dev
```

Then open http://localhost:3000/ (home), http://localhost:3000/map/ (globe) or http://localhost:3000/about/. The map loads its data from the services above, so it needs an internet connection. Press **Ctrl+C** to stop the server.

### Check your changes before opening a PR

In `web/`:

```bash
npm run lint
npm test
npm run build
```

`npm run lint` checks code style, `npm test` runs the unit tests, and `npm run build` makes the static site in `web/out/` (what gets deployed). To preview the build, run `python3 -m http.server -d out 8000` (on Windows: `py -m http.server -d out 8000`) and open http://localhost:8000.

More detail, including an optional Esri API key: [docs/SETUP.md](docs/SETUP.md).
The Python pipeline has its own setup; see [Future pipeline](#future-pipeline).

## Contributing

1. **Pick a task** from [docs/BACKLOG.md](docs/BACKLOG.md) and tell the team you're taking it.
2. **Branch** from an up-to-date `main` (name it `feature/<name>`, `fix/<name>` or `docs/<name>`):
   ```bash
   git switch main
   git pull
   git switch -c feature/<name>
   ```
3. **Make one focused change**, committing in small steps with short, clear messages (`Add year label`, not `stuff`).
4. **Run the checks** in [Check your changes](#check-your-changes-before-opening-a-pr) (for the pipeline: `uv run ruff check` and `uv run pytest` in `pipeline/`).
5. **Push and open a pull request** into `main`: run `git push -u origin feature/<name>`, then click **Compare & pull request** on GitHub. The PR template asks what changed, how to test it, and whether AI helped. In the same PR, move your task to **Done** in the backlog with the PR number.
6. **Merge** after CI passes and one teammate approves. The site then deploys automatically. Delete your branch.

Ask the team first before adding a dependency or changing the architecture, data sources or deployment.
Using AI tools? Follow [AGENTS.md](AGENTS.md) and tag AI-written code with its `[AI]` comment block.

**This repo is public.** Never commit passwords, tokens, private keys, `.env` files, raw satellite data or the server's address. See [AGENTS.md → Security & secrets](AGENTS.md#security--secrets).

## Project structure

| Path | Purpose |
|---|---|
| `web/src/app/` | Next.js pages (`/`, `/map/`, `/about/`) and the shared layout |
| `web/src/components/map/` | The globe, its controls and map-specific styles |
| `web/src/components/home/` | Home page art (satellite, stars) and styles |
| `web/src/components/Header.js` | Header shown on every page |
| `web/src/lib/` | MapLibre engine, remote data, colors, labels, year checks and change math (`map/`); drawn-outline math and its average (`region.js`) |
| `web/src/styles/` | Global design tokens, resets and MapLibre overrides |
| `web/public/` | Static files copied into the build as-is |
| `web/tests/` | Unit tests, run with `npm test` (see [Run the unit tests](#run-the-unit-tests)) |
| `web/scripts/` | Copies MapLibre's worker files into `web/public/` before `npm run dev` and `npm run build` |
| `web/src/fonts/` | The Outfit font file and its license |
| `pipeline/` | Future offline processing package; not used by the site |
| `deploy/` | nginx config and manual deploy script (server side: Adam only) |
| `.github/` | CI and deploy workflows; PR and issue templates |
| `docs/` | Architecture, UML, setup, deployment, backlog, principles; research and sprint plans |
| `branding/` | Logo and color palette |
| `AGENTS.md` | Rules for AI coding tools (`CLAUDE.md` points to it) |

## Docs

- [ARCHITECTURE.md](docs/ARCHITECTURE.md): how the site fits together and why
- [UML.md](docs/UML.md): diagrams of the components and data flow
- [SETUP.md](docs/SETUP.md): full developer setup and common problems
- [BACKLOG.md](docs/BACKLOG.md): every task with its owner (once someone takes it), acceptance criteria and status; milestones; who's doing what each sprint
- [PRINCIPLES.md](docs/PRINCIPLES.md): goals, audiences and design rules
- [DEPLOYMENT.md](docs/DEPLOYMENT.md): how merges reach the server, and the security rules
- [docs/scrum/](docs/scrum/): sprint plans. [Sprint 5](docs/scrum/sprint-5.md) is the current one; Sprints 2–3 describe the retired Leaflet design
- [docs/research/](docs/research/): earlier research (historical; parts describe the retired Leaflet design)

## Future pipeline

`pipeline/` holds a planned offline Python workflow that would make Chlorosat's own vegetation layers from raw Sentinel-2 satellite bands. **It is not connected to the live website.**

- **Works today:** one command. You give it red (B04) and near-infrared (B08) Sentinel-2 GeoTIFF files that you downloaded yourself; it calculates NDVI for a region from `pipeline/regions.toml` (only `okc-norman` so far), colors it, and writes a PNG + `manifest.json` into `web/public/data/`. The live site doesn't read that folder.
- **Not implemented:** downloading scenes, cloud masking, seasonal composites, visible-light detection, statistics, change maps, multi-year runs, and any connection to the globe.

Exact status: [pipeline/README.md](pipeline/README.md).

To work on it, install [uv](https://docs.astral.sh/uv/getting-started/installation/) (it installs Python 3.12 for you), then from the repo root:

```bash
cd pipeline
uv sync           # install Python + packages
uv run ruff check # code style
uv run pytest     # tests
uv run chlorosat ndvi --region okc-norman --year 2024 --red B04.tif --nir B08.tif   # the one working command
```

Add `--offset 1000` for Sentinel-2 L2A scenes from 2022 on. Raw satellite files belong in `pipeline/data/` and must never be committed.

---

Group E — CS3203-001 Software Engineering: Adam, Carter, David, Kevin and Lucas.
