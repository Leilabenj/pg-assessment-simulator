import type {
  BranchChallengeLevel1,
  BranchChallengeLevel2,
  BranchChallengeLevel3,
  BranchChallengeLevel4,
} from './branch-challenge-types';
import { reorderByBranch } from './branch-challenge-utils';

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

type OutputTuple = [number, number, number, number];

function permToTuple(perm: string): OutputTuple {
  return perm.split('').map(Number) as OutputTuple;
}

function tupleKey(t: OutputTuple): string {
  return t.join(',');
}

export function generateBranchChallengesLevel3(count: number): BranchChallengeLevel3[] {
  const seen = new Set<string>();
  const challenges: BranchChallengeLevel3[] = [];
  const INPUT = [1, 2, 3, 4];

  const allOutputTuples = ALL_PERMS.map(permToTuple);

  for (let i = 0; i < count; i++) {
    const branchA = pickRandom(ALL_PERMS);
    const branchB = pickRandom(ALL_PERMS);

    const intermediate = reorderByBranch(INPUT, branchA);
    const output = reorderByBranch(intermediate, branchB) as OutputTuple;

    const wrongPool = allOutputTuples.filter(
      (t) => tupleKey(t) !== tupleKey(output)
    );
    const shuffledWrong = shuffle(wrongPool);
    const [w1, w2] = [shuffledWrong[0]!, shuffledWrong[1]!];
    const candidatesWithCorrect: [OutputTuple, OutputTuple, OutputTuple] = [
      output,
      w1,
      w2,
    ];
    const shuffledCandidates = shuffle(candidatesWithCorrect) as [
      OutputTuple,
      OutputTuple,
      OutputTuple,
    ];
    const correctIdx = shuffledCandidates.findIndex(
      (t) => tupleKey(t) === tupleKey(output)
    ) as 0 | 1 | 2;

    const key = `${branchA}|${branchB}|${tupleKey(output)}`;
    if (seen.has(key)) {
      i--;
      continue;
    }
    seen.add(key);

    challenges.push({
      level: 3,
      branchA,
      branchB,
      candidateOutputs: shuffledCandidates,
      correctOutputIndex: correctIdx,
      validate: (inputs: number[]) =>
        inputs.length >= 1 && inputs[0] === correctIdx,
    });
  }

  return challenges;
}

type PairTuple = [string, string];

function pairProducesOutput(pair: PairTuple, input: number[], target: number[]): boolean {
  const result = reorderByBranch(reorderByBranch(input, pair[0]), pair[1]);
  return result.every((v, i) => v === target[i]);
}

export function generateBranchChallengesLevel4(count: number): BranchChallengeLevel4[] {
  const seen = new Set<string>();
  const challenges: BranchChallengeLevel4[] = [];
  const INPUT = [1, 2, 3, 4];
  const MAX_ATTEMPTS = 200;

  for (let i = 0; i < count; i++) {
    const branchA = pickRandom(ALL_PERMS);
    const branchB = pickRandom(ALL_PERMS);
    const output = reorderByBranch(reorderByBranch(INPUT, branchA), branchB);
    const correctPair: PairTuple = [branchA, branchB];

    const wrongPairs: PairTuple[] = [];
    for (let attempt = 0; attempt < MAX_ATTEMPTS && wrongPairs.length < 2; attempt++) {
      const wA = pickRandom(ALL_PERMS);
      const wB = pickRandom(ALL_PERMS);
      const pair: PairTuple = [wA, wB];
      if (pairProducesOutput(pair, INPUT, output)) continue;
      const dup = wrongPairs.some(
        (p) => p[0] === pair[0] && p[1] === pair[1]
      );
      if (!dup) wrongPairs.push(pair);
    }
    if (wrongPairs.length < 2) {
      i--;
      continue;
    }

    const candidatesWithCorrect: [PairTuple, PairTuple, PairTuple] = [
      correctPair,
      wrongPairs[0]!,
      wrongPairs[1]!,
    ];
    const shuffledCandidates = shuffle(candidatesWithCorrect) as [PairTuple, PairTuple, PairTuple];
    const correctIdx = shuffledCandidates.findIndex(
      (p) => p[0] === branchA && p[1] === branchB
    ) as 0 | 1 | 2;

    const key = `${branchA}|${branchB}`;
    if (seen.has(key)) {
      i--;
      continue;
    }
    seen.add(key);

    challenges.push({
      level: 4,
      candidatePairs: shuffledCandidates,
      correctPairIndex: correctIdx,
      validate: (inputs: number[]) =>
        inputs.length >= 1 && inputs[0] === correctIdx,
    });
  }

  return challenges;
}
