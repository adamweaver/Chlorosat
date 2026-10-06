import styles from "@/css/About.module.css";

export const metadata = { title: "About · Chlorosat" };

/* [AI] Purpose: Plain-language explainer for non-technical users.
 *      Does:    What the colors mean, how to use the map, and where the data
 *               comes from. Scrolls inside <main> with a dark scrollbar, under
 *               the fixed header.
 *      Context: CS-023 (S3). Principles: plain language + transparency. Text
 *               from David's chlorosat-map-demo. Still to add from the plan:
 *               the two methods (infrared vs visible light) once visible light
 *               is on the map, and how to compare years.
 *      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
 *      Edited:  2026-09-30 · Claude Opus 5.5 (for David) · replaced placeholder with the demo's About text */
export default function About() {
  return (
    <main className={`${styles.aboutPage} dark-scrollbar`}>
      <div className={styles.aboutWrap}>
        <div className={styles.aboutCard}>
          <h1>About Chlorosat</h1>
          <p>
            Chlorosat shows how green the land is, anywhere on Earth, laid over
            satellite photos on a 3D globe. You can step back through the
            years to see how vegetation has changed, starting with the
            OKC/Norman area.
          </p>

          <h2>What the colors mean</h2>
          <p>
            The colors come from NDVI (Normalized Difference Vegetation Index).
            Healthy plants reflect a lot of near-infrared light, which our eyes
            can&apos;t see, and absorb red light. Satellites measure both, and
            NDVI turns the difference into a single number.{' '}
            <strong>Green</strong> means dense, healthy vegetation,{' '}
            <strong>yellow</strong> means some, and <strong>red</strong> means
            little or none: bare ground, rock or buildings. Water and places
            with no data are left clear.
          </p>

          <h2>Using the map</h2>
          <ul>
            <li>
              <strong>Year:</strong> slide to pick a year from 2019 to 2026.
              The map loads it once you stop sliding.
            </li>
            <li>
              <strong>Opacity:</strong> fade the vegetation colors to see the
              photo underneath, or hide them with the eye button.
            </li>
            <li>
              <strong>Search:</strong> find any place; your recent searches are
              kept on your own device.
            </li>
            <li>
              <strong>Satellite / Map:</strong> switch between photos and a
              plain street map.
            </li>
            <li>
              <strong>On a phone:</strong> Year and opacity are in the ☰ menu
              in the search bar, and tapping the ⓘ credit line at the bottom
              shows the full credits.
            </li>
          </ul>

          <h2>Where the data comes from</h2>
          <ul>
            <li>
              <strong>Vegetation (NDVI):</strong> NASA&apos;s MODIS Terra
              satellite, through NASA GIBS. Each year shows the mid-August
              16-day average at about 250 m detail, so very close up the colors
              get blocky.
            </li>
            <li>
              <strong>Satellite photos:</strong> Esri World Imagery (Maxar,
              Earthstar Geographics and others). Each year uses Esri&apos;s
              archived imagery from that year, and the credit line shows when
              the photos you&apos;re looking at were taken.
            </li>
            <li>
              <strong>Labels, water outlines and the street map:</strong>{' '}
              OpenStreetMap contributors, through OpenFreeMap and OpenMapTiles.
            </li>
            <li>
              <strong>Place search:</strong> Photon by komoot, built on
              OpenStreetMap.
            </li>
          </ul>

          <p className={styles.aboutNote}>
            Chlorosat is Group E&apos;s CS 3203 project (Adam, Carter, David,
            Kevin and Lucas). Next, it will also map vegetation with visible
            light (a normal color photo) next to NDVI, and explain why the two
            can differ, for policymakers, environmental groups, scientists and
            homebuyers.
          </p>
        </div>
      </div>
    </main>
  );
}
