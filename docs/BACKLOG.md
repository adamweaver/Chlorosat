# Backlog

Simple tracker. **Move rows between sections** as work progresses; put the PR link in the last column.
Priority: **M**ust / **S**hould / **C**ould. Draft seed list, **Lucas to finalize** (CS-001).

## In Progress
| ID | Item | Pri | Owner | Sprint | PR |
|---|---|---|---|---|---|
| CS-001 | Finalize feature scope & backlog priorities | M | Lucas | 1→2 | |
| CS-002 | Data source research → pick source (D7) | M | Kevin | 1→2 | |
| CS-003 | NDVI method research write-up | M | David | 1→2 | |
| CS-005 | Repo scaffold, docs, CI | M | Adam | 1→2 | |
| CS-010 | Pipeline: fetch bands (RGB + NIR + cloud mask) for a region + year | M | Kevin | 2 | |
| CS-011 | Pipeline: NDVI → colored PNG → export + manifest | M | Carter | 2 | |
| CS-012 | Web: Leaflet map + vegetation overlay from manifest. *Map done in #4 (Lucas); left: the overlay (`VegetationLayer` is a stub)* | M | David | 2 | #4 (part) |
| CS-014 | UX: wireframes, theme tokens, header + layout. *Tokens, header, layout done in #4; left: wireframes + feedback notes in `docs/design/`* | M | Lucas | 2 | #4 (part) |
| CS-027 | Server (Adam only): GitHub `production` environment + secrets, repo security settings, nginx cache headers | M | Adam | 3 | |

## Backlog
| ID | Item | Pri | Owner | Sprint | PR |
|---|---|---|---|---|---|
| CS-020 | Pipeline: multi-year cloud-masked composites (all methods) + `run` command | M | David | 3 | |
| CS-021 | Pipeline: yearly stats + change maps/stats (all methods) | M | Lucas | 3 | |
| CS-022 | Web: method toggle, year selector, legend, stats panel. *Toggle, year slider, legend UI done in #4 (Lucas, agreed with Kevin); left: `StatsPanel`, read years + methods from `manifest.json` (hard-coded now), swap the overlay on change* | M | Kevin | 3 | #4 (part) |
| CS-023 | Web: compare mode, About page (incl. why methods differ), usability test | M | Adam | 3 | |
| CS-024 | DevOps: `deploy.yml` auto-deploy (CD), CI caching + path filters | M | Adam | 3 | |
| CS-025 | Web: base map toggle (satellite / streets). *Buttons done in #4; left: actually swap to satellite tiles (pick a tile source)* | M | | | #4 (part) |
| CS-026 | Pipeline: visible-light method: pick index (D9) + `visible.py` + tests | M | Carter | 3 | |
| CS-030 | Address / place search (Nominatim, respect its usage policy). *Search bar UI in #4, does nothing yet* | S | | | #4 (UI) |
| CS-031 | Neighborhood / ZIP stats (census boundaries) | S | | | |
| CS-032 | Shareable link (method + year + view saved in URL) | S | | | |
| CS-033 | Mobile-friendly layout polish | S | | | |
| CS-034 | Show data source + dates on the map itself (transparency) | S | | | |
| CS-035 | Opacity slider for overlays. *Slider done in #4; takes effect once the overlay exists (CS-012)* | S | | | #4 (part) |
| CS-036 | Uptime monitor + Lighthouse performance check | S | | 5 (perf testing) | |
| CS-038 | Port `web/landing/` into the Next.js home page; move the map page (`src/app/page.js` → `src/app/map/page.js`) to `/map/` behind a button (D11) | S | | | |
| CS-037 | Side-by-side / swipe view: infrared vs visible light | C | | | |
| CS-040 | More regions (config only) | C | | | |
| CS-041 | Download PNG / CSV of stats | C | | | |
| CS-042 | Stats for a user-drawn area (needs an API; conflicts with D1, discuss) | C | | | |
| CS-043 | Time-lapse animation across years | C | | | |
| CS-044 | Long history before 2019 via Landsat | C | | | |
| CS-045 | XYZ tiles for large regions / more detail | C | | | |
| CS-046 | "Recommended" view: infrared + visible light combined as the default layer. *UI in #4; needs a D8 + data contract change (team decision). Lucas to prioritize* | | | | #4 (UI) |
| CS-047 | Change hotspot pins on the map (gained / lost). *Legend entry in #4; not in the data contract yet (team decision). Lucas to prioritize* | | | | #4 (UI) |
| CS-048 | Recenter button. *Button in #4, does nothing yet. Lucas to prioritize* | | | | #4 (UI) |

## Done
| ID | Item | Owner | Sprint | PR |
|---|---|---|---|---|
| CS-000 | Repo created, README, branding assets | Team | 1 | #2 |
| CS-004 | Tech stack research write-up | Carter | 1→2 | #6 |
| CS-013 | Server (Adam only): domain/DNS, nginx site + HTTPS, locked deploy key, `deploy.sh`, branch protection | Adam | 2 | #5 |
