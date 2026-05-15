#!/usr/bin/env node
// Dependency-free secret scanner. Walks the working tree and looks for
// common secret patterns. Skips node_modules, dist, .git, lockfiles.
// Exits non-zero if anything found.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.pnpm-store',
  '.cache',
  'dist',
  'build',
  '.vite',
  '.turbo',
  'playwright-report',
  'test-results',
  '.playwright',
  'coverage',
]);
const SKIP_FILES = new Set(['pnpm-lock.yaml', 'package-lock.json', 'yarn.lock']);

// Each rule: { name, regex, allow? -> string[] of files that may match }
const RULES = [
  { name: 'AWS Access Key',     regex: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: 'AWS Secret Key',     regex: /\baws_secret_access_key\s*[:=]\s*['"][^'"\s]{30,}['"]/gi },
  { name: 'Google API Key',     regex: /\bAIza[0-9A-Za-z\-_]{30,}\b/g },
  { name: 'Slack Token',        regex: /\bxox[abp]-[A-Za-z0-9-]{10,}/g },
  { name: 'GitHub PAT (ghp_)',  regex: /\bghp_[A-Za-z0-9]{30,}\b/g },
  { name: 'GitHub PAT (gho_)',  regex: /\bgho_[A-Za-z0-9]{30,}\b/g },
  { name: 'GitHub App token',   regex: /\bghs_[A-Za-z0-9]{30,}\b/g },
  { name: 'OpenAI key',         regex: /\bsk-[A-Za-z0-9]{40,}\b/g },
  { name: 'Anthropic key',      regex: /\bsk-ant-[A-Za-z0-9\-_]{30,}\b/g },
  { name: 'Private key block',  regex: /-----BEGIN (RSA|EC|DSA|OPENSSH|PRIVATE) (PRIVATE )?KEY-----/g },
  { name: 'JWT (eyJ...)',       regex: /\beyJ[A-Za-z0-9_\-]{20,}\.eyJ[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}\b/g },
  { name: '.env-like assignment of long secret', regex: /^(API_KEY|SECRET_KEY|PASSWORD|TOKEN)\s*=\s*['"]?[A-Za-z0-9_\-]{30,}/gm },
];

const TEXT_EXT = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.md', '.yml', '.yaml',
  '.html', '.css', '.env', '.txt', '.sh',
]);

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.env.example' && entry.name !== '.github' && entry.name !== '.gitignore' && entry.name !== '.prettierrc.json' && entry.name !== '.editorconfig') {
      // allow specific dotfiles, skip others (already handled by SKIP_DIRS for .git)
    }
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      if (SKIP_FILES.has(entry.name)) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!TEXT_EXT.has(ext) && entry.name !== '.env.example') continue;
      yield full;
    }
  }
}

let findings = 0;
for await (const file of walk(ROOT)) {
  let content;
  try { content = await fs.readFile(file, 'utf8'); } catch { continue; }
  // Skip our own scanner file (it contains the patterns themselves)
  if (file.endsWith('scan-secrets.mjs')) continue;
  for (const rule of RULES) {
    rule.regex.lastIndex = 0;
    const matches = content.match(rule.regex);
    if (matches) {
      const rel = path.relative(ROOT, file);
      for (const m of matches) {
        console.error(`SECRET ${rule.name} :: ${rel} :: ${m.slice(0, 16)}...`);
        findings++;
      }
    }
  }
}

if (findings > 0) {
  console.error(`\nSecret scan: ${findings} finding(s).`);
  process.exit(1);
}
console.log('Secret scan: clean.');
