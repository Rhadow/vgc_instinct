import type { PokemonFullData, BaseStats } from '../types';
import { toPokeApiName } from '../nameMap';

const CACHE_PREFIX = 'pokeapi_v1_';

interface PokeApiStat {
  base_stat: number;
  stat: { name: string };
}

interface PokeApiType {
  type: { name: string };
}

interface PokeApiAbility {
  ability: { name: string };
  is_hidden: boolean;
}

interface PokeApiResponse {
  name: string;
  stats: PokeApiStat[];
  types: PokeApiType[];
  abilities: PokeApiAbility[];
  sprites: {
    front_default: string | null;
    other: {
      'official-artwork': { front_default: string | null };
      showdown: { front_default: string | null };
    };
  };
}

function mapStats(stats: PokeApiStat[]): BaseStats {
  const result: BaseStats = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  for (const s of stats) {
    switch (s.stat.name) {
      case 'hp': result.hp = s.base_stat; break;
      case 'attack': result.atk = s.base_stat; break;
      case 'defense': result.def = s.base_stat; break;
      case 'special-attack': result.spa = s.base_stat; break;
      case 'special-defense': result.spd = s.base_stat; break;
      case 'speed': result.spe = s.base_stat; break;
    }
  }
  return result;
}

function titleCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function fetchPokemonData(smogonName: string): Promise<PokemonFullData | null> {
  const cacheKey = CACHE_PREFIX + smogonName;

  // Check localStorage cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached) as PokemonFullData;
    }
  } catch {
    // localStorage unavailable or corrupt — continue to fetch
  }

  const apiName = toPokeApiName(smogonName);
  const url = `https://pokeapi.co/api/v2/pokemon/${apiName}/`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`PokeAPI returned ${res.status} for ${apiName}`);
      return null;
    }

    const data: PokeApiResponse = await res.json();

    const spriteUrl =
      data.sprites.other?.['official-artwork']?.front_default ??
      data.sprites.other?.showdown?.front_default ??
      data.sprites.front_default ??
      '';

    const result: PokemonFullData = {
      name: smogonName,
      baseStats: mapStats(data.stats),
      types: data.types.map((t) => titleCase(t.type.name)),
      abilities: data.abilities.map((a) => titleCase(a.ability.name)),
      spriteUrl,
    };

    // Cache in localStorage
    try {
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch {
      // localStorage full — non-fatal
    }

    return result;
  } catch (err) {
    console.error(`Failed to fetch ${apiName} from PokeAPI:`, err);
    return null;
  }
}
