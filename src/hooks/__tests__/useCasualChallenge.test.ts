import { describe, it, expect, beforeEach } from 'vitest';
import { useCasualChallenge, getTodayKey } from '../useCasualChallenge';
import { renderHook, act } from '@testing-library/react';

// Simple polyfill / mock for localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useCasualChallenge Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with no completions today', () => {
    const { result } = renderHook(() => useCasualChallenge());
    expect(result.current.isTodayComplete).toBe(false);
    expect(result.current.todayScore).toBe(null);
    expect(result.current.casualStreak).toBe(0);
  });

  it('should save a completion and mark today as complete', () => {
    const { result } = renderHook(() => useCasualChallenge());

    act(() => {
      result.current.saveCasualResult(40, 5, [2, 0, 1, 3, 2]);
    });

    expect(result.current.isTodayComplete).toBe(true);
    expect(result.current.todayScore).toBe(40);
    expect(result.current.todayAnswers).toEqual([2, 0, 1, 3, 2]);
    expect(result.current.casualStreak).toBe(1);
  });

  it('should compute streaks correctly across multiple days', () => {
    const today = getTodayKey();
    const todayDate = new Date(today + 'T00:00:00');
    
    // Helper to format date
    const formatDate = (d: Date) => 
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const { result } = renderHook(() => useCasualChallenge());

    // Save yesterday's completion first
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = formatDate(yesterday);

    act(() => {
      result.current.saveCasualResult(50, 5, [1, 2, 3, 0, 1], yesterdayKey);
    });

    // Save day before yesterday's completion
    const twoDaysAgo = new Date(todayDate);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoKey = formatDate(twoDaysAgo);

    act(() => {
      result.current.saveCasualResult(30, 5, [2, 2, 1, 0, 0], twoDaysAgoKey);
    });

    // Streak should be 2 (yesterday and day before)
    expect(result.current.isTodayComplete).toBe(false);
    expect(result.current.casualStreak).toBe(2);

    // Save today's completion
    act(() => {
      result.current.saveCasualResult(40, 5, [2, 0, 1, 3, 2]);
    });

    expect(result.current.isTodayComplete).toBe(true);
    expect(result.current.casualStreak).toBe(3);
  });
});
