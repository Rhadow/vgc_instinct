import { getHighScore } from '../quiz/engine';
import type { QuizMode } from '../data/types';

interface HomeScreenProps {
  onStart: (mode: QuizMode) => void;
  pokemonCount: number;
  loading: boolean;
}

export function HomeScreen({ onStart, pokemonCount, loading }: HomeScreenProps) {
  const damageHighScore = getHighScore('damage');
  const speedHighScore = getHighScore('speed');

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-accent-blue via-accent-purple to-accent-pink bg-clip-text text-transparent">
          Instinct
        </h1>
        <p className="text-text-secondary text-sm max-w-xs mx-auto">
          Train your competitive Pokémon instincts. Champions VGC 2026 • Reg M-A
        </p>
      </div>

      {/* Mode buttons */}
      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={() => onStart('damage')}
          disabled={loading || pokemonCount < 2}
          className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-red/20 to-accent-amber/20 border border-accent-red/30 p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:border-accent-red/60 hover:shadow-lg hover:shadow-accent-red/10 disabled:opacity-40 disabled:hover:scale-100"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-text-primary">⚔️ Damage Quiz</h2>
              {damageHighScore > 0 && (
                <span className="text-xs font-medium bg-accent-amber/20 text-accent-amber px-2 py-0.5 rounded-full">
                  Best: {damageHighScore}
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary">
              Guess the damage range from real calcs. 10 questions, multiple choice.
            </p>
          </div>
        </button>

        <button
          onClick={() => onStart('speed')}
          disabled={loading || pokemonCount < 4}
          className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:border-accent-blue/60 hover:shadow-lg hover:shadow-accent-blue/10 disabled:opacity-40 disabled:hover:scale-100"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-text-primary">⚡ Speed Quiz</h2>
              {speedHighScore > 0 && (
                <span className="text-xs font-medium bg-accent-blue/20 text-accent-blue px-2 py-0.5 rounded-full">
                  Best: {speedHighScore}
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary">
              Sort 4 Pokémon by turn order with field conditions. Drag to arrange.
            </p>
          </div>
        </button>
      </div>

      {/* Loading / status */}
      <div className="mt-8 text-center">
        {loading ? (
          <p className="text-text-muted text-xs animate-pulse">Loading Pokémon data...</p>
        ) : (
          <p className="text-text-muted text-xs">
            {pokemonCount} Pokémon loaded from Champions meta
          </p>
        )}
      </div>
    </div>
  );
}
