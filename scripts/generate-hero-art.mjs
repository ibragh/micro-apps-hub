#!/usr/bin/env node
/**
 * Generate one hero image per app via Imagen 4 (Google AI Studio API).
 *
 * Usage:
 *   GEMINI_API_KEY=$(op read 'op://Claude/google ai studio/password') \
 *     node scripts/generate-hero-art.mjs
 *
 * Flags:
 *   --slug=<slug>    only generate for one app (debug)
 *   --force          regenerate even if hero.png already exists
 *   --model=<id>     override the default model
 *   --dry-run        print prompts but don't call the API
 *
 * Output:
 *   apps/<slug>/public/hero.png  (PNG, ~1MB each, 1408×768 widescreen)
 *
 * Cost (Imagen 4 at $0.04/image): ~$1.24 for all 31 apps including hub.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { apps as MANIFEST } from './apps.manifest.mjs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(=(.+))?$/);
    return m ? [m[1], m[3] ?? true] : [a, true];
  }),
);

// Default to Gemini 2.5 Flash Image (Nano Banana) since it's free-tier
// accessible on AI Studio keys. Override with --model=imagen-4.0-generate-001
// once the project is on a paid plan.
const MODEL = args.model || 'gemini-2.5-flash-image';
const FORCE = !!args.force;
const DRY = !!args['dry-run'];
const ONE_SLUG = typeof args.slug === 'string' ? args.slug : null;

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey && !DRY) {
  console.error('Set GEMINI_API_KEY (try: GEMINI_API_KEY=$(op read \'op://Claude/google ai studio/password\') node …)');
  process.exit(1);
}

/**
 * Per-app prompt + style. Two style modes:
 *   photographic    — cinematic photo, real-world, no text, no faces
 *   illustration    — modern flat editorial illustration, Arabic-cultural
 *
 * All prompts forbid in-image text (the apps already render Arabic text in
 * the DOM, and AI image text is unreliable) and faces (avoids the uncanny
 * portrait problem at this image size).
 */
