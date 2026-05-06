import { useState } from 'react';
import type { AppPokemon } from '../data/types';

interface PokemonCardProps {
  pokemon: AppPokemon;
  spriteUrl: string;
  showSpeed?: boolean;
  finalSpeed?: number;
  compact?: boolean;
  className?: string;
  highlight?: 'correct' | 'wrong' | null;
}

export function PokemonCard({
  pokemon,
  spriteUrl,
  showSpeed,
  finalSpeed,
  compact,
  className = '',
  highlight,
}: PokemonCardProps) {
  const [imgError, setImgError] = useState(false);

  const highlightClass =
    highlight === 'correct'
      ? 'ring-2 ring-accent-green bg-accent-green/10'
      : highlight === 'wrong'
        ? 'ring-2 ring-accent-red bg-accent-red/10'
        : '';

  return (
    <div
      className={`relative rounded-xl bg-bg-card border border-border p-3 transition-all duration-200 ${highlightClass} ${className}`}
    >
      {/* Sprite */}
      <div className="flex justify-center mb-2">
        {!imgError && spriteUrl ? (
          <img
            src={spriteUrl}
            alt={pokemon.name}
            className={`${compact ? 'w-16 h-16' : 'w-24 h-24'} object-contain drop-shadow-lg`}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className={`${compact ? 'w-16 h-16' : 'w-24 h-24'} flex items-center justify-center rounded-lg bg-bg-secondary text-text-secondary text-xs font-medium`}
          >
            {pokemon.name}
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="text-center font-bold text-sm text-text-primary truncate">
        {pokemon.name}
      </h3>

      {/* Details */}
      <div className="mt-1 space-y-0.5 text-xs text-text-secondary">
        {pokemon.item && (
          <p className="truncate">
            <span className="text-accent-amber">⬡</span> {pokemon.item}
          </p>
        )}
        {pokemon.ability && (
          <p className="truncate">
            <span className="text-accent-purple">◆</span> {pokemon.ability}
          </p>
        )}
        {!compact && (
          <p className="truncate">
            <span className="text-accent-blue">↕</span> {pokemon.spread.nature} {pokemon.spread.spe} Spe
          </p>
        )}
      </div>

      {/* Speed badge */}
      {showSpeed && finalSpeed !== undefined && (
        <div className="absolute -top-2 -right-2 bg-accent-blue text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
          {finalSpeed}
        </div>
      )}
    </div>
  );
}
