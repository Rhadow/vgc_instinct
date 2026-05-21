/**
 * Daily Challenge generator.
 * Produces a deterministic set of 5 questions seeded by the current date.
 * Same seed = same questions for all users on the same day.
 */
import { createSeededRng, type SeededRng } from './seededRng';
import type { QuizQuestion } from './questionTypes';
import type { TypeQuestion } from './typeQuiz';
import type { QuizDataSource } from './engine';
import type { AppPokemon, SpeedContext } from '../data/types';
import { calcDamage } from '../calc/damage';
import { calcSpeedOrder } from '../calc/speed';
import { calcTypeEffectiveness, multiplierToLabel, ALL_TYPES, EFFECTIVENESS_OPTIONS } from '../data/typeChart';
import { Generations, Move } from '@smogon/calc';
import { getAbilityDisplayName } from '../data/abilityNames';
import type { DamageQuestion, SpeedQuestion } from './questionTypes';


export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const KNOWN_STATUS_MOVES = new Set([
  'Protect', 'Detect', 'Spore', 'Thunder Wave', 'Toxic', 'Will-O-Wisp',
  'Tailwind', 'Trick Room', 'Rain Dance', 'Sunny Day', 'Sandstorm',
  'Snowscape', 'Swords Dance', 'Nasty Plot', 'Calm Mind', 'Dragon Dance',
  'Follow Me', 'Rage Powder', 'Helping Hand', 'Ally Switch', 'Wide Guard',
  'Quick Guard', 'Spiky Shield', "King's Shield", 'Baneful Bunker',
  'Taunt', 'Encore', 'Disable', 'Imprison', 'Stealth Rock', 'Rapid Spin',
  'Defog', 'Roar', 'Whirlwind', 'Heal Pulse', 'Life Dew', 'Wish',
  'Rest', 'Sleep Talk', 'Substitute', 'Pain Split', 'Recover', 'Roost',
  'Leech Seed', 'Clear Smog', 'Parting Shot', 'U-turn', 'Volt Switch',
  'Trick', 'Switcheroo', 'Light Screen', 'Reflect', 'Aurora Veil',
  'Haze', 'Safeguard', 'Coaching',
]);
const DAMAGING_PIVOT_MOVES = new Set(['U-turn', 'Volt Switch', 'Flip Turn']);

function isDamagingMove(moveName: string): boolean {
  if (DAMAGING_PIVOT_MOVES.has(moveName)) return true;
  return !KNOWN_STATUS_MOVES.has(moveName);
}

function formatRange(min: number, max: number): string {
  if (min >= 100) return 'Guaranteed OHKO';
  return `${min.toFixed(1)}% – ${max.toFixed(1)}%`;
}

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

