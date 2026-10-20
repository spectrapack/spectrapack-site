import { defineField, defineType } from 'sanity';
import { str, txt, image, strings, order } from '../fields.js';
import { PRODUCT_FORMATS, PRODUCT_FEATURES } from '../../../src/lib/options.js';

/** One product on the products page, with the details shown in its pop-up. */
export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    { name: 'card', title: 'Card', default: true },
    { name: 'details', title: 'Details pop-up' },
    { name: 'filters', title: 'Filters & search' },
  ],
  fields: [
    str('title', 'Product name', { group: 'card', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug', title: 'Short web name', type: 'slug', group: 'card',
      options: { source: 'title', maxLength: 50 },
      validation: (Rule) => Rule.required(),
    }),
    image('image', 'Photo', { group: 'card', validation: (Rule) => Rule.required() }),
    txt('summary', 'One-line description on the card', 2, { group: 'card' }),
    { ...order, group: 'card' },
    txt('about', 'What it is', 4, { group: 'details' }),
    str('listTitle', 'Heading of the first list', { group: 'details', description: 'For example "Why choose it" or "Structures we run".' }),
    strings('listItems', 'First list', { group: 'details' }),
    strings('offer', '"What we offer" list', { group: 'details' }),
    defineField({ name: 'formats', title: 'Format', type: 'array', group: 'filters', of: [{ type: 'string' }], options: { list: PRODUCT_FORMATS, layout: 'grid' } }),
    defineField({ name: 'features', title: 'Features', type: 'array', group: 'filters', of: [{ type: 'string' }], options: { list: PRODUCT_FEATURES, layout: 'grid' } }),
    defineField({ name: 'industries', title: 'Industries it suits', type: 'array', group: 'filters', of: [{ type: 'reference', to: [{ type: 'industry' }] }] }),
    str('keywords', 'Extra search words', { group: 'filters', description: 'Words people might search for that are not in the name, separated by spaces.' }),
  ],
  orderings: [{ title: 'Position', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'summary', media: 'image' } },
});
