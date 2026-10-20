/* Products page: checkbox + search filtering (pre-filled from the URL) and the product detail dialog. */
(function () {
  'use strict';

  var catalog = document.querySelector('[data-catalog]');
  if (!catalog) return;

  var cards = Array.prototype.slice.call(catalog.querySelectorAll('[data-product]'));
  var boxes = Array.prototype.slice.call(catalog.querySelectorAll('input[type="checkbox"][name]'));
  var search = document.querySelector('[data-catalog-search]');
  var count = catalog.querySelector('[data-catalog-count]');
  var empty = catalog.querySelector('[data-catalog-empty]');
  var reset = catalog.querySelector('[data-catalog-reset]');
  var label = catalog.querySelector('[data-catalog-label]');
  var filterToggle = catalog.querySelector('.filters__toggle');
  var filterBody = catalog.querySelector('.filters__body');

  function normalise(text) {
    return String(text || '').toLowerCase().trim();
  }

  function tagsOf(card, group) {
    return normalise(card.getAttribute('data-' + group)).split(/\s+/).filter(Boolean);
  }

  /* Searchable text of a card: its title, short description and keywords. */
  function summaryOf(card) {
    var title = card.querySelector('.product-card__title');
    var text = card.querySelector('.product-card__text');
    return normalise([
      title ? title.textContent : '',
      text ? text.textContent : '',
      card.getAttribute('data-keywords') || ''
    ].join(' '));
  }

  /* { format: ['pouch'], feature: [], industry: ['food'] } */
  function selectedByGroup() {
    return boxes.reduce(function (groups, box) {
      var current = groups[box.name] || [];
      var nextGroup = box.checked ? current.concat(box.value) : current;
      var copy = Object.assign({}, groups);
      copy[box.name] = nextGroup;
      return copy;
    }, {});
  }

  function matches(card, groups, query) {
    var inGroups = Object.keys(groups).every(function (group) {
      var wanted = groups[group];
      if (!wanted.length) return true;
      var tags = tagsOf(card, group);
      return wanted.some(function (value) { return tags.indexOf(value) !== -1; });
    });
    if (!inGroups) return false;
    if (!query) return true;
    return summaryOf(card).indexOf(query) !== -1;
  }

  function apply() {
    var groups = selectedByGroup();
    var query = normalise(search ? search.value : '');
    var visible = 0;
    cards.forEach(function (card) {
      var show = matches(card, groups, query);
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (count) count.textContent = String(visible);
    if (label) label.textContent = visible === cards.length ? 'All products' : 'Matching products';
    if (empty) empty.hidden = visible > 0;
  }

  function applyUrlState() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (search && query) search.value = query;
    boxes.forEach(function (box) {
      if (params.getAll(box.name).indexOf(box.value) !== -1) box.checked = true;
    });
    var preselected = boxes.some(function (box) { return box.checked; });
    if (preselected && filterToggle && filterBody) {
      filterBody.classList.add('is-open');
      filterToggle.setAttribute('aria-expanded', 'true');
    }
  }

  function clearAll() {
    boxes.forEach(function (box) { box.checked = false; });
    if (search) search.value = '';
    apply();
  }

  boxes.forEach(function (box) { box.addEventListener('change', apply); });
  if (search) {
    search.addEventListener('input', apply);
    if (search.form) {
      search.form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
        catalog.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }
  if (reset) reset.addEventListener('click', clearAll);
  catalog.querySelectorAll('[data-catalog-clear]').forEach(function (button) {
    button.addEventListener('click', clearAll);
  });

  /* ---------- detail dialog ---------- */
  var dialog = document.querySelector('[data-product-dialog]');

  function openDetail(card) {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    var title = card.querySelector('.product-card__title');
    var detail = card.querySelector('[data-product-detail]');
    var quote = dialog.querySelector('[data-dialog-quote]');
    var name = title ? title.textContent.trim() : '';
    dialog.querySelector('[data-dialog-title]').textContent = name;
    dialog.querySelector('[data-dialog-content]').innerHTML = detail ? detail.innerHTML : '';
    if (quote) quote.href = '/contact/?product=' + encodeURIComponent(name) + '#enquiry';
    dialog.showModal();
  }

  if (dialog) {
    cards.forEach(function (card) {
      var trigger = card.querySelector('[data-product-open]');
      if (trigger) trigger.addEventListener('click', function () { openDetail(card); });
    });
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog || event.target.closest('[data-dialog-close]')) dialog.close();
    });
  }

  applyUrlState();
  apply();
})();
