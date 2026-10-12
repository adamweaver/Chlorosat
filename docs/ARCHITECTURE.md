# Architecture

This document describes the code that runs now. The older bounded
Leaflet/PNG architecture has been retired.

Component diagrams: [UML.md](UML.md).

## Runtime overview

```text
                                   ┌─ NASA GIBS: MODIS NDVI
Browser ── Next.js static site ────┼─ Esri: imagery and Wayback
   ▲                               ├─ OpenFreeMap/OpenMapTiles: vector map
   │                               └─ Photon: place search
nginx serves web/out/
```

The site has no backend. Next.js produces plain HTML, JavaScript and CSS in
`web/out/`; nginx only serves those files.

The browser contacts the external map services directly. This makes the live
site independent of `pipeline/`.

## Routes and map lifetime

`web/src/app/layout.js` renders the header, the selected route and
`PersistentMap`.

- `/` is the lightweight landing page.
- `/about/` explains the data and controls.
- `/map/` is represented by `app/map/page.js`, which intentionally returns
  `null`. The file is still required so Next.js creates the route.

`PersistentMap` dynamically creates `MapApp` on the first visit to `/map/`.
It hides rather than unmounts the map on other routes, preserving loaded
tiles and state when the user returns.

`MapApp` owns the selected year, opacity, visibility and basemap. It creates
one globe engine and passes its methods to the controls.

## Globe engine

`web/src/lib/map/chlorosatGlobeEngine.js` creates the MapLibre map and
performs all map-specific work:

- Uses a globe projection with worldwide movement and no regional bounds.
- Fetches precomputed MODIS Terra 16-day NDVI tiles from NASA GIBS.
- Decodes NASA’s indexed PNG palette into NDVI values.
- Recolors NDVI with Chlorosat’s continuous red-to-green display scale.
- Masks water with OpenMapTiles vectors, with a NASA mask fallback.
- Enlarges the native data at close zooms; it does not create additional
  measurement detail.
- Fetches Esri imagery, optionally choosing a Wayback release near August 13
  of the selected year.
- Draws the Map basemap from OpenFreeMap vector tiles.
- Supplies search, movement, geolocation and basemap methods to the UI.

“Satellite” and “Map” are two basemap presentations on the same MapLibre
instance. Both remain global and both can show the same NDVI overlay.

## Data processing and caching

NASA, not Chlorosat, calculates the NDVI used by the live site. The browser
does display processing only: decode, recolor, water-mask, smooth and upload
each requested tile to MapLibre.

Cache levels:

1. Raw NASA tiles use browser Cache Storage on secure origins, capped at
   1,500 entries. This survives a refresh.
2. Decoded source tiles and recolored output bitmaps use bounded in-memory
   caches. These are lost on a full refresh.
3. Keeping `PersistentMap` mounted preserves the in-memory caches while
   navigating between routes.
4. Selecting another year clears date-dependent in-memory results.

Therefore a refresh normally rebuilds visible colored tiles, but can rebuild
them from locally cached NASA responses instead of downloading them again.

## External data

| Purpose | Source |
|---|---|
| Vegetation | NASA GIBS, MODIS Terra L3 NDVI 16-day product |
| Satellite basemap | Esri World Imagery and Wayback |
| Street basemap, labels, borders, water | OpenFreeMap, OpenMapTiles and OpenStreetMap contributors |
| Place search | Photon by komoot |

External availability and usage terms affect the map. Attribution is shown
inside the map.

## Static deployment

`npm run build` creates `web/out/`. The deploy workflow sends only that
folder to the VPS. The VPS does not run Node, Python or satellite processing.

See [DEPLOYMENT.md](DEPLOYMENT.md).

## Future offline pipeline

`pipeline/` is a future, separate offline processing path. It is **not used
by the live site**.

The intended future workflow is:

```text
source satellite bands
  → fetch/crop
  → cloud mask and seasonal composite
  → NDVI and visible-light indexes
  → render layers and calculate statistics
  → export a format chosen for a future website integration
```

Only a manual local-file NDVI path is implemented. Fetching, composites,
visible-light detection, statistics, change maps, full multi-year execution
and website integration are not implemented.

There is currently no active pipeline-to-website data contract.
`pipeline/export.py` retains the earlier PNG/manifest experiment, but its
output is not committed and the website has no reader for it. A future
integration must be designed and approved before treating that format as a
contract.

Exact module status: [pipeline/README.md](../pipeline/README.md).

## Implemented and missing features

Implemented:

- Worldwide NDVI globe for one selected year.
- Satellite and street basemaps.
- Year, opacity and visibility controls.
- Search, geolocation and map navigation.
- Responsive static pages and deployment.

Not implemented:

- Two-year comparison or change detection.
- Statistics.
- Visible-light vegetation detection.
- Method selection.
- Pipeline-fed map layers.
- Region-specific processing or downloadable outputs.
- Restoring map state from a shared URL.

## Decisions

| Decision | Status |
|---|---|
| Static Next.js export served by nginx | Active |
| Worldwide MapLibre globe | Approved by the team for the current product |
| Browser reads NASA MODIS NDVI directly | Active |
| Satellite/Map switch changes basemap layers, not geographic bounds | Active |
| Future offline pipeline remains in the repo but disconnected | Approved; future work |
| Pipeline output format and website integration | Open; requires team approval |
