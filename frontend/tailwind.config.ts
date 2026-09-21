import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: ['./app/**/*.{vue,js,ts}', './server/**/*.{js,ts}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        surface2: '#F1F5F9',
        border: { DEFAULT: '#E2E8F0', strong: '#CBD5E1' },
        text: { primary: '#111827', secondary: '#64748B', muted: '#94A3B8', inverse: '#FFFFFF' },
        brand: { DEFAULT: '#4F46E5', dark: '#4338CA', light: '#EEF2FF', mid: '#C7D2FE' },
        violet: '#7C3AED',
        success: { DEFAULT: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
        warning: { DEFAULT: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
        danger: { DEFAULT: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
        info: { DEFAULT: '#2563EB', bg: '#EFF6FF' },
      },
      borderRadius: { xs: '4px', sm: '6px', md: '8px', lg: '12px', xl: '16px', '2xl': '20px' },
      boxShadow: {
        xs: '0 1px 2px rgba(15, 23, 42, 0.04)',
        sm: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        md: '0 4px 12px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)',
        lg: '0 8px 24px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)',
        modal: '0 20px 48px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.06)',
      },
    },
  },
}
