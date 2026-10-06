// [AI] Purpose: The real 3D globe rendering engine, ported from the
//      standalone chlorosat-globe prototype (globe.js) into this Next.js
//      app so the map view here is "just like the already existing globe"
//      - same live NASA GIBS NDVI fetching, per-pixel recoloring, ocean/
//      lake water masking, and off-screen prefetching, not a mockup.
//      Does:    createChlorosatGlobe(opts) builds one MapLibre globe inside
//      `opts.container` and returns a small imperative API (setYear,
//      setOpacity, setVegVisible, switchBasemap, zoomIn/Out, flyTo, recenter,
//      locate, destroy) for the React UI components (YearSelector, OpacitySlider,
//      SearchBar, SideControls, BaseMapToggle) to drive - mirroring the
//      window.ChlorosatGlobe API the standalone prototype exposes, just
//      returned directly instead of hung on window (a React app should own
//      its own instance, not share one global).
//      Context: only ever imported by client-only components (MapApp.js,
//      loaded via next/dynamic ssr:false) - maplibre-gl touches `window` at
//      import time, so this module would break if it ever loaded during
//      server rendering.
//      Written: 2026-09-24 · Claude Sonnet 5 · requested by David
//      Ported:  2026-09-30 · Claude Opus 5.5 (for David) · from chlorosat-map-demo app/lib/chlorosatGlobeEngine.js
import * as maplibregl from 'maplibre-gl';
import { HEAT_RED, HEAT_YELLOW, HEAT_GREEN, HEAT_DARK_GREEN } from './heatColors';
import { REF_SOURCE_ID, REF_SOURCE, REF_GLYPHS, REF_LAYERS, REF_LAYER_IDS, registerCityDot } from './referenceLabels';

// [AI] The .js copy, not the .mjs original: some servers (including ours at
//      first deploy) send .mjs as a download type, and browsers then refuse to
//      start the worker - place names, borders and the Map view go missing.
//      See scripts/prepare-maplibre-worker.mjs. Edited: 2026-10-05 · Claude Opus 5.5 · requested by David
if (typeof maplibregl.setWorkerUrl === 'function') {
  maplibregl.setWorkerUrl('/maplibre/maplibre-gl-worker.js');
}

const NATIVE_MAX_ZOOM = 9;

function lerp3(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
const HEAT_LUT_SIZE = 256;
const HEAT_LUT = new Uint8ClampedArray(HEAT_LUT_SIZE * 3);
for (let i = 0; i < HEAT_LUT_SIZE; i++) {
  const t = i / (HEAT_LUT_SIZE - 1);
  let rgb;
  if (t < 0.35) rgb = lerp3(HEAT_RED, HEAT_YELLOW, t / 0.35);
  else if (t < 0.55) rgb = lerp3(HEAT_YELLOW, HEAT_GREEN, (t - 0.35) / 0.2);
  else rgb = lerp3(HEAT_GREEN, HEAT_DARK_GREEN, (t - 0.55) / 0.45);
  const [r, g, b] = rgb;
  HEAT_LUT[i * 3] = r; HEAT_LUT[i * 3 + 1] = g; HEAT_LUT[i * 3 + 2] = b;
}

const NDVI_PALETTE_HEX = [
  'ce7e45', 'df923d', 'f1b555', 'fcd163', '99b718', '74a901', '66a000',
  '529400', '3e8601', '207401', '056201', '004c00', '023b01', '012e01',
  '011d01', '011301'
];
const NDVI_PALETTE = NDVI_PALETTE_HEX.map((hex, i) => ({
  r: parseInt(hex.slice(0, 2), 16),
  g: parseInt(hex.slice(2, 4), 16),
  b: parseInt(hex.slice(4, 6), 16),
  t: i / (NDVI_PALETTE_HEX.length - 1)
}));

const QUANT_BITS = 5;
const QUANT_LEVELS = 1 << QUANT_BITS;
const QUANT_SHIFT = 8 - QUANT_BITS;
const NEAREST_T_LUT = new Uint8ClampedArray(QUANT_LEVELS * QUANT_LEVELS * QUANT_LEVELS);
(function buildNearestTLUT() {
  const half = 1 << (QUANT_SHIFT - 1);
  for (let qr = 0; qr < QUANT_LEVELS; qr++) {
    const r = (qr << QUANT_SHIFT) + half;
    for (let qg = 0; qg < QUANT_LEVELS; qg++) {
      const g = (qg << QUANT_SHIFT) + half;
      for (let qb = 0; qb < QUANT_LEVELS; qb++) {
        const b = (qb << QUANT_SHIFT) + half;
        let bestT = 0, bestDist = Infinity;
        for (let k = 0; k < NDVI_PALETTE.length; k++) {
          const p = NDVI_PALETTE[k];
          const dr = r - p.r, dg = g - p.g, db = b - p.b;
          const dist = dr * dr + dg * dg + db * db;
          if (dist < bestDist) { bestDist = dist; bestT = p.t; }
        }
        const idx = (qr << (2 * QUANT_BITS)) | (qg << QUANT_BITS) | qb;
        NEAREST_T_LUT[idx] = Math.round(bestT * 255);
      }
    }
  }
})();
function vegetationScore(r, g, b) {
  const qr = r >> QUANT_SHIFT, qg = g >> QUANT_SHIFT, qb = b >> QUANT_SHIFT;
  const idx = (qr << (2 * QUANT_BITS)) | (qg << QUANT_BITS) | qb;
  return NEAREST_T_LUT[idx] / 255;
}

// [AI] Synthetic texture turned off. Past zoom 9 (NASA's finest ~250 m
//      pixels) this used to mix random noise into the enlarged data - up to
//      +/-0.19 NDVI at the deepest zoom - to fake finer detail. The noise was
//      generated in each zoom level's own pixel grid, so every zoom step drew
//      a different pattern and David saw the data "shift around and change
//      itself" while zooming in. It also wasn't real data. Every zoom now
//      shows NASA's actual values, smoothly enlarged, so they hold still.
//      (The stage/noise code is kept; adding stages here would re-enable it.)
//      Written: 2026-09-28 · Claude Opus 5.5 · requested by David
const DETAIL_STAGES = [
  { minZoom: NATIVE_MAX_ZOOM, octaves: 0, noiseAmt: 0 }
];
function detailStageFor(z) {
  let stage = DETAIL_STAGES[0];
  for (const s of DETAIL_STAGES) { if (z >= s.minZoom) stage = s; }
  return stage;
}

function hash2(x, y) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967295;
}
function valueNoise(x, y, scale) {
  const xs = x / scale, ys = y / scale;
  const x0 = Math.floor(xs), y0 = Math.floor(ys);
  const sx = xs - x0, sy = ys - y0;
  const n00 = hash2(x0, y0), n10 = hash2(x0 + 1, y0);
  const n01 = hash2(x0, y0 + 1), n11 = hash2(x0 + 1, y0 + 1);
  const ix0 = n00 + (n10 - n00) * sx;
  const ix1 = n01 + (n11 - n01) * sx;
  return ix0 + (ix1 - ix0) * sy;
}
function fbmNoise(x, y, octaves) {
  if (octaves <= 0) return 0.5;
  let total = 0, amplitude = 0.6, scale = 40, sum = 0;
  for (let o = 0; o < octaves; o++) {
    total += valueNoise(x, y, scale) * amplitude;
    sum += amplitude;
    amplitude *= 0.5;
    scale *= 0.35;
  }
  return total / sum;
}
const NOISE_GRID_STEP = 8;
const NOISE_GRID_SIZE = 256 / NOISE_GRID_STEP + 1;
function buildNoiseGrid(x, y, octaves) {
  const grid = new Float32Array(NOISE_GRID_SIZE * NOISE_GRID_SIZE);
  for (let gy = 0; gy < NOISE_GRID_SIZE; gy++) {
    const wy = y * 256 + gy * NOISE_GRID_STEP;
    for (let gx = 0; gx < NOISE_GRID_SIZE; gx++) {
      const wx = x * 256 + gx * NOISE_GRID_STEP;
      grid[gy * NOISE_GRID_SIZE + gx] = fbmNoise(wx, wy, octaves);
    }
  }
  return grid;
}

function wrapX(x, z) {
  const n = Math.pow(2, z);
  return ((x % n) + n) % n;
}

// [AI] David asked for the vegetation layer to ignore the south pole. MODIS
//      NDVI mostly has no data over the ice sheet already, but coastal rock,
//      the Antarctic Peninsula and nearby islands could still pick up stray
//      "low vegetation" red. Everything south of 60°S - the Antarctic Treaty
//      boundary, which only crosses open ocean - is now left out of the
//      overlay entirely. southPolarCutoffRow gives the first pixel row of
//      tile (y, z) that lies fully south of that line (256 if none do), so
//      the check costs nothing for the vast majority of tiles.
//      Written: 2026-09-24 · Claude Opus 5.5 · requested by David
const SOUTH_POLAR_CUTOFF_LAT = -60;
const SOUTH_POLAR_CUTOFF_MERC_Y = (() => {
  const latRad = SOUTH_POLAR_CUTOFF_LAT * Math.PI / 180;
  return (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2;
})();
function southPolarCutoffRow(y, z) {
  const worldPx = Math.pow(2, z) * 256;
  const row = Math.ceil(SOUTH_POLAR_CUTOFF_MERC_Y * worldPx - y * 256);
  return Math.max(0, Math.min(256, row));
}

// [AI] Load-time pass (David asked to optimize load times): a 4xx - e.g. a
//      404 for a tile GIBS simply has no data for - will never succeed on a
//      retry, but this used to wait out both 350ms retry delays anyway
//      before giving up, holding that tile's slot for ~700ms+ for nothing.
//      Only network errors and 5xx are retried now.
//      Written: 2026-09-24 · Claude Opus 5.5 · requested by David
async function fetchWithRetry(url, retries, delayMs) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      lastErr = new Error('request failed: ' + res.status);
      if (res.status >= 400 && res.status < 500) {
        lastErr.permanent = true;
        throw lastErr;
      }
    } catch (err) {
      lastErr = err;
      if (err.permanent) throw err;
    }
    if (attempt < retries) await new Promise((r) => setTimeout(r, delayMs));
  }
  throw lastErr;
}

// [AI] Load-time pass #2 (David noticed tiles loading slower after the
//      year-by-year imagery was added). Measured: NASA GIBS answers one tile
//      in ~100-350 ms but queues bursts (a dozen at once took 1.4-2.3 s
//      each), and it marks every NDVI tile "no-store", so browsers never
//      reuse them - every visit re-downloads them all. A given year's NDVI
//      tile never changes, and NASA data has no reuse restrictions, so
//      fetchNasaTile keeps them in the browser's Cache Storage: revisited
//      areas and return visits load the vegetation layer with no network
//      request at all. Oldest entries are dropped past NASA_CACHE_LIMIT
//      (~20-40 MB). Cache Storage only exists on https/localhost; anywhere
//      else (e.g. a phone on the dev server's LAN address) this just falls
//      back to a normal download.
//      Written: 2026-09-29 · Claude Opus 5.5 · requested by David
const NASA_CACHE_NAME = 'chlorosat-nasa-tiles-v1';
const NASA_CACHE_LIMIT = 1500;
let nasaCachePromise = null;
let nasaCachePuts = 0;

function openNasaCache() {
  if (!nasaCachePromise) {
    nasaCachePromise = (typeof caches !== 'undefined' && typeof window !== 'undefined' && window.isSecureContext)
      ? caches.open(NASA_CACHE_NAME).catch(() => null)
      : Promise.resolve(null);
  }
  return nasaCachePromise;
}

async function trimNasaCache(cache) {
  try {
    const keys = await cache.keys(); // oldest first
    const extra = keys.length - NASA_CACHE_LIMIT;
    for (let i = 0; i < extra; i++) await cache.delete(keys[i]);
  } catch (err) {
    // Trimming is best-effort.
  }
}

