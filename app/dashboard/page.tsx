import { DashboardView } from '@/app/components/DashboardView';

/** Mock data for first iteration - no backend sync yet */
const MOCK_DASHBOARD_DATA = {
  metrics: {
    efficiencySma: 4.82,
    levelStability: 0.85,
  },
  readiness: {
    index: 67.2,
    pillars: {
      accuracy: 78,
      ceiling: 65,
      stability: 72,
      frequency: 45,
    },
    sessionCount: 12,
  },
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 sm:p-6">
      <DashboardView data={MOCK_DASHBOARD_DATA} />
    </main>
  );
}
