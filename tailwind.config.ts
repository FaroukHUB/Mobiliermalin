import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/blocks/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '3rem',
      },
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Charte Mobilier Malin
        ivory: {
          DEFAULT: '#FAF9F6',
          light: '#FFFFFF',
          dark: '#F4F1EA',
        },
        ink: {
          DEFAULT: '#1A1A1A',
          soft: '#2A2A2A',
          mute: '#6B6B6B',
        },
        gold: {
          DEFAULT: '#C9A961',
          light: '#E0C988',
          dark: '#B8964D',
          deep: '#9A7E3F',
        },
        line: '#E5E3DE',
        promo: {
          DEFAULT: '#B8362D',
          light: '#D14B3F',
          dark: '#922A23',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem, 5vw + 1rem, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display': ['clamp(2rem, 3vw + 1rem, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'h1': ['clamp(1.75rem, 2vw + 1rem, 2.5rem)', { lineHeight: '1.15' }],
        'h2': ['clamp(1.5rem, 1.5vw + 1rem, 2rem)', { lineHeight: '1.2' }],
      },
      letterSpacing: {
        widest: '0.2em',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(26,26,26,0.04), 0 4px 12px rgba(26,26,26,0.04)',
        gold: '0 8px 24px rgba(201,169,97,0.18)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}

export default config
