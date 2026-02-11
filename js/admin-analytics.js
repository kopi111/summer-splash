/**
 * Admin Analytics – Dashboard overview with stat cards
 */

import { getData, getLocalCollection } from './data-service.js';

export async function initAdminAnalytics() {
  await renderAnalytics();
}

async function renderAnalytics() {
  const container = document.getElementById('analytics-cards');
  if (!container) return;

  const [testimonials, references] = await Promise.all([
    getData('testimonials'),
    getData('references')
  ]);

  const contacts = getLocalCollection('contacts');

  const totalReviews = testimonials.length;
  const pendingReviews = testimonials.filter(t => t.status === 'pending').length;
  const approvedReviews = testimonials.filter(t => !t.status || t.status === 'approved').length;
  const avgRating = totalReviews > 0
    ? (testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / totalReviews).toFixed(1)
    : '—';
  const totalContacts = contacts.length;
  const totalReferences = Array.isArray(references) ? references.length : 0;

  const stats = [
    { label: 'Contact Submissions', value: totalContacts, icon: 'mail', color: 'aqua' },
    { label: 'Total Reviews', value: totalReviews, icon: 'star', color: 'coral' },
    { label: 'Pending Approval', value: pendingReviews, icon: 'clock', color: 'yellow' },
    { label: 'Approved Reviews', value: approvedReviews, icon: 'check', color: 'green' },
    { label: 'Avg. Rating', value: avgRating, icon: 'bar', color: 'aqua' },
    { label: 'References', value: totalReferences, icon: 'briefcase', color: 'coral' }
  ];

  container.innerHTML = stats.map(s => `
    <div class="analytics-card analytics-card--${s.color}">
      <div class="analytics-card__icon">${getIcon(s.icon)}</div>
      <div class="analytics-card__value">${s.value}</div>
      <div class="analytics-card__label">${s.label}</div>
    </div>
  `).join('');
}

function getIcon(name) {
  const icons = {
    mail: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    star: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    clock: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    check: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    bar: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    briefcase: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>'
  };
  return icons[name] || '';
}
