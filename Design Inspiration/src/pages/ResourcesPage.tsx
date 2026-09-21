import { useState } from 'react';
import { MarketingLayout } from '@/layouts/MarketingLayout';
import { Button } from '@/components/ui';
import { useRouter } from '@/lib/router';

// ─── Types ─────────────────────────────────────────────────────────────────
type Category = 'All' | 'Guides' | 'Documentation' | 'API' | 'Analytics' | 'Security' | 'Product';

interface Resource {
  category: Exclude<Category, 'All'>;
  title: string;
  desc: string;
  readTime: string;
  date: string;
}

// ─── Data ──────────────────────────────────────────────────────────────────
const resources: Resource[] = [
  {
    category: 'Guides',
    title: 'How URL shorteners work',
    desc: 'A practical explanation of short codes, redirects, analytics, and link management.',
    readTime: '6 min read',
    date: 'Sep 18, 2026',
  },
  {
    category: 'Documentation',
    title: 'Getting started with the 247URL API',
    desc: 'Learn how to authenticate, create your first link, and retrieve analytics data.',
    readTime: '10 min read',
    date: 'Sep 15, 2026',
  },
  {
    category: 'Guides',
    title: 'UTM parameters explained',
    desc: 'How to add tracking parameters to your links and understand where traffic comes from.',
    readTime: '7 min read',
    date: 'Sep 10, 2026',
  },
  {
    category: 'Analytics',
    title: 'Understanding click analytics',
    desc: 'A deep dive into click counts, unique visitors, referrers, devices, and countries.',
    readTime: '8 min read',
    date: 'Sep 5, 2026',
  },
  {
    category: 'Security',
    title: 'How we approach link security',
    desc: 'Our privacy-first analytics model, rate limiting, and abuse controls explained.',
    readTime: '5 min read',
    date: 'Aug 28, 2026',
  },
  {
    category: 'Product',
    title: "What's new in 247URL",
    desc: 'Recent updates: improved analytics breakdown, API enhancements, and QR improvements.',
    readTime: '3 min read',
    date: 'Aug 20, 2026',
  },
];

const categoryColors: Record<string, string> = {
  Guides: 'text-brand bg-brand-light',
  Documentation: 'text-[#7C3AED] bg-[#F5F3FF]',
  API: 'text-[#0369A1] bg-[#E0F2FE]',
  Analytics: 'text-[#0F766E] bg-[#F0FDFA]',
  Security: 'text-[#B45309] bg-[#FFFBEB]',
  Product: 'text-[#7C3AED] bg-[#F5F3FF]',
};

// ─── Resource card ─────────────────────────────────────────────────────────
function ResourceCard({ resource, onClick }: { resource: Resource; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-surface border border-border rounded-[var(--radius-lg)] p-5 flex flex-col gap-3 hover:border-border-strong hover:shadow-[var(--shadow-sm)] transition-all group w-full"
    >
      <span className={`text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full self-start ${categoryColors[resource.category]}`}>
        {resource.category}
      </span>
      <div>
        <h3 className="text-sm font-semibold text-text-primary leading-snug mb-1.5 group-hover:text-brand transition-colors">
          {resource.title}
        </h3>
        <p className="text-sm text-text-muted leading-relaxed">{resource.desc}</p>
      </div>
      <div className="flex items-center gap-3 text-xs text-text-muted mt-auto pt-2 border-t border-border">
        <span>{resource.readTime}</span>
        <span className="w-px h-3 bg-border"/>
        <span>{resource.date}</span>
      </div>
    </button>
  );
}

