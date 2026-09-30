// [AI] Purpose: App-drawn borders and place labels, replacing Esri's
//      "World_Boundaries_and_Places" raster overlay. That overlay's text is
//      baked into its tile images, so there was no way to change it - David
//      asked for US states (and Canadian provinces) to show as abbreviations
//      when zoomed out, and chose to replace the whole overlay with vector
//      labels so it's all drawn by MapLibre instead.
//      Does:    Exports a vector tile source (OpenFreeMap's free, keyless
//      OpenMapTiles-schema planet tiles), its glyph (font) URL, and a set of
//      line + symbol layers styled to stay close to the old Esri look: thin
//      white borders, white text with a dark halo, bold uppercase country
//      names, dotted city labels, blue italic ocean/sea names. State/
//      province labels switch from postal abbreviations to full names at
//      STATE_FULL_NAME_ZOOM.
//      Context: every layer id starts with "ref-" (REF_LAYER_IDS) so the
//      engine can hide them all in "map" (OSM) mode, which already draws its
//      own labels - same behavior the Esri overlay had.
//      Written: 2026-09-24 · Claude Opus 5.5 · requested by David
//      Ported:  2026-09-30 · Claude Opus 5.5 (for David) · from chlorosat-map-demo app/lib/referenceLabels.js

export const REF_SOURCE_ID = 'ref';

export const REF_SOURCE = {
  type: 'vector',
  url: 'https://tiles.openfreemap.org/planet',
  // Blank on purpose: overrides the credit line OpenFreeMap's TileJSON
  // would otherwise append, which repeated the OpenStreetMap credit and
  // wrapped the attribution onto two lines. The engine's single
  // customAttribution string already credits OpenFreeMap/OpenMapTiles/OSM.
  attribution: ''
};

export const REF_GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';

// Below this zoom, US states and Canadian provinces/territories show as
// postal abbreviations ("TX", "ON"); at or above it, full names. Other
// countries' first-level regions have no abbreviation, so they're simply
// left unlabeled until this zoom rather than crowding the zoomed-out view.
export const STATE_FULL_NAME_ZOOM = 5;

const STATE_ABBREVIATIONS = {
  // United States
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA',
  Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA',
  Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO',
  Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH',
  Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
  Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY',
  'District of Columbia': 'DC',
  // Canada
  Alberta: 'AB', 'British Columbia': 'BC', Manitoba: 'MB', 'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL', 'Nova Scotia': 'NS', Ontario: 'ON',
  'Prince Edward Island': 'PE', Quebec: 'QC', 'Québec': 'QC', Saskatchewan: 'SK',
  'Northwest Territories': 'NT', Nunavut: 'NU', Yukon: 'YT'
};

// English name where the tiles have one, falling back to the local name.
const NAME = ['coalesce', ['get', 'name_en'], ['get', 'name:latin'], ['get', 'name']];

const STATE_ABBREVIATION = ['match', NAME];
for (const [name, abbr] of Object.entries(STATE_ABBREVIATIONS)) {
  STATE_ABBREVIATION.push(name, abbr);
}
STATE_ABBREVIATION.push('');

const TEXT_COLOR = '#ffffff';
const HALO_COLOR = 'rgba(0, 0, 0, 0.75)';
const REGULAR = ['Noto Sans Regular'];
const BOLD = ['Noto Sans Bold'];
const ITALIC = ['Noto Sans Italic'];

const LAND_BOUNDARY = ['!=', ['get', 'maritime'], 1];