function generateSeededWrongOptions(
  actualMinPct: number,
  actualMaxPct: number,
  rng: SeededRng,
): string[] {
  const baseMin = actualMinPct >= 100 ? 100 : actualMinPct;
  const range = actualMaxPct - actualMinPct;
  const safeRange = Math.min(range, 15);
  const correctStr = formatRange(actualMinPct, actualMaxPct);

  let attemptsOuter = 0;
  while (attemptsOuter < 10) {
    attemptsOuter++;
    
    // Choose a target rank deterministically via seeded rng:
    // 0 = correct is smallest, 3 = correct is largest
    let targetRank = rng.randomInt(0, 3);
    if (actualMinPct >= 100) {
      targetRank = 3;
    }

    const smallerCount = targetRank;
    const largerCount = 3 - targetRank;

    const wrongs: string[] = [];
    const usedStrings = new Set<string>([correctStr]);
    const usedRanges: [number, number][] = [[actualMinPct, actualMaxPct]];

    // Generate smaller options
    let smallerGenerated = 0;
    let attempt = 0;
    while (smallerGenerated < smallerCount && attempt < 100) {
      attempt++;
      const shift = -(8 + rng.random() * 42);
      let newMin = Math.max(0, baseMin + shift);
      let newMax = newMin + safeRange + (rng.random() * 4 - 2);
      newMax = Math.max(newMin + 1, newMax);
      newMin = parseFloat(newMin.toFixed(1));
      newMax = parseFloat(newMax.toFixed(1));

      const overlaps = usedRanges.some(
        ([existMin, existMax]) => newMin <= existMax && newMax >= existMin,
      );
      const str = formatRange(newMin, newMax);

      if (!overlaps && !usedStrings.has(str)) {
        usedRanges.push([newMin, newMax]);
        usedStrings.add(str);
        wrongs.push(str);
        smallerGenerated++;
      }
    }

    // Generate larger options
    let largerGenerated = 0;
    attempt = 0;
    while (largerGenerated < largerCount && attempt < 100) {
      attempt++;
      const shift = 8 + rng.random() * 42;
      let newMin = baseMin + shift;
      let newMax = newMin + safeRange + (rng.random() * 4 - 2);
      newMax = Math.max(newMin + 1, newMax);
      newMin = parseFloat(newMin.toFixed(1));
      newMax = parseFloat(newMax.toFixed(1));

      if (newMin >= 100) continue;

      const overlaps = usedRanges.some(
        ([existMin, existMax]) => newMin <= existMax && newMax >= existMin,
      );
      const str = formatRange(newMin, newMax);

      if (!overlaps && !usedStrings.has(str)) {
        usedRanges.push([newMin, newMax]);
        usedStrings.add(str);
        wrongs.push(str);
        largerGenerated++;
      }
    }

    if (wrongs.length === 3) {
      return wrongs;
    }
  }

  // Fallback
  const wrongs: string[] = [];
  const usedStrings = new Set<string>([correctStr]);
  const usedRanges: [number, number][] = [[actualMinPct, actualMaxPct]];
  let attempt = 0;
  while (wrongs.length < 3 && attempt < 200) {
    attempt++;
    const shift = (rng.random() * 100) - 50;
    let newMin = Math.max(0, baseMin + shift);
    let newMax = newMin + safeRange + (rng.random() * 4 - 2);
    newMax = Math.max(newMin + 1, newMax);
    newMin = parseFloat(newMin.toFixed(1));
    newMax = parseFloat(newMax.toFixed(1));

    if (actualMinPct < 100 && newMin >= 100) continue;

    const overlaps = usedRanges.some(
      ([existMin, existMax]) => newMin <= existMax && newMax >= existMin,
    );
    const str = formatRange(newMin, newMax);
    if (!overlaps && !usedStrings.has(str)) {
      usedRanges.push([newMin, newMax]);
      usedStrings.add(str);
      wrongs.push(str);
    }
  }
  return wrongs;
}

/**
 * Generate the daily challenge questions for a given date.
 * Mix: 2 damage + 2 speed + 1 type = 5 questions.
 */
