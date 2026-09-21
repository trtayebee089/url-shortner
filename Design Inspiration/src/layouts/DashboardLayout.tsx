import { ReactNode, useState } from 'react';
import { Logo } from '@/components/Logo';
import { useRouter, Route } from '@/lib/router';

interface NavItem { label: string; route: Route; icon: ReactNode }

// Lucide-style icons (inline SVG, 16px)
const Icons = {
  grid:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>,
  link:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  chart:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  globe:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  key:       <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  settings:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  user:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  question:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5"/></svg>,
};

const primaryNav: NavItem[] = [
  { label: 'Overview',  route: '/dashboard',            icon: Icons.grid },
  { label: 'Links',     route: '/dashboard/links',      icon: Icons.link },
  { label: 'Analytics', route: '/dashboard/analytics',  icon: Icons.chart },
];

const workspaceNav: NavItem[] = [
  { label: 'Domains',  route: '/dashboard/settings', icon: Icons.globe },
  { label: 'API',      route: '/dashboard/settings', icon: Icons.key },
];

const managementNav: NavItem[] = [
  { label: 'Settings', route: '/dashboard/settings', icon: Icons.settings },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { route, navigate } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (r: Route) => r === '/dashboard' ? route === '/dashboard' : route.startsWith(r);

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.route);
    return (
      <button
        onClick={() => { navigate(item.route); setMobileOpen(false); }}
        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-md)] text-sm transition-all ${
          active
            ? 'bg-brand-light text-brand font-medium'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface2'
        }`}
        aria-current={active ? 'page' : undefined}
      >
        <span className={`flex-shrink-0 ${active ? 'text-brand' : 'text-text-muted'}`}>{item.icon}</span>
        <span>{item.label}</span>
      </button>
    );
  };

  const NavGroup = ({ label, items }: { label: string; items: NavItem[] }) => (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-muted px-2.5 mb-1.5">{label}</p>
      <div className="flex flex-col gap-0.5">{items.map((item) => <NavLink key={item.label} item={item}/>)}</div>
    </div>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 h-[60px] flex items-center border-b border-border flex-shrink-0">
        <Logo size="sm" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-4 overflow-y-auto" aria-label="Dashboard navigation">
        <div className="flex flex-col gap-0.5">
          {primaryNav.map((item) => <NavLink key={item.label} item={item}/>)}
        </div>
        <NavGroup label="Workspace" items={workspaceNav}/>
        <NavGroup label="Management" items={managementNav}/>
      </nav>

      {/* Help */}
      <div className="px-3 py-2 border-t border-border">
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-md)] text-sm text-text-muted hover:text-text-secondary hover:bg-surface2 transition-colors">
          {Icons.question}<span>Help &amp; support</span>
        </button>
      </div>

      {/* User */}
      <div className="p-3 border-t border-border">
        <button
          onClick={() => navigate('/dashboard/profile')}
          className="w-full flex items-center gap-3 px-2.5 py-2 rounded-[var(--radius-md)] hover:bg-surface2 transition-colors text-left"
        >
          <div className="w-7 h-7 rounded-full bg-brand-light border border-brand-mid flex items-center justify-center text-brand text-[10px] font-bold flex-shrink-0">
            AM
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-text-primary truncate">Alex Morgan</p>
            <p className="text-[10px] text-text-muted truncate">alex@example.com</p>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted flex-shrink-0">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col flex-shrink-0 w-52 border-r border-border bg-surface">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-surface border-b border-border h-12 flex items-center justify-between px-4">
        <Logo size="sm" />
        <button onClick={() => setMobileOpen(!mobileOpen)} className="w-8 h-8 flex items-center justify-center text-text-secondary" aria-label="Toggle navigation">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-text-primary/20" onClick={() => setMobileOpen(false)}/>
          <aside className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-56 bg-surface border-r border-border flex flex-col shadow-[var(--shadow-lg)]">
            <SidebarContent/>
          </aside>
        </>
      )}

      {/* Main */}
      <main className="flex-1 overflow-y-auto md:pt-0 pt-12">{children}</main>
    </div>
  );
}
