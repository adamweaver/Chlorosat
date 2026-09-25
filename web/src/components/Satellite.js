import styles from "@/css/Home.module.css";

/* [AI] Purpose: The animated Chlorosat satellite on the home page (the brand mark, drawn big).
 *      Does:    Inline SVG: solar panels, body, a swaying leaf antenna, and three "signal" arcs
 *               that pulse one after another. The animations are plain CSS (Home.module.css),
 *               so no JavaScript runs.
 *      Context: Ported from the old web/landing/index.html (CS-038, D11). Same shapes and colors
 *               as branding/chlorosat-icon.svg. prefers-reduced-motion turns the animation off.
 *      Written: 2026-09-24 · Claude Opus 5.5 · requested by Adam Weaver */
export default function Satellite() {
  return (
    <svg className={styles.satellite} viewBox="0 0 175 175" role="img" aria-label="Chlorosat satellite">
      <g transform="rotate(-28,-30.141239,121.20777)">
        <g transform="matrix(0.94,0,0,0.94,6,6)">
          {/* Solar panels */}
          <rect x="3.4831829" y="124.01196" width="58" height="34" rx="5" fill="#2e9e63" />
          <rect x="125.48318" y="124.01196" width="58" height="34" rx="5" fill="#2e9e63" />
          <g stroke="#a8e0be" strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.85" transform="translate(-6.516817,28.01196)">
            <path d="M 16,113 H 62" />
            <path d="M 56,113 44,102 m 0,11 -12,-11 m 0,11 -12,-11" />
            <path d="m 56,113 -12,11 m 0,-11 -12,11 m 0,-11 -12,11" />
            <path d="m 138,113 h 46" />
            <path d="m 144,113 12,-11 m 0,11 12,-11 m 0,11 12,-11" />
            <path d="m 144,113 12,11 m 0,-11 12,11 m 0,-11 12,11" />
          </g>
          {/* Arms, dish, and body */}
          <rect x="57.483181" y="136.01196" width="12" height="10" fill="#15503a" />
          <rect x="117.48318" y="136.01196" width="12" height="10" fill="#15503a" />
          <path d="m 115.11344,176.75725 a 22.000001,16.000001 0 0 0 -43.999997,0 z" fill="#56c27f" />
          <rect x="67.483185" y="116.01196" width="52" height="48" rx="12" fill="#15503a" />
          <rect x="81.483185" y="130.01196" width="24" height="20" rx="5" fill="#2e9e63" opacity="0.9" />
          {/* Antenna with the leaf on top */}
          <path d="m 93.483183,116.01196 v -14" stroke="#15503a" strokeWidth="7" strokeLinecap="round" />
          <path
            className={styles.leaf}
            d="m 93.630079,105.52242 c -9.002568,-6.996675 -9.006975,-18.996679 -0.0095,-25.999975 9.002531,6.996709 9.006951,18.996693 0.0095,25.999975 z"
            fill="#56c27f"
          />
          {/* Signal arcs (pulse in turn: see the animation-delay in Home.module.css) */}
          <g fill="none" stroke="#2e9e63" strokeWidth="7" strokeLinecap="round" transform="translate(-5.5957707,23.895324)">
            <path className={styles.arc} d="m 117.9,162.5 a 32,32 0 0 1 -35.8,0" />
            <path className={styles.arc} d="m 124,171.6 a 43,43 0 0 1 -48,0" />
            <path className={styles.arc} d="m 130.2,180.8 a 54,54 0 0 1 -60.4,0" />
          </g>
        </g>
      </g>
    </svg>
  );
}
