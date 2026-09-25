# Research: Tech Stack (CS-004, Carter)

## Team findings
*Written 2026-09-24 by Carter*

**Short version:** a static website (Next.js + Leaflet) that only shows pre-made images, and a Python pipeline that makes those images on our laptops. Nothing runs on the server except nginx handing out files. Every choice below follows from three constraints in [PRINCIPLES.md](../PRINCIPLES.md): a tiny shared VPS (1 core, 4 GB, Adam's personal site on it too), a non-technical audience on average phones, and five students with ~8 weeks to v0.1.

### Final choices
| Area | Choice | Why, in one line | Decision |
|---|---|---|---|
| Website | Next.js 16 (static export), React 19, **JavaScript** | Multi-page static site with components; no server needed; JS keeps the learning curve low | D1, D5 |
| Map | Leaflet 1.9 + react-leaflet 5 | Small (~40 KB gzipped), simple API, built-in `ImageOverlay` | D2 |
| Vegetation drawing | One colored PNG per method + year, laid over the map | Exact per-pixel values, tiny client code, files cache well | D2 |
| Pipeline | Python 3.12: numpy, rasterio, pystac-client, Pillow | The only mainstream ecosystem with solid raster + STAC tools | D5, D7 |
| Python tooling | uv | One tool installs Python 3.12, deps, and a lockfile; fast | D5 |
| Quality | ESLint (web), Ruff + pytest (pipeline) | Standard, fast, run on every PR by CI | |
| Hosting | Adam's VPS: nginx + certbot, behind Cloudflare | Already exists, custom domain, HTTPS; static files only | D4, D10 |
| CI/CD | GitHub Actions: `ci.yml` now, `deploy.yml` (rsync with a locked key) in Sprint 3 | Free on a public repo; integrates with branch protection | D3 |

Decisions are logged in [ARCHITECTURE.md](../ARCHITECTURE.md#decision-log).

### Options compared

#### 1. Website framework
| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Next.js, static export** (`output: "export"`) | File-based routing (`/`, `/about/`, later `/map/`), React components for the controls, builds to plain HTML/JS/CSS. Huge docs | Big framework for a small site; must avoid server-only features (API routes, image optimizer, SSR), which would need Node on the VPS and break D1 | **Chosen.** Pages + components without a Node server |
| Vite + React (single page) | Lighter build, simpler config | One page only unless we add a router; no page metadata conventions | Close second. Components are plain React, so switching later is cheap |
| Plain HTML + JS, no framework | Zero build step, smallest possible | Map controls (year slider, method toggle, legend, stats) share state; hand-wiring that gets messy fast | Fine for the placeholder landing page (the old `web/landing/`, since ported into the Next.js home page, CS-038), not for the app |

**JavaScript, not TypeScript (D5):** types would catch more bugs, but the compile step and type errors slow down teammates still learning React. The data contract in ARCHITECTURE.md covers most of what types would give us at this size.

#### 2. Map library and how vegetation is drawn
| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Leaflet + react-leaflet** | ~40 KB gzipped, works on old phones, `ImageOverlay` and `TileLayer` built in, simple mental model | Raster tiles only; no 3D or vector styling | **Chosen.** Fits the JS budget (< ~300 KB) and "the map is the star" |
| MapLibre GL JS | WebGL vector tiles, smooth rotation/tilt | ~200+ KB gzipped, needs a vector tile source, heavier on low-end devices | Rejected: weight without benefit |
| OpenLayers | Full GIS features (projections, WMS, vector ops) | Larger API and bundle; steeper for learners | Rejected: we only need image overlays |

How to draw vegetation (D2):
| Option | Verdict |
|---|---|
| **Colored PNG per method + year, `ImageOverlay` at the region bounds** | **Chosen.** Pixel-exact classes, colors decided once in `methods.py`, browser caches the file, change maps are just another PNG. One 30 m image of OKC/Norman is ~2000 × 2300 px with 5 flat colors, well under the 2 MB budget as a palette PNG |
| Leaflet.heat (heatmap) | Rejected: shows point density, not measured values, so it would mislead about "how green" |
| XYZ tile pyramid | Later (CS-045) if regions get much larger; more files, same idea |

Base maps: OpenStreetMap tiles for streets (follow the [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/)) and Esri World Imagery for the satellite view. Both need attribution and are free at our traffic level.

#### 3. Pipeline language and libraries
| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Python + numpy + rasterio + pystac-client + Pillow** | rasterio reads a bbox window straight out of a Cloud-Optimized GeoTIFF over HTTP (no 1 GB scene downloads) and reprojects to Web Mercator; pystac-client searches Sentinel-2 by bbox/date/cloud cover; numpy does the index math; Pillow writes small palette PNGs. All have wheels on PyPI, so no GDAL install pain | Python is a second language next to JS | **Chosen.** Nothing else comes close for raster work |
| Node.js for everything | One language | Raster/GeoTIFF support in Node is thin; no equivalent of rasterio + STAC | Rejected |
| Google Earth Engine | Compute happens on Google, huge archive, cloud masking built in | Needs a registered Cloud project, results are not reproducible offline, and the "how" is hidden behind Google's API (conflicts with principles 5 and 6) | Rejected for v1; a fine future extension for long histories |

#### 4. Python environment manager
| Option | Verdict |
|---|---|
| **uv** | **Chosen.** One binary installs Python 3.12 itself, resolves deps in seconds, writes `uv.lock` so CI and every laptop get identical versions (`uv sync --locked`). Same commands on Windows, macOS, Linux |
| pip + venv | Works and is the documented fallback in [SETUP.md](../SETUP.md), but no lockfile by default and teammates must install Python 3.12 themselves |
| conda | Used to be needed for GDAL; rasterio wheels now bundle it, so conda's size and slowness are no longer worth it |

#### 5. Hosting
| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Adam's VPS: nginx + certbot, Cloudflare in front** | Already running, custom domain `chlorosat.com`, free HTTPS, Cloudflare caches and hides the IP. nginx serving static files uses almost no RAM | Shared with Adam's personal site, so only Adam touches the server (D10) | **Chosen.** Real infrastructure for the course's CI/CD requirement with no monthly cost |
| GitHub Pages | Free, static, custom domains, zero server work | 1 GB site soft limit; no control over cache headers | **Fallback** if the VPS ever goes away; the static export works there unchanged |
| Netlify / Vercel / Cloudflare Pages | Free tiers, easy | Another vendor account; no benefit over what we have | Rejected |

#### 6. CI/CD
| Option | Verdict |
|---|---|
| **GitHub Actions** | **Chosen.** Free for public repos, lives next to the code, and its job names become the required checks on `main` (`pipeline`, `web`). `ci.yml` runs ruff + pytest and eslint + `next build` on every PR |
| Deploy: rsync over SSH with an `rrsync`-locked deploy key | **Chosen (D3).** Even if the CI key leaks, it can only write the site folder. No built files in git |

### Trade-offs we accept
- **Next.js is heavier than we need.** Accepted for routing and conventions. Components are plain React, so a move to Vite later is a config change, not a rewrite.
- **One PNG per year won't scale to huge regions.** Fine for one metro at 30 m. Larger areas need tiles (CS-045).
- **Single point of failure: Adam's VPS.** Mitigated by `deploy.sh` for manual deploys and GitHub Pages as a drop-in fallback for a static export.

### Sources
- Next.js static exports: https://nextjs.org/docs/app/guides/static-exports
- Leaflet: https://leafletjs.com/reference.html · react-leaflet: https://react-leaflet.js.org/
- rasterio: https://rasterio.readthedocs.io/ · pystac-client: https://pystac-client.readthedocs.io/
- uv: https://docs.astral.sh/uv/ · Ruff: https://docs.astral.sh/ruff/
- OSM tile usage policy: https://operations.osmfoundation.org/policies/tiles/
- Related research: [data-sources.md](data-sources.md) (D7), [visible-detection.md](visible-detection.md) (D9)
