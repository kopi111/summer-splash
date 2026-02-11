/**
 * Main – Entry point, page detection, init orchestration
 */

import { loadComponents } from './components.js';
import { initNavigation } from './navigation.js';
import { initAccessibility } from './accessibility.js';
import { initAnimations } from './animations.js';
import { injectStructuredData } from './structured-data.js';
import { initAnalytics } from './analytics.js';
import { initMetaPixel } from './meta-pixel.js';

async function init() {
  // Load shared header/footer
  await loadComponents();

  // Core functionality
  initNavigation();
  initAccessibility();
  initAnimations();
  injectStructuredData();
  initAnalytics();
  initMetaPixel();

  // Page-specific modules
  const page = document.body.dataset.page;

  switch (page) {
    case 'index':
      import('./carousel.js').then(m => m.initCarousel());
      break;
    case 'testimonials':
      import('./testimonials-page.js').then(m => m.initTestimonialsPage());
      break;
    case 'contact':
      import('./forms.js').then(m => m.initContactForm());
      break;
    case 'admin':
      import('./admin-auth.js').then(m => m.initAdminAuth());
      break;
    case 'my-submissions':
      import('./my-submissions.js').then(m => m.initMySubmissions());
      break;
  }
}

init();
