import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Barlow', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand:  '#38D430',
        grey: {
          300: '#A7A7A8',
          700: '#4F5051',
          800: '#252527',
          900: '#111113',
        },
        bg:     '#F8F8F8',
        border: '#EEEEEE',
      },
    },
  },
};

export default config;
