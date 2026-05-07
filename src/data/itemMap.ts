/**
 * Maps Smogon item IDs (lowercase, no spaces) to display names and PokeAPI sprite slugs.
 *
 * Sprite URL format:
 *   https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/{slug}.png
 *
 * Items that are custom to Champions format (mega stones for custom megas)
 * map to a generic "mega-stone" slug — they won't have unique sprites but
 * we provide a reasonable fallback.
 */

interface ItemInfo {
  display: string;
  slug: string;
}

const ITEM_MAP: Record<string, ItemInfo> = {
  // Berries
  sitrusberry:   { display: 'Sitrus Berry',    slug: 'sitrus-berry' },
  lumberry:      { display: 'Lum Berry',       slug: 'lum-berry' },
  chopleberry:   { display: 'Chople Berry',    slug: 'chople-berry' },
  shucaberry:    { display: 'Shuca Berry',     slug: 'shuca-berry' },
  cobaberry:     { display: 'Coba Berry',      slug: 'coba-berry' },
  colburberry:   { display: 'Colbur Berry',    slug: 'colbur-berry' },
  babiriberry:   { display: 'Babiri Berry',    slug: 'babiri-berry' },
  habanberry:    { display: 'Haban Berry',     slug: 'haban-berry' },
  roseliberry:   { display: 'Roseli Berry',    slug: 'roseli-berry' },
  occaberry:     { display: 'Occa Berry',      slug: 'occa-berry' },
  yacheberry:    { display: 'Yache Berry',     slug: 'yache-berry' },
  chartiberry:   { display: 'Charti Berry',    slug: 'charti-berry' },
  passhoberry:   { display: 'Passho Berry',    slug: 'passho-berry' },

  // Hold items
  focussash:     { display: 'Focus Sash',      slug: 'focus-sash' },
  choicescarf:   { display: 'Choice Scarf',    slug: 'choice-scarf' },
  leftovers:     { display: 'Leftovers',       slug: 'leftovers' },
  mentalherb:    { display: 'Mental Herb',     slug: 'mental-herb' },
  whiteherb:     { display: 'White Herb',      slug: 'white-herb' },
  blackglasses:  { display: 'Black Glasses',   slug: 'black-glasses' },
  blackbelt:     { display: 'Black Belt',      slug: 'black-belt' },
  spelltag:      { display: 'Spell Tag',       slug: 'spell-tag' },
  scopelens:     { display: 'Scope Lens',      slug: 'scope-lens' },
  brightpowder:  { display: 'Bright Powder',   slug: 'bright-powder' },
  quickclaw:     { display: 'Quick Claw',      slug: 'quick-claw' },
  kingsrock:     { display: "King's Rock",     slug: 'kings-rock' },
  lightball:     { display: 'Light Ball',      slug: 'light-ball' },
  silkscarf:     { display: 'Silk Scarf',      slug: 'silk-scarf' },
  hardstone:     { display: 'Hard Stone',      slug: 'hard-stone' },
  poisonbarb:    { display: 'Poison Barb',     slug: 'poison-barb' },
  sharpbeak:     { display: 'Sharp Beak',      slug: 'sharp-beak' },
  metalcoat:     { display: 'Metal Coat',      slug: 'metal-coat' },
  charcoal:      { display: 'Charcoal',        slug: 'charcoal' },
  mysticwater:   { display: 'Mystic Water',    slug: 'mystic-water' },
  miracleseed:   { display: 'Miracle Seed',    slug: 'miracle-seed' },
  magnet:        { display: 'Magnet',          slug: 'magnet' },
  nevermeltice:  { display: 'Never-Melt Ice',  slug: 'never-melt-ice' },
  softsand:      { display: 'Soft Sand',       slug: 'soft-sand' },
  dragonfang:    { display: 'Dragon Fang',     slug: 'dragon-fang' },
  silverpowder:  { display: 'Silver Powder',   slug: 'silver-powder' },
  fairyfeather:  { display: 'Fairy Feather',   slug: 'fairy-feather' },

  // Standard Mega Stones (PokeAPI has sprites for these)
  venusaurite:   { display: 'Venusaurite',     slug: 'venusaurite' },
  charizarditex: { display: 'Charizardite X',  slug: 'charizardite-x' },
  charizarditey: { display: 'Charizardite Y',  slug: 'charizardite-y' },
  blastoisinite: { display: 'Blastoisinite',   slug: 'blastoisinite' },
  alakazite:     { display: 'Alakazite',       slug: 'alakazite' },
  gengarite:     { display: 'Gengarite',       slug: 'gengarite' },
  kangaskhanite: { display: 'Kangaskhanite',   slug: 'kangaskhanite' },
  pinsirite:     { display: 'Pinsirite',       slug: 'pinsirite' },
  gyaradosite:   { display: 'Gyaradosite',     slug: 'gyaradosite' },
  aerodactylite: { display: 'Aerodactylite',   slug: 'aerodactylite' },
  ampharosite:   { display: 'Ampharosite',     slug: 'ampharosite' },
  scizorite:     { display: 'Scizorite',       slug: 'scizorite' },
  heracronite:   { display: 'Heracronite',     slug: 'heracronite' },
  houndoominite: { display: 'Houndoominite',   slug: 'houndoominite' },
  tyranitarite:  { display: 'Tyranitarite',    slug: 'tyranitarite' },
  gardevoirite:  { display: 'Gardevoirite',    slug: 'gardevoirite' },
  aggronite:     { display: 'Aggronite',       slug: 'aggronite' },
  medichamite:   { display: 'Medichamite',     slug: 'medichamite' },
  manectite:     { display: 'Manectite',       slug: 'manectite' },
  banettite:     { display: 'Banettite',       slug: 'banettite' },
  absolite:      { display: 'Absolite',        slug: 'absolite' },
  garchompite:   { display: 'Garchompite',     slug: 'garchompite' },
  lucarionite:   { display: 'Lucarionite',     slug: 'lucarionite' },
  abomasite:     { display: 'Abomasite',       slug: 'abomasite' },
  galladite:     { display: 'Galladite',       slug: 'galladite' },
  audinite:      { display: 'Audinite',        slug: 'audinite' },
  sharpedonite:  { display: 'Sharpedonite',    slug: 'sharpedonite' },
  cameruptite:   { display: 'Cameruptite',     slug: 'cameruptite' },
  altarianite:   { display: 'Altarianite',     slug: 'altarianite' },
  glalitite:     { display: 'Glalitite',       slug: 'glalitite' },
  lopunnite:     { display: 'Lopunnite',       slug: 'lopunnite' },
  slowbronite:   { display: 'Slowbronite',     slug: 'slowbronite' },
  steelixite:    { display: 'Steelixite',      slug: 'steelixite' },
  sablenite:     { display: 'Sablenite',       slug: 'sablenite' },
  beedrillite:   { display: 'Beedrillite',     slug: 'beedrillite' },
  pidgeotite:    { display: 'Pidgeotite',      slug: 'pidgeotite' },

  // Custom Champions Mega Stones — no PokeAPI sprite, use generic key-stone fallback
  chandelurite:  { display: 'Chandelurite',    slug: '' },
  chesnaughtite: { display: 'Chesnaughtite',   slug: '' },
  chimechite:    { display: 'Chimechite',      slug: '' },
  clefablite:    { display: 'Clefablite',      slug: '' },
  crabominite:   { display: 'Crabominite',     slug: '' },
  delphoxite:    { display: 'Delphoxite',      slug: '' },
  dragoninite:   { display: 'Dragoninite',     slug: '' },
  drampanite:    { display: 'Drampanite',      slug: '' },
  emboarite:     { display: 'Emboarite',       slug: '' },
  excadrite:     { display: 'Excadrite',       slug: '' },
  feraligite:    { display: 'Feraligite',      slug: '' },
  floettite:     { display: 'Floettite',       slug: '' },
  froslassite:   { display: 'Froslassite',     slug: '' },
  glimmoranite:  { display: 'Glimmoranite',    slug: '' },
  golurkite:     { display: 'Golurkite',       slug: '' },
  greninjite:    { display: 'Greninjite',      slug: '' },
  hawluchanite:  { display: 'Hawluchanite',    slug: '' },
  meganiumite:   { display: 'Meganiumite',     slug: '' },
  meowsticite:   { display: 'Meowsticite',     slug: '' },
  scovillainite: { display: 'Scovillainite',   slug: '' },
  skarmorite:    { display: 'Skarmorite',      slug: '' },
  starminite:    { display: 'Starminite',      slug: '' },
  victreebelite: { display: 'Victreebelite',   slug: '' },

  // Misc
  nothing:       { display: 'None',            slug: '' },
};

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items';

/**
 * Get display name for a Smogon item ID.
 * Falls back to a title-cased version of the raw ID if not mapped.
 */
export function getItemDisplayName(smogonId: string): string {
  return ITEM_MAP[smogonId]?.display ?? smogonId;
}

/**
 * Get the sprite URL for a Smogon item ID.
 * Returns empty string for items with no available sprite (custom mega stones, "nothing").
 */
export function getItemSpriteUrl(smogonId: string): string {
  const info = ITEM_MAP[smogonId];
  if (!info || !info.slug) return '';
  return `${SPRITE_BASE}/${info.slug}.png`;
}
