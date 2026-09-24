#!/usr/bin/env bash
# Manual deploy (fallback when the GitHub Actions deploy isn't available). Run by Adam (VPS owner).
# Builds the static site and copies web/out/ to the VPS over SSH.
# Usage (from repo root): DEPLOY_TARGET=... ./deploy/deploy.sh
#
# TODO(CS-013, S2, Adam) implement:
#   1. Stop on any error:            set -euo pipefail
#   2. Read the destination from an env var (never hard-code hosts/keys in git):
#        DEPLOY_TARGET = rsync destination, e.g.
#          chlorosat-deploy@<host>:           (the rrsync-locked deploy key; path is relative
#                                              to /var/www/chlorosat.com)
#          <you>@<host>:/var/www/chlorosat.com/   (your own login)
#      Exit with a helpful message if it's missing. NO default value: this repo is public, and a
#      default would publish the server's IP (see docs/DEPLOYMENT.md#security).
#   3. Build:   (cd web && npm ci && npm run build)
#   4. Upload:  rsync -az --delete --chmod=D755,F644 web/out/ "$DEPLOY_TARGET"
#        -a keeps file info, -z compresses, --delete removes files no longer in the build,
#        --chmod makes files readable by nginx
#   5. Print the live URL when done.
# Document the final version in docs/DEPLOYMENT.md.

echo "deploy.sh is not implemented yet (CS-013). See docs/DEPLOYMENT.md." >&2
exit 1
