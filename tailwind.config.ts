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
        primary: '#000000',
        secondary: '#FFFFFF',
        accent: '#404040',
        error: '#FF0000',
        warning: '#FFFF00',
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
        sans: ['Arial', 'sans-serif'],
      },
      boxShadow: {
        'brutal': '8px 8px 0px #000000',
        'brutal-sm': '4px 4px 0px #000000',
        'brutal-lg': '12px 12px 0px #000000',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
    },
  },
  plugins: [],
}
export default config
