import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes, SINGLETON_TYPES } from './sanity/schemas/index.js';
import { PROJECT_ID, DATASET } from './sanity/env.js';
import Welcome from './sanity/tools/Welcome.jsx';
import EnquiriesTool from './sanity/tools/EnquiriesTool.jsx';
import StudioLogo from './sanity/tools/StudioLogo.jsx';

/**
 * The admin panel, served at /admin.
 *
 * The sidebar reads like the website, not like a database: pages in the order
 * a visitor meets them, each followed by the list it draws from, then settings.
 * One-off pages are pinned to fixed ids so a second home page cannot be made.
 */

/** Every built-in action that can make a one-off page disappear. Unpublish then
 *  Discard changes deletes a page in two harmless-looking clicks, so all go. */
const REMOVES_A_PAGE = ['delete', 'duplicate', 'unpublish', 'unpublishVersion', 'discardChanges', 'discardVersion'];

const page = (S, title, id, type = id) =>
  S.listItem().title(title).id(id).child(S.document().title(title).schemaType(type).documentId(id));

const list = (S, title, type) =>
  S.listItem().title(title).id(type).child(
    S.documentTypeList(type).title(title).defaultOrdering([{ field: 'order', direction: 'asc' }])
  );

export default defineConfig({
  name: 'spectrapack',
  title: 'Spectra Pack',
  projectId: PROJECT_ID,
  dataset: DATASET,

  studio: { components: { logo: StudioLogo } },

  // Do not set `theme: buildLegacyTheme(...)`: it replaces the whole theme and
  // breaks the current UI (found on Colortek). The logo is the branding.

  // Staged releases add a "choose a destination" error that means nothing to a
  // non-technical editor. Off, so every edit is a plain draft until Publish.
  releases: { enabled: false },
  scheduledDrafts: { enabled: false },

  plugins: [
    structureTool({
      structure: (S) =>
        S.list().title('Website').items([
          page(S, 'Home page', 'homePage'),
          list(S, 'Client logos', 'client'),
          page(S, 'Products page', 'productsPage'),
          list(S, 'Products', 'product'),
          page(S, 'Industries page', 'industriesPage'),
          list(S, 'Industries', 'industry'),
          page(S, 'Infrastructure page', 'infrastructurePage'),
          list(S, 'Machines', 'machine'),
          page(S, 'About page', 'aboutPage'),
          page(S, 'Blog page', 'blogPage'),
          list(S, 'Blog articles', 'blogPost'),
          page(S, 'Contact page', 'contactPage'),
          S.divider(),
          page(S, 'Privacy policy', 'privacyPage', 'legalPage'),
          page(S, 'Terms of use', 'termsPage', 'legalPage'),
          page(S, 'Site settings', 'siteSettings'),
        ]),
    }),
    // Query tool for us; hidden from the top bar below, still at /admin/vision.
    visionTool(),
  ],

  tools: (prev) => [
    { name: 'welcome', title: 'Start here', component: Welcome },
    ...prev.filter((t) => !['vision', 'releases'].includes(t.name)),
    { name: 'enquiries', title: 'Enquiries', component: EnquiriesTool },
  ],

  schema: {
    types: schemaTypes,
    // One-off pages are reached from the sidebar only, never from "Create new".
    templates: (prev) => prev.filter((t) => !SINGLETON_TYPES.includes(t.schemaType)),
  },

  document: {
    // "Restore" stays: it is how an editor brings back an earlier version.
    actions: (prev, { schemaType }) =>
      SINGLETON_TYPES.includes(schemaType) ? prev.filter(({ action }) => !REMOVES_A_PAGE.includes(action)) : prev,
  },
});
