import { useState } from 'react';
import { MarketingLayout } from '@/layouts/MarketingLayout';
import { Button } from '@/components/ui';
import { useRouter } from '@/lib/router';

const CheckIcon = () => (
  <svg className="w-4 h-4 text-success flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    period: 'forever',
    desc: 'For individuals getting started with short links.',
    cta: 'Get started free',
    highlight: false,
    badge: null,
    features: [
      '50 short links',
      'Custom aliases',
      'Basic analytics (30-day retention)',
      'QR code download (PNG)',
      'Link management',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 12, annual: 10 },
    period: '/month',
    desc: 'For marketers and growing businesses.',
    cta: 'Start Pro',
    highlight: true,
    badge: 'Most popular',
    features: [
      'Everything in Free',
      'Unlimited short links',
      'Advanced analytics',
      '1-year analytics retention',
      'Custom domains (1)',
      'API access',
      'Advanced link controls',
      'QR codes (PNG + SVG)',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: { monthly: null, annual: null },
    period: '',
    desc: 'For teams and organizations.',
    cta: 'Contact sales',
    highlight: false,
    badge: null,
    features: [
      'Everything in Pro',
      'Team management',
      'Advanced permissions',
      'Higher limits',
      'Priority support',
      'Custom requirements',
      '5 custom domains',
      'Unlimited analytics retention',
    ],
  },
];

const tableRows: { feature: string; free: string; pro: string; biz: string }[] = [
  { feature: 'Links',              free: '50',       pro: 'Unlimited', biz: 'Unlimited' },
  { feature: 'Custom aliases',     free: '✓',        pro: '✓',         biz: '✓' },
  { feature: 'Analytics',          free: 'Basic',    pro: 'Advanced',  biz: 'Advanced' },
  { feature: 'QR codes',           free: 'PNG',      pro: 'PNG + SVG', biz: 'PNG + SVG' },
  { feature: 'API',                free: '—',        pro: '✓',         biz: '✓' },
  { feature: 'Custom domains',     free: '—',        pro: '1',         biz: '5' },
  { feature: 'Analytics retention',free: '30 days',  pro: '1 year',    biz: 'Unlimited' },
  { feature: 'Team members',       free: '—',        pro: '—',         biz: 'Up to 10' },
  { feature: 'Permissions',        free: '—',        pro: '—',         biz: 'Role-based' },
  { feature: 'Support',            free: 'Community',pro: 'Email',     biz: 'Priority' },
];

const faqs = [
  { q: 'Can I start for free?', a: 'Yes. The Free plan includes 50 short links, custom aliases, basic analytics, and QR codes. No credit card required.' },
  { q: 'Can I change plans later?', a: 'Yes. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.' },
  { q: 'Can I cancel anytime?', a: 'Absolutely. There are no long-term contracts. Cancel from your account settings and your plan remains active until the end of the current period.' },
  { q: 'What happens to my existing links?', a: 'Your short links continue to work regardless of plan changes. Links are not deleted when you change plans.' },
  { q: 'Do short links stop working if I downgrade?', a: 'No. All links remain active. If you exceed Free plan limits after downgrading, you may not be able to create new links until you are within limits again.' },
  { q: 'Do you offer custom plans?', a: 'Yes — for teams or organizations with specific requirements, contact us and we can discuss custom arrangements.' },
  { q: 'What payment methods are supported?', a: 'We accept all major credit and debit cards. Annual plans can be invoiced for Business customers.' },
];

