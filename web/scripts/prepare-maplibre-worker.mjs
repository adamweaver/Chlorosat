#!/usr/bin/env node
/* [AI] Purpose: Put MapLibre's web-worker files where the browser can download
 *      them (public/maplibre/). Runs automatically before `npm run dev` and
 *      `npm run build` (the predev/prebuild scripts in package.json).
 *      Does:    Copies maplibre-gl-worker / -shared (.mjs, plus -dev and .map
 *               files) from node_modules/maplibre-gl/dist, and ALSO writes the
 *               two production files as .js copies (maplibre-gl-worker.js,
 *               maplibre-gl-shared.js), with the worker's import of the shared
 *               file pointed at the .js name. The engine loads the .js worker.
 *      Context: After the first deploy, place names, borders and the "Map"
 *               view were missing on chlorosat.com. The live server sent the
 *               .mjs files as "application/octet-stream", and browsers refuse
 *               to run a module worker that isn't served as JavaScript, so
 *               MapLibre's worker never started (vector tiles are decoded in
 *               it; the photo and NDVI layers don't need it, so those still
 *               showed). Every web server already knows .js is JavaScript, so
 *               the .js copies work without any server change.
 *      Written: 2026-09-30 · Claude Opus 5.5 (for David) · copy step
 *      Edited:  2026-10-05 · Claude Opus 5.5 · requested by David · .js copies for the live server */
import { readdirSync, copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '..', 'node_modules', 'maplibre-gl', 'dist');
const destDir = join(__dirname, '..', 'public', 'maplibre');

if (!existsSync(srcDir)) {
  console.warn('[prepare-maplibre-worker] maplibre-gl/dist not found - run npm install first. Skipping.');
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });

const files = readdirSync(srcDir).filter((f) =>
  /^maplibre-gl-(worker|shared)(-dev)?\.mjs(\.map)?$/.test(f)
);

if (files.length === 0) {
  console.warn(
    '[prepare-maplibre-worker] no worker/shared .mjs files found in maplibre-gl/dist - ' +
      'this maplibre-gl version may have changed its build layout. The globe will likely ' +
      'fail with "Worker failed to load" until this script is updated to match.'
  );
}

for (const f of files) {
  copyFileSync(join(srcDir, f), join(destDir, f));
}

// .js copies of the two files the live site uses (see Context above).
// Their source-map comments still point at the .mjs.map files copied above.
let jsCopies = 0;
for (const name of ['maplibre-gl-worker', 'maplibre-gl-shared']) {
  const src = join(srcDir, `${name}.mjs`);
  if (!existsSync(src)) continue;
  const code = readFileSync(src, 'utf8').replaceAll('./maplibre-gl-shared.mjs', './maplibre-gl-shared.js');
  writeFileSync(join(destDir, `${name}.js`), code);
  jsCopies++;
}
if (jsCopies === 2 && !readFileSync(join(destDir, 'maplibre-gl-worker.js'), 'utf8').includes('./maplibre-gl-shared.js')) {
  console.warn(
    '[prepare-maplibre-worker] the worker no longer imports "./maplibre-gl-shared.mjs" - ' +
      'this maplibre-gl version changed its layout; check that the globe still shows place names.'
  );
}

console.log(`[prepare-maplibre-worker] copied ${files.length} file(s) + ${jsCopies} .js copies to public/maplibre/`);
