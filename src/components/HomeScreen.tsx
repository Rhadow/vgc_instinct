import { useState } from 'react';
import { getHighScore } from '../quiz/engine';
import type { QuizMode } from '../data/types';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import type { SessionStats } from '../hooks/useSessionHistory';
import type { useDailyChallenge } from '../hooks/useDailyChallenge';
import type { useAchievements } from '../hooks/useAchievements';
import { DailyChallengeCard } from './DailyChallenge';
import { BadgeGrid } from './BadgeGrid';

interface HomeScreenProps {
  onStart: (mode: QuizMode, metaMode: boolean) => void;
  pokemonCount: number;
  totalMeta: number;
  loading: boolean;
  stats: SessionStats;
  weakestPokemon?: Array<{ name: string; difficulty: number }>;
  getSpriteUrl?: (name: string) => string;
  daily: ReturnType<typeof useDailyChallenge>;
  achievements: ReturnType<typeof useAchievements>;
}

export function HomeScreen({
  onStart,
  pokemonCount,
  totalMeta,
  loading,
  stats,
  weakestPokemon,
  getSpriteUrl,
  daily,
  achievements,
}: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<'competitive' | 'casual'>('competitive');
  const [metaMode, setMetaMode] = useState(true);
  
  const damageHighScore = getHighScore('damage');
  const speedHighScore = getHighScore('speed');
  const typeHighScore = getHighScore('type');
  const casualHighScore = getHighScore('casual');
  
  const isLoading = loading || pokemonCount < 4;
  const loadPct = totalMeta > 0 ? Math.round((pokemonCount / totalMeta) * 100) : 0;
  const { canShow: canInstall, promptInstall, dismiss: dismissInstall } = useInstallPrompt();

  const casualSessions = stats.recentSessions.filter((s) => s.mode === 'casual');

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="relative inline-block mb-3">
          <h1 className="text-5xl font-extrabold tracking-tighter bg-gradient-to-br from-accent-blue via-accent-purple to-accent-pink bg-clip-text text-transparent drop-shadow-sm">
            Instinct
          </h1>
          <div className="absolute -inset-4 bg-gradient-to-r from-accent-blue/10 via-accent-purple/10 to-accent-pink/10 rounded-2xl blur-xl -z-10" />
        </div>
        <p className="text-text-secondary text-sm max-w-xs mx-auto leading-relaxed">
          Sharpen your VGC instincts with real damage calcs and speed tiers.
        </p>
        <p className="text-text-muted text-xs mt-1">Champions 2026 · Regulation M-A</p>
      </div>

      {/* Sliding Tab Switcher */}
      <div className="relative flex p-1 bg-bg-secondary rounded-xl border border-border/80 w-full max-w-sm mb-6 shadow-inner">
        {/* Sliding pill container */}
        <div
          className="absolute top-1 bottom-1 rounded-lg bg-bg-card border border-border shadow-sm transition-all duration-300 ease-out"
          style={{
            left: activeTab === 'competitive' ? '4px' : 'calc(50% + 2px)',
            width: 'calc(50% - 6px)',
          }}
        />
        
        <button
          onClick={() => setActiveTab('competitive')}
          className={`relative z-10 flex-1 py-2 text-center text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === 'competitive' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <span>⚔️</span> Competitive
        </button>

        <button
          onClick={() => setActiveTab('casual')}
          className={`relative z-10 flex-1 py-2 text-center text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === 'casual' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <span>🎨</span> Casual
        </button>
      </div>

      {/* PWA Install Banner */}
      {canInstall && (
        <div className="w-full max-w-sm mb-4 animate-slide-up">
          <div className="rounded-xl border border-accent-blue/20 bg-accent-blue/5 p-3 flex items-center gap-3">
            <span className="text-lg">📲</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary">Install Instinct</p>
              <p className="text-[10px] text-text-muted">Add to home screen for offline access</p>
            </div>
            <button
              onClick={promptInstall}
              className="text-[10px] font-bold bg-accent-blue text-white px-3 py-1.5 rounded-lg hover:bg-accent-blue/80 transition-colors shrink-0"
            >
              Install
            </button>
            <button
              onClick={dismissInstall}
              className="text-text-muted/40 hover:text-text-muted text-sm transition-colors shrink-0"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Tab Contents */}
      {activeTab === 'competitive' ? (
        <div className="w-full max-w-sm space-y-4 animate-slide-up">
          {/* Mode buttons */}
          <button
            onClick={() => onStart('damage', metaMode)}
            disabled={isLoading || pokemonCount < 2}
            className="w-full group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 bg-gradient-to-br from-bg-card to-bg-card/80 border-border hover:border-accent-red/40 hover:shadow-xl hover:shadow-accent-red/5"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-red/5 rounded-full blur-2xl -translate-y-6 translate-x-6 group-hover:bg-accent-red/10 transition-colors" />
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <span className="text-xl">⚔️</span> Damage Quiz
                </h2>
                {damageHighScore > 0 && (
                  <span className="text-[10px] font-semibold bg-accent-amber/15 text-accent-amber px-2 py-0.5 rounded-full border border-accent-amber/20">
                    Best: {damageHighScore}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Guess the damage range from real calcs. 10 questions, multiple choice.
              </p>
            </div>
          </button>

          <button
            onClick={() => onStart('speed', metaMode)}
            disabled={isLoading || pokemonCount < 4}
            className="w-full group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 bg-gradient-to-br from-bg-card to-bg-card/80 border-border hover:border-accent-blue/40 hover:shadow-xl hover:shadow-accent-blue/5"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-blue/5 rounded-full blur-2xl -translate-y-6 translate-x-6 group-hover:bg-accent-blue/10 transition-colors" />
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <span className="text-xl">⚡</span> Speed Quiz
                </h2>
                {speedHighScore > 0 && (
                  <span className="text-[10px] font-semibold bg-accent-blue/15 text-accent-blue px-2 py-0.5 rounded-full border border-accent-blue/20">
                    Best: {speedHighScore}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Sort 4 Pokémon by turn order with field conditions. Drag to arrange.
              </p>
            </div>
          </button>

          <button
            onClick={() => onStart('type', metaMode)}
            disabled={isLoading || pokemonCount < 2}
            className="w-full group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 bg-gradient-to-br from-bg-card to-bg-card/80 border-border hover:border-accent-purple/40 hover:shadow-xl hover:shadow-accent-purple/5"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-purple/5 rounded-full blur-2xl -translate-y-6 translate-x-6 group-hover:bg-accent-purple/10 transition-colors" />
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <span className="text-xl">🛡️</span> Type Quiz
                </h2>
                {typeHighScore > 0 && (
                  <span className="text-[10px] font-semibold bg-accent-purple/15 text-accent-purple px-2 py-0.5 rounded-full border border-accent-purple/20">
                    Best: {typeHighScore}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Test your type effectiveness matchup knowledge against dual-type meta threats.
              </p>
            </div>
          </button>

          <div className="pt-2 flex justify-center">
            <label className="flex items-center justify-center gap-2 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={metaMode}
                  onChange={(e) => setMetaMode(e.target.checked)}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${metaMode ? 'bg-accent-blue' : 'bg-bg-secondary'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${metaMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <span className="text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                Meta Mode
              </span>
            </label>
          </div>

          {/* Daily Challenge */}
          <div className="pt-2">
            <DailyChallengeCard
              daily={daily}
              onStart={() => onStart('daily', false)}
              disabled={isLoading}
            />
          </div>

          {/* Session Stats */}
          {stats.totalSessions > 0 && (
            <div className="rounded-xl border border-border bg-bg-card/50 p-4">
              <h3 className="text-xs font-bold text-text-secondary mb-3 uppercase tracking-wider">Your Stats</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xl font-extrabold text-accent-blue tabular-nums">{stats.totalSessions}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Sessions</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-accent-purple tabular-nums">{stats.currentStreak}🔥</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Streak</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-accent-amber tabular-nums">
                    {Math.max(stats.damageAvg, stats.speedAvg, stats.totalSessions > 0 ? getHighScore('type') : 0)}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">Avg Score</p>
                </div>
              </div>
              {/* Recent sessions */}
              {stats.recentSessions.filter((s) => s.mode !== 'casual').length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
                  {stats.recentSessions
                    .filter((s) => s.mode !== 'casual')
                    .slice(0, 3)
                    .map((session, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px]">
                        <span className="text-text-muted">
                          {session.mode === 'damage' ? '⚔️' : session.mode === 'speed' ? '⚡' : session.mode === 'type' ? '🛡️' : '📅'}{' '}
                          {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span className={`font-bold tabular-nums ${
                          session.score >= session.totalQuestions * 7 ? 'text-accent-green'
                          : session.score >= session.totalQuestions * 4 ? 'text-accent-amber'
                          : 'text-text-secondary'
                        }`}>
                          {session.score} pts
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Weak Spots Section */}
          {weakestPokemon && weakestPokemon.length > 0 && getSpriteUrl && (
            <div className="rounded-xl border border-border bg-bg-card/50 p-4">
              <h3 className="text-xs font-bold text-text-secondary mb-3 uppercase tracking-wider flex items-center gap-1.5">
                🧠 Your Weak Spots
              </h3>
              <div className="space-y-3">
                {weakestPokemon.map(({ name, difficulty }) => {
                  const sprite = getSpriteUrl(name);
                  const pct = Math.min((difficulty / 3.0) * 100, 100);
                  let label = 'Normal';
                  let colorClass = 'text-accent-blue bg-accent-blue/10 border-accent-blue/20';
                  let barColor = 'bg-accent-blue';
                  if (difficulty >= 1.5) {
                    label = 'Critical';
                    colorClass = 'text-accent-red bg-accent-red/10 border-accent-red/20';
                    barColor = 'bg-accent-red';
                  } else if (difficulty >= 0.7) {
                    label = 'Medium';
                    colorClass = 'text-accent-amber bg-accent-amber/10 border-accent-amber/20';
                    barColor = 'bg-accent-amber';
                  }

                  return (
                    <div key={name} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center border border-border overflow-hidden shrink-0">
                        <img src={sprite} alt={name} className="w-8 h-8 object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-text-primary truncate">{name}</span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${colorClass}`}>
                            {label}
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-bg-secondary overflow-hidden">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-4 animate-slide-up">
          {/* Daily Casual Launcher */}
          <button
            onClick={() => onStart('casual', false)}
            disabled={isLoading}
            className="w-full group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 bg-gradient-to-br from-bg-card to-bg-card/80 border-border hover:border-accent-purple/40 hover:shadow-xl hover:shadow-accent-purple/5"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-purple/5 rounded-full blur-2xl -translate-y-6 translate-x-6 group-hover:bg-accent-purple/10 transition-colors" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <span className="text-xl">🎨</span> Daily Type Match
                </h2>
                {casualHighScore > 0 && (
                  <span className="text-[10px] font-semibold bg-accent-amber/15 text-accent-amber px-2 py-0.5 rounded-full border border-accent-amber/20">
                    Best: {casualHighScore}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted leading-relaxed mb-4">
                Test your type knowledge by matching the correct types to a Pokémon option card. Quick 5 questions seeded daily!
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-accent-purple uppercase tracking-wider">
                <span>⚡ Zero Typing</span>
                <span>•</span>
                <span>🏆 Official Type SVGs</span>
              </div>
            </div>
          </button>

          {/* Casual Stats */}
          {stats.totalSessions > 0 && (
            <div className="rounded-xl border border-border bg-bg-card/50 p-4">
              <h3 className="text-xs font-bold text-text-secondary mb-3 uppercase tracking-wider">Casual Stats</h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-xl font-extrabold text-accent-purple tabular-nums">{casualSessions.length}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Sessions</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-accent-amber tabular-nums">{casualHighScore} pts</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Best Score</p>
                </div>
              </div>
              {/* Recent Casual sessions */}
              {casualSessions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
                  {casualSessions.slice(0, 3).map((session, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="text-text-muted">
                        🎨{' '}
                        {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="font-bold tabular-nums text-accent-green">
                        {session.score} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Achievements Badge Grid */}
      <div className="mt-4 w-full max-w-sm">
        <BadgeGrid
          badges={achievements.badges}
          unlockedCount={achievements.unlockedCount}
          totalCount={achievements.totalCount}
        />
      </div>

      {/* Loading indicator — only shown while data is still loading */}
      {pokemonCount < totalMeta && totalMeta > 0 && (
        <div className="mt-8 text-center w-full max-w-sm mb-12">
          <div className="space-y-2">
            <div className="h-1 rounded-full bg-bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-blue/60 to-accent-purple/60 transition-all duration-500"
                style={{ width: `${loadPct}%` }}
              />
            </div>
            <p className="text-text-muted text-[11px]">
              Loading Pokémon data…
            </p>
          </div>
        </div>
      )}

      {/* Footer / Legal Disclaimer */}
      <div className="mt-auto pt-8 max-w-md text-center">
        <p className="text-[9px] leading-relaxed text-text-muted/60">
          Pokémon and all respective names are trademark &amp; &copy; of Nintendo 1996-{new Date().getFullYear()}.
          This project is not affiliated with Nintendo, The Pokémon Company, Game Freak, or Smogon.
        </p>
      </div>
    </div>
  );
}
