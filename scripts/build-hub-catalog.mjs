#!/usr/bin/env node
// Regenerates apps/hub/src/apps.generated.ts from scripts/apps.manifest.mjs.
// Run after editing the manifest, or as part of CI before building the hub.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { apps } from './apps.manifest.mjs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const items = apps.map((a) => ({
  slug: a.slug,
  nameAr: a.nameAr,
  nameEn: a.nameEn,
  descAr: a.descAr,
  category: a.category,
  engine: a.engine,
  accent: a.accent,
  tier: a.tier,
}));

const out = `// AUTO-GENERATED from scripts/apps.manifest.mjs. Do not edit manually.
// Re-run \`node scripts/build-hub-catalog.mjs\` after editing the manifest.

export interface HubApp {
  slug: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  category: string;
  engine: string;
  accent: string;
  tier: 1 | 2;
}

export const hubApps: HubApp[] = ${JSON.stringify(items, null, 2)};
`;

await fs.writeFile(path.join(root, 'apps', 'hub', 'src', 'apps.generated.ts'), out);
console.log(`Wrote apps.generated.ts with ${items.length} apps.`);
