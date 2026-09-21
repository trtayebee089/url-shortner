import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { Button, Input } from '@/components/ui';
import { useRouter } from '@/lib/router';

export function LoginPage() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/dashboard'); }, 900);
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Left — brand panel (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 bg-brand p-10">
        <Logo size="md" inverse />
        <div>
          <blockquote className="text-3xl font-bold text-white leading-tight mb-4" style={{ letterSpacing: '-0.025em' }}>
            Short links.<br/>Clear insights.
          </blockquote>
          <p className="text-brand-mid text-sm leading-relaxed max-w-xs">
            Create, manage, and measure every link from one workspace. Fast redirects. Privacy-conscious analytics.
          </p>
          <div className="mt-10 flex flex-col gap-3">
            {[
              { icon: '⚡', text: 'Sub-millisecond redirects via Redis caching' },
              { icon: '🔒', text: 'Privacy-conscious analytics, no raw IPs stored' },
              { icon: '✏️', text: 'Edit destinations without changing your link' },
            ].map((f) => (
              <div key={f.text} className="flex items-start gap-3">
                <span className="text-base flex-shrink-0">{f.icon}</span>
                <span className="text-sm text-white/70">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/30">© 2024 247URL</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8"><Logo size="md"/></div>

        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-text-primary mb-1.5" style={{ letterSpacing: '-0.025em' }}>Welcome back</h1>
            <p className="text-sm text-text-secondary">Sign in to manage your links.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
            <Input label="Email" type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" autoComplete="email" required/>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-medium text-text-primary">Password</label>
                <button type="button" onClick={() => navigate('/forgot-password')} className="text-xs text-brand hover:underline">
                  Forgot password?
                </button>
              </div>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password" required
                className="w-full bg-surface border border-border text-text-primary placeholder:text-text-muted rounded-[var(--radius-md)] px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-colors"/>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-3.5 h-3.5 accent-brand rounded"/>
              <span className="text-xs text-text-secondary">Remember me for 30 days</span>
            </label>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="mt-1">
              Sign in
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-sm text-text-muted">
              Don't have an account?{' '}
              <button onClick={() => navigate('/register')} className="text-brand hover:underline font-medium">Create one</button>
            </p>
          </div>

          <p className="mt-5 text-xs text-text-muted text-center">
            By continuing, you agree to our{' '}
            <button onClick={() => navigate('/terms')} className="text-text-secondary hover:text-text-primary transition-colors">Terms</button>{' '}
            and{' '}
            <button onClick={() => navigate('/privacy')} className="text-text-secondary hover:text-text-primary transition-colors">Privacy Policy</button>.
          </p>
        </div>
      </div>
    </div>
  );
}
