/* Category pills (home article feed, blog listing) and the home product-finder search. */
(function () {
  'use strict';

  function normalise(text) {
    return String(text || '').toLowerCase().trim();
  }

  /* Pills: <button data-filter-value="tag"> show/hide items carrying data-tags="tag other". */
  function initPills(root) {
    var buttons = Array.prototype.slice.call(root.querySelectorAll('[data-filter-value]'));
    var items = Array.prototype.slice.call(root.querySelectorAll('[data-tags]'));
    var list = root.querySelector('[data-filter-list]');
    var empty = root.querySelector('[data-filter-empty]');

    function apply(value) {
      var visible = 0;
      items.forEach(function (item) {
        var tags = normalise(item.getAttribute('data-tags')).split(/\s+/);
        var match = value === 'all' || tags.indexOf(value) !== -1;
        item.hidden = !match;
        if (match) visible += 1;
      });
      buttons.forEach(function (button) {
        var active = button.getAttribute('data-filter-value') === value;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      if (list) list.classList.toggle('is-filtered', value !== 'all');
      if (empty) empty.hidden = visible > 0;
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        apply(button.getAttribute('data-filter-value'));
      });
    });
  }

  /* Finder: typing narrows the tiles; submitting the form carries the query to the products page. */
  function initFinder(root) {
    var input = root.querySelector('[data-finder-input]');
    var items = Array.prototype.slice.call(root.querySelectorAll('[data-finder-item]'));
    var empty = root.querySelector('[data-finder-empty]');
    if (!input) return;

    input.addEventListener('input', function () {
      var query = normalise(input.value);
      var visible = 0;
      items.forEach(function (item) {
        var label = item.querySelector('[data-finder-label]');
        var haystack = normalise((label ? label.textContent : '') + ' ' + (item.getAttribute('data-keywords') || ''));
        var match = query === '' || haystack.indexOf(query) !== -1;
        item.hidden = !match;
        if (match) visible += 1;
      });
      if (empty) empty.hidden = visible > 0;
    });
  }

  document.querySelectorAll('[data-filter]').forEach(initPills);
  document.querySelectorAll('[data-finder]').forEach(initFinder);
})();
