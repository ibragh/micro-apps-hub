import { describe, it, expect } from 'vitest';
import { initCase, revealNextClue, eliminate, guess } from '../clue';
import type { ClueCase } from '@mofeed/content';

const c: ClueCase = {
  id: 'c1', title: 'case', category: 'detective',
  sourceName: 'unit', confidenceLevel: 'high',
  isVerified: false, isFictional: true,
  scenario: 'something happened',
  suspects: [
    { id: 's1', name: 'A', profile: '' },
    { id: 's2', name: 'B', profile: '' },
    { id: 's3', name: 'C', profile: '' },
  ],
  clues: ['clue 1', 'clue 2', 'clue 3'],
  culpritId: 's2',
};

describe('clue engine', () => {
  it('init starts with one clue revealed', () => {
    expect(initCase(c).revealed).toBe(1);
  });

  it('reveal increments up to clue count', () => {
    let s = initCase(c);
    s = revealNextClue(s, c);
    s = revealNextClue(s, c);
    s = revealNextClue(s, c); // beyond — should clamp
    expect(s.revealed).toBe(3);
  });

  it('eliminate is idempotent', () => {
    let s = initCase(c);
    s = eliminate(s, 's1');
    s = eliminate(s, 's1');
    expect(s.eliminated).toEqual(['s1']);
  });

  it('correct guess solves', () => {
    let s = initCase(c);
    s = guess(s, c, 's2');
    expect(s.solved).toBe(true);
  });

  it('wrong guess fails', () => {
    let s = initCase(c);
    s = guess(s, c, 's3');
    expect(s.solved).toBe(false);
  });
});
