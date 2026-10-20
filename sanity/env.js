/**
 * Which Sanity project the site and the admin panel talk to.
 *
 * The project id is not a secret (it appears in every image URL), but it lives
 * in .env / Netlify's environment so the same code runs before Sanity is
 * connected: with no id, the site renders from content/seed.json.
 */
const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
const read = (key) => env[key] ?? (typeof process !== 'undefined' ? process.env[key] : undefined);

export const PROJECT_ID = read('PUBLIC_SANITY_PROJECT_ID') || 'not-connected';
export const DATASET = read('PUBLIC_SANITY_DATASET') || 'production';
export const IS_CONNECTED = PROJECT_ID !== 'not-connected';
