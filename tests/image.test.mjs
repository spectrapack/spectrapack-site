import { test } from 'node:test';
import assert from 'node:assert/strict';
import { imageAttrs, aspectOf, shareImage } from '../src/lib/image.js';

const sanityImage = (ref, extra = {}) => ({ _type: 'image', asset: { _type: 'reference', _ref: ref }, alt: 'A pouch', ...extra });

test('no image gives null, so the slot shows its placeholder', () => {
  assert.equal(imageAttrs(undefined), null);
  assert.equal(imageAttrs({ _type: 'image' }), null);
});

test('a seed image not yet on disk gives null', () => {
  assert.equal(imageAttrs({ _local: 'about/team-nobody.jpg' }, {}), null);
});

test('a seed image is served from /assets/images with its real size', () => {
  const a = imageAttrs({ _local: 'home/story-01.jpg', alt: 'Operators' }, { 'home/story-01.jpg': { width: 735, height: 480 } });
  assert.deepEqual(a, { src: '/assets/images/home/story-01.jpg', srcset: undefined, width: 735, height: 480, alt: 'Operators' });
});

test('a seed hero image with an -800 version gets a srcset', () => {
  const a = imageAttrs({ _local: 'home/hero-01.jpg' }, { 'home/hero-01.jpg': { width: 1672, height: 941 } });
  assert.equal(a.srcset, '/assets/images/home/hero-01-800.jpg 800w, /assets/images/home/hero-01.jpg 1672w');
});

test('a Sanity image becomes a CDN srcset, never wider than the original', () => {
  const a = imageAttrs(sanityImage('image-abc123-1000x500-jpg'), {}, { widths: [480, 800, 1200] });
  assert.match(a.src, /^https:\/\/cdn\.sanity\.io\/images\/[^/]+\/production\/abc123-1000x500\.jpg\?/);
  assert.match(a.src, /w=800/);
  assert.equal(a.srcset.split(', ').length, 2);
  assert.equal(a.width, 800);
  assert.equal(a.height, 400);
  assert.equal(a.alt, 'A pouch');
});

test('a cropped Sanity image reports the cropped shape', () => {
  const a = imageAttrs(sanityImage('image-abc123-1000x1000-jpg', { crop: { top: 0, bottom: 0.5, left: 0, right: 0 } }), {}, { widths: [800] });
  assert.equal(a.width, 800);
  assert.equal(a.height, 400);
});

test('a small Sanity image is served at its own width', () => {
  const a = imageAttrs(sanityImage('image-abc123-300x200-png'), {}, { widths: [480, 800] });
  assert.equal(a.width, 300);
});

test('SVG logos from Sanity are served untouched', () => {
  const a = imageAttrs(sanityImage('image-logo1-400x100-svg'));
  assert.doesNotMatch(a.src, /\?/);
  assert.equal(a.srcset, undefined);
  assert.equal(aspectOf(sanityImage('image-logo1-400x100-svg')), 4);
});

test('aspectOf falls back to 2:1 when the size is unknown', () => {
  assert.equal(aspectOf(undefined), 2);
});

test('shareImage crops Sanity images to 1200 x 630', () => {
  const s = shareImage(sanityImage('image-abc123-2000x2000-jpg'), new URL('https://www.spectrapack.co.in'));
  assert.match(s.url, /w=1200&h=630/);
  assert.equal(s.width, 1200);
  assert.equal(s.height, 630);
});

test('shareImage gives an absolute URL for seed images', () => {
  const s = shareImage({ _local: 'shared/og-image.jpg' }, new URL('https://www.spectrapack.co.in'), { 'shared/og-image.jpg': { width: 1200, height: 630 } });
  assert.deepEqual(s, { url: 'https://www.spectrapack.co.in/assets/images/shared/og-image.jpg', width: 1200, height: 630 });
});

test('a heavily cropped Sanity image only offers widths the crop can deliver', () => {
  const a = imageAttrs(sanityImage('image-abc123-2000x1000-jpg', { crop: { top: 0, bottom: 0, left: 0, right: 0.75 } }), {}, { widths: [480, 800, 1200] });
  assert.equal(a.width, 480);
  assert.equal(a.srcset.split(', ').length, 1);
});
