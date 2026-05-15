# @mofeed/engines

Reusable, framework-free engines that power the mini apps. Each engine
is a pure-function module — easy to test, easy to swap, no React
dependency.

## Engines

| Engine | When to use | Key API |
|---|---|---|
| `quiz` | Multiple-choice with a fixed pool | `buildQuiz`, `scoreQuiz` |
| `quiz` (auction variant) | Quiz where the user bets a confidence stake | `scoreAuction` |
| `decision` | Scenario-based decisions; identify the dominant thinking style | `tallyDecisions` |
| `voting` | Single-question polls / verdicts | `tallyVotes` |
| `timeline` | "This day in history" — events keyed by month + day | `eventsForDay`, `sortByYear`, `todayUtc` |
| `scenario` | Branching short story; advance / pick / record consequence | `initScenario`, `advanceScenario` |
| `clue` | Detective game — reveal clues, eliminate suspects, guess | `initCase`, `revealNextClue`, `eliminate`, `guess` |
| `random` | Seeded PRNG + shuffle/sample for deterministic tests | `mulberry32`, `hashString`, `shuffle`, `sample` |

## Quickstart

```ts
import { buildQuiz, scoreQuiz } from '@mofeed/engines';
import type { QuizQuestion } from '@mofeed/content';

const pool: QuizQuestion[] = /* loaded from apps/<slug>/src/content/seed.json */;

// Deterministic pick when a seed is provided.
const questions = buildQuiz(pool, { total: 5, seed: 'today-2026-05-15' });

// After collecting answers:
const result = scoreQuiz(questions, [
  { questionId: 'q1', selectedIndex: 2, elapsedMs: 1800 },
  // ...
]);
// result.score is 0..100
```

### Auction

```ts
import { scoreAuction } from '@mofeed/engines';

const bank = scoreAuction([
  { questionId: 'q1', selectedIndex: 0, correctIndex: 0, elapsedMs: 0, bid: 50 },
  { questionId: 'q2', selectedIndex: 1, correctIndex: 0, elapsedMs: 0, bid: 30 },
]).bank;
// 50 - 30 = 20
```

### Decision

```ts
import { tallyDecisions } from '@mofeed/engines';

const tally = tallyDecisions(scenarios, picks);
// tally.dominantStyle: 'cautious' | 'bold' | 'analytical' | 'diplomatic' |
//                      'emotional' | 'practical' | 'strategic' | 'unstyled'
```

### Voting

```ts
import { tallyVotes } from '@mofeed/engines';

const r = tallyVotes(['yes', 'no'] as const, votes);
// r.winner is null on a tie or zero votes
```

### Timeline

```ts
import { eventsForDay, sortByYear, todayUtc } from '@mofeed/engines';

const todays = sortByYear(eventsForDay(events, todayUtc()));
// month + day match, year ignored — "this day in history" semantics
```

### Scenario

```ts
import { initScenario, advanceScenario } from '@mofeed/engines';

let state = initScenario();
state = advanceScenario(state, scenarios, 'choice-id');
// state.done becomes true after the last scenario
```

### Clue

```ts
import { initCase, revealNextClue, eliminate, guess } from '@mofeed/engines';

let state = initCase(clueCase);
state = revealNextClue(state, clueCase);
state = eliminate(state, 'suspect-1');
state = guess(state, clueCase, 'suspect-2');
// state.solved: true | false | null (null = not yet guessed)
```

### Random

```ts
import { mulberry32, hashString, shuffle, sample } from '@mofeed/engines';

const rng = mulberry32(hashString('seed string'));
const shuffled = shuffle([1, 2, 3, 4], rng);   // deterministic
const five = sample(items, 5, rng);
```

## Testing

```bash
pnpm --filter @mofeed/engines test
# 22 tests pass
```

Tests live in `src/__tests__/` and cover scoring math, tie handling,
empty inputs, leap-day timeline picks, and deterministic shuffles.

## Adding a new engine

1. Create `src/<engine>.ts`. Keep it pure — no DOM, no React.
2. Export from `src/index.ts` and add to the `exports` map in
   `package.json`.
3. Add a unit test in `src/__tests__/<engine>.test.ts`.
4. Document the engine in this README.

That's it — the apps consume your engine by importing from
`@mofeed/engines` directly.
