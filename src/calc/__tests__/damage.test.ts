import { describe, it, expect } from 'vitest';
import { calcDamage } from '../damage';
import type { AppPokemon } from '../../data/types';

function makeAttacker(overrides: Partial<AppPokemon> = {}): AppPokemon {
  return {
    name: 'Charizard-Mega-Y',
    baseStats: { hp: 78, atk: 104, def: 78, spa: 159, spd: 115, spe: 100 },
    types: ['Fire', 'Flying'],
    ability: 'Drought',
    item: 'Charizardite Y',
    spread: { nature: 'Timid', hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
    level: 50,
    ...overrides,
  };
}

function makeDefender(overrides: Partial<AppPokemon> = {}): AppPokemon {
  return {
    name: 'Incineroar',
    baseStats: { hp: 95, atk: 115, def: 90, spa: 80, spd: 90, spe: 60 },
    types: ['Fire', 'Dark'],
    ability: 'Intimidate',
    item: 'Sitrus Berry',
    spread: { nature: 'Careful', hp: 252, atk: 0, def: 4, spa: 0, spd: 252, spe: 0 },
    level: 50,
    ...overrides,
  };
}

describe('calcDamage', () => {
  it('returns non-null for a valid matchup', () => {
    const result = calcDamage(
      makeAttacker(),
      makeDefender(),
      'Heat Wave'
    );
    expect(result).not.toBeNull();
  });

  it('returns correct structure with rolls, min, max, percentages', () => {
    const result = calcDamage(
      makeAttacker(),
      makeDefender(),
      'Heat Wave'
    );
    expect(result).toBeDefined();
    expect(result!.rolls.length).toBeGreaterThan(0);
    expect(result!.min).toBeLessThanOrEqual(result!.max);
    expect(result!.minPercent).toBeLessThanOrEqual(result!.maxPercent);
    expect(result!.description).toBeTruthy();
  });

  it('returns null for an invalid/status move gracefully', () => {
    // A move that doesn't deal damage
    const result = calcDamage(
      makeAttacker(),
      makeDefender(),
      'Protect'
    );
    // calcDamage should handle this gracefully (null or zero damage)
    if (result) {
      expect(result.max).toBe(0);
    }
  });

  it('calculates super-effective damage correctly (higher range)', () => {
    const grassDefender = makeDefender({
      name: 'Rillaboom',
      baseStats: { hp: 100, atk: 125, def: 90, spa: 60, spd: 70, spe: 85 },
      types: ['Grass'],
      ability: 'Grassy Surge',
    });

    const result = calcDamage(
      makeAttacker(),
      grassDefender,
      'Heat Wave'
    );
    expect(result).not.toBeNull();
    // Super effective fire on grass should do significant damage
    expect(result!.maxPercent).toBeGreaterThan(50);
  });
});
