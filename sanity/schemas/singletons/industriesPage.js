import { defineField, defineType } from 'sanity';
import { str, txt, accent, image, link, strings, seo, SEO_GROUP } from '../fields.js';

export default defineType({
  name: 'industriesPage',
  title: 'Industries page',
  type: 'document',
  groups: [{ name: 'top', title: 'Top of page', default: true }, { name: 'details', title: 'Introduction' }, { name: 'related', title: 'You might need' }, SEO_GROUP],
  fields: [
    str('eyebrow', 'Small heading', { group: 'top' }),
    accent('title', 'Heading', { group: 'top' }),
    image('image', 'Photo (shown in a circle)', { group: 'top' }),
    link('button', 'Button', { group: 'top' }),
    accent('detailsTitle', 'Heading', { group: 'details' }),
    txt('detailsLead', 'First paragraph', 3, { group: 'details' }),
    strings('detailsCopy', 'More paragraphs', { group: 'details', of: [{ type: 'text', rows: 4 }] }),
    accent('sectorsTitle', 'Industries band heading', { group: 'details', description: 'The industry cards come from "Industries" in the menu.' }),
    accent('relatedTitle', 'Heading', { group: 'related' }),
    link('relatedButton', 'Button', { group: 'related' }),
    defineField({ name: 'related', title: 'Products to suggest', type: 'array', group: 'related', of: [{ type: 'object', name: 'suggestion', fields: [
      defineField({ name: 'product', title: 'Product', type: 'reference', to: [{ type: 'product' }] }),
      str('query', 'Search words when clicked'),
    ], preview: { select: { title: 'product.title', media: 'product.image' } } }] }),
    seo,
  ],
  preview: { prepare: () => ({ title: 'Industries page' }) },
});
