/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#05050A',       // Arcade screen pitch black/purple
        panel: '#0C0C16',      // Dark arcade card panel
        panel2: '#121222',     // Diagnostic panel
        edge: '#00F0FF',       // Neon cyan wireframe
        ink: '#E0E8FF',        // Bright light cyan-white text
        dim: '#587098',        // Dimmed phosphor green/blue
        signal: '#FF007F',     // Hot neon arcade pink
        hazardous: '#FF0055',  // Bright arcade hazard red
        watch: '#FF8800',      // Hot orange warning
        notable: '#FFD700',    // Glowing gold
        routine: '#00FF99',    // Vector neon green
      },
      fontFamily: {
        display: ['"Press Start 2P"', 'cursive'],
        arcade: ['"Orbitron"', 'sans-serif'],
        body: ['"VT323"', 'monospace'],
        mono: ['"VT323"', 'monospace'],
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
