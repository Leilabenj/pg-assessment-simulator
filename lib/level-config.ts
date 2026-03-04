import type { Level } from './challenge-utils';

export type ChallengeWithSource = {
  formula: string;
  validateSource: string;
};

type GeneratorFn = () => ChallengeWithSource | null;

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function inRange(n: number, min = 1, max = 9): boolean {
  return Number.isInteger(n) && n >= min && n <= max;
}

function pickRandom<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)]!;
}

function getPureDigitsFromConstants(constants: number[]): Set<number> {
  const forbidden = new Set<number>();
  for (const c of constants) {
    if (c >= 1 && c <= 9) forbidden.add(c);
  }
  return forbidden;
}

function solutionOverlapsFormula(constants: number[], solutionDigits: number[]): boolean {
  const formulaPureDigits = getPureDigitsFromConstants(constants);
  return solutionDigits.some((d) => formulaPureDigits.has(d));
}

function solutionViolatesRule(constants: number[], solutionDigits: number[]): boolean {
  if (solutionOverlapsFormula(constants, solutionDigits)) return true;
  if (solutionDigits.length !== new Set(solutionDigits).size) return true;
  return false;
}

export type LevelTemplatePool = {
  level: Level;
  generators: GeneratorFn[];
};

// --- Level 1: Basic multiplication table ---
const genBasicMultiplication: GeneratorFn = () => {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const y = a * b;
  if (!inRange(y, 4, 81)) return null;
  if (solutionViolatesRule([], [a, b])) return null;
  return {
    formula: `( ) * ( ) = ${y}`,
    validateSource: `(i) => i[0] * i[1] === ${y}`,
  };
};

// --- Level 2: Addition-only chains (2 to 4 addends) ---
const genAddTwo: GeneratorFn = () => {
  const a = randInt(1, 9);
  const b = randInt(1, 9);
  const y = a + b;
  if (!inRange(y, 3, 18)) return null;
  if (solutionViolatesRule([], [a, b])) return null;
  return {
    formula: `( ) + ( ) = ${y}`,
    validateSource: `(i) => i[0] + i[1] === ${y}`,
  };
};

const genAddThree: GeneratorFn = () => {
  const a = randInt(1, 9);
  const b = randInt(1, 9);
  const c = randInt(1, 9);
  const y = a + b + c;
  if (!inRange(y, 6, 24)) return null;
  if (solutionViolatesRule([], [a, b, c])) return null;
  return {
    formula: `( ) + ( ) + ( ) = ${y}`,
    validateSource: `(i) => i[0] + i[1] + i[2] === ${y}`,
  };
};

const genAddFour: GeneratorFn = () => {
  const a = randInt(1, 9);
  const b = randInt(1, 9);
  const c = randInt(1, 9);
  const d = randInt(1, 9);
  const y = a + b + c + d;
  if (!inRange(y, 10, 36)) return null;
  if (solutionViolatesRule([], [a, b, c, d])) return null;
  return {
    formula: `( ) + ( ) + ( ) + ( ) = ${y}`,
    validateSource: `(i) => i[0] + i[1] + i[2] + i[3] === ${y}`,
  };
};

// --- Level 3: Mixed addition and subtraction chains ---
const genAddSubThree: GeneratorFn = () => {
  const a = randInt(1, 9);
  const b = randInt(1, 9);
  const c = randInt(1, 9);
  const y = a + b - c;
  if (!inRange(y, 1, 17)) return null;
  if (solutionViolatesRule([], [a, b, c])) return null;
  return {
    formula: `( ) + ( ) - ( ) = ${y}`,
    validateSource: `(i) => i[0] + i[1] - i[2] === ${y}`,
  };
};

const genSubAddThree: GeneratorFn = () => {
  const a = randInt(1, 9);
  const b = randInt(1, 9);
  const c = randInt(1, 9);
  const y = a - b + c;
  if (!inRange(y, 1, 17)) return null;
  if (solutionViolatesRule([], [a, b, c])) return null;
  return {
    formula: `( ) - ( ) + ( ) = ${y}`,
    validateSource: `(i) => i[0] - i[1] + i[2] === ${y}`,
  };
};

