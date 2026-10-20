/* Enquiry form: inline validation, then a normal POST that Netlify Forms receives.
   Netlify stores each enquiry behind its login and emails it to the addresses set in
   Site configuration > Forms > Form notifications. The form only works on the deployed
   site: opened from the file system, submitting just shows the thank-you page. */
(function () {
  'use strict';

  var form = document.querySelector('[data-enquiry-form]');
  if (!form) return;

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_PATTERN = /^[+0-9][0-9\s\-()]{6,}$/;

  var status = form.querySelector('[data-form-status]');
  var submit = form.querySelector('[type="submit"]');
  // Visible fields only: the hidden form name and the spam trap are not validated.
  var fields = Array.prototype.slice.call(
    form.querySelectorAll('input[name]:not([type="hidden"]):not([name="bot-field"]), select[name], textarea[name]')
  );

  function valueOf(field) {
    return String(field.value || '').trim();
  }

  function errorFor(field) {
    var value = valueOf(field);
    if (field.required && !value) return 'This field is required.';
    if (value && field.type === 'email' && !EMAIL_PATTERN.test(value)) return 'Enter a valid email address.';
    if (value && field.type === 'tel' && !PHONE_PATTERN.test(value)) return 'Enter a valid phone number.';
    return '';
  }

  function showError(field, message) {
    var wrap = field.closest('.field');
    if (!wrap) return;
    var slot = wrap.querySelector('.field__error');
    wrap.classList.toggle('is-invalid', Boolean(message));
    field.setAttribute('aria-invalid', String(Boolean(message)));
    if (slot) {
      slot.textContent = message;
      slot.hidden = !message;
    }
  }

  function validateAll() {
    return fields.reduce(function (firstInvalid, field) {
      var message = errorFor(field);
      showError(field, message);
      return firstInvalid || (message ? field : null);
    }, null);
  }

  function setStatus(message, isError) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-error', Boolean(isError));
  }

  function prefillFromUrl() {
    var product = new URLSearchParams(window.location.search).get('product');
    var message = form.elements.message;
    var select = form.elements.product;
    if (!product) return;
    if (select) {
      Array.prototype.forEach.call(select.options, function (option) {
        if (option.text === product) select.value = option.value;
      });
    }
    if (message && !message.value) {
      message.value = 'I would like a quote for: ' + product.slice(0, 120) + '\n';
    }
  }

  fields.forEach(function (field) {
    field.addEventListener('blur', function () { showError(field, errorFor(field)); });
  });

  form.addEventListener('submit', function (event) {
    var firstInvalid = validateAll();
    if (firstInvalid) {
      event.preventDefault();
      setStatus('Please correct the highlighted fields.', true);
      firstInvalid.focus();
      return;
    }
    // Valid: let the browser post the form. Disable the button so a double click
    // does not send the same enquiry twice.
    if (submit) submit.disabled = true;
    setStatus('Sending your enquiry...', false);
  });

  // Coming back to this page with the browser's back button restores the old state.
  window.addEventListener('pageshow', function () {
    if (submit) submit.disabled = false;
    setStatus('', false);
  });

  prefillFromUrl();
})();
