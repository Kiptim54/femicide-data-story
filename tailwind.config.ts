import { defineConfig } from "tailwindcss";

export default defineConfig({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: (theme) => ({
        "femicide-bg": "url('/src/assets/femicide-kenya.jpg')",
      }),
    },
  },
  plugins: [],
});
