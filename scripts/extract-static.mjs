/**
 * One-off: lift every piece of content out of the static site (../spectrapack) into
 * content/seed.json, shaped exactly like the Sanity documents.
 *
 * The seed has two jobs:
 *   1. Until Sanity is connected, the Astro site renders from it, so the new site can be
 *      checked page by page against the static one.
 *   2. scripts/import-content.mjs uploads it into Sanity, so the client opens the admin
 *      panel and finds their real site, not empty forms.
 *
 *   npm run extract
 */
import * as cheerio from 'cheerio';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { htmlToPortableText } from './lib/html-to-portable-text.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const STATIC = join(HERE, '..', '..', 'spectrapack');
const OUT = join(HERE, '..', 'content', 'seed.json');

const load = (file) => cheerio.load(readFileSync(join(STATIC, file), 'utf8'), { decodeEntities: true });

/* ---------------------------------------------------------------- helpers */
const clean = (s) => String(s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const text = ($, el) => clean($(el).text());

/** Inner HTML with accent spans and <em> turned into *asterisks*, every other tag dropped. */
function marked($, el) {
  const html = ($(el).html() || '')
    .replace(/<span class="visually-hidden">[\s\S]*?<\/span>/g, '')
    .replace(/<span class="accent">([\s\S]*?)<\/span>/g, '*$1*')
    .replace(/<em>([\s\S]*?)<\/em>/g, '*$1*')
    .replace(/<[^>]+>/g, '');
  return clean(cheerio.load(`<p>${html}</p>`)('p').text()).replace(/\*\s*\.\s*\*$/, '').replace(/\*\.\*$/, '');
}

/** Static links become the new clean addresses: about.html -> /about/, blog/x.html -> /blog/x/. */
export function toNewUrl(href) {
  if (!href || /^(https?:|mailto:|tel:|#)/.test(href)) return href;
  const [path, rest = ''] = href.replace(/^\.\.\//, '').replace(/^\//, '').split(/(?=[?#])/);
  const tail = href.includes('?') || href.includes('#') ? href.slice(href.search(/[?#]/)) : '';
  if (path === 'index.html' || path === '') return '/' + tail;
  return '/' + path.replace(/\.html$/, '/') + tail;
}

function image($, el, fallbackAlt = '') {
  const img = $(el).is('img') ? $(el) : $(el).find('img').first();
  if (!img.length) return null;
  const src = img.attr('src') || img.attr('data-hero-src') || '';
  const local = src.replace(/^(\.\.\/|\/)?assets\/images\//, '');
  return { _type: 'image', _local: local, alt: clean(img.attr('alt')) || fallbackAlt };
}

const key = (() => { let n = 0; return () => `k${(n++).toString(36)}`; })();
const keyed = (items) => items.map((item) => (typeof item === 'object' ? { _key: key(), ...item } : item));
const ref = (id) => ({ _type: 'reference', _ref: id, _key: key() });

const seoOf = ($) => ({
  title: clean($('title').text()),
  description: clean($('meta[name="description"]').attr('content')),
});

const docs = [];
const push = (doc) => { docs.push(doc); return doc; };

/* ---------------------------------------------------------------- industries */
const ind = load('industries.html');
const industryIds = [];
ind('.subcard').each((i, el) => {
  const slug = ind(el).attr('id');
  industryIds.push(slug);
  push({
    _id: `industry-${slug}`, _type: 'industry', order: i + 1,
    title: text(ind, ind(el).find('.subcard__title')),
    slug: { _type: 'slug', current: slug },
    image: image(ind, ind(el).find('.media')),
    text: text(ind, ind(el).find('.subcard__text')),
  });
});

/* ---------------------------------------------------------------- products */
const prod = load('products.html');
const productByImage = {};
prod('.product-card').each((i, el) => {
  const card = prod(el);
  const img = image(prod, card.find('.media'));
  const slug = img._local.replace(/^products\//, '').replace(/\.jpg$/, '');
  const detail = card.find('[data-product-detail]');
  const lists = detail.find('ul');
  const id = `product-${slug}`;
  productByImage[img._local] = id;
  push({
    _id: id, _type: 'product', order: i + 1,
    title: text(prod, card.find('.product-card__title')),
    slug: { _type: 'slug', current: slug },
    image: img,
    summary: text(prod, card.find('.product-card__text')),
    formats: (card.attr('data-format') || '').split(/\s+/).filter(Boolean),
    features: (card.attr('data-feature') || '').split(/\s+/).filter(Boolean),
    industries: (card.attr('data-industry') || '').split(/\s+/).filter(Boolean).map((s) => ref(`industry-${s}`)),
    keywords: clean(card.attr('data-keywords')),
    about: text(prod, detail.find('p').first()),
    listTitle: text(prod, detail.find('h4').first()),
    listItems: lists.eq(0).find('li').map((_, li) => text(prod, li)).get(),
    offer: lists.eq(1).find('li').map((_, li) => text(prod, li)).get(),
  });
});

/* ---------------------------------------------------------------- machines */
const infra = load('infrastructure.html');
const machineIdByTitle = {};
infra('.machine').each((i, el) => {
  const m = infra(el);
  const title = text(infra, m.find('.machine__title'));
  const slug = image(infra, m.find('.media'))._local.replace(/^infrastructure\/machine-/, '').replace(/\.jpg$/, '');
  machineIdByTitle[title] = `machine-${slug}`;
  push({
    _id: `machine-${slug}`, _type: 'machine', order: i + 1,
    title, image: image(infra, m.find('.media')),
    description: text(infra, m.find('.machine__plain')),
    specs: m.find('.specs li').map((_, li) => text(infra, li)).get(),
  });
});

/* ---------------------------------------------------------------- client logos */
const home = load('index.html');
home('.clients__grid .media--logo').each((i, el) => {
  const img = home(el).find('img');
  const file = img.attr('src').replace(/^assets\/images\//, '');
  push({
    _id: `client-${file.replace(/^clients\//, '').replace(/\.svg$/, '')}`, _type: 'client', order: i + 1,
    name: clean(img.attr('alt')), logo: { _type: 'image', _local: file },
  });
});

/* ---------------------------------------------------------------- blog posts */
/** HTML line breaks and indentation are not text: collapse them, and trim each block's ends. */
function tidyBlock(block) {
  if (block._type === 'note') return { ...block, body: block.body.map(tidyBlock) };
  if (block._type !== 'block') return block;
  const last = block.children.length - 1;
  const children = block.children
    .map((span, i) => {
      let t = span.text.replace(/\s+/g, ' ');
      if (i === 0) t = t.trimStart();
      if (i === last) t = t.trimEnd();
      return { ...span, text: t };
    })
    .filter((span) => span.text);
  return { ...block, children };
}

function proseToBlocks($, prose, prefix) {
  const blocks = [];
  let n = 0;
  prose.children().each((_, child) => {
    const c = $(child);
    if (c.is('.prose__note')) {
      const title = text($, c.find('strong').first());
      c.find('strong').first().remove();
      const body = htmlToPortableText(`<p>${c.html()}</p>`, `${prefix}n${n}`, toNewUrl)[0];
      blocks.push({ _key: `${prefix}x${n++}`, _type: 'note', title, body: body ? [body] : [] });
    } else if (c.is('.prose__table')) {
      const rows = c.find('tr').map((r, tr) => ({
        _key: `${prefix}r${n}${r}`, _type: 'row',
        cells: $(tr).find('th, td').map((_, cell) => text($, cell)).get(),
      })).get();
      blocks.push({ _key: `${prefix}x${n++}`, _type: 'table', rows, headerRow: true });
    } else {
      blocks.push(...htmlToPortableText($.html(child), `${prefix}p${n++}`, toNewUrl));
    }
  });
  return blocks.map(tidyBlock);
}

const blogList = load('blog.html');
const postIds = [];
blogList('.posts .post-card').each((i, el) => {
  const href = blogList(el).attr('href');
  const slug = href.replace(/^blog\//, '').replace(/\.html$/, '');
  const $ = load(`blog/${slug}.html`);
  const id = `post-${slug}`;
  postIds.push(id);
  push({
    _id: id, _type: 'blogPost', order: i + 1,
    title: text($, $('.article__title')),
    slug: { _type: 'slug', current: slug },
    category: blogList(el).attr('data-tags'),
    tags: $('.article__intro .guide__tags li').map((_, li) => text($, li)).get(),
    excerpt: text($, $('.article__standfirst')),
    readMinutes: Number((text($, $('.article__meta')).match(/(\d+) min/) || [])[1] || 3),
    image: image($, $('.article__hero')),
    body: proseToBlocks($, $('.prose'), `${slug.slice(0, 6)}`),
    related: $('.section--panel .posts .post-card').map((r, a) => ({
      ...ref(`post-${$(a).attr('href').replace(/^(\.\.\/)?blog\//, '').replace(/\.html$/, '')}`),
      _key: `${slug.slice(0, 6)}rel${r}`,
    })).get(),
    seo: seoOf($),
  });
});

/* ---------------------------------------------------------------- site settings */
{
  const $ = home;
  const phones = $('.footer__phone a').map((_, a) => ({ label: text($, a), link: $(a).attr('href').replace(/^tel:/, '') })).get();
  push({
    _id: 'siteSettings', _type: 'siteSettings',
    companyName: 'Spectra Pack',
    locationLabel: text($, $('.topbar__loc')),
    topbarBold: text($, $('.topbar__note strong')),
    topbarText: text($, $('.topbar__note span')),
    topbarLinkLabel: text($, $('.topbar__note a')),
    phones: keyed(phones),
    email: $('.topbar__links a[href^="mailto:"]').attr('href').replace(/^mailto:/, ''),
    whatsappNumber: $('a.fab').attr('href').replace(/^https:\/\/wa\.me\//, ''),
    instagramUrl: $('.topbar__links a[aria-label="Instagram"]').attr('href'),
    addressLines: ($('.footer__address').html() || '').split(/<br\s*\/?>/).map((s) => clean(cheerio.load(s).text())).filter(Boolean),
    directionsUrl: $('.footer__rows a').filter((_, a) => /Directions/.test($(a).text())).attr('href'),
    mapQuery: 'Spectra Pack, GIDC Umbergaon, Gujarat 396171',
    footerCardTitle: text($, $('.footer__card .footer__title')),
    footerCardText: text($, $('.footer__card p')),
    footerCardImage: image($, $('.footer__card .media')),
    defaultOgImage: { _type: 'image', _local: 'shared/og-image.jpg', alt: $('meta[property="og:image:alt"]').attr('content') },
    ...googleDetails($),
  });
}

/** The structured details Google reads from the home page's JSON-LD block. */
function googleDetails($) {
  const org = JSON.parse($('script[type="application/ld+json"]').html());
  return {
    orgDescription: org.description,
    foundingYear: org.foundingDate,
    streetAddress: org.address.streetAddress,
    addressLocality: org.address.addressLocality,
    addressRegion: org.address.addressRegion,
    postalCode: org.address.postalCode,
    languages: org.contactPoint[0].availableLanguage,
  };
}

/* ---------------------------------------------------------------- home page */
{
  const $ = home;
  const photos = $('.hero__photo').map((_, el) => image($, el)).get();
  const panelSpecs = text($, $('.hero__panel-text span'));
  const tile = (el, labelSel) => ({
    label: text($, $(el).find(labelSel)),
    product: ref(productByImage[image($, $(el).find('.media'))._local]),
    query: decodeURIComponent(($(el).attr('href').split('?q=')[1] || '').replace(/\+/g, ' ')),
  });
  const statIcons = ['palette', 'ruler', 'gauge', 'pouch', 'calendar'];
  push({
    _id: 'homePage', _type: 'homePage', seo: seoOf($),
    heroTitle: marked($, $('.hero__title')).replace(/\*?\.\*?$/, ''),
    heroTitleHidden: text($, $('.hero__title .visually-hidden')),
    heroMarkTop: text($, $('.hero__mark span').eq(0)),
    heroMarkNumber: text($, $('.hero__mark b')),
    heroMarkBottom: text($, $('.hero__mark span').eq(1)),
    heroText: text($, $('.hero__text')),
    heroThumb: image($, $('.hero__thumb')),
    heroPhotos: keyed(photos),
    heroPrimary: { label: text($, $('.hero__pill').eq(0)), href: toNewUrl($('.hero__pill').eq(0).attr('href')) },
    heroSecondary: { label: text($, $('.hero__pill--go')), href: toNewUrl($('.hero__pill--go').attr('href')) },
    heroPanelImage: image($, $('.hero__panel .media')),
    heroPanelTitle: text($, $('.hero__panel-text b')),
    heroPanelText: panelSpecs,
    heroPanelHref: toNewUrl($('.hero__panel').attr('href')),
    storyTitle: marked($, $('.story__title')),
    storyQuote: clean(text($, $('.story__quote')).replace(/^“\s*|\s*”$/g, '')),
    storyBackground: image($, $('.story > .media')),
    storyCards: keyed($('.story__cards .thumb-card').map((_, a) => ({
      title: text($, $(a).find('.thumb-card__title')), image: image($, $(a).find('.media')), href: toNewUrl($(a).attr('href')),
    })).get()),
    clientsCount: text($, $('.clients__count b')),
    clientsCountLabel: text($, $('.clients__count span')),
    clientsTitle: marked($, $('#clients-title')),
    clientsLead: text($, $('.clients__lead')),
    marketsTitle: marked($, $('#markets-title')),
    marketsKicker: text($, $('.markets .section-kicker')),
    marketsLead: text($, $('.markets .section-lead')),
    finderTitle: text($, $('.finder__title')),
    finderPlaceholder: clean($('#finder-input').attr('placeholder')),
    finderQuestion: text($, $('.finder__question')),
    finderTiles: keyed($('.finder .tile').map((_, el) => tile(el, '.tile__title')).get()),
    finderChips: keyed($('.finder .chip-card').map((_, el) => tile(el, '[data-finder-label]')).get()),
    finderButton: { label: text($, $('.finder .section-cta .btn')), href: toNewUrl($('.finder .section-cta .btn').attr('href')) },
    panelTitle: marked($, $('.panel__title')),
    panelStats: keyed($('.panel .stat').map((i, li) => ({
      icon: statIcons[i] || 'palette',
      value: clean($(li).find('.stat__value').clone().children().remove().end().text()),
      unit: text($, $(li).find('.stat__value small')),
      label: text($, $(li).find('.stat__label')),
    })).get()),
    panelText: text($, $('.panel__text')),
    panelButton: { label: text($, $('.panel .btn')), href: toNewUrl($('.panel .btn').attr('href')) },
    panelImage: image($, $('.panel__media')),
    guidesTitle: marked($, $('#guides-title')),
    guidesButton: { label: text($, $('.guides .section-cta .btn')), href: toNewUrl($('.guides .section-cta .btn').attr('href')) },
    fitmentsTitle: marked($, $('#fitments-title')),
    fitments: $('.marks').eq(0).find('.marks__list li').map((_, li) => text($, li)).get(),
    exportsTitle: marked($, $('#export-title')),
    exportMarkets: keyed($('.marks--soft .marks__list li').map((_, li) => ({
      code: text($, $(li).find('small')),
      name: clean($(li).clone().children().remove().end().text()),
    })).get()),
  });
}

/* ---------------------------------------------------------------- about page */
{
  const $ = load('about.html');
  push({
    _id: 'aboutPage', _type: 'aboutPage', seo: seoOf($),
    visionEyebrow: text($, $('.page-hero--vision .eyebrow')),
    visionStatement: marked($, $('.page-hero__statement')),
    visionImage: image($, $('.page-hero--vision > .media')),
    introTitle: marked($, $('#intro-title')),
    introParagraphs: keyed($('.intro__copy p').map((_, p) => ({
      text: text($, p),
      style: $(p).hasClass('accent') ? 'accent' : $(p).find('strong').length ? 'bold' : 'normal',
    })).get()),
    introImage: image($, $('.intro > .container > .media')),
    overviewTitle: marked($, $('#overview-title')),
    overviewLead: text($, $('.overview .section-lead')),
    overviewImage: image($, $('.overview .container > .media')),
    numbers: keyed($('.overview__nums > div').map((_, d) => ({
      value: clean($(d).find('dt').clone().children().remove().end().text()),
      unit: text($, $(d).find('dt small')),
      label: text($, $(d).find('dd')),
    })).get()),
    businessTitle: marked($, $('#business-title')),
    businessText: text($, $('.business__head p')),
    stages: keyed($('.overlay-card').map((_, a) => ({
      step: text($, $(a).find('.overlay-card__step')).replace(/^STAGE\s*/i, ''),
      title: text($, $(a).find('.overlay-card__title')),
      meta: text($, $(a).find('.overlay-card__meta span')),
      image: image($, $(a).find('.media')),
      href: toNewUrl($(a).attr('href')),
    })).get()),
    sectorsTitle: marked($, $('#sectors-title')),
    sectorsLead: text($, $('#sectors-title').closest('.section').find('.section-lead')),
    milestonesLead: text($, $('#milestones-title')),
    milestones: keyed($('.timeline__item').map((_, li) => ({
      year: text($, $(li).find('.timeline__year')),
      title: text($, $(li).find('.timeline__title')),
      text: text($, $(li).find('.timeline__text')),
      image: image($, $(li).find('.media')),
    })).get()),
    teamTitle: marked($, $('#team-title')),
    team: keyed($('.team__grid li').map((_, li) => ({
      name: text($, $(li).find('.team__name')),
      role: text($, $(li).find('.team__role')),
      photo: image($, $(li).find('.media')),
    })).get()),
    teamNote: text($, $('.team__note')),
  });
}

/* ---------------------------------------------------------------- products page */
{
  const $ = prod;
  push({
    _id: 'productsPage', _type: 'productsPage', seo: seoOf($),
    title: marked($, $('#page-title')),
    text: text($, $('.page-hero__text')),
    searchPlaceholder: clean($('#catalog-search').attr('placeholder')),
    image: image($, $('.page-hero--band .media')),
  });
}

/* ---------------------------------------------------------------- industries page */
{
  const $ = ind;
  push({
    _id: 'industriesPage', _type: 'industriesPage', seo: seoOf($),
    eyebrow: text($, $('.page-hero--circle .eyebrow')),
    title: marked($, $('#page-title')),
    image: image($, $('.page-hero--circle .media')),
    button: { label: text($, $('.page-hero--circle .btn')), href: toNewUrl($('.page-hero--circle .btn').attr('href')) },
    detailsTitle: marked($, $('#overview-title')),
    detailsLead: text($, $('.details__lead')),
    detailsCopy: $('.details__copy p').map((_, p) => text($, p)).get(),
    sectorsTitle: marked($, $('#sectors-title')),
    relatedTitle: marked($, $('#related-title')),
    relatedButton: { label: text($, $('.related__head .btn')), href: toNewUrl($('.related__head .btn').attr('href')) },
    related: keyed($('.related .market-card').map((_, a) => ({
      product: ref(productByImage[image($, $(a).find('.media'))._local]),
      query: decodeURIComponent(($(a).attr('href').split('?q=')[1] || '').replace(/\+/g, ' ')),
    })).get()),
  });
}

/* ---------------------------------------------------------------- infrastructure page */
{
  const $ = infra;
  const checklist = (sel) => keyed($(sel).find('.checklist li').map((_, li) => ({
    title: text($, $(li).find('strong')), text: text($, $(li).find('span')),
  })).get());
  push({
    _id: 'infrastructurePage', _type: 'infrastructurePage', seo: seoOf($),
    eyebrow: text($, $('.page-hero--circle .eyebrow')),
    title: marked($, $('#page-title')),
    image: image($, $('.page-hero--circle .media')),
    button: { label: text($, $('.page-hero--circle .btn')), href: toNewUrl($('.page-hero--circle .btn').attr('href')) },
    artworkTitle: marked($, $('#artwork-title')),
    artworkText: text($, $('#artwork .split__text')),
    artworkImage: image($, $('#artwork .split > .media')),
    artworkChecklist: checklist('#artwork'),
    processTitle: marked($, $('#process-title')),
    processLead: text($, $('#process .details__lead')),
    steps: keyed($('.stage').map((_, li) => {
      const s = $(li);
      return {
        anchor: s.attr('id'),
        number: clean(s.find('.stage__num').clone().children().remove().end().text()),
        tag: text($, s.find('.stage__num small')),
        title: text($, s.find('.stage__title')),
        text: text($, s.find('.stage__text')),
        why: text($, s.find('.stage__why')),
        specs: s.children('div').first().find('.specs li').map((_, x) => text($, x)).get(),
        image: image($, s.children('.media')),
        machines: s.find('.machine__title').map((_, h) => ref(machineIdByTitle[text($, h)])).get(),
      };
    }).get()),
    qualityTitle: marked($, $('#quality-title')),
    qualityText: text($, $('#quality .split__text')),
    qualityImage: image($, $('#quality .split > .media')),
    qualityChecklist: checklist('#quality'),
  });
}

/* ---------------------------------------------------------------- contact, blog list, legal */
{
  const $ = load('contact.html');
  push({
    _id: 'contactPage', _type: 'contactPage', seo: seoOf($),
    title: marked($, $('#page-title')),
    locationTitle: marked($, $('#location-title')),
    enquiryTitle: marked($, $('#enquiry-title')),
    enquiryLead: text($, $('.sheet__sub')),
  });
}
push({
  _id: 'blogPage', _type: 'blogPage', seo: seoOf(blogList),
  title: marked(blogList, blogList('#page-title')),
  text: text(blogList, blogList('.page-hero__text')),
  listTitle: marked(blogList, blogList('#posts-title')),
});
for (const [file, id] of [['privacy.html', 'privacyPage'], ['terms.html', 'termsPage']]) {
  const $ = load(file);
  push({
    _id: id, _type: 'legalPage', seo: seoOf($),
    title: marked($, $('#page-title')),
    updated: text($, $('.page-hero__text')).replace(/^Last updated\s*/i, ''),
    body: id === 'privacyPage' ? withSanityListed(proseToBlocks($, $('.prose'), id.slice(0, 4))) : proseToBlocks($, $('.prose'), id.slice(0, 4)),
  });
}

/**
 * The CMS site serves its images from Sanity's CDN, so Sanity joins the list of
 * services that receive a visitor's IP address. Added after the Netlify item.
 */
function withSanityListed(blocks) {
  const at = blocks.findIndex((b) => b.listItem && b.children?.[0]?.text === 'Netlify');
  if (at === -1) throw new Error('Privacy policy: Netlify list item not found');
  const item = {
    _key: 'privsanity', _type: 'block', style: 'normal', listItem: 'bullet', level: 1, markDefs: [],
    children: [
      { _key: 'privsanity0', _type: 'span', text: 'Sanity', marks: ['strong'] },
      { _key: 'privsanity1', _type: 'span', text: ', which stores the text and images of this website and delivers the images to your browser.', marks: [] },
    ],
  };
  return [...blocks.slice(0, at + 1), item, ...blocks.slice(at + 1)];
}

/* ---------------------------------------------------------------- list item types */
/**
 * Sanity needs every object in a list to say which kind of item it is (_type),
 * matching the schema's name for that list's items. Add it from the schema.
 */
const { schemaTypes } = await import('../sanity/schemas/index.js');
const SCHEMA = Object.fromEntries(schemaTypes.map((t) => [t.name, t]));
const resolveType = (t) => (t && !t.fields && !t.of && SCHEMA[t.type] ? SCHEMA[t.type] : t);

function withItemTypes(value, type) {
  type = resolveType(type);
  if (!type || value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    const members = type.of || [];
    return value.map((item) => {
      if (!item || typeof item !== 'object') return item;
      const member = members.find((m) => (m.name || m.type) === item._type) || (members.length === 1 ? members[0] : null);
      if (!member) return item;
      const typed = item._type ? item : { _type: member.name || member.type, ...item };
      return typed._type === 'block' ? typed : withItemTypes(typed, member);
    });
  }
  if (['reference', 'slug', 'block'].includes(type.type)) return value;
  const out = { ...value };
  for (const f of type.fields || []) if (f.name in out) out[f.name] = withItemTypes(out[f.name], f);
  return out;
}
docs.splice(0, docs.length, ...docs.map((d) => withItemTypes(d, SCHEMA[d._type])));

/* ---------------------------------------------------------------- write + sanity checks */
const missingRefs = [];
const ids = new Set(docs.map((d) => d._id));
JSON.stringify(docs, (k, v) => { if (v && v._type === 'reference' && !ids.has(v._ref)) missingRefs.push(v._ref); return v; });
if (missingRefs.length) throw new Error('Broken references: ' + missingRefs.join(', '));
const counts = docs.reduce((acc, d) => ({ ...acc, [d._type]: (acc[d._type] || 0) + 1 }), {});
writeFileSync(OUT, JSON.stringify(docs, null, 2) + '\n');
console.log(`content/seed.json: ${docs.length} documents`, counts);
