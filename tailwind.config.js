/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        femicide: "url(src/assets/femicide-kenya.jpg)",
      },
    },
  },
  plugins: [],
};
