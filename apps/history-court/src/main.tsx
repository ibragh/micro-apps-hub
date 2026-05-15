import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import '@mofeed/ui/styles.css';
import App from './App';

applyHeadMeta({
  slug: 'history-court',
  titleAr: 'محكمة التاريخ',
  titleEn: 'History Court',
  descriptionAr: "قضية تاريخية موثقة تُعرض كقضية محكمة، تصوّت: مذنب، بريء، مبرر، أم مثير للجدل؟ نفصل الوقائع عن التحليل.",
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
