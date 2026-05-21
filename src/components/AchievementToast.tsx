import { useEffect, useState } from 'react';
import type { Badge } from '../hooks/useAchievements';

interface AchievementToastProps {
  badges: Badge[];
  onDismiss: () => void;
}

export function AchievementToast({ badges, onDismiss }: AchievementToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (badges.length === 0) return;

    // Animate in
    requestAnimationFrame(() => setVisible(true));

    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300); // Wait for fade-out
    }, 4000);

    return () => clearTimeout(timer);
  }, [badges, onDismiss]);

  if (badges.length === 0) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="bg-bg-card/95 backdrop-blur-lg border border-accent-amber/30 rounded-2xl shadow-2xl shadow-accent-amber/10 px-5 py-3 flex items-center gap-3 max-w-sm">
        <div className="text-3xl animate-pulse-glow">
          {badges[0].icon}
        </div>
        <div>
          <p className="text-xs text-accent-amber font-bold uppercase tracking-wider">
            Achievement Unlocked!
          </p>
          <p className="text-sm font-bold text-text-primary">
            {badges.map((b) => b.name).join(', ')}
          </p>
          <p className="text-[10px] text-text-muted">
            {badges[0].description}
          </p>
        </div>
      </div>
    </div>
  );
}
