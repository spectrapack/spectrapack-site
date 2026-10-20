import { defineType } from 'sanity';
import { accent, txt, seo, SEO_GROUP } from '../fields.js';

export default defineType({
  name: 'contactPage',
  title: 'Contact page',
  type: 'document',
  groups: [{ name: 'page', title: 'Page', default: true }, SEO_GROUP],
  fields: [
    accent('title', 'Heading', { group: 'page' }),
    accent('locationTitle', 'Map heading', { group: 'page' }),
    accent('enquiryTitle', 'Form heading', { group: 'page' }),
    txt('enquiryLead', 'Line above the form', 2, { group: 'page', description: 'Address, phone and email come from Site settings.' }),
    seo,
  ],
  preview: { prepare: () => ({ title: 'Contact page' }) },
});
