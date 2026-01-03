// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://nextara-ai-solutions.com',
  integrations: [
    sitemap({
      filter: (page) => {
        // Exclude diagnostic from sitemap (noindex,follow page should not be in sitemap)
        const url = typeof page === 'string' ? page : page?.toString?.() ?? '';
        return !url.includes('/dcs-diagnostic/');
      },
    }),
  ],
});