import type { PokemonMetaData, EVSpread } from '../types';

// This reads from the build-time generated metaData.json
// If it fails, fallback data is used instead.
let metaDataCache: Record<string, PokemonMetaData> | null = null;

function parseSpread(spreadStr: string): EVSpread {
  // Format: "Nature:HP/Atk/Def/SpA/SpD/Spe"
  const [nature, evPart] = spreadStr.split(':');
  const evs = evPart.split('/').map(Number);
  return {
    nature,
    hp: evs[0] ?? 0,
    atk: evs[1] ?? 0,
    def: evs[2] ?? 0,
    spa: evs[3] ?? 0,
    spd: evs[4] ?? 0,
    spe: evs[5] ?? 0,
  };
}

function getTopN<T>(obj: Record<string, number>, n: number): T[] {
  return Object.entries(obj)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([key]) => key as T);
}

interface SmogonChaosData {
  data: Record<string, {
    Abilities: Record<string, number>;
    Items: Record<string, number>;
    Spreads: Record<string, number>;
    Moves: Record<string, number>;
    usage?: number;
  }>;
}

export function parseSmogonChaosJson(raw: SmogonChaosData): Record<string, PokemonMetaData> {
  const result: Record<string, PokemonMetaData> = {};

  for (const [name, entry] of Object.entries(raw.data)) {
    const spreads = getTopN<string>(entry.Spreads, 3).map(parseSpread);
    const moves = getTopN<string>(entry.Moves, 5);
    const items = getTopN<string>(entry.Items, 3);
    const abilities = getTopN<string>(entry.Abilities, 2);
    const usage = entry.usage || 0;

    // Only include Pokémon that have at least one spread and one move
    if (spreads.length > 0 && moves.length > 0) {
      result[name] = { name, usage, spreads, moves, items, abilities };
    }
  }

  return result;
}

export async function loadMetaData(): Promise<Record<string, PokemonMetaData>> {
  if (metaDataCache) return metaDataCache;

  try {
    const module = await import('../generated/metaData.json');
    metaDataCache = module.default as Record<string, PokemonMetaData>;
    return metaDataCache;
  } catch {
    console.warn('Failed to load metaData.json, using fallback');
    const { FALLBACK_META } = await import('../fallback');
    metaDataCache = FALLBACK_META;
    return metaDataCache;
  }
}

export function getMetaData(): Record<string, PokemonMetaData> | null {
  return metaDataCache;
}

export function getMetaPokemonNames(): string[] {
  if (!metaDataCache) return [];
  return Object.keys(metaDataCache);
}

export function getMetaPokemon(name: string): PokemonMetaData | undefined {
  return metaDataCache?.[name];
}
