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
    'url': 'https://www.summersplashpools.com',
    'telephone': '+1-757-508-4293',
    'email': 'info@summersplashpools.com',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '700 Tech Center Parkway',
      'addressLocality': 'Newport News',
      'addressRegion': 'VA',
      'postalCode': '23606',
      'addressCountry': 'US'
    },
    'sameAs': [
      'https://www.instagram.com/summersplashpoolservices',
      'https://www.facebook.com/share/1C3ETpcRN9/'
    ]
  };

  const schemas = { index: baseOrg };

  schemas.services = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'provider': { '@type': 'LocalBusiness', 'name': 'Summer Splash Pool Services' },
    'serviceType': 'Pool Services',
    'areaServed': [
      { '@type': 'City', 'name': 'Richmond, VA' },
      { '@type': 'Place', 'name': 'Hampton Roads, VA' }
    ]
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
