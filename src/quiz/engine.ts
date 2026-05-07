import type { AppPokemon, AppField, PokemonMetaData, PokemonFullData, SpeedContext } from '../data/types';
import type { DamageQuestion, SpeedQuestion, QuizAnswer } from './questionTypes';
import { calcDamage } from '../calc/damage';
import { calcSpeedOrder } from '../calc/speed';
import { Generations, Move } from '@smogon/calc';
import { getAbilityDisplayName } from '../data/abilityNames';

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
  if (min >= 100) return 'Guaranteed OHKO';
  return `${min.toFixed(1)}% – ${max.toFixed(1)}%`;
}

function generateWrongOptions(actualMinPct: number, actualMaxPct: number): string[] {
  const baseMin = actualMinPct >= 100 ? 100 : actualMinPct;
  const range = actualMaxPct - actualMinPct;
  const safeRange = Math.min(range, 15);
  
  const offsets = [
    { min: -15, max: -8 },
    { min: 8, max: 15 },
    { min: -25, max: -18 },
    { min: 18, max: 25 },
    { min: -35, max: -28 },
    { min: -45, max: -38 },
  ];

  const wrongs: string[] = [];
  const usedRanges: Array<[number, number]> = [[actualMinPct, actualMaxPct]];
  
  let hasOHKO = actualMinPct >= 100;

  let attempt = 0;
  while (wrongs.length < 3 && attempt < 200) {
    attempt++;
    let shift: number;
    if (attempt <= offsets.length) {
      const offset = offsets[attempt - 1];
      shift = offset.min + Math.random() * (offset.max - offset.min);
    } else {
      // Allow much larger negative shifts when we need non-OHKO options
      shift = (Math.random() * 140) - 100; // -100 to +40
    }

    let newMin = Math.max(0, baseMin + shift);
    let newMax = newMin + safeRange + (Math.random() * 4 - 2);
    newMax = Math.max(newMin + 1, newMax);

    newMin = parseFloat(newMin.toFixed(1));
    newMax = parseFloat(newMax.toFixed(1));

    if (hasOHKO && newMin >= 100) {
      continue;
    }

    const overlaps = usedRanges.some(
      ([existMin, existMax]) => newMin <= existMax && newMax >= existMin
    );

    if (!overlaps) {
      if (newMin >= 100) hasOHKO = true;
      usedRanges.push([newMin, newMax]);
      wrongs.push(formatRange(newMin, newMax));
    }
  }

  return wrongs.slice(0, 3);
}

function buildAppPokemon(meta: PokemonMetaData, fullData: PokemonFullData): AppPokemon {
  const spread = randomFrom(meta.spreads);
  const rawItem = randomFrom(meta.items);
  const rawAbility = randomFrom(meta.abilities);

  return {
    name: meta.name,
    baseStats: fullData.baseStats,
    types: fullData.types,
    ability: getAbilityDisplayName(rawAbility),
    item: rawItem,   // kept as Smogon ID — converted to display at render time
    spread,
    level: 50,
  };
}

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

const DAMAGING_PIVOT_MOVES = new Set(['U-turn', 'Volt Switch', 'Flip Turn', 'Parting Shot']);

function isDamagingMove(moveName: string): boolean {
  if (DAMAGING_PIVOT_MOVES.has(moveName)) return true;
  return !KNOWN_STATUS_MOVES.has(moveName);
}

/** Abilities that double speed in specific weather */
const WEATHER_SPEED_ABILITIES = ['Swift Swim', 'Chlorophyll', 'Sand Rush', 'Slush Rush'];
const WEATHER_FOR_ABILITY: Record<string, 'Sun' | 'Rain' | 'Sand' | 'Snow'> = {
  'Swift Swim': 'Rain',
  'Chlorophyll': 'Sun',
  'Sand Rush': 'Sand',
  'Slush Rush': 'Snow',
};

export interface QuizDataSource {
  getMetaPokemonNames(): string[];
  getMetaPokemon(name: string): PokemonMetaData | undefined;
  getFullData(name: string): PokemonFullData | null;
  getSpriteUrl(name: string): string;
}

/**
 * Creates a matchup key for history tracking to prevent duplicate questions.
 */
function makeDamageKey(atkName: string, defName: string, move: string): string {
  return `${atkName}|${defName}|${move}`;
}
function makeSpeedKey(names: string[]): string {
  return [...names].sort().join('|');
}

/** Weather-setting abilities */
const WEATHER_SETTERS: Record<string, 'Sun' | 'Rain' | 'Sand' | 'Snow'> = {
  'Drought': 'Sun',
  'Drizzle': 'Rain',
  'Sand Stream': 'Sand',
  'Snow Warning': 'Snow',
};

