#!/usr/bin/env node
// Naive license scanner: walk every direct & transitive dependency under
// node_modules and ensure the SPDX license is on a known-allowed list.
// Fails if anything is in the "denied" set.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const NM = path.join(ROOT, 'node_modules');

const ALLOWED = new Set([
  'MIT', 'ISC', 'BSD', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0',
  'CC0-1.0', 'CC-BY-3.0', 'CC-BY-4.0', '0BSD', 'Unlicense', 'WTFPL',
  'MPL-2.0', 'Python-2.0', 'BlueOak-1.0.0', 'Zlib',
]);
const DENIED = new Set(['GPL-2.0', 'GPL-3.0', 'AGPL-3.0', 'LGPL-3.0', 'SSPL-1.0']);

async function readJson(p) {
  try { return JSON.parse(await fs.readFile(p, 'utf8')); } catch { return null; }
}

function normaliseLicense(raw) {
  if (!raw) return null;
  if (typeof raw === 'string') {
    // strip "SEE LICENSE IN ..." and "(MIT OR Apache-2.0)" etc.
    return raw.replace(/^\(/, '').replace(/\)$/, '').split(/\s+OR\s+|\s+AND\s+|\s*\|\s*/i)[0]?.trim() || null;
  }
  if (Array.isArray(raw)) return normaliseLicense(raw[0]);
  if (typeof raw === 'object') return raw.type || raw.name || null;
  return null;
}

async function* walkPackages(dir) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const full = path.join(dir, ent.name);
    if (ent.name.startsWith('@')) {
      yield* walkPackages(full);
      continue;
    }
    const pkg = await readJson(path.join(full, 'package.json'));
    if (pkg) yield { dir: full, pkg };
    // recurse into nested node_modules (rare with pnpm but possible)
    yield* walkPackages(path.join(full, 'node_modules'));
  }
}

let denied = 0;
let unknown = 0;
const unknownNames = [];
const deniedNames = [];

for await (const { pkg } of walkPackages(NM)) {
  if (!pkg.name) continue;
  // pnpm puts deps inside `.pnpm/<name>@<v>/node_modules/<name>` — be tolerant.
  const lic = normaliseLicense(pkg.license || pkg.licenses);
  if (!lic) { unknown++; unknownNames.push(pkg.name); continue; }
  if (DENIED.has(lic)) { denied++; deniedNames.push(`${pkg.name} :: ${lic}`); continue; }
  if (!ALLOWED.has(lic)) { unknown++; unknownNames.push(`${pkg.name} :: ${lic}`); }
}

console.log(`Licenses: ${denied} denied, ${unknown} unknown.`);
if (deniedNames.length) {
  console.error('Denied packages:');
  for (const n of deniedNames) console.error('  ' + n);
}
if (unknownNames.length) {
  console.warn(`Unknown/unrecognised license on ${unknownNames.length} package(s). First 5:`);
  for (const n of unknownNames.slice(0, 5)) console.warn('  ' + n);
}

if (denied > 0) process.exit(1);
