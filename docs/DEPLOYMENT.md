# Deployment

**Owner: Adam.** The VPS also hosts Adam's personal site, so **every server-side action is Adam's only**: VPS, nginx, DNS/domain, HTTPS, deploy keys, and GitHub repo settings/secrets. Teammates never need VPS access. Repo-side work (`deploy.yml`, `deploy.sh`, CI) is normal PR work; Adam writes it this sprint, and any change to it by others needs Adam's review.

**What gets deployed:** only `web/out/`, the static site built by `npm run build`.
**Where:** Adam's VPS (1 core, 4 GB RAM, shared with his personal site) → `/var/www/chlorosat.com`, served by the existing **nginx** (installed on the host, not in Docker), with HTTPS from **certbot**.
**Domain:** `chlorosat.com` + `www.chlorosat.com` (a Cloudflare **Redirect Rule** sends www → `chlorosat.com`, so www requests never reach the VPS). DNS is on **Cloudflare with the proxy on**, which means:
- SSH/rsync (and CI's `VPS_HOST`) must use the VPS **IP**, not the domain. The proxy only carries web traffic.
- The IP is **secret** (see [Security](#security)). It lives only in the `VPS_HOST` secret and on Adam's laptop. Docs write `<host>`.
- Cloudflare SSL/TLS mode = **Full (strict)**, so the Cloudflare → VPS leg is also HTTPS with a valid certificate.

```
merge to main ─► GitHub Actions: npm ci + npm run build ─► rsync web/out/ over SSH ─► VPS /var/www/chlorosat.com ─► nginx ─► browser
                   (deploy.yml, Sprint 3)                  (locked-down key: can ONLY write /var/www/chlorosat.com)
                                         manual fallback: deploy/deploy.sh (run by Adam)
```

**Right now:** a hand-deployed placeholder page is live. Its source is [web/landing/](../web/landing/). The first auto-deploy replaces it with `web/out/` (`rsync --delete`), whose home page is currently the map (PR #4). Port the placeholder into the home page first (CS-038 / D11) if it should stay.

## Status (updated 2026-09-24)
| Step | Status |
|---|---|
| Domain, DNS, HTTPS, www redirect | ✅ Done |
| Deploy user + rrsync-locked key | ✅ Shell refused, rsync upload works (tested 2026-09-24) |
| Branch protection on `main` | ✅ Done (ruleset, see [below](#branch-protection-main)) |
| Repo security settings (public repo) | ✅ Fork-PR approval, secret scanning, push protection |
| `deploy/chlorosat.nginx.conf` = real config | ✅ Done (live on the VPS 2026-09-24) |
| `deploy/deploy.sh` | ✅ Written + tested locally (CS-013); not yet run against the VPS |
| GitHub `production` environment + secrets | ✅ Done (`main` only; `VPS_HOST`, `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS`) |
| `deploy.yml` | ⏳ Not started (CS-024) |
| nginx cache headers + gzip check | ✅ Cache headers live (visible after the first real deploy); gzip not needed (Cloudflare compresses) |

## One-time server setup (Adam, Sprint 2, CS-013)
- [x] VPS OS + version: Ubuntu 26.04
- [x] Domain: `chlorosat.com`, DNS **A record** → VPS IP (Cloudflare, proxied)
- [x] `www.chlorosat.com`: Cloudflare DNS record (proxied) + Redirect Rule → `https://chlorosat.com`
- [x] Web folder: `sudo mkdir -p /var/www/chlorosat.com`
- [x] nginx: Chlorosat server block live on the VPS; copy in [deploy/chlorosat.nginx.conf](../deploy/chlorosat.nginx.conf) (no IP addresses; how to change it is in the file). `sudo nginx -t` **before** every reload, so a typo can't take down the personal site.
- [x] HTTPS: certbot certificate on the VPS + Cloudflare's edge certificate. Both renew automatically (check certbot's with `sudo certbot renew --dry-run`). Deploys don't touch certificates.
- [x] `https://chlorosat.com` shows the site with a valid lock icon; `https://www.chlorosat.com` redirects to it.
- [x] Confirm the personal site still works.
- [x] Deploy user + locked-down key (next section), tested.
- [x] Branch protection on `main` (free because the repo is public).

## Locked-down deploy key (Adam)
Goal: even if the CI key leaks, it can **only** write files into `/var/www/chlorosat.com`. No shell, and no access to the personal site.
1. User `chlorosat-deploy`: no sudo, **not** in the `docker` group (that equals root), password login disabled (`usermod -p '*'`), shell `/bin/sh` (sshd runs the forced command through it). It owns `/var/www/chlorosat.com` (mode 755 so nginx can read).
2. A separate SSH key pair used **only** for this (`ssh-keygen -t ed25519 -N "" -C chlorosat-ci`). The private half stays on Adam's laptop and in the `VPS_SSH_KEY` secret. Never in the repo.
3. `~chlorosat-deploy/.ssh/authorized_keys` (mode 600), one line:
   ```
   restrict,command="/usr/bin/rrsync -wo /var/www/chlorosat.com" ssh-ed25519 AAAA... chlorosat-ci
   ```
   `-wo` = write-only. `restrict` = no shell, no port forwarding. The rsync destination becomes `chlorosat-deploy@<host>:` (paths are relative to `/var/www/chlorosat.com`).
4. Test: `ssh -i <key> chlorosat-deploy@<host>` must **refuse** a shell (✅), and an rsync to that destination must work (practice run first with `-n`) (✅).

## Manual deploy (fallback, Adam)
```bash
# Practice run first: builds, then only lists what would change (look for "*deleting" lines)
DRY_RUN=1 DEPLOY_TARGET=chlorosat-deploy@<host>: DEPLOY_SSH_KEY=~/.ssh/chlorosat-ci ./deploy/deploy.sh
# Real deploy: same command without DRY_RUN=1
DEPLOY_TARGET=chlorosat-deploy@<host>: DEPLOY_SSH_KEY=~/.ssh/chlorosat-ci ./deploy/deploy.sh
```
- `DEPLOY_TARGET` (required) comes from your shell (or a `Host` alias in `~/.ssh/config`), never from a file in the repo. The script has no default and never prints it.
- `DEPLOY_SSH_KEY` (optional): the locked key. Leave it out to use your normal SSH setup.
- `DRY_RUN=1` (optional): change nothing, list changes only.
- Safety: it stops if the build fails or `web/out/index.html` is missing, so `--delete` can't wipe the live site with an empty folder.
- ⚠ Until CS-038 is done, a real run replaces the landing page with the map.

## Automatic deploy (Sprint 3): `.github/workflows/deploy.yml`
**Adam writes the workflow (CS-024, taken over from Carter 2026-09-24) and sets up the GitHub side (CS-027).** A teammate reviews the PR (branch protection requires 1 approval).
1. Trigger: `push` to `main` (i.e. after a PR merge) + `workflow_dispatch` (manual run button).
2. Job uses `environment: production`, `permissions: contents: read`, and `concurrency: { group: deploy, cancel-in-progress: false }` (two quick merges never rsync at the same time).
3. Checkout → setup Node 22 → `npm ci` → `npm run build` (in `web/`). Same action versions as `ci.yml`.
4. Write the key (`chmod 600`) and known_hosts from secrets → `rsync -az --delete --chmod=D755,F644 web/out/ chlorosat-deploy@${{ secrets.VPS_HOST }}:`
5. Follow the [workflow rules](#security) (no printing secrets, no `-v`, no `StrictHostKeyChecking=no`).
6. **Adam** creates a GitHub **Environment** named `production` (Settings → Environments):
   - Deployment branches: `main` only. So workflows from PRs or other branches can't read the secrets.
   - Environment secrets: `VPS_HOST` (the IP), `VPS_SSH_KEY` (the locked-down private key), `VPS_KNOWN_HOSTS` (output of `ssh-keyscan -t ed25519 <host>`, run **outside the repo**; compare its fingerprint with the VPS's own `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`).
   - Optional: required reviewer = Adam (free on public repos). The rrsync lock protects the server either way.

## Branch protection (`main`)
Ruleset `protect main` (Settings → Rules → Rulesets), no bypass list:
- Pull request required: 1 approval, stale approvals dismissed on new commits. No direct pushes, no force pushes, no deletion.
- Required status checks: **`pipeline`** + **`web`** (the job names in `ci.yml`).
- ⚠ Because those checks are required, **`ci.yml` must not use a workflow-level `paths:` filter** (CS-024). A workflow that never runs leaves the checks stuck at "Expected — Waiting" and blocks the merge. Skip per job instead (e.g. `dorny/paths-filter` + `if:`); a skipped job counts as passed.

## Rollback
Re-run the deploy workflow for an older commit, or check out the old commit and run `deploy/deploy.sh` (Adam).

## Security
The repo is **public** (professor's request, D12). Anything committed (files, history, commit messages, PR text, Actions logs) is public and effectively permanent. Rules for agents are summarized in [AGENTS.md](../AGENTS.md#security--secrets).

**What's secret, and where it lives**
| Secret | Lives only in |
|---|---|
| VPS IP address | `VPS_HOST` secret; Adam's laptop |
| Deploy private key | `VPS_SSH_KEY` secret; Adam's `~/.ssh/` |
| Server host key list (known_hosts) | `VPS_KNOWN_HOSTS` secret (`*known_hosts*` is gitignored) |
| Anything in `.env`, `*.pem`, `*.key` | Your own machine (gitignored) |

**Why the IP matters:** Cloudflare hides it. With the IP, anyone can skip Cloudflare's protection and hit the VPS directly, which also puts Adam's personal site at risk. Once pushed to a public repo, it can't be taken back.

**Rules**
- Docs, examples, and scripts use placeholders: `<host>`, `<you>`, `<key>`. Scripts read real values from env vars and have no defaults with real addresses.
- Before committing server files (e.g. the nginx config from the VPS), remove IP addresses (`listen <ip>:443`, IPs in `server_name`, `allow`/`deny` lines).
- Workflows: least privilege (`permissions: contents: read`), no `pull_request_target`, never print secrets, no `set -x` / `-v` on ssh/rsync, never `StrictHostKeyChecking=no`. GitHub masks secrets as `***`, but verbose output can leak details around them.
- Screenshots and chat messages count too: crop out terminals that show the IP.
- Chlorosat runs **no app code** on the VPS, just static files served by nginx. That keeps the risk to the personal site small.

**Repo settings (Adam)**
- [x] Branch protection on `main` (above).
- [x] Settings → Actions → General → Fork pull request workflows → **Require approval for all outside collaborators**.
- [x] Settings → Advanced Security → **Secret scanning** + **Push protection** (blocks pushes that contain known key/token formats).

**If something leaks**
Tell Adam right away. Deleting the file or commit is **not** enough (history, forks, and caches keep it).
- **Deploy key:** delete its line in `authorized_keys`, make a new key pair, update `VPS_SSH_KEY`.
- **Any other token/password:** revoke it where it was issued, make a new one, update the secret.
- **IP:** can't be revoked. Adam decides whether to change it (new VPS IP / firewall to Cloudflare-only traffic).
