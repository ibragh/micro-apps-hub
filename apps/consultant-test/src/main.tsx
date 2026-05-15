import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import '@mofeed/ui/styles.css';
import App from './App';

applyHeadMeta({
  slug: 'consultant-test',
  titleAr: 'اختبار المستشار',
  titleEn: 'Consultant Test',
  descriptionAr: "تتقمص دور مستشار وتقدم توصياتك لقضايا أعمال أو خدمات عامة، ونقيّم أسلوبك.",
  category: 'decision',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
