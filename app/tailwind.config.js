/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {
    fontFamily: { kid: ['Fredoka', 'system-ui', 'sans-serif'] },
    colors: { ink: '#2b2540', forest: '#2a5c45', pine: '#1f4636', night: '#2b2d62', plum: '#6a4690', cream: '#fbf3df', coral: '#e5736b', mustard: '#f2b84b', sky: '#6fb4d6', berry: '#c4476f' },
  } },
  plugins: [],
};
