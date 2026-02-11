/**
 * My Submissions – Show reviews and contact inquiries submitted from this browser
 * Matched via ss_customer_id in localStorage
 */

import { getData, getLocalCollection } from './data-service.js';

export async function initMySubmissions() {
  const customerId = localStorage.getItem('ss_customer_id');

  if (!customerId) {
    showEmptyState();
    return;
  }

  await Promise.all([
    renderMyReviews(customerId),
    renderMyContacts(customerId)
  ]);
}

async function renderMyReviews(customerId) {
  const container = document.getElementById('my-reviews');
  if (!container) return;

  const testimonials = await getData('testimonials');
  const mine = testimonials.filter(t => t.customerId === customerId);

  if (mine.length === 0) {
    container.innerHTML = '<p class="submissions-empty">You haven\'t submitted any reviews yet. <a href="testimonials.html#leave-review">Leave a review</a></p>';
    return;
  }

  container.innerHTML = mine.map(t => {
    const status = t.status || 'approved';
    const statusClass = status === 'approved' ? 'approved' : status === 'pending' ? 'pending' : 'rejected';

    return `
    <div class="submission-card">
      <div class="submission-card__header">
        <div class="stars" aria-label="${t.rating} out of 5 stars">
          ${'&#9733;'.repeat(t.rating)}${'&#9734;'.repeat(5 - t.rating)}
        </div>
        <span class="status-badge status-badge--${statusClass}">${status}</span>
      </div>
      <p class="submission-card__text">"${escapeHtml(t.text)}"</p>
      <div class="submission-card__meta">
        <span>${escapeHtml(t.name)}</span>
        ${t.property ? `<span>&middot; ${escapeHtml(t.property)}</span>` : ''}
        <span>&middot; ${escapeHtml(t.date)}</span>
      </div>
    </div>
  `}).join('');
}

async function renderMyContacts(customerId) {
  const container = document.getElementById('my-contacts');
  if (!container) return;

  const contacts = getLocalCollection('contacts');
  const mine = contacts.filter(c => c.customerId === customerId);

  if (mine.length === 0) {
    container.innerHTML = '<p class="submissions-empty">You haven\'t submitted any contact inquiries yet. <a href="contact.html">Contact us</a></p>';
    return;
  }

  container.innerHTML = mine.map(c => `
    <div class="submission-card">
      <div class="submission-card__header">
        <strong>${escapeHtml(c.name)}</strong>
        <span class="status-badge status-badge--new">${escapeHtml(c.status || 'new')}</span>
      </div>
      <p class="submission-card__text">${escapeHtml(c.message)}</p>
      <div class="submission-card__meta">
        <span>${escapeHtml(c.email)}</span>
        ${c.service ? `<span>&middot; ${escapeHtml(c.service)}</span>` : ''}
        <span>&middot; ${formatDate(c.date)}</span>
      </div>
    </div>
  `).join('');
}

function showEmptyState() {
  const reviews = document.getElementById('my-reviews');
  const contacts = document.getElementById('my-contacts');

  if (reviews) reviews.innerHTML = '<p class="submissions-empty">No submissions found from this browser. <a href="testimonials.html#leave-review">Leave a review</a> or <a href="contact.html">contact us</a> to get started.</p>';
  if (contacts) contacts.innerHTML = '';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
