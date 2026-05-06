import { useState } from 'react';
import type { DamageQuestion } from '../quiz/questionTypes';
import { PokemonCard } from './PokemonCard';

interface DamageQuestionViewProps {
  question: DamageQuestion;
  onAnswer: (index: number) => void;
  answered: boolean;
}

export function DamageQuestionView({ question, onAnswer, answered }: DamageQuestionViewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelectedIndex(index);
    onAnswer(index);
  };

  return (
    <div className="animate-slide-up space-y-4">
      {/* Battle matchup */}
      <div className="flex items-center justify-center gap-3">
        <PokemonCard
          pokemon={question.attacker}
          spriteUrl={question.attackerSprite}
          compact
          className="flex-1 max-w-[160px]"
        />

        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl">⚔️</span>
          <div className="bg-accent-purple/20 border border-accent-purple/30 rounded-lg px-3 py-1.5 text-center">
            <p className="text-xs text-text-secondary">Move</p>
            <p className="text-sm font-bold text-accent-purple">{question.moveName}</p>
          </div>
        </div>

        <PokemonCard
          pokemon={question.defender}
          spriteUrl={question.defenderSprite}
          compact
          className="flex-1 max-w-[160px]"
        />
      </div>

      {/* Question prompt */}
      <p className="text-center text-text-secondary text-sm">
        What is the damage range?
      </p>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((option, i) => {
          let btnClass = 'bg-bg-card border-border hover:bg-bg-card-hover hover:border-accent-blue/50';

          if (answered) {
            if (i === question.correctIndex) {
              btnClass = 'bg-accent-green/20 border-accent-green ring-1 ring-accent-green';
            } else if (i === selectedIndex) {
              btnClass = 'bg-accent-red/20 border-accent-red ring-1 ring-accent-red animate-shake';
            } else {
              btnClass = 'bg-bg-card border-border opacity-40';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={`rounded-xl border p-4 text-center transition-all duration-200 ${btnClass}`}
            >
              <span className="text-sm font-semibold text-text-primary">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Details section (after answer) */}
      {answered && (
        <div className="mt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-xs text-text-muted hover:text-text-secondary transition-colors text-center py-2"
          >
            {showDetails ? '▲ Hide Details' : '▼ Show Details'}
          </button>

          {showDetails && (
            <div className="bg-bg-secondary rounded-xl p-4 text-xs space-y-2 animate-fade-in border border-border">
              <p className="text-text-secondary font-mono leading-relaxed break-words">
                {question.correctResult.description}
              </p>
              <div>
                <p className="text-text-muted mb-1">Damage rolls:</p>
                <p className="text-text-secondary font-mono text-[10px]">
                  [{question.correctResult.rolls.join(', ')}]
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
