/**
 * Small text helpers shared by every template.
 *
 * Editors mark highlighted words with *asterisks*. Text is escaped first, so
 * whatever an editor types can never inject markup into the page.
 */

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** "Packaging by *industry*" -> 'Packaging by <span class="accent">industry</span>' */
export function accent(value, tag = 'span') {
  const open = tag === 'em' ? '<em>' : '<span class="accent">';
  const close = tag === 'em' ? '</em>' : '</span>';
  return escapeHtml(value).replace(/\*([^*]+)\*/g, `${open}$1${close}`);
}

/** The same text with the asterisks removed, for titles and alt text. */
export const plain = (value) => String(value ?? '').replace(/\*/g, '');

/** "+91 91676 61011" with non-breaking spaces so the number never wraps. */
export const nbsp = (value) => escapeHtml(value).replace(/ /g, '&nbsp;');

/** JSON for a <script> block: "<" escaped so editor text can never close the tag. */
export const jsonForScript = (value) =>
  JSON.stringify(value, null, 2).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

/** Web, mail, phone, on-site or same-page addresses. Rejects javascript: and //other-host. */
export const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;

/** "2 / 1" style CSS width that gives logos of any shape the same visual area. */
export const logoWidth = (aspect) => `${Math.min(80, Math.round(35.3 * Math.sqrt(aspect)))}%`;