export function PricingPage() {
  const { navigate } = useRouter();
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <MarketingLayout>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-14 bg-canvas">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand mb-4">
            Simple, transparent pricing
          </p>
          <h1 className="text-5xl font-bold text-text-primary leading-[1.05] mb-4" style={{ letterSpacing: '-0.035em' }}>
            Choose the plan that<br/>fits your links.
          </h1>
          <p className="text-lg text-text-secondary mb-10">
            Start free. Upgrade when your links and analytics need more.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-surface border border-border rounded-[var(--radius-md)] p-1 gap-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 text-sm font-medium rounded-[var(--radius-sm)] transition-all ${!annual ? 'bg-canvas shadow-[var(--shadow-xs)] text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--radius-sm)] transition-all ${annual ? 'bg-canvas shadow-[var(--shadow-xs)] text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
            >
              Annual
              <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Plan cards ────────────────────────────────────────────────── */}
      <section className="pb-20 bg-canvas">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-[var(--radius-xl)] border p-7 bg-surface transition-all ${
                  plan.highlight
                    ? 'border-brand shadow-[0_0_0_1px_#4F46E5,0_8px_24px_rgba(79,70,229,0.1)]'
                    : 'border-border shadow-[var(--shadow-xs)]'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-brand text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {plan.highlight && (
                  <div className="absolute inset-0 rounded-[var(--radius-xl)] bg-brand/[0.02] pointer-events-none"/>
                )}

                <div className="mb-6">
                  <p className={`text-sm font-bold mb-3 ${plan.highlight ? 'text-brand' : 'text-text-secondary'}`}>{plan.name}</p>
                  <div className="flex items-baseline gap-1.5 mb-1.5">
                    {plan.price.monthly === null ? (
                      <span className="text-4xl font-bold text-text-primary" style={{ letterSpacing: '-0.04em' }}>Custom</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-text-primary" style={{ letterSpacing: '-0.04em' }}>
                          ${annual && plan.price.annual !== null ? plan.price.annual : plan.price.monthly}
                        </span>
                        <span className="text-sm text-text-muted">{plan.period || 'forever'}</span>
                      </>
                    )}
                  </div>
                  {annual && plan.price.monthly !== null && plan.price.monthly > 0 && (
                    <p className="text-xs text-text-muted">Billed annually · ${(plan.price.annual! * 12)} / year</p>
                  )}
                  <p className="text-sm text-text-muted mt-1.5">{plan.desc}</p>
                </div>

                <Button
                  variant={plan.highlight ? 'primary' : 'secondary'}
                  size="md"
                  fullWidth
                  onClick={() => plan.id === 'business' ? navigate('/contact') : navigate('/register')}
                  className="mb-6"
                >
                  {plan.cta}
                </Button>

                <div className="flex flex-col gap-2.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-sm text-text-secondary">
                      <CheckIcon/>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-text-muted mt-6">
            All plans include SSL, fast redirects, and a link management dashboard. No setup fees.
          </p>
        </div>
      </section>

      {/* ── Comparison table ──────────────────────────────────────────── */}
      <section className="py-20 border-t border-border bg-surface">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-text-primary" style={{ letterSpacing: '-0.025em' }}>
              Everything you need to run<br/>links at scale.
            </h2>
          </div>

          <div className="bg-surface border border-border rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-xs)]">
            {/* Header */}
            <div className="grid grid-cols-4 border-b border-border bg-canvas">
              <div className="px-5 py-4 text-xs font-semibold text-text-muted">Feature</div>
              {['Free', 'Pro', 'Business'].map((h) => (
                <div key={h} className={`px-5 py-4 text-xs font-semibold text-center ${h === 'Pro' ? 'text-brand' : 'text-text-muted'}`}>{h}</div>
              ))}
            </div>

            {tableRows.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-4 ${i < tableRows.length - 1 ? 'border-b border-border' : ''} hover:bg-canvas transition-colors`}>
                <div className="px-5 py-3.5 text-sm text-text-secondary font-medium">{row.feature}</div>
                {[row.free, row.pro, row.biz].map((v, ci) => (
                  <div key={ci} className="px-5 py-3.5 text-center text-sm">
                    {v === '✓' ? <span className="text-success font-semibold">✓</span>
                      : v === '—' ? <span className="text-text-muted opacity-25">—</span>
                      : <span className={`font-medium ${ci === 1 ? 'text-brand' : 'text-text-primary'}`}>{v}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border bg-canvas">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-text-primary" style={{ letterSpacing: '-0.025em' }}>
              Frequently asked questions
            </h2>
          </div>

          <div className="flex flex-col gap-0 border border-border rounded-[var(--radius-xl)] overflow-hidden bg-surface shadow-[var(--shadow-xs)]">
            {faqs.map((faq, i) => (
              <div key={i} className={`${i < faqs.length - 1 ? 'border-b border-border' : ''}`}>
                <button
                  className="w-full flex items-center justify-between gap-4 px-6 py-4.5 text-left hover:bg-canvas transition-colors group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span className="text-sm font-medium text-text-primary">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-text-secondary leading-relaxed border-t border-border bg-canvas">
                    <div className="pt-4">{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-text-muted mt-6">
            Still have questions?{' '}
            <button onClick={() => navigate('/contact')} className="text-brand hover:underline">Contact us</button>
          </p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-border bg-brand">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ letterSpacing: '-0.03em' }}>
            Start with the basics.<br/>Scale when you need to.
          </h2>
          <p className="text-base text-white/70 mb-8">No credit card required. Free forever.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-white text-brand text-sm font-semibold rounded-[var(--radius-md)] hover:bg-white/95 transition-all"
            >
              Create free account
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-6 py-3 bg-white/10 text-white text-sm font-semibold rounded-[var(--radius-md)] border border-white/20 hover:bg-white/20 transition-all"
            >
              Talk to sales
            </button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
