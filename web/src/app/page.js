import Link from "next/link";
import localFont from "next/font/local";
import Satellite from "@/components/Satellite";
import Stars from "@/components/Stars";
import styles from "@/css/Home.module.css";

// Outfit font, self-hosted (no request to Google Fonts). Only the home page uses it.
// Its license (src/fonts/OFL.txt) must stay next to the font file.
const outfit = localFont({ src: "../fonts/outfit.woff2", weight: "100 900", display: "swap" });

/* [AI] Purpose: Home page (/): a light first page, so Leaflet, map tiles, and overlay PNGs only
 *               load when someone asks for the map (decision D11).
 *      Does:    Name, animated satellite, and an "Open map" button that goes to /map/.
 *      Context: CS-038. Ported from the old web/landing/index.html (the placeholder that was live
 *               on chlorosat.com); "Work in progress" became the button. No "use client":
 *               the page is plain HTML + CSS, with no JavaScript of its own.
 *      Written: 2026-09-24 · Claude Opus 5.5 · requested by Adam Weaver */
export default function Home() {
  return (
    <main className={`${styles.home} ${outfit.className}`}>
      <Stars />
      <div className={styles.stack}>
        <h1 className={styles.name}>Chlorosat</h1>
        <Satellite />
        <Link href="/map/" className={styles.openMap}>
          Open map
        </Link>
      </div>
    </main>
  );
}
