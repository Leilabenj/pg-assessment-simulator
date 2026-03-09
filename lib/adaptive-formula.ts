import type { Challenge } from './challenge-types';
import { INTERNAL_LEVEL_POOLS, pickRandom, toChallenge } from './level-config';

const MAX_RETRIES = 20;

/** Returns next internal level: +1 if correct (clamp 11), -3 if wrong (clamp 1). */
export function getNextInternalLevel(current: number, isCorrect: boolean): number {
  if (isCorrect) return Math.min(11, current + 1);
  return Math.max(1, current - 3);
}

/** Generates a challenge for the given internal level (1-11). Returns null if generation fails after retries. */
export function generateChallengeForInternalLevel(internalLevel: number): Challenge | null {
  const pool = INTERNAL_LEVEL_POOLS[internalLevel - 1];
  if (!pool || pool.length === 0) return null;

  for (let i = 0; i < MAX_RETRIES; i++) {
    const generator = pickRandom(pool);
    const result = generator();
    if (result) return toChallenge(result);
  }
  return null;
}
