# Sprint 2 (Sep 16 → Sep 30) · ends week 6

Work starts **Sep 22** (Sprint 1 ran over), so ~8 hrs each, including Sprint 1 carry-over.

**Sprint goal:** *Bare-bones end-to-end version (week 6 milestone, see [PRINCIPLES](../PRINCIPLES.md#goals)).* One year of real NDVI for OKC/Norman shows on the map locally, CI runs on every PR, and the VPS serves a placeholder page over HTTPS.
**Capacity:** ~8 hrs per member. Roles rotate for now (may become fixed later).
**Server work is Adam's only** (his personal VPS, decision D10), so Adam and Kevin swapped lanes this sprint.
**Pulled forward (Sep 24, for the code review):** CS-024 auto-deploy and CS-038 landing page → home page (Adam), both in #6. See [BACKLOG](../BACKLOG.md).

## Sprint 1 carry-over (finish first, by ~Sep 24)
| ID | Owner | Task | Est. hrs | Done when |
|---|---|---|---|---|
| CS-001 | Lucas | Finalize feature scope + backlog priorities | 1.5 | [BACKLOG.md](../BACKLOG.md) Must/Should/Could agreed by team |
| CS-002 | Kevin | Data source write-up + pick | 2 | [data-sources.md](../research/data-sources.md) filled; decision D7 set |
| CS-003 | David | NDVI research write-up | 1.5 | [ndvi.md](../research/ndvi.md) questions answered (classes + thresholds) |
| CS-004 | Carter | Tech stack write-up | 1 | [tech-stack.md](../research/tech-stack.md) filled |
| CS-005 | Adam | Review + merge repo scaffold; team confirms decisions D1–D3, D5, D6, D8 | 1 | Scaffold on `main`; decision log statuses updated |

## Tasks
| ID | Owner | Task | Est. hrs | Done when (acceptance criteria) | Depends on |
|---|---|---|---|---|---|
| CS-010 | Kevin | **Pipeline fetch:** `fetch.py` + `config.py`. Search STAC for region bbox + date range, pick least-cloudy scene, read the bands both methods need (blue, green, red, NIR + SCL cloud mask) **only inside the bbox** | 6 | `uv run chlorosat fetch --region okc-norman --year 2024` saves band GeoTIFFs to `pipeline/data/raw/` and prints scene ID + cloud % | CS-002 (Kevin's own research; can start with the recommended Sentinel-2) |
| CS-011 | Carter | **Pipeline NDVI → PNG:** `ndvi.py`, `render.py`, `export.py`. Compute NDVI, color it with `methods.NDVI` classes, reproject to EPSG:3857, write PNG + manifest entry. Fill in the outline tests | 6.5 | `test_ndvi.py` tests pass; `web/public/data/okc-norman/ndvi/<year>.png` < 2 MB; `manifest.json` lists the year under `layers.ndvi` | A sample scene: hand-download from [Copernicus Browser](https://browser.dataspace.copernicus.eu) (free account) until CS-010 lands |
| CS-012 | David | **Web map:** add `leaflet` + `react-leaflet`; `MapView` (client-only) centered on OKC/Norman with satellite base layer + attribution; `VegetationLayer` draws the default method's PNG from `manifest.json` | 6.5 | `npm run dev` shows map + overlay (placeholder PNG OK); `npm run build` still succeeds | None (use a placeholder PNG) |
| CS-013 | Adam | **Server (Adam only):** domain/DNS; nginx site from `deploy/chlorosat.nginx.conf` + certbot HTTPS; `chlorosat-deploy` user + rrsync-locked key; write `deploy/deploy.sh`; branch protection on `main` | 6 | `https://chlorosat.com` (and www) serves the built placeholder with valid HTTPS **and the personal site still works**; `deploy.sh` deploys in one command; the locked key refuses a shell; [DEPLOYMENT.md](../DEPLOYMENT.md) checklist filled | None |
| CS-014 | Lucas | **UX:** low-fi wireframes (map page, method toggle, stats panel, compare view, phone layout) in `docs/design/`; get feedback from 1–2 non-technical people; brand tokens in `globals.css`; build `Header` + page layout | 6.5 | Wireframes + feedback notes committed; header/layout match wireframe and work at phone width | None |

## Ceremonies
| What | When | How |
|---|---|---|
| Sprint planning | Sep 22–23 | Review this plan, adjust, commit. |
| Standup (async) | Mon / Wed / Fri | Group chat: **Did · Doing · Blocked?** |
| Sprint review | Sep 30 | Demo: map with real NDVI overlay locally + placeholder live on the domain. |
| Retrospective | Sep 30 | Fill in below. |

## Definition of Done
See [_template.md](_template.md#definition-of-done-applies-to-every-task).

## Review
- Demoed:
- Not finished (→ carried over):

## Retrospective
| Went well | Didn't go well | Change next sprint |
|---|---|---|
| | | |
