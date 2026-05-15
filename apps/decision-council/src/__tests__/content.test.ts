import { describe, it, expect } from 'vitest';
import { validateAll } from '@mofeed/content';
import type { ScenarioItem } from '@mofeed/content';
import seed from '../content/seed.json';

const items = seed as ScenarioItem[];

describe('decision-council content', () => {
  it('passes schema validation (fictional items allowed)', () => {
    expect(() => validateAll(items)).not.toThrow();
  });

  it('every scenario carries the policy-simulation framing (fictional, marked)', () => {
    for (const s of items) {
      expect(s.isFictional).toBe(true);
      expect(s.choices.length).toBeGreaterThanOrEqual(2);
    }
  });
});
