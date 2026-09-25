"""Infrared method: NDVI math. Owner: CS-011 (Carter, S2).

NDVI = (NIR - Red) / (NIR + Red), range -1..1.
Plants reflect lots of near-infrared and absorb red, so healthy vegetation scores high.
Classes + colors for this method live in methods.py (NDVI).
"""

import numpy as np


# [AI] Purpose: The core calculation of the infrared method.
#      Does:    (nir - red) / (nir + red) as float32. NaN where nir + red == 0 (no data).
#      Context: CS-011. Inputs are surface reflectance with scale/offset already applied
#               (docs/research/data-sources.md). Tests: tests/test_ndvi.py.
#      Written: 2026-09-24 · Claude Fable 5.1 · requested by Carter
def compute_ndvi(red: np.ndarray, nir: np.ndarray) -> np.ndarray:
    red = np.asarray(red, dtype=np.float32)
    nir = np.asarray(nir, dtype=np.float32)
    total = nir + red
    with np.errstate(divide="ignore", invalid="ignore"):
        ndvi = np.where(total == 0, np.nan, (nir - red) / total)
    return ndvi.astype(np.float32)
