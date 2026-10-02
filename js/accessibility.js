/**
 * Accessibility – Skip link, focus traps for modals, reduced motion detection
 */

export function initAccessibility() {
  initSkipLink();
  initReducedMotion();
}

function initSkipLink() {
  const skipLink = document.querySelector('.skip-link');
  if (!skipLink) return;

  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById('main-content');
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.removeAttribute('tabindex');
    }
  });
}

function initReducedMotion() {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  applyReducedMotion(mq.matches);

  mq.addEventListener('change', (e) => applyReducedMotion(e.matches));
}

function applyReducedMotion(reduced) {
  document.documentElement.dataset.reducedMotion = reduced;
  // The reduced-motion media query neutralises CSS animation only; SMIL inside
  // an <svg> keeps running until the document timeline is paused by hand.
  document.querySelectorAll('svg').forEach(svg => {
    if (typeof svg.pauseAnimations !== 'function') return;
    reduced ? svg.pauseAnimations() : svg.unpauseAnimations();
  });
}

/**
 * Trap focus inside a container (for modals).
 * Returns a cleanup function.
 */
export function trapFocus(container) {
  const focusable = container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  if (focusable.length === 0) return () => {};

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function handler(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  container.addEventListener('keydown', handler);
  first.focus();

  return () => container.removeEventListener('keydown', handler);
}
