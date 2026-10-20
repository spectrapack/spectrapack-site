/**
 * Fixed choices shared by the admin panel and the website, so a product tagged "Bags"
 * in the panel always lands in the "Bags" filter on the products page.
 */
export const PRODUCT_FORMATS = [
  { title: 'Pouches', value: 'pouch' },
  { title: 'Rolls & laminates', value: 'roll' },
  { title: 'Bags', value: 'bag' },
];

export const PRODUCT_FEATURES = [
  { title: 'Resealable zipper', value: 'zipper' },
  { title: 'Stands on the shelf', value: 'standup' },
  { title: 'Spout or valve', value: 'spout' },
  { title: 'High barrier', value: 'barrier' },
  { title: 'Hang hole or handle', value: 'hang' },
  { title: 'Static-safe', value: 'antistatic' },
];

export const BLOG_CATEGORIES = [
  { title: 'Materials', value: 'materials' },
  { title: 'Ordering', value: 'ordering' },
  { title: 'Artwork', value: 'artwork' },
  { title: 'Formats', value: 'formats' },
];

export const STAT_ICONS = [
  { title: 'Colour palette', value: 'palette' },
  { title: 'Ruler (width)', value: 'ruler' },
  { title: 'Speed gauge', value: 'gauge' },
  { title: 'Pouch', value: 'pouch' },
  { title: 'Calendar', value: 'calendar' },
];
