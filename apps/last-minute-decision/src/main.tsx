import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import { applyTheme } from '@mofeed/ui';
import '@mofeed/ui/styles.css';
import './theme.css';
import App from './App';

applyHeadMeta({
  slug: 'last-minute-decision',
  titleAr: 'قرار الدقيقة الأخيرة',
  titleEn: 'Last-Minute Decision',
  descriptionAr: "لديك وقت قصير لاتخاذ قرار صعب: عمل، أسرة، إدارة أو رياضة. كل ثانية تحسب.",
  category: 'decision',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

applyTheme('last-minute-decision', 'decision');

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
