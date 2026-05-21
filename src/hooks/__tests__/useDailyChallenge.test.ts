import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDailyChallenge, calculateStreak, buildCalendarDays } from '../useDailyChallenge';
import type { DailyResult } from '../useDailyChallenge';

// Set up a robust localStorage mock to avoid JSDOM compatibility issues
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  clear: () => {
    for (const key in store) {
      delete store[key];
    }
  },
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  configurable: true,
  writable: true,
});

describe('useDailyChallenge Hook & Helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('calculateStreak', () => {
    it('calculates streak correctly when today is complete', () => {
      const history: DailyResult[] = [
        { date: '2026-05-18', score: 5, totalQuestions: 5 },
        { date: '2026-05-19', score: 5, totalQuestions: 5 },
        { date: '2026-05-20', score: 5, totalQuestions: 5 },
      ];
      expect(calculateStreak(history, '2026-05-20')).toBe(3);
    });

    it('calculates streak correctly when today is not complete, but yesterday is', () => {
      const history: DailyResult[] = [
        { date: '2026-05-18', score: 5, totalQuestions: 5 },
        { date: '2026-05-19', score: 5, totalQuestions: 5 },
      ];
      expect(calculateStreak(history, '2026-05-20')).toBe(2);
    });

    it('returns 0 when neither today nor yesterday is complete', () => {
      const history: DailyResult[] = [
        { date: '2026-05-17', score: 5, totalQuestions: 5 },
      ];
      expect(calculateStreak(history, '2026-05-20')).toBe(0);
    });
  });

  describe('buildCalendarDays', () => {
    it('builds last 7 days of completions', () => {
      const history: DailyResult[] = [
        { date: '2026-05-18', score: 40, totalQuestions: 5 },
        { date: '2026-05-20', score: 50, totalQuestions: 5 },
      ];
      const days = buildCalendarDays(history, '2026-05-20');
      expect(days).toHaveLength(7);
      expect(days[6].date).toBe('2026-05-20');
      expect(days[6].completed).toBe(true);
      expect(days[6].score).toBe(50);

      expect(days[5].date).toBe('2026-05-19');
      expect(days[5].completed).toBe(false);

      expect(days[4].date).toBe('2026-05-18');
      expect(days[4].completed).toBe(true);
      expect(days[4].score).toBe(40);
    });
  });

  describe('hook functionality', () => {
    it('saves daily result under today key by default', () => {
      const { result } = renderHook(() => useDailyChallenge());
      
      act(() => {
        result.current.saveDailyResult(45, 5);
      });

      expect(result.current.isTodayComplete).toBe(true);
      expect(result.current.todayScore).toBe(45);
    });

    it('saves daily result under custom dateKey if provided', () => {
      const { result } = renderHook(() => useDailyChallenge());
      
      act(() => {
        // We cast to any here to allow compilation before signature is updated, causing test to fail at runtime if key isn't supported yet
        (result.current.saveDailyResult as any)(35, 5, '2026-05-15');
      });

      // It should NOT be completed for today, but should be saved for 2026-05-15 in history
      expect(result.current.isTodayComplete).toBe(false);

      const saved = JSON.parse(localStorage.getItem('daily_challenge_history') || '[]');
      expect(saved).toContainEqual({ date: '2026-05-15', score: 35, totalQuestions: 5 });
    });
  });
});
