import type { AppPokemon, PokemonMetaData, PokemonFullData, SpeedContext } from '../data/types';
import type { DamageQuestion, SpeedQuestion, QuizQuestion, QuizAnswer } from './questionTypes';
import { calcDamage } from '../calc/damage';
import { calcSpeedOrder } from '../calc/speed';

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function formatRange(min: number, max: number): string {
  return `${min.toFixed(1)}% – ${max.toFixed(1)}%`;
}

function generateWrongOptions(minPct: number, maxPct: number): string[] {
  const range = maxPct - minPct;
  const offsets = [
    { min: -15, max: -8 },
    { min: 8, max: 15 },
    { min: -25, max: -18 },
    { min: 18, max: 25 },
  ];

  const wrongs: string[] = [];
  const usedRanges: Array<[number, number]> = [[minPct, maxPct]];

  for (const offset of offsets) {
    if (wrongs.length >= 3) break;

    const shift = offset.min + Math.random() * (offset.max - offset.min);
    let newMin = Math.max(0, minPct + shift);
    let newMax = newMin + range + (Math.random() * 4 - 2);
    newMax = Math.max(newMin + 1, newMax);

    // Ensure no overlap with any existing range
    const overlaps = usedRanges.some(
      ([existMin, existMax]) => newMin <= existMax && newMax >= existMin
    );

    if (!overlaps) {
      newMin = parseFloat(newMin.toFixed(1));
      newMax = parseFloat(newMax.toFixed(1));
      usedRanges.push([newMin, newMax]);
      wrongs.push(formatRange(newMin, newMax));
    }
  }

  // Fill remaining with simple shifts if needed
  while (wrongs.length < 3) {
    const shift = (wrongs.length + 1) * 20 * (Math.random() > 0.5 ? 1 : -1);
    const newMin = parseFloat(Math.max(0, minPct + shift).toFixed(1));
    const newMax = parseFloat(Math.max(newMin + 1, maxPct + shift).toFixed(1));
    wrongs.push(formatRange(newMin, newMax));
  }

  return wrongs.slice(0, 3);
}

function buildAppPokemon(meta: PokemonMetaData, fullData: PokemonFullData): AppPokemon {
  const spread = randomFrom(meta.spreads);
  const item = randomFrom(meta.items);
  const ability = randomFrom(meta.abilities);

  return {
    name: meta.name,
    baseStats: fullData.baseStats,
    types: fullData.types,
    ability,
    item,
    spread,
    level: 50,
  };
}

// Status moves that should be filtered out of damage quiz
const STATUS_CATEGORIES = ['Status'];

/**
 * Determine if a move is likely a damaging move based on name heuristics.
 * The Smogon stats don't include category info, so we filter known status moves.
 */
const KNOWN_STATUS_MOVES = new Set([
  'Protect', 'Detect', 'Spore', 'Thunder Wave', 'Toxic', 'Will-O-Wisp',
  'Tailwind', 'Trick Room', 'Rain Dance', 'Sunny Day', 'Sandstorm',
  'Snowscape', 'Swords Dance', 'Nasty Plot', 'Calm Mind', 'Dragon Dance',
  'Follow Me', 'Rage Powder', 'Helping Hand', 'Ally Switch', 'Wide Guard',
  'Quick Guard', 'Spiky Shield', 'King\'s Shield', 'Baneful Bunker',
  'Taunt', 'Encore', 'Disable', 'Imprison', 'Stealth Rock', 'Rapid Spin',
  'Defog', 'Roar', 'Whirlwind', 'Heal Pulse', 'Life Dew', 'Wish',
  'Rest', 'Sleep Talk', 'Substitute', 'Pain Split', 'Recover', 'Roost',
  'Leech Seed', 'Clear Smog', 'Parting Shot', 'U-turn', 'Volt Switch',
  'Trick', 'Switcheroo', 'Light Screen', 'Reflect', 'Aurora Veil',
  'Haze', 'Safeguard', 'Coaching',
]);

// Pivoting moves that do deal damage
const DAMAGING_PIVOT_MOVES = new Set(['U-turn', 'Volt Switch', 'Flip Turn', 'Parting Shot']);

function isDamagingMove(moveName: string): boolean {
  if (DAMAGING_PIVOT_MOVES.has(moveName)) return true;
  return !KNOWN_STATUS_MOVES.has(moveName);
}

export interface QuizDataSource {
  getMetaPokemonNames(): string[];
  getMetaPokemon(name: string): PokemonMetaData | undefined;
  getFullData(name: string): PokemonFullData | null;
  getSpriteUrl(name: string): string;
}

