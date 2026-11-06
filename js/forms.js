/**
 * Forms – Contact form validation with GDPR consent checkbox
 * Sends each quote request to the business inbox and keeps a copy in localStorage
 * so "My Submissions" can list it
 */

import { getLocalCollection, saveLocalCollection } from './data-service.js';

// Google Apps Script web app (google-apps-script/quote-inbox.gs) that emails info@summersplashpools.com.
// Paste the deployment's /exec URL here after deploying it.
const QUOTE_INBOX_URL = 'https://script.google.com/macros/s/AKfycbxIUrpWMuzgTyZrZ9flT8ZcNGc1XjBVAbmpniDujWItNG6p9XF2fccVYpy37fzU5rgNEg/exec';

export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', handleSubmit);

  form.querySelectorAll('.form-input, .form-textarea, [type="checkbox"]').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener(field.type === 'checkbox' ? 'change' : 'input', () => clearErrorOnceFixed(field));
  });
}

/**
 * Waiting for blur to clear an error lets it vanish on the mousedown of the submit
 * button; the button jumps up under the pointer and the click never lands.
 */
function clearErrorOnceFixed(field) {
  if (field.getAttribute('aria-invalid') === 'true') validateField(field);
}

/**
 * Get or generate a customer ID for this browser
 */
function getCustomerId() {
  let id = localStorage.getItem('ss_customer_id');
  if (!id) {
    id = 'cust_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem('ss_customer_id', id);
  }
  return id;
}

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;

  if (!validateForm(form)) {
    revealFirstError(form);
    return;
  }

  const submission = readSubmission(form);
  setSending(form, true);
  try {
    await sendToInbox(submission, form);
    keepLocalCopy(submission);
    showSuccess(form);
  } catch {
    showSendFailure(form);
  } finally {
    setSending(form, false);
  }
}

function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    if (!validateField(field)) valid = false;
  });
  return valid;
}

function readSubmission(form) {
  return {
    id: 'c_' + Date.now(),
    customerId: getCustomerId(),
    name: form.querySelector('#name')?.value.trim() || '',
    email: form.querySelector('#email')?.value.trim() || '',
    phone: form.querySelector('#phone')?.value.trim() || '',
    poolAddress: form.querySelector('#pool-address')?.value.trim() || '',
    service: form.querySelector('#service')?.value || '',
    message: form.querySelector('#message')?.value.trim() || '',
    date: new Date().toISOString(),
    status: 'new'
  };
}

/**
 * The site has no server, so a Google Apps Script on the client's Workspace account
 * emails each request to the business inbox. Sent as text/plain so the browser does not
 * need a CORS preflight, which Apps Script cannot answer.
 */
async function sendToInbox(submission, form) {
  const response = await fetch(QUOTE_INBOX_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      Name: submission.name,
      Email: submission.email,
      Phone: submission.phone || 'Not given',
      'Pool Address': submission.poolAddress || 'Not given',
      Service: submission.service || 'Not chosen',
      Message: submission.message,
      _honey: form.querySelector('[name="_honey"]')?.value || ''
    })
  });
  const result = await response.json();
  if (!response.ok || String(result.success) !== 'true') {
    throw new Error(result.message || `Quote inbox returned ${response.status}`);
  }
}

function keepLocalCopy(submission) {
  const contacts = getLocalCollection('contacts');
  contacts.push(submission);
  saveLocalCollection('contacts', contacts);
}

function setSending(form, isSending) {
  const button = form.querySelector('[type="submit"]');
  if (!button) return;
  button.disabled = isSending;
  button.setAttribute('aria-busy', String(isSending));
  button.dataset.label ??= button.textContent;
  button.textContent = isSending ? 'Sending…' : button.dataset.label;
  if (isSending) hideSendFailure(form);
}

function showSuccess(form) {
  const successEl = form.closest('.contact-form')?.querySelector('.form-success');
  form.style.display = 'none';
  if (successEl) {
    successEl.classList.add('is-visible');
    announce(successEl);
  }
}

function showSendFailure(form) {
  form.querySelector('.form-send-error')?.classList.add('is-visible');
}

function hideSendFailure(form) {
  form.querySelector('.form-send-error')?.classList.remove('is-visible');
}

/**
 * Move the page and the keyboard to the first field that failed validation.
 * Without this the submit button simply does nothing on a long mobile form.
 */
function revealFirstError(form) {
  const field = form.querySelector('.is-error, [aria-invalid="true"]');
  if (!field) return;
  field.scrollIntoView({ block: 'center', behavior: 'smooth' });
  field.focus({ preventScroll: true });
}

/**
 * Hiding the form drops focus onto the body, so nothing is read out.
 */
function announce(successEl) {
  const heading = successEl.querySelector('h3');
  if (!heading) return;
  heading.setAttribute('tabindex', '-1');
  heading.focus();
}

function validateField(field) {
  const errorEl = field.parentElement.querySelector('.form-error')
    || field.closest('.form-group')?.querySelector('.form-error');

  let message = '';

  if (field.type === 'checkbox') {
    if (field.required && !field.checked) {
      message = 'You must agree to continue.';
    }
  } else if (!field.value.trim()) {
    message = `${getLabel(field)} is required.`;
  } else if (field.type === 'email' && !isValidEmail(field.value)) {
    message = 'Please enter a valid email address.';
  } else if (field.type === 'tel' && field.value.trim() && !isValidPhone(field.value)) {
    message = 'Please enter a valid phone number.';
  }

  if (message) {
    field.classList.add('is-error');
    field.setAttribute('aria-invalid', 'true');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('is-visible');
    }
    return false;
  }

  field.classList.remove('is-error');
  field.setAttribute('aria-invalid', 'false');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('is-visible');
  }
  return true;
}

function getLabel(field) {
  const label = field.closest('.form-group')?.querySelector('.form-label');
  return label ? label.textContent.replace('*', '').trim() : 'This field';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[\d\s\-\+\(\)]{7,}$/.test(phone);
}
