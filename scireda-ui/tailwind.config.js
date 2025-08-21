/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0D1B2A",
        accent: "#FF7F50",
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}


