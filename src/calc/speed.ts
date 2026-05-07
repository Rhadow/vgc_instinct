import type { SpeedContext, SpeedResult } from '../data/types';

/**
 * Gen 9 stat formula (level 50):
 * stat = floor( floor( (2 * base + iv + floor(ev / 4)) * 50 / 100 ) + 5 ) * natureMultiplier
 * 
 * Note: nature multiplier is baked into the base stat calculation.
 */

const SPEED_NATURES_PLUS = [
  'Timid', 'Hasty', 'Jolly', 'Naive',
];

const SPEED_NATURES_MINUS = [
  'Brave', 'Relaxed', 'Quiet', 'Sassy',
];

/** Stat stage multiplier table: stage → multiplier fraction [numerator, denominator] */
const STAGE_MULTIPLIERS: Record<string, [number, number]> = {
  '-6': [2, 8],
  '-5': [2, 7],
  '-4': [2, 6],
  '-3': [2, 5],
  '-2': [2, 4],
  '-1': [2, 3],
  '0': [1, 1],
  '1': [3, 2],
  '2': [4, 2],
  '3': [5, 2],
  '4': [6, 2],
  '5': [7, 2],
  '6': [8, 2],
};

/** Weather-based speed-doubling abilities */
const WEATHER_SPEED_ABILITIES: Record<string, string> = {
  'Swift Swim': 'Rain',
  'Chlorophyll': 'Sun',
  'Sand Rush': 'Sand',
  'Slush Rush': 'Snow',
};

function getNatureMultiplier(nature: string): number {
  if (SPEED_NATURES_PLUS.includes(nature)) return 1.1;
  if (SPEED_NATURES_MINUS.includes(nature)) return 0.9;
  return 1.0;
}

function getNatureLabel(nature: string): string {
  if (SPEED_NATURES_PLUS.includes(nature)) return '+Spe';
  if (SPEED_NATURES_MINUS.includes(nature)) return '-Spe';
  return 'neutral';
}

/**
 * Calculate the base speed stat at level 50 (before in-battle modifiers).
 */
export function calcBaseStat(
  baseSpe: number,
  iv: number,
  ev: number,
  nature: string,
): number {
  const raw = Math.floor(
    (Math.floor((2 * baseSpe + iv + Math.floor(ev / 4)) * 50 / 100) + 5)
    * getNatureMultiplier(nature)
  );
  return raw;
}

export interface SpeedBreakdownStep {
  label: string;
  value: number;
  formula?: string;
}

/**
 * Calculate the final in-battle speed after all modifiers,
 * returning both the final speed and a step-by-step breakdown.
 * 
 * Modifier application order (each applied then floored):
 * 1. Stat stages (Icy Wind, Electroweb, etc.)
 * 2. Paralysis (×0.5)
 * 3. Items: Choice Scarf (×1.5), Iron Ball (×0.5)
 * 4. Abilities: weather speed-doubling (Swift Swim, Chlorophyll, Sand Rush, Slush Rush)
 * 5. Tailwind (×2)
 */
export function calcFinalSpeed(ctx: SpeedContext): number {
  return calcFinalSpeedWithBreakdown(ctx).finalSpeed;
}

export function calcFinalSpeedWithBreakdown(ctx: SpeedContext): {
  finalSpeed: number;
  breakdown: SpeedBreakdownStep[];
} {
  const { pokemon } = ctx;
  const iv = pokemon.ivs?.spe ?? 31;
  const baseSpe = pokemon.baseStats.spe;
  const ev = pokemon.spread.spe;
  const nature = pokemon.spread.nature;

  const breakdown: SpeedBreakdownStep[] = [];

  let speed = calcBaseStat(baseSpe, iv, ev, nature);
  breakdown.push({
    label: `Base stat (${baseSpe} base, ${ev} EV, ${iv} IV, ${getNatureLabel(nature)})`,
    value: speed,
    formula: `floor((floor((2×${baseSpe}+${iv}+floor(${ev}/4))×50/100)+5)×${getNatureMultiplier(nature)})`,
  });

  // 1. Stat stages
  if (ctx.statStage !== 0) {
    const clampedStage = Math.max(-6, Math.min(6, ctx.statStage));
    const [num, den] = STAGE_MULTIPLIERS[clampedStage.toString()] ?? [1, 1];
    speed = Math.floor(speed * num / den);
    breakdown.push({
      label: `Speed stage ${ctx.statStage > 0 ? '+' : ''}${ctx.statStage} (×${num}/${den})`,
      value: speed,
    });
  }

  // 2. Paralysis
  if (ctx.paralysis) {
    speed = Math.floor(speed * 0.5);
    breakdown.push({
      label: 'Paralysis (×0.5)',
      value: speed,
    });
  }

  // 3. Items
  if (pokemon.item === 'choicescarf') {
    speed = Math.floor(speed * 1.5);
    breakdown.push({
      label: 'Choice Scarf (×1.5)',
      value: speed,
    });
  }
  if (pokemon.item === 'ironball') {
    speed = Math.floor(speed * 0.5);
    breakdown.push({
      label: 'Iron Ball (×0.5)',
      value: speed,
    });
  }

  // 4. Weather abilities
  const abilityWeather = WEATHER_SPEED_ABILITIES[pokemon.ability];
  if (abilityWeather && ctx.weather === abilityWeather) {
    speed = Math.floor(speed * 2);
    breakdown.push({
      label: `${pokemon.ability} in ${ctx.weather} (×2)`,
      value: speed,
    });
  }

  // 5. Tailwind
  if (ctx.tailwind) {
    speed = Math.floor(speed * 2);
    breakdown.push({
      label: 'Tailwind (×2)',
      value: speed,
    });
  }

  return { finalSpeed: speed, breakdown };
}

/**
 * Given multiple speed contexts, calculate the turn order.
 * In Trick Room, the slowest Pokémon moves first.
 * Returns SpeedResults sorted by move order (first to move = effectiveOrder 1).
 */
export function calcSpeedOrder(contexts: SpeedContext[]): SpeedResult[] {
  const trickRoom = contexts.length > 0 && contexts[0].trickRoom;

  const results: SpeedResult[] = contexts.map((ctx) => ({
    pokemon: ctx.pokemon,
    finalSpeed: calcFinalSpeed(ctx),
    effectiveOrder: 0, // will be assigned below
  }));

  // Sort: normally fastest first; in Trick Room, slowest first
  results.sort((a, b) => {
    if (trickRoom) {
      return a.finalSpeed - b.finalSpeed; // ascending = slowest first
    }
    return b.finalSpeed - a.finalSpeed; // descending = fastest first
  });

  // Assign effective order
  results.forEach((r, i) => {
    r.effectiveOrder = i + 1;
  });

  return results;
}
