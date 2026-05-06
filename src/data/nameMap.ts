/**
 * Maps Smogon display names to PokeAPI-compatible lowercase-hyphenated names.
 * Handles edge cases where the conversion isn't a simple lowercase+hyphen replacement.
 */

const SPECIAL_NAMES: Record<string, string> = {
  // Punctuation / formatting
  "Mr. Mime": "mr-mime",
  "Mr. Rime": "mr-rime",
  "Mime Jr.": "mime-jr",
  "Farfetch'd": "farfetchd",
  "Sirfetch'd": "sirfetchd",
  "Flabébé": "flabebe",
  "Type: Null": "type-null",
  "Nidoran-F": "nidoran-f",
  "Nidoran-M": "nidoran-m",
  "Porygon-Z": "porygon-z",
  "Porygon2": "porygon2",
  "Ho-Oh": "ho-oh",
  "Jangmo-o": "jangmo-o",
  "Hakamo-o": "hakamo-o",
  "Kommo-o": "kommo-o",
  "Wo-Chien": "wo-chien",
  "Chien-Pao": "chien-pao",
  "Ting-Lu": "ting-lu",
  "Chi-Yu": "chi-yu",

  // Mega forms — Smogon uses title-case suffix, PokeAPI uses lowercase
  // These follow the pattern already, but listed for documentation
};

/**
 * Convert a Smogon Pokémon name to the PokeAPI-compatible slug.
 * 
 * General rule: lowercase, replace spaces with hyphens.
 * Edge cases handled via the SPECIAL_NAMES map.
 */
export function toPokeApiName(smogonName: string): string {
  if (SPECIAL_NAMES[smogonName]) {
    return SPECIAL_NAMES[smogonName];
  }

  return smogonName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[.']+/g, '')
    .replace(/:/g, '');
}

/**
 * Get the Mega Stone item name for a given Mega Pokémon name.
 * Used when constructing @smogon/calc Pokemon objects.
 */
export function getMegaStone(pokemonName: string): string | undefined {
  const megaStones: Record<string, string> = {
    'Venusaur-Mega': 'Venusaurite',
    'Charizard-Mega-X': 'Charizardite X',
    'Charizard-Mega-Y': 'Charizardite Y',
    'Blastoise-Mega': 'Blastoisinite',
    'Alakazam-Mega': 'Alakazite',
    'Gengar-Mega': 'Gengarite',
    'Kangaskhan-Mega': 'Kangaskhanite',
    'Pinsir-Mega': 'Pinsirite',
    'Gyarados-Mega': 'Gyaradosite',
    'Aerodactyl-Mega': 'Aerodactylite',
    'Mewtwo-Mega-X': 'Mewtwonite X',
    'Mewtwo-Mega-Y': 'Mewtwonite Y',
    'Ampharos-Mega': 'Ampharosite',
    'Scizor-Mega': 'Scizorite',
    'Heracross-Mega': 'Heracronite',
    'Houndoom-Mega': 'Houndoominite',
    'Tyranitar-Mega': 'Tyranitarite',
    'Blaziken-Mega': 'Blazikenite',
    'Gardevoir-Mega': 'Gardevoirite',
    'Mawile-Mega': 'Mawilite',
    'Aggron-Mega': 'Aggronite',
    'Medicham-Mega': 'Medichamite',
    'Manectric-Mega': 'Manectite',
    'Banette-Mega': 'Banettite',
    'Absol-Mega': 'Absolite',
    'Garchomp-Mega': 'Garchompite',
    'Lucario-Mega': 'Lucarionite',
    'Abomasnow-Mega': 'Abomasite',
    'Gallade-Mega': 'Galladite',
    'Audino-Mega': 'Audinite',
    'Sharpedo-Mega': 'Sharpedonite',
    'Camerupt-Mega': 'Cameruptite',
    'Altaria-Mega': 'Altarianite',
    'Glalie-Mega': 'Glalitite',
    'Salamence-Mega': 'Salamencite',
    'Metagross-Mega': 'Metagrossite',
    'Latias-Mega': 'Latiasite',
    'Latios-Mega': 'Latiosite',
    'Rayquaza-Mega': 'Rayquazite',
    'Lopunny-Mega': 'Lopunnite',
    'Slowbro-Mega': 'Slowbronite',
    'Steelix-Mega': 'Steelixite',
    'Sceptile-Mega': 'Sceptilite',
    'Swampert-Mega': 'Swampertite',
    'Sableye-Mega': 'Sablenite',
    'Beedrill-Mega': 'Beedrillite',
    'Pidgeot-Mega': 'Pidgeotite',
    'Diancie-Mega': 'Diancite',
  };
  return megaStones[pokemonName];
}

export function isMegaEvolution(name: string): boolean {
  return name.includes('-Mega');
}
