import { useState } from 'react';
import type { Badge } from '../hooks/useAchievements';

interface BadgeGridProps {
  badges: Badge[];
  unlockedCount: number;
  totalCount: number;
}

export function BadgeGrid({ badges, unlockedCount, totalCount }: BadgeGridProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-xl border border-border bg-bg-card/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Achievements
          </h3>
          <span className="text-[10px] text-text-muted font-medium">
            {unlockedCount}/{totalCount}
          </span>
        </div>

        {/* Badge grid */}
        <div className="grid grid-cols-6 gap-2">
          {badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            return (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(selectedBadge?.id === badge.id ? null : badge)}
                className={`relative w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200 ${
                  isUnlocked
                    ? 'bg-accent-amber/10 border border-accent-amber/20 hover:scale-110 hover:shadow-lg hover:shadow-accent-amber/10'
                    : 'bg-bg-secondary/50 border border-border/50 opacity-40 grayscale'
                }`}
                title={badge.name}
              >
                {isUnlocked ? badge.icon : '🔒'}
              </button>
            );
          })}
        </div>

        {/* Selected badge detail */}
        {selectedBadge && (
          <div className="mt-3 pt-3 border-t border-border/50 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedBadge.icon}</span>
              <div>
                <p className="text-xs font-bold text-text-primary">{selectedBadge.name}</p>
                <p className="text-[10px] text-text-muted">{selectedBadge.description}</p>
                {selectedBadge.unlockedAt && (
                  <p className="text-[9px] text-accent-green mt-0.5">
                    Unlocked {new Date(selectedBadge.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
