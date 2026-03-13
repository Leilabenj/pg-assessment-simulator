import { db } from '@/lib/db';
import { computeEfficiencySMA } from '@/lib/efficiency';
import type { SessionWithAttempts } from '@/lib/efficiency';

export type DashboardMetrics = {
  efficiencySma: number | null;
  levelStability: number | null;
};

export type GetDashboardMetricsResult = DashboardMetrics | null;

const LEVEL_STABILITY_WINDOW = 10;

function computeLevelStability(
  sessions: { mode: string; maxInternalLevel: number }[]
): number | null {
  const formula = sessions
    .filter((s) => s.mode === 'formula')
    .slice(0, LEVEL_STABILITY_WINDOW);
  if (formula.length === 0) return null;
  const levels = formula.map((s) => s.maxInternalLevel);
  const Lmax = Math.max(...levels);
  const Lmin = Math.min(...levels);
  if (Lmax === 0) return 0;
  const stability = 1 - (Lmax - Lmin) / Lmax;
  return Math.min(1, Math.max(0, stability));
}

export async function getDashboardMetrics(
  userId: string | null
): Promise<GetDashboardMetricsResult> {
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

  const efficiencySmaResult = computeEfficiencySMA(sessions as SessionWithAttempts[]);
  const levelStability = computeLevelStability(sessions);

  return {
    efficiencySma: efficiencySmaResult?.sma ?? null,
    levelStability,
  };
}
