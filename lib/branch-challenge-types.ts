/** Level 1: Single transformation - pick which of 3 codes maps Input to Output */
export type BranchChallengeLevel1 = {
  level: 1;
  branches: [string, string, string];
  correctBranchIndex: 0 | 1 | 2;
  validate: (inputs: number[]) => boolean;
};

/** Level 2: Two branches in series - one known, deduce the other from 3 candidates */
export type BranchChallengeLevel2 = {
  level: 2;
  knownBranch: string;
  knownBranchPosition: 'A' | 'B';
  candidateBranches: [string, string, string];
  correctCandidateIndex: 0 | 1 | 2;
  validate: (inputs: number[]) => boolean;
};

/** Level 3: Two branches known - predict output from 3 candidate arrangements */
export type BranchChallengeLevel3 = {
  level: 3;
  branchA: string;
  branchB: string;
  candidateOutputs: [
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
  ];
  correctOutputIndex: 0 | 1 | 2;
  validate: (inputs: number[]) => boolean;
};

/** Level 4: Input and Output known - find correct pair (A, B) from 3 candidate pairs */
export type BranchChallengeLevel4 = {
  level: 4;
  candidatePairs: [
    [string, string],
    [string, string],
    [string, string],
  ];
  correctPairIndex: 0 | 1 | 2;
  validate: (inputs: number[]) => boolean;
};

export type BranchChallenge =
  | BranchChallengeLevel1
  | BranchChallengeLevel2
  | BranchChallengeLevel3
  | BranchChallengeLevel4;
