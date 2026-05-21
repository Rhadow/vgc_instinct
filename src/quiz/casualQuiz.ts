import { createSeededRng, type SeededRng } from './seededRng';
import type { QuizDataSource } from './engine';
import type { CasualQuestion, QuizAnswer } from './questionTypes';
import type { AppPokemon } from '../data/types';
import casualPokemonDataJson from '../data/casualPokemonData.json';

interface CasualPokemonEntry {
  name: string;
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  types: string[];
  abilities: string[];
  spriteUrl: string;
}

const casualData = casualPokemonDataJson as Record<string, CasualPokemonEntry>;

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
 * Builds an AppPokemon instance from a National Dex entry with sensible, clean defaults.
 */
function buildCasualAppPokemon(entry: CasualPokemonEntry, rng: SeededRng): AppPokemon {
  return {
    name: entry.name,
    baseStats: entry.baseStats,
    types: entry.types,
    ability: entry.abilities.length > 0 ? rng.randomFrom(entry.abilities) : 'No Ability',
    item: 'nothing',
    spread: { nature: 'Serious', hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    level: 50,
  };
}

/**
 * Generates 5 daily deterministic casual questions using the expanded National Dex database.
 */
export function generateCasualQuestions(
  _source: QuizDataSource, // Retained signature for compatibility
  dateKey: string,
): CasualQuestion[] {
  const rng = createSeededRng(`casual-challenge-${dateKey}`);
  const names = Object.keys(casualData);

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
      // 1. Pick a target Pokémon from the expanded pool
      const correctName = rng.randomFrom(names);
      if (usedPokemonNames.has(correctName)) continue;

      const correctEntry = casualData[correctName];
      if (!correctEntry || correctEntry.types.length === 0) continue;

      const targetTypes = correctEntry.types;
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
            const entry = casualData[name];
            if (!entry) return false;
            // Must have the shared type, but not be equal to the target types
            return entry.types.includes(sharedType) && !areTypesEqual(entry.types, targetTypes);
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
          const entry = casualData[name];
          if (!entry) return false;
          // Must have the mono type, but be a dual-type (length === 2)
          return entry.types.includes(monoType) && entry.types.length === 2;
        });

        if (matchingNames.length >= 3) {
          candidateNames = matchingNames;
        }
      }

      // If we found enough smart candidates, shuffle and pick 3. Otherwise, fall back to standard logic
      if (candidateNames.length >= 3) {
        const selectedNames = rng.shuffle(candidateNames).slice(0, 3);
        selectedNames.forEach((candidateName) => {
          const entry = casualData[candidateName]!;
          wrongs.push(buildCasualAppPokemon(entry, rng));
        });
      } else {
        // Fallback: standard random wrong options (types not equal to target types)
        const wrongNames = new Set<string>([correctName]);
        let wrongAttempt = 0;

        while (wrongs.length < 3 && wrongAttempt < 200) {
          wrongAttempt++;
          const candidateName = rng.randomFrom(names);
          if (wrongNames.has(candidateName)) continue;

          const entry = casualData[candidateName];
          if (!entry) continue;

          // Verify the types are not equal to the target types
          if (areTypesEqual(entry.types, targetTypes)) continue;

          const wrongMon = buildCasualAppPokemon(entry, rng);
          wrongs.push(wrongMon);
          wrongNames.add(candidateName);
        }
      }

      // If we couldn't find 3 valid wrong options, try another correct Pokémon
      if (wrongs.length < 3) continue;

      // 3. We successfully built a full question!
      const correctMon = buildCasualAppPokemon(correctEntry, rng);
      const options = [correctMon, ...wrongs];
      const shuffledOptions = rng.shuffle(options);
      const correctIndex = shuffledOptions.findIndex((m) => m.name === correctName);

      const sprites = shuffledOptions.map((m) => casualData[m.name]?.spriteUrl || '');

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
