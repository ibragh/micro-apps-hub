import type { ScenarioItem } from '@mofeed/content';

export interface ScenarioState {
  index: number;
  picks: Array<{ scenarioId: string; choiceId: string; consequence: string }>;
  done: boolean;
}

export function initScenario(): ScenarioState {
  return { index: 0, picks: [], done: false };
}

export function advanceScenario(
  state: ScenarioState,
  scenarios: readonly ScenarioItem[],
  choiceId: string,
): ScenarioState {
  const scenario = scenarios[state.index];
  if (!scenario) return { ...state, done: true };
  const choice = scenario.choices.find((c) => c.id === choiceId);
  if (!choice) return state;
  const nextIndex = state.index + 1;
  return {
    index: nextIndex,
    picks: [
      ...state.picks,
      { scenarioId: scenario.id, choiceId, consequence: choice.consequence },
    ],
    done: nextIndex >= scenarios.length,
  };
}
