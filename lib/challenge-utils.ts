import type { Challenge } from './challenge-types';
import { CHALLENGE_BANK } from './challenges.generated';

export const LEVEL_ORDER = [1, 2, 3, 4, 5] as const;
export type Level = (typeof LEVEL_ORDER)[number];

/** Cumulative score at which each level starts. L2 at 2, L3 at 3, L4 at 5, L5 at 10. */
export const CUMULATIVE_THRESHOLDS = [0, 2, 3, 5, 10] as const;

export function getLevelForScore(score: number): Level {
  if (score < 2) return 1;
  if (score < 3) return 2;
  if (score < 5) return 3;
  if (score < 10) return 4;
  return 5;
}

/** Index of the challenge within the current level (0-based). */
export function getIndexInLevel(score: number): number {
  const level = getLevelForScore(score);
  return score - CUMULATIVE_THRESHOLDS[level - 1];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Builds per-level decks: one shuffled array per level from CHALLENGE_BANK.
 * Progression: L2 at 2, L3 at 3, L4 at 5, L5 at 10.
 */
export function buildLevelDecks(): Record<Level, Challenge[]> {
  const decks: Record<Level, Challenge[]> = {
    1: shuffle(CHALLENGE_BANK[1] ?? []),
    2: shuffle(CHALLENGE_BANK[2] ?? []),
    3: shuffle(CHALLENGE_BANK[3] ?? []),
    4: shuffle(CHALLENGE_BANK[4] ?? []),
    5: shuffle(CHALLENGE_BANK[5] ?? []),
  };
  return decks;
}
