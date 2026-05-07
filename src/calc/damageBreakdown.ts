/**
 * Structured damage breakdown analysis.
 * Extracts type effectiveness, STAB, weather, ability, and item effects
 * from the matchup data to display a detailed calculation view.
 */
import { Generations, Move, Pokemon, Field, calculate } from '@smogon/calc';
import type { AppPokemon, AppField } from '../data/types';
import { getMegaStone, isMegaEvolution } from '../data/nameMap';
import { getItemDisplayName } from '../data/itemSpriteMap';
import { getMoveDisplayName } from '../data/moveNames';
import { getAbilityDisplayName } from '../data/abilityNames';

const gen = Generations.get(9);

/** Type chart for effectiveness */
const TYPE_CHART: Record<string, Record<string, number>> = {
  Normal:   { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire:     { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water:    { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass:    { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice:      { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison:   { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground:   { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying:   { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic:  { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug:      { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock:     { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost:    { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon:   { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark:     { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel:    { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy:    { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
};

export interface DamageBreakdown {
  typeEffectiveness: number;
  typeEffectivenessLabel: string;
  isStab: boolean;
  weather?: string;
  weatherEffect?: 'boosted' | 'weakened' | null;
  terrain?: string;
  terrainEffect?: string | null;
  attackerAbilityEffect?: string;
  defenderAbilityEffect?: string;
  itemEffect?: string;
  koChance: string;
  moveName: string;
  moveType: string;
  moveCategory: string;
  movePower: number;
}

function calcTypeEffectiveness(moveType: string, defenderTypes: string[]): number {
  let mult = 1;
  for (const defType of defenderTypes) {
    const chart = TYPE_CHART[moveType];
    if (chart && chart[defType] !== undefined) {
      mult *= chart[defType];
    }
  }
  return mult;
}

function getEffectivenessLabel(mult: number): string {
  if (mult === 0) return 'Immune (×0)';
  if (mult === 0.25) return 'Doubly resisted (×0.25)';
  if (mult === 0.5) return 'Resisted (×0.5)';
  if (mult === 1) return 'Neutral (×1)';
  if (mult === 2) return 'Super effective (×2)';
  if (mult === 4) return 'Doubly super effective (×4)';
  return `×${mult}`;
}

/** Weather abilities and their corresponding weather */
const WEATHER_ABILITIES: Record<string, string> = {
  Drought: 'Sun',
  Drizzle: 'Rain',
  'Sand Stream': 'Sand',
  'Snow Warning': 'Snow',
};

/** Weather-boosted move types */
const WEATHER_BOOST: Record<string, { boosted: string; weakened: string }> = {
  Sun:  { boosted: 'Fire', weakened: 'Water' },
  Rain: { boosted: 'Water', weakened: 'Fire' },
};

/** Terrain-boosted move types */
const TERRAIN_BOOST: Record<string, string> = {
  Electric: 'Electric',
  Grassy: 'Grass',
  Psychic: 'Psychic',
};

/** Abilities that affect damage */
const OFFENSIVE_ABILITY_EFFECTS: Record<string, string> = {
  'Huge Power': 'Doubles Attack stat',
  'Pure Power': 'Doubles Attack stat',
  'Adaptability': 'STAB bonus is 2× instead of 1.5×',
  'Sheer Force': 'Moves with secondary effects deal 1.3× damage (no effect trigger)',
  'Technician': 'Moves with BP ≤60 deal 1.5× damage',
  'Tinted Lens': '"Not very effective" moves deal 2× damage',
  'Aerilate': 'Normal → Flying; 1.2× damage',
  'Pixilate': 'Normal → Fairy; 1.2× damage',
  'Refrigerate': 'Normal → Ice; 1.2× damage',
  'Galvanize': 'Normal → Electric; 1.2× damage',
  'Protean': 'Changes type to match move (gains STAB)',
  'Libero': 'Changes type to match move (gains STAB)',
};

const DEFENSIVE_ABILITY_EFFECTS: Record<string, string> = {
  'Thick Fat': 'Halves Fire and Ice damage taken',
  'Multiscale': 'Halves damage taken at full HP',
  'Shadow Shield': 'Halves damage taken at full HP',
  'Ice Scales': 'Halves special damage taken',
  'Fluffy': 'Halves contact damage taken; doubles Fire damage',
  'Filter': 'Reduces super-effective damage by 25%',
  'Solid Rock': 'Reduces super-effective damage by 25%',
  'Prism Armor': 'Reduces super-effective damage by 25%',
  'Marvel Scale': 'Defense ×1.5 when statused',
  'Fur Coat': 'Doubles Defense stat',
  'Levitate': 'Immune to Ground-type moves',
  'Flash Fire': 'Immune to Fire; boosts own Fire moves',
  'Water Absorb': 'Immune to Water; heals 25% HP',
  'Volt Absorb': 'Immune to Electric; heals 25% HP',
  'Dry Skin': 'Immune to Water; Fire damage ×1.25',
  'Storm Drain': 'Immune to Water; +1 Sp.Atk',
  'Lightning Rod': 'Immune to Electric; +1 Sp.Atk',
  'Heatproof': 'Halves Fire damage taken',
};

/** Items that affect damage */
const OFFENSIVE_ITEM_EFFECTS: Record<string, string> = {
  lifeorb: 'Life Orb: 1.3× damage',
  choiceband: 'Choice Band: 1.5× Attack',
  choicespecs: 'Choice Specs: 1.5× Sp.Atk',
  expertbelt: 'Expert Belt: 1.2× on super-effective',
  metronome: 'Metronome: damage scales with consecutive use',
};

function getKoChance(
  attacker: AppPokemon,
  defender: AppPokemon,
  moveName: string,
  field?: AppField,
): string {
  try {
    const item = isMegaEvolution(attacker.name)
      ? getMegaStone(attacker.name) ?? attacker.item
      : attacker.item;

    const atkMon = new Pokemon(gen, attacker.name, {
      level: attacker.level || 50,
      nature: attacker.spread.nature,
      evs: { hp: attacker.spread.hp, atk: attacker.spread.atk, def: attacker.spread.def, spa: attacker.spread.spa, spd: attacker.spread.spd, spe: attacker.spread.spe },
      item: item || undefined,
      ability: attacker.ability || undefined,
    });
    const defMon = new Pokemon(gen, defender.name, {
      level: defender.level || 50,
      nature: defender.spread.nature,
      evs: { hp: defender.spread.hp, atk: defender.spread.atk, def: defender.spread.def, spa: defender.spread.spa, spd: defender.spread.spd, spe: defender.spread.spe },
      item: (isMegaEvolution(defender.name) ? getMegaStone(defender.name) : defender.item) || undefined,
      ability: defender.ability || undefined,
    });
    const move = new Move(gen, moveName);
    const calcField = field
      ? new Field({ weather: field.weather || undefined, terrain: field.terrain || undefined, isGravity: field.isGravity })
      : new Field();

    const result = calculate(gen, atkMon, defMon, move, calcField);
    const koText = result.kpiDesc?.() ?? result.fullDesc();

    // Extract KO chance from the description
    if (koText.includes('guaranteed OHKO')) return 'Guaranteed OHKO';
    if (koText.includes('chance to OHKO')) {
      const match = koText.match(/([\d.]+)% chance to OHKO/);
      return match ? `${match[1]}% chance to OHKO` : 'Possible OHKO';
    }
    if (koText.includes('guaranteed 2HKO')) return 'Guaranteed 2HKO';
    if (koText.includes('chance to 2HKO')) {
      const match = koText.match(/([\d.]+)% chance to 2HKO/);
      return match ? `${match[1]}% chance to 2HKO` : 'Possible 2HKO';
    }
    if (koText.includes('guaranteed 3HKO')) return 'Guaranteed 3HKO';
    if (koText.includes('3HKO')) return 'Possible 3HKO';
    if (koText.includes('4HKO')) return '4HKO or worse';
    return 'Not a KO';
  } catch {
    return 'Unknown';
  }
}

export function analyzeDamage(
  attacker: AppPokemon,
  defender: AppPokemon,
  moveName: string,
  field?: AppField,
): DamageBreakdown {
  let moveType = 'Normal';
  let moveCategory = 'Physical';
  let movePower = 0;

  try {
    const move = new Move(gen, moveName);
    moveType = move.type;
    moveCategory = move.category;
    movePower = move.bp;
  } catch { /* use defaults */ }

  // Type effectiveness
  const typeEff = calcTypeEffectiveness(moveType, defender.types);

  // STAB check — also consider Protean/Libero
  const hasTypeChangingAbility = ['Protean', 'Libero'].includes(attacker.ability);
  const isStab = hasTypeChangingAbility || attacker.types.includes(moveType);

  // Weather effects
  let weatherEffect: 'boosted' | 'weakened' | null = null;
  const activeWeather = field?.weather;
  if (activeWeather && WEATHER_BOOST[activeWeather]) {
    if (moveType === WEATHER_BOOST[activeWeather].boosted) weatherEffect = 'boosted';
    if (moveType === WEATHER_BOOST[activeWeather].weakened) weatherEffect = 'weakened';
  }

  // Terrain effects
  let terrainEffect: string | null = null;
  const activeTerrain = field?.terrain;
  if (activeTerrain && TERRAIN_BOOST[activeTerrain] === moveType) {
    terrainEffect = `${activeTerrain} Terrain boosts ${moveType} moves by 30%`;
  }
  if (activeTerrain === 'Misty' && moveType === 'Dragon') {
    terrainEffect = 'Misty Terrain halves Dragon damage';
  }

  // Ability effects
  const attackerAbilityEffect = OFFENSIVE_ABILITY_EFFECTS[attacker.ability];
  const defenderAbilityEffect = DEFENSIVE_ABILITY_EFFECTS[defender.ability];

  // Item effects
  const itemEffect = OFFENSIVE_ITEM_EFFECTS[attacker.item];

  // KO chance
  const koChance = getKoChance(attacker, defender, moveName, field);

  return {
    typeEffectiveness: typeEff,
    typeEffectivenessLabel: getEffectivenessLabel(typeEff),
    isStab,
    weather: activeWeather,
    weatherEffect,
    terrain: activeTerrain,
    terrainEffect,
    attackerAbilityEffect,
    defenderAbilityEffect,
    itemEffect,
    koChance,
    moveName: getMoveDisplayName(moveName),
    moveType,
    moveCategory,
    movePower,
  };
}
