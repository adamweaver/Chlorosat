# Backlog

Every task for Chlorosat, who owns it, and when it counts as done.

**How to use it:** pick a task, move its row to **In Progress**, open a PR, and when it merges move the row to **Done** with the PR number. Sprint tasks have more detail (hours, dependencies) in the sprint plans: [Sprint 2](scrum/sprint-2.md), [Sprint 3](scrum/sprint-3.md).

**Columns:**
- **Pri** (priority): **M**ust (needed for v0.1) · **S**hould (v1.0 if time allows) · **C**ould (nice to have). Draft by Lucas (CS-001); the team finalizes it at the Sprint 3 review.
- **Sprint:** when it's planned. Empty = not scheduled yet (picked at a sprint planning).
- **Done when:** the acceptance criteria. A reviewer can check each one.
- *Italic notes* = progress so far.

## Milestones
From [PRINCIPLES.md → Goals](PRINCIPLES.md#goals).

| Milestone | Date | Must tasks |
|---|---|---|
| **Bare-bones:** one year of real NDVI on the map locally; site live over HTTPS | Sep 30 (week 6, end of Sprint 2) | CS-010, CS-011, CS-012, CS-013 ✅, CS-014 |
| **Somewhat usable & live:** several years + year picker + legend on chlorosat.com | ~Oct 7 (week 7) | CS-020, CS-022, CS-024 ✅ |
| **v0.1:** + visible-light method, year comparison, basic stats, auto-deploy | Oct 14 (week 8, end of Sprint 3) | CS-021, CS-023, CS-026, CS-027 |
| **v1.0:** polished, tested, documented, fast | ~Nov 9–22 (weeks 12–13) | Should items picked at the Sprint 3 review |

## Who's doing what
| Person | Sprint 2 (Sep 16 → 30) | Sprint 3 (Sep 30 → Oct 14) |
|---|---|---|
| Adam | CS-005 · CS-013 ✅ · CS-024 ✅ · CS-038 ✅ (last two pulled forward) | CS-023 · CS-027 |
| Carter | CS-004 ✅ · CS-011 | CS-026 (research ✅ early) |
| David | CS-003 · CS-012 | CS-020 |
| Kevin | CS-002 · CS-010 | CS-022 |
| Lucas | CS-001 · CS-014 · CS-049 ✅ (map page UI) | CS-021 |

## In Progress
| ID | Task | Owner | Pri | Sprint | Done when | PR |
|---|---|---|---|---|---|---|
| CS-001 | Finalize feature scope & backlog priorities | Lucas | M | 1→2 | Must/Should/Could in this file agreed by the team | |
| CS-002 | Data source research → pick a source (decision D7) | Kevin | M | 1→2 | [data-sources.md](research/data-sources.md) filled in; D7 set in ARCHITECTURE | |
| CS-003 | NDVI research write-up | David | M | 1→2 | [ndvi.md](research/ndvi.md) questions answered (classes + thresholds) | |
| CS-005 | Repo scaffold, docs, CI; team confirms the architecture decisions | Adam | M | 1→2 | Scaffold on `main` ✅; D1–D3, D5, D6, D8, D11, D12 marked `Accepted` in the [decision log](ARCHITECTURE.md#decision-log) | #3 |
| CS-010 | Pipeline: fetch the bands both methods need (blue, green, red, NIR + cloud mask) for a region + year, only inside the region's box | Kevin | M | 2 | `uv run chlorosat fetch --region okc-norman --year 2024` saves band GeoTIFFs to `pipeline/data/raw/` and prints the scene ID + cloud % | |
| CS-011 | Pipeline: NDVI → colored PNG → export + manifest entry | Carter | M | 2 | `test_ndvi.py` passes; `web/public/data/okc-norman/ndvi/<year>.png` is < 2 MB; `manifest.json` lists the year under `layers.ndvi` | |
| CS-012 | Web: Leaflet map + vegetation overlay from `manifest.json` | David | M | 2 | `npm run dev` shows the map + overlay (placeholder PNG OK); `npm run build` still works. *Map done in #4 by Lucas (CS-049); left: the overlay (`VegetationLayer` is a stub)* | #4 (part) |
| CS-014 | UX: wireframes, theme tokens, header + page layout | Lucas | M | 2 | Wireframes + feedback notes from 1–2 non-technical people in `docs/design/`; header/layout match the wireframes and work at phone width. *Tokens, header, layout done in #4 (CS-049); left: wireframes + feedback* | #4 (part) |
| CS-027 | Server (Adam only): GitHub `production` environment + secrets, repo security settings, nginx cache headers; watch the first auto-deploy | Adam | M | 3 | Environment + secrets exist ✅; cache headers show in `curl -I https://chlorosat.com/data/manifest.json`; first auto-deploy checked. *Only the last two left* | |

## Backlog
| ID | Task | Owner | Pri | Sprint | Done when | PR |
|---|---|---|---|---|---|---|
| CS-020 | Pipeline: multi-year cloud-masked summer composites (all methods, one shared grid) + `run` command | David | M | 3 | `uv run chlorosat run --region okc-norman --years 2019-2025` writes one PNG (< 2 MB) + `<year>.json` per method per year | |
| CS-021 | Pipeline: yearly stats + change maps/stats (any method) | Lucas | M | 3 | Output matches the [data contract](ARCHITECTURE.md#data-contract); tests use tiny hand-made arrays | |
| CS-022 | Web: method toggle, year selector, legend, stats panel, loading + error states | Kevin | M | 3 | Switching method or year swaps the overlay, legend, and stats; the active method is always labeled; works by keyboard and at phone width. *Toggle, year slider, legend UI done in #4 (Lucas, agreed with Kevin); left: `StatsPanel`, read years + methods from `manifest.json` (hard-coded now), swap the overlay on change* | #4 (part) |
| CS-023 | Web: compare mode, About page (incl. why the methods differ), usability test | Adam | M | 3 | Compare works for every pair in `layers[method].changes`; About page checked by a non-technical person; test notes from 3 people in `docs/design/usability-1.md` | |
| CS-025 | Web: base map toggle (satellite / streets) | *TBD* | M | | Satellite button shows satellite imagery, Map shows the street map, each with its attribution. *Buttons done in #4; left: swap the tiles (pick a satellite tile source)* | #4 (part) |
| CS-026 | Pipeline: visible-light method: pick the index (D9) + `visible.py` + tests | Carter | M | 3 | Tests pass; `run --methods visible` output looks sensible on the map; D9 updated; 3–5 spots where it disagrees with NDVI written up. *Research done early in #6: [visible-detection.md](research/visible-detection.md) proposes VARI (GLI as fallback) on the same Sentinel-2 scenes, rules for `visible.py`, a breakpoint calibration plan, and candidate disagreement spots in OKC. Left: team OK on D9, `visible.py` + tests, calibrated breakpoints, real examples* | #6 (part) |
| CS-030 | Address / place search (Nominatim) | | S | | Typing a place + Enter moves the map there; follows Nominatim's usage policy (max 1 request/s, attribution). *Search bar UI in #4, does nothing yet* | #4 (UI) |
| CS-031 | Neighborhood / ZIP stats (census boundaries) | | S | | Picking a neighborhood or ZIP shows the stats for just that area | |
| CS-032 | Shareable link | | S | | The URL holds the method + year + view; opening the link restores them | |
| CS-033 | Mobile-friendly layout polish | | S | | Every page works at 360 px wide; no controls overlap | |
| CS-034 | Show data source + dates on the map itself | | S | | The map shows source, date range, and resolution for the layer on screen | |
| CS-035 | Opacity slider for overlays | | S | | Moving the slider changes the overlay's see-through level right away. *Slider done in #4; takes effect once the overlay exists (CS-012)* | #4 (part) |
| CS-036 | Uptime monitor + Lighthouse performance check | | S | 5 | Alerts when the site is down; Lighthouse mobile performance ≥ 90 | |
| CS-037 | Side-by-side / swipe view: infrared vs visible light | | C | | Both methods on one map with a drag handle between them | |
| CS-040 | More regions (config only) | | C | | A new `regions.toml` entry + a pipeline run adds a region, with no code changes | |
| CS-041 | Download PNG / CSV of stats | | C | | Buttons download the current overlay PNG and its stats as CSV | |
| CS-042 | Stats for a user-drawn area | | C | | Team decides first: needs an API, which conflicts with D1 (static site) | |
| CS-043 | Time-lapse animation across years | | C | | A play button steps through the years automatically | |
| CS-044 | Long history before 2019 via Landsat | | C | | Years before 2019 appear on the same grid, with the source labeled | |
| CS-045 | XYZ tiles for large regions / more detail | | C | | Regions load as map tiles; no single file > 2 MB | |
| CS-046 | "Recommended" view: infrared + visible light combined as the default layer | | | | Team decides D8 first; if yes, the combined layer is in the data contract + pipeline output, and the view menu reads it from `manifest.json`. *UI in #4* | #4 (UI) |
| CS-047 | Change hotspot pins on the map (gained / lost) | | | | Team decides first (not in the data contract yet); pins come from pipeline data and match the legend. *Legend entry in #4* | #4 (UI) |
| CS-048 | Recenter button | | | | The button returns the map to the region's starting view. *Button in #4, does nothing yet* | #4 (UI) |

*CS-046 to CS-048 came from PR #4 and still need a priority (Lucas, CS-001). CS-025 needs an owner.*

## Done
| ID | Task | Owner | Sprint | Done when | PR |
|---|---|---|---|---|---|
| CS-000 | Repo created, README, branding assets | Team | 1 | Repo exists with README + logo | #2 |
| CS-004 | Tech stack research write-up | Carter | 1→2 | [tech-stack.md](research/tech-stack.md) filled in: final choices, options compared, trade-offs, sources | #6 |
| CS-013 | Server (Adam only): domain/DNS, nginx site + HTTPS, locked deploy key, `deploy.sh`, branch protection | Adam | 2 | `https://chlorosat.com` serves the site with valid HTTPS and Adam's personal site still works; `deploy.sh` deploys in one command; the deploy key refuses a shell; [DEPLOYMENT.md](DEPLOYMENT.md) checklist filled in | #5 |
| CS-049 | UX: map page UI: Leaflet base map locked to the region; floating "glass" controls (year slider, opacity slider, View settings menu with accuracy warnings, legend built from `manifest.json` incl. change hotspots, search bar, zoom + recenter, Satellite/Map buttons); site header; design tokens + one CSS Module per component; README update | Lucas | 2 | Every planned map control is laid out and usable by keyboard; legend colors come from `manifest.json`; header on every page; `npm run build` works. *Controls get wired to real data in CS-012, CS-022, CS-025, CS-030, CS-035* | #4 |
| CS-024 | DevOps: `deploy.yml` auto-deploy (CD) + CI caching | Adam (from Carter) | 2 (pulled forward from 3) | Merging a PR updates the live site automatically; CI reuses downloaded packages. *Path filters not added: team decision* | #7 |
| CS-038 | Landing page becomes the home page; the map moves to `/map/` behind an "Open map" button (D11) | Adam | 2 (pulled forward) | `/` shows the landing page with an Open map button; `/map/` shows the map; Leaflet only loads on `/map/` | #7 |
