/* Fades elements marked [data-reveal] into view the first time they enter the viewport. */
(function () {
  'use strict';

  var targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  function show(node) {
    node.classList.add('is-visible');
  }

  if (!('IntersectionObserver' in window)) {
    targets.forEach(show);
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      show(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  targets.forEach(function (node) { observer.observe(node); });
})();
