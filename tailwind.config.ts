import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        yas: {
          navy: "#071B3D",
          blue: "#006BFF",
          cyan: "#00C2FF",
          yellow: "#FFD000",
          green: "#16A34A"
        }
      },
      boxShadow: {
        soft: "0 24px 80px rgba(7, 27, 61, 0.16)"
      }
    }
  },
  plugins: []
};
export default config;
