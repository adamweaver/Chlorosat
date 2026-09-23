"""Infrared method: NDVI math. Owner: CS-011 (Carter, S2).

NDVI = (NIR - Red) / (NIR + Red), range -1..1.
Plants reflect lots of near-infrared and absorb red, so healthy vegetation scores high.
Classes + colors for this method live in methods.py (NDVI).
"""

import numpy as np


# [AI] Purpose: The core calculation of the infrared method.
#      Does:    STUB. Planned: element-wise (nir - red) / (nir + red) as float32.
#               Where nir + red == 0, return NaN (no data) instead of crashing.
#      Context: TODO(CS-011). Inputs are same-shape arrays of surface reflectance. Apply the
#               source's scale/offset BEFORE calling this (Sentinel-2 has a +1000 offset from
#               2022 on; see docs/research/data-sources.md). Tests: tests/test_ndvi.py.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def compute_ndvi(red: np.ndarray, nir: np.ndarray) -> np.ndarray:
    raise NotImplementedError("TODO(CS-011): compute_ndvi")
