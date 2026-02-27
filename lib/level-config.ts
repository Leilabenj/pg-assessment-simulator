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

// --- Level 1: Multiplication only ---
const genMultBlankFirst: GeneratorFn = () => {
  const a = randInt(2, 9);
  const x = randInt(2, 9);
  const y = a * x;
  if (!inRange(y, 2, 81)) return null;
  if (solutionViolatesRule([x], [a])) return null;
  return {
    formula: `( ) * ${x} = ${y}`,
    validateSource: `(i) => i[0] * ${x} === ${y}`,
  };
};

const genMultBlankSecond: GeneratorFn = () => {
  const a = randInt(2, 9);
  const x = randInt(2, 9);
  const y = a * x;
  if (!inRange(y, 2, 81)) return null;
  if (solutionViolatesRule([x], [a])) return null;
  return {
    formula: `${x} * ( ) = ${y}`,
    validateSource: `(i) => ${x} * i[0] === ${y}`,
  };
};

// --- Level 2: All include multiplication ---
const genMultOnly: GeneratorFn = genMultBlankFirst;

const genSubMult: GeneratorFn = () => {
  const a = randInt(2, 9);
  const y = randInt(2, 9);
  const z = randInt(1, 9);
  const x = a * y + z;
  if (!inRange(x, 2, 99)) return null;
  if (solutionViolatesRule([x, y], [a])) return null;
  return {
    formula: `${x} - ( ) * ${y} = ${z}`,
    validateSource: `(i) => ${x} - i[0] * ${y} === ${z}`,
  };
};

const genMultAdd: GeneratorFn = () => {
  const a = randInt(2, 9);
  const x = randInt(2, 9);
  const y = randInt(1, 9);
  const z = a * x + y;
  if (!inRange(z, 2, 90)) return null;
  if (solutionViolatesRule([x, y], [a])) return null;
  return {
    formula: `( ) * ${x} + ${y} = ${z}`,
    validateSource: `(i) => i[0] * ${x} + ${y} === ${z}`,
  };
};

// --- Level 3: Mult + div ---
const genMultAddTwo: GeneratorFn = () => {
  const x = randInt(2, 9);
  const a = randInt(2, 9);
  const b = randInt(1, 9);
  const y = a * x + b;
  if (solutionViolatesRule([x], [a, b])) return null;
  return {
    formula: `( ) * ${x} + ( ) = ${y}`,
    validateSource: `(i) => i[0] * ${x} + i[1] === ${y}`,
  };
};

const genMultSub: GeneratorFn = () => {
  const a = randInt(2, 9);
  const b = randInt(1, 9);
  const x = randInt(2, 9);
  const y = a * x - b;
  if (y <= 0) return null;
  if (solutionViolatesRule([x], [a, b])) return null;
  return {
    formula: `( ) * ${x} - ( ) = ${y}`,
    validateSource: `(i) => i[0] * ${x} - i[1] === ${y}`,
  };
};

const genMultDiv: GeneratorFn = () => {
  const z = randInt(1, 9);
  const y = randInt(2, 9);
  const a = randInt(2, 9);
  const product = z * y;
  if (product % a !== 0) return null;
  const x = product / a;
  if (!inRange(x)) return null;
  if (solutionViolatesRule([x, y], [a])) return null;
  return {
    formula: `( ( ) * ${x} ) / ${y} = ${z}`,
    validateSource: `(i) => (i[0] * ${x}) % ${y} === 0 && (i[0] * ${x}) / ${y} === ${z}`,
  };
};

const genDivAdd: GeneratorFn = () => {
  const x = randInt(2, 9);
  const b = randInt(1, 9);
  const quotient = randInt(1, 4); // a/x must be 1-4 so a <= 9
  const a = quotient * x;
  if (!inRange(a)) return null;
  const y = quotient + b;
  if (!inRange(y, 2, 18)) return null;
  if (solutionViolatesRule([x], [a, b])) return null;
  return {
    formula: `( ) / ${x} + ( ) = ${y}`,
    validateSource: `(i) => i[0] % ${x} === 0 && i[0] / ${x} + i[1] === ${y}`,
  };
};

// --- Level 4: Mult + div ---
const genProductSub: GeneratorFn = () => {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const product = a * b;
  if (product <= 3) return null;
  const c = randInt(1, product - 1);
  const y = product - c;
  if (solutionViolatesRule([], [a, b, c])) return null;
  return {
    formula: `(( ) * ( )) - ( ) = ${y}`,
    validateSource: `(i) => i[0] * i[1] - i[2] === ${y}`,
  };
};

const genProductDiv: GeneratorFn = () => {
  const y = randInt(1, 9);
  const c = randInt(2, 9);
  const target = y * c;
  if (target > 81) return null;
  for (let a = 2; a <= 9; a++) {
    if (target % a !== 0) continue;
    const b = target / a;
    if (inRange(b) && b >= 2) {
      if (solutionViolatesRule([], [a, b, c])) continue;
      return {
        formula: `(( ) * ( )) / ( ) = ${y}`,
        validateSource: `(i) => (i[0] * i[1]) % i[2] === 0 && (i[0] * i[1]) / i[2] === ${y}`,
      };
    }
  }
  return null;
};

const genProductDivSub: GeneratorFn = () => {
  const y = randInt(1, 9);
  const c = randInt(2, 9);
  const x = randInt(2, 9);
  const target = (y + c) * x;
  if (target > 81) return null;
  for (let a = 2; a <= 9; a++) {
    if (target % a !== 0) continue;
    const b = target / a;
    if (inRange(b) && b >= 2) {
      if (solutionViolatesRule([x], [a, b, c])) continue;
      return {
        formula: `( ( ) * ( ) ) / ${x} - ( ) = ${y}`,
        validateSource: `(i) => (i[0] * i[1]) % ${x} === 0 && (i[0] * i[1]) / ${x} - i[2] === ${y}`,
      };
    }
  }
  return null;
};

export const LEVEL_POOLS: LevelTemplatePool[] = [
  { level: 1, generators: [genMultBlankFirst, genMultBlankSecond] },
  { level: 2, generators: [genMultOnly, genSubMult, genMultAdd] },
  { level: 3, generators: [genMultAddTwo, genMultSub, genMultDiv, genDivAdd] },
  { level: 4, generators: [genProductSub, genProductDiv, genProductDivSub] },
];

export { pickRandom };
