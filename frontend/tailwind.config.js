/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bomberman': {
          'dark': '#1a1a2e',
          'purple': '#16213e',
          'blue': '#0f3460',
          'accent': '#533483',
          'light': '#e94560',
        }
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
        'game': ['"VT323"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'explosion': 'explosion 0.5s ease-out',
      },
      keyframes: {
        explosion: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.8' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
