/**
 * Type Matchup Quiz — test knowledge of type effectiveness multipliers.
 * Given an attacking type + defending Pokémon (with dual typing), select the multiplier.
 */
import type { AppPokemon } from '../data/types';
import type { QuizAnswer } from './questionTypes';
import { ALL_TYPES, calcTypeEffectiveness, multiplierToLabel, EFFECTIVENESS_OPTIONS } from '../data/typeChart';
import type { QuizDataSource } from './engine';

export interface TypeQuestion {
  type: 'type';
  attackingType: string;
  defender: AppPokemon;
  defenderSprite: string;
  correctMultiplier: number;
  correctLabel: string;
  options: string[]; // e.g., ["0×", "0.5×", "1×", "2×"]
  correctIndex: number;
}

function getWeightedRandomPokemon(source: QuizDataSource, metaMode?: boolean): string {
  const names = source.getMetaPokemonNames();
  if (!metaMode) {
    return names[Math.floor(Math.random() * names.length)];
  }
  const sortedNames = [...names].sort((a, b) => {
    const usageA = source.getMetaPokemon(a)?.usage || 0;
    const usageB = source.getMetaPokemon(b)?.usage || 0;
    return usageB - usageA;
  });
  const r = Math.random();
  if (r < 0.60) return sortedNames[Math.floor(Math.random() * Math.min(50, sortedNames.length))];
  if (r < 0.95) return sortedNames[Math.floor(50 + Math.random() * Math.min(25, sortedNames.length - 50))];
  return sortedNames[Math.floor(75 + Math.random() * (sortedNames.length - 75))];
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate wrong options that are plausible but different from the correct answer.
 * Always includes 3 wrong options from the EFFECTIVENESS_OPTIONS set.
 */
function generateTypeOptions(correctMultiplier: number): { options: string[]; correctIndex: number } {
  const correctLabel = multiplierToLabel(correctMultiplier);
  const allOptions = [...EFFECTIVENESS_OPTIONS] as string[];
  const wrongOptions = allOptions.filter((o) => o !== correctLabel);
  
  // Pick 3 random wrong options
  const shuffledWrong = shuffleArray(wrongOptions).slice(0, 3);
  const combined = [correctLabel, ...shuffledWrong];
  const shuffled = shuffleArray(combined);
  
  return {
    options: shuffled,
    correctIndex: shuffled.indexOf(correctLabel),
  };
}

function makeTypeKey(attackingType: string, defenderName: string): string {
  return `type|${attackingType}|${defenderName}`;
}

export async function generateTypeQuestion(
  source: QuizDataSource,
  history: Set<string> = new Set(),
  maxAttempts: number = 20,
  metaMode?: boolean,
): Promise<TypeQuestion | null> {
  const names = source.getMetaPokemonNames();
  if (names.length < 1) return null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const defName = getWeightedRandomPokemon(source, metaMode);
    const defMeta = source.getMetaPokemon(defName);
    const defFull = source.getFullData(defName);
    if (!defMeta || !defFull) continue;

    // Pick a random attacking type
    const attackingType = ALL_TYPES[Math.floor(Math.random() * ALL_TYPES.length)];

    const key = makeTypeKey(attackingType, defName);
    if (history.has(key)) continue;

    const multiplier = calcTypeEffectiveness(attackingType, defFull.types);
    const { options, correctIndex } = generateTypeOptions(multiplier);

    history.add(key);

    // Build a minimal defender pokemon for display
    const spread = defMeta.spreads[0];
    const defender: AppPokemon = {
      name: defMeta.name,
      baseStats: defFull.baseStats,
      types: defFull.types,
      ability: defMeta.abilities[0] || 'Unknown',
      item: defMeta.items[0] || 'nothing',
      spread,
      level: 50,
    };

    return {
      type: 'type',
      attackingType,
      defender,
      defenderSprite: source.getSpriteUrl(defName),
      correctMultiplier: multiplier,
      correctLabel: multiplierToLabel(multiplier),
      options,
      correctIndex,
    };
  }

  return null;
}

export function checkTypeAnswer(question: TypeQuestion, selectedIndex: number): QuizAnswer {
  const correct = selectedIndex === question.correctIndex;

  let pointsEarned = 0;
  if (correct) {
    pointsEarned = 10;
  } else {
    // Partial credit for "close" answers (adjacent multiplier)
    const selectedLabel = question.options[selectedIndex];
    const correctLabel = question.correctLabel;
    const allLabels = [...EFFECTIVENESS_OPTIONS];
    const selectedIdx = allLabels.indexOf(selectedLabel as typeof EFFECTIVENESS_OPTIONS[number]);
    const correctIdx = allLabels.indexOf(correctLabel as typeof EFFECTIVENESS_OPTIONS[number]);
    if (Math.abs(selectedIdx - correctIdx) === 1) {
      pointsEarned = 3; // Adjacent answer
    }
  }

  return {
    question,
    userAnswer: selectedIndex,
    correct,
    pointsEarned,
  };
}
