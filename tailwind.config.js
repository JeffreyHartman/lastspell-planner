/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        glass: {
          DEFAULT: "rgba(15, 23, 42, 0.65)",
          light: "rgba(30, 41, 59, 0.50)",
          border: "rgba(100, 116, 139, 0.30)",
        },
        glow: {
          amber: "rgba(245, 158, 11, 0.40)",
          blue: "rgba(59, 130, 246, 0.35)",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glow-amber": "0 0 12px 2px rgba(245, 158, 11, 0.35)",
        "glow-blue": "0 0 10px 2px rgba(59, 130, 246, 0.25)",
        "glow-sm": "0 0 6px 1px rgba(148, 163, 184, 0.15)",
        glass: "0 4px 30px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.15s ease-out",
        "scale-in": "scaleIn 0.15s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
