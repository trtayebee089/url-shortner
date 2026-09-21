import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { Button, Input } from '@/components/ui';
import { useRouter } from '@/lib/router';

export function RegisterPage() {
  const { navigate } = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.email.includes('@')) e.email = 'Enter a valid email address.';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    return e;
  };

  const handleRegister = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/dashboard'); }, 1000);
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 bg-brand p-10">
        <Logo size="md" inverse/>
        <div>
          <h2 className="text-3xl font-bold text-white mb-4" style={{ letterSpacing: '-0.025em' }}>
            Start in seconds.<br/>Scale when ready.
          </h2>
          <p className="text-brand-mid text-sm leading-relaxed max-w-xs">
            Free plan includes 50 links, basic analytics, and QR codes. Upgrade when you need more.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { n: '50', l: 'Free links' },
              { n: '0¢', l: 'No credit card' },
              { n: '∞', l: 'Fast redirects' },
              { n: '30d', l: 'Analytics included' },
            ].map((s) => (
              <div key={s.l} className="bg-white/10 rounded-[var(--radius-lg)] px-4 py-3">
                <p className="text-xl font-bold text-white">{s.n}</p>
                <p className="text-xs text-white/60 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/30">© 2024 247URL</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="lg:hidden mb-8"><Logo size="md"/></div>
        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-text-primary mb-1.5" style={{ letterSpacing: '-0.025em' }}>Create your account</h1>
            <p className="text-sm text-text-secondary">Start shortening links in seconds. Free forever.</p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4" noValidate>
            <Input label="Full name" id="name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Alex Morgan" autoComplete="name" error={errors.name}/>
            <Input label="Email" type="email" id="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="alex@example.com" autoComplete="email" error={errors.email}/>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-text-primary">Password</label>
              <input id="password" type="password" value={form.password} onChange={(e) => set('password', e.target.value)}
                placeholder="Min 8 characters" autoComplete="new-password"
                className={`w-full bg-surface border ${errors.password ? 'border-danger' : 'border-border'} text-text-primary placeholder:text-text-muted rounded-[var(--radius-md)] px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-colors`}/>
              {errors.password && <p className="text-xs text-danger">{errors.password}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm" className="text-xs font-medium text-text-primary">Confirm password</label>
              <input id="confirm" type="password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)}
                placeholder="Repeat password" autoComplete="new-password"
                className={`w-full bg-surface border ${errors.confirm ? 'border-danger' : 'border-border'} text-text-primary placeholder:text-text-muted rounded-[var(--radius-md)] px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-colors`}/>
              {errors.confirm && <p className="text-xs text-danger">{errors.confirm}</p>}
            </div>
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="mt-1">Create account</Button>
          </form>

          <p className="mt-4 text-xs text-text-muted text-center leading-relaxed">
            By creating an account you agree to our{' '}
            <button onClick={() => navigate('/terms')} className="text-text-secondary hover:text-text-primary transition-colors">Terms</button>{' '}
            and <button onClick={() => navigate('/privacy')} className="text-text-secondary hover:text-text-primary transition-colors">Privacy Policy</button>.
          </p>

          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-sm text-text-muted">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-brand hover:underline font-medium">Sign in</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
