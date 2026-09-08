import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { brand: { 50: "#eefbf6", 500: "#168568", 600: "#0f6b54", 700: "#0d5746" } },
    },
  },
  plugins: [],
} satisfies Config;
