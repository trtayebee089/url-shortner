import { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Button, Badge, StatusDot, FilterTabs, Pagination, Dropdown, Modal, Toast, EmptyState, CopyButton } from '@/components/ui';
import { useRouter } from '@/lib/router';

type LinkStatus = 'active' | 'disabled' | 'expired';

interface Link { id: string; short: string; dest: string; clicks: number; status: LinkStatus; created: string; expires: string; }

const allLinks: Link[] = [
  { id: '1', short: 'summer',    dest: 'example.com/summer-sale-2024',        clicks: 4821, status: 'active',   created: 'Aug 12, 2024', expires: 'Never' },
  { id: '2', short: 'product',   dest: 'example.com/products/launch',         clicks: 2438, status: 'active',   created: 'Sep 10, 2024', expires: 'Never' },
  { id: '3', short: 'launch26',  dest: 'example.com/launch/2026',             clicks: 1895, status: 'active',   created: 'Sep 14, 2024', expires: 'Dec 31, 2026' },
  { id: '4', short: 'docs-v2',   dest: 'docs.example.com/v2/getting-started', clicks:  924, status: 'active',   created: 'Sep 1, 2024',  expires: 'Never' },
  { id: '5', short: 'promo-oct', dest: 'example.com/promo-oct',               clicks:  312, status: 'disabled', created: 'Sep 18, 2024', expires: 'Oct 31, 2024' },
  { id: '6', short: 'beta-signup',dest: 'example.com/beta',                   clicks: 1103, status: 'active',   created: 'Jul 30, 2024', expires: 'Never' },
  { id: '7', short: 'report-q3', dest: 'docs.example.com/reports/q3-2024',    clicks:  567, status: 'active',   created: 'Oct 1, 2024',  expires: 'Never' },
  { id: '8', short: 'old-blog',  dest: 'blog.example.com/old-post',           clicks:   89, status: 'expired',  created: 'Jan 5, 2024',  expires: 'Mar 1, 2024' },
];

const statusMeta: Record<LinkStatus, { label: string; variant: 'success' | 'muted' | 'warning' }> = {
  active:   { label: 'Active',   variant: 'success' },
  disabled: { label: 'Disabled', variant: 'muted'   },
  expired:  { label: 'Expired',  variant: 'warning'  },
};

