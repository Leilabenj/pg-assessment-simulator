'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export type DashboardViewData = {
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
};

const PILLAR_LABELS: Record<string, string> = {
  accuracy: 'Accuracy',
  ceiling: 'Ceiling',
  stability: 'Stability',
  frequency: 'Frequency',
};

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number | null;
  subtitle?: string;
}) {
  const displayValue = value != null ? value : '—';
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="text-slate-400 text-sm font-medium mb-1">{title}</div>
      <div className="text-2xl font-bold text-blue-400">{displayValue}</div>
      {subtitle && <div className="text-slate-500 text-xs mt-1">{subtitle}</div>}
    </div>
  );
}

export function DashboardView({ data }: { data: DashboardViewData }) {
  const pillarsData =
    data.readiness?.pillars != null
      ? Object.entries(data.readiness.pillars).map(([key, value]) => ({
          subject: PILLAR_LABELS[key] ?? key,
          value: Math.round(value),
          fullMark: 100,
        }))
      : [];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-slate-100">Performance Dashboard</h1>

        {/* Readiness Index */}
        {data.readiness != null && (
          <section>
            <h2 className="text-lg font-semibold text-slate-300 mb-3">Readiness Index</h2>
            <div className="flex items-baseline gap-4 flex-wrap">
              <div className="text-5xl font-bold text-blue-400">
                {data.readiness.index.toFixed(1)}
              </div>
              <div className="text-slate-400 text-sm">
                {data.readiness.sessionCount} sessions
              </div>
            </div>
          </section>
        )}

        {/* Metrics row */}
        <section>
          <h2 className="text-lg font-semibold text-slate-300 mb-3">Formula Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard
              title="Efficiency SMA"
              value={
                data.metrics?.efficiencySma != null
                  ? data.metrics.efficiencySma.toFixed(2)
                  : null
              }
              subtitle="7-session moving average"
            />
            <MetricCard
              title="Level Stability"
              value={
                data.metrics?.levelStability != null
                  ? `${(data.metrics.levelStability * 100).toFixed(0)}%`
                  : null
              }
              subtitle="1 - (Lmax-Lmin)/Lmax"
            />
          </div>
        </section>

        {/* Readiness Pillars - Radar Chart */}
        {pillarsData.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-300 mb-3">
              Readiness Pillars
            </h2>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="h-64 min-h-[256px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={256}>
                  <RadarChart data={pillarsData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke="#475569" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                    />
                    <Radar
                      name="Readiness"
                      dataKey="value"
                      stroke="#60a5fa"
                      fill="#60a5fa"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        {/* Readiness Pillars - Bar Chart (alternate view) */}
        {pillarsData.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-300 mb-3">
              Pillars Breakdown
            </h2>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="h-48 min-h-[192px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={192}>
                  <BarChart data={pillarsData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                    <YAxis
                      type="category"
                      dataKey="subject"
                      width={80}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Bar dataKey="value" fill="#60a5fa" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        {!data.readiness && !data.metrics && (
          <div className="text-center text-slate-500 py-12">
            No session data yet. Complete some challenges to see your metrics.
          </div>
        )}
      </div>
    </div>
  );
}
