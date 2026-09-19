/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Archivo"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        'samsung-blue': '#1428A0',
        'samsung-blue-dark': '#0F1E7A',
        'cyan-glow': '#2E8FFF',
        'nexus-emerald': '#10B981',
        'nexus-amber': '#F59E0B',
        'nexus-violet': '#8B5CF6',
      },
    },
  },
  plugins: [],
};
