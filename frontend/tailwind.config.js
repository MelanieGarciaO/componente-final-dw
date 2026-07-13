/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1F2A3C',
        'navy-light': '#2A3A52',
        'navy-dark': '#151E2B',
        gold: '#C9A227',
        'gold-light': '#E8C547',
        'gold-muted': '#A8861F',
        surface: '#F5F6FA',
        border: '#E2E8F0',
        muted: '#6B7280',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
