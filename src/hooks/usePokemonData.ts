import { useState, useEffect, useCallback } from 'react';
import type { PokemonFullData, PokemonMetaData } from '../data/types';
import { fetchPokemonData } from '../data/providers/pokeapi';
import { loadMetaData, getMetaPokemonNames, getMetaPokemon } from '../data/providers/smogon';
import type { QuizDataSource } from '../quiz/engine';

interface UsePokemonDataReturn {
  loading: boolean;
  error: string | null;
  dataSource: QuizDataSource | null;
  pokemonCount: number;
}

export function usePokemonData(): UsePokemonDataReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullDataCache, setFullDataCache] = useState<Record<string, PokemonFullData>>({});
  const [metaLoaded, setMetaLoaded] = useState(false);

  // Load meta data on mount
  useEffect(() => {
    loadMetaData()
      .then(() => setMetaLoaded(true))
      .catch((err) => setError(`Failed to load Pokémon data: ${err.message}`))
      .finally(() => setLoading(false));
  }, []);

  // Preload full data for top Pokémon
  useEffect(() => {
    if (!metaLoaded) return;

    const names = getMetaPokemonNames().slice(0, 50); // Preload top 50
    const cache: Record<string, PokemonFullData> = {};

    Promise.all(
      names.map(async (name) => {
        const data = await fetchPokemonData(name);
        if (data) cache[name] = data;
      })
    ).then(() => {
      setFullDataCache(cache);
    });
  }, [metaLoaded]);

  const getFullData = useCallback((name: string): PokemonFullData | null => {
    return fullDataCache[name] ?? null;
  }, [fullDataCache]);

  const getSpriteUrl = useCallback((name: string): string => {
    const full = fullDataCache[name];
    return full?.spriteUrl ?? '';
  }, [fullDataCache]);

  const dataSource: QuizDataSource | null = metaLoaded ? {
    getMetaPokemonNames: () => {
      // Only return names we have full data for
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
  };
}
