# Research: Visible-Light Vegetation Detection (CS-026, Carter)

## Team findings
> TODO (Carter): index chosen, breakpoints, test results on OKC/Norman, sources. Then update decision **D9** in [ARCHITECTURE.md](../ARCHITECTURE.md#decision-log) and the `VISIBLE` classes in `pipeline/src/chlorosat/methods.py`.

## Questions to answer
- Which index (or simple detection rule) finds vegetation using only red, green, blue?
- Same imagery as NDVI (Sentinel-2 RGB bands) or a different source?
- Breakpoints for bare / sparse / moderate / dense (so the legend matches NDVI's classes)?
- Where does it disagree with NDVI, and why? Collect 3–5 real examples for the About page.
- Change threshold for "real" change between years?

---

## Claude's recommendation (suggestion only, not a team decision)
*Written 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver*

**Index:** start with **VARI** (Visible Atmospherically Resistant Index):
`VARI = (G − R) / (G + R − B)`, roughly −1…1, higher = greener.
- Designed for RGB-only imagery and handles haze a bit better than simple ratios.
- Watch out: the denominator can be ~0 (unstable values). Clip to [−1, 1], and set NaN where it's undefined.
- Alternative: **ExG** (Excess Green) `2g − r − b`, using `r, g, b` = each band ÷ (R + G + B). It's simpler and very common for "is this pixel green?", but more sensitive to lighting.

**Imagery:** use the **same Sentinel-2 scenes** (bands B02 blue, B03 green, B04 red, 10 m).
- Same dates, grid, and cloud mask as NDVI, so any difference comes from the **method**, not the data. That's easier to explain and fits the "one grid per region" rule.
- Works worldwide (fits "scale to other regions").
- Optional later: **NAIP** aerial photos (US only, ~1 m, every 2–3 years) for much finer detail. It needs its own grid, a revisit of the data contract rule, and it doesn't scale outside the US.

**Out of scope for now:** machine-learning detection (tree/object detection). Too heavy for the timeline; revisit after v1.0 if wanted.

**Why the methods disagree (for the About page):**
| Situation | NDVI (infrared) | Visible light |
|---|---|---|
| Stressed plants that still look green (early drought) | **Lower** (stress shows in infrared first) | High (still looks green) |
| Artificial turf, green-painted roofs/surfaces | Low (not alive) | **High** (looks green) |
| Shadows / dark areas | Usually OK | Unreliable |
| Water | Negative (clear signal) | Unreliable |
| Healthy trees / lawns | High | High |
