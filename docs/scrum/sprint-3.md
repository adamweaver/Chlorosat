# Sprint 3 (Sep 30 → Oct 14) · weeks 6–8

**Sprint goal:** *v0.1 live on the domain:* multi-year vegetation for OKC/Norman with **both methods** (infrared + visible light), year comparison, basic stats, auto-deployed on every merge.
**Capacity:** ~16 hrs per member (2 weeks × ~8). Roles rotate for now (may become fixed later).
**Also this sprint (original plan):** *narrow scope.* At sprint review, the team decides which Should/Could items make v1.0.

## Week 7 milestone (~Oct 7): "somewhat usable"
Multiple years of NDVI + year picker + legend, live on the domain. To hit it, do these parts **first**:
1. CS-020 (David): multi-year NDVI PNGs committed.
2. CS-022 (Kevin): `YearSelector` + `Legend`.
3. Adam deploys with `deploy.sh` (from CS-013) if CS-024 auto-deploy isn't ready yet.

The visible-light method (CS-026) lands in the second week.

## Tasks
| ID | Owner | Task | Est. hrs | Done when (acceptance criteria) | Depends on |
|---|---|---|---|---|---|
| CS-020 | David | **Pipeline multi-year:** cloud-masked summer composites (`composite.py`: mask with SCL, Jun–Aug median) on **one shared grid**; `run` command with `--years 2019-2025` and `--methods` (default: all in `methods.py`), looping over `regions.toml`; call `stats.year_stats` once CS-021 lands; generate + commit OKC/Norman outputs | 14 | `uv run chlorosat run --region okc-norman --years 2019-2025` writes one PNG (< 2 MB) + `<year>.json` per method per year; laptop RAM stays reasonable | CS-010, CS-011; CS-021 for stats; CS-026 for visible outputs |
| CS-021 | Lucas | **Pipeline stats + change:** `stats.py` (mean/median, % area per class; works for any method); change raster between two years → PNG via `render.colorize` with the method's `changeClasses` + change JSON (`export.write_change`); tests | 15 | Output matches the [data contract](../ARCHITECTURE.md#data-contract); tests use tiny hand-made arrays | CS-011; CS-020's composites for real change maps (tests don't need them) |
| CS-022 | Kevin | **Web controls:** `MethodToggle`, `YearSelector`, `Legend` (classes from `manifest.json`), `StatsPanel` (reads `<year>.json`), loading + error states | 14 | Switching method or year swaps overlay, legend + stats; active method always clearly labeled; usable by keyboard and at phone width | CS-012; hand-written sample JSON until CS-020/021 land |
| CS-023 | Adam | **Web compare + About:** compare mode (pick two years → change layer + change stats, for the active method); About / "how to read this" page in plain language, including **why the two methods can differ**; usability test with 3 non-technical users → new backlog items | 14 | Compare works for every pair in `layers[method].changes`; About page checked by a non-technical person; test notes in `docs/design/usability-1.md` | CS-012; sample change PNG/JSON until CS-021 lands; CS-026 examples for the About page |
| CS-024 | Carter | **CD (repo side):** `.github/workflows/deploy.yml` per [DEPLOYMENT.md](../DEPLOYMENT.md#automatic-deploy-sprint-3-githubworkflowsdeployyml) (`production` environment, rsync with the locked key); CI caching + path filters | 8 | Merging a PR updates the live site automatically in < 5 min | CS-013; CS-027 (Adam adds the environment + secrets) |
| CS-026 | Carter | **Visible-light method:** research + pick the index (decision D9, [visible-detection.md](../research/visible-detection.md)); implement `visible.py`; set `methods.VISIBLE` breakpoints; fill in `test_visible.py`; collect 3–5 real spots where it disagrees with NDVI | 6 | Tests pass; `run --methods visible` output looks sensible on the map; D9 updated; disagreement examples written up | CS-010 (RGB bands), CS-011 (render/export pattern) |
| CS-027 | Adam | **Server (Adam only):** GitHub `production` environment + secrets; nginx cache headers (+ check gzip); watch the first automatic deploy | 2 | Environment + secrets exist; cache headers show in `curl -I https://chlorosat.com/data/manifest.json` | CS-013 |

## Ceremonies
| What | When | How |
|---|---|---|
| Sprint planning | Sep 30 | Carry over unfinished S2 work first, then adjust this plan. |
| Standup (async) | Mon / Wed / Fri | Group chat: **Did · Doing · Blocked?** |
| Milestone check | ~Oct 7 | Is the week 7 milestone live? Swap sample data for real data. |
| Sprint review | Oct 14 | Demo v0.1 on the live domain. **Narrow scope for v1.0.** |
| Retrospective | Oct 14 | Fill in below. |

## Definition of Done
See [_template.md](_template.md#definition-of-done-applies-to-every-task).

## Review
- Demoed:
- Not finished (→ carried over):
- Scope decisions for v1.0:

## Retrospective
| Went well | Didn't go well | Change next sprint |
|---|---|---|
| | | |
