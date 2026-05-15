import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import '@mofeed/ui/styles.css';
import App from './App';

applyHeadMeta({
  slug: 'saudi-mood-map',
  titleAr: 'خريطة المزاج السعودي',
  titleEn: 'Saudi Mood Map',
  descriptionAr: "استطلاع يومي على مواضيع محايدة (طقس، رياضة، عطلة) — بدون مواضيع حساسة.",
  category: 'poll',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
