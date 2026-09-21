import { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Button, Badge, StatusDot, Tabs, AreaChart, ProgressBar, DonutChart, Modal, CopyButton, Breadcrumb, Toast } from '@/components/ui';
import { useRouter } from '@/lib/router';

const clickData7  = [95, 140, 120, 185, 210, 175, 428];
const clickData30 = [80,90,110,75,130,155,120,165,140,180,200,175,220,195,240,215,260,245,280,255,300,320,295,340,310,350,380,360,410,428];

const referrers = [{ label: 'Google', value: 1842 }, { label: 'Direct', value: 1254 }, { label: 'Instagram', value: 873 }, { label: 'Facebook', value: 512 }, { label: 'Other', value: 340 }];
const locations = [{ label: 'United States', value: 2140 }, { label: 'United Kingdom', value: 731 }, { label: 'Germany', value: 524 }, { label: 'Canada', value: 418 }, { label: 'Australia', value: 312 }];

export function LinkDetailsPage() {
  const { navigate } = useRouter();
  const [range, setRange] = useState('7d');
  const [qrModal, setQrModal] = useState(false);
  const [toast, setToast] = useState('');

  const chartData = range === '7d' ? clickData7 : clickData30;

  return (
    <DashboardLayout>
      {toast && <Toast message={toast} type="success" onClose={() => setToast('')}/>}

      <Modal open={qrModal} onClose={() => setQrModal(false)} title="QR code" size="sm">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 border border-border">
            <svg width="160" height="160" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              {[0,8,16,24,32,40,48,56,64,72].map((x) =>
                [0,8,16,24,32,40,48,56,64,72].map((y) => {
                  const on = ((x * 7 + y * 3 + 13) % 5) < 2 || (x < 24 && y < 24) || (x > 48 && y < 24) || (x < 24 && y > 48);
                  return on ? <rect key={`${x}-${y}`} x={x} y={y} width="7" height="7" fill="#111827"/> : null;
                })
              )}
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-brand" style={{ fontFamily: 'var(--font-mono)' }}>247url.com/launch26</p>
            <p className="text-xs text-text-muted mt-1.5 max-w-xs">Share this QR code on print, packaging, presentations, or signage.</p>
          </div>
          <div className="flex gap-2 w-full">
            <Button variant="secondary" size="sm" fullWidth leftIcon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}>PNG</Button>
            <Button variant="secondary" size="sm" fullWidth leftIcon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}>SVG</Button>
            <CopyButton value="https://247url.com/launch26" label="Copy URL"/>
          </div>
        </div>
      </Modal>

      <div className="max-w-[1080px] mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: 'Links', onClick: () => navigate('/dashboard/links') }, { label: '247url.com/launch26' }]}/>

        {/* Link header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-5 mb-7">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-brand" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.01em' }}>
                247url.com/launch26
              </h1>
              <Badge variant="success"><StatusDot status="active"/>Active</Badge>
            </div>
            <p className="text-sm text-text-muted mt-1.5">Created Sep 14, 2024 · Expires Dec 31, 2026</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <CopyButton value="https://247url.com/launch26" label="Copy link"/>
            <Button variant="secondary" size="sm" onClick={() => setQrModal(true)}
              leftIcon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>}>
              QR code
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard/links/create')}>Edit</Button>
            <Button variant="danger" size="sm">Disable</Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Destination */}
            <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-xs)]">
              <p className="text-xs font-medium text-text-muted mb-2">Destination</p>
              <p className="text-sm text-text-primary break-all mb-3">https://example.com/products/summer-launch</p>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/links/create')}>Edit destination</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[{ label: 'Total clicks', value: '4,821' }, { label: 'Unique visitors', value: '3,192' }, { label: 'Avg. daily', value: '71' }].map((s) => (
                <div key={s.label} className="bg-surface border border-border rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-xs)]">
                  <p className="text-[10px] text-text-muted mb-1">{s.label}</p>
                  <p className="text-xl font-bold text-text-primary" style={{ letterSpacing: '-0.025em' }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-xs)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-text-primary">Clicks over time</h2>
                <Tabs tabs={[{ id: '7d', label: '7d' }, { id: '30d', label: '30d' }, { id: '90d', label: '90d' }]} active={range} onChange={setRange}/>
              </div>
              <AreaChart data={chartData} height={120} color="#4F46E5"/>
            </div>

            {/* Referrers */}
            <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-xs)]">
              <h2 className="text-sm font-semibold text-text-primary mb-4">Top referrers</h2>
              <div className="flex flex-col gap-2.5">
                {referrers.map((r) => <ProgressBar key={r.label} label={r.label} value={r.value} max={referrers[0].value} color="#4F46E5"/>)}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {/* Devices */}
            <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-xs)]">
              <h2 className="text-sm font-semibold text-text-primary mb-4">Devices</h2>
              <DonutChart size={80} segments={[
                { label: 'Desktop', value: 2580, color: '#4F46E5' },
                { label: 'Mobile',  value: 1894, color: '#7C3AED' },
                { label: 'Tablet',  value:  347, color: '#CBD5E1' },
              ]}/>
            </div>

            {/* Countries */}
            <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-xs)]">
              <h2 className="text-sm font-semibold text-text-primary mb-4">Countries</h2>
              <div className="flex flex-col gap-2.5">
                {locations.map((l) => <ProgressBar key={l.label} label={l.label} value={l.value} max={locations[0].value} color="#7C3AED"/>)}
              </div>
              <p className="mt-4 text-[10px] text-text-muted">Country data is collected at request time. Precise location data is never stored.</p>
            </div>

            {/* Metadata */}
            <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-xs)]">
              <h2 className="text-sm font-semibold text-text-primary mb-3">Details</h2>
              {[
                { label: 'Tags', value: 'campaign, product' },
                { label: 'Title', value: 'Product launch 2026' },
                { label: 'Short code', value: 'launch26' },
                { label: 'Created', value: 'Sep 14, 2024' },
                { label: 'Last clicked', value: '2 min ago' },
              ].map((d) => (
                <div key={d.label} className="flex items-start justify-between gap-2 py-2 border-b border-border last:border-0">
                  <span className="text-xs text-text-muted">{d.label}</span>
                  <span className="text-xs text-text-primary font-medium text-right">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
