import { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, Button, Tabs, AreaChart, Badge, StatusDot, CopyButton, Toast, Dropdown } from '@/components/ui';
import { useRouter } from '@/lib/router';

const clickData7  = [95, 140, 120, 185, 210, 175, 428];
const clickData30 = [80, 90, 110, 75, 130, 155, 120, 165, 140, 180, 200, 175, 220, 195, 240, 215, 260, 245, 280, 255, 300, 320, 295, 340, 310, 350, 380, 360, 410, 428];

const topLinks = [
  { short: 'summer',   dest: 'example.com/summer-sale-2024',    clicks: 4821, trend: '+24%', date: 'Aug 12', status: 'active'   as const },
  { short: 'product',  dest: 'example.com/products/launch',     clicks: 2438, trend: '+8%',  date: 'Sep 10', status: 'active'   as const },
  { short: 'launch26', dest: 'example.com/launch/2026',         clicks: 1895, trend: '+41%', date: 'Sep 14', status: 'active'   as const },
  { short: 'docs-v2',  dest: 'docs.example.com/v2/guide',       clicks:  924, trend: '+3%',  date: 'Sep 1',  status: 'active'   as const },
  { short: 'promo-oct',dest: 'example.com/promo-oct',           clicks:  312, trend: '—',    date: 'Sep 18', status: 'disabled' as const },
];

const activity = [
  { color: '#16A34A', label: 'Link created',         sub: '247url.com/launch26',                time: '2 min ago'  },
  { color: '#4F46E5', label: 'Destination updated',  sub: '247url.com/summer → new destination', time: '1h ago'     },
  { color: '#94A3B8', label: 'QR code generated',    sub: '247url.com/product',                 time: '3h ago'     },
  { color: '#DC2626', label: 'Link disabled',         sub: '247url.com/promo-oct',               time: 'Yesterday'  },
];

const icons = {
  link:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  chart:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  clock:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  check:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
};

export function DashboardOverview() {
  const { navigate } = useRouter();
  const [range, setRange] = useState('7d');
  const [toast, setToast] = useState('');

  const chartData = range === '7d' ? clickData7 : clickData30;

  return (
    <DashboardLayout>
      {toast && <Toast message={toast} type="success" onClose={() => setToast('')}/>}

      <div className="max-w-[1080px] mx-auto px-6 py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
          <div>
            <p className="text-xs text-text-muted mb-1">Monday, September 21</p>
            <h1 className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-0.025em' }}>Good morning, Alex.</h1>
            <p className="text-sm text-text-secondary mt-1">Manage your links and understand how they're performing.</p>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate('/dashboard/links/create')}
            leftIcon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>}>
            Create link
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total links"    value="124"    trend="8 this month"          trendUp icon={icons.link}/>
          <StatCard label="Total clicks"   value="18,492" trend="+12.4% vs last month"  trendUp icon={icons.chart}/>
          <StatCard label="Clicks today"   value="428"    trend="+6.2% vs yesterday"    trendUp icon={icons.clock}/>
          <StatCard label="Active links"   value="117"    trend="7 inactive"             trendUp={false} icon={icons.check}/>
        </div>

        {/* Clicks chart */}
        <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-5 mb-5 shadow-[var(--shadow-xs)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Clicks over time</h2>
              <p className="text-xs text-text-muted mt-0.5">All links · {range === '7d' ? '1,353' : '6,892'} total</p>
            </div>
            <Tabs tabs={[{ id: '7d', label: '7 days' }, { id: '30d', label: '30 days' }, { id: '90d', label: '90 days' }]} active={range} onChange={setRange}/>
          </div>
          <AreaChart data={chartData} height={130} color="#4F46E5"/>
        </div>

        {/* Two-col */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Top links table */}
          <div className="lg:col-span-2 bg-surface border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-xs)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary">Top performing links</h2>
              <button onClick={() => navigate('/dashboard/links')} className="text-xs text-brand hover:underline">View all →</button>
            </div>
            <div className="divide-y divide-border">
              {topLinks.map((link) => (
                <div key={link.short} className="flex items-center gap-4 px-5 py-3 hover:bg-canvas transition-colors group">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <button onClick={() => navigate('/dashboard/links/detail')}
                        className="text-sm font-medium text-brand hover:underline" style={{ fontFamily: 'var(--font-mono)' }}>
                        247url.com/{link.short}
                      </button>
                    </div>
                    <p className="text-xs text-text-muted truncate">{link.dest}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-text-primary">{link.clicks.toLocaleString()}</p>
                      <p className="text-[10px] text-success font-medium">{link.trend}</p>
                    </div>
                    <Badge variant={link.status === 'active' ? 'success' : 'muted'}>
                      <StatusDot status={link.status}/>
                      {link.status === 'active' ? 'Active' : 'Disabled'}
                    </Badge>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton value={`https://247url.com/${link.short}`}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-xs)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary">Recent activity</h2>
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              {activity.map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: item.color }}/>
                  <div className="min-w-0">
                    <p className="text-sm text-text-primary font-medium">{item.label}</p>
                    <p className="text-xs text-text-muted mt-0.5 truncate">{item.sub}</p>
                    <p className="text-[10px] text-text-muted mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
