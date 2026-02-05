import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // PKS brand colors
        'pks': {
          50: '#f0f9f4',
          100: '#d9f2e4',
          200: '#b6e3cb',
          300: '#85ceac',
          400: '#52b488',
          500: '#2f9a6d',
          600: '#207c57',
          700: '#1b6347',
          800: '#194f3a',
          900: '#164131',
          950: '#0b241b',
        },
        'pks-accent': {
          50: '#fdf4f3',
          100: '#fce7e4',
          200: '#fad2ce',
          300: '#f5b3ab',
          400: '#ed867a',
          500: '#e15f50',
          600: '#cd4434',
          700: '#ac3628',
          800: '#8f3025',
          900: '#772d25',
          950: '#40140f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
