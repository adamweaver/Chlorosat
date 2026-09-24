"use client"; 
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import styles from "@/css/Header.module.css";

/* [AI] Purpose: Site header shown on every page (branding + navigation).
 *      Does:    Full-width black bar in normal flow: logo + name (home) on the left,
 *               Map and About on the right, with the current page marked.
 *      Context: CS-014. Styles: src/css/Header.module.css. Brand green only as an accent.
 *      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · glass pill with logo
 *      Edited:  2026-09-23 · Grok 4.7 · full-width black bar; dropped the floating pill
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · CSS module */
export default function Header() {
  const path = (usePathname() || "/").replace(/\/$/, "") || "/"; // "/about/" and "/about" are the same page.
  const onAbout = path === "/about";

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link href="/" className={styles.brand}>
          <Image src="/icon.svg" alt="" width={26} height={26} priority />
          <span>Chlorosat</span>
        </Link>
        <nav aria-label="Main">
          <Link href="/" aria-current={onAbout ? undefined : "page"}>
            Map
          </Link>
          <Link href="/about/" aria-current={onAbout ? "page" : undefined}>
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
