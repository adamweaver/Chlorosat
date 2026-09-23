# Backlog

Simple tracker. **Move rows between sections** as work progresses; put the PR link in the last column.
Priority: **M**ust / **S**hould / **C**ould. Draft seed list, **Lucas to finalize** (CS-001).

## In Progress
| ID | Item | Pri | Owner | Sprint | PR |
|---|---|---|---|---|---|
| CS-001 | Finalize feature scope & backlog priorities | M | Lucas | 1→2 | |
| CS-002 | Data source research → pick source (D7) | M | Kevin | 1→2 | |
| CS-003 | NDVI method research write-up | M | David | 1→2 | |
| CS-004 | Tech stack research write-up | M | Carter | 1→2 | |
| CS-005 | Repo scaffold, docs, CI | M | Adam | 1→2 | |
| CS-010 | Pipeline: fetch bands (RGB + NIR + cloud mask) for a region + year | M | Kevin | 2 | |
| CS-011 | Pipeline: NDVI → colored PNG → export + manifest | M | Carter | 2 | |
| CS-012 | Web: Leaflet map + vegetation overlay from manifest | M | David | 2 | |
| CS-013 | Server (Adam only): domain/DNS, nginx site + HTTPS, locked deploy key, `deploy.sh`, branch protection | M | Adam | 2 | |
| CS-014 | UX: wireframes, theme tokens, header + layout | M | Lucas | 2 | |

## Backlog
| ID | Item | Pri | Owner | Sprint | PR |
|---|---|---|---|---|---|
| CS-020 | Pipeline: multi-year cloud-masked composites (all methods) + `run` command | M | David | 3 | |
| CS-021 | Pipeline: yearly stats + change maps/stats (all methods) | M | Lucas | 3 | |
| CS-022 | Web: method toggle, year selector, legend, stats panel | M | Kevin | 3 | |
| CS-023 | Web: compare mode, About page (incl. why methods differ), usability test | M | Adam | 3 | |
| CS-024 | DevOps: `deploy.yml` auto-deploy (CD), CI caching + path filters | M | Carter | 3 | |
| CS-025 | Web: base map toggle (satellite / streets) | M | | | |
| CS-026 | Pipeline: visible-light method: pick index (D9) + `visible.py` + tests | M | Carter | 3 | |
| CS-027 | Server (Adam only): GitHub `production` environment + secrets, nginx cache headers | M | Adam | 3 | |
| CS-030 | Address / place search (Nominatim, respect its usage policy) | S | | | |
| CS-031 | Neighborhood / ZIP stats (census boundaries) | S | | | |
| CS-032 | Shareable link (method + year + view saved in URL) | S | | | |
| CS-033 | Mobile-friendly layout polish | S | | | |
| CS-034 | Show data source + dates on the map itself (transparency) | S | | | |
| CS-035 | Opacity slider for overlays | S | | | |
| CS-036 | Uptime monitor + Lighthouse performance check | S | | 5 (perf testing) | |
| CS-037 | Side-by-side / swipe view: infrared vs visible light | C | | | |
| CS-040 | More regions (config only) | C | | | |
| CS-041 | Download PNG / CSV of stats | C | | | |
| CS-042 | Stats for a user-drawn area (needs an API; conflicts with D1, discuss) | C | | | |
| CS-043 | Time-lapse animation across years | C | | | |
| CS-044 | Long history before 2019 via Landsat | C | | | |
| CS-045 | XYZ tiles for large regions / more detail | C | | | |

## Done
| ID | Item | Owner | Sprint | PR |
|---|---|---|---|---|
| CS-000 | Repo created, README, branding assets | Team | 1 | #2 |
