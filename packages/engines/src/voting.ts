export interface VoteResult<TOptionId extends string = string> {
  totalVotes: number;
  perOption: Array<{ optionId: TOptionId; count: number; percent: number }>;
  winner: TOptionId | null;
}

/**
 * Tally votes and compute percentages. Used by history-court,
 * impossible-choice, who-is-wrong, saudi-mood-map.
 */
export function tallyVotes<TOptionId extends string>(
  optionIds: readonly TOptionId[],
  votes: readonly { optionId: TOptionId }[],
): VoteResult<TOptionId> {
  const counts = new Map<TOptionId, number>();
  for (const id of optionIds) counts.set(id, 0);
  for (const v of votes) {
    if (counts.has(v.optionId)) counts.set(v.optionId, (counts.get(v.optionId) ?? 0) + 1);
  }
  const total = votes.length;
  const perOption = Array.from(counts.entries()).map(([optionId, count]) => ({
    optionId,
    count,
    percent: total === 0 ? 0 : Math.round((count / total) * 100),
  }));
  let winner: TOptionId | null = null;
  let max = -1;
  for (const row of perOption) {
    if (row.count > max) {
      max = row.count;
      winner = row.optionId;
    } else if (row.count === max) {
      winner = null; // tie
    }
  }
  return { totalVotes: total, perOption, winner: max <= 0 ? null : winner };
}
