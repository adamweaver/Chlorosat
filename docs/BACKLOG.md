# Backlog

This backlog reflects the current MapLibre globe. The files under
`docs/scrum/` are historical sprint plans and may describe the retired
Leaflet/PNG design.

## Working now

- Worldwide MapLibre globe.
- NASA MODIS NDVI for one selected year.
- Satellite and street basemaps.
- Year, opacity and visibility controls.
- Search, geolocation, zoom, recenter and compass controls.
- Home and About pages.
- Static build, CI and automatic deployment.

## Current maintenance

- Verify remote data-source behavior and attribution regularly.
- Keep mobile controls accessible and non-overlapping.
- Keep documentation synchronized with the running site.
- Test build size and performance on average phones.
- Revisit the disabled synthetic-detail path in
  `web/src/lib/map/chlorosatGlobeEngine.js`. Its noise functions are retained
  but inactive (`octaves: 0`, `noiseAmt: 0`) because they created fake
  fine-grained NDVI and changed patterns between zoom levels. Do not re-enable
  them unless the display is clearly identified as modeled rather than
  measured data.

## Not implemented

| Feature | Notes |
|---|---|
| Two-year comparison | Needs clear change semantics and UI |
| Statistics | No regional or selected-area aggregation exists |
| Visible-light method | Future pipeline work; no live method toggle |
| Pipeline-fed globe layers | Requires a new, approved integration design |
| Shareable map state | URL does not preserve year, view or location |
| Downloads | No PNG, CSV or raw-data downloads |
| Time-lapse | Only manual year selection exists |
| Drawn-area analysis | Would need client processing or a backend |

## Future pipeline

The Python package is intentionally retained but disconnected from the site.
Before integration it still needs:

1. Scene discovery and band download.
2. Cloud masking and seasonal composites.
3. Visible-light vegetation detection.
4. Year and change statistics.
5. Multi-year orchestration.
6. An approved output format and globe integration.

Current status: [pipeline/README.md](../pipeline/README.md).

## Decision gates

Ask the team before:

- Adding a backend or server-side processing.
- Connecting pipeline output to the live globe.
- Defining a new persistent data contract.
- Adding a dependency or changing deployment.
- Presenting inferred or synthetic values as measured vegetation.
