import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import '@mofeed/ui/styles.css';
import App from './App';

applyHeadMeta({
  slug: 'national-memory',
  titleAr: 'الذاكرة الوطنية',
  titleEn: 'National Memory',
  descriptionAr: "تطبيق ذاكرة وأسئلة عن أحداث وأماكن ورموز ثقافية سعودية موثقة.",
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
