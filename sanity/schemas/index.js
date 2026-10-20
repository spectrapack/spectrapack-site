import link from './objects/link.js';
import seo from './objects/seo.js';
import richText from './objects/richText.js';

import siteSettings from './singletons/siteSettings.js';
import homePage from './singletons/homePage.js';
import aboutPage from './singletons/aboutPage.js';
import productsPage from './singletons/productsPage.js';
import industriesPage from './singletons/industriesPage.js';
import infrastructurePage from './singletons/infrastructurePage.js';
import contactPage from './singletons/contactPage.js';
import blogPage from './singletons/blogPage.js';
import legalPage from './singletons/legalPage.js';

import product from './documents/product.js';
import industry from './documents/industry.js';
import machine from './documents/machine.js';
import client from './documents/client.js';
import blogPost from './documents/blogPost.js';

export const schemaTypes = [
  link, seo, richText,
  siteSettings, homePage, aboutPage, productsPage, industriesPage, infrastructurePage, contactPage, blogPage, legalPage,
  product, industry, machine, client, blogPost,
];

/** One-off pages: exactly one of each, reached from the sidebar, never deletable. */
export const SINGLETON_TYPES = ['siteSettings', 'homePage', 'aboutPage', 'productsPage', 'industriesPage', 'infrastructurePage', 'contactPage', 'blogPage', 'legalPage'];
