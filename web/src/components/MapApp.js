"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MapView = dynamic(() => import("./MapView"), { ssr: false });
const VegetationLayer = dynamic(() => import("./VegetationLayer"), { ssr: false });

/* [AI] Purpose: Holds map state and renders the map + its layers.
 *      Does:    Fetches /data/manifest.json client-side, pulls out the
 *               "okc-norman" region, and dynamically loads MapView
 *               (client-only, see MapView.js) with VegetationLayer nested
 *               inside it. Renders <MapApp /> from page.js.
 *      Context: CS-012. methodId/year are hardcoded for now since the real
 *               controls (MethodToggle, YearSelector) are CS-022, Sprint 3.
 *               Region is looked up by id "okc-norman" - fine while there's
 *               only one region; once more exist, this needs a real region
 *               picker instead of a hardcoded id (CS-022+).
 *      Written: 2026-09-23 · Claude Sonnet 5 · requested by David Lindesmith */

export default function MapApp() {

    //TO DO: Add state for methodId and year, and controls to change them (CS-022, Sprint 3)
    const [methodId] = useState("ndvi");
    const [year] = useState(2024);

    //null while manifest.json is loading
    const [region, setRegion] = useState(null);
    
    // Fetch the manifest.json file and extract the "okc-norman" region
    useEffect(() => {
        let cancelled = false;

        //fetches the manifest.json file from the /data directory
        fetch("/data/manifest.json")
            .then((res) => res.json())
            .then((manifest) => {
                if (cancelled) return;
                const found = manifest.regions.find((r) => r.id === "okc-norman"); //finds the region with id "okc-norman" in the manifest
                setRegion(found ?? null);
            })
            .catch((err) => console.error("Failed to load manifest.json:", err)); //log any errors that occur during the fetch

        return () => {
            cancelled = true;
        };
    }, []);

    // If the region is not yet loaded, display a loading message
    if (!region) {
        return <p>Loading map...</p>;
    }

    return(
        <div style ={{ height: "80vh", width: "100%" }}>
            <MapView region={region}>
                <VegetationLayer region={region} methodId={methodId} year={year} />
            </MapView>
        </div>
    );

}