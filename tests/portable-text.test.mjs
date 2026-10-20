import { test } from 'node:test';
import assert from 'node:assert/strict';
import { richText } from '../src/lib/portableText.js';

const span = (text, marks = []) => ({ _type: 'span', _key: text, text, marks });
const block = (children, extra = {}) => ({ _type: 'block', _key: 'b', style: 'normal', markDefs: [], children, ...extra });

test('paragraphs and headings render as plain HTML', () => {
  assert.equal(richText([block([span('Hello')]), block([span('Title')], { style: 'h2' })]), '<p>Hello</p><h2>Title</h2>');
});

test('links keep on-site addresses and open external ones in a new tab', () => {
  const on = block([span('desk', ['l1'])], { markDefs: [{ _key: 'l1', _type: 'link', href: '/infrastructure/#artwork' }] });
  const off = block([span('site', ['l2'])], { markDefs: [{ _key: 'l2', _type: 'link', href: 'https://example.com' }] });
  assert.equal(richText([on]), '<p><a href="/infrastructure/#artwork">desk</a></p>');
  assert.equal(richText([off]), '<p><a href="https://example.com" target="_blank" rel="noopener">site</a></p>');
});

test('unsafe link targets are dropped, the text is kept', () => {
  const bad = block([span('click', ['l1'])], { markDefs: [{ _key: 'l1', _type: 'link', href: 'javascript:alert(1)' }] });
  assert.equal(richText([bad]), '<p>click</p>');
});

test('text is escaped', () => {
  assert.equal(richText([block([span('<b>x</b>')])]), '<p>&lt;b&gt;x&lt;/b&gt;</p>');
});

test('a note renders as the site\'s note box, text running on from the title', () => {
  const note = { _type: 'note', _key: 'n', title: 'Decide early.', body: [block([span('Tell us first.')])] };
  assert.equal(richText([note]), '<div class="prose__note" role="note"><strong>Decide early.</strong> Tell us first.</div>');
});

test('a table renders with a header row', () => {
  const table = { _type: 'table', _key: 't', headerRow: true, rows: [{ _key: 'a', cells: ['Film', 'Use'] }, { _key: 'b', cells: ['PET', 'Print'] }] };
  assert.equal(richText([table]), '<div class="prose__table"><table><thead><tr><th>Film</th><th>Use</th></tr></thead><tbody><tr><td>PET</td><td>Print</td></tr></tbody></table></div>');
});

test('a table without a header row puts every row in the body', () => {
  const table = { _type: 'table', _key: 't', headerRow: false, rows: [{ _key: 'a', cells: ['PET'] }] };
  assert.equal(richText([table]), '<div class="prose__table"><table><tbody><tr><td>PET</td></tr></tbody></table></div>');
});
