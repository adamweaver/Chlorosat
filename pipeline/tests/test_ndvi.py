"""Tests for ndvi.compute_ndvi (CS-011). Run: uv run pytest -v"""

import numpy as np
from numpy.testing import assert_allclose

from chlorosat.ndvi import compute_ndvi


def test_known_value():
    assert_allclose(compute_ndvi(np.array([0.1]), np.array([0.5])), [0.4 / 0.6], rtol=1e-6)


def test_water_is_negative():
    assert compute_ndvi(np.array([0.3]), np.array([0.1]))[0] < 0


def test_zero_sum_is_nan_not_crash():
    assert np.isnan(compute_ndvi(np.array([0.0]), np.array([0.0]))[0])


def test_output_always_between_minus_one_and_one():
    rng = np.random.default_rng(0)
    result = compute_ndvi(rng.random((50, 50)), rng.random((50, 50)))
    assert np.all(np.abs(result[~np.isnan(result)]) <= 1)


def test_keeps_array_shape():
    result = compute_ndvi(np.ones((3, 4)), np.ones((3, 4)))
    assert result.shape == (3, 4)
    assert result.dtype == np.float32
