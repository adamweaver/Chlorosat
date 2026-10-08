import "@/css/globals.css";
import Header from "@/components/Header";
import PersistentMap from "@/components/PersistentMap";

// Page <title> and description (used by browsers + search engines).
// The favicon comes from src/app/icon.svg automatically (Next.js convention).
export const metadata = {
  title: "Chlorosat",
  description: "See and compare vegetation health from satellite data.",
};

// [AI] Browser chrome colors. Phones color their system bars from these: on a
//      Samsung Galaxy S24 the bottom navigation bar (back/home/recents) was a
//      white strip under the dark site (David, 2026-10-07). themeColor matches
//      the header (--header-bg in globals.css); colorScheme "dark" tells the
//      browser the whole site is dark.
//      Written: 2026-10-07 · Claude Opus 5.5 · requested by David
export const viewport = {
  themeColor: "#0a0c0b",
  colorScheme: "dark",
};

/* [AI] Purpose: Shared shell wrapped around every page.
 *      Does:    Renders <html>/<body>, the site header, then the current page.
 *      Context: Next.js App Router root layout. Layout details: CS-014.
 *      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
 *      Edited:  2026-09-30 · Claude Opus 5.5 (for David) · globe map: preconnect to the tile servers;
 *               <PersistentMap /> keeps the globe loaded while visiting other pages */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Open connections to the map's tile servers early, so the first tiles don't
          also wait for DNS + TLS setup (~100-300 ms per server). */}
      <head>
        <link rel="preconnect" href="https://gibs.earthdata.nasa.gov" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://wayback.maptiles.arcgis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://ibasemaps-api.arcgis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://tiles.openfreemap.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://metadata.maptiles.arcgis.com" />
      </head>
      <body>
        <Header />
        {children}
        <PersistentMap />
      </body>
    </html>
  );
}
