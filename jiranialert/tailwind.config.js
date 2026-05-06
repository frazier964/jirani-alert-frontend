/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#0F172A',
        alert: '#DC2626',
        warning: '#F59E0B',
        success: '#16A34A',
        background: '#F8FAFC',
      },
    },
  },
  plugins: [],
}
