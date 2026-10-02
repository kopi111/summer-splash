/**
 * Testimonials Page – Render testimonials grid + references table + review form (public)
 */

import { getData, addItem, getLocalCollection, saveLocalCollection } from './data-service.js';

export async function initTestimonialsPage() {
  await Promise.all([
    renderTestimonials(),
    renderReferences()
  ]);
  initReviewForm();
}

async function renderTestimonials() {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;

  const testimonials = await getData('testimonials');

  // Only show approved testimonials (baseline without status = approved)
  const approved = testimonials.filter(t => !t.status || t.status === 'approved');

  if (approved.length === 0) {
    grid.innerHTML = '<p class="text-center">No testimonials yet.</p>';
    return;
  }

  grid.innerHTML = approved.map((t) => `
    <div class="testimonial-card">
      <div class="stars" aria-label="${t.rating} out of 5 stars">
        <span class="stars__on">${'&#9733;'.repeat(t.rating)}</span><span class="stars__off">${'&#9734;'.repeat(5 - t.rating)}</span>
      </div>
      <p class="testimonial-card__text">"${escapeHtml(t.text)}"</p>
      <div class="testimonial-card__author">
        <img class="testimonial-card__avatar" src="${escapeHtml(t.photo)}" alt="" width="48" height="48" loading="lazy" onerror="this.src='assets/avatar-fallback.svg'">
        <div>
          <div class="testimonial-card__name">${escapeHtml(t.name)}</div>
          ${t.property ? `<div class="testimonial-card__property">${escapeHtml(t.property)}</div>` : ''}
          <div class="testimonial-card__meta">${escapeHtml(t.role)} &middot; ${escapeHtml(t.location)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

async function renderReferences() {
  const tbody = document.getElementById('references-tbody');
  if (!tbody) return;

  const references = await getData('references');

  if (references.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">No references available.</td></tr>';
    return;
  }

  tbody.innerHTML = references.map(r => `
    <tr>
      <td>
        <div class="ref-company">${escapeHtml(r.company)}</div>
        <div style="font-size: var(--text-xs); color: var(--color-gray-400); margin-top: 2px;">${escapeHtml(r.address || '')}</div>
      </td>
      <td>
        <div>${escapeHtml(r.contact)}</div>
        ${r.phone ? `<div style="font-size: var(--text-xs); color: var(--color-gray-400); margin-top: 2px;">${escapeHtml(r.phone)}</div>` : ''}
      </td>
      <td><span class="ref-service">${escapeHtml(r.service)}</span></td>
      <td>${escapeHtml(r.dateFrom || '')} &ndash; ${escapeHtml(r.dateTo || '')}</td>
    </tr>
  `).join('');
}

function getCustomerId() {
  let id = localStorage.getItem('ss_customer_id');
  if (!id) {
    id = 'cust_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem('ss_customer_id', id);
  }
  return id;
}

function initReviewForm() {
  const form = document.getElementById('review-form');
  if (!form) return;

  const starContainer = form.querySelector('.star-rating-input');
  const ratingInput = form.querySelector('#review-rating');
  if (starContainer && ratingInput) initStarRating(starContainer, ratingInput);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitReview(form, ratingInput, starContainer);
  });

  document.getElementById('write-another-review')
    ?.addEventListener('click', () => resetReviewForm(form, ratingInput, starContainer));
}

function initStarRating(container, ratingInput) {
  const stars = [...container.querySelectorAll('.star-btn')];

  const paint = (value, className) =>
    stars.forEach(s => s.classList.toggle(className, Number(s.dataset.value) <= value));

  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = Number(star.dataset.value);
      ratingInput.value = String(value);
      paint(value, 'is-active');
      stars.forEach(s => s.setAttribute('aria-checked', String(s === star)));
      showFieldError(container, '');
    });
    star.addEventListener('mouseenter', () => paint(Number(star.dataset.value), 'is-hover'));
    star.addEventListener('mouseleave', () => paint(0, 'is-hover'));
  });
}

function submitReview(form, ratingInput, starContainer) {
  const name = form.querySelector('#review-name')?.value.trim();
  const property = form.querySelector('#review-property')?.value.trim() || '';
  const rating = Number(ratingInput?.value);
  const text = form.querySelector('#review-text')?.value.trim();
  const consent = form.querySelector('#review-consent')?.checked;

  const problem = firstProblem({ name, rating, text, consent }, form, starContainer);
  if (problem) {
    problem.scrollIntoView({ block: 'center', behavior: 'smooth' });
    problem.focus?.({ preventScroll: true });
    return;
  }

  addItem('testimonials', {
    id: 't_' + Date.now(),
    customerId: getCustomerId(),
    name,
    property,
    role: 'Customer',
    location: '',
    rating,
    text,
    date: new Date().toISOString().split('T')[0],
    photo: 'assets/avatar-fallback.svg',
    status: 'pending'
  });

  form.style.display = 'none';
  const successEl = document.getElementById('review-success');
  if (successEl) {
    successEl.classList.add('is-visible');
    const heading = successEl.querySelector('h3');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus();
  }
}

/**
 * Returns the first element the visitor needs to fix, after writing its message.
 */
function firstProblem({ name, rating, text, consent }, form, starContainer) {
  const nameField = form.querySelector('#review-name');
  const textField = form.querySelector('#review-text');
  const consentField = form.querySelector('#review-consent');

  showFieldError(nameField, name ? '' : 'Please tell us your name.');
  showFieldError(starContainer, rating ? '' : 'Please choose a rating from one to five stars.');
  showFieldError(textField, text ? '' : 'Please write a few words about your experience.');
  showFieldError(consentField, consent ? '' : 'Please agree to the privacy policy to submit.');

  if (!name) return nameField;
  if (!rating) return starContainer.querySelector('.star-btn');
  if (!text) return textField;
  if (!consent) return consentField;
  return null;
}

function showFieldError(element, message) {
  const group = element?.closest('.form-group');
  const errorEl = group?.querySelector('.form-error');
  if (!errorEl) return;
  errorEl.textContent = message;
  errorEl.classList.toggle('is-visible', Boolean(message));
  if (element?.classList) element.classList.toggle('is-error', Boolean(message));
  if (element?.setAttribute && element.tagName !== 'DIV') {
    element.setAttribute('aria-invalid', String(Boolean(message)));
  }
}

function resetReviewForm(form, ratingInput, starContainer) {
  document.getElementById('review-success')?.classList.remove('is-visible');
  form.style.display = '';
  form.reset();
  if (ratingInput) ratingInput.value = '';
  starContainer?.querySelectorAll('.star-btn').forEach(s => {
    s.classList.remove('is-active', 'is-hover');
    s.setAttribute('aria-checked', 'false');
  });
  form.querySelectorAll('.form-error').forEach(e => {
    e.textContent = '';
    e.classList.remove('is-visible');
  });
  form.querySelector('#review-name')?.focus();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
