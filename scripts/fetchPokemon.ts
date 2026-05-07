import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadMetaData, getMetaPokemonNames } from '../src/data/providers/smogon';
import { fetchPokemonData } from '../src/data/providers/pokeapi';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEST_FILE = path.join(__dirname, '../src/data/pokemonData.json');

async function run() {
  console.log('Loading Smogon meta data...');
  await loadMetaData();
  
  const names = getMetaPokemonNames();
  console.log(`Found ${names.length} VGC Meta Pokémon. Fetching data from PokeAPI...`);
  
  const allData: Record<string, any> = {};
  
  const BATCH_SIZE = 10;
  for (let i = 0; i < names.length; i += BATCH_SIZE) {
    const batch = names.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (name) => {
      try {
        const data = await fetchPokemonData(name);
        if (data) {
          allData[name] = data;
        } else {
          console.warn(`Failed to get data for ${name}`);
        }
      } catch (err: any) {
        console.error(`Error fetching ${name}:`, err.message);
      }
    }));
    
    console.log(`Fetched ${Math.min(i + BATCH_SIZE, names.length)} / ${names.length}`);
  }
  
  // Verify if we missed any
  const missing = names.filter(name => !allData[name]);
  if (missing.length > 0) {
    console.warn(`\nWarning: Missing data for ${missing.length} Pokémon:`);
    console.warn(missing.join(', '));
  }
  
  console.log(`\nWriting ${Object.keys(allData).length} Pokémon to ${DEST_FILE}`);
  fs.writeFileSync(DEST_FILE, JSON.stringify(allData, null, 2), 'utf-8');
  console.log('Done!');
}

run().catch(console.error);
