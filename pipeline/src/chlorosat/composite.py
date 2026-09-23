"""Cloud masking + seasonal composites. Works for ANY method's values. Owner: CS-020 (David, S3).

Why: one satellite image can be cloudy or unusual. Combining several images from the same season
(per year) gives fairer year-to-year comparisons.
"""

import numpy as np


# [AI] Purpose: Remove pixels that aren't real ground (clouds, shadows, no data).
#      Does:    STUB. Planned: set values to NaN where the scene-classification band (SCL)
#               marks cloud / cloud shadow / no data.
#      Context: TODO(CS-020). SCL is 20 m: resample it to the 10 m grid first (nearest
#               neighbor). SCL class codes: see docs/research/ndvi.md. Used for both methods.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def mask_invalid(values: np.ndarray, scl: np.ndarray) -> np.ndarray:
    raise NotImplementedError("TODO(CS-020): mask_invalid")


# [AI] Purpose: Make fair year-to-year comparisons by combining many images from one season.
#      Does:    STUB. Planned: np.nanmedian over a stack of masked arrays (same grid) -> one array.
#      Context: TODO(CS-020). Watch laptop RAM: process in chunks if needed.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def seasonal_median(stack: list[np.ndarray]) -> np.ndarray:
    raise NotImplementedError("TODO(CS-020): seasonal_median")
