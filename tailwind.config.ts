import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: 'rgb(var(--bg-canvas-rgb) / <alpha-value>)',
          surface: 'var(--bg-surface)',
          elevated: 'rgb(var(--bg-elevated-rgb) / <alpha-value>)',
          muted: 'rgb(var(--bg-muted-rgb) / <alpha-value>)',
          text: 'rgb(var(--text-primary-rgb) / <alpha-value>)',
          subtext: 'rgb(var(--text-secondary-rgb) / <alpha-value>)',
          border: 'rgb(var(--border-subtle-rgb) / <alpha-value>)',
          borderStrong: 'rgb(var(--border-strong-rgb) / <alpha-value>)',
          accent: 'rgb(var(--accent-terracotta-rgb) / <alpha-value>)',
          accentText: 'rgb(var(--accent-terracotta-fg-rgb) / <alpha-value>)',
          accentHover: 'rgb(var(--accent-terracotta-hover-rgb) / <alpha-value>)',
          sage: 'rgb(var(--accent-sage-rgb) / <alpha-value>)',
          sageBg: 'var(--accent-sage-bg)',
          gold: 'rgb(var(--accent-gold-rgb) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        panel: '0 8px 30px -8px rgba(20, 26, 22, 0.12)',
        modal: '0 20px 50px -12px rgba(10, 14, 12, 0.28)',
      },
    },
  },
  plugins: [],
};

export default config;
