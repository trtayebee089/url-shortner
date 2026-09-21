import { useState, ReactNode } from 'react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui';
import { useRouter, Route } from '@/lib/router';

const navLinks: { label: string; route: Route }[] = [
  { label: 'Product',   route: '/features' },
  { label: 'Features',  route: '/features' },
  { label: 'Pricing',   route: '/pricing' },
  { label: 'Resources', route: '/resources' },
];

export function MarketingLayout({ children }: { children: ReactNode }) {
  const { navigate } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-surface border-b border-border h-[68px] flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between gap-8">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <button
                key={link.route + link.label}
                onClick={() => navigate(link.route)}
                className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-[var(--radius-md)] hover:bg-surface2"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign in</Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/register')}>Get started</Button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary"
            aria-label="Toggle menu"
          >
            {mobileOpen
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="absolute top-full left-0 right-0 bg-surface border-b border-border shadow-[var(--shadow-md)] md:hidden">
            <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col gap-0.5">
              {navLinks.map((link) => (
                <button key={link.label} onClick={() => { navigate(link.route); setMobileOpen(false); }}
                  className="text-left px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-[var(--radius-md)] hover:bg-surface2">
                  {link.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 pt-3 border-t border-border mt-2">
                <Button variant="ghost" fullWidth onClick={() => { navigate('/login'); setMobileOpen(false); }}>Sign in</Button>
                <Button variant="primary" fullWidth onClick={() => { navigate('/register'); setMobileOpen(false); }}>Get started</Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface mt-24">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div className="flex flex-col gap-3 max-w-[240px]">
              <Logo size="sm" />
              <p className="text-sm text-text-muted leading-relaxed">
                Short links with fast redirects, clear analytics, and privacy-conscious defaults.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-2">
              {[
                { heading: 'Product', links: [{ l: 'Features', r: '/features' as Route }, { l: 'Pricing', r: '/pricing' as Route }, { l: 'FAQ', r: '/faq' as Route }] },
                { heading: 'Company', links: [{ l: 'About', r: '/about' as Route }, { l: 'Contact', r: '/contact' as Route }] },
                { heading: 'Legal', links: [{ l: 'Privacy', r: '/privacy' as Route }, { l: 'Terms', r: '/terms' as Route }] },
              ].map((col) => (
                <div key={col.heading}>
                  <p className="text-xs font-semibold text-text-primary uppercase tracking-wide mb-3">{col.heading}</p>
                  {col.links.map((link) => (
                    <button key={link.l} onClick={() => navigate(link.r)}
                      className="block text-sm text-text-muted hover:text-text-secondary transition-colors py-1">
                      {link.l}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-text-muted">© 2024 247URL. All rights reserved.</p>
            <p className="text-xs text-text-muted">Fast, reliable, private.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
