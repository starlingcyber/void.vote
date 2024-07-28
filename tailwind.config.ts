import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Iosevka Aile Web", "sans-serif"],
        serif: ["Iosevka Slab Web", "serif"],
        mono: ["Iosevka Web", "monospace"],
      },
      backgroundImage: {
        "gradient-conic":
          "conic-gradient(from 45deg, var(--tw-gradient-stops))",
      },
      animation: {
        "gradient-x": "gradient-x 3s ease infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
