import { describe, it, expect } from 'vitest';
import { getWeightedRandomPokemon } from '../engine';
import type { QuizDataSource } from '../engine';
import type { WeaknessEntry } from '../../hooks/useWeaknessTracker';

// Helper mock data source
const mockSource: QuizDataSource = {
  getMetaPokemonNames() {
    return ['Pikachu', 'Charizard', 'Bulbasaur', 'Squirtle'];
  },
  getMetaPokemon(name: string) {
    const usages: Record<string, number> = {
      Pikachu: 100,
      Charizard: 80,
      Bulbasaur: 20,
      Squirtle: 10,
    };
    return {
      name,
      usage: usages[name] ?? 0,
      spreads: [],
      moves: [],
      items: [],
      abilities: [],
    };
  },
  getFullData() {
    return null;
  },
  getSpriteUrl() {
    return '';
  },
};

describe('getWeightedRandomPokemon', () => {
  it('selects pokemon when weaknessMap is empty', () => {
    const result = getWeightedRandomPokemon(mockSource, false);
    expect(['Pikachu', 'Charizard', 'Bulbasaur', 'Squirtle']).toContain(result);
  });

  it('biases towards high difficulty pokemon when weaknessMap is provided', () => {
    // Bulbasaur has a very high difficulty, others have none
    const weaknessMap: Record<string, WeaknessEntry> = {
      Bulbasaur: {
        wrongCount: 50,
        rightCount: 0,
        lastSeen: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        difficulty: 3.0, // ignored by dynamic computation, but satisfies interface
      },
    };

    // Run selection multiple times to check if Bulbasaur is selected most of the time
    let bulbasaurCount = 0;
    const iterations = 500;
    for (let i = 0; i < iterations; i++) {
      const result = getWeightedRandomPokemon(mockSource, false, weaknessMap);
      if (result === 'Bulbasaur') {
        bulbasaurCount++;
      }
    }

    // Without weakness tracking: Bulbasaur is 1 of 4, so ~25% chance (about 125 times).
    // With weakness tracking: Bulbasaur's weight is multiplied by 1 + 3.0 * 2 = 7x.
    // Relative weights: Pikachu (1), Charizard (1), Bulbasaur (7), Squirtle (1). Total = 10.
    // Expected probability: 7 / 10 = 70% chance (about 350 times).
    // Let's assert it is selected at least 50% of the time.
    expect(bulbasaurCount).toBeGreaterThan(iterations * 0.5);
  });
});
