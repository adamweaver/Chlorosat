import styles from "@/css/Home.module.css";

/* [AI] Purpose: Make a repeatable "random" number sequence, so the stars look scattered but come
 *               out the same on every build.
 *      Does:    seed -> a function that returns a new number from 0 up to (not including) 1 per call.
 *      Context: A classic "linear congruential generator" (Park-Miller). Math.random() would give
 *               different stars in the built HTML than in the browser, and React warns about that
 *               mismatch. Fixed stars also mean the home page needs no JavaScript at all.
 *      Written: 2026-09-24 · Claude Opus 5.5 · requested by Adam Weaver */
function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return value / 2147483647;
  };
}

// Built once at build time: 90 stars, each with a position and its own twinkle timing.
const random = seededRandom(42);
const STARS = Array.from({ length: 90 }, () => ({
  left: `${random() * 100}%`,
  top: `${random() * 100}%`,
  animationDelay: `${random() * 4}s`,
  animationDuration: `${3 + random() * 4}s`,
}));

/* [AI] Purpose: The twinkling star background on the home page.
 *      Does:    Renders 90 tiny dots at fixed "random" spots; CSS (Home.module.css) makes them twinkle.
 *      Context: Ported from the script in the old web/landing/index.html (CS-038). Decorative only,
 *               so screen readers skip it (aria-hidden).
 *      Written: 2026-09-24 · Claude Opus 5.5 · requested by Adam Weaver */
export default function Stars() {
  return (
    <div className={styles.stars} aria-hidden="true">
      {STARS.map((style, i) => (
        <span key={i} style={style} />
      ))}
    </div>
  );
}
