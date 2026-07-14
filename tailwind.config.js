
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0a0b0d',
        surface: {
          DEFAULT: '#14171c',
          raised: '#1a1d23',
          hover: '#1f232a',
        },
        line: {
          DEFAULT: '#262a31',
          soft: 'rgba(255,255,255,0.08)',
        },
        accent: {
          DEFAULT: '#22d3ee',
          deep: '#06b6d4',
          soft: 'rgba(34,211,238,0.12)',
        },
        content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34,211,238,0.4), 0 8px 24px -8px rgba(34,211,238,0.5)',
        panel: '0 1px 3px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
    },
  },
  plugins: [],
}