export const REF_LAYERS = [
  {
    id: 'ref-boundary-state',
    type: 'line',
    source: REF_SOURCE_ID,
    'source-layer': 'boundary',
    minzoom: 2,
    filter: ['all', ['==', ['get', 'admin_level'], 4], LAND_BOUNDARY],
    layout: { 'line-join': 'round' },
    paint: {
      'line-color': '#ffffff',
      'line-opacity': 0.45,
      'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.4, 8, 1.1]
    }
  },
  {
    id: 'ref-boundary-country',
    type: 'line',
    source: REF_SOURCE_ID,
    'source-layer': 'boundary',
    filter: ['all', ['==', ['get', 'admin_level'], 2], LAND_BOUNDARY],
    layout: { 'line-join': 'round' },
    paint: {
      'line-color': '#ffffff',
      'line-opacity': 0.75,
      'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.6, 8, 1.8]
    }
  },
  {
    id: 'ref-water-name',
    type: 'symbol',
    source: REF_SOURCE_ID,
    'source-layer': 'water_name',
    filter: ['all',
      ['==', ['geometry-type'], 'Point'],
      ['match', ['get', 'class'], ['ocean', 'sea', 'bay', 'gulf', 'strait'], true, false]
    ],
    layout: {
      'text-field': NAME,
      'text-font': ITALIC,
      'text-size': ['interpolate', ['linear'], ['zoom'], 2, 10, 6, 13],
      'text-max-width': 8,
      'text-letter-spacing': 0.05
    },
    paint: {
      'text-color': '#8fc8ec',
      'text-halo-color': 'rgba(0, 0, 0, 0.45)',
      'text-halo-width': 1
    }
  },
  {
    id: 'ref-water-name-lake',
    type: 'symbol',
    source: REF_SOURCE_ID,
    'source-layer': 'water_name',
    minzoom: 6,
    filter: ['all', ['==', ['geometry-type'], 'Point'], ['==', ['get', 'class'], 'lake']],
    layout: {
      'text-field': NAME,
      'text-font': ITALIC,
      'text-size': 11,
      'text-max-width': 8
    },
    paint: {
      'text-color': '#8fc8ec',
      'text-halo-color': 'rgba(0, 0, 0, 0.45)',
      'text-halo-width': 1
    }
  },
  ...[
    { id: 'ref-place-village', cls: 'village', minzoom: 10, size: [10, 11, 14, 13] },
    { id: 'ref-place-town', cls: 'town', minzoom: 7, size: [7, 10.5, 12, 13] },
    { id: 'ref-place-city', cls: 'city', minzoom: 3, size: [3, 10.5, 8, 13.5] }
  ].map(({ id, cls, minzoom, size }) => ({
    id,
    type: 'symbol',
    source: REF_SOURCE_ID,
    'source-layer': 'place',
    minzoom,
    filter: ['==', ['get', 'class'], cls],
    layout: {
      'icon-image': 'city-dot',
      'text-field': NAME,
      'text-font': REGULAR,
      'text-size': ['interpolate', ['linear'], ['zoom'], size[0], size[1], size[2], size[3]],
      'text-variable-anchor': ['left', 'right'],
      'text-radial-offset': 0.55,
      'text-justify': 'auto',
      'text-max-width': 8
    },
    paint: {
      'text-color': TEXT_COLOR,
      'text-halo-color': HALO_COLOR,
      'text-halo-width': 1.1
    }
  })),
  {
    id: 'ref-place-state',
    type: 'symbol',
    source: REF_SOURCE_ID,
    'source-layer': 'place',
    filter: ['==', ['get', 'class'], 'state'],
    layout: {
      'text-field': ['step', ['zoom'], STATE_ABBREVIATION, STATE_FULL_NAME_ZOOM, NAME],
      'text-font': REGULAR,
      'text-size': ['interpolate', ['linear'], ['zoom'], 2, 10, 6, 13],
      'text-max-width': 7
    },
    paint: {
      'text-color': 'rgba(255, 255, 255, 0.92)',
      'text-halo-color': HALO_COLOR,
      'text-halo-width': 1.1
    }
  },
  {
    id: 'ref-place-country',
    type: 'symbol',
    source: REF_SOURCE_ID,
    'source-layer': 'place',
    filter: ['==', ['get', 'class'], 'country'],
    layout: {
      'text-field': NAME,
      'text-font': BOLD,
      'text-transform': 'uppercase',
      'text-size': ['interpolate', ['linear'], ['zoom'], 1, 9, 5, 14],
      'text-letter-spacing': 0.1,
      'text-max-width': 7
    },
    paint: {
      'text-color': TEXT_COLOR,
      'text-halo-color': HALO_COLOR,
      'text-halo-width': 1.3
    }
  }
];

export const REF_LAYER_IDS = REF_LAYERS.map((layer) => layer.id);

// Small white dot with a dark ring for city labels, drawn at runtime so the
// style doesn't need a separate sprite sheet. Supplied through MapLibre 6's
// missing-image resolver the first time a city layer asks for it (the older
// 'styleimagemissing' event still works but logs a "could not be loaded"
// warning first in this version).
function drawCityDot() {
  const size = 14;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.stroke();
  return ctx.getImageData(0, 0, size, size);
}

export function registerCityDot(map) {
  const resolve = (id) => {
    if (id !== 'city-dot' || map.hasImage('city-dot')) return;
    map.addImage('city-dot', drawCityDot(), { pixelRatio: 2 });
  };
  if (typeof map.setMissingStyleImageResolver === 'function') {
    map.setMissingStyleImageResolver(resolve);
  } else {
    map.on('styleimagemissing', (e) => resolve(e.id));
  }
}
