export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type HadithGrading = 'sahih' | 'hasan' | 'da-if' | 'mawdu';

/**
 * Canonical content-item shape. Every fact, question, scenario,
 * historical event, and quiz item across the 30 apps conforms to this.
 *
 * - Non-fictional items must carry sourceName and be isVerified=true.
 * - Fictional items (what-if, unknown-suspect) must set isFictional=true.
 */
export interface FactItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  sourceName: string;
  sourceUrl?: string;
  bookReference?: string;
  confidenceLevel: ConfidenceLevel;
  isVerified: boolean;
  isFictional: boolean;
  tags?: string[];
  hadithGrading?: HadithGrading;
}

/** Multiple-choice quiz question (used by quiz engine). */
export interface QuizQuestion extends FactItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

/** Scenario with one or more decision branches (decision / scenario engine). */
export interface ScenarioItem extends FactItem {
  prompt: string;
  choices: Array<{
    id: string;
    label: string;
    consequence: string;
    style?: 'cautious' | 'bold' | 'analytical' | 'diplomatic' | 'emotional' | 'practical' | 'strategic';
  }>;
}

/** Historical event keyed by month/day (today-history). */
export interface DatedEvent extends FactItem {
  month: number; // 1-12
  day: number;   // 1-31
  year: number;  // full year
  region?: string;
}

/** Poll option (voting engine, mood map). */
export interface PollOption {
  id: string;
  label: string;
}

export interface PollItem extends FactItem {
  question: string;
  options: PollOption[];
}

/** Detective clue case (unknown-suspect, missing-clue). */
export interface ClueCase extends FactItem {
  scenario: string;
  suspects: Array<{ id: string; name: string; profile: string }>;
  clues: string[];
  culpritId: string;
}
