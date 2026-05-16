import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import { applyTheme } from '@mofeed/ui';
import '@mofeed/ui/styles.css';
import './hub.css';
import './theme.css';
import App from './App';

applyTheme('hub', 'static');

applyHeadMeta({
  slug: 'hub',
  titleAr: 'مفيد — تطبيقات صغيرة',
  titleEn: 'Mofeed Mini Apps',
  descriptionAr:
    'مجموعة من 30 تطبيقًا صغيرًا تفاعليًا باللغة العربية: السيرة، التاريخ السعودي، اختبارات، قرارات، محاكاة، وألعاب فكر.',
  category: 'hub',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