// ─── Code block for developer section ──────────────────────────────────────
function DevCodeBlock() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-[#0F172A] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white/20"/>
          <span className="w-2.5 h-2.5 rounded-full bg-white/20"/>
          <span className="w-2.5 h-2.5 rounded-full bg-white/20"/>
        </div>
        <span className="text-[10px] text-white/30 font-mono ml-2">POST /api/v1/links</span>
      </div>
      <pre className="px-4 py-4 text-xs font-mono leading-relaxed overflow-x-auto">
        <code>
          <span className="text-[#38BDF8]">POST</span>{' '}
          <span className="text-[#A5B4FC]">/api/v1/links</span>{'\n'}
          <span className="text-[#C084FC]">Authorization</span>
          <span className="text-[#94A3B8]">: </span>
          <span className="text-[#86EFAC]">Bearer sk_live_...</span>{'\n\n'}
          <span className="text-[#94A3B8]">{'{'}</span>{'\n'}
          <span className="text-[#94A3B8]">{'  '}</span>
          <span className="text-[#F8FAFC]">"destination_url"</span>
          <span className="text-[#94A3B8]">: </span>
          <span className="text-[#86EFAC]">"https://example.com/summer"</span>
          <span className="text-[#94A3B8]">,</span>{'\n'}
          <span className="text-[#94A3B8]">{'  '}</span>
          <span className="text-[#F8FAFC]">"custom_alias"</span>
          <span className="text-[#94A3B8]">: </span>
          <span className="text-[#86EFAC]">"summer"</span>{'\n'}
          <span className="text-[#94A3B8]">{'}'}</span>
        </code>
      </pre>
    </div>
  );
}

// ─── Article detail page ────────────────────────────────────────────────────
const articleContent = [
  {
    type: 'h2' as const,
    content: 'What is a URL shortener?',
  },
  {
    type: 'p' as const,
    content: 'A URL shortener is a service that takes a long, unwieldy URL and replaces it with a shorter alias. When a visitor clicks the short link, they are redirected transparently to the original destination.',
  },
  {
    type: 'h2' as const,
    content: 'How redirects work',
  },
  {
    type: 'p' as const,
    content: 'When you create a short link like 247url.com/summer, the service stores a mapping between the alias (summer) and your destination URL. When a visitor clicks the link:',
  },
  {
    type: 'list' as const,
    items: [
      'Their browser sends a request to 247url.com/summer',
      'The server looks up "summer" in the link database',
      'The server returns an HTTP 301 or 302 redirect to the destination',
      'The browser follows the redirect — the visitor arrives at the destination',
    ],
  },
  {
    type: 'callout' as const,
    content: '301 vs 302 redirects: A 301 is permanent and may be cached by browsers. A 302 is temporary and ensures every click passes through the analytics server. 247URL uses 302 redirects to maintain accurate click counting.',
  },
  {
    type: 'h2' as const,
    content: 'Short code generation',
  },
  {
    type: 'p' as const,
    content: "When you don't specify a custom alias, the system generates a collision-safe short code. 247URL uses a character set of 62 characters (a–z, A–Z, 0–9), which means a 6-character code provides over 56 billion unique combinations.",
  },
  {
    type: 'code' as const,
    content: '// Example short code generation\nconst chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";\nconst code = Array.from({length: 6}, () => chars[Math.floor(Math.random() * chars.length)]).join(\'\');',
    lang: 'javascript',
  },
  {
    type: 'h2' as const,
    content: 'Analytics and click tracking',
  },
  {
    type: 'p' as const,
    content: 'Every redirect passes through the 247URL server, which records metadata about each click — referrer, device type, browser, and country. To count unique visitors without storing raw IP addresses, we derive a daily-expiring hash from visitor data.',
  },
  {
    type: 'h3' as const,
    content: 'Privacy-conscious unique counting',
  },
  {
    type: 'p' as const,
    content: 'Rather than store persistent identifiers, 247URL uses a hash combining IP, user-agent, and a daily salt. This hash expires every 24 hours, making it impossible to track individuals across days while still providing accurate daily unique visitor counts.',
  },
];

const tocItems = [
  'What is a URL shortener?',
  'How redirects work',
  'Short code generation',
  'Analytics and click tracking',
];

