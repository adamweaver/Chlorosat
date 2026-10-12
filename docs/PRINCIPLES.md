# Goals and principles

## Mission

Make vegetation health easy to see and understand for people who are not GIS
experts.

The current product is a worldwide viewer of NASA MODIS NDVI. It is not yet a
comparison or statistics tool.

## Audience

- Policymakers and environmental advocates exploring broad vegetation patterns.
- Scientists who need transparent source, date and resolution information.
- Homebuyers and other non-specialists exploring how green an area appears.

MODIS pixels cover roughly 250 m, so the current site must not imply
property-level or street-level measurement accuracy.

## Product principles

### Plain language

- Explain NDVI as vegetation health before using the acronym.
- Keep the legend visible and label data sources.
- Distinguish measured detail from imagery enlarged for display.

### Honest data

- NASA supplies the live NDVI values; Chlorosat recolors them.
- Water and missing-data behavior must be explained.
- A year selection shows one mid-August composite, not an annual average.
- Esri Wayback releases are publication snapshots; their photos may have
  been captured in other years.
- Do not describe comparison, statistics, visible-light detection or pipeline
  output as available until they are implemented.

### Static and low-risk hosting

- The VPS serves static files only.
- Satellite processing and external-data requests never run on the VPS.
- Avoid adding a backend without team and VPS-owner approval.

### Accessible and restrained design

- Controls must work at phone widths and with a keyboard.
- Text contrast should meet WCAG AA.
- Branding remains secondary to the map and data.
- Never use synthetic fallback vegetation that could look measured.

### Future pipeline

The offline Python pipeline is future work and is not connected to the live
website. Its purpose is to create transparent, project-owned regional
products from source bands. Any future output contract or website integration
requires team approval and documentation before implementation.

### Learn-first AI use

AI supports learning rather than replacing it. AI-written functions use the
searchable `[AI]` comment format in [AGENTS.md](../AGENTS.md).
