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
        ${'&#9733;'.repeat(t.rating)}${'&#9734;'.repeat(5 - t.rating)}
      </div>
      <p class="testimonial-card__text">"${escapeHtml(t.text)}"</p>
      <div class="testimonial-card__author">
        <img class="testimonial-card__avatar" src="${escapeHtml(t.photo)}" alt="${escapeHtml(t.name)}" width="48" height="48" loading="lazy">
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

  // Star rating interactive
  const starContainer = form.querySelector('.star-rating-input');
  const ratingInput = form.querySelector('#review-rating');
  if (starContainer && ratingInput) {
    const stars = starContainer.querySelectorAll('.star-btn');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const val = star.dataset.value;
        ratingInput.value = val;
        stars.forEach(s => {
          s.classList.toggle('is-active', Number(s.dataset.value) <= Number(val));
        });
      });
      star.addEventListener('mouseenter', () => {
        const val = star.dataset.value;
        stars.forEach(s => {
          s.classList.toggle('is-hover', Number(s.dataset.value) <= Number(val));
        });
      });
      star.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('is-hover'));
      });
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#review-name')?.value.trim();
    const property = form.querySelector('#review-property')?.value.trim() || '';
    const rating = Number(ratingInput?.value) || 5;
    const text = form.querySelector('#review-text')?.value.trim();
    const consent = form.querySelector('#review-consent')?.checked;

    if (!name || !text) {
      alert('Please fill in your name and review.');
      return;
    }
    if (!consent) {
      alert('Please agree to the privacy policy to submit your review.');
      return;
    }

    const review = {
      id: 't_' + Date.now(),
      customerId: getCustomerId(),
      name,
      property,
      role: 'Customer',
      location: '',
      rating,
      text,
      date: new Date().toISOString().split('T')[0],
      photo: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop&crop=face',
      status: 'pending'
    };

    addItem('testimonials', review);
    form.reset();

    // Reset stars
    if (starContainer) {
      starContainer.querySelectorAll('.star-btn').forEach(s => s.classList.remove('is-active'));
    }

    // Show success
    const successEl = document.getElementById('review-success');
    if (successEl) successEl.classList.add('is-visible');
    form.style.display = 'none';
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
