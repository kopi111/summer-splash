/**
 * Structured Data – JSON-LD schema injection per page
 */

export function injectStructuredData() {
  const page = document.body.dataset.page;

  const baseOrg = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'Summer Splash Pool Services',
    'description': 'Professional pool management, maintenance, renovation, and repair services for commercial and residential clients.',
    'url': 'https://summersplash.com',
    'telephone': '(555) 123-4567',
    'email': 'info@summersplash.com',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '123 Pool Lane',
      'addressLocality': 'Sunnyvale',
      'addressRegion': 'FL',
      'postalCode': '33701',
      'addressCountry': 'US'
    },
    'sameAs': [
      'https://instagram.com/summersplash',
      'https://facebook.com/summersplash',
      'https://tiktok.com/@summersplash'
    ]
  };

  const schemas = { index: baseOrg };

  schemas.services = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'provider': { '@type': 'LocalBusiness', 'name': 'Summer Splash Pool Services' },
    'serviceType': 'Pool Services',
    'areaServed': { '@type': 'State', 'name': 'Florida' }
  };

  schemas.about = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'mainEntity': baseOrg
  };

  schemas.contact = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    'mainEntity': baseOrg
  };

  const data = schemas[page];
  if (!data) return;

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}
