# Research: NDVI Calculation (CS-003, David)

## Team findings
> TODO (David): method, thresholds, sources/citations.

## Questions to answer
- Formula and why it works: `NDVI = (NIR − Red) / (NIR + Red)`, range −1…1.
- What NDVI ranges mean (water, bare/built, sparse, moderate, dense vegetation)? These become our legend classes.
- Surface reflectance vs raw values: which to use, and any scaling/offset for our data source? (Sentinel-2 has a +1000 offset from 2022 on, see [data-sources.md](data-sources.md).)
- Cloud/shadow/no-data masking: how, and which band?
- Comparing years fairly: same season (e.g. Jun–Aug), median composite of several scenes?
- What counts as a "real" change between years (threshold, e.g. ±0.1)?
- Limitations to explain to users (drought years, seasonality, resolution).
