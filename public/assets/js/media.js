/* Image slots: if the file behind an <img> is not there yet, show the labelled placeholder instead. */
(function () {
  'use strict';

  function markMissing(img) {
    var slot = img.closest('.media');
    if (slot) slot.classList.add('is-missing');
  }

  function watch(img) {
    if (img.complete) {
      if (img.naturalWidth === 0) markMissing(img);
      return;
    }
    img.addEventListener('error', function () { markMissing(img); }, { once: true });
  }

  // Images with data-hero-src are deferred on purpose, not missing; they get their src later.
  document.querySelectorAll('.media img:not([data-hero-src])').forEach(watch);
})();