const PROMPTS = {
  // ============ PHOTOGRAPHIC (historical / factual) ============
  'seerah-quiz': {
    style: 'photographic',
    scene:
      'Cinematic golden-hour photograph of an ancient Madinah-like Arabian city skyline at dusk, ' +
      'palm-tree silhouettes in the foreground, a distant arched stone gateway, warm sage and parchment palette, ' +
      'soft particulates in the air, subtle vignette and breathing room toward the bottom-left',
  },
  'today-history': {
    style: 'photographic',
    scene:
      'Cinematic close-up photograph of an aged sepia-toned calendar page on a wooden desk, brass magnifying glass ' +
      'resting on top, soft warm window light from the right, faded ink, vintage paper texture, breathing room toward one edge',
  },
  'saudi-history-quiz': {
    style: 'photographic',
    scene:
      'Cinematic photograph of golden Saudi sand dunes at late afternoon, a single distant emerald oasis with palms ' +
      'in the middle distance, deep blue sky, sand and emerald palette, no people, full-bleed composition with ' +
      'breathing room toward one edge',
  },
  'history-court': {
    style: 'photographic',
    scene:
      'Cinematic interior photograph of a vintage courtroom in warm brass tones, polished oak bench, brass scales of ' +
      'justice on a side table catching afternoon light through tall arched windows, dust particles, no people, ' +
      'breathing room toward one edge',
  },
  'knowledge-auction': {
    style: 'photographic',
    scene:
      'Cinematic dim photograph of a luxurious auction-house interior in deep wine red, polished mahogany podium with ' +
      'a golden gavel resting on a velvet pad, a single soft amber spotlight, brass details, no people, full-bleed scene',
  },
  'time-traveler': {
    style: 'photographic',
    scene:
      'Cinematic photograph of an ornate brass hourglass on a violet velvet cloth, the sand inside softly glowing, ' +
      'faint stars in the dusk background, deep purple and amber lighting, no people, breathing room toward one edge',
  },
  'saudi-time-machine': {
    style: 'photographic',
    scene:
      'Cinematic still life of a vintage turquoise-enamel radio dial with brass knobs on a sand-coloured backdrop, ' +
      'soft warm spotlight from the side, retro nostalgic mood, no people, banner-friendly negative space',
  },
  'history-secrets': {
    style: 'photographic',
    scene:
      'Cinematic photograph of a half-open antique leather-bound book on a deep purple velvet table, a single brass ' +
      'keyhole detail on the cover, a single gold candle providing warm rim light, mysterious mood, no people',
  },
  'predict-the-decision': {
    style: 'photographic',
    scene:
      'Cinematic interior of a traditional Saudi majlis room, emerald-green cushions on a sand-coloured floor, soft ' +
      'pendant lamp glow, ornate brass coffee pot in the corner, no people, banner breathing room toward one edge',
  },
  'odd-archive': {
    style: 'photographic',
    scene:
      'Cinematic photograph of a curiosity cabinet filled with bizarre but real museum artifacts (small skull, ' +
      'astrolabe, coiled rope, brass key) on a warm-wood shelf, dim spotlight, brass detail, no people',
  },
  'national-memory': {
    style: 'photographic',
    scene:
      'Cinematic photograph of a single Saudi-style flag billowing softly in the golden-hour wind against a clean sky, ' +
      'patriot green and gold palette, no people, no text on the flag in the image, full-bleed scene',
  },
  'in-his-place': {
    style: 'photographic',
    scene:
      'Cinematic photograph of an empty Bedouin tent at dusk, warm oil-lamp glow visible inside, sand around, ' +
      'amber and parchment tones, soft particulates in the air, no people, full-bleed composition',
  },

  // ============ ILLUSTRATION (games / decision / scenario / personality) ============
  'guess-saudi-player': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration of a single dynamic football-player silhouette mid-kick on a green pitch ' +
      'texture, gold accent rim, no faces, no team logos, no jersey numbers, no text, pitch chalk lines as composition',
  },
  'if-minister': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration of a stylized ministry building facade with arched windows and ornate columns, ' +
      'navy and sand palette, geometric simplification, no text on building, official institutional feel',
  },
  'news-detective': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration of a torn vintage newspaper masthead with a partial illegible headline, ' +
      'a red ink stamp shape in the corner, a magnifying glass over a paragraph, ink-black and cream palette, no real text',
  },
  'last-minute-decision': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration of an oversized analog wall clock with the minute hand at 11:58, dramatic ' +
      'amber lighting from the right, motion lines around the hands suggesting urgency, no text on the dial',
  },
  'decision-council': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration of an empty round senate table viewed from above with empty chairs around it, ' +
      'senate-blue and gold palette, geometric top-down composition, marble texture floor, no people',
  },
  'logic-judge': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration of a floating proof-tree diagram of geometric nodes connected by clean lines, ' +
      'slate-grey and cyan palette, mathematical mood, subtle grid background, no text in nodes',
  },
  'crossroads': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration of two empty roads diverging into the distance in atmospheric perspective, ' +
      'soft grey asphalt and sky-blue background, lone signpost without text, road grey + sky palette',
  },
  'who-is-wrong': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration split vertically into a warm red side and a cool blue side, a balance ' +
      'scale silhouette in the centre, abstract dual-perspective composition, no faces, no text',
  },
  'consultant-test': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration of a clean corporate dashboard with rising bar chart and trend arrow, ' +
      'teal monochrome palette, minimalist geometric, slight isometric tilt, no text on chart labels',
  },
  'matchday-coach': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration of a top-down football tactics board with white chalk lines and X/O markers ' +
      'on green pitch, pitch-green and white palette, no text annotations, slight grain texture',
  },
  'what-if': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration of branching paths of glowing dotted lines on a violet starry sky, one ' +
      'highlighted in orange, the others fading away, atmospheric perspective, no text',
  },
  'thinking-compass': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration of an ornate compass rose with eight cardinal directions, navy-blue body ' +
      'and gold needle, geometric symmetry, subtle grain, no text labels on directions',
  },
  'impossible-choice': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration of a balance scale with one side dipping crimson and the other rising navy, ' +
      'two abstract objects on the pans, dramatic contrast, no text, full-bleed scene',
  },
  'missing-clue': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration of a noir detective desk silhouette with a magnifying glass over an open ' +
      'case file, deep noir black and ink red accent, single overhead spotlight, no text in the file',
  },
  'unknown-suspect': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration of four faceless silhouettes in a police lineup against vertical bars, ' +
      'noir sepia tones, dramatic uplight casting long shadows, no text, no facial features',
  },
  'wisdom-index': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration of a stylized tree with sage-green leaves, golden glowing roots reaching ' +
      'into the soil, balanced symmetric composition, soft halo, no text, no faces',
  },
  'diplomat-test': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration of two abstract diplomatic seals overlapping subtly, grey and gold palette, ' +
      'minimal handshake gesture in the negative space, full-bleed scene, no text',
  },
  'saudi-mood-map': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration of a stylized sun rising over abstract layered dunes, warm orange to sky-blue ' +
      'gradient, geometric simplification, optimistic mood, no text, no people',
  },
  'crossroads-DELETE': null, // already handled above; this is just a safeguard

  // hub
  'hub': {
    style: 'illustration',
    scene:
      'Modern flat editorial illustration of a 5x6 gallery wall of small abstract framed pictures in muted indigo, ' +
      'cream, and warm gold, viewed slightly from a low angle, soft drop shadow, premium-gallery feel, no text on frames',
  },
};

