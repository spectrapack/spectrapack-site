import { toHTML, escapeHTML } from '@portabletext/to-html';
import { SAFE_HREF } from './text.js';

/**
 * Rich text (blog articles, legal pages) to HTML, with the site's own
 * note and table blocks. Text is escaped by the renderer; link targets are
 * restricted to web, mail, phone and on-site addresses.
 */


const link = ({ children, value }) => {
  const href = String(value?.href || '');
  if (!SAFE_HREF.test(href)) return children;
  const external = /^https?:/i.test(href);
  return `<a href="${escapeHTML(href)}"${external ? ' target="_blank" rel="noopener"' : ''}>${children}</a>`;
};

/** Inside a note the text runs straight on from the bold title, without a paragraph. */
const inline = { block: { normal: ({ children }) => children }, marks: { link } };

const note = ({ value }) =>
  `<div class="prose__note" role="note"><strong>${escapeHTML(value.title || '')}</strong> ${toHTML(value.body || [], { components: inline })}</div>`;

const table = ({ value }) => {
  const rows = value.rows || [];
  const cells = (row, tag) => (row.cells || []).map((c) => `<${tag}>${escapeHTML(c)}</${tag}>`).join('');
  const [head, ...body] = value.headerRow ? rows : [null, ...rows];
  return `<div class="prose__table"><table>${head ? `<thead><tr>${cells(head, 'th')}</tr></thead>` : ''}<tbody>${body.map((r) => `<tr>${cells(r, 'td')}</tr>`).join('')}</tbody></table></div>`;
};

export const richText = (blocks = []) => toHTML(blocks, { components: { types: { note, table }, marks: { link } } });
