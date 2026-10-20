import { defineField, defineType } from 'sanity';
import { str, txt, image, order } from '../fields.js';

/** A sector Spectra Pack makes packaging for. Shown on the home page, About and Industries. */
export default defineType({
  name: 'industry',
  title: 'Industry',
  type: 'document',
  fields: [
    str('title', 'Name', { validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Short web name',
      type: 'slug',
      options: { source: 'title', maxLength: 40 },
      description: 'Used in links such as /industries/#food. Click Generate after typing the name.',
      validation: (Rule) => Rule.required(),
    }),
    image('image', 'Photo', { validation: (Rule) => Rule.required() }),
    txt('text', 'Short description', 3),
    order,
  ],
  orderings: [{ title: 'Position', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', media: 'image' } },
});
