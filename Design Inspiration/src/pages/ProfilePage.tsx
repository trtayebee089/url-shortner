import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Button, Badge } from '@/components/ui';
import { useRouter } from '@/lib/router';

export function ProfilePage() {
  const { navigate } = useRouter();

  return (
    <DashboardLayout>
      <div className="max-w-[700px] mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-7" style={{ letterSpacing: '-0.025em' }}>Profile</h1>

        <div className="bg-surface border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-xs)] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-light border border-brand-mid flex items-center justify-center text-brand text-lg font-bold flex-shrink-0">
              AM
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-text-primary" style={{ letterSpacing: '-0.02em' }}>Alex Morgan</h2>
              <p className="text-sm text-text-secondary">alex@example.com</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="brand">Pro plan</Badge>
                <span className="text-xs text-text-muted">Member since Aug 2024</span>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard/settings')}>Edit profile</Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
            {[{ label: 'Short links', value: '124' }, { label: 'Total clicks', value: '18,492' }, { label: 'Custom aliases', value: '31' }].map((s) => (
              <div key={s.label} className="p-5 text-center">
                <p className="text-xl font-bold text-text-primary" style={{ letterSpacing: '-0.025em' }}>{s.value}</p>
                <p className="text-xs text-text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="p-6">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-[0.08em] mb-4">Account details</p>
            {[
              { label: 'Account ID',       value: 'usr_x7k2m9p4q1' },
              { label: 'Email verified',   value: 'Yes' },
              { label: 'Two-factor auth',  value: 'Not enabled' },
              { label: 'API access',       value: 'Enabled (2 tokens)' },
              { label: 'Current plan',     value: 'Pro — $9/month' },
            ].map((d) => (
              <div key={d.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <span className="text-sm text-text-secondary">{d.label}</span>
                <span className="text-sm text-text-primary font-medium">{d.value}</span>
              </div>
            ))}
          </div>

          {/* Danger zone */}
          <div className="px-6 py-4 bg-danger-bg border-t border-danger-border flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-danger">Delete account</p>
              <p className="text-xs text-text-muted mt-0.5">Permanently remove your account and all data.</p>
            </div>
            <Button variant="danger" size="sm">Delete account</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
