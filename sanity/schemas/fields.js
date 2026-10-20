import { defineField } from 'sanity';
import { SAFE_HREF } from '../../src/lib/text.js';

/**
 * Small field builders so every schema reads the same way and every image carries
 * its description (alt text) with it.
 */
export const ACCENT_HELP = 'Wrap words in *asterisks* to show them in red, for example: Packaging by *industry*';

/** Blocks publishing a link the site would refuse to render (javascript:, missing slash). */
export const hrefRule = (Rule) =>
  Rule.custom((value) =>
    !value || SAFE_HREF.test(value) ? true : 'Start with / for a page on this site (for example /products/), or https:// for another website.'
  );

/** A text field holding a link. */
export const href = (name, title, extra = {}) => str(name, title, { validation: hrefRule, ...extra });

export const str = (name, title, extra = {}) => defineField({ name, title, type: 'string', ...extra });
export const txt = (name, title, rows = 3, extra = {}) => defineField({ name, title, type: 'text', rows, ...extra });
export const accent = (name, title, extra = {}) => str(name, title, { description: ACCENT_HELP, ...extra });
export const strings = (name, title, extra = {}) => defineField({ name, title, type: 'array', of: [{ type: 'string' }], ...extra });
export const link = (name, title, extra = {}) => defineField({ name, title, type: 'link', ...extra });
export const order = defineField({
  name: 'order',
  title: 'Position in lists',
  type: 'number',
  description: 'Lower numbers come first. Use 1, 2, 3 and so on.',
  validation: (Rule) => Rule.min(0),
});

export const image = (name, title, extra = {}) =>
  defineField({
    name,
    title,
    type: 'image',
    options: { hotspot: true },
    fields: [
      defineField({
        name: 'alt',
        title: 'Image description',
        type: 'string',
        description: 'What the picture shows, for people who cannot see it and for Google.',
      }),
    ],
    ...extra,
  });

/** One picture in a list of pictures. Unnamed, so stored items keep _type "image". */
export const imageItem = (extra = {}) => {
  const { name, ...rest } = image('image', 'Photo', extra);
  return rest;
};

export const seo = defineField({ name: 'seo', title: 'Search & social', type: 'seo', group: 'seo' });
export const SEO_GROUP = { name: 'seo', title: 'Search & social' };

/** A list of reusable "title + text" rows, used by checklists. */
export const checklist = (name, title, extra = {}) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [{
      type: 'object',
      name: 'checkItem',
      fields: [str('title', 'Heading'), txt('text', 'Text', 2)],
      preview: { select: { title: 'title', subtitle: 'text' } },
    }],
    ...extra,
  });
