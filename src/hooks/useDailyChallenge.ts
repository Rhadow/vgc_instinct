import { useState, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'daily_challenge_history';

export interface DailyResult {
  date: string; // 'YYYY-MM-DD'
  score: number;
  totalQuestions: number;
}

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadHistory(): DailyResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DailyResult[];
  } catch {
    return [];
  }
}

function saveHistory(history: DailyResult[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function calculateStreak(
  history: DailyResult[],
  today: string
): number {
  const completedDates = new Set(history.map((r) => r.date));

  let streak = 0;
  const startDate = new Date(today + 'T00:00:00');

  // If today is complete, start counting from today; otherwise from yesterday
  if (!completedDates.has(today)) {
    startDate.setDate(startDate.getDate() - 1);
  }

  const cursor = new Date(startDate);
  while (completedDates.has(formatDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function buildCalendarDays(
  history: DailyResult[],
  today: string
): Array<{ date: string; completed: boolean; score?: number }> {
  const resultsByDate = new Map<string, DailyResult>();
  for (const r of history) {
    resultsByDate.set(r.date, r);
  }

  const days: Array<{ date: string; completed: boolean; score?: number }> = [];
  const todayDate = new Date(today + 'T00:00:00');

  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i);
    const key = formatDateKey(d);
    const result = resultsByDate.get(key);
    days.push({
      date: key,
      completed: !!result,
      score: result?.score,
    });
  }

  return days;
}

export function useDailyChallenge(): {
  isTodayComplete: boolean;
  todayScore: number | null;
  saveDailyResult: (score: number, totalQuestions: number, dateKey?: string) => void;
  dailyStreak: number;
  calendarDays: Array<{ date: string; completed: boolean; score?: number }>;
} {
  const [history, setHistory] = useState<DailyResult[]>(loadHistory);

  const today = getTodayKey();

  const todayResult = useMemo(
    () => history.find((r) => r.date === today),
    [history, today]
  );

  const isTodayComplete = !!todayResult;
  const todayScore = todayResult?.score ?? null;

  const dailyStreak = useMemo(
    () => calculateStreak(history, today),
    [history, today]
  );

  const calendarDays = useMemo(
    () => buildCalendarDays(history, today),
    [history, today]
  );

  const saveDailyResult = useCallback(
    (score: number, totalQuestions: number, dateKey?: string) => {
      const key = dateKey ?? today;
      const existing = history.find((r) => r.date === key);
      if (existing) return; // already saved

      const newResult: DailyResult = { date: key, score, totalQuestions };
      const updated = [...history, newResult];
      setHistory(updated);
      saveHistory(updated);
    },
    [history, today]
  );

  return {
    isTodayComplete,
    todayScore,
    saveDailyResult,
    dailyStreak,
    calendarDays,
  };
}
