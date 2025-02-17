/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        femicide: "url(/assets/femicide-kenya.jpg)",
      },
      colors: {
        "femicide-black": "#0a0a0a",
        "femicide-red": "#C11B1B",
        "femicide-white": "#EADFDF",
      },
    },
  },
  plugins: [],
};
