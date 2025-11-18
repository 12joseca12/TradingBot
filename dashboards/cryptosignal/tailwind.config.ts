import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx,js,jsx}",
    "./src/components/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d"
        }
      }
    }
  },
  plugins: []
};

export default config;
