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
    },
  },
  plugins: [],
} satisfies Config;
