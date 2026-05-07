// App-internal types. Never expose raw PokeAPI / Smogon shapes outside the provider boundary.

export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface EVSpread {
  nature: string;
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface AppPokemon {
  name: string;
  baseStats: BaseStats;
  types: string[];
  /** Display name (e.g. "Swift Swim", "Intimidate"). Normalized at the data boundary. */
  ability: string;
  /** Smogon ID (e.g. "choicescarf", "sitrusberry"). Use getItemDisplayName() for rendering. */
  item: string;
  spread: EVSpread;
  level: number;
  ivs?: Partial<BaseStats>;
}

export interface MoveInfo {
  name: string;
  type: string;
  category: 'Physical' | 'Special' | 'Status';
  basePower: number;
  accuracy: number;
}

export interface AppField {
  weather?: 'Sun' | 'Rain' | 'Sand' | 'Snow' | 'Harsh Sunshine' | 'Heavy Rain';
  terrain?: 'Electric' | 'Grassy' | 'Psychic' | 'Misty';
  isDoublesAttackerSide?: boolean;
  isDoublesDefenderSide?: boolean;
  isGravity?: boolean;
}

export interface PokemonMetaData {
  name: string;
  usage: number;
  spreads: EVSpread[];
  moves: string[];
  items: string[];
  abilities: string[];
}

export interface PokemonFullData {
  name: string;
  baseStats: BaseStats;
  types: string[];
  abilities: string[];
  spriteUrl: string;
}

export interface DamageResult {
  rolls: number[];
  min: number;
  max: number;
  minPercent: number;
  maxPercent: number;
  description: string;
}

export interface SpeedContext {
  pokemon: AppPokemon;
  trickRoom: boolean;
  tailwind: boolean;
  statStage: number; // -6 to +6
  paralysis: boolean;
  weather?: 'Sun' | 'Rain' | 'Sand' | 'Snow';
}

export interface SpeedResult {
  pokemon: AppPokemon;
  finalSpeed: number;
  effectiveOrder: number;
}

export type QuizMode = 'damage' | 'speed';
