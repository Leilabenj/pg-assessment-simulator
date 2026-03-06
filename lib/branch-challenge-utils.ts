import type { BranchChallenge } from './branch-challenge-types';
import { BRANCH_CHALLENGE_BANK } from './branch-challenges.generated';

export const BRANCH_LEVEL_ORDER = [1, 2, 3] as const;
export type BranchLevel = (typeof BRANCH_LEVEL_ORDER)[number];

/** Cumulative score at which each branch level starts. L1: 0–11, L2: 12–15, L3: 16+. */
export const BRANCH_CUMULATIVE_THRESHOLDS = [0, 12, 16] as const;

export function getBranchLevelForScore(score: number): BranchLevel {
  if (score < 12) return 1;
  if (score < 16) return 2;
  return 3;
}

/** Index of the challenge within the current branch level (0-based). */
export function getBranchIndexInLevel(score: number): number {
  const level = getBranchLevelForScore(score);
  return score - BRANCH_CUMULATIVE_THRESHOLDS[level - 1];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Builds per-level decks: one shuffled array per level from BRANCH_CHALLENGE_BANK. Level 1 = merged single-stage + serial-deduction. */
export function buildBranchDecks(): Record<1 | 2 | 3, BranchChallenge[]> {
  return {
    1: shuffle(BRANCH_CHALLENGE_BANK[1] ?? []),
    2: shuffle(BRANCH_CHALLENGE_BANK[2] ?? []),
    3: shuffle(BRANCH_CHALLENGE_BANK[3] ?? []),
  };
}

/**
 * Parses a branch string like "3241" into output positions.
 * The order indicates which input symbol (1-4) appears at each output position.
 */
export function getOutputOrder(branch: string): number[] {
  return branch.split('').map(Number);
}

/**
 * Given initial symbols [1,2,3,4] and branch "3241",
 * returns the reordered sequence [3,2,4,1].
 */
export function reorderByBranch(symbols: number[], branch: string): number[] {
  return getOutputOrder(branch).map((pos) => symbols[pos - 1]!);
}

/**
 * Inverse of reorderByBranch. Given output and branch, returns the input that would produce that output.
 * Used for Level 2 when Branch B is known: reverse from Output to find Intermediate.
 */
export function reverseReorderByBranch(output: number[], branch: string): number[] {
  const result: number[] = [];
  for (let j = 0; j < 4; j++) {
    const k = branch.indexOf(String(j + 1));
    result[j] = output[k]!;
  }
  return result;
}

/**
 * Returns the 4-digit branch code that maps input to output.
 * For each output position i: output[i] = input[result[i]-1].
 */
export function computeRequiredBranch(input: number[], output: number[]): string {
  return output
    .map((outVal) => input.findIndex((v) => v === outVal) + 1)
    .join('');
}

/** Symbol ID to display config: 1=red square, 2=yellow triangle, 3=blue plus, 4=green circle */
export const SYMBOL_CONFIG = {
  1: { color: 'bg-red-500', shape: 'square' as const },
  2: { color: 'bg-yellow-500', shape: 'triangle' as const },
  3: { color: 'bg-blue-500', shape: 'plus' as const },
  4: { color: 'bg-green-500', shape: 'circle' as const },
} as const;
