import { calculate, Generations, Pokemon, Move, Field } from '@smogon/calc';
import type { AppPokemon, AppField, DamageResult } from '../data/types';
import { getMegaStone, isMegaEvolution } from '../data/nameMap';

const gen = Generations.get(9);

function mapToCalcPokemon(p: AppPokemon): Pokemon {
  const item = isMegaEvolution(p.name)
    ? getMegaStone(p.name) ?? p.item
    : p.item;

  return new Pokemon(gen, p.name, {
    level: p.level || 50,
    nature: p.spread.nature,
    evs: {
      hp: p.spread.hp,
      atk: p.spread.atk,
      def: p.spread.def,
      spa: p.spread.spa,
      spd: p.spread.spd,
      spe: p.spread.spe,
    },
    ivs: {
      hp: p.ivs?.hp ?? 31,
      atk: p.ivs?.atk ?? 31,
      def: p.ivs?.def ?? 31,
      spa: p.ivs?.spa ?? 31,
      spd: p.ivs?.spd ?? 31,
      spe: p.ivs?.spe ?? 31,
    },
    item: item || undefined,
    ability: p.ability || undefined,
  });
}

function mapToCalcField(f?: AppField): Field {
  if (!f) return new Field();

  return new Field({
    weather: f.weather || undefined,
    terrain: f.terrain || undefined,
    isGravity: f.isGravity,
  });
}

/**
 * Calculate damage using @smogon/calc.
 * Returns null if the calculation fails (unsupported move, etc.).
 */
export function calcDamage(
  attacker: AppPokemon,
  defender: AppPokemon,
  moveName: string,
  field?: AppField,
): DamageResult | null {
  try {
    const atkMon = mapToCalcPokemon(attacker);
    const defMon = mapToCalcPokemon(defender);
    const move = new Move(gen, moveName);
    const calcField = mapToCalcField(field);

    const result = calculate(gen, atkMon, defMon, move, calcField);
    const dmg = result.damage;

    let rolls: number[];
    if (Array.isArray(dmg)) {
      // dmg could be number[] or number[][] for multi-hit
      if (Array.isArray(dmg[0])) {
        // Multi-hit (e.g. Surging Strikes): each sub-array is one hit's 16 rolls
        // Sum the min/max across all hits for total damage
        const hitArrays = dmg as number[][];
        const totalMin = hitArrays.reduce((sum, hit) => sum + Math.min(...hit), 0);
        const totalMax = hitArrays.reduce((sum, hit) => sum + Math.max(...hit), 0);
        // Build synthetic rolls array representing the total range
        rolls = [totalMin, totalMax];
      } else {
        rolls = dmg as number[];
      }
    } else {
      rolls = [dmg as number];
    }

    const min = Math.min(...rolls);
    const max = Math.max(...rolls);
    const defenderHp = defMon.maxHP();

    return {
      rolls,
      min,
      max,
      minPercent: parseFloat(((min / defenderHp) * 100).toFixed(1)),
      maxPercent: parseFloat(((max / defenderHp) * 100).toFixed(1)),
      description: result.fullDesc(),
    };
  } catch (err) {
    console.warn(`Damage calc failed for ${moveName}:`, err);
    return null;
  }
}
