import type { PokemonMetaData } from './types';

/**
 * Fallback data for when the Smogon stats JSON fails to load.
 * Contains 20 popular Champions format Pokémon with representative spreads.
 */
export const FALLBACK_META: Record<string, PokemonMetaData> = {
  'Incineroar': {
    name: 'Incineroar',
    spreads: [
      { nature: 'Careful', hp: 252, atk: 0, def: 4, spa: 0, spd: 252, spe: 0 },
      { nature: 'Adamant', hp: 252, atk: 252, def: 0, spa: 0, spd: 4, spe: 0 },
      { nature: 'Impish', hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 },
    ],
    moves: ['Fake Out', 'Flare Blitz', 'Knock Off', 'Parting Shot', 'U-turn'],
    items: ['Safety Goggles', 'Sitrus Berry', 'Assault Vest'],
    abilities: ['Intimidate'],
  },
  'Flutter Mane': {
    name: 'Flutter Mane',
    spreads: [
      { nature: 'Timid', hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
      { nature: 'Modest', hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
    ],
    moves: ['Shadow Ball', 'Moonblast', 'Dazzling Gleam', 'Protect', 'Icy Wind'],
    items: ['Choice Specs', 'Booster Energy', 'Focus Sash'],
    abilities: ['Protosynthesis'],
  },
  'Landorus-Therian': {
    name: 'Landorus-Therian',
    spreads: [
      { nature: 'Adamant', hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 },
      { nature: 'Jolly', hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 },
    ],
    moves: ['Earthquake', 'U-turn', 'Rock Slide', 'Protect', 'Fly'],
    items: ['Choice Scarf', 'Assault Vest', 'Life Orb'],
    abilities: ['Intimidate'],
  },
  'Rillaboom': {
    name: 'Rillaboom',
    spreads: [
      { nature: 'Adamant', hp: 252, atk: 252, def: 4, spa: 0, spd: 0, spe: 0 },
      { nature: 'Brave', hp: 252, atk: 252, def: 0, spa: 0, spd: 4, spe: 0 },
    ],
    moves: ['Grassy Glide', 'Wood Hammer', 'Fake Out', 'U-turn', 'Protect'],
    items: ['Assault Vest', 'Miracle Seed', 'Choice Band'],
    abilities: ['Grassy Surge'],
  },
  'Urshifu-Rapid-Strike': {
    name: 'Urshifu-Rapid-Strike',
    spreads: [
      { nature: 'Jolly', hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 },
      { nature: 'Adamant', hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 },
    ],
    moves: ['Surging Strikes', 'Close Combat', 'Aqua Jet', 'Protect', 'U-turn'],
    items: ['Focus Sash', 'Mystic Water', 'Choice Band'],
    abilities: ['Unseen Fist'],
  },
  'Tornadus': {
    name: 'Tornadus',
    spreads: [
      { nature: 'Timid', hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
    ],
    moves: ['Bleakwind Storm', 'Tailwind', 'Rain Dance', 'Protect', 'Taunt'],
    items: ['Focus Sash', 'Covert Cloak', 'Safety Goggles'],
    abilities: ['Prankster'],
  },
  'Amoonguss': {
    name: 'Amoonguss',
    spreads: [
      { nature: 'Calm', hp: 252, atk: 0, def: 4, spa: 0, spd: 252, spe: 0 },
      { nature: 'Sassy', hp: 252, atk: 0, def: 4, spa: 0, spd: 252, spe: 0 },
    ],
    moves: ['Spore', 'Rage Powder', 'Pollen Puff', 'Protect', 'Clear Smog'],
    items: ['Sitrus Berry', 'Coba Berry', 'Rocky Helmet'],
    abilities: ['Regenerator'],
  },
  'Iron Hands': {
    name: 'Iron Hands',
    spreads: [
      { nature: 'Adamant', hp: 252, atk: 252, def: 0, spa: 0, spd: 4, spe: 0 },
    ],
    moves: ['Drain Punch', 'Wild Charge', 'Fake Out', 'Ice Punch', 'Protect'],
    items: ['Assault Vest', 'Booster Energy', 'Clear Amulet'],
    abilities: ['Quark Drive'],
  },
  'Kingambit': {
    name: 'Kingambit',
    spreads: [
      { nature: 'Adamant', hp: 252, atk: 252, def: 0, spa: 0, spd: 4, spe: 0 },
    ],
    moves: ['Sucker Punch', 'Iron Head', 'Kowtow Cleave', 'Protect', 'Swords Dance'],
    items: ['Black Glasses', 'Assault Vest', 'Lum Berry'],
    abilities: ['Defiant', 'Supreme Overlord'],
  },
  'Pelipper': {
    name: 'Pelipper',
    spreads: [
      { nature: 'Bold', hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 },
      { nature: 'Modest', hp: 252, atk: 0, def: 0, spa: 252, spd: 4, spe: 0 },
    ],
    moves: ['Weather Ball', 'Hurricane', 'Tailwind', 'Protect', 'Wide Guard'],
    items: ['Damp Rock', 'Focus Sash', 'Sitrus Berry'],
    abilities: ['Drizzle'],
  },
  'Gholdengo': {
    name: 'Gholdengo',
    spreads: [
      { nature: 'Modest', hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
      { nature: 'Timid', hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
    ],
    moves: ['Make It Rain', 'Shadow Ball', 'Nasty Plot', 'Protect', 'Thunderbolt'],
    items: ['Choice Specs', 'Air Balloon', 'Focus Sash'],
    abilities: ['Good as Gold'],
  },
  'Ogerpon-Wellspring': {
    name: 'Ogerpon-Wellspring',
    spreads: [
      { nature: 'Jolly', hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 },
    ],
    moves: ['Ivy Cudgel', 'Horn Leech', 'Follow Me', 'Spiky Shield'],
    items: ['Wellspring Mask'],
    abilities: ['Water Absorb'],
  },
  'Chien-Pao': {
    name: 'Chien-Pao',
    spreads: [
      { nature: 'Jolly', hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 },
    ],
    moves: ['Ice Spinner', 'Sacred Sword', 'Sucker Punch', 'Protect', 'Icicle Crash'],
    items: ['Focus Sash', 'Life Orb', 'Clear Amulet'],
    abilities: ['Sword of Ruin'],
  },
  'Farigiraf': {
    name: 'Farigiraf',
    spreads: [
      { nature: 'Calm', hp: 252, atk: 0, def: 0, spa: 4, spd: 252, spe: 0 },
    ],
    moves: ['Trick Room', 'Psychic', 'Hyper Voice', 'Protect', 'Helping Hand'],
    items: ['Sitrus Berry', 'Mental Herb', 'Safety Goggles'],
    abilities: ['Armor Tail'],
  },
  'Arcanine': {
    name: 'Arcanine',
    spreads: [
      { nature: 'Adamant', hp: 252, atk: 252, def: 0, spa: 0, spd: 4, spe: 0 },
      { nature: 'Impish', hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 },
    ],
    moves: ['Flare Blitz', 'Extreme Speed', 'Will-O-Wisp', 'Protect', 'Snarl'],
    items: ['Sitrus Berry', 'Assault Vest', 'Safety Goggles'],
    abilities: ['Intimidate'],
  },
  'Tsareena': {
    name: 'Tsareena',
    spreads: [
      { nature: 'Adamant', hp: 252, atk: 252, def: 0, spa: 0, spd: 4, spe: 0 },
    ],
    moves: ['Power Whip', 'High Jump Kick', 'Triple Axel', 'Protect', 'U-turn'],
    items: ['Wide Lens', 'Assault Vest', 'Miracle Seed'],
    abilities: ['Queenly Majesty'],
  },
  'Dusclops': {
    name: 'Dusclops',
    spreads: [
      { nature: 'Relaxed', hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 },
      { nature: 'Sassy', hp: 252, atk: 0, def: 4, spa: 0, spd: 252, spe: 0 },
    ],
    moves: ['Trick Room', 'Night Shade', 'Pain Split', 'Helping Hand', 'Will-O-Wisp'],
    items: ['Eviolite'],
    abilities: ['Frisk', 'Pressure'],
  },
  'Charizard-Mega-Y': {
    name: 'Charizard-Mega-Y',
    spreads: [
      { nature: 'Timid', hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
      { nature: 'Modest', hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
    ],
    moves: ['Heat Wave', 'Overheat', 'Solar Beam', 'Protect', 'Air Slash'],
    items: ['Charizardite Y'],
    abilities: ['Drought'],
  },
  'Kangaskhan-Mega': {
    name: 'Kangaskhan-Mega',
    spreads: [
      { nature: 'Adamant', hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 },
      { nature: 'Jolly', hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 },
    ],
    moves: ['Fake Out', 'Return', 'Sucker Punch', 'Power-Up Punch', 'Protect'],
    items: ['Kangaskhanite'],
    abilities: ['Parental Bond'],
  },
  'Salamence-Mega': {
    name: 'Salamence-Mega',
    spreads: [
      { nature: 'Naive', hp: 0, atk: 252, def: 0, spa: 4, spd: 0, spe: 252 },
      { nature: 'Adamant', hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 },
    ],
    moves: ['Double-Edge', 'Hyper Voice', 'Draco Meteor', 'Protect', 'Tailwind'],
    items: ['Salamencite'],
    abilities: ['Aerilate'],
  },
};
