/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e3a8a",
        secondary: "#0891b2",
        accent: "#14b8a6",
        surface: "#ffffff",
        background: "#f8fafc",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6"
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        elevated: '0 4px 16px rgba(0, 0, 0, 0.12)'
      }
    },
  },
  plugins: [],
}