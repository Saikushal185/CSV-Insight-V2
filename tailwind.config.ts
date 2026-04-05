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
        insight: {
          numeric: '#378ADD',
          categorical: '#1D9E75',
          date: '#BA7517',
        },
      },
    },
  },
  plugins: [],
};

export default config;

