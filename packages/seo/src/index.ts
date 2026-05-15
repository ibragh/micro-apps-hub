export interface AppSeo {
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  category: string;
}

/** Apply <title> + meta tags at runtime. Called once from each app's main.tsx. */
export function applyHeadMeta(seo: AppSeo): void {
  if (typeof document === 'undefined') return;
  const origin = (typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_SITE_ORIGIN?: string } }).env?.VITE_SITE_ORIGIN) ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://mofeed-mini-apps.example');

  document.title = `${seo.titleAr} — ${seo.titleEn}`;

  setMeta('description', seo.descriptionAr);
  setMeta('og:title', `${seo.titleAr} — ${seo.titleEn}`, 'property');
  setMeta('og:description', seo.descriptionAr, 'property');
  setMeta('og:type', 'website', 'property');
  setMeta('og:url', `${origin}/`, 'property');
  setMeta('twitter:card', 'summary');
  setMeta('twitter:title', `${seo.titleAr} — ${seo.titleEn}`);
  setMeta('twitter:description', seo.descriptionAr);

  applyJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: seo.titleAr,
    alternateName: seo.titleEn,
    description: seo.descriptionAr,
    inLanguage: 'ar',
    applicationCategory: seo.category,
    url: origin,
  });
}

function setMeta(key: string, value: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function applyJsonLd(data: Record<string, unknown>) {
  const id = 'mf-jsonld';
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}
