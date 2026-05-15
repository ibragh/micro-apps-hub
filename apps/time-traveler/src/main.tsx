import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import '@mofeed/ui/styles.css';
import App from './App';

applyHeadMeta({
  slug: 'time-traveler',
  titleAr: 'المسافر عبر الزمن',
  titleEn: 'Time Traveler',
  descriptionAr: "تجد نفسك في حقبة تاريخية: ماذا تختار؟ خياراتك تُقيَّم ضمن السياق التاريخي الموثق لتلك الحقبة.",
  category: 'history',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
