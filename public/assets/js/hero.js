/* Home hero: the large photo cross-fades between three pictures every few seconds.
   Pauses while the pointer or keyboard focus is on the photo, while the tab is hidden,
   and when the visitor presses pause. Visitors who prefer reduced motion get a still photo. */
(function () {
  'use strict';

  var INTERVAL_MS = 5500;

  var root = document.querySelector('[data-hero-rotator]');
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
  var toggle = root.querySelector('[data-hero-toggle]');
  var photo = root.querySelector('.hero__stage') || root;
  if (slides.length < 2) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var current = 0;
  var timer = null;
  var held = false;          // pointer or keyboard focus is on the photo
  var paused = reduceMotion; // the visitor pressed pause, or prefers no motion

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
      if (i === current) dot.setAttribute('aria-current', 'true'); else dot.removeAttribute('aria-current');
    });
  }

  function schedule() {
    window.clearTimeout(timer);
    timer = null;
    root.classList.remove('is-playing');
    if (paused || held || document.hidden) return;
    timer = window.setTimeout(function () {
      show(current + 1);
      schedule();
    }, INTERVAL_MS);
    // Restart the progress dash on the next frame.
    window.requestAnimationFrame(function () {
      if (timer !== null) root.classList.add('is-playing');
    });
  }

  function setPaused(value) {
    paused = value;
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.setAttribute('aria-label', paused ? 'Play photos' : 'Pause photos');
    }
    schedule();
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      show(i);
      schedule();
    });
  });

  if (toggle) toggle.addEventListener('click', function () { setPaused(!paused); });

  function hold(value) {
    held = value;
    schedule();
  }

  // Hovering the photo pauses it; hovering the headline or buttons does not.
  photo.addEventListener('mouseenter', function () { hold(true); });
  photo.addEventListener('mouseleave', function () { hold(false); });
  // Keyboard focus inside the photo (the corner panel link) holds it too. Focus on the
  // dashes or the pause button does not: those are the visitor's own controls.
  photo.addEventListener('focusin', function () { hold(true); });
  photo.addEventListener('focusout', function () { hold(false); });
  document.addEventListener('visibilitychange', schedule);

  // The later photos are not shown for several seconds, so they download only after the
  // page has finished loading, leaving the bandwidth to the first photo and the page itself.
  function loadLaterPhotos() {
    root.querySelectorAll('img[data-hero-src]').forEach(function (img) {
      if (img.hasAttribute('data-hero-srcset')) img.srcset = img.getAttribute('data-hero-srcset');
      img.src = img.getAttribute('data-hero-src');
      img.removeAttribute('data-hero-src');
      img.removeAttribute('data-hero-srcset');
    });
  }
  if (document.readyState === 'complete') loadLaterPhotos();
  else window.addEventListener('load', loadLaterPhotos, { once: true });

  root.style.setProperty('--hero-interval', INTERVAL_MS + 'ms');
  show(0);
  setPaused(paused);
})();
