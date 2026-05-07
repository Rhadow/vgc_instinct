import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Generations } from '@smogon/calc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEST_FILE = path.join(__dirname, '../src/data/abilityDescriptions.ts');

const gen = Generations.get(9);

// Map of canonical ID to Display Name from @smogon/calc
const smogonMap = new Map();
for (const ability of gen.abilities) {
  const id = ability.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  smogonMap.set(id, ability.name);
}

// Special case known aliases or custom abilities
smogonMap.set('hospitality', 'Hospitality');

async function run() {
  console.log('Fetching all abilities from PokeAPI...');
  const res = await fetch('https://pokeapi.co/api/v2/ability?limit=500');
  const data = await res.json();
  const abilityUrls = data.results;

  console.log(`Found ${abilityUrls.length} abilities. Fetching details...`);
  
  const descriptions = {};
  
  // Fetch in batches to avoid overwhelming the API
  const BATCH_SIZE = 50;
  for (let i = 0; i < abilityUrls.length; i += BATCH_SIZE) {
    const batch = abilityUrls.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (entry) => {
      try {
        const detailRes = await fetch(entry.url);
        const detail = await detailRes.json();
        
        // Find English flavor text
        const englishEntry = detail.flavor_text_entries.find(e => e.language.name === 'en');
        if (!englishEntry) return;
        
        const cleanText = englishEntry.flavor_text.replace(/[\n\f]/g, ' ').replace(/\s+/g, ' ').trim();
        
        // Map PokeAPI name (e.g. 'cute-charm') to Smogon ID ('cutecharm')
        const pokeapiId = detail.name.replace(/-/g, '');
        const displayName = smogonMap.get(pokeapiId);
        
        if (displayName) {
          descriptions[displayName] = cleanText;
        } else {
          // If we can't find a display name, fallback to title casing the PokeAPI name
          const fallbackName = detail.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          descriptions[fallbackName] = cleanText;
        }
      } catch (err) {
        console.error(`Failed to fetch ${entry.name}:`, err.message);
      }
    }));
    
    console.log(`Fetched ${Math.min(i + BATCH_SIZE, abilityUrls.length)} / ${abilityUrls.length}`);
  }

  // Add override for specific abilities if needed, or rely on PokeAPI
  // Note: some abilities might have weird characters. Replacing single quotes is necessary.

  // Generate the file content
  const sortedKeys = Object.keys(descriptions).sort();
  
  let content = `/**
 * Competitive VGC ability descriptions.
 * Auto-generated from PokeAPI. Do not edit manually.
 * Run \`node scripts/fetchAbilities.mjs\` to update.
 */
export const ABILITY_DESCRIPTIONS: Record<string, string> = {
`;

  for (const key of sortedKeys) {
    const safeKey = key.replace(/'/g, "\\'");
    const safeVal = descriptions[key].replace(/'/g, "\\'");
    content += `  '${safeKey}': '${safeVal}',\n`;
  }
  
  content += `};

export function getAbilityDescription(ability: string): string | undefined {
  return ABILITY_DESCRIPTIONS[ability];
}
`;

  fs.writeFileSync(DEST_FILE, content, 'utf-8');
  console.log(`\\nSuccessfully wrote ${sortedKeys.length} abilities to ${DEST_FILE}`);
}

run().catch(console.error);
