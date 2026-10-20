import fs from 'node:fs';
import { createImageUrlBuilder } from '@sanity/image-url';
import { PROJECT_ID, DATASET } from '../../sanity/env.js';

/**
 * Turn an image field into the attributes an <img> needs.
 *
 * Sanity images are served from Sanity's CDN, resized and converted to
 * WebP/AVIF on the fly. That keeps per-visitor image traffic off Netlify's
 * bandwidth allowance. Seed images (before Sanity is connected) are served
 * from public/assets/images.
 */

const builder = createImageUrlBuilder({ projectId: PROJECT_ID, dataset: DATASET });

const DEFAULT_WIDTHS = [480, 800, 1200, 1600];

/** "image-abc123-1920x1080-jpg" -> { width: 1920, height: 1080, ext: 'jpg' } */
function fromAssetRef(ref) {
  const m = /-(\d+)x(\d+)-(\w+)$/.exec(ref || '');
  return m ? { width: +m[1], height: +m[2], ext: m[3] } : null;
}

/**
 * @param {object} source  image field ({ asset } from Sanity, or { _local } from the seed)
 * @param {object} dims    seed image dimensions, from localDimensions()
 * @param {{ widths?: number[], quality?: number }} [opts]
 * @returns {{ src: string, srcset?: string, width?: number, height?: number, alt: string } | null}
 */
export function imageAttrs(source, dims = {}, { widths = DEFAULT_WIDTHS, quality = 78 } = {}) {
  if (!source) return null;
  const alt = source.alt || '';

  if (source._local) {
    const file = source._local;
    const size = dims[file];
    if (!size) return null; // listed in the seed but not on disk yet
    const small = file.replace(/\.(jpe?g|png)$/, '-800.$1');
    const hasSmall = small !== file && fs.existsSync(`public/assets/images/${small}`);
    return {
      src: `/assets/images/${file}`,
      srcset: hasSmall ? `/assets/images/${small} 800w, /assets/images/${file} ${size.width}w` : undefined,
      width: size.width,
      height: size.height,
      alt,
    };
  }

  const info = fromAssetRef(source.asset?._ref);
  if (!info) return null;
  const crop = source.crop;
  const ratio = crop ? (1 - crop.left - crop.right) * info.width / ((1 - crop.top - crop.bottom) * info.height) : info.width / info.height;

  // Vector logos go out as-is; resizing would turn them into blurry bitmaps.
  if (info.ext === 'svg') {
    return { src: builder.image(source).url(), width: info.width, height: info.height, alt };
  }

  const base = builder.image(source).auto('format').quality(quality).fit('max');
  const croppedWidth = crop ? Math.round((1 - crop.left - crop.right) * info.width) : info.width;
  const usable = widths.filter((w) => w <= croppedWidth);
  const set = usable.length ? usable : [croppedWidth];
  const largest = set[set.length - 1];
  return {
    src: base.width(largest).url(),
    srcset: set.map((w) => `${base.width(w).url()} ${w}w`).join(', '),
    width: largest,
    height: Math.round(largest / ratio),
    alt,
  };
}

/** Width/height ratio of an image, used to give every client logo the same visual weight. */
export function aspectOf(source, dims = {}) {
  const a = imageAttrs(source, dims);
  return a?.width && a?.height ? a.width / a.height : 2;
}

/**
 * Image for social sharing: an absolute URL and its real size. Sanity images
 * are cropped to the 1200 × 630 that Facebook, LinkedIn and WhatsApp expect.
 */
export function shareImage(source, site, dims = {}) {
  if (source?._local) {
    const size = dims[source._local] || {};
    return { url: new URL(`/assets/images/${source._local}`, site).href, width: size.width, height: size.height };
  }
  if (!source?.asset?._ref) return null;
  return { url: builder.image(source).width(1200).height(630).fit('crop').auto('format').url(), width: 1200, height: 630 };
}
