import { defineField, defineType } from 'sanity';
import { str, txt, strings, image, href } from '../fields.js';

/** Details used on every page: header strip, footer, contact page, WhatsApp button. */
export default defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    { name: 'contact', title: 'Contact details', default: true },
    { name: 'strip', title: 'Top strip' },
    { name: 'footer', title: 'Footer' },
    { name: 'defaults', title: 'Sharing default' },
    { name: 'google', title: 'Google details' },
  ],
  fields: [
    str('companyName', 'Company name', { group: 'contact' }),
    defineField({
      name: 'phones', title: 'Phone numbers', type: 'array', group: 'contact',
      description: 'The first number is used for the call buttons.',
      of: [{
        type: 'object', name: 'phone',
        fields: [
          str('label', 'Number as shown', { description: 'Format: +91 91676 61011' }),
          str('link', 'Number for dialling', { description: 'Same number without spaces: +919167661011' }),
        ],
        preview: { select: { title: 'label' } },
      }],
    }),
    str('email', 'Email address', { group: 'contact', validation: (Rule) => Rule.required().email() }),
    str('whatsappNumber', 'WhatsApp number', { group: 'contact', description: 'Digits only, with country code and no plus sign: 919167661011', validation: (Rule) => Rule.required().regex(/^\d{8,15}$/, { name: 'digits only' }) }),
    href('instagramUrl', 'Instagram page', { group: 'contact' }),
    defineField({ name: 'addressLines', title: 'Address', type: 'array', of: [{ type: 'string' }], group: 'contact', description: 'One line per row.' }),
    href('directionsUrl', 'Google Maps link for "Directions"', { group: 'contact' }),
    str('mapQuery', 'Place shown on the contact page map', { group: 'contact', description: 'What you would type into Google Maps, for example "Spectra Pack, GIDC Umbergaon, Gujarat 396171".' }),
    str('locationLabel', 'Location (left of the top strip)', { group: 'strip' }),
    str('topbarBold', 'Bold words', { group: 'strip' }),
    str('topbarText', 'Message', { group: 'strip' }),
    str('topbarLinkLabel', 'Link text', { group: 'strip', description: 'Opens the enquiry form.' }),
    str('footerCardTitle', '"Start a project" heading', { group: 'footer' }),
    txt('footerCardText', '"Start a project" text', 2, { group: 'footer' }),
    image('footerCardImage', '"Start a project" photo', { group: 'footer' }),
    txt('orgDescription', 'One-line description of the company', 2, { group: 'google', description: 'Read by Google and AI assistants, not shown on the page.' }),
    str('foundingYear', 'Year founded', { group: 'google' }),
    str('streetAddress', 'Street address', { group: 'google', description: 'The address split into parts, which Google needs separately.' }),
    str('addressLocality', 'Town', { group: 'google' }),
    str('addressRegion', 'State', { group: 'google' }),
    str('postalCode', 'PIN code', { group: 'google' }),
    strings('languages', 'Languages you answer enquiries in', { group: 'google', description: 'Two-letter codes: en, hi, gu.' }),
    image('defaultOgImage', 'Picture when a page is shared', { group: 'defaults', description: 'Used for any page that has no sharing picture of its own. 1200 × 630.' }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
