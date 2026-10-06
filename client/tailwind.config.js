/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        saffron: { 50: '#FFF6EB', 100: '#FFE8CC', 400: '#F59A3C', 500: '#E8800F', 600: '#C96A06' },
        maroon: { 50: '#F8EDEE', 700: '#6B1424', 800: '#561020', 900: '#3F0B17' },
        cream: { 50: '#FFFCF6', 100: '#FBF4E6', 200: '#F3E8D0' },
        gold: { 300: '#E6C677', 400: '#D4A94A', 500: '#B8892B' },
        ink: '#2A1A14',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['Hind', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
