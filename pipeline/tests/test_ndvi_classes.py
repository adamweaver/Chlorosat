"""Equivalence-partition tests: NDVI value -> map class color (CS 3203 Activity 4-2).

Run:          uv run pytest tests/test_ndvi_classes.py -v
Against stub: CHLOROSAT_IMPL=stub uv run pytest tests/test_ndvi_classes.py -v
              (PowerShell: $env:CHLOROSAT_IMPL="stub"; uv run pytest tests/test_ndvi_classes.py -v)
"""

import os
import unittest

import numpy as np

from chlorosat import methods
from chlorosat.render import colorize


# [AI] Purpose: Code stub for colorize, so these tests can be shown failing first.
#      Does:    values -> all-transparent RGBA (no class ever picked).
#      Context: Used only when CHLOROSAT_IMPL=stub. The "incorrect" tests (expect
#               transparent) pass; every test expecting a class color fails.
#      Written: 2026-10-13 · Claude Opus 5.5 · requested by David
def colorize_stub(values, classes):
    values = np.asarray(values, dtype=np.float32)
    return np.zeros(values.shape + (4,), dtype=np.uint8)


if os.environ.get("CHLOROSAT_IMPL") == "stub":
    colorize = colorize_stub  # noqa: F811

CLASSES = methods.NDVI["classes"]
TRANSPARENT = None


# [AI] Purpose: Read which NDVI class a single value was colored as.
#      Does:    NDVI value -> class key ("water", "bare", "sparse", "moderate",
#               "dense"), or None if the pixel came out transparent.
#      Written: 2026-10-13 · Claude Opus 5.5 · requested by David
def class_of(value):
    rgba = tuple(int(n) for n in colorize(np.array([[value]]), CLASSES)[0, 0])
    if rgba[3] == 0:
        return TRANSPARENT
    for c in CLASSES:
        digits = c["color"].lstrip("#")
        if rgba[:3] == tuple(int(digits[i : i + 2], 16) for i in (0, 2, 4)):
            return c["key"]
    return "unknown color"


# [AI] Purpose: Equivalence partitions for colorize() with the real NDVI classes
#      (methods.NDVI, the breakpoints from CS-003 research).
#        Correct:   a value inside a class -> that class.
#        Incorrect: NaN (no data) or outside -1..1 -> transparent.
#        Boundary:  each breakpoint belongs to the class ABOVE it (min <= v < max);
#                   the top value 1.0 is included in "dense"; -1.0 is "water".
#        Edge:      a whole 2-D image keeps its shape, and mixed valid/invalid
#                   pixels are each handled on their own.
#      Written: 2026-10-13 · Claude Opus 5.5 · requested by David
class TestNdviClasses(unittest.TestCase):
    # ---- Correct ----
    def test_valid_values_get_their_class(self):
        self.assertEqual(class_of(-0.5), "water")
        self.assertEqual(class_of(0.1), "bare")
        self.assertEqual(class_of(0.3), "sparse")
        self.assertEqual(class_of(0.5), "moderate")
        self.assertEqual(class_of(0.8), "dense")

    # ---- Incorrect ----
    def test_no_data_is_transparent(self):
        self.assertIs(class_of(np.nan), TRANSPARENT)

    def test_out_of_range_is_transparent(self):
        self.assertIs(class_of(1.5), TRANSPARENT)
        self.assertIs(class_of(-1.5), TRANSPARENT)

    # ---- Boundary ----
    def test_breakpoint_belongs_to_class_above(self):
        self.assertEqual(class_of(0.0), "bare")
        self.assertEqual(class_of(0.2), "sparse")
        self.assertEqual(class_of(0.4), "moderate")
        self.assertEqual(class_of(0.6), "dense")

    def test_range_ends_are_included(self):
        self.assertEqual(class_of(-1.0), "water")
        self.assertEqual(class_of(1.0), "dense")

    def test_just_outside_range_ends(self):
        self.assertIs(class_of(1.0001), TRANSPARENT)
        self.assertIs(class_of(-1.0001), TRANSPARENT)

    # ---- Edge ----
    def test_image_keeps_shape_and_mixes_valid_and_invalid(self):
        values = np.array([[0.8, np.nan, 0.1], [2.0, -0.5, 0.6]])
        rgba = colorize(values, CLASSES)
        self.assertEqual(rgba.shape, (2, 3, 4))
        self.assertEqual(rgba[0, 1, 3], 0)  # NaN -> transparent
        self.assertEqual(rgba[1, 0, 3], 0)  # 2.0 -> transparent
        self.assertEqual(rgba[0, 0, 3], 255)  # 0.8 -> colored
        self.assertEqual(rgba[1, 2, 3], 255)  # 0.6 -> colored


if __name__ == "__main__":
    unittest.main()
