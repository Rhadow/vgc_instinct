import { describe, it, expect } from 'vitest';
import { generateCasualQuestions, checkCasualAnswer } from '../casualQuiz';
import type { QuizDataSource } from '../engine';

// Mock data source with enough variety to generate questions
const mockDataSource: QuizDataSource = {
  getMetaPokemonNames: () => [
    'Charizard', 'Pikachu', 'Venusaur', 'Blastoise', 'Garchomp', 
    'Aegislash', 'Gengar', 'Talonflame', 'Sableye', 'Sylveon'
  ],
  getMetaPokemon: (name) => {
    const data: Record<string, any> = {
      Charizard: { name: 'Charizard', spreads: [{ nature: 'Timid', hp: 0, atk: 0, def: 0, spa: 252, spd: 4, spe: 252 }], moves: ['Flamethrower'], items: ['charcoal'], abilities: ['Blaze'] },
      Pikachu: { name: 'Pikachu', spreads: [{ nature: 'Jolly', hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 }], moves: ['Thunderbolt'], items: ['lightball'], abilities: ['Static'] },
      Venusaur: { name: 'Venusaur', spreads: [{ nature: 'Modest', hp: 252, atk: 0, def: 0, spa: 252, spd: 4, spe: 0 }], moves: ['Giga Drain'], items: ['miracleseed'], abilities: ['Overgrow'] },
      Blastoise: { name: 'Blastoise', spreads: [{ nature: 'Bold', hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 }], moves: ['Surf'], items: ['leftovers'], abilities: ['Torrent'] },
      Garchomp: { name: 'Garchomp', spreads: [{ nature: 'Jolly', hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 }], moves: ['Earthquake'], items: ['lifeorb'], abilities: ['Rough Skin'] },
      Aegislash: { name: 'Aegislash', spreads: [{ nature: 'Quiet', hp: 252, atk: 0, def: 4, spa: 252, spd: 0, spe: 0 }], moves: ['Shadow Ball'], items: ['weaknesspolicy'], abilities: ['Stance Change'] },
      Gengar: { name: 'Gengar', spreads: [{ nature: 'Timid', hp: 0, atk: 0, def: 0, spa: 252, spd: 4, spe: 252 }], moves: ['Shadow Ball'], items: ['focussash'], abilities: ['Cursed Body'] },
      Talonflame: { name: 'Talonflame', spreads: [{ nature: 'Jolly', hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 }], moves: ['Brave Bird'], items: ['sharpbeak'], abilities: ['Gale Wings'] },
      Sableye: { name: 'Sableye', spreads: [{ nature: 'Calm', hp: 252, atk: 0, def: 128, spa: 0, spd: 128, spe: 0 }], moves: ['Foul Play'], items: ['roseliberry'], abilities: ['Prankster'] },
      Sylveon: { name: 'Sylveon', spreads: [{ nature: 'Modest', hp: 252, atk: 0, def: 0, spa: 252, spd: 4, spe: 0 }], moves: ['Hyper Voice'], items: ['pixieplate'], abilities: ['Pixilate'] },
    };
    return data[name];
  },
  getFullData: (name) => {
    const data: Record<string, any> = {
      Charizard: { name: 'Charizard', baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 }, types: ['Fire', 'Flying'], abilities: ['Blaze'], spriteUrl: 'charizard.png' },
      Pikachu: { name: 'Pikachu', baseStats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 }, types: ['Electric'], abilities: ['Static'], spriteUrl: 'pikachu.png' },
      Venusaur: { name: 'Venusaur', baseStats: { hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 }, types: ['Grass', 'Poison'], abilities: ['Overgrow'], spriteUrl: 'venusaur.png' },
      Blastoise: { name: 'Blastoise', baseStats: { hp: 79, atk: 83, def: 100, spa: 85, spd: 105, spe: 78 }, types: ['Water'], abilities: ['Torrent'], spriteUrl: 'blastoise.png' },
      Garchomp: { name: 'Garchomp', baseStats: { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 }, types: ['Dragon', 'Ground'], abilities: ['Rough Skin'], spriteUrl: 'garchomp.png' },
      Aegislash: { name: 'Aegislash', baseStats: { hp: 60, atk: 50, def: 140, spa: 50, spd: 140, spe: 60 }, types: ['Steel', 'Ghost'], abilities: ['Stance Change'], spriteUrl: 'aegislash.png' },
      Gengar: { name: 'Gengar', baseStats: { hp: 60, atk: 65, def: 60, spa: 130, spd: 75, spe: 110 }, types: ['Ghost', 'Poison'], abilities: ['Cursed Body'], spriteUrl: 'gengar.png' },
      Talonflame: { name: 'Talonflame', baseStats: { hp: 78, atk: 81, def: 71, spa: 74, spd: 69, spe: 126 }, types: ['Fire', 'Flying'], abilities: ['Gale Wings'], spriteUrl: 'talonflame.png' },
      Sableye: { name: 'Sableye', baseStats: { hp: 50, atk: 75, def: 75, spa: 65, spd: 65, spe: 50 }, types: ['Dark', 'Ghost'], abilities: ['Prankster'], spriteUrl: 'sableye.png' },
      Sylveon: { name: 'Sylveon', baseStats: { hp: 95, atk: 65, def: 65, spa: 110, spd: 130, spe: 60 }, types: ['Fairy'], abilities: ['Pixilate'], spriteUrl: 'sylveon.png' },
    };
    return data[name];
  },
  getSpriteUrl: (name) => `http://example.com/${name.toLowerCase()}.png`
};

