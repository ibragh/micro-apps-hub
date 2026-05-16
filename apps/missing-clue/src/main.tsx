import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import { applyTheme } from '@mofeed/ui';
import '@mofeed/ui/styles.css';
import './theme.css';
import App from './App';

applyHeadMeta({
  slug: 'missing-clue',
  titleAr: 'الدليل الناقص',
  titleEn: 'Missing Clue',
  descriptionAr: "قصة ناقصة، استنتج الدليل المفقود من الأدلة المتاحة.",
  category: 'reasoning',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

applyTheme('missing-clue', 'clue');

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
