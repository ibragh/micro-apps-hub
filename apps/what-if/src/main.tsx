import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import { applyTheme } from '@mofeed/ui';
import '@mofeed/ui/styles.css';
import './theme.css';
import App from './App';

applyHeadMeta({
  slug: 'what-if',
  titleAr: 'ماذا لو؟',
  titleEn: 'What If?',
  descriptionAr: "سيناريوهات تاريخية وافتراضية مُعلَّمة بوضوح كمحتوى خيالي للتأمل لا أكثر.",
  category: 'speculative',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

applyTheme('what-if', 'scenario');

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
