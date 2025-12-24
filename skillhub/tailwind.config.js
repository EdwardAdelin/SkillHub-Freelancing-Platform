/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB', // A professional blue for SkillHub
        secondary: '#1E293B',
      }
    },
  },
  plugins: [],
}