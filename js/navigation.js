/**
 * Navigation – Hamburger toggle, sticky scroll effect, active link highlight
 */

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

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    btn.classList.toggle('is-active', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      btn.classList.remove('is-active');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      btn.classList.remove('is-active');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      btn.focus();
    }
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
