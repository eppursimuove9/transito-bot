import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        purranque: {
          blue: "#003366",
          light: "#0055a5",
          accent: "#25D366",
        }
      }
    },
  },
  plugins: [],
};
export default config;