/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: 'var(--color-void)',
        panel: 'var(--color-panel)',
        panel2: 'var(--color-panel2)',
        edge: 'var(--color-edge)',
        ink: 'var(--color-ink)',
        dim: 'var(--color-dim)',
        signal: 'var(--color-signal)',
        hazardous: 'var(--color-hazardous)',
        watch: 'var(--color-watch)',
        notable: 'var(--color-notable)',
        routine: 'var(--color-routine)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        arcade: ['var(--font-arcade)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'monospace', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px var(--color-edge)',
        'glow-hazardous': '0 0 15px var(--color-hazardous)',
        'glow-watch': '0 0 15px var(--color-watch)',
        'glow-notable': '0 0 15px var(--color-notable)',
        'glow-cyan-lg': '0 0 25px var(--color-edge)',
        'glow-hazardous-lg': '0 0 25px var(--color-hazardous)',
        'glow-watch-lg': '0 0 25px var(--color-watch)',
        'glow-notable-lg': '0 0 25px var(--color-notable)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'crt-flicker': {
          '0%': { opacity: '0.98' },
          '50%': { opacity: '1.0' },
          '100%': { opacity: '0.99' },
        },
        'text-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'crt-flicker': 'crt-flicker 0.2s infinite',
        'text-blink': 'text-blink 0.8s steps(2, start) infinite',
      },
    },
  },
  plugins: [],
};