export function LinksPage() {
  const { navigate } = useRouter();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<Link | null>(null);
  const [disableModal, setDisableModal] = useState<Link | null>(null);
  const [toast, setToast] = useState('');
  const [links, setLinks] = useState(allLinks);
  const PER_PAGE = 6;

  const filtered = links.filter((l) => {
    const matchFilter = filter === 'all' || l.status === filter;
    const matchSearch = !search || l.short.includes(search.toLowerCase()) || l.dest.includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });
  const sorted = [...filtered].sort((a, b) => sort === 'clicks-desc' ? b.clicks - a.clicks : sort === 'clicks-asc' ? a.clicks - b.clicks : 0);
  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDelete = () => {
    if (!deleteModal) return;
    setLinks((ls) => ls.filter((l) => l.id !== deleteModal.id));
    setDeleteModal(null); setToast('Link deleted.');
  };
  const handleDisable = () => {
    if (!disableModal) return;
    setLinks((ls) => ls.map((l) => l.id === disableModal.id ? { ...l, status: 'disabled' as LinkStatus } : l));
    setDisableModal(null); setToast('Link disabled.');
  };

  return (
    <DashboardLayout>
      {toast && <Toast message={toast} type="success" onClose={() => setToast('')}/>}

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete link" size="sm">
        <p className="text-sm text-text-secondary mb-5">
          Are you sure you want to delete <span className="font-medium text-text-primary">247url.com/{deleteModal?.short}</span>? This cannot be undone.
        </p>
        <div className="flex gap-2.5">
          <Button variant="secondary" size="md" fullWidth onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="danger" size="md" fullWidth onClick={handleDelete}>Delete link</Button>
        </div>
      </Modal>

      <Modal open={!!disableModal} onClose={() => setDisableModal(null)} title="Disable link" size="sm">
        <p className="text-sm text-text-secondary mb-5">
          Visitors to <span className="font-medium text-text-primary">247url.com/{disableModal?.short}</span> will see a disabled page. You can re-enable it at any time.
        </p>
        <div className="flex gap-2.5">
          <Button variant="secondary" size="md" fullWidth onClick={() => setDisableModal(null)}>Cancel</Button>
          <Button variant="primary" size="md" fullWidth onClick={handleDisable}>Disable link</Button>
        </div>
      </Modal>

      <div className="max-w-[1080px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
          <div>
            <h1 className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-0.025em' }}>Links</h1>
            <p className="text-sm text-text-secondary mt-1">Manage all your short links.</p>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate('/dashboard/links/create')}
            leftIcon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>}>
            Create link
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
          <div className="relative w-full sm:max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-3.5 h-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="search" placeholder="Search links..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-surface border border-border text-text-primary placeholder:text-text-muted rounded-[var(--radius-md)] pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-colors"/>
          </div>
          <FilterTabs
            tabs={[{ id: 'all', label: 'All' }, { id: 'active', label: 'Active' }, { id: 'disabled', label: 'Disabled' }, { id: 'expired', label: 'Expired' }]}
            active={filter} onChange={(v) => { setFilter(v); setPage(1); }}/>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="bg-surface border border-border text-text-secondary rounded-[var(--radius-md)] px-3 py-2 text-xs focus:outline-none focus:border-brand appearance-none cursor-pointer ml-auto flex-shrink-0">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="clicks-desc">Most clicks</option>
            <option value="clicks-asc">Least clicks</option>
          </select>
        </div>

        {paged.length === 0 ? (
          <EmptyState
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>}
            title="No links found"
            description={search ? 'Try a different search term.' : 'Create your first short link to start tracking.'}
            action={<Button variant="primary" size="sm" onClick={() => navigate('/dashboard/links/create')}>Create link</Button>}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-surface border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-xs)] overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-canvas">
                    <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Link</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Destination</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Clicks</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Created</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Expires</th>
                    <th className="px-5 py-3"/>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paged.map((link) => {
                    const meta = statusMeta[link.status];
                    return (
                      <tr key={link.id} className="hover:bg-canvas transition-colors group">
                        <td className="px-5 py-3.5">
                          <button onClick={() => navigate('/dashboard/links/detail')}
                            className="text-sm font-medium text-brand hover:underline" style={{ fontFamily: 'var(--font-mono)' }}>
                            247url.com/{link.short}
                          </button>
                        </td>
                        <td className="px-5 py-3.5 max-w-[180px]">
                          <span className="text-sm text-text-secondary truncate block">{link.dest}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-semibold text-text-primary">{link.clicks.toLocaleString()}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={meta.variant}><StatusDot status={link.status}/>{meta.label}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-text-secondary">{link.created}</td>
                        <td className="px-5 py-3.5 text-sm text-text-secondary">{link.expires}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                            <CopyButton value={`https://247url.com/${link.short}`}/>
                            <Dropdown
                              trigger={
                                <button className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:text-text-primary hover:bg-surface2 transition-colors">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                                </button>
                              }
                              items={[
                                { label: 'View details', onClick: () => navigate('/dashboard/links/detail') },
                                { label: 'Analytics', onClick: () => navigate('/dashboard/analytics') },
                                { label: 'Edit', onClick: () => navigate('/dashboard/links/create') },
                                { label: 'Copy link', onClick: () => { navigator.clipboard?.writeText(`https://247url.com/${link.short}`); setToast('Copied!'); } },
                                { label: 'Disable', onClick: () => setDisableModal(link) },
                                { label: 'Delete', onClick: () => setDeleteModal(link), danger: true },
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden bg-surface border border-border rounded-[var(--radius-lg)] overflow-hidden mb-4 divide-y divide-border">
              {paged.map((link) => {
                const meta = statusMeta[link.status];
                return (
                  <div key={link.id} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <button onClick={() => navigate('/dashboard/links/detail')}
                        className="text-sm font-medium text-brand" style={{ fontFamily: 'var(--font-mono)' }}>
                        247url.com/{link.short}
                      </button>
                      <Badge variant={meta.variant}><StatusDot status={link.status}/>{meta.label}</Badge>
                    </div>
                    <p className="text-xs text-text-muted truncate mb-2">{link.dest}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">{link.clicks.toLocaleString()} clicks · {link.created}</span>
                      <CopyButton value={`https://247url.com/${link.short}`}/>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-text-muted">{filtered.length} link{filtered.length !== 1 ? 's' : ''}</p>
              <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage}/>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
