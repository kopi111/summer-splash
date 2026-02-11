/**
 * Meta Pixel – Facebook/Meta pixel initialization
 *
 * Replace 'XXXXXXXXXXXXXXXXX' with your actual Meta Pixel ID.
 * Get your Pixel ID from: https://business.facebook.com/events_manager
 */

const META_PIXEL_ID = 'XXXXXXXXXXXXXXXXX';

export function initMetaPixel() {
  if (META_PIXEL_ID === 'XXXXXXXXXXXXXXXXX') {
    console.info('Meta Pixel: Replace META_PIXEL_ID in js/meta-pixel.js with your actual Pixel ID.');
    return;
  }

  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
}
