import type { Challenge } from './challenge-types';

export function getPlaceholderCount(formula: string): number {
  return (formula.match(/\( \)/g) || []).length;
}

export function getPureDigitsInFormula(formula: string): Set<number> {
  const [leftSide] = formula.split('=').map((s) => s.trim());
  const withoutPlaceholders = (leftSide ?? '').replace(/\( \)/g, '');
  const tokens = withoutPlaceholders.split(/\D+/).filter(Boolean);
  const pureDigits = new Set<number>();
  for (const token of tokens) {
    if (token.length === 1) {
      const d = parseInt(token, 10);
      if (d >= 1 && d <= 9) pureDigits.add(d);
    }
  }
  return pureDigits;
}

export function isCorrectFormula(challenge: Challenge, inputs: number[]): boolean {
  const placeholderCount = getPlaceholderCount(challenge.formula);
  if (inputs.length !== placeholderCount) return false;
  if (!inputs.every((n) => Number.isInteger(n) && n >= 1 && n <= 9)) return false;
  if (inputs.length !== new Set(inputs).size) return false;
  const forbidden = getPureDigitsInFormula(challenge.formula);
  if (inputs.some((d) => forbidden.has(d))) return false;
  try {
    return challenge.validate(inputs);
  } catch {
    return false;
  }
}