const genAddSubAddFour: GeneratorFn = () => {
  const a = randInt(1, 9);
  const b = randInt(1, 9);
  const c = randInt(1, 9);
  const d = randInt(1, 9);
  const y = a + b - c + d;
  if (!inRange(y, 1, 26)) return null;
  if (solutionViolatesRule([], [a, b, c, d])) return null;
  return {
    formula: `( ) + ( ) - ( ) + ( ) = ${y}`,
    validateSource: `(i) => i[0] + i[1] - i[2] + i[3] === ${y}`,
  };
};

const genSubAddSubFour: GeneratorFn = () => {
  const a = randInt(1, 9);
  const b = randInt(1, 9);
  const c = randInt(1, 9);
  const d = randInt(1, 9);
  const y = a - b + c - d;
  if (!inRange(y, 1, 17)) return null;
  if (solutionViolatesRule([], [a, b, c, d])) return null;
  return {
    formula: `( ) - ( ) + ( ) - ( ) = ${y}`,
    validateSource: `(i) => i[0] - i[1] + i[2] - i[3] === ${y}`,
  };
};

// --- Level 4: Multiplication-only ---
const genProductSub: GeneratorFn = () => {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const product = a * b;
  if (product <= 1) return null;
  const c = randInt(1, product - 1);
  const y = product - c;
  if (!inRange(y, 1, 80)) return null;
  if (solutionViolatesRule([], [a, b, c])) return null;
  return {
    formula: `(( ) * ( )) - ( ) = ${y}`,
    validateSource: `(i) => i[0] * i[1] - i[2] === ${y}`,
  };
};

const genProductAdd: GeneratorFn = () => {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const c = randInt(1, 9);
  const y = a * b + c;
  if (!inRange(y, 5, 90)) return null;
  if (solutionViolatesRule([], [a, b, c])) return null;
  return {
    formula: `(( ) * ( )) + ( ) = ${y}`,
    validateSource: `(i) => i[0] * i[1] + i[2] === ${y}`,
  };
};

// --- Level 5: Triple product, triple product ± one ---
const genTripleProduct: GeneratorFn = () => {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const c = randInt(2, 9);
  const y = a * b * c;
  if (!inRange(y, 8, 729)) return null;
  if (solutionViolatesRule([], [a, b, c])) return null;
  return {
    formula: `( ) * ( ) * ( ) = ${y}`,
    validateSource: `(i) => i[0] * i[1] * i[2] === ${y}`,
  };
};

const genTripleProductMinus: GeneratorFn = () => {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const c = randInt(2, 9);
  const product = a * b * c;
  if (product <= 1) return null;
  const d = randInt(1, Math.min(9, product - 1));
  const y = product - d;
  if (y > 500) return null;
  if (solutionViolatesRule([], [a, b, c, d])) return null;
  return {
    formula: `( ( ) * ( ) * ( ) ) - ( ) = ${y}`,
    validateSource: `(i) => i[0] * i[1] * i[2] - i[3] === ${y}`,
  };
};

const genTripleProductPlus: GeneratorFn = () => {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const c = randInt(2, 9);
  const d = randInt(1, 9);
  const y = a * b * c + d;
  if (y > 600) return null;
  if (solutionViolatesRule([], [a, b, c, d])) return null;
  return {
    formula: `( ( ) * ( ) * ( ) ) + ( ) = ${y}`,
    validateSource: `(i) => i[0] * i[1] * i[2] + i[3] === ${y}`,
  };
};

export const LEVEL_POOLS: LevelTemplatePool[] = [
  { level: 1, generators: [genBasicMultiplication] },
  { level: 2, generators: [genAddTwo, genAddThree, genAddFour] },
  { level: 3, generators: [genAddSubThree, genSubAddThree, genAddSubAddFour, genSubAddSubFour] },
  { level: 4, generators: [genProductSub, genProductAdd] },
  { level: 5, generators: [genTripleProduct, genTripleProductMinus, genTripleProductPlus] },
];

export { pickRandom };
