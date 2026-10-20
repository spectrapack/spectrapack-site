import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import seed from '../../content/seed.json';
import { IS_CONNECTED } from '../../sanity/env.js';

/**
 * All site content, loaded once per build.
 *
 * Connected to Sanity: every published document is fetched in one query.
 * Not connected (no project id yet): content/seed.json, the same documents
 * the import script uploads, so the site looks identical either way.
 */

const TYPES = [
  'siteSettings', 'homePage', 'aboutPage', 'productsPage', 'industriesPage', 'infrastructurePage',
  'contactPage', 'blogPage', 'legalPage', 'product', 'industry', 'machine', 'client', 'blogPost',
];

/** Lists whose items are linked by their web address; an item without one is skipped. */
const NEEDS_SLUG = new Set(['industry', 'blogPost']);

const PUBLIC_IMAGES = path.resolve('public/assets/images');

let loading;

/** Width and height of every seed image, so <img> tags carry real dimensions. */
async function withLocalDimensions(docs) {
  const files = new Set();
  JSON.stringify(docs, (key, value) => {
    if (key === '_local') files.add(value);
    return value;
  });
  const dims = {};
  await Promise.all([...files].map(async (file) => {
    const full = path.join(PUBLIC_IMAGES, file);
    if (!fs.existsSync(full)) return; // e.g. partner portraits still to come
    const { width, height } = await sharp(full).metadata();
    dims[file] = { width, height };
  }));
  return { docs, dims };
}

async function fetchFromSanity() {
  const { sanityClient } = await import('sanity:client');
  const docs = await sanityClient.fetch(
    '*[_type in $types && !(_id in path("drafts.**"))]',
    { types: TYPES },
    { perspective: 'published' }
  );
  if (!docs.some((d) => d._id === 'siteSettings')) {
    throw new Error('Sanity is connected but has no content yet. Run `npm run import` once to upload it.');
  }
  return { docs, dims: {} };
}

/** In `npm run dev`, refetch after a few seconds so a change published in /admin shows on refresh. */
const DEV_CACHE_MS = 3000;
let loadedAt = 0;

function load() {
  if (import.meta.env.DEV && Date.now() - loadedAt > DEV_CACHE_MS) {
    loading = undefined;
    loadedAt = Date.now();
  }
  loading ??=(IS_CONNECTED ? fetchFromSanity() : withLocalDimensions(seed)).then(({ docs, dims }) => ({
    byId: new Map(docs.map((d) => [d._id, d])),
    docs,
    dims,
  }));
  return loading;
}

/** A one-off page or settings document by its fixed id. */
export async function getDoc(id) {
  const { byId } = await load();
  return byId.get(id) ?? {};
}

/** Every document of a type, in the editor's chosen order. */
export async function listOf(type) {
  const { docs } = await load();
  return docs
    .filter((d) => d._type === type)
    .filter((d) => !NEEDS_SLUG.has(type) || Boolean(d.slug?.current))
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || String(a.title ?? a.name).localeCompare(String(b.title ?? b.name)));
}

/** Follow a reference ({ _ref }) to its document; undefined if it was deleted. */
export async function deref(ref) {
  if (!ref?._ref) return undefined;
  const { byId } = await load();
  return byId.get(ref._ref);
}

export async function localDimensions() {
  return (await load()).dims;
}
