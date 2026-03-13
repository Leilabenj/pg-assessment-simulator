import { fetchDashboardData } from '@/app/actions/fetch-dashboard';
import { DashboardView } from '@/app/components/DashboardView';

export default async function DashboardPage() {
  const data = await fetchDashboardData();

  if (data === null) {
    return (
      <main className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg mb-2">
            Sign in to view your performance dashboard.
          </p>
          <p className="text-slate-500 text-sm">Use the Sign In button above.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 sm:p-6">
      <DashboardView data={data} />
    </main>
  );
}
