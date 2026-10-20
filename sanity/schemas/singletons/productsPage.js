import { defineType } from 'sanity';
import { str, txt, accent, image, seo, SEO_GROUP } from '../fields.js';

export default defineType({
  name: 'productsPage',
  title: 'Products page',
  type: 'document',
  groups: [{ name: 'top', title: 'Top of page', default: true }, SEO_GROUP],
  fields: [
    accent('title', 'Heading', { group: 'top' }),
    txt('text', 'Paragraph', 2, { group: 'top' }),
    str('searchPlaceholder', 'Text inside the search box', { group: 'top' }),
    image('image', 'Photo', { group: 'top' }),
    seo,
  ],
  preview: { prepare: () => ({ title: 'Products page', subtitle: 'The products themselves are under "Products" in the menu.' }) },
});
