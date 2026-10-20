import { defineType } from 'sanity';
import { str, txt, image, strings, order } from '../fields.js';

/** A machine in the plant. Placed under a process step on the Infrastructure page. */
export default defineType({
  name: 'machine',
  title: 'Machine',
  type: 'document',
  fields: [
    str('title', 'Machine name', { validation: (Rule) => Rule.required() }),
    image('image', 'Photo'),
    txt('description', 'What it does, in plain words', 3),
    strings('specs', 'Specifications', { description: 'Short tags, for example "1,200 mm" or "300 m/min".' }),
    order,
  ],
  orderings: [{ title: 'Position', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'description', media: 'image' } },
});
