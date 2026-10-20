import { defineField, defineType } from 'sanity';
import { str, txt, accent, image, link, strings, checklist, seo, SEO_GROUP } from '../fields.js';

export default defineType({
  name: 'infrastructurePage',
  title: 'Infrastructure page',
  type: 'document',
  groups: [
    { name: 'top', title: 'Top of page', default: true },
    { name: 'artwork', title: 'Artwork' },
    { name: 'process', title: 'Process & machinery' },
    { name: 'quality', title: 'Quality' },
    SEO_GROUP,
  ],
  fields: [
    str('eyebrow', 'Small heading', { group: 'top' }),
    accent('title', 'Heading', { group: 'top' }),
    image('image', 'Photo (shown in a circle)', { group: 'top' }),
    link('button', 'Button', { group: 'top' }),
    accent('artworkTitle', 'Heading', { group: 'artwork' }),
    txt('artworkText', 'Paragraph', 3, { group: 'artwork' }),
    image('artworkImage', 'Photo', { group: 'artwork' }),
    checklist('artworkChecklist', 'Checklist', { group: 'artwork' }),
    accent('processTitle', 'Heading', { group: 'process' }),
    txt('processLead', 'Paragraph', 3, { group: 'process' }),
    defineField({
      name: 'steps', title: 'Steps', type: 'array', group: 'process',
      of: [{
        type: 'object', name: 'step',
        fields: [
          str('number', 'Step number', { description: 'For example 01' }),
          str('tag', 'Small label', { description: 'For example PRINT' }),
          str('anchor', 'Link name', { description: 'Used in links such as /infrastructure/#print. Lowercase, no spaces.' }),
          str('title', 'Heading'),
          txt('text', 'Paragraph', 3),
          txt('why', 'Note beside the red line', 3),
          strings('specs', 'Specification tags'),
          image('image', 'Photo'),
          defineField({ name: 'machines', title: 'Machines used in this step', type: 'array', of: [{ type: 'reference', to: [{ type: 'machine' }] }], description: 'The machines themselves are under "Machines" in the menu.' }),
        ],
        preview: { select: { n: 'number', t: 'title', media: 'image' }, prepare: ({ n, t, media }) => ({ title: `${n || ''} ${t || ''}`, media }) },
      }],
    }),
    accent('qualityTitle', 'Heading', { group: 'quality' }),
    txt('qualityText', 'Paragraph', 3, { group: 'quality' }),
    image('qualityImage', 'Photo', { group: 'quality' }),
    checklist('qualityChecklist', 'Checklist', { group: 'quality' }),
    seo,
  ],
  preview: { prepare: () => ({ title: 'Infrastructure page' }) },
});
