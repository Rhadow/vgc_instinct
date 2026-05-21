import { describe, it, expect } from 'vitest';
import { computeStats } from '../useSessionHistory';
import type { SessionRecord } from '../useSessionHistory';

function makeRecord(
  overrides: Partial<SessionRecord> & Pick<SessionRecord, 'score'>,
): SessionRecord {
  return {
    date: '2026-01-01T00:00:00Z',
    mode: 'damage',
    totalQuestions: 10,
    metaMode: false,
    ...overrides,
  };
}

describe('computeStats', () => {
  it('returns zeroed stats for empty records', () => {
    const stats = computeStats([]);
    expect(stats.totalSessions).toBe(0);
    expect(stats.damageAvg).toBe(0);
    expect(stats.speedAvg).toBe(0);
    expect(stats.damageBest).toBe(0);
    expect(stats.speedBest).toBe(0);
    expect(stats.currentStreak).toBe(0);
    expect(stats.recentSessions).toEqual([]);
  });

  describe('streak calculation', () => {
    it('counts consecutive sessions from end with score >= 50% of max', () => {
      // 50% of max = 10 * 5 = 50
      const records = [
        makeRecord({ score: 60 }),
        makeRecord({ score: 50 }),
        makeRecord({ score: 70 }),
      ];
      const stats = computeStats(records);
      expect(stats.currentStreak).toBe(3);
    });

    it('breaks streak when score drops below 50% of max', () => {
      const records = [
        makeRecord({ score: 80 }),
        makeRecord({ score: 40 }), // below threshold — breaks streak
        makeRecord({ score: 70 }),
      ];
      const stats = computeStats(records);
      expect(stats.currentStreak).toBe(1);
    });

    it('returns 0 when last session is below threshold', () => {
      const records = [
        makeRecord({ score: 80 }),
        makeRecord({ score: 30 }),
      ];
      const stats = computeStats(records);
      expect(stats.currentStreak).toBe(0);
    });

    it('counts single passing session as streak of 1', () => {
      const records = [makeRecord({ score: 50 })];
      const stats = computeStats(records);
      expect(stats.currentStreak).toBe(1);
    });
  });

  describe('averages and bests', () => {
    it('computes per-mode averages', () => {
      const records = [
        makeRecord({ mode: 'damage', score: 60 }),
        makeRecord({ mode: 'damage', score: 80 }),
        makeRecord({ mode: 'speed', score: 40 }),
        makeRecord({ mode: 'speed', score: 60 }),
      ];
      const stats = computeStats(records);
      expect(stats.damageAvg).toBe(70);
      expect(stats.speedAvg).toBe(50);
    });

    it('computes per-mode bests', () => {
      const records = [
        makeRecord({ mode: 'damage', score: 60 }),
        makeRecord({ mode: 'damage', score: 90 }),
        makeRecord({ mode: 'speed', score: 40 }),
        makeRecord({ mode: 'speed', score: 100 }),
      ];
      const stats = computeStats(records);
      expect(stats.damageBest).toBe(90);
      expect(stats.speedBest).toBe(100);
    });
  });

  describe('recent sessions', () => {
    it('returns last 5 sessions in reverse order', () => {
      const records = Array.from({ length: 7 }, (_, i) =>
        makeRecord({ score: (i + 1) * 10, date: `2026-01-0${i + 1}T00:00:00Z` }),
      );
      const stats = computeStats(records);
      expect(stats.recentSessions).toHaveLength(5);
      // Most recent first
      expect(stats.recentSessions[0].score).toBe(70);
      expect(stats.recentSessions[4].score).toBe(30);
    });
  });
});
