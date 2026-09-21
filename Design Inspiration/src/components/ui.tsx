import {
  ReactNode, useState, useRef, useEffect,
  ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes
} from 'react';

// ─── Button ────────────────────────────────────────────────────────────────────

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type BtnSize    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   BtnVariant;
  size?:      BtnSize;
  loading?:   boolean;
  leftIcon?:  ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const btnBase = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 select-none cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-[var(--radius-md)]';

const btnVariants: Record<BtnVariant, string> = {
  primary:   'bg-brand text-white hover:bg-brand-dark active:scale-[0.98] shadow-[var(--shadow-xs)]',
  secondary: 'bg-surface text-text-primary border border-border hover:bg-surface2 active:scale-[0.98] shadow-[var(--shadow-xs)]',
  ghost:     'bg-transparent text-text-secondary hover:bg-surface2 hover:text-text-primary active:scale-[0.98]',
  danger:    'bg-danger-bg text-danger border border-danger-border hover:bg-red-50 active:scale-[0.98]',
  outline:   'bg-transparent text-brand border border-brand hover:bg-brand-light active:scale-[0.98]',
};

const btnSizes: Record<BtnSize, string> = {
  sm: 'text-xs px-3 py-1.5 h-8',
  md: 'text-sm px-3.5 py-2 h-9',
  lg: 'text-sm px-5 py-2.5 h-10',
};

