import { describe, it, expect } from 'vitest';
import { generateDamageInsight, generateSpeedInsight } from '../insightSummary';
import type { DamageQuestion, SpeedQuestion } from '../../quiz/questionTypes';
import type { DamageBreakdown } from '../damageBreakdown';

function makeDamageQuestion(overrides: Partial<DamageQuestion> = {}): DamageQuestion {
  return {
    type: 'damage',
    attacker: { name: 'Charizard', types: ['Fire', 'Flying'], ability: 'Blaze', item: '', spread: { nature: 'Modest', hp: 0, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 }, level: 50, baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 } },
    defender: { name: 'Ferrothorn', types: ['Grass', 'Steel'], ability: 'Iron Barbs', item: '', spread: { nature: 'Relaxed', hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 }, level: 50, baseStats: { hp: 74, atk: 94, def: 131, spa: 54, spd: 116, spe: 20 } },
    moveName: 'Flamethrower',
    moveType: 'Fire',
    attackerSprite: '',
    defenderSprite: '',
    correctResult: { rolls: [], min: 0, max: 0, minPercent: 85, maxPercent: 100, description: '' },
    options: [],
    correctIndex: 0,
    ...overrides,
  } as DamageQuestion;
}

function makeBreakdown(overrides: Partial<DamageBreakdown> = {}): DamageBreakdown {
  return {
    typeEffectiveness: 1,
    typeEffectivenessLabel: 'Neutral (×1)',
    isStab: false,
    koChance: 'Not a KO',
    moveName: 'Tackle',
    moveType: 'Normal',
    moveCategory: 'Physical',
    movePower: 40,
    ...overrides,
  };
}

describe('generateDamageInsight', () => {
  it('generates insight for STAB + super effective', () => {
    const question = makeDamageQuestion({
      correctResult: { rolls: [], min: 0, max: 0, minPercent: 85, maxPercent: 100, description: '' },
    });
    const breakdown = makeBreakdown({
      typeEffectiveness: 4,
      isStab: true,
    });

    const result = generateDamageInsight(question, breakdown);

    expect(result).toContain('STAB');
    expect(result).toContain('super effective');
    expect(result).toContain('heavy damage');
  });

  it('generates insight for resisted move', () => {
    const question = makeDamageQuestion({
      correctResult: { rolls: [], min: 0, max: 0, minPercent: 15, maxPercent: 20, description: '' },
    });
    const breakdown = makeBreakdown({
      typeEffectiveness: 0.5,
      isStab: false,
    });

    const result = generateDamageInsight(question, breakdown);

    expect(result).toContain('Resisted');
    expect(result).toContain('minimal damage');
  });

  it('mentions weather boost', () => {
    const question = makeDamageQuestion({
      correctResult: { rolls: [], min: 0, max: 0, minPercent: 70, maxPercent: 85, description: '' },
    });
    const breakdown = makeBreakdown({
      typeEffectiveness: 2,
      isStab: true,
      weather: 'Sun',
      weatherEffect: 'boosted',
    });

    const result = generateDamageInsight(question, breakdown);

    expect(result).toContain('Sun-boosted');
  });

  it('generates KO insight for OHKO damage', () => {
    const question = makeDamageQuestion({
      correctResult: { rolls: [], min: 0, max: 0, minPercent: 110, maxPercent: 130, description: '' },
    });
    const breakdown = makeBreakdown({
      typeEffectiveness: 4,
      isStab: true,
    });

    const result = generateDamageInsight(question, breakdown);

    expect(result).toContain('guaranteed KO');
  });

  it('returns immune insight when type effectiveness is 0', () => {
    const question = makeDamageQuestion();
    const breakdown = makeBreakdown({
      typeEffectiveness: 0,
    });

    const result = generateDamageInsight(question, breakdown);

    expect(result).toContain('Immune');
  });
});

describe('generateSpeedInsight', () => {
  function makeSpeedQuestion(overrides: Partial<SpeedQuestion> = {}): SpeedQuestion {
    return {
      type: 'speed',
      pokemons: [
        { name: 'Dragapult', types: ['Dragon', 'Ghost'], ability: 'Clear Body', item: '', spread: { nature: 'Jolly', hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 }, level: 50, baseStats: { hp: 88, atk: 120, def: 75, spa: 100, spd: 75, spe: 142 } },
        { name: 'Torkoal', types: ['Fire'], ability: 'Drought', item: '', spread: { nature: 'Quiet', hp: 252, atk: 0, def: 4, spa: 252, spd: 0, spe: 0 }, level: 50, baseStats: { hp: 70, atk: 85, def: 140, spa: 85, spd: 70, spe: 20 } },
      ],
      sprites: ['', ''],
      trickRoom: false,
      tailwind: [false, false],
      paralysis: [false, false],
      statStages: [0, 0],
      correctOrder: [
        { pokemon: { name: 'Dragapult', types: ['Dragon', 'Ghost'], ability: 'Clear Body', item: '', spread: { nature: 'Jolly', hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 }, level: 50, baseStats: { hp: 88, atk: 120, def: 75, spa: 100, spd: 75, spe: 142 } }, finalSpeed: 213, effectiveOrder: 1 },
        { pokemon: { name: 'Torkoal', types: ['Fire'], ability: 'Drought', item: '', spread: { nature: 'Quiet', hp: 252, atk: 0, def: 4, spa: 252, spd: 0, spe: 0 }, level: 50, baseStats: { hp: 70, atk: 85, def: 140, spa: 85, spd: 70, spe: 20 } }, finalSpeed: 36, effectiveOrder: 2 },
      ],
      ...overrides,
    } as SpeedQuestion;
  }

  it('generates Trick Room insight', () => {
    const question = makeSpeedQuestion({ trickRoom: true });

    const result = generateSpeedInsight(question);

    expect(result).toContain('Trick Room');
    expect(result).toContain('slowest so it moves first');
  });

  it('generates Choice Scarf insight', () => {
    const question = makeSpeedQuestion({
      pokemons: [
        { name: 'Garchomp', types: ['Dragon', 'Ground'], ability: 'Rough Skin', item: 'choicescarf', spread: { nature: 'Jolly', hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 }, level: 50, baseStats: { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 } },
        { name: 'Dragapult', types: ['Dragon', 'Ghost'], ability: 'Clear Body', item: '', spread: { nature: 'Jolly', hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 }, level: 50, baseStats: { hp: 88, atk: 120, def: 75, spa: 100, spd: 75, spe: 142 } },
      ],
    });

    const result = generateSpeedInsight(question);

    expect(result).toContain('Choice Scarf');
    expect(result).toContain('Garchomp');
  });
});
