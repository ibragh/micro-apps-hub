import { describe, it, expect } from 'vitest';
import { validateAll } from '@mofeed/content';
import type { ScenarioItem } from '@mofeed/content';
import seed from '../content/seed.json';

const items = seed as ScenarioItem[];

describe('thinking-compass content', () => {
  it('passes schema validation', () => {
    expect(() => validateAll(items)).not.toThrow();
  });
  it('every scenario has at least 2 choices with non-empty fields', () => {
    for (const s of items) {
      expect(s.choices.length).toBeGreaterThanOrEqual(2);
      for (const c of s.choices) {
        expect(c.id).toBeTruthy();
        expect(c.label).toBeTruthy();
        expect(c.consequence).toBeTruthy();
      }
    }
  });
});
