/**
 * Maps Smogon item IDs (concatenated lowercase) to Pokémon Showdown sprite
 * slugs (lowercase, hyphenated). Showdown sprites live at:
 *   https://play.pokemonshowdown.com/sprites/itemicons/{slug}.png
 *
 * Custom Champions mega stones that don't exist in Showdown are mapped
 * to a generic "mega-stone" fallback or left unmapped.
 */

const SMOGON_TO_SHOWDOWN_ITEM: Record<string, string> = {
  // Berries
  sitrusberry: 'sitrus-berry',
  lumberry: 'lum-berry',
  chopleberry: 'chople-berry',
  shucaberry: 'shuca-berry',
  cobaberry: 'coba-berry',
  colburberry: 'colbur-berry',
  habanberry: 'haban-berry',
  occaberry: 'occa-berry',
  babiriberry: 'babiri-berry',
  passhoberry: 'passho-berry',
  roseliberry: 'roseli-berry',
  yacheberry: 'yache-berry',
  chartiberry: 'charti-berry',

  // Competitive items
  choicescarf: 'choice-scarf',
  focussash: 'focus-sash',
  whiteherb: 'white-herb',
  mentalherb: 'mental-herb',
  leftovers: 'leftovers',
  blackglasses: 'black-glasses',
  blackbelt: 'black-belt',
  brightpowder: 'bright-powder',
  kingsrock: 'kings-rock',
  scopelens: 'scope-lens',
  quickclaw: 'quick-claw',
  lightball: 'light-ball',
  poisonbarb: 'poison-barb',
  silkscarf: 'silk-scarf',
  sharpbeak: 'sharp-beak',
  hardstone: 'hard-stone',
  metalcoat: 'metal-coat',
  miracleseed: 'miracle-seed',
  mysticwater: 'mystic-water',
  nevermeltice: 'never-melt-ice',
  spelltag: 'spell-tag',
  charcoal: 'charcoal',
  dragonfang: 'dragon-fang',
  softsand: 'soft-sand',
  magnet: 'magnet',
  fairyfeather: 'fairy-feather',

  // Official Mega Stones (these have Showdown sprites)
  venusaurite: 'venusaurite',
  blastoisinite: 'blastoisinite',
  charizarditex: 'charizardite-x',
  charizarditey: 'charizardite-y',
  alakazite: 'alakazite',
  gengarite: 'gengarite',
  kangaskhanite: 'kangaskhanite',
  pinsirite: 'pinsirite',
  gyaradosite: 'gyaradosite',
  aerodactylite: 'aerodactylite',
  ampharosite: 'ampharosite',
  scizorite: 'scizorite',
  heracronite: 'heracronite',
  houndoominite: 'houndoominite',
  tyranitarite: 'tyranitarite',
  gardevoirite: 'gardevoirite',
  aggronite: 'aggronite',
  medichamite: 'medichamite',
  manectite: 'manectrite',
  banettite: 'banettite',
  absolite: 'absolite',
  garchompite: 'garchompite',
  lucarionite: 'lucarionite',
  abomasite: 'abomasite',
  galladite: 'galladite',
  audinite: 'audinite',
  sharpedonite: 'sharpedonite',
  cameruptite: 'cameruptite',
  altarianite: 'altarianite',
  glalitite: 'glalitite',
  lopunnite: 'lopunnite',
  slowbronite: 'slowbronite',
  steelixite: 'steelixite',
  sablenite: 'sablenite',
  beedrillite: 'beedrillite',
  pidgeotite: 'pidgeotite',

  // Custom Champions Mega Stones — no Showdown sprite; fallback handled separately
  dragoninite: '',
  delphoxite: '',
  meganiumite: '',
  scovillainite: '',
  glimmoranite: '',
  crabominite: '',
  starminite: '',
  golurkite: '',
  drampanite: '',
  skarmorite: '',
  feraligite: '',
  chandelurite: '',
  greninjite: '',
  chesnaughtite: '',
  hawluchanite: '',
  excadrite: '',
  chimechite: '',
  clefablite: '',
  victreebelite: '',
  emboarite: '',
  floettite: '',
  froslassite: '',
  meowsticite: '',

  // One-word items (slug = same as ID)
  nothing: '',
};

