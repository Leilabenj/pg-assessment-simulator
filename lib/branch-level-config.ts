import type {
  BranchChallengeLevel1,
  BranchChallengeLevel2,
  BranchChallengeLevel3,
  BranchChallengeLevel4,
} from './branch-challenge-types';
import {
  reorderByBranch,
  reverseReorderByBranch,
  computeRequiredBranch,
} from './branch-challenge-utils';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Generate all permutations of "1234" */
function permutations(str: string): string[] {
  if (str.length <= 1) return [str];
  const result: string[] = [];
  for (let i = 0; i < str.length; i++) {
    const rest = str.slice(0, i) + str.slice(i + 1);
    for (const p of permutations(rest)) {
      result.push(str[i] + p);
    }
  }
  return result;
}

const ALL_PERMS = permutations('1234');

function pickRandom<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)]!;
}

export function generateBranchChallengesLevel1(count: number): BranchChallengeLevel1[] {
  const seen = new Set<string>();
  const challenges: BranchChallengeLevel1[] = [];

  for (let i = 0; i < count; i++) {
    const shuffled = shuffle(ALL_PERMS);
    const [a, b, c] = [shuffled[0]!, shuffled[1]!, shuffled[2]!];
    const key = [a, b, c].sort().join('|');
    if (seen.has(key)) {
      i--;
      continue;
    }
    seen.add(key);

    const correctBranchIndex = randInt(0, 2) as 0 | 1 | 2;
    const branches: [string, string, string] = [a, b, c];

    challenges.push({
      level: 1,
      branches,
      correctBranchIndex,
      validate: (inputs: number[]) =>
        inputs.length >= 1 && inputs[0] === correctBranchIndex,
    });
  }

  return challenges;
}

export function generateBranchChallengesLevel2(count: number): BranchChallengeLevel2[] {
  const seen = new Set<string>();
  const challenges: BranchChallengeLevel2[] = [];
  const INPUT = [1, 2, 3, 4];

  for (let i = 0; i < count; i++) {
    const branchA = pickRandom(ALL_PERMS);
    const branchB = pickRandom(ALL_PERMS);

    const intermediate = reorderByBranch(INPUT, branchA);
    const output = reorderByBranch(intermediate, branchB);

    const knownPosition = randInt(0, 1) === 0 ? ('A' as const) : ('B' as const);
    const missingBranch = knownPosition === 'A' ? branchA : branchB;

    const wrongPool = ALL_PERMS.filter((p) => p !== missingBranch);
    const shuffledWrong = shuffle(wrongPool);
    const [w1, w2] = [shuffledWrong[0]!, shuffledWrong[1]!];
    const candidatesWithCorrect: [string, string, string] = [missingBranch, w1, w2];
    const shuffledCandidates = shuffle(candidatesWithCorrect) as [string, string, string];
    const correctIdx = shuffledCandidates.indexOf(missingBranch) as 0 | 1 | 2;

    const key = `${knownPosition}-${missingBranch}-${[...shuffledCandidates].sort().join('|')}`;
    if (seen.has(key)) {
      i--;
      continue;
    }
    seen.add(key);

    challenges.push({
      level: 2,
      knownBranch: knownPosition === 'A' ? branchA : branchB,
      knownBranchPosition: knownPosition,
      candidateBranches: shuffledCandidates,
      correctCandidateIndex: correctIdx,
      validate: (inputs: number[]) =>
        inputs.length >= 1 && inputs[0] === correctIdx,
    });
  }

  return challenges;
}

const UNKNOWN_POSITIONS = ['A', 'B', 'C'] as const;

