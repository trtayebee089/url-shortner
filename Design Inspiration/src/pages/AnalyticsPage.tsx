import { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, Tabs, AreaChart, ProgressBar, DonutChart, BarChart } from '@/components/ui';

const clickData7  = [312, 428, 395, 510, 480, 560, 618];
const clickData30 = [180,220,195,260,245,310,285,340,320,380,365,420,395,460,440,490,465,520,498,540,510,560,535,590,565,610,588,625,600,618];

const referrers  = [{ label: 'Google', value: 7240 }, { label: 'Direct', value: 5120 }, { label: 'Instagram', value: 2840 }, { label: 'Twitter/X', value: 1560 }, { label: 'Facebook', value: 980 }];
const countries  = [{ label: 'United States', value: 8420 }, { label: 'United Kingdom', value: 2840 }, { label: 'Germany', value: 1920 }, { label: 'Canada', value: 1560 }, { label: 'Australia', value: 1240 }];
const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  const chartData = range === '7d' ? clickData7 : clickData30;

  return (
    <DashboardLayout>
      <div className="max-w-[1080px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
          <div>
            <h1 className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-0.025em' }}>Analytics</h1>
            <p className="text-sm text-text-secondary mt-1">Understand how people interact with your links.</p>
          </div>
          <Tabs
            tabs={[{ id: '7d', label: 'Last 7 days' }, { id: '30d', label: 'Last 30 days' }, { id: '90d', label: 'Last 90 days' }]}
            active={range} onChange={setRange}/>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total clicks"     value={range === '7d' ? '3,303' : '18,492'} trend="+5.2% vs prev" trendUp/>
          <StatCard label="Unique visitors"  value={range === '7d' ? '2,418' : '13,841'} trend="+8.1% vs prev" trendUp/>
          <StatCard label="Avg. clicks/link" value="149"/>
          <StatCard label="Top referrer"     value="Google"/>
        </div>

        {/* Main chart */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-5 mb-5 shadow-[var(--shadow-xs)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Clicks over time</h2>
              <p className="text-xs text-text-muted mt-0.5">All links combined</p>
            </div>
          </div>
          <AreaChart data={chartData} height={160} color="#4F46E5"/>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-xs)]">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Devices</h2>
            <DonutChart size={80} segments={[
              { label: 'Desktop', value: 9840, color: '#4F46E5' },
              { label: 'Mobile',  value: 7213, color: '#7C3AED' },
              { label: 'Tablet',  value: 1439, color: '#CBD5E1' },
            ]}/>
          </div>

          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-xs)]">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Browsers</h2>
            <DonutChart size={80} segments={[
              { label: 'Chrome',  value: 10240, color: '#4F46E5' },
              { label: 'Safari',  value: 5120,  color: '#7C3AED' },
              { label: 'Firefox', value: 1980,  color: '#94A3B8' },
              { label: 'Other',   value: 1152,  color: '#E2E8F0' },
            ]}/>
          </div>

          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-xs)]">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Clicks by day</h2>
            <BarChart data={[320,495,428,510,580,390,270]} labels={weekLabels} height={100} color="#4F46E5"/>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-xs)]">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Top referrers</h2>
            <div className="flex flex-col gap-2.5">
              {referrers.map((r) => <ProgressBar key={r.label} label={r.label} value={r.value} max={referrers[0].value} color="#4F46E5"/>)}
            </div>
          </div>
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-xs)]">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Top countries</h2>
            <div className="flex flex-col gap-2.5">
              {countries.map((c) => <ProgressBar key={c.label} label={c.label} value={c.value} max={countries[0].value} color="#7C3AED"/>)}
            </div>
            <p className="mt-4 text-[10px] text-text-muted">Country data derived from request metadata. Precise location is never stored.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
