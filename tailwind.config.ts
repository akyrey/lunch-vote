import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FBF6EE",
        card: "#FFFFFF",
        soft: "#F4ECE0",
        ink: "#221A14",
        mut: "#857667",
        mut2: "#A89A8B",
        accent: "#E0512F",
        "accent-dk": "#B53B20",
        "accent-bg": "#FBE7DF",
        green: "#2F7D52",
        "green-bg": "#E5F0E6",
        gold: "#C98A1E",
        "gold-bg": "#FBF0D8",
        blue: "#3E72A8",
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        body: ["var(--font-hanken)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
        "card-sm": "16px",
        btn: "15px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(34,26,20,.05), 0 7px 20px rgba(34,26,20,.04)",
        "btn-accent": "0 6px 16px rgba(224,81,47,.3)",
        "btn-green": "0 6px 16px rgba(47,125,82,.26)",
      },
    },
  },
  plugins: [],
};

export default config;
