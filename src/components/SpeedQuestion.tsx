import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SpeedQuestion } from '../quiz/questionTypes';
import type { SpeedContext } from '../data/types';
import { calcFinalSpeedWithBreakdown } from '../calc/speed';
import { PokemonCard } from './PokemonCard';

interface SpeedQuestionViewProps {
  question: SpeedQuestion;
  onAnswer: (order: number[]) => void;
  answered: boolean;
}

function SortableCard({
  id,
  question,
  index,
  answered,
  isCorrectPos,
}: {
  id: string;
  question: SpeedQuestion;
  index: number;
  answered: boolean;
  isCorrectPos: boolean | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: answered });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.8 : 1,
    touchAction: 'none',
  };

  const pokemonIndex = parseInt(id.split('-')[1]);
  const pokemon = question.pokemons[pokemonIndex];
  const sprite = question.sprites[pokemonIndex];

  let highlight: 'correct' | 'wrong' | null = null;
  if (answered && isCorrectPos !== null) {
    highlight = isCorrectPos ? 'correct' : 'wrong';
  }

  const speed = answered
    ? question.correctOrder.find((r) => r.pokemon === pokemon)?.finalSpeed
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-bg-secondary border border-border flex items-center justify-center text-sm font-bold text-text-secondary shrink-0">
          {index + 1}
        </div>
        <PokemonCard
          pokemon={pokemon}
          spriteUrl={sprite}
          compact
          className="flex-1"
          highlight={highlight}
          showSpeed={answered}
          finalSpeed={speed}
        />
      </div>
    </div>
  );
}

const WEATHER_EMOJI: Record<string, string> = {
  Sun: '☀️',
  Rain: '🌧️',
  Sand: '🏜️',
  Snow: '❄️',
};

export function SpeedQuestionView({ question, onAnswer, answered }: SpeedQuestionViewProps) {
  const initialOrder = question.pokemons.map((_, i) => `card-${i}`);
  const [items, setItems] = useState(initialOrder);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = () => {
    const order = items.map((id) => parseInt(id.split('-')[1]));
    onAnswer(order);
  };

  // Map correct positions for highlighting no longer uses absolute indices,
  // we will check speeds inline for ties.

  // Generate speed breakdowns for each Pokémon
  const breakdowns = answered
    ? question.correctOrder.map((r) => {
        const i = question.pokemons.indexOf(r.pokemon);
        const ctx: SpeedContext = {
          pokemon: r.pokemon,
          trickRoom: question.trickRoom,
          tailwind: question.tailwind[i],
          statStage: question.statStages[i],
          paralysis: question.paralysis[i],
          weather: question.weather,
        };
        return calcFinalSpeedWithBreakdown(ctx);
      })
    : null;

  return (
    <div className="animate-slide-up space-y-4">
      {/* Field conditions */}
      <div className="flex flex-wrap gap-2 justify-center">
        {question.trickRoom && (
          <span className="bg-accent-pink/20 text-accent-pink border border-accent-pink/30 text-xs font-medium px-3 py-1 rounded-full">
            🔮 Trick Room
          </span>
        )}
        {question.weather && (
          <span className="bg-accent-amber/20 text-accent-amber border border-accent-amber/30 text-xs font-medium px-3 py-1 rounded-full">
            {WEATHER_EMOJI[question.weather]} {question.weather}
          </span>
        )}
        {question.tailwind.some(Boolean) && (
          <span className="bg-accent-blue/20 text-accent-blue border border-accent-blue/30 text-xs font-medium px-3 py-1 rounded-full">
            💨 Tailwind: {question.pokemons.filter((_, i) => question.tailwind[i]).map((p) => p.name).join(', ')}
          </span>
        )}
        {question.paralysis.some(Boolean) && (
          <span className="bg-accent-amber/20 text-accent-amber border border-accent-amber/30 text-xs font-medium px-3 py-1 rounded-full">
            ⚡ Paralyzed: {question.pokemons.filter((_, i) => question.paralysis[i]).map((p) => p.name).join(', ')}
          </span>
        )}
        {question.statStages.some((s) => s !== 0) && (
          <span className="bg-accent-purple/20 text-accent-purple border border-accent-purple/30 text-xs font-medium px-3 py-1 rounded-full">
            📉 Speed {question.statStages.find((s) => s !== 0)}: {question.pokemons.filter((_, i) => question.statStages[i] !== 0).map((p) => p.name).join(', ')}
          </span>
        )}
        {!question.trickRoom && !question.weather && !question.tailwind.some(Boolean) && !question.paralysis.some(Boolean) && !question.statStages.some((s) => s !== 0) && (
          <span className="text-text-muted text-xs">No field conditions</span>
        )}
      </div>

      <p className="text-center text-text-secondary text-sm">
        {answered ? 'Correct turn order:' : 'Drag to arrange: 1st to move → 4th to move'}
      </p>

      {/* Sortable cards */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((id, index) => {
              const pokemonIndex = parseInt(id.split('-')[1]);
              
              let isCorrectPos: boolean | null = null;
              if (answered) {
                const userSpeed = question.correctOrder.find((r) => r.pokemon === question.pokemons[pokemonIndex])?.finalSpeed;
                const expectedSpeed = question.correctOrder[index].finalSpeed;
                isCorrectPos = userSpeed === expectedSpeed;
              }

              return (
                <SortableCard
                  key={id}
                  id={id}
                  question={question}
                  index={index}
                  answered={answered}
                  isCorrectPos={isCorrectPos}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Submit button */}
      {!answered && (
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-bold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-accent-blue/30 active:scale-[0.98]"
        >
          Submit Order
        </button>
      )}

      {/* Speed breakdown detail (after answer) */}
      {answered && breakdowns && (
        <div className="mt-4">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full text-xs text-text-muted hover:text-text-secondary transition-colors text-center py-2"
          >
            {showBreakdown ? '▲ Hide Calculation Details' : '▼ Show Calculation Details'}
          </button>

          {showBreakdown && (
            <div className="bg-bg-secondary rounded-xl p-4 space-y-4 animate-fade-in border border-border">
              {question.correctOrder.map((result, orderIdx) => {
                const bd = breakdowns[orderIdx];
                return (
                  <div key={orderIdx} className="space-y-1">
                    <p className="text-xs font-bold text-text-primary">
                      #{orderIdx + 1} {result.pokemon.name}
                      <span className="ml-2 text-accent-blue font-mono">→ {result.finalSpeed}</span>
                    </p>
                    {bd.breakdown.map((step, stepIdx) => (
                      <div key={stepIdx} className="flex items-baseline gap-2 text-[11px] text-text-secondary pl-4">
                        <span className="text-text-muted shrink-0">{stepIdx === 0 ? '=' : '→'}</span>
                        <span className="font-mono text-accent-blue">{step.value}</span>
                        <span className="text-text-muted truncate">{step.label}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
              {question.trickRoom && (
                <p className="text-[11px] text-accent-pink italic pt-1 border-t border-border">
                  🔮 Trick Room reverses turn order — slowest moves first
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
