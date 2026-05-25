/**
 * Simple Client-side Local Storage Page View Analytics Utility
 */

export function trackPageView() {
  if (typeof window === 'undefined') return;
  try {
    const rawViews = localStorage.getItem('kachua_total_page_views') || '0';
    const currentViews = parseInt(rawViews, 10);
    const nextViews = isNaN(currentViews) ? 1 : currentViews + 1;
    localStorage.setItem('kachua_total_page_views', String(nextViews));
  } catch (e) {
    console.warn('[Analytics] Page view tracking skipped:', e);
  }
}

export function getTotalPageViews(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const rawViews = localStorage.getItem('kachua_total_page_views') || '0';
    const views = parseInt(rawViews, 10);
    return isNaN(views) ? 0 : views;
  } catch (e) {
    return 0;
  }
}
