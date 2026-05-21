import { useState, useMemo } from 'react';
import type { DamageQuestion } from '../quiz/questionTypes';
import { PokemonCard } from './PokemonCard';
import { getMoveDisplayName } from '../data/moveNames';
import { analyzeDamage } from '../calc/damageBreakdown';
import { getTypeColor } from '../data/typeColors';

const WEATHER_EMOJI: Record<string, string> = {
  Sun: '☀️', Rain: '🌧️', Sand: '🏜️', Snow: '❄️',
  'Harsh Sunshine': '🔥', 'Heavy Rain': '🌊',
};

const TERRAIN_EMOJI: Record<string, string> = {
  Electric: '⚡', Grassy: '🌿', Psychic: '🔮', Misty: '🌫️',
};

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

  const displayMoveName = getMoveDisplayName(question.moveName);

  // Compute breakdown when answered (for insight) or when details shown
  const breakdown = useMemo(
    () => (answered ? analyzeDamage(question.attacker, question.defender, question.moveName, question.field) : null),
    [answered, question],
  );

  const moveTypeColor = getTypeColor(question.moveType);

  return (
    <div className="animate-slide-up space-y-4">
      {/* Field condition badges */}
      {question.field && (question.field.weather || question.field.terrain) && (
        <div className="flex flex-wrap gap-2 justify-center">
          {question.field.weather && (
            <span className="bg-accent-amber/20 text-accent-amber border border-accent-amber/30 text-xs font-medium px-3 py-1 rounded-full">
              {WEATHER_EMOJI[question.field.weather] ?? ''} {question.field.weather}
            </span>
          )}
          {question.field.terrain && (
            <span className="bg-accent-green/20 text-accent-green border border-accent-green/30 text-xs font-medium px-3 py-1 rounded-full">
              {TERRAIN_EMOJI[question.field.terrain] ?? ''} {question.field.terrain} Terrain
            </span>
          )}
        </div>
      )}

      {/* Battle matchup */}
      <div className="flex items-center justify-center gap-3">
        <PokemonCard
          pokemon={question.attacker}
          spriteUrl={question.attackerSprite}
          compact
          className="flex-1 max-w-[170px]"
        />

        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl">⚔️</span>
          <div
            className="rounded-lg px-3 py-1.5 text-center"
            style={{
              backgroundColor: moveTypeColor.bg,
              border: `1px solid ${moveTypeColor.border}`,
            }}
          >
            <p className="text-xs text-text-secondary">Move</p>
            <p className="text-sm font-bold" style={{ color: moveTypeColor.text }}>
              {displayMoveName}
            </p>
            <p
              className="text-[10px] uppercase tracking-wider mt-0.5 font-semibold"
              style={{ color: moveTypeColor.text, opacity: 0.7 }}
            >
              {question.moveType}
            </p>
          </div>
        </div>

        <PokemonCard
          pokemon={question.defender}
          spriteUrl={question.defenderSprite}
          compact
          className="flex-1 max-w-[170px]"
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
            {showDetails ? '▲ Hide Details' : '▼ Show Calculation Details'}
          </button>

          {showDetails && breakdown && (
            <div className="bg-bg-secondary rounded-xl p-4 text-xs space-y-3 animate-fade-in border border-border">
              {/* KO Chance */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-primary">Result:</span>
                <span className={`font-semibold ${
                  breakdown.koChance.includes('OHKO') ? 'text-accent-red'
                  : breakdown.koChance.includes('2HKO') ? 'text-accent-amber'
                  : 'text-accent-green'
                }`}>
                  {breakdown.koChance}
                </span>
              </div>

              {/* Move info */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-text-muted">Move</span>
                  <span className="text-text-primary font-medium">{breakdown.moveName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Type</span>
                  <span style={{ color: moveTypeColor.text }} className="font-medium">{breakdown.moveType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Category</span>
                  <span className="text-text-primary">{breakdown.moveCategory}</span>
                </div>
                {breakdown.movePower > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Base Power</span>
                    <span className="text-text-primary">{breakdown.movePower}</span>
                  </div>
                )}
              </div>

              {/* Effectiveness */}
              <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                <span className="text-text-muted">Type Effectiveness:</span>
                <span className={`font-semibold ${
                  breakdown.typeEffectiveness > 1 ? 'text-accent-red'
                  : breakdown.typeEffectiveness < 1 ? 'text-accent-green'
                  : 'text-text-secondary'
                }`}>
                  {breakdown.typeEffectivenessLabel}
                </span>
              </div>

              {/* STAB */}
              {breakdown.isStab && (
                <div className="flex items-center gap-2">
                  <span className="text-text-muted">STAB:</span>
                  <span className="text-accent-blue font-semibold">Yes (×1.5 damage)</span>
                </div>
              )}

              {/* Weather */}
              {breakdown.weather && breakdown.weatherEffect && (
                <div className="flex items-center gap-2">
                  <span className="text-text-muted">Weather ({breakdown.weather}):</span>
                  <span className={`font-semibold ${
                    breakdown.weatherEffect === 'boosted' ? 'text-accent-red' : 'text-accent-blue'
                  }`}>
                    {breakdown.weatherEffect === 'boosted' ? '×1.5 boost' : '×0.5 weakened'}
                  </span>
                </div>
              )}

              {/* Terrain */}
              {breakdown.terrainEffect && (
                <div className="flex items-center gap-2">
                  <span className="text-text-muted">Terrain:</span>
                  <span className="text-accent-green font-semibold">{breakdown.terrainEffect}</span>
                </div>
              )}

              {/* Attacker ability */}
              {breakdown.attackerAbilityEffect && (
                <div className="flex items-center gap-2">
                  <span className="text-text-muted">Attacker Ability:</span>
                  <span className="text-text-primary">{breakdown.attackerAbilityEffect}</span>
                </div>
              )}

              {/* Defender ability */}
              {breakdown.defenderAbilityEffect && (
                <div className="flex items-center gap-2">
                  <span className="text-text-muted">Defender Ability:</span>
                  <span className="text-text-primary">{breakdown.defenderAbilityEffect}</span>
                </div>
              )}

              {/* Item */}
              {breakdown.itemEffect && (
                <div className="flex items-center gap-2">
                  <span className="text-text-muted">Item:</span>
                  <span className="text-text-primary">{breakdown.itemEffect}</span>
                </div>
              )}

              {/* Full calc description */}
              <div className="pt-2 border-t border-border/50">
                <p className="text-text-muted mb-1">Full calc output:</p>
                <p className="text-text-secondary font-mono text-[10px] leading-relaxed break-words">
                  {question.correctResult.description}
                </p>
              </div>

              {/* Damage rolls */}
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
