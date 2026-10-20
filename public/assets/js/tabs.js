/* Sticky in-page tabs: highlights the tab whose section is currently in view. */
(function () {
  'use strict';

  var links = Array.prototype.slice.call(document.querySelectorAll('[data-subnav] a[href^="#"]'));
  if (!links.length || !('IntersectionObserver' in window)) return;

  var sections = links
    .map(function (link) { return document.getElementById(link.getAttribute('href').slice(1)); })
    .filter(Boolean);

  function setActive(id) {
    links.forEach(function (link) {
      var active = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    });
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-35% 0px -60% 0px' });

  sections.forEach(function (section) { observer.observe(section); });

  // Back at the top of the page (no section in view yet), the first tab is the current one.
  var hero = document.querySelector('.page-hero');
  if (hero && sections.length) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) setActive(sections[0].id);
    }, { rootMargin: '0px 0px -40% 0px' }).observe(hero);
  }
})();
