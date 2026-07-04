import { defineConfig } from 'astro/config';

// The deploy workflow injects SITE_URL and BASE_PATH from the GitHub repo context.
// For local dev: npm run dev serves from / automatically.
export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL ?? 'https://example.github.io',
  base: process.env.BASE_PATH ?? '/',
});
