/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: { fontFamily: { kid: ['"Comic Sans MS"', '"Chalkboard SE"', "system-ui", "sans-serif"] } } },
  plugins: [],
};
