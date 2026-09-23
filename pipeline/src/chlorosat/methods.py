"""Vegetation detection methods: names, bands, and color classes. Single source of truth.

We show vegetation two ways (decision D8). They measure different things, so results can differ:
    ndvi    - Infrared: healthy plants strongly reflect near-infrared (NIR) light. Math: ndvi.py
    visible - Visible light: finds green-looking areas in a normal color image. Math: visible.py

export.py copies these dicts straight into manifest.json, so their keys are camelCase (JSON style).
Both methods use the same class keys, colors, and labels, so the legend reads the same way; only
the breakpoints (min/max) differ, because each index has its own value range.
Colors: colorblind-friendly brown -> teal (docs/PRINCIPLES.md). ALL VALUES ARE DRAFTS.
"""

NDVI = {
    "id": "ndvi",
    "name": "Infrared (NDVI)",
    "description": "Plant health, measured from near-infrared light that healthy plants reflect.",
    "bands": ["red", "nir"],
    # Breakpoints: finalize with the CS-003 research (docs/research/ndvi.md).
    "classes": [
        {"key": "water", "min": -1.0, "max": 0.0, "color": "#7fa7c9", "label": "Water / no plants"},
        {"key": "bare", "min": 0.0, "max": 0.2, "color": "#8c510a", "label": "Bare ground / built up"},
        {"key": "sparse", "min": 0.2, "max": 0.4, "color": "#d8b365", "label": "Sparse plants"},
        {"key": "moderate", "min": 0.4, "max": 0.6, "color": "#5ab4ac", "label": "Moderate plants"},
        {"key": "dense", "min": 0.6, "max": 1.0, "color": "#01665e", "label": "Dense, healthy plants"},
    ],
    # Change = value(to) - value(from), range -2..2. "stable" is transparent so the map shows
    # through. The +/-0.1 threshold must match stats.change_stats.
    "changeClasses": [
        {"key": "lost", "min": -2.0, "max": -0.1, "color": "#8c510a", "label": "Lost greenness"},
        {"key": "stable", "min": -0.1, "max": 0.1, "color": "#00000000", "label": "About the same"},
        {"key": "gained", "min": 0.1, "max": 2.0, "color": "#01665e", "label": "Gained greenness"},
    ],
}

VISIBLE = {
    "id": "visible",
    "name": "Visible light",
    "description": "Green-looking areas in a normal color photo. Simpler, but easier to fool.",
    "bands": ["red", "green", "blue"],
    # PLACEHOLDER breakpoints for a VARI-style index (range about -1..1). The index and these
    # values are decision D9, set in CS-026 (docs/research/visible-detection.md).
    # No "water" class: visible-light indexes can't separate water reliably.
    "classes": [
        {"key": "bare", "min": -1.0, "max": 0.05, "color": "#8c510a", "label": "Bare ground / built up"},
        {"key": "sparse", "min": 0.05, "max": 0.15, "color": "#d8b365", "label": "Sparse plants"},
        {"key": "moderate", "min": 0.15, "max": 0.3, "color": "#5ab4ac", "label": "Moderate plants"},
        {"key": "dense", "min": 0.3, "max": 1.0, "color": "#01665e", "label": "Dense, healthy plants"},
    ],
    "changeClasses": [
        {"key": "lost", "min": -2.0, "max": -0.1, "color": "#8c510a", "label": "Lost greenness"},
        {"key": "stable", "min": -0.1, "max": 0.1, "color": "#00000000", "label": "About the same"},
        {"key": "gained", "min": 0.1, "max": 2.0, "color": "#01665e", "label": "Gained greenness"},
    ],
}

# Order = order shown in the website's method toggle.
METHODS = [NDVI, VISIBLE]

# Shown first on the website. NDVI is the more reliable measure of plant health.
DEFAULT_METHOD = "ndvi"
