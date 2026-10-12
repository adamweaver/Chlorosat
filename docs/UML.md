# UML diagrams

These diagrams describe the current runtime. The future Python pipeline is
shown separately because the live website does not call it or read its output.

GitHub renders Mermaid diagrams. In an editor that does not, paste a block
into [mermaid.live](https://mermaid.live).

## Live system

```mermaid
flowchart LR
  browser["Browser"]
  static["Next.js static files"]
  nginx["nginx"]
  nasa["NASA GIBS<br/>MODIS NDVI"]
  esri["Esri<br/>imagery + Wayback"]
  vector["OpenFreeMap / OpenMapTiles<br/>map + labels + water"]
  photon["Photon<br/>place search"]

  nginx --> static
  static --> browser
  browser --> nasa
  browser --> esri
  browser --> vector
  browser --> photon
```

nginx serves files only. All remote-data requests and NDVI display processing
happen in the browser.

## Website components

```mermaid
classDiagram
  direction TB

  class RootLayout {
    Header
    current route
    PersistentMap
  }
  class Home {
    route /
    Satellite
    Stars
  }
  class About {
    route /about/
  }
  class MapPage {
    route /map/
    returns null
  }
  class PersistentMap {
    create after first map visit
    hide without unmounting
  }
  class MapApp {
    year
    opacity
    vegetation visible
    basemap
  }
  class GlobeEngine {
    +setYear()
    +setOpacity()
    +setVegVisible()
    +switchBasemap()
    +flyTo()
    +fitToBounds()
    +locate()
  }
  class Controls {
    SearchBar
    YearSelector
    OpacitySlider
    BaseMapToggle
    SideControls
    Legend
  }

  RootLayout --> Home
  RootLayout --> About
  RootLayout --> MapPage
  RootLayout *-- PersistentMap
  PersistentMap *-- MapApp : dynamic, browser only
  MapApp *-- GlobeEngine
  MapApp *-- Controls
```

`MapPage` is intentionally empty: its presence creates the `/map/` route.
`PersistentMap`, mounted by `RootLayout`, owns the visible map.

## Tile processing

```mermaid
sequenceDiagram
  participant M as MapLibre
  participant E as Globe engine
  participant C as Browser cache
  participant N as NASA GIBS

  M->>E: request veg tile
  E->>C: look for raw NASA tile
  alt cache miss
    E->>N: fetch precomputed NDVI PNG
    N-->>E: indexed PNG
    E->>C: store raw response
  else cache hit
    C-->>E: cached response
  end
  E->>E: decode NDVI values
  E->>E: recolor and mask water
  E-->>M: ImageBitmap
```

NASA calculates NDVI. Chlorosat transforms the supplied values for display.
Raw responses persist across refreshes on secure origins; transformed
bitmaps are cached only in memory.

## Future pipeline

```mermaid
classDiagram
  direction LR

  class cli {
    +ndvi
  }
  class process {
    +read_band()
    +ndvi_year()
  }
  class ndvi {
    +compute_ndvi()
  }
  class render {
    +to_web_mercator()
    +colorize()
    +save_png()
  }
  class export {
    +write_year()
    +update_manifest()
  }
  class Planned {
    fetch scenes
    cloud mask
    seasonal composite
    visible-light index
    statistics
    change maps
    website integration
  }

  cli --> process
  process --> ndvi
  process --> render
  process --> export
  Planned ..> process : future work
```

Only the solid local-file NDVI chain is implemented. The planned features do
not run and the pipeline has no connection to the live globe.
