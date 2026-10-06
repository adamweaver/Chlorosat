#!/usr/bin/env node
/* [AI] Purpose: Make the night-sky background image (public/stars.svg) once,
 *      as a fixed file. It used to be drawn in the browser with random stars
 *      on every page load and every window resize, so the sky changed each
 *      time, and on phones tapping the search bar (the keyboard resizes the
 *      page) re-scattered all the stars. David asked for it to be a
 *      permanent asset instead.
 *      Does:    Writes a 1024x1024 SVG of small white dots (same density,
 *               sizes and brightness as the old canvas: about 1 star per
 *               1800 square pixels, radius 0.2-1.4 px, 40-100% bright).
 *               The page shows it as a repeating background on black.
 *               Stars near an edge are also drawn on the opposite edge, so
 *               the tiles join without visible seams. SVG stays sharp on
 *               high-resolution phone screens.
 *      Context: Run by hand only when changing the look:
 *                 node scripts/make-stars.mjs
 *               Same seed -> same stars every time. Used by css/Home.module.css
 *               (home page) and components/MapApp.js (behind the globe).
 *      Written: 2026-09-30 · Claude Opus 5.5 · requested by David */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SIZE = 1024;
const COUNT = Math.round((SIZE * SIZE) / 1800);
const SEED = 20260930;

// Repeatable "random" numbers (Park-Miller), so the file is the same on every run.
let value = SEED;
const random = () => {
  value = (value * 16807) % 2147483647;
  return value / 2147483647;
};

const circles = [];
for (let i = 0; i < COUNT; i++) {
  const x = random() * SIZE;
  const y = random() * SIZE;
  const r = random() * 1.2 + 0.2;
  const opacity = random() * 0.6 + 0.4;
  // Copies on the far side for stars that cross an edge (seamless tiling).
  for (const dx of [-SIZE, 0, SIZE]) {
    for (const dy of [-SIZE, 0, SIZE]) {
      const cx = x + dx;
      const cy = y + dy;
      if (cx + r < 0 || cx - r > SIZE || cy + r < 0 || cy - r > SIZE) continue;
      circles.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(2)}" fill-opacity="${opacity.toFixed(2)}"/>`);
    }
  }
}

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">` +
  `<g fill="#fff">${circles.join("")}</g></svg>\n`;

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "stars.svg");
writeFileSync(out, svg);
console.log(`Wrote ${out} (${COUNT} stars, ${(svg.length / 1024).toFixed(1)} KB)`);
