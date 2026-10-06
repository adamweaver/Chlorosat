"use client";

import { useEffect, useRef } from "react";
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
 *      Does:    A canvas full of small, still stars (drawn the same way as the globe's sky on
 *               /map/, so the two pages match), plus 60 brighter dots that twinkle with CSS
 *               (Home.module.css). Redraws the canvas when the window is resized.
 *      Context: Ported from the script in the old web/landing/index.html (CS-038). Decorative only,
 *               so screen readers skip it (aria-hidden).
 *      Written: 2026-09-24 · Claude Opus 5.5 · requested by Adam Weaver
 *      Edited:  2026-09-30 · Claude Opus 5.5 (for David) · darker night sky like the globe's: black
 *               background + canvas star field (needs "use client" now) */
export default function Stars() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    function drawStars() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // About one star per 1800 square pixels, random size and brightness.
      const count = Math.floor((canvas.width * canvas.height) / 1800);
      for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 1.2 + 0.2;
        const brightness = Math.random() * 0.6 + 0.4;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${brightness})`;
        ctx.fill();
      }
    }
    drawStars();
    window.addEventListener("resize", drawStars);
    return () => window.removeEventListener("resize", drawStars);
  }, []);

  return (
    <div className={styles.stars} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.skyCanvas} />
      {STARS.map((style, i) => (
        <span key={i} style={style} />
      ))}
    </div>
  );
}
