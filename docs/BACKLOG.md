# Backlog

Every task for Chlorosat: who owns it, when it counts as done, and where it stands.
The live site is the worldwide MapLibre globe ([ARCHITECTURE.md](ARCHITECTURE.md)). The sprint
plans in [docs/scrum/](scrum/) were written for the earlier Leaflet/PNG design; their task IDs
(`CS-0xx`) are kept here so history stays traceable.

**How to use it:** pick a task from **To do**, tell the team, open a PR, and when it merges move the
row to **Done** with the PR number.

- **Pri** (priority): **M**ust · **S**hould · **C**ould. Draft by Lucas (CS-001); confirmed at sprint reviews.
- **Done when:** the acceptance criteria. A reviewer can check each one.
- **Status:** ✅ done · ◐ partly done · ○ not started · ✕ retired (no longer fits the product).

*Last updated 2026-10-12 (end of Sprint 3, review on Oct 14).*

## Working now

- Worldwide MapLibre globe.
- NASA MODIS NDVI for one selected year.
- Satellite and street basemaps.
- Year, opacity and visibility controls.
- Search, geolocation, zoom, recenter and compass controls.
- Home and About pages.
- Static build, CI and automatic deployment.

## Milestones
From [PRINCIPLES.md](PRINCIPLES.md). The team switched from the Leaflet/PNG plan to the NASA-fed globe in Sprint 3 (#9), so some milestones were met in a different form.

| Milestone | Date | Result |
|---|---|---|
| **Bare-bones:** real NDVI on a map; site live over HTTPS; CI on every PR | Sep 30 (end of Sprint 2) | ◐ Site live with HTTPS, CI and auto-deploy (#5, #7). NDVI pipeline works on local files (#8). Real NDVI on the map arrived Oct 6 with the globe (#9). |
| **Somewhat usable & live:** several years + year picker + legend on chlorosat.com | ~Oct 7 | ✅ Met Oct 6 (#9): 2019–2026, year slider, legend, worldwide. |
| **v0.1:** + visible-light method, year comparison, basic stats | Oct 14 (end of Sprint 3) | ○ Not met: comparison, statistics and visible light are not implemented. Scope to be decided at the Sprint 3 review. |
| **v1.0:** polished, tested, documented, fast | ~Nov 9–22 | Planned at the Sprint 3 review. |

## Who's doing what
| Person | Sprint 2 (Sep 16 → 30) | Sprint 3 (Sep 30 → Oct 14) |
|---|---|---|
| Adam | CS-005 ✅ · CS-013 ✅ · CS-024 ✅ · CS-038 ✅ | CS-023 ◐ · CS-027 ✅ · CS-054 ✅ |
| Carter | CS-004 ✅ · CS-011 ✅ | CS-026 ◐ (research done) |
| David | CS-003 ○ · CS-012 ✅ | CS-020 ○ · CS-050 ✅ (globe) · CS-051 ✅ · CS-052 ✅ |
| Kevin | CS-002 ○ · CS-010 ○ | CS-022 ◐ (finished by others) |
| Lucas | CS-001 ◐ · CS-014 ◐ · CS-049 ✅ | CS-021 ○ · CS-053 ✅ |

## To do
| ID | Task | Owner | Pri | Done when | Status / PR |
|---|---|---|---|---|---|
| CS-001 | Finalize feature scope & backlog priorities | Lucas | M | Priorities in this file agreed by the team at a sprint review | ◐ Started in #4; priorities for the globe-era scope not confirmed yet |
| CS-002 | Data source research for the future pipeline | Kevin | S | [data-sources.md](research/data-sources.md) filled in with a recommendation | ○ Still a TODO |
| CS-003 | NDVI research write-up (method, thresholds, sources) | David | S | [ndvi.md](research/ndvi.md) questions answered | ○ Still a TODO |
| CS-010 | Pipeline: fetch bands for a region + year (`fetch.py`, `config.py`) | Kevin | C | `uv run chlorosat fetch --region okc-norman --year 2024` saves band GeoTIFFs and prints the scene ID + cloud % | ○ Future pipeline; stubs only |
| CS-014 | UX: wireframes + feedback (header, tokens and layout done) | Lucas | S | Wireframes + notes from 1–2 non-technical people in `docs/design/`; layout works at phone width | ◐ Tokens, header, layout in #4; no wireframes or feedback in the repo |
| CS-020 | Pipeline: cloud-masked seasonal composites + multi-year `run` command | David | C | `run --region okc-norman --years 2019-2025` writes one layer + stats per year | ○ Future pipeline; stubs only |
| CS-021 | Pipeline: yearly stats + change maps | Lucas | C | Stats/change output with tests on tiny hand-made arrays | ○ Future pipeline; stubs only |
| CS-022 | Web: map controls + stats panel | Kevin | M | Year, legend and opacity controls work by keyboard and at phone width; stats panel shows numbers for the year on screen | ◐ Year slider, legend, opacity done (#4 Lucas, #9 David). Method toggle retired (one data source). Stats panel waits on statistics (CS-031) |
| CS-023 | Web: compare two years, About page, usability test | Adam | M | Two years can be compared on the globe; About page checked by a non-technical person; notes from 3 testers in `docs/design/usability-1.md` | ◐ About page done (#9, #14). Comparison and usability test not started |
| CS-026 | Visible-light method: pick the index, `visible.py`, tests | Carter | C | Tests pass; index choice approved by the team; 3–5 real spots where it disagrees with NDVI written up | ◐ Research done (#6): VARI proposed. Implementation not started |
| CS-031 | Statistics for a place or area (e.g. neighborhood / ZIP) | | S | Picking a place shows simple vegetation numbers for it | ○ |
| CS-032 | Shareable link | | S | The URL holds year, view and location; opening the link restores them | ○ |
| CS-033 | Mobile check at small sizes | | S | Every page works at 360 px wide; no controls overlap | ◐ Phone layouts built (#9, #11); not yet checked at 360 px |
| CS-034 | Show data source + dates on the map | | S | The map names the NDVI source and its date (mid-August composite) for the year on screen | ◐ Credit line names NASA MODIS and the imagery capture years (#9); the NDVI date isn't shown |
| CS-036 | Uptime monitor + Lighthouse performance check | | S | Alerts when the site is down; Lighthouse mobile performance ≥ 90 | ○ |
| CS-037 | Side-by-side / swipe view of two layers | | C | Two layers on one map with a drag handle between them | ○ |
| CS-041 | Download map image / stats | | C | Buttons download the current view and its stats | ○ |
| CS-042 | Stats for a user-drawn area | | C | Team decides first: needs client processing or a backend (conflicts with the static site) | ○ |
| CS-043 | Time-lapse across years | | C | A play button steps through the years automatically | ○ |
| CS-044 | Longer history (before 2019) | | C | Earlier years appear, with their source labeled | ○ |
| CS-047 | Change hotspot pins (gained / lost) | | C | Pins come from a real two-year comparison and match the legend | ○ Needs comparison (CS-023) first |
| CS-055 | Colorblind-friendly vegetation colors | | S | The NDVI scale passes a color-blindness check (e.g. no red↔green-only contrast); legend matches | ○ Planned follow-up from #9 (accessibility) |
| CS-056 | Remove unused loading-badge styles (`.loadingBadge`, `.spinner` in `Globe.module.css`) | | C | Styles removed; build and phone layout unchanged | ○ Found in #15 |

## Done
| ID | Task | Owner | Done when | PR |
|---|---|---|---|---|
| CS-000 | Repo created, README, branding assets | Team | Repo exists with README + logo | #2 |
| CS-004 | Tech stack research write-up | Carter | [tech-stack.md](research/tech-stack.md) filled in: choices, options compared, trade-offs, sources | #6 |
| CS-005 | Repo scaffold, docs, CI; decisions recorded | Adam | Scaffold on `main`; decisions recorded in [ARCHITECTURE.md](ARCHITECTURE.md#decisions) | #3, #14 |
| CS-011 | Pipeline: NDVI → colored PNG → export + manifest (local files) | Carter | `test_ndvi.py` passes; PNG < 2 MB; manifest lists the year | #8 |
| CS-012 | Web: map with a vegetation layer | David | The map shows real vegetation data; `npm run build` works. *Delivered as the globe (CS-050) instead of Leaflet + pipeline PNGs* | #4, #9 |
| CS-013 | Server (Adam only): domain/DNS, nginx + HTTPS, locked deploy key, `deploy.sh`, branch protection | Adam | `https://chlorosat.com` serves the site over HTTPS; the personal site still works; `deploy.sh` deploys in one command; the deploy key refuses a shell | #5 |
| CS-024 | Auto-deploy (`deploy.yml`) + CI caching | Adam | Merging a PR updates the live site automatically | #7 |
| CS-025 | Base map switch (satellite / street map) | David | Satellite shows imagery, Map shows the street map, each credited | #9 |
| CS-027 | Server (Adam only): `production` environment + secrets, repo security settings, cache headers, first auto-deploy | Adam | Secrets exist; build files served with long-term cache headers; merges deploy automatically (checked 2026-10-12) | #5, #7 |
| CS-030 | Place search | David | Typing a place + Enter moves the map there; follows the search service's usage policy (Photon) | #9, #11 |
| CS-035 | Vegetation opacity slider | David | The slider changes the vegetation layer's opacity right away | #9 |
| CS-038 | Landing page as home page; map at `/map/` behind an "Open map" button | Adam | `/` shows the landing page; `/map/` shows the map; map code only loads on `/map/` | #7 |
| CS-048 | Recenter button | David | Returns the globe to its starting view | #9 |
| CS-049 | UX: first map page UI (glass controls, header, design tokens, CSS Modules) | Lucas | Every planned control laid out and usable by keyboard; header on every page | #4 |
| CS-050 | Worldwide globe: MapLibre + NASA MODIS NDVI, Esri satellite + Wayback by year, OpenFreeMap map view + labels, phone layout, About page | David | Globe shows NDVI for 2019–2026 worldwide with all controls working on desktop and phone | #9 |
| CS-051 | Fix missing place names on the live site (MapLibre worker served as `.js`) | David | Labels and the Map view load on chlorosat.com | #10 |
| CS-052 | Map fixes: country/state names, search framing, approximate vs. precise location | David | Names correct (e.g. Türkiye, Hawaii); search results framed on screen; location dot and accuracy circle behave | #11, #12, #13 |
| CS-053 | Docs + UML match the globe; Leaflet-era code removed; `web/src` reorganized | Lucas | Docs describe the running site; no unused Leaflet code; build passes | #14 |
| CS-054 | README for the review checklist, screenshots, code comments up to date, backlog + sprint status | Adam | README meets the review checklist; comments match the code; this file and the sprint plans match what was done | #15 |

## Retired
No longer fits the product since the switch to the NASA-fed globe (#9).

| ID | Task | Why |
|---|---|---|
| CS-040 | More regions by config | The globe already works worldwide |
| CS-045 | XYZ tiles for large regions | NASA serves NDVI as map tiles already |
| CS-046 | "Recommended" combined view | The live site has one data source and no method selector |
| — | Method toggle (part of CS-022) | Same reason as CS-046; returns only if the visible-light method reaches the site |

## Current maintenance

- Verify remote data-source behavior and attribution regularly.
- Keep mobile controls accessible and non-overlapping.
- Keep documentation synchronized with the running site.
- Test build size and performance on average phones.
- Revisit the disabled synthetic-detail path in
  `web/src/lib/map/chlorosatGlobeEngine.js`. Its noise functions are retained
  but inactive (`octaves: 0`, `noiseAmt: 0`) because they created fake
  fine-grained NDVI and changed patterns between zoom levels. Do not re-enable
  them unless the display is clearly identified as modeled rather than
  measured data.

## Future pipeline

The Python package is intentionally retained but disconnected from the site.
Before integration it still needs:

1. Scene discovery and band download (CS-010).
2. Cloud masking and seasonal composites (CS-020).
3. Visible-light vegetation detection (CS-026).
4. Year and change statistics (CS-021).
5. Multi-year orchestration (CS-020).
6. An approved output format and globe integration.

Current status: [pipeline/README.md](../pipeline/README.md).

## Decision gates

Ask the team before:

- Adding a backend or server-side processing.
- Connecting pipeline output to the live globe.
- Defining a new persistent data contract.
- Adding a dependency or changing deployment.
- Presenting inferred or synthetic values as measured vegetation.
