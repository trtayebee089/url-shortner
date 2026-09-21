import { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Button, Input, Textarea, Select, Breadcrumb, Toast } from '@/components/ui';
import { useRouter } from '@/lib/router';

export function CreateLinkPage() {
  const { navigate } = useRouter();
  const [form, setForm] = useState({ dest: '', alias: '', title: '', desc: '', expiry: 'never', tags: [] as string[] });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [copied, setCopied] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const previewCode = form.alias.trim() || 'your-alias';
  const previewUrl  = `247url.com/${previewCode}`;

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput('');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.dest.trim()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/dashboard/links/detail'); }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(`https://${previewUrl}`).catch(() => {});
    setCopied(true); setToast('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      {toast && <Toast message={toast} type="success" onClose={() => setToast('')}/>}
      <div className="max-w-[1080px] mx-auto px-6 py-8">
        <Breadcrumb items={[{ label: 'Links', onClick: () => navigate('/dashboard/links') }, { label: 'Create link' }]}/>

        <h1 className="text-2xl font-bold text-text-primary mt-4 mb-8" style={{ letterSpacing: '-0.025em' }}>Create a short link</h1>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* Form */}
          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-xs)] flex flex-col gap-5">
              <Input label="Destination URL" type="url" id="dest" value={form.dest}
                onChange={(e) => set('dest', e.target.value)} placeholder="https://example.com/very-long-url"
                required hint="The URL visitors will be redirected to. HTTP and HTTPS only."/>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-primary">
                  Custom alias <span className="text-text-muted font-normal">(optional)</span>
                </label>
                <div className="flex items-center border border-border rounded-[var(--radius-md)] overflow-hidden bg-surface focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-colors">
                  <span className="px-3 py-2 text-sm text-text-muted bg-canvas border-r border-border whitespace-nowrap flex-shrink-0">
                    247url.com/
                  </span>
                  <input type="text" value={form.alias} onChange={(e) => set('alias', e.target.value)}
                    placeholder="launch-2026"
                    className="flex-1 bg-surface text-text-primary placeholder:text-text-muted px-3 py-2 text-sm focus:outline-none"
                    style={{ fontFamily: 'var(--font-mono)' }}/>
                </div>
                <p className="text-xs text-text-muted">Leave blank to generate a random code.</p>
              </div>

              <Input label="Title" id="title" value={form.title} onChange={(e) => set('title', e.target.value)}
                placeholder="Campaign landing page" hint="For your reference only. Not shown to visitors."/>

              <Textarea label="Description" id="desc" value={form.desc} onChange={(e) => set('desc', e.target.value)}
                placeholder="Optional notes about this link." rows={3}/>

              <Select label="Expiration" id="expiry" value={form.expiry} onChange={(e) => set('expiry', e.target.value)}>
                <option value="never">Never</option>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
                <option value="90d">90 days</option>
                <option value="1y">1 year</option>
              </Select>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-primary">Tags</label>
                <div className="flex gap-2">
                  <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Add a tag..."
                    className="flex-1 bg-surface border border-border text-text-primary placeholder:text-text-muted rounded-[var(--radius-md)] px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-colors"/>
                  <Button variant="secondary" size="md" type="button" onClick={addTag}>+ Add</Button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {form.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-light border border-brand-mid text-brand text-xs">
                        {tag}
                        <button type="button" onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}
                          className="opacity-60 hover:opacity-100 transition-opacity ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" size="lg" loading={loading}>Create short link</Button>
              <Button type="button" variant="ghost" size="lg" onClick={() => navigate('/dashboard/links')}>Cancel</Button>
            </div>
          </form>

          {/* Live preview */}
          <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-5 sticky top-6 shadow-[var(--shadow-xs)]">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-[0.08em] mb-4">Live preview</p>

            <div className="bg-canvas border border-border rounded-[var(--radius-md)] p-4 mb-4">
              <p className="text-[10px] text-text-muted mb-1.5">Your short link</p>
              <p className="text-base font-bold text-brand break-all" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '-0.01em' }}>
                {previewUrl}
              </p>
            </div>

            <Button variant={copied ? 'outline' : 'secondary'} size="md" fullWidth onClick={handleCopy}
              leftIcon={copied
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>}
              className="mb-5">
              {copied ? 'Copied!' : 'Copy link'}
            </Button>

            <div className="border-t border-border pt-4">
              <p className="text-xs text-text-muted mb-3">QR code</p>
              <div className="bg-white rounded-[var(--radius-md)] p-4 flex items-center justify-center mb-3 border border-border">
                <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                  {[0,8,16,24,32,40,48,56,64,72].map((x) =>
                    [0,8,16,24,32,40,48,56,64,72].map((y) => {
                      const on = ((x * 7 + y * 3 + 13) % 5) < 2 || (x < 24 && y < 24) || (x > 48 && y < 24) || (x < 24 && y > 48);
                      return on ? <rect key={`${x}-${y}`} x={x} y={y} width="7" height="7" fill="#111827"/> : null;
                    })
                  )}
                </svg>
              </div>
              <Button variant="ghost" size="sm" fullWidth
                leftIcon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}>
                Download QR code
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
