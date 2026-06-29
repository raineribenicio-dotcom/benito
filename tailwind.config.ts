import type { Config } from "tailwindcss";

// Mobile-first por defecto (Tailwind ya lo es). Tokens del design system.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          500: "#1d6fe0",
          600: "#1559bd",
          700: "#114a9c",
          900: "#0b2e63",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      container: {
        center: true,
        padding: { DEFAULT: "1rem", lg: "2rem" },
      },
    },
  },
  plugins: [],
};

export default config;
