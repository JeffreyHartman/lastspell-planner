/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cinzel"', "serif"],
        body: ['"Barlow"', "system-ui", "sans-serif"],
      },
      colors: {
        /* Override slate with warm "forge" tones — this transforms
           every existing slate-* utility into a warm earthy palette */
        slate: {
          50: "#f5ede2",
          100: "#ece0d0",
          200: "#d4c4ae",
          300: "#b8a893",
          400: "#8a7a68",
          500: "#5a4e42",
          600: "#3d342c",
          700: "#2d2722",
          800: "#1e1a17",
          900: "#161310",
          950: "#0f0d0b",
        },
        ember: {
          DEFAULT: "#e8552a",
          light: "#f06838",
          dark: "#c4442a",
        },
        gold: {
          DEFAULT: "#d4a843",
          light: "#e0bc5e",
          dark: "#b8922d",
        },
      },
      boxShadow: {
        panel:
          "0 4px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
        card: "0 2px 8px rgba(0, 0, 0, 0.35)",
        "glow-amber": "0 0 12px 2px rgba(212, 168, 67, 0.35)",
        "glow-emerald": "0 0 12px 2px rgba(78, 173, 107, 0.35)",
        "glow-blue": "0 0 10px 2px rgba(74, 156, 214, 0.25)",
        "glow-ember": "0 0 14px 3px rgba(232, 85, 42, 0.3)",
        "glow-sm": "0 0 6px 1px rgba(168, 152, 130, 0.15)",
        glass: "0 4px 30px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
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
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
