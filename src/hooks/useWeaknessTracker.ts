/**
 * Tracks which Pokémon matchups the user gets wrong and computes
 * difficulty scores for spaced repetition.
 */
import { useState, useCallback } from 'react';

export interface WeaknessEntry {
  wrongCount: number;
  rightCount: number;
  lastSeen: number; // timestamp
  difficulty: number; // computed
}

const STORAGE_KEY = 'weakness_tracker';
const MS_PER_DAY = 86_400_000;

/** Exported for testing. Pure function — no side effects. */
export function computeDifficulty(entry: WeaknessEntry): number {
  const { wrongCount, rightCount, lastSeen } = entry;
  const total = wrongCount + rightCount + 1;
  const errorRate = wrongCount / total;

  const daysSinceLastSeen = (Date.now() - lastSeen) / MS_PER_DAY;
  const recencyBoost = 1 + Math.min(daysSinceLastSeen / 7, 2);

  return errorRate * recencyBoost;
}

function loadTracker(): Record<string, WeaknessEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveTracker(data: Record<string, WeaknessEntry>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable
  }
}

export function useWeaknessTracker(): {
  recordResult: (pokemonName: string, correct: boolean) => void;
  getDifficulty: (pokemonName: string) => number;
  getWeakestPokemon: (n: number) => Array<{ name: string; difficulty: number }>;
  weaknessMap: Record<string, WeaknessEntry>;
} {
  const [weaknessMap, setWeaknessMap] = useState<Record<string, WeaknessEntry>>(
    () => loadTracker(),
  );

  const recordResult = useCallback((pokemonName: string, correct: boolean) => {
    setWeaknessMap((prev) => {
      const existing = prev[pokemonName] ?? {
        wrongCount: 0,
        rightCount: 0,
        lastSeen: Date.now(),
        difficulty: 0,
      };

      const updated: WeaknessEntry = {
        wrongCount: existing.wrongCount + (correct ? 0 : 1),
        rightCount: existing.rightCount + (correct ? 1 : 0),
        lastSeen: Date.now(),
        difficulty: 0, // recomputed below
      };
      updated.difficulty = computeDifficulty(updated);

      const next = { ...prev, [pokemonName]: updated };
      saveTracker(next);
      return next;
    });
  }, []);

  const getDifficulty = useCallback(
    (pokemonName: string): number => {
      const entry = weaknessMap[pokemonName];
      if (!entry) return 0;
      return computeDifficulty(entry);
    },
    [weaknessMap],
  );

  const getWeakestPokemon = useCallback(
    (n: number): Array<{ name: string; difficulty: number }> => {
      return Object.entries(weaknessMap)
        .map(([name, entry]) => ({ name, difficulty: computeDifficulty(entry) }))
        .sort((a, b) => b.difficulty - a.difficulty)
        .slice(0, n);
    },
    [weaknessMap],
  );

  return { recordResult, getDifficulty, getWeakestPokemon, weaknessMap };
}
