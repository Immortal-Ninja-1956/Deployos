/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#07080D',
        panel: '#12151F',
        panel2: '#1A1E2B',
        edge: '#262B3A',
        ink: '#E8EAF0',
        dim: '#8B92A8',
        signal: '#FF6B35',
        hazardous: '#FF5C5C',
        watch: '#FF9F40',
        notable: '#FFD23F',
        routine: '#4ADE80',
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