/** Terrain-setting abilities */
const TERRAIN_SETTERS: Record<string, 'Electric' | 'Grassy' | 'Psychic' | 'Misty'> = {
  'Electric Surge': 'Electric',
  'Grassy Surge': 'Grassy',
  'Psychic Surge': 'Psychic',
  'Misty Surge': 'Misty',
};

/**
 * Generate random field conditions for a damage question.
 * Biases toward weather/terrain that the attacker or defender can set.
 */
function generateDamageField(attacker: AppPokemon, defender: AppPokemon): AppField | null {
  let weather: AppField['weather'] | undefined;
  let terrain: AppField['terrain'] | undefined;

  // Check for weather-setting abilities
  const atkWeather = WEATHER_SETTERS[attacker.ability];
  const defWeather = WEATHER_SETTERS[defender.ability];

  if (atkWeather) {
    weather = atkWeather; // Always set if ability present
  } else if (defWeather) {
    weather = defWeather;
  } else if (Math.random() < 0.25) {
    // 25% chance of random weather
    weather = randomFrom(['Sun', 'Rain', 'Sand', 'Snow'] as const);
  }

  // Check for terrain-setting abilities
  const atkTerrain = TERRAIN_SETTERS[attacker.ability];
  const defTerrain = TERRAIN_SETTERS[defender.ability];

  if (atkTerrain) {
    terrain = atkTerrain;
  } else if (defTerrain) {
    terrain = defTerrain;
  } else if (Math.random() < 0.15) {
    // 15% chance of random terrain
    terrain = randomFrom(['Electric', 'Grassy', 'Psychic', 'Misty'] as const);
  }

  if (!weather && !terrain) return null;
  return { weather, terrain };
}

function getWeightedRandomPokemon(source: QuizDataSource, metaMode?: boolean): string {
  const names = source.getMetaPokemonNames();
  if (!metaMode) return randomFrom(names);

  // Meta Mode: Weight by usage tiers
  // 60% Top 50 | 35% Top 75 (51-75) | 5% Rest
  const sortedNames = [...names].sort((a, b) => {
    const usageA = source.getMetaPokemon(a)?.usage || 0;
    const usageB = source.getMetaPokemon(b)?.usage || 0;
    return usageB - usageA;
  });

  const r = Math.random();
  if (r < 0.60) {
    return randomFrom(sortedNames.slice(0, 50));
  } else if (r < 0.95) {
    return randomFrom(sortedNames.slice(50, 75));
  } else {
    return randomFrom(sortedNames.slice(75));
  }
}

export async function generateDamageQuestion(
  source: QuizDataSource,
  history: Set<string> = new Set(),
  maxAttempts: number = 20,
  metaMode?: boolean,
): Promise<DamageQuestion | null> {
  const names = source.getMetaPokemonNames();
  if (names.length < 2) return null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const atkName = getWeightedRandomPokemon(source, metaMode);
    let defName = getWeightedRandomPokemon(source, metaMode);
    while (defName === atkName) defName = getWeightedRandomPokemon(source, metaMode);

    const atkMeta = source.getMetaPokemon(atkName);
    const defMeta = source.getMetaPokemon(defName);
    if (!atkMeta || !defMeta) continue;

    const atkFull = source.getFullData(atkName);
    const defFull = source.getFullData(defName);
    if (!atkFull || !defFull) continue;

    const damagingMoves = atkMeta.moves.filter(isDamagingMove);
    if (damagingMoves.length === 0) continue;

    const moveName = randomFrom(damagingMoves);

    // Check history for duplicate
    const key = makeDamageKey(atkName, defName, moveName);
    if (history.has(key)) continue;

    const attacker = buildAppPokemon(atkMeta, atkFull);
    const defender = buildAppPokemon(defMeta, defFull);

    // Generate random field conditions
    const field = generateDamageField(attacker, defender);

    const result = calcDamage(attacker, defender, moveName, field ?? undefined);
    if (!result || result.maxPercent === 0) continue;

    history.add(key);

    const correctStr = formatRange(result.minPercent, result.maxPercent);
    const wrongs = generateWrongOptions(result.minPercent, result.maxPercent);
    const allOptions = [correctStr, ...wrongs];
    const shuffled = shuffleArray(allOptions);
    const correctIndex = shuffled.indexOf(correctStr);

    const calcMove = new Move(Generations.get(9), moveName);

    return {
      type: 'damage',
      attacker,
      defender,
      moveName,
      moveType: calcMove.type,
      attackerSprite: source.getSpriteUrl(atkName),
      defenderSprite: source.getSpriteUrl(defName),
      correctResult: result,
      field: field ?? undefined,
      options: shuffled,
      correctIndex,
    };
  }

  return null;
}

