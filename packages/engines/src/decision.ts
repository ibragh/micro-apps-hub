import type { ScenarioItem } from '@mofeed/content';

export type ThinkingStyle = NonNullable<ScenarioItem['choices'][number]['style']>;

export interface DecisionTally {
  perStyle: Record<ThinkingStyle | 'unstyled', number>;
  dominantStyle: ThinkingStyle | 'unstyled';
  totalChoices: number;
}

/**
 * Tally the user's choices across scenarios and report the dominant
 * thinking style. Used by thinking-compass, if-minister, consultant-test.
 */
export function tallyDecisions(
  scenarios: readonly ScenarioItem[],
  picks: readonly { scenarioId: string; choiceId: string }[],
): DecisionTally {
  const perStyle: DecisionTally['perStyle'] = {
    cautious: 0,
    bold: 0,
    analytical: 0,
    diplomatic: 0,
    emotional: 0,
    practical: 0,
    strategic: 0,
    unstyled: 0,
  };
  for (const pick of picks) {
    const scenario = scenarios.find((s) => s.id === pick.scenarioId);
    if (!scenario) continue;
    const choice = scenario.choices.find((c) => c.id === pick.choiceId);
    if (!choice) continue;
    const key: keyof DecisionTally['perStyle'] = choice.style ?? 'unstyled';
    perStyle[key]++;
  }
  let dominantStyle: DecisionTally['dominantStyle'] = 'unstyled';
  let max = -1;
  for (const k of Object.keys(perStyle) as Array<keyof DecisionTally['perStyle']>) {
    if (perStyle[k] > max) {
      max = perStyle[k];
      dominantStyle = k;
    }
  }
  return { perStyle, dominantStyle, totalChoices: picks.length };
}
