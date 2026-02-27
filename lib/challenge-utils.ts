import type { Challenge } from './challenge-types';
import { CHALLENGE_BANK } from './challenges.generated';

export const LEVEL_ORDER = [1, 2, 3, 4] as const;
export type Level = (typeof LEVEL_ORDER)[number];

/** Cumulative score at which each level starts. L2 at 8, L3 at 15, L4 at 21. */
export const CUMULATIVE_THRESHOLDS = [0, 8, 15, 21] as const;

export function getLevelForScore(score: number): Level {
  if (score < 8) return 1;
  if (score < 15) return 2;
  if (score < 21) return 3;
  return 4;
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
 * Progression: L2 at 8 total correct, L3 at 15, L4 at 21, then L4 until timeout.
 */
export function buildLevelDecks(): Record<Level, Challenge[]> {
  const decks: Record<Level, Challenge[]> = {
    1: shuffle(CHALLENGE_BANK[1] ?? []),
    2: shuffle(CHALLENGE_BANK[2] ?? []),
    3: shuffle(CHALLENGE_BANK[3] ?? []),
    4: shuffle(CHALLENGE_BANK[4] ?? []),
  };
  return decks;
}
