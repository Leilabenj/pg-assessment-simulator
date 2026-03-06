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

/** Level 3: Three branches in series - 2 known, find the unknown branch from 3 candidates */
export type BranchChallengeLevel3 = {
  level: 3;
  branchA: string | null;
  branchB: string | null;
  branchC: string | null;
  candidateBranches: [string, string, string];
  correctCandidateIndex: 0 | 1 | 2;
  validate: (inputs: number[]) => boolean;
};

/** Level 4: Two branches in series, both unknown - pick A and B independently; combination must produce output */
export type BranchChallengeLevel4 = {
  level: 4;
  candidateBranchesA: [string, string, string];
  candidateBranchesB: [string, string, string];
  correctAIndex: 0 | 1 | 2;
  correctBIndex: 0 | 1 | 2;
  validate: (inputs: number[]) => boolean;
};

export type BranchChallenge =
  | BranchChallengeLevel1
  | BranchChallengeLevel2
  | BranchChallengeLevel3
  | BranchChallengeLevel4;
