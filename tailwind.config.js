/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./game/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./styles/**/*.css",
    "./*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'press-start': ['"Press Start 2P"', 'cursive'],
        'rajdhani': ['Rajdhani', 'sans-serif'],
      },
      colors: {
        tier: {
          common: '#9ca3af',
          uncommon: '#22c55e',
          rare: '#3b82f6',
          epic: '#a855f7',
          legendary: '#f97316',
          mythic: '#ec4899',
          divine: '#fbbf24',
          astral: '#38bdf8',
          cosmic: '#818cf8',
          primordial: '#f472b6',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      boxShadow: {
        'glow-sm': '0 0 10px currentColor',
        'glow': '0 0 20px currentColor',
        'glow-lg': '0 0 30px currentColor',
        'inner-glow': 'inset 0 0 10px currentColor',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