describe('Casual Quiz Core Logic', () => {
  it('should generate exactly 5 daily questions deterministically', () => {
    const questions1 = generateCasualQuestions(mockDataSource, '2026-05-21');
    const questions2 = generateCasualQuestions(mockDataSource, '2026-05-21');
    const questions3 = generateCasualQuestions(mockDataSource, '2026-05-22');

    expect(questions1).toHaveLength(5);
    expect(questions2).toHaveLength(5);
    expect(questions3).toHaveLength(5);

    // Deterministic matching: same seed yields same questions
    expect(questions1).toEqual(questions2);

    // Different seed yields different questions
    expect(questions1).not.toEqual(questions3);
  });

  it('should guarantee that correct options have the exact target types and wrong options do not', () => {
    const questions = generateCasualQuestions(mockDataSource, '2026-05-21');

    questions.forEach((q) => {
      expect(q.type).toBe('casual');
      expect(q.options).toHaveLength(4);
      expect(q.sprites).toHaveLength(4);
      expect(q.targetTypes.length).toBeGreaterThan(0);

      const correctMon = q.options[q.correctIndex];
      
      // The correct option must have types exactly equal to targetTypes (ignoring order)
      const sortedTarget = [...q.targetTypes].sort();
      const sortedCorrect = [...correctMon.types].sort();
      expect(sortedCorrect).toEqual(sortedTarget);

      // Verify each option's sprite matches its name
      q.options.forEach((opt, idx) => {
        expect(q.sprites[idx]).toBe(`http://example.com/${opt.name.toLowerCase()}.png`);
        
        // Wrong options must NOT have the same types as correct types
        if (idx !== q.correctIndex) {
          const sortedWrong = [...opt.types].sort();
          expect(sortedWrong).not.toEqual(sortedTarget);
        }
      });
    });
  });

  it('should verify casual answers correctly and distribute appropriate points', () => {
    const questions = generateCasualQuestions(mockDataSource, '2026-05-21');
    const firstQ = questions[0];

    // Correct answer check
    const correctAns = checkCasualAnswer(firstQ, firstQ.correctIndex);
    expect(correctAns.correct).toBe(true);
    expect(correctAns.pointsEarned).toBe(10);

    // Wrong answer check
    const wrongIdx = (firstQ.correctIndex + 1) % 4;
    const wrongAns = checkCasualAnswer(firstQ, wrongIdx);
    expect(wrongAns.correct).toBe(false);
    expect(wrongAns.pointsEarned).toBe(0);
  });
});
