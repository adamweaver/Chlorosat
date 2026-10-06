import styles from "@/css/Home.module.css";

/* [AI] Purpose: Make a repeatable "random" number sequence, so the stars look scattered but come
 *               out the same on every build.
 *      Does:    seed -> a function that returns a new number from 0 up to (not including) 1 per call.
 *      Context: A classic "linear congruential generator" (Park-Miller). Math.random() would give
 *               different stars in the built HTML than in the browser, and React warns about that
 *               mismatch.
 *      Written: 2026-09-24 · Claude Opus 5.5 · requested by Adam Weaver */
function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return value / 2147483647;
  };
}

// Built once at build time: 60 brighter stars, each with a position, size and its own twinkle timing.
const random = seededRandom(42);
const STARS = Array.from({ length: 60 }, () => {
  const size = `${1.5 + random() * 1.5}px`;
  return {
    left: `${random() * 100}%`,
    top: `${random() * 100}%`,
    width: size,
    height: size,
    animationDelay: `${random() * 4}s`,
    animationDuration: `${3 + random() * 4}s`,
  };
});

/* [AI] Purpose: The night-sky background on the home page.
 *      Does:    The still star field is a fixed image (public/stars.svg,
 *               the same one behind the globe on /map/), shown by the
 *               .night-sky class (globals.css). On top, 60 brighter dots
 *               twinkle with CSS (Home.module.css).
 *      Context: Ported from the script in the old web/landing/index.html (CS-038). Decorative only,
 *               so screen readers skip it (aria-hidden). No JavaScript runs.
 *      Written: 2026-09-24 · Claude Opus 5.5 · requested by Adam Weaver
 *      Edited:  2026-09-30 · Claude Opus 5.5 (for David) · darker night sky like the globe's
 *      Edited:  2026-09-30 · Claude Opus 5.5 (for David) · star field is now a fixed image instead
 *               of being redrawn at random on every load/resize (phones re-scattered it whenever
 *               the keyboard opened); back to a plain server component */
export default function Stars() {
  return (
    <div className={`${styles.stars} night-sky`} aria-hidden="true">
      {STARS.map((style, i) => (
        <span key={i} style={style} />
      ))}
    </div>
  );
}
