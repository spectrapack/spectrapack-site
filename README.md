# spectrapack.co.in

The Spectra Pack website. Astro builds plain HTML; every word and picture comes from Sanity, edited at `/admin`. Hosted on Netlify. Enquiries go to Netlify Forms and are never stored in Sanity, because Sanity's free plan keeps content public.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321 (admin panel: /admin/)
npm run build      # writes dist/
npm test           # unit tests for the helpers and the import step
```

With no `.env`, the site builds from `content/seed.json`, so it runs before Sanity is connected. Copy `.env.example` to `.env` and set `PUBLIC_SANITY_PROJECT_ID` to build from Sanity instead.

If `/admin` goes blank in dev after a schema change, run `npm run fresh`.

## Where things live

| Path | What it is |
| --- | --- |
| `src/pages/` | One file per page; `blog/[slug].astro` makes every article |
| `src/layouts/Base.astro` | Head, header, mobile menu, footer, WhatsApp button |
| `src/lib/content.js` | Loads content from Sanity, or from the seed when not connected |
| `src/lib/image.js` | Image sizes and Sanity CDN addresses |
| `sanity/schemas/` | What editors can change, split into one-off pages (`singletons/`) and lists (`documents/`) |
| `sanity.config.js` | Admin panel: sidebar order, protected pages, "Start here" and "Enquiries" screens |
| `public/assets/` | CSS, JavaScript, icons and the seed images |
| `content/seed.json` | The original content, generated from the static site by `npm run extract` |
| `scripts/import-content.mjs` | One-time upload of the seed into Sanity |

Words in `*asterisks*` show in the red accent colour (gold on the dark panel).

## Connecting Sanity (once)

1. Put the project id in `.env` and in Netlify → Site configuration → Environment variables (`PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET=production`).
2. Create an Editor token in sanity.io/manage → API → Tokens, put it in `.env` as `SANITY_WRITE_TOKEN`, run `npm run import`, then delete the token.
3. In sanity.io/manage → API → CORS origins, add `http://localhost:4321` and the live address, both with credentials allowed.
4. In Netlify → Build & deploy → Build hooks, create a hook. In sanity.io/manage → API → Webhooks, add it as the URL for create, update and delete on the `production` dataset. Publishing then rebuilds the site in about a minute.
5. In Netlify → Forms → Form notifications, add the sales email for the `enquiry` form.

The import refuses to run once content exists, because it would overwrite the client's edits. `npm run import -- --force` overrides that.

## Things not to change

- No Astro `redirects` entry and no `/admin → /admin/` rule in `_redirects`: both cause redirect loops on the admin panel.
- No `vite.optimizeDeps.exclude` for Sanity packages: the admin panel renders blank.
- No `buildLegacyTheme` in `sanity.config.js`: it breaks the admin panel's layout.
