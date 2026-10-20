import { defineField, defineType } from 'sanity';
import { str, txt, image, strings, order, seo, SEO_GROUP } from '../fields.js';
import { BLOG_CATEGORIES } from '../../../src/lib/options.js';

/** A blog article. The newest (lowest position number) is featured at the top of the blog. */
export default defineType({
  name: 'blogPost',
  title: 'Blog article',
  type: 'document',
  groups: [{ name: 'article', title: 'Article', default: true }, SEO_GROUP],
  fields: [
    str('title', 'Headline', { group: 'article', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug', title: 'Web address', type: 'slug', group: 'article',
      options: { source: 'title', maxLength: 70 },
      description: 'The end of the address, for example /blog/your-article/. Click Generate after writing the headline.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'category', title: 'Category', type: 'string', group: 'article', options: { list: BLOG_CATEGORIES, layout: 'radio' }, description: 'Decides which filter button shows the article.' }),
    strings('tags', 'Small labels above the headline', { group: 'article', description: 'Usually two, for example "Materials" and "Shelf life".' }),
    txt('excerpt', 'Summary', 3, { group: 'article', description: 'Shown on the cards and under the headline.' }),
    defineField({ name: 'readMinutes', title: 'Reading time (minutes)', type: 'number', group: 'article', initialValue: 3 }),
    defineField({ name: 'publishedAt', title: 'Publication date', type: 'date', group: 'article' }),
    image('image', 'Cover photo', { group: 'article', validation: (Rule) => Rule.required() }),
    defineField({ name: 'body', title: 'Article', type: 'richText', group: 'article' }),
    defineField({
      name: 'related', title: 'Articles to suggest at the end', type: 'array', group: 'article',
      of: [{ type: 'reference', to: [{ type: 'blogPost' }] }],
      description: 'Up to three. Left empty, the first three other articles are shown.',
      validation: (Rule) => Rule.max(3).unique(),
    }),
    { ...order, group: 'article' },
    seo,
  ],
  orderings: [{ title: 'Position', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'excerpt', media: 'image' } },
});
