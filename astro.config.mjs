// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';
import sanity from '@sanity/astro';
import react from '@astrojs/react';

// astro.config runs before Astro loads .env, so read it here. On Netlify the
// same variables come from the site's environment settings.
const env = { ...loadEnv(process.env.NODE_ENV || 'production', process.cwd(), ''), ...process.env };
const projectId = env.PUBLIC_SANITY_PROJECT_ID || 'not-connected';
const dataset = env.PUBLIC_SANITY_DATASET || 'production';

// Clean addresses: /about/, /blog/<slug>/. The old .html addresses redirect
// to these in public/_redirects.
export default defineConfig({
  site: 'https://www.spectrapack.co.in',
  trailingSlash: 'always',
  build: { format: 'directory' },

  // Do NOT add an Astro `redirects` entry for /admin: with trailingSlash
  // 'always' it points /admin/ at itself (a loop, found on Colortek).
  // Do NOT add vite.optimizeDeps.exclude for Sanity packages: it leaves the
  // admin panel blank. If the dev cache goes stale, run `npm run fresh`.
  // dedupe stops Vite inlining a second React into the Studio bundle, which
  // shows as "Invalid hook call" and a blank /admin in dev.
  //
  // optimizeDeps.include prepares the admin panel's packages when the dev
  // server starts. Without it Vite finds them only when /admin first loads,
  // rebuilds its cache mid-session and the open panel fails with
  // "Failed to fetch dynamically imported module". This is not the forbidden
  // `exclude`; it only makes the preparation happen up front.
  //
  // server.watch.ignored: saving .env made the dev server restart twice at
  // once and crash (ERR_SERVER_ALREADY_LISTEN). After editing .env, stop and
  // rerun `npm run dev` instead.
  vite: {
    resolve: { dedupe: ['react', 'react-dom', 'react/jsx-runtime'] },
    server: { watch: { ignored: ['**/.env', '**/.env.*'] } },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'sanity', 'sanity/structure', '@sanity/vision'],
    },
  },

  integrations: [
    sanity({
      projectId,
      dataset,
      // Content is read at build time; the CDN would only serve staler data.
      useCdn: false,
      studioBasePath: '/admin',
    }),
    react(),
    sitemap({
      filter: (page) => !/\/(admin|thanks)\//.test(page) && !page.endsWith('/404/'),
    }),
  ],
});
