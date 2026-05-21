export interface SeededRng {
  random(): number; // returns [0, 1)
  randomInt(min: number, max: number): number; // inclusive
  randomFrom<T>(arr: T[]): T;
  shuffle<T>(arr: T[]): T[];
}

export function hashString(str: string): number {
  // Simple djb2 hash
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

export function createSeededRng(seed: string): SeededRng {
  let state = hashString(seed);

  function random(): number {
    // mulberry32
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    random,
    randomInt(min, max) {
      return min + Math.floor(random() * (max - min + 1));
    },
    randomFrom(arr) {
      return arr[Math.floor(random() * arr.length)];
    },
    shuffle(arr) {
      const result = [...arr];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    },
  };
}
