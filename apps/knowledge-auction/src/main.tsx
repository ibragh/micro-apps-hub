import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import '@mofeed/ui/styles.css';
import App from './App';

applyHeadMeta({
  slug: 'knowledge-auction',
  titleAr: 'مزاد المعرفة',
  titleEn: 'Knowledge Auction',
  descriptionAr: "لديك رصيد افتراضي تراهن منه على ثقتك في إجابة كل سؤال. ثقة أعلى → ربح أعلى وخطر أعلى.",
  category: 'knowledge',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
