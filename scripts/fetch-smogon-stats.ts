/**
 * Build-time script to fetch Smogon stats and extract a trimmed dataset.
 * 
 * Usage: npx tsx scripts/fetch-smogon-stats.ts
 * 
 * Fetches the Champions Reg M-A chaos JSON from Smogon, extracts the top
 * spreads/moves/items/abilities per Pokémon, and writes the result to
 * src/data/generated/metaData.json (~300-400KB instead of ~15MB).
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATS_URL = 'https://www.smogon.com/stats/2026-04/chaos/gen9championsvgc2026regma-1630.json';
const OUTPUT_PATH = path.resolve(__dirname, '..', 'src', 'data', 'generated', 'metaData.json');

interface EVSpread {
  nature: string;
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

interface PokemonMetaData {
  name: string;
  spreads: EVSpread[];
  moves: string[];
  items: string[];
  abilities: string[];
}

function getTopN(obj: Record<string, number>, n: number): string[] {
  return Object.entries(obj)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([key]) => key);
}

function parseSpread(spreadStr: string): EVSpread {
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

async function main() {
  console.log(`Fetching stats from: ${STATS_URL}`);

  const res = await fetch(STATS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }

  const raw = await res.json();
  const result: Record<string, PokemonMetaData> = {};

  for (const [name, entry] of Object.entries<any>(raw.data)) {
    const spreads = getTopN(entry.Spreads || {}, 3).map(parseSpread);
    const moves = getTopN(entry.Moves || {}, 5);
    const items = getTopN(entry.Items || {}, 3);
    const abilities = getTopN(entry.Abilities || {}, 2);

    if (spreads.length > 0 && moves.length > 0) {
      result[name] = { name, spreads, moves, items, abilities };
    }
  }

  // Ensure output directory exists
  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));

  const stats = fs.statSync(OUTPUT_PATH);
  const pokemonCount = Object.keys(result).length;
  console.log(`✅ Wrote ${pokemonCount} Pokémon to ${OUTPUT_PATH}`);
  console.log(`   File size: ${(stats.size / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