export function generateBranchChallengesLevel3(count: number): BranchChallengeLevel3[] {
  const seen = new Set<string>();
  const challenges: BranchChallengeLevel3[] = [];
  const INPUT = [1, 2, 3, 4];

  for (let i = 0; i < count; i++) {
    const branchA = pickRandom(ALL_PERMS);
    const branchB = pickRandom(ALL_PERMS);
    const branchC = pickRandom(ALL_PERMS);

    const output = reorderByBranch(
      reorderByBranch(reorderByBranch(INPUT, branchA), branchB),
      branchC
    );

    const unknownPosition = UNKNOWN_POSITIONS[randInt(0, 2)];
    let correctBranch: string;

    if (unknownPosition === 'A') {
      const y = reverseReorderByBranch(output, branchC);
      const x = reverseReorderByBranch(y, branchB);
      correctBranch = computeRequiredBranch(INPUT, x);
    } else if (unknownPosition === 'B') {
      const x = reorderByBranch(INPUT, branchA);
      const y = reverseReorderByBranch(output, branchC);
      correctBranch = computeRequiredBranch(x, y);
    } else {
      const y = reorderByBranch(reorderByBranch(INPUT, branchA), branchB);
      correctBranch = computeRequiredBranch(y, output);
    }

    const wrongPool = ALL_PERMS.filter((p) => p !== correctBranch);
    const shuffledWrong = shuffle(wrongPool);
    const [w1, w2] = [shuffledWrong[0]!, shuffledWrong[1]!];
    const candidatesWithCorrect: [string, string, string] = [
      correctBranch,
      w1,
      w2,
    ];
    const shuffledCandidates = shuffle(candidatesWithCorrect) as [string, string, string];
    const correctIdx = shuffledCandidates.indexOf(correctBranch) as 0 | 1 | 2;

    const key = `${branchA}|${branchB}|${branchC}|${unknownPosition}`;
    if (seen.has(key)) {
      i--;
      continue;
    }
    seen.add(key);

    challenges.push({
      level: 3,
      branchA: unknownPosition === 'A' ? null : branchA,
      branchB: unknownPosition === 'B' ? null : branchB,
      branchC: unknownPosition === 'C' ? null : branchC,
      candidateBranches: shuffledCandidates,
      correctCandidateIndex: correctIdx,
      validate: (inputs: number[]) =>
        inputs.length >= 1 && inputs[0] === correctIdx,
    });
  }

  return challenges;
}

export function generateBranchChallengesLevel4(count: number): BranchChallengeLevel4[] {
  const seen = new Set<string>();
  const challenges: BranchChallengeLevel4[] = [];
  const INPUT = [1, 2, 3, 4];

  for (let i = 0; i < count; i++) {
    const branchA = pickRandom(ALL_PERMS);
    const branchB = pickRandom(ALL_PERMS);
    const output = reorderByBranch(reorderByBranch(INPUT, branchA), branchB);

    const wrongPoolA = ALL_PERMS.filter((p) => p !== branchA);
    const shuffledWrongA = shuffle(wrongPoolA);
    const [wA1, wA2] = [shuffledWrongA[0]!, shuffledWrongA[1]!];
    const candidatesAWithCorrect: [string, string, string] = [branchA, wA1, wA2];
    const shuffledCandidatesA = shuffle(candidatesAWithCorrect) as [string, string, string];
    const correctAIdx = shuffledCandidatesA.indexOf(branchA) as 0 | 1 | 2;

    const wrongPoolB = ALL_PERMS.filter((p) => p !== branchB);
    const shuffledWrongB = shuffle(wrongPoolB);
    const [wB1, wB2] = [shuffledWrongB[0]!, shuffledWrongB[1]!];
    const candidatesBWithCorrect: [string, string, string] = [branchB, wB1, wB2];
    const shuffledCandidatesB = shuffle(candidatesBWithCorrect) as [string, string, string];
    const correctBIdx = shuffledCandidatesB.indexOf(branchB) as 0 | 1 | 2;

    const key = `${branchA}|${branchB}`;
    if (seen.has(key)) {
      i--;
      continue;
    }
    seen.add(key);

    challenges.push({
      level: 4,
      candidateBranchesA: shuffledCandidatesA,
      candidateBranchesB: shuffledCandidatesB,
      correctAIndex: correctAIdx,
      correctBIndex: correctBIdx,
      validate: (inputs: number[]) =>
        inputs.length >= 2 &&
        inputs[0] === correctAIdx &&
        inputs[1] === correctBIdx,
    });
  }

  return challenges;
}
