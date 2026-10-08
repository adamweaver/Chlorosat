import styles from "@/css/About.module.css";

export const metadata = { title: "About · Chlorosat" };

/* [AI] Purpose: Plain-language explainer for non-technical users.
 *      Does:    What the colors (and the gaps) mean, how to use every control,
 *               how search works, privacy, where the data comes from, and the
 *               limits of the data. Scrolls inside <main> with a dark
 *               scrollbar, under the fixed header.
 *      Context: CS-023 (S3). Principles: plain language + transparency. Still
 *               to add from the plan: the two methods (infrared vs visible
 *               light) once visible light is on the map.
 *      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
 *      Edited:  2026-09-30 · Claude Opus 5.5 (for David) · replaced placeholder with the demo's About text
 *      Edited:  2026-10-07 · Claude Opus 5.5 (for David) · rewritten to match the current globe: no-data areas,
 *               compass, approximate location, smarter search, privacy, limits */
export default function About() {
  return (
    <main className={`${styles.aboutPage} dark-scrollbar`}>
      <div className={styles.aboutWrap}>
        <div className={styles.aboutCard}>
          <h1>About Chlorosat</h1>
          <p>
            Chlorosat shows how green the land is, anywhere on Earth, on a 3D
            globe of satellite photos. Pick a year from 2019 to 2026 to see how
            vegetation has changed, then zoom in on any place to look closer.
          </p>

          <h2>What the colors mean</h2>
          <p>
            The colors come from NDVI (Normalized Difference Vegetation Index).
            Healthy leaves reflect a lot of near-infrared light, which our eyes
            can&apos;t see, and absorb red light. Satellites measure both, and
            NDVI turns the difference into one number.{' '}
            <strong>Dark green</strong> means dense, healthy vegetation such as
            forest, <strong>green</strong> healthy plants,{' '}
            <strong>yellow</strong> sparse or dry vegetation, and{' '}
            <strong>red</strong> little or none: bare ground, rock, roads and
            buildings.
          </p>
          <p>
            Water is left clear so you can see the photo. Sometimes NASA has no
            reading at all for a spot. On land, those gaps are shown as red, the
            same as &quot;no vegetation&quot;, because they are almost always
            dense city centers. Midtown and Lower Manhattan are a permanent gap
            in NASA&apos;s data, for example. On a few very small islands this
            can make a green island look red.
          </p>

          <h2>Using the map</h2>
          <ul>
            <li>
              <strong>Year:</strong> slide to pick a year from 2019 to 2026.
              The map loads it once you stop sliding, and the satellite photos
              change to that year too.
            </li>
            <li>
              <strong>Opacity:</strong> fade the vegetation colors to see the
              photo underneath, or hide them with the eye button.
            </li>
            <li>
              <strong>Satellite / Map:</strong> switch between satellite photos
              and a plain street map.
            </li>
            <li>
              <strong>Moving around:</strong> drag to spin the globe, scroll or
              pinch to zoom. The <strong>+</strong> and <strong>−</strong>{' '}
              buttons zoom too (on phones, pinch instead).
            </li>
            <li>
              <strong>Compass:</strong> if the globe gets turned or tilted (a
              two-finger twist on a phone), a compass appears above the reset
              button. Its red tip points north; press it to turn north back to
              the top.
            </li>
            <li>
              <strong>Reset:</strong> the circular-arrow button flies back to
              the whole globe.
            </li>
            <li>
              <strong>Find my location:</strong> the target button flies to
              where you are and marks it with a blue dot. The light-blue circle
              around it shows how sure your device is. Laptops without GPS often
              only know roughly where they are; then the circle is large, the
              map shows the whole area you could be in, and it keeps improving
              for a few seconds if a better fix arrives.
            </li>
            <li>
              <strong>On a phone:</strong> Year and opacity are in the ☰ menu
              in the search bar, and tapping the ⓘ credit line at the bottom
              shows the full credits.
            </li>
          </ul>

          <h2>Searching</h2>
          <ul>
            <li>
              Type a city, country, park, landmark or address and pick a
              result, or just press Enter for the top one. The map frames the
              whole place: a city fills the screen, a continent shows the whole
              globe.
            </li>
            <li>
              When you&apos;re zoomed in on an area, places nearby come first:
              searching &quot;Target&quot; while looking at Norman finds the
              Norman store, while famous places still win (&quot;Paris&quot; is
              still France).
            </li>
            <li>
              Common names work as well as official ones: &quot;Ivory
              Coast&quot;, &quot;Czech Republic&quot; or &quot;Burma&quot; find
              the right country.
            </li>
            <li>
              Clicking the empty search box shows your last 10 searches. Picking
              one goes straight there without searching again.
            </li>
          </ul>

          <h2>Your privacy</h2>
          <p>
            There are no accounts and nothing to sign in to. Your recent
            searches are saved only in your own browser, and you can remove
            them one by one or clear them all. Your location is only used in
            your browser to move the map; Chlorosat doesn&apos;t send it
            anywhere or store it. What you type in the search box is sent to
            Photon, the search service, to find places.
          </p>

          <h2>Where the data comes from</h2>
          <ul>
            <li>
              <strong>Vegetation (NDVI):</strong> NASA&apos;s MODIS sensor on
              the Terra satellite, through NASA GIBS. Each year shows the
              mid-August 16-day average.
            </li>
            <li>
              <strong>Satellite photos:</strong> Esri World Imagery (Maxar,
              Earthstar Geographics and others). Each year uses Esri&apos;s
              archived imagery from about that August, and the credit line at
              the bottom shows when the photos on screen were actually taken.
            </li>
            <li>
              <strong>Place names, borders, water outlines and the street
              map:</strong> OpenStreetMap contributors, through OpenFreeMap and
              OpenMapTiles.
            </li>
            <li>
              <strong>Place search:</strong> Photon by komoot, built on
              OpenStreetMap.
            </li>
          </ul>

          <h2>Good to know</h2>
          <ul>
            <li>
              <strong>Detail:</strong> each NASA measurement covers about 250 m
              by 250 m, roughly a few city blocks. Zoomed in close, the colors
              are that measurement enlarged and blended smoothly; they
              can&apos;t show a single yard, field edge or tree.
            </li>
            <li>
              <strong>Season:</strong> mid-August is the peak of the growing
              season in the Northern Hemisphere but winter in the Southern
              Hemisphere, so places like Australia, Argentina and South Africa
              look less green than they do in their own summer.
            </li>
            <li>
              <strong>Greenness, not causes:</strong> NDVI shows how much
              healthy leaf there is. It can&apos;t tell you why an area changed
              (drought, a fire, a harvest, new buildings), only that it did.
            </li>
            <li>
              <strong>Photos:</strong> the satellite photos are stitched
              together from many pictures taken on different days, so you may
              see seams where two meet, or clouds and shadows in places.
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
