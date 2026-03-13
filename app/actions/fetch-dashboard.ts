'use server';

import { getOrCreateUser } from '@/lib/auth';
import { getDashboardMetrics } from '@/lib/dashboard-metrics';
import { calculateReadiness } from '@/lib/readiness';

export type DashboardData = {
  metrics: {
    efficiencySma: number | null;
    levelStability: number | null;
  } | null;
  readiness: {
    index: number;
    pillars: {
      accuracy: number;
      ceiling: number;
      stability: number;
      frequency: number;
    };
    sessionCount: number;
  } | null;
} | null;

export async function fetchDashboardData(): Promise<DashboardData> {
  const user = await getOrCreateUser();
  if (!user?.id) return null;

  const [metrics, readiness] = await Promise.all([
    getDashboardMetrics(user.id),
    calculateReadiness(user.id),
  ]);

  return {
    metrics,
    readiness: readiness ? { ...readiness } : null,
  };
}
