import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bjj-bg': 'rgb(var(--bjj-bg) / <alpha-value>)',
        'bjj-bg2': 'rgb(var(--bjj-bg2) / <alpha-value>)',
        'bjj-text': 'rgb(var(--bjj-text) / <alpha-value>)',
        'bjj-muted': 'rgb(var(--bjj-muted) / <alpha-value>)',
        'bjj-line': 'rgb(var(--bjj-line) / <alpha-value>)',
        'bjj-accent': 'rgb(var(--bjj-accent) / <alpha-value>)',
      },
      borderRadius: {
        'bjj': '14px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config