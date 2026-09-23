"""Numbers for the stats panel, for any method. Owner: CS-021 (Lucas, S3).

Output shapes: <year>.json and change JSON in docs/ARCHITECTURE.md#data-contract.
"""

import numpy as np


# [AI] Purpose: Summarize one year so users get simple numbers, not just colors.
#      Does:    STUB. Planned: ignoring NaN -> mean, median, validFraction, and
#               `classes` = share of valid pixels in each class (keys from the method's classes).
#      Context: TODO(CS-021). Return a dict ready for json.dump (plain floats, camelCase keys).
#               export.write_year adds region/method/year/source fields.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def year_stats(values: np.ndarray, classes: list[dict]) -> dict:
    raise NotImplementedError("TODO(CS-021): year_stats")


# [AI] Purpose: Show where vegetation was gained or lost between two years.
#      Does:    STUB. Planned: values_to - values_from -> difference array
#               (colorized by render.colorize with the method's "changeClasses").
#      Context: TODO(CS-021). Both inputs: same method, same shape + grid.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def change_map(values_from: np.ndarray, values_to: np.ndarray) -> np.ndarray:
    raise NotImplementedError("TODO(CS-021): change_map")


# [AI] Purpose: Summarize change so users can see "X% got greener, Y% lost green".
#      Does:    STUB. Planned: meanChange, and gained/lost/stable fractions using
#               +/- threshold (small changes count as "about the same").
#      Context: TODO(CS-021). Threshold draft 0.1. It must match the "stable" class in the
#               method's "changeClasses" (methods.py). Confirm with the research docs.
#      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
def change_stats(diff: np.ndarray, threshold: float = 0.1) -> dict:
    raise NotImplementedError("TODO(CS-021): change_stats")
