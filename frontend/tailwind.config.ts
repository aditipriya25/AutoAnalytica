import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyberBg: "#060A14", // Deep Navy almost black
        cyberMagenta: "#3b82f6", // Replacing Magenta with Trust Blue
        cyberCyan: "#60a5fa", // Replacing Cyan with Soft Blue
        cyberPurple: "#1e3a8a", // Deep Blue
        cocoaBg: "#1B2A41",
        cocoaSurface: "#142031", 
        cocoaPrimary: "#4C5C68",
        cocoaAccent: "#8D99AE",  
        cocoaTeal: "#FFFFFF",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      }
    },
  },
  plugins: [],
};
export default config;
