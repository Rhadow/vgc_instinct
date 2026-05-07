/**
 * Pokémon type → color mapping for type badges.
 * Uses canonical Pokémon type colors.
 */
export const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Normal:   { bg: 'rgba(168,167,122,0.2)', text: '#A8A77A', border: 'rgba(168,167,122,0.4)' },
  Fire:     { bg: 'rgba(238,129,48,0.2)',  text: '#EE8130', border: 'rgba(238,129,48,0.4)' },
  Water:    { bg: 'rgba(99,144,240,0.2)',  text: '#6390F0', border: 'rgba(99,144,240,0.4)' },
  Electric: { bg: 'rgba(247,208,44,0.2)',  text: '#F7D02C', border: 'rgba(247,208,44,0.4)' },
  Grass:    { bg: 'rgba(122,199,76,0.2)',  text: '#7AC74C', border: 'rgba(122,199,76,0.4)' },
  Ice:      { bg: 'rgba(150,217,214,0.2)', text: '#96D9D6', border: 'rgba(150,217,214,0.4)' },
  Fighting: { bg: 'rgba(194,46,40,0.2)',   text: '#C22E28', border: 'rgba(194,46,40,0.4)' },
  Poison:   { bg: 'rgba(163,62,161,0.2)',  text: '#A33EA1', border: 'rgba(163,62,161,0.4)' },
  Ground:   { bg: 'rgba(226,191,101,0.2)', text: '#E2BF65', border: 'rgba(226,191,101,0.4)' },
  Flying:   { bg: 'rgba(169,143,243,0.2)', text: '#A98FF3', border: 'rgba(169,143,243,0.4)' },
  Psychic:  { bg: 'rgba(249,85,135,0.2)',  text: '#F95587', border: 'rgba(249,85,135,0.4)' },
  Bug:      { bg: 'rgba(166,185,26,0.2)',  text: '#A6B91A', border: 'rgba(166,185,26,0.4)' },
  Rock:     { bg: 'rgba(182,161,54,0.2)',  text: '#B6A136', border: 'rgba(182,161,54,0.4)' },
  Ghost:    { bg: 'rgba(115,87,151,0.2)',  text: '#735797', border: 'rgba(115,87,151,0.4)' },
  Dragon:   { bg: 'rgba(111,53,252,0.2)',  text: '#6F35FC', border: 'rgba(111,53,252,0.4)' },
  Dark:     { bg: 'rgba(112,87,70,0.2)',   text: '#705746', border: 'rgba(112,87,70,0.4)' },
  Steel:    { bg: 'rgba(183,183,206,0.2)', text: '#B7B7CE', border: 'rgba(183,183,206,0.4)' },
  Fairy:    { bg: 'rgba(214,133,173,0.2)', text: '#D685AD', border: 'rgba(214,133,173,0.4)' },
};

/** Default colors for unknown types */
const DEFAULT_TYPE_COLOR = { bg: 'rgba(100,116,139,0.2)', text: '#94a3b8', border: 'rgba(100,116,139,0.4)' };

export function getTypeColor(typeName: string): { bg: string; text: string; border: string } {
  // Normalize: "fire" → "Fire"
  const normalized = typeName.charAt(0).toUpperCase() + typeName.slice(1).toLowerCase();
  return TYPE_COLORS[normalized] ?? DEFAULT_TYPE_COLOR;
}
