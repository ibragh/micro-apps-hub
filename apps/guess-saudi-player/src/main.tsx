import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import '@mofeed/ui/styles.css';
import App from './App';

applyHeadMeta({
  slug: 'guess-saudi-player',
  titleAr: 'خمن اللاعب السعودي',
  titleEn: 'Guess the Saudi Player',
  descriptionAr: "احزر اللاعب السعودي من قرائن نصية: المركز، النادي، الإنجازات، والحقبة. بدون صور أو شعارات محمية.",
  category: 'football',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
