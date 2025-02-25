import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // for gh-pages:
  // base: process.env.NODE_ENV === "production" ? "/femicide-data-story/" : "/",
  // for vercel:
  base: "/",
});
