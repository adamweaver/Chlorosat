# AGENTS.md — Rules for AI Agents

Chlorosat shows NASA MODIS NDVI on a worldwide MapLibre globe with satellite and street basemaps. It currently shows one selected year; comparison, statistics, visible-light detection, and pipeline-fed layers are not implemented.
`pipeline/` is a future offline processing package and is not used by the live website. Audience: policymakers, environmental activists and scientists, homebuyers (mostly non-technical).
Team: Group E, CS3203-001 (Adam, Carter, David, Kevin, Lucas). Students using AI **to learn**, not to replace learning.

**Read before working:** [README.md](README.md), [docs/PRINCIPLES.md](docs/PRINCIPLES.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and [docs/BACKLOG.md](docs/BACKLOG.md). Files in [docs/scrum/](docs/scrum/) are historical plans.

## Rules
1. **Be concise.** Short answers save reading time and tokens. No filler.
2. **Be transparent.** Say what you are doing and why, before and after you do it.
3. **Explain what you build.** Explain how it works and its purpose, thoroughly but concisely.
4. **No code or file edits without explicit permission.** Suggest first. Wait for a clear "yes".
5. **Never edit README.md** unless explicitly told to.
6. **Check the docs** (README, this file, PRINCIPLES, ARCHITECTURE) when relevant. Follow them.
7. **Think about the bigger picture.** Check how a change affects the globe, external data sources, static deployment, and future pipeline.
8. **Major changes or decisions:** ask the user whether the team has approved them first (e.g. new dependency, architecture, pipeline integration, or deploy setup).
9. **Write for learners.** Well-commented, simple, readable code. Prefer clear over clever.
10. **Tag AI-written code** with the comment block below.
11. **Protect secrets.** Follow [Security & secrets](#security--secrets) in every file, commit, PR, and workflow.

## Security & secrets
This repo is **public**. Everything in it can be seen and copied: files, full history, commit messages, PR/issue text, and GitHub Actions logs. Deleting something later does **not** undo a leak.

**Never put these in the repo, a commit message, a PR/issue, a CI log, or a screenshot:**
- Passwords, API tokens, private keys (SSH or other), `.env` files.
- **The VPS IP address** or anything else that points at Adam's server: `known_hosts` files, SSH config, usernames/paths beyond what [DEPLOYMENT.md](docs/DEPLOYMENT.md) already shows. Cloudflare hides the IP; a leaked IP lets attackers skip Cloudflare and also exposes Adam's personal site.

**Instead:**
- Write `<host>` (or `<you>`, `<key>`) in docs, examples, and scripts.
- Scripts read targets from environment variables and have **no default** that contains a real address (see `deploy/deploy.sh`).
- Workflows use GitHub secrets (`${{ secrets.VPS_HOST }}` etc.). They live only in the GitHub `production` environment, which only Adam manages.

**Workflows (logs are public):**
- `permissions: contents: read` unless more is truly needed. Never `pull_request_target`.
- Never `echo`/`cat` a secret, never `set -x` near one, no `-v` on ssh/rsync.
- Verify the server with `VPS_KNOWN_HOSTS`. **Never** `StrictHostKeyChecking=no`.
- Required checks `pipeline` + `web` must always report: no workflow-level `paths:` filter in `ci.yml` (skip per job instead).

**Agents:** before suggesting a commit, check the staged diff for anything above. Don't read, print, or copy `~/.ssh/*`, `.env`, or secret values unless the user asks. If you find a secret or an IP address in the repo, **stop and tell the user** (and Adam). Details: [DEPLOYMENT.md → Security](docs/DEPLOYMENT.md#security).

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
| `pipeline/` | Future Python offline pipeline (uv). Only a manual local-file NDVI path works; it is not connected to the site. |
| `pipeline/README.md` | Exact implemented and missing pipeline features. |
| `web/` | Next.js static site: home `/`, worldwide MapLibre globe `/map/`, and About `/about/`. |
| `web/src/components/map/` | Live globe components, controls, and map-specific styles. |
| `web/src/lib/map/` | MapLibre engine, remote tiles, NDVI recoloring, water masks, and caches. |
| `web/out/` | Built site (gitignored). **This folder is what goes on the VPS.** |
| `deploy/` | nginx site config + manual deploy script (server side is **Adam only**). |
| `.github/workflows/` | `ci.yml` (lint, tests, build on every PR). `deploy.yml`: deploys every merge to `main` (runs `deploy/deploy.sh`). Logs are public. |
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
- Branches: `feature/<name>`, `bugfix/<name>`. PR into `main`, 1+ review, CI must pass (enforced by a ruleset on `main`: no direct pushes, no force pushes).
- Commits: short and clear (`Add NDVI calculation`), not `added stuff`.
- **Never commit raw satellite data** (`pipeline/data/`). No pipeline output is currently part of the website.
- The site is a static export: pages are built once at build time. No API routes, and nothing that needs a running server (the VPS only serves files).
- **The VPS is Adam's personal server** (it also hosts his personal site). Only Adam does server-side work: VPS, nginx, DNS/domain, HTTPS, deploy keys, GitHub settings/secrets. Never tell teammates to run commands on the VPS. Draft changes in the repo (`deploy/`, `docs/DEPLOYMENT.md`) for Adam to review and apply.
- Keep branding restrained: see [PRINCIPLES](docs/PRINCIPLES.md#accessible-and-restrained-design).