// Strong anti-text guard: image models love to render fake Arabic text in
// "negative space" if you mention overlay. We want a full-bleed photographic
// or illustrated scene with no baked-in text or text-card layout at all.
const NO_TEXT =
  'ABSOLUTELY NO TEXT of any kind anywhere in the image. No Arabic calligraphy. ' +
  'No Latin letters. No numbers. No captions. No watermarks. No logos. No signs. ' +
  'No carved inscriptions. No painted words. No text panels. Full-bleed scene only.';

const STYLE_WRAPPER = {
  photographic:
    'Aspect ratio 16:9 widescreen banner. Cinematic photograph. Soft natural lighting. ' +
    'Shallow depth of field. No human faces visible. Full-bleed scene composition with ' +
    'subtle vignette and breathing room toward one edge. ' + NO_TEXT,
  illustration:
    'Aspect ratio 16:9 widescreen banner. Modern flat editorial illustration in the style of ' +
    'contemporary Arabic editorial design. Limited palette, layered geometric shapes, subtle ' +
    'grain texture. No human faces. Full-bleed scene composition. ' + NO_TEXT,
};

function buildPrompt(slug) {
  const cfg = PROMPTS[slug];
  if (!cfg) return null;
  return `${cfg.scene}. ${STYLE_WRAPPER[cfg.style]}`;
}

// Targets: 30 manifest apps + 1 hub
const TARGETS = [...MANIFEST.map((a) => ({ slug: a.slug })), { slug: 'hub' }];

