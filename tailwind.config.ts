import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F4F6F4",
          100: "#E5EBE5",
          200: "#CCD7CD",
          300: "#ADC0AF",
          400: "#91A993",
          500: "#778D7A", // Primary brand color
          600: "#5F7462", // High contrast interactive
          700: "#495A4C", // High contrast text
          800: "#364338",
          900: "#242E26",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
