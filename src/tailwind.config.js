/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",    // for pages directory
    "./components/**/*.{js,ts,jsx,tsx}", // for components directory
    "./app/**/*.{js,ts,jsx,tsx}"      // if you use Next.js App Router
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
