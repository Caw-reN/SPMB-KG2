/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lexend', 'sans-serif'],
      },
      colors: {
        'kg-green': '#046935',
        'kg-dark': '#2f3146',
        'kg-purple': '#5756a2',
        'kg-bg': '#ffffff',
        'primary': '#005f3b',
        'secondary': '#28a745',
      },
      maxWidth: {
        'custom': '896px',
      },
      dropShadow: {
        'white-glow': '0 0 15px rgba(255, 255, 255, 0.6)',
      }
    },
  },
  plugins: [],
}
