/* Header drawer, generic disclosure toggles (footer accordions, filter panel) and the footer year. */
(function () {
  'use strict';

  var DESKTOP_QUERY = '(min-width: 1024px)';

  function initDrawer() {
    var button = document.querySelector('[data-menu-toggle]');
    var drawer = document.querySelector('[data-drawer]');
    if (!button || !drawer) return;

    function setOpen(open) {
      drawer.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      document.documentElement.classList.toggle('no-scroll', open);
    }

    button.addEventListener('click', function () {
      setOpen(button.getAttribute('aria-expanded') !== 'true');
    });

    drawer.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        // The button sits in the sticky header and is already visible; without
        // preventScroll the browser scrolls the page to "reveal" it.
        button.focus({ preventScroll: true });
      }
    });

    window.matchMedia(DESKTOP_QUERY).addEventListener('change', function (event) {
      if (event.matches) setOpen(false);
    });
  }

  /* A toggle with data-toggle-media only acts as a disclosure while that query matches
     (the footer columns are accordions on mobile and plain headings above it). */
  function initToggles() {
    document.querySelectorAll('[data-toggle]').forEach(function (button) {
      var panel = document.getElementById(button.getAttribute('aria-controls'));
      if (!panel) return;
      var query = button.getAttribute('data-toggle-media');
      var media = query ? window.matchMedia(query) : null;

      function isLive() {
        return !media || media.matches;
      }

      function sync() {
        if (isLive()) {
          button.setAttribute('aria-expanded', String(panel.classList.contains('is-open')));
          button.removeAttribute('tabindex');
        } else {
          button.removeAttribute('aria-expanded');
          button.setAttribute('tabindex', '-1');
        }
      }

      button.addEventListener('click', function () {
        if (!isLive()) return;
        panel.classList.toggle('is-open');
        sync();
      });
      if (media) media.addEventListener('change', sync);
      sync();
    });
  }

  function initYear() {
    var year = String(new Date().getFullYear());
    document.querySelectorAll('[data-year]').forEach(function (node) {
      node.textContent = year;
    });
  }

  /* On the home page, keep the floating WhatsApp button out of the hero (it covered the
     hero's corner panel on phones) and bring it in once the visitor scrolls on. */
  function initFab() {
    var fab = document.querySelector('.fab');
    var hero = document.querySelector('.hero');
    if (!fab || !hero || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entries) {
      fab.classList.toggle('is-tucked', entries[0].intersectionRatio > 0.5);
    }, { threshold: [0, 0.5, 1] }).observe(hero);
  }

  initDrawer();
  initToggles();
  initYear();
  initFab();
})();
