import { useState } from 'react';
import { MarketingLayout } from '@/layouts/MarketingLayout';
import { Button } from '@/components/ui';
import { useRouter } from '@/lib/router';

// ─── tiny SVG icons ───────────────────────────────────────────────────────────
const Icon = ({ d, className = '' }: { d: string; className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d={d} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Product UI preview (hero) ─────────────────────────────────────────────────
function ProductPreview() {
  const data = [40, 55, 38, 70, 82, 65, 90, 78, 95, 88, 102, 115];
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 80}`).join(' ');
  const area = `${pts} 100,100 0,100`;

  return (
    <div className="w-full rounded-[var(--radius-xl)] border border-border bg-surface shadow-[var(--shadow-md)] overflow-hidden">
      {/* Window chrome */}
      <div className="h-9 bg-surface2 border-b border-border flex items-center px-4 gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-border-strong"/>
        <span className="w-2.5 h-2.5 rounded-full bg-border-strong"/>
        <span className="w-2.5 h-2.5 rounded-full bg-border-strong"/>
        <span className="ml-3 text-xs text-text-muted font-mono">247url.com/dashboard</span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-40 border-r border-border bg-surface flex-shrink-0 py-3 px-2 flex flex-col gap-0.5 hidden sm:flex">
          {[['Links', true], ['Analytics', false], ['Settings', false]].map(([l, active]) => (
            <div key={String(l)} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-xs ${active ? 'bg-brand-light text-brand font-medium' : 'text-text-muted'}`}>
              <span className="w-3 h-3 rounded-sm bg-current opacity-40 flex-shrink-0"/>
              {String(l)}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col gap-4 min-w-0">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[['124', 'Total links'], ['18.4k', 'Total clicks'], ['92', 'Active']].map(([v, l]) => (
              <div key={String(l)} className="bg-canvas rounded-[var(--radius-md)] border border-border p-3">
                <p className="text-xs text-text-muted">{String(l)}</p>
                <p className="text-lg font-bold text-text-primary mt-0.5" style={{ letterSpacing: '-0.025em' }}>{String(v)}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-canvas rounded-[var(--radius-md)] border border-border p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary">Clicks over time</span>
              <span className="text-xs text-text-muted">Last 30 days</span>
            </div>
            <svg viewBox="0 0 100 60" className="w-full h-16" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pp-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <polygon points={area} fill="url(#pp-grad)"/>
              <polyline points={pts} fill="none" stroke="#4F46E5" strokeWidth="1.5"/>
            </svg>
          </div>

          {/* Links table */}
          <div className="flex flex-col gap-1">
            {[
              { alias: '/summer', dest: 'promo.brand.com/summer', clicks: '4,821', status: 'Active' },
              { alias: '/docs',   dest: 'docs.example.com',        clicks: '2,103', status: 'Active' },
              { alias: '/q1',     dest: 'old.example.com/q1',       clicks: '891',   status: 'Expired' },
            ].map((row) => (
              <div key={row.alias} className="flex items-center justify-between gap-2 py-1.5 border-b border-border last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold text-brand font-mono shrink-0">247url.com{row.alias}</span>
                  <span className="text-xs text-text-muted truncate hidden md:block">→ {row.dest}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-text-muted">{row.clicks}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${row.status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{row.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics showcase ────────────────────────────────────────────────────────
function AnalyticsShowcase() {
  const bars = [38, 52, 45, 68, 72, 60, 85, 79, 91, 88, 96, 102, 110, 98, 115];
  const max = Math.max(...bars);

  return (
    <div className="w-full rounded-[var(--radius-xl)] border border-border bg-surface shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-text-primary">Link analytics</h4>
          <p className="text-xs text-text-muted mt-0.5">Last 30 days</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xl font-bold text-text-primary" style={{ letterSpacing: '-0.025em' }}>12,482</p>
            <p className="text-xs text-text-muted">clicks</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-text-primary" style={{ letterSpacing: '-0.025em' }}>8,921</p>
            <p className="text-xs text-text-muted">visitors</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-success" style={{ letterSpacing: '-0.025em' }}>+18.4%</p>
            <p className="text-xs text-text-muted">vs. prior</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        {/* Bar chart */}
        <div className="flex items-end gap-1 h-28 mb-4">
          {bars.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <div
                className="rounded-t-sm transition-all"
                style={{
                  height: `${(v / max) * 100}%`,
                  background: i === bars.length - 1 ? '#4F46E5' : 'rgba(79,70,229,0.18)',
                }}
              />
            </div>
          ))}
        </div>
        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
          {[
            { label: 'Top referrer', value: 'twitter.com', sub: '4,201 clicks' },
            { label: 'Top device', value: 'Mobile', sub: '62% of traffic' },
            { label: 'Top country', value: 'United States', sub: '58% of visitors' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] text-text-muted uppercase tracking-[0.08em] mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-text-primary">{item.value}</p>
              <p className="text-xs text-text-muted">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── QR code preview ──────────────────────────────────────────────────────────
function QRPreview() {
  const cells: [number, number][] = [];
  // Simplified deterministic QR-like grid
  const pattern = [
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,0,1,1,0],
    [0,1,0,0,1,0,0,0,1,0,0,1,0,1,0,0,1],
    [1,1,1,1,1,1,1,0,0,0,1,0,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,0,1,0,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,1,1,0],
    [1,0,1,1,1,0,1,0,1,0,1,1,0,1,0,0,1],
    [1,0,1,1,1,0,1,0,0,0,0,0,1,0,1,0,0],
    [1,1,1,1,1,1,1,0,1,1,0,1,0,0,1,1,1],
  ];

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="bg-surface border border-border rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-sm)]">
        <div className="text-[10px] text-text-muted uppercase tracking-widest mb-3 text-center">QR code</div>
        <div className="grid gap-px bg-border p-3 rounded-[var(--radius-md)] bg-surface" style={{ gridTemplateColumns: `repeat(17, 1fr)`, width: 136 }}>
          {pattern.flat().map((cell, i) => (
            <div key={i} style={{ width: 7, height: 7, background: cell ? '#111827' : 'transparent' }}/>
          ))}
        </div>
        <p className="text-xs text-center text-text-muted mt-3 font-mono">247url.com/summer</p>
      </div>
      <div className="flex gap-2">
        <div className="px-3 py-1.5 bg-brand text-white text-xs font-medium rounded-[var(--radius-sm)]">Download PNG</div>
        <div className="px-3 py-1.5 bg-surface border border-border text-text-secondary text-xs font-medium rounded-[var(--radius-sm)]">Download SVG</div>
      </div>
    </div>
  );
}

// ─── Code panel ──────────────────────────────────────────────────────────────
function CodePanel() {
  const [tab, setTab] = useState<'request' | 'response'>('request');

  const req = `POST /api/v1/links HTTP/1.1
Host: api.247url.com
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "destination_url": "https://example.com/campaign",
  "custom_alias": "summer"
}`;

  const res = `HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "lnk_7k2m9p4",
  "short_url": "https://247url.com/summer",
  "destination_url": "https://example.com/campaign",
  "custom_alias": "summer",
  "created_at": "2026-09-21T09:00:00Z",
  "clicks": 0,
  "status": "active"
}`;

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-[#0F172A] overflow-hidden shadow-[var(--shadow-md)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex gap-2">
          {(['request', 'response'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`text-xs font-medium px-3 py-1.5 rounded-[var(--radius-sm)] transition-all capitalize ${tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white/20"/>
          <span className="text-[10px] text-white/30 font-mono">POST /api/v1/links</span>
        </div>
      </div>
      <pre className="p-4 text-xs text-[#94A3B8] font-mono leading-relaxed overflow-x-auto">
        <code>
          {tab === 'request' ? (
            <>
              <span className="text-[#38BDF8]">POST</span>{' '}
              <span className="text-[#A5B4FC]">/api/v1/links</span>
              {'\n'}
              {req.split('\n').slice(1).map((line, i) => {
                if (line.includes('Authorization:')) {
                  const [key, ...rest] = line.split(': ');
                  return <span key={i}>{'\n'}<span className="text-[#C084FC]">{key}</span>: <span className="text-[#86EFAC]">{rest.join(': ')}</span></span>;
                }
                if (line.startsWith('{') || line.startsWith('}')) return <span key={i}>{'\n'}{line}</span>;
                if (line.includes('"')) {
                  return <span key={i}>{'\n'}{line.replace(/"([^"]+)":/g, (_, k) => `"${k}":`).replace(/"([^"]+)"(?=[,\s]|$)/g, (match) => match)}</span>;
                }
                return <span key={i}>{'\n'}{line}</span>;
              })}
            </>
          ) : (
            <>
              <span className="text-[#86EFAC]">HTTP/1.1 201 Created</span>
              {'\n'}{res.split('\n').slice(1).join('\n')}
            </>
          )}
        </code>
      </pre>
    </div>
  );
}

// ─── Link creation UI ─────────────────────────────────────────────────────────
function CreateLinkUI() {
  return (
    <div className="bg-surface rounded-[var(--radius-xl)] border border-border shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <p className="text-xs font-semibold text-text-primary">Create a short link</p>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1.5">Destination URL</label>
          <div className="flex items-center gap-2 bg-canvas border border-border rounded-[var(--radius-md)] px-3 py-2 text-sm font-mono text-text-muted">
            https://example.com/summer-campaign-2026-final
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1.5">Custom alias <span className="text-text-muted font-normal">(optional)</span></label>
          <div className="flex items-center gap-0 bg-canvas border border-brand/40 ring-2 ring-brand/10 rounded-[var(--radius-md)] overflow-hidden">
            <span className="px-3 py-2 text-sm text-text-muted border-r border-border bg-surface2">247url.com/</span>
            <span className="px-3 py-2 text-sm font-semibold text-brand flex-1">summer</span>
          </div>
        </div>
        <div className="pt-1">
          <div className="w-full bg-brand text-white text-sm font-medium py-2.5 rounded-[var(--radius-md)] text-center">
            Create link
          </div>
        </div>
      </div>
      {/* Result */}
      <div className="px-5 pb-5">
        <div className="bg-brand-light border border-brand-mid rounded-[var(--radius-md)] p-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-widest mb-0.5">Your short link</p>
            <p className="text-sm font-bold text-brand font-mono">247url.com/summer</p>
          </div>
          <div className="flex gap-1.5">
            <div className="p-1.5 bg-surface border border-border rounded-[var(--radius-sm)] cursor-pointer">
              <svg className="w-3.5 h-3.5 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Link management table ─────────────────────────────────────────────────────
function ManageTable() {
  const links = [
    { alias: '/summer', dest: 'example.com/summer-campaign', clicks: 4821, status: 'Active' },
    { alias: '/product', dest: 'brand.com/new-product', clicks: 2103, status: 'Active' },
    { alias: '/q1-report', dest: 'docs.example.com/q1', clicks: 891, status: 'Expired' },
    { alias: '/promo', dest: 'old.brand.com/promo', clicks: 234, status: 'Disabled' },
  ];

  const statusStyle: Record<string, string> = {
    Active: 'bg-success/10 text-success',
    Expired: 'bg-warning/10 text-warning',
    Disabled: 'bg-text-muted/10 text-text-muted',
  };

  return (
    <div className="bg-surface border border-border rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <p className="text-xs font-semibold text-text-primary">Links</p>
        <div className="flex gap-1.5">
          <div className="px-3 py-1 text-xs bg-canvas border border-border rounded-[var(--radius-sm)] text-text-muted">All</div>
          <div className="px-3 py-1 text-xs bg-canvas border border-border rounded-[var(--radius-sm)] text-text-muted">Active</div>
        </div>
      </div>
      <div className="divide-y divide-border">
        {links.map((row) => (
          <div key={row.alias} className="flex items-center gap-3 px-5 py-3 hover:bg-canvas transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-brand font-mono">247url.com{row.alias}</p>
              <p className="text-xs text-text-muted truncate mt-0.5">{row.dest}</p>
            </div>
            <p className="text-xs text-text-muted w-12 text-right">{row.clicks.toLocaleString()}</p>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${statusStyle[row.status]}`}>{row.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Domain comparison ────────────────────────────────────────────────────────
function DomainComparison() {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-canvas border border-border rounded-[var(--radius-lg)] p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-surface2 border border-border rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0">
          <span className="text-xs text-text-muted">↗</span>
        </div>
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-0.5">Default domain</p>
          <p className="text-sm font-mono font-semibold text-text-primary">247url.com/<span className="text-brand">summer</span></p>
        </div>
      </div>
      <div className="text-center text-xs text-text-muted">vs.</div>
      <div className="bg-brand-light border border-brand-mid rounded-[var(--radius-lg)] p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-brand/10 border border-brand/20 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0">
          <span className="text-xs text-brand">↗</span>
        </div>
        <div>
          <p className="text-[10px] text-brand/60 uppercase tracking-widest mb-0.5">Custom domain</p>
          <p className="text-sm font-mono font-semibold text-text-primary">go.yourbrand.com/<span className="text-brand">summer</span></p>
        </div>
      </div>

      <div className="mt-2 bg-surface border border-border rounded-[var(--radius-lg)] overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-semibold text-text-primary">Domain configuration</p>
        </div>
        <div className="p-4 flex flex-col gap-2">
          {[
            { type: 'CNAME', host: 'go', value: 'cname.247url.com', status: '✓' },
          ].map((rec) => (
            <div key={rec.host} className="grid grid-cols-4 text-[11px] gap-2 font-mono">
              <span className="text-brand font-semibold">{rec.type}</span>
              <span className="text-text-secondary">{rec.host}</span>
              <span className="text-text-muted truncate">{rec.value}</span>
              <span className="text-success text-right">{rec.status} Verified</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Feature comparison table ─────────────────────────────────────────────────
const comparisonRows = [
  { feature: 'Short links',        free: '50',        pro: 'Unlimited', biz: 'Unlimited' },
  { feature: 'Custom aliases',     free: '—',         pro: '✓',         biz: '✓' },
  { feature: 'Analytics',          free: 'Basic',     pro: 'Advanced',  biz: 'Advanced' },
  { feature: 'QR codes',           free: 'PNG',       pro: 'PNG + SVG', biz: 'PNG + SVG' },
  { feature: 'API access',         free: '—',         pro: '✓',         biz: '✓' },
  { feature: 'Custom domains',     free: '—',         pro: '1',         biz: '5' },
  { feature: 'Advanced analytics', free: '—',         pro: '✓',         biz: '✓' },
  { feature: 'Team features',      free: '—',         pro: '—',         biz: '✓' },
];

// ─── Main page ────────────────────────────────────────────────────────────────
export function FeaturesPage() {
  const { navigate } = useRouter();

  return (
    <MarketingLayout>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-16 bg-canvas">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand mb-4">
                Everything you need to manage modern links
              </p>
              <h1 className="text-5xl lg:text-6xl font-bold text-text-primary leading-[1.05] mb-5" style={{ letterSpacing: '-0.035em' }}>
                Short links,<br/>without the busywork.
              </h1>
              <p className="text-lg text-text-secondary leading-relaxed mb-8">
                Create branded short links, manage destinations, understand every click, and connect 247URL to the tools you already use.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" size="lg" onClick={() => navigate('/register')}>Create a free account</Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/dashboard')}>Explore the platform</Button>
              </div>
            </div>
            <div className="lg:pl-4">
              <ProductPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature overview ──────────────────────────────────────────── */}
      <section className="py-20 border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-text-primary" style={{ letterSpacing: '-0.025em' }}>
              One platform. Every part of the link lifecycle.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {[
              { num: '01', tag: 'Shorten', title: 'Turn long URLs into clean, memorable links.', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
              { num: '02', tag: 'Manage', title: 'Edit destinations, organize links, and control their lifecycle.', icon: 'M4 6h16M4 10h16M4 14h16M4 18h7' },
              { num: '03', tag: 'Analyze', title: 'Understand clicks, visitors, referrers, devices, and trends.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { num: '04', tag: 'Share', title: 'Generate QR codes and distribute links across channels.', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z' },
              { num: '05', tag: 'Automate', title: 'Use the API to create and manage links programmatically.', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
              { num: '06', tag: 'Brand', title: 'Connect custom domains and create links that match your brand.', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9' },
            ].map((item) => (
              <div key={item.num} className="bg-surface p-7 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-text-muted">{item.num}</span>
                  <span className="w-px h-3 bg-border"/>
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand">{item.tag}</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand-light rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0">
                    <Icon d={item.icon} className="text-brand"/>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shorten ───────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border bg-canvas">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand mb-3">Shorten</p>
              <h2 className="text-4xl font-bold text-text-primary leading-[1.1] mb-4" style={{ letterSpacing: '-0.03em' }}>
                From long and messy<br/>to clean and memorable.
              </h2>
              <p className="text-base text-text-secondary leading-relaxed mb-6">
                Create short URLs in seconds with generated codes or custom aliases. No friction, no fuss.
              </p>
              <ul className="flex flex-col gap-2.5">
                {['Secure HTTP/HTTPS validation', 'Custom aliases', 'Collision-safe short codes', 'Fast redirects'].map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-sm text-text-secondary">
                    <CheckIcon className="text-brand flex-shrink-0"/>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <CreateLinkUI/>
            </div>
          </div>
        </div>
      </section>

      {/* ── Manage ────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <ManageTable/>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand mb-3">Manage</p>
              <h2 className="text-4xl font-bold text-text-primary leading-[1.1] mb-4" style={{ letterSpacing: '-0.03em' }}>
                Your links should stay<br/>under your control.
              </h2>
              <p className="text-base text-text-secondary leading-relaxed mb-6">
                Update destinations, disable links, set expiration dates, organize tags, and manage everything from one workspace.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Active', style: 'bg-success/10 text-success border-success/20' },
                  { label: 'Expired', style: 'bg-warning/10 text-warning border-warning/20' },
                  { label: 'Disabled', style: 'bg-text-muted/10 text-text-muted border-border' },
                ].map((s) => (
                  <span key={s.label} className={`text-xs font-medium px-3 py-1 rounded-full border ${s.style}`}>{s.label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Analytics ─────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border bg-canvas">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand mb-3">Analytics</p>
            <h2 className="text-4xl font-bold text-text-primary leading-[1.1] mb-4" style={{ letterSpacing: '-0.03em' }}>
              Know what happens<br/>after the click.
            </h2>
            <p className="text-base text-text-secondary max-w-lg mx-auto leading-relaxed">
              See how links perform over time and understand where your traffic comes from.
            </p>
          </div>
          <AnalyticsShowcase/>
        </div>
      </section>

      {/* ── QR Codes ──────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="flex justify-center">
              <QRPreview/>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand mb-3">QR Codes</p>
              <h2 className="text-4xl font-bold text-text-primary leading-[1.1] mb-4" style={{ letterSpacing: '-0.03em' }}>
                One link.<br/>Online and offline.
              </h2>
              <p className="text-base text-text-secondary leading-relaxed mb-8">
                Turn any short URL into a downloadable QR code for packaging, presentations, print campaigns, events, and signage.
              </p>
              <Button variant="primary" size="md" onClick={() => navigate('/register')}>Create a QR code</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── API ───────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border bg-[#F1F5F9]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand mb-3">API</p>
              <h2 className="text-4xl font-bold text-text-primary leading-[1.1] mb-4" style={{ letterSpacing: '-0.03em' }}>
                Build 247URL into<br/>your workflow.
              </h2>
              <p className="text-base text-text-secondary leading-relaxed mb-6">
                Create, update, and manage short links programmatically with the 247URL REST API. Token-based authentication. Versioned endpoints.
              </p>
              <ul className="flex flex-col gap-2.5 mb-8">
                {['REST API with token authentication', 'Create and manage links programmatically', 'Retrieve analytics and click data', 'Versioned endpoints for stability'].map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-sm text-text-secondary">
                    <CheckIcon className="text-brand flex-shrink-0"/>
                    {b}
                  </li>
                ))}
              </ul>
              <Button variant="secondary" size="md" onClick={() => navigate('/resources/article')}>View API documentation</Button>
            </div>
            <div>
              <CodePanel/>
            </div>
          </div>
        </div>
      </section>

      {/* ── Custom Domains ────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-4xl font-bold text-text-primary leading-[1.1] mb-4" style={{ letterSpacing: '-0.03em' }}>
                Make every link<br/>feel like your brand.
              </h2>
              <p className="text-base text-text-secondary leading-relaxed mb-6">
                Connect your own domain and every link you create will carry your brand — not ours. Available on Pro and Business plans.
              </p>
              <ul className="flex flex-col gap-2.5 mb-8">
                {['Custom short domains (go.yourbrand.com)', 'Simple DNS configuration', 'SSL handled automatically', 'Multiple domains on Business plan'].map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-sm text-text-secondary">
                    <CheckIcon className="text-brand flex-shrink-0"/>
                    {b}
                  </li>
                ))}
              </ul>
              <Button variant="secondary" size="md" onClick={() => navigate('/pricing')}>Explore custom domains</Button>
            </div>
            <div>
              <DomainComparison/>
            </div>
          </div>
        </div>
      </section>

      {/* ── Security & Privacy ────────────────────────────────────────── */}
      <section className="py-20 border-t border-border bg-canvas">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-3" style={{ letterSpacing: '-0.025em' }}>
              Built with privacy<br/>and reliability in mind.
            </h2>
            <p className="text-base text-text-secondary max-w-lg mx-auto">
              We built 247URL with honest defaults. No IP storage, no dark patterns, no surprises.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Fast redirect architecture', desc: 'Cached link resolution ensures sub-millisecond redirects with automatic invalidation on destination updates.' },
              { title: 'Privacy-conscious analytics', desc: 'Daily-rotating visitor hashes enable unique visitor counts without storing raw IP addresses.' },
              { title: 'Rate limiting', desc: 'API and redirect endpoints are rate-limited to prevent abuse and ensure fair access.' },
              { title: 'Secure authentication', desc: 'Token-based API auth and session-based web auth. Passwords are hashed with strong algorithms.' },
              { title: 'Abuse controls', desc: 'Links that point to malicious or prohibited content can be disabled promptly after review.' },
              { title: 'Role-based access', desc: 'Business plan workspaces support role-based permissions — control who can create, edit, and manage links.' },
            ].map((item) => (
              <div key={item.title} className="bg-surface border border-border rounded-[var(--radius-lg)] p-5">
                <div className="w-7 h-7 bg-brand-light rounded-[var(--radius-sm)] flex items-center justify-center mb-3">
                  <svg className="w-3.5 h-3.5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-1.5">{item.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature comparison ────────────────────────────────────────── */}
      <section className="py-20 border-t border-border bg-surface">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-0.02em' }}>
              Capability overview
            </h2>
            <p className="text-sm text-text-secondary mt-2">What's available on each plan.</p>
          </div>

          <div className="bg-surface border border-border rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-xs)]">
            <div className="grid grid-cols-4 border-b border-border bg-canvas">
              <div className="px-5 py-3 text-xs font-semibold text-text-muted">Capability</div>
              {['Free', 'Pro', 'Business'].map((h) => (
                <div key={h} className={`px-5 py-3 text-xs font-semibold text-center ${h === 'Pro' ? 'text-brand' : 'text-text-muted'}`}>{h}</div>
              ))}
            </div>
            {comparisonRows.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-4 ${i < comparisonRows.length - 1 ? 'border-b border-border' : ''} hover:bg-canvas transition-colors`}>
                <div className="px-5 py-3 text-sm text-text-secondary">{row.feature}</div>
                {[row.free, row.pro, row.biz].map((v, ci) => (
                  <div key={ci} className="px-5 py-3 text-center text-sm">
                    {v === '✓' ? <span className="text-success font-semibold">✓</span>
                      : v === '—' ? <span className="text-text-muted opacity-30">—</span>
                      : <span className={`font-medium ${ci === 1 ? 'text-brand' : 'text-text-primary'}`}>{v}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-text-muted mt-5">
            Full details available on the{' '}
            <button onClick={() => navigate('/pricing')} className="text-brand hover:underline">pricing page</button>.
          </p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ letterSpacing: '-0.03em' }}>
            Ready to build better links?
          </h2>
          <p className="text-base text-white/70 mb-8">Create your first short link in seconds.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-white text-brand text-sm font-semibold rounded-[var(--radius-md)] hover:bg-white/95 transition-all"
            >
              Get started free
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="px-6 py-3 bg-white/10 text-white text-sm font-semibold rounded-[var(--radius-md)] border border-white/20 hover:bg-white/20 transition-all"
            >
              Explore pricing
            </button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
