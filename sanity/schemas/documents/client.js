import { defineType, defineField } from 'sanity';
import { str, order } from '../fields.js';

/** A client logo for the "Trusted by" wall on the home page. */
export default defineType({
  name: 'client',
  title: 'Client logo',
  type: 'document',
  fields: [
    str('name', 'Company name', { validation: (Rule) => Rule.required() }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description: 'An SVG or a PNG with a transparent background works best. The site sizes every logo automatically so wide and square logos look balanced.',
      validation: (Rule) => Rule.required(),
    }),
    order,
  ],
  orderings: [{ title: 'Position', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', media: 'logo' } },
});
