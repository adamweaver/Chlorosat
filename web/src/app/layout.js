import "./globals.css";
import Header from "@/components/Header";

// Page <title> and description (used by browsers + search engines).
// The favicon comes from src/app/icon.svg automatically (Next.js convention).
export const metadata = {
  title: "Chlorosat",
  description: "See and compare vegetation health from satellite data.",
};

/* [AI] Purpose: Shared shell wrapped around every page.
 *      Does:    Renders <html>/<body>, the site header, then the current page.
 *      Context: Next.js App Router root layout. Layout details: CS-014.
 *      Written: 2026-09-22 · Claude Opus 5.5 · requested by Adam Weaver */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
