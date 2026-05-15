import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import '@mofeed/ui/styles.css';
import App from './App';

applyHeadMeta({
  slug: 'saudi-time-machine',
  titleAr: 'آلة الزمن السعودية',
  titleEn: 'Saudi Time Machine',
  descriptionAr: "اختر سنة وشاهد كيف كانت المملكة في تلك الحقبة: أحداث، ملامح اجتماعية، رياضة وثقافة.",
  category: 'saudi-history',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
