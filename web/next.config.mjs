/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `npm run build` writes plain HTML/CSS/JS to web/out/.
  // No Node server needed on the VPS; nginx just serves the files (decision D1).
  output: "export",

  // Next's image optimizer needs a server, so turn it off for static export.
  images: { unoptimized: true },

  // /about -> /about/index.html, so any static file server finds the page.
  trailingSlash: true,

  // Do not write web/AGENTS.md and web/CLAUDE.md on `next dev`.
  // The real rules live at the repo root.
  agentRules: false,

  // [AI] Lets a phone on the same Wi-Fi use the dev server through this PC's
  //      local IP (e.g. http://192.168.1.23:3000). Next.js 16 blocks dev-only
  //      files (/_next/... chunks, live reload) for any address other than
  //      localhost unless it's listed here, so on a phone the page loaded but
  //      the map's code never arrived ("Loading map..." forever). These cover
  //      the usual home/school private network ranges.
  //      Dev-only: `npm run build` and the live site are unaffected.
  //      Written: 2026-10-05 · Claude Opus 5.5 · requested by David
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],

  // [AI] React's Strict Mode mounts every component twice in `npm run dev`
  //      (on purpose, to catch bugs). For the globe that meant creating the
  //      whole MapLibre map (graphics context, style) twice on every load -
  //      extra startup work that adds up on a phone using the dev server
  //      (David, 2026-10-07). The chlorosat-map-demo had it off too.
  //      Dev-only: the built site never double-mounts either way.
  //      Written: 2026-10-07 · Claude Opus 5.5 · requested by David
  reactStrictMode: false,
};

export default nextConfig;
