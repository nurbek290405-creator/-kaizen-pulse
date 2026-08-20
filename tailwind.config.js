/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F3EEE3',
        washi: '#FAF7F0',
        sage: { DEFAULT: '#8FA189', light: '#B7C4B2', dark: '#5C6E58' },
        ink: '#3A362E',
        stone: '#9C9484',
        gold: { DEFAULT: '#B8934A', light: '#D9BC81', dark: '#8C6B33' },
        clay: '#C48B6A'
      },
      fontFamily: {
        display: ['"Shippori Mincho"', 'serif'],
        body: ['"Zen Kaku Gothic New"', '"Noto Sans"', 'sans-serif']
      },
      borderRadius: {
        soft: '1.25rem',
        pebble: '2rem'
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(58, 54, 46, 0.12)',
        lift: '0 8px 32px -8px rgba(58, 54, 46, 0.18)'
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.03)', opacity: '0.85' }
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        crackGleam: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' }
        }
      },
      animation: {
        breathe: 'breathe 3.5s ease-in-out infinite',
        'rise-in': 'riseIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'crack-gleam': 'crackGleam 2.4s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
