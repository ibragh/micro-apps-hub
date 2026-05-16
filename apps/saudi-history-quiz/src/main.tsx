import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import { applyTheme } from '@mofeed/ui';
import '@mofeed/ui/styles.css';
import './theme.css';
import App from './App';

applyHeadMeta({
  slug: 'saudi-history-quiz',
  titleAr: 'اختبار تاريخ السعودية',
  titleEn: 'Saudi History Quiz',
  descriptionAr: "اختبار عن تاريخ المملكة العربية السعودية — الدول السعودية، الملوك، أبرز الأحداث، والمناطق.",
  category: 'saudi-history',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

applyTheme('saudi-history-quiz', 'quiz');

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
