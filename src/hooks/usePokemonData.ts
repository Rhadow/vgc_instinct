import { useState, useEffect, useCallback } from 'react';
import type { PokemonFullData } from '../data/types';
import { loadMetaData, getMetaPokemonNames, getMetaPokemon } from '../data/providers/smogon';
import type { QuizDataSource } from '../quiz/engine';

// Statically import the generated Pokemon data (contains all 250 Meta Pokemon)
import pokemonDataJson from '../data/pokemonData.json';

const fullDataCache = pokemonDataJson as Record<string, PokemonFullData>;

interface UsePokemonDataReturn {
  loading: boolean;
  error: string | null;
  dataSource: QuizDataSource | null;
  pokemonCount: number;
  totalMeta: number;
}

export function usePokemonData(): UsePokemonDataReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metaLoaded, setMetaLoaded] = useState(false);
  const [totalMeta, setTotalMeta] = useState(0);

  // Load meta data on mount
  useEffect(() => {
    loadMetaData()
      .then(() => {
        setMetaLoaded(true);
        setTotalMeta(getMetaPokemonNames().length);
      })
      .catch((err) => setError(`Failed to load Pokémon data: ${err.message}`))
      .finally(() => setLoading(false));
  }, []);

  const getFullData = useCallback((name: string): PokemonFullData | null => {
    return fullDataCache[name] ?? null;
  }, []);

  const getSpriteUrl = useCallback((name: string): string => {
    const full = fullDataCache[name];
    return full?.spriteUrl ?? '';
  }, []);

  const dataSource: QuizDataSource | null = metaLoaded ? {
    getMetaPokemonNames: () => {
      // Return names that exist in our static cache
      return getMetaPokemonNames().filter((n) => fullDataCache[n]);
    },
    getMetaPokemon: (name: string) => getMetaPokemon(name),
    getFullData,
    getSpriteUrl,
  } : null;

  return {
    loading,
    error,
    dataSource,
    pokemonCount: Object.keys(fullDataCache).length,
    totalMeta,
  };
}
