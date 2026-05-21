import { useState, useMemo, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'achievements_unlocked';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  unlockedAt?: string; // ISO date when unlocked, undefined if locked
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  totalSessions: number;
  currentStreak: number;
  damageBest: number;
  speedBest: number;
  dailyStreak: number;
  weaknessEntryCount: number;
  damageHighScoreCount: number;
  speedHighScoreCount: number;
  typeHighScoreCount: number;
  hasPerfectScore: boolean;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first session',
    icon: '🥚',
    check: (ctx) => ctx.totalSessions >= 1,
  },
  {
    id: 'warming_up',
    name: 'Warming Up',
    description: 'Complete 5 sessions',
    icon: '🔥',
    check: (ctx) => ctx.totalSessions >= 5,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Complete 25 sessions',
    icon: '⭐',
    check: (ctx) => ctx.totalSessions >= 25,
  },
  {
    id: 'perfect_round',
    name: 'Perfect Round',
    description: 'Score 100/100 in any session',
    icon: '💎',
    check: (ctx) => ctx.hasPerfectScore,
  },
  {
    id: 'hot_streak',
    name: 'Hot Streak',
    description: '5 sessions in a row with 50%+',
    icon: '🔥',
    check: (ctx) => ctx.currentStreak >= 5,
  },
  {
    id: 'inferno',
    name: 'Inferno',
    description: '10 sessions in a row with 50%+',
    icon: '🌋',
    check: (ctx) => ctx.currentStreak >= 10,
  },
  {
    id: 'daily_driver',
    name: 'Daily Driver',
    description: 'Complete 7 daily challenges',
    icon: '📅',
    check: (ctx) => ctx.dailyStreak >= 7,
  },
  {
    id: 'type_master',
    name: 'Type Master',
    description: 'Score 80%+ on type quiz 3 times',
    icon: '🛡️',
    check: (ctx) => ctx.typeHighScoreCount >= 3,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Score 80%+ on speed quiz 3 times',
    icon: '⚡',
    check: (ctx) => ctx.speedHighScoreCount >= 3,
  },
  {
    id: 'damage_dealer',
    name: 'Damage Dealer',
    description: 'Score 80%+ on damage quiz 3 times',
    icon: '⚔️',
    check: (ctx) => ctx.damageHighScoreCount >= 3,
  },
  {
    id: 'know_your_enemy',
    name: 'Know Your Enemy',
    description: 'Have 10+ entries in weakness tracker',
    icon: '🧠',
    check: (ctx) => ctx.weaknessEntryCount >= 10,
  },
];

export function evaluateAchievements(
  ctx: AchievementContext,
  alreadyUnlocked: Set<string>
): Badge[] {
  const newBadges: Badge[] = [];
  for (const def of BADGE_DEFINITIONS) {
    if (!alreadyUnlocked.has(def.id) && def.check(ctx)) {
      newBadges.push({
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        unlockedAt: new Date().toISOString(),
      });
    }
  }
  return newBadges;
}

function loadUnlockedBadges(): Map<string, Badge> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    const arr = JSON.parse(raw) as Badge[];
    return new Map(arr.map((b) => [b.id, b]));
  } catch {
    return new Map();
  }
}

function saveUnlockedBadges(badges: Map<string, Badge>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...badges.values()]));
}

export function useAchievements(ctx: AchievementContext): {
  badges: Badge[];
  newlyUnlocked: Badge[];
  clearNewlyUnlocked: () => void;
  unlockedCount: number;
  totalCount: number;
} {
  const [unlockedMap, setUnlockedMap] =
    useState<Map<string, Badge>>(loadUnlockedBadges);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Badge[]>([]);

  // Evaluate which badges should be newly unlocked
  const freshlyUnlocked = useMemo(() => {
    const alreadyUnlocked = new Set(unlockedMap.keys());
    return evaluateAchievements(ctx, alreadyUnlocked);
  }, [ctx, unlockedMap]);

  // Persist newly unlocked badges and expose them
  useEffect(() => {
    if (freshlyUnlocked.length === 0) return;

    setUnlockedMap((prev) => {
      const next = new Map(prev);
      for (const badge of freshlyUnlocked) {
        next.set(badge.id, badge);
      }
      saveUnlockedBadges(next);
      return next;
    });
    setNewlyUnlocked(freshlyUnlocked);
  }, [freshlyUnlocked]);

  // Build the full badge list with unlock status
  const badges = useMemo((): Badge[] => {
    return BADGE_DEFINITIONS.map((def) => {
      const unlocked = unlockedMap.get(def.id);
      return {
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        unlockedAt: unlocked?.unlockedAt,
      };
    });
  }, [unlockedMap]);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  return {
    badges,
    newlyUnlocked,
    clearNewlyUnlocked,
    unlockedCount: unlockedMap.size,
    totalCount: BADGE_DEFINITIONS.length,
  };
}
