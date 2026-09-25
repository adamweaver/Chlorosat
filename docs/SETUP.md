# Developer Setup

## 1. Install tools (once)
| Tool | Why | Install |
|---|---|---|
| Git | Version control | https://git-scm.com |
| Node.js 22 LTS | Builds/runs the website | https://nodejs.org (or `nvm install 22`) |
| uv | Python + package manager for the pipeline (installs Python 3.12 for you) | https://docs.astral.sh/uv/getting-started/installation/ |

Check: `git --version`, `node --version` (v22.x), `uv --version`.

**Fedora (`dnf install uv`):** Fedora's uv won't auto-download Python. Run `uv python install 3.12` once.

## 2. Clone
```bash
git clone https://github.com/adamweaver/Chlorosat.git
cd Chlorosat
```

## 3. Pipeline (Python)
```bash
cd pipeline
uv sync                  # creates .venv/ and installs exact versions from uv.lock
uv run pytest            # run tests
uv run ruff check        # lint (style + common bugs)
uv run chlorosat --help  # the CLI (fetch: Sprint 2, run: Sprint 3)
```
- `uv add <package>` adds a dependency (updates `pyproject.toml` + `uv.lock`; commit both).
- **Fallback without uv** (Python 3.12 required): someone with uv runs `uv export --format requirements-txt > requirements.txt`, then
  `python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt` (this also installs our package; tests: `pytest`)

## 4. Website (Next.js)
```bash
cd web
npm ci           # install exact versions from package-lock.json
npm run dev      # dev server: http://localhost:3000 (home), /map/ (map), /about/ (auto-reloads)
npm run lint     # lint
npm run build    # static build -> web/out/ (what gets deployed)
```
Preview the real build: `python3 -m http.server -d out 8000` → http://localhost:8000

## 5. Workflow
1. Pick your task in [BACKLOG.md](BACKLOG.md), move it to **In Progress**.
2. `git switch main && git pull && git switch -c feature/<name>`
3. Commit small, clear steps. Push, open a PR into `main` (template auto-fills).
4. CI must pass + 1 review → merge (the site deploys automatically) → delete branch → move task to **Done** with the PR number.

## Common problems
- **`window is not defined`** during build: Leaflet code ran during the build. Load map components with `next/dynamic` + `{ ssr: false }`, called from a `"use client"` component (see `web/src/components/MapView.js`).
- **Overlay doesn't line up with the map:** PNG must be EPSG:3857 and bounds in `[[south, west], [north, east]]`.
- **Huge git diff / slow push:** you probably committed raw data. It belongs in `pipeline/data/` (gitignored).
