import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import '@mofeed/ui/styles.css';
import App from './App';

applyHeadMeta({
  slug: 'seerah-quiz',
  titleAr: 'اختبار السيرة النبوية',
  titleEn: 'Seerah Quiz',
  descriptionAr: "اختبار تفاعلي عن سيرة النبي محمد ﷺ — مكة، الهجرة، المدينة، أحداث ومواقف موثقة من مصادر معتمدة.",
  category: 'islamic',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
