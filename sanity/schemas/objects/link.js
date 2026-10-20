import { defineType } from 'sanity';
import { str, href } from '../fields.js';

export default defineType({
  name: 'link',
  title: 'Button',
  type: 'object',
  fields: [
    str('label', 'Button text'),
    href('href', 'Button link', { description: 'A page on this site, for example /products/ or /contact/#enquiry' }),
  ],
});
