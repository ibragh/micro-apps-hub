# Content Policy

All factual content in **mofeed-mini-apps** must be verifiable. This
document defines what counts as a reliable source, what metadata every
content item must carry, and how to keep speculative content clearly
labelled.

---

## 1. What counts as a reliable source

### Islamic / Seerah content

- Qur'an (with reference to surah and ayah).
- The six authentic hadith collections (Bukhari, Muslim, Abu Dawud,
  Tirmidhi, Nasa'i, Ibn Majah), with grading where applicable.
- Classical seerah works: Ibn Hisham, Ibn Kathir (*Al-Bidaya wa Al-Nihaya*),
  Al-Mubarakpuri (*Ar-Raheeq Al-Makhtum*).
- For grading, prefer recognised scholarly assessments.
- **No** weak (`da'if`) or fabricated (`mawdu'`) narrations are used
  unless explicitly flagged for educational warning, with the grading
  recorded in metadata.

### Saudi history / national content

- Official sources: King Abdulaziz Foundation (Darah), Saudi Ministry of
  Culture, Ministry of Education, Saudi Press Agency.
- Recognised academic works on Saudi history.
- UNESCO World Heritage listings for heritage sites.

### General / world history

- Recognised encyclopedias (Britannica, Stanford Encyclopedia of
  Philosophy where relevant).
- Peer-reviewed academic sources.
- Library archives (e.g., Library of Congress).

### Football / sports facts

- Official club / league websites.
- Recognised football data providers (Transfermarkt for career data,
  with citation).
- We **do not** use copyrighted club logos, player photographs, or
  protected media. All visuals are abstract / textual.

### Sources we never accept

- Random social media posts.
- Anonymous Wikis with no citation chain.
- Personal blogs without expert credentials.
- AI-generated text presented as a primary source.

---

## 2. Content item metadata (required schema)

Every fact / question / scenario uses the `FactItem` type defined in
`packages/content/src/types.ts`:

```ts
type FactItem = {
  id: string;                     // stable, app-unique
  title: string;                  // headline / question text (Arabic)
  description?: string;           // detail / explanation (Arabic)
  category: string;               // e.g., 'seerah', 'saudi-history', 'football'
  sourceName: string;             // human-readable source label
  sourceUrl?: string;             // canonical URL when available
  bookReference?: string;         // e.g., "Sahih al-Bukhari, hadith 3461"
  confidenceLevel: 'high' | 'medium' | 'low';
  isVerified: boolean;            // must be true for production-shipped facts
  isFictional: boolean;           // true for "What If?" / fictional detective cases
  tags?: string[];                // free-form
  hadithGrading?: 'sahih' | 'hasan' | 'da'if' | 'mawdu'';
};
```

Validation: items are checked at app build time via
`packages/content/src/validate.ts`. Builds fail if a non-fictional item
lacks `sourceName`.

---

## 3. Fact vs. interpretation

For history-court, who-is-wrong, what-if, history-secrets, etc., we
separate three layers:

1. **Verified facts** — `isVerified: true`, with `sourceName`.
2. **Interpretation / analysis** — flagged in the UI as "تحليل" / "Analysis".
3. **Speculative ("what if")** — `isFictional: true` and visually
   labelled in the UI.

The UI components in `packages/ui` render these layers with distinct
styling so users always know what they are reading.

---

## 4. Religious-content guardrails

- We do **not** present jurisprudential rulings (`fatwa`).
- We do **not** quote weak / fabricated narrations as established facts.
- Where multiple authentic narrations exist, we cite the most-cited and
  link to the source.
- App `seerah-quiz` ships only with content already documented in
  `apps/seerah-quiz/src/content/seed.json`, all sourced.

---

## 5. Sensitive-content guardrails

- `saudi-mood-map`: avoid political, religious, or otherwise sensitive
  polling. The poll seed list (`apps/saudi-mood-map/src/content/seed.json`)
  is restricted to neutral, daily-life topics (weather, sports excitement,
  weekend mood).
- `news-detective`: scenarios are **always fictional**, written to teach
  media-literacy patterns. We do **not** reproduce real recent news.

---

## 6. How to add new content later

1. Add the item to `apps/<slug>/src/content/seed.json` (or a separate
   JSON file in the same folder for larger sets).
2. Fill in every required metadata field — the validator will reject
   items that don't conform.
3. If adding a new book / dataset, also list it in
   `docs/CONTENT_POLICY.md` under §1 so reviewers know it's accepted.
4. Open a PR; CI runs `pnpm typecheck` and `pnpm test:unit` which
   re-validate the content.

---

## 7. Copyright

- All textual content authored in this repo is © its authors and licensed
  per the repo `LICENSE` (TBD — currently treat as all-rights-reserved
  during private development).
- Quoted source material is used under fair-use / quotation rights for
  educational purposes, with attribution.
- No third-party images / logos / videos are shipped without an explicit
  license recorded in `docs/CONTENT_POLICY.md` (currently: none).
