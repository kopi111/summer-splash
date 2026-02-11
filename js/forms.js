/**
 * Forms – Contact form validation with GDPR consent checkbox
 * Stores submissions in localStorage via data-service
 */

import { addItem, getLocalCollection, saveLocalCollection } from './data-service.js';

export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', handleSubmit);

  // Real-time validation on blur
  form.querySelectorAll('.form-input, .form-textarea').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
  });
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

function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;

  const fields = form.querySelectorAll('[required]');
  let valid = true;

  fields.forEach(field => {
    if (!validateField(field)) valid = false;
  });

  if (!valid) return;

  // Store submission in localStorage
  const submission = {
    id: 'c_' + Date.now(),
    customerId: getCustomerId(),
    name: form.querySelector('#name')?.value.trim() || '',
    email: form.querySelector('#email')?.value.trim() || '',
    phone: form.querySelector('#phone')?.value.trim() || '',
    service: form.querySelector('#service')?.value || '',
    message: form.querySelector('#message')?.value.trim() || '',
    date: new Date().toISOString(),
    status: 'new'
  };

  const contacts = getLocalCollection('contacts');
  contacts.push(submission);
  saveLocalCollection('contacts', contacts);

  // Show success message
  const formEl = form.closest('.contact-form');
  const successEl = formEl?.querySelector('.form-success');

  form.style.display = 'none';
  if (successEl) successEl.classList.add('is-visible');
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
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('is-visible');
    }
    return false;
  }

  field.classList.remove('is-error');
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
