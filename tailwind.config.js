/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Unbounded', 'system-ui', 'sans-serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        parking: {
          road: '#1a1b1e',
          roadDark: '#0e0f11',
          asphalt: '#25272c',
          line: '#facc15', // yellow road stripe
          whiteLine: '#ffffff',
          green: '#10b981',
          red: '#ef4444',
          amber: '#f59e0b',
        },
      },
      boxShadow: {
        'game': '0 8px 0px 0px rgba(0,0,0,0.15), 0 20px 30px -10px rgba(0,0,0,0.1)',
        'game-pressed': '0 2px 0px 0px rgba(0,0,0,0.2)',
        'card-bold': '0 12px 32px -8px rgba(0, 0, 0, 0.08)',
        'glow-green': '0 0 30px -5px rgba(16, 185, 129, 0.5)',
        'glow-red': '0 0 30px -5px rgba(239, 68, 68, 0.5)',
      },
      letterSpacing: {
        'wide-tech': '0.06em',
        'extra-wide': '0.12em',
      },
    },
  },
  plugins: [],
}
