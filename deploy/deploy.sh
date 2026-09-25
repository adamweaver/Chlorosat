#!/usr/bin/env bash
# Manual deploy (fallback when the GitHub Actions deploy isn't available). Run by Adam (VPS owner).
# Builds the static site and copies web/out/ to the VPS over SSH. See docs/DEPLOYMENT.md.
#
# Usage (from anywhere in the repo):
#   DEPLOY_TARGET=chlorosat-deploy@<host>: DEPLOY_SSH_KEY=~/.ssh/chlorosat-ci ./deploy/deploy.sh
#
# Settings (environment variables):
#   DEPLOY_TARGET   (required) rsync destination. With the rrsync-locked key it's
#                   `chlorosat-deploy@<host>:` (no path: rrsync already points at /var/www/chlorosat.com).
#                   There is NO default on purpose: this repo is public, and a default would publish
#                   the server's IP (docs/DEPLOYMENT.md#security).
#   DEPLOY_SSH_KEY  (optional) private key to log in with, e.g. ~/.ssh/chlorosat-ci.
#                   Leave it out to use your normal SSH setup (~/.ssh/config, ssh-agent).
#   DRY_RUN=1       (optional) practice run: build, then only LIST what rsync would change.
#                   Nothing on the server is touched. Look for "*deleting" lines.

# [AI] Purpose: One command to publish the site by hand, for when auto-deploy (deploy.yml) is
#               missing or broken (rollbacks, the week 7 milestone).
#      Does:    env vars above -> checks them -> npm ci + npm run build -> rsync web/out/ to the VPS.
#      Context: CS-013. Same rsync flags as deploy.yml (CS-024). Never prints DEPLOY_TARGET, so the
#               IP can't end up in a log or screenshot.
#      Written: 2026-09-24 · Claude Opus 5.5 · requested by Adam Weaver

# Stop at the first error (-e), treat unset variables as errors (-u), and fail a pipeline if any
# part of it fails (-o pipefail). Without this, a failed build could still be uploaded.
set -euo pipefail

# Work from the repo root no matter where the script was started from.
# ($0 = this script's path; its folder is deploy/, so the root is one level up.)
cd "$(dirname "$0")/.."

# --- 1. Check the settings before doing any work ----------------------------------------------
# ${VAR:-} means "the value, or empty if unset", so `set -u` doesn't stop us before the nice message.
if [ -z "${DEPLOY_TARGET:-}" ]; then
  echo "Error: DEPLOY_TARGET is not set." >&2
  echo "Example: DEPLOY_TARGET=chlorosat-deploy@<host>: DEPLOY_SSH_KEY=~/.ssh/chlorosat-ci ./deploy/deploy.sh" >&2
  exit 1
fi

if [ -n "${DEPLOY_SSH_KEY:-}" ] && [ ! -f "$DEPLOY_SSH_KEY" ]; then
  echo "Error: DEPLOY_SSH_KEY file not found: $DEPLOY_SSH_KEY" >&2
  exit 1
fi

if ! command -v rsync > /dev/null; then
  echo "Error: rsync is not installed (Fedora: sudo dnf install rsync)." >&2
  exit 1
fi

# --- 2. Build the static site into web/out/ ----------------------------------------------------
# The ( ) runs the commands in a subshell, so the `cd web` doesn't change our folder afterwards.
echo "Building the site (npm ci + npm run build)..."
(cd web && npm ci && npm run build)

# Safety check: rsync --delete makes the server match web/out/ exactly. If web/out/ were empty or
# half-built, that would wipe the live site. A real build always has index.html.
if [ ! -f web/out/index.html ]; then
  echo "Error: web/out/index.html is missing, so the build looks broken. Not uploading." >&2
  exit 1
fi

# --- 3. Upload with rsync ----------------------------------------------------------------------
# The options go in a bash array (a list), so each one stays a separate argument even if it
# contains spaces.
#   -a  archive: copy folders recursively, keep modification times (so unchanged files are skipped)
#   -z  compress while sending
#   --delete             remove server files that are no longer in the build
#   --chmod=D755,F644    folders rwxr-xr-x, files rw-r--r--, so nginx can read them
rsync_options=(-az --delete --chmod=D755,F644)

if [ -n "${DEPLOY_SSH_KEY:-}" ]; then
  # IdentitiesOnly=yes: offer ONLY this key. Otherwise ssh may try every key in your ssh-agent
  # first and get cut off with "Too many authentication failures".
  rsync_options+=(-e "ssh -i \"$DEPLOY_SSH_KEY\" -o IdentitiesOnly=yes")
fi

if [ "${DRY_RUN:-0}" = "1" ]; then
  # -n = change nothing, -i = list each change (e.g. "<f+++++++++ index.html" = new file).
  rsync_options+=(-n -i)
  echo "DRY RUN: listing changes only. Nothing on the server will change."
fi

# The trailing slash on web/out/ means "the folder's contents", not the folder itself.
echo "Uploading web/out/ ..."
rsync "${rsync_options[@]}" web/out/ "$DEPLOY_TARGET"

if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "Dry run finished. Run again without DRY_RUN=1 to deploy for real."
else
  echo "Deployed: https://chlorosat.com/"
  echo "(Cloudflare may keep serving old /data/ images for up to an hour; see DEPLOYMENT.md.)"
fi
