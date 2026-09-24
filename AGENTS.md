# AGENTS.md — Rules for AI Agents

Chlorosat maps vegetation from satellite data over a normal map, compares years, and shows simple stats. It uses two detection methods: **infrared (NDVI)** and **visible light (RGB)**. Their results can differ, and the site explains why.
Region: OKC/Norman first, built to add more regions by config. Audience: policymakers, environmental activists and scientists, homebuyers (mostly non-technical).
Team: Group E, CS3203-001 (Adam, Carter, David, Kevin, Lucas). Students using AI **to learn**, not to replace learning.

**Read before working:** [README.md](README.md), [docs/PRINCIPLES.md](docs/PRINCIPLES.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/BACKLOG.md](docs/BACKLOG.md), current sprint in [docs/scrum/](docs/scrum/).

## Rules
1. **Be concise.** Short answers save reading time and tokens. No filler.
2. **Be transparent.** Say what you are doing and why, before and after you do it.
3. **Explain what you build.** Explain how it works and its purpose, thoroughly but concisely.
4. **No code or file edits without explicit permission.** Suggest first. Wait for a clear "yes".
5. **Never edit README.md** unless explicitly told to.
6. **Check the docs** (README, this file, PRINCIPLES, ARCHITECTURE) when relevant. Follow them.
7. **Think about the bigger picture.** Check how a change affects other parts (especially the [data contract](docs/ARCHITECTURE.md#data-contract)) to avoid conflicts.
8. **Major changes or decisions:** ask the user whether the team has approved them first (e.g. new dependency, changing the architecture, data contract, or deploy setup).
9. **Write for learners.** Well-commented, simple, readable code. Prefer clear over clever.
10. **Tag AI-written code** with the comment block below.

## AI comment block
Put this **above** every function or notable sub-function an agent writes.
The `[AI]` tag makes AI-written code searchable: `grep -rn "\[AI\]"`.

Python:
```python
# [AI] Purpose: Why this function exists (the problem it solves).
#      Does:    What it does, inputs -> outputs.
#      Context: Constraints, related files/docs (keep short).
#      Written: YYYY-MM-DD · <agent/model, e.g. Claude Opus 5.5> · requested by <name>
def example(arg):
    ...
```

JavaScript:
```js
/* [AI] Purpose: ...
 *      Does:    ...
 *      Context: ...
 *      Written: YYYY-MM-DD · <agent/model> · requested by <name> */
function example(arg) { ... }
```

When a human later changes AI-written code, add a line: `Edited: YYYY-MM-DD · <name> · <what changed>`.

## Repo map
| Path | What |
|---|---|
| `pipeline/` | Python (uv). Downloads satellite bands → vegetation index per method → colored PNG + stats JSON. Runs on laptops, **never on the VPS**. |
| `pipeline/regions.toml` | Region list (id, name, bounding box). New region = new entry. |
| `pipeline/src/chlorosat/methods.py` | Detection methods + their class colors (single source of truth; copied into `manifest.json`). |
| `web/` | Next.js static site (JavaScript). Map UI with Leaflet. |
| `web/landing/` | Placeholder landing page (plain HTML, live on the VPS now). Will be ported into the Next.js home page (D11). |
| `web/public/data/` | Pipeline output the site reads (committed). Shape defined by the data contract. |
| `web/out/` | Built site (gitignored). **This folder is what goes on the VPS.** |
| `deploy/` | nginx site config + manual deploy script (server side is **Adam only**). |
| `docs/` | Principles, architecture, backlog, setup, deployment, research, sprint plans. |
| `branding/` | Logo + color palette. |

## Commands
```bash
# Pipeline
cd pipeline && uv sync            # install Python deps
uv run pytest                     # tests
uv run ruff check                 # lint

# Website
cd web && npm ci                  # install JS deps
npm run dev                       # local dev server (http://localhost:3000)
npm run lint                      # lint
npm run build                     # static build -> web/out/
```

## Conventions
- Branches: `feature/<name>`, `bugfix/<name>`. PR into `main`, 1+ review, CI must pass.
- Commits: short and clear (`Add NDVI calculation`), not `added stuff`.
- **Never commit raw satellite data** (`pipeline/data/`). Only small processed output in `web/public/data/`.
- The site is a static export: pages are built once at build time. No API routes, and nothing that needs a running server (the VPS only serves files).
- **The VPS is Adam's personal server** (it also hosts his personal site). Only Adam does server-side work: VPS, nginx, DNS/domain, HTTPS, deploy keys, GitHub settings/secrets. Never tell teammates to run commands on the VPS. Draft changes in the repo (`deploy/`, `docs/DEPLOYMENT.md`) for Adam to review and apply.
- Keep branding restrained: see [PRINCIPLES](docs/PRINCIPLES.md#design).
