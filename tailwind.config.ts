module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dusty-rose': {
          light: '#F0D4DA',
          DEFAULT: '#D6A6B1',
          dark: '#B87A88',
        },
        'sage-green': {
          light: '#D4E3D1',
          DEFAULT: '#B7C9B5',
          dark: '#8FA88D',
        },
        'cream': '#FDF8F5',
        'charcoal': '#2D2D2D',
        'warm-gray': '#6B6B6B',
        // Couture extensions — richer rose for CTAs, metallic accent for
        // ornament (never body text), background tints, editorial near-black.
        'deep-rose': {
          DEFAULT: '#A4586A',
          dark: '#8E4757',
        },
        'champagne-gold': {
          light: '#E7D3AC',
          DEFAULT: '#C6A15B',
          dark: '#8F6D2A',
        },
        'ivory': '#FBF6EF',
        'blush': '#F7E8EA',
        'ink': '#211D1E',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        accent: ['var(--font-accent)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      // Editorial type scale — use these tokens, not ad-hoc text-2xl.
      fontSize: {
        'display-xl': ['clamp(2.75rem, 6.5vw, 4.75rem)', { lineHeight: '1.04', letterSpacing: '-0.015em' }],
        'display-lg': ['clamp(2.25rem, 5vw, 3.5rem)', { lineHeight: '1.08', letterSpacing: '-0.01em' }],
        'display': ['clamp(1.85rem, 4vw, 2.75rem)', { lineHeight: '1.12' }],
        'headline': ['clamp(1.4rem, 2.6vw, 1.9rem)', { lineHeight: '1.2' }],
        'title': ['1.25rem', { lineHeight: '1.35' }],
        'lede': ['1.125rem', { lineHeight: '1.55' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.55' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        'kicker': ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.18em' }],
      },
      boxShadow: {
        'soft': '0 10px 30px -18px rgba(33, 29, 30, 0.25)',
        'lift': '0 18px 44px -20px rgba(33, 29, 30, 0.3)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.5s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.35s ease-out forwards',
        'scale-in': 'scale-in 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
};
