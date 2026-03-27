/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        cream: '#FAF7F2',
        'cream-warm': '#F3EDE3',
        'cream-border': '#E2D9CC',
        ink: '#1C1917',
        'ink-soft': '#292524',
        'ink-muted': '#57534E',
        'ink-faint': '#A8A29E',
        gold: '#7D4E24',
        'gold-light': '#EDE0D0',
        'gold-border': '#9C6840',
        'score-high': '#166534',
        'score-mid': '#92400E',
        'score-low': '#991B1B',
        'score-high-bg': '#F0FDF4',
        'score-mid-bg': '#FFFBEB',
        'score-low-bg': '#FEF2F2',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease forwards',
        slideUp: 'slideUp 0.4s ease forwards',
        shimmer: 'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [],
}
