/**
 * Generate one-liner contextual insights about quiz answers.
 * Shown immediately after answering — no expand needed.
 */
import type { DamageQuestion, SpeedQuestion } from '../quiz/questionTypes';
import type { DamageBreakdown } from './damageBreakdown';

function damageLevel(minPct: number): string {
  if (minPct >= 100) return 'guaranteed KO';
  if (minPct >= 60) return 'heavy damage';
  if (minPct >= 40) return 'solid damage';
  if (minPct >= 20) return 'moderate damage';
  return 'minimal damage';
}

export function generateDamageInsight(question: DamageQuestion, breakdown: DamageBreakdown): string {
  const parts: string[] = [];

  // Type effectiveness
  if (breakdown.typeEffectiveness === 0) return 'Immune — this move has no effect';
  if (breakdown.typeEffectiveness >= 4) parts.push('4× super effective');
  else if (breakdown.typeEffectiveness >= 2) parts.push('Super effective');
  else if (breakdown.typeEffectiveness <= 0.25) parts.push('Doubly resisted');
  else if (breakdown.typeEffectiveness <= 0.5) parts.push('Resisted');

  // STAB
  if (breakdown.isStab) parts.push('STAB');

  // Weather
  if (breakdown.weatherEffect === 'boosted') parts.push(`${breakdown.weather}-boosted`);
  else if (breakdown.weatherEffect === 'weakened') parts.push(`weakened by ${breakdown.weather}`);

  // Key ability
  if (breakdown.attackerAbilityEffect) {
    const abilityName = Object.entries({
      'Huge Power': 'Huge Power',
      'Pure Power': 'Pure Power',
      'Adaptability': 'Adaptability',
      'Sheer Force': 'Sheer Force',
      'Technician': 'Technician',
      'Tinted Lens': 'Tinted Lens',
    }).find(([key]) => breakdown.attackerAbilityEffect?.includes(key))?.[0];
    if (abilityName) parts.push(abilityName);
  }
  if (breakdown.defenderAbilityEffect) {
    const defAbility = question.defender.ability;
    parts.push(`vs ${defAbility}`);
  }

  // Key item
  if (breakdown.itemEffect) {
    if (breakdown.itemEffect.includes('Life Orb')) parts.push('Life Orb');
    else if (breakdown.itemEffect.includes('Choice Band')) parts.push('Choice Band');
    else if (breakdown.itemEffect.includes('Choice Specs')) parts.push('Choice Specs');
  }

  // Build result
  const modifiers = parts.length > 0 ? parts.join(' + ') : 'Neutral hit';
  const level = damageLevel(question.correctResult.minPercent);
  return `${modifiers} → ${level}`;
}

export function generateSpeedInsight(question: SpeedQuestion): string {
  const fastest = question.correctOrder[0];

  if (question.trickRoom) {
    return `Trick Room reverses order — ${fastest.pokemon.name} is slowest so it moves first`;
  }

  const scarfMon = question.pokemons.find((p) => p.item === 'choicescarf');
  if (scarfMon) {
    const isFastest = fastest.pokemon.name === scarfMon.name;
    if (isFastest) return `Choice Scarf lets ${scarfMon.name} outspeed everyone`;
    return `${scarfMon.name} has Choice Scarf, but ${fastest.pokemon.name} is still faster`;
  }

  const tailwindNames = question.pokemons
    .filter((_, i) => question.tailwind[i])
    .map((p) => p.name);
  if (tailwindNames.length > 0) {
    return `Tailwind doubles speed for ${tailwindNames.join(' & ')}`;
  }

  const weatherAbilities: Record<string, string> = {
    'Swift Swim': 'Rain', 'Chlorophyll': 'Sun', 'Sand Rush': 'Sand', 'Slush Rush': 'Snow',
  };
  if (question.weather) {
    const weatherMon = question.pokemons.find(
      (p) => weatherAbilities[p.ability] === question.weather,
    );
    if (weatherMon) {
      return `${weatherMon.ability} doubles ${weatherMon.name}'s speed in ${question.weather}`;
    }
  }

  const paralyzedNames = question.pokemons
    .filter((_, i) => question.paralysis[i])
    .map((p) => p.name);
  if (paralyzedNames.length > 0) {
    return `Paralysis halves speed for ${paralyzedNames.join(' & ')}`;
  }

  return `${fastest.pokemon.name} outspeeds with the highest effective Speed stat`;
}
