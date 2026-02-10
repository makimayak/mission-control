/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          pink: '#ff2a6d',
          blue: '#05d9e8',
          purple: '#7b2cbf',
          dark: '#0d0221',
          yellow: '#ffd319'
        }
      }
    },
  },
  plugins: [],
}
