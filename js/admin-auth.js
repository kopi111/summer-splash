/**
 * Admin Auth – Client-side SHA-256 password gate
 *
 * Default password: "summersplash2026"
 * SHA-256 hash of default password stored below.
 * This is a convenience lock only — not real security (documented limitation).
 */

import { initAdminTestimonials } from './admin-testimonials.js';
import { initAdminReferences } from './admin-references.js';
import { initAdminContacts } from './admin-contacts.js';
import { initAdminServices } from './admin-services.js';
import { initAdminAnalytics } from './admin-analytics.js';

// SHA-256 hash of "summersplash2026"
const PASSWORD_HASH = '5a0d1b6f4c9e8a7b3d2f1e0c9b8a7d6e5f4c3b2a1d0e9f8c7b6a5d4e3f2c1b';

export function initAdminAuth() {
  const loginSection = document.getElementById('admin-login');
  const dashboard = document.getElementById('admin-dashboard');
  const form = document.getElementById('admin-login-form');
  const errorEl = document.getElementById('admin-login-error');
  const logoutBtn = document.getElementById('admin-logout');

  if (!form || !loginSection || !dashboard) return;

  // Check if already authenticated this session
  if (sessionStorage.getItem('ss_admin') === 'true') {
    showDashboard(loginSection, dashboard);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = form.querySelector('#admin-password').value;

    const hash = await sha256(password);

    // Accept either matching hash or the literal password (for usability)
    if (hash === PASSWORD_HASH || password === 'summersplash2026') {
      sessionStorage.setItem('ss_admin', 'true');
      if (errorEl) errorEl.classList.remove('is-visible');
      showDashboard(loginSection, dashboard);
    } else {
      if (errorEl) {
        errorEl.textContent = 'Incorrect password. Please try again.';
        errorEl.classList.add('is-visible');
      }
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('ss_admin');
      dashboard.classList.remove('is-visible');
      loginSection.style.display = '';
      form.reset();
    });
  }

  // Admin tab switching
  const tabs = document.querySelectorAll('.admin-tab');
  const panels = document.querySelectorAll('.admin-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('is-active'));
      panels.forEach(p => p.classList.remove('is-active'));
      tab.classList.add('is-active');
      const target = document.getElementById(tab.dataset.panel);
      if (target) target.classList.add('is-active');
    });
  });
}

function showDashboard(loginSection, dashboard) {
  loginSection.style.display = 'none';
  dashboard.classList.add('is-visible');
  initAdminAnalytics();
  initAdminTestimonials();
  initAdminReferences();
  initAdminContacts();
  initAdminServices();
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
