import { useMemo, useState } from 'react';
import { AppShell, Badge, Button, Stack } from '@mofeed/ui';
import { track } from '@mofeed/analytics';
import { hubApps, type HubApp } from './apps.generated';

type FilterKey = 'all' | 'tier1' | 'tier2' | string;

const CATEGORY_LABELS: Record<string, string> = {
  islamic: 'إسلامي',
  history: 'تاريخ',
  'world-history': 'تاريخ عالمي',
  'regional-history': 'تاريخ المنطقة',
  'saudi-history': 'تاريخ سعودي',
  football: 'كرة قدم',
  'saudi-football': 'كرة قدم سعودية',
  decision: 'قرار',
  knowledge: 'معرفة عامة',
  'general-knowledge': 'معرفة عامة',
  'critical-thinking': 'تفكير ناقد',
  'media-literacy': 'وعي إعلامي',
  story: 'قصة',
  reasoning: 'استدلال',
  detective: 'تحقيق',
  personality: 'شخصية',
  poll: 'استطلاع',
  speculative: 'افتراضي',
  policy: 'سياسات',
};

function buildSubdomainUrl(slug: string): string {
  // Production: VITE_SUBDOMAIN_BASE → https://<slug>.<base>/
  // Local dev: VITE_LOCAL_PORT_MAP is a JSON `{slug: port}` so the hub links
  // click through to live preview servers. Falls back to a hash anchor when
  // neither is set, which is what the smoke tests assert against.
  const base = import.meta.env.VITE_SUBDOMAIN_BASE;
  if (base) return `https://${slug}.${base}/`;
  const localMapRaw = import.meta.env.VITE_LOCAL_PORT_MAP;
  if (localMapRaw) {
    try {
      const map = JSON.parse(localMapRaw) as Record<string, number>;
      const port = map[slug];
      if (typeof port === 'number') return `http://127.0.0.1:${port}/`;
    } catch {
      // ignore malformed env, fall through to anchor
    }
  }
  return `#${slug}`;
}

function AppCard({ app }: { app: HubApp }) {
  const initial = app.nameAr[0] ?? '?';
  const url = buildSubdomainUrl(app.slug);
  return (
    <a
      className="hub-card"
      href={url}
      aria-label={`${app.nameAr} — ${app.nameEn}`}
      onClick={() => track('hub_app_click', { app: app.slug })}
      data-testid="hub-card"
      data-slug={app.slug}
      style={{ ['--t-card-accent' as string]: app.accent }}
    >
      <div className="hub-card__accent" style={{ background: app.accent }} aria-hidden="true">
        {initial}
      </div>
      <div className="hub-card__title">
        <span className="hub-card__name-ar">{app.nameAr}</span>
        <span className="hub-card__name-en">{app.nameEn}</span>
      </div>
      <p className="hub-card__desc">{app.descAr}</p>
      <div className="hub-card__footer">
        <Badge>{CATEGORY_LABELS[app.category] ?? app.category}</Badge>
        {app.tier === 1 ? (
          <Badge tone="info">جاهز</Badge>
        ) : (
          <Badge tone="warning">قيد التطوير</Badge>
        )}
        <span className="hub-card__cta">افتح ←</span>
      </div>
    </a>
  );
}

export default function App() {
  const [filter, setFilter] = useState<FilterKey>('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const a of hubApps) set.add(a.category);
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return hubApps;
    if (filter === 'tier1') return hubApps.filter((a) => a.tier === 1);
    if (filter === 'tier2') return hubApps.filter((a) => a.tier === 2);
    return hubApps.filter((a) => a.category === filter);
  }, [filter]);

  const onPick = (key: FilterKey) => {
    setFilter(key);
    track('hub_filter', { key: String(key) });
  };

  return (
    <AppShell titleAr="مفيد" titleEn="Mofeed">
      <div className="hub-main">
        <div className="hub-hero">
          <h1>مفيد — تطبيقات صغيرة</h1>
          <p>
            مجموعة من 30 تطبيقًا صغيرًا تفاعليًا باللغة العربية: السيرة النبوية، التاريخ السعودي،
            ألعاب القرار، اختبارات معرفية، تحقيق وتفكير — كل تطبيق مستقل ويعمل بسرعة على الجوال.
          </p>
        </div>

        <div className="hub-filter" role="toolbar" aria-label="تصفية التطبيقات">
          <Button variant={filter === 'all' ? 'primary' : 'ghost'} onClick={() => onPick('all')}>
            الكل ({hubApps.length})
          </Button>
          <Button variant={filter === 'tier1' ? 'primary' : 'ghost'} onClick={() => onPick('tier1')}>
            جاهزة
          </Button>
          <Button variant={filter === 'tier2' ? 'primary' : 'ghost'} onClick={() => onPick('tier2')}>
            قيد التطوير
          </Button>
          {categories.map((c) => (
            <Button
              key={c}
              variant={filter === c ? 'primary' : 'ghost'}
              onClick={() => onPick(c)}
              aria-pressed={filter === c}
            >
              {CATEGORY_LABELS[c] ?? c}
            </Button>
          ))}
        </div>

        <Stack>
          <div className="hub-grid" role="list">
            {filtered.map((a) => (
              <AppCard key={a.slug} app={a} />
            ))}
          </div>
        </Stack>
      </div>
    </AppShell>
  );
}
