import { Generations } from '@smogon/calc';

const gen = Generations.get(9);

/** Complete mapping of Smogon ability IDs to display names for all abilities */
const ABILITY_DISPLAY_NAMES: Record<string, string> = {};

// Dynamically build the map from @smogon/calc
for (const ability of gen.abilities) {
  // We use lowercase alphanumeric IDs internally (e.g. 'swiftswim')
  const id = ability.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  ABILITY_DISPLAY_NAMES[id] = ability.name;
}

// Add any missing custom abilities here if necessary
ABILITY_DISPLAY_NAMES['hospitality'] = 'Hospitality';

/**
 * Convert a Smogon ability ID to a display name.
 * e.g. "cutecharm" → "Cute Charm", "intimidate" → "Intimidate"
 */
export function getAbilityDisplayName(smogonAbilityId: string): string {
  if (!smogonAbilityId) return '';

  // Check lookup table
  const known = ABILITY_DISPLAY_NAMES[smogonAbilityId];
  if (known) return known;

  // If it already has spaces/proper casing, return as-is
  if (/[A-Z]/.test(smogonAbilityId) && smogonAbilityId.includes(' ')) {
    return smogonAbilityId;
  }

  // Heuristic: capitalize first letter as fallback
  return smogonAbilityId.charAt(0).toUpperCase() + smogonAbilityId.slice(1);
}
