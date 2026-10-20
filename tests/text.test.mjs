import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accent, escapeHtml, plain, nbsp, logoWidth } from '../src/lib/text.js';

test('accent turns *words* into the red accent span', () => {
  assert.equal(accent('Packaging by *industry*'), 'Packaging by <span class="accent">industry</span>');
});

test('accent can use <em> for the dark panel', () => {
  assert.equal(accent('Four steps, *one roof.*', 'em'), 'Four steps, <em>one roof.</em>');
});

test('accent escapes editor text before adding markup', () => {
  assert.equal(accent('<script>x</script> *ok*'), '&lt;script&gt;x&lt;/script&gt; <span class="accent">ok</span>');
});

test('escapeHtml handles quotes, ampersands and empty values', () => {
  assert.equal(escapeHtml(`a & "b" 'c'`), 'a &amp; &quot;b&quot; &#39;c&#39;');
  assert.equal(escapeHtml(undefined), '');
});

test('plain removes the asterisks', () => {
  assert.equal(plain('Privacy *policy*'), 'Privacy policy');
});

test('nbsp keeps a phone number on one line', () => {
  assert.equal(nbsp('+91 91676 61011'), '+91&nbsp;91676&nbsp;61011');
});

test('logoWidth gives every logo the same visual area, capped at 80%', () => {
  assert.equal(logoWidth(1), '35%');
  assert.equal(logoWidth(2.1), '51%');
  assert.equal(logoWidth(4.09), '71%');
  assert.equal(logoWidth(20), '80%');
});

import { jsonForScript, SAFE_HREF } from '../src/lib/text.js';

test('jsonForScript stops editor text from closing the script tag', () => {
  const out = jsonForScript({ description: '</script><script>alert(1)</script>' });
  assert.doesNotMatch(out, /<\/script/i);
  assert.equal(JSON.parse(out).description, '</script><script>alert(1)</script>');
});

test('SAFE_HREF allows site, web, mail and phone links only', () => {
  for (const ok of ['/products/', '#enquiry', 'https://wa.me/1', 'mailto:a@b.in', 'tel:+91']) assert.ok(SAFE_HREF.test(ok), ok);
  for (const bad of ['javascript:alert(1)', '//evil.example', 'products/', 'data:text/html,x']) assert.ok(!SAFE_HREF.test(bad), bad);
});
