import { describe, it, expect } from 'vitest';
import type { AchievementContext } from '../useAchievements';
import { evaluateAchievements } from '../useAchievements';

function makeContext(
  overrides: Partial<AchievementContext> = {}
): AchievementContext {
  return {
    totalSessions: 0,
    currentStreak: 0,
    damageBest: 0,
    speedBest: 0,
    dailyStreak: 0,
    weaknessEntryCount: 0,
    damageHighScoreCount: 0,
    speedHighScoreCount: 0,
    typeHighScoreCount: 0,
    hasPerfectScore: false,
    ...overrides,
  };
}

describe('evaluateAchievements', () => {
  it('returns no badges for a zeroed-out context', () => {
    const ctx = makeContext();
    const result = evaluateAchievements(ctx, new Set());
    expect(result).toEqual([]);
  });

  it('unlocks first_steps when totalSessions >= 1', () => {
    const ctx = makeContext({ totalSessions: 1 });
    const result = evaluateAchievements(ctx, new Set());
    const ids = result.map((b) => b.id);
    expect(ids).toContain('first_steps');
  });

  it('does not re-unlock already unlocked badges', () => {
    const ctx = makeContext({ totalSessions: 1 });
    const alreadyUnlocked = new Set(['first_steps']);
    const result = evaluateAchievements(ctx, alreadyUnlocked);
    const ids = result.map((b) => b.id);
    expect(ids).not.toContain('first_steps');
  });

  it('can unlock multiple badges at once', () => {
    const ctx = makeContext({
      totalSessions: 5,
      currentStreak: 5,
    });
    const result = evaluateAchievements(ctx, new Set());
    const ids = result.map((b) => b.id);
    expect(ids).toContain('first_steps');
    expect(ids).toContain('warming_up');
    expect(ids).toContain('hot_streak');
    expect(ids.length).toBeGreaterThanOrEqual(3);
  });

  it('unlocks perfect_round when hasPerfectScore is true', () => {
    const ctx = makeContext({ hasPerfectScore: true });
    const result = evaluateAchievements(ctx, new Set());
    const ids = result.map((b) => b.id);
    expect(ids).toContain('perfect_round');
  });
});