/**
 * Get the Showdown item sprite URL for a given Smogon item ID.
 * Returns null if there is no known sprite for this item.
 */
export function getItemSpriteUrl(smogonItemId: string): string | null {
  const slug = SMOGON_TO_SHOWDOWN_ITEM[smogonItemId];

  // Explicitly mapped to empty string = no sprite available
  if (slug === '') return null;

  // Found a valid mapping
  if (slug !== undefined) {
    return `https://play.pokemonshowdown.com/sprites/itemicons/${slug}.png`;
  }

  // Not in the map — try a best-effort conversion:
  // Insert hyphens between known word boundaries using a heuristic.
  // This handles items not yet in the map.
  const guessed = smogonItemId
    .replace(/berry$/, '-berry')
    .replace(/scarf$/, '-scarf')
    .replace(/sash$/, '-sash')
    .replace(/herb$/, '-herb')
    .replace(/ball$/, '-ball')
    .replace(/band$/, '-band')
    .replace(/seed$/, '-seed')
    .replace(/clay$/, '-clay')
    .replace(/vest$/, '-vest')
    .replace(/orb$/, '-orb')
    .replace(/gem$/, '-gem')
    .replace(/^choice/, 'choice-')
    .replace(/^assault/, 'assault-')
    .replace(/^life/, 'life-')
    .replace(/^rocky/, 'rocky-')
    .replace(/^power/, 'power-')
    .replace(/^focus/, 'focus-')
    .replace(/^mental/, 'mental-')
    .replace(/^white/, 'white-')
    .replace(/^expert/, 'expert-')
    .replace(/^weakness/, 'weakness-')
    .replace(/--/g, '-'); // clean up double hyphens

  if (guessed !== smogonItemId) {
    return `https://play.pokemonshowdown.com/sprites/itemicons/${guessed}.png`;
  }

  // Completely unknown item — return the raw ID as last resort
  return `https://play.pokemonshowdown.com/sprites/itemicons/${smogonItemId}.png`;
}

import { Generations } from '@smogon/calc';

const gen = Generations.get(9);

/** Complete mapping of Smogon item IDs to display names for all items */
const SMOGON_TO_DISPLAY: Record<string, string> = {};

// Dynamically build the map from @smogon/calc
for (const item of gen.items) {
  // We use lowercase alphanumeric IDs internally (e.g. 'choicescarf')
  const id = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  SMOGON_TO_DISPLAY[id] = item.name;
}

// Add Custom Champions Mega Stones that aren't in standard @smogon/calc
const CUSTOM_MEGA_STONES = [
  'Dragoninite', 'Delphoxite', 'Meganiumite', 'Scovillainite', 'Glimmoranite',
  'Crabominite', 'Starminite', 'Golurkite', 'Drampanite', 'Skarmorite',
  'Feraligite', 'Chandelurite', 'Greninjite', 'Chesnaughtite', 'Hawluchanite',
  'Excadrite', 'Chimechite', 'Clefablite', 'Victreebelite', 'Emboarite',
  'Floettite', 'Froslassite', 'Meowsticite'
];
for (const stone of CUSTOM_MEGA_STONES) {
  const id = stone.toLowerCase().replace(/[^a-z0-9]/g, '');
  SMOGON_TO_DISPLAY[id] = stone;
}

SMOGON_TO_DISPLAY['nothing'] = '';

export function getItemDisplayName(smogonItemId: string): string {
  if (!smogonItemId || smogonItemId === 'nothing') return '';
  return SMOGON_TO_DISPLAY[smogonItemId] ?? smogonItemId;
}
