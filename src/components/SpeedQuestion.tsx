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
  correctPosition,
}: {
  id: string;
  question: SpeedQuestion;
  index: number;
  answered: boolean;
  correctPosition: number | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: answered });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.8 : 1,
  };

  const pokemonIndex = parseInt(id.split('-')[1]);
  const pokemon = question.pokemons[pokemonIndex];
  const sprite = question.sprites[pokemonIndex];

  let highlight: 'correct' | 'wrong' | null = null;
  if (answered && correctPosition !== null) {
    highlight = correctPosition === index ? 'correct' : 'wrong';
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

export function SpeedQuestionView({ question, onAnswer, answered }: SpeedQuestionViewProps) {
  const initialOrder = question.pokemons.map((_, i) => `card-${i}`);
  const [items, setItems] = useState(initialOrder);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
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

  // Map correct positions for highlighting
  const correctIndices = answered
    ? question.correctOrder.map((r) => question.pokemons.indexOf(r.pokemon))
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
        {!question.trickRoom && !question.tailwind.some(Boolean) && !question.paralysis.some(Boolean) && !question.statStages.some((s) => s !== 0) && (
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
              const correctPos = correctIndices
                ? correctIndices.indexOf(pokemonIndex)
                : null;

              return (
                <SortableCard
                  key={id}
                  id={id}
                  question={question}
                  index={index}
                  answered={answered}
                  correctPosition={correctPos !== null && correctPos === index ? index : correctPos}
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
    </div>
  );
}
