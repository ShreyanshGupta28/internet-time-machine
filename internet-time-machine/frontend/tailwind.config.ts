import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base':      'var(--bg-base)',
        'bg-primary':   'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-card':      'var(--bg-card)',
        'bg-elevated':  'var(--bg-elevated)',
        'border-subtle':'var(--border-subtle)',
        'border-default':'var(--border-default)',
        'gold':         'var(--gold)',
        'gold-light':   'var(--gold-light)',
        'amber':        'var(--amber)',
        'teal':         'var(--teal)',
        'text-primary': 'var(--text-primary)',
        'text-secondary':'var(--text-secondary)',
        'text-muted':   'var(--text-muted)',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
