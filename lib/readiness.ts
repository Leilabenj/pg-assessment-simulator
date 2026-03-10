import { db } from '@/lib/db';

export type SessionForReadiness = {
  mode: string;
  correctCount: number;
  totalQuestions: number;
  maxInternalLevel: number;
  createdAt: Date;
};

export type ReadinessPillars = {
  accuracy: number;
  ceiling: number;
  stability: number;
  frequency: number;
};

export type ReadinessResult = {
  index: number;
  pillars: ReadinessPillars;
  sessionCount: number;
} | null;

const WEIGHTS = { accuracy: 0.4, ceiling: 0.3, stability: 0.2, frequency: 0.1 };
const ACCURACY_WINDOW = 5;
const STABILITY_DAYS = 7;
const FREQUENCY_HOURS = 48;
const FREQUENCY_CAP = 5;
const CEILING_MAX = 11;

function computeAccuracy(sessions: SessionForReadiness[]): number {
  const formula = sessions.filter((s) => s.mode === 'formula').slice(0, ACCURACY_WINDOW);
  if (formula.length === 0) return 0;
  let sum = 0;
  for (const s of formula) {
    sum += s.totalQuestions > 0 ? s.correctCount / s.totalQuestions : 0;
  }
  const avg = sum / formula.length;
  return Math.min(100, Math.max(0, avg * 100));
}

function computeCeiling(sessions: SessionForReadiness[]): number {
  const formula = sessions.filter((s) => s.mode === 'formula');
  if (formula.length === 0) return 0;
  const maxLevel = Math.max(...formula.map((s) => s.maxInternalLevel));
  const normalized = ((maxLevel - 1) / (CEILING_MAX - 1)) * 100;
  return Math.min(100, Math.max(0, normalized));
}

function computeStability(sessions: SessionForReadiness[]): number {
  const formula = sessions.filter((s) => s.mode === 'formula');
  if (formula.length === 0) return 0;
  const now = new Date();
  const dailyAcc: number[] = [];
  for (let i = 0; i < STABILITY_DAYS; i++) {
    const dayStart = new Date(now);
    dayStart.setUTCDate(dayStart.getUTCDate() - i);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
    const daySessions = formula.filter(
      (s) => s.createdAt >= dayStart && s.createdAt < dayEnd
    );
    let dayAcc = 0;
    if (daySessions.length > 0) {
      const totalCorrect = daySessions.reduce((a, s) => a + s.correctCount, 0);
      const totalQuestions = daySessions.reduce((a, s) => a + s.totalQuestions, 0);
      dayAcc = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
    }
    dailyAcc.push(dayAcc);
  }
  const sma = dailyAcc.reduce((a, b) => a + b, 0) / STABILITY_DAYS;
  return Math.min(100, Math.max(0, sma * 100));
}

function computeFrequency(sessions: SessionForReadiness[]): number {
  const cutoff = new Date(Date.now() - FREQUENCY_HOURS * 60 * 60 * 1000);
  const count = sessions.filter((s) => s.createdAt >= cutoff).length;
  const normalized = (Math.min(count, FREQUENCY_CAP) / FREQUENCY_CAP) * 100;
  return Math.min(100, Math.max(0, normalized));
}

export async function calculateReadiness(userId: string | null): Promise<ReadinessResult> {
  if (!userId) return null;

  const sessions = await db.session.findMany({
    where: { userId },
    select: {
      mode: true,
      correctCount: true,
      totalQuestions: true,
      maxInternalLevel: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  if (sessions.length === 0) return null;

  const pillars: ReadinessPillars = {
    accuracy: computeAccuracy(sessions),
    ceiling: computeCeiling(sessions),
    stability: computeStability(sessions),
    frequency: computeFrequency(sessions),
  };

  const index =
    WEIGHTS.accuracy * pillars.accuracy +
    WEIGHTS.ceiling * pillars.ceiling +
    WEIGHTS.stability * pillars.stability +
    WEIGHTS.frequency * pillars.frequency;

  return {
    index: Math.round(index * 10) / 10,
    pillars,
    sessionCount: sessions.length,
  };
}
