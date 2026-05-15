import { useState, useEffect, useCallback } from 'react';
import type { QuizMode } from '../data/types';

export interface SessionRecord {
  date: string; // ISO string
  mode: QuizMode;
  score: number;
  totalQuestions: number;
  metaMode: boolean;
}

const STORAGE_KEY = 'quiz_session_history';
const MAX_SESSIONS = 50;

function loadHistory(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(records: SessionRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(-MAX_SESSIONS)));
  } catch {
    // localStorage unavailable
  }
}

export interface SessionStats {
  totalSessions: number;
  damageAvg: number;
  speedAvg: number;
  damageBest: number;
  speedBest: number;
  currentStreak: number; // consecutive sessions with >= 50% score
  recentSessions: SessionRecord[];
}

function computeStats(records: SessionRecord[]): SessionStats {
  const damageSessions = records.filter((r) => r.mode === 'damage');
  const speedSessions = records.filter((r) => r.mode === 'speed');

  const avg = (arr: SessionRecord[]) =>
    arr.length > 0 ? Math.round(arr.reduce((s, r) => s + r.score, 0) / arr.length) : 0;
  const best = (arr: SessionRecord[]) =>
    arr.length > 0 ? Math.max(...arr.map((r) => r.score)) : 0;

  // Current streak: count consecutive sessions from the end where score >= 50%
  let streak = 0;
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i].score >= records[i].totalQuestions * 5) {
      streak++;
    } else {
      break;
    }
  }

  return {
    totalSessions: records.length,
    damageAvg: avg(damageSessions),
    speedAvg: avg(speedSessions),
    damageBest: best(damageSessions),
    speedBest: best(speedSessions),
    currentStreak: streak,
    recentSessions: records.slice(-5).reverse(),
  };
}

export function useSessionHistory() {
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [stats, setStats] = useState<SessionStats>(() => computeStats([]));

  useEffect(() => {
    const records = loadHistory();
    setHistory(records);
    setStats(computeStats(records));
  }, []);

  const recordSession = useCallback((session: Omit<SessionRecord, 'date'>) => {
    const record: SessionRecord = { ...session, date: new Date().toISOString() };
    setHistory((prev) => {
      const updated = [...prev, record];
      saveHistory(updated);
      setStats(computeStats(updated));
      return updated;
    });
  }, []);

  return { stats, history, recordSession };
}
