import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// `site` drives canonical URLs, og:url, og:image absolute URLs and the sitemap.
// It MUST point at a host that actually resolves, or link previews break.
// Custom domain connected 2026-09-07. Keep in sync with SITE.domain in
// src/config.ts and the Sitemap line in public/robots.txt.
export default defineConfig({
  site: "https://mattwarnockauthor.com",
  output: "static",
  // Firebase Hosting has cleanUrls on, so /about/ 301s to /about. Telling Astro
  // "never" keeps the sitemap and canonical tags on the URL that actually serves
  // a 200 instead of one that redirects.
  trailingSlash: "never",
  integrations: [sitemap()],
  build: {
    inlineStylesheets: "auto",
  },
});
