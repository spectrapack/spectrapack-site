import { test } from 'node:test';
import assert from 'node:assert/strict';
import { linkImages } from '../scripts/lib/link-images.mjs';

const assets = { 'home/hero-01.jpg': 'image-a-10x10-jpg', 'home/hero-02.jpg': 'image-b-10x10-jpg' };

test('a seed image becomes a Sanity asset reference and keeps its description', () => {
  const out = linkImages({ heroThumb: { _type: 'image', _local: 'home/hero-01.jpg', alt: 'Press' } }, assets);
  assert.deepEqual(out, { heroThumb: { _type: 'image', alt: 'Press', asset: { _type: 'reference', _ref: 'image-a-10x10-jpg' } } });
});

test('images with no uploaded file are removed, from fields and from lists', () => {
  const doc = {
    photo: { _type: 'image', _local: 'about/missing.jpg' },
    gallery: [{ _type: 'image', _key: 'x', _local: 'home/hero-02.jpg' }, { _type: 'image', _key: 'y', _local: 'about/missing.jpg' }],
  };
  const out = linkImages(doc, assets);
  assert.equal('photo' in out, false);
  assert.equal(out.gallery.length, 1);
  assert.equal(out.gallery[0].asset._ref, 'image-b-10x10-jpg');
});

test('nested images inside list items are linked', () => {
  const out = linkImages({ team: [{ _key: 'a', name: 'A', photo: { _type: 'image', _local: 'home/hero-01.jpg' } }] }, assets);
  assert.equal(out.team[0].photo.asset._ref, 'image-a-10x10-jpg');
  assert.equal(out.team[0].name, 'A');
});

test('the input is not changed', () => {
  const doc = { img: { _type: 'image', _local: 'home/hero-01.jpg' } };
  linkImages(doc, assets);
  assert.equal(doc.img._local, 'home/hero-01.jpg');
});
