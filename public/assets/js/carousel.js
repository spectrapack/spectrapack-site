/* Card carousels: native horizontal scroll with snap, prev/next buttons and a progress bar. */
(function () {
  'use strict';

  function initCarousel(root) {
    var track = root.querySelector('[data-carousel-track]');
    if (!track) return;

    var prev = root.querySelector('[data-carousel-prev]');
    var next = root.querySelector('[data-carousel-next]');
    var thumb = root.querySelector('[data-carousel-thumb]');
    var frame = null;

    function step() {
      var item = track.firstElementChild;
      if (!item) return track.clientWidth;
      var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
      return item.getBoundingClientRect().width + gap;
    }

    function update() {
      frame = null;
      var max = track.scrollWidth - track.clientWidth;
      var progress = max > 0 ? track.scrollLeft / max : 0;
      var ratio = track.scrollWidth > 0 ? Math.min(1, track.clientWidth / track.scrollWidth) : 1;

      if (thumb) {
        thumb.style.width = (ratio * 100) + '%';
        thumb.style.transform = 'translateX(' + (ratio < 1 ? progress * ((1 - ratio) / ratio) * 100 : 0) + '%)';
      }
      setDisabled(prev, track.scrollLeft <= 1, next);
      setDisabled(next, track.scrollLeft >= max - 1, prev);
    }

    /* Disabling a focused button drops focus to <body>; hand it to the other arrow first. */
    function setDisabled(button, disabled, other) {
      if (!button) return;
      if (disabled && document.activeElement === button && other) other.focus();
      button.disabled = disabled;
    }

    function requestUpdate() {
      if (frame === null) frame = window.requestAnimationFrame(update);
    }

    function move(direction) {
      track.scrollBy({ left: direction * step(), behavior: 'smooth' });
    }

    if (prev) prev.addEventListener('click', function () { move(-1); });
    if (next) next.addEventListener('click', function () { move(1); });

    track.addEventListener('scroll', requestUpdate, { passive: true });
    if ('ResizeObserver' in window) {
      new ResizeObserver(requestUpdate).observe(track);
    } else {
      window.addEventListener('resize', requestUpdate);
    }

    update();
  }

  document.querySelectorAll('[data-carousel]').forEach(initCarousel);
})();
