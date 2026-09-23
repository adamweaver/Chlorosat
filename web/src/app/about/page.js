export const metadata = { title: "About · Chlorosat" };

/* [AI] Purpose: Plain-language explainer for non-technical users.
 *      Does:    Placeholder. Planned sections:
 *                 - What the colors mean (greenness in simple words)
 *                 - The two methods: infrared (plant health) vs visible light (looks green),
 *                   and why they can disagree (stressed plants, artificial turf, shadows, water;
 *                   table in docs/research/visible-detection.md)
 *                 - How to compare years, and what "change" means
 *                 - Data source, dates, resolution, limitations (drought, seasons)
 *      Context: CS-023 (S3). Principles: plain language + transparency.
 *      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver */
export default function About() {
  return (
    <main style={{ padding: "1rem" }}>
      <h1>About Chlorosat</h1>
      <p>How to read the map: coming in Sprint 3 (CS-023).</p>
    </main>
  );
}
