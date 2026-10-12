import Link from "next/link";
import localFont from "next/font/local";
import Satellite from "@/components/home/Satellite";
import Stars from "@/components/home/Stars";
import styles from "@/components/home/Home.module.css";

// Outfit font, self-hosted (no request to Google Fonts). Only the home page uses it.
// Its license (src/fonts/OFL.txt) must stay next to the font file.
const outfit = localFont({ src: "../fonts/outfit.woff2", weight: "100 900", display: "swap" });

/* [AI] Purpose: Home page (/): a light first page, so MapLibre and remote map tiles only
 *               load after someone opens the map.
 *      Does:    Name, animated satellite, and an "Open map" button that goes to /map/.
 *      Context: Plain server-rendered HTML + CSS with no JavaScript of its own: Stars and
 *               Satellite are server components (the shared Header is the only client part).
 *      Written: 2026-09-24 · Claude Opus 5.5 · requested by Adam Weaver
 *      Edited:  2026-09-30 · Claude Opus 5.5 (for David) · night-sky background like the globe's; Stars is
 *               now a small client component (canvas), the rest of the page is still plain HTML + CSS
 *      Edited:  2026-10-12 · GPT-5.6 Sol · requested by Lucas · describe the current MapLibre app */
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
