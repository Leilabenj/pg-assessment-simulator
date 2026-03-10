import { db } from '@/lib/db';

export type SessionWithAttempts = {
  mode: string;
  maxInternalLevel: number;
  correctCount: number;
  totalQuestions: number;
  attempts: { isCorrect: boolean; responseTimeMs: number }[];
};

export type EfficiencyResult = {
  efficiency: number;
  meanCorrectResponseTimeMs: number;
} | null;

export type EfficiencySMAResult = {
  sma: number;
  sessionCount: number;
} | null;

export type CalculateEfficiencyResult = {
  latestEfficiency: EfficiencyResult;
  sma: EfficiencySMAResult;
} | null;

const RESPONSE_TIME_FLOOR_MS = 500;
const SMA_WINDOW = 7;

function computeMeanCorrectResponseTime(
  attempts: { isCorrect: boolean; responseTimeMs: number }[]
): number | null {
  const correct = attempts.filter((a) => a.isCorrect);
  if (correct.length === 0) return null;
  const sum = correct.reduce((acc, a) => acc + a.responseTimeMs, 0);
  return sum / correct.length;
}

function computeEfficiency(session: SessionWithAttempts): EfficiencyResult | null {
  const meanMs = computeMeanCorrectResponseTime(session.attempts);
  if (meanMs === null) return null;
  const clamped = Math.max(meanMs, RESPONSE_TIME_FLOOR_MS);
  const accuracy =
    session.totalQuestions > 0 ? session.correctCount / session.totalQuestions : 0;
  const efficiency = (session.maxInternalLevel * accuracy) / Math.log(clamped);
  return { efficiency, meanCorrectResponseTimeMs: meanMs };
}

export function computeEfficiencySMA(
  sessions: SessionWithAttempts[]
): EfficiencySMAResult {
  const formula = sessions
    .filter((s) => s.mode === 'formula')
    .slice(0, SMA_WINDOW);
  const scores: number[] = [];
  for (const s of formula) {
    const r = computeEfficiency(s);
    if (r) scores.push(r.efficiency);
  }
  if (scores.length === 0) return null;
  const sma = scores.reduce((a, b) => a + b, 0) / scores.length;
  return { sma, sessionCount: scores.length };
}

export async function calculateEfficiency(
  userId: string | null
): Promise<CalculateEfficiencyResult> {
  if (!userId) return null;

  const sessions = await db.session.findMany({
    where: { userId },
    select: {
      mode: true,
      maxInternalLevel: true,
      correctCount: true,
      totalQuestions: true,
      attempts: { select: { isCorrect: true, responseTimeMs: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  if (sessions.length === 0) return null;

  const formula = sessions.filter((s) => s.mode === 'formula');
  const latestSession = formula[0];
  const latestEfficiency = latestSession
    ? computeEfficiency(latestSession)
    : null;

  const sma = computeEfficiencySMA(sessions);

  return {
    latestEfficiency,
    sma,
  };
}
