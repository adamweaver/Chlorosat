# Landing page (placeholder)

The "Work in progress" page that is **live on the VPS right now**. It's a standalone copy: plain HTML/CSS/JS, no build step, not part of the Next.js app (Next ignores this folder).

| File | What |
|---|---|
| `index.html` | The page: title, animated satellite (inline SVG), twinkling stars. All CSS/JS is inline. |
| `favicon.svg` | Same as `branding/chlorosat-icon.svg` and `web/src/app/icon.svg`. Copied so this folder works on its own. |
| `outfit.woff2` | Outfit font (self-hosted, so no Google Fonts request). |
| `OFL.txt` | Outfit's license (SIL Open Font License). **Must stay next to the font** when it's shared or moved. |
| `robots.txt` | Lets search engines index the site. |

## Plan: this becomes the home page
Later, this page gets ported into the Next.js app as the home page (`/`), and the map moves from `/` (right now `src/app/page.js` renders `<MapApp />`) to its own page (e.g. `/map/`) behind a button. That way the first page load stays light: Leaflet, the map, and the overlay PNGs only load when someone asks for them. Tracked as **CS-038** in [BACKLOG.md](../../docs/BACKLOG.md), decision **D11** in [ARCHITECTURE.md](../../docs/ARCHITECTURE.md#decision-log).

Notes for the port:
- First move the map: `src/app/page.js` → `src/app/map/page.js` (it keeps using `page.module.css`).
- `index.html` → a new `src/app/page.js` + a CSS module in `src/css/` (the project's CSS convention); the star script → a small `"use client"` component in `src/components/`.
- Add the "Open the map" button (links to `/map/`), and a way back home from the map (e.g. the logo in `Header.js`).
- `outfit.woff2` → load with `next/font/local`, and keep `OFL.txt` with it.
- `robots.txt` → `web/public/robots.txt` (Next copies `public/` into `out/`).
- Favicon: already handled by `src/app/icon.svg`.
- Add `<html lang="en">` (handled by `layout.js`) and check colors against [PRINCIPLES](../../docs/PRINCIPLES.md#design).
- Keep `prefers-reduced-motion` support.
- Then delete this folder.

## Deploying it by hand (Adam only)
```bash
# Locked deploy key; rrsync roots the destination at /var/www/chlorosat.com. Practice run first with -n.
rsync -az --delete --exclude README.md --chmod=D755,F644 -e "ssh -i ~/.ssh/chlorosat-ci" \
  web/landing/ chlorosat-deploy@<host>:
```
Once auto-deploy (CS-024) is on, every merge to `main` replaces the live files with `web/out/`: the live page becomes the map, and this placeholder goes away. Port it first if it should stay.
