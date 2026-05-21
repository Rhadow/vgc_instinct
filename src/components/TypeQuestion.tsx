import { useState } from 'react';
import type { TypeQuestion } from '../quiz/typeQuiz';
import { PokemonCard } from './PokemonCard';
import { getTypeColor } from '../data/typeColors';

interface TypeQuestionViewProps {
  question: TypeQuestion;
  onAnswer: (index: number) => void;
  answered: boolean;
}

const MULT_COLORS: Record<string, { bg: string; text: string }> = {
  '0×':    { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
  '0.25×': { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
  '0.5×':  { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
  '1×':    { bg: 'rgba(241,245,249,0.08)', text: '#e2e8f0' },
  '2×':    { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  '4×':    { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
};

export function TypeQuestionView({ question, onAnswer, answered }: TypeQuestionViewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelectedIndex(index);
    onAnswer(index);
  };

  const attackTypeColor = getTypeColor(question.attackingType);

  return (
    <div className="animate-slide-up space-y-5">
      {/* Prompt */}
      <div className="text-center space-y-3">
        <p className="text-text-secondary text-sm">
          How effective is a{' '}
          <span
            className="inline-block font-bold px-2 py-0.5 rounded text-sm"
            style={{
              backgroundColor: attackTypeColor.bg,
              color: attackTypeColor.text,
              border: `1px solid ${attackTypeColor.border}`,
            }}
          >
            {question.attackingType}
          </span>
          {' '}move against…
        </p>
      </div>

      {/* Defender card */}
      <div className="flex justify-center">
        <PokemonCard
          pokemon={question.defender}
          spriteUrl={question.defenderSprite}
          compact
          className="max-w-[200px]"
        />
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-3 gap-3">
        {question.options.map((option, i) => {
          const colors = MULT_COLORS[option] ?? MULT_COLORS['1×'];
          let btnClass = 'hover:scale-[1.05] active:scale-[0.97]';

          if (answered) {
            if (i === question.correctIndex) {
              btnClass = 'ring-2 ring-accent-green bg-accent-green/15';
            } else if (i === selectedIndex) {
              btnClass = 'ring-2 ring-accent-red bg-accent-red/15 animate-shake';
            } else {
              btnClass = 'opacity-30';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={`rounded-xl border border-border p-4 text-center transition-all duration-200 ${btnClass}`}
              style={!answered ? { backgroundColor: colors.bg } : undefined}
            >
              <span
                className="text-xl font-extrabold tabular-nums"
                style={!answered ? { color: colors.text } : undefined}
              >
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Insight after answer */}
      {answered && (
        <div className={`rounded-xl p-3 text-center text-sm font-medium ${
          selectedIndex === question.correctIndex
            ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
            : 'bg-accent-red/10 text-accent-red border border-accent-red/20'
        }`}>
          {question.defender.types.length === 2
            ? `${question.defender.name} is ${question.defender.types.join('/')} → ${question.attackingType} is ${question.correctLabel}`
            : `${question.defender.name} is ${question.defender.types[0]} → ${question.attackingType} is ${question.correctLabel}`
          }
        </div>
      )}
    </div>
  );
}