export function ResourceArticlePage() {
  const { navigate } = useRouter();
  const [activeSection, setActiveSection] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <MarketingLayout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-text-muted mb-8">
          <button onClick={() => navigate('/resources')} className="hover:text-brand transition-colors">Resources</button>
          <span>/</span>
          <span className="text-text-secondary">Guides</span>
        </nav>

        <div className="flex gap-12 items-start">
          {/* Article */}
          <article className="flex-1 min-w-0 max-w-[720px]">
            <div className="mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand bg-brand-light px-2.5 py-1 rounded-full">Guide</span>
              <h1 className="text-4xl font-bold text-text-primary mt-4 mb-3 leading-[1.1]" style={{ letterSpacing: '-0.03em' }}>
                How URL shorteners work
              </h1>
              <p className="text-lg text-text-secondary leading-relaxed mb-4">
                A practical explanation of short codes, redirects, analytics, and link management.
              </p>
              <div className="flex items-center gap-4 text-xs text-text-muted border-t border-border pt-4">
                <span>8 min read</span>
                <span className="w-px h-3 bg-border"/>
                <span>Sep 21, 2026</span>
                <span className="w-px h-3 bg-border"/>
                <span>247URL Team</span>
              </div>
            </div>

            {/* Mobile ToC toggle */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setTocOpen(!tocOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-surface border border-border rounded-[var(--radius-md)] text-sm font-medium text-text-secondary"
              >
                Table of contents
                <svg className={`w-4 h-4 text-text-muted transition-transform ${tocOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {tocOpen && (
                <div className="mt-2 bg-surface border border-border rounded-[var(--radius-md)] p-4">
                  {tocItems.map((item, i) => (
                    <button key={i} onClick={() => { setActiveSection(i); setTocOpen(false); }}
                      className="block text-sm text-text-secondary hover:text-brand py-1.5 transition-colors text-left w-full">
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Article content */}
            <div className="prose-like flex flex-col gap-5">
              {articleContent.map((block, i) => {
                if (block.type === 'h2') return (
                  <h2 key={i} className="text-xl font-bold text-text-primary mt-6 mb-1" style={{ letterSpacing: '-0.02em' }}>
                    {block.content as string}
                  </h2>
                );
                if (block.type === 'h3') return (
                  <h3 key={i} className="text-base font-semibold text-text-primary mt-4 mb-1">{block.content as string}</h3>
                );
                if (block.type === 'p') return (
                  <p key={i} className="text-base text-text-secondary leading-[1.75]">{block.content as string}</p>
                );
                if (block.type === 'list') return (
                  <ul key={i} className="flex flex-col gap-2 pl-0">
                    {(block.items as string[]).map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-base text-text-secondary leading-[1.75]">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand mt-[10px] flex-shrink-0"/>
                        {item}
                      </li>
                    ))}
                  </ul>
                );
                if (block.type === 'callout') return (
                  <div key={i} className="bg-brand-light border-l-2 border-brand rounded-r-[var(--radius-md)] px-5 py-4">
                    <p className="text-sm text-text-secondary leading-[1.75]">
                      <strong className="text-text-primary font-semibold">Note: </strong>
                      {block.content as string}
                    </p>
                  </div>
                );
                if (block.type === 'code') return (
                  <div key={i} className="bg-[#0F172A] rounded-[var(--radius-md)] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                      <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">{block.lang}</span>
                    </div>
                    <pre className="px-4 py-4 text-xs font-mono text-[#94A3B8] leading-relaxed overflow-x-auto">
                      <code>{block.content as string}</code>
                    </pre>
                  </div>
                );
                return null;
              })}
            </div>

            {/* Article footer */}
            <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Was this helpful?</p>
                <div className="flex gap-2 mt-2">
                  <button className="px-4 py-1.5 bg-surface border border-border rounded-[var(--radius-sm)] text-xs text-text-secondary hover:border-border-strong transition-all">Yes</button>
                  <button className="px-4 py-1.5 bg-surface border border-border rounded-[var(--radius-sm)] text-xs text-text-secondary hover:border-border-strong transition-all">No</button>
                </div>
              </div>
              <button onClick={() => navigate('/resources')} className="text-xs text-brand hover:underline">
                ← Back to resources
              </button>
            </div>
          </article>

          {/* Desktop sidebar ToC */}
          <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-24">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-muted mb-3">On this page</p>
            <nav className="flex flex-col gap-0.5">
              {tocItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSection(i)}
                  className={`text-left text-xs py-1.5 px-2 rounded-[var(--radius-sm)] transition-colors ${activeSection === i ? 'text-brand bg-brand-light font-medium' : 'text-text-muted hover:text-text-secondary'}`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </MarketingLayout>
  );
}

// ─── Resources hub ─────────────────────────────────────────────────────────
export function ResourcesPage() {
  const { navigate } = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const categories: Category[] = ['All', 'Guides', 'Documentation', 'API', 'Analytics', 'Security', 'Product'];

  const filtered = resources.filter((r) => {
    const matchCat = activeCategory === 'All' || r.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <MarketingLayout>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-12 bg-canvas border-b border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand mb-4">Resources</p>
          <h1 className="text-5xl font-bold text-text-primary leading-[1.05] mb-4" style={{ letterSpacing: '-0.035em' }}>
            Everything you need to<br/>get more from your links.
          </h1>
          <p className="text-lg text-text-secondary mb-10">
            Guides, documentation, insights, and practical resources for building and managing better links.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guides, documentation, analytics, API..."
              className="w-full bg-surface border border-border rounded-[var(--radius-lg)] pl-11 pr-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 shadow-[var(--shadow-xs)] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Category tabs ─────────────────────────────────────────────── */}
      <div className="border-b border-border bg-surface sticky top-[68px] z-30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-4 text-sm font-medium border-b-2 transition-all ${
                  activeCategory === cat
                    ? 'border-brand text-brand'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-14">
        {/* ── Search results state ─────────────────────────────────── */}
        {search ? (
          <div>
            <div className="mb-6">
              <p className="text-sm text-text-muted">
                {filtered.length === 0
                  ? `No results for "${search}"`
                  : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"`}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-surface border border-border rounded-[var(--radius-xl)]">
                <div className="w-12 h-12 bg-surface2 border border-border rounded-[var(--radius-lg)] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">No resources found</h3>
                <p className="text-sm text-text-muted">Try another search term.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((r) => (
                  <ResourceCard key={r.title} resource={r} onClick={() => navigate('/resources/article')}/>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ── Featured resource ──────────────────────────────────── */}
            {activeCategory === 'All' && (
              <div className="mb-14">
                <button
                  onClick={() => navigate('/resources/article')}
                  className="w-full bg-surface border border-border rounded-[var(--radius-xl)] overflow-hidden hover:shadow-[var(--shadow-md)] hover:border-border-strong transition-all group text-left"
                >
                  <div className="grid lg:grid-cols-2">
                    {/* Visual */}
                    <div className="bg-gradient-to-br from-brand to-[#7C3AED] p-10 flex items-center justify-center min-h-[260px] lg:min-h-[320px]">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-[var(--radius-xl)] flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <p className="text-white/70 text-sm font-medium">Analytics Strategy Guide</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 lg:p-10 flex flex-col justify-center">
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand bg-brand-light px-2.5 py-1 rounded-full self-start mb-4">Guide</span>
                      <h2 className="text-2xl font-bold text-text-primary leading-[1.15] mb-3 group-hover:text-brand transition-colors" style={{ letterSpacing: '-0.025em' }}>
                        How to build a better<br/>link tracking strategy
                      </h2>
                      <p className="text-sm text-text-secondary leading-relaxed mb-6">
                        A practical guide to understanding clicks, referrers, campaigns, and analytics without overcomplicating your workflow.
                      </p>
                      <div className="flex items-center gap-4 text-xs text-text-muted mb-6">
                        <span>8 min read</span>
                        <span className="w-px h-3 bg-border"/>
                        <span className="text-brand">Analytics</span>
                      </div>
                      <span className="text-sm font-semibold text-brand group-hover:underline">
                        Read guide →
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* ── Resource grid ──────────────────────────────────────── */}
            <div className="mb-14">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-text-primary">
                  {activeCategory === 'All' ? 'Latest resources' : activeCategory}
                </h2>
                <span className="text-xs text-text-muted">{filtered.length} resources</span>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-16 bg-surface border border-border rounded-[var(--radius-xl)]">
                  <p className="text-sm font-medium text-text-secondary mb-1">No resources in this category yet</p>
                  <p className="text-xs text-text-muted">Check back soon.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((r) => (
                    <ResourceCard key={r.title} resource={r} onClick={() => navigate('/resources/article')}/>
                  ))}
                </div>
              )}
            </div>

            {/* ── Developer resources ────────────────────────────────── */}
            {activeCategory === 'All' && (
              <div className="mb-14 bg-[#F1F5F9] border border-border rounded-[var(--radius-xl)] p-8 lg:p-10">
                <div className="grid lg:grid-cols-2 gap-10 items-start">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand mb-3">Developer</p>
                    <h2 className="text-2xl font-bold text-text-primary mb-4" style={{ letterSpacing: '-0.025em' }}>Build with 247URL.</h2>
                    <div className="flex flex-col gap-4 mb-6">
                      {[
                        { title: 'API documentation', desc: 'Learn how to create and manage links programmatically.' },
                        { title: 'API reference', desc: 'Explore endpoints, parameters, authentication, and responses.' },
                        { title: 'Integration guide', desc: 'Connect 247URL to your existing workflow.' },
                      ].map((item) => (
                        <button
                          key={item.title}
                          onClick={() => navigate('/resources/article')}
                          className="text-left flex items-start gap-3 group"
                        >
                          <div className="w-8 h-8 bg-brand-light rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-brand/10 transition-colors">
                            <svg className="w-3.5 h-3.5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-text-primary group-hover:text-brand transition-colors">{item.title}</p>
                            <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => navigate('/resources/article')}>View API docs</Button>
                  </div>
                  <div>
                    <DevCodeBlock/>
                  </div>
                </div>
              </div>
            )}

            {/* ── Practical guides ───────────────────────────────────── */}
            {activeCategory === 'All' && (
              <div className="mb-14">
                <h2 className="text-base font-semibold text-text-primary mb-6">Practical guides for better links.</h2>
                <div className="flex flex-col gap-0 border border-border rounded-[var(--radius-xl)] overflow-hidden bg-surface">
                  {[
                    { cat: 'Guides', title: 'How to create branded short links', desc: 'Connect a custom domain and build links that reinforce your brand at every click.', time: '5 min read' },
                    { cat: 'Analytics', title: 'How to track campaign performance', desc: 'Use UTM parameters and 247URL analytics to measure results from every channel.', time: '7 min read' },
                    { cat: 'Guides', title: 'How to use QR codes with short links', desc: 'Generate, download, and deploy QR codes for print, packaging, and digital campaigns.', time: '4 min read' },
                  ].map((item, i, arr) => (
                    <button
                      key={item.title}
                      onClick={() => navigate('/resources/article')}
                      className={`text-left flex items-center gap-4 px-6 py-5 hover:bg-canvas transition-colors group ${i < arr.length - 1 ? 'border-b border-border' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full ${categoryColors[item.cat]}`}>{item.cat}</span>
                          <span className="text-xs text-text-muted">{item.time}</span>
                        </div>
                        <p className="text-sm font-semibold text-text-primary group-hover:text-brand transition-colors mb-0.5">{item.title}</p>
                        <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
                      </div>
                      <svg className="w-4 h-4 text-text-muted group-hover:text-brand flex-shrink-0 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Newsletter ────────────────────────────────────────────── */}
        <div className="mb-14 max-w-xl mx-auto text-center bg-surface border border-border rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-xs)]">
          <h3 className="text-lg font-bold text-text-primary mb-2" style={{ letterSpacing: '-0.02em' }}>Useful ideas, occasionally.</h3>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            Get product updates, link strategy tips, and practical guides. No unnecessary noise.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-canvas border border-border rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
            />
            <Button variant="primary" size="md">Subscribe</Button>
          </div>
          <p className="text-xs text-text-muted mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </div>

      {/* ── Footer CTA ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ letterSpacing: '-0.03em' }}>
            Have a question?
          </h2>
          <p className="text-base text-white/70 mb-8">
            Explore the documentation or get in touch with the 247URL team.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/resources/article')}
              className="px-6 py-3 bg-white text-brand text-sm font-semibold rounded-[var(--radius-md)] hover:bg-white/95 transition-all"
            >
              View documentation
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-6 py-3 bg-white/10 text-white text-sm font-semibold rounded-[var(--radius-md)] border border-white/20 hover:bg-white/20 transition-all"
            >
              Contact us
            </button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
