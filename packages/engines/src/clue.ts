import type { ClueCase } from '@mofeed/content';

export interface ClueState {
  caseId: string;
  revealed: number;       // number of clues revealed
  eliminated: string[];   // suspect ids eliminated
  guess: string | null;
  solved: boolean | null; // null until guessed
}

export function initCase(c: ClueCase): ClueState {
  return { caseId: c.id, revealed: 1, eliminated: [], guess: null, solved: null };
}

export function revealNextClue(state: ClueState, c: ClueCase): ClueState {
  return { ...state, revealed: Math.min(c.clues.length, state.revealed + 1) };
}

export function eliminate(state: ClueState, suspectId: string): ClueState {
  if (state.eliminated.includes(suspectId)) return state;
  return { ...state, eliminated: [...state.eliminated, suspectId] };
}

export function guess(state: ClueState, c: ClueCase, suspectId: string): ClueState {
  return { ...state, guess: suspectId, solved: suspectId === c.culpritId };
}
