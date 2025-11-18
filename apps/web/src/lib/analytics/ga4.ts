/**
 * Google Analytics 4 Integration
 */

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'set' | 'js',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Initialize Google Analytics
 */
export function initGA() {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
  });

  // Load GA script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title,
  });
}

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', eventName, eventParams);
}

/**
 * Track booking events
 */
export const trackBooking = {
  started: () => trackEvent('booking_started'),
  stepCompleted: (step: number) =>
    trackEvent('booking_step_completed', { step }),
  completed: (bookingId: string, amount: number) =>
    trackEvent('booking_completed', {
      booking_id: bookingId,
      value: amount,
      currency: 'INR',
    }),
  cancelled: (bookingId: string) =>
    trackEvent('booking_cancelled', { booking_id: bookingId }),
};

/**
 * Track payment events
 */
export const trackPayment = {
  initiated: (gateway: string, amount: number) =>
    trackEvent('payment_initiated', {
      payment_gateway: gateway,
      value: amount,
      currency: 'INR',
    }),
  completed: (gateway: string, amount: number) =>
    trackEvent('payment_completed', {
      payment_gateway: gateway,
      value: amount,
      currency: 'INR',
    }),
  failed: (gateway: string, amount: number, reason?: string) =>
    trackEvent('payment_failed', {
      payment_gateway: gateway,
      value: amount,
      currency: 'INR',
      failure_reason: reason,
    }),
};

/**
 * Track user actions
 */
export const trackUser = {
  login: () => trackEvent('user_login'),
  logout: () => trackEvent('user_logout'),
  signup: () => trackEvent('user_signup'),
  addToCart: (itemType: string, itemName: string) =>
    trackEvent('add_to_cart', {
      item_type: itemType,
      item_name: itemName,
    }),
  removeFromCart: (itemType: string) =>
    trackEvent('remove_from_cart', { item_type: itemType }),
};

/**
 * Track search events
 */
export function trackSearch(searchTerm: string, resultsCount: number) {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
}

