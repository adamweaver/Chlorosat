"""Chlorosat pipeline: satellite bands -> vegetation layers (colored PNGs) + stats JSON.

Flow (see docs/ARCHITECTURE.md):
    config    -> which region (regions.toml)
    fetch     -> blue/green/red/NIR + cloud-mask bands for the region's bbox
    ndvi      -> infrared method math        } which methods exist + their colors:
    visible   -> visible-light method math   } methods.py
    composite -> cloud masking + seasonal median (any method)
    render    -> colored PNG in EPSG:3857
    stats     -> yearly + change stats
    export    -> files into web/public/data/ + manifest.json
"""

__version__ = "0.1.0"
