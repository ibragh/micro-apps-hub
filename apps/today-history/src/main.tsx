import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import { applyTheme } from '@mofeed/ui';
import '@mofeed/ui/styles.css';
import './theme.css';
import App from './App';

applyHeadMeta({
  slug: 'today-history',
  titleAr: 'حدث في مثل هذا اليوم',
  titleEn: 'Today in History',
  descriptionAr: "أحداث تاريخية موثقة وقعت في مثل هذا اليوم، مع ذكر المصدر لكل حدث.",
  category: 'history',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

applyTheme('today-history', 'timeline');

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
