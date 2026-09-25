# Research: Visible-Light Vegetation Detection (CS-026, Carter)

## Team findings
*Written 2026-09-24 by Carter (AI-assisted draft)*

**Proposed decision (D9):** use **VARI** on the **same Sentinel-2 scenes** as NDVI, with **GLI** as the tested fallback if VARI is noisy on real OKC/Norman imagery. Needs team confirmation at Sprint 3 planning (Sep 30); then update D9 in [ARCHITECTURE.md](../ARCHITECTURE.md#decision-log).

### Which index
All candidates use only red, green, blue, so they measure "looks green", not plant health.

| Index | Formula | Range | Pros | Cons | Verdict |
|---|---|---|---|---|---|
| **VARI** (Visible Atmospherically Resistant Index) | `(G − R) / (G + R − B)` | −1…1 after clipping | Normalized ratio, so brightness cancels out; built for RGB imagery; reduces haze effects; widest spread between soil and vegetation of the three | Denominator hits 0 for blue-dominant pixels (water, deep shadow), giving garbage values there | **Chosen** |
| **GLI** (Green Leaf Index) | `(2G − R − B) / (2G + R + B)` | −1…1 | Denominator is always positive, so every pixel is defined; simple | Narrower spread between classes, so breakpoints sit close together | **Fallback** |
| ExG (Excess Green) | `2g − r − b`, with `r, g, b` = band ÷ (R + G + B) | about −1…2 | Very common "is it green" rule in agriculture | Not in −1…1, so it needs its own class range; more sensitive to lighting | Rejected |

Worked example with typical summer surface-reflectance values (0…1), to show why the water mask below matters:

| Pixel | R | G | B | VARI | GLI |
|---|---|---|---|---|---|
| Healthy lawn | 0.04 | 0.16 | 0.03 | 0.71 | 0.64 |
| Dry soil | 0.15 | 0.12 | 0.08 | −0.16 | 0.02 |
| Concrete (gray) | 0.20 | 0.20 | 0.20 | 0.00 | 0.00 |
| Clear water | 0.02 | 0.03 | 0.03 | **0.50** (wrong: looks "dense") | 0.09 |

**Rules for `visible.py`** (same input rules as `ndvi.py`):
1. Inputs are surface reflectance with the scale (÷ 10 000) and the **+1000 offset** (scenes from Jan 2022 on) already applied. The scale cancels in a ratio, the offset does not, so skipping it would shift every value and break year-to-year comparison.
2. Where `G + R − B ≤ 0` (blue-dominant pixel), return NaN. The ratio is meaningless there and none of those pixels are vegetation.
3. Clip the result to [−1, 1] as float32.
4. **Mask water to NaN** using the SCL band (class 6), on top of the cloud/shadow/no-data mask NDVI already uses. Visible-light indexes cannot separate water reliably (see the table above), which is why this method has no "water" class. Coordinate with CS-020 (`composite.mask_invalid`), which owns the mask.

### Imagery
Same **Sentinel-2 L2A** scenes as NDVI: bands B02 (blue), B03 (green), B04 (red), 10 m. Same dates, grid, and cloud mask, so any difference between the two maps comes from the **method**, not the data. That keeps the "one grid per region" rule in the data contract and works for any future region. NAIP aerial photos (US only, ~1 m) are a possible later upgrade for detail, but they need their own grid and don't scale outside the US, so not for v1.

### Breakpoints
The placeholders already in `methods.VISIBLE` are the starting point:

| Class | VARI |
|---|---|
| bare | < 0.05 |
| sparse | 0.05 – 0.15 |
| moderate | 0.15 – 0.30 |
| dense | ≥ 0.30 |

**How to calibrate them (CS-026, once a real scene exists):** run both methods on the same scene and pick the VARI breakpoints so each class covers roughly the same share of the area as NDVI's class. Then the disagreements left over are real method differences, not a mismatch in thresholds. From the worked example, the "dense" breakpoint will probably move up (a healthy lawn scores ~0.7). Class keys, colors, and labels stay identical to NDVI (a CI test enforces this); only the numbers change.

### Change threshold
Keep **±0.1** for v0.1, matching NDVI's `changeClasses` and `stats.change_stats`. Revisit once two real years exist: if VARI's spread turns out narrower than NDVI's, drop to ±0.05.

### Where it should disagree with NDVI
Not tested yet (needs a real scene from CS-010/CS-011). Candidate spots in OKC/Norman to check for the About page:

| Spot | Expect NDVI | Expect visible | Why |
|---|---|---|---|
| Artificial-turf football fields (high-school and college stadiums in Norman, Moore, Edmond) | Low | **High** | Plastic looks green but reflects no near-infrared |
| Lakes Hefner, Overholser, Thunderbird | Negative (water) | Masked | Blue-dominant pixels; VARI is unreliable over water |
| Irrigated golf courses vs. unwatered lawns in late August | Separates stressed from healthy | Both look green | Drought stress shows in infrared before the color changes |
| Downtown OKC building shadows | Mostly fine | Drops | Little light in any band; ratio gets noisy |
| Will Rogers World Airport / Tinker AFB runways | Low | Low | Sanity check: both agree on bare concrete |

### Tests (`test_visible.py`)
The five outlined tests map directly onto the rules above: a green pixel lands in a vegetation class, a gray pixel scores 0 (bare), a zero or negative denominator gives NaN instead of a crash, random inputs stay within [−1, 1], and the output keeps the input shape. The worked-example table gives the expected numbers.

### Sources
- Gitelson, A. A., Kaufman, Y. J., Stark, R., Rundquist, D. (2002). *Novel algorithms for remote estimation of vegetation fraction.* Remote Sensing of Environment 80(1), 76–87. (VARI)
- Louhaichi, M., Borman, M. M., Johnson, D. E. (2001). *Spatially located platform and aerial photography for documentation of grazing impacts on wheat.* Geocarto International 16(1), 65–70. (GLI)
- Woebbecke, D. M., Meyer, G. E., Von Bargen, K., Mortensen, D. A. (1995). *Color indices for weed identification under various soil, residue, and lighting conditions.* Transactions of the ASAE 38(1), 259–269. (ExG)
- Sentinel-2 bands, offset, and SCL classes: [data-sources.md](data-sources.md) and the [Sentinel-2 user guide](https://sentinels.copernicus.eu/web/sentinel/user-guides/sentinel-2-msi).

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
