import Link from "next/link";

/* [AI] Purpose: Site header shown on every page (branding + navigation).
 *      Does:    Minimal placeholder: site name + links to Map and About.
 *      Context: TODO(CS-014, Lucas): logo (src/app/icon.svg), styling from
 *               globals.css tokens, phone layout. Keep branding restrained.
 *      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver */
export default function Header() {
  return (
    <header style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border)" }}>
      <Link href="/">Chlorosat</Link> · <Link href="/about/">About</Link>
    </header>
  );
}
