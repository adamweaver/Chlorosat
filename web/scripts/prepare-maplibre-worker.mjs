#!/usr/bin/env node
import { readdirSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
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

console.log(`[prepare-maplibre-worker] copied ${files.length} file(s) to public/maplibre/`);
