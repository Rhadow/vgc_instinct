import type { AppPokemon, AppField, DamageResult, SpeedResult, QuizMode } from '../data/types';

export interface DamageQuestion {
  type: 'damage';
  attacker: AppPokemon;
  defender: AppPokemon;
  moveName: string;
  moveType: string;
  attackerSprite: string;
  defenderSprite: string;
  correctResult: DamageResult;
  field?: AppField;
  options: string[]; // 4 formatted range strings like "43.2% – 51.0%"
  correctIndex: number;
}

export interface SpeedQuestion {
  type: 'speed';
  pokemons: AppPokemon[];
  sprites: string[];
  trickRoom: boolean;
  tailwind: boolean[];  // per pokemon
  paralysis: boolean[]; // per pokemon
  statStages: number[]; // per pokemon
  weather?: 'Sun' | 'Rain' | 'Sand' | 'Snow';
  correctOrder: SpeedResult[];
}

export type QuizQuestion = DamageQuestion | SpeedQuestion;

export interface QuizAnswer {
  question: QuizQuestion;
  userAnswer: number | number[]; // index for damage, order array for speed
  correct: boolean;
  pointsEarned: number;
}

export interface QuizSession {
  mode: QuizMode;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  currentIndex: number;
  score: number;
  totalQuestions: number;
}
