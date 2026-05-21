import { useState, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'casual_challenge_history';

export interface CasualResult {
  date: string; // 'YYYY-MM-DD'
  score: number;
  totalQuestions: number;
  userAnswers: number[];
}

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadHistory(): CasualResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CasualResult[];
  } catch {
    return [];
  }
}

function saveHistory(history: CasualResult[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function useCasualChallenge() {
  const [history, setHistory] = useState<CasualResult[]>(loadHistory);
  const today = getTodayKey();

  const todayResult = useMemo(
    () => history.find((r) => r.date === today),
    [history, today]
  );

  const isTodayComplete = !!todayResult;
  const todayScore = todayResult?.score ?? null;
  const todayAnswers = todayResult?.userAnswers ?? null;

  const saveCasualResult = useCallback(
    (score: number, totalQuestions: number, userAnswers: number[], dateKey?: string) => {
      const key = dateKey ?? today;
      const existing = history.find((r) => r.date === key);
      if (existing) return; // already saved

      const newResult: CasualResult = { date: key, score, totalQuestions, userAnswers };
      const updated = [...history, newResult];
      setHistory(updated);
      saveHistory(updated);
    },
    [history, today]
  );

  const casualStreak = useMemo(() => {
    const completedDates = new Set(history.map((r) => r.date));
    let streak = 0;
    const startDate = new Date(today + 'T00:00:00');

    if (!completedDates.has(today)) {
      startDate.setDate(startDate.getDate() - 1);
    }

    const cursor = new Date(startDate);
    while (completedDates.has(formatDateKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [history, today]);

  return {
    isTodayComplete,
    todayScore,
    todayAnswers,
    saveCasualResult,
    casualStreak,
    history,
  };
}