export async function generateDamageQuestion(
  source: QuizDataSource,
  maxAttempts: number = 10,
): Promise<DamageQuestion | null> {
  const names = source.getMetaPokemonNames();
  if (names.length < 2) return null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const atkName = randomFrom(names);
    let defName = randomFrom(names);
    while (defName === atkName) defName = randomFrom(names);

    const atkMeta = source.getMetaPokemon(atkName);
    const defMeta = source.getMetaPokemon(defName);
    if (!atkMeta || !defMeta) continue;

    const atkFull = source.getFullData(atkName);
    const defFull = source.getFullData(defName);
    if (!atkFull || !defFull) continue;

    const damagingMoves = atkMeta.moves.filter(isDamagingMove);
    if (damagingMoves.length === 0) continue;

    const moveName = randomFrom(damagingMoves);
    const attacker = buildAppPokemon(atkMeta, atkFull);
    const defender = buildAppPokemon(defMeta, defFull);

    const result = calcDamage(attacker, defender, moveName);
    if (!result || result.maxPercent === 0) continue;

    const correctStr = formatRange(result.minPercent, result.maxPercent);
    const wrongs = generateWrongOptions(result.minPercent, result.maxPercent);
    const allOptions = [correctStr, ...wrongs];
    const shuffled = shuffleArray(allOptions);
    const correctIndex = shuffled.indexOf(correctStr);

    return {
      type: 'damage',
      attacker,
      defender,
      moveName,
      attackerSprite: source.getSpriteUrl(atkName),
      defenderSprite: source.getSpriteUrl(defName),
      correctResult: result,
      options: shuffled,
      correctIndex,
    };
  }

  return null;
}

export async function generateSpeedQuestion(
  source: QuizDataSource,
): Promise<SpeedQuestion | null> {
  const names = source.getMetaPokemonNames();
  if (names.length < 4) return null;

  // Pick 4 unique Pokémon
  const picked = shuffleArray(names).slice(0, 4);
  const pokemons: AppPokemon[] = [];
  const sprites: string[] = [];

  for (const name of picked) {
    const meta = source.getMetaPokemon(name);
    const full = source.getFullData(name);
    if (!meta || !full) return null;
    pokemons.push(buildAppPokemon(meta, full));
    sprites.push(source.getSpriteUrl(name));
  }

  // Random field conditions
  const trickRoom = Math.random() < 0.3;
  const tailwind = pokemons.map(() => Math.random() < 0.2);
  const paralysis = pokemons.map(() => Math.random() < 0.15);
  const statStages = pokemons.map(() => {
    if (Math.random() < 0.2) return -1; // Icy Wind
    return 0;
  });

  const contexts: SpeedContext[] = pokemons.map((pokemon, i) => ({
    pokemon,
    trickRoom,
    tailwind: tailwind[i],
    statStage: statStages[i],
    paralysis: paralysis[i],
  }));

  const correctOrder = calcSpeedOrder(contexts);

  return {
    type: 'speed',
    pokemons,
    sprites,
    trickRoom,
    tailwind,
    paralysis,
    statStages,
    correctOrder,
  };
}

export function checkDamageAnswer(question: DamageQuestion, selectedIndex: number): QuizAnswer {
  const correct = selectedIndex === question.correctIndex;
  return {
    question,
    userAnswer: selectedIndex,
    correct,
    pointsEarned: correct ? 10 : 0,
  };
}

export function checkSpeedAnswer(question: SpeedQuestion, userOrder: number[]): QuizAnswer {
  const correctIndices = question.correctOrder.map((r) =>
    question.pokemons.indexOf(r.pokemon)
  );

  let correctCount = 0;
  for (let i = 0; i < 4; i++) {
    if (userOrder[i] === correctIndices[i]) correctCount++;
  }

  const allCorrect = correctCount === 4;
  const threeCorrect = correctCount === 3;

  return {
    question,
    userAnswer: userOrder,
    correct: allCorrect,
    pointsEarned: allCorrect ? 10 : threeCorrect ? 5 : 0,
  };
}

export function getHighScore(mode: string): number {
  try {
    return parseInt(localStorage.getItem(`highscore_${mode}`) ?? '0', 10);
  } catch {
    return 0;
  }
}

export function saveHighScore(mode: string, score: number): void {
  try {
    const current = getHighScore(mode);
    if (score > current) {
      localStorage.setItem(`highscore_${mode}`, score.toString());
    }
  } catch {
    // localStorage unavailable
  }
}
