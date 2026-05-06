import { describe, it, expect } from 'vitest';
import { calcBaseStat, calcFinalSpeed, calcSpeedOrder } from '../speed';
import type { AppPokemon, SpeedContext } from '../../data/types';

function makePokemon(overrides: Partial<AppPokemon> = {}): AppPokemon {
  return {
    name: 'TestMon',
    baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
    types: ['Normal'],
    ability: 'Pressure',
    item: '',
    spread: { nature: 'Hardy', hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    level: 50,
    ...overrides,
  };
}

describe('calcBaseStat', () => {
  it('calculates 252 Spe Timid base 100 correctly', () => {
    // floor((floor((2*100 + 31 + floor(252/4)) * 50/100) + 5) * 1.1)
    // = floor((floor((200 + 31 + 63) * 0.5) + 5) * 1.1)
    // = floor((floor(294 * 0.5) + 5) * 1.1)
    // = floor((147 + 5) * 1.1)
    // = floor(152 * 1.1)
    // = floor(167.2)
    // = 167
    expect(calcBaseStat(100, 31, 252, 'Timid')).toBe(167);
  });

  it('calculates 0 Spe Brave base 30 correctly', () => {
    // floor((floor((2*30 + 31 + 0) * 50/100) + 5) * 0.9)
    // = floor((floor(91 * 0.5) + 5) * 0.9)
    // = floor((45 + 5) * 0.9)
    // = floor(50 * 0.9)
    // = floor(45)
    // = 45
    expect(calcBaseStat(30, 31, 0, 'Brave')).toBe(45);
  });

  it('calculates neutral nature correctly', () => {
    // floor((floor((2*100 + 31 + 0) * 50/100) + 5) * 1.0)
    // = floor((floor(231 * 0.5) + 5))
    // = floor(115 + 5)
    // = 120
    expect(calcBaseStat(100, 31, 0, 'Hardy')).toBe(120);
  });

  it('calculates 0 IV 0 EV Brave base 30 correctly', () => {
    // floor((floor((2*30 + 0 + 0) * 50/100) + 5) * 0.9)
    // = floor((floor(60 * 0.5) + 5) * 0.9)
    // = floor((30 + 5) * 0.9)
    // = floor(35 * 0.9)
    // = floor(31.5) = 31
    expect(calcBaseStat(30, 0, 0, 'Brave')).toBe(31);
  });
});

describe('calcFinalSpeed', () => {
  it('applies Choice Scarf (×1.5)', () => {
    const pokemon = makePokemon({
      baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
      spread: { nature: 'Timid', hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 252 },
      item: 'Choice Scarf',
    });
    const ctx: SpeedContext = { pokemon, trickRoom: false, tailwind: false, statStage: 0, paralysis: false };
    // 167 * 1.5 = 250.5 → 250
    expect(calcFinalSpeed(ctx)).toBe(250);
  });

  it('applies Tailwind (×2)', () => {
    const pokemon = makePokemon({
      baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
      spread: { nature: 'Timid', hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 252 },
    });
    const ctx: SpeedContext = { pokemon, trickRoom: false, tailwind: true, statStage: 0, paralysis: false };
    // 167 * 2 = 334
    expect(calcFinalSpeed(ctx)).toBe(334);
  });

  it('applies Paralysis (×0.5)', () => {
    const pokemon = makePokemon({
      baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
      spread: { nature: 'Timid', hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 252 },
    });
    const ctx: SpeedContext = { pokemon, trickRoom: false, tailwind: false, statStage: 0, paralysis: true };
    // 167 * 0.5 = 83.5 → 83
    expect(calcFinalSpeed(ctx)).toBe(83);
  });

  it('applies -1 speed stage (Icy Wind)', () => {
    const pokemon = makePokemon({
      baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
      spread: { nature: 'Timid', hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 252 },
    });
    const ctx: SpeedContext = { pokemon, trickRoom: false, tailwind: false, statStage: -1, paralysis: false };
    // 167 * 2/3 = 111.333 → 111
    expect(calcFinalSpeed(ctx)).toBe(111);
  });

  it('stacks Choice Scarf with Tailwind correctly', () => {
    const pokemon = makePokemon({
      baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
      spread: { nature: 'Timid', hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 252 },
      item: 'Choice Scarf',
    });
    const ctx: SpeedContext = { pokemon, trickRoom: false, tailwind: true, statStage: 0, paralysis: false };
    // 167 * 1.5 = 250 (Scarf), then * 2 = 500 (Tailwind)
    expect(calcFinalSpeed(ctx)).toBe(500);
  });
});

describe('calcSpeedOrder', () => {
  it('orders fastest first in normal mode', () => {
    const fast = makePokemon({
      name: 'Fast',
      baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 130 },
      spread: { nature: 'Timid', hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 252 },
    });
    const slow = makePokemon({
      name: 'Slow',
      baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 30 },
      spread: { nature: 'Brave', hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 },
    });

    const result = calcSpeedOrder([
      { pokemon: fast, trickRoom: false, tailwind: false, statStage: 0, paralysis: false },
      { pokemon: slow, trickRoom: false, tailwind: false, statStage: 0, paralysis: false },
    ]);

    expect(result[0].pokemon.name).toBe('Fast');
    expect(result[1].pokemon.name).toBe('Slow');
    expect(result[0].effectiveOrder).toBe(1);
    expect(result[1].effectiveOrder).toBe(2);
  });

  it('reverses order in Trick Room', () => {
    const fast = makePokemon({
      name: 'Fast',
      baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 130 },
      spread: { nature: 'Timid', hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 252 },
    });
    const slow = makePokemon({
      name: 'Slow',
      baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 30 },
      spread: { nature: 'Brave', hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 0 },
    });

    const result = calcSpeedOrder([
      { pokemon: fast, trickRoom: true, tailwind: false, statStage: 0, paralysis: false },
      { pokemon: slow, trickRoom: true, tailwind: false, statStage: 0, paralysis: false },
    ]);

    expect(result[0].pokemon.name).toBe('Slow');
    expect(result[1].pokemon.name).toBe('Fast');
  });
});
