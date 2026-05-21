import { describe, it, expect } from 'vitest';
import { computeDifficulty } from '../useWeaknessTracker';
import type { WeaknessEntry } from '../useWeaknessTracker';

const MS_PER_DAY = 86_400_000;

function makeEntry(overrides: Partial<WeaknessEntry> = {}): WeaknessEntry {
  return {
    wrongCount: 0,
    rightCount: 0,
    lastSeen: Date.now(),
    difficulty: 0,
    ...overrides,
  };
}

describe('computeDifficulty', () => {
  it('returns 0 for all-correct records', () => {
    const entry = makeEntry({ wrongCount: 0, rightCount: 10, lastSeen: Date.now() });

    const result = computeDifficulty(entry);

    expect(result).toBe(0);
  });

  it('returns higher values for more wrong answers', () => {
    const fewWrong = makeEntry({ wrongCount: 2, rightCount: 8, lastSeen: Date.now() });
    const manyWrong = makeEntry({ wrongCount: 8, rightCount: 2, lastSeen: Date.now() });

    const diffFew = computeDifficulty(fewWrong);
    const diffMany = computeDifficulty(manyWrong);

    expect(diffMany).toBeGreaterThan(diffFew);
  });

  it('boosts difficulty for entries not seen recently', () => {
    const seenRecently = makeEntry({
      wrongCount: 5,
      rightCount: 5,
      lastSeen: Date.now(),
    });
    const seenLongAgo = makeEntry({
      wrongCount: 5,
      rightCount: 5,
      lastSeen: Date.now() - 14 * MS_PER_DAY, // 14 days ago
    });

    const diffRecent = computeDifficulty(seenRecently);
    const diffOld = computeDifficulty(seenLongAgo);

    expect(diffOld).toBeGreaterThan(diffRecent);
  });

  it('handles zero total answers (no right, no wrong)', () => {
    const entry = makeEntry({ wrongCount: 0, rightCount: 0, lastSeen: Date.now() });

    const result = computeDifficulty(entry);

    // errorRate = 0 / (0 + 0 + 1) = 0, so difficulty should be 0
    expect(result).toBe(0);
  });

  it('caps recency boost at 3x', () => {
    // Entry seen 100 days ago — should cap at 3x (recencyBoost = 1 + min(100/7, 2) = 3)
    const oldEntry = makeEntry({
      wrongCount: 5,
      rightCount: 5,
      lastSeen: Date.now() - 100 * MS_PER_DAY,
    });
    const veryOldEntry = makeEntry({
      wrongCount: 5,
      rightCount: 5,
      lastSeen: Date.now() - 365 * MS_PER_DAY,
    });

    const diffOld = computeDifficulty(oldEntry);
    const diffVeryOld = computeDifficulty(veryOldEntry);

    // Both should be equal since recency boost is capped
    expect(diffOld).toBeCloseTo(diffVeryOld);
  });
});
