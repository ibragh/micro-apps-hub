import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import { applyTheme } from '@mofeed/ui';
import '@mofeed/ui/styles.css';
import './theme.css';
import App from './App';

applyHeadMeta({
  slug: 'logic-judge',
  titleAr: 'قاضي المنطق',
  titleEn: 'Logic Judge',
  descriptionAr: "اقرأ حُجَّة وحدد إن كانت سليمة، أم تحتوي مغالطة منطقية، أم استدلالًا عاطفيًا.",
  category: 'critical-thinking',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

applyTheme('logic-judge', 'quiz');

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
