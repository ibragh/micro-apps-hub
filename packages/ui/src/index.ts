export { AppShell } from './AppShell';
export * from './components';

/**
 * Apply a theme + engine to the document body. Idempotent — safe to call
 * from main.tsx. Reads two body data-attributes that drive theme CSS in
 * `packages/ui/src/themes/base.css` and engine motion in `motion.css`.
 *
 * The actual --t-* token values come from each app's own `theme.css`,
 * scoped under `body[data-theme="<slug>"]`.
 */
export function applyTheme(slug: string, engine?: string): void {
  if (typeof document === 'undefined') return;
  document.body.setAttribute('data-theme', slug);
  if (engine) document.body.setAttribute('data-engine', engine);
}
