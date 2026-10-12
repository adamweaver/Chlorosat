"""Future offline pipeline; not used by the live Chlorosat website.

Intended flow (most stages are not implemented; see pipeline/README.md):
    config    -> which region (regions.toml)
    fetch     -> blue/green/red/NIR + cloud-mask bands for the region's bbox
    ndvi      -> infrared method math        } which methods exist + their colors:
    visible   -> visible-light method math   } methods.py
    composite -> cloud masking + seasonal median (any method)
    render    -> colored PNG in EPSG:3857
    stats     -> yearly + change stats
    export    -> experimental PNG + manifest output

TODO(CS-0xx) tags name the original sprint tasks (docs/scrum/, historical plans);
they are not currently assigned to anyone.
"""

__version__ = "0.1.0"
