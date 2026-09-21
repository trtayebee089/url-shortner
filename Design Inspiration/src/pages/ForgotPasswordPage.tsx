import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { Button, Input } from '@/components/ui';
import { useRouter } from '@/lib/router';

export function ForgotPasswordPage() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 800);
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8"><Logo size="md"/></div>
        <div className="bg-surface border border-border rounded-[var(--radius-xl)] p-7 shadow-[var(--shadow-sm)]">
          {!sent ? (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-text-primary mb-1.5" style={{ letterSpacing: '-0.025em' }}>Reset your password</h1>
                <p className="text-sm text-text-muted">We'll send a reset link to your email address.</p>
              </div>
              <form onSubmit={handle} className="flex flex-col gap-4">
                <Input label="Email" type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" required/>
                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>Send reset link</Button>
              </form>
            </>
          ) : (
            <div className="text-center py-2">
              <div className="w-11 h-11 rounded-full bg-success-bg border border-success-border flex items-center justify-center mx-auto mb-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h2 className="text-base font-bold text-text-primary mb-2">Check your inbox</h2>
              <p className="text-sm text-text-muted">We sent a reset link to <span className="text-text-primary">{email}</span>.</p>
            </div>
          )}
          <div className="mt-5 pt-5 border-t border-border text-center">
            <button onClick={() => navigate('/login')} className="text-xs text-text-muted hover:text-brand transition-colors">← Back to sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
}
