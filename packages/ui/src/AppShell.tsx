import type { ReactNode } from 'react';

export interface AppShellProps {
  /** Arabic app name shown in the header. */
  titleAr: string;
  /** Optional English subtitle (slug-style). */
  titleEn?: string;
  /** Optional right-aligned header content (e.g., timer, progress). */
  headerExtra?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Read a public env flag, treating "true"/"1" as truthy and everything
 * else as false. Used by the footer placeholders so apps can flip
 * features on at build time without code changes.
 */
function envFlag(value: string | undefined): boolean {
  return value === 'true' || value === '1';
}

function DefaultFooter() {
  // Read at runtime so it works in jsdom tests where import.meta.env is undefined.
  const meta = import.meta as unknown as { env?: Record<string, string | undefined> };
  const env = meta.env ?? {};
  const showSupport = envFlag(env.VITE_ENABLE_SUPPORT_LINK);
  const showPro = envFlag(env.VITE_ENABLE_PRO_PLACEHOLDER);

  return (
    <>
      <span>© مفيد — تطبيقات صغيرة</span>
      <span className="mf-muted">المحتوى الواقعي مستند إلى مصادر موثقة.</span>
      {(showSupport || showPro) && (
        <span className="mf-footer-actions" data-testid="footer-actions">
          {showSupport ? (
            <a href="#support" className="mf-footer-link" data-testid="support-link">
              ادعم المشروع
            </a>
          ) : null}
          {showPro ? (
            <a href="#pro" className="mf-footer-link" data-testid="pro-link">
              النسخة المميّزة
            </a>
          ) : null}
        </span>
      )}
    </>
  );
}

/**
 * The shell every mini app renders inside. Provides:
 * - skip link
 * - sticky header with Arabic title
 * - main region with sane width
 * - footer with content-policy link placeholder
 *
 * RTL is set by index.html (<html dir="rtl">). The shell doesn't
 * fight CSS direction — it uses logical properties (inset-inline-*).
 */
export function AppShell({ titleAr, titleEn, headerExtra, children, footer }: AppShellProps) {
  return (
    <div className="mf-app-shell" data-testid="app-root">
      <a href="#mf-main" className="mf-skip-link">
        تجاوز إلى المحتوى
      </a>
      <header className="mf-app-header" role="banner">
        <div className="mf-app-header__title">
          <span>{titleAr}</span>
          {titleEn ? <small dir="ltr">{titleEn}</small> : null}
        </div>
        {headerExtra ? <div>{headerExtra}</div> : null}
      </header>
      <main id="mf-main" className="mf-app-main" role="main">
        {children}
      </main>
      <footer className="mf-app-footer" role="contentinfo">
        {footer ?? <DefaultFooter />}
      </footer>
    </div>
  );
}
