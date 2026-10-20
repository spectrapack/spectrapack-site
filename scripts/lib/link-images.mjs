/**
 * Swap every seed image ({ _type: 'image', _local: 'home/hero-01.jpg' }) for a
 * Sanity asset reference. Images whose file was never uploaded are dropped, so
 * the slot shows its placeholder instead of a broken picture.
 *
 * @param {unknown} value  a document or any part of one
 * @param {Record<string, string>} assets  local path -> Sanity asset id
 */
export function linkImages(value, assets) {
  if (Array.isArray(value)) {
    return value.map((v) => linkImages(v, assets)).filter((v) => v !== undefined);
  }
  if (!value || typeof value !== 'object') return value;
  if (value._type === 'image' && value._local) {
    const ref = assets[value._local];
    if (!ref) return undefined;
    const { _local, ...rest } = value;
    return { ...rest, asset: { _type: 'reference', _ref: ref } };
  }
  return Object.fromEntries(
    Object.entries(value)
      .map(([k, v]) => [k, linkImages(v, assets)])
      .filter(([, v]) => v !== undefined)
  );
}