async function fetchNasaTile(url, retries, delayMs) {
  const cache = await openNasaCache();
  if (cache) {
    try {
      const hit = await cache.match(url);
      if (hit) return hit;
    } catch (err) {
      // Fall through to the network.
    }
  }
  const res = await fetchWithRetry(url, retries, delayMs);
  if (cache) {
    cache.put(url, res.clone())
      .then(() => { if (++nasaCachePuts % 100 === 0) trimNasaCache(cache); })
      .catch(() => {});
  }
  return res;
}

// An empty body is MapLibre's signal for "this tile exists but is fully
// transparent" - far cheaper than the old approach of painting a blank
// canvas and PNG-encoding it just to say "nothing here".
function emptyTileResponse() {
  return { data: new ArrayBuffer(0) };
}

// [AI] One shared scratch canvas for every tile's draw -> read step, instead
//      of a brand-new canvas per tile. willReadFrequently keeps it CPU-
//      backed, so getImageData doesn't force a GPU readback each time.
//      Sharing is safe because each clear+drawImage+getImageData runs
//      synchronously, with no await in between for another tile to cut in.
//      Written: 2026-09-24 · Claude Opus 5.5 · requested by David
let scratchCtx = null;
function readPixels(source, sx, sy, sw, sh, smooth) {
  if (!scratchCtx) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    scratchCtx = c.getContext('2d', { willReadFrequently: true });
  }
  const ctx = scratchCtx;
  ctx.clearRect(0, 0, 256, 256);
  ctx.imageSmoothingEnabled = smooth;
  if (smooth) ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, 256, 256);
  return ctx.getImageData(0, 0, 256, 256);
}

// Simple FIFO cap for the raw-bitmap caches - these used to grow without
// limit over a session (each entry is a decoded 256x256 bitmap, ~256KB),
// which quietly ate memory the longer the globe was panned around.
function boundedSet(cache, key, value, limit) {
  if (cache.size >= limit) cache.delete(cache.keys().next().value);
  cache.set(key, value);
}
const RAW_CACHE_LIMIT = 256;

// [AI] Exact NDVI decoding. David found Manhattan (and dense city blocks
//      generally) showing no vegetation data at all. The cause was in how
//      NASA draws this layer, not in the app's water masking: NASA's legend
//      (colormap) makes every NDVI at or below zero fully transparent, and
//      roofs/asphalt sit right around zero. Separately, the app used to
//      guess each pixel's value by matching its color to the nearest of 16
//      colors from a *different* NDVI palette (Google Earth Engine's), which
//      misread NASA's browns and let its near-white low-NDVI colors through
//      un-recolored (the pink/white patches over cities and campuses).
//      NASA's tiles are indexed-color PNGs: each pixel stores the number of
//      a legend entry, and the file keeps each entry's color even when it's
//      drawn transparent. Reading those numbers directly (decodeIndexedPng)
//      and looking their colors up in NASA's published legend
//      (getNdviColormap) gives the true NDVI range for every pixel,
//      including telling "NDVI <= 0" apart from real "no data".
//      Written: 2026-09-28 · Claude Opus 5.5 · requested by David
const GIBS_NDVI_COLORMAP_URL = 'https://gibs.earthdata.nasa.gov/colormaps/v1.3/MODIS_NDVI.xml';
let ndviColormapPromise = null;

// Legend XML -> Map("r,g,b" -> NDVI at the middle of that entry's range,
// or NaN for the "no data" entry).
function parseNdviColormap(xml) {
  const legend = new Map();
  const entryRe = /<ColorMapEntry\b([^>]*)>/g;
  let m;
  while ((m = entryRe.exec(xml))) {
    const attrs = m[1];
    const rgb = (attrs.match(/\brgb="([^"]+)"/) || [])[1];
    if (!rgb) continue;
    const key = rgb.replace(/\s+/g, '');
    if (/\bnodata="true"/.test(attrs)) {
      legend.set(key, NaN);
      continue;
    }
    const range = attrs.match(/\bvalue="\[([-\d.]+),([-\d.]+)\)"/);
    if (range) legend.set(key, (Number(range[1]) + Number(range[2])) / 2);
  }
  return legend.size > 10 ? legend : null;
}

// Fetched once; a failed fetch is retried on the next tile rather than
// remembered, and in the meantime tiles use the old color-matching path.
function getNdviColormap() {
  if (!ndviColormapPromise) {
    ndviColormapPromise = fetch(GIBS_NDVI_COLORMAP_URL)
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error('HTTP ' + res.status))))
      .then(parseNdviColormap)
      .catch((err) => {
        console.warn('[chlorosat] NDVI legend unavailable, falling back to color matching:', err.message);
        ndviColormapPromise = null;
        return null;
      });
  }
  return ndviColormapPromise;
}

// Minimal PNG reader for 8-bit, non-interlaced, indexed-color images (what
// NASA serves): returns each pixel's palette index plus the palette colors.
// Returns null for anything else, so callers can fall back.
async function decodeIndexedPng(buffer) {
  if (typeof DecompressionStream === 'undefined') return null;
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  if (bytes.length < 33 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47) return null;
  let off = 8, width = 0, height = 0, plte = null;
  const idat = [];
  while (off + 8 <= bytes.length) {
    const len = view.getUint32(off);
    const type = String.fromCharCode(bytes[off + 4], bytes[off + 5], bytes[off + 6], bytes[off + 7]);
    const start = off + 8;
    if (type === 'IHDR') {
      width = view.getUint32(start);
      height = view.getUint32(start + 4);
      const bitDepth = bytes[start + 8], colorType = bytes[start + 9], interlace = bytes[start + 12];
      if (bitDepth !== 8 || colorType !== 3 || interlace !== 0) return null;
    } else if (type === 'PLTE') {
      plte = bytes.subarray(start, start + len);
    } else if (type === 'IDAT') {
      idat.push(bytes.subarray(start, start + len));
    } else if (type === 'IEND') {
      break;
    }
    off = start + len + 4;
  }
  if (!width || !height || !plte || !idat.length) return null;

  const stream = new Blob(idat).stream().pipeThrough(new DecompressionStream('deflate'));
  const data = new Uint8Array(await new Response(stream).arrayBuffer());
  if (data.length < height * (width + 1)) return null;

  // Undo PNG's per-row filters (1 byte per pixel).
  const idx = new Uint8Array(width * height);
  let p = 0;
  for (let y = 0; y < height; y++) {
    const filter = data[p++];
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const raw = data[p++];
      const a = x > 0 ? idx[row + x - 1] : 0;
      const b = y > 0 ? idx[row - width + x] : 0;
      const c = x > 0 && y > 0 ? idx[row - width + x - 1] : 0;
      let v;
      if (filter === 0) v = raw;
      else if (filter === 1) v = raw + a;
      else if (filter === 2) v = raw + b;
      else if (filter === 3) v = raw + ((a + b) >> 1);
      else if (filter === 4) {
        const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
        v = raw + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      } else return null;
      idx[row + x] = v & 255;
    }
  }
  const palette = [];
  for (let i = 0; i + 2 < plte.length; i += 3) palette.push(plte[i] + ',' + plte[i + 1] + ',' + plte[i + 2]);
  return { width, height, idx, palette };
}

// [AI] "No vegetation" only on substantial land. Tiny mangrove islets and
//      thin spits (Florida Bay, the Everglades coast) have no usable NASA
//      reading - their pixels are mostly water - so calling them "no
//      vegetation" drew misleading red specks. openedLandMask keeps only
//      land that is part of something at least ~2 NASA pixels (~500 m) wide
//      (a morphological "opening": shrink the land by `radius`, then grow
//      what's left back by the same amount). Manhattan survives intact right
//      up to its shoreline; islets narrower than that are left see-through.
//      Written: 2026-09-28 · Claude Opus 5.5 · requested by David
function chamferDistance(d, size) {
  const D = Math.SQRT2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      let v = d[i];
      if (x > 0 && d[i - 1] + 1 < v) v = d[i - 1] + 1;
      if (y > 0) {
        if (d[i - size] + 1 < v) v = d[i - size] + 1;
        if (x > 0 && d[i - size - 1] + D < v) v = d[i - size - 1] + D;
        if (x < size - 1 && d[i - size + 1] + D < v) v = d[i - size + 1] + D;
      }
      d[i] = v;
    }
  }
  for (let y = size - 1; y >= 0; y--) {
    for (let x = size - 1; x >= 0; x--) {
      const i = y * size + x;
      let v = d[i];
      if (x < size - 1 && d[i + 1] + 1 < v) v = d[i + 1] + 1;
      if (y < size - 1) {
        if (d[i + size] + 1 < v) v = d[i + size] + 1;
        if (x < size - 1 && d[i + size + 1] + D < v) v = d[i + size + 1] + D;
        if (x > 0 && d[i + size - 1] + D < v) v = d[i + size - 1] + D;
      }
      d[i] = v;
    }
  }
  return d;
}

// waterMask: 256x256, 1 = water. Returns 1 where land belongs to a land mass
// at least 2 * radius pixels across. Water past the tile edge is unknown and
// treated as land, so a big island cut by the tile edge isn't mistaken for
// a small one.
function openedLandMask(waterMask, radius) {
  const size = 256, n = size * size, FAR = 1e9;
  const toWater = new Float32Array(n);
  for (let i = 0; i < n; i++) toWater[i] = waterMask[i] ? 0 : FAR; // water or wetland
  chamferDistance(toWater, size);
  const toCore = new Float32Array(n);
  for (let i = 0; i < n; i++) toCore[i] = toWater[i] > radius ? 0 : FAR;
  chamferDistance(toCore, size);
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) out[i] = !waterMask[i] && toCore[i] <= radius ? 1 : 0;
  return out;
}

// [AI] Gap filling. NASA drops ("no data") many pixels that mix land and
//      water - along coasts, mangroves, and small islands like the Florida
//      Keys - even when their neighbors are well vegetated. Painting all of
//      those as "no vegetation" drew red rims around coastlines and turned
//      most of the Keys red. Each pass fills a gap pixel with the average of
//      its measured neighbors, so NDVI_GAP_FILL_PASSES = 2 closes gaps up to
//      2 pixels (~500 m) from real data. Bigger holes, like the permanent one
//      over central Manhattan, stay unfilled and are drawn as "no vegetation"
//      where the map says it's land.
//      Written: 2026-09-28 · Claude Opus 5.5 · requested by David
const NDVI_GAP_FILL_PASSES = 2;
function fillNdviGaps(vals, size, passes) {
  for (let pass = 0; pass < passes; pass++) {
    const prev = vals.slice();
    let filledAny = false;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = y * size + x;
        if (!Number.isNaN(prev[i])) continue;
        let sum = 0, count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= size) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            if (xx < 0 || xx >= size || (dx === 0 && dy === 0)) continue;
            const v = prev[yy * size + xx];
            if (!Number.isNaN(v)) { sum += v; count++; }
          }
        }
        if (count) { vals[i] = sum / count; filledAny = true; }
      }
    }
    if (!filledAny) break;
  }
  return vals;
}

