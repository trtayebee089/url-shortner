import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: ['./app/**/*.{vue,js,ts}', './server/**/*.{js,ts}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#07111f', 900: '#0b1728', 800: '#112238', 700: '#19324f' },
        teal: { 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf' },
      },
      boxShadow: { glow: '0 0 60px rgba(45, 212, 191, 0.12)' },
    },
  },
}
