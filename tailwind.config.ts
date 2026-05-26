import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#152020",
        mint: "#18a986",
        coral: "#f06d5f",
        saffron: "#f4b740"
      },
      boxShadow: {
        soft: "0 12px 40px rgba(21, 32, 32, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