export function generateDailyChallenge(
  source: QuizDataSource,
  date?: string,
): QuizQuestion[] {
  const dateKey = date ?? getTodayKey();
  const rng = createSeededRng(`daily-challenge-${dateKey}`);
  const names = source.getMetaPokemonNames();

  if (names.length < 4) return [];

  const questions: QuizQuestion[] = [];
  const history = new Set<string>();

  // Helper: pick a random pokemon name using seeded RNG
  const pickName = (): string => rng.randomFrom(names);

  // Generate 2 damage questions
  let damageCount = 0;
  let attempts = 0;
  while (damageCount < 2 && attempts < 1000) {
    attempts++;
    const atkName = pickName();
    let defName = pickName();
    while (defName === atkName) defName = pickName();

    const atkMeta = source.getMetaPokemon(atkName);
    const defMeta = source.getMetaPokemon(defName);
    if (!atkMeta || !defMeta) continue;

    const atkFull = source.getFullData(atkName);
    const defFull = source.getFullData(defName);
    if (!atkFull || !defFull) continue;

    const damagingMoves = atkMeta.moves.filter(isDamagingMove);
    if (damagingMoves.length === 0) continue;

    const moveName = rng.randomFrom(damagingMoves);
    const key = `${atkName}|${defName}|${moveName}`;
    if (history.has(key) && attempts < 500) continue;

    const attacker = buildAppPokemon(atkMeta, atkFull, rng);
    const defender = buildAppPokemon(defMeta, defFull, rng);

    const result = calcDamage(attacker, defender, moveName);
    if (!result || result.maxPercent === 0) continue;

    history.add(key);

    const correctStr = formatRange(result.minPercent, result.maxPercent);
    const wrongs = generateSeededWrongOptions(result.minPercent, result.maxPercent, rng);
    const allOptions = [correctStr, ...wrongs];
    const shuffled = rng.shuffle(allOptions);
    const correctIndex = shuffled.indexOf(correctStr);

    const calcMove = new Move(Generations.get(9), moveName);

    const dmgQ: DamageQuestion = {
      type: 'damage',
      attacker,
      defender,
      moveName,
      moveType: calcMove.type,
      attackerSprite: source.getSpriteUrl(atkName),
      defenderSprite: source.getSpriteUrl(defName),
      correctResult: result,
      options: shuffled,
      correctIndex,
    };
    questions.push(dmgQ);
    damageCount++;
  }

  // Generate 2 speed questions
  let speedCount = 0;
  attempts = 0;
  while (speedCount < 2 && attempts < 1000) {
    attempts++;
    const pickedSet = new Set<string>();
    while (pickedSet.size < 4) pickedSet.add(pickName());
    const picked = Array.from(pickedSet);

    const key = [...picked].sort().join('|');
    if (history.has(key) && attempts < 500) continue;

    const pokemons: AppPokemon[] = [];
    const sprites: string[] = [];
    let valid = true;

    for (const name of picked) {
      const meta = source.getMetaPokemon(name);
      const full = source.getFullData(name);
      if (!meta || !full) { valid = false; break; }
      pokemons.push(buildAppPokemon(meta, full, rng));
      sprites.push(source.getSpriteUrl(name));
    }
    if (!valid) continue;

    const trickRoom = rng.random() < 0.3;
    const tailwind = pokemons.map(() => rng.random() < 0.2);
    const paralysis = pokemons.map(() => rng.random() < 0.15);
    const statStages = pokemons.map(() => (rng.random() < 0.2 ? -1 : 0));

    const contexts: SpeedContext[] = pokemons.map((pokemon, i) => ({
      pokemon,
      trickRoom,
      tailwind: tailwind[i],
      statStage: statStages[i],
      paralysis: paralysis[i],
    }));

    const correctOrder = calcSpeedOrder(contexts);
    history.add(key);

    const spdQ: SpeedQuestion = {
      type: 'speed',
      pokemons,
      sprites,
      trickRoom,
      tailwind,
      paralysis,
      statStages,
      correctOrder,
    };
    questions.push(spdQ);
    speedCount++;
  }

  // Generate 1 type question
  let typeCount = 0;
  attempts = 0;
  while (typeCount < 1 && attempts < 1000) {
    attempts++;
    const defName = pickName();
    const defMeta = source.getMetaPokemon(defName);
    const defFull = source.getFullData(defName);
    if (!defMeta || !defFull) continue;

    const attackingType = rng.randomFrom([...ALL_TYPES]);
    const key = `type|${attackingType}|${defName}`;
    if (history.has(key) && attempts < 500) continue;

    const multiplier = calcTypeEffectiveness(attackingType, defFull.types);
    const correctLabel = multiplierToLabel(multiplier);
    const allOpts = [...EFFECTIVENESS_OPTIONS] as string[];
    const wrongOpts = rng.shuffle(allOpts.filter((o) => o !== correctLabel)).slice(0, 3);
    const combined = rng.shuffle([correctLabel, ...wrongOpts]);

    history.add(key);

    const defender: AppPokemon = {
      name: defMeta.name,
      baseStats: defFull.baseStats,
      types: defFull.types,
      ability: defMeta.abilities[0] || 'Unknown',
      item: defMeta.items[0] || 'nothing',
      spread: defMeta.spreads[0],
      level: 50,
    };

    const typeQ: TypeQuestion = {
      type: 'type',
      attackingType,
      defender,
      defenderSprite: source.getSpriteUrl(defName),
      correctMultiplier: multiplier,
      correctLabel,
      options: combined,
      correctIndex: combined.indexOf(correctLabel),
    };
    questions.push(typeQ);
    typeCount++;
  }

  return questions;
}
