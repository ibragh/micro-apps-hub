/**
 * Pluggable analytics interface. Default implementation: Plausible
 * (cookieless, privacy-friendly, no banner needed).
 *
 * Apps call:
 *   import { initAnalytics, track } from '@mofeed/analytics';
 *   initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });
 *   track('quiz_complete', { score: 80 });
 *
 * If domain is empty, init is a no-op and track() also no-ops.
 */

export interface AnalyticsConfig {
  domain?: string;          // your Plausible site domain
  host?: string;            // self-host? defaults to https://plausible.io
}

let _domain = '';
let _host = 'https://plausible.io';
let _enabled = false;

export function initAnalytics(config: AnalyticsConfig): void {
  if (!config.domain || typeof document === 'undefined') return;
  _domain = config.domain;
  _host = config.host || _host;

  if (document.querySelector('script[data-mofeed-analytics]')) return;
  const s = document.createElement('script');
  s.setAttribute('data-mofeed-analytics', '1');
  s.setAttribute('data-domain', _domain);
  s.defer = true;
  s.src = `${_host}/js/script.js`;
  document.head.appendChild(s);
  _enabled = true;
}

export function track(event: string, props?: Record<string, string | number | boolean>): void {
  if (!_enabled || typeof window === 'undefined') return;
  const w = window as unknown as { plausible?: (e: string, opts?: { props?: Record<string, unknown> }) => void };
  try {
    w.plausible?.(event, props ? { props } : undefined);
  } catch {
    /* analytics must never throw into the app */
  }
}
