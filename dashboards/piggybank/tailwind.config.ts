import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx,js,jsx}",
    "./src/components/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        piggy: {
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c"
        }
      }
    }
  },
  plugins: []
};

export default config;
