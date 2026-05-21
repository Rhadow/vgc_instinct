import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEST_FILE = path.join(__dirname, '../src/data/casualPokemonData.json');

// Map raw PokeAPI name to a beautiful display name
function formatPokemonName(rawName: string): string {
  const SPECIAL_MAP: Record<string, string> = {
    'mr-mime': 'Mr. Mime',
    'mr-rime': 'Mr. Rime',
    'mime-jr': 'Mime Jr.',
    'type-null': 'Type: Null',
    'ho-oh': 'Ho-Oh',
    'porygon-z': 'Porygon-Z',
    'porygon2': 'Porygon2',
    'jangmo-o': 'Jangmo-o',
    'hakamo-o': 'Hakamo-o',
    'kommo-o': 'Kommo-o',
    'tapu-koko': 'Tapu Koko',
    'tapu-lele': 'Tapu Lele',
    'tapu-bulu': 'Tapu Bulu',
    'tapu-fini': 'Tapu Fini',
    'wo-chien': 'Wo-Chien',
    'chien-pao': 'Chien-Pao',
    'ting-lu': 'Ting-Lu',
    'chi-yu': 'Chi-Yu',
    'great-tusk': 'Great Tusk',
    'scream-tail': 'Scream Tail',
    'brute-bonnet': 'Brute Bonnet',
    'flutter-mane': 'Flutter Mane',
    'slither-wing': 'Slither Wing',
    'sandy-shocks': 'Sandy Shocks',
    'iron-treads': 'Iron Treads',
    'iron-bundle': 'Iron Bundle',
    'iron-hands': 'Iron Hands',
    'iron-jugulis': 'Iron Jugulis',
    'iron-moth': 'Iron Moth',
    'iron-thorns': 'Iron Thorns',
    'roaring-moon': 'Roaring Moon',
    'iron-valiant': 'Iron Valiant',
    'walking-wake': 'Walking Wake',
    'iron-leaves': 'Iron Leaves',
    'dipplin': 'Dipplin',
    'archaludon': 'Archaludon',
    'hydrapple': 'Hydrapple',
    'gouging-fire': 'Gouging Fire',
    'raging-bolt': 'Raging Bolt',
    'iron-boulder': 'Iron Boulder',
    'iron-crown': 'Iron Crown',
    'terapagos': 'Terapagos',
    'pecharunt': 'Pecharunt',
  };

  if (SPECIAL_MAP[rawName.toLowerCase()]) {
    return SPECIAL_MAP[rawName.toLowerCase()];
  }

  // Capitalize all words separated by hyphen
  return rawName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function run() {
  console.log('Fetching Pokemon species list from PokeAPI (Generations 1-9)...');
  
  // IDs 1 to 1025 correspond to Bulbasaur through Pecharunt
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
  if (!res.ok) {
    throw new Error(`Failed to fetch Pokémon list: ${res.statusText}`);
  }
  
  const data = (await res.json()) as { results: Array<{ name: string; url: string }> };
  const allPokemon = data.results;
  console.log(`Found ${allPokemon.length} Pokémon. Starting details fetch...`);

  const results: Record<string, any> = {};
  const BATCH_SIZE = 50;

  for (let i = 0; i < allPokemon.length; i += BATCH_SIZE) {
    const batch = allPokemon.slice(i, i + BATCH_SIZE);
    
    await Promise.all(
      batch.map(async (p, idx) => {
        const id = i + idx + 1; // 1-indexed National Dex ID
        try {
          const detailRes = await fetch(p.url);
          if (!detailRes.ok) {
            console.error(`Failed to fetch details for ${p.name}`);
            return;
          }
          
          const detail = (await detailRes.json()) as any;
          
          // Form types
          const types = detail.types.map(
            (t: any) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)
          );
          
          // Form abilities
          const abilities = detail.abilities.map((a: any) =>
            a.ability.name
              .split('-')
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')
          );
          
          // Form base stats
          const baseStats: Record<string, number> = {
            hp: 0,
            atk: 0,
            def: 0,
            spa: 0,
            spd: 0,
            spe: 0,
          };
          
          detail.stats.forEach((s: any) => {
            const name = s.stat.name;
            if (name === 'hp') baseStats.hp = s.base_stat;
            else if (name === 'attack') baseStats.atk = s.base_stat;
            else if (name === 'defense') baseStats.def = s.base_stat;
            else if (name === 'special-attack') baseStats.spa = s.base_stat;
            else if (name === 'special-defense') baseStats.spd = s.base_stat;
            else if (name === 'speed') baseStats.spe = s.base_stat;
          });

          const displayName = formatPokemonName(p.name);
          const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

          results[displayName] = {
            name: displayName,
            baseStats,
            types,
            abilities,
            spriteUrl,
          };
        } catch (err: any) {
          console.error(`Error processing ${p.name} (ID: ${id}):`, err.message);
        }
      })
    );

    console.log(`Progress: fetched ${Math.min(i + BATCH_SIZE, allPokemon.length)} / ${allPokemon.length}`);
  }

  console.log(`Writing ${Object.keys(results).length} Pokémon to ${DEST_FILE}...`);
  fs.writeFileSync(DEST_FILE, JSON.stringify(results, null, 2), 'utf-8');
  console.log('Successfully generated casual mode database!');
}

run().catch((err) => {
  console.error('Fetch execution failed:', err);
  process.exit(1);
});
