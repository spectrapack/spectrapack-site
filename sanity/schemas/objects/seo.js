import { defineType } from 'sanity';
import { str, txt, image } from '../fields.js';

export default defineType({
  name: 'seo',
  title: 'Search & social',
  type: 'object',
  fields: [
    str('title', 'Title in Google and browser tabs', { description: 'About 50 to 60 characters.' }),
    txt('description', 'Description in Google results', 3, { description: 'About 150 characters. Say what the page offers.' }),
    image('ogImage', 'Picture when the page is shared', { description: 'Shown in WhatsApp, LinkedIn and Facebook previews. 1200 × 630 works best. Leave empty to use the site default.' }),
  ],
});