export function Button({
  variant = 'primary', size = 'md', loading = false,
  leftIcon, rightIcon, fullWidth = false, children, className = '', ...props
}: ButtonProps) {
  return (
    <button
      className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading
        ? <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'brand' | 'muted';

const badgeVariants: Record<BadgeVariant, string> = {
  default:  'bg-surface2 border border-border text-text-secondary',
  success:  'bg-success-bg border border-success-border text-success',
  warning:  'bg-warning-bg border border-warning-border text-warning',
  danger:   'bg-danger-bg border border-danger-border text-danger',
  brand:    'bg-brand-light border border-brand-mid text-brand',
  muted:    'bg-surface2 border border-border text-text-muted',
};

export function Badge({ variant = 'default', children, className = '' }: { variant?: BadgeVariant; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[var(--radius-sm)] ${badgeVariants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── StatusDot ─────────────────────────────────────────────────────────────────

export function StatusDot({ status }: { status: 'active' | 'disabled' | 'expired' }) {
  const c = { active: 'bg-success', disabled: 'bg-text-muted', expired: 'bg-warning' }[status];
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${c} flex-shrink-0`} />;
}

// ─── Input ─────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; hint?: string; leftSlot?: ReactNode; rightSlot?: ReactNode;
}

const inputClass = (error?: string, extra = '') =>
  `w-full bg-surface border ${error ? 'border-danger' : 'border-border'} text-text-primary placeholder:text-text-muted rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:opacity-50 disabled:bg-surface2 ${extra}`;

export function Input({ label, error, hint, leftSlot, rightSlot, className = '', ...props }: InputProps) {
  const id = props.id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-xs font-medium text-text-primary">{label}</label>}
      <div className="relative flex items-center">
        {leftSlot && <div className="absolute left-3 text-text-muted flex items-center pointer-events-none">{leftSlot}</div>}
        <input id={id} className={inputClass(error, `${leftSlot ? 'pl-9' : ''} ${rightSlot ? 'pr-9' : ''} ${className}`)} {...props} />
        {rightSlot && <div className="absolute right-3 text-text-muted flex items-center">{rightSlot}</div>}
      </div>
      {error  && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

// ─── Textarea ──────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; error?: string; hint?: string; }

export function Textarea({ label, error, hint, className = '', ...props }: TextareaProps) {
  const id = props.id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-xs font-medium text-text-primary">{label}</label>}
      <textarea id={id} className={`${inputClass(error)} resize-none ${className}`} {...props} />
      {error  && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

// ─── Select ────────────────────────────────────────────────────────────────────

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label?: string; error?: string; }

export function Select({ label, error, children, className = '', ...props }: SelectProps) {
  const id = props.id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-xs font-medium text-text-primary">{label}</label>}
      <select id={id} className={`${inputClass(error)} appearance-none cursor-pointer ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

// ─── Toggle ────────────────────────────────────────────────────────────────────

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-brand' : 'bg-border'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-[var(--shadow-xs)] transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
      {label && <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{label}</span>}
    </label>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────────

export function Card({ children, className = '', hover = false }: { children: ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={`bg-surface border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-xs)] ${hover ? 'hover:shadow-[var(--shadow-sm)] hover:border-border-strong transition-all cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  );
}

// ─── StatCard ──────────────────────────────────────────────────────────────────

export function StatCard({ label, value, trend, trendUp, icon }: { label: string; value: string; trend?: string; trendUp?: boolean; icon?: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-xs font-medium text-text-muted">{label}</span>
          <span className="text-2xl font-bold text-text-primary" style={{ letterSpacing: '-0.03em' }}>{value}</span>
          {trend && (
            <span className={`text-xs font-medium ${trendUp ? 'text-success' : 'text-danger'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>
        {icon && (
          <div className="w-8 h-8 rounded-[var(--radius-md)] bg-brand-light flex items-center justify-center flex-shrink-0 text-brand">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────

export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex items-center gap-0.5 bg-surface2 border border-border rounded-[var(--radius-md)] p-0.5">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-all ${
            active === t.id ? 'bg-surface text-text-primary shadow-[var(--shadow-xs)]' : 'text-text-muted hover:text-text-secondary'
          }`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── FilterTabs ────────────────────────────────────────────────────────────────

export function FilterTabs({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] border transition-all ${
            active === t.id ? 'bg-brand-light border-brand-mid text-brand' : 'bg-surface border-border text-text-muted hover:text-text-primary hover:border-border-strong'
          }`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Accordion ─────────────────────────────────────────────────────────────────

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="flex flex-col">
      {items.map((item, i) => (
        <div key={i} className="border-b border-border last:border-0">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 py-4 text-left"
            aria-expanded={open === i}
          >
            <span className="text-sm font-medium text-text-primary">{item.q}</span>
            <svg className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open === i && <p className="pb-4 text-sm text-text-secondary leading-relaxed">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────

export function Modal({ open, onClose, title, children, size = 'md' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-text-primary/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative bg-surface border border-border rounded-[var(--radius-xl)] w-full ${widths[size]} shadow-[var(--shadow-modal)]`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary rounded transition-colors" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

export function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error' | 'info'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const styles = {
    success: 'border-success-border text-success bg-success-bg',
    error:   'border-danger-border text-danger bg-danger-bg',
    info:    'border-brand-mid text-brand bg-brand-light',
  };
  return (
    <div className={`fixed bottom-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-[var(--radius-lg)] border bg-surface shadow-[var(--shadow-lg)] text-sm font-medium ${styles[type]}`} role="alert">
      {message}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
  );
}

// ─── EmptyState ────────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3 px-4">
      <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-brand-light flex items-center justify-center text-brand">{icon}</div>
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
        <p className="text-sm text-text-muted max-w-xs">{description}</p>
      </div>
      {action}
    </div>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────

export function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;

  const pBtn = (p: number, label: string) => (
    <button key={label} onClick={() => onChange(p)} disabled={p < 1 || p > pages}
      className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-xs border border-border text-text-muted hover:text-text-primary hover:border-border-strong disabled:opacity-30 disabled:pointer-events-none transition-colors">
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-1">
      {pBtn(page - 1, '‹')}
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className={`w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-xs border transition-all ${
            p === page ? 'bg-brand text-white border-brand' : 'border-border text-text-muted hover:text-text-primary hover:border-border-strong'
          }`}>
          {p}
        </button>
      ))}
      {pBtn(page + 1, '›')}
    </div>
  );
}

// ─── Dropdown ──────────────────────────────────────────────────────────────────

export function Dropdown({ trigger, items }: { trigger: ReactNode; items: { label: string; icon?: ReactNode; onClick: () => void; danger?: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((p) => !p)}>{trigger}</div>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] z-20 py-1">
          {items.map((item, i) => (
            <button key={i} onClick={() => { item.onClick(); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                item.danger ? 'text-danger hover:bg-danger-bg' : 'text-text-secondary hover:bg-surface2 hover:text-text-primary'
              }`}>
              {item.icon && <span className="w-3.5 h-3.5 flex-shrink-0">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AreaChart (SVG) ───────────────────────────────────────────────────────────

export function AreaChart({ data, height = 120, color = '#4F46E5' }: { data: number[]; height?: number; color?: string }) {
  if (!data.length) return null;
  const w = 800; const h = height; const pad = 4;
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;

  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (w - pad * 2),
    y: h - pad - ((v - min) / range) * (h - pad * 2),
  }));

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x},${h} L${pts[0].x},${h} Z`;
  const gid = `g${Math.random().toString(36).slice(2, 6)}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`}/>
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chart-area"/>
    </svg>
  );
}

// ─── BarChart (SVG) ────────────────────────────────────────────────────────────

export function BarChart({ data, labels, height = 120, color = '#4F46E5' }: { data: number[]; labels?: string[]; height?: number; color?: string }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1" style={{ height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ height: `${max ? (v / max) * 100 : 0}%`, backgroundColor: color, opacity: 0.75, borderRadius: '3px 3px 0 0', width: '100%', minHeight: 2 }}/>
          {labels?.[i] && <span className="text-[9px] text-text-muted">{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}

// ─── DonutChart ────────────────────────────────────────────────────────────────

export function DonutChart({ segments, size = 80 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const r = 30; const cx = 40; const cy = 40; const circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = segments.map((seg) => {
    const dash = (seg.value / total) * circ;
    const arc = { ...seg, dasharray: `${dash} ${circ - dash}`, offset };
    offset += dash;
    return arc;
  });
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox="0 0 80 80">
        {arcs.map((arc, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={arc.color} strokeWidth="10"
            strokeDasharray={arc.dasharray} strokeDashoffset={-arc.offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}/>
        ))}
      </svg>
      <div className="flex flex-col gap-1.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }}/>
            <span className="text-xs text-text-secondary">{seg.label}</span>
            <span className="text-xs font-semibold text-text-primary ml-auto pl-3">
              {Math.round((seg.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ProgressBar ───────────────────────────────────────────────────────────────

export function ProgressBar({ label, value, max, color = '#4F46E5' }: { label: string; value: number; max: number; color?: string }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-secondary w-20 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-surface2 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }}/>
      </div>
      <span className="text-xs font-medium text-text-primary w-10 text-right flex-shrink-0">{value.toLocaleString()}</span>
    </div>
  );
}

// ─── Section heading helpers ────────────────────────────────────────────────────

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand">{children}</span>;
}

export function SectionHeading({ eyebrow, title, subtitle, center = false }: { eyebrow?: string; title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={`flex flex-col gap-2.5 ${center ? 'items-center text-center' : ''}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-3xl font-bold text-text-primary" style={{ letterSpacing: '-0.025em' }}>{title}</h2>
      {subtitle && <p className="text-text-secondary text-base leading-relaxed max-w-xl">{subtitle}</p>}
    </div>
  );
}

// ─── Breadcrumb ────────────────────────────────────────────────────────────────

export function Breadcrumb({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-text-muted text-xs">/</span>}
          {item.onClick
            ? <button onClick={item.onClick} className="text-xs text-text-muted hover:text-text-secondary transition-colors">{item.label}</button>
            : <span className="text-xs text-text-primary font-medium">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

// ─── CopyButton ────────────────────────────────────────────────────────────────

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] border transition-all ${
        copied ? 'bg-success-bg border-success-border text-success' : 'bg-surface border-border text-text-secondary hover:text-text-primary hover:border-border-strong'
      }`}>
      {copied
        ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>Copied!</>
        : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>{label}</>}
    </button>
  );
}
