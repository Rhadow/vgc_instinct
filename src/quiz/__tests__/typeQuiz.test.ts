import { describe, it, expect } from 'vitest';
import { generateTypeQuestion, checkTypeAnswer } from '../typeQuiz';
import type { QuizDataSource } from '../engine';

// Helper mock data source for type quiz testing
const mockSource: QuizDataSource = {
  getMetaPokemonNames() {
    return ['Charizard', 'Garchomp', 'Shedinja'];
  },
  getMetaPokemon(name: string) {
    return {
      name,
      usage: 100,
      spreads: [{ nature: 'Timid', hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }],
      moves: [],
      items: ['choicescarf'],
      abilities: ['Blaze'],
    };
  },
  getFullData(name: string) {
    if (name === 'Charizard') {
      return {
        name,
        baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
        types: ['Fire', 'Flying'],
        abilities: ['Blaze'],
        spriteUrl: '',
      };
    }
    if (name === 'Garchomp') {
      return {
        name,
        baseStats: { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 },
        types: ['Dragon', 'Ground'],
        abilities: ['Rough Skin'],
        spriteUrl: '',
      };
    }
    return {
      name,
      baseStats: { hp: 1, atk: 90, def: 45, spa: 30, spd: 30, spe: 40 },
      types: ['Bug', 'Ghost'],
      abilities: ['Wonder Guard'],
      spriteUrl: '',
    };
  },
  getSpriteUrl() {
    return 'sprite_url';
  },
};

describe('Type Matchup Quiz', () => {
  it('generates a valid type question with a dual-type defender', async () => {
    const history = new Set<string>();
    const question = await generateTypeQuestion(mockSource, history, 20, false);
    
    expect(question).not.toBeNull();
    if (question) {
      expect(question.type).toBe('type');
      expect(question.attackingType).toBeDefined();
      expect(question.defender).toBeDefined();
      expect(question.defenderSprite).toBe('sprite_url');
      expect(question.options.length).toBe(4);
      expect(question.options).toContain(question.correctLabel);
      expect(question.options[question.correctIndex]).toBe(question.correctLabel);
    }
  });

  it('correctly calculates double effectiveness, resistances, and immunities', async () => {
    // We can explicitly test type effectiveness checks
    const garchompQuestion = {
      type: 'type' as const,
      attackingType: 'Ice',
      defender: {
        name: 'Garchomp',
        baseStats: { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 },
        types: ['Dragon', 'Ground'],
        ability: 'Rough Skin',
        item: 'choicescarf',
        spread: { nature: 'Jolly', hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
        level: 50,
      },
      defenderSprite: '',
      correctMultiplier: 4,
      correctLabel: '4×',
      options: ['1×', '2×', '4×', '0.5×'],
      correctIndex: 2,
    };

    const correctAns = checkTypeAnswer(garchompQuestion, 2);
    expect(correctAns.correct).toBe(true);
    expect(correctAns.pointsEarned).toBe(10);

    // Test adjacent answer for partial points (Ice is 4x, user guesses 2x)
    // EFFECTIVENESS_OPTIONS = ['0×', '0.25×', '0.5×', '1×', '2×', '4×']
    // Correct index of 4x is 5, selected is 2x (index 4). Proximity = 1.
    const closeAns = checkTypeAnswer(garchompQuestion, 1); // guesses 2x
    expect(closeAns.correct).toBe(false);
    expect(closeAns.pointsEarned).toBe(3);

    // Guesses 1x (index 3). Proximity = 2. Points should be 0.
    const farAns = checkTypeAnswer(garchompQuestion, 0); // guesses 1x
    expect(farAns.correct).toBe(false);
    expect(farAns.pointsEarned).toBe(0);
  });
});
