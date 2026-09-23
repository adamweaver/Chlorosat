# What's New: Project Scaffold

> **Temporary.** Delete this file once everyone is caught up.

## What changed
- **Real project structure** with a Python pipeline (`pipeline/`) and a website (`web/`). The code is **outlines only**: function names + `TODO(CS-0XX)` notes. We write the actual code.
- **Docs** in `docs/`: goals, architecture, backlog, setup, deployment.
- **Sprint 2 + 3 plans**, with a task for everyone: `docs/scrum/`.
- **CI:** every PR is automatically linted, tested, and built on GitHub.
- **AI rules** in `AGENTS.md`. AI-written code gets an `[AI]` comment block.
- **Moved:** `Branding Assets/` → `branding/`, Scrum PDF → `docs/scrum/sprint-1-plan.pdf`.
- **Repo URL changed** to https://github.com/adamweaver/VegetationMonitoring

## How it works (big picture)
1. **Pipeline** (Python, runs on our laptops): satellite images → vegetation layers → colored PNGs + stats JSON, saved in `web/public/data/`.
2. **Website** (Next.js): built into plain HTML/JS files in `web/out/`.
3. **VPS**: nginx just serves those files. No backend server, so it's fast and cheap.

**The VPS is Adam's personal server** (it also runs his personal site). Only Adam touches the server, domain, DNS, deploy keys, and GitHub settings. Nobody else needs VPS access, and CI deploys with a key that can only write Chlorosat's folder.

**Two ways to detect vegetation**, and users can switch between them on the map:
- **Infrared (NDVI):** plant *health*, from near-infrared light. The default.
- **Visible light:** areas that *look green* in a normal color photo.

They'll sometimes disagree (e.g. artificial turf looks green but isn't alive). The site says which one is showing and explains why.

⚠️ This differs from the README: **no Leaflet.heat** (colored image overlays instead) and **no backend API**. Needs team approval (see Decisions).

## Folders
| Folder | For |
|---|---|
| `pipeline/` | Python: download satellite data, compute both vegetation methods, make PNGs + stats |
| `web/` | Website (Next.js + Leaflet map) |
| `web/public/data/` | Pipeline output the website reads (committed) |
| `web/out/` | Built website, the thing that goes on the VPS (not committed) |
| `deploy/` | nginx site config + manual deploy script (server side: Adam only) |
| `docs/` | All planning + technical docs (start with `ARCHITECTURE.md`) |
| `docs/scrum/` | Sprint plans (**find your task here**) |
| `docs/research/` | Research write-ups (Sprint 1 + visible-light method) |
| `branding/` | Logo + colors |
| `.github/` | CI workflow, PR + issue templates |

## Workflow
1. Find your task in `docs/scrum/sprint-2.md`. In `docs/BACKLOG.md`, move it to **In Progress**.
2. Make a branch: `feature/<name>`.
3. Code, then run the tests/lint locally (commands in `docs/SETUP.md`).
4. Open a PR into `main`. CI must pass, plus 1 review, then merge.
5. Move your backlog row to **Done** with the PR link.
6. Standups: post **Did · Doing · Blocked?** in the group chat on Mon/Wed/Fri.

Pipeline output (PNGs/JSON) gets committed through a PR, just like code. Raw satellite downloads never get committed.

## Setup (everyone, ~15 min)
- [ ] Install **Git**, **Node.js 22**, **uv** (links in `docs/SETUP.md`). If you use Fedora's `dnf` uv, also run `uv python install 3.12`.
- [ ] Clone the repo. If you already have it: `git remote set-url origin https://github.com/adamweaver/VegetationMonitoring.git`
- [ ] Pipeline: `cd pipeline && uv sync && uv run pytest` (expect 4 passed, 10 skipped)
- [ ] Website: `cd web && npm ci && npm run dev`, then open http://localhost:3000
- [ ] Read your Sprint 2 task and `docs/PRINCIPLES.md`.
- [ ] Using AI? Make sure your tool reads `AGENTS.md` (Claude Code does this automatically).

## Decisions needed
| # | Decision | Current draft | Who | By |
|---|---|---|---|---|
| 1 | Approve architecture decisions **D1–D3, D5, D6** (`docs/ARCHITECTURE.md`): static site, PNG overlays instead of heatmap, CI auto-deploy, JavaScript + uv, commit processed data. (D4 nginx and D10 server = Adam only are already set, since it's Adam's VPS.) | Proposed | Team | Sprint 2 planning |
| 2 | Confirm **D8**: two methods (infrared = default, visible light), shown separately, differences explained | Team intent | Team | Sprint 2 planning |
| 3 | Satellite data source (**D7**) | Sentinel-2 L2A (covers both methods) | Kevin | ~Sep 24 |
| 4 | Visible-light index + imagery (**D9**) | VARI on the same Sentinel-2 scenes | Carter | Sprint 3 |
| 5 | Color classes + breakpoints (both methods) | Same 4–5 classes, brown → teal; drafts in `methods.py` | David + Lucas (+ Carter for visible) | Before CS-011 is done |
| 6 | Years + season to compare | 2019–2025, Jun–Aug | Kevin + David | Sprint 3 start |
| 7 | "Change" threshold | ±0.1 (per method) | David + Carter | Sprint 3 |
| 8 | Week numbering: we assumed week 5 = Sep 21–27, which puts end of Sprint 3 (Oct 14) at **week 8** | Usable milestone moved to ~Oct 7 (week 7) | Team | Now |
| 9 | Is the repo public? (Free branch protection needs it; otherwise Adam uses the Student Pack's GitHub Pro.) | ? | Adam | Sprint 2 |
| 10 | Where standups happen (which chat) | ? | Team | Now |
| 11 | Are the Sprint 2/3 tasks + hours realistic? (Adam and Kevin swapped Sprint 2 lanes because of the server rule; Carter has two smaller Sprint 3 tasks) | `docs/scrum/` | Team | Sprint 2 planning |
