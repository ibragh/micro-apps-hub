import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import '@mofeed/ui/styles.css';
import App from './App';

applyHeadMeta({
  slug: 'impossible-choice',
  titleAr: 'القرار المستحيل',
  titleEn: 'Impossible Choice',
  descriptionAr: "خياران كلاهما صعب — اختر ثم شاهد كيف وزن الآخرون نفس المعضلة.",
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
