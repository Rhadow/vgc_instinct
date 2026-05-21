import { useState, useEffect } from 'react';
import type { CasualQuestion } from '../quiz/questionTypes';
import { PokemonCard } from './PokemonCard';
import { getTypeColor } from '../data/typeColors';
import { TypeIcon } from './TypeIcon';

interface CasualQuestionViewProps {
  question: CasualQuestion;
  onAnswer: (index: number) => void;
  answered: boolean;
}

export function CasualQuestionView({ question, onAnswer, answered }: CasualQuestionViewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Reset selected index when the question changes
  useEffect(() => {
    setSelectedIndex(null);
  }, [question]);

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelectedIndex(index);
    onAnswer(index);
  };

  return (
    <div className="animate-slide-up space-y-6 max-w-2xl mx-auto">
      {/* Target Type Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-bg-card/40 backdrop-blur p-6 text-center shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-blue/5 via-transparent to-transparent pointer-events-none" />
        
        <h2 className="text-text-secondary text-xs font-bold uppercase tracking-widest mb-4">
          Which Pokémon is exactly this type combination?
        </h2>

        {/* Dynamic target types container */}
        <div className="flex flex-wrap justify-center items-center gap-3">
          {question.targetTypes.map((type) => {
            const colors = getTypeColor(type);
            return (
              <div
                key={type}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border shadow-sm transition-all duration-300 hover:scale-[1.05] shrink-0"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                  boxShadow: `0 4px 12px ${colors.bg}`,
                }}
              >
                <TypeIcon type={type} size={26} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]" />
                <span className="text-sm font-black tracking-wider uppercase">{type}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2x2 Grid of Option Cards */}
      <div className="grid grid-cols-2 gap-4">
        {question.options.map((option, i) => {
          const isSelected = i === selectedIndex;
          const isCorrect = i === question.correctIndex;
          
          let highlight: 'correct' | 'wrong' | null = null;
          let btnClass = 'transition-all duration-200 text-left w-full rounded-xl focus:outline-none';

          if (answered) {
            if (isCorrect) {
              highlight = 'correct';
              btnClass += ' scale-[1.02] shadow-lg shadow-accent-green/5 ring-1 ring-accent-green/30';
            } else if (isSelected) {
              highlight = 'wrong';
              btnClass += ' animate-shake shadow-lg shadow-accent-red/5 ring-1 ring-accent-red/30';
            } else {
              btnClass += ' opacity-40 grayscale-[15%]';
            }
          } else {
            btnClass += ' hover:scale-[1.03] active:scale-[0.98] hover:shadow-md cursor-pointer';
          }

          return (
            <button
              key={option.name + '-' + i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={btnClass}
            >
              <PokemonCard
                pokemon={option}
                spriteUrl={question.sprites[i]}
                compact
                highlight={highlight}
                hideTypes={!answered}
                hideDetails={!answered}
                className="w-full h-full"
              />
            </button>
          );
        })}
      </div>

      {/* Answer feedback notification */}
      {answered && (
        <div
          className={`rounded-xl p-4 text-center text-sm font-semibold border transition-all duration-300 animate-slide-up ${
            selectedIndex === question.correctIndex
              ? 'bg-accent-green/10 text-accent-green border-accent-green/20'
              : 'bg-accent-red/10 text-accent-red border-accent-red/20'
          }`}
        >
          {selectedIndex === question.correctIndex ? (
            <div className="flex items-center justify-center gap-2">
              <span>✨</span>
              <span>Correct! +10 Points.</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>❌</span>
              <span>
                Not quite! The correct answer is{' '}
                <strong className="underline decoration-2">
                  {question.options[question.correctIndex].name}
                </strong>.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
