"""Tests for ndvi.compute_ndvi. OUTLINE, owner CS-011 (Carter).

TODO(CS-011): for each test, build small numpy arrays, call compute_ndvi, and assert
the expected result (use np.testing.assert_allclose for floats). Then delete the skip line.
Run: uv run pytest -v
"""

import pytest

pytestmark = pytest.mark.skip(reason="TODO(CS-011): compute_ndvi not implemented yet")


def test_known_value():
    """red=0.1, nir=0.5 -> (0.5 - 0.1) / (0.5 + 0.1) = 0.6667 (healthy plants)."""


def test_water_is_negative():
    """nir < red (e.g. red=0.3, nir=0.1) -> negative NDVI (water)."""


def test_zero_sum_is_nan_not_crash():
    """red=0, nir=0 -> NaN (no data), and no divide-by-zero crash."""


def test_output_always_between_minus_one_and_one():
    """Random reflectances in [0, 1] -> every non-NaN result is within [-1, 1]."""


def test_keeps_array_shape():
    """A (3, 4) input gives a (3, 4) output (works on whole images, not just single values)."""
