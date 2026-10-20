import { defineField, defineType } from 'sanity';
import { str, txt, accent, image, href, seo, SEO_GROUP } from '../fields.js';

export default defineType({
  name: 'aboutPage',
  title: 'About page',
  type: 'document',
  groups: [
    { name: 'vision', title: 'Vision', default: true },
    { name: 'intro', title: 'Introduction' },
    { name: 'overview', title: 'At a glance' },
    { name: 'business', title: 'What we run' },
    { name: 'history', title: 'Milestones' },
    { name: 'team', title: 'People' },
    SEO_GROUP,
  ],
  fields: [
    str('visionEyebrow', 'Small heading', { group: 'vision' }),
    accent('visionStatement', 'Vision statement', { group: 'vision' }),
    image('visionImage', 'Background photo', { group: 'vision', description: 'Shown faintly behind the statement.' }),
    accent('introTitle', 'Heading', { group: 'intro' }),
    defineField({ name: 'introParagraphs', title: 'Paragraphs', type: 'array', group: 'intro', of: [{ type: 'object', name: 'para', fields: [
      txt('text', 'Text', 3),
      defineField({ name: 'style', title: 'Style', type: 'string', initialValue: 'normal', options: { list: [{ title: 'Normal', value: 'normal' }, { title: 'Bold', value: 'bold' }, { title: 'Red', value: 'accent' }], layout: 'radio', direction: 'horizontal' } }),
    ], preview: { select: { title: 'text', subtitle: 'style' } } }] }),
    image('introImage', 'Photo', { group: 'intro' }),
    accent('overviewTitle', 'Heading', { group: 'overview' }),
    txt('overviewLead', 'Paragraph', 2, { group: 'overview' }),
    image('overviewImage', 'Wide photo of the plant', { group: 'overview' }),
    defineField({ name: 'numbers', title: 'Numbers', type: 'array', group: 'overview', of: [{ type: 'object', name: 'figure', fields: [str('value', 'Number'), str('unit', 'Unit (small text)'), str('label', 'Label')], preview: { select: { v: 'value', u: 'unit', l: 'label' }, prepare: ({ v, u, l }) => ({ title: `${v || ''} ${u || ''}`, subtitle: l }) } }] }),
    accent('businessTitle', 'Heading', { group: 'business' }),
    txt('businessText', 'Paragraph', 3, { group: 'business' }),
    defineField({ name: 'stages', title: 'Process cards', type: 'array', group: 'business', of: [{ type: 'object', name: 'stage', fields: [str('step', 'Step number'), str('title', 'Title'), str('meta', 'Small text'), image('image', 'Photo'), href('href', 'Link')], preview: { select: { title: 'title', subtitle: 'meta', media: 'image' } } }] }),
    accent('sectorsTitle', 'Industries heading', { group: 'business' }),
    txt('sectorsLead', 'Industries paragraph', 2, { group: 'business' }),
    txt('milestonesLead', 'Heading', 2, { group: 'history' }),
    defineField({ name: 'milestones', title: 'Milestones', type: 'array', group: 'history', of: [{ type: 'object', name: 'milestone', fields: [str('year', 'Year'), str('title', 'Heading'), txt('text', 'Text', 3), image('image', 'Photo')], preview: { select: { title: 'year', subtitle: 'title', media: 'image' } } }] }),
    accent('teamTitle', 'Heading', { group: 'team' }),
    defineField({ name: 'team', title: 'People', type: 'array', group: 'team', of: [{ type: 'object', name: 'person', fields: [str('name', 'Name'), str('role', 'Role'), image('photo', 'Photo', { description: 'A real portrait, upright (4 × 5).' })], preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } } }] }),
    txt('teamNote', 'Line under the people', 2, { group: 'team' }),
    seo,
  ],
  preview: { prepare: () => ({ title: 'About page' }) },
});
