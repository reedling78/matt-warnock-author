import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Update `site` once the domain is live so sitemap + canonical URLs are correct.
export default defineConfig({
  site: "https://mattwarnockauthor.com",
  output: "static",
  integrations: [sitemap()],
  build: {
    inlineStylesheets: "auto",
  },
});
