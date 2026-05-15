import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import '@mofeed/ui/styles.css';
import App from './App';

applyHeadMeta({
  slug: 'odd-archive',
  titleAr: 'أرشيف الغرائب',
  titleEn: 'Odd Archive',
  descriptionAr: "حقائق غريبة لكن موثقة من التاريخ والعلوم والثقافة والرياضة.",
  category: 'general-knowledge',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