// [AI] Exact shorelines. David saw the vegetation layer bleed a little onto
//      rivers and coasts when zoomed in (e.g. the Hudson and East River along
//      Manhattan). NASA's land/water map is a ~300 m grid, so its edges are
//      blocky once enlarged. OpenFreeMap's map tiles (already downloaded for
//      the place labels) carry the exact water outlines as vector shapes;
//      parseMvtWater pulls just the "water" layer out of one of those tiles
//      so the veg layer can be trimmed right at the shoreline.
//      Written: 2026-09-28 · Claude Opus 5.5 · requested by David
// Minimal Mapbox Vector Tile (protobuf) reader. Returns
// { extent, water, wetland }: the "water" layer's polygons, plus
// "landcover" polygons of class wetland (marsh, swamp, tidal flats...).
// Each is a list of features, each feature a list of rings, each ring a
// flat [x0, y0, x1, y1, ...] array in tile units (0..extent).
function parseMvtWater(bytes) {
  let pos = 0;
  const varint = () => {
    let value = 0, shift = 0, byte;
    do {
      byte = bytes[pos++];
      value += (byte & 0x7f) * 2 ** shift;
      shift += 7;
    } while (byte & 0x80);
    return value;
  };
  const skip = (wireType) => {
    if (wireType === 0) varint();
    else if (wireType === 1) pos += 8;
    else if (wireType === 2) { const len = varint(); pos += len; }
    else if (wireType === 5) pos += 4;
    else throw new Error('bad wire type');
  };
  const decoder = new TextDecoder();
  const zigzag = (n) => (n >>> 1) ^ -(n & 1);

  // Returns { rings, tags } for a polygon feature, else null.
  function parseFeature(end) {
    let type = 0, geomStart = -1, geomEnd = -1;
    const tags = [];
    while (pos < end) {
      const tag = varint();
      const field = tag >>> 3, wireType = tag & 7;
      if (field === 3 && wireType === 0) type = varint();
      else if (field === 2 && wireType === 2) { const tagsEnd = varint() + pos; while (pos < tagsEnd) tags.push(varint()); }
      else if (field === 4 && wireType === 2) { const len = varint(); geomStart = pos; geomEnd = pos + len; pos += len; }
      else skip(wireType);
    }
    if (type !== 3 || geomStart < 0) return null;
    pos = geomStart;
    const rings = [];
    let ring = null, x = 0, y = 0;
    while (pos < geomEnd) {
      const cmd = varint();
      const id = cmd & 7, count = cmd >>> 3;
      if (id === 1 || id === 2) {
        for (let k = 0; k < count; k++) {
          x += zigzag(varint());
          y += zigzag(varint());
          if (id === 1) { ring = [x, y]; rings.push(ring); } else if (ring) ring.push(x, y);
        }
      }
    }
    pos = end;
    return rings.length ? { rings, tags } : null;
  }

  const result = { extent: 4096, water: [], wetland: [] };
  while (pos < bytes.length) {
    const tag = varint();
    const field = tag >>> 3, wireType = tag & 7;
    if (field !== 3 || wireType !== 2) { skip(wireType); continue; }
    const layerEnd = varint() + pos;
    let name = '', extent = 4096;
    const featureRanges = [], keys = [], values = [];
    while (pos < layerEnd) {
      const t = varint();
      const f = t >>> 3, w = t & 7;
      if (f === 1 && w === 2) { const len = varint(); name = decoder.decode(bytes.subarray(pos, pos + len)); pos += len; }
      else if (f === 2 && w === 2) { const len = varint(); featureRanges.push(pos, pos + len); pos += len; }
      else if (f === 3 && w === 2) { const len = varint(); keys.push(decoder.decode(bytes.subarray(pos, pos + len))); pos += len; }
      else if (f === 4 && w === 2) {
        const valueEnd = varint() + pos;
        let value = null;
        while (pos < valueEnd) {
          const vt = varint();
          if (vt >>> 3 === 1 && (vt & 7) === 2) { const len = varint(); value = decoder.decode(bytes.subarray(pos, pos + len)); pos += len; }
          else skip(vt & 7);
        }
        values.push(value);
      }
      else if (f === 5 && w === 0) extent = varint();
      else skip(w);
    }
    if (name === 'water' || name === 'landcover') {
      const classKey = keys.indexOf('class');
      const target = name === 'water' ? result.water : result.wetland;
      for (let i = 0; i < featureRanges.length; i += 2) {
        pos = featureRanges[i];
        const feature = parseFeature(featureRanges[i + 1]);
        if (!feature) continue;
        if (name === 'landcover') {
          let isWetland = false;
          for (let k = 0; k < feature.tags.length; k += 2) {
            if (feature.tags[k] === classKey && values[feature.tags[k + 1]] === 'wetland') isWetland = true;
          }
          if (!isWetland) continue;
        }
        target.push(feature.rings);
      }
      result.extent = extent;
    }
    pos = layerEnd;
  }
  return result;
}

// Satellite tiles go through the esrisat:// protocol below rather than
// straight to Esri, so gaps in Esri's close-up coverage can be filled in.
const ESRI_IMAGERY_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/';
// [AI] Keyed Esri imagery. Esri's terms want apps to use World Imagery with
//      an ArcGIS account, so David made a free ArcGIS Location Platform API
//      key (Basemap styles privilege). It lives in .env.local as
//      NEXT_PUBLIC_ESRI_API_KEY - git-ignored, and Next.js builds it into
//      the page, which is expected for a browser-side "public application"
//      key (restrict it to the site's address in the key's Referrers
//      setting). Without a key, or if Esri rejects it (expired, free tier
//      used up), tiles fall back to the old keyless address above so the
//      map never goes blank. Pay-as-you-go is off on the account, so going
//      over the free tier just disables the key until the month resets.
//      Written: 2026-09-29 · Claude Opus 5.5 · requested by David
const ESRI_KEYED_IMAGERY_URL = 'https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/';
const ESRI_API_KEY = (process.env.NEXT_PUBLIC_ESRI_API_KEY || '').trim();

// [AI] Satellite imagery by year (TEST - David is trying it out). Esri's
//      World Imagery Wayback archive keeps every published version of World
//      Imagery since 2014, so the year slider can switch the satellite photo
//      along with the vegetation layer: each year uses the Wayback release
//      closest to mid-August (the NDVI date). A release is a snapshot of the
//      whole map as published that day, not photos taken that year - busy
//      places change often, remote ones can reuse years-old photos - so
//      the credit line lists the actual capture years of the photos on
//      screen (see updateImageryCredit).
//      Set USE_WAYBACK_BY_YEAR to false to go back to always showing today's
//      imagery; nothing else needs to change.
//      Written: 2026-09-29 · Claude Opus 5.5 · requested by David
const USE_WAYBACK_BY_YEAR = true;
const WAYBACK_CONFIG_URL = 'https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json';
const WAYBACK_TILE_URL = 'https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/';
let waybackReleasesPromise = null;

// { "2023": { id, date: Date, metadataUrl }, ... } - one release per year,
// the one published closest to August 13. Fetched once per page load, so
// new Wayback releases are picked up automatically.
function getWaybackReleases() {
  if (!waybackReleasesPromise) {
    waybackReleasesPromise = fetch(WAYBACK_CONFIG_URL)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('HTTP ' + res.status))))
      .then((config) => {
        const byYear = {};
        for (const [id, info] of Object.entries(config)) {
          const m = String(info.itemTitle || '').match(/(\d{4})-(\d{2})-(\d{2})/);
          if (!m) continue;
          const date = new Date(m[0] + 'T00:00:00Z');
          const target = new Date(m[1] + '-08-13T00:00:00Z');
          const gap = Math.abs(date - target);
          if (!byYear[m[1]] || gap < byYear[m[1]].gap) {
            byYear[m[1]] = { id, date, gap, metadataUrl: info.metadataLayerUrl };
          }
        }
        return byYear;
      })
      .catch((err) => {
        console.warn('[chlorosat] Wayback release list unavailable, showing current imagery:', err.message);
        waybackReleasesPromise = null;
        return null;
      });
  }
  return waybackReleasesPromise;
}
const BASEMAPS = {
  satellite: ['esrisat://{z}/{x}/{y}']
};

// [AI] "Map" view drawn from OpenFreeMap's vector tiles instead of
//      OpenStreetMap's pre-rendered image tiles. David wanted a map with no
//      names or borders baked in: these layers are just shapes (land, forest,
//      parks, towns, water, roads, buildings) in a dark style to match the
//      app, and the names/borders on top are the same app-drawn label layers
//      the satellite view uses (referenceLabels.js), so they behave the same
//      in both views. Same tiles the labels and water mask already download,
//      so no extra server - and no more reliance on tile.openstreetmap.org,
//      whose usage policy discourages sites with real traffic.
//      Written: 2026-09-29 · Claude Opus 5.5 · requested by David
const classIn = (classes) => ['match', ['get', 'class'], classes, true, false];
// [AI] 'light' = the classic OpenStreetMap look David preferred (cream land,
//      light-blue water, green parks, yellow/orange main roads) - still with
//      no names baked in. 'dark' = the first, darker version matching the UI.
//      Written: 2026-09-29 · Claude Opus 5.5 · requested by David
const MAP_THEME = 'light'; // 'light' | 'dark'
const MAP_PALETTES = {
  light: {
    land: '#f2efe9', wood: '#add19e', grass: '#cdebb0', farmland: '#eef0d5', wetland: '#d6e7d4',
    ice: '#ddecec', sand: '#f5e9c6', rock: '#e5e1da', otherCover: '#e3ecd4', park: '#c8facc',
    residential: '#e0dfdf', commercial: '#f2dad9', industrial: '#ebdbe8', retail: '#ffd6d1',
    water: '#aad3df', minorRoad: '#ffffff', minorCasing: '#d6cfc7',
    motorway: '#e892a2', trunk: '#f9b29c', primary: '#fcd6a4', secondary: '#f7fabf', majorCasing: '#c2b5a5',
    building: '#d9d0c9', buildingOutline: '#c4b6ab'
  },
  dark: {
    land: '#1b1f23', wood: '#1c2821', grass: '#1e2722', farmland: '#21251f', wetland: '#1a2527',
    ice: '#2a3035', sand: '#29271f', rock: '#24262a', otherCover: '#1d2220', park: '#1d2a22',
    residential: '#22262b', commercial: '#22262b', industrial: '#22262b', retail: '#22262b',
    water: '#0d1721', minorRoad: '#2b3137', minorCasing: '#1b1f23',
    motorway: '#3a4249', trunk: '#3a4249', primary: '#3a4249', secondary: '#3a4249', majorCasing: '#1b1f23',
    building: '#262b30', buildingOutline: '#30363c'
  }
};
const P = MAP_PALETTES[MAP_THEME];
const MINOR_ROAD_WIDTH = ['interpolate', ['exponential', 1.5], ['zoom'], 12, 0.5, 18, 7];
const MAJOR_ROAD_WIDTH = ['interpolate', ['exponential', 1.5], ['zoom'], 5, 0.4, 18, 11];
const casingWidth = (width) => ['interpolate', ['exponential', 1.5], ['zoom'], width[3], width[4] + 0.6, width[5], width[6] + 2];
const MAP_LAYERS = [
  { id: 'map-land', type: 'background', paint: { 'background-color': P.land } },
  {
    id: 'map-landcover', type: 'fill', source: REF_SOURCE_ID, 'source-layer': 'landcover',
    paint: {
      'fill-color': ['match', ['get', 'class'],
        'wood', P.wood, 'grass', P.grass, 'farmland', P.farmland, 'wetland', P.wetland,
        'ice', P.ice, 'sand', P.sand, 'rock', P.rock, P.otherCover]
    }
  },
  { id: 'map-park', type: 'fill', source: REF_SOURCE_ID, 'source-layer': 'park', paint: { 'fill-color': P.park } },
  {
    id: 'map-urban', type: 'fill', source: REF_SOURCE_ID, 'source-layer': 'landuse', minzoom: 8,
    filter: classIn(['residential', 'commercial', 'industrial', 'retail']),
    paint: {
      'fill-color': ['match', ['get', 'class'],
        'commercial', P.commercial, 'industrial', P.industrial, 'retail', P.retail, P.residential]
    }
  },
  { id: 'map-water', type: 'fill', source: REF_SOURCE_ID, 'source-layer': 'water', paint: { 'fill-color': P.water } },
  {
    id: 'map-waterway', type: 'line', source: REF_SOURCE_ID, 'source-layer': 'waterway', minzoom: 8,
    paint: { 'line-color': P.water, 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 14, 2.5] }
  },
  {
    id: 'map-roads-minor-casing', type: 'line', source: REF_SOURCE_ID, 'source-layer': 'transportation', minzoom: 13,
    filter: classIn(['minor', 'service', 'tertiary']),
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': P.minorCasing, 'line-width': casingWidth(MINOR_ROAD_WIDTH) }
  },
  {
    id: 'map-roads-minor', type: 'line', source: REF_SOURCE_ID, 'source-layer': 'transportation', minzoom: 12,
    filter: classIn(['minor', 'service', 'tertiary']),
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': P.minorRoad, 'line-width': MINOR_ROAD_WIDTH }
  },
  {
    id: 'map-roads-major-casing', type: 'line', source: REF_SOURCE_ID, 'source-layer': 'transportation', minzoom: 9,
    filter: classIn(['motorway', 'trunk', 'primary', 'secondary']),
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': P.majorCasing, 'line-width': casingWidth(MAJOR_ROAD_WIDTH) }
  },
  {
    id: 'map-roads-major', type: 'line', source: REF_SOURCE_ID, 'source-layer': 'transportation', minzoom: 5,
    filter: classIn(['motorway', 'trunk', 'primary', 'secondary']),
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': ['match', ['get', 'class'],
        'motorway', P.motorway, 'trunk', P.trunk, 'primary', P.primary, P.secondary],
      'line-width': MAJOR_ROAD_WIDTH
    }
  },
  {
    id: 'map-buildings', type: 'fill', source: REF_SOURCE_ID, 'source-layer': 'building', minzoom: 14,
    paint: { 'fill-color': P.building, 'fill-outline-color': P.buildingOutline }
  }
].map((layer) => ({ ...layer, layout: { ...(layer.layout || {}), visibility: 'none' } }));
// The app-drawn labels are styled for satellite photos (white text, dark
// outline). On the light map they switch to dark text with a white outline;
// switchBasemap restores the originals for satellite.
const LIGHT_MAP_LABEL_PAINT = MAP_THEME !== 'light' ? {} : {
  'ref-boundary-state': { 'line-color': '#b39fb8' },
  'ref-boundary-country': { 'line-color': '#9e7fa6' },
  'ref-water-name': { 'text-color': '#4a7c9b', 'text-halo-color': 'rgba(255, 255, 255, 0.8)' },
  'ref-water-name-lake': { 'text-color': '#4a7c9b', 'text-halo-color': 'rgba(255, 255, 255, 0.8)' },
  'ref-place-village': { 'text-color': '#333333', 'text-halo-color': 'rgba(255, 255, 255, 0.9)' },
  'ref-place-town': { 'text-color': '#333333', 'text-halo-color': 'rgba(255, 255, 255, 0.9)' },
  'ref-place-city': { 'text-color': '#222222', 'text-halo-color': 'rgba(255, 255, 255, 0.9)' },
  'ref-place-state': { 'text-color': '#7b6a86', 'text-halo-color': 'rgba(255, 255, 255, 0.85)' },
  'ref-place-country': { 'text-color': '#5c4e66', 'text-halo-color': 'rgba(255, 255, 255, 0.9)' }
};
const MAP_LAYER_IDS = MAP_LAYERS.map((layer) => layer.id);
const BASE_VEG_OPACITY_STOPS = [0, 1, 4, 0.85, 9, 0.4];
// A ["zoom"] expression may only appear as the top-level input to
// step/interpolate, never nested inside another expression like ["*", ...]
// (that's what broke on the real MapLibre build, vs. whatever looser check
// the standalone prototype's version happened to skip). So instead of
// multiplying a factor onto the interpolate expression at style-eval time,
// bake the factor into the stop values themselves - this still produces a
// live, per-zoom-interpolated opacity, it's just computed in JS whenever
// the factor changes rather than inside the style expression.
function vegOpacityExpr(factor) {
  const stops = ['interpolate', ['linear'], ['zoom']];
  for (let i = 0; i < BASE_VEG_OPACITY_STOPS.length; i += 2) {
    stops.push(BASE_VEG_OPACITY_STOPS[i], BASE_VEG_OPACITY_STOPS[i + 1] * factor);
  }
  return stops;
}

