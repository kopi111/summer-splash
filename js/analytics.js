/**
 * Analytics – Google Analytics 4 (GA4) initialization
 *
 * Replace 'G-XXXXXXXXXX' with your actual GA4 Measurement ID.
 * Get your Measurement ID from: https://analytics.google.com/
 */

const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

export function initAnalytics() {
  if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    console.info('Analytics: Replace GA_MEASUREMENT_ID in js/analytics.js with your actual GA4 Measurement ID.');
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
}
