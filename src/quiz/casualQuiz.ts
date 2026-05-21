import { createSeededRng, type SeededRng } from './seededRng';
import type { QuizDataSource } from './engine';
import type { CasualQuestion, QuizAnswer } from './questionTypes';
import type { AppPokemon } from '../data/types';
import { getAbilityDisplayName } from '../data/abilityNames';

/**
 * Compares two type lists, ignoring order.
 */
function areTypesEqual(t1: string[], t2: string[]): boolean {
  if (t1.length !== t2.length) return false;
  const s1 = [...t1].sort();
  const s2 = [...t2].sort();
  return s1.every((t, i) => t === s2[i]);
}

/**
 * Standard utility to serialize a type list for duplicate checking.
 */
function serializeTypes(types: string[]): string {
  return [...types].sort().join('|');
}

/**
 * Builds an AppPokemon instance from meta and full data.
 */
function buildAppPokemon(
  meta: { name: string; spreads: AppPokemon['spread'][]; items: string[]; abilities: string[] },
  fullData: { baseStats: AppPokemon['baseStats']; types: string[] },
  rng: SeededRng,
): AppPokemon {
  return {
    name: meta.name,
    baseStats: fullData.baseStats,
    types: fullData.types,
    ability: getAbilityDisplayName(rng.randomFrom(meta.abilities)),
    item: rng.randomFrom(meta.items),
    spread: rng.randomFrom(meta.spreads),
    level: 50,
  };
}

/**
 * Generates 5 daily deterministic casual questions.
 */
export function generateCasualQuestions(
  source: QuizDataSource,
  dateKey: string,
): CasualQuestion[] {
  const rng = createSeededRng(`casual-challenge-${dateKey}`);
  const names = source.getMetaPokemonNames();

  if (names.length < 4) return [];

  const questions: CasualQuestion[] = [];
  const usedTargetTypes = new Set<string>();
  const usedPokemonNames = new Set<string>();

  // Attempt to generate 5 questions
  for (let qIdx = 0; qIdx < 5; qIdx++) {
    let questionAttempt = 0;
    let success = false;

    while (questionAttempt < 100 && !success) {
      questionAttempt++;
      // 1. Pick a target Pokémon
      const correctName = rng.randomFrom(names);
      if (usedPokemonNames.has(correctName)) continue;

      const correctMeta = source.getMetaPokemon(correctName);
      const correctFull = source.getFullData(correctName);
      if (!correctMeta || !correctFull || correctFull.types.length === 0) continue;

      const targetTypes = correctFull.types;
      const typeKey = serializeTypes(targetTypes);
      if (usedTargetTypes.has(typeKey)) continue;

      // 2. We have a valid target Pokémon! Now select 3 wrong options.
      const wrongs: AppPokemon[] = [];
      const targetIsDual = targetTypes.length === 2;
      
      let candidateNames: string[] = [];

      if (targetIsDual) {
        // Shuffle the two target types to decide which one to try first
        const [typeA, typeB] = targetTypes;
        const typeChoices = rng.shuffle([typeA, typeB]);
        
        for (const sharedType of typeChoices) {
          const matchingNames = names.filter((name) => {
            if (name === correctName) return false;
            const full = source.getFullData(name);
            if (!full) return false;
            // Must have the shared type, but not be equal to the target types
            return full.types.includes(sharedType) && !areTypesEqual(full.types, targetTypes);
          });
          
          if (matchingNames.length >= 3) {
            candidateNames = matchingNames;
            break;
          }
        }
      } else {
        // Target is mono-type
        const monoType = targetTypes[0];
        const matchingNames = names.filter((name) => {
          if (name === correctName) return false;
          const full = source.getFullData(name);
          if (!full) return false;
          // Must have the mono type, but be a dual-type (length === 2)
          return full.types.includes(monoType) && full.types.length === 2;
        });

        if (matchingNames.length >= 3) {
          candidateNames = matchingNames;
        }
      }

      // If we found enough smart candidates, shuffle and pick 3. Otherwise, fall back to standard logic
      if (candidateNames.length >= 3) {
        const selectedNames = rng.shuffle(candidateNames).slice(0, 3);
        selectedNames.forEach((candidateName) => {
          const candMeta = source.getMetaPokemon(candidateName)!;
          const candFull = source.getFullData(candidateName)!;
          wrongs.push(buildAppPokemon(candMeta, candFull, rng));
        });
      } else {
        // Fallback: standard random wrong options (types not equal to target types)
        const wrongNames = new Set<string>([correctName]);
        let wrongAttempt = 0;

        while (wrongs.length < 3 && wrongAttempt < 200) {
          wrongAttempt++;
          const candidateName = rng.randomFrom(names);
          if (wrongNames.has(candidateName)) continue;

          const candMeta = source.getMetaPokemon(candidateName);
          const candFull = source.getFullData(candidateName);
          if (!candMeta || !candFull) continue;

          // Verify the types are not equal to the target types
          if (areTypesEqual(candFull.types, targetTypes)) continue;

          const wrongMon = buildAppPokemon(candMeta, candFull, rng);
          wrongs.push(wrongMon);
          wrongNames.add(candidateName);
        }
      }

      // If we couldn't find 3 valid wrong options, try another correct Pokémon
      if (wrongs.length < 3) continue;

      // 3. We successfully built a full question!
      const correctMon = buildAppPokemon(correctMeta, correctFull, rng);
      const options = [correctMon, ...wrongs];
      const shuffledOptions = rng.shuffle(options);
      const correctIndex = shuffledOptions.findIndex((m) => m.name === correctName);

      const sprites = shuffledOptions.map((m) => source.getSpriteUrl(m.name));

      questions.push({
        type: 'casual',
        targetTypes,
        options: shuffledOptions,
        sprites,
        correctIndex,
      });

      // Mark used to avoid duplicates in the 5-question daily set
      usedTargetTypes.add(typeKey);
      usedPokemonNames.add(correctName);
      success = true;
    }
  }

  // Fallback in case we couldn't satisfy unique constraints (e.g. small dataset in test mocks)
  if (questions.length < 5 && questions.length > 0) {
    while (questions.length < 5) {
      // Duplicate a question with different shuffle or just grab the first one to ensure length is 5
      questions.push({ ...questions[0] });
    }
  }

  return questions.slice(0, 5);
}

/**
 * Checks a casual quiz answer.
 */
export function checkCasualAnswer(
  question: CasualQuestion,
  selectedIndex: number,
): QuizAnswer {
  const correct = selectedIndex === question.correctIndex;
  return {
    question,
    userAnswer: selectedIndex,
    correct,
    pointsEarned: correct ? 10 : 0,
  };
}
