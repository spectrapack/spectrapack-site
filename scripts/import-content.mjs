/**
 * One-time upload of content/seed.json into Sanity: uploads every image the
 * seed points at, then writes all documents with their fixed ids.
 *
 *   npm run import            refuses if Sanity already has content
 *   npm run import -- --force overwrites it (wipes any edits made in /admin)
 *
 * Needs PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN in .env.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';
import { linkImages } from './lib/link-images.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const IMAGES = path.join(ROOT, 'public/assets/images');
const force = process.argv.includes('--force');

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_WRITE_TOKEN;
if (!projectId) fail('PUBLIC_SANITY_PROJECT_ID is missing from .env');
if (!/^[a-z0-9-]+$/.test(projectId)) fail('PUBLIC_SANITY_PROJECT_ID does not look like a Sanity project id');
if (!token) fail('SANITY_WRITE_TOKEN is missing from .env (see .env.example)');

const client = createClient({
  projectId,
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  token,
  useCdn: false,
});

const seed = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/seed.json'), 'utf8'));

/** Upload each distinct image file once; returns { 'home/hero-01.jpg': 'image-abc-1920x1080-jpg' }. */
async function uploadImages(docs) {
  const files = new Set();
  JSON.stringify(docs, (key, value) => {
    if (key === '_local') files.add(value);
    return value;
  });

  const assets = {};
  const skipped = [];
  for (const file of [...files].sort()) {
    const full = path.join(IMAGES, file);
    if (!fs.existsSync(full)) {
      skipped.push(file);
      continue;
    }
    const asset = await client.assets.upload('image', fs.createReadStream(full), { filename: path.basename(file) });
    assets[file] = asset._id;
    process.stdout.write(`  uploaded ${file}\n`);
  }
  return { assets, skipped };
}

async function main() {
  const existing = await client.fetch('count(*[_id == "siteSettings"])');
  if (existing && !force) {
    fail('Sanity already has content. Re-running would overwrite edits made in /admin.\n  If that is really what you want: npm run import -- --force');
  }

  console.log(`Uploading images to project ${projectId}…`);
  const { assets, skipped } = await uploadImages(seed);

  const docs = seed.map((doc) => linkImages(doc, assets));
  const tx = docs.reduce((t, doc) => t.createOrReplace(doc), client.transaction());
  await tx.commit({ visibility: 'sync' });

  console.log(`\n✓ ${docs.length} documents and ${Object.keys(assets).length} images imported.`);
  if (skipped.length) {
    console.log(`  Left empty (no file yet): ${skipped.join(', ')}`);
  }
}

main().catch((err) => fail(err.message || String(err)));
