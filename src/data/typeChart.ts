/**
 * Shared type effectiveness chart for Gen 9.
 * Used by damageBreakdown.ts and typeQuiz.ts.
 */

/** All 18 Pokémon types */
export const ALL_TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy',
] as const;

export type PokemonType = typeof ALL_TYPES[number];

/** Type chart: TYPE_CHART[attackingType][defendingType] = multiplier (only non-1.0 entries listed) */
export const TYPE_CHART: Record<string, Record<string, number>> = {
  Normal:   { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire:     { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water:    { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass:    { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice:      { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison:   { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground:   { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying:   { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic:  { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug:      { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock:     { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost:    { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon:   { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark:     { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel:    { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy:    { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
};

/**
 * Calculate type effectiveness of a move type against a defending Pokémon's types.
 */
export function calcTypeEffectiveness(moveType: string, defenderTypes: string[]): number {
  let mult = 1;
  for (const defType of defenderTypes) {
    const chart = TYPE_CHART[moveType];
    if (chart && chart[defType] !== undefined) {
      mult *= chart[defType];
    }
  }
  return mult;
}

/**
 * Human-readable effectiveness label.
 */
export function getEffectivenessLabel(mult: number): string {
  if (mult === 0) return 'Immune (×0)';
  if (mult === 0.25) return 'Doubly resisted (×0.25)';
  if (mult === 0.5) return 'Resisted (×0.5)';
  if (mult === 1) return 'Neutral (×1)';
  if (mult === 2) return 'Super effective (×2)';
  if (mult === 4) return 'Doubly super effective (×4)';
  return `×${mult}`;
}

/** All possible effectiveness multipliers for quiz options */
export const EFFECTIVENESS_OPTIONS = ['0×', '0.25×', '0.5×', '1×', '2×', '4×'] as const;

export function multiplierToLabel(mult: number): string {
  if (mult === 0) return '0×';
  if (mult === 0.25) return '0.25×';
  if (mult === 0.5) return '0.5×';
  if (mult === 1) return '1×';
  if (mult === 2) return '2×';
  if (mult === 4) return '4×';
  return `${mult}×`;
}
