# Deployment

**Owner: Adam.** The VPS also hosts Adam's personal site, so **every server-side action is Adam's only**: VPS, nginx, DNS/domain, HTTPS, deploy keys, and GitHub repo settings/secrets. Teammates never need VPS access. Repo-side work (`deploy.yml`, `deploy.sh`, CI) is normal PR work, and Adam reviews it.

**What gets deployed:** only `web/out/`, the static site built by `npm run build`.
**Where:** Adam's VPS (1 core, 4 GB RAM, shared with his personal site) → `/var/www/chlorosat`, served by the existing **nginx**, with HTTPS from **certbot**.

```
merge to main ─► GitHub Actions: npm ci + npm run build ─► rsync web/out/ over SSH ─► VPS /var/www/chlorosat ─► nginx ─► browser
                   (deploy.yml, Sprint 3)                  (locked-down key: can ONLY write /var/www/chlorosat)
                                         manual fallback: deploy/deploy.sh (run by Adam)
```

## One-time server setup (Adam, Sprint 2, CS-013)
Fill in the real commands as you go.
- [ ] Note VPS OS + version here: `TODO`
- [ ] Domain / subdomain for Chlorosat: `TODO`. Add a DNS **A record** pointing to the VPS IP.
- [ ] Web folder: `sudo mkdir -p /var/www/chlorosat`
- [ ] nginx: install [deploy/chlorosat.nginx.conf](../deploy/chlorosat.nginx.conf) (steps in the file). `sudo nginx -t` **before** every reload, so a typo can't take down the personal site.
- [ ] HTTPS: `sudo certbot --nginx -d <domain>`
- [ ] Visit `https://<domain>`: it should show the site with a valid lock icon, **and the personal site should still work**.
- [ ] Deploy user + locked-down key (next section).
- [ ] GitHub (repo owner): protect `main` (require PR + 1 review + CI passing). Free accounts only get this on **public** repos. If the repo is private, GitHub Pro is free via the Student Developer Pack.

## Locked-down deploy key (Adam)
Goal: even if the CI key leaks, it can **only** write files into `/var/www/chlorosat`. No shell, and no access to the personal site.
1. Create a user with no sudo, e.g. `chlorosat-deploy`, and make it the owner of `/var/www/chlorosat`.
2. Make a new SSH key pair used **only** for this (`ssh-keygen -t ed25519 -C chlorosat-ci`, no passphrase).
3. In `~chlorosat-deploy/.ssh/authorized_keys`, restrict the key with `rrsync` (comes with rsync; its path varies by distro):
   ```
   command="rrsync -wo /var/www/chlorosat",restrict ssh-ed25519 AAAA... chlorosat-ci
   ```
   `-wo` = write-only. `restrict` = no shell, no port forwarding. The rsync destination becomes `chlorosat-deploy@<host>:` (paths are relative to `/var/www/chlorosat`).
4. Test: `ssh -i <key> chlorosat-deploy@<host>` should **refuse** a shell, while an rsync to that destination works.

## Manual deploy (fallback, Adam)
```bash
DEPLOY_TARGET=chlorosat-deploy@<host>: ./deploy/deploy.sh    # builds web/out/ and rsyncs it (filled in during CS-013)
```

## Automatic deploy (Sprint 3): `.github/workflows/deploy.yml`
**Carter writes the workflow (CS-024). Adam sets up the GitHub side (CS-027).**
1. Trigger: `push` to `main` (i.e. after a PR merge) + `workflow_dispatch` (manual run button).
2. Job uses `environment: production` and `permissions: contents: read`.
3. Checkout → setup Node 22 → `npm ci` → `npm run build` (in `web/`).
4. Write the key + known_hosts from secrets → `rsync -az --delete --chmod=D755,F644 web/out/ chlorosat-deploy@$VPS_HOST:`
5. **Adam** creates a GitHub **Environment** named `production` (Settings → Environments):
   - Deployment branches: `main` only.
   - Environment secrets: `VPS_HOST`, `VPS_SSH_KEY` (the locked-down private key), `VPS_KNOWN_HOSTS` (output of `ssh-keyscan <host>`, so CI can verify it's really the VPS).
   - Optional: required reviewer = Adam (plan-dependent on private repos). The rrsync lock is what protects the server either way.

## Rollback
Re-run the deploy workflow for an older commit, or check out the old commit and run `deploy/deploy.sh` (Adam).

## Security notes
- Never commit keys, hostnames with credentials, or `.env` files.
- Chlorosat runs **no app code** on the VPS, just static files served by nginx. That keeps the risk to the personal site small.
- If the deploy key is ever exposed: delete its line from `authorized_keys`, make a new key, update the `production` secrets.
