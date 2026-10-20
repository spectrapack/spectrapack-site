import { defineType } from 'sanity';
import { accent, txt, seo, SEO_GROUP } from '../fields.js';

export default defineType({
  name: 'blogPage',
  title: 'Blog page',
  type: 'document',
  groups: [{ name: 'page', title: 'Page', default: true }, SEO_GROUP],
  fields: [
    accent('title', 'Heading', { group: 'page' }),
    txt('text', 'Paragraph', 2, { group: 'page' }),
    accent('listTitle', 'Heading above the articles', { group: 'page' }),
    seo,
  ],
  preview: { prepare: () => ({ title: 'Blog page', subtitle: 'The articles are under "Blog articles" in the menu.' }) },
});
