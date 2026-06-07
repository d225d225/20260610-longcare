import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-noto)', 'system-ui', 'sans-serif'],
      },
      animation: {
        stamp: 'stamp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
      keyframes: {
        stamp: {
          '0%': { transform: 'scale(2.5) rotate(-15deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(-12deg)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
