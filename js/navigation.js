/**
 * Navigation – Hamburger toggle, sticky scroll effect, active link highlight
 */

import { trapFocus } from './accessibility.js';

export function initNavigation() {
  const header = document.querySelector('.header');
  if (!header) return;

  initHamburger(header);
  initStickyScroll(header);
  highlightActiveLink();
}

function initHamburger(header) {
  const btn = header.querySelector('.hamburger');
  const nav = header.querySelector('.nav');
  if (!btn || !nav) return;

  let releaseFocus = null;

  function open() {
    nav.classList.add('is-open');
    btn.classList.add('is-active');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    releaseFocus = trapFocus(nav);
  }

  function close({ returnFocus = false } = {}) {
    nav.classList.remove('is-open');
    btn.classList.remove('is-active');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    releaseFocus?.();
    releaseFocus = null;
    if (returnFocus) btn.focus();
  }

  btn.addEventListener('click', () => {
    nav.classList.contains('is-open') ? close() : open();
  });

  nav.querySelectorAll('.nav__link, .nav__cta a').forEach(link => {
    link.addEventListener('click', () => close());
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) close({ returnFocus: true });
  });
}

function initStickyScroll(header) {
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('is-scrolled', window.scrollY > 10);
        ticking = false;
      });
      ticking = true;
    }
  });
}

function highlightActiveLink() {
  const page = document.body.dataset.page;
  if (!page) return;

  document.querySelectorAll('.nav__link[data-page]').forEach(link => {
    link.classList.toggle('is-active', link.dataset.page === page);
  });
}
