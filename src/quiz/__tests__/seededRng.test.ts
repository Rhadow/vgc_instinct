import { describe, it, expect } from 'vitest';
import { createSeededRng, hashString } from '../seededRng';

describe('hashString', () => {
  it('returns the same hash for the same input', () => {
    expect(hashString('test')).toBe(hashString('test'));
  });

  it('returns different hashes for different inputs', () => {
    expect(hashString('abc')).not.toBe(hashString('xyz'));
  });
});

describe('createSeededRng', () => {
  it('produces the same sequence for the same seed (determinism)', () => {
    const rng1 = createSeededRng('daily-2026-05-20');
    const rng2 = createSeededRng('daily-2026-05-20');

    const seq1 = Array.from({ length: 10 }, () => rng1.random());
    const seq2 = Array.from({ length: 10 }, () => rng2.random());

    expect(seq1).toEqual(seq2);
  });

  it('produces different sequences for different seeds', () => {
    const rng1 = createSeededRng('seed-a');
    const rng2 = createSeededRng('seed-b');

    const seq1 = Array.from({ length: 5 }, () => rng1.random());
    const seq2 = Array.from({ length: 5 }, () => rng2.random());

    expect(seq1).not.toEqual(seq2);
  });

  it('randomInt produces values within the inclusive range', () => {
    const rng = createSeededRng('range-test');

    for (let i = 0; i < 100; i++) {
      const val = rng.randomInt(3, 7);
      expect(val).toBeGreaterThanOrEqual(3);
      expect(val).toBeLessThanOrEqual(7);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('shuffle returns all original elements', () => {
    const rng = createSeededRng('shuffle-test');
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const shuffled = rng.shuffle(original);

    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.sort((a, b) => a - b)).toEqual(original);
  });

  it('shuffle does not mutate the original array', () => {
    const rng = createSeededRng('no-mutate');
    const original = [10, 20, 30];
    const copy = [...original];
    rng.shuffle(original);

    expect(original).toEqual(copy);
  });

  it('randomFrom returns an element from the array', () => {
    const rng = createSeededRng('pick-test');
    const items = ['a', 'b', 'c', 'd'];

    for (let i = 0; i < 50; i++) {
      const picked = rng.randomFrom(items);
      expect(items).toContain(picked);
    }
  });
});
