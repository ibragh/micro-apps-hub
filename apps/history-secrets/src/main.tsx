import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import { applyTheme } from '@mofeed/ui';
import '@mofeed/ui/styles.css';
import './theme.css';
import App from './App';

applyHeadMeta({
  slug: 'history-secrets',
  titleAr: 'أسرار التاريخ',
  titleEn: 'History Secrets',
  descriptionAr: "قصص وحقائق تاريخية أقل شهرة، كلها موثقة المصدر — لا خرافات.",
  category: 'history',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

applyTheme('history-secrets', 'timeline');

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
