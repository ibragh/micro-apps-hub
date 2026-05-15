import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import '@mofeed/ui/styles.css';
import App from './App';

applyHeadMeta({
  slug: 'thinking-compass',
  titleAr: 'بوصلة التفكير',
  titleEn: 'Thinking Compass',
  descriptionAr: "اختبار أسلوب التفكير: حذر، تحليلي، جريء، دبلوماسي، عاطفي، عملي، استراتيجي.",
  category: 'personality',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
