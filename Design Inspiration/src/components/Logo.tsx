import { useRouter } from '@/lib/router';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  inverse?: boolean;
}

export function Logo({ size = 'md', onClick, inverse = false }: LogoProps) {
  const { navigate } = useRouter();
  const sizes = {
    sm: { icon: 22, text: 'text-[15px]' },
    md: { icon: 26, text: 'text-[17px]' },
    lg: { icon: 30, text: 'text-[20px]' },
  };
  const s = sizes[size];

  return (
    <button
      onClick={onClick ?? (() => navigate('/'))}
      className="flex items-center gap-2 group"
      aria-label="247URL home"
    >
      {/* Icon mark: a compact link/chain symbol in indigo */}
      <div
        style={{ width: s.icon, height: s.icon }}
        className="rounded-[6px] bg-brand flex items-center justify-center flex-shrink-0 transition-opacity group-hover:opacity-90"
      >
        <svg width={s.icon * 0.55} height={s.icon * 0.55} viewBox="0 0 14 14" fill="none">
          <path
            d="M5.5 8.5L8.5 5.5M6 4l.5-.5a2.828 2.828 0 014 4L10 8M8 10l-.5.5a2.828 2.828 0 01-4-4L4 6"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {/* Wordmark */}
      <span
        className={`${s.text} font-bold tracking-[-0.03em] ${inverse ? 'text-white' : 'text-text-primary'}`}
        style={{ fontFamily: 'var(--font-sans)', letterSpacing: '-0.025em' }}
      >
        247URL
      </span>
    </button>
  );
}
