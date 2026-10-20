import { defineField, defineType } from 'sanity';
import { accent, str, seo, SEO_GROUP } from '../fields.js';

/** Used twice: Privacy policy and Terms of use. */
export default defineType({
  name: 'legalPage',
  title: 'Legal page',
  type: 'document',
  groups: [{ name: 'page', title: 'Page', default: true }, SEO_GROUP],
  fields: [
    accent('title', 'Heading', { group: 'page' }),
    str('updated', 'Last updated', { group: 'page', description: 'For example 5 October 2026' }),
    defineField({ name: 'body', title: 'Text', type: 'richText', group: 'page' }),
    seo,
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }) => ({ title: String(title || '').replace(/\*/g, '') }) },
});
