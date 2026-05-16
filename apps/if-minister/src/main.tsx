import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import { applyTheme } from '@mofeed/ui';
import '@mofeed/ui/styles.css';
import './theme.css';
import App from './App';

applyHeadMeta({
  slug: 'if-minister',
  titleAr: 'لو كنت وزيرًا',
  titleEn: 'If You Were a Minister',
  descriptionAr: "محاكاة قرارات وزارية — تواجه سيناريوهات في الخدمات والاقتصاد والتعليم وتختار، ثم نشرح أثر كل خيار.",
  category: 'decision',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

applyTheme('if-minister', 'decision');

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
