import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { schemaTypes } from '../sanity/schemas/index.js';

/**
 * content/seed.json is what gets imported into Sanity, so it must match the
 * schema exactly: every field declared, every list item of an allowed type.
 * The admin panel flags anything else as invalid.
 */
const byName = Object.fromEntries(schemaTypes.map((t) => [t.name, t]));
const docs = JSON.parse(fs.readFileSync(new URL('../content/seed.json', import.meta.url), 'utf8'));
const resolve = (t) => (t && !t.fields && !t.of && byName[t.type] ? byName[t.type] : t);
const IMAGE_KEYS = ['asset', 'crop', 'hotspot'];

function check(value, type, where, problems) {
  type = resolve(type);
  if (!type || value == null || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    const members = type.of || [];
    const allowed = members.map((m) => m.name || m.type);
    value.forEach((item, i) => {
      if (!item || typeof item !== 'object') return;
      if (!allowed.includes(item._type)) problems.push(`${where}[${i}]: item type ${item._type ?? '(missing)'}, allowed ${allowed.join(', ')}`);
      if (!item._key) problems.push(`${where}[${i}]: missing _key`);
      const member = members.find((m) => (m.name || m.type) === item._type);
      if (member && item._type !== 'block') check(item, member, `${where}[${i}]`, problems);
    });
    return;
  }
  if (['reference', 'slug', 'block'].includes(type.type)) return;
  const fields = type.fields || [];
  for (const [k, v] of Object.entries(value)) {
    if (k.startsWith('_') || (type.type === 'image' && IMAGE_KEYS.includes(k))) continue;
    const f = fields.find((x) => x.name === k);
    if (!f) problems.push(`${where}.${k}: not in the schema`);
    else check(v, f, `${where}.${k}`, problems);
  }
}

test('every seed document has a schema type', () => {
  assert.deepEqual(docs.filter((d) => !byName[d._type]).map((d) => d._id), []);
});

test('every seed field and list item matches the schema', () => {
  const problems = [];
  for (const d of docs) check(d, byName[d._type], d._id, problems);
  assert.deepEqual(problems, []);
});