async function generateFor(slug, ai) {
  const prompt = buildPrompt(slug);
  if (!prompt) {
    console.warn(`[skip] ${slug}: no prompt defined`);
    return { slug, status: 'no-prompt' };
  }

  const outDir = path.join(root, 'apps', slug, 'public');
  const outFile = path.join(outDir, 'hero.png');

  if (!FORCE) {
    try {
      const st = await fs.stat(outFile);
      if (st.size > 10000) {
        console.log(`[skip] ${slug}: exists (${(st.size / 1024).toFixed(0)} KB)`);
        return { slug, status: 'skip-exists' };
      }
    } catch (_) {
      // file missing, continue
    }
  }

  if (DRY) {
    console.log(`[dry] ${slug}:\n    ${prompt.slice(0, 160)}…`);
    return { slug, status: 'dry' };
  }

  console.log(`[gen] ${slug} …`);
  const t0 = Date.now();
  const isImagen = MODEL.startsWith('imagen-');

  // Imagen Fast caps at 10 req/min — retry on 429 with the suggested delay,
  // up to 3 retries. Other 4xx errors fail fast.
  const callOnce = async () => {
    if (isImagen) {
      const response = await ai.models.generateImages({
        model: MODEL,
        prompt,
        config: { numberOfImages: 1, aspectRatio: '16:9' },
      });
      return response?.generatedImages?.[0]?.image?.imageBytes;
    }
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    const parts = response?.candidates?.[0]?.content?.parts ?? [];
    return parts.find((p) => p.inlineData?.data)?.inlineData?.data;
  };

  let imageBase64;
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      imageBase64 = await callOnce();
      break;
    } catch (e) {
      lastErr = e;
      const msg = String(e?.message || e);
      const is429 = msg.includes('"code":429') || msg.includes('RESOURCE_EXHAUSTED');
      if (!is429) break;
      // pull suggested retry delay if present, default 12s
      const m = msg.match(/retry in ([\d.]+)s/i);
      const wait = (m ? Math.ceil(parseFloat(m[1])) : 12) + 2;
      console.log(`[wait] ${slug}: 429, sleep ${wait}s (attempt ${attempt + 1}/4)`);
      await new Promise((r) => setTimeout(r, wait * 1000));
    }
  }
  if (!imageBase64) {
    console.error(`[err] ${slug}: ${lastErr?.message || lastErr || 'no image'}`);
    return { slug, status: 'error', error: String(lastErr?.message || lastErr) };
  }
  const dt = ((Date.now() - t0) / 1000).toFixed(1);

  if (!imageBase64) {
    console.error(`[err] ${slug}: no image data in response`);
    return { slug, status: 'empty-response' };
  }

  await fs.mkdir(outDir, { recursive: true });
  const buf = Buffer.from(imageBase64, 'base64');
  await fs.writeFile(outFile, buf);
  const sizeKB = (buf.byteLength / 1024).toFixed(0);
  console.log(`[ok]  ${slug}  ${sizeKB} KB  ${dt}s`);
  return { slug, status: 'ok', sizeKB, dt };
}

async function main() {
  console.log(`model: ${MODEL}`);
  console.log(`force: ${FORCE}    dry-run: ${DRY}`);
  console.log(`targets: ${ONE_SLUG ? '1 (' + ONE_SLUG + ')' : TARGETS.length}\n`);

  const ai = DRY ? null : new GoogleGenAI({ apiKey });
  const results = [];
  const filtered = ONE_SLUG ? TARGETS.filter((t) => t.slug === ONE_SLUG) : TARGETS;

  // Imagen Fast = 10 req/min ⇒ paced 7s/req keeps us under the cap with margin.
  // The per-image generation itself is ~4-6s, so net throughput is ~8-9 imgs/min.
  const PACE_MS = MODEL.includes('imagen-') ? 6800 : 0;
  for (const t of filtered) {
    const start = Date.now();
    const r = await generateFor(t.slug, ai);
    results.push(r);
    if (PACE_MS && r.status === 'ok') {
      const elapsed = Date.now() - start;
      const sleep = Math.max(0, PACE_MS - elapsed);
      if (sleep > 0) await new Promise((rr) => setTimeout(rr, sleep));
    }
  }

  const counts = results.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), {});
  console.log('\n=== summary ===');
  for (const [k, v] of Object.entries(counts)) console.log(`  ${k}: ${v}`);
  const failed = results.filter((r) => r.status === 'error' || r.status === 'empty-response');
  if (failed.length) {
    console.log('\nfailed:');
    for (const f of failed) console.log(`  ${f.slug}: ${f.error || f.status}`);
    process.exit(2);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
