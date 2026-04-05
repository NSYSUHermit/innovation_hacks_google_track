/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        brand: {
          50: "#f4f7fe",
          100: "#e8edfc",
          200: "#c7d4f7",
          300: "#9eb4ef",
          400: "#7c93e8",
          500: "#6366f1",
          600: "#4f56e5",
          700: "#4347d0",
          800: "#403ab6",
          900: "#363491",
        },
        page: "#f9fafc",
        border: "#e3e8ee",
        navy: "#0f1520",
        semantic: {
          green: "#57b885",
          amber: "#eaa234",
          red: "#dc534d",
          blue: "#4f7ffb",
        },
      },
      boxShadow: {
        glass: "0 1px 2px rgba(15, 21, 32, 0.04), 0 8px 24px rgba(15, 21, 32, 0.06)",
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};
