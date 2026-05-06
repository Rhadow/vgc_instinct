import { toPokeApiName } from './nameMap';

export interface SpriteProvider {
  getSprite(pokemonName: string): string;
}

class PokeAPISpriteProvider implements SpriteProvider {
  getSprite(pokemonName: string): string {
    const apiName = toPokeApiName(pokemonName);
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${apiName}.gif`;
  }
}

export const spriteProvider: SpriteProvider = new PokeAPISpriteProvider();
