import { describe, it, expect } from 'vitest';
import { tallyDecisions } from '../decision';
import type { ScenarioItem } from '@mofeed/content';

const scenarios: ScenarioItem[] = [
  {
    id: 's1',
    title: 'sc1',
    category: 'test',
    sourceName: 'unit',
    confidenceLevel: 'high',
    isVerified: true,
    isFictional: false,
    prompt: 'pick one',
    choices: [
      { id: 'a', label: 'a', consequence: 'ok', style: 'cautious' },
      { id: 'b', label: 'b', consequence: 'ok', style: 'bold' },
    ],
  },
  {
    id: 's2',
    title: 'sc2',
    category: 'test',
    sourceName: 'unit',
    confidenceLevel: 'high',
    isVerified: true,
    isFictional: false,
    prompt: 'pick one',
    choices: [
      { id: 'a', label: 'a', consequence: 'ok', style: 'cautious' },
      { id: 'b', label: 'b', consequence: 'ok', style: 'analytical' },
    ],
  },
];

describe('tallyDecisions', () => {
  it('returns dominant style', () => {
    const r = tallyDecisions(scenarios, [
      { scenarioId: 's1', choiceId: 'a' },
      { scenarioId: 's2', choiceId: 'a' },
    ]);
    expect(r.dominantStyle).toBe('cautious');
    expect(r.perStyle.cautious).toBe(2);
    expect(r.totalChoices).toBe(2);
  });

  it('ignores unknown scenarios and choices', () => {
    const r = tallyDecisions(scenarios, [
      { scenarioId: 'nope', choiceId: 'a' },
      { scenarioId: 's1', choiceId: 'zzz' },
    ]);
    expect(r.perStyle.cautious).toBe(0);
  });
});
