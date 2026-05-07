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

  // Default forms that PokeAPI needs specific form names
  "Lycanroc": "lycanroc-midday",
  "Meowstic": "meowstic-male",
  "Meowstic-F": "meowstic-female",
  "Morpeko": "morpeko-full-belly",
  "Gourgeist": "gourgeist-average",
  "Pumpkaboo": "pumpkaboo-average",
  "Basculin": "basculin-red-striped",
  "Basculegion": "basculegion-male",
  "Basculegion-F": "basculegion-female",
  "Indeedee": "indeedee-male",
  "Indeedee-F": "indeedee-female",
  "Oricorio": "oricorio-baile",
  "Wormadam": "wormadam-plant",
  "Toxtricity": "toxtricity-amped",
  "Urshifu": "urshifu-single-strike",
  "Urshifu-Rapid-Strike": "urshifu-rapid-strike",
  "Sinistcha": "sinistcha",
  "Polteageist": "polteageist",
  "Sinistea": "sinistea",
  "Maushold": "maushold-family-of-four",
  "Palafin": "palafin-zero",
  "Mimikyu": "mimikyu-disguised",

  // Alternate forms
  "Lycanroc-Dusk": "lycanroc-dusk",
  "Lycanroc-Midnight": "lycanroc-midnight",
  "Gourgeist-Super": "gourgeist-super",
  "Goodra-Hisui": "goodra-hisui",
  "Avalugg-Hisui": "avalugg-hisui",
  "Floette-Eternal": "floette-eternal",
  
  // Paldean Tauros breeds
  "Tauros-Paldea-Combat": "tauros-paldea-combat-breed",
  "Tauros-Paldea-Blaze": "tauros-paldea-blaze-breed",
  "Tauros-Paldea-Aqua": "tauros-paldea-aqua-breed",

  // Hisui forms
  "Arcanine-Hisui": "arcanine-hisui",
  "Typhlosion-Hisui": "typhlosion-hisui",
  "Zoroark-Hisui": "zoroark-hisui",
  "Lilligant-Hisui": "lilligant-hisui",
  "Samurott-Hisui": "samurott-hisui",
  "Decidueye-Hisui": "decidueye-hisui",

  // Alola forms
  "Ninetales-Alola": "ninetales-alola",
  "Raichu-Alola": "raichu-alola",
  "Marowak-Alola": "marowak-alola",
  "Muk-Alola": "muk-alola",
  "Exeggutor-Alola": "exeggutor-alola",

  // Galar forms
  "Slowking-Galar": "slowking-galar",
  "Slowbro-Galar": "slowbro-galar",
  "Darmanitan-Galar": "darmanitan-galar-standard",
  "Moltres-Galar": "moltres-galar",
  "Zapdos-Galar": "zapdos-galar",
  "Articuno-Galar": "articuno-galar",

  // Rotom forms
  "Rotom-Wash": "rotom-wash",
  "Rotom-Heat": "rotom-heat",
  "Rotom-Mow": "rotom-mow",
  "Rotom-Frost": "rotom-frost",
  "Rotom-Fan": "rotom-fan",

  // Ogerpon forms
  "Ogerpon-Wellspring": "ogerpon-wellspring-mask",
  "Ogerpon-Hearthflame": "ogerpon-hearthflame-mask",
  "Ogerpon-Cornerstone": "ogerpon-cornerstone-mask",

  "Aegislash": "aegislash-shield",

  // Custom Champions Mega Evolutions — not in PokeAPI, fall back to base form
  "Floette-Mega": "floette",
  "Froslass-Mega": "froslass",
  "Delphox-Mega": "delphox",
  "Meganium-Mega": "meganium",
  "Dragonite-Mega": "dragonite",
  "Scovillain-Mega": "scovillain",
  "Glimmora-Mega": "glimmora",
  "Crabominable-Mega": "crabominable",
  "Starmie-Mega": "starmie",
  "Golurk-Mega": "golurk",
  "Drampa-Mega": "drampa",
  "Skarmory-Mega": "skarmory",
  "Feraligatr-Mega": "feraligatr",
  "Chandelure-Mega": "chandelure",
  "Greninja-Mega": "greninja",
  "Chesnaught-Mega": "chesnaught",
  "Hawlucha-Mega": "hawlucha",
  "Excadrill-Mega": "excadrill",
  "Chimecho-Mega": "chimecho",
  "Clefable-Mega": "clefable",
  "Victreebel-Mega": "victreebel",
  "Emboar-Mega": "emboar",

  // Meowstic Mega forms — Champions-only
  "Meowstic-M-Mega": "meowstic-male",
  "Meowstic-F-Mega": "meowstic-female",
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

/**
 * Extract the base form name from a Smogon name.
 * e.g. "Dragonite-Mega" → "Dragonite", "Charizard-Mega-Y" → "Charizard"
 * Returns null if the name is already a base form.
 */
export function getBaseFormName(smogonName: string): string | null {
  // Mega forms: strip -Mega, -Mega-X, -Mega-Y
  if (smogonName.includes('-Mega')) {
    return smogonName.replace(/-Mega(-[XY])?$/, '');
  }
  // Eternal Floette
  if (smogonName.endsWith('-Eternal')) {
    return smogonName.replace(/-Eternal$/, '');
  }
  return null;
}
