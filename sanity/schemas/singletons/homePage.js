import { defineField, defineType } from 'sanity';
import { str, txt, accent, image, imageItem, link, strings, href, seo, SEO_GROUP } from '../fields.js';
import { STAT_ICONS } from '../../../src/lib/options.js';

const productTile = {
  type: 'object',
  name: 'productTile',
  fields: [
    str('label', 'Label'),
    defineField({ name: 'product', title: 'Product (for the picture)', type: 'reference', to: [{ type: 'product' }] }),
    str('query', 'Search words when clicked', { description: 'Opens the products page searching for these words.' }),
  ],
  preview: { select: { title: 'label', media: 'product.image' } },
};

/** The home page, top to bottom. */
export default defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Top of page', default: true },
    { name: 'story', title: 'What we do' },
    { name: 'clients', title: 'Client logos' },
    { name: 'industries', title: 'Industries' },
    { name: 'finder', title: 'Product finder' },
    { name: 'panel', title: 'Dark panel' },
    { name: 'rest', title: 'Articles & lists' },
    SEO_GROUP,
  ],
  fields: [
    str('heroTitle', 'Headline', { group: 'hero', description: 'A red full stop is added automatically.', validation: (Rule) => Rule.required() }),
    str('heroTitleHidden', 'Headline ending for Google', { group: 'hero', description: 'Not shown on the page. Read by search engines and screen readers after the headline.' }),
    str('heroMarkTop', 'Small words above the big number', { group: 'hero' }),
    str('heroMarkNumber', 'Big number', { group: 'hero', description: 'The number of print colours, for example 9.' }),
    str('heroMarkBottom', 'Small words under the big number', { group: 'hero' }),
    txt('heroText', 'Paragraph', 2, { group: 'hero' }),
    image('heroThumb', 'Small photo beside the paragraph', { group: 'hero' }),
    defineField({ name: 'heroPhotos', title: 'Large photos (they change every few seconds)', type: 'array', group: 'hero', of: [imageItem()], description: 'Two to five landscape photos. Drag to change the order.', validation: (Rule) => Rule.min(1).max(5) }),
    link('heroPrimary', 'First button', { group: 'hero' }),
    link('heroSecondary', 'Red button', { group: 'hero' }),
    image('heroPanelImage', 'Photo in the corner panel', { group: 'hero' }),
    str('heroPanelTitle', 'Corner panel heading', { group: 'hero' }),
    str('heroPanelText', 'Corner panel small text', { group: 'hero' }),
    href('heroPanelHref', 'Corner panel link', { group: 'hero' }),

    accent('storyTitle', 'Heading', { group: 'story' }),
    txt('storyQuote', 'Quote', 3, { group: 'story' }),
    image('storyBackground', 'Background photo', { group: 'story', description: 'Shown faintly behind the text.' }),
    defineField({ name: 'storyCards', title: 'Three photo links', type: 'array', group: 'story', of: [{ type: 'object', name: 'card', fields: [str('title', 'Label'), image('image', 'Photo'), href('href', 'Link')], preview: { select: { title: 'title', media: 'image' } } }], validation: (Rule) => Rule.max(3) }),

    str('clientsCount', 'Big number', { group: 'clients', description: 'For example 100+' }),
    str('clientsCountLabel', 'Words under the number', { group: 'clients' }),
    accent('clientsTitle', 'Heading', { group: 'clients' }),
    txt('clientsLead', 'Paragraph', 2, { group: 'clients', description: 'The logos themselves are under "Client logos" in the menu.' }),

    accent('marketsTitle', 'Heading', { group: 'industries' }),
    str('marketsKicker', 'Red line under the heading', { group: 'industries' }),
    txt('marketsLead', 'Paragraph', 3, { group: 'industries', description: 'The industry cards come from "Industries" in the menu.' }),

    str('finderTitle', 'Heading', { group: 'finder' }),
    str('finderPlaceholder', 'Text inside the search box', { group: 'finder' }),
    str('finderQuestion', 'Line above the format tiles', { group: 'finder' }),
    defineField({ name: 'finderTiles', title: 'Format tiles', type: 'array', group: 'finder', of: [productTile] }),
    defineField({ name: 'finderChips', title: 'Small material links', type: 'array', group: 'finder', of: [productTile] }),
    link('finderButton', 'Button', { group: 'finder' }),

    accent('panelTitle', 'Heading', { group: 'panel', description: 'Words in *asterisks* show in gold on the dark panel.' }),
    defineField({
      name: 'panelStats', title: 'Numbers', type: 'array', group: 'panel',
      of: [{ type: 'object', name: 'stat', fields: [
        defineField({ name: 'icon', title: 'Icon', type: 'string', options: { list: STAT_ICONS } }),
        str('value', 'Number'), str('unit', 'Unit', { description: 'For example mm or m/min. Can be empty.' }), str('label', 'Label'),
      ], preview: { select: { v: 'value', u: 'unit', l: 'label' }, prepare: ({ v, u, l }) => ({ title: `${v || ''}${u || ''}`, subtitle: l }) } }],
    }),
    txt('panelText', 'Paragraph', 3, { group: 'panel' }),
    link('panelButton', 'Button', { group: 'panel' }),
    image('panelImage', 'Photo', { group: 'panel' }),

    accent('guidesTitle', 'Articles heading', { group: 'rest', description: 'The three articles shown are the first three under "Blog articles".' }),
    link('guidesButton', 'Articles button', { group: 'rest' }),
    accent('fitmentsTitle', 'Fitments heading', { group: 'rest' }),
    strings('fitments', 'Fitments', { group: 'rest' }),
    accent('exportsTitle', 'Export countries heading', { group: 'rest' }),
    defineField({ name: 'exportMarkets', title: 'Export countries', type: 'array', group: 'rest', of: [{ type: 'object', name: 'market', fields: [str('code', 'Two-letter code'), str('name', 'Country')], preview: { select: { title: 'name', subtitle: 'code' } } }] }),
    seo,
  ],
  preview: { prepare: () => ({ title: 'Home page' }) },
});
