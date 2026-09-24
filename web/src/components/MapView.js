"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";


/* [AI] Purpose: The interactive map everything else is drawn on.
 *      Does:    STUB. Planned: Leaflet map centered on the region's `center`/`zoom`
 *               from manifest.json, a satellite base layer (Esri World Imagery, with
 *               attribution), and children layers (VegetationLayer).
 *      Context: Leaflet touches `window`, which doesn't exist during the build, so never
 *               import this file directly. Load it with
 *               dynamic(() => import("@/components/MapView"), { ssr: false }).
 *               That call only works inside a "use client" file. The page also needs state
 *               (selected method + year), so make a client component (e.g. components/MapApp.js)
 *               that holds the state + dynamic import, and render <MapApp /> from page.js.
 *               Planned props: { region, children }
 *      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver 
 *      Edited: 2026-09-23 by David Lindesmith 
 */
                

export default function MapView({region, children}) {

  
    if (!region) return null; // if region is not yet loaded, don't render the map

  
    /* Renders the Leaflet map with the specified region and children layers
     * MapContainer: The Leaflet map container, centered on the region's center and zoom level
     * TileLayer: Pulls satellite imagery from Esri World Imagery, with attribution
     */
    return ( 
      < MapContainer
        center={region.center}
        zoom={region.zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >

        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Ersi &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
        />
        {children}
      </MapContainer>

    );

  }

