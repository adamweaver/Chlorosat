"""Tests for visible.compute_visible_index. OUTLINE, owner CS-026 (Carter).

TODO(CS-026): once the index is chosen (decision D9), work out the expected numbers by hand for
each case, write the asserts (np.testing.assert_allclose for floats), and delete the skip line.
Run: uv run pytest -v
"""

import pytest

pytestmark = pytest.mark.skip(reason="TODO(CS-026): compute_visible_index not implemented yet")


def test_green_pixel_scores_high():
    """A clearly green pixel (e.g. r=0.05, g=0.15, b=0.04) -> value in a vegetation class."""


def test_gray_pixel_scores_low():
    """A gray/concrete pixel (r = g = b) -> value in the "bare" class."""


def test_undefined_is_nan_not_crash():
    """All-zero pixel (or a zero denominator) -> NaN, and no divide-by-zero crash."""


def test_output_within_class_range():
    """Random inputs -> every non-NaN result lies within methods.VISIBLE classes' min..max."""


def test_keeps_array_shape():
    """A (3, 4) input gives a (3, 4) output."""
