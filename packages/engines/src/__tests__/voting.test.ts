import { describe, it, expect } from 'vitest';
import { tallyVotes } from '../voting';

describe('tallyVotes', () => {
  it('counts and percentages', () => {
    const r = tallyVotes(['yes', 'no'] as const, [
      { optionId: 'yes' },
      { optionId: 'yes' },
      { optionId: 'no' },
    ]);
    expect(r.totalVotes).toBe(3);
    expect(r.winner).toBe('yes');
    expect(r.perOption.find((p) => p.optionId === 'yes')?.percent).toBe(67);
  });

  it('returns null winner on tie', () => {
    const r = tallyVotes(['a', 'b'] as const, [{ optionId: 'a' }, { optionId: 'b' }]);
    expect(r.winner).toBeNull();
  });

  it('returns null winner on no votes', () => {
    const r = tallyVotes(['a', 'b'] as const, []);
    expect(r.winner).toBeNull();
    expect(r.totalVotes).toBe(0);
  });
});
