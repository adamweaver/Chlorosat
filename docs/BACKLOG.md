# Backlog

Every task for Chlorosat: who owns it, when it counts as done, and where it stands.
The live site is the worldwide MapLibre globe ([ARCHITECTURE.md](ARCHITECTURE.md)). Sprints 2–3 in
[docs/scrum/](scrum/) were planned for the earlier Leaflet/PNG design; Sprints 4–5 follow the globe.
Task IDs (`CS-0xx`) never change, so history stays traceable.

**How to use it:** pick a task from **To do**, tell the team, and open a PR. In that same PR, move
the row to **Done** with the PR number (`main` only takes changes through PRs).

- **Pri** (priority): **M**ust · **S**hould · **C**ould. Draft by Lucas (CS-001); confirmed at sprint reviews.
- **Done when:** the acceptance criteria. A reviewer can check each one.
- **Status:** ✅ done · ◐ partly done · ○ not started · ✕ retired (no longer fits the product).
  In sprint views (*Who's doing what* and the [sprint files](scrum/)), ⏸ marks a task that was
  **delayed**: planned for that sprint, not finished, and carried over.

*Last updated 2026-10-30 (Sprint 5, day 3).*

## Working now

- Worldwide MapLibre globe.
- NASA MODIS NDVI for one selected year.
- Satellite and street basemaps.
- Year, opacity and visibility controls.
- Search, geolocation, zoom, recenter and compass controls.
- Average vegetation (NDVI) inside an outline you draw on the globe, for the year on screen (#21).
- Home and About pages.
- Web unit tests (`npm test`) plus the pipeline tests, run by CI on every PR (#22, #24).
- Static build, CI and automatic deployment.

## Milestones
First set in PRINCIPLES.md (#3); #14 removed them from there, so this table is now the record. The
course scrum plan ([sprint-1-plan.pdf](scrum/sprint-1-plan.pdf)) sets each sprint's expectation. The
team switched from the Leaflet/PNG plan to the NASA-fed globe in Sprint 3 (#9), so some milestones
were met in a different form.

| Milestone | Date | Result |
|---|---|---|
| **Bare-bones:** real NDVI on a map; site live over HTTPS; CI on every PR | Sep 30 (end of Sprint 2) | ◐ Site live with HTTPS, CI and auto-deploy (#5, #7). NDVI pipeline works on local files (#8). Real NDVI on the map arrived Oct 6 with the globe (#9). |
| **Somewhat usable & live:** several years + year picker + legend on chlorosat.com | ~Oct 7 | ✅ Met Oct 6 (#9): 2019–2026, year slider, legend, worldwide. |
| **v0.1:** + visible-light method, year comparison, basic stats | Oct 14 (end of Sprint 3) | ◐ Not met by Oct 14, and no new scope was recorded at the review. Since then: one basic statistic, the drawn-outline average (#21, Oct 29), and change math that isn't on the map yet (#18). Visible light not started. |
| **v1.0:** polished, tested, documented, fast | ~Nov 9–22 (Sprints 5–6) | ◐ In progress: [Sprint 5](scrum/sprint-5.md) is performance testing and bug fixing, Sprint 6 (Nov 11 → 25) polishing. Scope still to be agreed (CS-001). |

## Who's doing what
Sprint 5 is a draft until the team confirms it at planning ([sprint-5.md](scrum/sprint-5.md)).

| Person | Sprint 2 (Sep 16 → 30) | Sprint 3 (Sep 30 → Oct 14) | Sprint 4 (Oct 14 → 28) | Sprint 5 (Oct 28 → Nov 11, now) |
|---|---|---|---|---|
| Adam | CS-005 ⏸ · CS-013 ✅ · CS-024 ✅ · CS-038 ✅ | CS-023 ⏸ · CS-027 ✅ · CS-054 ✅ | CS-023 ⏸ · CS-061 ⏸ | CS-005 ◐ · CS-023 ◐ · CS-036 ○ · CS-061 ✅ · CS-062 ✅ · CS-068 ✅ |
| Carter | CS-004 ✅ · CS-011 ✅ | CS-026 ⏸ (research done) | CS-026 ⏸ · CS-057 ⏸ | CS-033 ◐ · CS-055 ○ · CS-057 ✅ · CS-063 ○ · CS-067 ○ |
| David | CS-003 ⏸ · CS-012 ✅ | CS-020 ⏸ · CS-050 ✅ (globe) · CS-051 ✅ · CS-052 ✅ | CS-020 ⏸ · CS-035 ✅ (load-opacity fix) · CS-059 ✅ · CS-066 ○ (draft branch, unplanned) | CS-034 ◐ · CS-056 ○ · CS-064 ○ · CS-066 ○ |
| Kevin | CS-002 ⏸ · CS-010 ⏸ | CS-022 ⏸ | CS-022 ⏸ · CS-058 ⏸ | CS-022 ○ · CS-058 ○ |
| Lucas | CS-001 ⏸ · CS-014 ⏸ · CS-049 ✅ | CS-021 ⏸ · CS-053 ✅ | CS-021 ⏸ · CS-060 ⏸ | CS-001 ◐ · CS-042 ◐ · CS-060 ◐ · CS-063 ○ · CS-065 ○ |

## To do
Owners of CS-033, CS-034, CS-036, CS-055, CS-056, CS-063, CS-064, CS-065 and CS-067 are proposals until the team confirms them at Sprint 5 planning.

| ID | Task | Owner | Pri | Done when | Status / PR |
|---|---|---|---|---|---|
| CS-001 | Finalize feature scope & backlog priorities | Lucas | M | Priorities in this file agreed by the team; the agreement is recorded in a sprint file's Review section | ◐ Delayed since Sprint 1. Started in #4; priorities for the globe-era scope not confirmed yet |
| CS-002 | Data source research for the future pipeline | Kevin | S | The *Team findings* in [data-sources.md](research/data-sources.md) answer its questions and recommend one source | ○ Delayed since Sprint 1. Team findings still a TODO |
| CS-003 | NDVI research write-up (method, thresholds, sources) | David | S | The *Team findings* in [ndvi.md](research/ndvi.md) answer its questions, with sources | ○ Delayed since Sprint 1. Team findings still a TODO |
| CS-005 | Repo scaffold, docs, CI; team confirms the architecture decisions | Adam | M | Scaffold on `main`; the team has discussed the [decisions](ARCHITECTURE.md#decisions) and their statuses are updated | ◐ Delayed since Sprint 1. Scaffold, docs and CI done (#3); decisions not discussed yet. Averaging in the browser (#21) needs a decision row too |
| CS-010 | Pipeline: fetch bands for a region + year (`fetch.py`, `config.py`) | Kevin | C | `uv run chlorosat fetch --region okc-norman --year 2024` saves band GeoTIFFs and prints the scene ID + cloud % | ○ Delayed since Sprint 2. Stubs only |
| CS-014 | UX: wireframes + feedback (header, tokens and layout done) | Lucas | S | Wireframes for upcoming features (e.g. year comparison) + notes from 1–2 non-technical people in `docs/design/`; layout works at phone width | ◐ Delayed since Sprint 2. Tokens, header, layout in #4; no wireframes or feedback in the repo |
| CS-020 | Pipeline: cloud-masked seasonal composites + multi-year `run` command | David | C | `run --region okc-norman --years 2019-2025` writes one layer + stats per year | ○ Delayed since Sprint 3. Future pipeline; stubs only |
| CS-021 | Pipeline: yearly stats + change maps | Lucas | C | `stats.py` and `export.write_change` work, with tests on tiny hand-made arrays | ○ Delayed since Sprint 3. Future pipeline; stubs only |
| CS-022 | Web: map controls + stats panel | Kevin | M | Year slider, opacity slider and show/hide toggle work by keyboard (visible focus; a screen reader reads the year) and at phone width; a stats panel shows numbers for the year on screen | ○ Delayed since Sprint 3. Not started |
| CS-023 | Web: compare two years, About page, usability test | Adam | M | Picking two years shows gained/lost vegetation on the globe with its own legend; About page checked by a non-technical person; notes from 3 testers in `docs/design/usability-1.md` | ◐ Delayed since Sprint 3. Change math, year-range check and change colors written and tested (CS-061, #18, #24) but not on the globe. The About page exists (#9, #14) but hasn't been checked. Usability test not started |
| CS-026 | Visible-light method: pick the index, `visible.py`, tests | Carter | C | `visible.py` works and `test_visible.py` has real, passing tests (not skipped); index choice approved by the team; 3–5 real spots where it disagrees with NDVI written up | ◐ Delayed since Sprint 3. Research done (#6): VARI proposed. Implementation not started |
| CS-031 | Statistics for a place or area (e.g. neighborhood / ZIP) | | S | Picking a place shows simple vegetation numbers for it | ○ A drawn outline shows an average (CS-042); picking a place shows nothing yet |
| CS-032 | Shareable link | | S | The URL holds year, view and location; opening the link restores them | ○ |
| CS-033 | Mobile check at small sizes | Carter | S | Every page works at 360 px wide; no controls overlap, including the phone menu and the region tool while drawing | ◐ Phone layouts built (#9, #11); #21 added phone rules for the region tool. Not yet checked at 360 px |
| CS-034 | Show data source + dates on the map | David | S | The map names the NDVI source and its date (mid-August composite) for the year on screen, without hovering | ◐ Credit line names NASA MODIS and the satellite photos' capture years (#9); the NDVI date isn't shown (only on hover in the region readout, #21) |
| CS-036 | Uptime monitor + Lighthouse performance check | Adam | S | Alerts when the site is down; Lighthouse mobile performance ≥ 90 | ○ |
| CS-037 | Side-by-side / swipe view of two layers | | C | Two layers on one map with a drag handle between them | ○ |
| CS-041 | Download map image / stats | | C | Buttons download the current view and its stats | ○ |
| CS-042 | Stats for a user-drawn area | Lucas | C | The team's OK for averaging in the browser is recorded (ARCHITECTURE decisions); 3+ corners and **Finish** show the average NDVI of land inside the outline for the year on screen (or "No data"), updating with the year; the year and the water/no-data rule are visible without hovering; the About page, ARCHITECTURE and UML describe the tool, and no doc still says statistics are missing | ◐ Drawing tool and in-browser average work (#21); since #24 (Adam) the average runs through tested `region.js` helpers and the README describes the tool. Not yet: a label visible without hovering, the About page and other docs, the recorded decision |
| CS-043 | Time-lapse across years | | C | A play button steps through the years automatically | ○ |
| CS-044 | Longer history (before 2019) | | C | Earlier years appear, with their source labeled | ○ |
| CS-047 | Change hotspot pins (gained / lost) | | C | Pins come from a real two-year comparison and match the legend | ○ Needs comparison (CS-023) first |
| CS-055 | Colorblind-friendly vegetation colors | Carter | S | The NDVI scale passes a color-blindness check (e.g. no red↔green-only contrast); legend matches | ○ Still red → yellow → green: with red-green color blindness the low and high ends look almost the same |
| CS-056 | Remove unused loading-badge styles (`.loadingBadge`, `.spinner` in `Globe.module.css`) | David | C | Styles removed; build and phone layout unchanged | ○ Found in #15; still unused |
| CS-058 | Course unit tests: `buildLabel` (search result labels) | Kevin | M | Kevin's own tests for `buildLabel` cover correct, incorrect, boundary and edge cases and pass with `npm test` | ○ Delayed since Sprint 4. The current `buildLabel.test.mjs` (9 tests) was written and committed by David (#18) |
| CS-060 | Course unit tests: region stats (`buildBoundedRegions`, `calculateRegionStats`) | Lucas | M | Lucas's tests cover both functions (correct, incorrect, boundary, edge); the region tool's average uses `calculateRegionStats`; `npm test` passes | ◐ Delayed since Sprint 4. `buildBoundedRegions` + 6 tests (#18), used by the region tool (#21). Starter versions of `calculateRegionStats` and `containsPoint` (written by Adam in #24, now used by the region tool) are there for Lucas to review, extend and test |
| CS-063 | Code comments catch up with #18–#23 | Carter, Lucas | S | `[AI]` blocks ([AGENTS.md](../AGENTS.md) rule 10) on the AI-written code from #22 (`selectYear`, `plotYearData`, the three PlotGivenYear test files) and on `removeRegionOverlay` (#21); the headers of `MapApp.js` and `plotGivenYear.js` describe the current code; `npm test` still passes | ○ #22 says its AI-written code has no `[AI]` blocks. (The `region.js` and engine headers were updated in #24.) |
| CS-064 | Keyboard access for the basemap, recenter, locate and draw-region controls | David | S | Tab reaches each control with a visible focus ring and Enter/Space use it; the region tool can add a corner and cancel by keyboard | ○ Basemap, recenter and locate are `<div>`s a keyboard can't reach (#9); region corners need a mouse or touch (#21) |
| CS-065 | Region average follows the map's data rules | Lucas | S | Outlines over city no-data areas, failed NASA tiles or very large areas give a value consistent with the map, or the readout says what was left out; gap-filled pixels are left out or disclosed | ○ Found reviewing #21: the average skips no-data pixels the map paints as bare, keeps negative NDVI the map paints as 0, includes gap-filled pixels and silently skips failed tiles |
| CS-066 | Aquatic (algae / chlorophyll) layer | David | C | The team decides on the new data source ([decision gate](#decision-gates)). If kept: a PR from an up-to-date branch passes CI and the layer names its source and resolution. If dropped: the branch is deleted | ○ Needs a team decision. Draft branch `feature/algae-bloom` (Oct 14), no PR, behind `main` |
| CS-067 | Repo docs match the repo after #18–#24 | Carter | S | The AGENTS.md repo map lists `web/tests/` and AGENTS.md no longer calls every sprint file historical; SETUP.md and `web/package.json` give the real Node.js minimum (22.13); ARCHITECTURE and UML mention the year check (`plotGivenYear`) and the unit tests | ○ |

## Done
| ID | Task | Owner | Done when | PR |
|---|---|---|---|---|
| CS-000 | Repo created, README, branding assets | Team | Repo exists with README + logo | #2 |
| CS-004 | Tech stack research write-up | Carter | [tech-stack.md](research/tech-stack.md) filled in: choices, options compared, trade-offs, sources | #6 |
| CS-011 | Pipeline: NDVI → colored PNG → export + manifest (local files) | Carter | `test_ndvi.py` passes; PNG < 2 MB; manifest lists the year | #8 |
| CS-012 | Web: map with a vegetation layer | David | The map shows real vegetation data; `npm run build` works. *Delivered as the globe (CS-050) instead of Leaflet + pipeline PNGs* | #4, #9 |
| CS-013 | Server (Adam only): domain/DNS, nginx + HTTPS, locked deploy key, `deploy.sh`, branch protection | Adam | `https://chlorosat.com` serves the site over HTTPS; the personal site still works; `deploy.sh` deploys in one command; the deploy key refuses a shell | #5 |
| CS-024 | Auto-deploy (`deploy.yml`) + CI caching | Adam | Merging a PR updates the live site automatically | #7 |
| CS-025 | Base map switch (satellite / street map) | David | Satellite shows imagery, Map shows the street map, each credited | #9 |
| CS-027 | Server (Adam only): `production` environment + secrets, repo security settings, cache headers, first auto-deploy | Adam | Secrets exist; build files served with long-term cache headers; merges deploy automatically (checked 2026-10-12) | #5, #7 |
| CS-030 | Place search | David | Typing a place + Enter moves the map there; follows the search service's usage policy (Photon) | #9, #11 |
| CS-035 | Vegetation opacity slider | David | The slider changes the vegetation layer's opacity right away; the layer loads at the opacity the slider shows (#20 fixed a 70% start) | #9, #20 |
| CS-038 | Landing page as home page; map at `/map/` behind an "Open map" button | Adam | `/` shows the landing page; `/map/` shows the map; map code only loads on `/map/` | #7 |
| CS-048 | Recenter button | David | Returns the globe to its starting view | #9 |
| CS-049 | UX: first map page UI (glass controls, header, design tokens, CSS Modules) | Lucas | Every planned control laid out and usable by keyboard; header on every page | #4 |
| CS-050 | Worldwide globe: MapLibre + NASA MODIS NDVI, Esri satellite + Wayback by year, OpenFreeMap map view + labels, phone layout, About page | David | Globe shows NDVI for 2019–2026 worldwide with all controls working on desktop and phone | #9 |
| CS-051 | Fix missing place names on the live site (MapLibre worker served as `.js`) | David | Labels and the Map view load on chlorosat.com | #10 |
| CS-052 | Map fixes: country/state names, search framing, approximate vs. precise location | David | Names correct (e.g. Türkiye, Hawaii); search results framed on screen; location dot and accuracy circle behave | #11, #12, #13 |
| CS-053 | Docs + UML match the globe; Leaflet-era code removed; `web/src` reorganized | Lucas | Docs describe the running site; no unused Leaflet code; build passes | #14 |
| CS-054 | README for the review checklist, screenshots, code comments up to date, backlog + sprint status | Adam | README meets the review checklist; comments match the code; this file and the sprint plans match what was done | #15 |
| CS-057 | Course unit tests: PlotGivenYear (`selectYear`, `plotYearData`) + the `npm test` command | Carter | `plotGivenYear` split into `selectYear` and `plotYearData`, with correct, incorrect, boundary and edge tests (27); `npm test` runs every web test; README, SETUP and AGENTS explain it; the globe works as before. David committed the first `plotGivenYear` and its tests (#18) | #18, #22, #23 |
| CS-059 | Course unit tests: PlaceSearch (`searchPlaces`, `minSearchLength`) | David | Correct, incorrect, boundary and edge tests (15), with the search service faked so no network is needed. Also 7 pipeline tests for the NDVI class colors (`test_ndvi_classes.py`) | #18 |
| CS-061 | Course unit tests: vegetation change (`selectYearRange`, `calculateDataChange`, `plotDataChange`) | Adam | All three exist in `vegetationChange.js`, each tested (correct, incorrect, boundary, edge); `npm test` passes. First versions, not on the map yet (CS-023). David committed the first `calculateDataChange` test cases | #18, #24 |
| CS-062 | CI runs the web unit tests | Adam | The `web` job in `ci.yml` runs `npm test`, so a failing unit test fails the required `web` check and blocks the merge; job names unchanged, no workflow-level `paths:` | #24 |
| CS-068 | Backlog, Sprint 4–5 plans and README up to date for the course code review | Adam | Backlog and sprint files match the merged work (#16–#23); a new student can clone, install and run the tests from the README alone | #24 |

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
- Keep the five course unit-test files where they are: `web/tests/plotGivenYear.test.mjs`,
  `minSearchLength.test.mjs`, `searchPlaces.test.mjs`, `buildBoundedRegions.test.mjs` and
  `plotVegetationChange.test.js`. Their GitHub links were handed in for the course code review,
  so renaming or moving them breaks those links.
- Keep the year list in sync: `MapApp.js` and `plotGivenYear.js` both list 2019–2026.
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

Until then, keep its output out of the website: the one working command writes to
`web/public/data/` by default (`export.py`), a folder that isn't gitignored and would be deployed
if committed.

Current status: [pipeline/README.md](../pipeline/README.md).

## Decision gates

Ask the team before:

- Adding a backend or server-side processing.
- Connecting pipeline output to the live globe.
- Defining a new persistent data contract.
- Adding a dependency or changing deployment.
- Presenting inferred or synthetic values as measured vegetation.
