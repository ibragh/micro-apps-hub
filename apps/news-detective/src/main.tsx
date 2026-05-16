import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyHeadMeta } from '@mofeed/seo';
import { initAnalytics } from '@mofeed/analytics';
import { applyTheme } from '@mofeed/ui';
import '@mofeed/ui/styles.css';
import './theme.css';
import App from './App';

applyHeadMeta({
  slug: 'news-detective',
  titleAr: 'محقق الأخبار',
  titleEn: 'News Detective',
  descriptionAr: "لعبة وعي إعلامي. تقرأ سيناريو خبري افتراضي وتقرر: صحيح، مضلل، ناقص السياق، أم مفبرك؟",
  category: 'media-literacy',
});

initAnalytics({ domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN });

applyTheme('news-detective', 'clue');

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