export function createChlorosatGlobe({ container, onLoadingChange }) {
  let NDVI_DATE = '2026-08-13'; // must match MapApp's default year
  let pendingTiles = 0;
  const notifyLoading = () => onLoadingChange && onLoadingChange(pendingTiles);
  function tileStarted() { pendingTiles++; notifyLoading(); }
  function tileFinished() { pendingTiles = Math.max(0, pendingTiles - 1); notifyLoading(); }

  function nativeUrl(z, x, y) {
    const xw = wrapX(x, z);
    return 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_L3_NDVI_16Day/' +
      'default/' + NDVI_DATE + '/GoogleMapsCompatible_Level9/' + z + '/' + y + '/' + xw + '.png';
  }
  function maskUrl(z, x, y) {
    const xw = wrapX(x, z);
    return 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/std/OSM_Land_Water_Map/' +
      'default/GoogleMapsCompatible_Level9/' + z + '/' + y + '/' + xw + '.png';
  }
  function recolorImageData(imgData, x, y, z, stage, maskData) {
    const d = imgData.data;
    const md = maskData ? maskData.data : null;
    const hasNoise = stage.octaves > 0;
    const grid = hasNoise ? buildNoiseGrid(x, y, stage.octaves) : null;
    const polarRow = southPolarCutoffRow(y, z);
    for (let i = polarRow * 256 * 4 + 3; i < d.length; i += 4) d[i] = 0;
    for (let py = 0; py < polarRow; py++) {
      const gyF = py / NOISE_GRID_STEP;
      const gy0 = gyF | 0;
      const fy = gyF - gy0;
      for (let px = 0; px < 256; px++) {
        const i = (py * 256 + px) * 4;
        const a = d[i + 3];
        if (a < 20) continue;
        if (md && isWaterPixel(md[i], md[i + 1], md[i + 2], md[i + 3])) {
          d[i + 3] = 0;
          continue;
        }
        const r0 = d[i], g0 = d[i + 1], b0 = d[i + 2];
        if (r0 > 235 && g0 > 235 && b0 > 235) continue;
        const maxC = Math.max(r0, g0, b0), minC = Math.min(r0, g0, b0);
        if (maxC - minC < 12) continue;
        let t = vegetationScore(r0, g0, b0);
        if (hasNoise) {
          const gxF = px / NOISE_GRID_STEP;
          const gx0 = gxF | 0;
          const fx = gxF - gx0;
          const row0 = gy0 * NOISE_GRID_SIZE, row1 = row0 + NOISE_GRID_SIZE;
          const n00 = grid[row0 + gx0], n10 = grid[row0 + gx0 + 1];
          const n01 = grid[row1 + gx0], n11 = grid[row1 + gx0 + 1];
          const nx0 = n00 + (n10 - n00) * fx;
          const nx1 = n01 + (n11 - n01) * fx;
          const nInterp = nx0 + (nx1 - nx0) * fy;
          const n = (nInterp - 0.5) * 2 * stage.noiseAmt;
          t = t + n;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
        }
        const idx = (t * (HEAT_LUT_SIZE - 1)) | 0;
        const li = idx * 3;
        d[i] = HEAT_LUT[li]; d[i + 1] = HEAT_LUT[li + 1]; d[i + 2] = HEAT_LUT[li + 2];
      }
    }
    return imgData;
  }

  // [AI] Removed the synthetic "vegFallback" layer. If NASA hadn't
  //      answered within 8 seconds, the app used to swap in made-up tiles
  //      (public/fallback-tiles.json: a green band at the equator fading to
  //      tan at the poles) that looked like real vegetation data. David
  //      asked to drop it as a misrepresentation; if NASA is unreachable
  //      the vegetation layer now just stays empty.
  //      Written: 2026-09-28 · Claude Opus 5.5 · requested by David

  // One NASA tile, decoded. Normally { kind: 'ndvi', idx, lut }: idx holds
  // each pixel's legend number and lut[number] its NDVI (NaN = no data).
  // If NASA's legend or the PNG format isn't what's expected, it falls back
  // to { kind: 'bitmap', bitmap } for the old color-matching path.
  let rawBitmapCache = new Map();
  async function getNdviSource(z, x, y) {
    const key = z + '/' + x + '/' + y;
    if (rawBitmapCache.has(key)) return rawBitmapCache.get(key);
    const p = fetchNasaTile(nativeUrl(z, x, y), 2, 350)
      .then(async (res) => {
        const buffer = await res.arrayBuffer();
        const legend = await getNdviColormap();
        if (legend) {
          const png = await decodeIndexedPng(buffer).catch(() => null);
          if (png && png.width === 256 && png.height === 256) {
            const lut = new Float32Array(256).fill(NaN);
            png.palette.forEach((rgb, i) => {
              const value = legend.get(rgb);
              if (value !== undefined) lut[i] = value;
            });
            const vals = new Float32Array(256 * 256);
            for (let i = 0; i < vals.length; i++) vals[i] = lut[png.idx[i]];
            return { kind: 'ndvi', vals: fillNdviGaps(vals, 256, NDVI_GAP_FILL_PASSES) };
          }
        }
        return { kind: 'bitmap', bitmap: await createImageBitmap(new Blob([buffer])) };
      })
      .catch((err) => { rawBitmapCache.delete(key); throw err; });
    boundedSet(rawBitmapCache, key, p, RAW_CACHE_LIMIT);
    return p;
  }

  // Paints one output tile from decoded NDVI. (sx, sy, span) is the square
  // of the source tile it covers: the whole tile at zoom <= 9, a smaller
  // piece enlarged past that. Rules:
  //  - NDVI <= 0 or "no data" on land (per the mask) -> lowest color ("no
  //    vegetation"). NASA's data has a permanent "no data" hole over dense
  //    urban cores like Midtown/Lower Manhattan (same in every year checked,
  //    2020-2025), which otherwise showed as land with nothing on it.
  //  - "no data" off land / unconfirmed -> transparent
  //  - NDVI <= 0 on water, or where the mask can't confirm land -> hidden
  //  - NDVI > 0 -> the color scale; on water hidden too at zoom <= 9
  //    (maskAll). Past zoom 9 the mask is only a stretched ~300 m grid, so
  //    it's used just for the NDVI <= 0 decision there - using it on
  //    everything is what once blanked out real Manhattan land.
  // Enlarged tiles blend the four nearest source pixels (bilinear), using
  // only pixels with NDVI > 0 so gaps and water don't bleed into the blend.
  function renderNdviTile(src, sx, sy, span, x, y, z, stage, maskData, maskAll, vecWater) {
    const out = new ImageData(256, 256);
    const d = out.data;
    const { vals } = src;
    const md = maskData && waterRefColor ? maskData.data : null;
    const scale = span / 256;
    const hasNoise = stage.octaves > 0;
    const grid = hasNoise ? buildNoiseGrid(x, y, stage.octaves) : null;
    const polarRow = southPolarCutoffRow(y, z);
    // One NASA pixel, in this tile's pixels (see openedLandMask).
    const gapRadius = 1 / scale;
    let solidLand = null;
    for (let py = 0; py < polarRow; py++) {
      const v = sy + (py + 0.5) * scale - 0.5;
      const vf = Math.floor(v);
      const fy = v - vf;
      const y0 = Math.min(255, Math.max(0, vf)) * 256;
      const y1 = Math.min(255, Math.max(0, vf + 1)) * 256;
      const yn = Math.min(255, Math.max(0, Math.round(v))) * 256;
      const gyF = py / NOISE_GRID_STEP;
      const gy0 = gyF | 0;
      const gfy = gyF - gy0;
      for (let px = 0; px < 256; px++) {
        const u = sx + (px + 0.5) * scale - 0.5;
        const uf = Math.floor(u);
        const fx = u - uf;
        const nearest = vals[yn + Math.min(255, Math.max(0, Math.round(u)))];
        const i = (py * 256 + px) * 4;
        let known = false, water = false;
        let wetland = false;
        if (vecWater) {
          known = true;
          water = vecWater[py * 256 + px] === 1;
          wetland = vecWater[py * 256 + px] === 2;
        } else if (md && md[i + 3] >= 20) {
          known = true;
          water = isWaterPixel(md[i], md[i + 1], md[i + 2], md[i + 3]);
        }
        let t;
        if (!(nearest > 0)) {
          // NDVI <= 0, or NASA's "no data" (NaN), on land -> no vegetation.
          // In mapped wetlands (marsh, swamp, tidal flats) a reading at or
          // below zero, or none at all, almost always means standing water,
          // so those aren't called "no vegetation" either.
          if (!known || water || wetland) continue;
          if (vecWater) {
            if (!solidLand) solidLand = openedLandMask(vecWater, gapRadius);
            if (!solidLand[py * 256 + px]) continue;
          }
          t = 0;
        } else {
          if (maskAll && water) continue;
          const x0 = Math.min(255, Math.max(0, uf));
          const x1 = Math.min(255, Math.max(0, uf + 1));
          const corner = [vals[y0 + x0], vals[y0 + x1], vals[y1 + x0], vals[y1 + x1]];
          const weights = [(1 - fx) * (1 - fy), fx * (1 - fy), (1 - fx) * fy, fx * fy];
          let sum = 0, wsum = 0;
          for (let k = 0; k < 4; k++) {
            if (corner[k] > 0) { sum += corner[k] * weights[k]; wsum += weights[k]; }
          }
          t = wsum > 0 ? sum / wsum : nearest;
          if (hasNoise) {
            const gxF = px / NOISE_GRID_STEP;
            const gx0 = gxF | 0;
            const gfx = gxF - gx0;
            const row0 = gy0 * NOISE_GRID_SIZE, row1 = row0 + NOISE_GRID_SIZE;
            const n0 = grid[row0 + gx0] + (grid[row0 + gx0 + 1] - grid[row0 + gx0]) * gfx;
            const n1 = grid[row1 + gx0] + (grid[row1 + gx0 + 1] - grid[row1 + gx0]) * gfx;
            t += ((n0 + (n1 - n0) * gfy) - 0.5) * 2 * stage.noiseAmt;
          }
          t = t < 0 ? 0 : t > 1 ? 1 : t;
        }
        const li = ((t * (HEAT_LUT_SIZE - 1)) | 0) * 3;
        d[i] = HEAT_LUT[li]; d[i + 1] = HEAT_LUT[li + 1]; d[i + 2] = HEAT_LUT[li + 2]; d[i + 3] = 255;
      }
    }
    return out;
  }

  const maskBitmapCache = new Map();
  async function getRawMaskBitmap(z, x, y) {
    const key = z + '/' + x + '/' + y;
    if (maskBitmapCache.has(key)) return maskBitmapCache.get(key);
    const p = fetchNasaTile(maskUrl(z, x, y), 1, 350)
      .then((res) => res.blob())
      .then((blob) => createImageBitmap(blob))
      .catch((err) => { maskBitmapCache.delete(key); return null; });
    boundedSet(maskBitmapCache, key, p, RAW_CACHE_LIMIT);
    return p;
  }

  let waterRefColor = null;
  let landRefColor = null;
  const WATER_SAMPLE_TILE = { z: 3, x: 0, y: 4 };
  const LAND_SAMPLE_TILE = { z: 3, x: 4, y: 3 };
  const WATER_MATCH_THRESHOLD_SQ = 2400;

  async function sampleModalColor(z, x, y) {
    const bitmap = await getRawMaskBitmap(z, x, y);
    if (!bitmap) return null;
    const data = readPixels(bitmap, 0, 0, bitmap.width, bitmap.height, true).data;
    const totalPixels = data.length / 4;
    let transparentCount = 0;
    const counts = new Map();
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 20) { transparentCount++; continue; }
      const key = (data[i] >> 3) + ',' + (data[i + 1] >> 3) + ',' + (data[i + 2] >> 3);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    if (transparentCount > totalPixels * 0.6) return { transparent: true };
    let bestKey = null, bestCount = -1;
    for (const [key, count] of counts) {
      if (count > bestCount) { bestCount = count; bestKey = key; }
    }
    if (!bestKey) return null;
    const [qr, qg, qb] = bestKey.split(',').map(Number);
    return { transparent: false, r: qr << 3, g: qg << 3, b: qb << 3 };
  }

  function isWaterPixel(mr, mg, mb, ma) {
    if (!waterRefColor || ma < 20) return false;
    const dWater = (mr - waterRefColor.r) ** 2 + (mg - waterRefColor.g) ** 2 + (mb - waterRefColor.b) ** 2;
    if (landRefColor) {
      const dLand = (mr - landRefColor.r) ** 2 + (mg - landRefColor.g) ** 2 + (mb - landRefColor.b) ** 2;
      return dWater < dLand;
    }
    return dWater < WATER_MATCH_THRESHOLD_SQ;
  }

  async function detectWaterColor() {
    try {
      const [waterSample, landSample] = await Promise.all([
        sampleModalColor(WATER_SAMPLE_TILE.z, WATER_SAMPLE_TILE.x, WATER_SAMPLE_TILE.y),
        sampleModalColor(LAND_SAMPLE_TILE.z, LAND_SAMPLE_TILE.x, LAND_SAMPLE_TILE.y)
      ]);
      if (waterSample && !waterSample.transparent) waterRefColor = { r: waterSample.r, g: waterSample.g, b: waterSample.b };
      if (landSample && !landSample.transparent) landRefColor = { r: landSample.r, g: landSample.g, b: landSample.b };
    } catch (err) {
      // Not fatal - masking just stays off if this never succeeds.
    }
  }

  // Kicked off right away instead of waiting for the map's 'load' event
  // (which also waits on the style and first basemap tiles) - it only needs
  // two small mask tiles. The first visible veg tiles used to race it and
  // usually lose, getting cached unmasked; getMaskImageData now waits on it,
  // with the tile's own mask fetch running in parallel so it adds no extra
  // round trip.
  const waterColorReady = detectWaterColor();
  // Start fetching Esri's Wayback release list right away rather than when
  // the first satellite tile asks for it.
  if (USE_WAYBACK_BY_YEAR) getWaybackReleases();

  async function getMaskImageData(zForFetch, xForFetch, yForFetch, sx, sy, subSize) {
    const [bitmap] = await Promise.all([
      getRawMaskBitmap(zForFetch, xForFetch, yForFetch),
      waterColorReady
    ]);
    if (!waterRefColor || !bitmap) return null;
    return readPixels(bitmap, sx, sy, subSize, subSize, false);
  }

  // Exact water mask for one veg tile from OpenFreeMap's vector tiles (see
  // parseMvtWater). Those are 512px tiles, so MapLibre shows the tile one
  // zoom level up from ours - using that same one (z - 1, up to their max of
  // 14) means the browser already has it cached from drawing the labels.
  // Returns a 256x256 Uint8Array (0 = land, 1 = water, 2 = wetland) aligned
  // to the veg tile's
  // pixels, or null if the tile can't be had (callers then fall back to
  // NASA's land/water map).
  // Used at every zoom: NASA's land/water map (the fallback) only marks
  // oceans as water - big lakes like Victoria or Tanganyika are drawn as
  // land there, which painted them red when zoomed out.
  const VECTOR_WATER_MIN_ZOOM = 0;
  const VECTOR_WATER_MAX_SOURCE_ZOOM = 14;
  let vectorTileUrlPromise = null;
  const vectorWaterCache = new Map();
  let waterCanvasCtx = null;

  function getVectorTileUrlTemplate() {
    if (!vectorTileUrlPromise) {
      vectorTileUrlPromise = fetch(REF_SOURCE.url)
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error('HTTP ' + res.status))))
        .then((tileJson) => tileJson.tiles[0])
        .catch(() => { vectorTileUrlPromise = null; return null; });
    }
    return vectorTileUrlPromise;
  }

  function getVectorWater(z, x, y) {
    const key = z + '/' + x + '/' + y;
    if (vectorWaterCache.has(key)) return vectorWaterCache.get(key);
    const p = getVectorTileUrlTemplate()
      .then((template) => {
        if (!template) return null;
        const url = template.replace('{z}', z).replace('{x}', x).replace('{y}', y);
        return fetchWithRetry(url, 1, 350).then(async (res) => {
          let bytes = new Uint8Array(await res.arrayBuffer());
          // Normally un-gzipped by the browser already; handle it if not.
          if (bytes[0] === 0x1f && bytes[1] === 0x8b && typeof DecompressionStream !== 'undefined') {
            const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
            bytes = new Uint8Array(await new Response(stream).arrayBuffer());
          }
          return parseMvtWater(bytes);
        });
      })
      .catch(() => { vectorWaterCache.delete(key); return null; });
    boundedSet(vectorWaterCache, key, p, 128);
    return p;
  }

  async function getVectorWaterMask(z, x, y) {
    const zv = Math.max(0, Math.min(z - 1, VECTOR_WATER_MAX_SOURCE_ZOOM));
    const factor = 2 ** (z - zv);
    const xw = wrapX(x, z);
    const xv = Math.floor(xw / factor);
    const yv = Math.floor(y / factor);
    const water = await getVectorWater(zv, xv, yv);
    if (!water) return null;
    if (!waterCanvasCtx) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      waterCanvasCtx = canvas.getContext('2d', { willReadFrequently: true });
    }
    const ctx = waterCanvasCtx;
    const scale = (256 * factor) / water.extent;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, 256, 256);
    ctx.setTransform(scale, 0, 0, scale, -(xw - xv * factor) * 256, -(y - yv * factor) * 256);
    ctx.fillStyle = '#000';
    const mask = new Uint8Array(256 * 256);
    // Wetlands first (value 2), then water on top (value 1).
    for (const [features, value] of [[water.wetland, 2], [water.water, 1]]) {
      if (!features.length) continue;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, 256, 256);
      ctx.restore();
      for (const rings of features) {
        ctx.beginPath();
        for (const ring of rings) {
          ctx.moveTo(ring[0], ring[1]);
          for (let i = 2; i < ring.length; i += 2) ctx.lineTo(ring[i], ring[i + 1]);
          ctx.closePath();
        }
        ctx.fill('evenodd');
      }
      const alpha = ctx.getImageData(0, 0, 256, 256).data;
      for (let i = 0; i < mask.length; i++) if (alpha[i * 4 + 3] >= 128) mask[i] = value;
    }
    return mask;
  }

  // Holds finished tiles as ready-to-upload ImageBitmaps (see
  // buildVegTileBitmap). Each is ~256KB decoded vs. the ~30KB PNGs this used
  // to hold, so the cap is lower than the old 600.
  let tileResultCache = new Map();
  const TILE_CACHE_LIMIT = 300;
  function cacheTileResult(key, bitmap) {
    boundedSet(tileResultCache, key, bitmap, TILE_CACHE_LIMIT);
  }
  function clearDateDependentCaches() {
    rawBitmapCache = new Map();
    tileResultCache = new Map();
    const source = map.getSource('veg');
    if (source && source.setTiles) source.setTiles(source.tiles);
  }

  let vegVisible = true;

  // [AI] Load-time pass: this used to finish every tile by writing the
  //      recolored pixels back to a canvas, PNG-*encoding* it (toBlob),
  //      handing MapLibre the PNG bytes, and letting MapLibre immediately
  //      PNG-*decode* them again - the single slowest step per tile, and all
  //      of it on the main thread. MapLibre's addProtocol accepts an
  //      ImageBitmap directly, so the recolored pixels now go straight to it
  //      with no encode/decode round trip. Returns null (-> a transparent
  //      tile) when the source tile can't be fetched.
  //      Written: 2026-09-24 · Claude Opus 5.5 · requested by David
  async function buildVegTileBitmap(z, x, y) {
    const stage = detailStageFor(z);

    // Exact-NDVI path (see renderNdviTile). The code after this block is the
    // older color-matching path, now only used as a fallback.
    {
      const native = z <= NATIVE_MAX_ZOOM;
      const factor = native ? 1 : 2 ** (z - NATIVE_MAX_ZOOM);
      const zs = native ? z : NATIVE_MAX_ZOOM;
      const xs = Math.floor(x / factor);
      const ys = Math.floor(y / factor);
      const span = 256 / factor;
      const sx = (x - xs * factor) * span;
      const sy = (y - ys * factor) * span;
      // Exact vector shorelines (and lakes) at every zoom; NASA's coarse
      // land/water map only as the fallback if the vector tile can't load.
      const vecPromise = z >= VECTOR_WATER_MIN_ZOOM ? getVectorWaterMask(z, x, y).catch(() => null) : null;
      // NASA's land/water map is only a backup now (OpenFreeMap's water
      // outlines are used at every zoom), so it's no longer downloaded
      // alongside every tile - that doubled the requests queued at NASA.
      let maskPromise = !vecPromise ? getMaskImageData(zs, xs, ys, sx, sy, span) : null;
      let src;
      try {
        src = await getNdviSource(zs, xs, ys);
      } catch (err) {
        return null;
      }
      if (src.kind === 'ndvi') {
        const vecWater = vecPromise ? await vecPromise : null;
        let maskData = null;
        if (!vecWater) {
          if (!maskPromise) maskPromise = getMaskImageData(zs, xs, ys, sx, sy, span);
          maskData = await maskPromise;
        }
        return createImageBitmap(renderNdviTile(src, sx, sy, span, x, y, z, stage, maskData, native || !!vecWater, vecWater));
      }
    }

    if (z <= NATIVE_MAX_ZOOM) {
      const maskPromise = getMaskImageData(z, x, y, 0, 0, 256);
      let bitmap;
      try {
        bitmap = (await getNdviSource(z, x, y)).bitmap;
      } catch (err) {
        return null;
      }
      const imgData = readPixels(bitmap, 0, 0, bitmap.width, bitmap.height, true);
      const maskData = await maskPromise;
      recolorImageData(imgData, x, y, z, stage, maskData);
      return createImageBitmap(imgData);
    }

    const factor = Math.pow(2, z - NATIVE_MAX_ZOOM);
    const x9 = Math.floor(x / factor);
    const y9 = Math.floor(y / factor);
    const subSize = 256 / factor;
    const sx = (x - x9 * factor) * subSize;
    const sy = (y - y9 * factor) * subSize;

    // The water/no-data mask only ever exists at NATIVE_MAX_ZOOM
    // resolution (~305m/pixel) - for ANY tile past that zoom, applying it
    // means cropping a handful of source pixels and stretching them
    // (nearest-neighbor) over a much bigger area than they can actually
    // represent. A narrow, water-bounded landmass like Manhattan is only
    // ~12 of those pixels wide to begin with, so even a modest amount of
    // extrapolation was enough for one ambiguous "probably water" edge
    // pixel to get blown up over real land and blank out the whole city.
    // Rather than chase a "safe" subSize cutoff, the mask is just skipped
    // for the entire extrapolated range - occasionally leaving a patch of
    // open ocean colored is a far smaller problem than routinely hiding
    // real cities.
    let parent;
    try {
      parent = (await getNdviSource(NATIVE_MAX_ZOOM, x9, y9)).bitmap;
    } catch (err) {
      // Unlike the z<=NATIVE_MAX_ZOOM branch above, this path had no
      // fallback at all - if the upstream GIBS fetch for the parent zoom-9
      // tile failed (network hiccup, a transient 404, etc.), the promise
      // just rejected, MapLibre's raster loader has nothing to paint, and
      // the tile rendered as a solid black square instead of simply being
      // blank. Deep zoom (locate() flies to 15, well past NATIVE_MAX_ZOOM
      // 9) makes this path common, so a single flaky fetch anywhere in a
      // populated area was enough to blot out a whole visible region.
      return null;
    }

    const imgData = readPixels(parent, sx, sy, subSize, subSize, true);
    recolorImageData(imgData, x, y, z, stage, null);
    return createImageBitmap(imgData);
  }

  // [AI] David found that zooming far into remote areas like the Amazon
  //      turned the map into gray "Map data not yet available" squares.
  //      Esri's close-up imagery has gaps there, and instead of an error it
  //      sends that placeholder picture, which MapLibre drew as if it were
  //      real imagery. The placeholder is the exact same 2,521-byte JPEG at
  //      every zoom level, so this handler recognizes it by size + SHA-256
  //      and instead enlarges the matching corner of the nearest zoomed-out
  //      tile that does have imagery (up to 8 levels up). (Esri's
  //      ?blankTile=false option does the detection server-side, but its
  //      404s come back without CORS headers, flooding the browser console
  //      with two red errors per missing tile.) Zoom stays unlimited
  //      everywhere: full detail where Esri has
  //      it, a softer enlarged view where it doesn't, never placeholders.
  //      Parent lookups are cached, since every close-up tile under the
  //      same gap reuses the same parent.
  //      Written: 2026-09-28 · Claude Opus 5.5 · requested by David
  const SAT_FALLBACK_LEVELS = 8;
  const satParentCache = new Map();

  const ESRI_PLACEHOLDER_BYTES = 2521;
  const ESRI_PLACEHOLDER_SHA256 = '9eafd300d61393184a4abc1d458564cfd1cd9b6f9c4e9c74687045c0a0e5b858';

  // Only tiles of exactly the placeholder's size get hashed. crypto.subtle
  // is missing on plain-http pages (e.g. a phone on the dev server's LAN
  // address); a tile that size is then assumed to be the placeholder.
  async function isEsriPlaceholder(buffer) {
    if (buffer.byteLength !== ESRI_PLACEHOLDER_BYTES) return false;
    if (!(globalThis.crypto && crypto.subtle)) return true;
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', buffer));
    const hex = Array.from(digest, (b) => b.toString(16).padStart(2, '0')).join('');
    return hex === ESRI_PLACEHOLDER_SHA256;
  }

  // Keyed address first; after the first auth/quota rejection the rest of
  // the visit uses the keyless address. A plain network hiccup only falls
  // back for that one tile.
  let esriKeyUsable = ESRI_API_KEY.length > 0;
  function disableEsriKey(reason) {
    if (!esriKeyUsable) return;
    esriKeyUsable = false;
    console.warn('[chlorosat] Esri API key not accepted (' + reason + ') - using the keyless imagery address for this visit.');
  }
  async function fetchEsriTile(z, x, y, year) {
    if (USE_WAYBACK_BY_YEAR && year) {
      const releases = await getWaybackReleases();
      const release = releases && releases[year];
      if (release) {
        try {
          const res = await fetch(`${WAYBACK_TILE_URL}${release.id}/${z}/${y}/${x}`);
          if (res.ok && (res.headers.get('content-type') || '').startsWith('image/')) return res;
          if (res.status === 404) return null;
        } catch (err) {
          // Fall through to today's imagery for this tile.
        }
      }
    }
    if (esriKeyUsable) {
      try {
        const res = await fetch(`${ESRI_KEYED_IMAGERY_URL}${z}/${y}/${x}?token=${encodeURIComponent(ESRI_API_KEY)}`);
        const type = res.headers.get('content-type') || '';
        if (res.ok && type.startsWith('image/')) return res;
        if (res.status === 404) return null;
        // ArcGIS reports bad/expired tokens either as 401/403/498/499 or as
        // an HTTP 200 carrying a JSON error body - both mean "stop using it".
        disableEsriKey(res.status + (type ? ' ' + type.split(';')[0] : ''));
      } catch (err) {
        // Network error - try the keyless address for this tile only.
      }
    }
    const res = await fetch(`${ESRI_IMAGERY_URL}${z}/${y}/${x}`);
    return res.ok ? res : null;
  }

  function fetchSatBitmap(z, x, y, year) {
    return fetchEsriTile(z, x, y, year)
      .then(async (res) => {
        if (!res) return null;
        const buffer = await res.arrayBuffer();
        if (await isEsriPlaceholder(buffer)) return null;
        return createImageBitmap(new Blob([buffer]));
      })
      .catch(() => null);
  }

  function getSatParent(z, x, y, year) {
    const key = year + ':' + z + '/' + x + '/' + y;
    if (!satParentCache.has(key)) boundedSet(satParentCache, key, fetchSatBitmap(z, x, y, year), 64);
    return satParentCache.get(key);
  }

  // Satellite tile addresses carry the year (esrisat://z/x/y?y=2023) so
  // MapLibre treats each year's tiles as different tiles.
  let satYear = NDVI_DATE.slice(0, 4);
  const satelliteLabelPaint = {};
  let currentBasemap = 'satellite';
  function satelliteTiles() {
    return USE_WAYBACK_BY_YEAR ? [BASEMAPS.satellite[0] + '?y=' + satYear] : BASEMAPS.satellite;
  }

  maplibregl.addProtocol('esrisat', async (params) => {
    const [path, query = ''] = params.url.replace('esrisat://', '').split('?');
    const [z, xRaw, y] = path.split('/').map(Number);
    const year = (query.match(/(?:^|&)y=(\d{4})/) || [])[1] || null;
    const x = wrapX(xRaw, z);
    const own = await fetchSatBitmap(z, x, y, year);
    if (own) return { data: own };
    for (let dz = 1; dz <= SAT_FALLBACK_LEVELS && z - dz >= 0; dz++) {
      const factor = 2 ** dz;
      const px = Math.floor(x / factor);
      const py = Math.floor(y / factor);
      const parent = await getSatParent(z - dz, px, py, year);
      if (!parent) continue;
      const sub = parent.width / factor;
      const pixels = readPixels(parent, (x - px * factor) * sub, (y - py * factor) * sub, sub, sub, true);
      return { data: await createImageBitmap(pixels) };
    }
    return emptyTileResponse();
  });

  maplibregl.addProtocol('veg', async (params) => {
    const cacheKey = params.url;
    const cached = tileResultCache.get(cacheKey);
    if (cached) {
      // Re-insert so a tile that's still in use isn't the next one evicted.
      tileResultCache.delete(cacheKey);
      tileResultCache.set(cacheKey, cached);
      return { data: cached };
    }

    tileStarted();
    try {
      const [z, xRaw, y] = params.url.replace('veg://', '').split('/').map(Number);
      const x = wrapX(xRaw, z);
      const bitmap = await buildVegTileBitmap(z, x, y);
      // Failed fetches aren't cached, so a transient network blip doesn't
      // leave that tile permanently blank for the rest of the session.
      if (!bitmap) return emptyTileResponse();
      cacheTileResult(cacheKey, bitmap);
      return { data: bitmap };
    } catch (err) {
      return emptyTileResponse();
    } finally {
      tileFinished();
    }
  });

  // --- Off-screen prefetching -------------------------------------------
  const PREFETCH_BUFFER_TILES = 2;
  const PREFETCH_CONCURRENCY = 3;
  const LOOKAHEAD_SECONDS = 1.0;
  let prefetchGeneration = 0;

  function lngLatToTileXY(lng, lat, z) {
    const n = Math.pow(2, z);
    const x = Math.floor((lng + 180) / 360 * n);
    const clampedLat = Math.max(Math.min(lat, 85.05), -85.05);
    const latRad = clampedLat * Math.PI / 180;
    const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
    return { x, y };
  }
  function tileRangeForZoom(west, east, north, south, z) {
    const n = Math.pow(2, Math.max(0, Math.min(20, z)));
    const nw = lngLatToTileXY(west, north, z);
    const se = lngLatToTileXY(east, south, z);
    return {
      xMin: Math.min(nw.x, se.x) - PREFETCH_BUFFER_TILES,
      xMax: Math.max(nw.x, se.x) + PREFETCH_BUFFER_TILES,
      yMin: Math.max(0, Math.min(nw.y, se.y) - PREFETCH_BUFFER_TILES),
      yMax: Math.min(n - 1, Math.max(nw.y, se.y) + PREFETCH_BUFFER_TILES),
      n
    };
  }
  async function prefetchTile(z, xRaw, y, generation) {
    if (generation !== prefetchGeneration) return;
    const key = 'veg://' + z + '/' + xRaw + '/' + y;
    if (tileResultCache.has(key)) return;
    const x = wrapX(xRaw, z);
    try {
      const bitmap = await buildVegTileBitmap(z, x, y);
      if (!bitmap || generation !== prefetchGeneration) return;
      cacheTileResult(key, bitmap);
    } catch (err) {
      // Not fatal.
    }
  }
  async function runPrefetchQueue(jobs, generation) {
    let next = 0;
    async function worker() {
      while (next < jobs.length) {
        if (generation !== prefetchGeneration) return;
        const job = jobs[next++];
        await prefetchTile(job.z, job.x, job.y, generation);
      }
    }
    const workers = [];
    for (let i = 0; i < PREFETCH_CONCURRENCY; i++) workers.push(worker());
    await Promise.all(workers);
  }
  // neighborZooms: also warm z-1/z+1. Skipped for the mid-pan lookahead so
  // prefetch traffic doesn't compete with the tiles actually on screen -
  // the full neighbor pass runs once the map goes idle instead.
  function schedulePrefetch(velocity, { neighborZooms = true } = {}) {
    const generation = ++prefetchGeneration;
    const z = Math.round(map.getZoom());
    const bounds = map.getBounds();
    let west = bounds.getWest(), east = bounds.getEast();
    let north = bounds.getNorth(), south = bounds.getSouth();

    if (velocity && (velocity.lng || velocity.lat)) {
      const aheadLng = velocity.lng * LOOKAHEAD_SECONDS;
      const aheadLat = velocity.lat * LOOKAHEAD_SECONDS;
      west = Math.min(west, west + aheadLng);
      east = Math.max(east, east + aheadLng);
      north = Math.min(90, Math.max(north, north + aheadLat));
      south = Math.max(-90, Math.min(south, south + aheadLat));
    }

    const jobs = [];
    for (const zLevel of neighborZooms ? [z, z - 1, z + 1] : [z]) {
      if (zLevel < 0 || zLevel > 20) continue;
      const range = tileRangeForZoom(west, east, north, south, zLevel);
      const tileCount = (range.xMax - range.xMin + 1) * (range.yMax - range.yMin + 1);
      if (tileCount > 400) continue;
      for (let x = range.xMin; x <= range.xMax; x++) {
        for (let y = range.yMin; y <= range.yMax; y++) jobs.push({ z: zLevel, x, y });
      }
    }
    if (jobs.length) runPrefetchQueue(jobs, generation);
  }

  const MOVE_PREFETCH_THROTTLE_MS = 150;
  let lastMoveSample = null;
  let lastMovePrefetchAt = 0;
  function onMapMove() {
    const now = performance.now();
    const center = map.getCenter();
    let velLng = 0, velLat = 0;
    if (lastMoveSample) {
      const dt = (now - lastMoveSample.t) / 1000;
      if (dt > 0.01) {
        velLng = (center.lng - lastMoveSample.lng) / dt;
        velLat = (center.lat - lastMoveSample.lat) / dt;
      }
    }
    lastMoveSample = { lng: center.lng, lat: center.lat, t: now };
    if (now - lastMovePrefetchAt < MOVE_PREFETCH_THROTTLE_MS) return;
    lastMovePrefetchAt = now;
    schedulePrefetch({ lng: velLng, lat: velLat }, { neighborZooms: false });
  }

  let vegOpacityFactor = 0.7;
  // Tracks the "find my location" marker so a repeat click moves the same
  // pin instead of stacking a new one on top each time.
  let userLocationMarker = null;

  // MapLibre's Markers are plain positioned HTML elements, not part of the
  // WebGL scene - they never get occluded by the globe's own geometry, so
  // spinning the marker round to the far side of the sphere left it
  // floating on top of the globe like an X-ray instead of disappearing
  // behind it. This approximates that occlusion by hand: the marker is
  // hidden whenever its great-circle angle from the current view center
  // exceeds 90 degrees, i.e. whenever it's on the half of the globe facing
  // away from the camera.
  function greatCircleAngleDeg(lng1, lat1, lng2, lat2) {
    const toRad = Math.PI / 180;
    const phi1 = lat1 * toRad;
    const phi2 = lat2 * toRad;
    const dPhi = (lat2 - lat1) * toRad;
    const dLambda = (lng2 - lng1) * toRad;
    const a = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
    return (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) * 180 / Math.PI;
  }

  function updateUserLocationMarkerVisibility() {
    if (!userLocationMarker) return;
    // The flat "map" basemap mode still uses the globe projection under
    // the hood at low zoom in this MapLibre version, but there's no sphere
    // to hide behind once zoomed in close (where locate() always lands) -
    // only bother hiding the marker at the zoom levels where the globe is
    // actually visibly curved.
    if (map.getZoom() > 6) {
      userLocationMarker.getElement().style.display = '';
      return;
    }
    const center = map.getCenter();
    const { lng, lat } = userLocationMarker.getLngLat();
    const angle = greatCircleAngleDeg(center.lng, center.lat, lng, lat);
    userLocationMarker.getElement().style.display = angle > 90 ? 'none' : '';
  }

  // [AI] Starting ("home") zoom. 2.1 is David's chosen desktop size, but on
  //      a phone it opened the globe far wider than the screen. At 2.1 the
  //      globe renders ~640px across, and its size doubles per zoom level,
  //      so this picks the zoom that makes it ~90% of the map area's
  //      shorter side - capped at 2.1, so desktop looks exactly as before.
  //      Used for the first view and by recenter().
  //      Written: 2026-09-25 · Claude Opus 5.5 · requested by David
  const DESKTOP_HOME_ZOOM = 2.55;
  function homeZoom() {
    const shortSide = Math.min(container.clientWidth, container.clientHeight) || 800;
    const fit = DESKTOP_HOME_ZOOM + Math.log2((0.9 * shortSide) / 640);
    return Math.min(DESKTOP_HOME_ZOOM, fit);
  }
  const initialZoom = homeZoom();

  const map = new maplibregl.Map({
    container,
    attributionControl: false,
    // David reported that right-click-dragging spun the globe in a "weird"
    // way (first tried disabling just the pitch-with-rotate half of it,
    // still felt off) - simplest fix is to just turn off the whole
    // right-click-drag rotate/tilt gesture. Left-click-drag panning and
    // scroll-to-zoom are untouched.
    dragRotate: false,
    // Resizing is handled below (smoothResize), not by MapLibre's own
    // watcher, which only caught up with the window a few times a second.
    trackResize: false,
    // David wants the globe to load at roughly this size and not let
    // zooming out shrink it much past that - minZoom sits just a touch
    // below the initial zoom so there's a little room to back out, not
    // enough to shrink the globe down small in the starfield. Same 0.3 of
    // room below the home zoom on a phone, where that starts lower.
    minZoom: Math.min(1.8, initialZoom - 0.3),
    // The Esri World Imagery basemap only guarantees real tiles worldwide
    // up to about this level - zoom in further almost anywhere and the
    // tiles just come back empty. Capping here stops right before that
    // happens instead of letting the view zoom into a blank tile.
    maxZoom: 17,
    style: {
      version: 8,
      projection: { type: 'globe' },
      // Fonts for the app-drawn labels in referenceLabels.js.
      glyphs: REF_GLYPHS,
      sources: {
        satellite: {
          type: 'raster',
          tiles: satelliteTiles(),
          tileSize: 256
          // No per-source `attribution` here (or below) - MapLibre would
          // append each one alongside the control's own customAttribution
          // string, which is what produced the doubled-up, run-on credit
          // line. One canonical wording lives on the AttributionControl
          // itself, below.
        },
        veg: {
          type: 'raster',
          tiles: ['veg://{z}/{x}/{y}'],
          tileSize: 256,
          minzoom: 0,
          maxzoom: 20
        },
        // Borders and place labels over the imagery. Used to be Esri's
        // World_Boundaries_and_Places raster overlay, but its text is baked
        // into the tile images - David wanted states abbreviated when
        // zoomed out, so these are now vector labels drawn by MapLibre (see
        // referenceLabels.js). Only relevant to the satellite basemap - OSM
        // already draws its own borders/labels (in each country's own
        // language - David asked to keep that).
        [REF_SOURCE_ID]: REF_SOURCE
      },
      layers: [
        { id: 'earth-backdrop', type: 'background', paint: { 'background-color': '#25382a' } },
        { id: 'satellite', type: 'raster', source: 'satellite', paint: { 'raster-fade-duration': 0 } },
        ...MAP_LAYERS,
        { id: 'veg', type: 'raster', source: 'veg', paint: {
            'raster-opacity': vegOpacityExpr(vegOpacityFactor),
            'raster-saturation': ['interpolate', ['linear'], ['zoom'], 9, 0, 14, 0.3],
            'raster-contrast': ['interpolate', ['linear'], ['zoom'], 9, 0, 14, 0.25],
            'raster-fade-duration': 0
          } },
        ...REF_LAYERS
      ],
      sky: {
        'sky-color': '#000010',
        'sky-horizon-blend': 0.5,
        'horizon-color': '#0b1a2a',
        'horizon-fog-blend': 0.5,
        'fog-color': '#0b1a2a',
        'fog-ground-blend': 0.3,
        'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0]
      }
    },
    center: [-97.475, 20],
    zoom: initialZoom
  });
  registerCityDot(map);

  // compact:true doesn't reliably collapse this into MapLibre's small "(i)"
  // toggle in this version - it was rendering as a permanently-open, full-
  // width bar. Rather than fight that, compact is off here and the whole
  // control is instead restyled in globals.css into a small, muted credit
  // line tucked directly under the basemap toggle (MapApp.module.css's
  // .basemapStack), the way Google Maps keeps its own attribution.
  // [AI] Imagery credit that follows what's on screen, the way Google Maps
  //      rewrites "Imagery ©2025 ..." as you move (David's idea, replacing a
  //      "captured on" label at the center of the screen). After each pan/
  //      zoom settles, the chosen year's Wayback metadata is queried for the
  //      whole visible area at the current zoom level, and the credit shows
  //      the range of capture years and who supplied the photos, e.g.
  //      "Imagery ©2020–2024 Maxar". Zoomed far out (Esri's undated global
  //      mosaic), in Map view, or if the lookup fails, it shows the general
  //      Esri credit instead. The control is swapped for a new one only when
  //      the text actually changes.
  //      Written: 2026-09-29 · Claude Opus 5.5 · requested by David
  // [AI] Shortened for the Google-Maps-style corner strip (David asked, 2026-09-29);
  //      every required credit is still named.
  const DEFAULT_IMAGERY_CREDIT = 'Imagery © Esri, Maxar, Earthstar Geographics';
  const OTHER_CREDITS = ' | © OpenFreeMap © OpenMapTiles © OpenStreetMap contributors | NDVI: NASA MODIS';
  let attributionControl = null;
  let imageryCredit = null;
  // text === null -> Map view: no Esri imagery on screen, so no Esri credit.
  function setImageryCredit(text) {
    if (text === imageryCredit) return;
    imageryCredit = text;
    if (attributionControl) map.removeControl(attributionControl);
    attributionControl = new maplibregl.AttributionControl({
      compact: false,
      customAttribution: text === null
        ? '© OpenFreeMap © OpenMapTiles © OpenStreetMap contributors | NDVI: NASA MODIS'
        : text + ' | Powered by <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a>' + OTHER_CREDITS
    });
    map.addControl(attributionControl);
  }
  setImageryCredit(DEFAULT_IMAGERY_CREDIT);

  // [AI] Phones: the credit line is cut to one line (globals.css) and a tap
  //      opens the full text; another tap closes it. The class goes on the
  //      map's parent so the legend and basemap button (siblings of the map)
  //      can move up out of the way while it's open (MapApp.module.css).
  //      Tapping a link inside the credits still just follows the link.
  //      Written: 2026-09-29 · Claude Opus 5.5 · requested by David
  map.getContainer().addEventListener('click', (e) => {
    const credit = e.target.closest && e.target.closest('.maplibregl-ctrl-attrib');
    if (!credit || e.target.closest('a')) return;
    const holder = map.getContainer().parentElement || map.getContainer();
    holder.classList.toggle('credits-open');
  });

  // Sensor codes in Esri's metadata -> who supplied the photo.
  function imageryProvider(sensor, product) {
    const s = String(sensor || ''), p = String(product || '');
    if (/^(WV|GE|QB|IK|LG)\d/i.test(s) || /vivid|maxar|digitalglobe/i.test(p + ' ' + s)) return 'Maxar';
    if (/airbus|pl[eé]iades|spot/i.test(s + ' ' + p)) return 'Airbus';
    if (/naip|usda/i.test(s + ' ' + p)) return 'USDA';
    if (/usgs/i.test(s + ' ' + p)) return 'USGS';
    if (/terracolor|earthstar/i.test(s + ' ' + p)) return 'Earthstar Geographics';
    return 'Esri';
  }

  let creditRequestId = 0;
  let creditTimer = null;
  async function updateImageryCredit() {
    const id = ++creditRequestId;
    if (currentBasemap !== 'satellite') {
      setImageryCredit(null);
      return;
    }
    let text = DEFAULT_IMAGERY_CREDIT;
    try {
      const releases = USE_WAYBACK_BY_YEAR && currentBasemap === 'satellite' ? await getWaybackReleases() : null;
      const release = releases && releases[satYear];
      // Metadata layers 0-13 cover 1.9 cm-150 m pixels, i.e. imagery tile
      // levels 23 down to 10; 256px tiles sit one level above map zoom.
      const level = Math.round(map.getZoom()) + 1;
      if (release && release.metadataUrl && level >= 10) {
        const layer = Math.max(0, Math.min(13, 23 - level));
        const b = map.getBounds();
        const clampLng = (v) => Math.max(-180, Math.min(180, v));
        const bbox = [clampLng(b.getWest()), b.getSouth(), clampLng(b.getEast()), b.getNorth()].map((v) => v.toFixed(5)).join(',');
        const url = `${release.metadataUrl}/${layer}/query?geometry=${bbox}` +
          '&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects' +
          '&outFields=SRC_DATE,SRC_DESC,NICE_NAME&returnGeometry=false&returnDistinctValues=true&f=json';
        const data = await (await fetch(url)).json();
        const years = [];
        const providers = [];
        for (const f of (data && data.features) || []) {
          const a = f.attributes || {};
          const year = String(a.SRC_DATE || '').slice(0, 4);
          if (/^\d{4}$/.test(year)) years.push(Number(year));
          const who = imageryProvider(a.SRC_DESC, a.NICE_NAME);
          if (!providers.includes(who)) providers.push(who);
        }
        if (years.length) {
          const lo = Math.min(...years), hi = Math.max(...years);
          if (!providers.includes('Esri')) providers.push('Esri');
          text = `Imagery ©${lo === hi ? lo : lo + '–' + hi} ${providers.join(', ')}`;
        }
      }
    } catch (err) {
      // Keep the general credit.
    }
    if (id === creditRequestId) setImageryCredit(text);
  }
  function scheduleCreditUpdate() {
    clearTimeout(creditTimer);
    creditTimer = setTimeout(updateImageryCredit, 350);
  }
  map.on('moveend', scheduleCreditUpdate);

  // [AI] Smooth resizing. David found the globe stuttering while dragging the
  //      window's edge. Measured: the page redrew ~140 times a second, but
  //      MapLibre's built-in watcher only resized the globe ~16 times a
  //      second, so it sat at the old size in between and jumped. Resizing
  //      (and redrawing, so there's no blank frame) right when the browser
  //      reports the new size kept up easily in testing (frames stayed ~7 ms).
  //      ResizeObserver reports at most once per frame, so this can't pile up.
  //      Written: 2026-09-30 · Claude Opus 5.5 · requested by David
  const resizeObserver = new ResizeObserver(() => {
    map.resize();
    if (typeof map.redraw === 'function') map.redraw();
  });
  resizeObserver.observe(container);
  map.on('load', scheduleCreditUpdate);

  map.on('movestart', () => { prefetchGeneration++; lastMoveSample = null; });
  map.on('move', onMapMove);
  // [AI] Load-time pass: prefetch used to start on 'load'/'moveend'/
  //      'zoomend' - i.e. at exactly the moments the on-screen tiles are
  //      being requested - so up to a few hundred off-screen tiles (3 zoom
  //      levels, 2-tile margin) competed with them for network and main
  //      thread right when the view was trying to fill in. 'idle' fires
  //      only once every visible tile has loaded, so on-screen tiles always
  //      go first and prefetch just uses the quiet time afterwards.
  //      Written: 2026-09-24 · Claude Opus 5.5 · requested by David
  map.on('idle', () => schedulePrefetch());
  // 'render' (not just 'move') so the marker's visibility keeps up in real
  // time during flyTo()'s own animation frames too, not just user-driven
  // panning.
  map.on('render', updateUserLocationMarkerVisibility);

  return {
    map,

    setYear(year) {
      NDVI_DATE = year + '-08-13';
      clearDateDependentCaches();
      if (USE_WAYBACK_BY_YEAR && satYear !== year) {
        satYear = year;
        const source = map.getSource('satellite');
        if (currentBasemap === 'satellite' && source && source.setTiles) source.setTiles(satelliteTiles());
        scheduleCreditUpdate();
      }
    },

    setOpacity(factor) {
      vegOpacityFactor = factor;
      map.setPaintProperty('veg', 'raster-opacity', vegOpacityExpr(factor));
    },

    setVegVisible(visible) {
      vegVisible = visible;
      map.setLayoutProperty('veg', 'visibility', visible ? 'visible' : 'none');
    },

    switchBasemap(mode) {
      if (mode !== 'satellite' && mode !== 'map') return;
      currentBasemap = mode;
      scheduleCreditUpdate();
      const isMap = mode === 'map';
      map.setLayoutProperty('satellite', 'visibility', isMap ? 'none' : 'visible');
      for (const id of MAP_LAYER_IDS) map.setLayoutProperty(id, 'visibility', isMap ? 'visible' : 'none');
      // Label colors for the light map vs. the satellite originals.
      for (const [layerId, paint] of Object.entries(LIGHT_MAP_LABEL_PAINT)) {
        if (!map.getLayer(layerId)) continue;
        for (const [prop, lightValue] of Object.entries(paint)) {
          const key = layerId + '|' + prop;
          if (!(key in satelliteLabelPaint)) satelliteLabelPaint[key] = map.getPaintProperty(layerId, prop);
          map.setPaintProperty(layerId, prop, isMap ? lightValue : satelliteLabelPaint[key]);
        }
      }
      // The year may have changed while the map view was showing.
      const source = map.getSource('satellite');
      const tiles = satelliteTiles();
      if (!isMap && source && source.setTiles && source.tiles && source.tiles[0] !== tiles[0]) source.setTiles(tiles);
      // Names/borders are app-drawn in both views now (nothing baked into
      // either basemap), so REF_LAYER_IDS stay visible.
    },

    zoomIn() { map.zoomIn(); },
    zoomOut() { map.zoomOut(); },

    flyTo(lng, lat, zoom) {
      map.flyTo({ center: [lng, lat], zoom: zoom ?? 6 });
    },

    // Whole-globe view centered on a point - used for continent/ocean
    // search results, sized like the start view. On the globe, MapLibre
    // draws the planet ~1/cos(latitude) bigger when the center is far from
    // the equator (Asia's point at 51N came out 1.56x the start size), so
    // the zoom is lowered to match. The center is kept within +/-40 deg so
    // that correction stays inside the map's minimum zoom; polar-ish points
    // (Antarctica, Asia's Siberian point) still land in a sensible view.
    flyToGlobe(lng, lat) {
      const toRad = Math.PI / 180;
      const centerLat = Math.max(-40, Math.min(40, lat));
      const sizeFix = Math.log2(Math.cos(centerLat * toRad) / Math.cos(20 * toRad));
      const zoom = Math.max(map.getMinZoom(), homeZoom() + sizeFix);
      map.flyTo({ center: [lng, centerLat], zoom, bearing: 0, pitch: 0, duration: 1200 });
    },

    // Flies back to the globe's starting view (same center/zoom the map is
    // constructed with above) - the filter button (never wired to real
    // filtering logic) was replaced with this, since "reset the view" is
    // the more useful button to have in that slot. Also resets
    // bearing/pitch to 0: right-click-dragging (MapLibre's default
    // dragRotate) can spin/tilt the globe into a disorienting angle, and
    // that's the main thing David wants this button to fix, not just pan.
    // Also clears the "find my location" pin, if one is showing - a full
    // reset-the-view action reasonably includes clearing that too, rather
    // than leaving a stale pin from some earlier locate() sitting there.
    recenter() {
      if (userLocationMarker) {
        userLocationMarker.remove();
        userLocationMarker = null;
      }
      map.flyTo({ center: [-97.475, 20], zoom: homeZoom(), bearing: 0, pitch: 0, duration: 1200 });
    },

    // Zooms to fit an actual place extent (e.g. a search result's
    // bounding box) instead of a fixed zoom level - flyTo's zoom:6 default
    // was landing at roughly state/region scale for a place like a single
    // city, since a fixed zoom doesn't adapt to how large or small the
    // matched place actually is. bounds is [[west, south], [east, north]].
    fitToBounds(bounds) {
      // maxZoom was 12 (about a 10 km-wide view), which stopped anything
      // smaller than a city - a campus, a stadium, a landmark - from ever
      // filling the screen (David noticed it with the University of
      // Oklahoma). 16 sits one step under the map's own maxZoom, so tiny
      // places still keep a little surrounding context.
      // [AI] On a phone (portrait) a flat 60px margin used a third of the
      //      width, so results only filled ~2/3 of the screen. There, keep
      //      clear of the search bar (top) and the legend / Satellite button
      //      (bottom) but use nearly the full width. Found by searching 100
      //      places and measuring each result (David, 2026-09-30).
      const box = map.getContainer();
      const phone = box.clientWidth <= 640;
      const padding = phone ? { top: 70, bottom: 100, left: 16, right: 16 } : 60;
      map.fitBounds(bounds, { padding, maxZoom: 16, duration: 1200 });
    },

    // [AI] onError(message) gets a plain-English reason when location can't
    //      be found. It used to fail silently (console only), so on a phone
    //      opened over http://<PC's IP>:3000 - where browsers block location
    //      outright and never show the permission prompt - the button just
    //      looked broken.
    //      Written: 2026-09-25 · Claude Opus 5.5 · requested by David
    locate(onError) {
      const fail = (message) => { if (onError) onError(message); };
      if (!window.isSecureContext) {
        fail('Location only works on a secure (https://) page. It works on localhost or once the site is deployed, but not over this http:// address.');
        return;
      }
      if (!navigator.geolocation) {
        fail("This browser doesn't support location.");
        return;
      }
      function reportError(err) {
        console.warn('[chlorosat] locate() failed:', err.message);
        fail(err.code === 1
          ? "Location access is blocked for this site. Allow it in your browser's site settings, then try again."
          : "Couldn't find your location. Check that location services are on, then try again.");
      }

      function onSuccess(pos) {
        const { longitude, latitude } = pos.coords;
        // zoom:8 (the old value) is still a whole-region view - barely
        // closer than the map already starts at, so it didn't read as
        // "zooming in on me" at all. 15 is close enough to make out
        // individual streets/blocks, matching what "my exact location"
        // implies. A small marker also pins the precise point, since a
        // zoom level alone doesn't show exactly where within the view
        // you are.
        map.flyTo({ center: [longitude, latitude], zoom: 15, duration: 1500 });
        if (userLocationMarker) {
          userLocationMarker.setLngLat([longitude, latitude]);
        } else {
          // MapLibre's default Marker is a teardrop pin (only its fill
          // color is customizable) - a small round dot with a white
          // ring, like the "you are here" marker in Google Maps, needs
          // a custom element instead of the built-in pin SVG.
          const el = document.createElement('div');
          el.style.width = '16px';
          el.style.height = '16px';
          el.style.borderRadius = '50%';
          el.style.background = '#1a73e8';
          el.style.border = '3px solid #fff';
          el.style.boxShadow = '0 0 0 2px rgba(26, 115, 232, 0.35), 0 1px 4px rgba(0, 0, 0, 0.5)';
          userLocationMarker = new maplibregl.Marker({ element: el })
            .setLngLat([longitude, latitude])
            .addTo(map);
        }
      }

      // enableHighAccuracy:true made this worse, not better - it asks the
      // OS/browser for a GPS-grade fix, which some desktops either can't
      // provide at all or gate behind a stricter "precise location"
      // permission the user never granted, so the request just times out
      // silently with no marker ever appearing. Try it first since it's
      // genuinely more precise when it works, but fall back to a normal
      // (network/IP-based) request - what this used before, and what was
      // actually working - if the accurate one fails for any reason.
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        (err) => {
          // Permission denied won't change on a retry - report it now.
          if (err.code === 1) {
            reportError(err);
            return;
          }
          console.warn('[chlorosat] high-accuracy locate() failed, retrying with default accuracy:', err.message);
          navigator.geolocation.getCurrentPosition(
            onSuccess,
            reportError,
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          );
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    },

    destroy() {
      resizeObserver.disconnect();
      map.remove();
    }
  };
}
