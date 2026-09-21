import { useState } from 'react';
import { MarketingLayout } from '@/layouts/MarketingLayout';
import { Button, Eyebrow, SectionHeading, Accordion, AreaChart, Toast, Badge, StatusDot } from '@/components/ui';
import { useRouter } from '@/lib/router';

const previewChart = [85, 120, 105, 160, 145, 210, 195, 240, 220, 285, 265, 310];
const faqItems = [
  { q: 'Can I choose my own short link?', a: 'Yes — authenticated users can set a custom alias when creating a short link. Aliases must be unique and use URL-safe characters. Anonymous shortening generates a random code.' },
  { q: 'Do short links expire?', a: 'By default, short links never expire. Authenticated users can set an optional expiry date on any link from the dashboard.' },
  { q: 'What analytics are collected?', a: 'We track click counts, referrers, device types, and country-level location using daily-rotating visitor hashes. We never store raw IP addresses.' },
  { q: 'Can I use my own short domain?', a: 'Custom short domains are available on the Pro and Business plans. Connect any domain you own and route links through it.' },
];

export function HomePage() {
  const { navigate } = useRouter();
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [toast, setToast] = useState('');
  const [urlError, setUrlError] = useState('');

  const handleShorten = () => {
    if (!url.trim()) { setUrlError('Please enter a destination URL.'); return; }
    if (!/^https?:\/\/.+/.test(url.trim())) { setUrlError('URL must start with http:// or https://'); return; }
    setUrlError('');
    setLoading(true);
    setTimeout(() => {
      const code = alias.trim() || Math.random().toString(36).slice(2, 7);
      setResult(`247url.com/${code}`);
      setLoading(false);
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(`https://${result}`).catch(() => {});
    setToast('Copied to clipboard!');
  };

  return (
    <MarketingLayout>
      {toast && <Toast message={toast} type="success" onClose={() => setToast('')}/>}

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-20 md:pb-24">

          {/* Badge */}
          <div className="flex mb-8">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand bg-brand-light border border-brand-mid rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block"/>
              The simple way to shorten, manage &amp; measure links
            </span>
          </div>

          {/* Headline */}
          <div className="max-w-2xl mb-6">
            <h1 className="text-5xl md:text-6xl lg:text-[68px] font-bold text-text-primary leading-[1.06]" style={{ letterSpacing: '-0.035em' }}>
              Short links.<br/>
              <span className="text-brand">Serious results.</span>
            </h1>
          </div>
          <p className="text-base md:text-lg text-text-secondary max-w-lg leading-relaxed mb-10">
            Create branded short links, manage destinations, generate QR codes, and understand every click — all from one simple workspace.
          </p>

          {/* CTA row */}
          <div className="flex flex-wrap items-center gap-3 mb-12">
            <Button variant="primary" size="lg" onClick={() => navigate('/register')}>
              Create a free link
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/features')}>
              Explore features
            </Button>
          </div>

          {/* Shortener card — the actual product */}
          {!result ? (
            <div className="bg-canvas border border-border rounded-[var(--radius-xl)] p-5 md:p-6 shadow-[var(--shadow-sm)] max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-success"/>
                <span className="text-xs font-medium text-text-secondary">Try it — no account needed</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-xs font-medium text-text-primary block mb-1.5">Destination URL</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setUrlError(''); }}
                    placeholder="https://your-long-url.com/example/campaign"
                    className={`w-full bg-surface border ${urlError ? 'border-danger' : 'border-border'} text-text-primary placeholder:text-text-muted rounded-[var(--radius-md)] px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-colors`}
                    onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
                  />
                  {urlError && <p className="text-xs text-danger mt-1">{urlError}</p>}
                </div>
                <div className="sm:w-40">
                  <label className="text-xs font-medium text-text-primary block mb-1.5">Custom alias</label>
                  <div className="flex items-center border border-border rounded-[var(--radius-md)] overflow-hidden focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-colors bg-surface">
                    <span className="text-xs text-text-muted px-2 whitespace-nowrap border-r border-border py-2.5 bg-surface2 flex-shrink-0">247url.com/</span>
                    <input
                      type="text"
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      placeholder="alias"
                      className="flex-1 min-w-0 bg-surface text-text-primary placeholder:text-text-muted px-2 py-2.5 text-xs focus:outline-none"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                </div>
                <div className="sm:self-end">
                  <Button variant="primary" size="md" loading={loading} onClick={handleShorten} className="w-full sm:w-auto whitespace-nowrap h-[38px]">
                    Shorten link
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-4">
                {['No credit card required', 'Fast redirects', 'Privacy-conscious analytics'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-xs text-text-muted">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-canvas border border-border rounded-[var(--radius-xl)] p-5 max-w-xl shadow-[var(--shadow-sm)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-success-bg border border-success-border flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <span className="text-sm font-semibold text-text-primary">Your short link is ready</span>
              </div>
              <div className="bg-surface border border-border rounded-[var(--radius-md)] px-4 py-3 flex items-center justify-between gap-3 mb-3">
                <span className="text-sm font-semibold text-brand" style={{ fontFamily: 'var(--font-mono)' }}>https://{result}</span>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  Copy
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setResult(''); setUrl(''); setAlias(''); }} fullWidth>Shorten another</Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')} fullWidth>Save &amp; track clicks →</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Product preview strip ─────────────────────────── */}
      <section className="bg-canvas py-16 border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          {/* Browser-frame product card */}
          <div className="bg-surface border border-border rounded-[var(--radius-xl)] shadow-[var(--shadow-md)] overflow-hidden max-w-2xl mx-auto">
            {/* Browser chrome */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-surface2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-300"/>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-300"/>
                <div className="w-2.5 h-2.5 rounded-full bg-green-300"/>
              </div>
              <div className="flex-1 bg-surface border border-border rounded-[var(--radius-sm)] px-3 py-1 text-xs text-text-muted font-mono">
                app.247url.com/dashboard
              </div>
            </div>
            {/* Dashboard snippet */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-text-muted mb-0.5">247url.com/summer</p>
                  <h3 className="text-base font-bold text-text-primary" style={{ letterSpacing: '-0.02em' }}>Summer Campaign 2024</h3>
                  <p className="text-xs text-text-muted mt-0.5">→ example.com/summer-campaign</p>
                </div>
                <Badge variant="success"><StatusDot status="active"/>Active</Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Clicks', value: '12,482' },
                  { label: 'Unique visitors', value: '8,921' },
                  { label: 'This week', value: '+18.4%' },
                ].map((m) => (
                  <div key={m.label} className="bg-canvas border border-border rounded-[var(--radius-md)] p-3">
                    <p className="text-[10px] text-text-muted mb-0.5">{m.label}</p>
                    <p className="text-base font-bold text-text-primary" style={{ letterSpacing: '-0.02em' }}>{m.value}</p>
                  </div>
                ))}
              </div>
              <AreaChart data={previewChart} height={80} color="#4F46E5"/>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust / value props ───────────────────────────── */}
      <section className="py-16 bg-canvas border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-[0.1em] mb-8 text-center">Built for links that matter</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '⚡', title: 'Fast redirects', desc: 'Cached link resolution ensures consistent sub-millisecond response times.' },
              { icon: '📊', title: 'Reliable analytics', desc: 'Understand where clicks come from, on what device, and how trends change.' },
              { icon: '✏️', title: 'Editable destinations', desc: 'Update where a link points without touching the short URL itself.' },
              { icon: '🔒', title: 'Privacy-conscious', desc: 'Meaningful insights without unnecessary personal data retention.' },
            ].map((f) => (
              <div key={f.title} className="flex gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">{f.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature areas (alternating layout) ───────────── */}
      <section className="py-20 bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <SectionHeading eyebrow="Capabilities" title="Everything you need to manage modern links." />
          </div>
          <div className="flex flex-col gap-0">
            {[
              { tag: 'SHORTEN', title: 'Create clean, memorable short URLs.', desc: 'Generate a short link in seconds. Use auto-generated codes or claim a memorable custom alias that reinforces your brand.', side: 'left' },
              { tag: 'MANAGE', title: 'Edit destinations, expiration, tags, and status.', desc: 'Change where a link points, schedule when it expires, organise with tags, or disable it instantly — all without changing the short URL.', side: 'right' },
              { tag: 'ANALYZE', title: 'Understand clicks, devices, referrers, and trends.', desc: 'See who clicked, from where, on what device, and how that changes over time. Privacy-conscious by design.', side: 'left' },
              { tag: 'SHARE', title: 'Generate QR codes for print and offline materials.', desc: 'Download PNG or SVG QR codes for any link. Use them on packaging, presentations, business cards, or signage.', side: 'right' },
            ].map((feat, i) => (
              <div key={feat.tag} className={`flex flex-col md:flex-row items-start gap-8 py-10 border-t border-border ${i === 0 ? 'border-t-0 pt-0' : ''}`}>
                <div className={`w-full md:w-1/2 ${feat.side === 'right' ? 'md:order-2' : ''}`}>
                  <Eyebrow>{feat.tag}</Eyebrow>
                  <h3 className="text-xl font-bold text-text-primary mt-3 mb-3" style={{ letterSpacing: '-0.02em' }}>{feat.title}</h3>
                  <p className="text-text-secondary leading-relaxed text-sm">{feat.desc}</p>
                </div>
                <div className={`w-full md:w-1/2 bg-canvas border border-border rounded-[var(--radius-lg)] p-5 h-24 flex items-center justify-center ${feat.side === 'right' ? 'md:order-1' : ''}`}>
                  <span className="text-3xl opacity-20 select-none">{feat.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Analytics showcase ────────────────────────────── */}
      <section className="py-20 bg-canvas border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeading
                eyebrow="Analytics"
                title="Understand every click."
                subtitle="See referrers, devices, countries, and trends — without storing data you don't need."
              />
              <div className="mt-8 flex flex-col gap-4">
                {[
                  { label: 'Google', pct: 58 },
                  { label: 'Direct', pct: 26 },
                  { label: 'Instagram', pct: 12 },
                  { label: 'Other', pct: 4 },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className="text-sm text-text-secondary w-20 flex-shrink-0">{r.label}</span>
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-brand rounded-full" style={{ width: `${r.pct}%` }}/>
                    </div>
                    <span className="text-xs font-medium text-text-primary w-8 text-right">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Analytics card */}
            <div className="bg-surface border border-border rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-sm)]">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-xs text-text-muted mb-1">Clicks</p>
                  <p className="text-3xl font-bold text-text-primary" style={{ letterSpacing: '-0.03em' }}>12,482</p>
                  <span className="text-xs font-semibold text-success">↑ +18.4% this month</span>
                </div>
                <div className="flex gap-1">
                  {['7D', '30D', '90D'].map((t, i) => (
                    <span key={t} className={`text-[10px] font-medium px-2 py-1 rounded-[var(--radius-sm)] cursor-pointer ${i === 1 ? 'bg-brand text-white' : 'text-text-muted hover:text-text-secondary'}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <AreaChart data={previewChart} height={120} color="#4F46E5"/>
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
                {[
                  { label: 'Unique visitors', value: '8,921' },
                  { label: 'Top country', value: 'United States' },
                  { label: 'Top device', value: 'Desktop (54%)' },
                  { label: 'Top referrer', value: 'Google' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-[10px] text-text-muted mb-0.5">{s.label}</p>
                    <p className="text-xs font-semibold text-text-primary">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="py-20 bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <SectionHeading
                eyebrow="FAQ"
                title="Frequently asked questions."
              />
              <p className="mt-3 text-sm text-text-muted leading-relaxed">
                Can't find your answer? <button onClick={() => navigate('/contact')} className="text-brand hover:underline">Contact us</button> — we respond quickly.
              </p>
            </div>
            <div>
              <Accordion items={faqItems}/>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA — indigo section ────────────────────── */}
      <section className="py-20 bg-brand">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ letterSpacing: '-0.025em' }}>
            Your next link starts here.
          </h2>
          <p className="text-brand-mid text-base max-w-md mx-auto mb-8 leading-relaxed">
            Create an account to edit destinations, organize links, and measure results over time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center justify-center gap-2 bg-white text-brand font-semibold text-sm px-6 py-3 rounded-[var(--radius-md)] hover:bg-brand-light transition-colors shadow-[var(--shadow-sm)]"
            >
              Create your free account
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white/90 font-medium text-sm px-6 py-3 rounded-[var(--radius-md)] hover:bg-white/10 transition-colors"
            >
              View pricing
            </button>
          </div>
          <p className="mt-6 text-sm text-white/50">No credit card required. Free plan available.</p>
        </div>
      </section>
    </MarketingLayout>
  );
}
