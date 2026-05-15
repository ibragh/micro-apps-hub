/**
 * Minimal, dependency-free input + content safety helpers.
 *
 * Used by every app to validate query params, sanitise display strings,
 * and (when absolutely necessary) escape user content before insertion.
 *
 * Where possible apps should bind to React's text rendering, which is
 * already safe. These helpers exist for the edge cases where text comes
 * from a URL fragment, a localStorage value, or a JSON content file
 * authored by a contributor.
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape a string for safe inclusion in HTML text or attribute. */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}

/**
 * Allow only a small charset for user-typed identifiers (e.g., share codes).
 * Drops anything outside the allowlist. Length is capped to 64.
 */
export function safeIdentifier(input: string, maxLen = 64): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, maxLen);
}

/** Coerce to a finite integer in [min, max], or return the fallback. */
export function toBoundedInt(
  raw: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  const n = typeof raw === 'number' ? raw : Number.parseInt(String(raw), 10);
  if (!Number.isFinite(n)) return fallback;
  if (n < min) return min;
  if (n > max) return max;
  return Math.trunc(n);
}

/** True if the string is a syntactically plausible https URL. */
export function isSafeUrl(input: string): boolean {
  try {
    const u = new URL(input);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Trim and collapse whitespace; cap length. */
export function normaliseText(input: string, maxLen = 500): string {
  return input.replace(/\s+/g, ' ').trim().slice(0, maxLen);
}
