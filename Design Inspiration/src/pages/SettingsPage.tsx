import { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Button, Input, Toggle, Select, FilterTabs, Badge, EmptyState, Modal, Toast } from '@/components/ui';

const SECTIONS = [{ id: 'general', label: 'General' }, { id: 'security', label: 'Security' }, { id: 'notifications', label: 'Notifications' }, { id: 'api', label: 'API' }, { id: 'domains', label: 'Domains' }];

const initTokens = [
  { id: '1', name: 'Production app', created: 'Sep 1, 2024',  lastUsed: 'Just now',   key: 'sk_live_a1b2c3d4' },
  { id: '2', name: 'Development',    created: 'Aug 12, 2024', lastUsed: '2 days ago', key: 'sk_dev_z9y8x7w6' },
];

export function SettingsPage() {
  const [section, setSection] = useState('general');
  const [notifs, setNotifs] = useState({ analytics: true, security: true, updates: false });
  const [tokens, setTokens] = useState(initTokens);
  const [newTokenModal, setNewTokenModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [deleteTokenId, setDeleteTokenId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [profile, setProfile] = useState({ name: 'Alex Morgan', email: 'alex@example.com', timezone: 'UTC' });

  const handleCreateToken = () => {
    if (!newTokenName.trim()) return;
    setTokens((t) => [...t, { id: String(Date.now()), name: newTokenName.trim(), created: 'Just now', lastUsed: 'Never', key: 'sk_' + Math.random().toString(36).slice(2, 12) }]);
    setNewTokenName(''); setNewTokenModal(false); setToast('API token created.');
  };

  const SectionPanel = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-surface border border-border rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-xs)]">
      <h2 className="text-sm font-semibold text-text-primary border-b border-border pb-3 mb-5">{title}</h2>
      {children}
    </div>
  );

  return (
    <DashboardLayout>
      {toast && <Toast message={toast} type="success" onClose={() => setToast('')}/>}

      <Modal open={newTokenModal} onClose={() => setNewTokenModal(false)} title="Create API token" size="sm">
        <div className="flex flex-col gap-4">
          <Input label="Token name" id="token-name" value={newTokenName} onChange={(e) => setNewTokenName(e.target.value)} placeholder="e.g. Production app"/>
          <div className="flex gap-2.5">
            <Button variant="secondary" size="md" fullWidth onClick={() => setNewTokenModal(false)}>Cancel</Button>
            <Button variant="primary" size="md" fullWidth onClick={handleCreateToken}>Create token</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTokenId} onClose={() => setDeleteTokenId(null)} title="Revoke API token" size="sm">
        <p className="text-sm text-text-secondary mb-5">This token will be permanently revoked. Integrations using it will stop working immediately.</p>
        <div className="flex gap-2.5">
          <Button variant="secondary" size="md" fullWidth onClick={() => setDeleteTokenId(null)}>Cancel</Button>
          <Button variant="danger" size="md" fullWidth onClick={() => { setTokens((t) => t.filter((tk) => tk.id !== deleteTokenId)); setDeleteTokenId(null); setToast('Token revoked.'); }}>Revoke token</Button>
        </div>
      </Modal>

      <div className="max-w-[840px] mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6" style={{ letterSpacing: '-0.025em' }}>Settings</h1>
        <div className="mb-6"><FilterTabs tabs={SECTIONS} active={section} onChange={setSection}/></div>

        {section === 'general' && (
          <SectionPanel title="General settings">
            <div className="flex flex-col gap-5">
              <Input label="Full name" id="name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}/>
              <Input label="Email address" type="email" id="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}/>
              <Select label="Timezone" id="tz" value={profile.timezone} onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}>
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Berlin">Berlin</option>
              </Select>
              <div className="flex justify-end pt-1">
                <Button variant="primary" size="md" onClick={() => setToast('Settings saved.')}>Save changes</Button>
              </div>
            </div>
          </SectionPanel>
        )}

        {section === 'security' && (
          <div className="flex flex-col gap-4">
            <SectionPanel title="Change password">
              <div className="flex flex-col gap-4">
                <Input label="Current password" id="cur-pw" type="password" placeholder="••••••••"/>
                <Input label="New password" id="new-pw" type="password" placeholder="Min 8 characters"/>
                <Input label="Confirm new password" id="conf-pw" type="password" placeholder="Repeat new password"/>
                <div className="flex justify-end"><Button variant="primary" size="md" onClick={() => setToast('Password updated.')}>Update password</Button></div>
              </div>
            </SectionPanel>

            <SectionPanel title="Active sessions">
              {[
                { device: 'Chrome on macOS', location: 'San Francisco, US', time: 'Active now', current: true },
                { device: 'Safari on iPhone', location: 'San Francisco, US', time: '2 hours ago', current: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm text-text-primary">{s.device}</p>
                    <p className="text-xs text-text-muted mt-0.5">{s.location} · {s.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.current && <Badge variant="success">Current</Badge>}
                    {!s.current && <Button variant="ghost" size="sm" onClick={() => setToast('Session revoked.')}>Revoke</Button>}
                  </div>
                </div>
              ))}
            </SectionPanel>
          </div>
        )}

        {section === 'notifications' && (
          <SectionPanel title="Email notifications">
            <div className="flex flex-col">
              {[
                { key: 'analytics', label: 'Weekly analytics summary', desc: 'Receive a digest of your link performance every Monday.' },
                { key: 'security',  label: 'Security alerts',          desc: 'New sign-ins and account changes.' },
                { key: 'updates',   label: 'Product updates',          desc: 'New features and improvements.' },
              ].map((n, i) => (
                <div key={n.key} className={`flex items-center justify-between py-4 ${i > 0 ? 'border-t border-border' : ''}`}>
                  <div>
                    <p className="text-sm text-text-primary">{n.label}</p>
                    <p className="text-xs text-text-muted mt-0.5">{n.desc}</p>
                  </div>
                  <Toggle checked={notifs[n.key as keyof typeof notifs]} onChange={(v) => setNotifs((ns) => ({ ...ns, [n.key]: v }))}/>
                </div>
              ))}
            </div>
            <div className="flex justify-end border-t border-border pt-4">
              <Button variant="primary" size="md" onClick={() => setToast('Preferences saved.')}>Save preferences</Button>
            </div>
          </SectionPanel>
        )}

        {section === 'api' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-text-primary">API tokens</h2>
                <p className="text-xs text-text-muted mt-0.5">Tokens authenticate API requests. Keep them secret.</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setNewTokenModal(true)}>Create token</Button>
            </div>

            {tokens.length === 0 ? (
              <EmptyState
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>}
                title="No API tokens yet"
                description="Create a token to authenticate API requests from your applications."
                action={<Button variant="primary" size="sm" onClick={() => setNewTokenModal(true)}>Create API token</Button>}
              />
            ) : (
              <div className="bg-surface border border-border rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-xs)]">
                <div className="hidden md:grid grid-cols-[1fr_140px_140px_80px] px-5 py-3 bg-canvas border-b border-border">
                  {['Token name', 'Created', 'Last used', ''].map((h) => <span key={h} className="text-xs font-medium text-text-muted">{h}</span>)}
                </div>
                <div className="divide-y divide-border">
                  {tokens.map((tk) => (
                    <div key={tk.id} className="px-5 py-4 flex flex-col md:grid md:grid-cols-[1fr_140px_140px_80px] gap-2 md:gap-0 md:items-center">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{tk.name}</p>
                        <p className="text-xs text-text-muted mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>{tk.key.slice(0, 16)}…</p>
                      </div>
                      <span className="text-xs text-text-secondary">{tk.created}</span>
                      <span className="text-xs text-text-secondary">{tk.lastUsed}</span>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTokenId(tk.id)}>Revoke</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {section === 'domains' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-text-primary">Custom short domains</h2>
                <p className="text-xs text-text-muted mt-0.5">Route links through your own domain. Pro plan required.</p>
              </div>
              <Button variant="secondary" size="sm">Add domain</Button>
            </div>
            <div className="bg-surface border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-xs)]">
              <EmptyState
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>}
                title="No custom domains connected"
                description="Add your own domain to brand your short links."
                action={<Button variant="primary" size="sm">Add domain</Button>}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
