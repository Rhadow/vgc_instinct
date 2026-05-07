/**
 * Converts Smogon move IDs (e.g. "icebeam", "closecombat") to display names
 * using @smogon/calc's Move data as the source of truth.
 */
import { Generations, Move } from '@smogon/calc';

const gen = Generations.get(9);

/** Cache: smogon ID → display name */
const moveNameCache = new Map<string, string>();

/**
 * Get the proper display name for a Smogon move ID.
 * e.g. "icebeam" → "Ice Beam", "closecombat" → "Close Combat"
 *
 * Uses @smogon/calc's Move constructor which accepts both IDs and names.
 */
export function getMoveDisplayName(smogonMoveId: string): string {
  // If it already looks formatted (has spaces or uppercase), return as-is
  if (/[A-Z]/.test(smogonMoveId) && smogonMoveId.includes(' ')) {
    return smogonMoveId;
  }

  const cached = moveNameCache.get(smogonMoveId);
  if (cached) return cached;

  try {
    const move = new Move(gen, smogonMoveId);
    const name = move.name;
    moveNameCache.set(smogonMoveId, name);
    return name;
  } catch {
    // Fallback: insert spaces before uppercase runs in camelCase-style IDs
    const fallback = smogonMoveId
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, (c) => c.toUpperCase());
    moveNameCache.set(smogonMoveId, fallback);
    return fallback;
  }
}
