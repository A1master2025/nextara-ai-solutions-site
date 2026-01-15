// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://nextara-ai-solutions.com",
  integrations: [
    sitemap({
      filter: (page) => {
        // `page` can be a string path or a URL-like object depending on integration internals.
        // Normalize to a clean pathname string and strip trailing slash.
        const pathname = String(page).replace(/\/$/, "");

        // Exclude these paths from sitemap output:
        return (
          !pathname.startsWith("/dcs-diagnostic") &&
          !pathname.startsWith("/dcs-core")
        );
      },
    }),
  ],
});