export async function generateSpeedQuestion(
  source: QuizDataSource,
  history: Set<string> = new Set(),
  maxAttempts: number = 10,
  metaMode?: boolean,
): Promise<SpeedQuestion | null> {
  const names = source.getMetaPokemonNames();
  if (names.length < 4) return null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pickedSet = new Set<string>();
    while (pickedSet.size < 4) {
      pickedSet.add(getWeightedRandomPokemon(source, metaMode));
    }
    const picked = Array.from(pickedSet);

    // Check history for duplicate
    const key = makeSpeedKey(picked);
    if (history.has(key)) continue;

    const pokemons: AppPokemon[] = [];
    const sprites: string[] = [];
    let valid = true;

    for (const name of picked) {
      const meta = source.getMetaPokemon(name);
      const full = source.getFullData(name);
      if (!meta || !full) { valid = false; break; }
      pokemons.push(buildAppPokemon(meta, full));
      sprites.push(source.getSpriteUrl(name));
    }
    if (!valid) continue;

    // Random field conditions
    const trickRoom = Math.random() < 0.3;
    const tailwind = pokemons.map(() => Math.random() < 0.2);
    const paralysis = pokemons.map(() => Math.random() < 0.15);
    const statStages = pokemons.map(() => (Math.random() < 0.2 ? -1 : 0));

    // Weather: check if any picked Pokémon has a weather speed ability
    let weather: 'Sun' | 'Rain' | 'Sand' | 'Snow' | undefined;
    const weatherAbilityMon = pokemons.find((p) =>
      WEATHER_SPEED_ABILITIES.includes(p.ability)
    );
    if (weatherAbilityMon && Math.random() < 0.5) {
      weather = WEATHER_FOR_ABILITY[weatherAbilityMon.ability];
    }
    // Also randomly add weather sometimes for variety
    if (!weather && Math.random() < 0.2) {
      weather = randomFrom(['Sun', 'Rain', 'Sand', 'Snow'] as const);
    }

    const contexts: SpeedContext[] = pokemons.map((pokemon, i) => ({
      pokemon,
      trickRoom,
      tailwind: tailwind[i],
      statStage: statStages[i],
      paralysis: paralysis[i],
      weather,
    }));

    const correctOrder = calcSpeedOrder(contexts);

    history.add(key);

    return {
      type: 'speed',
      pokemons,
      sprites,
      trickRoom,
      tailwind,
      paralysis,
      statStages,
      weather,
      correctOrder,
    };
  }

  return null;
}

export function checkDamageAnswer(question: DamageQuestion, selectedIndex: number): QuizAnswer {
  const correct = selectedIndex === question.correctIndex;

  // Partial score: if the selected range is adjacent to the correct answer
  let pointsEarned = 0;
  if (correct) {
    pointsEarned = 10;
  } else {
    // Parse selected and correct ranges to check proximity
    const parseRange = (str: string): [number, number] => {
      if (str === 'Guaranteed OHKO') return [100, 100];
      const parts = str.split('–').map((s) => parseFloat(s.trim()));
      return [parts[0], parts[1]];
    };

    const [selectedMin] = parseRange(question.options[selectedIndex]);
    const [correctMin] = parseRange(question.options[question.correctIndex]);
    const diff = Math.abs(selectedMin - correctMin);

    if (diff <= 10) {
      pointsEarned = 3; // Close answer
    }
  }

  return {
    question,
    userAnswer: selectedIndex,
    correct,
    pointsEarned,
  };
}

export function checkSpeedAnswer(question: SpeedQuestion, userOrder: number[]): QuizAnswer {
  let correctCount = 0;
  for (let i = 0; i < 4; i++) {
    const userPokemonIndex = userOrder[i];
    const userPokemon = question.pokemons[userPokemonIndex];
    
    const userPokemonSpeed = question.correctOrder.find((r) => r.pokemon === userPokemon)?.finalSpeed;
    const expectedSpeed = question.correctOrder[i].finalSpeed;
    
    if (userPokemonSpeed === expectedSpeed) {
      correctCount++;
    }
  }

  let pointsEarned = 0;
  if (correctCount === 4) pointsEarned = 10;
  else if (correctCount === 3) pointsEarned = 5;
  else if (correctCount === 2) pointsEarned = 2;

  return {
    question,
    userAnswer: userOrder,
    correct: correctCount === 4,
    pointsEarned,
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
