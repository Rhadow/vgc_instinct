import type { useDailyChallenge } from '../hooks/useDailyChallenge';

interface DailyChallengeCardProps {
  daily: ReturnType<typeof useDailyChallenge>;
  onStart: () => void;
  disabled: boolean;
}

const WEEKDAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function DailyChallengeCard({ daily, onStart, disabled }: DailyChallengeCardProps) {
  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-accent-purple/30 bg-gradient-to-br from-accent-purple/5 to-accent-pink/5 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <span className="text-xl">📅</span> Daily Challenge
          </h2>
          {daily.dailyStreak > 0 && (
            <span className="text-xs font-bold bg-accent-purple/15 text-accent-purple px-2 py-0.5 rounded-full border border-accent-purple/20">
              {daily.dailyStreak} day streak
            </span>
          )}
        </div>

        {/* Calendar dots */}
        <div className="flex items-center justify-between gap-1">
          {daily.calendarDays.map((day, i) => {
            const date = new Date(day.date + 'T00:00:00');
            const dayOfWeek = WEEKDAY_SHORT[date.getDay()];
            const isToday = i === daily.calendarDays.length - 1;

            return (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-text-muted">{dayOfWeek}</span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    day.completed
                      ? 'bg-accent-green text-white shadow-sm shadow-accent-green/30'
                      : isToday
                        ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/40'
                        : 'bg-bg-secondary/50 text-text-muted'
                  }`}
                >
                  {day.completed ? '✓' : date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status + action */}
        {daily.isTodayComplete ? (
          <div className="text-center space-y-1">
            <p className="text-accent-green font-bold text-sm">✅ Completed!</p>
            <p className="text-text-muted text-xs">
              Score: {daily.todayScore} pts — Come back tomorrow!
            </p>
          </div>
        ) : (
          <button
            onClick={onStart}
            disabled={disabled}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-pink text-white font-bold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-accent-purple/30 active:scale-[0.98] disabled:opacity-40"
          >
            Start Today's Challenge
          </button>
        )}

        <p className="text-[10px] text-text-muted text-center">
          5 questions • Mixed modes • Same for everyone
        </p>
      </div>
    </div>
  );
}
