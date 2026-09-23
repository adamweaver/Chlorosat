"""Visible-light method: basic vegetation detection from a normal color (RGB) image.
Owner: CS-026 (Carter, S3). Which index to use is decision D9 (docs/research/visible-detection.md).

Uses only red, green, blue, like a regular photo, so it works on any color imagery. It measures
"looks green", not plant health, so it can disagree with NDVI (stressed plants that still look
green, artificial turf, green paint, shadows, water). The website shows which method is active
and explains the difference.
Classes + colors for this method live in methods.py (VISIBLE).
"""

import numpy as np


# [AI] Purpose: The core calculation of the visible-light method.
#      Does:    STUB. Planned: an RGB vegetation index as float32, NaN where undefined. Options:
#                 VARI = (G - R) / (G + R - B)   range ~-1..1; denominator can hit 0 -> clip
#                 ExG  = 2g - r - b              using r,g,b = each band / (R + G + B)
#               Clip the result to the range the classes in methods.VISIBLE expect.
#      Context: TODO(CS-026). Same input rules as ndvi.compute_ndvi (scale/offset applied first).
#               Tests: tests/test_visible.py.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def compute_visible_index(red: np.ndarray, green: np.ndarray, blue: np.ndarray) -> np.ndarray:
    raise NotImplementedError("TODO(CS-026): compute_visible_index")
