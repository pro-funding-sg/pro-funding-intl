/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0A0E27',
          800: '#0F1535',
          700: '#151D45',
          600: '#1A2555',
        },
        gold: {
          400: '#D4AF37',
          500: '#C9A52E',
          600: '#B8960F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
