import { useState } from 'react';
import type { AppPokemon } from '../data/types';
import { getAbilityDescription } from '../data/abilityDescriptions';
import { getItemSpriteUrl, getItemDisplayName } from '../data/itemSpriteMap';
import { getTypeColor } from '../data/typeColors';

/** Generic item icon fallback from Showdown */
const GENERIC_ITEM_ICON = 'https://play.pokemonshowdown.com/sprites/itemicons/0.png';



interface PokemonCardProps {
  pokemon: AppPokemon;
  spriteUrl: string;
  showSpeed?: boolean;
  finalSpeed?: number;
  compact?: boolean;
  className?: string;
  highlight?: 'correct' | 'wrong' | null;
  hideTypes?: boolean;
  hideDetails?: boolean;
}

export function PokemonCard({
  pokemon,
  spriteUrl,
  showSpeed,
  finalSpeed,
  compact,
  className = '',
  highlight,
  hideTypes = false,
  hideDetails = false,
}: PokemonCardProps) {
  const [imgError, setImgError] = useState(false);
  const [itemImgError, setItemImgError] = useState(false);

  const abilityDesc = getAbilityDescription(pokemon.ability);

  const highlightClass =
    highlight === 'correct'
      ? 'ring-2 ring-accent-green bg-accent-green/10'
      : highlight === 'wrong'
        ? 'ring-2 ring-accent-red bg-accent-red/10'
        : '';

  const itemSpriteUrl = getItemSpriteUrl(pokemon.item);

  return (
    <div
      className={`relative rounded-xl bg-bg-card border border-border p-3 transition-all duration-200 ${highlightClass} ${className}`}
    >
      {/* Sprite */}
      <div className="flex justify-center mb-1">
        {!imgError && spriteUrl ? (
          <img
            src={spriteUrl}
            alt={pokemon.name}
            className={`${compact ? 'w-20 h-20' : 'w-28 h-28'} object-contain drop-shadow-lg`}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className={`${compact ? 'w-20 h-20' : 'w-28 h-28'} flex items-center justify-center rounded-lg bg-bg-secondary text-text-secondary text-xs font-medium`}
          >
            {pokemon.name}
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="text-center font-bold text-sm text-text-primary truncate">
        {pokemon.name}
      </h3>

      {/* Type badges */}
      {!hideTypes && pokemon.types && pokemon.types.length > 0 && (
        <div className="flex justify-center gap-1 mt-1">
          {pokemon.types.map((type) => {
            const colors = getTypeColor(type);
            return (
              <span
                key={type}
                className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {type}
              </span>
            );
          })}
        </div>
      )}

      {/* Details */}
      {!hideDetails && (
        <div className="mt-2 space-y-1 text-xs text-text-secondary">
          {/* Item */}
          {pokemon.item && pokemon.item !== 'nothing' && (
            <p className="flex items-center gap-1.5">
              <img
                src={!itemImgError && itemSpriteUrl ? itemSpriteUrl : GENERIC_ITEM_ICON}
                alt=""
                className="w-4 h-4 object-contain shrink-0"
                onError={() => setItemImgError(true)}
              />
              <span className="truncate">{getItemDisplayName(pokemon.item)}</span>
            </p>
          )}

          {/* Ability with inline description */}
          {pokemon.ability && (
            <div>
              <p className="font-medium text-text-primary truncate">
                {pokemon.ability}
              </p>
              {abilityDesc && (
                <p className="text-[10px] text-text-muted leading-snug mt-0.5">
                  {abilityDesc}
                </p>
              )}
            </div>
          )}

          {/* Speed / Nature */}
          {!compact && (
            <p className="flex items-center gap-1 text-text-muted">
              <span className="text-accent-blue shrink-0 text-[10px]">SPE</span>
              <span className="truncate">{pokemon.spread.nature} · {pokemon.spread.spe} EV</span>
            </p>
          )}
        </div>
      )}

      {/* Speed badge */}
      {showSpeed && finalSpeed !== undefined && (
        <div className="absolute -top-2 -right-2 bg-accent-blue text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
          {finalSpeed}
        </div>
      )}
    </div>
  );
}
