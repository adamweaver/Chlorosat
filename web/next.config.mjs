/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `npm run build` writes plain HTML/CSS/JS to web/out/.
  // No Node server needed on the VPS; nginx just serves the files (decision D1).
  output: "export",

  // Next's image optimizer needs a server, so turn it off for static export.
  images: { unoptimized: true },

  // /about -> /about/index.html, so any static file server finds the page.
  trailingSlash: true,
};

export default nextConfig;
