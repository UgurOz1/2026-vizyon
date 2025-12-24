/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        romantic: {
          50: '#f5f3ff', // violet-50
          100: '#ede9fe', // violet-100
          200: '#ddd6fe', // violet-200
          300: '#c4b5fd', // violet-300
          400: '#a78bfa', // violet-400
          500: '#8b5cf6', // violet-500
          600: '#7c3aed', // violet-600
          700: '#6d28d9', // violet-700
          800: '#5b21b6', // violet-800
          900: '#4c1d95', // violet-900
        }
      }
    },
  },
  plugins: [],
}
