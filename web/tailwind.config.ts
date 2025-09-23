import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        foreground: 'var(--color-foreground)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        maestro: 'var(--color-maestro)',
        hop: 'var(--color-hop)',
        malt: 'var(--color-malt)',
        deep: 'var(--color-deep)',
        ferment: 'var(--color-ferment)',
        yeast: 'var(--color-yeast)',
        water: 'var(--color-water)',
        err: 'var(--color-err)',
        success: 'var(--color-success)'
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-jetbrains-mono)']
      },
      fontSize: {
        h1: ['2rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
        h2: ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
        h3: ['1.25rem', { lineHeight: '1.75rem' }],
        body: ['1rem', { lineHeight: '1.5rem' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        small: ['0.875rem', { lineHeight: '1.25rem' }],
        micro: ['0.75rem', { lineHeight: '1rem' }]
      },
      boxShadow: {
        'card-hover': '0 20px 40px -24px rgba(26, 26, 26, 0.3)'
      },
      maxWidth: {
        content: '1200px'
      }
    }
  },
  plugins: []
};

export default config;
