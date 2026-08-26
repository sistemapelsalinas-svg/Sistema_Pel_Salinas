import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        tactical: {
          dark: "#0B0F17",
          card: "#111827",
          border: "#1F2937",
          hover: "#1E293B",
          olive: "#166534",
          oliveLight: "#22c55e",
          gold: "#eab308",
          navy: "#1e3a8a",
          crimson: "#dc2626",
          amber: "#f59e0b",
        },
      },
    },
  },
  plugins: [],
};
export default config;
